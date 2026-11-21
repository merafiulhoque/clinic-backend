import { Router } from "express";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { viewAppointmentsHandler } from "./todays-appointments/handler.js";
import { PATIENT_MODULE_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const pmRouter = Router()
pmRouter.use(rateLimitMiddleware(100, 60*1000)) // 15 req per minute

pmRouter.get(
  PATIENT_MODULE_ENDPOINTS.VIEW_APPOINTMENTS,
  getUserMiddleware,
  asyncHandler(viewAppointmentsHandler)
)
