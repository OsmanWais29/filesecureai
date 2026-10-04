# SecureFiles AI (FileSecure)

The trustee web app. It runs on **AWS** through the SFAI Platform Module
(`sfai-platform-module/`): Cognito for login, a data API for the database, S3 for
files and Bedrock for AI. It no longer uses Supabase.

## Run it locally

```bash
# 1. Backend (terminal 1): API + local Postgres + demo data, no AWS needed
cd sfai-platform-module && npm install && APP_URL=http://localhost:8080 npm run dev -w api

# 2. Web app (terminal 2)
npm install --legacy-peer-deps
npm run dev                 # http://localhost:8080
```

Sign in with **trustee@demo.test / demo-password**, or create a new firm from the
sign-up page. Settings are in `.env` (see `.env.example`):

| Variable | What it is |
|---|---|
| `VITE_SFAI_API_URL` | The module's API, e.g. `https://xxxx.execute-api.ca-central-1.amazonaws.com/api` |
| `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID` | The shared Cognito pool (stack outputs). Empty = local dev login |

## How the app reaches AWS

`src/lib/sfai/` is the whole backend client: login (`auth.ts`), database (`db.ts`),
files (`storage.ts`), live updates (`realtime.ts`). It keeps the old Supabase client's
shape, so the app's calls (`supabase.from("documents").select()...`) work unchanged;
`@/lib/supabase` and `@/integrations/supabase/client` both export it under the old name.
`src/lib/sfaiFunctions.ts` maps the old Edge Function names to the new API.
What runs where, and the table access rules: `sfai-platform-module/README.md`.

> **Lovable:** don't reconnect this project to Supabase in Lovable. Lovable regenerates
> `src/integrations/supabase/client.ts` and would point the app back at Supabase.

---

## Lovable project (original notes)

## Project info

**URL**: https://lovable.dev/projects/6c617d0c-7282-475d-92ca-8ee670a056d8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6c617d0c-7282-475d-92ca-8ee670a056d8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6c617d0c-7282-475d-92ca-8ee670a056d8) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
