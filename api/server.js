import Fastify from "fastify";
import cors from "@fastify/cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import webpush from "web-push";

const { Pool } = pg;

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- Helpers --------------------
function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "30d" });
}

async function authGuard(req, reply) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return reply.code(401).send({ error: "missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    return reply.code(401).send({ error: "invalid token" });
  }
}

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function isMember(userId, groupId) {
  const r = await pool.query(
    "select 1 from group_members where group_id=$1 and user_id=$2",
    [groupId, userId]
  );
  return !!r.rows[0];
}

// -------------------- DB schema init (MVP) --------------------
await pool.query(`
create table if not exists users (
  id bigserial primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id bigserial primary key,
  name text not null,
  invite_code text unique not null,
  created_by bigint references users(id),
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id bigint references groups(id) on delete cascade,
  user_id bigint references users(id) on delete cascade,
  role text not null default 'member',
  primary key (group_id, user_id)
);

create table if not exists push_subscriptions (
  user_id bigint references users(id) on delete cascade,
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  group_id bigint references groups(id) on delete cascade,
  user_id bigint references users(id) on delete cascade,
  type text not null,
  message text not null,
  created_at timestamptz not null default now()
);
`);

// -------------------- Routes --------------------
app.get("/health", async () => ({ ok: true }));

app.get("/groups/:groupId/feed", { preHandler: authGuard }, async (req, reply) => {
  const userId = Number(req.user.sub);
  const groupId = Number(req.params.groupId);

  if (!(await isMember(userId, groupId))) {
    return reply.code(403).send({ error: "not a member of this group" });
  }

  const r = await pool.query(
    `select e.id, e.type, e.message, e.created_at, u.username
     from events e
     join users u on u.id=e.user_id
     where e.group_id=$1
     order by e.created_at desc
     limit 100`,
    [groupId]
  );

  return { events: r.rows };
});

// Signup: username + password -> JWT
app.post("/signup", async (req, reply) => {
  const { username, password } = req.body || {};
  if (!username || !password || password.length < 6) {
    return reply.code(400).send({ error: "username + password (min 6) required" });
  }
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const r = await pool.query(
      "insert into users(username, password_hash) values ($1,$2) returning id, username",
      [username, password_hash]
    );
    return { token: signToken(r.rows[0]) };
  } catch (e) {
    // likely duplicate username
    return reply.code(409).send({ error: "username already taken" });
  }
});

// Login -> JWT
app.post("/login", async (req, reply) => {
  const { username, password } = req.body || {};
  const r = await pool.query(
    "select id, username, password_hash from users where username=$1",
    [username]
  );
  const user = r.rows[0];
  if (!user) return reply.code(401).send({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return reply.code(401).send({ error: "invalid credentials" });

  return { token: signToken(user) };
});

// Create group -> returns invite code
app.post("/groups", { preHandler: authGuard }, async (req) => {
  const userId = Number(req.user.sub);
  const { name } = req.body || {};
  const invite = makeInviteCode();

  const g = await pool.query(
    "insert into groups(name, invite_code, created_by) values ($1,$2,$3) returning id, name, invite_code",
    [name || "Group", invite, userId]
  );

  await pool.query(
    "insert into group_members(group_id, user_id, role) values ($1,$2,'owner')",
    [g.rows[0].id, userId]
  );

  return g.rows[0];
});

// Join group by invite code
app.post("/groups/join", { preHandler: authGuard }, async (req, reply) => {
  const userId = Number(req.user.sub);
  const { invite_code } = req.body || {};

  const g = await pool.query("select id from groups where invite_code=$1", [invite_code]);
  if (!g.rows[0]) return reply.code(404).send({ error: "group not found" });

  await pool.query(
    "insert into group_members(group_id, user_id) values ($1,$2) on conflict do nothing",
    [g.rows[0].id, userId]
  );

  return { ok: true, group_id: g.rows[0].id };
});

// Store push subscription for this user
app.post("/push/subscribe", { preHandler: authGuard }, async (req) => {
  const userId = Number(req.user.sub);
  const sub = req.body; // { endpoint, keys: { p256dh, auth } }

  await pool.query(
    `insert into push_subscriptions(user_id, endpoint, p256dh, auth)
     values ($1,$2,$3,$4)
     on conflict (endpoint)
     do update set user_id=$1, p256dh=$3, auth=$4, updated_at=now()`,
    [userId, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );

  return { ok: true };
});

// Start workout -> notify group members via web push
app.post("/groups/:groupId/start", { preHandler: authGuard }, async (req, reply) => {
  const userId = Number(req.user.sub);
  const groupId = Number(req.params.groupId);

  if (!(await isMember(userId, groupId))) {
    return reply.code(403).send({ error: "not a member of this group" });
  }

  // Configure push (needs VAPID keys set in env to actually send)
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return reply.code(500).send({ error: "push not configured (missing VAPID keys)" });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // Find all members + their subscriptions
  const members = await pool.query(
    `select u.id, u.username, ps.endpoint, ps.p256dh, ps.auth
     from group_members gm
     join users u on u.id=gm.user_id
     left join push_subscriptions ps on ps.user_id=u.id
     where gm.group_id=$1`,
    [groupId]
  );

  const payload = JSON.stringify({
    title: "Workout started",
    body: `${req.user.username} started a workout 💪`,
    url: "/"
  });

  await pool.query(
    "insert into events(group_id, user_id, type, message) values ($1,$2,$3,$4)",
    [groupId, userId, "workout_start", `${req.user.username} started a workout 💪`]
  );

  await Promise.all(
    members.rows
      .filter((m) => m.endpoint)
      .map((m) =>
        webpush
          .sendNotification(
            { endpoint: m.endpoint, keys: { p256dh: m.p256dh, auth: m.auth } },
            payload
          )
          .catch(() => null)
      )
  );

  return { ok: true, notified: members.rows.filter((m) => m.endpoint).length };
});

app.listen({ port: 3000, host: "0.0.0.0" });