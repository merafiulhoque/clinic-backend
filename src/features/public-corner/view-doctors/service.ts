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
        id: raw.id,
        name: [raw.firstName.startsWith("Dr") ? "" : "Dr.", 
                raw.firstName, raw.middleName, 
                raw.lastName
                ].filter(Boolean).join(" "),
        qualification: raw.qualification,
        additionalQualification: raw.additionalQualification,
        specialization: raw.specialization,
        clinics: raw.doctorClinics.map(clinic => ({
            clinicId: clinic.clinics.id,
            clinicName: clinic.clinics.name,
            clinicLocation: clinic.clinics.location,
            fees: clinic.fees
        }))
    }))
}