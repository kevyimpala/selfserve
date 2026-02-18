# HomeCook / Self Serve

Expo frontend with Supabase-backed auth and data.

## Migration Status

Completed:
- Auth (signup/login/verify/reset) via Supabase Auth
- Profile onboarding (age + identity) via `profiles`
- Pantry CRUD via `pantry_items`
- Upload persistence via `uploads`
- Barcode + photo parsing via Supabase Edge Functions

## One-Time Setup

1. Use this folder only:
   - `C:\Users\Kevin Meyer\homecook`
2. Use Node 20 (`.nvmrc`).
3. Install deps:
   - `npm install`
4. Copy env:
   - `copy .env.example .env`
5. Set in `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
6. In Supabase SQL editor, run:
   - `docs/supabase.sql`

## Supabase Auth Settings

In Supabase dashboard:
1. Authentication -> Providers -> Email: enabled
2. Authentication -> URL Configuration:
   - Add your local and production site URLs
3. Authentication -> Email Templates:
   - Customize verify/reset messaging as needed

## Edge Functions (Required)

Deploy these two functions:
- `nutrition-barcode`
- `vision-parse`

Template files:
- `docs/edge-functions/nutrition-barcode.ts`
- `docs/edge-functions/vision-parse.ts`

If using Supabase CLI:
1. `supabase login`
2. `supabase link --project-ref <your-project-ref>`
3. Create function files under `supabase/functions/<name>/index.ts`
4. `supabase functions deploy nutrition-barcode`
5. `supabase functions deploy vision-parse`

## Local Run

- `npm run dev`

## CI

- Workflow: `.github/workflows/ci.yml`
- Command: `npm run ci`

## Deploy (Vercel)

- Build: `npx expo export --platform web`
- Output: `dist`
- Environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

