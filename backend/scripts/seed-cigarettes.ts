import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🚬 เพิ่มสินค้าหมวดบุหรี่...\n')

  let cat = await prisma.category.findUnique({ where: { name: 'บุหรี่/แอลกอฮอล์' } })
  if (!cat) cat = await prisma.category.create({ data: { name: 'บุหรี่/แอลกอฮอล์', color: '#6B7280', icon: '🚬' } })

  const items = [
    // บุหรี่ไทย
    { sku: 'CIG001', name: 'กรองทิพย์ 90 ซอง', cost: 56, sell: 60, unit: 'ซอง', stock: 50, min: 10 },
    { sku: 'CIG002', name: 'กรองทิพย์ 90 แดง', cost: 56, sell: 60, unit: 'ซอง', stock: 50, min: 10 },
    { sku: 'CIG003', name: 'สามิต ขาว', cost: 48, sell: 52, unit: 'ซอง', stock: 40, min: 10 },
    { sku: 'CIG004', name: 'สามิต แดง', cost: 48, sell: 52, unit: 'ซอง', stock: 40, min: 10 },
    { sku: 'CIG005', name: 'กรองทิพย์ ไลท์', cost: 56, sell: 60, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG006', name: 'วอนเดอร์ แดง', cost: 42, sell: 46, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG007', name: 'วอนเดอร์ ขาว', cost: 42, sell: 46, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG008', name: 'สายฝน', cost: 38, sell: 42, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG009', name: 'กรุงทอง', cost: 38, sell: 42, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG010', name: 'เทียนทอง', cost: 36, sell: 40, unit: 'ซอง', stock: 20, min: 5 },

    // บุหรี่นอก
    { sku: 'CIG011', name: 'มาร์ลโบโร่ แดง', cost: 72, sell: 78, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG012', name: 'มาร์ลโบโร่ ไลท์', cost: 72, sell: 78, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'CIG013', name: 'แอลแอนด์เอ็ม แดง', cost: 62, sell: 68, unit: 'ซอง', stock: 25, min: 6 },
    { sku: 'CIG014', name: 'แอลแอนด์เอ็ม เมนทอล', cost: 62, sell: 68, unit: 'ซอง', stock: 25, min: 6 },
    { sku: 'CIG015', name: 'ลัคกี้สไตรค์ แดง', cost: 68, sell: 74, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG016', name: 'ลัคกี้สไตรค์ เมนทอล', cost: 68, sell: 74, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG017', name: 'คาเมล เหลือง', cost: 70, sell: 76, unit: 'ซอง', stock: 15, min: 5 },
    { sku: 'CIG018', name: 'เคนท์ น้ำเงิน', cost: 74, sell: 80, unit: 'ซอง', stock: 15, min: 5 },
    { sku: 'CIG019', name: 'พอลมอลล์ แดง', cost: 58, sell: 64, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG020', name: 'พอลมอลล์ เมนทอล', cost: 58, sell: 64, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG021', name: 'วินสตัน แดง', cost: 60, sell: 66, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG022', name: 'วินสตัน เมนทอล', cost: 60, sell: 66, unit: 'ซอง', stock: 20, min: 5 },
    { sku: 'CIG023', name: 'ดันฮิลล์ น้ำเงิน', cost: 76, sell: 82, unit: 'ซอง', stock: 10, min: 3 },
    { sku: 'CIG024', name: 'เซเว่นสตาร์', cost: 70, sell: 76, unit: 'ซอง', stock: 10, min: 3 },

    // ยาเส้น
    { sku: 'CIG025', name: 'ยาเส้น ตราจระเข้', cost: 15, sell: 20, unit: 'ซอง', stock: 40, min: 10 },
    { sku: 'CIG026', name: 'ยาเส้น ตราควาย', cost: 12, sell: 18, unit: 'ซอง', stock: 40, min: 10 },

    // อุปกรณ์
    { sku: 'CIG027', name: 'ไฟแช็ค คริกเก็ต', cost: 8, sell: 15, unit: 'อัน', stock: 50, min: 15 },
    { sku: 'CIG028', name: 'ไฟแช็ค แก๊ส เติม', cost: 15, sell: 25, unit: 'กระป๋อง', stock: 20, min: 5 },
    { sku: 'CIG029', name: 'กระดาษมวน OCB', cost: 5, sell: 10, unit: 'เล่ม', stock: 30, min: 8 },
  ]

  let created = 0
  for (const p of items) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } })
    if (!existing) {
      await prisma.product.create({
        data: { sku: p.sku, name: p.name, categoryId: cat.id, costPrice: p.cost, sellPrice: p.sell, unit: p.unit, stock: p.stock, minStock: p.min },
      })
      created++
      console.log(`  ✅ ${p.sku} ${p.name}`)
    } else {
      console.log(`  ⏭️  ${p.sku} ${p.name} — มีแล้ว`)
    }
  }

  console.log(`\n🎉 เพิ่มสินค้าบุหรี่ ${created} รายการ (ทั้งหมด ${items.length})`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
