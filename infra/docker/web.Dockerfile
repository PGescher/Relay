# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# 1. Installiere pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Kopiere die Workspace-Konfiguration und Lockfile (WICHTIG!)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 3. Kopiere die package.json Dateien ALLER Pakete (für effizientes Caching)
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 4. Jetzt erst pnpm install
RUN pnpm install --frozen-lockfile

# 5. Kopiere den Quellcode von shared und web
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# 6. Baue erst shared, dann web
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
