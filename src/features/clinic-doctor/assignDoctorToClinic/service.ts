import { getOwnerId } from "shared/repository/sharedRepo.js";
import { assignDoctorToClinic } from "../clinicDoctorRepo.js";
import { assignDoctorToClinicData } from "../schemas.js";
import { AppError } from "shared/utilities/errorHandler.js";

export const assignDoctorService = async (
    data: assignDoctorToClinicData,
    userId: number
) => {

    const owner = await getOwnerId(data.clinicId)
    if(!owner){
        throw new AppError(
            400, "bad request"
        )
    }

    if (userId !== owner.ownerId){
        throw new AppError(
            403, "does not have permission"
        )
    }

    const result = await assignDoctorToClinic(data)

    return `Dr. ${result.doctor.firstName} added to Clinic : ${result.clinics.name}`
}