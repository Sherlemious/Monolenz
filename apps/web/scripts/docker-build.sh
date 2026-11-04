#!/bin/sh
# Build (and optionally deploy) the Worker in a clean Linux container. Use it on
# Windows, where the OpenNext build needs symlinks. It also keeps local .env*
# files (which OpenNext would bundle into the Worker) out of the upload.
# /src = repo (read-only), /work = persistent build volume. From the repo root:
#
#   docker run --rm -v "$PWD:/src:ro" -v monolenz-cf-work:/work \
#     -v "<wrangler config dir>:/root/.config/.wrangler" -e CLOUDFLARE_ACCOUNT_ID=<id> \
#     -e NEXT_PUBLIC_SITE_URL=https://monolenz.sherlemious.com [-e NEXT_PUBLIC_POSTHOG_KEY=...] \
#     node:22-bookworm sh /src/apps/web/scripts/docker-build.sh [build|deploy]
#
# Windows wrangler config dir: %APPDATA%/xdg.config/.wrangler
set -eu
mkdir -p /work
cd /src
tar --exclude=node_modules --exclude=.next --exclude=.open-next --exclude=.wrangler --exclude=.git \
    --exclude=.turbo --exclude=dist --exclude='.env' --exclude='.env.*' --exclude='.dev.vars*' \
    --exclude=assets --exclude=.idea -cf - . | (cd /work && tar xf -)
cd /work
corepack enable >/dev/null 2>&1
export CI=true
pnpm install --frozen-lockfile --config.confirmModulesPurge=false >/tmp/install.log 2>&1 || { tail -40 /tmp/install.log; exit 1; }
pnpm --filter @monolenz/types --filter @monolenz/resume-pdf build >/tmp/pkgs.log 2>&1 || { tail -40 /tmp/pkgs.log; exit 1; }
cd apps/web
pnpm build:worker
case "${1:-build}" in
  deploy) CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://placeholder@localhost:5432/unused pnpm exec opennextjs-cloudflare deploy ;;
  *) echo "built only" ;;
esac
