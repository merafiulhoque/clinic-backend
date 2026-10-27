import { Request, Response } from "express";
import { validateSchema } from "shared/utilities/validateSchema.js";
import { createDoctorSchema } from "../schemas.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js";
import { createDoctorService } from "./service.js";

export const createDoctorHandler = async (
    req: Request,
    res: Response
) => {
    
    const user = req.user
    if (!user) throw new AppError(
        ERR_UNAUTHORIZED.status, ERR_UNAUTHORIZED.error
    )
    
    const result = validateSchema(req.body, createDoctorSchema)
    if (!result.success) throw new AppError(
        ERR_INVALID_INPUT.status, ERR_INVALID_INPUT.error
    )
    const newDoctorId = await createDoctorService(result.data, user.id)
    return res.status(201).send(`Doctor Created: ${newDoctorId}`)
}