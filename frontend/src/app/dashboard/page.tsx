'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LuShoppingCart,
  LuTrendingUp,
  LuPackage,
  LuTriangleAlert,
  LuCalendar,
  LuCalendarDays,
} from 'react-icons/lu'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DashboardData {
  todaySales: { total: number; count: number }
  weekSales: { total: number }
  monthSales: { total: number; count: number }
  totalProducts: number
  lowStockCount: number
  recentTransactions: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [salesChart, setSalesChart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/sales-summary?groupBy=day'),
    ])
      .then(([dashRes, chartRes]) => {
        setData(dashRes.data)
        setSalesChart(chartRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return <p className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</p>

  const statCards = [
    {
      label: 'ยอดขายวันนี้',
      value: formatCurrency(data.todaySales.total),
      sub: `${data.todaySales.count} บิล`,
      icon: LuShoppingCart,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'ยอดขายสัปดาห์นี้',
      value: formatCurrency(data.weekSales.total),
      sub: '7 วันล่าสุด',
      icon: LuCalendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'ยอดขายเดือนนี้',
      value: formatCurrency(data.monthSales.total),
      sub: `${data.monthSales.count} บิล`,
      icon: LuCalendarDays,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'สินค้าทั้งหมด',
      value: data.totalProducts.toString(),
      sub: 'รายการ',
      icon: LuPackage,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
          <p className="text-gray-500 text-sm">ภาพรวมร้านชำยายด้วง</p>
        </div>
        <Link href="/pos">
          <Button size="lg">
            <LuShoppingCart className="w-5 h-5 mr-2" />
            เปิดหน้าขาย
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {data.lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <LuTriangleAlert className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">
              สินค้าใกล้หมด {data.lowStockCount} รายการ
            </p>
            <Link href="/stock" className="text-sm text-yellow-600 hover:underline">
              ดูรายละเอียด →
            </Link>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuTrendingUp className="w-5 h-5 text-orange-500" />
            ยอดขาย 30 วันล่าสุด
          </CardTitle>
        </CardHeader>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `฿${v}`} />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'ยอดขาย']}
                labelFormatter={(label) => `วันที่ ${label}`}
              />
              <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
