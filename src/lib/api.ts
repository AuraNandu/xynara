// XYNARA API layer - tries Cloudflare Worker /api, falls back to localStorage
export async function api(path: string, opts: any = {}) {
  try {
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    if (!res.ok) throw new Error('api fail')
    return await res.json()
  } catch {
    return null
  }
}
