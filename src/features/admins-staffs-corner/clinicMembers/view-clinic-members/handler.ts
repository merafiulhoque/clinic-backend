import { Request, Response } from "express"
import { AppError } from "shared/utilities/errorHandler.js"
import { viewClinicMembersService } from "./service.js"

export const viewClinicMembers = async (
  req: Request,
  res: Response
) => {
  const clinicId = req.params.clinicId
  if (Number.isNaN(clinicId)) throw new AppError(400, "bad request")
  if(typeof Number(clinicId) !== "number") throw new AppError(400, "bad request")
  const user = req.user
  if (!user) throw new AppError(401, "unauthorized")
  const members = await viewClinicMembersService(user.id, Number(clinicId))
  return res.status(200).send(members)
}
