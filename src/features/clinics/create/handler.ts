import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { clinicCreateSchema } from "../clinicSchema.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js"
import { clinicCreateService } from "./service.js"

export const clinicCreateHandler = async (
    req: Request,
    res: Response
) => {

    const user = req.user
    if (!user){
        return res.status(ERR_UNAUTHORIZED.status).json({error: ERR_UNAUTHORIZED.error})
    }

    const result = validateSchema(req.body, clinicCreateSchema)

    if (!result.success){
        throw new AppError(ERR_INVALID_INPUT.status, ERR_INVALID_INPUT.error)
    }

    const clinicName = await clinicCreateService(
        result.data,
        user.id
    )

    return res.status(201).send(`Clinic: ${clinicName} created successfully`)
}