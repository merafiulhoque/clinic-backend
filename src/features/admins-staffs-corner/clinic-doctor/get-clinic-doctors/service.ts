import {getAssignedDoctors} from "features/admins-staffs-corner/clinic-doctor/clinicDoctorRepo.js";

export const getClinicDoctorsService = async (
    ownerId: number,
    clinicId: number
) => {
    const clinicsWithDoctors = await getAssignedDoctors(ownerId, clinicId)
    return normalize(clinicsWithDoctors)
}

const normalize = (
    clinicsWithDoctors:  {
        id: number;
        doctorClinic: {
            id: number;
            doctor: {
                firstName: string;
                middleName: string | null;
                lastName: string | null;
            };
        }[];
    }[]
)=> {
  return clinicsWithDoctors.map(cAndD => ({
    clinicId: cAndD.id,
    doctorsOfThisClinic: cAndD.doctorClinic.map(doctor => ({
      doctorClinicId: doctor.id,
      doctorName: [
        doctor.doctor.firstName.startsWith("Dr") ? "" : "Dr.",
        doctor.doctor.firstName,
        doctor.doctor.middleName,
        doctor.doctor.lastName
        ].filter(Boolean).join(" ")
      }))
    }))
}
