import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cats = await p.category.findMany()
  const cm: Record<string, string> = {}
  cats.forEach(c => { cm[c.name] = c.id })

  const products = [
    // ═══ เครื่องดื่มเพิ่มเติม ═══
    { name: 'ชาเขียว อิชิตัน 420ml', barcode: '8850124000118', cat: 'เครื่องดื่ม', cost: 12, sell: 20, unit: 'ขวด' },
    { name: 'ชาเขียว โออิชิ 380ml', barcode: '8858998581108', cat: 'เครื่องดื่ม', cost: 12, sell: 20, unit: 'ขวด' },
    { name: 'นมถั่วเหลือง ไวตามิ้ลค์ 300ml', barcode: '8851028002017', cat: 'เครื่องดื่ม', cost: 10, sell: 15, unit: 'กล่อง' },
    { name: 'น้ำดื่ม สิงห์ 600ml', barcode: '8850999220017', cat: 'เครื่องดื่ม', cost: 5, sell: 7, unit: 'ขวด' },
    { name: 'ชาเย็น ปรุงสำเร็จ 250ml', barcode: '8851959170012', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กล่อง' },
    { name: 'โค้ก ขวดคืน ลัง 24ขวด', cat: 'เครื่องดื่ม', cost: 168, sell: 216, unit: 'ลัง' },
    { name: 'แฟนต้า ขวดคืน ลัง 24ขวด', cat: 'เครื่องดื่ม', cost: 168, sell: 216, unit: 'ลัง' },

    // ═══ ขนมเพิ่มเติม ═══
    { name: 'ควิบน้อย ข้าวโพดอบ', barcode: '8850718860104', cat: 'ขนม', cost: 5, sell: 10, unit: 'ซอง' },
    { name: 'ควิบน้อย รสชีส', barcode: '8850718860111', cat: 'ขนม', cost: 5, sell: 10, unit: 'ซอง' },
    { name: 'ปังกรอบเนย', cat: 'ขนมปัง/เบเกอรี่', cost: 5, sell: 8, unit: 'ซอง' },
    { name: 'ขนมปังกรอบ ไส้ครีม', cat: 'ขนมปัง/เบเกอรี่', cost: 5, sell: 8, unit: 'ซอง' },
    { name: 'ขนมจีบ แช่แข็ง CP', barcode: '8858998020018', cat: 'ของสด', cost: 15, sell: 25, unit: 'ถุง' },

    // ═══ อาหารสำเร็จรูปเพิ่มเติม ═══
    { name: 'คนอร์ โจ๊ก หมู ซอง', barcode: '8851200300012', cat: 'อาหารสำเร็จรูป', cost: 6, sell: 10, unit: 'ซอง' },
    { name: 'คนอร์ ข้าวต้ม กุ้ง ซอง', barcode: '8851200300029', cat: 'อาหารสำเร็จรูป', cost: 6, sell: 10, unit: 'ซอง' },
    { name: 'Aroy-D กะทิกระป๋อง 250ml', barcode: '8851613101013', cat: 'อาหารสำเร็จรูป', cost: 18, sell: 28, unit: 'กระป๋อง' },
    { name: 'ปลาซาร์ดีน กระป๋อง', barcode: '8850100100124', cat: 'อาหารสำเร็จรูป', cost: 15, sell: 22, unit: 'กระป๋อง' },

    // ═══ เครื่องปรุงเพิ่มเติม ═══
    { name: 'ซอสมะเขือเทศ 300ml', barcode: '8850206800018', cat: 'เครื่องปรุง', cost: 15, sell: 22, unit: 'ขวด' },
    { name: 'น้ำจิ้มไก่ 300ml', barcode: '8850206900015', cat: 'เครื่องปรุง', cost: 15, sell: 22, unit: 'ขวด' },
    { name: 'พริกป่น ซอง 10g', cat: 'เครื่องปรุง', cost: 2, sell: 5, unit: 'ซอง' },
    { name: 'ซอสปรุงรส แม็กกี้', barcode: '8851944200016', cat: 'เครื่องปรุง', cost: 12, sell: 18, unit: 'ขวด' },

    // ═══ ของใช้เพิ่มเติม ═══
    { name: 'ผ้าอนามัย โซฟี 10ชิ้น', barcode: '8851932800012', cat: 'ของใช้ในบ้าน', cost: 18, sell: 29, unit: 'ห่อ' },
    { name: 'น้ำยาล้างห้องน้ำ วิกซอล 450ml', barcode: '8851932900019', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'ขวด' },
    { name: 'ยากันยุง จัมโบ้ 10ขด', barcode: '8851933000015', cat: 'ของใช้ในบ้าน', cost: 20, sell: 32, unit: 'กล่อง' },
    { name: 'ธูป ตราพระ 1มัด', cat: 'ของใช้ในบ้าน', cost: 5, sell: 10, unit: 'มัด' },
    { name: 'เทียนไข ขาว 1คู่', cat: 'ของใช้ในบ้าน', cost: 3, sell: 5, unit: 'คู่' },
    { name: 'แปรงสีฟัน คอลเกต', barcode: '8850006500019', cat: 'ของใช้ในบ้าน', cost: 15, sell: 25, unit: 'อัน' },
    { name: 'กระดาษทิชชู่ ม้วน 2ชั้น', barcode: '8851933100012', cat: 'ของใช้ในบ้าน', cost: 8, sell: 12, unit: 'ม้วน' },
    { name: 'สก๊อตไบรท์ ฟองน้ำ', barcode: '8851933200019', cat: 'ของใช้ในบ้าน', cost: 8, sell: 15, unit: 'ชิ้น' },

    // ═══ กาแฟเพิ่มเติม ═══
    { name: 'เขาช่อง กาแฟ 5in1 กล่อง 10ซอง', barcode: '8851015200026', cat: 'เครื่องดื่ม', cost: 45, sell: 65, unit: 'กล่อง' },
    { name: 'โอวัลติน 3in1 ซอง', barcode: '8850389200014', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง' },

    // ═══ ของสดเพิ่มเติม ═══
    { name: 'ไส้กรอก แบ่งขาย', cat: 'ของสด', cost: 3, sell: 5, unit: 'ชิ้น' },
    { name: 'ลูกชิ้น ถุง', cat: 'ของสด', cost: 15, sell: 25, unit: 'ถุง' },
    { name: 'เต้าหู้ทอด ถุง', cat: 'ของสด', cost: 10, sell: 15, unit: 'ถุง' },

    // ═══ แก๊ส/อื่นๆ เพิ่มเติม ═══
    { name: 'หลอดดูด แพ็ค', cat: 'แก๊ส/อื่นๆ', cost: 8, sell: 15, unit: 'แพ็ค' },
    { name: 'จานโฟม 25ใบ', cat: 'แก๊ส/อื่นๆ', cost: 12, sell: 20, unit: 'แพ็ค' },
    { name: 'แก้วพลาสติก 16oz 25ใบ', cat: 'แก๊ส/อื่นๆ', cost: 15, sell: 25, unit: 'แพ็ค' },
    { name: 'ไม้จิ้มฟัน กล่อง', cat: 'แก๊ส/อื่นๆ', cost: 5, sell: 10, unit: 'กล่อง' },
  ]

  let created = 0
  for (const item of products) {
    const existing = (item as any).barcode
      ? await p.product.findFirst({ where: { barcode: (item as any).barcode } })
      : await p.product.findFirst({ where: { name: item.name } })
    if (existing) { console.log(`  ⏭️ ${item.name}`); continue }
    const count = await p.product.count({ where: { categoryId: cm[item.cat] } })
    const prefixes: Record<string, string> = { 'เครื่องดื่ม': 'DRK', 'ขนม': 'SNK', 'ขนมปัง/เบเกอรี่': 'BKR', 'อาหารสำเร็จรูป': 'INS', 'เครื่องปรุง': 'SEA', 'ของใช้ในบ้าน': 'HOU', 'ของสด': 'FRS', 'แก๊ส/อื่นๆ': 'OTH' }
    const sku = `${prefixes[item.cat] || 'PRD'}${String(count + 1).padStart(3, '0')}`
    await p.product.create({ data: { sku, barcode: (item as any).barcode || null, name: item.name, categoryId: cm[item.cat], costPrice: item.cost, sellPrice: item.sell, unit: item.unit, stock: 20, minStock: 5 } })
    console.log(`  ✅ ${sku} ${item.name}`)
    created++
  }

  const total = await p.product.count()
  console.log(`\n✅ Part 5: สร้าง ${created} รายการ`)
  console.log(`📦 สินค้าทั้งหมดในระบบ: ${total} รายการ`)
}
main().catch(console.error).finally(() => p.$disconnect())
