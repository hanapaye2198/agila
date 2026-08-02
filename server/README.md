# AGILA development API

Run from the repository root:

```bash
npm run server
```

The server listens on `http://localhost:3000` and serves the client API under `/api`.

Environment variables:

- `PORT` — defaults to `3000`.
- `CORS_ORIGIN` — defaults to `http://localhost:5173`.

Demo login:

```text
m.duran@northgate.edu.ph
DemoPassword123!
```

This server intentionally uses in-memory users, sessions, and scans. Restarting it clears all data. It is for local development only; production needs a database, email provider, CSRF strategy, rate limiting, secure cookie settings, audit logging, and real QR/device integration.
