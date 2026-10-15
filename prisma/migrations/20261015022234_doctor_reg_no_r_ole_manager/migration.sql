/*
  Warnings:

  - Added the required column `registrationNo` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "registrationNo" TEXT NOT NULL;
