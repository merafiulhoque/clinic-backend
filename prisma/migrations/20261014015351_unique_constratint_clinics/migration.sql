/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name,location]` on the table `Clinic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clinic_ownerId_name_location_key" ON "Clinic"("ownerId", "name", "location");
