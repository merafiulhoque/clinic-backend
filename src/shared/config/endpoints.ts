
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
} as const

export const PREFIX_DOCTOR = BASE + "/doctor"
export const DOCTOR_ENDPOINTS = {
    CREATE: "/create",
    GET: "/get-list"
    
} as const

export const PREFIX_SCHEDULE = BASE + "/schedule"
export const SCHEDULE_ENDPOINTS = {
    CREATE: "/create"
} as const

export const PREFIX_DOCTOR_CLINIC = BASE + "/doctor-clinic"

export const DOCTORCLINIC_ENDPOINTS = {
    ASSIGN: "/assign"
} as const

export const PREFIX_PUBLIC_CORNER = BASE + "/public-corner"

export const PUBLIC_ENDPOINTS = {
    VIEW_DOCTORS: "/view-doctors",
    GET_SCHEDULE: "/:doctorClinicId/schedule",
    GET_SLOTS: "/:doctorClinicId/slots",
    BOOK_SLOT: "/book-slot"
} as const