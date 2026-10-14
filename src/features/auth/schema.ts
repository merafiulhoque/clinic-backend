import z from "zod";

export const userSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export type userSignupData = z.infer<typeof userSignupSchema>

export const userSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export type userSigninData = z.infer<typeof userSigninSchema>