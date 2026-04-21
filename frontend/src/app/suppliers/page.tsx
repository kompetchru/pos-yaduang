'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LuPlus, LuTruck, LuPencil, LuTrash2 } from 'react-icons/lu'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', contactName: '', phone: '', address: '', note: '' })

  const load = () => api.get('/suppliers').then((res) => setSuppliers(res.data))
  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) await api.put(`/suppliers/${editId}`, form)
    else await api.post('/suppliers', form)
    setShowForm(false)
    setEditId(null)
    setForm({ name: '', contactName: '', phone: '', address: '', note: '' })
    load()
  }

  const handleEdit = (s: any) => {
    setEditId(s.id)
    setForm({ name: s.name, contactName: s.contactName || '', phone: s.phone || '', address: s.address || '', note: s.note || '' })
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบซัพพลายเออร์ "${name}"?`)) return
    await api.delete(`/suppliers/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🚚 ซัพพลายเออร์</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลผู้จำหน่ายสินค้า</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ name: '', contactName: '', phone: '', address: '', note: '' }); setShowForm(true) }}>
          <LuPlus className="w-4 h-4 mr-2" /> เพิ่มซัพพลายเออร์
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <LuTruck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  {s.contactName && <p className="text-sm text-gray-500">ติดต่อ: {s.contactName}</p>}
                  {s.phone && <p className="text-sm text-gray-500">📞 {s.phone}</p>}
                  {s.address && <p className="text-xs text-gray-400 mt-1">{s.address}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <LuPencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{editId ? '✏️ แก้ไข' : '➕ เพิ่ม'}ซัพพลายเออร์</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="ชื่อร้าน/บริษัท *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="ชื่อผู้ติดต่อ" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              <Input label="เบอร์โทร" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="ที่อยู่" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>ยกเลิก</Button>
                <Button type="submit" className="flex-[2]">บันทึก</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
