export const APPOINTMENT_DURATION = 10 as const //10 minute

export const redisKeyDocPub = (page: number) => `REDIS_KEY_FOR_DOCTORS_IN_PUBLIC_DOMAIN:PAGE:${page}`
