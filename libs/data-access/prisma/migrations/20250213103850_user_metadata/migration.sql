/*
  Warnings:

  - You are about to drop the column `user_address` on the `session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "user_address",
ADD COLUMN     "device_type" TEXT,
ADD COLUMN     "location_metadata" TEXT,
ADD COLUMN     "user_agent" TEXT;
