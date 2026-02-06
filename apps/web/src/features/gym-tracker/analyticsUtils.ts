import { WorkoutSession } from '@relay/shared';

export const calculate1RM = (weight: number, reps: number) => {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  // Brzycki Formula
  return weight * (36 / (37 - reps));
};

export const getVolume = (workout: WorkoutSession) => {
  return workout.logs.reduce((total, log) => {
    return total + log.sets.reduce((sTotal, s) => s.isCompleted ? sTotal + (s.weight * s.reps) : sTotal, 0);
  }, 0);
};

// Maps exercise names to Muscle Groups for Analytics
export const getMuscleGroup = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bench") || n.includes("chest") || n.includes("fly") || n.includes("dip") || n.includes("brust")) return "Chest";
  if (n.includes("row") || n.includes("pull") || n.includes("lat") || n.includes("deadlift") || n.includes("rücken")) return "Back";
  if (n.includes("squat") || n.includes("leg") || n.includes("calf") || n.includes("quad") || n.includes("bein")) return "Legs";
  if (n.includes("press") || n.includes("lateral") || n.includes("shoulder") || n.includes("schulter") || n.includes("front")) return "Shoulders";
  if (n.includes("curl") || n.includes("tricep") || n.includes("bicep") || n.includes("arm")) return "Arms";
  if (n.includes("crunch") || n.includes("plank") || n.includes("v up") || n.includes("twist") || n.includes("bauch")) return "Core";
  if (n.includes("cycling") || n.includes("running") || n.includes("walking") || n.includes("treadmill")) return "Cardio";
  return "Other";
};

export const getMuscleGroupSplits = (workouts: WorkoutSession[]) => {
  const groups: Record<string, number> = {};
  workouts.forEach(w => {
    w.logs.forEach(log => {
      const g = getMuscleGroup(log.exerciseName);
      groups[g] = (groups[g] || 0) + log.sets.filter(s => s.isCompleted).length;
    });
  });
  return Object.entries(groups)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getConsistency = (history: WorkoutSession[]) => {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - i);
    return d.getTime();
  }).reverse();

  return last7Days.map(ts => ({
    ts,
    active: history.some(w => {
      const wDate = new Date(w.startTime);
      wDate.setHours(0,0,0,0);
      return wDate.getTime() === ts;
    })
  }));
};

export const getAdvancedInsights = (workouts: WorkoutSession[]) => {
  const exStats: Record<string, { sessions: number; sets: number; totalVolume: number; max1RM: number }> = {};

  workouts.forEach(w => {
    w.logs.forEach(log => {
      if (!exStats[log.exerciseName]) {
        exStats[log.exerciseName] = { sessions: 1, sets: 0, totalVolume: 0, max1RM: 0 };
      } else {
        exStats[log.exerciseName].sessions += 1;
      }

      log.sets.forEach(s => {
        if (!s.isCompleted) return;
        const vol = (s.weight || 0) * (s.reps || 0);
        const oneRM = calculate1RM(s.weight || 0, s.reps || 0);
        
        exStats[log.exerciseName].sets += 1;
        exStats[log.exerciseName].totalVolume += vol;
        if (oneRM > exStats[log.exerciseName].max1RM) {
          exStats[log.exerciseName].max1RM = oneRM;
        }
      });
    });
  });

  const sortedBySessions = Object.entries(exStats).sort((a, b) => b[1].sessions - a[1].sessions);
  const sortedByVolume = Object.entries(exStats).sort((a, b) => b[1].totalVolume - a[1].totalVolume);
  const sortedByStrength = Object.entries(exStats).sort((a, b) => b[1].max1RM - a[1].max1RM);

  return {
    favorite: sortedBySessions[0] ? { name: sortedBySessions[0][0], count: sortedBySessions[0][1].sessions } : null,
    workhorse: sortedByVolume[0] ? { name: sortedByVolume[0][0], volume: sortedByVolume[0][1].totalVolume } : null,
    strongest: sortedByStrength[0] ? { name: sortedByStrength[0][0], oneRM: sortedByStrength[0][1].max1RM } : null,
    allStats: exStats
  };
};