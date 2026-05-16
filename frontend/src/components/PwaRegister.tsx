'use client'
import { useEffect } from 'react'
import { APP_VERSION } from '@/lib/version'

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // เพิ่ม version query string เพื่อบังคับให้ browser โหลด sw.js ใหม่ทุก deploy
    navigator.serviceWorker.register(`/sw.js?v=${APP_VERSION}`, { updateViaCache: 'none' }).then((reg) => {
      // ตรวจ update ทุกครั้งที่โหลดหน้า
      reg.update().catch(() => {})

      // เมื่อ SW ใหม่ติดตั้ง → reload เพื่อให้ได้ UI ล่าสุด
      reg.addEventListener('updatefound', () => {
        const newSw = reg.installing
        if (!newSw) return
        newSw.addEventListener('statechange', () => {
          if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
            // มี SW เก่าทำงานอยู่ และ SW ใหม่พร้อมแล้ว → reload
            window.location.reload()
          }
        })
      })
    }).catch(() => {})

    // ถ้า SW เปลี่ยน controller (skipWaiting + claim) → reload หนึ่งครั้ง
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    })
  }, [])
  return null
}
