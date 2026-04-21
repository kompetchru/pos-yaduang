/**
 * ดาวน์โหลดรูปสินค้าจริงจาก loremflickr.com (ดึงรูปจริงจาก Flickr)
 * 
 * วิธีรัน: npx ts-node --transpile-only scripts/download-real-images.ts
 */
import { PrismaClient } from '@prisma/client'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const searchTerms: Record<string, string> = {
  'DRK001': 'water,bottle,drinking',
  'DRK002': 'coca,cola,can',
  'DRK003': 'green,tea,bottle',
  'DRK004': 'energy,drink,bottle',
  'DRK005': 'milk,carton,box',
  'SNK001': 'potato,chips,bag',
  'SNK002': 'shrimp,crackers,snack',
  'SNK003': 'chocolate,sticks,pocky',
  'SNK004': 'mint,candy,sweets',
  'INS001': 'instant,noodles,ramen',
  'INS002': 'tom,yum,soup',
  'INS003': 'canned,sardines,fish',
  'HOU001': 'laundry,detergent,powder',
  'HOU002': 'dish,soap,liquid',
  'HOU003': 'toilet,paper,tissue',
  'SEA001': 'fish,sauce,bottle',
  'SEA002': 'soy,sauce,bottle',
  'SEA003': 'sugar,white,granulated',
  'FRS001': 'chicken,eggs,fresh',
  'FRS002': 'rice,bag,grain',
  'HLT001': 'medicine,pills,tablet',
  'HLT002': 'balm,ointment,jar',
}

function downloadWithRedirects(url: string, dest: string, maxRedirects = 10): Promise<void> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) { reject(new Error('Too many redirects')); return }

    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const client = url.startsWith('https') ? https : http
    client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    }, (response) => {
      if ([301, 302, 303, 307].includes(response.statusCode || 0)) {
        let loc = response.headers.location || ''
        if (loc.startsWith('/')) {
          const parsed = new URL(url)
          loc = `${parsed.protocol}//${parsed.host}${loc}`
        }
        response.resume()
        downloadWithRedirects(loc, dest, maxRedirects - 1).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      const file = fs.createWriteStream(dest)
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', (err) => { file.close(); reject(err) })
    }).on('error', reject)
  })
}

async function main() {
  console.log('🖼️  ดาวน์โหลดรูปสินค้าจริง...\n')

  const products = await prisma.product.findMany({ where: { isActive: true } })
  const uploadDir = path.join(__dirname, '../uploads/products')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  let success = 0
  let failed = 0

  for (const product of products) {
    const term = searchTerms[product.sku]
    if (!term) { console.log(`⏭️  ${product.sku} — ไม่มี keyword`); continue }

    const filename = `${product.sku.toLowerCase()}.jpg`
    const filepath = path.join(uploadDir, filename)

    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
      await prisma.product.update({ where: { id: product.id }, data: { imageUrl: `/uploads/products/${filename}` } })
      console.log(`✅ ${product.sku} ${product.name} — มีรูปแล้ว`)
      success++
      continue
    }

    try {
      process.stdout.write(`📥 ${product.sku} ${product.name}...`)
      const url = `https://loremflickr.com/300/300/${term}`
      await downloadWithRedirects(url, filepath)

      const size = fs.statSync(filepath).size
      if (size < 1000) {
        try { fs.unlinkSync(filepath) } catch {}
        throw new Error('File too small')
      }

      await prisma.product.update({ where: { id: product.id }, data: { imageUrl: `/uploads/products/${filename}` } })
      console.log(` ✅ (${(size / 1024).toFixed(0)}KB)`)
      success++
    } catch (err: any) {
      console.log(` ❌ ${err.message}`)
      failed++
    }

    await new Promise((r) => setTimeout(r, 1500))
  }

  console.log(`\n🎉 เสร็จ! สำเร็จ ${success} / ล้มเหลว ${failed}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
