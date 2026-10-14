import { configDotenv } from "dotenv"

configDotenv({
    quiet: true,
    debug: true
})

const ENV = process.env


const cfg = {
    READY: true,
    HOST: ENV.HOST,
    PORT: ENV.PORT,
    DATABASE_URL: ENV.DATABASE_URL,
    ACCESS_TOKEN_SECRET: ENV.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: ENV.REFRESH_TOKEN_SECRET,
    REDIS_URL: ENV.REDIS_URL
}

if (
    !cfg.HOST || 
    !cfg.PORT ||
    !cfg.DATABASE_URL ||
    !cfg.ACCESS_TOKEN_SECRET ||
    !cfg.REFRESH_TOKEN_SECRET ||
    !cfg.REDIS_URL
){
    cfg.READY = false
}

export default cfg
