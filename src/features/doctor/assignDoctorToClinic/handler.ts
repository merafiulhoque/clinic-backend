import { Request, Response } from "express"
import { AppError } from "shared/utilities/errorHandler.js"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { assignDoctorToClinicSchema } from "../doctorSchema.js"
import { assignDoctorService } from "./service.js"

export const assignDoctorhandler = async (
    req: Request,
    res: Response
) => {
    const user = req.user

    if (!user) throw new AppError(
        401, "unauthorized"
    )

    const result = validateSchema(req.body, assignDoctorToClinicSchema)
    if(!result.success) throw new AppError(
        422, "invalid input"
    )
    const serviceResponse = await assignDoctorService(result.data, user.id)
    return res.status(200).send(serviceResponse)
}