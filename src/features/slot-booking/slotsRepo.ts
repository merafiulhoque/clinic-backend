import { AppointmentStatus, Weekday } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"
import { BookSlotData } from "./schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { APPOINTMENT_DURATION } from "shared/config/const.js"
import { Prisma } from "generated/prisma/client.js"

const weekdays = [
    Weekday.SUNDAY,
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY
]

const getWeekDayFromDate = (date: Date): Weekday => {
    return weekdays[date.getUTCDay()]
}

export const viewAppointments = async (
    doctorClinicId: number,
    date: Date
) => {
    return prisma.doctorSchedule.findMany({
        where: {
            doctorClinicId,
            dayOfWeek: getWeekDayFromDate(date),
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            appointments: {
                where: {
                    appointmentDate: date,
                    status: {
                        in: [
                            AppointmentStatus.CONFIRMED,
                            AppointmentStatus.PENDING,
                        ],
                    },
                },
                select: {
                    endTime: true,
                },
                orderBy: {
                    endTime: "desc",
                },
                take: 1,
            },
        },
        orderBy: {
            startTime: "asc",
        },
    });
};

export const bookSlot = async (data: BookSlotData) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        // Lock schedule to prevent concurrent slot allocation
        const lockedSchedule = await tx.$queryRaw<{ id: number }[]>`
          SELECT id
          FROM "DoctorSchedule"
          WHERE id = ${data.scheduleId}
          FOR UPDATE
        `;

        if (!lockedSchedule.length) {
          throw new AppError(404, "schedule not found");
        }

        // Fetch schedule and latest active appointment
        const slot = await tx.doctorSchedule.findUnique({
          where: {
            id: data.scheduleId,
          },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            appointments: {
              where: {
                appointmentDate: data.appointmentDate,
                status: {
                  in: [
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.PENDING,
                  ],
                },
              },
              select: {
                endTime: true,
              },
              orderBy: {
                endTime: "desc",
              },
              take: 1,
            },
          },
        });

        if (!slot) {
          throw new AppError(404, "schedule not found");
        }

        // Validate schedule day
        if (
          slot.dayOfWeek !==
          getWeekDayFromDate(data.appointmentDate)
        ) {
          throw new AppError(
            400,
            "schedule is not available on this date"
          );
        }

        // Calculate next available time
        const lastAppointmentTime =
          slot.appointments[0]?.endTime ?? null;

        const nextAvailableTime =
          lastAppointmentTime ?? slot.startTime;

        if (
          nextAvailableTime + APPOINTMENT_DURATION >
          slot.endTime + 5
        ) {
          throw new AppError(
            400,
            "no slot available for this session"
          );
        }

        // Create appointment
        const appointment = await tx.appointment.create({
          data: {
            doctorScheduleId: data.scheduleId,
            appointmentDate: data.appointmentDate,
            startTime: nextAvailableTime,
            endTime:
              nextAvailableTime + APPOINTMENT_DURATION,
            patientName: data.patientName,
            patientEmail: data.patientEmail,
            patientPhone: data.patientPhone,
            idempotencyKey: data.idempotencyKey,
          },
          select: {
            id: true,
            doctorScheduleId: true,
            appointmentDate: true,
            startTime: true,
            endTime: true,
            status: true,
            doctorSchedule: {
              select: {
                doctorClinic: {
                  select: {
                    doctor: {
                      select: {
                        firstName: true,
                        middleName: true,
                        lastName: true,
                      },
                    },
                    clinics: {
                      select: {
                        id: true,
                        name: true,
                        location: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return appointment;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );
  } catch (error) {
    // Handle duplicate records
    if (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
    ) {
      const existingAppointment =
        await prisma.appointment.findUnique({
          where: {
            idempotencyKey: data.idempotencyKey,
          },
          select: {
            id: true,
            doctorScheduleId: true,
            appointmentDate: true,
            startTime: true,
            endTime: true,
            status: true,
            doctorSchedule: {
              select: {
                doctorClinic: {
                  select: {
                    doctor: {
                      select: {
                        firstName: true,
                        middleName: true,
                        lastName: true,
                      },
                    },
                    clinics: {
                      select: {
                        id: true,
                        name: true,
                        location: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      if (existingAppointment) {
        // Verify this replay belongs to the same request
        const isSameRequest =
          existingAppointment.doctorScheduleId === data.scheduleId &&
          existingAppointment.appointmentDate.getTime() ===
            new Date(data.appointmentDate).getTime();

        if (isSameRequest) {
          throw new AppError(409, "Already slot booked against this credentials")
        }
      }
    }

    throw error;
  }
};
