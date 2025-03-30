/*
  Warnings:

  - Made the column `device_id` on table `reading_progress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "BookFormat" ADD VALUE 'AZW3';

-- AlterTable
ALTER TABLE "book_file" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "is_validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" TEXT;

-- AlterTable
ALTER TABLE "reading_progress" ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "device_id" SET NOT NULL,
ALTER COLUMN "device_id" SET DEFAULT '';
