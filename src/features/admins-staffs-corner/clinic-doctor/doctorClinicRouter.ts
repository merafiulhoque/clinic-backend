import { Router } from "express";
import { DOCTORCLINIC_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { assignDoctorhandler } from "./assignDoctorToClinic/handler.js";
import { getClinicDoctorsHandler } from "./get-clinic-doctors/handler.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const doctorClinicRouter = Router()
doctorClinicRouter.use(rateLimitMiddleware(15, 60_000)) // 15 req per min

doctorClinicRouter.post(
    DOCTORCLINIC_ENDPOINTS.ASSIGN,
    getUserMiddleware,
    asyncHandler(assignDoctorhandler)
)

doctorClinicRouter.get(
    DOCTORCLINIC_ENDPOINTS.CLINIC_AND_DOCTORS,
    getUserMiddleware,
    asyncHandler(getClinicDoctorsHandler)
)
