'use client'
import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart'
import { LuX, LuDelete } from 'react-icons/lu'

interface Props {
  onClose: () => void
}

/**
 * Modal สำหรับขายสินค้าที่ไม่มีในระบบ ลูกค้าใส่ราคาเอง
 * ใช้ MISC product เป็น placeholder → ไม่ตัดสต๊อก
 */
export default function CustomPriceModal({ onClose }: Props) {
  const cart = useCartStore()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // Numpad สำหรับราคา
  const pressKey = (key: string) => {
    if (key === 'C') {
      setPrice('')
      return
    }
    if (key === 'BACK') {
      setPrice((v) => v.slice(0, -1))
      return
    }
    if (key === '.') {
      setPrice((v) => {
        if (v.includes('.')) return v
        return v === '' ? '0.' : v + '.'
      })
      return
    }
    setPrice((v) => {
      if (v.includes('.') && v.split('.')[1].length >= 2) return v
      if (v === '0' && key !== '.') return key
      return v + key
    })
  }

  const handleAdd = async () => {
    setError('')
    const priceNum = parseFloat(price)
    if (!name.trim()) {
      setError('กรุณากรอกชื่อสินค้า')
      return
    }
    if (!priceNum || priceNum <= 0) {
      setError('กรุณากรอกราคาที่มากกว่า 0')
      return
    }

    setLoading(true)
    try {
      // ดึง MISC product (สร้างใน DB ครั้งแรก reuse ตลอด)
      const { data: misc } = await api.get('/products/misc')

      // ใส่ในตะกร้า — override name + price ให้ตรงกับที่กรอก
      cart.addItem({
        id: misc.id,
        name: `${name.trim()}`,
        sku: misc.sku,
        unit: 'ชิ้น',
        sellPrice: priceNum,
        stock: 999999, // ไม่ตัดสต๊อก
        category: { icon: '💰' },
      })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
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
          <h3 className="text-lg font-bold text-gray-800">💰 สินค้าตั้งราคาเอง</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="ปิด"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ชื่อสินค้า / รายละเอียด</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ผัก, ผลไม้, ขนมไม่ติดราคา"
              className="w-full rounded-xl border-2 border-orange-300 px-4 py-3 text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>

          {/* Price display */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ราคา (บาท)</label>
            <div
              className={`w-full text-center text-3xl font-bold py-3 rounded-xl border-2 ${
                price === ''
                  ? 'border-gray-200 bg-gray-50 text-gray-300'
                  : 'border-orange-400 bg-orange-50 text-orange-700'
              }`}
            >
              ฿{price === '' ? '0' : price}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <NumpadKey key={d} onClick={() => pressKey(d)}>{d}</NumpadKey>
            ))}
            <NumpadKey onClick={() => pressKey('C')} variant="muted">C</NumpadKey>
            <NumpadKey onClick={() => pressKey('0')}>0</NumpadKey>
            <NumpadKey onClick={() => pressKey('BACK')} variant="muted">
              <LuDelete className="w-5 h-5 mx-auto" />
            </NumpadKey>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-white p-3 flex gap-2 rounded-b-2xl">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-[2]"
            onClick={handleAdd}
            disabled={loading || !name.trim() || !price}
          >
            {loading ? 'กำลังเพิ่ม...' : '✅ เพิ่มลงตะกร้า'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function NumpadKey({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'muted'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 sm:py-4 rounded-xl text-xl font-bold border-2 active:scale-95 transition-all ${
        variant === 'muted'
          ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-orange-50 hover:border-orange-200'
      }`}
    >
      {children}
    </button>
  )
}
