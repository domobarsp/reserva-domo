# Guia de Deploy — Domo Sistema de Reservas

Este documento descreve o processo completo para implantar o sistema Domo em produção.

---

## Pré-requisitos

Antes de iniciar, certifique-se de ter contas criadas nos seguintes serviços:

| Serviço | URL | Finalidade |
|---------|-----|------------|
| **Vercel** | vercel.com | Hospedagem da aplicação Next.js |
| **Supabase** | supabase.com | Banco de dados, autenticação e storage |
| **Stripe** | stripe.com | Processamento de pagamentos e cobranças de no-show |
| **Resend** | resend.com | Envio de emails transacionais |

---

## 1. Supabase — Configurar nova instância

### 1.1 Criar novo projeto

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Escolha organização, nome do projeto e senha do banco de dados
4. Selecione a região mais próxima dos usuários (ex: South America - São Paulo)
5. Aguarde a criação do projeto (~2 minutos)

### 1.2 Instalar e configurar Supabase CLI

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux (via npm como dependência local do projeto)
npx supabase --version
```

### 1.3 Linkar o projeto local

```bash
# Obtenha o <ref> em: Project Settings > General > Reference ID
supabase link --project-ref <ref>
```

### 1.4 Rodar as migrations

```bash
supabase db push
```

Isso aplica todas as migrations do diretório `supabase/migrations/` no banco de dados remoto.

### 1.5 Criar o primeiro usuário administrador

**Passo 1 — Criar o usuário via dashboard:**

1. Acesse o dashboard do Supabase
2. Vá em **Authentication > Users > Add User**
3. Preencha:
   - Email: `admin@domo.local` (ou o email real do administrador)
   - Password: escolha uma senha segura
4. Clique em **Create User**
5. Copie o **UUID** gerado para o usuário (coluna `id`)

**Passo 2 — Inserir o usuário na tabela `admin_users`:**

Acesse **SQL Editor** no dashboard do Supabase e execute:

```sql
INSERT INTO admin_users (id, restaurant_id, role, display_name, is_active)
VALUES (
  '<uuid-do-user>',
  (SELECT id FROM restaurants LIMIT 1),
  'owner',
  'Administrador',
  true
);
```

> Substitua `<uuid-do-user>` pelo UUID copiado no passo anterior.

### 1.6 Copiar as chaves de API

1. Vá em **Project Settings > API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> **Atenção:** A `service_role key` tem acesso administrativo total. Nunca a exponha no lado do cliente.

### 1.7 Storage — bucket de mídia do estabelecimento

A migration `010_establishment_profile.sql` cria o bucket `restaurant-media` (público leitura, upload admin).

**Produção (Supabase Dashboard):**

1. Vá em **Storage** e confirme que o bucket `restaurant-media` existe após `supabase db push`
2. Se necessário, crie manualmente: **Public bucket**, limite 5 MB, MIME `image/jpeg`, `image/png`, `image/webp`
3. As policies RLS da migration controlam upload apenas para admins autenticados

### 1.8 Habilitar proteção contra senhas vazadas

1. Vá em **Authentication > Providers > Email**
2. Ative a opção **"Protect against leaked passwords"**
3. Salve as alterações

### 1.9 Verificar backups

1. Vá em **Database > Backups**
2. Verifique que o **Point-in-Time Recovery (PITR)** está ativo
3. Em planos pagos, os backups são automáticos — confirme a frequência configurada

---

## 2. Stripe — Configurar nova conta

### 2.1 Criar conta e selecionar modo

1. Acesse [stripe.com](https://stripe.com) e crie ou faça login na sua conta
2. Para produção: ative o **modo Live** (toggle no canto superior esquerdo)
3. Para testes: mantenha o **modo Test**

### 2.2 Obter as chaves de API

1. Vá em **Developers > API Keys**
2. Copie:
   - **Publishable key** (`pk_live_...` ou `pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_live_...` ou `sk_test_...`) → `STRIPE_SECRET_KEY`

### 2.3 Criar o webhook

1. Vá em **Developers > Webhooks > Add endpoint**
2. Configure:
   - **Endpoint URL:** `https://<seu-dominio>/api/stripe/webhook`
   - **Events to send:** selecione os seguintes eventos:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
3. Clique em **Add endpoint**
4. Na tela do webhook criado, clique em **Reveal** para ver o **Signing secret**
5. Copie o secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

---

## 3. Resend — Configurar nova conta

### 3.1 Criar conta

1. Acesse [resend.com](https://resend.com) e crie ou faça login na sua conta

### 3.2 Configurar domínio de envio

**Para produção (recomendado):**

1. Vá em **Settings > Domains > Add Domain**
2. Insira o domínio (ex: `restaurante.com.br`)
3. Adicione os registros DNS fornecidos pelo Resend no painel do seu provedor de domínio
4. Aguarde a verificação (pode levar até 48h dependendo do provedor)

**Para testes:**

- Use o domínio de onboarding padrão do Resend (ex: `onboarding@resend.dev`)
- Válido apenas para enviar para o email da sua conta Resend

### 3.3 Gerar API Key

1. Vá em **API Keys > Create API Key**
2. Dê um nome descritivo (ex: `domo-producao`)
3. Selecione as permissões necessárias (Send emails)
4. Copie a chave gerada → `RESEND_API_KEY`

### 3.4 Definir email de notificações

Defina o email do gerente ou responsável que receberá notificações de novas reservas (ex: `gerente@restaurante.com.br`) → `ADMIN_NOTIFICATION_EMAIL`

---

## 4. Vercel — Deploy

### Variáveis de ambiente necessárias

Configure estas variáveis em **todas** as opções de deploy abaixo:

| Variável | Descrição | Onde obter |
|----------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (admin) do Supabase | Supabase > Settings > API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe | Stripe > Developers > API Keys |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe | Stripe > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | Stripe > Developers > Webhooks |
| `RESEND_API_KEY` | API key do Resend | Resend > API Keys |
| `RESEND_FROM_EMAIL` | Email remetente (domínio verificado no Resend) | ex: `reservas@seudominio.com` |
| `ADMIN_NOTIFICATION_EMAIL` | Email para notificações de novas reservas | Definido pelo cliente |
| `NEXT_PUBLIC_APP_URL` | URL pública do app (sem `/` no final) | URL do deploy Vercel |
| `CRON_SECRET` | Protege o cron de keep-alive do Supabase | Gere com `openssl rand -base64 32` |

### 4.1 Keep-alive do Supabase (plano free)

Projetos no plano gratuito do Supabase **pausam após ~7 dias sem chamadas à API**. O Domo expõe um endpoint que consulta o banco **1× por dia**; qualquer agendador externo (gratuito) pode chamá-lo — **não depende do Cron da Vercel** (indisponível ou limitado no plano Hobby).

| Item | Valor |
|------|--------|
| Rota | `GET /api/cron/keep-alive` |
| Auth | Header `Authorization: Bearer <CRON_SECRET>` |
| Implementação | `src/app/api/cron/keep-alive/route.ts` |
| O que faz | `SELECT id FROM restaurants LIMIT 1` via `SUPABASE_SERVICE_ROLE_KEY` |

#### Pré-requisito comum (Vercel + endpoint)

1. Gere o secret:

   ```bash
   openssl rand -base64 32
   ```

2. Adicione **`CRON_SECRET`** em **Vercel → Settings → Environment Variables → Production** (mesmo valor usado no agendador abaixo).

3. Garanta **`NEXT_PUBLIC_SUPABASE_URL`** e **`SUPABASE_SERVICE_ROLE_KEY`** em Production.

4. Redeploy após adicionar `CRON_SECRET`.

---

#### Opção A — GitHub Actions (recomendado se o repo está no GitHub)

Gratuito em repositórios públicos e privados (com cota mensal generosa).

1. No GitHub: repositório → **Settings → Secrets and variables → Actions → New repository secret**
   - `CRON_SECRET` — mesmo valor da Vercel
   - `APP_URL` — URL de produção **sem** barra no final (ex. `https://domo-xxx.vercel.app`)

2. O workflow já está no repo: `.github/workflows/supabase-keep-alive.yml`  
   Roda todo dia às **12:00 UTC** e também pode ser disparado manualmente em **Actions → Supabase keep-alive → Run workflow**.

3. Verificar: **Actions** → última execução com ✓ verde.

---

#### Opção B — [cron-job.org](https://cron-job.org) (sem GitHub)

Serviço gratuito que faz HTTP GET agendado.

1. Crie conta em [cron-job.org](https://console.cron-job.org)
2. **Cronjobs → Create cronjob**:
   - **URL:** `https://<sua-url-vercel>/api/cron/keep-alive`
   - **Schedule:** once a day (ex. 09:00, fuso America/Sao_Paulo)
   - **Request method:** GET
   - **Headers:** `Authorization: Bearer <seu CRON_SECRET>`
3. Salve e use **Run now** para testar.

---

#### Opção C — [UptimeRobot](https://uptimerobot.com) (monitor + ping)

Plano free: monitor HTTP (intervalo mínimo 5 min — mais frequente que o necessário, mas funciona).

1. **Add New Monitor → HTTP(s)**
2. URL: `https://<sua-url-vercel>/api/cron/keep-alive`
3. **Custom HTTP headers:** `Authorization: Bearer <CRON_SECRET>`
4. Intervalo: 1 day (se disponível) ou 5 min

---

#### Opção D — Cron da Vercel (apenas planos pagos)

Se no futuro migrar para Vercel Pro, crie `vercel.json` na raiz:

```json
{
  "crons": [{ "path": "/api/cron/keep-alive", "schedule": "0 12 * * *" }]
}
```

No plano **Hobby**, use as opções A, B ou C acima.

---

#### Testar manualmente

```bash
curl -s -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://<sua-url-vercel>/api/cron/keep-alive
```

Resposta esperada: `{"ok":true,"timestamp":"...","restaurantId":"...","durationMs":...}`

Localmente: `./scripts/test-keep-alive.sh` (com `CRON_SECRET` no `.env.local`).

#### Limitações

- Reduz pausas por inatividade; **não substitui** plano pago do Supabase.
- Se o projeto já estiver pausado, reative manualmente no dashboard do Supabase.
- Tráfego real (reservas, admin) também conta como atividade.

---

### Opção A: Via repositório Git (recomendado)

Esta é a forma mais simples e habilita deploys automáticos a cada push.

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New > Project**
3. Importe o repositório do GitHub ou GitLab
4. O **Framework Preset** será auto-detectado como **Next.js**
5. Expanda a seção **Environment Variables** e adicione todas as variáveis da tabela acima
6. Clique em **Deploy**
7. Aguarde o build e deploy (~2-3 minutos)

A partir de agora, cada push para a branch `main` disparará um deploy automático.

---

### Opção B: Via Vercel CLI

```bash
# Instalar a CLI da Vercel
npm install -g vercel

# Fazer login
vercel login

# Na raiz do projeto, adicionar cada variável de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add RESEND_API_KEY
vercel env add ADMIN_NOTIFICATION_EMAIL
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL
vercel env add CRON_SECRET

# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

---

### Opção C: Build local + deploy

```bash
# Fazer o build localmente
npm run build

# Enviar o build para produção
vercel deploy --prebuilt --prod
```

---

## 5. Checklist pós-deploy

Execute cada item abaixo após o primeiro deploy bem-sucedido:

- [ ] Acessar a URL de produção — página de reserva carrega corretamente
- [ ] Fazer login com o admin user criado no Supabase
- [ ] Verificar que o dashboard carrega sem erros
- [ ] Criar uma reserva de teste pelo formulário público
- [ ] Verificar email de confirmação (checar também a pasta de spam)
- [ ] Testar cancelamento via link do email de confirmação
- [ ] Testar cobrança de no-show (modo test do Stripe)
- [ ] Verificar Stripe webhook: **Dashboard > Webhooks > Recent events**
- [ ] Verificar security headers: `curl -I https://<url>`
- [ ] Testar login com usuário inválido (deve falhar graciosamente)
- [ ] Verificar robots.txt: `https://<url>/robots.txt`
- [ ] Keep-alive Supabase: GitHub Actions ✓ verde **ou** cron-job.org/UptimeRobot configurado; testar com `curl` + `CRON_SECRET`

---

## 6. Domínio customizado (futuro)

Para usar um domínio próprio (ex: `reservas.restaurante.com.br`):

### 6.1 Adicionar domínio na Vercel

1. Vá em **Vercel > Project > Settings > Domains > Add**
2. Digite o domínio desejado e clique em **Add**

### 6.2 Configurar DNS no provedor do domínio

| Tipo | Quando usar | Valor |
|------|-------------|-------|
| **CNAME** | Subdomínio (ex: `reservas.xxx.com.br`) | `cname.vercel-dns.com` |
| **A record** | Domínio raiz (ex: `xxx.com.br`) | `76.76.21.21` |

O SSL é provisionado automaticamente via Let's Encrypt após a propagação do DNS (~5 minutos).

### 6.3 Atualizar configurações após o domínio

Após o domínio estar ativo, é necessário:

1. **Atualizar a env var** `NEXT_PUBLIC_APP_URL` na Vercel com o novo domínio (ex: `https://reservas.restaurante.com.br`)
2. **Atualizar a URL do webhook** no Stripe: **Developers > Webhooks > endpoint > Update** — trocar a URL para `https://<novo-dominio>/api/stripe/webhook`
3. **Redeployar** a aplicação para aplicar a nova URL: `vercel --prod`

---

## 7. Troubleshooting

### "Missing required environment variable"

Verifique se todas as variáveis de ambiente estão configuradas na Vercel em **Settings > Environment Variables**. Certifique-se de que estão disponíveis para o ambiente correto (Production, Preview, Development).

### Webhook do Stripe não funciona

- Confirme que a URL do endpoint inclui `/api/stripe/webhook`
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto e sem espaços extras
- No dashboard do Stripe, vá em **Developers > Webhooks** e clique no endpoint para ver os eventos recentes e possíveis erros

### Keep-alive retorna 401

- Confirme que `CRON_SECRET` na Vercel é **igual** ao configurado no GitHub Actions / cron-job.org / UptimeRobot.
- O header deve ser exatamente: `Authorization: Bearer <secret>`.
- Teste manual com `curl` (ver § 4.1).

### Keep-alive retorna 503

- Verifique `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SUPABASE_URL` em Production.
- Confirme que existe ao menos um registro em `restaurants` (rode o seed se necessário).
- Veja logs em **Deployments → Functions** para a mensagem `[keep-alive] Supabase ping failed`.

### Emails não chegam

- Verifique se o domínio de envio está verificado no Resend (**Settings > Domains**)
- Confira os logs de envio em **resend.com > Emails** para identificar falhas
- Verifique se o `ADMIN_NOTIFICATION_EMAIL` é um endereço válido
- Cheque a pasta de spam do destinatário

### Erro 500 no admin

- Acesse os logs de serverless functions na Vercel: **Deployments > Functions > Logs**
- Verifique se o `SUPABASE_SERVICE_ROLE_KEY` está correto
- Confirme que as migrations foram aplicadas com sucesso (`supabase db push`)
