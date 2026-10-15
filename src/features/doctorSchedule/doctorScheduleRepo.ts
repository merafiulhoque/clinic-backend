import { prisma } from "shared/clients/prisma.js";
import { createScheduleData } from "./doctorScheduleSchema.js";

export const createDoctorSchedule = async (
    data: createScheduleData
) => {
    return prisma.doctorSchedule.create({
        data: {
            ...data
        },
        select: {
            id: true
        }
    })
}

export const doctorsExistingSchedule = async (
    data: createScheduleData
) => {
    return await prisma.doctorSchedule.findMany({
        where: {
            dayOfWeek: data.dayOfWeek,
            startTime: {
                lt: data.endTime
            },
            endTime: {
                gt: data.startTime                
            }
        },
        select: {
            doctorClinic: {
                select: {
                    clinics: {
                        select: {
                            name: true,
                            location: true
                        }
                    }
                }
            }
        }
    })
}