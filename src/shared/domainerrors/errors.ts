

export const ERR_INVALID_INPUT = {
    status: 422,
    error: "invalid input"
} as const

export const ERR_INVALID_CREDENTIALS = {
    status: 409,
    error: "invalid credentials"
}

export const ERR_BAD_REQUEST = {
    status: 400,
    error: "bad request"
} as const

export const ERR_UNAUTHORIZED = {
    status: 401,
    error: "unauthorized"
} as const

export const ERR_MALFORMED_TOKEN = {
    status: 400,
    error: "malformed token"
} as const