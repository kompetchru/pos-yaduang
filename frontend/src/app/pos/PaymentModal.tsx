'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button'
import { LuBanknote, LuSmartphone, LuQrCode, LuCreditCard, LuCheck } from 'react-icons/lu'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

const paymentMethods = [
  { key: 'CASH', label: 'เงินสด', icon: LuBanknote },
  { key: 'TRANSFER', label: 'โอนเงิน', icon: LuSmartphone },
  { key: 'QR_PROMPTPAY', label: 'QR PromptPay', icon: LuQrCode },
  { key: 'CARD', label: 'บัตร', icon: LuCreditCard },
]

const quickCash = [20, 50, 100, 500, 1000]

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ onClose, onSuccess }: Props) {
  const cart = useCartStore()
  const total = cart.getTotal()

  const [method, setMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState(total.toString())
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [receiptNo, setReceiptNo] = useState('')
  const [change, setChange] = useState(0)
  const [qrImage, setQrImage] = useState('')
  const [promptPayId, setPromptPayId] = useState('')

  const paid = parseFloat(amountPaid) || 0
  const currentChange = paid - total

  // โหลด PromptPay ID จาก settings
  useEffect(() => {
    api.get('/settings').then((res) => {
      setPromptPayId(res.data.promptpay_id || '')
    }).catch(() => {})
  }, [])

  // สร้าง QR เมื่อเลือก PromptPay
  useEffect(() => {
    if (method === 'QR_PROMPTPAY' && promptPayId && total > 0) {
      try {
        const payload = generatePayload(promptPayId, { amount: total })
        QRCode.toDataURL(payload, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        }).then(setQrImage).catch(() => {})
      } catch {}
    }
  }, [method, promptPayId, total])

  const handlePay = async () => {
    if (method === 'CASH' && paid < total) return
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
        amountPaid: method === 'CASH' ? paid : total,
        note: cart.note,
        status: 'COMPLETED',
      })

      setReceiptNo(data.receiptNo)
      setChange(parseFloat(data.change))
      setSuccess(true)
      cart.clearCart()
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCheck className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินสำเร็จ!</h3>
          <p className="text-gray-500 mb-1">เลขที่บิล: {receiptNo}</p>
          {change > 0 && (
            <p className="text-3xl font-bold text-orange-600 my-4">
              เงินทอน {formatCurrency(change)}
            </p>
          )}
          <Button size="xl" className="w-full mt-4" onClick={onSuccess}>
            ขายต่อ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">💰 ชำระเงิน</h3>

        {/* Total */}
        <div className="bg-orange-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
          <p className="text-4xl font-bold text-orange-600">{formatCurrency(total)}</p>
        </div>

        {/* Payment Method */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {paymentMethods.map((pm) => (
            <button
              key={pm.key}
              onClick={() => {
                setMethod(pm.key)
                if (pm.key !== 'CASH') setAmountPaid(total.toString())
              }}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                method === pm.key
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <pm.icon className={`w-6 h-6 mx-auto mb-1 ${method === pm.key ? 'text-orange-600' : 'text-gray-500'}`} />
              <p className="text-xs font-medium">{pm.label}</p>
            </button>
          ))}
        </div>

        {/* Cash Input */}
        {method === 'CASH' && (
          <>
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">รับเงิน</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full text-center text-3xl font-bold py-4 rounded-xl border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setAmountPaid(total.toString())}
                className="flex-1 py-2 rounded-lg bg-orange-100 text-orange-700 font-medium text-sm hover:bg-orange-200">
                พอดี
              </button>
              {quickCash.filter((v) => v >= total).slice(0, 4).map((v) => (
                <button key={v} onClick={() => setAmountPaid(v.toString())}
                  className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200">
                  ฿{v}
                </button>
              ))}
            </div>

            {paid >= total && (
              <div className="bg-green-50 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-gray-500">เงินทอน</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentChange)}</p>
              </div>
            )}
          </>
        )}

        {/* QR PromptPay */}
        {method === 'QR_PROMPTPAY' && (
          <div className="mb-4 text-center">
            {qrImage ? (
              <div className="bg-white border-2 border-purple-200 rounded-xl p-4 inline-block">
                <p className="text-sm text-purple-700 font-medium mb-2">สแกน QR เพื่อชำระ</p>
                <img src={qrImage} alt="PromptPay QR" className="w-56 h-56 mx-auto" />
                <p className="text-2xl font-bold text-purple-700 mt-3">{formatCurrency(total)}</p>
                <p className="text-xs text-gray-500 mt-1">PromptPay: {promptPayId}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-700">
                  {promptPayId ? 'กำลังสร้าง QR...' : '⚠️ ยังไม่ได้ตั้งค่า PromptPay ID — ไปตั้งค่าที่เมนู "ตั้งค่า"'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transfer */}
        {method === 'TRANSFER' && (
          <div className="mb-4 bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">โอนเงินมาที่</p>
            <p className="text-lg font-bold text-blue-800 mt-1">{promptPayId || 'ยังไม่ได้ตั้งค่า'}</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-500 mt-2">กดยืนยันหลังลูกค้าโอนแล้ว</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            size="lg"
            className="flex-[2]"
            onClick={handlePay}
            disabled={processing || (method === 'CASH' && paid < total)}
          >
            {processing ? 'กำลังบันทึก...' : 'ยืนยันชำระเงิน'}
          </Button>
        </div>
      </div>
    </div>
  )
}
