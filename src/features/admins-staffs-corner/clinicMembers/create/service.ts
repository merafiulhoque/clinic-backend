import { hashPassword } from "shared/utilities/bcrypt.js";
import { memberCreateData } from "../schemas.js";
import { createMember, isClinicOwner } from "../memberRepo.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { Role } from "generated/prisma/enums.js";

export const memberCreateService = async (
    data: memberCreateData,
    userId: number
) => {
    if(data.role === Role.OWNER) throw new AppError(403, "cannot assign owner role")
    const doesUserOwnThisClinic = !!(await isClinicOwner(userId, data.clinicId))

    if(!doesUserOwnThisClinic) throw new AppError(403, "access denied")

    const hash = await hashPassword(data.password)
    return await createMember({...data, password: hash}, userId)
}