# syntax=docker/dockerfile:1

# ---- build stage: install all deps and compile TypeScript to dist/ ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- run stage: ship only dist/ plus production dependencies ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
