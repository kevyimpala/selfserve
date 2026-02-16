# HomeCook

Shared frontend (Expo for mobile + web) and backend API (Express + SQLite) scaffold.

## Project Structure

```text
homecook/
  README.md
  .env.example
  package.json
  tsconfig.json
  docs/
    api.md
  server/
    package.json
    tsconfig.json
    src/
      index.ts
      config.ts
      db.ts
      auth.ts
      routes/
        auth.ts
        pantry.ts
        uploads.ts
        nutrition.ts
      services/
        vision.ts
        nutrition.ts
  src/
    app/
      App.tsx
      routes.tsx
    screens/
      Home.tsx
      Login.tsx
      Pantry.tsx
      Barcode.tsx
      Photo.tsx
    components/
      Button.tsx
      Input.tsx
      IngredientList.tsx
    api/
      client.ts
    state/
      session.ts
    hooks/
      useCamera.ts
      useBarcodeScanner.ts
    utils/
      validation.ts
      format.ts
    platform/
      index.native.tsx
      index.web.tsx
```

## Quick Start

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies from project root:
   - `npm install`

## Run Commands

Backend:

- `npm run dev:server`

Frontend:

- `npm run dev:app`
- `npm run dev:web`

## Notes

- Backend uses SQLite.
- Vision and nutrition adapters are stubbed.
- Shared UI supports web + mobile in one codebase.
- The frontend health check calls `http://localhost:3000/health`.
- For mobile devices, replace `localhost` with your machine IP in `src/api/client.ts`.
