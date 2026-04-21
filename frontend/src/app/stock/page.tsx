'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LuWarehouse, LuPackagePlus, LuHistory, LuTriangleAlert } from 'react-icons/lu'

export default function StockPage() {
  const [lowStock, setLowStock] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [showReceive, setShowReceive] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  // Receive form
  const [receiveItems, setReceiveItems] = useState<{ productId: string; quantity: string }[]>([{ productId: '', quantity: '' }])
  const [receiveSupplierId, setReceiveSupplierId] = useState('')
  const [receiveNote, setReceiveNote] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/products/low-stock'),
      api.get('/stock/movements?limit=30'),
      api.get('/products?limit=500'),
      api.get('/suppliers'),
    ]).then(([ls, mv, pr, sp]) => {
      setLowStock(ls.data)
      setMovements(mv.data.movements)
      setProducts(pr.data.products)
      setSuppliers(sp.data)
    })
  }, [])

  const handleReceive = async () => {
    const items = receiveItems.filter((i) => i.productId && parseInt(i.quantity) > 0)
      .map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity) }))
    if (items.length === 0) return

    await api.post('/stock/receive', { items, supplierId: receiveSupplierId || undefined, note: receiveNote })
    setShowReceive(false)
    setReceiveItems([{ productId: '', quantity: '' }])
    // reload
    const [ls, mv] = await Promise.all([api.get('/products/low-stock'), api.get('/stock/movements?limit=30')])
    setLowStock(ls.data)
    setMovements(mv.data.movements)
  }

  const typeLabel: Record<string, string> = { SALE: 'ขาย', PURCHASE: 'รับเข้า', ADJUSTMENT: 'ปรับยอด', RETURN: 'คืน' }
  const typeColor: Record<string, 'danger' | 'success' | 'info' | 'warning'> = { SALE: 'danger', PURCHASE: 'success', ADJUSTMENT: 'info', RETURN: 'warning' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏬 สต๊อกสินค้า</h1>
          <p className="text-gray-500 text-sm">จัดการสต๊อกและรับสินค้าเข้า</p>
        </div>
        <Button onClick={() => setShowReceive(true)}>
          <LuPackagePlus className="w-4 h-4 mr-2" /> รับสินค้าเข้า
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <LuTriangleAlert className="w-5 h-5" /> สินค้าใกล้หมด / หมดสต๊อก ({lowStock.length} รายการ)
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <Badge variant={p.stock <= 0 ? 'danger' : 'warning'}>
                  เหลือ {p.stock}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuHistory className="w-5 h-5 text-gray-500" /> ประวัติการเคลื่อนไหวสินค้า
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">ประเภท</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">จำนวน</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">คงเหลือ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.product?.name}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={typeColor[m.type]}>{typeLabel[m.type]}</Badge>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{m.balanceAfter}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReceive(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">📦 รับสินค้าเข้า</h3>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">ซัพพลายเออร์</label>
              <select value={receiveSupplierId} onChange={(e) => setReceiveSupplierId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-400 outline-none">
                <option value="">ไม่ระบุ</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {receiveItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={item.productId} onChange={(e) => {
                  const updated = [...receiveItems]; updated[idx].productId = e.target.value; setReceiveItems(updated)
                }} className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 outline-none">
                  <option value="">เลือกสินค้า</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
                <input type="number" placeholder="จำนวน" value={item.quantity} onChange={(e) => {
                  const updated = [...receiveItems]; updated[idx].quantity = e.target.value; setReceiveItems(updated)
                }} className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm text-center focus:border-orange-400 outline-none" />
              </div>
            ))}

            <button onClick={() => setReceiveItems([...receiveItems, { productId: '', quantity: '' }])}
              className="text-sm text-orange-600 hover:underline mb-4">+ เพิ่มรายการ</button>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowReceive(false)}>ยกเลิก</Button>
              <Button className="flex-[2]" onClick={handleReceive}>บันทึกรับสินค้า</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
