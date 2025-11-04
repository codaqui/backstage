#!/bin/sh
set -e

# This script injects runtime configuration into the frontend app
# It's executed by nginx on container startup

APP_CONFIG_PATH="/usr/share/nginx/html/app-config.json"

# Create runtime app config if environment variables are provided
if [ -n "$BACKEND_URL" ] || [ -n "$APP_TITLE" ]; then
    echo "Injecting runtime configuration..."
    
    # Create a minimal config object
    cat > "$APP_CONFIG_PATH" <<EOF
{
  "app": {
    "title": "${APP_TITLE:-Codaqui Portal}",
    "baseUrl": "${APP_BASE_URL:-http://localhost:3000}"
  },
  "backend": {
    "baseUrl": "${BACKEND_URL:-http://localhost:7007}"
  }
}
EOF
    
    echo "Runtime configuration injected successfully"
else
    echo "No runtime configuration to inject"
fi
