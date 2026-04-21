'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { LuSparkles, LuPackage, LuRefreshCw, LuTrendingUp, LuTriangleAlert, LuShoppingCart } from 'react-icons/lu'

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [recSummary, setRecSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/ai/insights'), api.get('/ai/recommendations')])
      .then(([ins, rec]) => {
        setInsights(ins.data.insights)
        setAiInsights(ins.data.aiInsights)
        setData(ins.data.data)
        setSummary(ins.data.summary)
        setRecommendations(rec.data.recommendations)
        setRecSummary(rec.data.summary)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const urgencyColor: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
    'หมด': 'danger', 'ใกล้หมด': 'warning', 'เหลือน้อย': 'info', 'ปกติ': 'default',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✨ AI วิเคราะห์ร้าน</h1>
          <p className="text-gray-500 text-sm">วิเคราะห์ข้อมูลอัตโนมัติจากยอดขาย 30 วัน</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <LuRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">กำลังวิเคราะห์ข้อมูล...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">ยอดขาย 30 วัน</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.totalRevenue30)}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">จำนวนบิล</p>
                <p className="text-lg font-bold text-gray-800">{summary.totalBills30} บิล</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">เฉลี่ย/วัน</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(summary.avgDaily)}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">เทียบเดือนก่อน</p>
                <p className={`text-lg font-bold ${summary.growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.growthPct >= 0 ? '+' : ''}{summary.growthPct}%
                </p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">สินค้าทั้งหมด</p>
                <p className="text-lg font-bold text-gray-800">{summary.totalProducts}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-xs text-gray-500">สินค้าใกล้หมด</p>
                <p className={`text-lg font-bold ${summary.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {summary.lowStockCount}
                </p>
              </Card>
            </div>
          )}

          {/* Built-in Insights */}
          {insights && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <LuSparkles className="w-5 h-5" /> การวิเคราะห์อัตโนมัติ
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {insights.split('\n\n').map((line, i) => (
                  <div key={i} className="bg-white/70 rounded-xl p-3 text-sm text-gray-700">
                    {line}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Insights (OpenAI) */}
          {aiInsights && (
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <LuSparkles className="w-5 h-5" /> คำแนะนำจาก AI (GPT)
                </CardTitle>
              </CardHeader>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {aiInsights}
              </div>
            </Card>
          )}

          {/* Sales Chart */}
          {data?.salesByDay && data.salesByDay.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LuTrendingUp className="w-5 h-5 text-orange-500" /> ยอดขายรายวัน 30 วัน
                </CardTitle>
              </CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `฿${v}`} />
                    <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), 'ยอดขาย']} />
                    <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Top Products */}
          {data?.topProducts && data.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LuShoppingCart className="w-5 h-5 text-green-500" /> สินค้าขายดี Top 10 (30 วัน)
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {data.topProducts.map((p: any, i: number) => (
                  <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.productName}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{p.qty} ชิ้น</span>
                    <span className="text-sm font-bold text-orange-600 w-20 text-right">{formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations — สินค้าที่ควรสั่งเพิ่ม */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LuPackage className="w-5 h-5 text-blue-500" /> สินค้าที่ควรสั่งเพิ่ม
                  </CardTitle>
                  {recSummary && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{recSummary.totalItems} รายการ</p>
                      <p className="text-sm font-bold text-blue-600">ต้นทุนรวม {formatCurrency(recSummary.totalOrderCost)}</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">สินค้า</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">สถานะ</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">คงเหลือ</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">ขาย/วัน</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">ขาย 30 วัน</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">เหลือพอขาย</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600 bg-blue-50">แนะนำสั่ง</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600 bg-blue-50">ต้นทุน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recommendations.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span>{r.categoryIcon || '📦'}</span>
                            <div>
                              <p className="font-medium text-gray-800">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.sku} · {r.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={urgencyColor[r.urgency] || 'default'}>{r.urgency}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={r.stock <= 0 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                            {r.stock} {r.unit}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{r.dailyAvg}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{r.soldLast30Days}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={r.daysOfStock <= 3 ? 'text-red-600 font-bold' : r.daysOfStock <= 7 ? 'text-yellow-600' : 'text-gray-600'}>
                            {r.daysOfStock >= 999 ? '-' : `${r.daysOfStock} วัน`}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right bg-blue-50">
                          <span className="text-blue-700 font-bold text-base">{r.suggestedOrder} {r.unit}</span>
                        </td>
                        <td className="px-3 py-2 text-right bg-blue-50 text-gray-600">
                          {formatCurrency(r.orderCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Low Stock Alert */}
          {data?.lowStock && data.lowStock.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <LuTriangleAlert className="w-5 h-5" /> สินค้าใกล้หมด ({data.lowStock.length} รายการ)
                </CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {data.lowStock.map((p: any, i: number) => (
                  <Badge key={i} variant={p.stock <= 0 ? 'danger' : 'warning'}>
                    {p.name}: เหลือ {p.stock}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
