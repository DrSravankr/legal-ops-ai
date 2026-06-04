# Legal Ops AI — Deployment Guide

## Option 1: Render.com (Recommended — Free)

1. Push this folder to GitHub:
   - Create repo at github.com
   - `git init && git add . && git commit -m "Legal Ops AI v1.0"`
   - `git remote add origin https://github.com/YOUR_USERNAME/legal-ops-ai.git`
   - `git push -u origin main`

2. Go to render.com → New → Web Service → Connect GitHub repo

3. Settings auto-configured from render.yaml:
   - Build: `npm run build`
   - Start: `npm start`
   - Region: Singapore (closest to India)

4. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: (paste your Gemini API key here — from aistudio.google.com/app/apikey)

5. Deploy → Your site goes live at: `https://legal-ops-ai.onrender.com`

---

## Option 2: Railway.app

1. Push to GitHub (same as above)
2. railway.app → New Project → Deploy from GitHub
3. Add env vars: `GEMINI_API_KEY`, `NODE_ENV=production`
4. Deploy

---

## Option 3: VPS (DigitalOcean/AWS/Azure)

```bash
# On your server
git clone https://github.com/YOUR_USERNAME/legal-ops-ai.git
cd legal-ops-ai
echo "GEMINI_API_KEY=YOUR_KEY_HERE" > backend/.env
npm run build
npm install -g pm2
pm2 start "npm start" --name legal-ops
pm2 save && pm2 startup
```

Access at: http://YOUR_SERVER_IP:3001

---

## Custom Domain

On Render/Railway:
- Go to Settings → Custom Domain
- Add: `legalops.aneeshassociates.in`
- Add CNAME record in your DNS: `legalops → legal-ops-ai.onrender.com`

---

## Files Structure for Hosting

```
legal-ops-system/
├── backend/           ← Node.js API + serves built frontend
│   ├── public/        ← Built React app (auto-served in production)
│   ├── server.js      ← Single entry point
│   ├── .env           ← API keys (never commit this)
│   └── letterhead-logo.png  ← Aneesh Associates logo
├── frontend/          ← React source (built before deploy)
├── render.yaml        ← Render.com config
├── Procfile           ← Heroku/Railway config  
└── package.json       ← Root build scripts
```
