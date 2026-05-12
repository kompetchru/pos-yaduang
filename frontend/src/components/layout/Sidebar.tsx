'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import {
  LuLayoutDashboard,
  LuShoppingCart,
  LuPackage,
  LuWarehouse,
  LuUsers,
  LuTruck,
  LuChartBar,
  LuSettings,
  LuSparkles,
  LuLogOut,
  LuReceipt,
} from 'react-icons/lu'
import { APP_VERSION, APP_BUILD_DATE } from '@/lib/version'

const menuItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: LuLayoutDashboard },
  { href: '/pos', label: 'ขายสินค้า', icon: LuShoppingCart, highlight: true },
  { href: '/sales', label: 'ประวัติบิล', icon: LuReceipt },
  { href: '/products', label: 'สินค้า', icon: LuPackage },
  { href: '/stock', label: 'สต๊อก', icon: LuWarehouse },
  { href: '/customers', label: 'ลูกค้า', icon: LuUsers },
  { href: '/suppliers', label: 'ซัพพลายเออร์', icon: LuTruck },
  { href: '/reports', label: 'รายงาน', icon: LuChartBar },
  { href: '/ai-insights', label: 'AI วิเคราะห์', icon: LuSparkles },
  { href: '/settings', label: 'ตั้งค่า', icon: LuSettings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-orange-600">🏪 ร้านชำยายด้วง</h1>
        <p className="text-xs text-gray-400 mt-1">ระบบขายหน้าร้าน POS</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
                item.highlight && !isActive && 'text-orange-500 font-semibold'
              )}
            >
              <Icon className={cn('w-5 h-5', item.highlight && !isActive && 'text-orange-500')} />
              {item.label}
              {item.highlight && (
                <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  ขาย
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">
              {user?.role === 'OWNER' ? 'เจ้าของร้าน' : user?.role === 'ADMIN' ? 'ผู้ดูแล' : 'แคชเชียร์'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="ออกจากระบบ"
          >
            <LuLogOut className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">v{APP_VERSION} ({APP_BUILD_DATE})</p>
      </div>
    </aside>
  )
}
