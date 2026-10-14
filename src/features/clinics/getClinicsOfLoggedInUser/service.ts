import { getClinics } from "../clinicRepo.js"
import { UserClinics } from "../clinicSchema.js"

export const userClinicInfoService = async (
    userId: number
) => {
    return await getClinics(userId)
}