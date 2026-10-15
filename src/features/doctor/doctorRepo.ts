import { Role } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"
import { createDoctorData } from "./doctorSchema.js"


export const createDoctor = async (
    data: createDoctorData,
    creatorId: number
) => {
    return prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email: data.email,
                passwordHash: data.password
            },
            select: {
                id: true
            }
        })

        const {email, password, ...doctorData} = data
        const newDoctor = await tx.doctor.create({
            data: {
                ...doctorData,
                createdById: creatorId,
                userId: newUser.id
            },
            select: {
                id: true
            }
        })
        return newDoctor.id
    })
}

