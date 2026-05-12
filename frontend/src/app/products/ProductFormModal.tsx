'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  product: any | null
  categories: any[]
  onClose: () => void
  onSaved: () => void
}

export default function ProductFormModal({ product, categories, onClose, onSaved }: Props) {
  const isEdit = !!product
  const [autoSku, setAutoSku] = useState(!isEdit && !product?.sku)

  const [form, setForm] = useState({
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    costPrice: product?.costPrice?.toString() || '',
    sellPrice: product?.sellPrice?.toString() || '',
    unit: product?.unit || 'ชิ้น',
    stock: product?.stock?.toString() || '0',
    minStock: product?.minStock?.toString() || '5',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageData || null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ─── เลือกรูป ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // ─── บันทึก ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitSku = autoSku ? 'AUTO' : form.sku
    if (!autoSku && !form.sku) { setError('กรุณากรอก SKU หรือเลือก "สร้างอัตโนมัติ"'); return }
    if (!form.name || !form.costPrice || !form.sellPrice || !form.categoryId) { setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ'); return }
    setSaving(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('sku', submitSku)
      formData.append('barcode', form.barcode)
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('categoryId', form.categoryId)
      formData.append('costPrice', form.costPrice)
      formData.append('sellPrice', form.sellPrice)
      formData.append('unit', form.unit)
      formData.append('stock', form.stock)
      formData.append('minStock', form.minStock)
      if (imageFile) formData.append('image', imageFile)

      if (isEdit) {
        await api.put(`/products/${product.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {isEdit ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
        </h3>

        {/* ถ่ายรูปสินค้า */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">📸 รูปสินค้า</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-xl" />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">✕</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <label className="flex-1 py-6 border-2 border-dashed border-orange-300 rounded-xl text-center hover:bg-orange-50 cursor-pointer">
                <span className="text-2xl block">📷</span>
                <span className="text-xs text-gray-600">ถ่ายรูป</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
              </label>
              <label className="flex-1 py-6 border-2 border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-50 cursor-pointer">
                <span className="text-2xl block">🖼️</span>
                <span className="text-xs text-gray-600">เลือกจากแกลเลอรี่</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SKU + Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">รหัส (SKU)</label>
                {!isEdit && (
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={autoSku} onChange={(e) => setAutoSku(e.target.checked)} className="rounded" />
                    <span className="text-orange-600 font-medium">อัตโนมัติ</span>
                  </label>
                )}
              </div>
              {autoSku && !isEdit ? (
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">สร้างอัตโนมัติ</div>
              ) : (
                <input type="text" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="เช่น DRK001" readOnly={isEdit}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 outline-none" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">บาร์โค้ด</label>
              <input type="text" value={form.barcode} onChange={(e) => handleChange('barcode', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                placeholder="ยิงสแกนเนอร์ หรือพิมพ์"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-mono focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none" />
              {form.barcode && <p className="text-xs text-green-600 mt-1">✓ {form.barcode}</p>}
            </div>
          </div>

          <Input label="ชื่อสินค้า *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="เช่น น้ำดื่มสิงห์ 600ml" />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่ *</label>
            <select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 outline-none">
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="ราคาทุน (฿) *" type="number" step="0.01" value={form.costPrice} onChange={(e) => handleChange('costPrice', e.target.value)} />
            <Input label="ราคาขาย (฿) *" type="number" step="0.01" value={form.sellPrice} onChange={(e) => handleChange('sellPrice', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="หน่วยนับ" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} placeholder="ชิ้น" />
            {!isEdit && <Input label="จำนวนเริ่มต้น" type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} />}
            <Input label="แจ้งเตือนเมื่อเหลือ" type="number" value={form.minStock} onChange={(e) => handleChange('minStock', e.target.value)} />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { onClose() }}>ยกเลิก</Button>
            <Button type="submit" className="flex-[2]" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
