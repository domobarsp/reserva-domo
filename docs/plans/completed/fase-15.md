# Fase 15 — Produção & Deploy

> Design spec aprovado em 2026-03-29

## Objetivo

Preparar o sistema para produção: corrigir vulnerabilidades de segurança, otimizar performance, adicionar robustez (error boundaries, rate limiting, double-booking prevention) e criar guia completo de deploy para migração de serviços para a conta do cliente.

## Escopo: MVP Seguro

Foco nos items CRITICAL e HIGH da auditoria, sem over-engineering. Não inclui audit logging, CAPTCHA, ou refatoração profunda de RLS policies intencionalmente permissivas.

---

## 1. Fix crypto — password generation

**Arquivo:** `src/app/admin/(authenticated)/acessos/actions.ts`

Trocar `Math.random()` por `crypto.getRandomValues()` na função `resetAdminUserPassword()`:

```typescript
const array = new Uint8Array(12);
crypto.getRandomValues(array);
const temporaryPassword = Array.from(array, (b) => chars[b % chars.length]).join("");
```

## 2. Double-booking prevention

**Arquivo novo:** `supabase/migrations/008_atomic_reservation.sql`

Criar função SQL `create_reservation_atomic()` que:
- Recebe todos os parâmetros da reserva (customer data + reservation data)
- Dentro de uma transaction, verifica capacidade restante (`SELECT ... FOR UPDATE` nas capacity_rules)
- Insere customer + reservation atomicamente
- Retorna erro se capacidade excedida
- Retorna reservation_id e cancellation_token em caso de sucesso

**Arquivo modificado:** `src/app/api/reservations/route.ts`

Substituir o fluxo check-then-insert por uma chamada `supabase.rpc('create_reservation_atomic', {...})`.

## 3. Rate limiting nas API routes públicas

**Arquivo novo:** `src/lib/rate-limit.ts`

Helper simples com Map em memória (adequado para Vercel serverless — cada instância tem seu Map, limita bursts na mesma instância):

```typescript
export function rateLimit(options: { interval: number; uniqueTokenPerInterval: number }): {
  check: (limit: number, token: string) => Promise<void>;
}
```

**Arquivos modificados:**
- `src/app/api/reservations/route.ts` — 5 req/min por IP
- `src/app/api/reservations/cancel/route.ts` — 10 req/min por IP
- `src/app/api/availability/route.ts` — 30 req/min por IP
- `src/app/api/stripe/setup-intent/route.ts` — 5 req/min por IP

Retorna `429 Too Many Requests` quando excedido.

## 4. Security headers

**Arquivo modificado:** `next.config.ts`

```typescript
headers: async () => [{
  source: '/:path*',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com" },
  ],
}]
```

## 5. Error boundaries

**Arquivos novos:**
- `src/app/error.tsx` — error boundary genérico (client component, UI amigável com botão "Tentar novamente")
- `src/app/global-error.tsx` — fallback de último recurso (HTML mínimo)
- `src/app/admin/(authenticated)/error.tsx` — error boundary admin (com link para dashboard)

## 6. SEO básico

**Arquivo modificado:** `src/app/layout.tsx` — metadata export com title, description, Open Graph

**Arquivos novos:**
- `src/app/robots.ts` — robots.txt dinâmico (Allow /, Disallow /admin)
- `src/app/sitemap.ts` — sitemap com rotas públicas (/, /reserva)
- `public/og-image.png` — imagem OG placeholder (ou gerada)

## 7. Env validation

**Arquivo novo:** `src/lib/env.ts`

Valida na importação que todas as env vars obrigatórias existem:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`

Importado no `src/app/layout.tsx` para falhar early em dev.

## 8. Supabase security fixes

**Arquivo novo:** `supabase/migrations/007_security_fixes.sql`

- Habilitar RLS em `reservation_edit_history` + policies (SELECT/INSERT para admins)
- `ALTER FUNCTION set_updated_at() SET search_path = public`
- `ALTER FUNCTION is_admin() SET search_path = public`
- Restringir `reservation_status_history_insert_public` para admins apenas

**No guia de deploy:** instruir para habilitar "Leaked Password Protection" no dashboard Supabase.

## 9. Performance fixes

**Email non-blocking:** Em `src/app/api/reservations/route.ts`, remover `await` das chamadas de email. Usar fire-and-forget:

```typescript
// Fire-and-forget — não bloqueia o response
Promise.all([
  sendConfirmationEmail({...}),
  sendAdminNotificationEmail({...}),
]).catch(console.error);
```

**Recharts dynamic import:** Usar `next/dynamic` com `ssr: false` em:
- `src/app/admin/(authenticated)/dashboard/page.tsx` — importar `ReservationsChart` dinamicamente
- `src/app/admin/(authenticated)/relatorios/page.tsx` — importar os 2 chart components dinamicamente

**Dashboard over-fetch:** Remover campos não usados do retorno de `getDashboardData()` em `src/app/admin/(authenticated)/dashboard/actions.ts`.

**Acessos waterfall:** Eliminar chamada redundante `supabase.auth.getUser()` em `src/app/admin/(authenticated)/acessos/page.tsx`, reutilizar `adminUser.id`.

## 10. Guia de deploy

**Arquivo novo:** `docs/DEPLOY.md`

Seções:
1. **Pré-requisitos** — contas necessárias (Vercel, Supabase, Stripe, Resend)
2. **Supabase — Nova instância**
   - Criar projeto
   - Copiar URL + anon key + service role key
   - Rodar migrations (`supabase db push --linked`)
   - Criar primeiro admin user (SQL manual)
   - Habilitar Leaked Password Protection
   - Configurar backup retention
3. **Stripe — Nova conta**
   - Criar conta
   - Copiar publishable key + secret key
   - Criar webhook endpoint → URL de produção + `/api/stripe/webhook`
   - Eventos a escutar: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copiar webhook secret
4. **Resend — Nova conta**
   - Criar conta + verificar domínio (ou usar onboarding domain)
   - Copiar API key
   - Configurar `ADMIN_NOTIFICATION_EMAIL`
5. **Vercel — Deploy (3 opções)**
   - **Opção A: Via repositório Git (recomendado)** — Conectar repo GitHub/GitLab, Vercel faz deploy automático em cada push
   - **Opção B: Via Vercel CLI** — `npm i -g vercel && vercel --prod` no terminal, interativo
   - **Opção C: Upload manual** — Fazer build local (`npm run build`), subir arquivos via dashboard Vercel (se suportado) ou usar `vercel deploy --prebuilt`
   - Para todas as opções: configurar variáveis de ambiente (lista completa com descrição de cada uma)
   - Verificar URL de produção
6. **Pós-deploy checklist**
   - Testar fluxo completo de reserva
   - Testar cancelamento via link
   - Testar login admin
   - Testar cobrança no-show (modo test)
   - Verificar emails
   - Verificar webhook Stripe
7. **Domínio customizado (futuro)**
   - Como adicionar domínio na Vercel
   - Configurar DNS (A record ou CNAME)
   - SSL automático
   - Atualizar URL no Stripe webhook

## Arquivos afetados (resumo)

| Arquivo | Ação |
|---------|------|
| `src/app/admin/(authenticated)/acessos/actions.ts` | Modify: crypto fix |
| `supabase/migrations/007_security_fixes.sql` | Create: RLS + search_path |
| `supabase/migrations/008_atomic_reservation.sql` | Create: double-booking prevention |
| `src/lib/rate-limit.ts` | Create: rate limiter |
| `src/app/api/reservations/route.ts` | Modify: atomic RPC + rate limit + email non-blocking |
| `src/app/api/reservations/cancel/route.ts` | Modify: rate limit |
| `src/app/api/availability/route.ts` | Modify: rate limit |
| `src/app/api/stripe/setup-intent/route.ts` | Modify: rate limit |
| `next.config.ts` | Modify: security headers |
| `src/app/error.tsx` | Create: error boundary |
| `src/app/global-error.tsx` | Create: global error boundary |
| `src/app/admin/(authenticated)/error.tsx` | Create: admin error boundary |
| `src/app/layout.tsx` | Modify: metadata + env import |
| `src/app/robots.ts` | Create: robots.txt |
| `src/app/sitemap.ts` | Create: sitemap |
| `src/lib/env.ts` | Create: env validation |
| `src/app/admin/(authenticated)/dashboard/page.tsx` | Modify: dynamic import chart |
| `src/app/admin/(authenticated)/dashboard/actions.ts` | Modify: remove over-fetch |
| `src/app/admin/(authenticated)/relatorios/page.tsx` | Modify: dynamic import charts |
| `src/app/admin/(authenticated)/acessos/page.tsx` | Modify: remove redundant auth call |
| `docs/DEPLOY.md` | Create: guia completo de deploy |

## Critérios de aceitação

- [ ] Password generation usa `crypto.getRandomValues()`
- [ ] Criação de reserva é atômica (sem race condition)
- [ ] Rate limiting ativo em todas as rotas públicas
- [ ] Security headers configurados (CSP, X-Frame-Options, etc.)
- [ ] Error boundaries em app root e admin
- [ ] SEO: metadata, robots.txt, sitemap
- [ ] Env validation falha early se var faltando
- [ ] RLS habilitado em `reservation_edit_history`
- [ ] Functions com `search_path` fixo
- [ ] Emails não bloqueiam response da API
- [ ] Recharts carregado dinamicamente
- [ ] Dashboard não sobre-busca dados
- [ ] `docs/DEPLOY.md` completo com passo a passo
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros
