import { AppError } from "shared/utilities/errorHandler.js";
import { createUser, emailExists } from "../authRepo.js";
import { userSignupData } from "../schema.js";
import { hashPassword } from "shared/utilities/bcrypt.js";

export const signupService = async (
    data: userSignupData
) => {
    const emailExist = await emailExists(data)
    if (emailExist) {
        throw new AppError(409, "email in use") 
    }

    const hash = await hashPassword(data.password)
    const { id } = await createUser(
        {
            ...data,
            password: hash,
        }
    )
    return id
}