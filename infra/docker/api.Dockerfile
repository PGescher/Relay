# ---------- build-stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# 1. Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# 2. Copy package.json files for all relevant workspaces
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# 3. Install ALL dependencies (including devDeps for tsc)
RUN pnpm install --frozen-lockfile --filter @relay/api...

# 4. Copy Prisma schema and generate client
COPY apps/api/prisma apps/api/prisma
RUN pnpm --filter @relay/api exec prisma generate

# 5. Copy source code
COPY apps/api apps/api
COPY packages/shared packages/shared

# 6. Run the build (tsc will be found now)
RUN pnpm --filter @relay/shared build
RUN pnpm -C apps/api run build

# ---------- runtime-stage ----------
# ---------- runtime-stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Kopiere die gebauten Dateien und die package.json
# Wir kopieren jetzt den gesamten dist-Ordner flach in den Workdir
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/package.json ./root-package.json
# Falls du Prisma nutzt:
# COPY --from=build /app/apps/api/prisma ./prisma 

# Installiere nur Production-Deps
RUN pnpm install --prod --ignore-scripts

EXPOSE 3000
# Starte die Datei dort, wo sie jetzt wirklich liegt:
CMD ["node", "dist/index.js"]