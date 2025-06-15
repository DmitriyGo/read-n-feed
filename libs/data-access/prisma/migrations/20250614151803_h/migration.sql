-- CreateEnum
CREATE TYPE "BookImageRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "book_image_request" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT,
    "notes" TEXT,
    "status" "BookImageRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "book_image_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_image_request_book_id_idx" ON "book_image_request"("book_id");

-- CreateIndex
CREATE INDEX "book_image_request_user_id_idx" ON "book_image_request"("user_id");

-- CreateIndex
CREATE INDEX "book_image_request_status_idx" ON "book_image_request"("status");

-- AddForeignKey
ALTER TABLE "book_image_request" ADD CONSTRAINT "book_image_request_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_image_request" ADD CONSTRAINT "book_image_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
