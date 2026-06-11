FROM node:24-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


FROM node:24-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mini_shop_db"

RUN npm run build


FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

RUN npm prune --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["npm", "run", "start:prod"]