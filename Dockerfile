# syntax=docker/dockerfile:1

# ---- build stage: install all deps, generate the Prisma client, compile TS ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `npm ci`'s postinstall hook runs `prisma generate`, which never connects to
# the database, but prisma.config.ts still requires DATABASE_URL to be set —
# a placeholder is enough at build time. Must be set (and prisma/ copied)
# before `npm ci` so postinstall succeeds.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- run stage: ship only dist/ plus production dependencies ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# --ignore-scripts: this stage never installs the `prisma` CLI (see below),
# so the postinstall hook (which needs it) can't run here anyway — carrying
# over the already-generated client instead.
RUN npm ci --omit=dev --ignore-scripts

# The `prisma` CLI stays a devDependency (its own tooling drags in vulnerable,
# migration/generation-only transitive deps we don't want in the runtime
# image); carry over the client already generated in the build stage instead
# of regenerating here.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
