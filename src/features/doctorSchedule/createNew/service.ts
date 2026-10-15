import { isUserAnOwner } from "shared/repository/sharedRepo.js";
import { createScheduleData } from "../doctorScheduleSchema.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { createDoctorSchedule, doctorsExistingSchedule, findDoctorClinic } from "../doctorScheduleRepo.js";

export const createScheduleService = async (
    data: createScheduleData,
    userId: number
) => {
    const doctorAndOwner = await findDoctorClinic(data.doctorClinicId)

    if(!doctorAndOwner) throw new AppError(
        409,
        "invalid doctor clinic id"
    )

    
    if(doctorAndOwner.clinics.ownerId !== userId) throw new AppError(
        403, "user does not have permission"
    )

    const conflicts = await doctorsExistingSchedule(data, doctorAndOwner.doctorId)

    if (conflicts.length > 0){
        const conflictingClinics = conflicts.map(conflict => ({
            clinic: conflict.doctorClinic.clinics.name,
            location: conflict.doctorClinic.clinics.location,
            startTime: conflict.startTime,
            endTime: conflict.endTime
        }))
        return {
            created: false,
            conflicts: conflictingClinics
        }
    }
    await createDoctorSchedule(data)
    return {
        created: true,
        conflicts: []
    }
}
