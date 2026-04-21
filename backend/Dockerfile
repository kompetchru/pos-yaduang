FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
COPY prisma/schema.postgresql.prisma prisma/schema.prisma
RUN npx prisma generate

RUN npm install -g tsx

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
