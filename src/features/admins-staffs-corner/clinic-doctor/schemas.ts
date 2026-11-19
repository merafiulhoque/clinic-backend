
import z from "zod"

export const assignDoctorToClinicSchema = z.object({
    doctorId: z.number(),
    clinicId: z.number(),
    fees: z.number().min(100)
})

export type assignDoctorToClinicData = z.infer<typeof assignDoctorToClinicSchema>
