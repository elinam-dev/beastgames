import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Password',
}

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

function makeReferralCode() {
  // 8-char uppercase alphanumeric, no ambiguous chars
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function sanitize(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return rest
}

function adminOk(request) {
  const pwd = request.headers.get('x-admin-password') || ''
  return pwd && pwd === (process.env.ADMIN_PASSWORD || 'beastgames2025')
}

async function getStats(db) {
  const total = await db.collection('applications').countDocuments({})
  const priority = await db.collection('applications').countDocuments({ priorityUnlocked: true })
  const baseFake = 12847 // social proof base — real count adds on top
  return {
    total,
    priority,
    displayCount: baseFake + total,
  }
}

async function recomputeReferrals(db, code) {
  const count = await db.collection('applications').countDocuments({ referredBy: code })
  await db.collection('applications').updateOne({ referralCode: code }, { $set: { referralCount: count } })
  return count
}

export async function GET(request, { params }) {
  try {
    const db = await getDb()
    const path = (params?.path || []).join('/')
    const url = new URL(request.url)

    if (path === 'health' || path === '') {
      return json({ ok: true, service: 'beast-games-africa', time: new Date().toISOString() })
    }

    if (path === 'stats') {
      const stats = await getStats(db)
      return json(stats)
    }

    if (path === 'leaderboard') {
      const limit = parseInt(url.searchParams.get('limit') || '10', 10)
      const rows = await db.collection('applications')
        .find({ referralCount: { $gt: 0 } })
        .project({ fullName: 1, country: 1, referralCode: 1, referralCount: 1, priorityUnlocked: 1, _id: 0 })
        .sort({ referralCount: -1, createdAt: 1 })
        .limit(limit)
        .toArray()
      return json({ leaderboard: rows })
    }

    if (path.startsWith('applications/')) {
      const code = path.split('/')[1]
      const app = await db.collection('applications').findOne({ referralCode: code })
      if (!app) return json({ error: 'Not found' }, 404)
      // recompute referrals on the fly
      const refCount = await recomputeReferrals(db, code)
      app.referralCount = refCount
      return json({ application: sanitize(app) })
    }

    if (path === 'admin/applications') {
      if (!adminOk(request)) return json({ error: 'Unauthorized' }, 401)
      const q = url.searchParams.get('q') || ''
      const filter = q ? {
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } },
          { referralCode: { $regex: q, $options: 'i' } },
        ]
      } : {}
      const rows = await db.collection('applications')
        .find(filter)
        .project({ _id: 0 })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray()
      return json({ applications: rows })
    }

    if (path === 'admin/stats') {
      if (!adminOk(request)) return json({ error: 'Unauthorized' }, 401)
      const total = await db.collection('applications').countDocuments({})
      const priority = await db.collection('applications').countDocuments({ priorityUnlocked: true })
      const shortlisted = await db.collection('applications').countDocuments({ shortlisted: true })
      const byCountry = await db.collection('applications').aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]).toArray()
      const topReferrers = await db.collection('applications')
        .find({ referralCount: { $gt: 0 } })
        .project({ _id: 0, fullName: 1, email: 1, referralCode: 1, referralCount: 1, country: 1 })
        .sort({ referralCount: -1 })
        .limit(20)
        .toArray()
      return json({ total, priority, shortlisted, byCountry, topReferrers })
    }

    if (path === 'admin/export') {
      if (!adminOk(request)) return new NextResponse('Unauthorized', { status: 401, headers: CORS_HEADERS })
      const rows = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray()
      const headers = ['referralCode','fullName','email','phone','country','age','instagram','tiktok','twitter','referredBy','referralCount','priorityUnlocked','shortlisted','sharesCompleted','groupsShared','q_why','q_prize','q_standout','q_travel','createdAt']
      const escape = (v) => {
        if (v === null || v === undefined) return ''
        const s = String(v).replace(/"/g, '""')
        return `"${s}"`
      }
      const lines = [headers.join(',')]
      for (const r of rows) {
        lines.push(headers.map(h => escape(r[h])).join(','))
      }
      return new NextResponse(lines.join('\n'), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="beast-games-africa-applications.csv"'
        }
      })
    }

    return json({ error: 'Not found', path }, 404)
  } catch (e) {
    console.error('GET error', e)
    return json({ error: 'Server error', message: e.message }, 500)
  }
}

export async function POST(request, { params }) {
  try {
    const db = await getDb()
    const path = (params?.path || []).join('/')
    const body = await request.json().catch(() => ({}))

    if (path === 'applications') {
      const required = ['fullName', 'email', 'phone', 'country', 'age']
      for (const k of required) {
        if (!body[k] || String(body[k]).trim() === '') {
          return json({ error: `Missing field: ${k}` }, 400)
        }
      }
      const email = String(body.email).trim().toLowerCase()
      const existing = await db.collection('applications').findOne({ email })
      if (existing) {
        return json({
          ok: true,
          alreadyExists: true,
          application: sanitize(existing),
        })
      }
      // unique referral code
      let code
      for (let i = 0; i < 6; i++) {
        code = makeReferralCode()
        const exists = await db.collection('applications').findOne({ referralCode: code })
        if (!exists) break
      }
      const referredBy = body.referredBy ? String(body.referredBy).toUpperCase() : null
      // ensure referredBy exists
      let referrerOk = null
      if (referredBy) {
        const ref = await db.collection('applications').findOne({ referralCode: referredBy })
        referrerOk = ref ? referredBy : null
      }
      const now = new Date()
      const doc = {
        id: uuidv4(),
        referralCode: code,
        referredBy: referrerOk,
        fullName: String(body.fullName).trim(),
        email,
        phone: String(body.phone).trim(),
        country: String(body.country).trim(),
        age: Number(body.age) || null,
        instagram: body.instagram ? String(body.instagram).trim() : '',
        tiktok: body.tiktok ? String(body.tiktok).trim() : '',
        twitter: body.twitter ? String(body.twitter).trim() : '',
        q_why: body.q_why ? String(body.q_why).trim() : '',
        q_prize: body.q_prize ? String(body.q_prize).trim() : '',
        q_standout: body.q_standout ? String(body.q_standout).trim() : '',
        q_travel: body.q_travel ? String(body.q_travel).trim() : '',
        referralCount: 0,
        sharesCompleted: 0,
        groupsShared: 0,
        priorityUnlocked: false,
        shortlisted: false,
        verified: true, // MVP: skip email verify
        createdAt: now,
        updatedAt: now,
      }
      await db.collection('applications').insertOne(doc)
      // bump the referrer's count
      if (referrerOk) {
        await recomputeReferrals(db, referrerOk)
      }
      return json({ ok: true, application: sanitize(doc) })
    }

    // Track a share completion (gamification — client-driven trust for MVP)
    if (path.startsWith('applications/') && path.endsWith('/share')) {
      const code = path.split('/')[1]
      const channel = body.channel || 'unknown'
      const kind = body.kind || 'friend' // 'friend' | 'group'
      const app = await db.collection('applications').findOne({ referralCode: code })
      if (!app) return json({ error: 'Not found' }, 404)
      const update = { $inc: {}, $set: { updatedAt: new Date() }, $push: { shareLog: { channel, kind, at: new Date() } } }
      if (kind === 'group') update.$inc.groupsShared = 1
      else update.$inc.sharesCompleted = 1
      await db.collection('applications').updateOne({ referralCode: code }, update)
      const fresh = await db.collection('applications').findOne({ referralCode: code })
      const unlocked = (fresh.sharesCompleted >= 2) && (fresh.groupsShared >= 5)
      if (unlocked && !fresh.priorityUnlocked) {
        await db.collection('applications').updateOne({ referralCode: code }, { $set: { priorityUnlocked: true } })
        fresh.priorityUnlocked = true
      }
      return json({ ok: true, application: sanitize(fresh) })
    }

    // Track a referral hit (someone landed via /r/CODE)
    if (path === 'referral-hit') {
      const code = (body.code || '').toUpperCase()
      if (!code) return json({ ok: false })
      await db.collection('referral_hits').insertOne({ code, at: new Date(), ua: body.ua || '' })
      return json({ ok: true })
    }

    if (path === 'admin/shortlist') {
      if (!adminOk(request)) return json({ error: 'Unauthorized' }, 401)
      const code = body.referralCode
      const value = !!body.shortlisted
      await db.collection('applications').updateOne({ referralCode: code }, { $set: { shortlisted: value, updatedAt: new Date() } })
      return json({ ok: true })
    }

    return json({ error: 'Not found', path }, 404)
  } catch (e) {
    console.error('POST error', e)
    return json({ error: 'Server error', message: e.message }, 500)
  }
}
