import { Router } from "express";
import { DOCTORCLINIC_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { assignDoctorhandler } from "./assignDoctorToClinic/handler.js";

export const doctorClinicRouter = Router()

doctorClinicRouter.post(
    DOCTORCLINIC_ENDPOINTS.ASSIGN,
    getUserMiddleware,
    asyncHandler(assignDoctorhandler)
)