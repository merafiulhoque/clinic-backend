import { redis } from "shared/clients/redis.js";
import { createApp } from "./app.js";
import cfg from "shared/config/env.js";
(async function StartServer(){

    try {
        if (! cfg.READY ){
            throw new Error("Required environment configuration is missing")
        }

        await redis.connect()
        console.log("REDIS: connected")

        createApp().listen(Number(cfg.PORT), () => {
            console.log(`SERVER: running at ${cfg.HOST + ":" + cfg.PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
})()
