import { Router } from "express";
import { DOCTOR_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { createDoctorHandler } from "./create/handler.js";

export const doctorRouter = Router()

doctorRouter.post(
    DOCTOR_ENDPOINTS.CREATE,
    getUserMiddleware,
    asyncHandler(createDoctorHandler)
)