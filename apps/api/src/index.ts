import express from 'express';
import cors from 'cors';
import pkgPg from 'pg';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


import authRoutes from './auth.js';

const { Pool } = pkgPg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 API Ready at http://localhost:3000');
});
