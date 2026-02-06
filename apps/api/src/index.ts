import express from 'express';
import cors from 'cors';

import { prisma } from './prisma.js';

import authRoutes from './auth.js';
import workoutRoutes from './workouts.js';
import templateRoutes from './templates.js';
import syncRoutes from './sync.js';
import strongimportRoutes from './gym/import/strongimport.js'; 
import exportRoutes from './gym/export.js'

const app = express();
app.use(cors());
app.use(express.json());

// Increase the limit to 10MB (or higher if you have massive CSVs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/import', strongimportRoutes);
app.use('/api/export', exportRoutes)

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 API Ready at http://localhost:3000');
});
