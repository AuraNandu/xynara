# XYNARA UPGRADE NOTES

## What changed from preview -> real repo
- Preview was a single HTML file (in-memory only).
- This repo is a real Vite + React + TypeScript project.
- Frontend in `src/` - real files you can edit.
- Backend in `worker/` - Cloudflare Worker + D1.
- DB schema in `migrations/0001_xynara_init.sql`.

## Deploy checklist
1. `npm install`
2. `npx wrangler d1 create xynara-db` -> copy ID into wrangler.toml
3. `npm run db:migrate`
4. Push to GitHub
5. Cloudflare Pages -> Connect Git -> Build: `npm run build`, Output: `dist`

## Admin
Password in wrangler.toml: AuraNandu_2012
Change it in Cloudflare Dashboard > Pages > Settings > Environment Variables after first deploy.
