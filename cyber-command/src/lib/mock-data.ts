// Simulated threat & network data

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface ThreatAlert {
  id: string
  timestamp: string
  severity: Severity
  type: string
  source: string
  destination: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  attackStage: string
}

export interface NetworkFlow {
  id: string
  sourceIp: string
  destIp: string
  protocol: string
  port: number
  bytes: number
  packets: number
  risk: Severity
  application: string
}

export interface Asset {
  id: string
  hostname: string
  ip: string
  os: string
  risk: number
  alerts: number
  status: 'online' | 'offline' | 'compromised'
  lastSeen: string
}

const now = new Date()
const ts = (minAgo: number) => new Date(now.getTime() - minAgo * 60000).toISOString()

export const threatAlerts: ThreatAlert[] = [
  { id: 'ALT-001', timestamp: ts(2), severity: 'critical', type: 'Ransomware C2 Communication', source: '10.0.1.45', destination: '185.220.101.34', description: 'Outbound connection to known ransomware C2 server detected. Cobalt Strike beacon pattern identified.', status: 'open', attackStage: 'Command & Control' },
  { id: 'ALT-002', timestamp: ts(8), severity: 'critical', type: 'Lateral Movement — Pass the Hash', source: '10.0.1.45', destination: '10.0.2.10', description: 'NTLM relay attack detected between workstation and domain controller.', status: 'investigating', attackStage: 'Lateral Movement' },
  { id: 'ALT-003', timestamp: ts(15), severity: 'high', type: 'Data Exfiltration Attempt', source: '10.0.3.22', destination: '104.21.56.78', description: 'Large volume DNS tunneling detected. ~2.3GB data transferred via encoded DNS queries.', status: 'open', attackStage: 'Exfiltration' },
  { id: 'ALT-004', timestamp: ts(22), severity: 'high', type: 'Brute Force — SSH', source: '203.0.113.50', destination: '10.0.1.5', description: '4,500+ failed SSH login attempts from external IP in 10 minutes.', status: 'investigating', attackStage: 'Initial Access' },
  { id: 'ALT-005', timestamp: ts(35), severity: 'medium', type: 'Suspicious PowerShell Execution', source: '10.0.2.88', destination: '-', description: 'Encoded PowerShell command with bypass execution policy detected on endpoint.', status: 'open', attackStage: 'Execution' },
  { id: 'ALT-006', timestamp: ts(48), severity: 'medium', type: 'Port Scan Detected', source: '10.0.1.100', destination: '10.0.0.0/16', description: 'Internal host scanning 65,535 ports across subnet. Nmap SYN scan signature.', status: 'resolved', attackStage: 'Reconnaissance' },
  { id: 'ALT-007', timestamp: ts(60), severity: 'low', type: 'Unusual Login Time', source: '10.0.2.15', destination: 'DC01', description: 'User admin_jsmith logged in at 03:42 AM, outside normal working hours.', status: 'dismissed', attackStage: 'Initial Access' },
  { id: 'ALT-008', timestamp: ts(90), severity: 'high', type: 'Malware Download', source: '10.0.4.33', destination: '91.215.85.12', description: 'PE executable downloaded from suspicious domain. File hash matches known Emotet variant.', status: 'investigating', attackStage: 'Delivery' },
  { id: 'ALT-009', timestamp: ts(120), severity: 'medium', type: 'Privilege Escalation', source: '10.0.2.88', destination: '-', description: 'Local privilege escalation via PrintNightmare (CVE-2021-34527) exploit detected.', status: 'open', attackStage: 'Privilege Escalation' },
  { id: 'ALT-010', timestamp: ts(180), severity: 'low', type: 'Policy Violation — TOR Usage', source: '10.0.3.55', destination: 'TOR Network', description: 'TOR browser connection detected from marketing workstation.', status: 'open', attackStage: 'Command & Control' },
]

export const networkFlows: NetworkFlow[] = [
  { id: 'NF-001', sourceIp: '10.0.1.45', destIp: '185.220.101.34', protocol: 'TCP', port: 443, bytes: 524288, packets: 1200, risk: 'critical', application: 'Cobalt Strike' },
  { id: 'NF-002', sourceIp: '10.0.3.22', destIp: '104.21.56.78', protocol: 'UDP', port: 53, bytes: 2469396480, packets: 890000, risk: 'high', application: 'DNS Tunnel' },
  { id: 'NF-003', sourceIp: '10.0.2.10', destIp: '10.0.1.5', protocol: 'TCP', port: 445, bytes: 1048576, packets: 3400, risk: 'medium', application: 'SMB' },
  { id: 'NF-004', sourceIp: '10.0.1.100', destIp: '10.0.2.0/24', protocol: 'TCP', port: 0, bytes: 65535, packets: 65535, risk: 'medium', application: 'Port Scanner' },
  { id: 'NF-005', sourceIp: '203.0.113.50', destIp: '10.0.1.5', protocol: 'TCP', port: 22, bytes: 204800, packets: 9000, risk: 'high', application: 'SSH Brute Force' },
  { id: 'NF-006', sourceIp: '10.0.4.33', destIp: '91.215.85.12', protocol: 'TCP', port: 80, bytes: 3145728, packets: 2100, risk: 'high', application: 'HTTP Malware' },
  { id: 'NF-007', sourceIp: '10.0.2.15', destIp: '10.0.1.1', protocol: 'TCP', port: 3389, bytes: 8388608, packets: 15000, risk: 'low', application: 'RDP' },
  { id: 'NF-008', sourceIp: '10.0.3.55', destIp: '198.51.100.1', protocol: 'TCP', port: 9001, bytes: 1572864, packets: 4500, risk: 'medium', application: 'TOR' },
]

export const assets: Asset[] = [
  { id: 'A-001', hostname: 'WS-FINANCE-045', ip: '10.0.1.45', os: 'Windows 11 Pro', risk: 98, alerts: 3, status: 'compromised', lastSeen: ts(1) },
  { id: 'A-002', hostname: 'DC01', ip: '10.0.2.10', os: 'Windows Server 2022', risk: 85, alerts: 2, status: 'online', lastSeen: ts(0) },
  { id: 'A-003', hostname: 'WEB-DMZ-01', ip: '10.0.1.5', os: 'Ubuntu 22.04', risk: 72, alerts: 1, status: 'online', lastSeen: ts(0) },
  { id: 'A-004', hostname: 'WS-MKTG-022', ip: '10.0.3.22', os: 'Windows 10 Pro', risk: 78, alerts: 1, status: 'compromised', lastSeen: ts(5) },
  { id: 'A-005', hostname: 'WS-DEV-088', ip: '10.0.2.88', os: 'Windows 11 Pro', risk: 65, alerts: 2, status: 'online', lastSeen: ts(3) },
  { id: 'A-006', hostname: 'WS-IT-100', ip: '10.0.1.100', os: 'Kali Linux', risk: 55, alerts: 1, status: 'online', lastSeen: ts(10) },
  { id: 'A-007', hostname: 'WS-HR-033', ip: '10.0.4.33', os: 'Windows 10 Pro', risk: 70, alerts: 1, status: 'offline', lastSeen: ts(45) },
  { id: 'A-008', hostname: 'WS-MKTG-055', ip: '10.0.3.55', os: 'macOS Sonoma', risk: 30, alerts: 1, status: 'online', lastSeen: ts(2) },
]

export const trafficTimeline = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  inbound: Math.floor(Math.random() * 500 + 200),
  outbound: Math.floor(Math.random() * 300 + 100),
  threats: i >= 2 && i <= 5 ? Math.floor(Math.random() * 20 + 10) : Math.floor(Math.random() * 5),
}))

export const attackStages = [
  { stage: 'Reconnaissance', count: 1, color: '#64748b' },
  { stage: 'Initial Access', count: 2, color: '#ffaa00' },
  { stage: 'Execution', count: 1, color: '#f97316' },
  { stage: 'Privilege Escalation', count: 1, color: '#ef4444' },
  { stage: 'Lateral Movement', count: 1, color: '#ff3366' },
  { stage: 'Command & Control', count: 2, color: '#a855f7' },
  { stage: 'Exfiltration', count: 1, color: '#dc2626' },
  { stage: 'Delivery', count: 1, color: '#e11d48' },
]
