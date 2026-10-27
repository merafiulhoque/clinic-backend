import { Weekday } from "generated/prisma/enums.js";
import z from "zod";

export const createScheduleSchema = z.object({
    doctorClinicId: z.number().int().positive(),
    dayOfWeek: z.enum(Weekday),
    startTime: z.number().int().min(480, "Does not sit before 8.00AM").max(1319, "Start time after end time"),
    endTime: z.number().int().min(481, "End time is less that start").max(22*60, "Does not sit after 10.00PM")
}).refine(
    ({ startTime, endTime }) => startTime < endTime,
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
)

export type createScheduleData = z.infer<typeof createScheduleSchema>