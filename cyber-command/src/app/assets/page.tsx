'use client'
import { assets } from '@/lib/mock-data'
import { timeAgo, cn } from '@/lib/utils'
import { LuMonitor, LuShieldAlert, LuWifi, LuWifiOff } from 'react-icons/lu'

function riskColor(risk: number) {
  if (risk >= 80) return 'text-cyber-red'
  if (risk >= 60) return 'text-orange-400'
  if (risk >= 40) return 'text-cyber-yellow'
  return 'text-cyber-green'
}

function riskBarColor(risk: number) {
  if (risk >= 80) return 'bg-cyber-red'
  if (risk >= 60) return 'bg-orange-400'
  if (risk >= 40) return 'bg-cyber-yellow'
  return 'bg-cyber-green'
}

export default function AssetsPage() {
  const sorted = [...assets].sort((a, b) => b.risk - a.risk)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cyber-text flex items-center gap-2">
          <LuMonitor className="w-6 h-6 text-cyber-accent" />
          Asset Inventory
        </h1>
        <p className="text-sm text-cyber-muted mt-1">
          {assets.length} assets monitored — {assets.filter(a => a.status === 'compromised').length} compromised
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Total Assets</p>
          <p className="text-2xl font-bold text-cyber-accent mt-1">{assets.length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Online</p>
          <p className="text-2xl font-bold text-cyber-green mt-1">{assets.filter(a => a.status === 'online').length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Compromised</p>
          <p className="text-2xl font-bold text-cyber-red mt-1">{assets.filter(a => a.status === 'compromised').length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Offline</p>
          <p className="text-2xl font-bold text-cyber-muted mt-1">{assets.filter(a => a.status === 'offline').length}</p>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((asset) => (
          <div key={asset.id} className={cn(
            'bg-cyber-card border rounded-xl p-5 card-glow transition-colors',
            asset.status === 'compromised' ? 'border-cyber-red/40' : 'border-cyber-border hover:border-cyber-accent/20'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', {
                  'bg-cyber-red/10': asset.status === 'compromised',
                  'bg-cyber-green/10': asset.status === 'online',
                  'bg-cyber-muted/10': asset.status === 'offline',
                })}>
                  <LuMonitor className={cn('w-5 h-5', {
                    'text-cyber-red': asset.status === 'compromised',
                    'text-cyber-green': asset.status === 'online',
                    'text-cyber-muted': asset.status === 'offline',
                  })} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cyber-text">{asset.hostname}</h3>
                  <p className="text-xs font-mono text-cyber-accent">{asset.ip}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {asset.status === 'compromised' && <LuShieldAlert className="w-4 h-4 text-cyber-red" />}
                {asset.status === 'online' ? (
                  <LuWifi className="w-4 h-4 text-cyber-green" />
                ) : asset.status === 'offline' ? (
                  <LuWifiOff className="w-4 h-4 text-cyber-muted" />
                ) : null}
                <span className={cn('text-[10px] font-bold uppercase', {
                  'text-cyber-red': asset.status === 'compromised',
                  'text-cyber-green': asset.status === 'online',
                  'text-cyber-muted': asset.status === 'offline',
                })}>
                  {asset.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-cyber-muted">OS</p>
                <p className="text-cyber-text mt-0.5">{asset.os}</p>
              </div>
              <div>
                <p className="text-cyber-muted">Alerts</p>
                <p className="text-cyber-yellow mt-0.5 font-medium">{asset.alerts}</p>
              </div>
              <div>
                <p className="text-cyber-muted">Last Seen</p>
                <p className="text-cyber-text mt-0.5">{timeAgo(asset.lastSeen)}</p>
              </div>
            </div>

            {/* Risk Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-cyber-muted">Risk Score</span>
                <span className={cn('font-bold', riskColor(asset.risk))}>{asset.risk}/100</span>
              </div>
              <div className="w-full h-1.5 bg-cyber-border rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', riskBarColor(asset.risk))} style={{ width: `${asset.risk}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
