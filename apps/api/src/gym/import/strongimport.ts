import { Router } from 'express';
import { prisma } from '../../prisma.js'; // Adjust path to your prisma client
import { StrongCSVRowSchema } from '@relay/shared'; 
import { randomUUID } from 'node:crypto'; // Use this for ID generation

import { requireAuth, type AuthedRequest } from '../../authMiddleware.js'; // Adjust paths

const router = Router();

// IMPORT: POST /api/import/strong
router.post('/strong', async (req, res) => {
  const { userId, rows } = req.body;

  try {
    // 1. Group rows by Workout (Date + Name)
    const workoutsMap = new Map<string, any>();

    for (const row of rows) {
      const data = StrongCSVRowSchema.parse(row);
      const key = `${data.Datum}_${data["Workout-Name"]}`;

      if (!workoutsMap.has(key)) {
        workoutsMap.set(key, {
          name: data["Workout-Name"],
          startTime: new Date(data.Datum),
          notes: data["Workout-Notizen"],
          exercises: new Map<string, any[]>(),
        });
      }

      const workout = workoutsMap.get(key);
      const exName = data["Name der Übung"];
      if (!workout.exercises.has(exName)) workout.exercises.set(exName, []);
      workout.exercises.get(exName).push(data);
    }

    // 2. Transactional Database Insert
    await prisma.$transaction(async (tx) => {
        for (const [_, wData] of workoutsMap) {
        const workout = await tx.workout.create({
        data: {
            userId,
            name: wData.name,
            startTime: wData.startTime,
            module: "GYM",
            status: "completed",
            gym: { 
            create: { 
                notes: wData.notes 
            } 
            },
        },
        // This include is vital so 'workout.gym' is available below
        include: { 
            gym: true 
        }
        });

        // Use a type guard or non-null assertion safely
        if (!workout.gym) throw new Error("Failed to create Gym module");
        const gymId = workout.gym.id;

        let exOrder = 0;
        for (const [exName, sets] of wData.exercises) {
        const exercise = await tx.exercise.upsert({
            where: { userId_name: { userId, name: exName } },
            update: {},
            create: {
            id: randomUUID(), // Fix: use randomUUID
            userId,
            name: exName,
            type: "strength",
            }
        });

        const gymEx = await tx.workoutGymExercise.create({
            data: {
            workoutGymId: gymId,
            exerciseId: exercise.id,
            order: exOrder++,
            }
        });

        await tx.workoutGymSet.createMany({
            data: sets.map((s: any, idx: number) => ({
            workoutGymExerciseId: gymEx.id,
            reps: s["Wiederh."],
            weight: s.Gewicht,
            rpe: s.RPE,
            notes: s.Notizen,
            order: idx,
            isCompleted: true,
            completedAt: wData.startTime,
            }))
        });
        }
      }
    });

    res.json({ success: true, message: "Import complete" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to parse or save data" });
  }
});

router.post('/strong-batch', requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!; // Set by requireAuth
  const { workouts } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      for (const w of workouts) {
        if (!w.rows || w.rows.length === 0) continue;
        const firstRow = w.rows[0];
        const startTime = new Date(firstRow.Datum);

        // ✅ REDUNDANCY CHECK: Check if this workout already exists
        const existingWorkout = await tx.workout.findFirst({
        where: {
            userId,
            startTime: startTime,
            module: "GYM",
            deletedAt: null // Only skip if it hasn't been deleted
        }
        });

        if (existingWorkout) {
        console.log(`Skipping duplicate workout: ${firstRow.Datum}`);
        continue; // Skip this workout and move to the next one in the loop
        }

        const workoutId = randomUUID();

        // Helper to parse Strong's number format (0.0 or 0,0)
        const parseNum = (val: any) => {
          if (val === null || val === undefined || val === "" || val === "Ruhezeit") return 0;
          if (typeof val === 'number') return val;
          return parseFloat(String(val).replace(',', '.'));
        };

        // 1. Group rows by exercise
        const exerciseGroups = new Map<string, any[]>();
        for (const row of w.rows) {
          if (row["Reihenfolge festlegen"] === "Ruhezeit") continue;
          if (!exerciseGroups.has(row["Name der Übung"])) exerciseGroups.set(row["Name der Übung"], []);
          exerciseGroups.get(row["Name der Übung"])?.push(row);
        }

        // 2. Prepare the JSON "data" snapshot (to match your existing workout schema)
        const logs = Array.from(exerciseGroups.entries()).map(([exName, sets]) => ({
          exerciseId: `imported_${exName.toLowerCase().replace(/\s+/g, '_')}`,
          exerciseName: exName,
          sets: sets.map((s, idx) => ({
            id: randomUUID(),
            reps: Math.round(parseNum(s["Wiederh."])),
            weight: parseNum(s.Gewicht),
            isCompleted: true,
            completedAt: new Date(s.Datum).getTime(),
          }))
        }));

        // 3. Create the base Workout with the JSON data field
        const workout = await tx.workout.create({
          data: {
            id: workoutId,
            userId,
            name: w.name || "Strong Import",
            module: "GYM",
            status: "COMPLETED",
            startTime: new Date(firstRow.Datum),
            endTime: new Date(firstRow.Datum), // Strong doesn't provide exact end time per row
            data: {
              dataVersion: 1,
              id: workoutId,
              module: "GYM",
              status: "completed",
              startTime: new Date(firstRow.Datum).getTime(),
              endTime: new Date(firstRow.Datum).getTime(),
              notes: firstRow["Workout-Notizen"] || "",
              logs: logs
            },
            gym: { create: { notes: firstRow["Workout-Notizen"] || "" } }
          },
          include: { gym: true }
        });

        // 4. Populate Structured Gym Tables (WorkoutGymExercise & Sets)
        const gymId = workout.gym!.id;
        let exOrder = 0;

        for (const [exName, sets] of exerciseGroups) {
          const exerciseId = `imported_${exName.toLowerCase().replace(/\s+/g, '_')}`;
          
          await tx.exercise.upsert({
            where: { id: exerciseId },
            update: {},
            create: {
              id: exerciseId,
              name: exName,
              userId: null, // Global exercise
              isCustom: false,
            }
          });

          const gymEx = await tx.workoutGymExercise.create({
            data: {
              workoutGymId: gymId,
              exerciseId: exerciseId,
              order: exOrder++,
            }
          });

          await tx.workoutGymSet.createMany({
            data: sets.map((s: any, idx: number) => ({
              workoutGymExerciseId: gymEx.id,
              reps: Math.round(parseNum(s["Wiederh."])),
              weight: parseNum(s.Gewicht),
              rpe: s.RPE ? parseNum(s.RPE) : null,
              notes: s.Notizen || "",
              order: idx,
              isCompleted: true,
              completedAt: new Date(s.Datum),
            }))
          });
        }
      }
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router

