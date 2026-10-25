// HowdyHire content script: finds the job posting on the current page and sends it to the app.
// Injected automatically on known job boards, or on demand when the toolbar button is clicked.
(() => {
  if (window.__howdyhireLoaded) return;
  window.__howdyhireLoaded = true;

  const MIN_DESCRIPTION = 50;
  const MAX_DESCRIPTION = 10000;
  // A "description" bigger than this is almost certainly the whole page, not the posting.
  const MAX_PLAUSIBLE_DESCRIPTION = 25000;

  // ---------------------------------------------------------------------------
  // Text cleaning
  // ---------------------------------------------------------------------------

  // Page chrome that should never end up in a job description.
  const NOISE = [
    "nav", "header", "footer", "aside", "script", "style", "noscript", "template", "svg", "button", "form",
    "select", "input", "textarea", "iframe", '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '[role="menu"]', '[role="menubar"]', '[role="toolbar"]', '[role="dialog"]', '[aria-hidden="true"]',
    ".sr-only", ".visually-hidden", ".breadcrumb", ".breadcrumbs",
  ].join(",");

  const normalize = (s) =>
    s
      .replace(/ /g, " ")
      .replace(/[ \t\f\v]+/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\n(?=• )/g, "\n") // keep list items on consecutive lines
      .trim();

  const oneLine = (s) => normalize(s).split("\n").find(Boolean) || "";

  // Reads an element's visible text with paragraph/list breaks, skipping nav menus, buttons,
  // hidden elements, and other page chrome inside it.
  function readableText(root) {
    if (!root) return "";
    const out = [];
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        out.push(node.nodeValue);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE || node.matches(NOISE)) return;
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return;
      const block = !style.display.startsWith("inline") || node.tagName === "BR";
      if (block) out.push("\n");
      if (node.tagName === "LI") out.push("• ");
      for (const child of node.childNodes) walk(child);
      if (block) out.push("\n");
    };
    walk(root);
    return normalize(out.join(""));
  }

  // Plain text of a short element (title, company): first non-empty line.
  const shortText = (el) => (el ? oneLine(el.innerText || el.textContent || "") : "");

  // A parsed (unrendered) document has no layout, so add line breaks for block elements by hand.
  function htmlToText(html) {
    const parse = (s) => new DOMParser().parseFromString(s, "text/html").body;
    // Some sites double-encode the HTML ("&lt;p&gt;…"); decode once first.
    if (!/<[a-z]/i.test(html) && /&lt;/.test(html)) html = parse(html).textContent || "";
    const spaced = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/(p|div|li|ul|ol|h[1-6]|tr|section)>/gi, "\n");
    return normalize(parse(spaced).textContent || "");
  }

  const meta = (prop) => document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.content?.trim() || "";

  // ---------------------------------------------------------------------------
  // Field finders
  // ---------------------------------------------------------------------------

  const firstMatch = (selectors, read = shortText, accept = (t) => !!t, root = document) => {
    for (const selector of selectors) {
      for (const el of root.querySelectorAll(selector)) {
        const text = read(el);
        if (accept(text)) return { text, el, via: selector };
      }
    }
    return null;
  };

  const plausibleDescription = (t) => t.length >= MIN_DESCRIPTION && t.length <= MAX_PLAUSIBLE_DESCRIPTION;

  // Symplicity-style label/value layouts: <dt>Employer</dt><dd>Acme</dd>, "Job Description" heading + body, etc.
  function byLabel(labelRe, read) {
    const candidates = document.querySelectorAll("dt, th, label, strong, b, h2, h3, h4, h5, .field-label, .label, [class*='label'], span, div");
    for (const el of candidates) {
      if (el.children.length > 1) continue; // labels are leaf-ish
      const own = oneLine(el.textContent || "");
      if (!own || own.length > 40 || !labelRe.test(own)) continue;
      // Value is usually the next sibling (dd/td/div); otherwise the parent's remaining content.
      let value = "";
      for (let sib = el.nextElementSibling; sib && !value; sib = sib.nextElementSibling) value = read(sib);
      if (!value && el.parentElement) {
        value = read(el.parentElement).replace(own, "").trim();
      }
      if (value) return { text: value, el, via: `label "${own}"` };
    }
    return null;
  }

  // The secondary line right under a title (Symplicity shows the employer there).
  function subheaderNear(titleEl) {
    if (!titleEl) return null;
    const title = shortText(titleEl);
    const scopes = [titleEl, titleEl.parentElement].filter(Boolean);
    for (const scope of scopes) {
      let sib = scope.nextElementSibling;
      for (let i = 0; sib && i < 3; i++, sib = sib.nextElementSibling) {
        const text = shortText(sib);
        if (text && text !== title && text.length <= 100 && !/^(apply|save|share|posted|deadline)/i.test(text)) {
          return { text, el: sib, via: "subheader near title" };
        }
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Sources, in priority order: structured data, site rules, generic fallback
  // ---------------------------------------------------------------------------

  function fromJsonLd() {
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      let data;
      try {
        data = JSON.parse(script.textContent);
      } catch {
        continue;
      }
      const items = [data].flat().flatMap((d) => d?.["@graph"] ?? [d]);
      const job = items.find((d) => [d?.["@type"]].flat().includes("JobPosting"));
      if (!job) continue;
      const org = job.hiringOrganization;
      const description = job.description ? htmlToText(job.description) : "";
      return {
        title: typeof job.title === "string" ? { text: oneLine(job.title), via: "JSON-LD" } : null,
        company: { text: oneLine(typeof org === "string" ? org : org?.name || ""), via: "JSON-LD" },
        description: description ? { text: description, via: "JSON-LD" } : null,
      };
    }
    return null;
  }

  const SITES = [
    {
      // HireAggies (Texas A&M) runs on Symplicity CSM.
      name: "Symplicity / HireAggies",
      host: /(^|\.)(symplicity\.com|hireaggies\.com)$/,
      title: [
        ".job-title", ".posting-title", "h1.header-title",
        "#main-content h1", ".job-details h1", "[data-property='job_title']", "[data-property='title']", "main h1", "h1",
      ],
      company: [
        ".employer-name", ".employer-title", ".organization-name",
        "[data-property='employer']", "[data-property='employer_name']", "[data-property='organization']",
      ],
      description: [
        "#job_description", ".job-description", ".description-content",
        "[data-property='description']", "[data-property='job_desc']", "[data-property='job_description']",
        ".job-details article", "#main-content article", "main article", ".job-details", "#main-content",
      ],
      companyLabel: /^(employer|organization|company)( name)?:?$/i,
      descriptionLabel: /^((job|position) )?description:?$/i,
      companyNearTitle: true,
    },
    {
      name: "LinkedIn",
      host: /linkedin\.com$/,
      title: [".job-details-jobs-unified-top-card__job-title h1", ".jobs-unified-top-card__job-title", ".top-card-layout__title", "h1"],
      company: [".job-details-jobs-unified-top-card__company-name a", ".job-details-jobs-unified-top-card__company-name", ".jobs-unified-top-card__company-name a", ".topcard__org-name-link"],
      description: ["#job-details", ".jobs-description__content", ".jobs-box__html-content", ".description__text", ".jobs-search__job-details"],
    },
    {
      name: "Indeed",
      host: /indeed\.com$/,
      // Search results show the selected job in a right-hand pane; read only inside it so we get
      // the job currently on screen, not the page heading or another card.
      scope: [".jobsearch-RightPane", "#viewJobSSRContent", ".jobsearch-ViewJobLayout-content"],
      title: [
        ".jobsearch-JobInfoHeader-title", '[data-testid="jobSearch-jobTitle-title"]',
        '[data-testid="jobsearch-JobInfoHeader-title"]', "h1",
      ],
      company: [
        '[data-testid="inlineHeader-companyName"]', '[data-testid="company-name"]',
        ".jobsearch-InlineCompanyRating-companyHeader", '[data-company-name="true"]', ".jobsearch-CompanyInfoContainer a",
      ],
      description: ["#jobDescriptionText", ".jobsearch-JobComponent-description"],
      // If the pane doesn't have them, use the highlighted result card in the left-hand list.
      selectedCard: {
        card: [".vjs-highlight", ".result.selected", '[data-mobtk][aria-selected="true"]', '[data-mobtk][aria-current="true"]'],
        // Every card carries data-mobtk, so a bare [data-mobtk] only identifies the job if it's the only card.
        soleCard: "[data-mobtk]",
        title: ["h2.jobTitle span[title]", "h2.jobTitle a", ".jobTitle", '[id^="jobTitle-"]', "h2"],
        company: ['[data-testid="company-name"]', ".companyName", ".company"],
      },
      logLabel: "HowdyHire Scraped Indeed Right Pane:",
    },
    {
      name: "Handshake",
      host: /joinhandshake\.com$/,
      title: ['[data-hook="job-title"]', "h1"],
      company: ['[data-hook="employer-name"]', 'a[href*="/employers/"]'],
      description: ['[data-hook="job-description"]', '[class*="description"]'],
    },
    {
      name: "Greenhouse",
      host: /greenhouse\.io$/,
      title: [".app-title", ".job__title h1", "h1"],
      company: [".company-name", ".job__company"],
      description: ["#content", ".job__description", "#app_body"],
    },
    {
      name: "Lever",
      host: /lever\.co$/,
      title: [".posting-headline h2", "h2"],
      company: [],
      description: ["[data-qa='job-description']", ".section-wrapper.page-full-width", ".content"],
    },
    {
      name: "Workday",
      host: /myworkdayjobs\.com$/,
      title: ['[data-automation-id="jobPostingHeader"]', "h2"],
      company: [],
      description: ['[data-automation-id="jobPostingDescription"]'],
    },
  ];

  const site = SITES.find((s) => s.host.test(location.hostname));

  // The element site rules search inside: the first matching scope (e.g. Indeed's right pane), else the page.
  function siteRoot() {
    for (const selector of site?.scope ?? []) {
      const el = document.querySelector(selector);
      if (el) return { root: el, label: selector };
    }
    return { root: document, label: "document" };
  }

  function selectedCard() {
    const cfg = site?.selectedCard;
    if (!cfg) return null;
    let card = cfg.card.map((sel) => document.querySelector(sel)).find(Boolean);
    if (!card) {
      const all = document.querySelectorAll(cfg.soleCard);
      if (all.length === 1) card = all[0];
    }
    if (!card) return null;
    const tag = (m) => m && { ...m, via: `selected card ${m.via}` };
    return {
      title: tag(firstMatch(cfg.title, shortText, (t) => !!t, card)),
      company: tag(firstMatch(cfg.company, shortText, (t) => !!t, card)),
    };
  }

  function fromSite() {
    if (!site) return null;
    const { root, label } = siteRoot();
    const scoped = (m) => m && (root === document ? m : { ...m, via: `${label} ${m.via}` });
    const card = (site.selectedCard && selectedCard()) || {};
    const title = scoped(firstMatch(site.title, shortText, (t) => !!t, root)) || card.title || null;
    const company =
      scoped(firstMatch(site.company, shortText, (t) => !!t, root)) ||
      card.company ||
      (site.companyLabel && byLabel(site.companyLabel, shortText)) ||
      (site.companyNearTitle && subheaderNear(title?.el)) ||
      (site.name === "Lever" && { text: document.querySelector(".main-header-logo img[alt]")?.alt?.trim() || "", via: "logo alt" }) ||
      null;
    const description =
      scoped(firstMatch(site.description, readableText, plausibleDescription, root)) ||
      (site.descriptionLabel && byLabel(site.descriptionLabel, readableText)) ||
      null;
    return { title, company, description };
  }

  // Generic fallback: highlighted text, or the page's main content region (cleaned).
  const JOB_BOARD_NAMES = /^(indeed(\.com)?|linkedin|glassdoor|handshake|symplicity|hireaggies|ziprecruiter|monster|simplyhired|greenhouse|lever|workday|careers?|jobs?)$/i;
  const LOCATION_LIKE = /(,\s*[A-Z]{2}\b|\bremote\b|\bhybrid\b)/i;

  // "<Title> - <Company> - <Location> - Indeed.com", "<Company> hiring <Title> in <Place> | LinkedIn",
  // "<Title> at <Company> | Greenhouse", ...
  function parseDocumentTitle() {
    const raw = document.title.trim();
    const linkedIn = raw.match(/^(.+?) hiring (.+?)(?: in .+?)?(?: \| LinkedIn)?$/i);
    if (linkedIn) return { title: linkedIn[2].trim(), company: linkedIn[1].trim() };
    const parts = raw.split(/\s+[-|–—·]\s+/).map((p) => p.trim()).filter((p) => p && !JOB_BOARD_NAMES.test(p));
    const at = parts[0]?.match(/^(.+?) at (.+)$/i);
    if (at) return { title: at[1].trim(), company: at[2].trim() };
    return { title: parts[0] || "", company: parts.slice(1).find((p) => !LOCATION_LIKE.test(p)) || "" };
  }

  function fromPage() {
    const main = firstMatch(["main article", "article", "main", '[role="main"]', "#main-content", "#content"], readableText, plausibleDescription);
    const fromTitleTag = parseDocumentTitle();
    // Common employer markup on generic boards (short text only, so we don't grab a whole card).
    const employer = firstMatch(
      [".company", ".employer", ".company-name", ".employer-name", '[itemprop="hiringOrganization"]', '[class*="companyName"]'],
      shortText,
      (t) => t.length >= 2 && t.length <= 80,
    );
    // On generic career sites og:site_name is usually the employer ("Acme Careers"); on job boards it's the board.
    const siteName = site ? "" : meta("og:site_name").replace(/\s+(careers?|jobs?)$/i, "").trim();
    return {
      title: { text: meta("og:title") || shortText(document.querySelector("h1")) || fromTitleTag.title, via: "page title" },
      company:
        employer ||
        (siteName && !JOB_BOARD_NAMES.test(siteName) ? { text: siteName, via: "og:site_name" } : null) ||
        (fromTitleTag.company ? { text: fromTitleTag.company, via: "document title" } : null),
      description: main,
    };
  }

  // Never block an import on the employer name; the interview still works with a placeholder.
  const DEFAULT_EMPLOYER = "Featured Employer";

  function extractJob() {
    // Site rules first: single-page boards (Indeed, LinkedIn, Symplicity) swap jobs without a reload,
    // so the page's JSON-LD can still describe the first job opened, not the one on screen.
    const sources = [fromSite(), fromJsonLd(), fromPage()].filter(Boolean);
    const pick = (field) => sources.map((s) => s[field]).find((v) => v?.text?.trim()) || { text: "", via: "not found" };

    const title = pick("title");
    const found = pick("company");
    const company = found.text.trim() ? found : { text: DEFAULT_EMPLOYER, via: "default (employer not found)" };
    // A highlighted selection always wins for the description: it's the user's explicit choice.
    const selection = normalize(String(window.getSelection() || ""));
    const description = selection.length >= MIN_DESCRIPTION ? { text: selection, via: "highlighted text" } : pick("description");

    const job = {
      title: oneLine(title.text).slice(0, 200) || "Job Opportunity",
      company: oneLine(company.text).slice(0, 200),
      description: normalize(description.text).slice(0, MAX_DESCRIPTION),
      url: location.href,
    };

    console.log("HowdyHire Scraped:", { title: job.title, company: job.company, description: job.description });
    if (site?.logLabel) {
      console.log(site.logLabel, { title: job.title, company: job.company, descriptionLength: job.description.length });
    }
    console.log("HowdyHire sources:", {
      site: site?.name ?? "generic",
      title: title.via,
      company: company.via,
      description: description.via,
      descriptionLength: job.description.length,
    });
    return job;
  }

  const looksLikeJobPage = () => {
    if (fromJsonLd()) return true;
    if (!site) return false;
    return !!(
      firstMatch(site.description, readableText, plausibleDescription, siteRoot().root) ||
      (site.descriptionLabel && byLabel(site.descriptionLabel, readableText))
    );
  };

  // ---------------------------------------------------------------------------
  // UI: floating button + toast, isolated in a shadow root so site CSS can't affect it
  // ---------------------------------------------------------------------------

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .wrap { display:flex; flex-direction:column; align-items:flex-end; gap:8px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      button { display:none; align-items:center; gap:8px; border:0; border-radius:999px; padding:12px 18px;
        background:#500000; color:#fff; font-size:14px; font-weight:600; cursor:pointer;
        box-shadow:0 6px 20px rgba(80,0,0,.35); }
      button:hover { background:#700a0a; }
      button:focus-visible { outline:3px solid #ec9a9a; outline-offset:2px; }
      button[disabled] { opacity:.7; cursor:progress; }
      .toast { display:none; max-width:300px; padding:10px 14px; border-radius:10px; background:#fff; color:#1c1917;
        font-size:13px; line-height:1.4; box-shadow:0 6px 20px rgba(0,0,0,.18); border-left:4px solid #500000; }
      .toast.error { border-left-color:#dc2626; }
    </style>
    <div class="wrap">
      <div class="toast" role="status"></div>
      <button type="button" title="Start a mock interview for this job">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        <span>Practice with HowdyHire</span>
      </button>
    </div>`;
  (document.body || document.documentElement).appendChild(host);

  const button = root.querySelector("button");
  const label = root.querySelector("button span");
  const toast = root.querySelector(".toast");
  let toastTimer;

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast${isError ? " error" : ""}`;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.style.display = "none"), isError ? 7000 : 3500);
  }

  async function sendToHowdyHire() {
    const job = extractJob();
    // Only the description is truly required (the interview is built from it); title and
    // employer always have fallbacks.
    if (job.description.length < MIN_DESCRIPTION) {
      showToast("Couldn't find the job description on this page. Highlight the description text and try again (details are in the console).", true);
      return;
    }
    button.disabled = true;
    label.textContent = "Opening HowdyHire…";
    try {
      const res = await chrome.runtime.sendMessage({ type: "HOWDYHIRE_IMPORT", job });
      if (!res?.ok) throw new Error(res?.error || "Something went wrong.");
      showToast(`Sent “${job.title}” to HowdyHire. Gig 'em!`);
    } catch (err) {
      showToast(err.message || "Couldn't reach the HowdyHire extension. Try reloading the page.", true);
    } finally {
      button.disabled = false;
      label.textContent = "Practice with HowdyHire";
    }
  }

  button.addEventListener("click", sendToHowdyHire);

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "HOWDYHIRE_TRIGGER") void sendToHowdyHire();
  });

  // Job boards like LinkedIn and Symplicity swap postings without a page load, so re-check periodically.
  const refresh = () => (button.style.display = looksLikeJobPage() ? "inline-flex" : "none");
  refresh();
  setInterval(refresh, 2000);
})();
