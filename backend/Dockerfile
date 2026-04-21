FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
COPY prisma/schema.postgresql.prisma prisma/schema.prisma
RUN npx prisma generate

RUN npm install -g tsx

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx src/index.ts"]
