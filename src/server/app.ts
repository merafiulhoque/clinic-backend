import express from "express"
import cors from "cors"
import cfg from "shared/config/env.js"
import { errorHandler } from "shared/utilities/errorHandler.js"
import morgan from "morgan"
import YAML from "yaml"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import swaggerUi from "swagger-ui-express"
import { 
    PREFIX_AUTH, 
    PREFIX_CLINIC, 
    PREFIX_DOCTOR, 
    PREFIX_DOCTOR_CLINIC, 
    PREFIX_MEMBER, 
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

export const app = express()

app.use(express.json({limit: "50kb"}))
app.use(express.urlencoded({extended: true}))

app.use(cors({ origin: cfg.ALLOWED_ORIGIN }))

app.use(morgan("dev"))

app.use(PREFIX_AUTH, authRouter)
app.use(PREFIX_CLINIC, clinicRouter)
app.use(PREFIX_MEMBER, memberRouter)
app.use(PREFIX_DOCTOR, doctorRouter)
app.use(PREFIX_SCHEDULE, scheduleRouter)
app.use(PREFIX_DOCTOR_CLINIC, doctorClinicRouter)
app.use(PREFIX_PUBLIC_CORNER, publicRouter) 
app.use(PREFIX_PUBLIC_CORNER, slotRouter)

const swaggerDocument = YAML.parse(
    readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf-8")
)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler)