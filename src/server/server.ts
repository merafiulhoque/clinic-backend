import { redis } from "shared/clients/redis.js";
import { app } from "./app.js";
import cfg from "shared/config/env.js";
(async function StartServer(){

    try {
        if (! cfg.READY ){
            console.log("ENV: .env not ready")
        }

        await redis.connect()
        console.log("REDIS: connected")

        app.listen(Number(cfg.PORT), () => {
            console.log(`SERVER: running at ${cfg.HOST + ":" + cfg.PORT}`)
        })
    } catch (error) {
        console.log("Failed to start server:: ERROR: ", error)
        process.exit(1)
    }
})()

