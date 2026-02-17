# HomeCook / Self Serve

Expo web/mobile frontend + Express API backend in one repo.

## One-Time Setup

1. Use this folder only:
   - `C:\Users\Kevin Meyer\homecook`
2. Use Node 20 (project is pinned in `.nvmrc`).
3. Install dependencies:
   - `npm install`
   - `npm install --workspace server`
4. Copy env file:
   - `copy .env.example .env`

## Daily Local Run

Use one command from repo root:

- `npm run dev`

This starts:
- backend API (`http://localhost:3000`)
- Expo web dev server

If needed, backend only:
- `npm run dev:server`

## Environment Variables

From `.env.example`:

- `PORT=3000`
- `JWT_SECRET=change-me`
- `DATABASE_PATH=./homecook.db`
- `RESEND_API_KEY=`
- `EMAIL_FROM=Self Serve <onboarding@resend.dev>`
- `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`

`EXPO_PUBLIC_API_BASE_URL` is used by the frontend API client so local/prod URLs can differ without code edits.

## CI (GitHub Actions)

Workflow file: `.github/workflows/ci.yml`

On each push/PR it runs:
- `npm ci`
- `npm run ci` (root typecheck + server typecheck + server build)

## Deploy Setup

### Frontend (Vercel)

Config file: `vercel.json`

- Build command: `npx expo export --platform web`
- Output directory: `dist`

Set Vercel env var:
- `EXPO_PUBLIC_API_BASE_URL=https://<your-render-api-domain>`

### Backend (Render)

Config file: `render.yaml`

- Service root: `server/`
- Build: `npm ci && npm run build`
- Start: `npm run start`
- Persistent disk mounted at `/var/data`
- Uses `DATABASE_PATH=/var/data/homecook.db`

Set Render env vars:
- `JWT_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Simple Live Workflow

1. Make UI/API changes locally.
2. Run `npm run dev` and check locally.
3. Commit and push to GitHub.
4. CI runs automatically.
5. Vercel/Render auto-deploy from `main`.
6. Open live site URL.

## Auth Features Included

- Signup with `email + username + password`
- Email verification code (+ resend)
- Forgot password code (+ resend)
- First-login onboarding: age + identity
