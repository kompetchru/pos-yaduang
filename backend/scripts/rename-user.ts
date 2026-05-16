import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  await p.user.update({ where: { username: 'yaduang' }, data: { username: 'abc' } })
  console.log('Done: username yaduang -> abc')
}
main().catch(console.error).finally(() => p.$disconnect())
