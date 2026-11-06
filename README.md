# XYNARA — Connect Beyond Reality 🪐

Futuristic Discord-like web app. Login, Groups, DMs, Following (no accept needed), Voice/Video Calls (Google Meet style grid), Stories, Soundboard, Polls, Games, and Admin Control Core.

**Admin password:** `AuraNandu_2012`

## Quick Start (Local)

```bash
npm install
npm run dev
# open http://localhost:5173
```

Demo users: `nandu`, `aria`, `kai`, `mia`, `zen` — any password works in local preview.

## Upload to GitHub

1. Create a new repo on GitHub, e.g. `xynara`
2. Upload ALL files in this folder (drag & drop, or `git push`)
   - Don't upload `node_modules` or `dist` — they are in `.gitignore`
3. Your repo will look like the screenshot: `migrations/`, `src/`, `worker/`, `index.html`, `package.json`, `wrangler.toml`...

## Deploy to Cloudflare (FREE)

### Option A — Cloudflare Pages (Frontend only, easiest)

1. Cloudflare Dashboard → Pages → Create Application → Pages → Connect to Git
2. Select your `xynara` repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Deploy → you get `https://xynara.pages.dev`

> In Pages-only mode, data is stored in browser localStorage (works instantly, but per-device).

### Option B — Pages + D1 + Worker (Real shared backend)

```bash
# 1. Create D1
npx wrangler d1 create xynara-db
# Copy database_id into wrangler.toml

# 2. Migrate
npm run db:migrate

# 3. Deploy frontend
npm run deploy
```

Then set in Cloudflare Dashboard → Pages → Settings → Environment variables:
`ADMIN_PASSWORD = AuraNandu_2012` (change this in production!)

## Features

- Auth with username + password
- Groups + Channels (text + voice)
- DMs, Following / Followers, Friends (mutual)
- Video/Voice calls — Meet-style grid for 2-6+, mic/cam toggles, Accept/Decline
- Admin Panel — Live Groups, All Users, Inspect All Chats, Ban/Unban, Ranks: OWNER / ADMIN / MOD / VIP / MEMBER, Flagged messages
- Chaos: Stories, Soundboard (Airhorn, Fart, Applause...), Custom reactions, Polls, Games (Tic-Tac-Toe, RPS, Truth or Dare, Quiz, This or That), Meme / Shout / Confetti

## Security Note

This starter keeps admin password in `wrangler.toml` / frontend for demo. For production, move admin auth to Cloudflare Access / Workers + hashed passwords + JWT. Never ship the real admin password in public repos — rotate it after demo.
