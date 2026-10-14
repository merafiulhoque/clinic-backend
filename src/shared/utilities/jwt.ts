import jwt from "jsonwebtoken"
import { SECRETS } from "shared/config/secret.js"
import { UserClaim } from "shared/types/index.js"
import { AppError } from "./errorHandler.js"

export const signJWT = (
    data: UserClaim,
    secret: string,
    expiryInSeconds: number
) => {
    return jwt.sign(
        data,
        secret,
        {
            algorithm: SECRETS.JWT_SIGNING_METHOD,
            expiresIn: expiryInSeconds*1000,
            issuer: SECRETS.TOKEN_ISSUER,
            subject: SECRETS.TOKEN_SUB
        }
    )
}

export const verifyJWT = (
    token: string,
    secret: string
) => {
    const data = jwt.verify(
        token,
        secret,
        {
            algorithms: [SECRETS.JWT_SIGNING_METHOD]
        }
    )

    if (
        typeof data === "string" ||
        data.iss !== SECRETS.TOKEN_ISSUER ||
        data.sub !== SECRETS.TOKEN_SUB
    ) {
        throw new AppError(401, "unauthorized")
    }

    const payload = {
        id: data.id,
        email: data.email
    }
    return payload as UserClaim
}