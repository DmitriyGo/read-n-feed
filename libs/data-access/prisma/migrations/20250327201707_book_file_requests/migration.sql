-- CreateEnum
CREATE TYPE "BookFileRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "book_file_request" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" TEXT,
    "format" TEXT NOT NULL,
    "status" "BookFileRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "book_file_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_file_request_book_id_idx" ON "book_file_request"("book_id");

-- CreateIndex
CREATE INDEX "book_file_request_user_id_idx" ON "book_file_request"("user_id");

-- CreateIndex
CREATE INDEX "book_file_request_status_idx" ON "book_file_request"("status");

-- AddForeignKey
ALTER TABLE "book_file_request" ADD CONSTRAINT "book_file_request_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_file_request" ADD CONSTRAINT "book_file_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_file_request" ADD CONSTRAINT "book_file_request_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "book_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
