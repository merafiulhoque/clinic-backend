import { Request, Response } from "express";
import { validateSchema } from "shared/utilities/validateSchema.js";
import { createScheduleSchema } from "../schemas.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js";
import { createScheduleService } from "./service.js";

export const createDoctorScheduleHandler = async (
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
    
    const serviceResult = await createScheduleService(result.data, user.id)
    if (!serviceResult.created){
        const conflictDetails = serviceResult.conflicts.map(
            conflict =>
                `${conflict.clinic} (${conflict.location}): ${conflict.startTime}-${conflict.endTime}`
        ).join("; ");
        throw new AppError(409, `schedule conflicts with existing sessions: ${conflictDetails}`);
    }
    
    return res.status(201).send("schedule created successfully")
}