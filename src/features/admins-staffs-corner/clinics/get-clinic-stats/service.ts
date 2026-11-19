import { Role } from "generated/prisma/enums.js"
import { getUserRole } from "shared/repository/sharedRepo.js"
import { AppError } from "shared/utilities/errorHandler.js"
import { getStat } from "../clinicRepo.js"
import { redis } from "shared/clients/redis.js"
import { redisKeyGetStat } from "shared/config/const.js"

export const getStatService = async (
  clinicId: number,
  userId: number
) => {
  const userRole = await getUserRole(clinicId, userId)

  if (!userRole) throw new AppError(400, "could not get user role")

  if (![Role.OWNER, Role.MANAGER, Role.RECEPTIONIST, Role.STAFF, Role.DOCTOR].includes(userRole.role)) {
    throw new AppError(403, "access denied")
  }

  const redisEntry = await redis.get(redisKeyGetStat(clinicId))

  if (!redisEntry) {
    const [totalDoctors, totalMember, totalPatient] = await getStat(clinicId)
    await redis.set(
      redisKeyGetStat(clinicId),
      JSON.stringify({
        totalDoctors, totalMember, totalPatient
      }),
      {
        expiration: {
          type: "EX",
          value: 5*60 // 5 Minutes
        }
      }
    )
    return {totalDoctors, totalMember, totalPatient}
  }

  const {totalDoctors, totalMember, totalPatient} = await JSON.parse(redisEntry)
  return {totalDoctors, totalMember, totalPatient}
}
