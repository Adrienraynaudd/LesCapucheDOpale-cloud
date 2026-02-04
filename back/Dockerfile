FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit

RUN npx prisma generate
COPY . .

RUN npm run build && ls -la dist/


FROM node:18-alpine AS runner

# Configurer le timezone pour la France
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Europe/Paris /etc/localtime && \
    echo "Europe/Paris" > /etc/timezone

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit && npm install ts-node && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.json ./tsconfig.json

RUN npx prisma generate

RUN mkdir -p /app/docs && chown -R nestjs:nodejs /app/docs

RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'echo "🔄 Syncing database schema..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma db push --accept-data-loss || echo "⚠️  DB push failed, continuing..."' >> /app/docker-entrypoint.sh && \
    echo 'echo "🌱 Seeding database..."' >> /app/docker-entrypoint.sh && \
    echo 'npm run prisma:seed || echo "⚠️  Seed already applied or failed"' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node dist/main.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh && \
    chown nestjs:nodejs /app/docker-entrypoint.sh

# Passer à l'utilisateur non-root
USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["/app/docker-entrypoint.sh"]
