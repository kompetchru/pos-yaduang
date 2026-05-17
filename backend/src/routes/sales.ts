import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { generateReceiptNo } from '../utils/receipt'

const router = Router()

// GET /api/sales
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { from, to, method, status, page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: any = {}
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from as string)
    if (to) {
      const toDate = new Date(to as string)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }
  if (method) where.paymentMethod = method
  if (status) where.status = status
  else where.status = { not: 'HELD' }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { user: { select: { name: true } }, customer: { select: { name: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.sale.count({ where }),
  ])

  return res.json({ sales, total })
})

// GET /api/sales/held
router.get('/held', authenticate, async (_req, res: Response) => {
  const held = await prisma.sale.findMany({
    where: { status: 'HELD' },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(held)
})

// GET /api/sales/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const sale = await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true } },
      customer: true,
      items: { include: { product: { select: { imageUrl: true } } } },
    },
  })
  if (!sale) return res.status(404).json({ message: 'ไม่พบบิล' })
  return res.json(sale)
})

// POST /api/sales — สร้างการขาย
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { items, customerId, discountAmount = 0, discountPercent = 0, paymentMethod, amountPaid, note, status = 'COMPLETED' } = req.body

  if (!items || items.length === 0)
    return res.status(400).json({ message: 'กรุณาเพิ่มสินค้าในตะกร้า' })

  // ดึงข้อมูลสินค้าและตรวจสต๊อก
  const productIds = items.map((i: any) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  if (status === 'COMPLETED') {
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return res.status(400).json({ message: `ไม่พบสินค้า ID: ${item.productId}` })
      // ข้ามการเช็คสต๊อกสำหรับ MISC (สินค้าตั้งราคาเอง)
      if (product.sku.startsWith('MISC')) continue
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `สินค้า "${product.name}" สต๊อกไม่พอ (เหลือ ${product.stock})` })
    }
  }

  // คำนวณยอด
  let subtotal = 0
  const saleItems = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId)!
    const unitPrice = parseFloat(item.unitPrice || product.sellPrice.toString())
    const itemDiscount = parseFloat(item.discount || '0')
    const total = unitPrice * item.quantity - itemDiscount
    subtotal += total
    return {
      productId: item.productId,
      // ถ้า frontend ส่ง name มา (custom-priced item) → ใช้ค่านั้น
      productName: item.name || product.name,
      unit: item.unit || product.unit,
      quantity: item.quantity,
      unitPrice,
      discount: itemDiscount,
      total,
    }
  })

  const discAmt = parseFloat(discountAmount)
  const discPct = parseFloat(discountPercent)
  const discountFromPct = subtotal * (discPct / 100)
  const totalDiscount = discAmt + discountFromPct
  const total = subtotal - totalDiscount
  const change = parseFloat(amountPaid) - total

  const receiptNo = await generateReceiptNo()

  // Transaction: สร้างบิล + ตัดสต๊อก
  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        receiptNo,
        userId: req.user!.id,
        customerId: customerId || null,
        subtotal,
        discountAmount: discAmt,
        discountPercent: discPct,
        vatAmount: 0,
        total,
        paymentMethod,
        amountPaid: parseFloat(amountPaid),
        change: Math.max(0, change),
        status,
        note,
        items: { create: saleItems },
      },
      include: { items: true },
    })

    if (status === 'COMPLETED') {
      for (const item of saleItems) {
        const product = products.find((p) => p.id === item.productId)!
        // สินค้า MISC (ตั้งราคาเอง) → ไม่ตัดสต๊อก
        const isMisc = product.sku.startsWith('MISC')
        if (isMisc) continue

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            balanceBefore: product.stock,
            balanceAfter: product.stock - item.quantity,
            referenceId: newSale.id,
            note: `ขาย บิล ${receiptNo}`,
          },
        })
      }

      // เพิ่มแต้มลูกค้า (1 แต้มต่อ 10 บาท)
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { points: { increment: Math.floor(total / 10) } },
        })
      }
    }

    return newSale
  })

  return res.status(201).json(sale)
})

// POST /api/sales/:id/void — ยกเลิกบิล
router.post('/:id/void', authenticate, async (req: AuthRequest, res: Response) => {
  const sale = await prisma.sale.findUnique({ where: { id: req.params.id }, include: { items: true } })
  if (!sale) return res.status(404).json({ message: 'ไม่พบบิล' })
  if (sale.status === 'VOIDED') return res.status(400).json({ message: 'บิลนี้ถูกยกเลิกแล้ว' })

  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id: sale.id }, data: { status: 'VOIDED' } })

    if (sale.status === 'COMPLETED') {
      for (const item of sale.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (product) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
          await tx.stockMovement.create({
            data: {
              productId: item.productId, type: 'RETURN', quantity: item.quantity,
              balanceBefore: product.stock, balanceAfter: product.stock + item.quantity,
              referenceId: sale.id, note: `ยกเลิกบิล ${sale.receiptNo}`,
            },
          })
        }
      }
    }
  })

  return res.json({ message: 'ยกเลิกบิลเรียบร้อยแล้ว' })
})

export default router
