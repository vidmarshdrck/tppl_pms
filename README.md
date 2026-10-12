# TPPL Performance Management System

Inspection preview for Tazama Petroleum Products Limited.

The preview is published through this repository’s GitHub Pages deployment.

## Sign in

Use a demo username and password `ChangeMe123!`.

- General Manager: `gm`
- Finance Head: `finance_head`
- Operations Head: `operations_head`
- ICT Head: `ict_head`
- Staff: `finance_staff`, `operations_staff`, `ict_staff`
- Administration: `admin`; Board: `board`

Other department prefixes: `pm`, `security`, `safety`, `hr`, `procurement`, `engineering`, followed by `_head` or `_staff`.

## Included workflows

- Executive reporting, department scorecards, and combined Scorecards / Strategy Map tabs.
- Quarterly KPI submissions and approval; weekly Finance and Operations books with daily entry support. Approved book revisions feed executive summaries.
- Excel worksheet preview, column mapping and draft entry import.
- Department tasks, automatic ticket priorities, linked project progress and attachments.
- Tazai personal chat history, guided task requests, attachments, voice notes and browser-supported dictation. The floating portrait provides compact chat and notes on the current page; the sidebar opens the full workspace.
- Staff forum with swipeable photo galleries, full-screen viewing, share links and integrity posters.
- Personal profile page with photo, display name, bio and joining date. Login username stays separate.
- Responsive mobile layout with five navigation buttons and Tazai in the centre.

## Preview data and persistence

This is a static preview with browser-based demo sign-in. Submissions, tasks, posts, profiles and chat history are saved in that browser's local storage; they are not shared across devices. Shared post links resolve only where the corresponding post exists. The workbook-derived historical figures and generated department examples are separate sources. Production database import and authenticated API integration remain pending.

Tazai currently uses a guided task assistant. Notes queue ten minutes after the last edit for the logged-in email address, but actual email delivery requires the future authenticated mail service. General AI answers, document understanding and live conversational voice require a future service. Annual budget workbooks can be previewed; annual budget and strategic goal import mappings remain pending. Initial KPI definitions come from `src/data/scorecardData.js`; the GM can revise reusable targets and activate quarterly copies under KPI → KPI setup.

## Development

Node.js 22.12+ and npm:

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
```

Local preview: http://127.0.0.1:4300/. Build output: `dist/`.

GitHub Actions deploys `main` to GitHub Pages. The build derives its base path from the repository name. The generated `404.html` lets the client router render deep links.

The repository source and GitHub Pages site are the browser-based demo described above. The repository's `dist.zip` is a separate production Windows/IIS deployment artifact built from the real-API frontend. It contains no demo credentials, seeded users, bundled KPI/financial/operations figures, seeded projects, or browser-backed KPI records. It signs in through the same-origin TPPL API with its HttpOnly session cookie and requests dashboard/workflow data from `/TPPL/api`.

The production archive uses the `/TPPL/` base path and hash routing, so IIS does not need the URL Rewrite module. It includes `web.config` and `BUILD_INFO.txt` at its root. Extract its contents into the configured `/TPPL/` static-site folder; do not use the demo source repository as the IIS web root.

## Department KPI setup

As General Manager, open **KPI → KPI setup**. Define or edit each department’s reusable KPIs, review the targets and actual data sources, then activate them for the required year and quarter. Activation creates a fixed copy; later edits apply to future activations. Department users enter the assigned actuals and select **Submit**. GM approval publishes the results to the register, department scorecards, balanced scorecard and executive overview. Automatic actuals require approved Finance or Operations book entries for that same quarter.

This preview saves definitions, activations, books and submissions in each browser. Shared production data and authorization require the planned database/API integration.
