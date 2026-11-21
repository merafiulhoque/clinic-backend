import { Router } from "express";
import { AUTH_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { signupHandler } from "./signup/handler.js";
import { signinHandler } from "./signin/handler.js";
import { signoutHandler } from "./signout/handler.js";
import { getUserMiddleware } from "shared/middlewares/getUserMiddleware.js";
import { requireUserHandler } from "./me/handler.js";
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js";

export const authRouter = Router()


authRouter.post(
  AUTH_ENDPOINTS.SIGNUP,
  rateLimitMiddleware(5, 60*1000),
  asyncHandler(signupHandler)
)
authRouter.post(
  AUTH_ENDPOINTS.SIGNIN,
  rateLimitMiddleware(5, 60*1000),
  asyncHandler(signinHandler)
)
authRouter.post(
  AUTH_ENDPOINTS.SIGNOUT,
  rateLimitMiddleware(15, 60*1000),
  getUserMiddleware,
  asyncHandler(signoutHandler)
)
authRouter.get(
  AUTH_ENDPOINTS.ME,
  rateLimitMiddleware(50, 60*1000),
  getUserMiddleware,
  asyncHandler(requireUserHandler)
)
