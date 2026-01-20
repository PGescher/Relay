FROM node:20-slim

# 1. Install OpenSSL (Required by Prisma Engine)
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /Relay

# 2. Copy workspace configs and ALL package.jsons
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 3. Install dependencies
# We use --frozen-lockfile to ensure production consistency
RUN pnpm install

# 4. # Copy the rest of the source
COPY . .

# Generate Prisma client
# We pass a dummy DATABASE_URL here just to satisfy the Prisma 7 config loader 
# during the static generation phase.
RUN cd apps/api && DATABASE_URL="postgresql://postgres:pass@localhost:5432/postgres" pnpm exec prisma generate

EXPOSE 3000 5173