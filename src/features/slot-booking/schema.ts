import z from "zod";

export const viewSlotSchema = z.object({
    doctorClinicId: z.coerce.number().min(1),
    date: z.coerce.date()
})

export type viewSlotData = z.infer<typeof viewSlotSchema>

export type Slots = {
    scheduleId: number
    availableTime: number
}

export const bookSlotSchema = z.object({
    scheduleId: z.coerce.number().int().positive(),
    appointmentDate: z.iso.date().transform(
        (value) => new Date(`${value}T00:00:00.000Z`)
    ),
    patientName: z.string().trim().min(1),
    patientEmail: z.email(),
    patientPhone: z.string().trim().min(10).max(20).regex(/^[+0-9\s-]+$/),
    idempotencyKey: z.uuid(),
});

export type BookSlotData = z.infer<typeof bookSlotSchema>;