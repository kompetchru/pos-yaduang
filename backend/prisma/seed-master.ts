/**
 * Seed สินค้า Master List สำหรับร้านชำไทย
 * รัน: npx ts-node --project tsconfig.seed.json prisma/seed-master.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 เริ่มเพิ่มสินค้า Master List...\n')

  // ลบ imageUrl เก่าทั้งหมด
  await prisma.product.updateMany({ data: { imageUrl: null } })

  // ดึง categories
  const cats = await prisma.category.findMany()
  const catMap: Record<string, string> = {}
  cats.forEach(c => { catMap[c.name] = c.id })

  // เพิ่มหมวดหมู่ที่ยังไม่มี
  const newCats = [
    { name: 'บุหรี่/แอลกอฮอล์', color: '#6B7280', icon: '🚬' },
    { name: 'เด็ก/นม', color: '#F472B6', icon: '🍼' },
    { name: 'ขนมปัง/เบเกอรี่', color: '#D97706', icon: '🍞' },
  ]
  for (const c of newCats) {
    const existing = await prisma.category.findUnique({ where: { name: c.name } })
    if (!existing) {
      const created = await prisma.category.create({ data: c })
      catMap[c.name] = created.id
    } else {
      catMap[c.name] = existing.id
    }
  }

  // Master product list
  const products = [
    // ═══ เครื่องดื่ม ═══
    { sku: 'DRK001', barcode: '8850999220017', name: 'น้ำดื่มสิงห์ 600ml', cat: 'เครื่องดื่ม', cost: 4, sell: 7, unit: 'ขวด', stock: 240, min: 48 },
    { sku: 'DRK002', barcode: '8851959131008', name: 'โค้ก 325ml', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กระป๋อง', stock: 96, min: 24 },
    { sku: 'DRK003', barcode: '8850124000118', name: 'ชาเขียวอิชิตัน 420ml', cat: 'เครื่องดื่ม', cost: 12, sell: 20, unit: 'ขวด', stock: 48, min: 12 },
    { sku: 'DRK004', barcode: '8851952400015', name: 'เอ็ม-150', cat: 'เครื่องดื่ม', cost: 7, sell: 10, unit: 'ขวด', stock: 120, min: 24 },
    { sku: 'DRK005', barcode: '8858891300017', name: 'นมหนองโพ UHT 225ml', cat: 'เครื่องดื่ม', cost: 9, sell: 14, unit: 'กล่อง', stock: 96, min: 24 },
    { sku: 'DRK006', barcode: '8850999220024', name: 'น้ำดื่มสิงห์ 1.5L', cat: 'เครื่องดื่ม', cost: 8, sell: 14, unit: 'ขวด', stock: 60, min: 12 },
    { sku: 'DRK007', barcode: '8851959131015', name: 'แฟนต้าองุ่น 325ml', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กระป๋อง', stock: 48, min: 12 },
    { sku: 'DRK008', barcode: '8851959131022', name: 'สไปรท์ 325ml', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กระป๋อง', stock: 48, min: 12 },
    { sku: 'DRK009', barcode: '8850389100017', name: 'กาแฟเบอร์ดี้ 3in1', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง', stock: 200, min: 50 },
    { sku: 'DRK010', barcode: '8850389100024', name: 'โอวัลติน 3in1', cat: 'เครื่องดื่ม', cost: 5, sell: 8, unit: 'ซอง', stock: 150, min: 30 },
    { sku: 'DRK011', barcode: '8851123100011', name: 'น้ำแข็ง ถุงเล็ก', cat: 'เครื่องดื่ม', cost: 5, sell: 10, unit: 'ถุง', stock: 30, min: 10 },
    { sku: 'DRK012', barcode: '8851123100028', name: 'เรดบูล กระป๋อง', cat: 'เครื่องดื่ม', cost: 8, sell: 12, unit: 'กระป๋อง', stock: 60, min: 12 },
    { sku: 'DRK013', barcode: '8851123100035', name: 'ลิปตัน ชามะนาว 330ml', cat: 'เครื่องดื่ม', cost: 10, sell: 15, unit: 'ขวด', stock: 36, min: 12 },

    // ═══ ขนม ═══
    { sku: 'SNK001', barcode: '8850718800100', name: 'เลย์ คลาสสิค 75g', cat: 'ขนม', cost: 15, sell: 22, unit: 'ซอง', stock: 60, min: 15 },
    { sku: 'SNK002', barcode: '8850718800209', name: 'ปาร์ตี้ กุ้ง 70g', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง', stock: 48, min: 12 },
    { sku: 'SNK003', barcode: '8851123212345', name: 'โปกกี้ ช็อกโกแลต', cat: 'ขนม', cost: 14, sell: 22, unit: 'กล่อง', stock: 36, min: 10 },
    { sku: 'SNK004', barcode: '8850987654321', name: 'ลูกอม ฮอลล์ มิ้นท์', cat: 'ขนม', cost: 3, sell: 5, unit: 'ซอง', stock: 100, min: 20 },
    { sku: 'SNK005', barcode: '8850718800216', name: 'ทวิสตี้ ชีส 65g', cat: 'ขนม', cost: 12, sell: 20, unit: 'ซอง', stock: 48, min: 12 },
    { sku: 'SNK006', barcode: '8850718800223', name: 'เลย์ สาหร่าย 75g', cat: 'ขนม', cost: 15, sell: 22, unit: 'ซอง', stock: 48, min: 12 },
    { sku: 'SNK007', barcode: '8850718800230', name: 'ขนมปลาเส้น ทาโร่', cat: 'ขนม', cost: 5, sell: 10, unit: 'ซอง', stock: 80, min: 20 },
    { sku: 'SNK008', barcode: '8850718800247', name: 'บิสกิต โอรีโอ', cat: 'ขนม', cost: 12, sell: 18, unit: 'ห่อ', stock: 36, min: 10 },
    { sku: 'SNK009', barcode: '8850718800254', name: 'ลูกอม มิ้นท์ตี้', cat: 'ขนม', cost: 1, sell: 2, unit: 'เม็ด', stock: 200, min: 50 },
    { sku: 'SNK010', barcode: '8850718800261', name: 'หมากฝรั่ง ล็อตเต้', cat: 'ขนม', cost: 3, sell: 5, unit: 'แผง', stock: 60, min: 15 },

    // ═══ อาหารสำเร็จรูป ═══
    { sku: 'INS001', barcode: '8850987001001', name: 'มาม่า หมูสับ', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง', stock: 200, min: 60 },
    { sku: 'INS002', barcode: '8850987001002', name: 'มาม่า ต้มยำกุ้ง', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง', stock: 200, min: 60 },
    { sku: 'INS003', barcode: '8850100100100', name: 'ปลากระป๋อง ปุ้มปุ้ย', cat: 'อาหารสำเร็จรูป', cost: 15, sell: 22, unit: 'กระป๋อง', stock: 80, min: 20 },
    { sku: 'INS004', barcode: '8850987001003', name: 'มาม่า เย็นตาโฟ', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง', stock: 120, min: 30 },
    { sku: 'INS005', barcode: '8850987001004', name: 'ไวไว ต้มยำ', cat: 'อาหารสำเร็จรูป', cost: 5, sell: 7, unit: 'ซอง', stock: 100, min: 30 },
    { sku: 'INS006', barcode: '8850100100117', name: 'ปลากระป๋อง สามแม่ครัว', cat: 'อาหารสำเร็จรูป', cost: 18, sell: 25, unit: 'กระป๋อง', stock: 48, min: 12 },
    { sku: 'INS007', barcode: '8850100100124', name: 'โจ๊ก คนอร์ หมู', cat: 'อาหารสำเร็จรูป', cost: 6, sell: 10, unit: 'ซอง', stock: 60, min: 15 },
    { sku: 'INS008', barcode: '8850100100131', name: 'ข้าวต้ม คนอร์ กุ้ง', cat: 'อาหารสำเร็จรูป', cost: 6, sell: 10, unit: 'ซอง', stock: 60, min: 15 },

    // ═══ ของใช้ในบ้าน ═══
    { sku: 'HOU001', barcode: '8851932300017', name: 'ผงซักฟอก บรีส 400g', cat: 'ของใช้ในบ้าน', cost: 22, sell: 35, unit: 'ถุง', stock: 40, min: 10 },
    { sku: 'HOU002', barcode: '8851932400014', name: 'น้ำยาล้างจาน ซันไลต์ 500ml', cat: 'ของใช้ในบ้าน', cost: 18, sell: 29, unit: 'ขวด', stock: 30, min: 8 },
    { sku: 'HOU003', barcode: '8851777100100', name: 'กระดาษทิชชู่ สก๊อตต์ 6ม้วน', cat: 'ของใช้ในบ้าน', cost: 45, sell: 65, unit: 'แพ็ค', stock: 24, min: 6 },
    { sku: 'HOU004', barcode: '8851932300024', name: 'น้ำยาปรับผ้านุ่ม ดาวน์นี่ 600ml', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'ถุง', stock: 24, min: 6 },
    { sku: 'HOU005', barcode: '8851932300031', name: 'สบู่ลักส์ 70g', cat: 'ของใช้ในบ้าน', cost: 12, sell: 18, unit: 'ก้อน', stock: 48, min: 12 },
    { sku: 'HOU006', barcode: '8851932300048', name: 'แชมพู ซันซิล 180ml', cat: 'ของใช้ในบ้าน', cost: 35, sell: 55, unit: 'ขวด', stock: 20, min: 5 },
    { sku: 'HOU007', barcode: '8851932300055', name: 'ยาสีฟัน คอลเกต 150g', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'หลอด', stock: 24, min: 6 },
    { sku: 'HOU008', barcode: '8851932300062', name: 'แปรงสีฟัน คอลเกต', cat: 'ของใช้ในบ้าน', cost: 15, sell: 25, unit: 'อัน', stock: 30, min: 8 },
    { sku: 'HOU009', barcode: '8851932300079', name: 'ถุงขยะ ดำ 24x28"', cat: 'ของใช้ในบ้าน', cost: 15, sell: 25, unit: 'แพ็ค', stock: 30, min: 8 },
    { sku: 'HOU010', barcode: '8851932300086', name: 'น้ำยาล้างห้องน้ำ วิกซอล', cat: 'ของใช้ในบ้าน', cost: 25, sell: 39, unit: 'ขวด', stock: 15, min: 5 },
    { sku: 'HOU011', barcode: '8851932300093', name: 'ผ้าอนามัย โซฟี 10ชิ้น', cat: 'ของใช้ในบ้าน', cost: 18, sell: 29, unit: 'ห่อ', stock: 24, min: 6 },
    { sku: 'HOU012', barcode: '8851932300109', name: 'ยากันยุง จัมโบ้ 10ขด', cat: 'ของใช้ในบ้าน', cost: 20, sell: 32, unit: 'กล่อง', stock: 20, min: 5 },

    // ═══ เครื่องปรุง ═══
    { sku: 'SEA001', barcode: '8850206000012', name: 'น้ำปลา ทิพรส 300ml', cat: 'เครื่องปรุง', cost: 12, sell: 18, unit: 'ขวด', stock: 40, min: 10 },
    { sku: 'SEA002', barcode: '8850206100019', name: 'ซอสหอยนางรม แม่กรุณา', cat: 'เครื่องปรุง', cost: 15, sell: 25, unit: 'ขวด', stock: 30, min: 8 },
    { sku: 'SEA003', barcode: '8850100200200', name: 'น้ำตาลทราย 1kg', cat: 'เครื่องปรุง', cost: 22, sell: 30, unit: 'ถุง', stock: 40, min: 10 },
    { sku: 'SEA004', barcode: '8850206000029', name: 'ซีอิ๊วขาว ถั่วเหลือง 300ml', cat: 'เครื่องปรุง', cost: 12, sell: 18, unit: 'ขวด', stock: 30, min: 8 },
    { sku: 'SEA005', barcode: '8850206000036', name: 'น้ำมันพืช องุ่น 1L', cat: 'เครื่องปรุง', cost: 35, sell: 49, unit: 'ขวด', stock: 20, min: 5 },
    { sku: 'SEA006', barcode: '8850206000043', name: 'ซอสพริก ศรีราชา', cat: 'เครื่องปรุง', cost: 18, sell: 28, unit: 'ขวด', stock: 24, min: 6 },
    { sku: 'SEA007', barcode: '8850206000050', name: 'กะปิ ไทยเดิม 100g', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'กระปุก', stock: 20, min: 5 },
    { sku: 'SEA008', barcode: '8850206000067', name: 'พริกป่น 50g', cat: 'เครื่องปรุง', cost: 8, sell: 12, unit: 'ซอง', stock: 30, min: 8 },
    { sku: 'SEA009', barcode: '8850206000074', name: 'ผงชูรส อายิโนะโมะโต๊ะ 75g', cat: 'เครื่องปรุง', cost: 10, sell: 15, unit: 'ซอง', stock: 40, min: 10 },
    { sku: 'SEA010', barcode: '8850206000081', name: 'เกลือป่น 500g', cat: 'เครื่องปรุง', cost: 5, sell: 8, unit: 'ถุง', stock: 30, min: 8 },

    // ═══ ของสด ═══
    { sku: 'FRS001', name: 'ไข่ไก่', cat: 'ของสด', cost: 3.5, sell: 5, unit: 'ฟอง', stock: 300, min: 60 },
    { sku: 'FRS002', name: 'ข้าวสาร 5kg', cat: 'ของสด', cost: 85, sell: 120, unit: 'ถุง', stock: 20, min: 5 },
    { sku: 'FRS003', name: 'ข้าวเหนียว 1kg', cat: 'ของสด', cost: 25, sell: 35, unit: 'ถุง', stock: 20, min: 5 },
    { sku: 'FRS004', name: 'น้ำแข็งหลอด 1kg', cat: 'ของสด', cost: 5, sell: 10, unit: 'ถุง', stock: 50, min: 15 },
    { sku: 'FRS005', name: 'ถ่านไม้ 1kg', cat: 'ของสด', cost: 10, sell: 18, unit: 'ถุง', stock: 15, min: 5 },

    // ═══ สุขภาพ/ยา ═══
    { sku: 'HLT001', barcode: '8851234567890', name: 'พาราเซตามอล ยาสามัญ', cat: 'สุขภาพ/ยา', cost: 1, sell: 2, unit: 'แผง', stock: 100, min: 20 },
    { sku: 'HLT002', barcode: '8851234567891', name: 'ยาหม่อง ตราถ้วยทอง', cat: 'สุขภาพ/ยา', cost: 15, sell: 25, unit: 'ขวด', stock: 24, min: 6 },
    { sku: 'HLT003', barcode: '8851234567892', name: 'ยาแก้ไอ มิ้นท์', cat: 'สุขภาพ/ยา', cost: 2, sell: 5, unit: 'ซอง', stock: 50, min: 12 },
    { sku: 'HLT004', barcode: '8851234567893', name: 'พลาสเตอร์ปิดแผล 10ชิ้น', cat: 'สุขภาพ/ยา', cost: 8, sell: 15, unit: 'กล่อง', stock: 20, min: 5 },
    { sku: 'HLT005', barcode: '8851234567894', name: 'ยาธาตุน้ำขาว', cat: 'สุขภาพ/ยา', cost: 5, sell: 10, unit: 'ขวด', stock: 15, min: 5 },

    // ═══ เด็ก/นม ═══
    { sku: 'BBY001', barcode: '8851234600001', name: 'นมกล่อง ไมโล 180ml', cat: 'เด็ก/นม', cost: 9, sell: 14, unit: 'กล่อง', stock: 60, min: 15 },
    { sku: 'BBY002', barcode: '8851234600002', name: 'นมเปรี้ยว ดัชมิลล์ 180ml', cat: 'เด็ก/นม', cost: 7, sell: 12, unit: 'กล่อง', stock: 60, min: 15 },
    { sku: 'BBY003', barcode: '8851234600003', name: 'โยเกิร์ต ดัชชี่ 135g', cat: 'เด็ก/นม', cost: 8, sell: 12, unit: 'ถ้วย', stock: 30, min: 8 },

    // ═══ ขนมปัง/เบเกอรี่ ═══
    { sku: 'BKR001', barcode: '8851234700001', name: 'ขนมปังกะโหลก ฟาร์มเฮ้าส์', cat: 'ขนมปัง/เบเกอรี่', cost: 22, sell: 32, unit: 'ถุง', stock: 15, min: 5 },
    { sku: 'BKR002', barcode: '8851234700002', name: 'ขนมปังปิ้ง แซนวิช', cat: 'ขนมปัง/เบเกอรี่', cost: 18, sell: 28, unit: 'ถุง', stock: 15, min: 5 },
  ]

  let created = 0
  let updated = 0

  for (const p of products) {
    const catId = catMap[p.cat]
    if (!catId) { console.log(`❌ ไม่พบหมวดหมู่: ${p.cat}`); continue }

    const existing = await prisma.product.findUnique({ where: { sku: p.sku } })
    if (existing) {
      await prisma.product.update({
        where: { sku: p.sku },
        data: { name: p.name, categoryId: catId, costPrice: p.cost, sellPrice: p.sell, unit: p.unit, stock: p.stock, minStock: p.min, imageUrl: null, isActive: true },
      })
      updated++
    } else {
      await prisma.product.create({
        data: {
          sku: p.sku, barcode: p.barcode || null, name: p.name, categoryId: catId,
          costPrice: p.cost, sellPrice: p.sell, unit: p.unit, stock: p.stock, minStock: p.min,
        },
      })
      created++
    }
  }

  console.log(`✅ สร้างใหม่ ${created} รายการ, อัพเดท ${updated} รายการ`)
  console.log(`📦 สินค้าทั้งหมด: ${await prisma.product.count({ where: { isActive: true } })} รายการ`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
