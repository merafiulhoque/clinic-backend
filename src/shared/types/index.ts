import { JwtPayload } from "jsonwebtoken"

export type ApiError = {
    error: string
}

export interface UserClaim extends JwtPayload {
    id: number
    email: string
}