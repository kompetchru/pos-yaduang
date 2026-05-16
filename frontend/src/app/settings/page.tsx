'use client'
import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LuSave, LuCheck, LuUpload, LuX } from 'react-icons/lu'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data))
  }, [])

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  // อัพโหลดรูป QR K-Shop → resize + แปลงเป็น base64 เก็บใน settings
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพ')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)')
      return
    }

    try {
      const base64 = await resizeImageToBase64(file, 800)
      update('kshop_qr_image', base64)
    } catch {
      setUploadError('โหลดรูปไม่สำเร็จ')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ ตั้งค่า</h1>
          <p className="text-gray-500 text-sm">ตั้งค่าร้านค้าและระบบ</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? <LuCheck className="w-4 h-4 mr-2" /> : <LuSave className="w-4 h-4 mr-2" />}
          {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว!' : 'บันทึก'}
        </Button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>🏪 ข้อมูลร้าน</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input label="ชื่อร้าน" value={settings.store_name || ''} onChange={(e) => update('store_name', e.target.value)} />
            <Input label="เบอร์โทร" value={settings.store_phone || ''} onChange={(e) => update('store_phone', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ร้าน</label>
              <textarea
                value={settings.store_address || ''}
                onChange={(e) => update('store_address', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🧾 ใบเสร็จ</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input label="ข้อความท้ายใบเสร็จ" value={settings.receipt_footer || ''} onChange={(e) => update('receipt_footer', e.target.value)} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💳 รับชำระเงิน</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.vat_enabled === 'true'}
                  onChange={(e) => update('vat_enabled', e.target.checked ? 'true' : 'false')}
                  className="rounded"
                />
                เปิดใช้ VAT
              </label>
              {settings.vat_enabled === 'true' && (
                <Input
                  label="อัตรา VAT (%)"
                  type="number"
                  value={settings.vat_rate || '7'}
                  onChange={(e) => update('vat_rate', e.target.value)}
                  className="w-24"
                />
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-1">📱 QR ธนาคาร (K SHOP / Thai QR Payment)</h4>
              <p className="text-xs text-gray-500 mb-3">
                อัพโหลดรูป QR ของร้าน — รองรับทุกแอปธนาคาร (K PLUS / SCB Easy / Krungsri / Bangkok Bank ฯลฯ)
              </p>

              <Input
                label="ชื่อร้าน / บัญชีที่แสดงบน QR (ไม่บังคับ)"
                value={settings.kshop_name || ''}
                onChange={(e) => update('kshop_name', e.target.value)}
                placeholder="เช่น ร้านป้าด้วง"
              />

              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  รูป QR ของร้าน
                </label>

                {settings.kshop_qr_image ? (
                  <div className="relative inline-block">
                    <img
                      src={settings.kshop_qr_image}
                      alt="QR ธนาคาร"
                      className="w-48 h-48 object-contain rounded-xl border-2 border-green-200 bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={() => update('kshop_qr_image', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                      aria-label="ลบรูป"
                    >
                      <LuX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 hover:border-green-300 transition-colors"
                  >
                    <LuUpload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">คลิกเพื่ออัพโหลด</span>
                    <span className="text-xs text-gray-400 mt-0.5">JPG/PNG ไม่เกิน 5MB</span>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrUpload}
                />

                {uploadError && (
                  <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                )}

                {settings.kshop_qr_image && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 อย่าลืมกด &quot;บันทึก&quot; ที่มุมขวาบนเพื่อบันทึกการเปลี่ยนแปลง
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/** Resize ภาพให้กว้างไม่เกิน maxWidth แล้วคืนเป็น base64 (data URL) */
function resizeImageToBase64(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read fail'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('load fail'))
      img.onload = () => {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('ctx fail'))
        // พื้นหลังขาวสำหรับ JPG
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        // ใช้ JPEG quality 0.9 เพื่อบีบขนาด
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
