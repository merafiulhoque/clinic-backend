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

export const getAssignedDoctors = async  ( // we need id of doctorClinic and doctors names where ownerid is the logged in owner
    ownerId: number,
    clinicId: number,
) => {
  return prisma.clinic.findMany({
    where: {
       ownerId
    },
    select: {
      id: true,
      doctorClinic: {
        select: {
          id: true,
          doctor: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true
            }
          }
        },

      },

    }
   })
}


export const importAddedDoctors = async (
  ownerId: number
) => {
  const doctors = await prisma.doctor.findMany({
    where: {
      doctorClinics: {
        some: {
          clinics: {
            ownerId
          }
        }
      },
    },
    select: {
      
    }
  })
}
