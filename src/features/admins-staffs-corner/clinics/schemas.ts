import { Role } from "generated/prisma/enums.js";
import z from "zod";

export const clinicCreateSchema = z.object({
    name: z.string(),
    location: z.string()
})

export type clinicCreateData = z.infer<typeof clinicCreateSchema>

export type Clinic = {
    id: number,
    name: string,
    location: string
}

export type UserClinics = {
    role: Role,
    clinic: Clinic
}