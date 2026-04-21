import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import categoryRoutes from './routes/categories'
import saleRoutes from './routes/sales'
import stockRoutes from './routes/stock'
import customerRoutes from './routes/customers'
import supplierRoutes from './routes/suppliers'
import reportRoutes from './routes/reports'
import settingRoutes from './routes/settings'
import aiRoutes from './routes/ai'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/ai', aiRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok', app: 'ร้านชำยายด้วง POS v2' }))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
