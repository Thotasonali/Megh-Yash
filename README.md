# Yash & Megh — DSA Zero to Hero (Vercel version)

6 months, 26 weeks, 1 problem a day (~40 min), one pattern a week, Weeks 1–2 Big-O only.
For two BTech 1st-year beginners. Python **and** Java code for every problem.

## What is in this site

- **Roadmap tab** — 26 weeks. Every day card has one big button
  **"❓ Today's question — tap to open"**, an exact-only LeetCode chip
  (**LeetCode #N · Title** with a link) or **"LeetCode: Not found"** when there
  is no exact LeetCode problem (never a "closest match" link), and
  **🚀 Yash · Tap Done** / **🎯 Megh · Tap Done** buttons.
- **📖 See Explanation** — one button per day with the full explanation in
  simple Class-10 language: theory, visual example/diagram, step-by-step,
  code (Python/Java switch), step-by-step trace, and real-world use.
- **Progress circles** — tap Yash's or Megh's photo circle to see their work,
  notes (editable per problem), **▶️ Continue to Next** and
  **⬆️ Increase My Progress**.
- **💬 Ask tab** — explanations and code from the course, with saved answers.
- **📊 Tracker tab** — LeetCode-style heatmap (26×7), streaks, weekend log.
- **Shared updates** — Tap Done / notes / logs are stored in one shared
  server-side store (see below), so Yash sees Megh's updates and vice versa,
  and Vassikar can just view them from the same live link.

## Deployment status (26 Nov 2026)

**Not yet live.** The Vercel account is connected
(`sonaliraot123@gmail.com`, team `sona`), and a private Blob store named
`dsa-progress` was created — but the Vercel API refused project creation
three times with `403: forbidden — You don't have permission to create the
project` (POST /v11/projects, POST /v13/deployments, team and personal
account). The account owner is confirmed as OWNER of the team, so this is a
scope limit of the connected OAuth token, not a role problem. There is no
Vercel CLI login in this environment to fall back to, and GitHub is not
connected here.

**This is not deployed, and nothing here pretends otherwise.**

## How to finish the deployment (2 options)

### Option A — create the project in the Vercel dashboard (fastest, no new credentials)

1. Go to https://vercel.com/dashboard, sign in as `sonaliraot123@gmail.com`,
   team `sona`.
2. **Add New → Project → Import** this folder (push it to a GitHub repo
   first, or use `vercel` CLI `vercel deploy` from this folder after
   `vercel login`), name it `yash-and-megh-dsa-zero-to-hero`.
3. In the project, go to **Storage → Create → Blob**, create/connect a store
   (or re-use the existing `dsa-progress` store). Vercel then injects
   `BLOB_READ_WRITE_TOKEN` automatically — **no token needs to be copied
   anywhere by hand**.
4. Redeploy. The site's `/api/state` then reads/writes one private blob
   (`state.json`) shared by everyone on the link.
5. If the deploy succeeds, the live URL is
   `https://yash-and-megh-dsa-zero-to-hero.vercel.app` (or the team variant
   shown in the dashboard).

### Option B — Vercel API token (lets an agent deploy from here)

Create a token at Vercel → Account Settings → Tokens and make it available
to the agent. Then `vercel deploy --token <token>` (or the MCP
`create_deployment`) can create the project and deploy this folder, and the
Blob store can be linked with its project id.

## How shared storage works here

- `api/state.js` (a Vercel serverless function) keeps one JSON document
  (`state.json`) in the linked Vercel Blob store using `@vercel/blob`.
- The page polls `/api/state` every 30 s and on tab focus, so a Tap Done by
  Yash appears on Megh's phone shortly after, and vice versa.
- If the Blob store is not linked yet, the API returns
  `{ configured: false }` and the page shows a banner saying shared tracking
  is not connected — ticks are then saved in that device's browser only.
  It never silently pretends shared sync is working.

## Files

- `index.html` — the whole app (single page).
- `curriculum.js` — all 13 patterns (Big-O + 12), 26 weeks, 182 days, with
  Python + Java code. Exact-only LeetCode links: #1 Two Sum, #53 Maximum
  Subarray, #121 Best Time to Buy and Sell Stock, #217 Contains Duplicate,
  #238 Product of Array Except Self. Everything else is "Not found".
- `api/state.js` — shared-state API backed by Vercel Blob.
- `package.json`, `vercel.json` — no build step; static files + one function.

## Notes / limits

- The Blob store `dsa-progress` (`store_VYhvpPhr5yfBmRoP`, created 26 Nov
  2026) is empty (0 bytes) and not linked to any project yet. It can be
  deleted from the Vercel dashboard if unused.
- Two people tapping Done at the exact same second can overwrite each
  other (last write wins) — fine for two users, one tap at a time.
- Progress notes are stored in a private blob; still, do not put passwords
  or personal details in notes.
