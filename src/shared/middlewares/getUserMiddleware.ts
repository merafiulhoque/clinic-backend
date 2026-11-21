import { Request, Response, NextFunction } from "express";
import cfg from "shared/config/env.js";
import { ERR_BAD_REQUEST, ERR_MALFORMED_TOKEN } from "shared/domainerrors/errors.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { verifyJWT } from "shared/utilities/jwt.js";

export const getUserMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return  res.status(400).send({error: "bad request"})
    }

    const parts = authHeader.split(" ")

    if(
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ){
        return res.status(400).send({error: "malformed token"})
    }

  try {
    const user = await verifyJWT(parts[1], cfg.ACCESS_TOKEN_SECRET!)
    req.accessToken = parts[1]
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
