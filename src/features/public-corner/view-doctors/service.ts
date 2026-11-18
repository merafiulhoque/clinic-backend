import { redis } from "shared/clients/redis.js";
import { viewDoctors } from "../publicDoctorSearchRepo.js";
import { rawDoctorsList, PublicDoctorSearchData, normalizedDoctorList } from "../schemas.js";
import { redisKeyDocPub } from "shared/config/const.js";

export const viewDoctorsService = async (
    searchData: PublicDoctorSearchData
) => {

  const redisEntry = await redis.get(redisKeyDocPub(searchData.page))
  if (!redisEntry) {
    const rawList = await viewDoctors(searchData)
    const doctorList = normalizeDoctorsList(rawList)

    await redis.set(
      redisKeyDocPub(searchData.page),
      JSON.stringify(doctorList),
      {
        expiration: {
          type: "EX",
          value: 10*60 // 10 minutes
        }
      }
    )
    return doctorList
  }

  const doctorsList = await JSON.parse(redisEntry)
  return doctorsList
}


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
