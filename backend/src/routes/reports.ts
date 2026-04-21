import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/reports/dashboard
router.get('/dashboard', authenticate, async (_req, res: Response) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [todaySales, weekSales, monthSales, totalProducts, allProducts, todayTransactions] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: weekAgo }, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: monthStart }, status: 'COMPLETED' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { stock: true, minStock: true } }),
      prisma.sale.findMany({
        where: { createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
        select: { total: true, paymentMethod: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

  const lowStockCount = allProducts.filter(p => p.stock <= p.minStock).length

  return res.json({
    todaySales: { total: todaySales._sum.total || 0, count: todaySales._count },
    weekSales: { total: weekSales._sum.total || 0 },
    monthSales: { total: monthSales._sum.total || 0, count: monthSales._count },
    totalProducts,
    lowStockCount,
    recentTransactions: todayTransactions,
  })
})

// GET /api/reports/sales-summary
router.get('/sales-summary', authenticate, async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query

  const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to as string) : new Date()
  toDate.setHours(23, 59, 59, 999)

  const sales = await prisma.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: fromDate, lte: toDate } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day
  const grouped: Record<string, { period: string; count: number; total: number }> = {}
  for (const sale of sales) {
    const day = sale.createdAt.toISOString().slice(0, 10)
    if (!grouped[day]) grouped[day] = { period: day, count: 0, total: 0 }
    grouped[day].count++
    grouped[day].total += Number(sale.total)
  }

  return res.json(Object.values(grouped))
})

// GET /api/reports/top-products
router.get('/top-products', authenticate, async (req: AuthRequest, res: Response) => {
  const { limit = '10', from, to } = req.query

  const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to as string) : new Date()
  toDate.setHours(23, 59, 59, 999)

  const saleItems = await prisma.saleItem.findMany({
    where: {
      sale: { status: 'COMPLETED', createdAt: { gte: fromDate, lte: toDate } },
    },
    select: { productId: true, productName: true, quantity: true, total: true },
  })

  // Aggregate
  const map: Record<string, { productId: string; productName: string; totalQty: number; totalRevenue: number }> = {}
  for (const item of saleItems) {
    if (!map[item.productId]) {
      map[item.productId] = { productId: item.productId, productName: item.productName, totalQty: 0, totalRevenue: 0 }
    }
    map[item.productId].totalQty += item.quantity
    map[item.productId].totalRevenue += Number(item.total)
  }

  const sorted = Object.values(map).sort((a, b) => b.totalQty - a.totalQty).slice(0, parseInt(limit as string))
  return res.json(sorted)
})

// GET /api/reports/profit
router.get('/profit', authenticate, async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query

  const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to as string) : new Date()
  toDate.setHours(23, 59, 59, 999)

  const saleItems = await prisma.saleItem.findMany({
    where: {
      sale: { status: 'COMPLETED', createdAt: { gte: fromDate, lte: toDate } },
    },
    include: { product: { select: { costPrice: true } } },
  })

  let revenue = 0
  let cost = 0
  for (const item of saleItems) {
    revenue += Number(item.total)
    cost += item.quantity * Number(item.product.costPrice)
  }

  return res.json([{ revenue, cost, profit: revenue - cost }])
})

// GET /api/reports/payment-methods
router.get('/payment-methods', authenticate, async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query

  const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to as string) : new Date()
  toDate.setHours(23, 59, 59, 999)

  const sales = await prisma.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: fromDate, lte: toDate } },
    select: { paymentMethod: true, total: true },
  })

  const map: Record<string, { method: string; count: number; total: number }> = {}
  for (const sale of sales) {
    if (!map[sale.paymentMethod]) map[sale.paymentMethod] = { method: sale.paymentMethod, count: 0, total: 0 }
    map[sale.paymentMethod].count++
    map[sale.paymentMethod].total += Number(sale.total)
  }

  return res.json(Object.values(map).sort((a, b) => b.total - a.total))
})

export default router
