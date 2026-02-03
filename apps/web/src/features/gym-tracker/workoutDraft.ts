import type { WorkoutEvent, WorkoutSession } from '@relay/shared';

export type WorkoutDraft = {
  workout: WorkoutSession;
  events: WorkoutEvent[];
  restByExerciseId: Record<string, number>;
  updatedAt: number;
};

const LAST_DRAFT_KEY = 'relay:gym:lastDraftWorkoutId:v1';
const draftKey = (workoutId: string) => `relay:gym:draft:${workoutId}`;

export function setLastDraftWorkoutId(workoutId: string) {
  try {
    localStorage.setItem(LAST_DRAFT_KEY, workoutId);
  } catch {
    // ignore
  }
}

export function getLastDraftWorkoutId(): string | null {
  try {
    return localStorage.getItem(LAST_DRAFT_KEY);
  } catch {
    return null;
  }
}

export function clearLastDraftWorkoutId() {
  try {
    localStorage.removeItem(LAST_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function saveWorkoutDraft(draft: WorkoutDraft) {
  try {
    localStorage.setItem(draftKey(draft.workout.id), JSON.stringify(draft));
    setLastDraftWorkoutId(draft.workout.id);
  } catch {
    // ignore
  }
}

export function loadWorkoutDraft(workoutId: string): WorkoutDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(workoutId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.workout?.id) return null;
    return parsed as WorkoutDraft;
  } catch {
    return null;
  }
}

export function loadLastWorkoutDraft(): WorkoutDraft | null {
  const lastId = getLastDraftWorkoutId();
  if (!lastId) return null;
  return loadWorkoutDraft(lastId);
}

export function clearWorkoutDraft(workoutId: string) {
  try {
    localStorage.removeItem(draftKey(workoutId));
  } catch {
    // ignore
  }
  const last = getLastDraftWorkoutId();
  if (last === workoutId) clearLastDraftWorkoutId();
}
