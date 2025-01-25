# --------------------------------------------------
# 1) Base image
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


# Enable corepack
RUN corepack enable

# --------------------------------------------------
# 2) Builder stage
# --------------------------------------------------
FROM base AS builder
WORKDIR /app

# 1. Copy minimal config for dependency install
COPY package.json yarn.lock .yarnrc.yml nx.json tsconfig.base.json ./

# 2. Force native rebuild from source (no prebuilt binaries)
ENV npm_config_build_from_source=true

# 3. Install dependencies
RUN yarn install --frozen-lockfile

# 4. Copy the rest of your repository
COPY . .

# 5. Generate Prisma client
RUN npx prisma generate --schema=libs/data-access/prisma/schema

# 6. Build the API with Nx
RUN yarn nx build api --configuration production --verbose

# --------------------------------------------------
# 3) Runner stage
# --------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Install OpenSSL and create user
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 nestjs && \
    useradd -u 1001 -g nestjs -s /bin/bash -m nestjs

# Enable corepack system-wide
RUN corepack enable

# Copy package manager config first
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./
COPY --from=builder --chown=nestjs:nestjs /app/yarn.lock ./
COPY --from=builder --chown=nestjs:nestjs /app/.yarnrc.yml ./

# Prepare Yarn version
USER nestjs
RUN corepack prepare

# Copy application files
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist/apps/api ./dist/apps/api
COPY --from=builder --chown=nestjs:nestjs /app/libs/data-access/prisma/migrations ./libs/data-access/prisma/migrations
COPY --from=builder --chown=nestjs:nestjs /app/libs/data-access/prisma/schema ./libs/data-access/prisma/schema

# Final command
CMD ["sh", "-c", "yarn prisma migrate deploy --schema=libs/data-access/prisma/schema && node dist/apps/api/main.js"]
