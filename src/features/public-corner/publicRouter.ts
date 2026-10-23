import { Router } from "express";
import { PUBLIC_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { viewDoctorsHandler } from "./view-doctors/handler.js";

export const publicRouter = Router()

publicRouter.get(
    PUBLIC_ENDPOINTS.VIEW_DOCTORS,
    asyncHandler(viewDoctorsHandler)
)