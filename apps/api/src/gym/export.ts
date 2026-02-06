import { Router } from 'express';
import { prisma } from '../prisma.js'; // Adjust path to your prisma client

const router = Router();

// EXPORT: GET /api/export/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const data = await prisma.workout.findMany({
    where: { userId, module: "GYM" },
    include: {
      gym: {
        include: {
          exercises: { include: { exercise: true, sets: true } }
        }
      }
    }
  });

  // Flatten for CSV download
    const exportRows = data.flatMap(w => 
        w.gym?.exercises.flatMap(ge => 
            ge.sets.map(s => ({
            Date: w.startTime.toISOString(),
            Workout: w.name || "Unnamed Workout", // Provide fallback for optional name
            Exercise: ge.exercise.name,
            Weight: s.weight ?? 0,
            Reps: s.reps ?? 0,
            RPE: s.rpe ?? ""
            }))
        ) ?? [] // Ensure we return an empty array if w.gym is null
    );

  res.json(exportRows);
});

export default router