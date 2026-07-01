#!/usr/bin/env bash
# Cria usuário admin local para desenvolvimento (Supabase local).
# Usa signup público (PUBLISHABLE_KEY) + insert em admin_users — compatível com CLI >= 2.71.
# Pré-requisito: supabase start && supabase db reset
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI não encontrado. Instale: brew install supabase/tap/supabase"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql não encontrado. Instale PostgreSQL client (brew install libpq)."
  exit 1
fi

eval "$(supabase status -o env)"

EMAIL="${ADMIN_EMAIL:-admin@domo.local}"
PASSWORD="${ADMIN_PASSWORD:-admin123456}"
RESTAURANT_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
CLIENT_KEY="${PUBLISHABLE_KEY:-${ANON_KEY:-}}"

if [ -z "${DB_URL:-}" ] || [ -z "${API_URL:-}" ] || [ -z "$CLIENT_KEY" ]; then
  echo "Supabase local não está rodando. Execute: supabase start"
  exit 1
fi

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

EMAIL_SQL=$(sql_escape "$EMAIL")

echo "→ Removendo admin existente (se houver): $EMAIL"

psql "$DB_URL" -q -v ON_ERROR_STOP=1 <<SQL
DO \$\$
DECLARE
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = '${EMAIL_SQL}';
  IF existing_id IS NOT NULL THEN
    DELETE FROM public.admin_users WHERE id = existing_id;
    DELETE FROM auth.identities WHERE user_id = existing_id;
    DELETE FROM auth.users WHERE id = existing_id;
  END IF;
END \$\$;
SQL

echo "→ Criando usuário Auth via signup: $EMAIL"

RESPONSE=$(curl -s -X POST "${API_URL}/auth/v1/signup" \
  -H "apikey: ${CLIENT_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

USER_ID=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)
user = data.get('user') or data
print(user.get('id', ''))
" 2>/dev/null || true)

if [ -z "$USER_ID" ]; then
  echo "Erro ao criar usuário Auth:"
  echo "$RESPONSE"
  exit 1
fi

echo "→ Inserindo em admin_users (owner)"

psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c \
  "INSERT INTO public.admin_users (id, restaurant_id, role, display_name, is_active)
   VALUES ('${USER_ID}', '${RESTAURANT_ID}', 'owner', 'Admin Local', true)
   ON CONFLICT (id) DO UPDATE SET role = 'owner', is_active = true, display_name = 'Admin Local';"

echo ""
echo "✓ Admin local pronto"
echo "  ID:       $USER_ID"
echo "  Login:    admin  (ou ${EMAIL})"
echo "  Senha:    ${PASSWORD}"
echo "  Studio:   http://127.0.0.1:54323"
