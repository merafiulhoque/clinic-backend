import { Request, Response } from "express";
import { validateSchema } from "shared/utilities/validateSchema.js";
import { createScheduleSchema } from "../doctorScheduleSchema.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js";
import { createScheduleService } from "./service.js";
import { formatTime } from "shared/utilities/formatTime.js";

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
        const logContent = [
            "Doctor Schedule Conflict Report",
            "================================",
            "",
            ...serviceResult.conflicts.map(
            (conflict, index) =>
                `${index + 1}. Clinic: ${conflict.clinic}\n` +
                `   Location: ${conflict.location}\n` +
                `   Existing session: ${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)}`
            ),
        ].join("\n\n");

        res.status(409);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="conflicts_error_log.txt"'
        );

        return res.send(logContent);
    }
    
    return res.status(201).send("schedule created successfully")
}