import { ZodType } from "zod";

export const validateSchema = <T extends ZodType>(
    data: unknown,
    schema: T
) => {
    return schema.safeParse(data)
}