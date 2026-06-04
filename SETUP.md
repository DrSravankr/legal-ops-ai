# Legal Ops AI System — Setup & Deployment Guide

## Quick Start (Local Development)

### Step 1 — Set your API Key
Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```
Get your key from: https://console.anthropic.com/settings/keys

### Step 2 — Start the backend
Double-click `start-backend.bat`  
Or: `cd backend && node server.js`

### Step 3 — Start the frontend
Double-click `start-frontend.bat`  
Or: `cd frontend && npm run dev`

### Step 4 — Open the app
Visit: http://localhost:5173

---

## Process Documents from ZIP (Interim Report)

After setting the API key, run:
```
node process-docs.js
```
This will:
1. Extract text from all PDFs (text + Vision OCR for scanned docs)
2. AI-analyze and structure all legal data
3. Generate `Downloads/Interim_Legal_Scrutiny_Report_Thanisandra.docx`

---

## Deploy as Website

### Option A — Single Server (Render / Railway / VPS)

**Build the frontend:**
```bash
cd frontend
npm run build
```
This outputs the React app into `backend/public/`.

**Start in production mode:**
```bash
NODE_ENV=production node backend/server.js
```
One port serves both the website AND the API.

**Deploy to Render.com (free tier):**
1. Push this folder to a GitHub repo
2. Go to render.com → New → Web Service
3. Build command: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
4. Start command: `NODE_ENV=production node backend/server.js`
5. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`

**Deploy to Railway.app:**
1. Push to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Set env: `ANTHROPIC_API_KEY`, `NODE_ENV=production`

### Option B — Docker (Any VPS / Cloud)

```bash
# Build and run
docker-compose up -d

# With your API key
ANTHROPIC_API_KEY=sk-ant-api03-... docker-compose up -d
```

Access at http://your-server-ip:3000

**For AWS / Azure / GCP:**
- Build Docker image and push to ECR/ACR/GCR
- Deploy as container service (ECS / Container Apps / Cloud Run)

### Option C — VPS (DigitalOcean / Hostinger / AWS EC2)

```bash
# On the server
git clone <your-repo>
cd legal-ops-system
echo "ANTHROPIC_API_KEY=sk-ant-..." > backend/.env
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend
NODE_ENV=production node backend/server.js
```
Use PM2 for process management:
```bash
npm install -g pm2
pm2 start "NODE_ENV=production node backend/server.js" --name legal-ops
pm2 save && pm2 startup
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Set to `production` for single-server mode |

---

## Architecture

```
legal-ops-system/
├── backend/          ← Express.js API server (Node.js)
│   ├── extractors/   ← PDF/DOCX/Image text extraction
│   ├── ai/           ← Claude API integration (extraction + analysis)
│   ├── generators/   ← DOCX report generator
│   └── public/       ← Built React app served in production
├── frontend/         ← React + Vite + TypeScript
├── Dockerfile        ← Container deployment
└── docker-compose.yml
```

## Features
- Upload DOCX, PDF, JPG, PNG, TIFF and more
- Claude Vision OCR for scanned documents
- Indian language support (Kannada, Telugu, Tamil, Hindi, Malayalam, Marathi, Gujarati, Bengali)
- AI-powered structured data extraction
- 9-section review panel with full editing capability
- Auto-generates Legal Scrutiny Report in bank-standard DOCX format
- Supports APF, Individual Home Loan, LAP, Commercial reports
