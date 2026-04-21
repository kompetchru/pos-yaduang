'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LuSettings, LuSave, LuCheck } from 'react-icons/lu'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data))
  }, [])

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await api.put('/settings', settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
            <CardTitle>💰 การเงิน</CardTitle>
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
            <Input label="PromptPay ID" value={settings.promptpay_id || ''} onChange={(e) => update('promptpay_id', e.target.value)} placeholder="เบอร์โทรหรือเลขบัตรประชาชน" />
          </div>
        </Card>
      </div>
    </div>
  )
}
