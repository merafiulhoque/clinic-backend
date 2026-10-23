import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { publicDoctorSearchSchema } from "../schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { viewDoctorsService } from "./service.js"

export const viewDoctorsHandler = async (
    req: Request,
    res: Response
) => {
    const result = validateSchema(req.query, publicDoctorSearchSchema)

    if(!result.success){
        throw new AppError(422, "invalid input")
    }

    const listOfDoctors = await viewDoctorsService(result.data)
    return res.status(200).send(listOfDoctors)
}