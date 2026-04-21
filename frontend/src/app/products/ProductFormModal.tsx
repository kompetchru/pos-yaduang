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
  const barcodeRef = useRef<HTMLInputElement>(null)
  const [scanMode, setScanMode] = useState(false)

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitSku = autoSku ? 'AUTO' : form.sku
    if (!autoSku && !form.sku) {
      setError('กรุณากรอก SKU หรือเลือก "สร้างอัตโนมัติ"')
      return
    }
    if (!form.name || !form.costPrice || !form.sellPrice || !form.categoryId) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    setSaving(true)
    setError('')

    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, form)
      } else {
        await api.post('/products', { ...form, sku: submitSku })
      }
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const handleStartScan = () => {
    setScanMode(true)
    setTimeout(() => barcodeRef.current?.focus(), 100)
  }

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Scanner ส่ง Enter หลังสแกนเสร็จ
    if (e.key === 'Enter') {
      e.preventDefault()
      setScanMode(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {isEdit ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
        </h3>

        {/* Scan Mode Overlay */}
        {scanMode && (
          <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-xl text-center">
            <p className="text-lg font-bold text-orange-700 mb-2">📷 สแกนบาร์โค้ดเลย!</p>
            <p className="text-sm text-gray-600 mb-3">เอาเครื่องสแกนยิงที่บาร์โค้ดสินค้า</p>
            <input
              ref={barcodeRef}
              type="text"
              value={form.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
              onKeyDown={handleBarcodeScan}
              className="w-full text-center text-2xl font-mono py-4 rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              placeholder="รอสแกน..."
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setScanMode(false)}>
                ยกเลิก
              </Button>
              <Button type="button" size="sm" className="flex-1" onClick={() => setScanMode(false)}>
                ตกลง
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">รหัสสินค้า (SKU)</label>
                {!isEdit && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={autoSku} onChange={(e) => setAutoSku(e.target.checked)} className="rounded" />
                    <span className="text-orange-600 font-medium">สร้างอัตโนมัติ</span>
                  </label>
                )}
              </div>
              {autoSku && !isEdit ? (
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-400">
                  ระบบสร้างให้อัตโนมัติ
                </div>
              ) : (
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="เช่น DRK001"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                  readOnly={isEdit}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บาร์โค้ด</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                  placeholder="พิมพ์หรือสแกน"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-3 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 text-sm font-medium whitespace-nowrap"
                  title="สแกนบาร์โค้ด"
                >
                  📷 สแกน
                </button>
              </div>
            </div>
          </div>

          <Input label="ชื่อสินค้า *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="เช่น น้ำดื่มสิงห์ 600ml" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="ราคาทุน (฿) *" type="number" step="0.01" value={form.costPrice} onChange={(e) => handleChange('costPrice', e.target.value)} />
            <Input label="ราคาขาย (฿) *" type="number" step="0.01" value={form.sellPrice} onChange={(e) => handleChange('sellPrice', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="หน่วยนับ" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} placeholder="ชิ้น" />
            {!isEdit && (
              <Input label="จำนวนเริ่มต้น" type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} />
            )}
            <Input label="แจ้งเตือนเมื่อเหลือ" type="number" value={form.minStock} onChange={(e) => handleChange('minStock', e.target.value)} />
          </div>

          {form.barcode && (
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">บาร์โค้ดที่บันทึก</p>
              <p className="text-lg font-mono font-bold text-gray-800">{form.barcode}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" className="flex-[2]" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
