# Fase 4 — Integração Supabase

**Status**: `COMPLETE`
**Início**: 2026-02-13

---

## Grupo 1 — Infraestrutura ✅
- [x] 1.1 Instalar pacotes `@supabase/ssr` e `@supabase/supabase-js`
- [x] 1.2 Criar browser client (`src/utils/supabase/client.ts`)
- [x] 1.3 Criar server client (`src/utils/supabase/server.ts`)
- [x] 1.4 Criar admin client (`src/utils/supabase/admin.ts`)
- [x] 1.5 Criar middleware helper (`src/utils/supabase/middleware.ts`)
- [x] 1.6 Verificar `.env.local` configurado pelo usuário
- [x] **Checkpoint**: `npm run dev` e `npx tsc --noEmit` passam

## Grupo 2 — Banco de Dados ✅
- [x] 2.1 Criar migration schema (`supabase/migrations/001_initial_schema.sql`)
- [x] 2.2 Criar migration RLS (`supabase/migrations/002_rls_policies.sql`)
- [x] 2.3 Criar seed data (`supabase/seed.sql`)
- [x] 2.4 Aplicar migrations e seed no Supabase
- [x] **Checkpoint**: 13 tabelas visíveis no Dashboard com dados seed

## Grupo 3 — Autenticação ✅
- [x] 3.1 Reestruturar rotas admin com route group `(authenticated)/`
- [x] 3.2 Criar middleware Next.js (`src/middleware.ts`)
- [x] 3.3 Implementar login real (`src/app/admin/login/page.tsx`)
- [x] 3.4 Adicionar logout no topbar
- [x] **Checkpoint**: Auth flow completo funcionando

## Grupo 4 — Server Actions Admin ✅
- [x] 4.1 Criar tipo `ActionResult` (`src/lib/actions/types.ts`)
- [x] 4.2 Criar helper `getRestaurantId` (`src/lib/queries/restaurant.ts`)
- [x] 4.3 Actions de reservas
- [x] 4.4 Actions de dashboard
- [x] 4.5 Actions de lista de espera
- [x] 4.6 Actions de passantes
- [x] 4.7 Actions de horários
- [x] 4.8 Actions de acomodações
- [x] 4.9 Actions de capacidade
- [x] 4.10 Actions de exceções
- [x] 4.11 Actions de settings
- [x] 4.12 Mover input types para `src/types/index.ts`
- [x] **Checkpoint**: Actions funcionam com dados do Supabase

## Grupo 5 — Migração Pages Admin ✅
- [x] 5.1 Remover AdminDataProvider do `admin-providers.tsx`
- [x] 5.2 Migrar Dashboard
- [x] 5.3 Migrar Reservas
- [x] 5.4 Migrar Lista de Espera
- [x] 5.5 Migrar Passantes
- [x] 5.6 Migrar Calendário
- [x] 5.7 Migrar Config: Horários
- [x] 5.8 Migrar Config: Acomodações
- [x] 5.9 Migrar Config: Capacidade
- [x] 5.10 Migrar Config: Exceções
- [x] 5.11 Migrar Config: No-Show
- [x] 5.12 Migrar Config: Garantia Cartão
- [x] 5.13 Deletar `admin-data-context.tsx` (pendente para Grupo 9)
- [x] **Checkpoint**: Admin completo com Supabase, CRUD persiste

## Grupo 6 — API Routes Públicas ✅
- [x] 6.1 API de disponibilidade (`/api/availability`)
- [x] 6.2 API de criação de reserva (`/api/reservations`)
- [x] 6.3 API de cancelamento (`/api/reservations/cancel`)
- [x] **Checkpoint**: Endpoints criados e tsc passa

## Grupo 7 — Migração Pages Públicas ✅
- [x] 7.1 Migrar formulário de reserva
- [x] 7.2 Migrar página de sucesso
- [x] 7.3 Migrar página de cancelamento
- [x] 7.4 Limpar availability.ts (remover wrappers mock)
- [x] **Checkpoint**: Fluxo público E2E funcional

## Grupo 8 — Realtime ✅
- [x] 8.1 Habilitar Realtime nas tabelas (migration SQL)
- [x] 8.2 Criar hook `useRealtimeSubscription`
- [x] 8.3 Adicionar realtime às pages admin (Dashboard, Reservas, Lista de Espera, Calendário)
- [x] **Checkpoint**: Mudanças aparecem sem refresh manual

## Grupo 9 — Cleanup e Docs ✅
- [x] 9.1 Deletar `mock-data.ts` e `admin-data-context.tsx`
- [x] 9.2 Limpar diretórios vazios (`src/contexts/`)
- [x] 9.3 Verificação final (`tsc` ✅, `lint` ✅ — 0 erros, 28 warnings preexistentes)
- [x] 9.4 Atualizar docs (CurrentState, Phases, DecisionLog)
