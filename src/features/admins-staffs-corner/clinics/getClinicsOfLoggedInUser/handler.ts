import { Request, Response } from "express"
import { ERR_UNAUTHORIZED } from "shared/domainerrors/errors.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { userClinicInfoService } from "./service.js"
import { UserClinicInfo } from "../schemas.js"


export const getUserClinicInfoHandler = async (
    req: Request,
    res: Response
) => {
    const user = req.user
    if (!user) throw new AppError(ERR_UNAUTHORIZED.status, ERR_UNAUTHORIZED.error)
    const userClinics: UserClinicInfo[] = await userClinicInfoService(user.id)
    return res.status(200).send(userClinics)
}