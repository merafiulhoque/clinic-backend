import { Router } from "express";
import { PUBLIC_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { viewSlotHandler } from "./view-slot-availability/handler.js";
import { bookSlotHandler } from "./book-slot/handler.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const slotRouter = Router()
slotRouter.use(rateLimitMiddleware(20, 60_000))

slotRouter.get(
    PUBLIC_ENDPOINTS.GET_SLOTS,
    asyncHandler(viewSlotHandler)
)

slotRouter.post(
    PUBLIC_ENDPOINTS.BOOK_SLOT,
    asyncHandler(bookSlotHandler)
)
