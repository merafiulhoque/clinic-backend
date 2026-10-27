import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export class AppError extends Error{
    constructor(public statusCode: number, message: string){
        super(message)
        this.name = "AppError"
    }
}

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError){
        return res.status(err.statusCode).json({error: err.message})
    }

    if (
        err instanceof jwt.JsonWebTokenError ||
        err instanceof jwt.TokenExpiredError ||
        err instanceof jwt.NotBeforeError
    ){
        return res.status(401).json({error: "unauthorized"})
    }

    if (err instanceof PrismaClientKnownRequestError){
        if (err.code === "P2002"){
            return res.status(409).json({error: "record already exists"})
        }
        if (err.code === "P2025"){
            return res.status(404).json({error: "record not found"})
        }
    }

    console.error("Unhandled request error:", err)
    return res.status(500).json({error: "Internal server error"})
}