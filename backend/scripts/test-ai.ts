import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const count = await p.saleItem.count()
  const sales = await p.sale.count()
  console.log('SaleItems:', count, 'Sales:', sales)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recent = await p.saleItem.count({
    where: { sale: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } } },
  })
  console.log('Recent sale items (30d):', recent)

  const products = await p.product.findMany({ where: { isActive: true } })
  console.log('Active products:', products.length)

  // Simulate insights logic
  const saleItems = await p.saleItem.findMany({
    where: { sale: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } } },
    select: { productId: true, productName: true, quantity: true, total: true },
  })

  const prodMap: Record<string, { name: string; qty: number; rev: number }> = {}
  for (const item of saleItems) {
    if (!prodMap[item.productId]) prodMap[item.productId] = { name: item.productName, qty: 0, rev: 0 }
    prodMap[item.productId].qty += item.quantity
    prodMap[item.productId].rev += Number(item.total)
  }
  const top = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 5)
  console.log('\nTop 5 products:')
  top.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}: ${p.qty} ชิ้น (฿${p.rev})`))

  const totalRev = (await p.sale.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
    select: { total: true },
  })).reduce((s, x) => s + Number(x.total), 0)
  console.log(`\nTotal revenue 30d: ฿${totalRev}`)
  console.log(`Avg daily: ฿${(totalRev / 30).toFixed(0)}`)
}

main().catch(console.error).finally(() => p.$disconnect())
