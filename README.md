# btc-investment-api
Bitcoin investment API

## Getting started

```sh
cp .env.example .env        # first time only
docker compose up -d postgres redis
npm install
npm run db:migrate
npm run dev
```

Health check: `curl http://localhost:3000/v1/health`

## Day-to-day

After pulling a commit that added a migration, re-run:

```sh
npm run db:migrate
```

It applies pending migrations and regenerates the Prisma client. Skipping it
shows up as `typecheck`/`build` failing on Prisma types that don't exist yet.

## Running the whole stack in Docker

```sh
docker compose up --build
```

Starts `postgres`, `redis`, and `app` together — useful to check it runs the
way an evaluator would run it. This does **not** apply migrations either; run
`npm run db:migrate` yourself against the published Postgres port first.

## Scripts

| Command                     | What it does                                                |
|------------------------------|--------------------------------------------------------------|
| `npm run dev`                | Hot-reload dev server                                        |
| `npm run build` / `start`    | Compile to `dist/` and run it                                 |
| `npm run typecheck`          | `tsc --noEmit`                                                |
| `npm run db:migrate`         | Apply pending migrations + regenerate Prisma client (dev)     |
| `npm run db:migrate:deploy`  | Apply pending migrations only, no prompts (CI/deploy)          |
| `npm run db:generate`        | Regenerate the Prisma client — needed after `db:migrate:deploy` |

> Full walkthrough (env var reference, tests, troubleshooting) lands with #17.
