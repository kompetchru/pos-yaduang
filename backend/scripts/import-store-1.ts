import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  // เพิ่มหมวดใหม่ถ้ายังไม่มี
  const newCats = ['ไอศกรีม', 'เบียร์/เหล้า', 'แก๊ส/อื่นๆ']
  for (const n of newCats) {
    if (!cm[n]) {
      const icons: Record<string, string> = { 'ไอศกรีม': '🍦', 'เบียร์/เหล้า': '🍺', 'แก๊ส/อื่นๆ': '⛽' }
      const c = await p.category.create({ data: { name: n, icon: icons[n] || '📦', color: '#6B7280' } })
      cm[n] = c.id
    }
  }

  const products = [
    // ═══ เครื่องดื่ม ═══
    { name: 'โค้ก ขวดแก้ว 250ml', barcode: '8851959131312', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'ขวด' },
    { name: 'โค้ก กระป๋อง 325ml', barcode: '8851959131008', cat: 'เครื่องดื่ม', cost: 10, sell: 15, unit: 'กระป๋อง' },
    { name: 'โค้ก ขวด PET 1.25L', barcode: '8851959131251', cat: 'เครื่องดื่ม', cost: 22, sell: 33, unit: 'ขวด' },
    { name: 'เป๊ปซี่ กระป๋อง 325ml', barcode: '8858998581016', cat: 'เครื่องดื่ม', cost: 10, sell: 15, unit: 'กระป๋อง' },
    { name: 'เป๊ปซี่ ขวดแก้ว 250ml', barcode: '8858998581252', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'ขวด' },
    { name: 'สไปรท์ ขวดแก้ว 250ml', barcode: '8851959141311', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'ขวด' },
    { name: 'สไปรท์ ขวด PET 1.25L', barcode: '8851959141250', cat: 'เครื่องดื่ม', cost: 22, sell: 33, unit: 'ขวด' },
    { name: 'แฟนต้าส้ม ขวดแก้ว 250ml', barcode: '8851959151310', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'ขวด' },
    { name: 'แฟนต้าองุ่น ขวด PET 1.25L', barcode: '8851959151257', cat: 'เครื่องดื่ม', cost: 22, sell: 33, unit: 'ขวด' },
    { name: 'น้ำส้ม ขวด PET 1.25L', barcode: '8851959161256', cat: 'เครื่องดื่ม', cost: 22, sell: 33, unit: 'ขวด' },
    { name: 'เรดบูล กระป๋อง', barcode: '8851959120002', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กระป๋อง' },
    { name: 'M-150 ขวด', barcode: '8851952400015', cat: 'เครื่องดื่ม', cost: 7, sell: 10, unit: 'ขวด' },
    { name: 'กระทิงแดง ขวด', barcode: '8851952100016', cat: 'เครื่องดื่ม', cost: 7, sell: 10, unit: 'ขวด' },
    { name: 'คริสตัล น้ำดื่ม 600ml', barcode: '8850096520010', cat: 'เครื่องดื่ม', cost: 4, sell: 7, unit: 'ขวด' },
    { name: 'น้ำดื่ม ขวดเล็ก 350ml', barcode: '8850096520003', cat: 'เครื่องดื่ม', cost: 3, sell: 5, unit: 'ขวด' },
    { name: 'นมกล่อง หนองโพ จืด 225ml', barcode: '8858891300017', cat: 'เครื่องดื่ม', cost: 9, sell: 14, unit: 'กล่อง' },
    { name: 'นมกล่อง หนองโพ หวาน 225ml', barcode: '8858891300024', cat: 'เครื่องดื่ม', cost: 9, sell: 14, unit: 'กล่อง' },
    { name: 'นมกล่อง โฟร์โมสต์ ช็อก 225ml', barcode: '8851030100019', cat: 'เครื่องดื่ม', cost: 9, sell: 14, unit: 'กล่อง' },
    { name: 'นมกล่อง ไมโล 225ml', barcode: '8851944100019', cat: 'เครื่องดื่ม', cost: 10, sell: 15, unit: 'กล่อง' },
    { name: 'นมเปรี้ยว ดัชมิลล์ 180ml', barcode: '8851028001010', cat: 'เครื่องดื่ม', cost: 7, sell: 12, unit: 'กล่อง' },

    // ═══ เบียร์/เหล้า ═══
    { name: 'เบียร์ลีโอ ขวดใหญ่ 620ml', barcode: '8851952200013', cat: 'เบียร์/เหล้า', cost: 42, sell: 55, unit: 'ขวด' },
    { name: 'เบียร์ลีโอ กระป๋อง 490ml', barcode: '8851952200495', cat: 'เบียร์/เหล้า', cost: 38, sell: 49, unit: 'กระป๋อง' },
    { name: 'เบียร์ช้าง กระป๋อง 490ml', barcode: '8851988700490', cat: 'เบียร์/เหล้า', cost: 38, sell: 49, unit: 'กระป๋อง' },
    { name: 'เบียร์ช้าง Classic กระป๋อง 490ml', barcode: '8851988700506', cat: 'เบียร์/เหล้า', cost: 38, sell: 49, unit: 'กระป๋อง' },
    { name: 'เบียร์สิงห์ กระป๋อง 490ml', barcode: '8851952300010', cat: 'เบียร์/เหล้า', cost: 42, sell: 55, unit: 'กระป๋อง' },
    { name: 'Spy Wine Cooler แดง 275ml', barcode: '8850329112750', cat: 'เบียร์/เหล้า', cost: 28, sell: 39, unit: 'ขวด' },
    { name: 'Spy Cocktail ม่วง 275ml', barcode: '8850329212757', cat: 'เบียร์/เหล้า', cost: 28, sell: 39, unit: 'ขวด' },
    { name: 'เหล้าขาว 28ดีกรี 330ml', barcode: '8851952500011', cat: 'เบียร์/เหล้า', cost: 48, sell: 62, unit: 'ขวด' },
    { name: 'เหล้าขาว แม่โขง 330ml', barcode: '8851952600018', cat: 'เบียร์/เหล้า', cost: 95, sell: 120, unit: 'ขวด' },
    { name: 'เหล้ากั๊ก (แบ่งขาย)', cat: 'เบียร์/เหล้า', cost: 10, sell: 15, unit: 'แก้ว' },
  ]

  let created = 0
  for (const item of products) {
    const existing = item.barcode ? await p.product.findFirst({ where: { barcode: item.barcode } }) : null
    if (existing) { console.log(`  ⏭️ ${item.name} — มีแล้ว`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const prefix = item.cat === 'เครื่องดื่ม' ? 'DRK' : item.cat === 'เบียร์/เหล้า' ? 'ALC' : 'PRD'
    const sku = `${prefix}${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: item.barcode || null, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }
  console.log(`\n✅ Part 1: สร้าง ${created} รายการ (เครื่องดื่ม + เบียร์)`)
}
main().catch(console.error).finally(() => p.$disconnect())
