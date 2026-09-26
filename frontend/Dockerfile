# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# BACKEND_URL is resolved at request-time in API routes (server-side only),
# so it does NOT need to be baked into the build. Provide it at runtime.
RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
