'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import ProductFormModal from './ProductFormModal'
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuTriangleAlert } from 'react-icons/lu'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedCategory) params.set('categoryId', selectedCategory)
    params.set('limit', '200')

    api.get(`/products?${params}`)
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [search, selectedCategory])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) return
    await api.delete(`/products/${id}`)
    loadProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 สินค้า</h1>
          <p className="text-gray-500 text-sm">จัดการสินค้าทั้งหมดในร้าน</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setShowForm(true) }}>
          <LuPlus className="w-4 h-4 mr-2" /> เพิ่มสินค้า
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4 p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="ค้นหาชื่อ / SKU / บาร์โค้ด..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-400 outline-none"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">หมวดหมู่</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ราคาทุน</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ราคาขาย</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">สต๊อก</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {p.category?.icon || '📦'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        {p.barcode && <p className="text-xs text-gray-400">{p.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">
                    <Badge>{p.category?.name}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(parseFloat(p.costPrice))}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(parseFloat(p.sellPrice))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.stock <= p.minStock && (
                        <LuTriangleAlert className="w-4 h-4 text-yellow-500" />
                      )}
                      <Badge variant={p.stock <= 0 ? 'danger' : p.stock <= p.minStock ? 'warning' : 'success'}>
                        {p.stock} {p.unit}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditProduct(p); setShowForm(true) }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">ไม่พบสินค้า</div>
          )}
        </div>
      </Card>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadProducts() }}
        />
      )}
    </div>
  )
}
