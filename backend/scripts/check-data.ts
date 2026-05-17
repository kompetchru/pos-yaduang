/**
 * เช็คจำนวนข้อมูลใน DB
 * Usage: npx ts-node --transpile-only scripts/check-data.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [products, productsActive, settings, sales, users, categories] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.setting.count(),
    prisma.sale.count(),
    prisma.user.count(),
    prisma.category.count(),
  ])

  console.log('📊 ข้อมูลใน DB:')
  console.log(`  Products (ทั้งหมด):       ${products}`)
  console.log(`  Products (active):         ${productsActive}`)
  console.log(`  Categories:                ${categories}`)
  console.log(`  Settings:                  ${settings}`)
  console.log(`  Sales:                     ${sales}`)
  console.log(`  Users:                     ${users}`)

  if (settings > 0) {
    console.log('\n⚙️  Settings:')
    const all = await prisma.setting.findMany()
    for (const s of all) {
      const v = s.value.length > 50 ? s.value.slice(0, 50) + '...' : s.value
      console.log(`    ${s.key} = ${v}`)
    }
  }

  if (productsActive > 0) {
    console.log('\n📦 ตัวอย่าง products (5 แรก):')
    const ps = await prisma.product.findMany({ where: { isActive: true }, take: 5 })
    for (const p of ps) {
      console.log(`    ${p.sku.padEnd(10)} ${p.name.slice(0, 30).padEnd(30)} stock=${p.stock} active=${p.isActive}`)
    }
  }
}

main().finally(() => prisma.$disconnect())
