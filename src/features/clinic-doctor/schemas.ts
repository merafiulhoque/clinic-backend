import { Weekday } from "generated/prisma/enums.js"
import z from "zod"

export const assignDoctorToClinicSchema = z.object({
    doctorId: z.number(),
    clinicId: z.number(),
    fees: z.number()
})

export type assignDoctorToClinicData = z.infer<typeof assignDoctorToClinicSchema>

