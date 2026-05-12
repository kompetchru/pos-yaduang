'use client'
import { useState, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [status, setStatus] = useState('ถ่ายรูปบาร์โค้ดหรือเลือกจากไฟล์')
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File) => {
    setProcessing(true)
    setStatus('กำลังอ่านบาร์โค้ด...')

    try {
      const scanner = new Html5Qrcode('barcode-reader-hidden', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      })

      const result = await scanner.scanFile(file, true)
      setStatus(`✅ อ่านได้: ${result}`)
      if ('vibrate' in navigator) navigator.vibrate(100)
      onScan(result)
    } catch (err) {
      setStatus('❌ อ่านบาร์โค้ดไม่ได้ ลองถ่ายใหม่ให้ชัดขึ้น')
      setProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">📷 สแกนบาร์โค้ด</h3>
          <p className="text-sm text-gray-500 mt-1">{status}</p>
        </div>

        <div id="barcode-reader-hidden" className="hidden" />

        {!processing && (
          <div className="space-y-3">
            {/* ถ่ายรูปบาร์โค้ด (เปิดกล้องมือถือ) */}
            <label className="block w-full py-6 bg-orange-50 border-2 border-orange-300 rounded-xl text-center cursor-pointer hover:bg-orange-100 transition-colors">
              <span className="text-3xl block mb-1">📸</span>
              <span className="text-sm font-medium text-orange-700">ถ่ายรูปบาร์โค้ด</span>
              <span className="text-xs text-gray-500 block mt-1">เปิดกล้อง → ถ่ายรูปบาร์โค้ด</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>

            {/* เลือกรูปจากแกลเลอรี่ */}
            <label className="block w-full py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-xl inline-block mr-2">🖼️</span>
              <span className="text-sm text-gray-600">เลือกรูปจากแกลเลอรี่</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-gray-500">กำลังอ่านบาร์โค้ดจากรูป...</p>
          </div>
        )}

        <Button variant="secondary" className="w-full mt-4" onClick={onClose}>
          ปิด
        </Button>
      </div>
    </div>
  )
}
