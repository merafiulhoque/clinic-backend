import { prisma } from "shared/clients/prisma.js";
import { PublicDoctorSearchData } from "./schemas.js";

export const viewDoctors = async (
    searchData: PublicDoctorSearchData
) => {
    // Single combined filter so schedule, location, and clinicName match the SAME clinic
    const doctorClinicFilter = {
        doctorSchedule: {
            some: {},
        },
        ...(searchData.location || searchData.clinicName
            ? {
                clinics: {
                    ...(searchData.location
                        ? { location: { contains: searchData.location, mode: "insensitive" as const } }
                        : {}),
                    ...(searchData.clinicName
                        ? { name: { contains: searchData.clinicName, mode: "insensitive" as const } }
                        : {}),
                },
            }
            : {}),
    };

    return prisma.doctor.findMany({
        where: {
            AND: [
                {
                    doctorClinics: {
                        some: doctorClinicFilter,
                    },
                },
                ...(searchData.doctorName
                    ? [{
                        OR: [
                            { firstName: { contains: searchData.doctorName, mode: "insensitive" as const } },
                            { lastName: { contains: searchData.doctorName, mode: "insensitive" as const } },
                            { middleName: { contains: searchData.doctorName, mode: "insensitive" as const } },
                        ],
                    }]
                    : []),
                ...(searchData.specialization
                    ? [{
                        specialization: {
                            contains: searchData.specialization,
                            mode: "insensitive" as const,
                        },
                    }]
                    : []),
            ],
        },
        select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            qualification: true,
            additionalQualification: true,
            specialization: true,
            doctorClinics: {
                where: doctorClinicFilter,
                select: {
                    id: true,
                    fees: true,
                    clinics: {
                        select: {
                            id: true,
                            name: true,
                            location: true,
                        },
                    },
                },
            },
        },
        skip: (searchData.page - 1) * searchData.limit,
        take: searchData.limit,
        orderBy: { id: "asc" },
    });
};



export const viewSchedule = async (
    doctorClinicId: number
) => {
    return prisma.doctorSchedule.findMany({
        where: {
            doctorClinicId
        }
    })
}
