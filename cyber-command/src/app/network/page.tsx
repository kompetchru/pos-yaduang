'use client'
import { networkFlows, trafficTimeline } from '@/lib/mock-data'
import { severityBg, formatBytes, cn } from '@/lib/utils'
import { LuNetwork, LuArrowRight } from 'react-icons/lu'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cyber-text flex items-center gap-2">
          <LuNetwork className="w-6 h-6 text-cyber-accent" />
          Network Traffic
        </h1>
        <p className="text-sm text-cyber-muted mt-1">Real-time network flow analysis</p>
      </div>

      {/* Traffic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Total Flows</p>
          <p className="text-2xl font-bold text-cyber-accent mt-1">{networkFlows.length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Suspicious Flows</p>
          <p className="text-2xl font-bold text-cyber-red mt-1">
            {networkFlows.filter(f => f.risk === 'critical' || f.risk === 'high').length}
          </p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 card-glow">
          <p className="text-xs text-cyber-muted uppercase">Total Data Transferred</p>
          <p className="text-2xl font-bold text-cyber-purple mt-1">
            {formatBytes(networkFlows.reduce((sum, f) => sum + f.bytes, 0))}
          </p>
        </div>
      </div>

      {/* Threat Traffic Chart */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow">
        <h2 className="text-sm font-semibold text-cyber-text mb-4">Threat Detections (24h)</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficTimeline}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3366" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #1e2a42', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="threats" stroke="#ff3366" fill="url(#threatGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flow Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 card-glow">
        <h2 className="text-sm font-semibold text-cyber-text mb-4">Active Network Flows</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cyber-muted text-xs uppercase border-b border-cyber-border">
                <th className="text-left py-2 px-3">Risk</th>
                <th className="text-left py-2 px-3">Source → Destination</th>
                <th className="text-left py-2 px-3">Protocol</th>
                <th className="text-left py-2 px-3">Port</th>
                <th className="text-left py-2 px-3">Application</th>
                <th className="text-right py-2 px-3">Data</th>
                <th className="text-right py-2 px-3">Packets</th>
              </tr>
            </thead>
            <tbody>
              {networkFlows.map((flow) => (
                <tr key={flow.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase border', severityBg(flow.risk))}>
                      {flow.risk}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    <span className="text-cyber-accent">{flow.sourceIp}</span>
                    <LuArrowRight className="inline w-3 h-3 mx-2 text-cyber-muted" />
                    <span className="text-cyber-purple">{flow.destIp}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-cyber-muted">{flow.protocol}</td>
                  <td className="py-3 px-3 text-xs font-mono text-cyber-text">{flow.port || '—'}</td>
                  <td className="py-3 px-3 text-xs text-cyber-yellow">{flow.application}</td>
                  <td className="py-3 px-3 text-xs text-right text-cyber-text">{formatBytes(flow.bytes)}</td>
                  <td className="py-3 px-3 text-xs text-right text-cyber-muted">{flow.packets.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
