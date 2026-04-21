// สร้าง PWA icons แบบง่าย — ใช้ Canvas API
// รัน: node scripts/generate-icons.js

const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// สร้าง SVG icon แล้ว convert เป็น data ที่ใช้ได้
function createSvgIcon(size, maskable = false) {
  const padding = maskable ? size * 0.1 : 0
  const inner = size - padding * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.2}" fill="#F97316"/>
  <text x="${size/2}" y="${size * 0.45}" text-anchor="middle" font-size="${inner * 0.35}" fill="white">🏪</text>
  <text x="${size/2}" y="${size * 0.75}" text-anchor="middle" font-size="${inner * 0.12}" font-family="sans-serif" font-weight="bold" fill="white">ยายด้วง</text>
</svg>`
}

// เขียน SVG เป็น placeholder (browser จะ render ได้)
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable.png', size: 512, maskable: true },
]

for (const s of sizes) {
  const svg = createSvgIcon(s.size, s.maskable)
  // เขียนเป็น SVG ก่อน (browser รองรับ SVG icon)
  const svgName = s.name.replace('.png', '.svg')
  fs.writeFileSync(path.join(dir, svgName), svg)
  console.log(`Created ${svgName}`)
}

console.log('Done! Note: For production, convert SVG to PNG using sharp or online tool')
