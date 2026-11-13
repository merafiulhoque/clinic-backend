import { Role } from "generated/prisma/enums.js"
import { getClinics } from "../clinicRepo.js"
import { UserClinicInfo } from "../schemas.js"


export const userClinicInfoService = async (
    userId: number
) => {
  const userClinics = await getClinics(userId)
  return normalize(userClinics)
}

const normalize = (
    clinics: {
        role: Role;
        clinic: {
            id: number;
            name: string;
            location: string;
        };
    }[]
): UserClinicInfo[] => {
    return clinics.map(c => ({
        role: c.role,
        clinicId: c.clinic.id,
        clinicName: c.clinic.name,
        clinicLocation: c.clinic.location
    }))
}
