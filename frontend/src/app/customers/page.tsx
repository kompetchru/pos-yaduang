'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LuPlus, LuSearch, LuUsers, LuStar } from 'react-icons/lu'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', isMember: false })
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get(`/customers?search=${search}`).then((res) => setCustomers(res.data))
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await api.post('/customers', form)
    setShowForm(false)
    setForm({ name: '', phone: '', address: '', isMember: false })
    setSaving(false)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 ลูกค้า</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลลูกค้าและสมาชิก</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <LuPlus className="w-4 h-4 mr-2" /> เพิ่มลูกค้า
        </Button>
      </div>

      <Card className="mb-4 p-4">
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="ค้นหาชื่อ / เบอร์โทร..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none text-sm" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{c.name}</p>
                  {c.isMember && <Badge variant="success"><LuStar className="w-3 h-3 mr-1" />สมาชิก</Badge>}
                </div>
                {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
                <p className="text-sm text-orange-600 mt-1">🎯 {c.points} แต้ม</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">➕ เพิ่มลูกค้า</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="ชื่อ *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="เบอร์โทร" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="ที่อยู่" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isMember} onChange={(e) => setForm({ ...form, isMember: e.target.checked })} className="rounded" />
                สมาชิก
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>ยกเลิก</Button>
                <Button type="submit" className="flex-[2]" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
