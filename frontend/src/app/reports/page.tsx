'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { LuChartBar, LuTrendingUp, LuCreditCard, LuPackage } from 'react-icons/lu'

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

export default function ReportsPage() {
  const [salesSummary, setSalesSummary] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [profit, setProfit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/sales-summary?groupBy=day'),
      api.get('/reports/top-products?limit=10'),
      api.get('/reports/payment-methods'),
      api.get('/reports/profit'),
    ])
      .then(([ss, tp, pm, pr]) => {
        setSalesSummary(ss.data)
        setTopProducts(tp.data)
        setPaymentMethods(pm.data)
        setProfit(pr.data?.[0] || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const methodLabel: Record<string, string> = {
    CASH: 'เงินสด', TRANSFER: 'โอนเงิน', QR_KSHOP: 'K SHOP', QR_PROMPTPAY: 'QR PromptPay', CARD: 'บัตร',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 รายงาน</h1>
        <p className="text-gray-500 text-sm">สรุปยอดขายและข้อมูลร้าน (30 วันล่าสุด)</p>
      </div>

      {/* Profit Summary */}
      {profit && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-gray-500">รายรับ</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(profit.revenue || 0)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">ต้นทุน</p>
            <p className="text-2xl font-bold text-gray-600">{formatCurrency(profit.cost || 0)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">กำไรเบื้องต้น</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(profit.profit || 0)}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuTrendingUp className="w-5 h-5 text-orange-500" /> ยอดขายรายวัน
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), 'ยอดขาย']} />
                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuPackage className="w-5 h-5 text-purple-500" /> สินค้าขายดี Top 10
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.productName}</p>
                </div>
                <span className="text-sm text-gray-500">{p.totalQty} ชิ้น</span>
                <span className="text-sm font-medium text-orange-600">{formatCurrency(p.totalRevenue)}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-gray-400 text-center py-4">ยังไม่มีข้อมูล</p>}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuCreditCard className="w-5 h-5 text-blue-500" /> ช่องทางชำระเงิน
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods.map((m) => ({ ...m, name: methodLabel[m.method] || m.method }))}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {paymentMethods.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
