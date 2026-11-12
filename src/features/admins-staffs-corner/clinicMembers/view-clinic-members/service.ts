import { isUserAnOwner } from "shared/repository/sharedRepo.js"
import { viewClinicMembers } from "../memberRepo.js"
import { AppError } from "shared/utilities/errorHandler.js"

export const viewClinicMembersService = async(
  ownerId: number,
  clinicId: number
) => {
  const userAnOwner = await isUserAnOwner(ownerId)
  if(!userAnOwner) throw new AppError(403, "user not an owner")
  const members = await viewClinicMembers(ownerId, clinicId)
  if (!members) throw new AppError(404, "no clinic found, please create clinic first")
  return members.clinicMembers
}
