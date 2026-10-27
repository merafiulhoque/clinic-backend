import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { bookSlotSchema } from "../schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { bookSlotService } from "./service.js"


export const bookSlotHandler = async (
    req: Request,
    res: Response
) => {
    const result = validateSchema(req.body, bookSlotSchema)
    if(!result.success) throw new AppError(422, "invalid input")
    
    const appointment = await bookSlotService(result.data)
    return res.status(201).send(appointment)
}