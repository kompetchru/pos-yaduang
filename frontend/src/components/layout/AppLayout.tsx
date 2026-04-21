'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import Sidebar from './Sidebar'
import { LuMenu } from 'react-icons/lu'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loadFromStorage } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadFromStorage()
    // ให้ router มีเวลา initialize ก่อน
    const timer = setTimeout(() => setReady(true), 100)
    return () => clearTimeout(timer)
  }, [loadFromStorage])

  useEffect(() => {
    if (!ready) return
    if (!user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [ready, user, pathname, router])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // ยังไม่พร้อม — แสดง loading
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // หน้า login ไม่ต้องมี layout
  if (pathname === '/login') return <>{children}</>

  // ยังไม่ login → ไม่แสดงอะไร (กำลัง redirect)
  if (!user) return null

  // POS full width
  if (pathname === '/pos') {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-30 flex items-center px-4 py-3">
        <button onClick={() => setSidebarOpen(true)} className="p-1 text-gray-600">
          <LuMenu className="w-6 h-6" />
        </button>
        <h1 className="ml-3 text-lg font-bold text-orange-600">🏪 ร้านชำยายด้วง</h1>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="md:ml-64 p-4 md:p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
