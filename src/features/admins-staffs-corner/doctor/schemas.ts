import z from "zod";

export const createDoctorSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    qualification: z.string().optional(),
    additionalQualification: z.string().optional(),
    experience: z.string().optional(),
    registrationNo: z.string(),
    specialization: z.string().optional()
})


export type createDoctorData = z.infer<typeof createDoctorSchema>

