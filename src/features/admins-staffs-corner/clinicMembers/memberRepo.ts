import { prisma } from "shared/clients/prisma.js";
import { memberCreateData } from "./schemas.js";
import { tr } from "zod/v4/locales";

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
                userId: newMembersUserId.id,
                name: data.name
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

export const viewClinicMembers = async (
  ownerId: number,
  clinicId: number
) => {
  return prisma.clinic.findFirst({
    where: {
      ownerId: ownerId,
      id: clinicId
    },
    select: {
      clinicMembers: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })
}
