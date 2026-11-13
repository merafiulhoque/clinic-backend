import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "generated/prisma/client.js";
import cfg from "shared/config/env.js";

const adapter = new PrismaNeon({
    connectionString: cfg.DATABASE_URL
})

export const prisma = new PrismaClient({
    adapter
})
