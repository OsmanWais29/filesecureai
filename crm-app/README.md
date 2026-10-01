# CRM App

The CRM front end (React + Vite + Tailwind + shadcn/ui), rebuilt from the
`src/components/crm` module of FileSecure AI with short, commented code.
All data comes from the **SFAI CRM Module** backend (`../sfai-crm-module`).

## Run it locally

```bash
# 1. Backend (terminal 1): API + local Postgres (PGlite) + demo data
cd ../sfai-crm-module && npm install && npm run dev -w api   # http://localhost:3000/crm

# 2. Front end (terminal 2)
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Locally, emails/SMS are logged by the backend instead of sent, files go to
`sfai-crm-module/api/.data/files`, and "Ask your CRM" falls back to quick rule-based
answers when Bedrock is not reachable.

## Settings (`.env`, see `.env.example`)

| Variable | What it is |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `https://api.example.com/crm`. Default `http://localhost:3000/crm` |
| `VITE_DEV_FIRM` | Local dev only: the demo firm the dev server logs you in as |

## Login (inside the bigger app)

The CRM shares the host app's Cognito login. Give it the token getter once at start-up:

```ts
import { setTokenProvider } from "@/crm/api";
setTokenProvider(async () => (await fetchAuthSession()).tokens?.idToken?.toString() ?? null);
```

Every request then sends `Authorization: Bearer <ID token>`; the backend reads the firm
and role from the token. With no provider set (local dev) it sends the dev-firm header.

## How it talks to the backend

- `src/crm/api.ts` is the only file that calls the network. It maps backend rows to the
  UI types (e.g. `startsAt` -> `date` + `time`).
- `src/crm/store.tsx` loads everything once, and every action calls the API and then
  reloads, so the screens always show what the server has. Errors show as toasts.
- Documents upload straight to S3 with a presigned link (`upload-url` -> PUT -> `complete`).
- Google/Microsoft "Connect" sends the browser to their sign-in page; they return to the
  app with `?connected=google`, which opens the Integrations tab.
- AI drafts (from "Ask your CRM" or an MCP client) appear on the Dashboard and in the
  assistant with Send / Discard. Nothing the AI writes is sent without a click.

## Where things live

| File | What it does |
|---|---|
| `src/main.tsx` | App entry: shared store + toasts around the CRM |
| `src/crm/api.ts` | Every backend call, login header, row -> UI type mapping |
| `src/crm/store.tsx` | Loaded data + actions (add client, move stage, send email…) in one place |
| `src/crm/data.ts` | Types, fixed lists (stages, file types, required documents), integration catalog |
| `src/crm/CRM.tsx` | Shell: loading/error state, Client options menu, Ask your CRM, Add client, tabs |
| `src/crm/IntakeDialog.tsx` | 4-step intake: Personal, Employment, Documents, Consultation |
| `src/crm/DashboardTab.tsx` | AI drafts awaiting approval, today, deadlines, files needing attention, activity |
| `src/crm/ClientsTab.tsx` | All-clients table (bulk email) and the client profile with its email thread |
| `src/crm/PipelineTab.tsx` | Board of files by stage, from new lead to discharge |
| `src/crm/ScheduleTab.tsx` | Calendar, agenda (CRM + website + synced calendar events), booking form |
| `src/crm/ReportsTab.tsx` | Lead flow, conversion, sources, file mix (computed by the backend), CSV export |
| `src/crm/AutomationsTab.tsx` | Automation rules on/off, email templates, email a whole stage |
| `src/crm/IntegrationsTab.tsx` | Website embed, booking link, Google/Microsoft, Twilio, OSB CSV export |
| `src/crm/DocumentsTab.tsx` | Upload to S3 and download a client's documents |
| `src/crm/Assistant.tsx` | "Ask your CRM" chat (Bedrock agent, local fallback) |
| `src/crm/DraftCard.tsx` | One AI-drafted email with Send / Discard |
| `src/crm/EmailDialog.tsx` | Template-based email composer (also replies inside a thread) |
| `src/crm/ui.tsx` | Small shared UI helpers |
| `src/components/ui/` | shadcn/ui primitives |
