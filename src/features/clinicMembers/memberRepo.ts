import { prisma } from "shared/clients/prisma.js";
import { memberCreateData } from "./memberSchema.js";

export const createMember = async (
    data: memberCreateData,
    userId: number
) => {
    return await prisma.$transaction(async (tx) => {
        const newMembersUserId = await tx.user.create({
            data: {
                email: data.email,
                passwordHash: data.password,
            }, 
            select: {
                id: true
            }
        })

        const newMemberId = await tx.clinicMember.create({
            data: {
                role: data.role,
                clinicId: data.clinicId,
                userId: newMembersUserId.id
            }, 
            select: {
                id: true
            }
        })
        return newMemberId.id
    })
}

export const isClinicOwner = async (
    userId: number,
    clinicId: number
) => {
    return prisma.clinic.findFirst({
        where: {
            ownerId: userId,
            id: clinicId
        },
        select: {
            id: true
        }
    })
}