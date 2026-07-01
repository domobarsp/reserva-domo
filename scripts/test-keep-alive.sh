#!/usr/bin/env bash
# Testa GET /api/cron/keep-alive localmente (simula o cron da Vercel).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  CRON_SECRET="$(grep -E '^CRON_SECRET=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "'")"
  export CRON_SECRET
fi

SECRET="${CRON_SECRET:-}"
if [[ -z "$SECRET" ]]; then
  echo "Defina CRON_SECRET no .env.local (ex.: openssl rand -base64 32)" >&2
  exit 1
fi

PORT="${PORT:-3000}"
BASE_URL="${BASE_URL:-http://localhost:$PORT}"

if ! curl -sf "$BASE_URL/api/health" >/dev/null 2>&1; then
  for try in 3004 3006 3001; do
    if curl -sf "http://localhost:$try/api/health" >/dev/null 2>&1; then
      BASE_URL="http://localhost:$try"
      break
    fi
  done
fi

echo "→ $BASE_URL/api/cron/keep-alive"
echo ""

echo "1) Sem auth (esperado 401):"
curl -s -w "\nHTTP %{http_code}\n" "$BASE_URL/api/cron/keep-alive"
echo ""

echo "2) Com auth (esperado 200 + ok:true):"
curl -s -w "\nHTTP %{http_code}\n" \
  -H "Authorization: Bearer $SECRET" \
  "$BASE_URL/api/cron/keep-alive"
echo ""
