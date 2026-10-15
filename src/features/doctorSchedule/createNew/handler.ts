import { Request, Response } from "express";
import { validateSchema } from "shared/utilities/validateSchema.js";
import { createScheduleSchema } from "../doctorScheduleSchema.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js";

export const createDoctorSchedule = async (
    req: Request,
    res: Response
) => {
    const user = req.user

    if (!user) throw new AppError(
        ERR_UNAUTHORIZED.status, ERR_UNAUTHORIZED.error
    )
    const result = validateSchema(req.body, createScheduleSchema)

    if (!result.success) throw new AppError(
        ERR_INVALID_INPUT.status, ERR_INVALID_INPUT.error
    )
    
}