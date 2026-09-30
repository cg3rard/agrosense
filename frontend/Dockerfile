# Stage 1 installs exactly the dependencies recorded in package-lock.json.
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Stage 2 compiles the standalone Next.js production bundle.
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# BACKEND_URL is read by server-side API routes at runtime, not baked into the bundle.
RUN npm run build

# Stage 3 runs only the standalone server and static/public assets.
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
