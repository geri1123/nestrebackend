/*
  Warnings:

  - You are about to drop the column `createdAt` on the `admin_user` table. All the data in the column will be lost.
  - Made the column `name` on table `admin_user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "admin_role" AS ENUM ('admin', 'super_admin');

-- AlterTable
ALTER TABLE "admin_user" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "admin_role" NOT NULL DEFAULT 'admin',
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "name" SET NOT NULL;
