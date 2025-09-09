# deps/install
FROM node:20-alpine AS deps
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY packages ./packages
COPY apps ./apps
COPY pnpm-lock.yaml ./
RUN pnpm install --filter web... --frozen-lockfile

# build with NEXT_PUBLIC vars
FROM node:20-alpine AS build
WORKDIR /workspace
RUN corepack enable

# Accept build args for NEXT_PUBLIC vars (inlined into client bundle)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL

# Set env vars for Next.js build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /workspace /workspace
RUN pnpm --filter web build

# runtime
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
# Copy standalone server and static assets
COPY --from=build /workspace/apps/web/.next/standalone ./
COPY --from=build /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /workspace/apps/web/public ./apps/web/public
EXPOSE 8080
WORKDIR /app/apps/web
CMD ["node", "server.js"]