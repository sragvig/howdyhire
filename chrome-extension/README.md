# HowdyHire Chrome Extension

Sends the job posting you're viewing to HowdyHire and opens a mock interview tailored to it.

## Load it (unpacked)

1. Start the app: `npm run dev` (it must be on **http://localhost:3000**; see "Different URL" below).
2. Open `chrome://extensions`, turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this `chrome-extension/` folder.
4. Pin "HowdyHire – Practice This Job" from the puzzle-piece menu.

## Use it

- **On LinkedIn, Indeed, Handshake, Greenhouse, Lever, or Workday job pages**, a maroon
  **Practice with HowdyHire** button appears in the bottom-right corner. Click it.
- **On any other page**, click the HowdyHire toolbar icon.
- If the description isn't detected, **highlight the job description text** first; a selection always wins.

HowdyHire opens in a new tab at `/interview` with the job loaded, then analyzes the posting's key
competencies. Upload your resume once in the app; it's remembered for new tabs.

## How it works

`content.js` extracts `{ title, company, description }` from the page (schema.org `JobPosting`
data first, then site-specific selectors, then highlighted or main page text). `background.js`
POSTs it to `/api/jobs/import` and opens the returned `/interview?import=…` URL.

## Different URL

If the app runs on another port or a deployed URL, update `APP_URL` in `background.js` and
`host_permissions` in `manifest.json`, then click the reload icon on `chrome://extensions`.

After editing any extension file, reload the extension on `chrome://extensions` and refresh the job page.
