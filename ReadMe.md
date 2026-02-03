# Structure

web - The Face - React Vite PWA
        It lives in the browser. It doesn't talk to the database; it only talks to the API

Api - The Brain - Node/express Prisma
        It holds the database connection and the business logic

packages shared DNA
        You define your Zod Schemas and Types here ONCE.

infra - the armor?
        Nginx: A "Reverse Proxy" that sits in front of your app to handle traffic.
        Cloudflare Tunnel: The secure "pipe" that connects your local Docker to the internet.
        Scripts: Any .sh files for backing up the database or deploying to a server live here.



If you want to add a new feature (e.g., a "Post" model for a blog), your workflow is now:
    Shared: Add PostSchema to packages/shared.

    API: Add model Post to apps/api/prisma/schema.prisma.

    Sync: Run docker compose exec api ... npx prisma db push.

    Backend: Create a GET /api/posts route in apps/api/src/index.ts.

    Frontend: Use fetch('/api/posts') in apps/web/src/App.tsx.


# Setup

## Step x

docker compose build

docker compose up -d

docker-compose ps

## Initialize the Database (The Prisma "Sync")

docker-compose exec api pnpm exec prisma migrate dev --name init

some force fix:
docker-compose exec api pnpm --filter @relay/api exec prisma migrate dev --name init --url "postgresql://postgres:pass@db:5432/postgres"


# 3. Run the Migration (The Prisma 7 way):
Since Prisma 7 requires the config to find the URL, we pass the environment variable explicitly into the exec command to be 100% sure:

docker-compose exec api /bin/sh -c "DATABASE_URL=postgresql://postgres:pass@db:5432/postgres pnpm --filter @relay/api exec prisma migrate dev --name init"



cd /home/paul/projects/Relay/apps/api
pnpm exec prisma studio


### sdsd

docker compose exec -w /Relay/apps/api api /bin/sh -c "DATABASE_URL=postgresql://postgres:pass@db:5432/postgres npx prisma db push"

curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Paul","email":"paul@relay.dev"}'

docker compose exec db psql -U postgres -d postgres -c "SELECT * FROM \"User\";"

docker compose logs -f api



docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec api sh -lc "BROWSER=none pnpm exec prisma studio --hostname 0.0.0.0 --port 5555"

cd apps/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relay" pnpm exec prisma studio


## Update DB
docker compose exec -w /Relay/apps/api api npx prisma db push



docker compose -f docker-compose.dev.yml exec api sh -lc "pnpm exec prisma migrate dev --name add_workout_templates --schema prisma/schema.prisma"
docker compose -f docker-compose.dev.yml exec api sh -lc "pnpm exec prisma generate --schema prisma/schema.prisma"




docker compose -f docker-compose.dev.yml exec api sh -lc   "cd /app/apps/api && pnpm exec prisma migrate deploy"


docker compose -f docker-compose.prod.yml pull


docker compose -f docker-compose.prod.yml up -d --force-recreate


visu database: docker exec -it relay-api-1 sh -lc \
  'cd /app/apps/api && pnpm exec prisma studio'

Default starts on:
http://localhost:5555

Open from NAS:
ssh -L 5555:localhost:5555 user@your-nas



1️⃣ Export DATABASE_URL (same as docker-compose)

Use the same connection string as your db service:

export DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"


If Postgres is only exposed inside Docker, forward it:

# docker-compose.prod.yml
db:
  ports:
    - "5432:5432"

2️⃣ Start Prisma Studio

From apps/api:

pnpm exec prisma studio


You’ll see:

Prisma Studio is running on http://localhost:5555


Useful if DB is not exposed to localhost.

1️⃣ Exec into API container
docker exec -it relay-api-1 sh

2️⃣ Run Studio and bind all interfaces
pnpm exec prisma studio --hostname 0.0.0.0


Studio now listens on port 5555 inside the container.

3️⃣ Expose the port

In docker-compose.prod.yml:

api:
  ports:
    - "3000:3000"
    - "5555:5555"


Restart:

docker compose -f docker-compose.prod.yml up -d


Now open:
Useful if DB is not exposed to localhost.

1️⃣ Exec into API container
docker exec -it relay-api-1 sh

2️⃣ Run Studio and bind all interfaces
pnpm exec prisma studio --hostname 0.0.0.0


Studio now listens on port 5555 inside the container.

3️⃣ Expose the port

In docker-compose.prod.yml:

api:
  ports:
    - "3000:3000"
    - "5555:5555"


Restart:

docker compose -f docker-compose.prod.yml up -d


Now open:
http://NAS-IP:5555