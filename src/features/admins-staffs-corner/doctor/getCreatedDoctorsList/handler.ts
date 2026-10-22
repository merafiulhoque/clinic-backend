import { Request, Response } from "express"
import { ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { getDoctorsListService } from "./service.js"

export const getDoctorsListHandler = async (
    req: Request,
    res: Response
) => {
    const user = req.user

    if (!user) throw new AppError(
        ERR_UNAUTHORIZED.status, ERR_UNAUTHORIZED.error
    )

    const list = await getDoctorsListService(user.id)
    return res.status(200).send(list)
}