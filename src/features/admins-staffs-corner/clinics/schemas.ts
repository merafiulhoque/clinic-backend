import { Role } from "generated/prisma/enums.js";
import z from "zod";

export const clinicCreateSchema = z.object({
    name: z.string(),
    location: z.string(),
    ownerName: z.string()
})

export type clinicCreateData = z.infer<typeof clinicCreateSchema>

export type UserClinicInfo = {
    role: Role,
    clinicId: number
    clinicName: string
    clinicLocation: string
}
