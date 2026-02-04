FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client AFTER npm ci
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output exists (NestJS outputs to dist/src/)
RUN ls -la dist/src/ && test -f dist/src/main.js


FROM node:20-alpine AS runner

# Configurer le timezone pour la France
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Europe/Paris /etc/localtime && \
    echo "Europe/Paris" > /etc/timezone

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

RUN npx prisma generate

RUN mkdir -p /app/docs && chown -R nestjs:nodejs /app/docs

# Passer à l'utilisateur non-root
USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

# Start directly with the correct path
CMD ["node", "dist/src/main.js"]

