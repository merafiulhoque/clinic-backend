import { Role } from "generated/prisma/enums.js";
import z from "zod";

export const memberCreateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(Role),
    clinicId: z.number()
})

export type memberCreateData = z.infer<typeof memberCreateSchema>