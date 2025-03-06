-- CreateEnum
CREATE TYPE "BookRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "book_request" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "publication_date" TIMESTAMP(3),
    "publisher" TEXT,
    "author_names" JSONB,
    "genre_names" JSONB,
    "tag_labels" JSONB,
    "status" "BookRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "rejected_by" TEXT,
    "resulting_book_id" TEXT,

    CONSTRAINT "book_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_request_user_id_idx" ON "book_request"("user_id");

-- CreateIndex
CREATE INDEX "book_request_status_idx" ON "book_request"("status");

-- AddForeignKey
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_resulting_book_id_fkey" FOREIGN KEY ("resulting_book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
