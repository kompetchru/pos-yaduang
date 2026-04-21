import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { search } = req.query
  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string } },
    ]
  }
  const customers = await prisma.customer.findMany({ where, orderBy: { name: 'asc' } })
  return res.json(customers)
})

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { sales: { orderBy: { createdAt: 'desc' }, take: 10 } },
  })
  if (!customer) return res.status(404).json({ message: 'ไม่พบลูกค้า' })
  return res.json(customer)
})

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, phone, address, isMember } = req.body
  const customer = await prisma.customer.create({ data: { name, phone, address, isMember } })
  return res.status(201).json(customer)
})

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body })
  return res.json(customer)
})

export default router
