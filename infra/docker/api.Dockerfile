# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api

# Build shared
RUN pnpm -C packages/shared run build

# Generate Prisma client into node_modules/.prisma (default behavior)
RUN pnpm -C apps/api exec prisma generate

# Build API -> apps/api/dist/index.js
RUN pnpm -C apps/api run build

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy only what we need to run
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist

# ✅ Copy node_modules that already contains generated Prisma client
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build /app/packages/shared/node_modules /app/packages/shared/node_modules

# add prisma schema + migrations to runtime
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts /app/apps/api/prisma.config.ts

# (optional, aber praktisch)
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json


# Also copy minimal manifests (optional, but nice for introspection)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json



EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
