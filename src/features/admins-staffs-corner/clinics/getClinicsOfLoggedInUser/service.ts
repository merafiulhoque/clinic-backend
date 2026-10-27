import { getClinics } from "../clinicRepo.js"
import { UserClinics } from "../schemas.js"

export const userClinicInfoService = async (
    userId: number
) => {
    return await getClinics(userId)
}