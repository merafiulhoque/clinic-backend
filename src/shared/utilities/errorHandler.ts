import { Request, Response, NextFunction } from "express";


export class AppError extends Error{
    constructor(public statusCode: number, message: string){
        super(message)
        this.name = "AppError"
    }
}

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError){
        return res.status(err.statusCode).json({error: err.message})
    }

    // if (err instanceof JsonWebTokenError){
    //     return res.status(500).json({error: err.message})
    // }

    if (err instanceof Error){
        return res.status(500).json({error: err.message})
    }
    return res.status(500).json({error: err.message ?? "something went wrong"})
}