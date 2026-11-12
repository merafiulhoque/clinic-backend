
import { prisma } from "shared/clients/prisma.js"
import {  createDoctorData } from "./schemas.js"


export const createDoctor = async (
    data: createDoctorData,
    creatorId: number
) => {
  return prisma.$transaction(async (tx) => {

    let existingUserId = await prisma.user.findUnique({
      where: {
        email: data.email
      },
      select: {
        id: true
      }
    })

    if (!existingUserId) {
      existingUserId = await tx.user.create({
          data: {
              email: data.email,
              passwordHash: data.password
          },
          select: {
              id: true
          }
      })
    }


        const {email, password, ...doctorData} = data
        const newDoctor = await tx.doctor.create({
            data: {
                ...doctorData,
                createdById: creatorId,
                userId: existingUserId.id
            },
            select: {
                id: true
            }
        })
        return newDoctor.id
    })
}

export const getDoctorsList = async (
    ownerId: number
) => {
    return prisma.doctor.findMany({
      where: {
        OR: [
          {
            createdById: ownerId
          },
          {
            doctorClinics: {
              some: {
                clinics: {
                  ownerId: ownerId
                }
              }
            }
          }
        ]
      },
        select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            doctorClinics: {
              where: {
                clinics: {
                    ownerId: ownerId
                  }
                },
                select: {
                    clinicId: true,
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


export const viewAllDoctors = async (
  PAGE: number,
  LIMIT: number
) => {
  return prisma.doctor.findMany({
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      qualification: true,
    },
    take: LIMIT,
    skip: (PAGE-1)*LIMIT
  })
}
