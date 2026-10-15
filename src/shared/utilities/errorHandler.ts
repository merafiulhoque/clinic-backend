import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
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

    if (err instanceof PrismaClientKnownRequestError){
        if (err.code === "P2002"){
            return res.status(409).json({error: "record already exists"})
        }
        if (err.code === "P2025"){
            return res.status(404).json({error: "record not found"})
        }
        return res.status(500).json({
            error: "Internal server error",
        });
    }

    // if (err instanceof JsonWebTokenError){
    //     return res.status(500).json({error: err.message})
    // }

    if (err instanceof Error){
        return res.status(500).json({error: "Internal server error"})
    }
    return res.status(500).json({error: err.message ?? "Internal server error"})
}