# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Chinese Kinship Title Atlas (中华宗亲称谓图谱) — a full-stack React + Hono/tRPC app with 334+ kinship relation records stored in MySQL.

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Web (frontend + backend) | `npm run dev` | 3000 | Vite serves React frontend + Hono/tRPC API via `@hono/vite-dev-server` |
| MySQL | `sudo mysqld --user=mysql --daemonize` | 3306 | Must be running before dev server starts |

### Key Commands

- **Dev server:** `npm run dev` (serves both frontend and API on port 3000)
- **Lint:** `npm run lint` (ESLint 9, pre-existing warnings in UI components)
- **Type check:** `npm run check` (tsc -b)
- **Tests:** `npm run test` (Vitest — no test files exist yet, configured for `api/**/*.test.ts`)
- **DB push:** `npm run db:push` (Drizzle Kit push schema to MySQL)
- **DB seed:** `npx tsx db/seed.ts` (seeds 334 kinship relations; process hangs after completion — kill manually)
- **Format:** `npm run format` (Prettier)

### MySQL Setup (required for API)

MySQL must be running before starting the dev server. If MySQL is not running:

```bash
sudo mkdir -p /var/run/mysqld && sudo chown mysql:mysql /var/run/mysqld
sudo chmod 755 /var/run/mysqld
sudo mysqld --user=mysql --daemonize
```

Database credentials (local dev):
- User: `devuser` / Password: `devpass`
- Database: `zongqin_atlas`
- `DATABASE_URL=mysql://devuser:devpass@localhost:3306/zongqin_atlas`

### Environment Variables

The `.env` file is required. In dev mode, env vars fall back to empty strings (only strictly required in production). The `DATABASE_URL` is the critical one for functionality.

See `.env.example` for the full list. Kimi OAuth variables are only needed for auth features (app works for browsing without them).

### Gotchas

- The `db/seed.ts` script does not exit after completion (the MySQL connection stays open). Kill the process manually after seeing "Seeded 334 relations successfully!".
- The `/var/run/mysqld/` directory needs `chmod 755` for non-root MySQL client access.
- Lint has 13 pre-existing errors (mostly `react-refresh/only-export-components` and React hooks warnings in shadcn/ui components). These are not regressions.
- The miniapp (`/workspace/miniapp/`) is an independent uni-app/Vue 3 project that uses local JSON data and does not depend on the web backend or MySQL.
