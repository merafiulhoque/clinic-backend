import { Router } from "express";
import { AUTH_ENDPOINTS } from "shared/config/endpoints.js";
import { asyncHandler } from "shared/utilities/asyncHandler.js";
import { signupHandler } from "./signup/handler.js";
import { signinHandler } from "./signin/handler.js";
import { signoutHandler } from "./signout/handler.js";

export const authRouter = Router()

authRouter.post(AUTH_ENDPOINTS.SIGNUP, asyncHandler(signupHandler))
authRouter.post(AUTH_ENDPOINTS.SIGNIN, asyncHandler(signinHandler))
authRouter.post(AUTH_ENDPOINTS.SIGNOUT, asyncHandler(signoutHandler))