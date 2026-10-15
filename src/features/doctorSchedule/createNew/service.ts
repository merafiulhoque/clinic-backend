import { isUserAnOwner } from "shared/repository/sharedRepo.js";
import { createScheduleData } from "../doctorScheduleSchema.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { doctorsExistingSchedule } from "../doctorScheduleRepo.js";

export const createScheduleService = async (
    data: createScheduleData,
    userId: number
) => {
    const userAnOwner = !!(await isUserAnOwner(userId))
    if(!userAnOwner) throw new AppError(
        403, "user does not have permission"
    )

    const conflicts = await doctorsExistingSchedule(data)
}