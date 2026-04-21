# 🚀 Deploy ร้านชำยายด้วง POS (ฟรี 100%)

## สิ่งที่ต้องสมัคร (ฟรีทั้งหมด)

1. **GitHub** — เก็บ code → https://github.com
2. **Neon** — PostgreSQL ฟรี 500MB → https://neon.tech
3. **Render** — Backend ฟรี 750 ชม./เดือน → https://render.com
4. **Vercel** — Frontend ฟรีไม่จำกัด → https://vercel.com

---

## ขั้นตอน 1: Push code ขึ้น GitHub

```bash
# ที่ root ของโปรเจกต์
git init
git add .
git commit -m "ร้านชำยายด้วง POS v1"

# สร้าง repo ใหม่บน GitHub แล้ว
git remote add origin https://github.com/YOUR_USERNAME/pos-yaduang.git
git push -u origin main
```

---

## ขั้นตอน 2: สร้าง Database (Neon)

1. ไปที่ https://neon.tech → Sign up ด้วย GitHub
2. กด **Create Project** → ตั้งชื่อ `pos-yaduang`
3. เลือก Region: **Singapore** (ใกล้ไทยที่สุด)
4. จะได้ **Connection String** หน้าตาแบบนี้:
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/pos_duang?sslmode=require
   ```
5. **คัดลอกเก็บไว้** — ใช้ในขั้นตอนถัดไป

---

## ขั้นตอน 3: Deploy Backend (Render)

1. ไปที่ https://render.com → Sign up ด้วย GitHub
2. กด **New** → **Web Service**
3. เชื่อม GitHub repo → เลือก repo `pos-yaduang`
4. ตั้งค่า:
   - **Name:** `yaduang-pos-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
5. เพิ่ม **Environment Variables:**
   ```
   DATABASE_URL = (วาง Connection String จาก Neon)
   JWT_SECRET   = (สร้างเอง เช่น: my-super-secret-key-2024-pos-yaduang)
   JWT_EXPIRES_IN = 7d
   PORT = 4000
   NODE_ENV = production
   ```
6. กด **Create Web Service**
7. รอ build ~5 นาที → จะได้ URL เช่น `https://yaduang-pos-api.onrender.com`
8. ทดสอบ: เปิด `https://yaduang-pos-api.onrender.com/health`

### สร้างข้อมูลเริ่มต้น
หลัง deploy สำเร็จ ไปที่ Render → Shell tab → รัน:
```bash
npx tsx prisma/seed.ts
npx tsx scripts/seed-cigarettes.ts
```

---

## ขั้นตอน 4: Deploy Frontend (Vercel)

1. ไปที่ https://vercel.com → Sign up ด้วย GitHub
2. กด **Add New Project** → Import repo `pos-yaduang`
3. ตั้งค่า:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto detect)
4. เพิ่ม **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://yaduang-pos-api.onrender.com/api
   ```
   (ใช้ URL จาก Render ขั้นตอนที่ 3)
5. กด **Deploy**
6. รอ ~2 นาที → จะได้ URL เช่น `https://pos-yaduang.vercel.app`

---

## ขั้นตอน 5: ทดสอบ

1. เปิด `https://pos-yaduang.vercel.app`
2. Login: `yaduang` / `1234`
3. ทดสอบขายสินค้า, ดูรายงาน, AI วิเคราะห์

---

## เปิดจากมือถือ

เปิด Chrome → ไปที่ URL ของ Vercel → กดเมนู ⋮ → "Add to Home Screen"

---

## ข้อจำกัดของ Free Tier

| Service | ข้อจำกัด | ผลกระทบ |
|---------|---------|---------|
| Neon | 500MB storage | พอสำหรับร้านเล็ก ~2 ปี |
| Render Free | หยุดหลังไม่ใช้ 15 นาที | ครั้งแรกเปิดจะช้า ~30 วินาที |
| Vercel | 100GB bandwidth/เดือน | เหลือเฟือสำหรับร้านเดียว |

### แก้ปัญหา Render หยุดทำงาน (Cold Start)
Render free จะ sleep หลังไม่มีคนใช้ 15 นาที ครั้งแรกที่เปิดจะรอ ~30 วินาที
ถ้าไม่อยากรอ ใช้ https://uptimerobot.com (ฟรี) ping ทุก 14 นาที:
- Monitor URL: `https://yaduang-pos-api.onrender.com/health`
- Interval: 14 minutes

---

## อัพเดทระบบ

แก้ code → push ขึ้น GitHub → Render + Vercel จะ auto deploy ให้เลย

```bash
git add .
git commit -m "แก้ไข xxx"
git push
```
