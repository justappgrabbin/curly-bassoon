#!/bin/bash
set -e

echo "🌊 Setting up Trident Sentient with Netlify..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ git required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm required${NC}"; exit 1; }

# Initialize git
if [ ! -d .git ]; then
    echo -e "${BLUE}🔧 Initializing git...${NC}"
    git init
    git branch -M main
fi

# Create project structure
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p .github/workflows
mkdir -p netlify/functions
mkdir -p scripts

# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "out"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1"
  NETLIFY_NEXT_PLUGIN_SKIP = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
EOF

# Create next.config.js for static export
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
EOF

# Create GitHub workflow
cat > .github/workflows/netlify-deploy.yml << 'EOF'
name: Deploy to Netlify

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: out/

  deploy-preview:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './out'
          production-deploy: false
          github-token: ${{ secrets.GITHUB_TOKEN }}
          enable-pull-request-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './out'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
EOF

# Create environment template
cat > .env.example << 'EOF'
# Netlify (for CLI use)
NETLIFY_AUTH_TOKEN=your_netlify_token_here

# Optional: API keys for generation
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EOF

# Create README with Netlify badge
cat > README.md << 'EOF'
# 🌊 Trident Sentient

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_BADGE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)

Multi-leveled autonomous morphing interface with embedded learning.

## Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/trident-sentient)

## Development

```bash
npm install
npm run dev
