'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LuReceipt, LuSearch, LuEye, LuX, LuBan } from 'react-icons/lu'

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const limit = 20

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    if (methodFilter) params.set('method', methodFilter)

    api.get(`/sales?${params}`)
      .then((res) => { setSales(res.data.sales); setTotal(res.data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, dateFrom, dateTo, methodFilter])

  const loadDetail = (id: string) => {
    api.get(`/sales/${id}`).then((res) => setSelectedSale(res.data)).catch(console.error)
  }

  const handleVoid = async (id: string) => {
    if (!confirm('ต้องการยกเลิกบิลนี้ใช่หรือไม่? สต๊อกจะถูกคืนกลับ')) return
    await api.post(`/sales/${id}/void`)
    setSelectedSale(null)
    load()
  }

  const methodLabel: Record<string, string> = {
    CASH: 'เงินสด', TRANSFER: 'โอนเงิน', QR_KSHOP: 'K SHOP', QR_PROMPTPAY: 'QR PromptPay', CARD: 'บัตร',
  }
  const methodColor: Record<string, 'success' | 'info' | 'default' | 'warning'> = {
    CASH: 'success', TRANSFER: 'info', QR_KSHOP: 'default', QR_PROMPTPAY: 'default', CARD: 'warning',
  }
  const statusLabel: Record<string, string> = { COMPLETED: 'สำเร็จ', VOIDED: 'ยกเลิก', HELD: 'พักบิล' }
  const statusColor: Record<string, 'success' | 'danger' | 'warning'> = { COMPLETED: 'success', VOIDED: 'danger', HELD: 'warning' }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧾 ประวัติการขาย</h1>
          <p className="text-gray-500 text-sm">ดูรายการบิลย้อนหลังทั้งหมด ({total} บิล)</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 p-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">จากวันที่</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-400 outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">ถึงวันที่</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-400 outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">ช่องทางชำระ</label>
            <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-400 outline-none">
              <option value="">ทั้งหมด</option>
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">โอนเงิน</option>
              <option value="QR_KSHOP">K SHOP</option>
              <option value="QR_PROMPTPAY">QR PromptPay (เก่า)</option>
              <option value="CARD">บัตร</option>
            </select>
          </div>
          <button onClick={() => { const today = new Date().toISOString().slice(0, 10); setDateFrom(today); setDateTo(today); setPage(1) }}
              className="px-3 py-2 rounded-xl bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200">
              วันนี้
            </button>
          {(dateFrom || dateTo || methodFilter) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setMethodFilter(''); setPage(1) }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-red-500">
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">เลขที่บิล</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่/เวลา</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">รายการ</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">ชำระ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ยอดรวม</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">พนักงาน</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">ดู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((sale) => (
                <tr key={sale.id} className={`hover:bg-gray-50 transition-colors ${sale.status === 'VOIDED' ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{sale.receiptNo}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(sale.createdAt)}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{sale.items?.length || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={methodColor[sale.paymentMethod] || 'default'}>
                      {methodLabel[sale.paymentMethod] || sale.paymentMethod}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(parseFloat(sale.total))}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusColor[sale.status] || 'default'}>
                      {statusLabel[sale.status] || sale.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{sale.user?.name}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => loadDetail(sale.id)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                      <LuEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">ไม่พบรายการ</div>
          )}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              หน้า {page} / {totalPages} (ทั้งหมด {total} บิล)
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="px-3 py-1 rounded-lg text-sm border hover:bg-white disabled:opacity-40">ก่อนหน้า</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg text-sm border hover:bg-white disabled:opacity-40">ถัดไป</button>
            </div>
          </div>
        )}
      </Card>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">🧾 บิล {selectedSale.receiptNo}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedSale.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColor[selectedSale.status]}>{statusLabel[selectedSale.status]}</Badge>
                <button onClick={() => setSelectedSale(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="p-6">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">สินค้า</th>
                    <th className="text-right py-2 font-medium text-gray-600">ราคา</th>
                    <th className="text-right py-2 font-medium text-gray-600">จำนวน</th>
                    <th className="text-right py-2 font-medium text-gray-600">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedSale.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.unit}</p>
                      </td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(parseFloat(item.unitPrice))}</td>
                      <td className="py-2 text-right text-gray-600">x{item.quantity}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(parseFloat(item.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>ยอดรวม</span>
                  <span>{formatCurrency(parseFloat(selectedSale.subtotal))}</span>
                </div>
                {parseFloat(selectedSale.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>ส่วนลด</span>
                    <span>-{formatCurrency(parseFloat(selectedSale.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-orange-600">{formatCurrency(parseFloat(selectedSale.total))}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>ชำระ ({methodLabel[selectedSale.paymentMethod]})</span>
                  <span>{formatCurrency(parseFloat(selectedSale.amountPaid))}</span>
                </div>
                {parseFloat(selectedSale.change) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>เงินทอน</span>
                    <span>{formatCurrency(parseFloat(selectedSale.change))}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
                <p>พนักงาน: {selectedSale.user?.name}</p>
                {selectedSale.customer && <p>ลูกค้า: {selectedSale.customer.name}</p>}
                {selectedSale.note && <p>หมายเหตุ: {selectedSale.note}</p>}
              </div>

              {/* Void Button */}
              {selectedSale.status === 'COMPLETED' && (
                <Button variant="danger" className="w-full mt-4" onClick={() => handleVoid(selectedSale.id)}>
                  <LuBan className="w-4 h-4 mr-2" /> ยกเลิกบิลนี้
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
