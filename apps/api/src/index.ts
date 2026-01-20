import express from 'express';
import { PrismaClient } from '@prisma/client';
import pkgPg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import authRoutes from './auth.js';
import cors from 'cors';


const { Pool } = pkgPg;

const app = express();
app.use(cors()); // Allow all for testing
app.use(express.json());

const connectionString = process.env.DATABASE_URL;

// 1. Setup the Pool with a slight delay/retry logic internal to pg
const pool = new Pool({ 
  connectionString,
  max: 10,
  connectionTimeoutMillis: 5000, // Wait 5s for DB to wake up
});

// 2. Wrap the adapter and client
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// 3. Test the connection on startup
pool.query('SELECT 1')
  .then(() => console.log('✅ Postgres is reachable via Pool'))
  .catch((err) => console.error('❌ Postgres reachability error:', err.message));

/*
app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    });
    res.json(user);
  } catch (err: any) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Relay API listening on 0.0.0.0:3000');
});
*/


// Mount the auth routes under /api/auth
app.use('/api/auth', authRoutes);

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 API Ready at http://localhost:3000');
});