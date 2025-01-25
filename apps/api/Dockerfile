# In ALL FROM instructions (base, builder, runner)
FROM --platform=linux/amd64 node:22-slim AS base

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

# 1. Copy minimal config for dependency install
COPY package.json yarn.lock .yarnrc.yml nx.json tsconfig.base.json ./

# 2. Force rebuild from source
ENV npm_config_build_from_source=true
ENV npm_config_arch=x64
ENV npm_config_platform=linux

# 3. Install dependencies
RUN yarn install --frozen-lockfile

# 4. Copy the rest of your repo
COPY . .

# 5. Generate Prisma client
RUN npx prisma generate --schema=libs/data-access/prisma/schema

# 6. Build the API
RUN yarn nx build api --configuration production --verbose

# --------------------------------------------------
# 3) Runner stage
# --------------------------------------------------
FROM base AS runner
WORKDIR /app

# Create user
RUN groupadd -g 1001 nestjs && \
    useradd -u 1001 -g nestjs -s /bin/bash -m nestjs

# Copy build artifacts from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api ./dist/apps/api
COPY --from=builder /app/libs/data-access/prisma/migrations ./libs/data-access/prisma/migrations
COPY --from=builder /app/libs/data-access/prisma/schema ./libs/data-access/prisma/schema

# Adjust permissions
RUN chown -R nestjs:nestjs /app
USER nestjs

CMD ["sh", "-c", "yarn prisma migrate deploy --schema=libs/data-access/prisma/schema && node dist/apps/api/main.js"]
