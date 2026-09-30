-- AlterTable
ALTER TABLE "PetProfile" ADD COLUMN     "isAggressive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "careNotes" TEXT;
