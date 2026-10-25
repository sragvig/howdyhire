// HowdyHire extension service worker: sends extracted jobs to the app and opens the interview.

// Change this if the app runs elsewhere (e.g. port 3001 or a deployed URL), and update
// "host_permissions" in manifest.json to match.
const APP_URL = "http://localhost:3000";

async function importJob(job) {
  let res;
  try {
    res = await fetch(`${APP_URL}/api/jobs/import`, {
      method: "POST",
      // Ask for JSON: a service worker can't follow a redirect into a tab, so the API returns
      // { redirectTo } and we open it ourselves.
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(job),
    });
  } catch {
    throw new Error(`Couldn't reach HowdyHire at ${APP_URL}. Is the dev server running?`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.redirectTo) throw new Error(data?.error || `HowdyHire returned an error (${res.status}).`);
  await chrome.tabs.create({ url: APP_URL + data.redirectTo });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "HOWDYHIRE_IMPORT") return;
  importJob(message.job).then(
    () => sendResponse({ ok: true }),
    (err) => sendResponse({ ok: false, error: err.message }),
  );
  return true; // keep the channel open for the async response
});

// Toolbar button: works on any job page, including sites without the floating button.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !/^https?:/.test(tab.url ?? "")) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tab.id, { type: "HOWDYHIRE_TRIGGER" });
  } catch (err) {
    console.warn("HowdyHire: couldn't run on this page", err);
  }
});
