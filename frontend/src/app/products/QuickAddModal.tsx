'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // เปิดกล้องถ่ายรูปสินค้า
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err) {
      alert('ไม่สามารถเปิดกล้องได้ ลองใช้ปุ่ม "เลือกไฟล์" แทน')
    }
  }

  // ถ่ายรูป
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `product-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setImageFile(file)
        setImagePreview(canvas.toDataURL('image/jpeg'))
      }
    }, 'image/jpeg', 0.8)

    stopCamera()
  }

  // ปิดกล้อง
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  // เลือกไฟล์รูป
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { stopCamera(); onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">📸 เพิ่มสินค้าด่วน</h3>

        {/* Camera / Image */}
        <div className="mb-4">
          {cameraActive ? (
            <div className="relative">
              <video ref={videoRef} className="w-full rounded-xl bg-black" autoPlay playsInline muted />
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={capturePhoto} className="flex-1">📸 ถ่ายรูป</Button>
                <Button type="button" variant="secondary" onClick={stopCamera}>ยกเลิก</Button>
              </div>
            </div>
          ) : imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
              >✕</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-8 border-2 border-dashed border-orange-300 rounded-xl text-center hover:bg-orange-50 transition-colors"
              >
                <span className="text-3xl block mb-1">📷</span>
                <span className="text-sm text-gray-600">เปิดกล้องถ่ายรูป</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-8 border-2 border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl block mb-1">🖼️</span>
                <span className="text-sm text-gray-600">เลือกจากไฟล์</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Barcode */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">บาร์โค้ด</label>
            <div className="flex gap-2">
              <input
                ref={barcodeInputRef}
                type="text"
                value={form.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                placeholder="สแกนหรือพิมพ์บาร์โค้ด"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base font-mono focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                autoFocus={!initialBarcode}
              />
              <button
                type="button"
                onClick={() => barcodeInputRef.current?.focus()}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 font-medium"
              >📷 สแกน</button>
            </div>
            {form.barcode && (
              <p className="text-xs text-green-600 mt-1">✓ บาร์โค้ด: {form.barcode}</p>
            )}
          </div>

          <Input label="ชื่อสินค้า *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="เช่น น้ำดื่มสิงห์ 600ml" />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่ *</label>
            <select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 outline-none">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="ราคาทุน (฿)" type="number" step="0.01" value={form.costPrice} onChange={(e) => handleChange('costPrice', e.target.value)} placeholder="ไม่บังคับ" />
            <Input label="ราคาขาย (฿) *" type="number" step="0.01" value={form.sellPrice} onChange={(e) => handleChange('sellPrice', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="หน่วย" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} />
            <Input label="จำนวน" type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} />
            <Input label="แจ้งเตือน" type="number" value={form.minStock} onChange={(e) => handleChange('minStock', e.target.value)} />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { stopCamera(); onClose() }}>ยกเลิก</Button>
            <Button type="submit" className="flex-[2]" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : '✅ บันทึกสินค้า'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
