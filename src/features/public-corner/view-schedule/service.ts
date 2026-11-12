import { formatTime } from "shared/utilities/formatTime.js"
import { viewSchedule } from "../publicDoctorSearchRepo.js"
import { RawDoctorSchedule, RefinedDoctorSchedule } from "../schemas.js"

export const viewScheduleService = async (
    doctorClinicId: number
) => {
    const schedules = await viewSchedule(doctorClinicId)
    return refineSchedule(schedules)
}

const refineSchedule = (schedules: RawDoctorSchedule[]): RefinedDoctorSchedule[] => {
    return schedules.map(sc => ({
        scheduleId: sc.id,
        doctorClinicId: sc.doctorClinicId,
        dayOfWeek: sc.dayOfWeek,
        startTime: sc.startTime,
        endTime: sc.endTime
    }))
}
