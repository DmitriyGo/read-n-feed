-- CreateTable
CREATE TABLE "book_favorite" (
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_favorite_pkey" PRIMARY KEY ("user_id","book_id")
);

-- AddForeignKey
ALTER TABLE "book_favorite" ADD CONSTRAINT "book_favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_favorite" ADD CONSTRAINT "book_favorite_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
