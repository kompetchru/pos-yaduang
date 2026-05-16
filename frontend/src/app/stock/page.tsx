'use client'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LuPackagePlus,
  LuHistory,
  LuTriangleAlert,
  LuX,
  LuSearch,
  LuCamera,
  LuTrash2,
  LuPlus,
} from 'react-icons/lu'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

interface ReceiveItem {
  productId: string
  quantity: string
}

export default function StockPage() {
  const [lowStock, setLowStock] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [showReceive, setShowReceive] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  // Receive form state
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([{ productId: '', quantity: '' }])
  const [receiveSupplierId, setReceiveSupplierId] = useState('')
  const [receiveNote, setReceiveNote] = useState('')
  const [receiveError, setReceiveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const reload = useCallback(async () => {
    const [ls, mv] = await Promise.all([
      api.get('/products/low-stock'),
      api.get('/stock/movements?limit=30'),
    ])
    setLowStock(ls.data)
    setMovements(mv.data.movements)
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/products/low-stock'),
      api.get('/stock/movements?limit=30'),
      api.get('/products?limit=500'),
      api.get('/suppliers'),
    ]).then(([ls, mv, pr, sp]) => {
      setLowStock(ls.data)
      setMovements(mv.data.movements)
      setProducts(pr.data.products)
      setSuppliers(sp.data)
    })
  }, [])

  const resetReceive = () => {
    setReceiveItems([{ productId: '', quantity: '' }])
    setReceiveSupplierId('')
    setReceiveNote('')
    setReceiveError('')
  }

  const closeReceive = () => {
    setShowReceive(false)
    resetReceive()
  }

  // เพิ่มสินค้าโดย barcode (ทั้งจากสแกนเนอร์กล้อง และจาก barcode gun)
  const addByBarcode = useCallback(
    (barcode: string) => {
      const trimmed = barcode.trim()
      const product = products.find((p) => p.barcode === trimmed || p.sku === trimmed.toUpperCase())
      if (!product) {
        setReceiveError(`ไม่พบสินค้าบาร์โค้ด ${trimmed}`)
        return
      }
      setReceiveError('')
      setReceiveItems((prev) => {
        // ถ้ามีอยู่แล้ว → +1
        const idx = prev.findIndex((i) => i.productId === product.id)
        if (idx >= 0) {
          const updated = [...prev]
          const cur = parseInt(updated[idx].quantity) || 0
          updated[idx] = { ...updated[idx], quantity: String(cur + 1) }
          return updated
        }
        // ถ้ามีแถวว่าง → ใส่ในแถวว่าง
        const emptyIdx = prev.findIndex((i) => !i.productId)
        if (emptyIdx >= 0) {
          const updated = [...prev]
          updated[emptyIdx] = { productId: product.id, quantity: '1' }
          return updated
        }
        // เพิ่มแถวใหม่
        return [...prev, { productId: product.id, quantity: '1' }]
      })
    },
    [products]
  )

  // global barcode listener (เฉพาะตอนเปิด modal)
  useEffect(() => {
    if (!showReceive) return
    const buf = { v: '' }
    let timer: any = null

    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement
      const isInInput =
        active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')
      // ปล่อย scanner ทำงานเมื่อ focus ไม่ใช่ input ปกติของ form
      if (e.key === 'Enter' && buf.v.length >= 4 && !isInInput) {
        e.preventDefault()
        addByBarcode(buf.v)
        buf.v = ''
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !isInInput) {
        buf.v += e.key
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          buf.v = ''
        }, 200)
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (timer) clearTimeout(timer)
    }
  }, [showReceive, addByBarcode])

  const handleReceive = async () => {
    setReceiveError('')
    const items = receiveItems
      .filter((i) => i.productId && parseInt(i.quantity) > 0)
      .map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity) }))
    if (items.length === 0) {
      setReceiveError('กรุณาเลือกสินค้าและจำนวนอย่างน้อย 1 รายการ')
      return
    }
    setSaving(true)
    try {
      await api.post('/stock/receive', {
        items,
        supplierId: receiveSupplierId || undefined,
        note: receiveNote || undefined,
      })
      closeReceive()
      await reload()
    } catch (err: any) {
      setReceiveError(err?.response?.data?.message || 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (idx: number, key: keyof ReceiveItem, value: string) => {
    setReceiveItems((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [key]: value }
      return updated
    })
  }
  const removeItem = (idx: number) => {
    setReceiveItems((prev) => (prev.length === 1 ? [{ productId: '', quantity: '' }] : prev.filter((_, i) => i !== idx)))
  }
  const addRow = () => {
    setReceiveItems((prev) => [...prev, { productId: '', quantity: '' }])
  }

  const totalReceiveQty = receiveItems.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)

  const typeLabel: Record<string, string> = { SALE: 'ขาย', PURCHASE: 'รับเข้า', ADJUSTMENT: 'ปรับยอด', RETURN: 'คืน' }
  const typeColor: Record<string, 'danger' | 'success' | 'info' | 'warning'> = {
    SALE: 'danger',
    PURCHASE: 'success',
    ADJUSTMENT: 'info',
    RETURN: 'warning',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏬 สต๊อกสินค้า</h1>
          <p className="text-gray-500 text-sm">จัดการสต๊อกและรับสินค้าเข้า</p>
        </div>
        <Button onClick={() => setShowReceive(true)}>
          <LuPackagePlus className="w-4 h-4 mr-2" /> รับสินค้าเข้า
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <LuTriangleAlert className="w-5 h-5" /> สินค้าใกล้หมด / หมดสต๊อก ({lowStock.length} รายการ)
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <Badge variant={p.stock <= 0 ? 'danger' : 'warning'}>เหลือ {p.stock}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuHistory className="w-5 h-5 text-gray-500" /> ประวัติการเคลื่อนไหวสินค้า
          </CardTitle>
        </CardHeader>

        {/* Card view (mobile/tablet portrait) */}
        <div className="md:hidden divide-y divide-gray-100">
          {movements.map((m) => (
            <div key={m.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{m.product?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.createdAt)}</p>
                  {m.note && <p className="text-xs text-gray-500 mt-0.5 truncate">{m.note}</p>}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge variant={typeColor[m.type]}>{typeLabel[m.type]}</Badge>
                  <span className={`text-sm font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity > 0 ? '+' : ''}
                    {m.quantity}
                  </span>
                  <span className="text-xs text-gray-400">คงเหลือ {m.balanceAfter}</span>
                </div>
              </div>
            </div>
          ))}
          {movements.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">ยังไม่มีประวัติ</p>
          )}
        </div>

        {/* Table view (desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">ประเภท</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">จำนวน</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">คงเหลือ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.product?.name}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={typeColor[m.type]}>{typeLabel[m.type]}</Badge>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity > 0 ? '+' : ''}
                    {m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{m.balanceAfter}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receive Modal */}
      {showReceive && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closeReceive}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-gray-800">📦 รับสินค้าเข้า</h3>
              <button
                onClick={closeReceive}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                aria-label="ปิด"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {/* Supplier */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ซัพพลายเออร์</label>
                <select
                  value={receiveSupplierId}
                  onChange={(e) => setReceiveSupplierId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-400 outline-none bg-white"
                >
                  <option value="">ไม่ระบุ</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scan barcode bar */}
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-2.5">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                >
                  <LuCamera className="w-4 h-4" /> สแกนกล้อง
                </button>
                <p className="text-xs text-orange-700 flex-1">
                  หรือยิงสแกนเนอร์ — สินค้าจะถูกเพิ่มในรายการอัตโนมัติ
                </p>
              </div>

              {/* Items header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">รายการสินค้า ({receiveItems.filter((i) => i.productId).length})</p>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1 text-sm text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-lg"
                >
                  <LuPlus className="w-4 h-4" /> เพิ่มแถว
                </button>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                {receiveItems.map((item, idx) => (
                  <ReceiveRow
                    key={idx}
                    item={item}
                    products={products}
                    onChangeProduct={(pid) => updateItem(idx, 'productId', pid)}
                    onChangeQty={(q) => updateItem(idx, 'quantity', q)}
                    onRemove={() => removeItem(idx)}
                    canRemove={receiveItems.length > 1 || !!item.productId}
                  />
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
                <input
                  type="text"
                  value={receiveNote}
                  onChange={(e) => setReceiveNote(e.target.value)}
                  placeholder="เช่น ใบส่งของเลขที่ ... (ไม่บังคับ)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-400 outline-none"
                />
              </div>

              {receiveError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">{receiveError}</div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="border-t bg-white p-3 rounded-b-2xl">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm text-gray-500">รวมทั้งหมด</span>
                <span className="text-lg font-bold text-orange-600">{totalReceiveQty} ชิ้น</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={closeReceive}
                  disabled={saving}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-[2]"
                  onClick={handleReceive}
                  disabled={saving || totalReceiveQty === 0}
                >
                  {saving ? 'กำลังบันทึก...' : '✅ บันทึกรับสินค้า'}
                </Button>
              </div>
            </div>
          </div>

          {showScanner && (
            <BarcodeScanner
              onScan={(code) => {
                setShowScanner(false)
                addByBarcode(code)
              }}
              onClose={() => setShowScanner(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

/** ─── Searchable product picker row ─── */
function ReceiveRow({
  item,
  products,
  onChangeProduct,
  onChangeQty,
  onRemove,
  canRemove,
}: {
  item: ReceiveItem
  products: any[]
  onChangeProduct: (pid: string) => void
  onChangeQty: (q: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => products.find((p) => p.id === item.productId), [products, item.productId])

  const filtered = useMemo(() => {
    if (!query) return products.slice(0, 50)
    const q = query.toLowerCase()
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      )
      .slice(0, 50)
  }, [products, query])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="flex gap-2 items-start">
      {/* Product picker */}
      <div ref={wrapRef} className="flex-1 relative min-w-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 bg-white ${
            selected ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
          }`}
        >
          <span className={`truncate ${selected ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {selected ? `${selected.name} · ${selected.sku}` : 'เลือกสินค้า / ค้นหา'}
          </span>
          <LuSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-72 overflow-hidden flex flex-col">
            <div className="p-2 border-b">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="พิมพ์ชื่อ / SKU / บาร์โค้ด"
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">ไม่พบสินค้า</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChangeProduct(p.id)
                      setOpen(false)
                      setQuery('')
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm border-b border-gray-50 last:border-0"
                  >
                    <p className="font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.sku} · เหลือ {p.stock} {p.unit}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quantity */}
      <input
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="จำนวน"
        value={item.quantity}
        onChange={(e) => onChangeQty(e.target.value)}
        className="w-20 rounded-xl border border-gray-300 px-2 py-2.5 text-base text-center font-bold focus:border-orange-400 outline-none"
      />

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="ลบรายการ"
      >
        <LuTrash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
