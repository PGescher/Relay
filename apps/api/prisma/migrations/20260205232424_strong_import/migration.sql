-- CreateEnum
CREATE TYPE "ExternalProvider" AS ENUM ('STRONG', 'STRAVA', 'GARMIN', 'APPLE_HEALTH', 'GOOGLE_FIT', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentBodyweightKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "bodyweightKg" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "WorkoutGym" ADD COLUMN     "rpeOverall" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutGymSet" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "rir" INTEGER,
ADD COLUMN     "rpe" DOUBLE PRECISION,
ADD COLUMN     "tempo" TEXT;

-- CreateTable
CREATE TABLE "BodyweightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "raw" JSONB,

    CONSTRAINT "BodyweightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExternalLink" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "provider" "ExternalProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" JSONB,

    CONSTRAINT "WorkoutExternalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSensorSample" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "hr" INTEGER,
    "payload" JSONB,

    CONSTRAINT "WorkoutSensorSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BodyweightEntry_userId_at_idx" ON "BodyweightEntry"("userId", "at");

-- CreateIndex
CREATE INDEX "WorkoutExternalLink_workoutId_idx" ON "WorkoutExternalLink"("workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExternalLink_provider_externalId_key" ON "WorkoutExternalLink"("provider", "externalId");

-- CreateIndex
CREATE INDEX "WorkoutSensorSample_workoutId_at_idx" ON "WorkoutSensorSample"("workoutId", "at");

-- AddForeignKey
ALTER TABLE "BodyweightEntry" ADD CONSTRAINT "BodyweightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExternalLink" ADD CONSTRAINT "WorkoutExternalLink_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSensorSample" ADD CONSTRAINT "WorkoutSensorSample_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
