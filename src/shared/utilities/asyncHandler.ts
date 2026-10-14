import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (handler: RequestHandler) => {
    return (
        req: Request, 
        res: Response, 
        next: NextFunction
    ) => Promise.resolve(handler(req, res, next)).catch(next)
}