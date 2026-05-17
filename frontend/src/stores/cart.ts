import { create } from 'zustand'

export interface CartItem {
  productId: string
  name: string
  sku: string
  unit: string
  unitPrice: number
  quantity: number
  discount: number
  imageUrl?: string | null
  stock: number
  _key?: string // unique key (สำหรับ MISC items ที่ productId ซ้ำได้)
}

interface CartState {
  items: CartItem[]
  discountAmount: number
  discountPercent: number
  customerId: string | null
  note: string

  addItem: (product: any) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  setDiscount: (amount: number, percent: number) => void
  setCustomer: (id: string | null) => void
  setNote: (note: string) => void
  clearCart: () => void

  getSubtotal: () => number
  getTotalDiscount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountAmount: 0,
  discountPercent: 0,
  customerId: null,
  note: '',

  addItem: (product) => {
    const items = get().items
    // สินค้า MISC (ตั้งราคาเอง) → เพิ่มเป็นรายการใหม่ทุกครั้ง ไม่รวม
    const isMisc = product.sku?.startsWith('MISC')
    const existing = !isMisc ? items.find((i) => i.productId === product.id) : null

    if (existing) {
      if (existing.quantity >= product.stock) return
      set({
        items: items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({
        items: [
          ...items,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.unit,
            unitPrice: parseFloat(product.sellPrice),
            quantity: 1,
            discount: 0,
            imageUrl: product.imageUrl,
            stock: product.stock,
            // tag เพื่อแยกแถวในตะกร้าสำหรับ MISC ที่ productId ซ้ำได้
            _key: isMisc ? `misc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : product.id,
          } as any,
        ],
      })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      ),
    })
  },

  updateItemDiscount: (productId, discount) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, discount } : i
      ),
    })
  },

  setDiscount: (amount, percent) => set({ discountAmount: amount, discountPercent: percent }),
  setCustomer: (id) => set({ customerId: id }),
  setNote: (note) => set({ note }),

  clearCart: () =>
    set({ items: [], discountAmount: 0, discountPercent: 0, customerId: null, note: '' }),

  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity - i.discount, 0)
  },

  getTotalDiscount: () => {
    const { discountAmount, discountPercent } = get()
    const subtotal = get().getSubtotal()
    return discountAmount + subtotal * (discountPercent / 100)
  },

  getTotal: () => {
    return get().getSubtotal() - get().getTotalDiscount()
  },
}))
