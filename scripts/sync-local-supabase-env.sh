#!/usr/bin/env bash
# Sincroniza variáveis Supabase locais no .env.local a partir de `supabase status`.
# Pré-requisito: supabase start
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI não encontrado."
  exit 1
fi

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  cp .env.local.example "$ENV_FILE"
fi

eval "$(supabase status -o env)"

SUPABASE_URL="${API_URL}"
# CLI >= 2.71: chaves opacas substituem JWTs HS256 legados
SUPABASE_ANON="${PUBLISHABLE_KEY:-${ANON_KEY:-}}"
SUPABASE_SERVICE="${SECRET_KEY:-${SERVICE_ROLE_KEY:-}}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON" ] || [ -z "$SUPABASE_SERVICE" ]; then
  echo "Supabase local não está rodando. Execute: supabase start"
  exit 1
fi

python3 - "$ENV_FILE" "$SUPABASE_URL" "$SUPABASE_ANON" "$SUPABASE_SERVICE" <<'PY'
import sys
from pathlib import Path

env_path = Path(sys.argv[1])
url, anon, service = sys.argv[2:5]
lines = env_path.read_text().splitlines()

keys = {
    "NEXT_PUBLIC_SUPABASE_URL": url,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": anon,
    "SUPABASE_SERVICE_ROLE_KEY": service,
}

seen = set()
out = []
for line in lines:
    if not line or line.lstrip().startswith("#"):
        out.append(line)
        continue
    key = line.split("=", 1)[0]
    if key in keys:
        out.append(f"{key}={keys[key]}")
        seen.add(key)
    else:
        out.append(line)

for key, value in keys.items():
    if key not in seen:
        out.append(f"{key}={value}")

env_path.write_text("\n".join(out) + "\n")
PY

echo "✓ .env.local atualizado com chaves do Supabase local"
echo "  URL: $SUPABASE_URL"
if [[ "$SUPABASE_ANON" == sb_* ]]; then
  echo "  Chaves: formato novo (sb_publishable / sb_secret)"
else
  echo "  Chaves: formato legado (JWT)"
fi
