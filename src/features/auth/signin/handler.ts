import { Request, Response } from "express"
import { validateSchema } from "shared/utilities/validateSchema.js"
import { userSigninSchema } from "../schema.js"
import { ERR_INVALID_INPUT } from "shared/domainerrors/errors.js"
import { signinService } from "./service.js"


export const signinHandler =async (
    req: Request,
    res: Response
) => {
    const result = validateSchema(req.body, userSigninSchema)
    if(!result.success){
        return res.status(ERR_INVALID_INPUT.status).json({error: ERR_INVALID_INPUT.error})
    }
    const {accessToken, refreshToken} = await signinService(result.data)
    return res.status(200).json({accessToken, refreshToken})
}