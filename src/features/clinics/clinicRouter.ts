import { Router } from "express";
import { CLINIC_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { clinicCreateHandler } from "./create/handler.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { getUserClinicInfoHandler } from "./getClinicsOfLoggedInUser/handler.js";

export const clinicRouter = Router()

clinicRouter.post(
    CLINIC_ENDPOINTS.CREATE, 
    getUserMiddleware,
    asyncHandler(clinicCreateHandler)
)

clinicRouter.get(
    CLINIC_ENDPOINTS.GET_USER_CLINIC_INFO,
    getUserMiddleware,
    asyncHandler(getUserClinicInfoHandler)
)

