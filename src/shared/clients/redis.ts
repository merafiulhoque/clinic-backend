import { createClient } from "redis";
import cfg from "shared/config/env.js";

export const redis = createClient({
    url: cfg.REDIS_URL!
})

redis.on("error", (err) => {
  console.error("Redis error:", err);
});