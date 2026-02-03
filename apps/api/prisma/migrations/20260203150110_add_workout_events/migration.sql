-- CreateTable
CREATE TABLE "WorkoutEvent" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "WorkoutEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutEvent_workoutId_idx" ON "WorkoutEvent"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutEvent_workoutId_at_idx" ON "WorkoutEvent"("workoutId", "at");

-- AddForeignKey
ALTER TABLE "WorkoutEvent" ADD CONSTRAINT "WorkoutEvent_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
