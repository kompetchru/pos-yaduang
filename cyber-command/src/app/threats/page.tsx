'use client'
import { useState } from 'react'
import { threatAlerts, Severity } from '@/lib/mock-data'
import { severityBg, severityColor, timeAgo, cn } from '@/lib/utils'
import { LuShieldAlert, LuFilter, LuSearch } from 'react-icons/lu'

export default function ThreatsPage() {
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = threatAlerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (search && !a.type.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cyber-text flex items-center gap-2">
          <LuShieldAlert className="w-6 h-6 text-cyber-red" />
          Threat Alerts
        </h1>
        <p className="text-sm text-cyber-muted mt-1">{threatAlerts.length} total alerts — {threatAlerts.filter(a => a.status === 'open').length} open</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-cyber-card border border-cyber-border rounded-lg text-sm text-cyber-text placeholder:text-cyber-muted focus:border-cyber-accent focus:outline-none w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <LuFilter className="w-4 h-4 text-cyber-muted" />
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                filterSeverity === s
                  ? 'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/30'
                  : 'bg-cyber-card text-cyber-muted border-cyber-border hover:border-cyber-accent/30'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {['all', 'open', 'investigating', 'resolved', 'dismissed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                filterStatus === s
                  ? 'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/30'
                  : 'bg-cyber-card text-cyber-muted border-cyber-border hover:border-cyber-accent/30'
              )}
            >
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className="bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow hover:border-cyber-accent/20 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase border', severityBg(alert.severity))}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-cyber-muted font-mono">{alert.id}</span>
                  <span className="text-xs text-cyber-muted">{timeAgo(alert.timestamp)}</span>
                </div>
                <h3 className="text-base font-semibold text-cyber-text">{alert.type}</h3>
                <p className="text-sm text-cyber-muted mt-1">{alert.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="text-cyber-muted">Source: <span className="font-mono text-cyber-accent">{alert.source}</span></span>
                  <span className="text-cyber-muted">Dest: <span className="font-mono text-cyber-accent">{alert.destination}</span></span>
                  <span className="text-cyber-muted">Stage: <span className="text-cyber-yellow">{alert.attackStage}</span></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn('text-xs font-medium px-2 py-1 rounded-lg', {
                  'bg-cyber-red/10 text-cyber-red': alert.status === 'open',
                  'bg-cyber-yellow/10 text-cyber-yellow': alert.status === 'investigating',
                  'bg-cyber-green/10 text-cyber-green': alert.status === 'resolved',
                  'bg-cyber-muted/10 text-cyber-muted': alert.status === 'dismissed',
                })}>
                  {alert.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-cyber-muted">No alerts match your filters</div>
        )}
      </div>
    </div>
  )
}
