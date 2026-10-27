import { createHash } from "node:crypto"
import jwt from "jsonwebtoken"
import { SECRETS } from "shared/config/secret.js"
import { UserClaim } from "shared/types/index.js"
import { AppError } from "./errorHandler.js"
import { redis } from "shared/clients/redis.js"

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
            expiresIn: expiryInSeconds,
            issuer: SECRETS.TOKEN_ISSUER,
            subject: SECRETS.TOKEN_SUB
        }
    )
}

const getRevokedTokenKey = (token: string) => {
    const tokenHash = createHash("sha256").update(token).digest("hex")
    return `revoked-token:${tokenHash}`
}

export const verifyJWT = async (
    token: string,
    secret: string
) : Promise<UserClaim> => {
    let data: jwt.JwtPayload | string
    try {
        data = jwt.verify(
            token,
            secret,
            {
                algorithms: [SECRETS.JWT_SIGNING_METHOD]
            }
        )
    } catch {
        throw new AppError(401, "unauthorized")
    }

    if (
        typeof data === "string" ||
        data.iss !== SECRETS.TOKEN_ISSUER ||
        data.sub !== SECRETS.TOKEN_SUB ||
        typeof data.id !== "number" ||
        !Number.isSafeInteger(data.id) ||
        typeof data.email !== "string"
    ) {
        throw new AppError(401, "unauthorized")
    }

    if (await redis.get(getRevokedTokenKey(token))) {
        throw new AppError(401, "unauthorized")
    }

    return {
        id: data.id,
        email: data.email
    }
}

export const revokeJWT = async (
    token: string,
    secret: string
) => {
    await verifyJWT(token, secret)
    const data = jwt.decode(token)
    if (!data || typeof data === "string" || typeof data.exp !== "number") {
        throw new AppError(401, "unauthorized")
    }

    const ttlInSeconds = data.exp - Math.floor(Date.now() / 1000)
    if (ttlInSeconds <= 0) {
        throw new AppError(401, "unauthorized")
    }

    await redis.set(getRevokedTokenKey(token), "1", { EX: ttlInSeconds })
}