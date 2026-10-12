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
- Tazai personal chat history, guided task requests, attachments, voice notes and browser-supported dictation.
- Staff forum with swipeable photo galleries, full-screen viewing, share links and integrity posters.
- Personal profile page with photo, display name, bio and joining date. Login username stays separate.
- Responsive mobile layout with five navigation buttons and Tazai in the centre.

## Preview data and persistence

This is a static preview with browser-based demo sign-in. Submissions, tasks, posts, profiles and chat history are saved in that browser's local storage; they are not shared across devices. Shared post links resolve only where the corresponding post exists. The workbook-derived historical figures and generated department examples are separate sources. Production database import and authenticated API integration remain pending.

Tazai currently uses a guided task assistant. General AI answers, document understanding and live conversational voice require a future service. Annual budget workbooks can be previewed; annual budget and strategic goal import mappings remain pending. KPI targets currently live in `src/data/scorecardData.js`; there is no GM goal editor yet.

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
