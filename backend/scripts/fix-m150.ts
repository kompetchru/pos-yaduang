import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const m150 = await p.product.findFirst({ where: { name: { contains: 'M-150' } } })
  if (m150) {
    await p.product.update({
      where: { id: m150.id },
      data: { barcode: '8851952003007' },
    })
    console.log(`✅ แก้ M-150: barcode → 8851952003007 (SKU: ${m150.sku})`)
  } else {
    console.log('❌ ไม่พบ M-150')
  }
}
main().catch(console.error).finally(() => p.$disconnect())
