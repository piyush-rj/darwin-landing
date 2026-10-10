# darwin landing

The darwin marketing landing page, a single Next.js app. Darwin turns the issues your team files into tested pull requests.

The product lives on `main`.

## Run it

```bash
bun install
bun run dev
```

Open http://localhost:4400.

## Waitlist

The navbar form posts to `POST /api/waitlist`, which stores the email in Postgres and sends a confirmation email through Resend.

1. Copy `.env.example` to `.env.local` and fill it in. Leave `RESEND_API_KEY` empty to skip the confirmation email locally.
2. Create the table once:

```bash
psql "$DATABASE_URL" -f db/waitlist.sql
```

## Checks

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
```
