/*
  Warnings:

  - Made the column `name` on table `ClinicMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClinicMember" ALTER COLUMN "name" SET NOT NULL;
