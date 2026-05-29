'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Lock, Search, Download, Star, RefreshCcw } from 'lucide-react'

const AdminPage = () => {
  const [pwd, setPwd] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [apps, setApps] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('bga_admin_pwd')
    if (saved) {
      setPwd(saved)
      verify(saved)
    }
  }, [])

  const verify = async (passwordIn) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'X-Admin-Password': passwordIn } })
      if (!res.ok) throw new Error('Wrong password')
      const j = await res.json()
      setStats(j)
      setAuthed(true)
      sessionStorage.setItem('bga_admin_pwd', passwordIn)
      loadApps(passwordIn, '')
    } catch (e) {
      toast.error(e.message || 'Auth failed')
      sessionStorage.removeItem('bga_admin_pwd')
      setAuthed(false)
    } finally {
      setLoading(false)
    }
  }

  const loadApps = async (passwordIn, query) => {
    try {
      const res = await fetch(`/api/admin/applications?q=${encodeURIComponent(query || '')}`, { headers: { 'X-Admin-Password': passwordIn } })
      const j = await res.json()
      setApps(j.applications || [])
    } catch {
      toast.error('Failed to load applications')
    }
  }

  const toggleShortlist = async (referralCode, shortlisted) => {
    try {
      await fetch('/api/admin/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': pwd },
        body: JSON.stringify({ referralCode, shortlisted: !shortlisted }),
      })
      setApps(apps.map(a => a.referralCode === referralCode ? { ...a, shortlisted: !shortlisted } : a))
    } catch { toast.error('Failed') }
  }

  const exportCsv = async () => {
    try {
      const res = await fetch('/api/admin/export', { headers: { 'X-Admin-Password': pwd } })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Export failed') }
  }

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <Card className="bg-white/[0.04] border-white/10 w-full max-w-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-cyan-300" />
              <h1 className="font-black text-xl">Admin Access</h1>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); verify(pwd) }} className="space-y-3">
              <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Admin password" className="bg-white/5 border-white/10" />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black font-extrabold">
                {loading ? 'Verifying...' : 'Enter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs tracking-widest text-cyan-300">ADMIN DASHBOARD</div>
            <h1 className="text-3xl font-black gradient-text-blue-gold">Beast Games Africa</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/20 bg-white/5" onClick={() => { loadApps(pwd, q); verify(pwd) }}><RefreshCcw className="w-4 h-4" /></Button>
            <Button onClick={exportCsv} className="bg-gradient-to-r from-amber-300 to-amber-500 text-black font-bold"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Stat label="Total Applicants" value={stats.total} />
            <Stat label="Priority Unlocked" value={stats.priority} accent="text-amber-300" />
            <Stat label="Shortlisted" value={stats.shortlisted} accent="text-cyan-300" />
            <Stat label="Countries" value={stats.byCountry?.length || 0} />
          </div>
        )}

        {stats?.topReferrers && stats.topReferrers.length > 0 && (
          <Card className="bg-white/[0.03] border-white/10 mb-6">
            <CardContent className="p-5">
              <div className="font-bold mb-3">Top Referrers</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {stats.topReferrers.slice(0, 8).map((r, i) => (
                  <div key={r.referralCode} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/5">
                    <div>
                      <div className="font-bold text-sm">#{i + 1} {r.fullName}</div>
                      <div className="text-xs text-white/50">{r.country} • {r.referralCode}</div>
                    </div>
                    <div className="font-black gradient-text-gold">{r.referralCount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/[0.03] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-white/60" />
              <Input value={q} onChange={e => { setQ(e.target.value); loadApps(pwd, e.target.value) }} placeholder="Search name, email, country, referral code..." className="bg-white/5 border-white/10" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Country</th>
                    <th className="py-2 pr-3">Age</th>
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Refs</th>
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2 pr-3">Shortlist</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a.referralCode} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2 pr-3 font-medium">{a.fullName}</td>
                      <td className="py-2 pr-3 text-white/70">{a.email}</td>
                      <td className="py-2 pr-3 text-white/70">{a.country}</td>
                      <td className="py-2 pr-3 text-white/70">{a.age}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-cyan-300">{a.referralCode}</td>
                      <td className="py-2 pr-3 font-bold">{a.referralCount}</td>
                      <td className="py-2 pr-3">{a.priorityUnlocked ? <Badge className="bg-amber-400/20 text-amber-200 border-amber-300/40">YES</Badge> : <span className="text-white/40">–</span>}</td>
                      <td className="py-2 pr-3">
                        <button onClick={() => toggleShortlist(a.referralCode, a.shortlisted)} className={`p-1.5 rounded-md ${a.shortlisted ? 'bg-amber-400/30 text-amber-200' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                          <Star className="w-4 h-4" fill={a.shortlisted ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {apps.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-white/50">No applications yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <Card className="bg-white/[0.04] border-white/10">
      <CardContent className="p-5">
        <div className={`text-3xl font-black ${accent || 'gradient-text-blue-gold'}`}>{value}</div>
        <div className="text-xs text-white/60 mt-1">{label}</div>
      </CardContent>
    </Card>
  )
}

export default AdminPage
