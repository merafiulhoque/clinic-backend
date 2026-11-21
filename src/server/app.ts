import express from "express"
import cors from "cors"
import cfg from "shared/config/env.js"
import { errorHandler } from "shared/utilities/errorHandler.js"
import morgan from "morgan"

import {
    PREFIX_AUTH,
    PREFIX_CLINIC,
    PREFIX_DOCTOR,
    PREFIX_DOCTOR_CLINIC,
    PREFIX_MEMBER,
    PREFIX_PATIENT_MODULE,
    PREFIX_PUBLIC_CORNER,
    PREFIX_SCHEDULE
} from "shared/config/endpoints.js"
import { authRouter } from "features/auth/authRouter.js"
import { clinicRouter } from "features/admins-staffs-corner/clinics/clinicRouter.js"
import { memberRouter } from "features/admins-staffs-corner/clinicMembers/memberRouter.js"
import { doctorRouter } from "features/admins-staffs-corner/doctor/doctorRouter.js"
import { scheduleRouter } from "features/admins-staffs-corner/doctorSchedule/scheduleRouter.js"
import { doctorClinicRouter } from "features/admins-staffs-corner/clinic-doctor/doctorClinicRouter.js"
import { publicRouter } from "features/public-corner/publicRouter.js"
import { slotRouter } from "features/slot-booking/slotRouter.js"
import { pmRouter } from "features/patient-module/pmRouter.js"
import { rateLimitMiddleware } from "shared/middlewares/rateLimitMiddleware.js"
import helmet from "helmet"

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({
    origin: cfg.ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: false,
  }))


  app.use(morgan(":method :status :response-time ms", {
      skip: (_req, res) => res.statusCode < 400,
    })
  );

  app.use(rateLimitMiddleware(50, 60*1000)) // 50 limit per 60 seconds

  app.use(express.json({limit: "50kb"}))
  app.use(express.urlencoded({extended: true, limit: "50kb"}))



  app.head("/", (_req, res) => { return res.status(200).send("ok") })
  app.get("/", (_req, res) => { return res.status(200).send("ok") })

  app.use(PREFIX_AUTH, authRouter)
  app.use(PREFIX_CLINIC, clinicRouter)
  app.use(PREFIX_MEMBER, memberRouter)
  app.use(PREFIX_DOCTOR, doctorRouter)
  app.use(PREFIX_SCHEDULE, scheduleRouter)
  app.use(PREFIX_DOCTOR_CLINIC, doctorClinicRouter)
  app.use(PREFIX_PUBLIC_CORNER, publicRouter)
  app.use(PREFIX_PUBLIC_CORNER, slotRouter)
  app.use(PREFIX_PATIENT_MODULE, pmRouter)


  app.use(errorHandler)
  return app
}
