# ---- Base image for building ----
FROM node:20-slim AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# ---- Dependencies layer ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
# Install all deps (dev deps needed for build)
RUN pnpm install --frozen-lockfile

# ---- Build layer ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/pnpm-lock.yaml /app/package.json ./
COPY tsconfig.json ./
COPY src ./src

# Allow Railway to pass DATABASE_URL as a build secret
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Build production bundle
RUN pnpm run build

# ---- Runtime layer ----
FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Railway環境変数を受け取るための宣言を追加
ENV OPENAI_API_KEY=""


# Copy only the production output and minimal files
COPY --from=build /app/.mastra /app/.mastra
COPY package.json pnpm-lock.yaml ./

# Optional: Install only prod deps if needed at runtime (usually not needed for built output)
# RUN corepack enable && corepack prepare pnpm@10.8.1 --activate \
#     && pnpm install --prod --frozen-lockfile

EXPOSE 3000 4111
ENV PORT=3000 HOST=0.0.0.0

# Start Mastra production server
CMD ["node", ".mastra/output/index.mjs"]

