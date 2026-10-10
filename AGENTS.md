# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Branch

This is the **landing** branch: a single Next.js app with the darwin marketing landing page at `/` and the waitlist endpoint. The product (server, database, playground, other routes) lives on `main` and is intentionally not here.

Links on the page to `/login`, `/why` and `/blog` point at routes that only exist on `main`.

## Stack & layout

Next.js 16 (App Router) + React 19 + Tailwind v4, managed with `bun` (`bun@1.3.2` is pinned via `packageManager`). The `@/*` path alias points at the repo root. Zustand for client state, Motion for animation.

- `app/page.tsx` composes the page; `app/layout.tsx` loads fonts and sets the `theme-light` body scope.
- `app/theme.css` holds every color token, including the `.theme-light.landing-dark` dark set; `app/globals.css` imports it.
- `app/api/waitlist/route.ts` is `POST /api/waitlist`; its logic lives in `lib/waitlist/` and the table in `db/waitlist.sql`.
- `components/new-landing/` holds every landing section (hero, problem, how it works, stack and security, CTA, footer) and the navbar waitlist form.
- `components/icons/` is the icon set; `components/logo/DarwinBlockLogo.tsx` is the block "D" logo.
- The light/dark toggle is persisted in `store/landing/useLandingThemeStore.ts`; `LandingThemeGuard` applies it before paint.

## Environment

Waitlist variables are listed in `.env.example`: `DATABASE_URL` (required), `RESEND_API_KEY` and `WAITLIST_FROM_EMAIL` (leave the key empty to skip the confirmation email). Put local values in `.env.local`.

## Commands

```bash
bun install
bun run dev                  # next dev on :4400
bun run build
bun run lint
bun run typecheck
bun run format
bun run format:check
```

There is no test runner configured.

## Pre-push hook

`.husky/pre-push` blocks pushes on `format:check`, `lint`, `typecheck` failing. Run them before pushing. Do not bypass with `--no-verify`.

## Conventions

Optimize every change for the next reader: the simplest thing that works, named so its intent is obvious.

- **No comments** — do not write code comments. Names carry the intent; if a line needs explaining, rename or restructure it instead.
- **Colors** — every color is a theme token from `app/theme.css` or a Tailwind palette class. Never raw hex.
- **Icons** — import icons from `@/components/icons`, never `react-icons` directly. Reuse the glyph already used for a concept (status icons come from `KanbanBoard.COLUMNS`).
- **Naming** — pick meaningful, self-explanatory names for variables, functions, files, and types.
- **React files** — every component file is `PascalCase.tsx`. App Router route files (`page.tsx`, `layout.tsx`, `route.ts`) stay lowercase.
- **Zustand** — one small, single-purpose store per concern under `store/<feature>/use<Feature>Store.ts`.

## Formatting

Prettier (`.prettierrc.json`): 4-space indent, double quotes, semicolons, `trailingComma: "all"`, `printWidth: 100`, LF line endings.
