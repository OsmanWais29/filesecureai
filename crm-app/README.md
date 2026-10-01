# CRM App

A small, standalone CRM front end (React + Vite + Tailwind + shadcn/ui), rebuilt from
the `src/components/crm` module of FileSecure AI with short, commented code.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

It runs on demo data out of the box. To use a real database, copy `.env.example` to `.env`
and fill in your Supabase URL and anon key. The app reads and writes the `clients`, `meetings`,
`documents` and `client_interactions` tables and the `documents` storage bucket.

## Where things live

| File | What it does |
|---|---|
| `src/main.tsx` | App entry: shared store + toasts around the CRM |
| `src/crm/CRM.tsx` | Shell: Client options menu, Ask your CRM, Add client, headline numbers, tabs |
| `src/crm/store.tsx` | All CRM data + actions (add client, move stage, log email…) in one place |
| `src/crm/data.ts` | Types, fixed lists (stages, file types, required documents) and demo data |
| `src/crm/IntakeDialog.tsx` | 4-step intake: Personal, Employment, Documents, Consultation |
| `src/crm/DashboardTab.tsx` | Today's appointments, deadlines, files needing attention, recent activity |
| `src/crm/ClientsTab.tsx` | All-clients table (bulk email) and the single-client profile |
| `src/crm/PipelineTab.tsx` | Board of files by stage, from new lead to discharge |
| `src/crm/ScheduleTab.tsx` | Calendar, agenda with synced bookings, booking form, self-booking link |
| `src/crm/ReportsTab.tsx` | Lead flow, conversion, sources, file mix, CSV export |
| `src/crm/AutomationsTab.tsx` | Automation rules, email templates, email a whole stage |
| `src/crm/IntegrationsTab.tsx` | Website form, booking page, calendars, email/SMS, OSB export |
| `src/crm/DocumentsTab.tsx` | Drag-and-drop document upload |
| `src/crm/Assistant.tsx` | "Ask your CRM": answers from CRM data with one-click actions |
| `src/crm/EmailDialog.tsx` | Template-based email composer |
| `src/crm/ui.tsx` | Small shared UI helpers |
| `src/components/ui/` | shadcn/ui primitives |

## What is demo-only today

- Integrations, automations and email sending are UI + local state. Emails are logged on the
  client timeline until a mailbox integration is built.
- The website embed script and booking page URL are placeholders for endpoints still to build.
- The assistant answers with rules over CRM data; `answer()` in `Assistant.tsx` is where an LLM call would go.
- The SIN is collected in the intake form; store it in an encrypted column, not plain metadata, before going live.
