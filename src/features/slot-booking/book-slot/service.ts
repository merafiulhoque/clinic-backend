
import { redisKeyGetStat } from "shared/config/const.js";
import { BookingReportData, BookSlotData } from "../schemas.js";
import { bookSlot } from "../slotsRepo.js";
import { formatDoctorName } from "shared/utilities/formatDoctorName.js";
import { formatTime } from "shared/utilities/formatTime.js";
import { redis } from "shared/clients/redis.js";
// import { sendWpMessage } from "shared/clients/wp.js";

export const bookSlotService = async (
    data: BookSlotData
) => {
  const bookingData = await bookSlot(data)
  // const whatsappSendData = await sendWpMessage(`${"91"+data.patientPhone}`, normalize(data.patientName, bookingData))
  await redis.del(redisKeyGetStat(bookingData.doctorSchedule.doctorClinic.clinics.id)) // delete when a person books a slot
  
  return bookingData
}




const normalize = (
  patientName: string,
  bookingReport: BookingReportData
) => {
  const refined = {
  patientName,
  doctorName: formatDoctorName({ ...bookingReport.doctorSchedule.doctorClinic.doctor }),
  clinicName: bookingReport.doctorSchedule.doctorClinic.clinics.name,
  clinicLocation: bookingReport.doctorSchedule.doctorClinic.clinics.location,
  appointmentDate: bookingReport.appointmentDate.toLocaleDateString(),
  appointmentTime: formatTime(bookingReport.startTime),
  AppointmentStatus: bookingReport.status
  }

  return `Hey Mr. ${refined.patientName}, the status of your request for appointment for Dr. ${refined.doctorName} on ${refined.appointmentDate} at ${refined.clinicName + ", " + refined.clinicLocation} is ${refined.AppointmentStatus}. Your appointment time is ${refined.appointmentTime}. Please visit before your slot time. Thank you.`
}
