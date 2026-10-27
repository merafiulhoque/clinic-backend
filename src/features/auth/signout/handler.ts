import { Request, Response } from 'express'
import { AppError } from "shared/utilities/errorHandler.js"
import { validateSchema } from "shared/utilities/validateSchema.js"
import cfg from "shared/config/env.js"
import { revokeJWT, verifyJWT } from "shared/utilities/jwt.js"
import { userSignoutSchema } from "../schema.js"


export const signoutHandler = async (
    req: Request,
    res: Response
) => {
    const user = req.user
    const accessToken = req.accessToken
    if (!user || !accessToken) {
        throw new AppError(401, "unauthorized")
    }

    const result = validateSchema(req.body, userSignoutSchema)
    if (!result.success) {
        throw new AppError(400, "refresh token is required")
    }

    const refreshUser = await verifyJWT(result.data.refreshToken, cfg.REFRESH_TOKEN_SECRET!)
    if (refreshUser.id !== user.id) {
        throw new AppError(401, "unauthorized")
    }

    await Promise.all([
        revokeJWT(accessToken, cfg.ACCESS_TOKEN_SECRET!),
        revokeJWT(result.data.refreshToken, cfg.REFRESH_TOKEN_SECRET!)
    ])

    return res.status(200).send("logged out")
}