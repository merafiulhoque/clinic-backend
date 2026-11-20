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
authRouter.use(rateLimitMiddleware(5, 60*1000)) // 5 req per minute

authRouter.post(AUTH_ENDPOINTS.SIGNUP, asyncHandler(signupHandler))
authRouter.post(AUTH_ENDPOINTS.SIGNIN, asyncHandler(signinHandler))
authRouter.post(AUTH_ENDPOINTS.SIGNOUT, getUserMiddleware, asyncHandler(signoutHandler))
authRouter.get(AUTH_ENDPOINTS.ME, getUserMiddleware, asyncHandler(requireUserHandler))
