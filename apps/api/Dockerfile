# --------------------------------------------------
# 1) Base image
# --------------------------------------------------
FROM node:22-alpine AS base
RUN corepack enable \
  && apk add --no-cache openssl libc6-compat \
  && apk update

# --------------------------------------------------
# 2) Builder stage
# --------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy the minimal Nx config & Yarn files first so we can install
COPY package.json yarn.lock .yarnrc.yml nx.json tsconfig.base.json ./

# If you have no workspace.json and rely on project.json in each folder:
# do NOT copy them individually. We'll copy the entire apps/ and libs/ next.
# That way Nx sees the correct structure in one pass.

RUN yarn install --frozen-lockfile

# Now copy the rest of the source code
COPY . .

# Reset Nx cache if necessary
RUN npx nx reset || true

# If you need to generate Prisma before building:
RUN npx prisma generate --schema=libs/data-access/prisma/schema

# Build the API
RUN yarn nx build api --configuration production --verbose

# --------------------------------------------------
# 3) Runner stage
# --------------------------------------------------
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nestjs \
  && adduser --system --uid 1001 nestjs
USER nestjs

# Copy build artifacts
COPY --from=builder /app/dist/apps/api ./dist/apps/api
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma/migrations if needed at runtime
COPY libs/data-access/prisma/schema ./libs/data-access/prisma/schema
COPY libs/data-access/prisma/migrations ./libs/data-access/prisma/migrations

CMD ["sh","-c","yarn prisma migrate deploy --schema=libs/data-access/prisma/schema && node dist/apps/api/main.js"]
