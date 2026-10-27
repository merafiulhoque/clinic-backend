import { Role } from "generated/prisma/enums.js"
import { prisma } from "shared/clients/prisma.js"

export const isUserAnOwnerOrManager = async (
    userId: number
) => {
    const ownsClinic = await prisma.clinic.findFirst({
        where: {
            ownerId: userId
        },
        select: {
            id: true
        }
    })

    if (ownsClinic) {
        return ownsClinic
    }

    return prisma.clinicMember.findFirst({
        where: {
            userId,
            role: {
                in: [Role.OWNER, Role.MANAGER]
            }
        },
        select: {
            id: true,
            clinicId: true
        }
    })
}

export const isUserAnOwner = async (
    userId: number
) => isUserAnOwnerOrManager(userId)

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