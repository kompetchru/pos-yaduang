import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const API = 'http://localhost:4000/api'

async function main() {
  // Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yaduang', password: '1234' }),
  })
  const { token } = await loginRes.json()
  console.log('Login OK, token:', token.slice(0, 20) + '...')

  // Get a product
  const prodRes = await fetch(`${API}/products?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { products } = await prodRes.json()
  const product = products[0]
  console.log(`Product: ${product.name} (${product.id}) stock: ${product.stock}`)

  // Create sale
  const saleRes = await fetch(`${API}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [{ productId: product.id, quantity: 1, unitPrice: parseFloat(product.sellPrice), unit: product.unit, discount: 0 }],
      paymentMethod: 'CASH',
      amountPaid: 100,
      status: 'COMPLETED',
    }),
  })

  console.log('Sale response status:', saleRes.status)
  const saleData = await saleRes.json()
  console.log('Sale data:', JSON.stringify(saleData, null, 2).slice(0, 500))

  // Check sales list
  const listRes = await fetch(`${API}/sales?limit=3`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const listData = await listRes.json()
  console.log(`\nSales list: ${listData.total} total, showing ${listData.sales.length}`)
  listData.sales.forEach((s: any) => console.log(`  ${s.receiptNo} | ${s.status} | ฿${s.total}`))
}

main().catch(console.error)
