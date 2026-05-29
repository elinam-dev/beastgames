'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Trophy, Users, Zap, Star, ChevronRight, Copy, Check, Share2, Crown, Sparkles, Flame,
  Globe2, Lock, Unlock, Send, MessageCircle, Facebook, Twitter, Play, ArrowRight, Award, MapPin
} from 'lucide-react'

const IMG = {
  hero: 'https://images.unsplash.com/photo-1556764420-e37ef4cdfa5c?crop=entropy&cs=srgb&fm=jpg&w=2000&q=85',
  contestants: 'https://images.unsplash.com/photo-1579975096649-e773152b04cb?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
  prize: 'https://images.unsplash.com/photo-1631603538922-be02ff38dfe1?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
  crowd: 'https://images.unsplash.com/photo-1665413811870-5b29a250f64a?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
  social: 'https://images.unsplash.com/photo-1699730164892-d7c433524ff3?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
}

const COUNTRIES = ['Nigeria','Ghana','Kenya','South Africa','Egypt','Ethiopia','Tanzania','Uganda','Rwanda','Senegal','Côte d’Ivoire','Cameroon','Morocco','Algeria','Tunisia','Zambia','Zimbabwe','Botswana','Namibia','Mozambique','Angola','DR Congo','Democratic Republic of Congo','Mali','Burkina Faso','Niger','Sierra Leone','Liberia','Gambia','Madagascar','Mauritius','Other']

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, target - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, done: diff === 0 }
}

function fireConfetti() {
  const colors = ['#22D3EE', '#3B82F6', '#FFD24A', '#FFAE00', '#ffffff']
  const root = document.createElement('div')
  root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;'
  document.body.appendChild(root)
  for (let i = 0; i < 140; i++) {
    const el = document.createElement('div')
    const size = 6 + Math.random() * 8
    el.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-10px;width:${size}px;height:${size * 0.4}px;background:${colors[i % colors.length]};opacity:${0.7 + Math.random() * 0.3};transform:rotate(${Math.random() * 360}deg);border-radius:2px;`
    const dur = 2500 + Math.random() * 2500
    el.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${(Math.random() - 0.5) * 400}px, ${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' })
    root.appendChild(el)
  }
  setTimeout(() => root.remove(), 6000)
}

const App = () => {
  // launch date: 45 days from now (stable per mount)
  const target = useMemo(() => Date.now() + 45 * 24 * 3600 * 1000, [])
  const { d, h, m, s } = useCountdown(target)

  const [openFlow, setOpenFlow] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState(null)
  const [referredBy, setReferredBy] = useState(null)

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', country: '', age: '',
    instagram: '', tiktok: '', twitter: '',
    q_why: '', q_prize: '', q_standout: '', q_travel: 'Yes',
  })

  const [stats, setStats] = useState({ displayCount: 12847 })
  const [leaderboard, setLeaderboard] = useState([])
  const [copied, setCopied] = useState(false)
  const [shareState, setShareState] = useState({ friends: 0, groups: 0 })

  // load referredBy from URL (?ref=CODE) and localStorage saved application
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      const r = p.get('ref') || localStorage.getItem('bga_ref')
      if (r) {
        const code = r.toUpperCase()
        setReferredBy(code)
        localStorage.setItem('bga_ref', code)
      }
      const saved = localStorage.getItem('bga_application')
      if (saved) {
        const parsed = JSON.parse(saved)
        setApplication(parsed)
        setShareState({ friends: parsed.sharesCompleted || 0, groups: parsed.groupsShared || 0 })
      }
    } catch {}
  }, [])

  // poll stats + leaderboard every 3 minutes (180 seconds)
  useEffect(() => {
    let on = true
    const load = async () => {
      try {
        const [a, b] = await Promise.all([
          fetch('/api/stats').then(r => r.json()),
          fetch('/api/leaderboard?limit=10').then(r => r.json()),
        ])
        if (!on) return
        if (a?.displayCount) setStats(a)
        if (b?.leaderboard) setLeaderboard(b.leaderboard)
      } catch {}
    }
    load()
    const t = setInterval(load, 180000) // Update every 3 minutes
    return () => { on = false; clearInterval(t) }
  }, [])

  // refresh my application periodically (for live referral count)
  useEffect(() => {
    if (!application?.referralCode) return
    let on = true
    const refresh = async () => {
      try {
        const res = await fetch(`/api/applications/${application.referralCode}`)
        const j = await res.json()
        if (!on || !j?.application) return
        setApplication(j.application)
        localStorage.setItem('bga_application', JSON.stringify(j.application))
      } catch {}
    }
    const t = setInterval(refresh, 6000)
    return () => { on = false; clearInterval(t) }
  }, [application?.referralCode])

  const referralUrl = application?.referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${application.referralCode}`
    : ''

  const openJoin = () => {
    if (application) {
      setStep(3)
      setOpenFlow(true)
    } else {
      setStep(1)
      setOpenFlow(true)
    }
  }

  const submitStep1 = (e) => {
    e.preventDefault()
    const need = ['fullName','email','phone','country','age']
    for (const k of need) {
      if (!form[k] || String(form[k]).trim() === '') {
        toast.error(`Please fill in ${k.replace('full','full ')}`)
        return
      }
    }
    if (Number(form.age) < 18) {
      toast.error('You must be 18+ to apply.')
      return
    }
    setStep(2)
  }

  const submitStep2 = async (e) => {
    e.preventDefault()
    if (!form.q_why || !form.q_prize || !form.q_standout) {
      toast.error('Please answer all questions.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, referredBy }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')
      setApplication(j.application)
      localStorage.setItem('bga_application', JSON.stringify(j.application))
      setShareState({ friends: j.application.sharesCompleted || 0, groups: j.application.groupsShared || 0 })
      setStep(3)
      fireConfetti()
      toast.success(j.alreadyExists ? 'Welcome back — we found your application.' : 'You’re in! Welcome to the waitlist.')
    } catch (err) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success('Referral link copied')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Copy failed')
    }
  }

  const trackShare = async (channel, kind) => {
    if (!application?.referralCode) return
    try {
      const res = await fetch(`/api/applications/${application.referralCode}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, kind }),
      })
      const j = await res.json()
      if (j?.application) {
        const wasUnlocked = application.priorityUnlocked
        setApplication(j.application)
        localStorage.setItem('bga_application', JSON.stringify(j.application))
        setShareState({ friends: j.application.sharesCompleted || 0, groups: j.application.groupsShared || 0 })
        if (!wasUnlocked && j.application.priorityUnlocked) {
          fireConfetti()
          toast.success('Priority Waitlist Unlocked! 🌟')
        }
      }
    } catch {}
  }

  const shareText = `I just joined the MR BEAST GAMES AFRICA WAITLIST 🚀🔥 Africa’s biggest game show is coming. Use my link to lock in your spot:`
  const shareLinks = (kind) => ({
    whatsapp: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`, '_blank'); trackShare('whatsapp', kind) },
    telegram: () => { window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'); trackShare('telegram', kind) },
    facebook: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank'); trackShare('facebook', kind) },
    twitter: () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`, '_blank'); trackShare('twitter', kind) },
  })

  const requiredFriends = 2
  const requiredGroups = 5
  const friendsDone = Math.min(shareState.friends, requiredFriends)
  const groupsDone = Math.min(shareState.groups, requiredGroups)
  const unlocked = friendsDone >= requiredFriends && groupsDone >= requiredGroups
  const totalPct = Math.round(((friendsDone + groupsDone) / (requiredFriends + requiredGroups)) * 100)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-black/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-blue-gold glow-blue grid place-items-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <div className="font-black tracking-tight text-sm sm:text-base">
              <span className="gradient-text-blue-gold">BEAST GAMES</span>{' '}
              <span className="text-white/80">AFRICA</span>
            </div>
          </div>
          <Button onClick={openJoin} className="bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black hover:opacity-90 font-extrabold rounded-full px-4 sm:px-6 h-9 sm:h-10">
            {application ? 'My Waitlist' : 'Join Waitlist'} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Stadium lights" className="w-full h-full object-cover opacity-50" loading="eager" />
          <div className="absolute inset-0 cinematic-overlay" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-rise">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-white/80">Official Waitlist • Africa Edition</span>
            </div>

            <h1 className="font-black leading-[0.95] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="gradient-text-gold text-glow-gold">MR BEAST</span>
              <br />
              <span className="text-white">GAMES </span>
              <span className="gradient-text-blue-gold text-glow-blue">AFRICA</span>
              <br />
              <span className="text-white/90 text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider">— WAITLIST —</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-white/75 max-w-2xl">
              Register now for a chance to be considered. Africa’s biggest game show experience is coming — and only those on the list get the call.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button onClick={openJoin} size="lg" className="h-14 px-8 text-base sm:text-lg font-extrabold rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black hover:opacity-90 animate-pulse-glow">
                <Flame className="w-5 h-5 mr-2" /> Join The Waitlist
              </Button>
              <a href="#how" className="h-14 px-8 grid place-items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition text-white font-semibold backdrop-blur-md">
                <Play className="w-4 h-4 mr-2" /> How it Works
              </a>
            </div>

            {/* Live counter */}
            <div className="mt-10 flex items-center gap-3 text-white/80">
              <span className="relative flex w-3 h-3">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
                <span className="relative inline-flex rounded-full w-3 h-3 bg-cyan-300" />
              </span>
              <span className="text-sm sm:text-base">
                <span className="font-black text-white">{stats.displayCount.toLocaleString()}</span> people already registered
              </span>
            </div>

            {/* Countdown */}
            <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-xl">
              {[{l:'DAYS',v:d},{l:'HOURS',v:h},{l:'MINUTES',v:m},{l:'SECONDS',v:s}].map((x,i)=>(
                <div key={i} className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-3 sm:p-5 text-center">
                  <div className="text-2xl sm:text-4xl md:text-5xl font-black gradient-text-blue-gold tabular-nums">{String(x.v).padStart(2,'0')}</div>
                  <div className="text-[10px] sm:text-xs tracking-widest text-white/60 mt-1">{x.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-white/50">Applications close when the timer hits zero.</div>
          </div>
        </div>

        {/* Marquee social proof */}
        <div className="relative border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden">
          <div className="flex animate-marquee py-3 whitespace-nowrap">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-10 px-6 text-sm text-white/60">
                {['🔥 New sign-ups every minute','🏆 $1,000,000+ in prizes','🌍 30+ African countries','⚡ Limited spots available','⭐ Verified waitlist','🚀 Viral referral rewards','🎥 Cinematic experience','👑 Priority access via referrals'].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-300" />{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <img src={IMG.contestants} alt="Contestants" className="w-full h-full object-cover opacity-25" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="bg-amber-400/15 text-amber-300 border border-amber-300/30 mb-3">HOW IT WORKS</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Four steps to your <span className="gradient-text-gold">shot at glory</span></h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">A simple flow. A huge opportunity. Complete each step to maximize your chances of being selected.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { i: 1, t: 'Register', d: 'Drop your name, email, and socials — takes under 60 seconds.', icon: Users },
              { i: 2, t: 'Apply', d: 'Answer 4 short questions so casting can get to know you.', icon: Zap },
              { i: 3, t: 'Get your link', d: 'Receive a unique referral link instantly. This is your superpower.', icon: Sparkles },
              { i: 4, t: 'Unlock Priority', d: 'Share the mission. Climb the leaderboard. Get seen first.', icon: Crown },
            ].map(({ i, t, d, icon: Icon }) => (
              <Card key={i} className="bg-white/[0.03] border-white/10 backdrop-blur-md hover:border-cyan-400/40 transition group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl gradient-blue-gold grid place-items-center text-black font-black">{i}</div>
                    <Icon className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-lg font-bold">{t}</div>
                  <p className="text-sm text-white/60 mt-2">{d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE / REWARDS */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={IMG.prize} alt="Gold prize" className="w-full h-full object-cover opacity-40" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-cyan-400/15 text-cyan-200 border border-cyan-300/30 mb-3">REFERRAL REWARDS</Badge>
            <h2 className="text-4xl sm:text-5xl font-black">The more you share, the <span className="gradient-text-blue-gold">higher you rise</span>.</h2>
            <p className="mt-4 text-white/70">Casting reviews the priority list first. Every successful referral pushes you closer to the top.</p>
            <div className="mt-8 space-y-3">
              {[
                { t: '2 friends signed up', d: 'Verified Applicant badge', icon: Check },
                { t: 'Shared to 5 groups', d: 'Priority Waitlist Unlocked', icon: Unlock },
                { t: '10+ referrals', d: 'Featured on public leaderboard', icon: Trophy },
                { t: '25+ referrals', d: 'Top-tier review by casting team', icon: Crown },
              ].map((x, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 grid place-items-center text-black">
                    <x.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{x.t}</div>
                    <div className="text-sm text-white/60">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button onClick={openJoin} size="lg" className="h-12 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black font-extrabold hover:opacity-90">
                Get my referral link <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="relative rounded-3xl overflow-hidden border border-amber-300/20 glow-gold">
              <img src={IMG.prize} alt="Prize money" className="w-full h-[460px] object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xs uppercase tracking-widest text-amber-300">Total Prize Pool</div>
                <div className="text-4xl sm:text-5xl font-black gradient-text-gold text-glow-gold">$1,000,000+</div>
                <div className="text-white/70 text-sm mt-1">Cash, life-changing rewards, and global exposure.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <img src={IMG.crowd} alt="Crowd" className="w-full h-full object-cover opacity-20" loading="lazy" />
          <div className="absolute inset-0 bg-black/85" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="bg-amber-400/15 text-amber-300 border border-amber-300/30 mb-3">LEADERBOARD</Badge>
            <h2 className="text-4xl sm:text-5xl font-black">Top <span className="gradient-text-gold">referrers</span> right now</h2>
            <p className="mt-3 text-white/60">Updated live. Climb the ranks to maximize your visibility.</p>
          </div>
          <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              {leaderboard.length === 0 && (
                <div className="p-10 text-center text-white/60">Be the first to claim the #1 spot — join now and start referring.</div>
              )}
              {leaderboard.map((row, i) => (
                <div key={row.referralCode} className={`flex items-center justify-between px-5 sm:px-6 py-4 ${i !== leaderboard.length - 1 ? 'border-b border-white/5' : ''} ${i < 3 ? 'bg-gradient-to-r from-amber-400/5 to-transparent' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center font-black ${i === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black glow-gold' : i === 1 ? 'bg-white/15 text-white' : i === 2 ? 'bg-amber-700/40 text-amber-200' : 'bg-white/5 text-white/70'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {row.fullName.split(' ')[0]} {row.fullName.split(' ')[1]?.[0]?.toUpperCase() || ''}.
                        {row.priorityUnlocked && <Badge className="bg-cyan-400/20 text-cyan-200 border-cyan-300/30 text-[10px]"><Unlock className="w-3 h-3 mr-1" />PRIORITY</Badge>}
                        {!row.isFake && <Badge className="bg-green-400/20 text-green-200 border-green-300/30 text-[10px]"><Star className="w-3 h-3 mr-1" />REAL</Badge>}
                      </div>
                      <div className="text-xs text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" />{row.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg gradient-text-blue-gold">{row.referralCount}</div>
                    <div className="text-[10px] text-white/50 tracking-widest">REFERRALS</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SOCIAL PROOF GRID */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: stats.displayCount.toLocaleString(), l: 'Registered applicants', icon: Users },
              { n: '30+', l: 'African countries represented', icon: Globe2 },
              { n: '24/7', l: 'Live registration & ranking', icon: Zap },
            ].map((x, i) => (
              <Card key={i} className="bg-white/[0.04] border-white/10 overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-blue-gold grid place-items-center text-black"><x.icon className="w-6 h-6" /></div>
                  <div>
                    <div className="text-3xl font-black gradient-text-blue-gold">{x.n}</div>
                    <div className="text-sm text-white/60">{x.l}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="bg-cyan-400/15 text-cyan-200 border border-cyan-300/30 mb-3">FAQ</Badge>
            <h2 className="text-4xl font-black">Questions, <span className="gradient-text-blue-gold">answered</span>.</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Is this the official Mr Beast Games Africa waitlist?', a: 'This is a community-built registration platform designed to organize interest for an Africa edition. Signing up adds you to the priority list maintained by the organizers.' },
              { q: 'How much does it cost to apply?', a: 'Joining the waitlist is completely free. We will never ask for payment to register or to be considered.' },
              { q: 'What are the eligibility requirements?', a: 'You must be 18+ and a resident of an African country. A valid passport may be required if selected.' },
              { q: 'How does the referral system work?', a: 'After registering, you receive a unique link. Anyone who joins through your link counts as a referral. The more referrals you bring in, the higher your priority on the waitlist.' },
              { q: 'When will I hear back?', a: 'Shortlisted applicants will be contacted via the email you used to register. Make sure to check your spam folder.' },
              { q: 'Will I have to travel?', a: 'Selected contestants may be required to travel. All travel and accommodation logistics are handled by the production team.' },
            ].map((x, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border border-white/10 rounded-xl px-4 bg-white/[0.03]">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{x.q}</AccordionTrigger>
                <AccordionContent className="text-white/70">{x.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={IMG.social} alt="Community celebrating" className="w-full h-full object-cover opacity-30" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-6xl font-black">Your moment. <span className="gradient-text-gold">Your shot.</span></h2>
          <p className="mt-4 text-white/70 text-lg">Don’t watch from the sidelines. Register, share, and rise to the top of the list.</p>
          <div className="mt-8">
            <Button onClick={openJoin} size="lg" className="h-14 px-10 text-lg font-extrabold rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black hover:opacity-90 animate-pulse-glow">
              <Flame className="w-5 h-5 mr-2" /> Join The Waitlist
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Beast Games Africa Waitlist. This is a community-built registration platform. Not affiliated with MrBeast LLC.
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
        <Button onClick={openJoin} className="w-full h-14 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black font-extrabold animate-pulse-glow shadow-2xl">
          <Flame className="w-5 h-5 mr-2" /> {application ? 'Open Mission' : 'Join The Waitlist'}
        </Button>
      </div>

      {/* FLOW DIALOG */}
      <Dialog open={openFlow} onOpenChange={setOpenFlow}>
        <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          <DialogTitle className="sr-only">Join the Mr Beast Games Africa Waitlist</DialogTitle>
          <div className="relative">
            <div className="h-2 w-full bg-white/5">
              <div className="h-full gradient-blue-gold transition-all" style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }} />
            </div>
            <div className="p-6 sm:p-8">
              {step === 1 && (
                <form onSubmit={submitStep1} className="space-y-4 animate-rise">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-widest text-cyan-300">STEP 1 OF 3</div>
                      <h3 className="text-2xl sm:text-3xl font-black mt-1">Tell us about you</h3>
                    </div>
                    <Badge className="bg-amber-400/15 text-amber-300 border border-amber-300/30">~60 sec</Badge>
                  </div>
                  {referredBy && (
                    <div className="text-xs px-3 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-200">
                      You were referred by code <b>{referredBy}</b>. They’ll get credit when you submit.
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Full Name *"><Input value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} placeholder="Ada Okonkwo" className="bg-white/5 border-white/10" /></Field>
                    <Field label="Email *"><Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} placeholder="you@email.com" className="bg-white/5 border-white/10" /></Field>
                    <Field label="Phone *"><Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="+234 ..." className="bg-white/5 border-white/10" /></Field>
                    <Field label="Age *"><Input type="number" min="18" value={form.age} onChange={(e)=>setForm({...form, age:e.target.value})} placeholder="18+" className="bg-white/5 border-white/10" /></Field>
                    <Field label="Country *" className="sm:col-span-2">
                      <select value={form.country} onChange={(e)=>setForm({...form, country:e.target.value})} className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm">
                        <option value="" className="bg-zinc-900">Select country</option>
                        {COUNTRIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Instagram"><Input value={form.instagram} onChange={(e)=>setForm({...form, instagram:e.target.value})} placeholder="@handle" className="bg-white/5 border-white/10" /></Field>
                    <Field label="TikTok"><Input value={form.tiktok} onChange={(e)=>setForm({...form, tiktok:e.target.value})} placeholder="@handle" className="bg-white/5 border-white/10" /></Field>
                    <Field label="X / Twitter" className="sm:col-span-2"><Input value={form.twitter} onChange={(e)=>setForm({...form, twitter:e.target.value})} placeholder="@handle" className="bg-white/5 border-white/10" /></Field>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black font-extrabold hover:opacity-90">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={submitStep2} className="space-y-4 animate-rise">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-widest text-cyan-300">STEP 2 OF 3</div>
                      <h3 className="text-2xl sm:text-3xl font-black mt-1">Tell your story</h3>
                    </div>
                    <Badge className="bg-amber-400/15 text-amber-300 border border-amber-300/30">4 quick Qs</Badge>
                  </div>
                  <Field label="Why should you be selected? *"><Textarea rows={3} value={form.q_why} onChange={(e)=>setForm({...form, q_why:e.target.value})} placeholder="Make it count..." className="bg-white/5 border-white/10" /></Field>
                  <Field label="What would you do with the prize money? *"><Textarea rows={3} value={form.q_prize} onChange={(e)=>setForm({...form, q_prize:e.target.value})} placeholder="Family, dreams, business..." className="bg-white/5 border-white/10" /></Field>
                  <Field label="What makes you stand out? *"><Textarea rows={3} value={form.q_standout} onChange={(e)=>setForm({...form, q_standout:e.target.value})} placeholder="Skills, story, energy..." className="bg-white/5 border-white/10" /></Field>
                  <Field label="Would you travel if selected? *">
                    <select value={form.q_travel} onChange={(e)=>setForm({...form, q_travel:e.target.value})} className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm">
                      <option className="bg-zinc-900">Yes</option>
                      <option className="bg-zinc-900">No</option>
                      <option className="bg-zinc-900">Maybe</option>
                    </select>
                  </Field>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={()=>setStep(1)} className="flex-1 h-12 rounded-full border-white/20 bg-white/5 hover:bg-white/10">Back</Button>
                    <Button type="submit" disabled={submitting} className="flex-[2] h-12 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 text-black font-extrabold hover:opacity-90">
                      {submitting ? 'Submitting...' : 'Submit Application'} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && application && (
                <div className="space-y-5 animate-rise">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full grid place-items-center gradient-blue-gold glow-blue mb-3">
                      <Check className="w-8 h-8 text-black" />
                    </div>
                    <div className="text-xs tracking-widest text-cyan-300">YOU’RE IN</div>
                    <h3 className="text-2xl sm:text-3xl font-black mt-1">Welcome to the waitlist, {application.fullName.split(' ')[0]}!</h3>
                    <p className="text-white/60 text-sm mt-2">Complete the sharing mission to unlock priority visibility on the waitlist.</p>
                  </div>

                  {application.priorityUnlocked && (
                    <div className="text-center p-4 rounded-2xl border border-amber-300/40 bg-amber-400/10">
                      <Crown className="w-7 h-7 text-amber-300 mx-auto" />
                      <div className="font-black text-amber-200 mt-1">PRIORITY WAITLIST UNLOCKED</div>
                      <div className="text-xs text-amber-200/70">You’re now in the top reviewed group.</div>
                    </div>
                  )}

                  {/* Referral link box */}
                  <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.04]">
                    <div className="text-xs tracking-widest text-white/60 mb-2">YOUR REFERRAL LINK</div>
                    <div className="flex gap-2">
                      <Input readOnly value={referralUrl} className="bg-black/40 border-white/10 text-sm" />
                      <Button onClick={copyLink} className="bg-white text-black hover:bg-white/90 font-bold">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="text-xs text-white/50 mt-2">Referrals tracked live: <b className="text-cyan-300">{application.referralCount || 0}</b></div>
                  </div>

                  {/* Mission */}
                  <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-amber-400/10">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" />Sharing Mission</div>
                      <div className="text-xs text-white/60">{totalPct}% complete</div>
                    </div>
                    <Progress value={totalPct} className="h-2 mt-3 bg-white/10" />

                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <MissionRow done={friendsDone >= requiredFriends} count={friendsDone} total={requiredFriends} label="Share with friends" sub="Send your link to at least 2 friends" />
                      <MissionRow done={groupsDone >= requiredGroups} count={groupsDone} total={requiredGroups} label="Share to groups" sub="Post in at least 5 groups/communities" />
                    </div>

                    <div className="mt-5">
                      <div className="text-xs tracking-widest text-white/60 mb-2">SHARE WITH A FRIEND</div>
                      <div className="grid grid-cols-4 gap-2">
                        <ShareBtn onClick={shareLinks('friend').whatsapp} label="WhatsApp" icon={MessageCircle} color="bg-green-500/15 text-green-300 border-green-400/30" />
                        <ShareBtn onClick={shareLinks('friend').telegram} label="Telegram" icon={Send} color="bg-cyan-500/15 text-cyan-300 border-cyan-400/30" />
                        <ShareBtn onClick={shareLinks('friend').facebook} label="Facebook" icon={Facebook} color="bg-blue-500/15 text-blue-300 border-blue-400/30" />
                        <ShareBtn onClick={shareLinks('friend').twitter} label="X" icon={Twitter} color="bg-white/10 text-white border-white/20" />
                      </div>
                      <div className="text-xs tracking-widest text-white/60 mt-4 mb-2">SHARE TO A GROUP</div>
                      <div className="grid grid-cols-4 gap-2">
                        <ShareBtn onClick={shareLinks('group').whatsapp} label="WA Group" icon={MessageCircle} color="bg-green-500/15 text-green-300 border-green-400/30" />
                        <ShareBtn onClick={shareLinks('group').telegram} label="TG Group" icon={Send} color="bg-cyan-500/15 text-cyan-300 border-cyan-400/30" />
                        <ShareBtn onClick={shareLinks('group').facebook} label="FB Group" icon={Facebook} color="bg-blue-500/15 text-blue-300 border-blue-400/30" />
                        <ShareBtn onClick={shareLinks('group').twitter} label="X Comm." icon={Twitter} color="bg-white/10 text-white border-white/20" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-white/40">
                    Your priority on the waitlist is calculated from referrals + mission completion. We do not share your data with third parties.
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs tracking-wide text-white/70">{label}</Label>
      {children}
    </div>
  )
}

function MissionRow({ done, count, total, label, sub }) {
  return (
    <div className={`rounded-xl p-4 border ${done ? 'border-amber-300/40 bg-amber-300/5' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center justify-between">
        <div className="font-bold flex items-center gap-2">
          {done ? <Check className="w-4 h-4 text-amber-300" /> : <Lock className="w-4 h-4 text-white/40" />}
          {label}
        </div>
        <div className={`text-sm font-black tabular-nums ${done ? 'text-amber-300' : 'text-white/70'}`}>{count}/{total}</div>
      </div>
      <div className="text-xs text-white/60 mt-1 pl-6">{sub}</div>
    </div>
  )
}

function ShareBtn({ onClick, label, icon: Icon, color }) {
  return (
    <button type="button" onClick={onClick} className={`h-12 rounded-xl border ${color} flex flex-col items-center justify-center gap-0.5 hover:scale-[1.03] transition active:scale-95`}>
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  )
}

export default App
