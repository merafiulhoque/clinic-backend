import { Request, Response } from "express"
import { viewAllDoctorsService } from "./service.js"

export const allDoctorsLookup = async (
  req: Request,
  res: Response
) => {
  const user = req.user
  if (!user) return res.status(401).send({ error: "unauthorized" })
  const page = req.query.page
  const LIMIT=20
  if (!page || Number.isNaN(page)) return res.status(400).send({ error: "bad request" })
  const doctors = await viewAllDoctorsService(Number(page), LIMIT)
  return res.status(200).send(doctors)
}
