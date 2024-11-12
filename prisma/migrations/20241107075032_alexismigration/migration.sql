/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `DocumentPage` table. All the data in the column will be lost.
  - Added the required column `documentId` to the `DocumentPage` table without a default value. This is not possible if the table is not empty.
  - Made the column `workspaceId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DocumentPreprocessStatus" AS ENUM ('DRAFT', 'PREPROCESSING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "DocumentPage" DROP CONSTRAINT "DocumentPage_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "preprocessStatus" "DocumentPreprocessStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "DocumentPage" DROP COLUMN "imageUrl",
ADD COLUMN     "documentId" TEXT NOT NULL,
ADD COLUMN     "imagePath" TEXT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "DocumentPage_documentId_idx" ON "DocumentPage"("documentId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPage" ADD CONSTRAINT "DocumentPage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
