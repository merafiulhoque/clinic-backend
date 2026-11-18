import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "generated/prisma/client.js";
import cfg from "shared/config/env.js";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaNeon({
            connectionString: cfg.DATABASE_URL,
        }),
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}