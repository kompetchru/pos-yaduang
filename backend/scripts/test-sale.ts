import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // ดูบิลล่าสุด 5 รายการ
  const recent = await p.sale.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { receiptNo: true, total: true, createdAt: true, status: true },
  })
  console.log('=== บิลล่าสุด 5 รายการ ===')
  recent.forEach(s => console.log(`  ${s.receiptNo} | ${s.createdAt.toISOString()} | ฿${s.total} | ${s.status}`))

  // ดูบิลวันนี้
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySales = await p.sale.count({ where: { createdAt: { gte: today }, status: 'COMPLETED' } })
  console.log(`\nบิลวันนี้: ${todaySales}`)

  // ดู receiptNo ล่าสุด
  const last = await p.sale.findFirst({ orderBy: { receiptNo: 'desc' } })
  console.log(`Receipt ล่าสุด: ${last?.receiptNo}`)

  // ทั้งหมด
  const total = await p.sale.count()
  console.log(`บิลทั้งหมด: ${total}`)
}

main().catch(console.error).finally(() => p.$disconnect())
