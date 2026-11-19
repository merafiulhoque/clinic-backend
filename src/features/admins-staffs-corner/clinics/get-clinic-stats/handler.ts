import { Request, Response } from "express"
import { getStatService } from "./service.js"

export const getClinicStatHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user

  if (!user) return res.status(401).send("unauthorized")
  const clinicId = Number(req.params.clinicId)
  if (!Number.isInteger(clinicId) || clinicId <= 0) return res.status(400).send({ error: "invalid clinic id" })

  const { totalDoctors, totalMember, totalPatient } = await getStatService(clinicId, user.id)

  return res.status(200).send({
    totalDoctors, totalMember, totalPatient
  })
}
