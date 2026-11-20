import { Router } from "express";
import { CLINIC_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { clinicCreateHandler } from "./create/handler.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { getUserClinicInfoHandler } from "./getClinicsOfLoggedInUser/handler.js";
import { getClinicStatHandler } from "./get-clinic-stats/handler.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const clinicRouter = Router()
clinicRouter.use(rateLimitMiddleware(20, 60_000)) // 20 req per min

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

clinicRouter.get(
  CLINIC_ENDPOINTS.GET_STAT,
  getUserMiddleware,
  asyncHandler(getClinicStatHandler)
)
