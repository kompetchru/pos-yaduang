/**
 * เคลียร์ข้อมูล mock ทั้งหมด เตรียมใช้งานจริง
 * เก็บไว้: Users, Settings, Categories
 * ลบ: Sales, SaleItems, StockMovements, Products, Customers, Suppliers
 * 
 * รัน: npx tsx scripts/clear-all-data.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 เริ่มเคลียร์ข้อมูล mock...\n')

  // ลบตามลำดับ (foreign key)
  const saleItems = await prisma.saleItem.deleteMany()
  console.log(`  ลบ SaleItem: ${saleItems.count} รายการ`)

  const stockMovements = await prisma.stockMovement.deleteMany()
  console.log(`  ลบ StockMovement: ${stockMovements.count} รายการ`)

  const sales = await prisma.sale.deleteMany()
  console.log(`  ลบ Sale: ${sales.count} รายการ`)

  const products = await prisma.product.deleteMany()
  console.log(`  ลบ Product: ${products.count} รายการ`)

  const customers = await prisma.customer.deleteMany()
  console.log(`  ลบ Customer: ${customers.count} รายการ`)

  const suppliers = await prisma.supplier.deleteMany()
  console.log(`  ลบ Supplier: ${suppliers.count} รายการ`)

  const auditLogs = await prisma.auditLog.deleteMany()
  console.log(`  ลบ AuditLog: ${auditLogs.count} รายการ`)

  console.log('\n✅ เคลียร์เสร็จ!')
  console.log('\n📌 ข้อมูลที่เก็บไว้:')

  const users = await prisma.user.findMany({ select: { username: true, role: true } })
  console.log(`  Users: ${users.map(u => `${u.username} (${u.role})`).join(', ')}`)

  const categories = await prisma.category.findMany({ select: { name: true, icon: true } })
  console.log(`  Categories: ${categories.map(c => `${c.icon} ${c.name}`).join(', ')}`)

  const settings = await prisma.setting.count()
  console.log(`  Settings: ${settings} รายการ`)

  console.log('\n🎉 พร้อมใช้งานจริงแล้ว!')
  console.log('📌 เพิ่มสินค้าได้ที่เมนู "สินค้า" หรือ import จาก Excel')
}

main().catch(console.error).finally(() => prisma.$disconnect())
