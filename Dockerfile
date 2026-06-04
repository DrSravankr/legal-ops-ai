# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --omit=dev

COPY backend/ ./backend/

# Copy built frontend into backend/public
COPY --from=frontend-build /app/frontend/../backend/public ./backend/public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]
