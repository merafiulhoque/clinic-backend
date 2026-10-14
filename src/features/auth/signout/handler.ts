import { Request, Response } from 'express'


export const signoutHandler = async (
    req: Request,
    res: Response
) => {
    return res.status(200).send("logged out")
}