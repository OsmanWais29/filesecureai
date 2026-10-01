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
| `src/main.tsx` | App entry: React Query + toasts around the CRM |
| `src/crm/CRM.tsx` | Page shell: header, stats, tabs, add-client button |
| `src/crm/ClientsTab.tsx` | Searchable client list + client profile |
| `src/crm/ScheduleTab.tsx` | Calendar, booking links, analytics charts |
| `src/crm/ActivityTab.tsx` | Timeline of all interactions |
| `src/crm/DocumentsTab.tsx` | Drag-and-drop document upload |
| `src/crm/MeetingsTab.tsx` | Upcoming meetings with join / copy / email |
| `src/crm/ClientDialog.tsx` | Add-client form (quick or 3-step intake), driven by a field list |
| `src/crm/useClients.ts` | Loads clients (Supabase or demo data) |
| `src/crm/data.ts` | Types + demo data |
| `src/crm/ui.tsx` | Small shared UI helpers |
| `src/components/ui/` | shadcn/ui primitives |
