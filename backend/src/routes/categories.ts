import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, async (_req, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return res.json(categories)
})

router.post('/', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { name, color, icon } = req.body
  const category = await prisma.category.create({ data: { name, color, icon } })
  return res.status(201).json(category)
})

router.put('/:id', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  })
  return res.json(category)
})

router.delete('/:id', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  return res.json({ message: 'ลบหมวดหมู่เรียบร้อยแล้ว' })
})

export default router
