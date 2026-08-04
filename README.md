# AGILA

Automated Guardian Information on Learner Attendance — QR-based school attendance UI.

This is a Vite + React SPA adapted from the Lovable AGILA design (TanStack Start → React Router).

## Setup

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Project layout

```
agila/
├── public/                 # favicon, robots.txt
├── src/
│   ├── components/
│   │   ├── agila/          # App shell, auth layout, stat cards
│   │   └── ui/             # shadcn/ui primitives
│   ├── hooks/
│   ├── lib/                # utilities + mock school data
│   ├── pages/              # route screens (landing, dashboard, …)
│   ├── App.tsx             # React Router map
│   ├── main.tsx
│   └── index.css           # Tailwind + AGILA design tokens
├── components.json         # shadcn config
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login` | Sign in |
| `/register` | School registration |
| `/forgot-password` | Password recovery |
| `/dashboard` | Live attendance dashboard |
| `/attendance` | Daily register |
| `/scanner` | QR gate console |
| `/students` | Learner directory |
| `/teachers` | Faculty directory |
| `/reports` | Reports & exports |
| `/notifications` | Alerts |
| `/settings` | Workspace settings |

## Notes

- Lovable’s original stack (TanStack Start, Bun, Nitro SSR) was replaced with a standard Vite SPA so it runs without Lovable-specific packages.
- All data is mock data in `src/lib/agila-data.ts` for UI demos.

## Backend integration

Run the local development API in a second terminal with `npm run server`.

The SPA expects an API under `/api` by default. Set `VITE_API_BASE_URL` when the API is hosted elsewhere; see `.env.example`.

Authentication endpoints:

- `POST /auth/login` with `{ email, password, remember }` returns `{ user, accessToken? }`.
- `POST /auth/register` with the registration fields returns `{ user, accessToken? }`.
- `POST /auth/forgot-password` with `{ email }`.
- `GET /auth/me` returns `{ user }` using a cookie or bearer token.
- `POST /auth/logout` invalidates the current session.

Requests include credentials for cookie sessions. If `accessToken` is returned, it is kept in session storage and sent as a bearer token. The backend must still enforce authorization server-side; SPA route protection is only a UX safeguard.

## Deploy to Render (free instance)

The included `render.yaml` deploys the frontend and API together as one Render web service. Push the repository, then create a Blueprint in Render from the repository. Render runs `npm ci && npm run build`, starts with `npm start`, and checks `/api/health`.

Free Render web services spin down after idle time and have an ephemeral filesystem. This project currently stores data in `server/data.json`, so records reset after a restart, deploy, or spin-down. Use a managed database before storing real school records. [Render's free-instance limitations](https://render.com/docs/free) explain the constraint.

## Android APK

Capacitor is configured with app ID `com.agila.attendance`. Copy `.env.android.example` to `.env.android`, set `VITE_API_BASE_URL` to the deployed Render service URL plus `/api`, then run:

```bash
npm run android:apk
```

The generated APK is at `android/app/build/outputs/apk/release/`. To produce a signed release APK, set `AGILA_KEYSTORE_PATH`, `AGILA_KEYSTORE_PASSWORD`, `AGILA_KEY_ALIAS`, and `AGILA_KEY_PASSWORD` before running the command. Keystore files and `.env.android` are ignored by Git.
