import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const cats = await p.category.findMany({
    include: { products: { select: { sku: true }, orderBy: { sku: 'desc' }, take: 1 } }
  })
  cats.forEach(c => {
    const lastSku = c.products[0]?.sku || 'ไม่มี'
    const prefix = lastSku !== 'ไม่มี' ? lastSku.replace(/\d+$/, '') : '?'
    console.log(`${c.name.padEnd(20)} | prefix: ${prefix.padEnd(5)} | last: ${lastSku}`)
  })
}
main().catch(console.error).finally(() => p.$disconnect())
