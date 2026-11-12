import { Request, Response } from "express"

export const importDoctors = async (
  req: Request,
  res: Response
) => {
  const user = req.user
  if (!user) return res.status(401).send({ error: "unauthorized" })
  
}
