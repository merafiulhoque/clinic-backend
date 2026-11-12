import type { UserClaim } from "./index.ts";

declare global {
    namespace Express {
        interface Request {
            user?: UserClaim
            accessToken?: string
        }
    }
}

export {}