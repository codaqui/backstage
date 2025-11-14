#!/bin/sh
set -e

# This script injects runtime configuration into the frontend app
# It's executed by nginx on container startup
# IMPORTANT: Do NOT expose internal backend URLs - nginx handles routing

APP_CONFIG_PATH="/usr/share/nginx/html/app-config.json"

# Create runtime app config (frontend should only know about itself)
echo "Injecting runtime configuration..."

# Frontend always uses itself as backend (nginx proxies to actual backends)
cat > "$APP_CONFIG_PATH" <<EOF
{
  "app": {
    "title": "${APP_TITLE:-Codaqui Portal}",
    "baseUrl": "${APP_BASE_URL:-http://localhost:3000}"
  },
  "backend": {
    "baseUrl": "${APP_BASE_URL:-http://localhost:3000}"
  }
}
EOF

echo "Runtime configuration injected successfully (using nginx proxy)"
