/*
  Warnings:

  - A unique constraint covering the columns `[clinicId,userId]` on the table `ClinicMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClinicMember_clinicId_userId_key" ON "ClinicMember"("clinicId", "userId");
