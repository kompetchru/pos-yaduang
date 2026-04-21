# 🏪 ร้านชำยายด้วง — POS System

ระบบขายหน้าร้าน (Point of Sale) สำหรับร้านชำ

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Zustand, Recharts
- **Backend:** Express, Prisma, PostgreSQL
- **AI:** OpenAI GPT-4o-mini (optional)

## วิธีรันระบบ (Development)

### 1. เตรียม PostgreSQL
```bash
# ใช้ Docker
docker run -d --name pos-db -e POSTGRES_DB=pos_duang -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16-alpine
```

### 2. Backend
```bash
cd backend
cp .env .env          # แก้ไข DATABASE_URL ถ้าจำเป็น
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed    # สร้างข้อมูลตัวอย่าง
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

### 4. เปิดใช้งาน
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Login: `yaduang` / `1234` (เจ้าของร้าน) หรือ `somchai` / `1234` (แคชเชียร์)

## Deploy ด้วย Docker
```bash
docker-compose up -d --build
```
