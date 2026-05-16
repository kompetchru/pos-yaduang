'use client'
import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import ProductFormModal from './ProductFormModal'
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuTriangleAlert,
  LuStar,
  LuCamera,
  LuImageOff,
  LuX,
} from 'react-icons/lu'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [missingImageOnly, setMissingImageOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  // hidden file input ใช้ร่วมกันทุก row
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const targetProductIdRef = useRef<string | null>(null)

  const loadProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedCategory) params.set('categoryId', selectedCategory)
    params.set('limit', '500')

    api
      .get(`/products?${params}`)
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

  // เปิดกล้องสำหรับถ่ายรูปสินค้าตามแถว
  const openCamera = (productId: string) => {
    targetProductIdRef.current = productId
    cameraInputRef.current?.click()
  }

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const productId = targetProductIdRef.current
    e.target.value = ''
    if (!file || !productId) return

    setUploadingId(productId)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data: updated } = await api.post(`/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // อัพเดท product เฉพาะตัวที่เปลี่ยน ไม่ต้อง reload ทั้งหน้า
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)))
      if ('vibrate' in navigator) navigator.vibrate(60)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'อัพโหลดไม่สำเร็จ')
    } finally {
      setUploadingId(null)
      targetProductIdRef.current = null
    }
  }

  const handleRemoveImage = async (productId: string, name: string) => {
    if (!confirm(`ลบรูปของ "${name}" ใช่ไหม?`)) return
    setUploadingId(productId)
    try {
      const { data: updated } = await api.delete(`/products/${productId}/image`)
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)))
    } finally {
      setUploadingId(null)
    }
  }

  const filteredProducts = missingImageOnly
    ? products.filter((p) => !p.imageData && !p.imageUrl)
    : products

  const missingCount = products.filter((p) => !p.imageData && !p.imageUrl).length
  const totalCount = products.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 สินค้า</h1>
          <p className="text-gray-500 text-sm">จัดการสินค้าทั้งหมดในร้าน</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setShowForm(true) }}>
          <LuPlus className="w-4 h-4 mr-2" /> เพิ่มสินค้า
        </Button>
      </div>

      {/* Image coverage progress */}
      {totalCount > 0 && (
        <div className="mb-4 bg-white rounded-xl border p-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">📸 สินค้าที่มีรูปแล้ว</span>
              <span className="font-medium text-gray-800">
                {totalCount - missingCount} / {totalCount}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                style={{ width: `${totalCount === 0 ? 0 : ((totalCount - missingCount) / totalCount) * 100}%` }}
              />
            </div>
          </div>
          {missingCount > 0 && (
            <button
              onClick={() => setMissingImageOnly((v) => !v)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                missingImageOnly
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {missingImageOnly ? '✓ กำลังกรอง' : `⚠️ ยังไม่มีรูป ${missingCount} ตัว`}
            </button>
          )}
        </div>
      )}

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
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
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
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-16">รูป</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">หมวดหมู่</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">ราคาทุน</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ราคาขาย</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">สต๊อก</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const imgSrc =
                  p.imageData ||
                  (p.imageUrl?.startsWith('http')
                    ? p.imageUrl
                    : p.imageUrl
                    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000${p.imageUrl}`
                    : null)
                const isUploading = uploadingId === p.id

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Image cell */}
                    <td className="px-2 py-2 text-center">
                      {isUploading ? (
                        <div className="w-12 h-12 mx-auto bg-orange-50 rounded-lg flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                      ) : imgSrc ? (
                        <button
                          type="button"
                          onClick={() => setZoomImage(imgSrc)}
                          className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-gray-200 hover:border-orange-400 transition-colors block"
                          title="คลิกเพื่อดูรูปใหญ่"
                        >
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openCamera(p.id)}
                          className="w-12 h-12 mx-auto rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-500"
                          title="ถ่ายรูปสินค้า"
                        >
                          <LuCamera className="w-5 h-5" />
                        </button>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          {p.barcode && (
                            <p className="text-xs text-gray-400 font-mono">{p.barcode}</p>
                          )}
                          <p className="text-xs text-gray-400 md:hidden">
                            {p.sku} · {p.category?.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 font-mono text-xs hidden md:table-cell">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge>{p.category?.name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">
                      {formatCurrency(parseFloat(p.costPrice))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatCurrency(parseFloat(p.sellPrice))}
                    </td>
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
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* ถ่ายรูป / เปลี่ยนรูป */}
                        <button
                          onClick={() => openCamera(p.id)}
                          disabled={isUploading}
                          className={`p-2 rounded-lg hover:bg-orange-50 ${
                            imgSrc ? 'text-gray-400 hover:text-orange-600' : 'text-orange-500'
                          }`}
                          title={imgSrc ? 'เปลี่ยนรูป' : 'ถ่ายรูปสินค้า'}
                        >
                          <LuCamera className="w-4 h-4" />
                        </button>
                        {/* ลบรูป (ถ้ามี) */}
                        {imgSrc && (
                          <button
                            onClick={() => handleRemoveImage(p.id, p.name)}
                            disabled={isUploading}
                            className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                            title="ลบรูป"
                          >
                            <LuImageOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            await api.post(`/products/${p.id}/favorite`)
                            loadProducts()
                          }}
                          className={`p-2 rounded-lg hover:bg-yellow-50 ${
                            p.isFavorite ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                          title={p.isFavorite ? 'ยกเลิกปักหมุด' : 'ปักหมุด'}
                        >
                          <LuStar className={`w-4 h-4 ${p.isFavorite ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => { setEditProduct(p); setShowForm(true) }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="แก้ไข"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="ลบสินค้า"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              {missingImageOnly && missingCount === 0
                ? '🎉 สินค้าทุกตัวมีรูปแล้ว!'
                : 'ไม่พบสินค้า'}
            </div>
          )}
        </div>
      </Card>

      {/* Hidden camera input — shared across all rows */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleQuickImageUpload}
      />

      {/* Image zoom modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
            aria-label="ปิด"
          >
            <LuX className="w-6 h-6" />
          </button>
          <img
            src={zoomImage}
            alt="zoom"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}

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
