import { redis } from "shared/clients/redis.js";
import { viewDoctors } from "../publicDoctorSearchRepo.js";
import { rawDoctorsList, PublicDoctorSearchData, normalizedDoctorList } from "../schemas.js";
import { redisKeyDocPub } from "shared/config/const.js";

export const viewDoctorsService = async (
    searchData: PublicDoctorSearchData
) => {
    const hasFilters = Boolean(
        searchData.doctorName ||
        searchData.location ||
        searchData.clinicName ||
        searchData.specialization
    );

    // 1. Skip cache for filtered queries
    if (hasFilters) {
        const rawList = await viewDoctors(searchData);
        return normalizeDoctorsList(rawList);
    }

    // 2. Cache only unfiltered paginated results (include limit too)
    const cacheKey = `${redisKeyDocPub(searchData.page)}:${searchData.limit}`;
    const redisEntry = await redis.get(cacheKey);

    if (redisEntry) {
        return JSON.parse(redisEntry);
    }

    const rawList = await viewDoctors(searchData);
    const doctorList = normalizeDoctorsList(rawList);

    await redis.set(cacheKey, JSON.stringify(doctorList), {
        expiration: {
            type: "EX",
            value: 5 * 60, // 5 minutes
        },
    });

    return doctorList;
};


const normalizeDoctorsList = (data: rawDoctorsList[]): normalizedDoctorList[] => {
    return data.map(raw => ({
        doctorId: raw.id,
        doctorName: [
                  raw.firstName,
                  raw.middleName,
                  raw.lastName
                ].filter(Boolean).join(" "),
        doctorQualification: raw.qualification,
        doctorAdditionalQualification: raw.additionalQualification,
        doctorSpecialization: raw.specialization,
        doctorClinics: raw.doctorClinics.map(clinic => ({
            doctorClinicId: clinic.id,
            clinicId: clinic.clinics.id,
            clinicName: clinic.clinics.name,
            clinicLocation: clinic.clinics.location,
            fees: clinic.fees
        }))
    }))
}
