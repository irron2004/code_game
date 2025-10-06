#!/bin/sh
set -e

PORT="${PORT:-8080}"
export PORT

# Render nginx config with dynamic port
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting nginx on port ${PORT}"
exec nginx -g 'daemon off;'
