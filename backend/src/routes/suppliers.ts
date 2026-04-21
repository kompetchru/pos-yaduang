import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, async (_req, res: Response) => {
  const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return res.json(suppliers)
})

router.post('/', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const supplier = await prisma.supplier.create({ data: req.body })
  return res.status(201).json(supplier)
})

router.put('/:id', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body })
  return res.json(supplier)
})

router.delete('/:id', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.supplier.update({ where: { id: req.params.id }, data: { isActive: false } })
  return res.json({ message: 'ลบซัพพลายเออร์เรียบร้อยแล้ว' })
})

export default router
