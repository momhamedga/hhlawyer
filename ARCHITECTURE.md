# Architecture

## Monorepo structure

```text
apps/
  web/          Next.js public website
  api/          Express API boundary
packages/
  config/       small shared non-secret configuration
  types/        public, DTO-safe TypeScript types
  validation/   Zod input-boundary schemas
  ui/           reserved shared UI package foundation
prisma/         PostgreSQL schema and safe service seed
```

## Responsibilities

`apps/web` owns public rendering, visual components, client-only UI state, and browser-safe code. It must not import Prisma, database credentials, or server secrets.

`apps/api` owns the HTTP API boundary. It validates environment configuration, applies Helmet/CORS/compression/rate limiting, assigns request IDs, and returns stable success/error envelopes. Future booking, contact, authentication, and admin features belong here.

`prisma` owns the database model. Prisma and `DATABASE_URL` stay on server infrastructure. The current schema creates only the foundation for future users, services, consultations, contact messages, and audit logs.

Shared packages expose safe contracts only. They do not expose Prisma internals or environment secrets. `packages/ui` intentionally has no components until a component is introduced deliberately.

## Environment variables

API environment values live in `apps/api/.env` locally and platform secrets in deployment:

| Name | Required | Purpose |
|---|---|---|
| `NODE_ENV` | No | `development`, `test`, or `production`; defaults to development. |
| `PORT` | No | API listen port; defaults to 4000. |
| `WEB_ORIGIN` | Yes in production | Explicit browser origin permitted by CORS. |
| `DATABASE_URL` | Required for Prisma DB commands | PostgreSQL/Neon connection string; never expose it to the web client. |

## Local development and health

Run `pnpm dev:web` and `pnpm dev:api` in separate terminals. The API health endpoint is:

```text
GET http://localhost:4000/api/v1/health
```

It returns an `ok` status, timestamp, and `X-Request-ID`. It never returns environment values, database state, or secrets.

## Security boundaries

- Browser → Web: public UI only.
- Browser/Web → API: API validates future request data; CORS accepts the configured web origin rather than a wildcard.
- API → Prisma → PostgreSQL/Neon: database access is server-only.
- Errors use a public envelope and include request ID; unexpected error internals are logged server-side, not sent to clients.

## Future feature architecture

Future form endpoints must use `packages/validation` on API boundaries, persist through Prisma, enforce rate limiting/anti-spam and consent policies, and return DTO-safe values from `packages/types`. Authentication and administration require a separate threat model, role/permission design, and audit-log policy.
