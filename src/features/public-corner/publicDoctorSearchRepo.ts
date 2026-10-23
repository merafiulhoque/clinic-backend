import { prisma } from "shared/clients/prisma.js";
import { PublicDoctorSearchData } from "./schemas.js";

export const viewDoctors = async (
    searchData: PublicDoctorSearchData
) => {
    return prisma.doctor.findMany({
        where: {
            AND: [
            {
                doctorClinics: {
                some: {},
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
            ...(searchData.location
                ? [{
                    doctorClinics: {
                    some: {
                        clinics: {
                        location: { contains: searchData.location, mode: "insensitive" as const },
                        },
                    },
                    },
                }]
                : []),
            ...(searchData.clinicName
                ? [{
                    doctorClinics: {
                    some: {
                        clinics: {
                        name: { contains: searchData.clinicName, mode: "insensitive" as const },
                        },
                    },
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
            select: {
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
}