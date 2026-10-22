import { Role } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"

export const isUserAnOwner = async (
    userId: number
) => {
    return prisma.clinicMember.findFirst({
        where: {
            userId,
            role: Role.OWNER
        },
        select: {
            id: true,
            clinicId: true 
        }
    })
}

export const emailExist = async (
    email: string
) => {
    return prisma.user.findUnique({
        where: {email},
        select: {id: true}
    })
}

export const getOwnerId = async (
    clinicId: number
) => {
    return prisma.clinic.findUnique({
        where: {
            id: clinicId
        },
        select: {
            ownerId: true
        }
    })
}