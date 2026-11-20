import { Request, Response } from "express";
import { validateSchema } from "shared/utilities/validateSchema.js";
import { viewAppointmentSchema } from "../schemas.js";
import { viewAppointmentService } from "./service.js";

export const viewAppointmentsHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user
  if (!user) return res.status(401).send({ error: "unauthorized" })

  const clinicId = Number(req.params.clinicId)
  if(!clinicId || !Number.isInteger(clinicId)) return res.status(400).send({error: "bad request here"})

  const result = validateSchema(req.query, viewAppointmentSchema)

  if(!result.success) return res.status(422).send({error: "invalid request"})

  const appointments = await viewAppointmentService(result.data, user.id, clinicId)
  return res.status(200).send(appointments)
}
