import { Router } from "express";
import { MEMBER_ENDPOINTS } from "shared/config/endpoints.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { createMemberHandler } from "./create/handler.js";

export const memberRouter = Router()

memberRouter.post(
    MEMBER_ENDPOINTS.CREATE,
    getUserMiddleware,
    asyncHandler(createMemberHandler)
)