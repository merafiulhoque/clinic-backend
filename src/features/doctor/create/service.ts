import { AppError } from "shared/utilities/errorHandler.js";
import { emailExist, isUserAnOwner } from "../../../shared/repository/sharedRepo.js";
import { createDoctorData } from "../doctorSchema.js";
import { hashPassword } from "shared/utilities/bcrypt.js";
import { createDoctor } from "../doctorRepo.js";

export const createDoctorService = async (
    data: createDoctorData,
    userId: number
) => {
    const userAnOwnerOrManager = !!(await isUserAnOwner(userId))
    if(!userAnOwnerOrManager) throw new AppError(
        403,
        "permission denied"
    )

    const existingUser = await emailExist(data.email)
    if (!!existingUser) {

    }

    const hash = await hashPassword(data.password)
    const newDoctorId = await createDoctor({...data, password: hash}, userId)
    return newDoctorId
}