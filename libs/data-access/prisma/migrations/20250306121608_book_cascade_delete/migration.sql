-- DropForeignKey
ALTER TABLE "book_author" DROP CONSTRAINT "book_author_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_comment" DROP CONSTRAINT "book_comment_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_comment" DROP CONSTRAINT "book_comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "book_file" DROP CONSTRAINT "book_file_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_genre" DROP CONSTRAINT "book_genre_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_genre" DROP CONSTRAINT "book_genre_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "book_like" DROP CONSTRAINT "book_like_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_like" DROP CONSTRAINT "book_like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "book_tag" DROP CONSTRAINT "book_tag_book_id_fkey";

-- DropForeignKey
ALTER TABLE "book_tag" DROP CONSTRAINT "book_tag_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "reading_progress" DROP CONSTRAINT "reading_progress_book_id_fkey";

-- DropForeignKey
ALTER TABLE "reading_progress" DROP CONSTRAINT "reading_progress_user_id_fkey";

-- AddForeignKey
ALTER TABLE "book_author" ADD CONSTRAINT "book_author_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_comment" ADD CONSTRAINT "book_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_comment" ADD CONSTRAINT "book_comment_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_file" ADD CONSTRAINT "book_file_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_like" ADD CONSTRAINT "book_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_like" ADD CONSTRAINT "book_like_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
