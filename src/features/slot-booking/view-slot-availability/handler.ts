import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { viewSlotSchema } from "../schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { viewSlotService } from "./service.js"

export const viewSlotHandler = async (
    req: Request,
    res: Response
) => {
    const { doctorClinicId } = req.params
    const { date } = req.query

    const result = validateSchema({doctorClinicId, date}, viewSlotSchema)
    if(!result.success) throw new AppError(400, "bad request")

    const serviceResponse = await viewSlotService(result.data.doctorClinicId, result.data.date)
    return res.status(200).send(serviceResponse)
}