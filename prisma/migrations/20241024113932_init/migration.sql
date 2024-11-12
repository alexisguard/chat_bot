/*
  Warnings:

  - You are about to drop the column `DocumentAnalyserTaskId` on the `Observation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_DocumentAnalyserTaskId_fkey";

-- AlterTable
ALTER TABLE "Observation" DROP COLUMN "DocumentAnalyserTaskId",
ADD COLUMN     "documentAnalyserTaskId" TEXT;

-- AlterTable
ALTER TABLE "Reference" ADD COLUMN     "observationId" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "language" TEXT;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_documentAnalyserTaskId_fkey" FOREIGN KEY ("documentAnalyserTaskId") REFERENCES "DocumentAnalyserTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
