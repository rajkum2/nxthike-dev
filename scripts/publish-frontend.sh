#!/usr/bin/env bash
# Build the Vite app for Netlify sites whose UI runs `npm run build` at the
# repo root and publishes either `dist` (Vite) or `build` (older CRA setting).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$major" -lt 18 ]; then
  echo "Node $(node -v) is too old for Vite. Switching to Node 18."
  nvm_sh="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [ -s "$nvm_sh" ]; then
    # shellcheck disable=SC1090
    . "$nvm_sh"
    nvm install 18
    nvm use 18
  else
    echo "Set NODE_VERSION=18 on the Netlify site. Vite requires Node 18 or newer." >&2
    exit 1
  fi
fi

npm --prefix FE install
npm --prefix FE run build

rm -rf dist build
mkdir -p dist build
cp -a FE/dist/. dist/
cp -a FE/dist/. build/
rm -rf dist/seed build/seed

# Read from the publish directory even when the Netlify UI ignores netlify.toml.
cat > dist/_redirects <<'EOF'
/seed/*  /404  404!
/*       /index.html  200
EOF
cp dist/_redirects build/_redirects

cat > dist/_headers <<'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; worker-src 'self' blob:;
EOF
cp dist/_headers build/_headers

echo "Published frontend to dist/ and build/ (seed path removed)."
