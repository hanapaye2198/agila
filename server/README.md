# AGILA development API

Run from the repository root:

```bash
npm run server
```

The server listens on `http://localhost:3000` and serves the client API under `/api`.

Health check: `GET http://localhost:3000/api/health`.

Environment variables:

- `PORT` — defaults to `3000`.
- `CORS_ORIGIN` — defaults to `http://localhost:5173`.
- `NODE_ENV` — set to `production` to enable `Secure` cookies and skip seeding the demo account.
- `EXPOSE_RESET_TOKEN` — set to `true` (non-production only) to return the reset token in the
  `/auth/forgot-password` response so the reset flow can be tested without an email provider.

The Vite dev server proxies `/api` to this server, so the client needs no `VITE_API_BASE_URL`
unless the API runs elsewhere.

Demo login (seeded only when `NODE_ENV` is not `production`):

```text
m.duran@northgate.edu.ph
DemoPassword123!
```

Users and scans are persisted atomically to the ignored `server/data.json` file; sessions remain in memory and expire. Changing a password revokes that user's existing sessions. It is for local development only; production needs a real database, email provider, CSRF strategy, distributed rate limiting, audit logging, and real QR/device integration.
