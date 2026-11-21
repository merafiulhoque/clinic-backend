import { Request, Response, NextFunction } from "express";
import { redis } from "shared/clients/redis.js";

const tokenBucketScript = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call("HMGET", key, "tokens", "lastRefill")

local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

local elapsed = math.max(0, now - lastRefill)
tokens = math.min(capacity, tokens + (elapsed * refillRate))
lastRefill = now

local allowed = 0
local retryAfter = 0

if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
else
  retryAfter = math.ceil((1 - tokens) / refillRate)
end

redis.call("HSET", key, "tokens", tokens, "lastRefill", lastRefill)

redis.call("PEXPIRE", key, math.ceil(capacity / refillRate * 2))

return {allowed, math.floor(tokens), retryAfter}
`;

export const rateLimitMiddleware = (
  limit: number,
  duration: number
) => {
  if (limit <= 0 || duration <= 0) {
    throw new Error("Rate limit and duration must be greater than zero");
  }

  const refillRate = limit / duration;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cfIp = req.headers["cf-connecting-ip"]

      const identifier = typeof cfIp === "string" && cfIp.length > 0 ? cfIp : req.ip

      if(!identifier) return res.status(400).send({error: "bad request"})


      const key = `rate-limit:${identifier}`;

      const now = Date.now();

      const result = await redis.eval(tokenBucketScript, {
        keys: [key],
        arguments: [
          limit.toString(),
          refillRate.toString(),
          now.toString(),
        ],
      }) as number[];


      const [allowed, remaining, retryAfter] = result;

      res.setHeader("RateLimit-Limit", limit);
      res.setHeader("RateLimit-Remaining", Math.max(0, remaining));

      if (allowed === 1) {
        return next();
      }

      res.setHeader("Retry-After", Math.ceil(retryAfter / 1000));

      return res.status(429).json({
        error : "Too many requests. Please try again later.",
      });
    } catch (error) {
      console.error("Rate limiter error:", error);

      // Fail open: allow the request if Redis is unavailable.
      return next();
    }
  };
};
