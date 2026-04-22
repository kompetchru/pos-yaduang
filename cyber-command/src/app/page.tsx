'use client'
import {
  threatAlerts, trafficTimeline, attackStages, assets,
} from '@/lib/mock-data'
import { severityBg, severityColor, timeAgo, cn } from '@/lib/utils'
import {
  LuShieldAlert, LuRadar, LuTriangleAlert, LuActivity,
  LuArrowUpRight, LuCircleAlert,
} from 'react-icons/lu'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'

export default function DashboardPage() {
  const criticalCount = threatAlerts.filter(a => a.severity === 'critical').length
  const highCount = threatAlerts.filter(a => a.severity === 'high').length
  const openCount = threatAlerts.filter(a => a.status === 'open').length
  const compromisedCount = assets.filter(a => a.status === 'compromised').length

  const stats = [
    { label: 'Critical Threats', value: criticalCount, icon: LuShieldAlert, color: 'text-cyber-red', bg: 'bg-cyber-red/10', glow: 'pulse-critical' },
    { label: 'High Severity', value: highCount, icon: LuTriangleAlert, color: 'text-orange-400', bg: 'bg-orange-500/10', glow: '' },
    { label: 'Open Alerts', value: openCount, icon: LuCircleAlert, color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/10', glow: '' },
    { label: 'Compromised Assets', value: compromisedCount, icon: LuRadar, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10', glow: '' },
  ]

  const recentAlerts = threatAlerts.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text">Security Overview</h1>
          <p className="text-sm text-cyber-muted flex items-center gap-2 mt-1">
            <LuActivity className="w-3 h-3 text-cyber-green" />
            Real-time threat monitoring — Last updated: just now
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-red/10 border border-cyber-red/30">
          <span className="w-2 h-2 rounded-full bg-cyber-red animate-pulse" />
          <span className="text-xs font-medium text-cyber-red">THREAT LEVEL: HIGH</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn('bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow', s.glow)}>
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <LuArrowUpRight className="w-4 h-4 text-cyber-muted" />
            </div>
            <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-cyber-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Timeline */}
        <div className="lg:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow">
          <h2 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <LuActivity className="w-4 h-4 text-cyber-accent" />
            Network Traffic (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficTimeline}>
                <defs>
                  <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#1a2236', border: '1px solid #1e2a42', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#00e5ff" fill="url(#inGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="outbound" stroke="#a855f7" fill="url(#outGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Kill Chain */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow">
          <h2 className="text-sm font-semibold text-cyber-text mb-4">
            ⚔️ MITRE ATT&CK Stages
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackStages} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
                <Tooltip
                  contentStyle={{ background: '#1a2236', border: '1px solid #1e2a42', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {attackStages.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cyber-text flex items-center gap-2">
            <LuShieldAlert className="w-4 h-4 text-cyber-red" />
            Recent Threat Alerts
          </h2>
          <a href="/threats" className="text-xs text-cyber-accent hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cyber-muted text-xs uppercase border-b border-cyber-border">
                <th className="text-left py-2 px-3">Severity</th>
                <th className="text-left py-2 px-3">Alert</th>
                <th className="text-left py-2 px-3">Source</th>
                <th className="text-left py-2 px-3">Stage</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((alert) => (
                <tr key={alert.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border', severityBg(alert.severity))}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-cyber-text">{alert.type}</p>
                    <p className="text-xs text-cyber-muted truncate max-w-xs">{alert.description}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-cyber-accent">{alert.source}</td>
                  <td className="py-3 px-3 text-xs text-cyber-muted">{alert.attackStage}</td>
                  <td className="py-3 px-3">
                    <span className={cn('text-xs font-medium', {
                      'text-cyber-red': alert.status === 'open',
                      'text-cyber-yellow': alert.status === 'investigating',
                      'text-cyber-green': alert.status === 'resolved',
                      'text-cyber-muted': alert.status === 'dismissed',
                    })}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-cyber-muted whitespace-nowrap">{timeAgo(alert.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
