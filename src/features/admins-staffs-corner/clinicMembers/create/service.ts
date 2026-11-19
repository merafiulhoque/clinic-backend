import { hashPassword } from "shared/utilities/bcrypt.js";
import { memberCreateData } from "../schemas.js";
import { createMember, isClinicOwner } from "../memberRepo.js";
import { AppError } from "shared/utilities/errorHandler.js";
import { Role } from "generated/prisma/enums.js";
import { redisKeyGetStat } from "shared/config/const.js";
import { redis } from "shared/clients/redis.js";

export const memberCreateService = async (
    data: memberCreateData,
    userId: number
) => {
    if(data.role === Role.OWNER) throw new AppError(403, "cannot assign owner role")
    const doesUserOwnThisClinic = !!(await isClinicOwner(userId, data.clinicId))

    if(!doesUserOwnThisClinic) throw new AppError(403, "access denied")

    const hash = await hashPassword(data.password)
    const createData = await createMember({ ...data, password: hash }, userId)
  
    await redis.del(redisKeyGetStat(data.clinicId)) // delete stats in redis
    return createData
}
