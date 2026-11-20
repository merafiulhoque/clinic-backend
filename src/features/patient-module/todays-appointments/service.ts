import { getUserRole } from "shared/repository/sharedRepo.js"
import { AppointmentView, viewAppointmentFilterType } from "../schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { viewAppointments } from "../pmRepo.js"
import { AppointmentStatus, Role } from "generated/prisma/enums.js"
import { formatDoctorName } from "shared/utilities/formatDoctorName.js"
import { redisKeyForViewAppointments } from "shared/config/const.js"
import { redis } from "shared/clients/redis.js"

export const viewAppointmentService = async (
  filter: viewAppointmentFilterType,
  userId: number,
  clinicId: number
) => {
  const userRole = await getUserRole(clinicId, userId)
  if (!userRole) throw new AppError(400, "bad request")

  const allowedRoles: Role[] = [
    Role.MANAGER,
    Role.OWNER,
    Role.RECEPTIONIST,
  ];

  if (!allowedRoles.includes(userRole.role)) {
    throw new AppError(403, `Does not have permission: role: ${userRole.role}`);
  }

  const redistEntry = await redis.get(redisKeyForViewAppointments(clinicId, filter.page))

  if (!redistEntry) {
    const appointments =  normalize(await viewAppointments(clinicId, filter))
    await redis.set(
      redisKeyForViewAppointments(clinicId, filter.page),
      JSON.stringify(appointments),
      {
        expiration: {
          type: "EX",
          value: 5*60 //5minute
        }
      }
    )
    return appointments
  }
  const appointments = await JSON.parse(redistEntry)
  return appointments
}

const normalize = (data:  {
   id: number;
   patientName: string;
   appointmentDate: Date;
   startTime: number;
   status: AppointmentStatus;
   doctorSchedule: {
       doctorClinic: {
           doctor: {
               firstName: string;
               middleName: string | null;
               lastName: string | null;
           };
       };
   };
   }[]): AppointmentView[] => {
  return data.map(appointment => ({
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.startTime,
    appointmentStatus: appointment.status,
    doctorName: formatDoctorName(appointment.doctorSchedule.doctorClinic.doctor)
  }))
}
