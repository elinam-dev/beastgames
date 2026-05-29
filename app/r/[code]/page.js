'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const Referral = () => {
  const { code } = useParams()
  const router = useRouter()
  useEffect(() => {
    const c = String(code || '').toUpperCase()
    if (c) {
      try { localStorage.setItem('bga_ref', c) } catch {}
      // fire-and-forget tracking
      fetch('/api/referral-hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c, ua: navigator.userAgent }),
      }).catch(() => {})
      router.replace(`/?ref=${c}`)
    }
  }, [code, router])
  return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <div className="text-sm text-white/60">Loading your invite...</div>
      </div>
    </div>
  )
}

export default Referral
