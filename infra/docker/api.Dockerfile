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
RUN pnpm -C apps/api run build

# ---------- runtime-stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install pnpm in runtime for production pruned install (optional but recommended)
RUN corepack enable

# Copy only what is needed for execution
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Re-install only production dependencies to keep image small
RUN pnpm install --prod --frozen-lockfile --filter @relay/api...

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]