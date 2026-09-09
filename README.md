# btc-investment-api
Bitcoin investment API

## Local development

Day-to-day, run just the infra in Docker and the app on the host for fast hot-reload:

```sh
cp .env.example .env   # first time only
docker compose up -d postgres redis
npm run dev
```

`npm run dev` reads `.env` automatically (via `--env-file-if-exists`) and points at
Postgres/Redis through their published ports (`localhost:5432`, `localhost:6379`
by default — see `.env.example` if you need to override them).

To run the whole stack containerized instead (e.g. to check it works exactly as
an evaluator would run it), use `docker compose up` — this also builds and starts
the `app` service, so don't run it alongside `npm run dev` on the same port.

> A fuller "getting started from a fresh clone" walkthrough (env var reference,
> running tests, troubleshooting) lands with the foundation ticket (#17).
