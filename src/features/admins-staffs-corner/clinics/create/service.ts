import { AppError } from "shared/utilities/errorHandler.js";
import { createClinic, doesClinicExists } from "../clinicRepo.js";
import { clinicCreateData } from "../schemas.js";

export const clinicCreateService = async(
    data: clinicCreateData,
    userId: number
) => {
    
    const name = await createClinic(data, userId)
    return name
}