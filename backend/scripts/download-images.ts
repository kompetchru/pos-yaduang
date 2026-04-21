/**
 * Script ดาวน์โหลดรูปสินค้าจาก web
 * ใช้ DuckDuckGo Instant Answer API + fallback เป็น placeholder
 * 
 * วิธีรัน: npx ts-node --transpile-only scripts/download-images.ts
 */
import { PrismaClient } from '@prisma/client'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Map สินค้า → search keyword ภาษาอังกฤษ สำหรับหารูป
const productImageMap: Record<string, string> = {
  'DRK001': 'https://placehold.co/300x300/0ea5e9/ffffff.png?text=Singha+Water',
  'DRK002': 'https://placehold.co/300x300/dc2626/ffffff.png?text=Coke+325ml',
  'DRK003': 'https://placehold.co/300x300/16a34a/ffffff.png?text=Ichitan+Green+Tea',
  'DRK004': 'https://placehold.co/300x300/dc2626/ffffff.png?text=M-150',
  'DRK005': 'https://placehold.co/300x300/f5f5f4/1e293b.png?text=Nongpho+Milk',
  'SNK001': 'https://placehold.co/300x300/eab308/ffffff.png?text=Lays+Classic',
  'SNK002': 'https://placehold.co/300x300/f97316/ffffff.png?text=Party+Shrimp',
  'SNK003': 'https://placehold.co/300x300/7c2d12/ffffff.png?text=Pocky+Chocolate',
  'SNK004': 'https://placehold.co/300x300/0ea5e9/ffffff.png?text=Halls+Mint',
  'INS001': 'https://placehold.co/300x300/dc2626/ffffff.png?text=Mama+Pork',
  'INS002': 'https://placehold.co/300x300/ea580c/ffffff.png?text=Mama+Tom+Yum',
  'INS003': 'https://placehold.co/300x300/0284c7/ffffff.png?text=Canned+Fish',
  'HOU001': 'https://placehold.co/300x300/2563eb/ffffff.png?text=Breeze+Detergent',
  'HOU002': 'https://placehold.co/300x300/16a34a/ffffff.png?text=Sunlight+Dish',
  'HOU003': 'https://placehold.co/300x300/a855f7/ffffff.png?text=Scott+Tissue',
  'SEA001': 'https://placehold.co/300x300/92400e/ffffff.png?text=Fish+Sauce',
  'SEA002': 'https://placehold.co/300x300/713f12/ffffff.png?text=Oyster+Sauce',
  'SEA003': 'https://placehold.co/300x300/fafaf9/1e293b.png?text=Sugar+1kg',
  'FRS001': 'https://placehold.co/300x300/fef3c7/92400e.png?text=Egg',
  'FRS002': 'https://placehold.co/300x300/fafaf9/1e293b.png?text=Rice+5kg',
  'HLT001': 'https://placehold.co/300x300/fef2f2/dc2626.png?text=Paracetamol',
  'HLT002': 'https://placehold.co/300x300/fef9c3/854d0e.png?text=Tiger+Balm',
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : http

    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject)
          return
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        return
      }

      response.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  console.log('🖼️  เริ่มดาวน์โหลดรูปสินค้า...\n')

  const products = await prisma.product.findMany({ where: { isActive: true } })
  const uploadDir = path.join(__dirname, '../uploads/products')

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  let success = 0
  let failed = 0

  for (const product of products) {
    const imageUrl = productImageMap[product.sku]
    if (!imageUrl) {
      console.log(`⏭️  ${product.sku} ${product.name} — ไม่มี URL`)
      continue
    }

    const ext = imageUrl.includes('.png') ? '.png' : imageUrl.includes('.svg') ? '.svg' : '.jpg'
    const filename = `${product.sku.toLowerCase()}${ext}`
    const filepath = path.join(uploadDir, filename)

    // ข้ามถ้ามีรูปแล้ว
    if (fs.existsSync(filepath)) {
      console.log(`✅ ${product.sku} ${product.name} — มีรูปแล้ว`)
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: `/uploads/products/${filename}` },
      })
      success++
      continue
    }

    try {
      process.stdout.write(`📥 ${product.sku} ${product.name}...`)
      await downloadFile(imageUrl, filepath)
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: `/uploads/products/${filename}` },
      })
      console.log(' ✅')
      success++
    } catch (err: any) {
      console.log(` ❌ ${err.message}`)
      failed++
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\n🎉 เสร็จ! สำเร็จ ${success} / ล้มเหลว ${failed}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
