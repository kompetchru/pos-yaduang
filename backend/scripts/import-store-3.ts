import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  const products = [
    // ═══ อาหารสำเร็จรูป (มาม่า + บะหมี่) ═══
    { name: 'มาม่า หมูสับ ซอง', barcode: '8850987101014', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'มาม่า ต้มยำกุ้ง ซอง', barcode: '8850987101021', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'มาม่า เย็นตาโฟ ซอง', barcode: '8850987101038', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'มาม่า ผัดขี้เมา ซอง', barcode: '8850987101045', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'มาม่า ถ้วย ต้มยำ', barcode: '8850987201011', cat: 'อาหารสำเร็จรูป', cost: 10, sell: 15, unit: 'ถ้วย' },
    { name: 'มาม่า ถ้วย หมูสับ', barcode: '8850987201028', cat: 'อาหารสำเร็จรูป', cost: 10, sell: 15, unit: 'ถ้วย' },
    { name: 'ไวไว ต้มยำ ซอง', barcode: '8851876101016', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'ควิกนู้ดเดิ้ล ต้มยำ', barcode: '8851876201013', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง' },
    { name: 'บะหมี่เกาหลี ซัมยัง เผ็ด', barcode: '8801073110502', cat: 'อาหารสำเร็จรูป', cost: 25, sell: 35, unit: 'ซอง' },
    { name: 'ปลากระป๋อง ปุ้มปุ้ย', barcode: '8850100100100', cat: 'อาหารสำเร็จรูป', cost: 15, sell: 22, unit: 'กระป๋อง' },
    { name: 'ปลากระป๋อง สามแม่ครัว', barcode: '8850100100117', cat: 'อาหารสำเร็จรูป', cost: 18, sell: 25, unit: 'กระป๋อง' },

    // ═══ เครื่องปรุง ═══
    { name: 'น้ำปลา ทิพรส 300ml', barcode: '8850206000012', cat: 'เครื่องปรุง', cost: 15, sell: 22, unit: 'ขวด' },
    { name: 'น้ำปลา ปลาหมึก 300ml', barcode: '8850206000029', cat: 'เครื่องปรุง', cost: 15, sell: 22, unit: 'ขวด' },
    { name: 'ซีอิ๊วขาว ถั่วเหลือง 300ml', barcode: '8850206100019', cat: 'เครื่องปรุง', cost: 12, sell: 18, unit: 'ขวด' },
    { name: 'ซอสหอยนางรม แม่กรุณา 300ml', barcode: '8850206200016', cat: 'เครื่องปรุง', cost: 18, sell: 28, unit: 'ขวด' },
    { name: 'ซอสพริก ศรีราชา 300ml', barcode: '8850206300013', cat: 'เครื่องปรุง', cost: 18, sell: 28, unit: 'ขวด' },
    { name: 'น้ำส้มสายชู 300ml', barcode: '8850206400010', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'ขวด' },
    { name: 'น้ำมันพืช ประทีป 1L', barcode: '8850206500017', cat: 'เครื่องปรุง', cost: 38, sell: 52, unit: 'ขวด' },
    { name: 'น้ำมันพืช ประทีป 500ml', barcode: '8850206500505', cat: 'เครื่องปรุง', cost: 22, sell: 30, unit: 'ขวด' },
    { name: 'ผงชูรส อายิโนะโมะโต๊ะ 250g', barcode: '8851200100018', cat: 'เครื่องปรุง', cost: 25, sell: 35, unit: 'ถุง' },
    { name: 'รสดี หมู 75g', barcode: '8851200200015', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'ซอง' },
    { name: 'รสดี ไก่ 75g', barcode: '8851200200022', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'ซอง' },
    { name: 'น้ำตาลทราย 1kg', barcode: '8850100200200', cat: 'เครื่องปรุง', cost: 22, sell: 30, unit: 'ถุง' },
    { name: 'เกลือป่น 500g', barcode: '8850100300207', cat: 'เครื่องปรุง', cost: 5, sell: 8, unit: 'ถุง' },
    { name: 'กะปิ 100g', barcode: '8850206600014', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'กระปุก' },
    { name: 'น้ำฟ้าไทย 700ml', barcode: '8850206700011', cat: 'เครื่องปรุง', cost: 8, sell: 12, unit: 'ขวด' },

    // ═══ กาแฟ ═══
    { name: 'เขาช่อง กาแฟ 5in1 ซอง', barcode: '8851015200019', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง' },
    { name: 'เนสกาแฟ เรดคัพ 3in1', barcode: '8850124000019', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง' },
    { name: 'กาแฟเบอร์ดี้ 3in1', barcode: '8850389100017', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง' },
  ]

  let created = 0
  for (const item of products) {
    const existing = item.barcode ? await p.product.findFirst({ where: { barcode: item.barcode } }) : await p.product.findFirst({ where: { name: item.name } })
    if (existing) { console.log(`  ⏭️ ${item.name}`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const prefixes: Record<string, string> = { 'อาหารสำเร็จรูป': 'INS', 'เครื่องปรุง': 'SEA', 'เครื่องดื่ม': 'DRK' }
    const sku = `${prefixes[item.cat] || 'PRD'}${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: item.barcode || null, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }
  console.log(`\n✅ Part 3: สร้าง ${created} รายการ (อาหาร + เครื่องปรุง + กาแฟ)`)
}
main().catch(console.error).finally(() => p.$disconnect())
