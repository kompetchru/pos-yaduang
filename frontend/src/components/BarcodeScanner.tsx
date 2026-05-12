'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('กำลังเปิดกล้อง...')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    const scannerId = 'barcode-scanner-container'
    let mounted = true

    const startScanner = async () => {
      try {
        // ตรวจสอบว่ามีกล้องไหม
        const devices = await Html5Qrcode.getCameras()
        if (!devices || devices.length === 0) {
          setError('ไม่พบกล้องในเครื่องนี้')
          return
        }

        if (!mounted) return

        const scanner = new Html5Qrcode(scannerId, {
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
        scannerRef.current = scanner

        // ใช้ facingMode environment (กล้องหลัง) สำหรับมือถือ
        // ถ้าเป็นคอม จะใช้กล้องตัวแรก
        const cameraConfig = devices.length > 0 && devices[devices.length - 1].id
          ? { deviceId: devices[devices.length - 1].id }
          : { facingMode: 'environment' }

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 300, height: 150 },
            aspectRatio: 1.7,
          },
          (decodedText) => {
            if (scannedRef.current) return
            scannedRef.current = true
            setStatus(`✓ อ่านได้: ${decodedText}`)
            onScan(decodedText)
            scanner.stop().catch(() => {})
          },
          () => {}
        )
        setStatus('เล็งกล้องไปที่บาร์โค้ด')
      } catch (err: any) {
        console.error('Scanner error:', err)
        setError('ไม่สามารถเปิดกล้องได้: ' + (err.message || 'unknown'))
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">📷 สแกนบาร์โค้ดด้วยกล้อง</h3>
          <p className="text-sm text-gray-500">{status}</p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black mb-3" style={{ minHeight: 300 }}>
          <div id="barcode-scanner-container" style={{ width: '100%' }} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-3">{error}</div>
        )}

        <Button variant="secondary" className="w-full" onClick={onClose}>
          ปิดกล้อง
        </Button>
      </div>
    </div>
  )
}
