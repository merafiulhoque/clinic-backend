# stage 1 -- installing dependencies
FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./prisma.config.ts
RUN npm ci

#stage 2 -- building application
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

RUN npx prisma generate
RUN npm run build

#stage 3 -- runner

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts

EXPOSE 5000

CMD [ "sh", "-c", "npx prisma migrate deploy && node dist/server/server.js" ]
