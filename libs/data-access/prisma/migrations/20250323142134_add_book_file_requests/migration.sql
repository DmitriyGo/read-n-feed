-- AlterTable
ALTER TABLE "book_file" ADD COLUMN     "book_request_id" TEXT,
ALTER COLUMN "book_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "book_file" ADD CONSTRAINT "book_file_book_request_id_fkey" FOREIGN KEY ("book_request_id") REFERENCES "book_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
