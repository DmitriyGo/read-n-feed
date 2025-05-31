# --------------------------------------------------
# 1) Base image for both build & run
# --------------------------------------------------
FROM node:22-slim AS base

# Install build essentials + OpenSSL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      g++ \
      make \
      openssl \
      python3 \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# --------------------------------------------------
# 2) Builder stage
# --------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy minimal config for dependency install
COPY package.json yarn.lock .yarnrc.yml nx.json tsconfig.base.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of your repo
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=libs/data-access/prisma/schema

# Build the API
RUN yarn nx build api --configuration production --verbose

# --------------------------------------------------
# 3) Runner stage
# --------------------------------------------------
FROM base AS runner
WORKDIR /app

# Create user and secrets directory
RUN groupadd -g 1001 nestjs && \
    useradd -u 1001 -g nestjs -s /bin/bash -m nestjs && \
    mkdir -p /run/secrets && \
    chown -R nestjs:nestjs /run/secrets && \
    chmod 750 /run/secrets

# Copy build artifacts from builder
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./
COPY --from=builder --chown=nestjs:nestjs /app/yarn.lock ./
COPY --from=builder --chown=nestjs:nestjs /app/.yarnrc.yml ./
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist/apps/api ./dist/apps/api
COPY --from=builder --chown=nestjs:nestjs /app/libs/data-access/prisma/migrations ./libs/data-access/prisma/migrations
COPY --from=builder --chown=nestjs:nestjs /app/libs/data-access/prisma/schema ./libs/data-access/prisma/schema

# Reinstall bcrypt to ensure Linux compatibility
RUN yarn remove bcrypt && yarn add bcrypt

# Final permissions adjustment
RUN chown -R nestjs:nestjs /app
USER nestjs

CMD ["sh", "-c", "node dist/apps/api/main.js"]
