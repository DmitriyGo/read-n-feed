-- AlterEnum
ALTER TYPE "BookFormat" ADD VALUE 'AZW3';

-- AlterTable
ALTER TABLE "book_file" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "is_validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mime_type" TEXT;
