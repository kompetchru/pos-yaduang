'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scannerId = 'barcode-scanner-container'

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            // สแกนสำเร็จ
            onScan(decodedText)
            scanner.stop().catch(() => {})
          },
          () => {} // ignore errors during scanning
        )
      } catch (err: any) {
        setError('ไม่สามารถเปิดกล้องได้: ' + (err.message || err))
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">📷 สแกนบาร์โค้ดด้วยกล้อง</h3>
          <p className="text-sm text-gray-500">เล็งกล้องไปที่บาร์โค้ดสินค้า</p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black mb-3">
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
