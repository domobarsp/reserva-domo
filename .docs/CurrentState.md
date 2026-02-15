# Estado Atual do Sistema

> Atualizado: 2026-02-15 | Fase: 4.6 (Design System) — COMPLETA

## O que funciona

- Documentação do projeto completa em `.docs/`
- CLAUDE.md aponta para Agents.md
- Projeto Next.js 15 com TypeScript, Tailwind CSS v4, shadcn/ui
- `npm run dev` roda sem erros
- `npx tsc --noEmit` sem erros
- `npm run lint` sem erros (warnings esperados do React Compiler + React Hook Form)
- Landing page com branding Domo e CTA para reserva
- Layout público (header + footer) para rotas `/reserva` e `/cancelar/[token]`
- Layout admin (sidebar + topbar responsivo) para todas as rotas `/admin/*`
- Navegação funcional entre todas as rotas
- API health check em `/api/health`
- Tipos TypeScript completos em `src/types/index.ts` (espelhando DatabaseSchema.md)
- Componentes shadcn/ui instalados: button, card, separator, sheet, badge, input, label, select, calendar, popover, radio-group, textarea, form, progress, sonner, table, dialog, dropdown-menu, alert-dialog, switch, checkbox, tooltip, skeleton

### Supabase (Fase 4)

- **Banco de dados**: 13 tabelas com migrations (`supabase/migrations/`), seed data, RLS policies
- **Autenticação admin**: Login com email/password via Supabase Auth, middleware de proteção, logout
- **Route group `(authenticated)/`**: Separa login (sem sidebar) de pages autenticadas (com sidebar)
- **Server Actions**: 9 arquivos de actions para todas as mutations admin
- **API Routes públicas**: `/api/availability`, `/api/reservations`, `/api/reservations/cancel`
- **Realtime**: Hook `useRealtimeSubscription` com subscriptions em reservations e waitlist_entries
- **Supabase clients**: Browser (`client.ts`), Server (`server.ts`), Admin/Service Role (`admin.ts`), Middleware helper (`middleware.ts`)

### Polish Pós-Supabase (Fase 4.5)

- **Redirect `/admin`**: `src/app/admin/page.tsx` redireciona para `/admin/dashboard`
- **Filtros via URL**: Filtros de reservas (data, status, acomodação) salvos em searchParams — `router.refresh()` do realtime preserva filtros ativos
- **Filtro de data**: Texto truncado para evitar overflow do botão
- **Horários HH:mm**: Função compartilhada `formatTime()` em `src/lib/utils.ts`, usada em 6 componentes
- **Select de horário**: Dialogs de criação/edição de reserva admin usam `<Select>` de time slots em vez de input livre
- **Loading states**: Skeletons via `loading.tsx` do Next.js em 6 páginas admin (dashboard, reservas, calendário, lista-espera, passantes, configurações)
- **Spinner no formulário**: Botão de submit mostra `Loader2` animado durante envio

### Design System (Fase 4.6)

- **Fundação**: Paleta Lime/Gray completa em `globals.css`, fonte Inter, border radius 0.45rem, baseColor gray
- **Tabelas**: Headers com `bg-muted/50`, padding generoso (`px-4 py-3.5`), uppercase tracking-wider, hover sutil
- **Status Badges**: Cores amber/emerald/rose (não yellow/green/red), pill-shaped (`rounded-full`), sem borda
- **Dashboard Stats**: Cards verticais com backgrounds coloridos diferenciados (primary/10, emerald-50, amber-50, violet-50), número grande
- **Sidebar**: Logo lime (`text-primary`), active state `bg-primary/10 text-primary font-medium`, ícones 18px
- **Calendário**: Cores emerald/amber/rose, ring primary no dia atual, hover ring primary/50, células arredondadas
- **Empty States**: Borda dashed (`border-dashed border-border/50`), ícone com opacity /50
- **Espaçamento**: Layout admin com padding `p-6 lg:p-8`, headers `text-2xl font-semibold`

### Formulário Público

- **Formulário de reserva multi-step funcional** (`/reserva`):
  - Step 1: seleção de data (calendar), horário (radio), acomodação (radio cards com capacidade), pessoas (select), solicitações especiais
  - Step 2: dados do cliente (nome, sobrenome, email, telefone, idioma)
  - Step 3: placeholder de cartão (condicional — aparece apenas em dias que exigem garantia)
  - Step 4: confirmação com resumo completo
  - Navegação avançar/voltar entre steps
  - Indicador visual de etapas (dinâmico: 3 ou 4 etapas conforme necessidade de cartão)
  - Validação Zod + React Hook Form em tempo real (mensagens em PT)
  - **Dados reais**: Disponibilidade via `/api/availability`, reserva via `/api/reservations`
  - **Persistência**: Reservas criadas são salvas no Supabase
- **Página de sucesso** (`/reserva/sucesso`):
  - Exibe ID real, detalhes da reserva (buscados do Supabase), link de cancelamento
- **Página de cancelamento** (`/cancelar/[token]`):
  - Server component busca reserva por token no Supabase (com joins em customer, time_slot, accommodation)
  - Client component para o botão de cancelar (POST `/api/reservations/cancel`)
  - Trata reserva não encontrada e já cancelada

### Lógica de Disponibilidade

- **Funções parametrizadas** (`src/lib/availability.ts`):
  - Cálculo de vagas restantes (max_covers - reservas ativas)
  - Horários disponíveis por dia da semana
  - Verificação de datas fechadas (exception_dates)
  - Verificação de garantia de cartão (override por data > regra por dia da semana)
  - Janela de booking configurável
- **Schemas de validação** (`src/lib/validations/reservation.ts` + `admin.ts`):
  - reservationInfoSchema, customerInfoSchema, fullReservationSchema
  - adminReservationSchema, editReservationSchema, waitlistEntrySchema, walkInSchema, timeSlotSchema, accommodationTypeSchema, capacityRuleSchema, exceptionDateSchema

### Painel Admin

- **Dashboard** (`/admin/dashboard`):
  - 4 cards de estatísticas: Reservas hoje, Confirmadas, Pendentes, Ocupação (%)
  - Tabela compacta de reservas do dia ordenada por horário
  - **Realtime**: atualiza automaticamente quando reservas mudam
- **Gestão de Reservas** (`/admin/reservas`):
  - Tabela completa com colunas: Data, Horário, Cliente, Acomodação, Pessoas, Status, Ações
  - Filtros: Data (date picker), Status (select), Tipo de acomodação (select) — preservados via URL searchParams
  - Dropdown de status com transições válidas apenas
  - Dialog de criação manual (cliente + reserva, select de time slots, source admin/phone)
  - Dialog de edição com select de time slots e override de no-show fee
  - Suporte a deep-link `?date=YYYY-MM-DD&status=...&accommodation=...`
  - **Realtime**: atualiza automaticamente sem perder filtros
  - **Persistência**: Todas as operações CRUD persistem no Supabase
- **Calendário Visual** (`/admin/calendario`):
  - Grid mensal 7 colunas customizado
  - Cada célula: número do dia, contagem de reservas, total covers
  - Cor por nível de ocupação: verde (≤50%), amarelo (51-80%), vermelho (81-100%), cinza (fechado)
  - Navegação mês anterior/próximo
  - Clique no dia → navega para `/admin/reservas?date=YYYY-MM-DD`
  - **Realtime**: atualiza automaticamente
- **Lista de Espera** (`/admin/lista-espera`):
  - Tabela: Chegada, Nome, Telefone, Pessoas, Status, Ações
  - Dialog de criação com validação
  - Ações: Acomodar (→seated), Remover (→removed) para entradas waiting
  - **Realtime**: atualiza automaticamente
- **Passantes** (`/admin/passantes`):
  - Tabela: Horário, Nome, Telefone, Email, Pessoas, Solicitações
  - Dialog de criação com validação
- **Configurações** (`/admin/configuracoes/*`):
  - Hub com cards de navegação para 6 sub-páginas
  - Horários: CRUD de time slots (nome, início, fim, dias da semana, ativo)
  - Acomodações: CRUD (nome, descrição, min/max lugares, ordem, ativo)
  - Capacidade: CRUD de regras (acomodação × horário × max covers)
  - Garantia com Cartão: 7 checkboxes para dias da semana
  - Taxa de No-Show: Campo R$ com conversão centavos
  - Exceções: CRUD complexo (data, fechamento, motivo, overrides de cartão/no-show/capacidade)
  - **Todas as configurações persistem no Supabase**

### Helpers e Componentes

- **Helpers de status** (`src/lib/status-transitions.ts`):
  - Transições válidas de reserva: pending→confirmed/cancelled, confirmed→seated/no_show/cancelled, seated→complete/no_show
  - Labels e cores para badges de status (reserva e waitlist)
- **Utilitários** (`src/lib/utils.ts`):
  - `cn()` — merge de classes Tailwind
  - `formatTime()` — formata horário para HH:mm
- **Componentes compartilhados**:
  - `ReservationStatusBadge`, `WaitlistStatusBadge` — badges coloridos por status
  - `ConfirmDialog` — dialog de confirmação reutilizável (default/destructive)
  - `EmptyState` — estado vazio para tabelas com ícone, título, descrição

## O que está mockado

- Step 3 (cartão) é visual placeholder — integração Stripe na Fase 5
- Email de confirmação na página de sucesso é placeholder (badge "Mock — email real na Fase 6")

## O que não existe ainda

- Integração Stripe (Fase 5)
- Integração Resend (Fase 6)
- Admin Features & UX (Fase 7)
- UI Polish & Padronização (Fase 8)
- Relatórios e Produção (Fase 9)

## Issues Conhecidas

- Warnings do React Compiler sobre `form.watch()` do React Hook Form (esperado, não afeta funcionalidade)

## Próximos Passos

Fase 5 — Integração Stripe: SetupIntent para captura condicional de cartão, Payment Element no formulário, cobrança de no-show via PaymentIntent, webhook handler.
