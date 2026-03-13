# RecStats — 2K MyPlayer Rec Tracker

Basketball Reference-style stats tracker for NBA 2K MyPlayer Rec Center.

## Features
- Track unlimited players/builds
- Log full box scores game by game
- Per-game averages, season totals
- Advanced stats: TS%, eFG%, Game Score, PIE, AST/TOV, etc.
- Career highs, double/triple doubles, recent form (last 5)
- Sortable leaderboards across all players
- Full game log with filtering
- All data stored in browser localStorage (no backend needed)

## Deploy to Vercel (free, 5 minutes)

### Option 1: GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. Leave all settings default → Deploy
4. Done — you'll get a URL like `rec-stats-xxx.vercel.app`

### Option 2: Vercel CLI
```bash
npm i -g vercel
cd rec-stats
npm install
vercel
```
Follow the prompts — it'll give you a live URL instantly.

## Run Locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Notes
- Data is stored in localStorage — it lives in the browser you use
- To share data between devices, use the export/import feature (coming soon)
- Works on mobile too
