'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LuShield, LuRadar, LuNetwork, LuMonitor,
  LuFileWarning, LuSettings, LuActivity,
} from 'react-icons/lu'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LuRadar },
  { href: '/threats', label: 'Threat Alerts', icon: LuFileWarning },
  { href: '/network', label: 'Network', icon: LuNetwork },
  { href: '/assets', label: 'Assets', icon: LuMonitor },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-cyber-surface border-r border-cyber-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-cyber-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-accent/10 flex items-center justify-center">
            <LuShield className="w-6 h-6 text-cyber-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cyber-accent glow-accent tracking-wide">
              CYBER COMMAND
            </h1>
            <p className="text-[10px] text-cyber-muted uppercase tracking-widest">
              Security Operations
            </p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-5 py-3 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs text-cyber-green">System Active — Monitoring</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5 border border-transparent'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.label === 'Threat Alerts' && (
                <span className="ml-auto bg-cyber-red/20 text-cyber-red text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  4
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyber-border">
        <div className="flex items-center gap-2 text-xs text-cyber-muted">
          <LuActivity className="w-3 h-3" />
          <span>Engine v2.4.1 — Signatures: 48,392</span>
        </div>
      </div>
    </aside>
  )
}
