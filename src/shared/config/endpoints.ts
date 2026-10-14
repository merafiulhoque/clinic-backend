
const v = "v1"
const BASE = "/api/v1" //applied for all routes

export const PREFIX_AUTH = BASE + "/auth"

export const AUTH_ENDPOINTS = {
    SIGNUP: "/signup",
    SIGNIN: "/signin",
    SIGNOUT: "/signout"
} as const

export const PREFIX_CLINIC = BASE + "/clinic"

export const CLINIC_ENDPOINTS = {
    CREATE: "/create",
    GET_USER_CLINIC_INFO: "/get-info"
} as const

export const PREFIX_MEMBER = BASE + "/member"

export const MEMBER_ENDPOINTS = {
    CREATE: "/create"
}