/*
  Warnings:

  - A unique constraint covering the columns `[appointmentDate,doctorScheduleId,patientPhone]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentDate_doctorScheduleId_patientPhone_key" ON "Appointment"("appointmentDate", "doctorScheduleId", "patientPhone");
