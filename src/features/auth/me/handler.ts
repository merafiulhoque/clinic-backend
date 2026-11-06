import { Request, Response } from "express"
import { AppError } from "shared/utilities/errorHandler.js"

export const requireUserHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user
  if (!user) throw new AppError(401, "unauthorized")
  return res.status(200).send({id: user.id, email: user.email})
}
