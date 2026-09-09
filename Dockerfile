# syntax=docker/dockerfile:1

# ---- build stage: install all deps, generate the Prisma client, compile TS ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
# `prisma generate` never connects to the database, but prisma.config.ts still
# requires DATABASE_URL to be set — a placeholder is enough at build time.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- run stage: ship only dist/ plus production dependencies ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# The `prisma` CLI stays a devDependency (its own tooling drags in vulnerable,
# migration/generation-only transitive deps we don't want in the runtime
# image); carry over the client already generated in the build stage instead
# of regenerating here.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
