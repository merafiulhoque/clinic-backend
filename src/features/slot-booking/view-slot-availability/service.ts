import { Slots } from "../schemas.js";
import { viewAppointments } from "../slotsRepo.js";

export const viewSlotService = async (
    doctorClinicId: number,
    date: Date
): Promise<Slots[]> => {
    const schedules = await viewAppointments(doctorClinicId, date);

    return schedules.flatMap((schedule) => {
        const lastAppointment = schedule.appointments[0];

        const nextSlotTime = lastAppointment
            ? lastAppointment.endTime
            : schedule.startTime;

        const remainingMinutes = schedule.endTime - nextSlotTime;

        if (remainingMinutes < 5) {
            return [];
        }

        return [{
            scheduleId: schedule.id,
            availableTime: nextSlotTime,
        }];
    });
};