/*
  Warnings:

  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `doctorClinicId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `if` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `updatesAt` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `doctorScheduleId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorClinicId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
DROP COLUMN "doctorClinicId",
DROP COLUMN "if",
DROP COLUMN "updatesAt",
ADD COLUMN     "doctorScheduleId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Appointment_doctorScheduleId_appointmentDate_status_idx" ON "Appointment"("doctorScheduleId", "appointmentDate", "status");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorScheduleId_fkey" FOREIGN KEY ("doctorScheduleId") REFERENCES "DoctorSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
