# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Kopiere die Meta-Daten für das gesamte Workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# 2. Installiere ALLES (inkl. DevDependencies wie TypeScript)
RUN pnpm install --frozen-lockfile

# 3. Kopiere den Code
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# 4. Baue die Kette (Hier knallt es gerade)
RUN pnpm --filter @relay/shared build
RUN pnpm --filter @relay/web build




# ---------- Runtime Stage ----------
FROM nginx:alpine

# nginx default config entfernen
RUN rm /etc/nginx/conf.d/default.conf

# Eigene nginx config
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Gebautes Frontend reinkopieren
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
