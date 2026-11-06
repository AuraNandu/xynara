
// XYNARA Worker API - Cloudflare Workers + D1
export interface Env { DB: D1Database; ADMIN_PASSWORD: string; }
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }
function json(data: any, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } }) }
function badWordFilter(text: string) {
  const bad = ['fuck','shit','bitch','dick','porn','sex']
  let out = text; let flagged = false
  for (const w of bad) { if (out.toLowerCase().includes(w)) { flagged = true; out = out.split(new RegExp(w, 'gi')).join('***') } }
  return { text: out, flagged }
}
function hash(p: string) { let h = 0; for (let i=0;i<p.length;i++) h = ((h<<5)-h + p.charCodeAt(i)) | 0; return 'demo_' + Math.abs(h).toString(36) }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (!url.pathname.startsWith('/api')) return json({ app: 'XYNARA', status: 'live', message: 'Connect Beyond Reality' })
    const path = url.pathname.replace('/api','')
    if (path === '/health') return json({ ok: true, time: Date.now() })
    if (path === '/auth' && request.method === 'POST') {
      const { username, password } = await request.json() as any
      if (!username || !password) return json({ error: 'Missing fields' }, 400)
      const existing = await env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first()
      if (existing) {
        if ((existing as any).banned) return json({ error: 'Banned' }, 403)
        if ((existing as any).password_hash !== hash(password)) return json({ error: 'Wrong password' }, 401)
        return json({ user: { username, rank: (existing as any).rank, id: (existing as any).id } })
      }
      const id = crypto.randomUUID()
      await env.DB.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?,?,?,?)').bind(id, username, hash(password), Date.now()).run()
      return json({ user: { username, rank: 'MEMBER', id } })
    }
    if (path === '/users') {
      const { results } = await env.DB.prepare('SELECT id, username, rank, banned, created_at FROM users LIMIT 100').all()
      return json({ users: results })
    }
    if (path === '/messages' && request.method === 'GET') {
      const channel = url.searchParams.get('channel') || 'general'
      const { results } = await env.DB.prepare('SELECT * FROM messages WHERE channel_id=? ORDER BY created_at DESC LIMIT 100').bind(channel).all()
      return json({ messages: (results||[]).reverse() })
    }
    if (path === '/messages' && request.method === 'POST') {
      const { sender_name, sender_id, content, channel_id } = await request.json() as any
      const f = badWordFilter(content || '')
      const id = crypto.randomUUID()
      await env.DB.prepare('INSERT INTO messages (id, channel_id, sender_id, sender_name, content, flagged, created_at) VALUES (?,?,?,?,?,?,?)').bind(id, channel_id||'general', sender_id||'anon', sender_name||'anon', f.text, f.flagged?1:0, Date.now()).run()
      return json({ ok: true, flagged: f.flagged, content: f.text })
    }
    if (path === '/groups' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM groups LIMIT 50').all()
      return json({ groups: results })
    }
    if (path === '/call' && request.method === 'POST') {
      const body = await request.json() as any
      return json({ ok: true, echo: body, note: 'Use Durable Objects for real multi-peer signaling in production' })
    }
    if (path === '/admin' && request.method === 'POST') {
      const { password, action, target, rank } = await request.json() as any
      if (password !== env.ADMIN_PASSWORD) return json({ error: 'Wrong admin password' }, 401)
      if (action === 'ban') await env.DB.prepare('UPDATE users SET banned=1 WHERE username=?').bind(target).run()
      if (action === 'unban') await env.DB.prepare('UPDATE users SET banned=0 WHERE username=?').bind(target).run()
      if (action === 'set_rank') await env.DB.prepare('UPDATE users SET rank=? WHERE username=?').bind(rank, target).run()
      if (action === 'all_chats') { const { results } = await env.DB.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 200').all(); return json({ messages: results }) }
      if (action === 'flagged') { const { results } = await env.DB.prepare('SELECT * FROM messages WHERE flagged=1 ORDER BY created_at DESC LIMIT 100').all(); return json({ messages: results }) }
      return json({ ok: true, action })
    }
    return json({ error: 'Not found' }, 404)
  }
}
