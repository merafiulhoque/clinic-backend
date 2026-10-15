import { Router } from "express";
import { SCHEDULE_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { createDoctorScheduleHandler } from "./createNew/handler.js";

export const scheduleRouter = Router()

scheduleRouter.post(
    SCHEDULE_ENDPOINTS.CREATE,
    getUserMiddleware,
    asyncHandler(createDoctorScheduleHandler)
)