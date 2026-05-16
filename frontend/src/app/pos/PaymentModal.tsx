'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { LuBanknote, LuQrCode, LuCheck, LuDelete, LuX, LuTriangleAlert } from 'react-icons/lu'

const paymentMethods = [
  { key: 'CASH', label: 'เงินสด', icon: LuBanknote },
  { key: 'QR_KSHOP', label: 'K SHOP', icon: LuQrCode },
]

interface Props {
  onClose: () => void
  onSuccess: () => void
}

// แนะนำเงินที่ลูกค้ามักจะให้: พอดี, ปัด 10, ปัด 100, ธนบัตรใหญ่กว่า
function getCashSuggestions(total: number): number[] {
  const set = new Set<number>([total])
  if (total % 10 !== 0) set.add(Math.ceil(total / 10) * 10)
  if (total % 100 !== 0) set.add(Math.ceil(total / 100) * 100)
  ;[20, 50, 100, 500, 1000].forEach((b) => {
    if (b > total) set.add(b)
  })
  return Array.from(set).sort((a, b) => a - b).slice(0, 5)
}

// เปรียบเทียบเงินด้วยทศนิยม 2 ตำแหน่ง (กัน floating point)
function moneyEq(a: number, b: number) {
  return Math.round(a * 100) === Math.round(b * 100)
}

export default function PaymentModal({ onClose, onSuccess }: Props) {
  const cart = useCartStore()
  const total = cart.getTotal()

  const [method, setMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState<string>('')      // เงินสด: รับเงิน
  const [kshopAmount, setKshopAmount] = useState<string>('')    // K SHOP: ยอดที่เห็นใน SMS
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [receiptNo, setReceiptNo] = useState('')
  const [change, setChange] = useState(0)
  const [kshopQrImage, setKshopQrImage] = useState('')
  const [kshopName, setKshopName] = useState('')

  const paid = parseFloat(amountPaid) || 0
  const currentChange = paid - total
  const kshopPaid = parseFloat(kshopAmount) || 0
  const kshopDiff = kshopPaid - total

  const suggestions = useMemo(() => getCashSuggestions(total), [total])

  // เงื่อนไขการชำระ
  const canPayCash = paid >= total
  const canPayKshop = kshopAmount !== '' && kshopPaid >= total // อนุญาตจ่ายเกิน, ห้ามจ่ายขาด

  // Auto-confirm ถ้ายอด K SHOP ตรงเป๊ะ
  const autoConfirmedRef = useRef(false)
  useEffect(() => {
    autoConfirmedRef.current = false
  }, [method, kshopAmount])

  // โหลดรูป QR K-Shop จาก settings
  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        setKshopQrImage(res.data.kshop_qr_image || '')
        setKshopName(res.data.kshop_name || '')
      })
      .catch(() => {})
  }, [])

  // กด numpad — ใช้ร่วมกันทั้ง CASH และ K SHOP
  const pressKey = (key: string) => {
    const setter = method === 'CASH' ? setAmountPaid : setKshopAmount
    if (key === 'C') {
      setter('')
      return
    }
    if (key === 'BACK') {
      setter((v) => v.slice(0, -1))
      return
    }
    if (key === '.') {
      setter((v) => {
        if (v.includes('.')) return v
        return v === '' ? '0.' : v + '.'
      })
      return
    }
    setter((v) => {
      if (v.includes('.') && v.split('.')[1].length >= 2) return v
      if (v === '0' && key !== '.') return key
      return v + key
    })
  }

  const handlePay = async (autoTriggered = false) => {
    const canPay = method === 'CASH' ? canPayCash : canPayKshop
    if (!canPay || processing) return
    setProcessing(true)

    try {
      const { data } = await api.post('/sales', {
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          unit: i.unit,
          discount: i.discount,
        })),
        customerId: cart.customerId,
        discountAmount: cart.discountAmount,
        discountPercent: cart.discountPercent,
        paymentMethod: method,
        amountPaid: method === 'CASH' ? paid : kshopPaid,
        note: cart.note,
        status: 'COMPLETED',
      })

      setReceiptNo(data.receiptNo)
      setChange(parseFloat(data.change))
      setSuccess(true)
      cart.clearCart()
      if (autoTriggered && 'vibrate' in navigator) navigator.vibrate(80)
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setProcessing(false)
    }
  }

  // Auto-confirm: ถ้าเลือก K SHOP และยอดตรงเป๊ะ → ตัดบิลอัตโนมัติ
  useEffect(() => {
    if (
      method === 'QR_KSHOP' &&
      kshopAmount !== '' &&
      moneyEq(kshopPaid, total) &&
      !autoConfirmedRef.current &&
      !processing &&
      !success &&
      total > 0
    ) {
      autoConfirmedRef.current = true
      // delay เล็กน้อยเพื่อให้ผู้ใช้เห็น state เปลี่ยนเป็นเขียว
      const t = setTimeout(() => handlePay(true), 350)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, kshopAmount, total])

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCheck className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินสำเร็จ!</h3>
          <p className="text-gray-500 mb-1">เลขที่บิล: {receiptNo}</p>
          {change > 0 && (
            <div className="bg-orange-50 rounded-xl py-4 my-4">
              <p className="text-sm text-gray-500">เงินทอน</p>
              <p className="text-4xl font-bold text-orange-600">
                {formatCurrency(change)}
              </p>
            </div>
          )}
          <Button size="xl" className="w-full mt-2" onClick={onSuccess}>
            ขายต่อ
          </Button>
        </div>
      </div>
    )
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
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-xl font-bold text-gray-800">💰 ชำระเงิน</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="ปิด"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {/* Total */}
          <div className="bg-orange-50 rounded-xl p-3 mb-3 text-center">
            <p className="text-xs text-gray-500">ยอดที่ต้องชำระ</p>
            <p className="text-3xl font-bold text-orange-600 leading-tight">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {paymentMethods.map((pm) => (
              <button
                key={pm.key}
                onClick={() => {
                  setMethod(pm.key)
                  setAmountPaid('')
                  setKshopAmount('')
                }}
                className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                  method === pm.key
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <pm.icon
                  className={`w-5 h-5 mx-auto mb-0.5 ${
                    method === pm.key ? 'text-orange-600' : 'text-gray-500'
                  }`}
                />
                <p className="text-xs font-medium">{pm.label}</p>
              </button>
            ))}
          </div>

          {/* Cash Mode */}
          {method === 'CASH' && (
            <>
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">รับเงิน</p>
                <div
                  className={`w-full text-center text-3xl font-bold py-3 rounded-xl border-2 ${
                    paid >= total && paid > 0
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : amountPaid === ''
                      ? 'border-gray-200 bg-gray-50 text-gray-300'
                      : 'border-orange-400 bg-orange-50 text-orange-700'
                  }`}
                >
                  {amountPaid === '' ? '0' : amountPaid}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {suggestions.map((v, idx) => (
                  <button
                    key={v}
                    onClick={() => setAmountPaid(v.toString())}
                    className={`py-2 rounded-lg font-medium text-sm transition-colors ${
                      idx === 0
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${paid === v ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    {idx === 0 ? 'พอดี' : `฿${v >= 1000 ? `${v / 1000}k` : v}`}
                  </button>
                ))}
              </div>

              <div
                className={`rounded-xl p-2.5 mb-3 text-center ${
                  paid >= total && paid > 0 ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-500">เงินทอน</p>
                <p
                  className={`text-2xl font-bold ${
                    paid >= total && paid > 0 ? 'text-green-600' : 'text-gray-300'
                  }`}
                >
                  {paid >= total ? formatCurrency(currentChange) : '฿0'}
                </p>
              </div>

              <Numpad onPress={pressKey} />
            </>
          )}

          {/* K SHOP Mode */}
          {method === 'QR_KSHOP' && (
            <div className="mb-3">
              {!kshopQrImage ? (
                <div className="bg-yellow-50 rounded-xl p-4 text-left">
                  <p className="text-sm text-yellow-700 font-medium">
                    ⚠️ ยังไม่ได้อัพโหลดรูป QR K SHOP
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    ไปที่เมนู &quot;⚙️ ตั้งค่า&quot; → อัพโหลดรูป QR ของร้าน
                  </p>
                </div>
              ) : (
                <>
                  {/* QR */}
                  <div className="bg-white border-2 border-green-200 rounded-xl p-3 text-center mb-3">
                    <img
                      src={kshopQrImage}
                      alt="K-Shop QR"
                      className="w-44 h-44 mx-auto object-contain rounded-lg"
                    />
                    <p className="text-base font-bold text-green-700 mt-1">
                      {formatCurrency(total)}
                    </p>
                    {kshopName && (
                      <p className="text-xs text-gray-500">K SHOP: {kshopName}</p>
                    )}
                  </div>

                  {/* Verify amount */}
                  <p className="text-xs text-gray-500 mb-1">
                    📱 กรอกยอดที่เห็นใน SMS / K PLUS
                  </p>
                  <div
                    className={`w-full text-center text-3xl font-bold py-3 rounded-xl border-2 mb-2 ${
                      kshopAmount === ''
                        ? 'border-gray-200 bg-gray-50 text-gray-300'
                        : moneyEq(kshopPaid, total)
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : kshopPaid > total
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-red-400 bg-red-50 text-red-700'
                    }`}
                  >
                    {kshopAmount === '' ? '0' : kshopAmount}
                  </div>

                  {/* Status hint */}
                  <KshopStatus
                    amount={kshopAmount}
                    paid={kshopPaid}
                    total={total}
                    diff={kshopDiff}
                    autoConfirming={
                      autoConfirmedRef.current && processing
                    }
                  />

                  {/* Quick fill */}
                  <div className="flex gap-2 mb-3 mt-2">
                    <button
                      onClick={() => setKshopAmount(total.toString())}
                      className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 font-medium text-sm hover:bg-green-200"
                    >
                      ✓ ยอดตรงพอดี ({formatCurrency(total)})
                    </button>
                    {kshopAmount !== '' && (
                      <button
                        onClick={() => setKshopAmount('')}
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>

                  <Numpad onPress={pressKey} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-white p-3 flex gap-2 rounded-b-2xl">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={processing}
          >
            ยกเลิก
          </Button>
          <Button
            size="lg"
            className="flex-[2]"
            onClick={() => handlePay(false)}
            disabled={
              processing ||
              (method === 'CASH' && !canPayCash) ||
              (method === 'QR_KSHOP' && !canPayKshop)
            }
          >
            {processing
              ? 'กำลังบันทึก...'
              : method === 'QR_KSHOP' && kshopAmount === ''
              ? 'รอลูกค้าชำระ...'
              : 'ยืนยัน'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** ─── สถานะ K SHOP เทียบยอด ─── */
function KshopStatus({
  amount,
  paid,
  total,
  diff,
  autoConfirming,
}: {
  amount: string
  paid: number
  total: number
  diff: number
  autoConfirming: boolean
}) {
  if (amount === '') {
    return (
      <p className="text-xs text-gray-400 text-center">
        กรอกยอดที่ลูกค้าโอนเข้ามา ระบบจะเช็คให้ว่าตรงกับบิลไหม
      </p>
    )
  }
  if (moneyEq(paid, total)) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-green-700 bg-green-50 rounded-lg py-2">
        <LuCheck className="w-4 h-4" />
        <span className="text-sm font-medium">
          {autoConfirming ? 'ตรงกับบิล กำลังตัดยอด...' : 'ยอดตรง ตัดยอดอัตโนมัติ ✓'}
        </span>
      </div>
    )
  }
  if (paid > total) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-blue-700 bg-blue-50 rounded-lg py-2">
        <LuTriangleAlert className="w-4 h-4" />
        <span className="text-sm font-medium">
          ลูกค้าจ่ายเกิน {formatCurrency(diff)} — กดยืนยันได้
        </span>
      </div>
    )
  }
  // paid < total
  return (
    <div className="flex items-center justify-center gap-1.5 text-red-700 bg-red-50 rounded-lg py-2">
      <LuTriangleAlert className="w-4 h-4" />
      <span className="text-sm font-medium">
        ยังขาด {formatCurrency(Math.abs(diff))} ลูกค้ายังจ่ายไม่ครบ
      </span>
    </div>
  )
}

/** ─── Numpad component ─── */
function Numpad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <NumpadKey key={d} onClick={() => onPress(d)}>
          {d}
        </NumpadKey>
      ))}
      <NumpadKey onClick={() => onPress('C')} variant="muted">
        C
      </NumpadKey>
      <NumpadKey onClick={() => onPress('0')}>0</NumpadKey>
      <NumpadKey onClick={() => onPress('BACK')} variant="muted">
        <LuDelete className="w-5 h-5 mx-auto" />
      </NumpadKey>
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
