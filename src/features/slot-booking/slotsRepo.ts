import { AppointmentStatus, Weekday } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"
import { BookSlotData } from "./schema.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { APPOINTMENT_DURATION } from "shared/config/const.js"

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
    return weekdays[date.getDay()]
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

export const bookSlot = async (
    data: BookSlotData
) => {
    return prisma.$transaction(async tx => {
        const existingAppointment = await tx.appointment.findUnique({
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
            },
        })

        if (existingAppointment) {
            return existingAppointment
        }

        await tx.$queryRaw`
        SELECT id
        FROM "DoctorSchedule"
        WHERE id=${data.scheduleId}
        FOR UPDATE
        `

        const slot = await tx.doctorSchedule.findUnique({
            where: {
                id: data.scheduleId
            },
            select: {
                startTime: true,
                endTime: true,
                appointments: {
                    where: {
                        appointmentDate: data.appointmentDate,
                        status: {
                            in: [
                                AppointmentStatus.CONFIRMED,
                                AppointmentStatus.PENDING
                            ]
                        }
                    },
                    select: {
                        endTime: true,
                    },
                    orderBy: {
                        endTime: "desc"
                    },
                    take: 1
                }
            }
        })

        if(!slot) throw new AppError(404, "schedule not found")
        
        const lastAppointmentTime = slot.appointments[0]?.endTime ?? null
        const nextAvailableTime = lastAppointmentTime ?? slot.startTime

        if (
            nextAvailableTime + APPOINTMENT_DURATION > slot.endTime + 5
        ) throw new AppError(400, "no slot available for this session")
        // book ticket
        // Create appointment using nextAvailableTime as startTime
        const appointment = await tx.appointment.create({
            data: {
                doctorScheduleId: data.scheduleId,
                appointmentDate: data.appointmentDate,
                startTime: nextAvailableTime,
                endTime: nextAvailableTime + APPOINTMENT_DURATION,
                patientName: data.patientName,
                patientEmail: data.patientEmail,
                patientPhone: data.patientPhone,
                idempotencyKey: data.idempotencyKey,
            },
        });

        return appointment;
    })
}