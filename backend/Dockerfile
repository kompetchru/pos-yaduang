# ─── Builder stage: install deps + compile TS → JS ───
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
COPY prisma/schema.postgresql.prisma prisma/schema.prisma
RUN npx prisma generate

# Compile TypeScript ahead-of-time (ประหยัด RAM ตอน runtime ~200MB)
# --noEmitOnError false → emit JS แม้มี type errors (Express req.params types)
RUN npx tsc --noEmitOnError false; test -f dist/index.js

# ─── Runtime stage: ใส่เฉพาะของจำเป็น ───
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Production dependencies เท่านั้น (ไม่รวม devDeps เช่น tsx, typescript, @types/*)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JS + prisma client + schema + startup script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY scripts/wait-and-migrate.sh ./wait-and-migrate.sh
RUN chmod +x ./wait-and-migrate.sh

EXPOSE 4000

# จำกัด heap 384MB (กัน OOM บน Render Free 512MB)
# รัน node ตรงๆ ไม่ใช้ tsx → ลด RAM ~200MB
# wait-and-migrate.sh: รอ Neon DB wake up ก่อนรัน prisma db push
ENV NODE_OPTIONS="--max-old-space-size=384"
CMD ["./wait-and-migrate.sh"]
