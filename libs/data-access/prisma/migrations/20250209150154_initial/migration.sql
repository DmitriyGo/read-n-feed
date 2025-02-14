-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK', 'GITHUB');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM', 'PLUS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ReadingFormat" AS ENUM ('PDF', 'EPUB', 'FB2', 'MOBI');

-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "genres" TEXT[],
    "formats" TEXT[],
    "cover_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_address" TEXT,
    "ip_address" TEXT,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_library_entry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_library_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" "Provider" NOT NULL DEFAULT 'LOCAL',
    "roles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "preferredLanguage" TEXT,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscription_expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
