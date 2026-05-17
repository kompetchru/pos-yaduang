import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(__dirname, '../../uploads/products')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// GET /api/products
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { search, categoryId, lowStock, page = '1', limit = '50' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: any = { isActive: true }
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { sku: { contains: search as string } },
      { barcode: { contains: search as string } },
    ]
  }
  if (categoryId) where.categoryId = categoryId

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.product.count({ where }),
  ])

  return res.json({ products, total, page: parseInt(page as string), limit: parseInt(limit as string) })
})

// GET /api/products/low-stock
router.get('/low-stock', authenticate, async (_req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { lte: 0 } },
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  // Also get products where stock <= minStock
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock)
  return res.json(lowStockProducts)
})

// GET /api/products/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true, stockMovements: { take: 10, orderBy: { createdAt: 'desc' } } },
  })
  if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' })
  return res.json(product)
})

// POST /api/products
router.post('/', authenticate, requireRole('OWNER', 'ADMIN'), upload.single('image'), async (req: AuthRequest, res: Response) => {
  let { sku, barcode, name, description, categoryId, costPrice, sellPrice, unit, stock, minStock, unitOptions } = req.body

  // Auto generate SKU ถ้าไม่ได้ส่งมา — ดูจาก prefix ของหมวดหมู่
  if (!sku || sku === 'AUTO') {
    // หา prefix จาก SKU ที่มีอยู่ในหมวดเดียวกัน
    const existingProducts = await prisma.product.findMany({
      where: { categoryId },
      select: { sku: true },
      orderBy: { sku: 'desc' },
    })

    // หา prefix ที่ใช้บ่อยที่สุดในหมวดนี้ (ไม่นับ P prefix)
    const prefixCount: Record<string, number> = {}
    for (const p of existingProducts) {
      const match = p.sku.match(/^([A-Z]+)\d+$/)
      if (match && match[1] !== 'P') {
        prefixCount[match[1]] = (prefixCount[match[1]] || 0) + 1
      }
    }

    let prefix = 'PRD'
    const topPrefix = Object.entries(prefixCount).sort((a, b) => b[1] - a[1])[0]
    if (topPrefix) {
      prefix = topPrefix[0]
    } else {
      // ถ้าหมวดนี้ยังไม่มี SKU เลย ใช้ category name map
      const catPrefixMap: Record<string, string> = {
        'เครื่องดื่ม': 'DRK', 'ขนม': 'SNK', 'อาหารสำเร็จรูป': 'INS',
        'ของใช้ในบ้าน': 'HOU', 'เครื่องปรุง': 'SEA', 'ของสด': 'FRS',
        'สุขภาพ/ยา': 'HLT', 'บุหรี่/แอลกอฮอล์': 'CIG', 'เด็ก/นม': 'BBY',
        'ขนมปัง/เบเกอรี่': 'BKR',
      }
      const category = await prisma.category.findUnique({ where: { id: categoryId } })
      if (category && catPrefixMap[category.name]) {
        prefix = catPrefixMap[category.name]
      }
    }

    // หาเลขล่าสุดของ prefix นี้ (ทุกหมวด)
    const lastWithPrefix = await prisma.product.findMany({
      where: { sku: { startsWith: prefix } },
      select: { sku: true },
      orderBy: { sku: 'desc' },
      take: 1,
    })

    let nextNum = 1
    if (lastWithPrefix.length > 0) {
      const lastNum = parseInt(lastWithPrefix[0].sku.replace(prefix, ''))
      if (!isNaN(lastNum)) nextNum = lastNum + 1
    }

    sku = `${prefix}${String(nextNum).padStart(3, '0')}`
  }

  if (barcode) {
    const existingBarcode = await prisma.product.findFirst({ where: { barcode } })
    if (existingBarcode) {
      // ถ้าซ้ำกับสินค้าที่ถูกลบไปแล้ว → กู้คืน + อัพเดทข้อมูลใหม่
      if (!existingBarcode.isActive) {
        const restored = await prisma.product.update({
          where: { id: existingBarcode.id },
          data: {
            isActive: true,
            name,
            description,
            categoryId,
            costPrice: parseFloat(costPrice),
            sellPrice: parseFloat(sellPrice),
            unit: unit || 'ชิ้น',
            stock: parseInt(stock) || 0,
            minStock: parseInt(minStock) || 5,
            unitOptions: unitOptions ? JSON.parse(unitOptions) : null,
            ...(req.file
              ? {
                  imageUrl: `/uploads/products/${req.file.filename}`,
                  imageData: `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString('base64')}`,
                }
              : {}),
          },
          include: { category: true },
        })
        return res.status(200).json({ ...restored, _restored: true })
      }
      return res.status(400).json({ message: 'Barcode ซ้ำกับสินค้าที่มีอยู่แล้ว' })
    }
  }

  const existingSku = await prisma.product.findUnique({ where: { sku } })
  if (existingSku) return res.status(400).json({ message: 'SKU ซ้ำกับสินค้าที่มีอยู่แล้ว' })

  const product = await prisma.product.create({
    data: {
      sku, barcode: barcode || null, name, description,
      categoryId, costPrice: parseFloat(costPrice), sellPrice: parseFloat(sellPrice),
      unit: unit || 'ชิ้น', stock: parseInt(stock) || 0, minStock: parseInt(minStock) || 5,
      unitOptions: unitOptions ? JSON.parse(unitOptions) : null,
      imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null,
      imageData: req.file ? `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString('base64')}` : null,
    },
    include: { category: true },
  })

  return res.status(201).json(product)
})

// PUT /api/products/:id
router.put('/:id', authenticate, requireRole('OWNER', 'ADMIN'), upload.single('image'), async (req: AuthRequest, res: Response) => {
  const { sku, barcode, name, description, categoryId, costPrice, sellPrice, unit, minStock, unitOptions, isActive } = req.body

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      sku, barcode: barcode || null, name, description, categoryId,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      sellPrice: sellPrice ? parseFloat(sellPrice) : undefined,
      unit, minStock: minStock ? parseInt(minStock) : undefined,
      unitOptions: unitOptions ? JSON.parse(unitOptions) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      ...(req.file ? {
        imageUrl: `/uploads/products/${req.file.filename}`,
        imageData: `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString('base64')}`,
      } : {}),
    },
    include: { category: true },
  })

  return res.json(product)
})

// POST /api/products/:id/image — อัพรูปสินค้าอย่างเดียว (สำหรับถ่ายรูปด่วนจากตาราง)
router.post('/:id/image', authenticate, requireRole('OWNER', 'ADMIN'), upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาแนบรูปภาพ' })
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      imageUrl: `/uploads/products/${req.file.filename}`,
      imageData: `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString('base64')}`,
    },
    include: { category: true },
  })
  return res.json(product)
})

// DELETE /api/products/:id/image — ลบรูปสินค้า
router.delete('/:id/image', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { imageUrl: null, imageData: null },
    include: { category: true },
  })
  return res.json(product)
})

// POST /api/products/:id/favorite — toggle favorite
router.post('/:id/favorite', authenticate, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' })

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { isFavorite: !product.isFavorite },
  })
  return res.json(updated)
})

// DELETE /api/products/:id (soft delete)
router.delete('/:id', authenticate, requireRole('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } })
  return res.json({ message: 'ลบสินค้าเรียบร้อยแล้ว' })
})

export default router
