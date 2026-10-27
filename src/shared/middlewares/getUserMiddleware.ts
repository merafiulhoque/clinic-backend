import { Request, Response, NextFunction } from "express";
import cfg from "shared/config/env.js";
import { ERR_BAD_REQUEST, ERR_MALFORMED_TOKEN } from "shared/domainerrors/errors.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { verifyJWT } from "shared/utilities/jwt.js";

export const getUserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new AppError(ERR_BAD_REQUEST.status, ERR_BAD_REQUEST.error)
    
    const parts = authHeader.split(" ")

    if(
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ){
        throw new AppError(ERR_MALFORMED_TOKEN.status, ERR_MALFORMED_TOKEN.error)
    }
    return verifyJWT(parts[1], cfg.ACCESS_TOKEN_SECRET!).then((user) => {
        req.accessToken = parts[1]
        req.user = user
        next()
    })
}