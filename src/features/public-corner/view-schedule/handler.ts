import { Request, Response } from "express"
import { AppError } from "shared/utilities/errorHandler.js"
import { viewScheduleService } from "./service.js"

export const viewScheduleHandler = async (
    req: Request,
    res: Response
) => {
    const { doctorClinicId } = req.params
    if(
        Number.isNaN(doctorClinicId) ||
        typeof doctorClinicId !== "string"
    ) throw new AppError(400, "bad request")

    const schedules = await viewScheduleService(Number(doctorClinicId))
    res.status(200).send(schedules)

}   