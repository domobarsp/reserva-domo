# Integrações e Serviços Externos

## Visão Geral

| Serviço | Propósito | Fase de introdução | Lado |
|---------|-----------|-------------------|------|
| **Supabase** | Banco de dados, autenticação, realtime | Fase 4 | Server + Client |
| **Stripe** | Captura de cartão, cobrança no-show | Fase 5 | Server + Client |
| **Resend** | Emails transacionais | Fase 6 | Server only |

---

## Supabase

### Propósito
- **Banco de dados** (PostgreSQL): todas as tabelas do sistema
- **Autenticação**: login do admin (email/password)
- **Realtime**: atualizações ao vivo no calendário e lista de reservas

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=         # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Chave anônima (público, RLS ativo)
SUPABASE_SERVICE_ROLE_KEY=         # Chave de serviço (bypassa RLS, server only)
```

### Padrões de Uso

**Browser Client** (`src/utils/supabase/client.ts`)
- Usado em componentes `'use client'` para realtime e queries client-side
- Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sujeito a RLS)
- Criar com `createBrowserClient()` do `@supabase/ssr`

**Server Client** (`src/utils/supabase/server.ts`)
- Usado em Server Components e Server Actions
- Acessa cookies para manter sessão do usuário
- Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sujeito a RLS)
- Criar com `createServerClient()` do `@supabase/ssr`

**Admin Client** (`src/utils/supabase/admin.ts`)
- Usado em API Routes e webhooks que precisam bypassar RLS
- Usa `SUPABASE_SERVICE_ROLE_KEY`
- **Nunca expor no client-side**

**Middleware** (`src/utils/supabase/middleware.ts`)
- Refresh de tokens de autenticação em cada request
- Integrado ao `src/middleware.ts` do Next.js

### Realtime
```typescript
// Padrão para subscrição de mudanças em reservas
const channel = supabase
  .channel('reservations')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reservations',
    filter: `date=eq.${selectedDate}`
  }, (payload) => {
    // Atualizar estado local
  })
  .subscribe();
```

### Tratamento de Erros
- Sempre verificar `error` no retorno: `const { data, error } = await supabase.from(...)`
- Em Server Actions: retornar `{ success: false, error: message }`
- Em API Routes: retornar `NextResponse.json({ error: message }, { status: 4xx })`
- Nunca lançar exceções não tratadas

---

## Stripe

### Propósito
- **SetupIntent**: Validar e salvar cartão de crédito sem cobrança
- **PaymentIntent**: Cobrar taxa de no-show no cartão salvo
- **Webhook**: Receber notificações de eventos (sucesso/falha)

### Variáveis de Ambiente
```env
STRIPE_SECRET_KEY=                     # Chave secreta (server only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=    # Chave publicável (client-side)
STRIPE_WEBHOOK_SECRET=                 # Segredo para verificar webhooks
```

### Padrões de Uso

**Server** (`src/utils/stripe/client.ts`)
```typescript
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

**Client** (Provider no layout do formulário)
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Envolver o form com <Elements stripe={stripePromise} options={...}>
```

### Fluxo SetupIntent (Captura de Cartão)

```
1. Frontend chama POST /api/stripe/setup-intent
   Body: { customerEmail, customerName, reservationId }

2. Backend:
   a. Busca ou cria Stripe Customer por email
   b. Cria SetupIntent com customer e metadata
   c. Salva stripe_customer_id e stripe_setup_intent_id na reserva
   d. Retorna { clientSecret }

3. Frontend:
   a. Renderiza <PaymentElement /> com clientSecret
   b. Ao submeter: stripe.confirmSetup({ elements, confirmParams })
   c. Stripe valida cartão e salva payment method

4. Webhook setup_intent.succeeded:
   a. Atualiza reserva com stripe_payment_method_id
```

### Fluxo No-Show (Cobrança)

```
1. Admin clica "Cobrar No-Show" na reserva
2. Frontend chama POST /api/stripe/charge-no-show
   Body: { reservationId, amount? }

3. Backend:
   a. Busca reserva com stripe_customer_id e stripe_payment_method_id
   b. Cria PaymentIntent com:
      - amount: valor da taxa (settings ou override)
      - customer: stripe_customer_id
      - payment_method: stripe_payment_method_id
      - off_session: true
      - confirm: true
   c. Registra em no_show_charges
   d. Atualiza reserva: no_show_charged = true

4. Webhook payment_intent.succeeded / payment_intent.payment_failed:
   a. Atualiza status em no_show_charges
```

### Webhook Handler
- Endpoint: `POST /api/stripe/webhook`
- Verificar assinatura com `stripe.webhooks.constructEvent(body, sig, secret)`
- Eventos tratados:
  - `setup_intent.succeeded`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Usar `export const runtime = 'nodejs'` (não edge, para acessar raw body)

### Tratamento de Erros
- SetupIntent falha: mostrar erro do Stripe no formulário, permitir retry
- PaymentIntent falha: registrar em no_show_charges com status 'failed' e error_message
- Webhook inválido: retornar 400, logar warning

---

## Resend

### Propósito
- Envio de emails transacionais usando React Email templates
- Emails no idioma preferido do cliente (PT/EN/ES)
- Admin sempre recebe notificações em PT

### Variáveis de Ambiente
```env
RESEND_API_KEY=                   # Chave de API (server only)
RESEND_FROM_EMAIL=                # Endereço remetente (ex: reservas@seudominio.com)
ADMIN_NOTIFICATION_EMAIL=         # Email do restaurante para notificações (fallback: RESEND_FROM_EMAIL)
```

### Arquitetura

```
src/lib/resend.ts                        # Singleton: new Resend(RESEND_API_KEY)
src/lib/email-translations.ts            # Strings i18n tipadas (PT/EN/ES) por tipo de email
src/lib/email-templates/
  confirmation.tsx                       # Template de confirmação de reserva
  cancellation.tsx                       # Template de cancelamento
  no-show-charge.tsx                     # Template de cobrança no-show
  admin-notification.tsx                 # Template de notificação interna (PT fixo)
src/services/email-service.ts            # 4 funções de envio (não-bloqueantes)
```

### Padrão de Uso

**Singleton** (`src/lib/resend.ts`)
```typescript
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY!);
```

**Envio via service** (`src/services/email-service.ts`)
```typescript
import { render } from '@react-email/components';
import React from 'react';

const html = await render(React.createElement(ConfirmationEmail, props));
await resend.emails.send({ from, to, subject, html });
```

> **Importante**: Usar `React.createElement` + `render()` para gerar HTML — não `react` prop do Resend. Os templates usam **inline styles** (não Tailwind), requisito do React Email para compatibilidade entre clientes de email.

### Gatilhos

| Evento | Função | Destinatário |
|--------|--------|--------------|
| Reserva criada (`POST /api/reservations`) | `sendConfirmationEmail` | Cliente |
| Reserva criada (`POST /api/reservations`) | `sendAdminNotificationEmail` | Admin (`ADMIN_NOTIFICATION_EMAIL`) |
| Cancelamento pelo cliente (`POST /api/reservations/cancel`) | `sendCancellationEmail` | Cliente |
| No-show cobrado (`POST /api/stripe/charge-no-show`) | `sendNoShowChargeEmail` | Cliente |

### Localização

- `locale: "pt" | "en" | "es"` vem do campo `reservations.locale` (copiado de `customers.preferred_locale` no momento da reserva)
- Strings centralizadas em `src/lib/email-translations.ts` — objeto `emailTranslations[locale]`
- Template admin (`admin-notification.tsx`) usa sempre PT, não recebe `locale`

### Tratamento de Erros

Todos os `sendXxxEmail` fazem `try/catch` interno — erros são logados (`console.error`) mas **não relançados**. A operação principal (criação de reserva, cancelamento, cobrança) conclui normalmente mesmo que o email falhe.

### Configuração de Desenvolvimento

```env
# Sem domínio verificado no Resend, usar:
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=onboarding@resend.dev
# Destinatários devem ser o email cadastrado na conta Resend
```

### Pré-requisitos para Produção

1. Verificar domínio no painel Resend (adicionar registros DNS)
2. Trocar `RESEND_FROM_EMAIL` para email do domínio verificado (ex: `reservas@seudominio.com`)
3. Configurar `ADMIN_NOTIFICATION_EMAIL` com o email operacional do restaurante

---

## Dependências npm

| Pacote | Versão | Propósito | Fase |
|--------|--------|-----------|------|
| `@supabase/ssr` | latest | Client Supabase para App Router | 4 |
| `@supabase/supabase-js` | latest | Client base do Supabase | 4 |
| `stripe` | latest | SDK server-side do Stripe | 5 |
| `@stripe/stripe-js` | latest | SDK client-side do Stripe | 5 |
| `@stripe/react-stripe-js` | latest | Componentes React do Stripe | 5 |
| `resend` | latest | SDK do Resend | 6 |
| `@react-email/components` | latest | Componentes para templates de email | 6 |
