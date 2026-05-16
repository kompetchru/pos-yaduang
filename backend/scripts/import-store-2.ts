import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  const products = [
    // ═══ ขนม (จากชั้นเลย์ + ชั้นขนม) ═══
    { name: 'เลย์ คลาสสิค 46g', barcode: '8850718800469', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'เลย์ สาหร่าย 46g', barcode: '8850718800476', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'เลย์ Stax ออริจินัล', barcode: '8850718810109', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'เลย์ Max มันฝรั่ง', barcode: '8850718810208', cat: 'ขนม', cost: 6, sell: 10, unit: 'ซอง' },
    { name: 'ทวิสตี้ ชีส 55g', barcode: '8850718800216', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'Stix สาหร่ายโนริ', barcode: '8850718820108', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'ชันไบทส์ บาร์บีคิว', barcode: '8850718830107', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'คาลบี้ เอบิเซ็น กุ้ง', barcode: '8851016100012', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'ฮีโร่ เส้นมันไก่', barcode: '8850718840106', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'โปกกี้ ช็อกโกแลต', barcode: '8851019010014', cat: 'ขนม', cost: 14, sell: 22, unit: 'กล่อง' },
    { name: 'โปกกี้ สตรอว์เบอร์รี่', barcode: '8851019010021', cat: 'ขนม', cost: 14, sell: 22, unit: 'กล่อง' },
    { name: 'Beng-Beng เวเฟอร์ช็อก', barcode: '8992760221011', cat: 'ขนม', cost: 5, sell: 10, unit: 'ชิ้น' },
    { name: 'Tong Garden ถั่วรวม', barcode: '8850100100108', cat: 'ขนม', cost: 15, sell: 25, unit: 'ซอง' },
    { name: 'Kopiko กาแฟ', barcode: '8886001200104', cat: 'ขนม', cost: 1, sell: 2, unit: 'เม็ด' },
    { name: 'Trolli Burger เยลลี่', barcode: '4000539001307', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง' },
    { name: 'Roxta เวเฟอร์ช็อก', barcode: '8851016200019', cat: 'ขนม', cost: 5, sell: 10, unit: 'ชิ้น' },
    { name: 'Kalpa เวเฟอร์', barcode: '8992760222018', cat: 'ขนม', cost: 5, sell: 10, unit: 'ชิ้น' },
    { name: 'M Pineapple Pie พายสับปะรด', barcode: '8851016300016', cat: 'ขนม', cost: 8, sell: 12, unit: 'ชิ้น' },
    { name: 'เค้กนึ่ง LeDo', barcode: '8851016400013', cat: 'ขนม', cost: 8, sell: 12, unit: 'ชิ้น' },
    { name: 'เค้กปุย ช็อก', barcode: '8851016500010', cat: 'ขนม', cost: 8, sell: 12, unit: 'ชิ้น' },
    { name: 'Chupa Chups อมยิ้ม', barcode: '8851019020013', cat: 'ขนม', cost: 3, sell: 5, unit: 'อัน' },
    { name: 'ทาโร่ ปลาเส้น 5g', barcode: '8850100200019', cat: 'ขนม', cost: 3, sell: 5, unit: 'ซอง' },
    { name: 'Fun5 ข้าวโพดอบ', barcode: '8850718850105', cat: 'ขนม', cost: 3, sell: 5, unit: 'ซอง' },
    { name: 'ลูกอม ลมตาม', barcode: '8851019030012', cat: 'ขนม', cost: 1, sell: 2, unit: 'เม็ด' },
    { name: 'หมากฝรั่ง Doublemint', barcode: '4902888116018', cat: 'ขนม', cost: 3, sell: 5, unit: 'แผง' },

    // ═══ ขนมปัง/เบเกอรี่ ═══
    { name: 'ขนมปังกะโหลก ฟาร์มเฮ้าส์', barcode: '8851010100019', cat: 'ขนมปัง/เบเกอรี่', cost: 22, sell: 32, unit: 'ถุง' },
    { name: 'ขนมปังปอนด์ ไส้ครีม', barcode: '8851010200016', cat: 'ขนมปัง/เบเกอรี่', cost: 5, sell: 8, unit: 'ชิ้น' },
    { name: 'ขนมปังปอนด์ ไส้สังขยา', barcode: '8851010200023', cat: 'ขนมปัง/เบเกอรี่', cost: 5, sell: 8, unit: 'ชิ้น' },
    { name: 'ปอเปี๊ยะทอด ถุง', cat: 'ขนมปัง/เบเกอรี่', cost: 15, sell: 25, unit: 'ถุง' },
    { name: 'กล้วยแขก ถุง', cat: 'ขนมปัง/เบเกอรี่', cost: 15, sell: 25, unit: 'ถุง' },
  ]

  let created = 0
  for (const item of products) {
    const existing = item.barcode ? await p.product.findFirst({ where: { barcode: item.barcode } }) : await p.product.findFirst({ where: { name: item.name } })
    if (existing) { console.log(`  ⏭️ ${item.name}`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const prefixes: Record<string, string> = { 'ขนม': 'SNK', 'ขนมปัง/เบเกอรี่': 'BKR' }
    const sku = `${prefixes[item.cat] || 'PRD'}${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: item.barcode || null, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }
  console.log(`\n✅ Part 2: สร้าง ${created} รายการ (ขนม + เบเกอรี่)`)
}
main().catch(console.error).finally(() => p.$disconnect())
