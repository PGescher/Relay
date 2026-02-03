import express from 'express';
import { z } from 'zod';
import { prisma } from './index.js';
import { requireAuth, type AuthedRequest } from './authMiddleware.js';

const router = express.Router();

const CompleteGymWorkoutSchema = z.object({
  workout: z.object({
    id: z.string(),
    module: z.string(),
    status: z.literal('completed'),
    startTime: z.number(),
    endTime: z.number(),
    durationSec: z.number().optional(),
    totalVolume: z.number().optional(),
    templateIdUsed: z.string().nullable().optional(),
    notes: z.string().optional(),
    logs: z.array(
      z.object({
        exerciseId: z.string(),
        exerciseName: z.string(),
        restSecDefault: z.number().optional(),
        notes: z.string().optional(),
        sets: z.array(
          z.object({
            id: z.string(),
            reps: z.number(),
            weight: z.number(),
            isCompleted: z.boolean(),
            completedAt: z.number().optional(),
            startedEditingAt: z.number().optional(),
            restPlannedSec: z.number().optional(),
            restActualSec: z.number().optional(),
            rpe: z.number().optional(),
            durationSec: z.number().optional(),
          })
        ),
      })
    ),
  }),
  events: z.array(
    z.object({
      id: z.string(),
      workoutId: z.string(),
      at: z.number(),
      type: z.string(),
      payload: z.record(z.string(), z.any()).optional(),
    })
  ),
  restByExerciseId: z.record(z.string(), z.number()).optional(),
});

router.post('/gym/complete', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CompleteGymWorkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { workout, events, restByExerciseId } = parsed.data;
  if (!req.userId) return res.status(401).json({ error: 'No userId' });

  if (events.some((e) => e.workoutId !== workout.id)) {
    return res.status(400).json({ error: 'Event workoutId mismatch' });
  }

  try {
    const saved = await prisma.workout.upsert({
      where: { id: workout.id },
      update: {
        userId: req.userId,
        module: workout.module,
        status: 'COMPLETED',
        startTime: new Date(workout.startTime),
        endTime: new Date(workout.endTime),
        data: {
          ...workout,
          restByExerciseId: restByExerciseId ?? {},
          storedAt: Date.now(),
        },
      },
      create: {
        id: workout.id,
        userId: req.userId,
        module: workout.module,
        status: 'COMPLETED',
        startTime: new Date(workout.startTime),
        endTime: new Date(workout.endTime),
        data: {
          ...workout,
          restByExerciseId: restByExerciseId ?? {},
          storedAt: Date.now(),
        },
      },
    });

    // requires model WorkoutEvent + migration + generate
    await prisma.workoutEvent.createMany({
      data: events.map((e) => ({
        id: e.id,
        workoutId: workout.id,
        at: new Date(e.at),
        type: e.type,
        payload: e.payload ?? undefined,
      })),
      skipDuplicates: true,
    });

    return res.json({ ok: true, workoutId: saved.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to store workout' });
  }
});

export default router;
