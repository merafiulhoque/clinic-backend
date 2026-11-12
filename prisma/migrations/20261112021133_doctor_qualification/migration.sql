/*
  Warnings:

  - Made the column `qualification` on table `Doctor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "qualification" SET NOT NULL;
