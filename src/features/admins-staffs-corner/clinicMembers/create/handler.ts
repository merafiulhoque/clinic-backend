import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { memberCreateSchema } from "../schemas.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { ERR_INVALID_INPUT, ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js"
import { memberCreateService } from "./service.js"

export const createMemberHandler = async (
    req: Request,
    res: Response
) => {
    const user = req.user

    if(!user) throw new AppError(ERR_UNAUTHORIZED.status, ERR_UNAUTHORIZED.error)

    const result = validateSchema(req.body, memberCreateSchema)
    if(!result.success) throw new AppError(ERR_INVALID_INPUT.status, ERR_INVALID_INPUT.error)
    
    const newMemberId = await memberCreateService(result.data, user.id)
    return res.status(201).send("member created")
}