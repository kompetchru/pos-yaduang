import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มสร้างข้อมูลตัวอย่าง...')

  // ─── Users ────────────────────────────────────────
  const password = await bcrypt.hash('1234', 10)

  const owner = await prisma.user.upsert({
    where: { username: 'yaduang' },
    update: {},
    create: { name: 'ยายด้วง', username: 'yaduang', password, role: 'OWNER' },
  })

  await prisma.user.upsert({
    where: { username: 'somchai' },
    update: {},
    create: { name: 'สมชาย', username: 'somchai', password, role: 'CASHIER' },
  })

  console.log('✅ สร้างผู้ใช้เรียบร้อย (username: yaduang / somchai, password: 1234)')

  // ─── Categories ───────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'เครื่องดื่ม' }, update: {}, create: { name: 'เครื่องดื่ม', color: '#3B82F6', icon: '🥤' } }),
    prisma.category.upsert({ where: { name: 'ขนม' }, update: {}, create: { name: 'ขนม', color: '#F59E0B', icon: '🍪' } }),
    prisma.category.upsert({ where: { name: 'อาหารสำเร็จรูป' }, update: {}, create: { name: 'อาหารสำเร็จรูป', color: '#EF4444', icon: '🍜' } }),
    prisma.category.upsert({ where: { name: 'ของใช้ในบ้าน' }, update: {}, create: { name: 'ของใช้ในบ้าน', color: '#10B981', icon: '🏠' } }),
    prisma.category.upsert({ where: { name: 'เครื่องปรุง' }, update: {}, create: { name: 'เครื่องปรุง', color: '#8B5CF6', icon: '🧂' } }),
    prisma.category.upsert({ where: { name: 'ของสด' }, update: {}, create: { name: 'ของสด', color: '#06B6D4', icon: '🥬' } }),
    prisma.category.upsert({ where: { name: 'สุขภาพ/ยา' }, update: {}, create: { name: 'สุขภาพ/ยา', color: '#EC4899', icon: '💊' } }),
  ])

  const [drinks, snacks, instant, household, seasoning, fresh, health] = categories
  console.log('✅ สร้างหมวดหมู่ 7 รายการ')

  // ─── Products ─────────────────────────────────────
  const products = [
    // เครื่องดื่ม
    { sku: 'DRK001', barcode: '8850999220017', name: 'น้ำดื่มสิงห์ 600ml', categoryId: drinks.id, costPrice: 4, sellPrice: 7, unit: 'ขวด', stock: 120, minStock: 24 },
    { sku: 'DRK002', barcode: '8851959131008', name: 'โค้ก 325ml', categoryId: drinks.id, costPrice: 8, sellPrice: 12, unit: 'กระป๋อง', stock: 48, minStock: 12 },
    { sku: 'DRK003', barcode: '8850124000118', name: 'ชาเขียวอิชิตัน 420ml', categoryId: drinks.id, costPrice: 12, sellPrice: 20, unit: 'ขวด', stock: 36, minStock: 12 },
    { sku: 'DRK004', barcode: '8851952400015', name: 'เอ็ม-150', categoryId: drinks.id, costPrice: 7, sellPrice: 10, unit: 'ขวด', stock: 60, minStock: 12 },
    { sku: 'DRK005', barcode: '8858891300017', name: 'นมหนองโพ UHT 225ml', categoryId: drinks.id, costPrice: 9, sellPrice: 14, unit: 'กล่อง', stock: 48, minStock: 12 },

    // ขนม
    { sku: 'SNK001', barcode: '8850718800100', name: 'เลย์ คลาสสิค 75g', categoryId: snacks.id, costPrice: 15, sellPrice: 22, unit: 'ซอง', stock: 30, minStock: 10 },
    { sku: 'SNK002', barcode: '8850718800209', name: 'ปาร์ตี้ กุ้ง 70g', categoryId: snacks.id, costPrice: 12, sellPrice: 20, unit: 'ซอง', stock: 24, minStock: 10 },
    { sku: 'SNK003', barcode: '8851123212345', name: 'โปกกี้ ช็อกโกแลต', categoryId: snacks.id, costPrice: 14, sellPrice: 22, unit: 'กล่อง', stock: 20, minStock: 8 },
    { sku: 'SNK004', barcode: '8850987654321', name: 'ลูกอม ฮอลล์ มิ้นท์', categoryId: snacks.id, costPrice: 3, sellPrice: 5, unit: 'ซอง', stock: 50, minStock: 15 },

    // อาหารสำเร็จรูป
    { sku: 'INS001', barcode: '8850987001001', name: 'มาม่า หมูสับ', categoryId: instant.id, costPrice: 5, sellPrice: 7, unit: 'ซอง', stock: 100, minStock: 30 },
    { sku: 'INS002', barcode: '8850987001002', name: 'มาม่า ต้มยำกุ้ง', categoryId: instant.id, costPrice: 5, sellPrice: 7, unit: 'ซอง', stock: 80, minStock: 30 },
    { sku: 'INS003', barcode: '8850100100100', name: 'ปลากระป๋อง ปุ้มปุ้ย', categoryId: instant.id, costPrice: 15, sellPrice: 22, unit: 'กระป๋อง', stock: 40, minStock: 10 },

    // ของใช้ในบ้าน
    { sku: 'HOU001', barcode: '8851932300017', name: 'ผงซักฟอก บรีส 400g', categoryId: household.id, costPrice: 22, sellPrice: 35, unit: 'ถุง', stock: 20, minStock: 5 },
    { sku: 'HOU002', barcode: '8851932400014', name: 'น้ำยาล้างจาน ซันไลต์ 500ml', categoryId: household.id, costPrice: 18, sellPrice: 29, unit: 'ขวด', stock: 15, minStock: 5 },
    { sku: 'HOU003', barcode: '8851777100100', name: 'กระดาษทิชชู่ สก๊อตต์ 6ม้วน', categoryId: household.id, costPrice: 45, sellPrice: 65, unit: 'แพ็ค', stock: 12, minStock: 4 },

    // เครื่องปรุง
    { sku: 'SEA001', barcode: '8850206000012', name: 'น้ำปลา ทิพรส 300ml', categoryId: seasoning.id, costPrice: 12, sellPrice: 18, unit: 'ขวด', stock: 25, minStock: 5 },
    { sku: 'SEA002', barcode: '8850206100019', name: 'ซอสหอยนางรม แม่กรุณา', categoryId: seasoning.id, costPrice: 15, sellPrice: 25, unit: 'ขวด', stock: 18, minStock: 5 },
    { sku: 'SEA003', barcode: '8850100200200', name: 'น้ำตาลทราย 1kg', categoryId: seasoning.id, costPrice: 22, sellPrice: 30, unit: 'ถุง', stock: 20, minStock: 5 },

    // ของสด
    { sku: 'FRS001', name: 'ไข่ไก่', categoryId: fresh.id, costPrice: 3.5, sellPrice: 5, unit: 'ฟอง', stock: 150, minStock: 30 },
    { sku: 'FRS002', name: 'ข้าวสาร 5kg', categoryId: fresh.id, costPrice: 85, sellPrice: 120, unit: 'ถุง', stock: 10, minStock: 3 },

    // สุขภาพ/ยา
    { sku: 'HLT001', barcode: '8851234567890', name: 'พาราเซตามอล ยาสามัญ', categoryId: health.id, costPrice: 1, sellPrice: 2, unit: 'แผง', stock: 50, minStock: 10 },
    { sku: 'HLT002', barcode: '8851234567891', name: 'ยาหม่อง ตราถ้วยทอง', categoryId: health.id, costPrice: 15, sellPrice: 25, unit: 'ขวด', stock: 15, minStock: 5 },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    })
  }
  console.log(`✅ สร้างสินค้า ${products.length} รายการ`)

  // ─── Suppliers ────────────────────────────────────
  const suppliersData = [
    { name: 'ร้านส่งสมบูรณ์', contactName: 'คุณสมบูรณ์', phone: '081-234-5678', address: 'ตลาดสด อ.เมือง' },
    { name: 'ตัวแทน CP', contactName: 'คุณวิชัย', phone: '089-876-5432', address: '123 ถ.มิตรภาพ' },
    { name: 'ร้านส่งเจริญทรัพย์', contactName: 'คุณเจริญ', phone: '086-111-2222', address: 'ตลาดเทศบาล' },
  ]
  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } })
    if (!existing) await prisma.supplier.create({ data: s })
  }
  console.log('✅ สร้างซัพพลายเออร์ 3 ราย')

  // ─── Customers ────────────────────────────────────
  const customersData = [
    { name: 'ลุงสมหมาย', phone: '081-111-1111', isMember: true, points: 50 },
    { name: 'ป้าสมศรี', phone: '082-222-2222', isMember: true, points: 120 },
    { name: 'น้องเอ็ม', phone: '095-333-3333', isMember: false },
  ]
  for (const c of customersData) {
    const existing = c.phone ? await prisma.customer.findUnique({ where: { phone: c.phone } }) : null
    if (!existing) await prisma.customer.create({ data: c })
  }
  console.log('✅ สร้างลูกค้า 3 ราย')

  // ─── Settings ─────────────────────────────────────
  const defaultSettings = [
    { key: 'store_name', value: 'ร้านชำยายด้วง' },
    { key: 'store_phone', value: '081-999-8888' },
    { key: 'store_address', value: '123 หมู่ 4 ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000' },
    { key: 'receipt_footer', value: 'ขอบคุณที่อุดหนุนค่ะ 🙏' },
    { key: 'vat_enabled', value: 'false' },
    { key: 'vat_rate', value: '7' },
    { key: 'currency', value: 'THB' },
    { key: 'promptpay_id', value: '0819998888' },
  ]

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('✅ สร้างการตั้งค่าเริ่มต้น')

  // ─── Mock Sales (30 วันย้อนหลัง) ─────────────────
  const existingSales = await prisma.sale.count()
  if (existingSales === 0) {
    console.log('🛒 กำลังสร้างยอดขายจำลอง 30 วัน...')

    const allProducts = await prisma.product.findMany({ where: { isActive: true } })
    const allCustomers = await prisma.customer.findMany()
    const paymentMethods = ['CASH', 'CASH', 'CASH', 'TRANSFER', 'QR_PROMPTPAY', 'CARD']

    // สร้างยอดขาย 30 วันย้อนหลัง วันละ 8-20 บิล
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date()
      date.setDate(date.getDate() - dayOffset)
      date.setHours(0, 0, 0, 0)

      // วันธรรมดา 8-15 บิล, เสาร์อาทิตย์ 12-20 บิล
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const billCount = isWeekend
        ? 12 + Math.floor(Math.random() * 9)
        : 8 + Math.floor(Math.random() * 8)

      for (let b = 0; b < billCount; b++) {
        // สุ่มเวลาขาย 06:00 - 21:00
        const hour = 6 + Math.floor(Math.random() * 15)
        const minute = Math.floor(Math.random() * 60)
        const saleDate = new Date(date)
        saleDate.setHours(hour, minute, Math.floor(Math.random() * 60))

        // สุ่มสินค้า 1-5 รายการต่อบิล
        const itemCount = 1 + Math.floor(Math.random() * 5)
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5)
        const pickedProducts = shuffled.slice(0, itemCount)

        let subtotal = 0
        const saleItems = pickedProducts.map((p) => {
          const qty = 1 + Math.floor(Math.random() * 3)
          const price = Number(p.sellPrice)
          const total = price * qty
          subtotal += total
          return {
            productId: p.id,
            productName: p.name,
            unit: p.unit,
            quantity: qty,
            unitPrice: price,
            discount: 0,
            total,
          }
        })

        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        const hasCustomer = Math.random() < 0.3 && allCustomers.length > 0
        const customer = hasCustomer ? allCustomers[Math.floor(Math.random() * allCustomers.length)] : null

        // สุ่มส่วนลดทั้งบิล (20% โอกาส)
        const hasDiscount = Math.random() < 0.2
        const discountAmount = hasDiscount ? Math.floor(Math.random() * 3) * 5 : 0 // 0, 5, 10
        const total = subtotal - discountAmount

        const receiptPrefix = saleDate.toISOString().slice(0, 10).replace(/-/g, '')
        const receiptNo = `${receiptPrefix}${String(b + 1).padStart(4, '0')}`

        // เช็คว่า receiptNo ซ้ำไหม
        const existingReceipt = await prisma.sale.findUnique({ where: { receiptNo } })
        if (existingReceipt) continue

        await prisma.sale.create({
          data: {
            receiptNo,
            userId: owner.id,
            customerId: customer?.id || null,
            subtotal,
            discountAmount,
            discountPercent: 0,
            vatAmount: 0,
            total,
            paymentMethod: method,
            amountPaid: method === 'CASH' ? Math.ceil(total / 100) * 100 : total,
            change: method === 'CASH' ? Math.ceil(total / 100) * 100 - total : 0,
            status: 'COMPLETED',
            createdAt: saleDate,
            items: { create: saleItems },
          },
        })

        // สร้าง stock movements
        for (const item of saleItems) {
          const product = allProducts.find((p) => p.id === item.productId)!
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'SALE',
              quantity: -item.quantity,
              balanceBefore: product.stock,
              balanceAfter: product.stock - item.quantity,
              referenceId: receiptNo,
              note: `ขาย บิล ${receiptNo}`,
              createdAt: saleDate,
            },
          })
        }
      }
    }

    // อัพเดทสต๊อกให้สะท้อนยอดขาย (ลดสต๊อกตามจำนวนที่ขายไป)
    const soldItems = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    })
    for (const sold of soldItems) {
      const product = allProducts.find((p) => p.id === sold.productId)
      if (product) {
        const newStock = Math.max(0, product.stock - (sold._sum.quantity || 0))
        await prisma.product.update({
          where: { id: sold.productId },
          data: { stock: newStock },
        })
      }
    }

    const totalSales = await prisma.sale.count()
    const totalRevenue = await prisma.sale.aggregate({ _sum: { total: true } })
    console.log(`✅ สร้างยอดขาย ${totalSales} บิล (รวม ฿${Number(totalRevenue._sum.total || 0).toLocaleString()})`)
  } else {
    console.log(`⏭️ มียอดขายอยู่แล้ว ${existingSales} บิล — ข้าม`)
  }

  console.log('\n🎉 สร้างข้อมูลตัวอย่างเสร็จสมบูรณ์!')
  console.log('📌 เข้าสู่ระบบด้วย: yaduang / 1234 (เจ้าของร้าน) หรือ somchai / 1234 (แคชเชียร์)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
