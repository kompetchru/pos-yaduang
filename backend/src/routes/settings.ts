import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/settings
router.get('/', authenticate, async (_req, res: Response) => {
  const settings = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return res.json(map)
})

// PUT /api/settings
router.put('/', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const entries = Object.entries(req.body) as [string, string][]

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  return res.json({ message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' })
})

export default router
