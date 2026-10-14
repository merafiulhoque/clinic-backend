import { Request, Response } from 'express'
import { validateSchema } from 'shared/utilities/validateSchema.js'
import { userSignupSchema } from '../schema.js'
import { signupService } from './service.js'
import { ERR_INVALID_INPUT } from 'shared/domainerrors/errors.js'

export const signupHandler = async (
    req: Request,
    res: Response
) => {
    const result = validateSchema(req.body, userSignupSchema)
    if (!result.success){
        return res.status(ERR_INVALID_INPUT.status).json({error: ERR_INVALID_INPUT.error})
    }
    
    const newUserId = await signupService(result.data)
    return res.status(201).send("user created")
}