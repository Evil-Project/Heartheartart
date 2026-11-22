# Heartheartart frontend

A Next.js 16 App Router archive. It renders saved cards, serves `GET /v1/cards`, and redirects card clicks through `/go`.

The Docker Compose stack at the repository root serves this app through Caddy and reads the same Postgres `links` table the bot writes. `HEARTHEARTART_RUNTIME=node` selects that Postgres adapter. A Cloudflare Worker build leaves that variable unset and keeps the D1 adapter.

## Local development

```bash
npm install
cp .env.example .env.local
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

`next dev` uses Wrangler's local D1 database. If D1 is unavailable in development, the page renders preview records; production never silently substitutes demo data.

## Interface preferences

The interface follows the visitor's system color scheme on first load and persists an explicit light/dark choice in a cookie. It detects the browser language and supports English, Simplified Chinese, Traditional Chinese, Japanese, Korean, and Spanish. Card content remains in its original language while interface labels, dates, empty states, errors, and accessibility text are localized.

## Card contract

Postgres and D1 both expose the `links` table. The Worker reads it through the `DB` binding. It expects these columns:

```sql
id, link, title, description, author, screenshot, timestamp
```

The included migration creates that schema for a new/local database. The page first tries safe Open Graph/Twitter metadata from the original URL and falls back field-by-field to D1. A stored local snapshot path is converted to `<snapshot base>/<folder>/index.html`.

`GET /v1/cards?limit=50` is the same-origin card collection. The limit is clamped to 1–100 and the response keeps Cloudflare's D1 result shape, including `results` and `meta`. `GET /v1/get_cards` permanently redirects to `/v1/cards`.

## Cloudflare setup

1. Run `npx wrangler d1 list`, then replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.jsonc` with the UUID of the D1 database that already contains `links`.
2. Create the incremental-cache bucket once:

   ```bash
   npx wrangler r2 bucket create heartheartart-opennext-cache
   ```

3. If this is a new D1 database, apply the migration:

   ```bash
   npm run db:migrate:remote
   ```

4. Preview the production Worker locally, then deploy:

   ```bash
   npm run preview
   npm run deploy
   ```

For dashboard/Git deployments, set the project root to `frontend`, the build command to `npm run build:cloudflare`, and the deploy command to `npx opennextjs-cloudflare deploy`.

## Runtime behavior

The archive page queries its database directly. On Cloudflare that is D1. In Compose it is Postgres, selected at build time so the Worker bundle does not include the Postgres driver. Metadata fetches are limited to supported public platform hosts, bounded by time and response size, and cached through OpenNext's R2 incremental cache when deployed as a Worker.

Card clicks go through `/go`. Explicitly unavailable responses (`404`, `410`, `451`), server errors, and network failures redirect to the snapshot; working links and login/rate-limit responses continue to the original site.
