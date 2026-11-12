import { viewDoctors } from "../publicDoctorSearchRepo.js";
import { rawDoctorsList, PublicDoctorSearchData, normalizedDoctorList } from "../schemas.js";

export const viewDoctorsService = async (
    searchData: PublicDoctorSearchData
) => {
    const rawList = await viewDoctors(searchData)
    return normalizeDoctorsList(rawList)
}


const normalizeDoctorsList = (data: rawDoctorsList[]): normalizedDoctorList[] => {
    return data.map(raw => ({
        doctorId: raw.id,
        doctorName: [raw.firstName.startsWith("Dr") ? "" : "Dr.",
                raw.firstName, raw.middleName,
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
