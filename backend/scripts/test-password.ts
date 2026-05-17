import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { username: 'abc' } })
  if (!user) {
    console.log('❌ ไม่พบ user "abc"')
    return
  }
  console.log(`✅ User: ${user.username} (${user.name}) — role=${user.role}, active=${user.isActive}`)
  console.log(`   Password hash: ${user.password.slice(0, 20)}...`)

  for (const candidate of ['1234', 'abc', 'admin', 'password', '0000']) {
    const ok = await bcrypt.compare(candidate, user.password)
    console.log(`   "${candidate}" → ${ok ? '✅ ตรง' : '❌ ไม่ตรง'}`)
  }
}

main().finally(() => prisma.$disconnect())
