import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  console.log('👥 Users in DB:')
  for (const u of users) {
    console.log(`  ${u.username.padEnd(15)} ${u.name.padEnd(20)} role=${u.role.padEnd(8)} active=${u.isActive}`)
  }
}

main().finally(() => prisma.$disconnect())
