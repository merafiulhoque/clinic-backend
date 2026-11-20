import { AppointmentStatus } from "generated/prisma/enums.js";
import z from "zod";

export const viewAppointmentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("today"),
    limit: z.coerce.number().min(1).max(20),
    page: z.coerce.number().min(1)
  }),

  z.object({
    type: z.literal("all"),
    limit: z.coerce.number().min(1).max(20),
    page: z.coerce.number().min(1)
  }),

  z.object({
    type: z.literal("range"),
    from: z.iso.date(),
    to: z.iso.date(),
    limit: z.coerce.number().min(1).max(20),
    page: z.coerce.number().min(1)
  }).refine(
    (data) => data.from <= data.to,
    {
      message: "Start date must be before or equal to end date",
      path: ["to"],
    },
  ),
]);

export type viewAppointmentFilterType = z.infer<typeof viewAppointmentSchema>;


export type AppointmentView = {
    appointmentId: number;
    patientName: string;
    appointmentDate: Date;
    appointmentTime: number;
    appointmentStatus: AppointmentStatus;
    doctorName: string;
}
