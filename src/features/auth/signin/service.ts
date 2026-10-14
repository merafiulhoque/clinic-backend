import { AppError } from "shared/utilities/errorHandler.js";
import { getUserByEmail } from "../authRepo.js";
import { userSigninData } from "../schema.js";
import { ERR_INVALID_CREDENTIALS } from "shared/domainerrors/errors.js";
import { verifyPassword } from "shared/utilities/bcrypt.js";
import { signJWT } from "shared/utilities/jwt.js";
import cfg from "shared/config/env.js";

export const signinService = async (
    data: userSigninData
) => {
    const user = await getUserByEmail(data.email)
    if (!user) {
        throw new AppError(ERR_INVALID_CREDENTIALS.status, ERR_INVALID_CREDENTIALS.error)
    }
    const passOk = await verifyPassword(data.password, user.passwordHash)
    if (!passOk) throw new AppError(ERR_INVALID_CREDENTIALS.status, ERR_INVALID_CREDENTIALS.error)
    
    const accessToken = signJWT({
        id: user.id,
        email: data.email
    }, cfg.ACCESS_TOKEN_SECRET!, 3600)

    const refreshToken = signJWT({
        id: user.id,
        email: data.email
    }, cfg.REFRESH_TOKEN_SECRET!, 3600*24*7)

    return {accessToken, refreshToken}
}