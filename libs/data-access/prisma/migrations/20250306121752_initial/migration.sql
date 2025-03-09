-- CreateEnum
CREATE TYPE "BookFormat" AS ENUM ('PDF', 'EPUB', 'FB2', 'MOBI');

-- CreateEnum
CREATE TYPE "BookRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK', 'GITHUB');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM', 'PLUS', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "date_of_death" TIMESTAMP(3),

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_author" (
    "book_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "book_author_pkey" PRIMARY KEY ("book_id","author_id")
);

-- CreateTable
CREATE TABLE "book_comment" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_comment_id" TEXT,

    CONSTRAINT "book_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_file" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "format" "BookFormat" NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_like" (
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_like_pkey" PRIMARY KEY ("user_id","book_id")
);

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

-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "publication_date" TIMESTAMP(3),
    "publisher" TEXT,
    "average_rating" DOUBLE PRECISION,
    "total_likes" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_genre" (
    "book_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "book_genre_pkey" PRIMARY KEY ("book_id","genre_id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "device_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_type" TEXT,
    "ip_address" TEXT,
    "location_metadata" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_tag" (
    "book_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "book_tag_pkey" PRIMARY KEY ("book_id","tag_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" "Provider" NOT NULL DEFAULT 'LOCAL',
    "roles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "preferred_language" TEXT,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscription_expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "author_name_idx" ON "author"("name");

-- CreateIndex
CREATE INDEX "book_comment_book_id_idx" ON "book_comment"("book_id");

-- CreateIndex
CREATE INDEX "book_comment_user_id_idx" ON "book_comment"("user_id");

-- CreateIndex
CREATE INDEX "book_request_user_id_idx" ON "book_request"("user_id");

-- CreateIndex
CREATE INDEX "book_request_status_idx" ON "book_request"("status");

-- CreateIndex
CREATE INDEX "book_title_idx" ON "book"("title");

-- CreateIndex
CREATE UNIQUE INDEX "genre_name_key" ON "genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_user_id_book_id_device_id_key" ON "reading_progress"("user_id", "book_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_label_key" ON "tag"("label");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "book_author" ADD CONSTRAINT "book_author_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_author" ADD CONSTRAINT "book_author_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_request" ADD CONSTRAINT "book_request_resulting_book_id_fkey" FOREIGN KEY ("resulting_book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
