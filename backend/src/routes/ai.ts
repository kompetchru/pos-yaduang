import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/insights', authenticate, async (_req: any, res: Response) => {
  try {
  const d30 = new Date(Date.now() - 30 * 86400000)
  const d60 = new Date(Date.now() - 60 * 86400000)
  const d7 = new Date(Date.now() - 7 * 86400000)

  const [saleItems, sales, salesPrev, allProducts, recentSales] = await Promise.all([
    prisma.saleItem.findMany({
      where: { sale: { status: 'COMPLETED', createdAt: { gte: d30 } } },
      select: { productId: true, productName: true, quantity: true, total: true },
    }),
    prisma.sale.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: d30 } },
      select: { total: true, createdAt: true, paymentMethod: true },
    }),
    prisma.sale.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: d60, lt: d30 } },
      select: { total: true },
    }),
    prisma.product.findMany({ where: { isActive: true }, include: { category: true } }),
    prisma.sale.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: d7 } },
      select: { total: true },
    }),
  ])

  const prodMap: Record<string, { productId: string; productName: string; qty: number; revenue: number }> = {}
  for (const item of saleItems) {
    if (!prodMap[item.productId]) prodMap[item.productId] = { productId: item.productId, productName: item.productName, qty: 0, revenue: 0 }
    prodMap[item.productId].qty += item.quantity
    prodMap[item.productId].revenue += Number(item.total)
  }
  const topProducts = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 10)

  const dayMap: Record<string, number> = {}
  for (const s of sales) { const day = s.createdAt.toISOString().slice(0, 10); dayMap[day] = (dayMap[day] || 0) + Number(s.total) }
  const salesByDay = Object.entries(dayMap).map(([day, total]) => ({ day, total })).sort((a, b) => a.day.localeCompare(b.day))

  const lowStock = allProducts.filter(p => p.stock <= p.minStock).map(p => ({ name: p.name, stock: p.stock, minStock: p.minStock, category: p.category?.name }))

  const lines: string[] = []
  const rev30 = sales.reduce((s, x) => s + Number(x.total), 0)
  const revPrev = salesPrev.reduce((s, x) => s + Number(x.total), 0)
  const avg = rev30 / 30
  const avgPrev = revPrev / 30
  const growth = avgPrev > 0 ? ((avg - avgPrev) / avgPrev * 100) : 0

  if (growth > 5) lines.push('📈 ยอดขายเฉลี่ย/วัน ฿' + avg.toFixed(0) + ' เพิ่มขึ้น ' + growth.toFixed(0) + '% จากเดือนก่อน — ร้านกำลังไปได้ดี!')
  else if (growth < -5) lines.push('📉 ยอดขายเฉลี่ย/วัน ฿' + avg.toFixed(0) + ' ลดลง ' + Math.abs(growth).toFixed(0) + '% จากเดือนก่อน — ควรจัดโปรโมชั่น')
  else lines.push('📊 ยอดขายเฉลี่ย/วัน ฿' + avg.toFixed(0) + ' ทรงตัวจากเดือนก่อน')

  if (topProducts.length > 0) {
    const t3 = topProducts.slice(0, 3)
    lines.push('🏆 สินค้าขายดี Top 3: ' + t3.map((p, i) => (i + 1) + '. ' + p.productName + ' (' + p.qty + ' ชิ้น, ฿' + p.revenue.toFixed(0) + ')').join(' | '))
  }

  const urgent = lowStock.filter(p => p.stock <= 0)
  const warn = lowStock.filter(p => p.stock > 0)
  if (urgent.length > 0) lines.push('🚨 สินค้าหมดสต๊อก ' + urgent.length + ' รายการ: ' + urgent.slice(0, 5).map(p => p.name).join(', ') + ' — ต้องสั่งด่วน!')
  if (warn.length > 0) lines.push('⚠️ สินค้าใกล้หมด ' + warn.length + ' รายการ: ' + warn.slice(0, 5).map(p => p.name + ' (เหลือ ' + p.stock + ')').join(', '))

  if (salesByDay.length > 0) {
    const best = salesByDay.reduce((b, d) => d.total > b.total ? d : b, salesByDay[0])
    lines.push('🗓️ วันที่ขายดีที่สุด: ' + best.day + ' ยอด ฿' + best.total.toFixed(0))
  }

  const mc: Record<string, number> = {}
  for (const s of sales) mc[s.paymentMethod] = (mc[s.paymentMethod] || 0) + 1
  const ml: Record<string, string> = { CASH: 'เงินสด', TRANSFER: 'โอนเงิน', QR_KSHOP: 'QR ธนาคาร', QR_PROMPTPAY: 'QR PromptPay', CARD: 'บัตร' }
  const tm = Object.entries(mc).sort((a, b) => b[1] - a[1])[0]
  if (tm) lines.push('💳 ช่องทางชำระเงินหลัก: ' + (ml[tm[0]] || tm[0]) + ' (' + (tm[1] / sales.length * 100).toFixed(0) + '%)')

  const cm: Record<string, { name: string; rev: number }> = {}
  for (const item of saleItems) {
    const p = allProducts.find(x => x.id === item.productId)
    const cn = p?.category?.name || 'อื่นๆ'
    if (!cm[cn]) cm[cn] = { name: cn, rev: 0 }
    cm[cn].rev += Number(item.total)
  }
  const tc = Object.values(cm).sort((a, b) => b.rev - a.rev).slice(0, 3)
  if (tc.length > 0) lines.push('📦 หมวดหมู่ขายดี: ' + tc.map(c => c.name + ' (฿' + c.rev.toFixed(0) + ')').join(', '))

  const l7 = recentSales.reduce((s, x) => s + Number(x.total), 0)
  lines.push('📅 ยอดขาย 7 วันล่าสุด: ฿' + l7.toFixed(0) + ' (เฉลี่ย ฿' + (l7 / 7).toFixed(0) + '/วัน)')

  return res.json({
    insights: lines.join('\n\n'),
    aiInsights: null,
    data: { topProducts, salesByDay, lowStock },
    summary: { totalRevenue30: rev30, totalBills30: sales.length, avgDaily: Math.round(avg), growthPct: Math.round(growth), totalProducts: allProducts.length, lowStockCount: lowStock.length },
  })
  } catch (err: any) {
    console.error('AI Insights Error:', err)
    return res.status(500).json({ error: err.message })
  }
})

router.get('/recommendations', authenticate, async (_req: any, res: Response) => {
  const d30 = new Date(Date.now() - 30 * 86400000)
  const products = await prisma.product.findMany({ where: { isActive: true }, include: { category: true } })
  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { status: 'COMPLETED', createdAt: { gte: d30 } } },
    select: { productId: true, quantity: true },
  })

  const sm: Record<string, number> = {}
  for (const i of saleItems) sm[i.productId] = (sm[i.productId] || 0) + i.quantity

  const recs = products.map(p => {
    const sold = sm[p.id] || 0
    const daily = sold / 30
    const days = daily > 0 ? Math.floor(p.stock / daily) : 999
    const order = daily > 0 ? Math.max(0, Math.ceil(daily * 14) - p.stock) : (p.stock <= p.minStock ? p.minStock * 2 : 0)
    const urg = p.stock <= 0 ? 'หมด' : p.stock <= p.minStock ? 'ใกล้หมด' : days <= 7 ? 'เหลือน้อย' : 'ปกติ'
    return { id: p.id, name: p.name, sku: p.sku, category: p.category?.name, categoryIcon: p.category?.icon, unit: p.unit, stock: p.stock, minStock: p.minStock, costPrice: Number(p.costPrice), soldLast30Days: sold, dailyAvg: Math.round(daily * 10) / 10, daysOfStock: days, suggestedOrder: order, orderCost: order * Number(p.costPrice), urgency: urg }
  }).filter(p => p.suggestedOrder > 0).sort((a, b) => {
    const o: Record<string, number> = { 'หมด': 0, 'ใกล้หมด': 1, 'เหลือน้อย': 2, 'ปกติ': 3 }
    return (o[a.urgency] || 3) - (o[b.urgency] || 3) || b.soldLast30Days - a.soldLast30Days
  })

  return res.json({
    recommendations: recs,
    summary: { totalItems: recs.length, totalOrderCost: Math.round(recs.reduce((s, r) => s + r.orderCost, 0)), outOfStock: recs.filter(r => r.urgency === 'หมด').length, lowStock: recs.filter(r => r.urgency === 'ใกล้หมด').length },
  })
})

export default router
