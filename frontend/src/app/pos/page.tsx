'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useCartStore, CartItem } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PaymentModal from './PaymentModal'
import QuickAddModal from '../products/QuickAddModal'
import {
  LuSearch, LuPlus, LuMinus, LuTrash2, LuArrowLeft,
  LuPause, LuPlay, LuPercent, LuX,
} from 'react-icons/lu'

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [heldBills, setHeldBills] = useState<any[]>([])
  const [showHeld, setShowHeld] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddBarcode, setQuickAddBarcode] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const cart = useCartStore()

  // โหลดสินค้าและหมวดหมู่
  useEffect(() => {
    Promise.all([api.get('/products?limit=500'), api.get('/categories')])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products)
        setCategories(catRes.data)
      })
      .catch(console.error)
  }, [])

  // โหลดบิลที่พัก
  const loadHeldBills = useCallback(() => {
    api.get('/sales/held').then((res) => setHeldBills(res.data)).catch(console.error)
  }, [])

  useEffect(() => { loadHeldBills() }, [loadHeldBills])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'F9') { e.preventDefault(); if (cart.items.length > 0) setShowPayment(true) }
      if (e.key === 'Escape') { setShowPayment(false); setShowHeld(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cart.items.length])

  // สินค้าปักหมุด (ปุ่มลัด)
  const favorites = products.filter((p) => p.isFavorite).slice(0, 10)

  // กรองสินค้า
  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
    const matchCat = !selectedCategory || p.categoryId === selectedCategory
    return matchSearch && matchCat && p.stock > 0
  })

  const handleHoldBill = async () => {
    if (cart.items.length === 0) return
    try {
      await api.post('/sales', {
        items: cart.items.map((i) => ({
          productId: i.productId, quantity: i.quantity,
          unitPrice: i.unitPrice, unit: i.unit, discount: i.discount,
        })),
        paymentMethod: 'CASH', amountPaid: 0, status: 'HELD',
        note: cart.note || 'พักบิล',
      })
      cart.clearCart()
      loadHeldBills()
    } catch (err) { console.error(err) }
  }

  const handleResumeBill = (bill: any) => {
    cart.clearCart()
    for (const item of bill.items) {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        cart.addItem(product)
        cart.updateQuantity(item.productId, item.quantity)
      }
    }
    // void the held bill
    api.post(`/sales/${bill.id}/void`).then(loadHeldBills).catch(console.error)
    setShowHeld(false)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
          <LuArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-orange-600">🏪 ขายสินค้า</h1>
        <div className="flex-1" />
        <span className="text-xs text-gray-400 hidden md:inline">
          <span className="kbd">F2</span> ค้นหา &nbsp;
          <span className="kbd">F9</span> ชำระเงิน &nbsp;
          <span className="kbd">Esc</span> ปิด
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
          {/* Search */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                placeholder="ค้นหาสินค้า / สแกนบาร์โค้ด..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    e.preventDefault()
                    // สแกนบาร์โค้ด → หาสินค้าที่ barcode/sku ตรง 100% เท่านั้น
                    const exactMatch = products.find(
                      (p) => p.barcode === search.trim() || p.sku === search.trim().toUpperCase()
                    )
                    if (exactMatch) {
                      if (exactMatch.stock > 0) {
                        cart.addItem(exactMatch)
                        setSearch('')
                      } else {
                        alert(`สินค้า "${exactMatch.name}" หมดสต๊อก`)
                        setSearch('')
                      }
                    } else {
                      // ไม่เจอ barcode → เปิดหน้าเพิ่มสินค้าด่วน
                      setQuickAddBarcode(search.trim())
                      setShowQuickAdd(true)
                      setSearch('')
                    }
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none text-base"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <LuX className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Favorite Shortcuts */}
          {favorites.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1 px-1">⭐ ปุ่มลัด (สินค้าปักหมุด)</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {favorites.map((fav) => (
                  <button
                    key={fav.id}
                    onClick={() => cart.addItem(fav)}
                    disabled={fav.stock <= 0}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl hover:shadow-md active:scale-95 transition-all disabled:opacity-40 min-w-[80px]"
                  >
                    <span className="text-lg leading-none">{fav.category?.icon || '⭐'}</span>
                    <span className="text-xs font-medium text-center line-clamp-2 leading-tight">{fav.name}</span>
                    <span className="text-xs font-bold">฿{parseFloat(fav.sellPrice).toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => cart.addItem(product)}
                  className="bg-white rounded-xl border border-gray-200 p-3 text-left hover:border-orange-300 hover:shadow-md transition-all active:scale-[0.97] group"
                >
                  <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-4xl overflow-hidden">
                    {(product.imageData || product.imageUrl) ? (
                      <img
                        src={product.imageData || (product.imageUrl?.startsWith('http') ? product.imageUrl : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000${product.imageUrl}`)}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = 'none';
                          el.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`${(product.imageData || product.imageUrl) ? 'hidden' : ''}`}>
                      {product.category?.icon || '📦'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-bold text-orange-600">
                      ฿{parseFloat(product.sellPrice).toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-400">เหลือ {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <LuSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่พบสินค้า</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart — desktop sidebar / mobile bottom */}
        <div className="hidden md:flex w-96 bg-white border-l flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800">🛒 ตะกร้า ({cart.items.length})</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setShowHeld(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative"
                title="บิลที่พัก"
              >
                <LuPlay className="w-4 h-4" />
                {heldBills.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {heldBills.length}
                  </span>
                )}
              </button>
              {cart.items.length > 0 && (
                <button onClick={cart.clearCart} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="ล้างตะกร้า">
                  <LuTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🛒</p>
                <p>ยังไม่มีสินค้าในตะกร้า</p>
                <p className="text-sm mt-1">เลือกสินค้าจากด้านซ้าย</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>ยอดรวม</span>
              <span>{formatCurrency(cart.getSubtotal())}</span>
            </div>
            {cart.getTotalDiscount() > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>ส่วนลด</span>
                <span>-{formatCurrency(cart.getTotalDiscount())}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>รวมทั้งสิ้น</span>
              <span className="text-orange-600">{formatCurrency(cart.getTotal())}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleHoldBill}
                disabled={cart.items.length === 0}
              >
                <LuPause className="w-4 h-4 mr-1" /> พักบิล
              </Button>
              <Button
                size="lg"
                className="flex-[2]"
                onClick={() => setShowPayment(true)}
                disabled={cart.items.length === 0}
              >
                ชำระเงิน (F9)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <button
          onClick={() => cart.items.length > 0 && setShowMobileCart(true)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-medium text-gray-800">{cart.items.length} รายการ</span>
          </div>
          <span className="text-lg font-bold text-orange-600">{formatCurrency(cart.getTotal())}</span>
        </button>
      </div>

      {/* Mobile Cart Overlay */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">🛒 ตะกร้า ({cart.items.length})</h2>
              <button onClick={() => setShowMobileCart(false)} className="p-2 text-gray-400"><LuX className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.items.map((item) => <CartItemRow key={item.productId} item={item} />)}
            </div>
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-xl font-bold">
                <span>รวม</span>
                <span className="text-orange-600">{formatCurrency(cart.getTotal())}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => { handleHoldBill(); setShowMobileCart(false) }}>
                  <LuPause className="w-4 h-4 mr-1" /> พักบิล
                </Button>
                <Button size="lg" className="flex-[2]" onClick={() => { setShowMobileCart(false); setShowPayment(true) }}>
                  ชำระเงิน
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showQuickAdd && (
        <QuickAddModal
          categories={categories}
          initialBarcode={quickAddBarcode}
          onClose={() => setShowQuickAdd(false)}
          onSaved={() => {
            setShowQuickAdd(false)
            // reload products
            api.get('/products?limit=500').then((res) => setProducts(res.data.products))
          }}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false)
            // reload products to update stock
            api.get('/products?limit=500').then((res) => setProducts(res.data.products))
          }}
        />
      )}

      {/* Held Bills Modal */}
      {showHeld && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHeld(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">📋 บิลที่พักไว้ ({heldBills.length})</h3>
            {heldBills.length === 0 ? (
              <p className="text-gray-400 text-center py-8">ไม่มีบิลที่พักไว้</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {heldBills.map((bill) => (
                  <button
                    key={bill.id}
                    onClick={() => handleResumeBill(bill)}
                    className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{bill.receiptNo}</span>
                      <span className="text-orange-600 font-bold">{formatCurrency(parseFloat(bill.subtotal))}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{bill.items.length} รายการ — {bill.note}</p>
                  </button>
                ))}
              </div>
            )}
            <Button variant="secondary" className="w-full mt-4" onClick={() => setShowHeld(false)}>
              ปิด
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
          <p className="text-xs text-gray-400">{item.sku} · ฿{item.unitPrice}/{item.unit}</p>
        </div>
        <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 p-1">
          <LuX className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
          >
            <LuMinus className="w-3 h-3" />
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
            className="w-12 h-8 text-center rounded-lg border text-sm font-medium"
            min={1}
            max={item.stock}
          />
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
            disabled={item.quantity >= item.stock}
          >
            <LuPlus className="w-3 h-3" />
          </button>
        </div>
        <span className="font-bold text-gray-800">
          {formatCurrency(item.unitPrice * item.quantity - item.discount)}
        </span>
      </div>
    </div>
  )
}
