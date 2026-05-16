import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  const products = [
    // ═══ ของใช้ในบ้าน ═══
    { name: 'ดาวน์นี่ น้ำยาปรับผ้านุ่ม 600ml', barcode: '4902430100014', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'ถุง' },
    { name: 'ไฮยีน น้ำยาปรับผ้านุ่ม 600ml', barcode: '8850096200019', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง' },
    { name: 'ไฟน์ไลน์ น้ำยาปรับผ้านุ่ม 600ml', barcode: '8851613100016', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง' },
    { name: 'ไฟน์ไลน์ น้ำยาปรับผ้านุ่ม ซอง 20ml', barcode: '8851613100023', cat: 'ของใช้ในบ้าน', cost: 3, sell: 5, unit: 'ซอง' },
    { name: 'ผงซักฟอก แฟ้บ 400g', barcode: '8851932300017', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง' },
    { name: 'ผงซักฟอก เปา 400g', barcode: '8851932300024', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง' },
    { name: 'ผงซักฟอก บรีส 400g', barcode: '8851932300031', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง' },
    { name: 'แชมพู แพนทีน 180ml', barcode: '4902430100021', cat: 'ของใช้ในบ้าน', cost: 45, sell: 65, unit: 'ขวด' },
    { name: 'แชมพู ซันซิล 180ml', barcode: '8851932400014', cat: 'ของใช้ในบ้าน', cost: 40, sell: 59, unit: 'ขวด' },
    { name: 'แชมพู รีจอยส์ 180ml', barcode: '4902430100038', cat: 'ของใช้ในบ้าน', cost: 40, sell: 59, unit: 'ขวด' },
    { name: 'น้ำยาล้างจาน ซันไลต์ 500ml', barcode: '8851932500011', cat: 'ของใช้ในบ้าน', cost: 18, sell: 29, unit: 'ขวด' },
    { name: 'สบู่ ลักส์ 70g', barcode: '8851932600018', cat: 'ของใช้ในบ้าน', cost: 12, sell: 18, unit: 'ก้อน' },
    { name: 'ยาสีฟัน คอลเกต 150g', barcode: '8850006300015', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'หลอด' },
    { name: 'ถุงขยะ ดำ 24x28"', barcode: '8851932700015', cat: 'ของใช้ในบ้าน', cost: 15, sell: 25, unit: 'แพ็ค' },
    { name: 'ยากันยุง ไบกอน สเปรย์', barcode: '8850006400012', cat: 'ของใช้ในบ้าน', cost: 55, sell: 79, unit: 'กระป๋อง' },

    // ═══ ของสด / อื่นๆ ═══
    { name: 'ไข่ไก่', cat: 'ของสด', cost: 3.5, sell: 5, unit: 'ฟอง' },
    { name: 'น้ำแข็งถุง 1kg', cat: 'ของสด', cost: 5, sell: 10, unit: 'ถุง' },
    { name: 'กล้วยหอม', cat: 'ของสด', cost: 3, sell: 5, unit: 'ลูก' },
    { name: 'ข้าวสาร 5kg', cat: 'ของสด', cost: 85, sell: 120, unit: 'ถุง' },
    { name: 'ถั่วเขียว 500g', cat: 'ของสด', cost: 20, sell: 30, unit: 'ถุง' },
    { name: 'แป้งมัน 500g', cat: 'ของสด', cost: 18, sell: 25, unit: 'ถุง' },

    // ═══ ไอศกรีม Cremo ═══
    { name: 'ไอติม Pilot แท่ง', cat: 'ไอศกรีม', cost: 12, sell: 20, unit: 'แท่ง' },
    { name: 'ไอติม Pilot ใหญ่', cat: 'ไอศกรีม', cost: 15, sell: 25, unit: 'แท่ง' },
    { name: 'ไอติม Choco Crush', cat: 'ไอศกรีม', cost: 8, sell: 15, unit: 'แท่ง' },
    { name: 'ไอติม Choco Crush ใหญ่', cat: 'ไอศกรีม', cost: 12, sell: 20, unit: 'แท่ง' },
    { name: 'ไอติม Matrix', cat: 'ไอศกรีม', cost: 8, sell: 15, unit: 'แท่ง' },
    { name: 'ไอติม Wonderland', cat: 'ไอศกรีม', cost: 30, sell: 49, unit: 'ถ้วย' },
    { name: 'ไอติม Trio', cat: 'ไอศกรีม', cost: 8, sell: 15, unit: 'แท่ง' },
    { name: 'ไอติม Fruit Fiesta', cat: 'ไอศกรีม', cost: 5, sell: 10, unit: 'แท่ง' },
    { name: 'ไอติม Tiger Choc', cat: 'ไอศกรีม', cost: 5, sell: 10, unit: 'แท่ง' },
    { name: 'ไอติม Crunchy Cone', cat: 'ไอศกรีม', cost: 12, sell: 20, unit: 'อัน' },
    { name: 'ไอติม Penguin', cat: 'ไอศกรีม', cost: 8, sell: 15, unit: 'แท่ง' },

    // ═══ แก๊ส/อื่นๆ ═══
    { name: 'แก๊สหุงต้ม ถัง 15kg', cat: 'แก๊ส/อื่นๆ', cost: 350, sell: 420, unit: 'ถัง' },
    { name: 'ไม้กวาด', cat: 'แก๊ส/อื่นๆ', cost: 25, sell: 45, unit: 'อัน' },
    { name: 'เชือกฟาง', cat: 'แก๊ส/อื่นๆ', cost: 15, sell: 25, unit: 'ม้วน' },
    { name: 'ถุงร้อน 6x9"', cat: 'แก๊ส/อื่นๆ', cost: 15, sell: 25, unit: 'แพ็ค' },
    { name: 'ถุงหิ้ว 9x18"', cat: 'แก๊ส/อื่นๆ', cost: 20, sell: 35, unit: 'แพ็ค' },
    { name: 'ไส้กรอก CP ถุง', barcode: '8858998010019', cat: 'ของสด', cost: 20, sell: 30, unit: 'ถุง' },
  ]

  let created = 0
  for (const item of products) {
    const existing = item.barcode ? await p.product.findFirst({ where: { barcode: item.barcode } }) : await p.product.findFirst({ where: { name: item.name } })
    if (existing) { console.log(`  ⏭️ ${item.name}`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const prefixes: Record<string, string> = { 'ของใช้ในบ้าน': 'HOU', 'ของสด': 'FRS', 'ไอศกรีม': 'ICE', 'แก๊ส/อื่นๆ': 'OTH' }
    const sku = `${prefixes[item.cat] || 'PRD'}${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: (item as any).barcode || null, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }
  console.log(`\n✅ Part 4: สร้าง ${created} รายการ (ของใช้ + ของสด + ไอศกรีม + แก๊ส)`)
}
main().catch(console.error).finally(() => p.$disconnect())
