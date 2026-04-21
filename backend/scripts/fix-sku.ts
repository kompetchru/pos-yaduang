import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  // ลบสินค้าที่ SKU ขึ้นต้นด้วย P (auto เก่าที่ผิด)
  const bad = await p.product.findMany({ where: { sku: { startsWith: 'P0' } } })
  for (const b of bad) {
    console.log(`ลบ ${b.sku} ${b.name}`)
    await p.saleItem.deleteMany({ where: { productId: b.id } })
    await p.stockMovement.deleteMany({ where: { productId: b.id } })
    await p.product.delete({ where: { id: b.id } })
  }
  console.log(`ลบ ${bad.length} รายการ`)
}
main().catch(console.error).finally(() => p.$disconnect())
