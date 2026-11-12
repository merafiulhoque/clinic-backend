import { viewAllDoctors } from "../doctorRepo.js"

export const viewAllDoctorsService = async (
  PAGE: number,
  LIMIT: number
) => {
  const doctors = await viewAllDoctors(PAGE, LIMIT)
  return normalize(doctors)
}


const normalize = (
  data: {
      id: number;
      firstName: string;
      middleName: string | null;
      lastName: string | null;
      qualification: string;
  }[]
): {
    doctorId: number,
    doctorName: string,
    doctorQualification: string
   }[] => {
  return data.map(doctor => ({
    doctorId: doctor.id,
    doctorName: [
      doctor.firstName.startsWith("Dr") ? "" : "Dr.",
      doctor.firstName,
      doctor.middleName,
      doctor.lastName
    ].filter(Boolean).join(" "),
    doctorQualification: doctor.qualification
  }))
}
