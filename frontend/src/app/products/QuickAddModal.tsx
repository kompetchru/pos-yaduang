'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LuX, LuCamera, LuImage } from 'react-icons/lu'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

const COMMON_UNITS = [
  'ชิ้น','ขวด','กระป๋อง','ซอง','ถุง','กล่อง','แพ็ค','ถ้วย','แท่ง','อัน',
  'ก้อน','หลอด','ม้วน','ฟอง','ลูก','เม็ด','แผง','คู่','มัด','ลัง',
  'ถัง','กระปุก','ห่อ','แก้ว','กิโลกรัม',
]

interface Props {
  categories: any[]
  initialBarcode?: string
  onClose: () => void
  onSaved: () => void
}

export default function QuickAddModal({ categories, initialBarcode = '', onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    barcode: initialBarcode,
    name: '',
    categoryId: categories[0]?.id || '',
    costPrice: '',
    sellPrice: '',
    unit: 'ชิ้น',
    stock: '0',
    minStock: '5',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // ถ้ามี barcode มาจากการสแกน → focus ที่ "ชื่อสินค้า" ทันที
  useEffect(() => {
    if (initialBarcode) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [initialBarcode])

  const handleBarcodeScan = useCallback((barcode: string) => {
    setForm((prev) => ({ ...prev, barcode }))
    setShowBarcodeScanner(false)
  }, [])

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // เลือกไฟล์รูป (กล้อง หรือ แกลเลอรี่)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
    // reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
    e.target.value = ''
  }

  // บันทึก
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.sellPrice || !form.categoryId) {
      setError('กรุณากรอก ชื่อสินค้า, ราคาขาย, และหมวดหมู่')
      return
    }
    setSaving(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('sku', 'AUTO')
      formData.append('barcode', form.barcode)
      formData.append('name', form.name)
      formData.append('categoryId', form.categoryId)
      formData.append('costPrice', form.costPrice || form.sellPrice)
      formData.append('sellPrice', form.sellPrice)
      formData.append('unit', form.unit)
      formData.append('stock', form.stock)
      formData.append('minStock', form.minStock)
      if (imageFile) formData.append('image', imageFile)

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b">
          <h3 className="text-lg font-bold text-gray-800">📸 เพิ่มสินค้าด่วน</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="ปิด"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          id="quick-add-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-3 space-y-3"
        >
          {/* รูปสินค้า + บาร์โค้ด อยู่บรรทัดเดียวกัน */}
          <div className="flex gap-3">
            {/* รูปสินค้า — compact */}
            <div className="w-24 flex-shrink-0">
              <label className="text-xs text-gray-500 mb-1 block">รูปสินค้า</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 w-24">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center hover:bg-orange-50"
                    aria-label="ถ่ายรูป"
                  >
                    <LuCamera className="w-5 h-5 text-orange-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50"
                    aria-label="เลือกจากแกลเลอรี่"
                  >
                    <LuImage className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* บาร์โค้ด */}
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-500 mb-1 block">บาร์โค้ด</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                  placeholder="สแกน/พิมพ์"
                  className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-mono focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(true)}
                  className="px-2.5 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 flex items-center"
                  aria-label="ถ่ายบาร์โค้ด"
                >
                  <LuCamera className="w-4 h-4" />
                </button>
              </div>
              {form.barcode && (
                <p className="text-xs text-green-600 mt-1 truncate">✓ {form.barcode}</p>
              )}
            </div>
          </div>

          {/* ชื่อสินค้า — เด่นที่สุด */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ชื่อสินค้า *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="เช่น น้ำดื่มสิงห์ 600ml"
              className="w-full rounded-xl border-2 border-orange-300 px-4 py-3 text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>

          {/* ราคาขาย + ราคาทุน */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ราคาขาย (฿) *</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={form.sellPrice}
                onChange={(e) => handleChange('sellPrice', e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base font-bold focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ราคาทุน (฿)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                placeholder="ไม่บังคับ"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-orange-400 outline-none"
              />
            </div>
          </div>

          {/* หมวดหมู่ + หน่วย */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">หมวดหมู่ *</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-400 outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">หน่วย</label>
              <select
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-400 outline-none bg-white"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* จำนวน + แจ้งเตือน */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">จำนวนเริ่มต้น</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-orange-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">แจ้งเตือนเมื่อเหลือ</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.minStock}
                onChange={(e) => handleChange('minStock', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:border-orange-400 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}
        </form>

        {/* Sticky footer */}
        <div className="border-t bg-white p-3 flex gap-2 rounded-b-2xl">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            form="quick-add-form"
            size="lg"
            className="flex-[2]"
            disabled={saving}
          >
            {saving ? 'กำลังบันทึก...' : '✅ บันทึกสินค้า'}
          </Button>
        </div>

        {/* Barcode Camera Scanner */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
      </div>
    </div>
  )
}
