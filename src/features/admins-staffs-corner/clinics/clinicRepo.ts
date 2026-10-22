import { prisma } from "shared/clients/prisma.js"
import { clinicCreateData } from "./clinicSchema.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { Role } from "generated/prisma/enums.js"

export const doesClinicExists = async (
    data: clinicCreateData,
    userId: number
) => {
    return prisma.clinic.findFirst({
        where: {
            ownerId: userId,
            name: data.name,
            location: data.location
        }, 
        select: {
            id: true
        }
    })
}

export const createClinic = async (
    data: clinicCreateData,
    userId: number
) => {
    return await prisma.$transaction(async (tx) => {
        const existingClinics = await tx.clinic.findUnique({
            where: {
                ownerId_name_location: {
                    ownerId: userId,
                    name: data.name,
                    location: data.location
                }
            },
            select: {
                name: true,
                location: true
            }
        })

        if (!!existingClinics) {
            throw new AppError(
                409,
                `Clinic Name '${existingClinics.name}' for location '${existingClinics.location}' already in use`
            )
        }
        const newClinic = await tx.clinic.create({
            data: {
                ownerId: userId,
                name: data.name,
                location: data.location
            },
            select: {
                id: true,
                name: true
            }
        })

        await tx.clinicMember.create({
            data: {
                role: Role.OWNER,
                clinicId: newClinic.id,
                userId: userId
            },
            select: {id: true}
        })
        return newClinic.name
    })
    
}

export const getClinics = async (
    userId: number
) => {
    return prisma.clinicMember.findMany({
        where: {
            userId: userId
        },
        select: {
            role: true,
            clinic:{
                select: {
                    id: true,
                    name: true,
                    location: true
                }
            }
        }
    })
}