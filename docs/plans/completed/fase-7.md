# Fase 7 — Admin Features & UX

**Status**: `NOT STARTED`

> Plano detalhado derivado dos critérios de aceitação em `Phases.md` e dos requisitos de negócio em `ProjectScope.md`.

---

## Contexto

Fase 6 (Resend) concluída. Todos os fluxos principais funcionam com integrações reais (Supabase + Stripe + Resend). A Fase 7 foca em features operacionais do painel admin que aumentam a usabilidade do sistema no dia-a-dia do restaurante.

---

## Escopo Resumido

1. **Dashboard** — pills de período para expandir visão além do dia atual
2. **Passantes** — filtros (nome, data, telefone) para uso como registro de clientes
3. **Lista de Espera** — filtros similares aos de passantes
4. **Drawer de Detalhes — Reservas** — sheet lateral com dados completos + histórico de status
5. **Drawer de Detalhes — Passantes e Lista de Espera** — sheet lateral com dados do registro
6. **Controle de Acesso** — CRUD de admin users (convidar, ativar/desativar, alterar role)
7. **RBAC** — proteção de rotas e sidebar por role (staff sem acesso a configurações e acessos)

---

## Decisões Técnicas Pré-Planejamento

### Dashboard — Seletor de Período

- Período controlado via `searchParams` (`?period=today|week|15days`), default `today`
- `getDashboardData()` aceita o período e calcula o range de datas dinamicamente
- Stats adaptam labels ao contexto (ex: "Reservas no Período" vs "Reservas Hoje")
- Ocupação (%) faz sentido apenas para "Hoje" (single-day) — para multi-day, mostrar "Total de Pessoas" no lugar
- Tabela de reservas exibe coluna de Data quando período não é "Hoje"
- UI de pills como Client Component com `useTransition` para loading durante navegação

### Passantes e Lista de Espera — Filtros

- Mesmo padrão server-driven da página de Reservas: `searchParams` → filtragem no server
- Filtros: nome (ILIKE), data (date picker), telefone (ILIKE)
- `useTransition` no client para skeleton durante troca
- Actions atualizadas para aceitar filtros

### Drawers de Detalhes

- Componente `<Sheet>` do shadcn/ui (já instalado)
- Drawer de Reserva: busca `reservation_status_history` ao abrir (lazy — não buscado na listagem)
- Drawer de Lista de Espera: inclui ações rápidas (Acomodar / Remover) dentro do sheet
- Drawer de Passante: informações read-only (passantes não têm fluxo de status)
- Clicar em qualquer linha abre o drawer (toda a linha é clicável)

### Controle de Acesso

- Listagem: join `admin_users` ↔ `auth.users` via Supabase Admin Client (service role)
- Convite: `supabase.auth.admin.inviteUserByEmail()` → retorna user → insere em `admin_users`
- Roles do DB: `owner | manager | staff`
- UI simplifica para "Administrador" (owner/manager) e "Operador" (staff)
- Sem auto-rebaixamento: admin não pode desativar ou rebaixar a si mesmo

### RBAC — Role-Based Access Control

- `getCurrentAdminUser()` helper em `src/lib/queries/admin-users.ts` — reutilizável em Server Components
- Proteção aplicada nos Server Components das páginas protegidas (não no middleware)
  - Middleware continua verificando apenas autenticação
  - `/admin/configuracoes/*` e `/admin/acessos`: redirect para `/admin/dashboard` se role = 'staff'
- Sidebar: recebe `userRole` como prop, oculta links de Configurações e Acessos para staff
- Layout `(authenticated)/layout.tsx` busca o role uma vez e passa para o sidebar

---

## Tarefas

### T7.0 — Documentação inicial
- [ ] Criar `plans/current.md` com este plano (**já feito**)
- [ ] Registrar decisões técnicas desta fase no `DecisionLog.md`

---

### T7.1 — Dashboard: Seletor de Período

**Arquivos impactados**:
- `src/app/admin/(authenticated)/dashboard/page.tsx`
- `src/app/admin/(authenticated)/dashboard/actions.ts`
- `src/components/features/admin/dashboard/dashboard-stats.tsx`
- `src/components/features/admin/dashboard/today-reservations.tsx`
- `src/components/features/admin/dashboard/period-selector.tsx` *(novo)*

**Tarefas**:
- [ ] Criar tipo `DashboardPeriod = 'today' | 'week' | '15days'`
- [ ] Atualizar `getDashboardData(period)` para calcular range de datas por período:
  - `today`: apenas a data atual
  - `week`: hoje + próximos 6 dias (7 dias no total)
  - `15days`: hoje + próximos 14 dias (15 dias no total)
- [ ] Atualizar `DashboardData` — renomear `todayReservations` para `periodReservations` e adicionar `period` e `dateRange`
- [ ] Criar `<PeriodSelector>` client component com 3 pills (Hoje / Esta semana / Próximos 15 dias), `useTransition` para loading
- [ ] Atualizar `dashboard/page.tsx` para ler `searchParams.period` e passar para `getDashboardData()`
- [ ] Atualizar `<DashboardStats>` para adaptar labels por período:
  - `today`: labels atuais, card de Ocupação (%) mantido
  - `week`/`15days`: "Reservas no Período", sem card de Ocupação → substituir por "Pessoas no Período"
- [ ] Atualizar `<TodayReservations>` → renomear para `<PeriodReservations>`, adicionar coluna "Data" quando período ≠ 'today'
- [ ] Atualizar loading.tsx do dashboard para refletir novo layout

---

### T7.2 — Passantes: Filtros

**Arquivos impactados**:
- `src/app/admin/(authenticated)/passantes/page.tsx`
- `src/app/admin/(authenticated)/passantes/actions.ts`
- `src/components/features/admin/walk-ins/passantes-content.tsx`
- `src/components/features/admin/walk-ins/passantes-filters.tsx` *(novo)*

**Tarefas**:
- [ ] Atualizar `getWalkIns(filters?)` para aceitar `{ name?, date?, phone? }`:
  - `name`: ILIKE `%name%` em `customer_name`
  - `date`: filtro por `date(created_at)` ou campo separado (usar `created_at::date`)
  - `phone`: ILIKE `%phone%` em `customer_phone`
  - Ordenar por `created_at DESC`
- [ ] Criar `<PassantesFilters>` client component: input nome, date picker, input telefone, botão limpar
- [ ] Atualizar `passantes/page.tsx` para ler `searchParams` e passar filtros para `getWalkIns()`
- [ ] Atualizar `<PassantesContent>` para receber e exibir os filtros
- [ ] Adicionar `useTransition` + skeleton na troca de filtros
- [ ] Criar/atualizar `passantes/loading.tsx` com skeleton de tabela

---

### T7.3 — Lista de Espera: Filtros

**Arquivos impactados**:
- `src/app/admin/(authenticated)/lista-espera/page.tsx`
- `src/app/admin/(authenticated)/lista-espera/actions.ts`
- `src/components/features/admin/waitlist/lista-espera-content.tsx`
- `src/components/features/admin/waitlist/lista-espera-filters.tsx` *(novo)*

**Tarefas**:
- [ ] Atualizar `getWaitlistEntries(filters?)` para aceitar `{ name?, date?, phone? }`:
  - `name`: ILIKE em `customer_name`
  - `date`: filtro por `date(arrival_time)`
  - `phone`: ILIKE em `customer_phone`
  - Ordenar por `arrival_time DESC`
- [ ] Criar `<ListaEsperaFilters>` client component: input nome, date picker, input telefone, botão limpar
- [ ] Atualizar `lista-espera/page.tsx` para ler `searchParams` e passar filtros
- [ ] Atualizar `<ListaEsperaContent>` para receber e exibir os filtros
- [ ] Adicionar `useTransition` + skeleton na troca de filtros
- [ ] Criar/atualizar `lista-espera/loading.tsx` com skeleton de tabela

---

### T7.4 — Drawer de Detalhes: Reservas

**Arquivos impactados**:
- `src/components/features/admin/reservations/reservation-detail-drawer.tsx` *(novo)*
- `src/components/features/admin/reservations/reservation-table.tsx`
- `src/components/features/admin/reservations/reservas-page-content.tsx`
- `src/app/admin/(authenticated)/reservas/actions.ts`

**Tarefas**:
- [ ] Criar `getReservationDetails(id)` action: busca reserva com joins em customer + time_slot + accommodation_type + `reservation_status_history` (ordenado por created_at ASC)
- [ ] Criar `<ReservationDetailDrawer>` usando `<Sheet>` shadcn:
  - Seção "Cliente": nome completo, email, telefone, idioma preferido
  - Seção "Reserva": data, horário, acomodação, pessoas, source (online/admin/telefone), solicitações especiais
  - Seção "Pagamento" (condicional, se stripe_payment_method_id presente): badge cartão registrado, valor no-show, status cobrança
  - Seção "Histórico": linha do tempo de status (de → para, data/hora de cada transição)
  - Ações no rodapé: botão "Fechar"
- [ ] Atualizar `<ReservationTable>` para que cada linha tenha `onClick` que abre o drawer
- [ ] Atualizar `<ReservasPageContent>` para gerenciar estado do drawer (selectedReservationId)
- [ ] Lazy loading: busca os detalhes ao abrir (não pré-carregados na listagem)

---

### T7.5 — Drawer de Detalhes: Passantes

**Arquivos impactados**:
- `src/components/features/admin/walk-ins/walk-in-detail-drawer.tsx` *(novo)*
- `src/components/features/admin/walk-ins/passantes-content.tsx`

**Tarefas**:
- [ ] Criar `<WalkInDetailDrawer>` usando `<Sheet>` shadcn:
  - Exibe todos os campos do walk-in: nome, email, telefone, pessoas, horário de chegada, solicitações especiais
  - Read-only (walk-ins não têm fluxo de status)
  - Botão "Fechar"
- [ ] Atualizar `<WalkinTable>` para que cada linha tenha `onClick` que abre o drawer
- [ ] Atualizar `<PassantesContent>` para gerenciar estado do drawer (selectedWalkIn)

---

### T7.6 — Drawer de Detalhes: Lista de Espera

**Arquivos impactados**:
- `src/components/features/admin/waitlist/waitlist-detail-drawer.tsx` *(novo)*
- `src/components/features/admin/waitlist/lista-espera-content.tsx`
- `src/components/features/admin/waitlist/waitlist-table.tsx`

**Tarefas**:
- [ ] Criar `<WaitlistDetailDrawer>` usando `<Sheet>` shadcn:
  - Seção informações: nome, email, telefone, pessoas, horário de chegada, status badge, solicitações especiais
  - Seção ações (condicional, status = 'waiting'): botões "Acomodar" e "Remover" (sem dialog intermediário, apenas o drawer)
  - Após ação, fechar drawer e atualizar lista
- [ ] Atualizar `<WaitlistTable>` para que cada linha tenha `onClick` que abre o drawer
- [ ] Atualizar `<ListaEsperaContent>` para gerenciar estado do drawer (selectedEntry)

---

### T7.7 — Controle de Acesso: Listar Admin Users

**Arquivos impactados**:
- `src/app/admin/(authenticated)/acessos/page.tsx`
- `src/app/admin/(authenticated)/acessos/actions.ts` *(novo)*
- `src/components/features/admin/access/acessos-content.tsx` *(novo)*
- `src/components/features/admin/access/admin-users-table.tsx` *(novo)*

**Tarefas**:
- [ ] Criar `getAdminUsers()` action via Admin Client:
  - Lista `admin_users` do banco com join no email via `supabase.auth.admin.listUsers()` (correlacionar por id)
  - Retorna: id, display_name, email, role, is_active, created_at
- [ ] Criar `<AdminUsersTable>` com colunas: Nome, Email, Cargo, Status, Criado em, Ações
  - Badge de cargo: Proprietário (owner), Gerente (manager), Operador (staff)
  - Badge de status: Ativo (emerald) / Inativo (muted)
- [ ] Criar `<AcessosContent>` client component com tabela + header + CTA de convite
- [ ] Atualizar `acessos/page.tsx` para buscar dados e renderizar `<AcessosContent>`

---

### T7.8 — Controle de Acesso: Convidar Usuário

**Arquivos impactados**:
- `src/components/features/admin/access/invite-admin-dialog.tsx` *(novo)*
- `src/app/admin/(authenticated)/acessos/actions.ts`

**Tarefas**:
- [ ] Criar `inviteAdminUser({ email, displayName, role })` Server Action:
  - Usa `createAdminSupabaseClient().auth.admin.inviteUserByEmail(email)`
  - Ao receber o user retornado, insere em `admin_users` com `id`, `restaurant_id`, `role`, `display_name`
  - Trata error de email duplicado (usuário já existe)
- [ ] Criar `<InviteAdminDialog>` com campos: Email, Nome de exibição, Cargo (select: Proprietário/Gerente/Operador)
- [ ] Integrar dialog no `<AcessosContent>` com botão "Convidar Usuário"

---

### T7.9 — Controle de Acesso: Ativar/Desativar + Alterar Role

**Arquivos impactados**:
- `src/app/admin/(authenticated)/acessos/actions.ts`
- `src/components/features/admin/access/admin-users-table.tsx`

**Tarefas**:
- [ ] Criar `toggleAdminUserStatus({ id, is_active })` Server Action
- [ ] Criar `updateAdminUserRole({ id, role })` Server Action
- [ ] Adicionar dropdown de ações na tabela: "Ativar" / "Desativar" (toggle), "Alterar Cargo" (submenu ou dialog simples)
- [ ] Proteção: comparar `id` com o usuário autenticado atual — bloquear desativar/rebaixar a si mesmo
- [ ] Confirmar desativação com `<ConfirmDialog>` (componente já existente)

---

### T7.10 — RBAC: Proteção de Rotas por Role

**Arquivos impactados**:
- `src/lib/queries/admin-users.ts` *(novo — helper reutilizável)*
- `src/app/admin/(authenticated)/layout.tsx`
- `src/components/layout/admin-sidebar.tsx`
- `src/app/admin/(authenticated)/configuracoes/page.tsx` (e sub-páginas)
- `src/app/admin/(authenticated)/acessos/page.tsx`

**Tarefas**:
- [ ] Criar `getCurrentAdminUser()` em `src/lib/queries/admin-users.ts`:
  - Busca o usuário autenticado via `supabase.auth.getUser()`
  - Busca o registro em `admin_users` pelo `id`
  - Retorna `AdminUser | null`
- [ ] Atualizar `(authenticated)/layout.tsx` para chamar `getCurrentAdminUser()` e passar `userRole` para o sidebar
- [ ] Atualizar `<AdminSidebar>` para receber `userRole` prop e condicionar visibilidade dos links de Configurações e Acessos (`role === 'staff'` → ocultar)
- [ ] Atualizar `configuracoes/page.tsx` (hub): adicionar verificação de role no topo — se staff, redirect para `/admin/dashboard`
- [ ] Atualizar sub-páginas de configurações: mesma verificação (ou centralizar no layout de configurações se existir)
- [ ] Atualizar `acessos/page.tsx`: mesma verificação de role

---

### T7.11 — Documentação Final

**Tarefas**:
- [ ] Registrar no `DecisionLog.md` todas as decisões técnicas tomadas durante a fase
- [ ] Atualizar `CurrentState.md` com o que foi implementado
- [ ] Atualizar `Phases.md`: marcar Fase 7 como `COMPLETE`
- [ ] Mover este arquivo para `plans/completed/fase-7.md`
- [ ] Criar `plans/current.md` vazio para a Fase 8

---

## Critérios de Aceitação (do Phases.md)

- [ ] Dashboard com seletor de período funcional (Hoje / Esta semana / Próximos 15 dias)
- [ ] Passantes com filtros por nome, data e telefone
- [ ] Lista de Espera com filtros por nome, data e telefone
- [ ] Drawer de detalhes de reserva com dados do cliente e histórico de status
- [ ] Drawer de detalhes para passantes (read-only)
- [ ] Drawer de detalhes para lista de espera (com ações rápidas)
- [ ] Página de controle de acesso com CRUD de admin users
- [ ] Proteção de rotas e sidebar por role
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Ordem de Execução Recomendada

1. **T7.0** — Docs e decisões
2. **T7.10** — RBAC primeiro (fundação que afeta layout e todas as páginas protegidas)
3. **T7.7 + T7.8 + T7.9** — Controle de acesso (usa o RBAC recém criado)
4. **T7.1** — Dashboard período
5. **T7.2 + T7.3** — Filtros passantes e lista de espera (padrão análogo, podem ser feitos em paralelo conceitualmente)
6. **T7.4** — Drawer de reservas (mais complexo — inclui histórico de status)
7. **T7.5 + T7.6** — Drawers passantes e lista de espera
8. **T7.11** — Documentação final
