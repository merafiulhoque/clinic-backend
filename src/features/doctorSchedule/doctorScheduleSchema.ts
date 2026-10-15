import { Weekday } from "generated/prisma/enums.js";
import z from "zod";

export const createScheduleSchema = z.object({
    doctorClinicId: z.number(),
    dayOfWeek: z.enum(Weekday),
    startTime: z.number().min(480, "Does not sit before 8.00AM").max(1319, "Start time after end time"),
    endTime: z.number().min(481, "End time is less that start").max(22*60, "Does not sit after 10.00PM")
})

export type createScheduleData = z.infer<typeof createScheduleSchema>