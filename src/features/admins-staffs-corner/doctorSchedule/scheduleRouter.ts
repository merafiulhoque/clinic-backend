import { Router } from "express";
import { SCHEDULE_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { createDoctorScheduleHandler } from "./createNew/handler.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const scheduleRouter = Router()
scheduleRouter.use(rateLimitMiddleware(10, 60_000)) // 10 req per min

scheduleRouter.post(
    SCHEDULE_ENDPOINTS.CREATE,
    getUserMiddleware,
    asyncHandler(createDoctorScheduleHandler)
)
