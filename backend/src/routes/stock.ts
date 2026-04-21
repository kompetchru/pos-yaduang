import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/stock/movements
router.get('/movements', authenticate, async (req: AuthRequest, res: Response) => {
  const { productId, type, page = '1', limit = '30' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: any = {}
  if (productId) where.productId = productId
  if (type) where.type = type

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { product: { select: { name: true, sku: true } }, supplier: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.stockMovement.count({ where }),
  ])

  return res.json({ movements, total })
})

// POST /api/stock/receive — รับสินค้าเข้า
router.post('/receive', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { items, supplierId, note } = req.body
  // items: [{ productId, quantity, costPrice? }]

  const results = await prisma.$transaction(async (tx) => {
    const movements = []
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) continue

      const updated = await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          ...(item.costPrice ? { costPrice: parseFloat(item.costPrice) } : {}),
        },
      })

      const movement = await tx.stockMovement.create({
        data: {
          productId: item.productId, type: 'PURCHASE', quantity: item.quantity,
          balanceBefore: product.stock, balanceAfter: updated.stock,
          supplierId: supplierId || null, note: note || 'รับสินค้าเข้า',
        },
      })
      movements.push(movement)
    }
    return movements
  })

  return res.status(201).json(results)
})

// POST /api/stock/adjust — ปรับยอดสต๊อก
router.post('/adjust', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { productId, newStock, note } = req.body

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' })

  const diff = newStock - product.stock

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { stock: newStock } })
    await tx.stockMovement.create({
      data: {
        productId, type: 'ADJUSTMENT', quantity: diff,
        balanceBefore: product.stock, balanceAfter: newStock,
        note: note || `ปรับยอดสต๊อก: ${product.stock} → ${newStock}`,
      },
    })
  })

  return res.json({ message: 'ปรับยอดสต๊อกเรียบร้อยแล้ว' })
})

export default router
