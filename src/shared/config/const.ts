export const APPOINTMENT_DURATION = 10 as const //10 minute

export const redisKeyDocPub = (page: number) => `REDIS_KEY_FOR_DOCTORS_IN_PUBLIC_DOMAIN:PAGE:${page}`
export const redisKeyGetStat = (clinicId: number) => `REDIS_KEY_FOR_STATS_OF_CLINIC_ID:${clinicId}`
export const redisKeyForViewAppointments = (clinicId: number, page: number) => `APPOINTMENTS_CLINIC_${clinicId}_PAGE_${page}`
