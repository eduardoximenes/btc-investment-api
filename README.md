# btc-investment-api
Bitcoin investment API

## Run it (Linux, only Docker required)

```sh
git clone https://github.com/eduardoximenes/btc-investment-api.git
cd btc-investment-api
cp .env.example .env
docker compose up --build
```

Brings up `postgres`, `redis`, and `app` together, each gated on the others'
healthcheck. Once `app` reports healthy:

```sh
curl http://localhost:3000/v1/health
# {"statusCode":200,"message":"ok","data":{"status":"ok","version":"v1"}}
```

`docker compose logs app` shows structured (Pino) logs — every request line
carries a `correlationId`, generated per-request and threaded through
whatever that request touches.

`docker compose down -v` stops everything and removes the Postgres/job-log
volumes.

## Developing locally (hot-reload)

Running the whole stack in Docker rebuilds the image on every change, which
is slow for active development. Instead, run just the infra in Docker and
the app on the host:

```sh
cp .env.example .env   # if you haven't already — npm install needs DATABASE_URL
docker compose up -d postgres redis
npm install
npm run db:migrate     # first time, and again whenever you pull a new migration
npm run dev
```

`npm run dev` loads `.env` automatically and talks to Postgres/Redis through
their published ports (`localhost:5432`/`6379` by default). Don't run this
alongside `docker compose up`'s `app` service — both bind port 3000.

## Running tests

```sh
docker compose up -d postgres redis   # if not already running
npm test
```

HTTP-level tests via supertest against the real app, real Postgres, and
real Redis — no mocking at this layer. `npm run test:watch` re-runs on file
change.

## Environment variables

See `.env.example` for the full list with working defaults. The app
validates all of them at startup (Zod) and refuses to boot with a clear
error naming whatever's missing or malformed — see
`src/server/config/env.ts`.

| Variable | Used for |
|---|---|
| `NODE_ENV` | `production` hides internal error messages from 5xx responses |
| `PORT` / `HOST` | where the app listens |
| `DATABASE_URL` | Postgres connection (Prisma) |
| `REDIS_URL` | Redis connection (cache / refresh tokens / BullMQ, shared) |
| `JWT_SECRET` | signs/verifies access tokens; generate with `openssl rand -hex 32` |
| `POSTGRES_USER` / `PASSWORD` / `DB` | only consumed by `docker-compose.yml`, to provision the `postgres` service |
| `POSTGRES_PORT` / `REDIS_PORT` | optional: override the host ports Docker publishes Postgres/Redis on, if 5432/6379 are already taken locally (update `DATABASE_URL`/`REDIS_URL` to match) |

## Troubleshooting

- **Port already in use** (`5432`/`6379`/`3000`): something else on your
  machine is already listening there. Set `POSTGRES_PORT`/`REDIS_PORT` in
  `.env` (and update `DATABASE_URL`/`REDIS_URL` to match), or `PORT` for the
  app itself, then re-run `docker compose up`.
- **`typecheck`/`build` failing on Prisma types that don't exist yet**: you
  pulled a migration and forgot `npm run db:migrate` — see "Developing
  locally" above.
- **Migrations aren't applied automatically** by `docker compose up`,
  `npm run dev`, or a `git pull` — see `npm run db:migrate` above; nothing
  runs it for you.
- **`npm install` fails with a Prisma config error** (`Cannot resolve
  environment variable: DATABASE_URL`): `npm install` generates the Prisma
  client automatically (a `postinstall` script), which needs `DATABASE_URL`
  set — run `cp .env.example .env` first.

## Scripts

| Command                     | What it does                                                    |
|------------------------------|------------------------------------------------------------------|
| `npm run dev`                | Hot-reload dev server                                            |
| `npm run build` / `start`    | Compile to `dist/` and run it                                    |
| `npm run typecheck`          | `tsc --noEmit`                                                   |
| `npm test` / `test:watch`    | Vitest + supertest, against real Postgres/Redis                 |
| `npm run db:migrate`         | Apply pending migrations + regenerate Prisma client (dev)        |
| `npm run db:migrate:deploy`  | Apply pending migrations only, no prompts (CI/deploy)            |
| `npm run db:generate`        | Regenerate the Prisma client — needed after `db:migrate:deploy`  |
