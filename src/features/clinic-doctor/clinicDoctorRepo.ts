import { prisma } from "shared/clients/prisma.js"
import { assignDoctorToClinicData } from "./schemas.js"

export const assignDoctorToClinic = async (
    data: assignDoctorToClinicData
) => {
    return prisma.doctorClinic.create({
        data: {
            ...data
        }, 
        select : {
            doctor: {
                select: {
                    firstName: true
                }
            },
            clinics: {
                select: {
                    name: true
                }
            }
        }
    })
}