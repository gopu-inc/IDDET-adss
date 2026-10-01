# IDDET Ads

Embedded Shopify merchant workspace for syncing products, drafting ads, and publishing them to IDDET communities.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Shopify runtime env: `SHOPIFY_API_SECRET` (secret) and optionally `SHOPIFY_API_KEY` (the session token audience is used when the key is omitted)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/iddet-ads/src/App.tsx` — embedded merchant UI and Shopify App Bridge token integration
- `artifacts/api-server/src/routes/iddet-ads.ts` — tenant-scoped catalog, IDDET account, community, draft, and publication endpoints
- `artifacts/api-server/src/lib/shopify-auth.ts` — Shopify session JWT verification and offline token exchange
- `lib/db/src/schema/iddet-ads.ts` — PostgreSQL tables with `shopDomain` tenant boundaries
- `lib/api-spec/openapi.yaml` — source of truth for generated clients and Zod validation
- `shopify.app.toml` — Shopify CLI app configuration; replace its client ID and app URL placeholders before `shopify app dev`

## Architecture decisions

- Shopify managed installation and App Bridge session tokens are the only Shopify identity path; there is no manual store-domain login or OAuth callback in the app.
- The server verifies the Shopify session JWT, exchanges it for an offline Admin API token, and never sends Shopify or IDDET access tokens to the browser.
- Every product, IDDET account, community, draft, and activity row is scoped by the authenticated Shopify shop domain.
- IDDET credentials are submitted explicitly to connect a publishing identity; only the resulting remote token is retained server-side.

## Product

Merchants open the embedded app from Shopify Admin, sync the Shopify catalog, connect one or more IDDET accounts, choose IDDET communities, create ad drafts, and publish them through the IDDET API.

## User preferences

The primary authentication path must remain Shopify Dev App managed installation, not a simple local login.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Run the development DB push after changing `lib/db/src/schema/iddet-ads.ts`.
- The local preview intentionally shows a Shopify-session-required state because App Bridge is only available inside the embedded Shopify app.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
