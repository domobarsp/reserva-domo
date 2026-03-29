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

### 1.7 Habilitar proteção contra senhas vazadas

1. Vá em **Authentication > Providers > Email**
2. Ative a opção **"Protect against leaked passwords"**
3. Salve as alterações

### 1.8 Verificar backups

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
| `ADMIN_NOTIFICATION_EMAIL` | Email para notificações de novas reservas | Definido pelo cliente |
| `NEXT_PUBLIC_APP_URL` | URL pública do app (sem `/` no final) | URL do deploy Vercel |

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
vercel env add NEXT_PUBLIC_APP_URL

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

### Emails não chegam

- Verifique se o domínio de envio está verificado no Resend (**Settings > Domains**)
- Confira os logs de envio em **resend.com > Emails** para identificar falhas
- Verifique se o `ADMIN_NOTIFICATION_EMAIL` é um endereço válido
- Cheque a pasta de spam do destinatário

### Erro 500 no admin

- Acesse os logs de serverless functions na Vercel: **Deployments > Functions > Logs**
- Verifique se o `SUPABASE_SERVICE_ROLE_KEY` está correto
- Confirme que as migrations foram aplicadas com sucesso (`supabase db push`)
