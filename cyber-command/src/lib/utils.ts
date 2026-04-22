import { Severity } from './mock-data'

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function severityColor(s: Severity) {
  const map: Record<Severity, string> = {
    critical: 'text-cyber-red',
    high: 'text-orange-400',
    medium: 'text-cyber-yellow',
    low: 'text-cyber-accent',
    info: 'text-cyber-muted',
  }
  return map[s]
}

export function severityBg(s: Severity) {
  const map: Record<Severity, string> = {
    critical: 'bg-cyber-red/15 text-cyber-red border-cyber-red/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/30',
    low: 'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/30',
    info: 'bg-cyber-muted/15 text-cyber-muted border-cyber-muted/30',
  }
  return map[s]
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}
