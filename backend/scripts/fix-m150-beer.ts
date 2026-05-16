import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // แก้ M-150 barcode
  const m150 = await p.product.findFirst({ where: { name: { contains: 'M-150' } } })
  if (m150) {
    await p.product.update({ where: { id: m150.id }, data: { barcode: '8851123212021' } })
    console.log(`✅ แก้ M-150 barcode → 8851123212021`)
  }

  // เพิ่มเบียร์กระป๋องที่ขาด
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  const beers = [
    { name: 'เบียร์ลีโอ กระป๋อง 330ml', barcode: '8851952200334', cat: 'เบียร์/เหล้า', cost: 32, sell: 42, unit: 'กระป๋อง' },
    { name: 'เบียร์ช้าง กระป๋อง 330ml', barcode: '8851988700334', cat: 'เบียร์/เหล้า', cost: 32, sell: 42, unit: 'กระป๋อง' },
    { name: 'เบียร์สิงห์ กระป๋อง 330ml', barcode: '8851952300334', cat: 'เบียร์/เหล้า', cost: 35, sell: 45, unit: 'กระป๋อง' },
  ]

  let created = 0
  for (const item of beers) {
    const existing = await p.product.findFirst({ where: { barcode: item.barcode } })
    if (existing) { console.log(`  ⏭️ ${item.name}`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const sku = `ALC${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: item.barcode, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }
  console.log(`\n✅ เพิ่มเบียร์กระป๋อง ${created} รายการ`)
}
main().catch(console.error).finally(() => p.$disconnect())
