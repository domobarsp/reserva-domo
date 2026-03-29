# Estado Atual do Sistema

> Atualizado: 2026-03-29 | Fase: 13 (Refinamento — Lista de Espera & Passantes) — CONCLUÍDA

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
  - Canal com nome único por instância (sufixo aleatório) — evita conflito entre abas/páginas
  - Callback via `useRef` — evita re-subscrição ao trocar referência da função
  - `REPLICA IDENTITY FULL` nas tabelas (`004_replica_identity.sql`) — obrigatório para eventos UPDATE/DELETE funcionarem com RLS ativo
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

### Refinamentos UX/UI (Fase 4.7 — CONCLUÍDA)

- **Dashboard Big Numbers**: cards redesenhados com superficie branca completa (sem faixas), borda visivel, raio maior, proporcao mais compacta, hierarquia de conteudo (label, valor, insight, texto auxiliar) e chip colorido de contexto
- **Dashboard loading**: skeleton dos cards atualizado para refletir a nova estrutura visual
- **Reservas server-driven**: filtros (data/status/acomodacao) agora sao aplicados no server via `searchParams` em `page.tsx`
- **Loading ao filtrar**: troca de filtros em `/admin/reservas` agora usa estado pending + skeleton da tabela durante a transicao
- **Controles durante transicao**: filtros e CTA principal recebem `disabled`/`aria-busy` enquanto os dados filtrados carregam
- **Regressao de status corrigida**: mudancas de status (ex.: cancelado) agora refletem automaticamente na listagem sem reload manual, com atualizacao otimista local + refresh em transicao acionado por realtime e por mutation
- **Consistencia visual**: header de reservas padronizado para `font-semibold`, tabela de reservas com container `rounded` + borda sutil, e espacamentos harmonizados com dashboard

### Formulário Público

- **Formulário de reserva multi-step funcional** (`/reserva`):
  - Step 1: seleção de data (calendar auto-close), horário (radio cards), acomodação (radio cards), pessoas (incrementer +/-), solicitações especiais
  - Step 2: dados do cliente (nome, sobrenome, email, telefone, idioma)
  - Step 3: garantia com cartão Stripe (condicional)
  - Step 4: confirmação com resumo em boxes uniformes + aceite de termos
  - Navegação com labels dinâmicos por etapa ("Continuar", "Continuar para garantia", "Revisar reserva", "Confirmar e finalizar")
  - Indicador visual de etapas: barra `h-1` flush ao header, `bg-primary/60` para etapas completas
  - Validação Zod + React Hook Form em tempo real (mensagens em PT)
  - **Dados reais**: Disponibilidade via `/api/availability`, reserva via `/api/reservations`
  - **Persistência**: Reservas criadas são salvas no Supabase
- **Página de sucesso** (`/reserva/sucesso`):
  - Mesma identidade visual do formulário: logo + card com header `bg-accent` (verde claro) + detalhes no body
  - Header: ícone ✓ + "Sua mesa está reservada." + subtítulo dinâmico com data e hora
  - Body: bloco "Detalhes da reserva", divisor, bloco "Reserva em nome de", confirmação de email, mensagem de acolhimento
  - Box de cancelamento separado abaixo do card principal
- **Página de cancelamento** (`/cancelar/[token]`):
  - Mesma identidade visual: logo + card com header
  - 4 estados visuais distintos:
    - Não encontrado: `bg-muted` header + `AlertCircle`
    - Já cancelada: `bg-muted` header + `Info`
    - Cancelada nesta sessão: `bg-accent` header + `CheckCircle2`
    - Confirmar cancelamento: `bg-muted` header + `XCircle` + aviso parchment/dourado + botões dentro do card

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

### Stripe (Fase 5 — CONCLUÍDA)

- **SetupIntent**: `POST /api/stripe/setup-intent` — cria/busca Stripe Customer por email e retorna `clientSecret`
- **StepCardStripe** (`step-card-stripe.tsx`): substitui placeholder, busca `clientSecret` na montagem, renderiza `<Elements>` + `<PaymentElement>`, expõe `triggerRef` para o pai acionar `confirmSetup`
- **reservation-form.tsx**: integra `confirmSetup({ redirect: 'if_required' })` no step de cartão; captura `paymentMethodId` do resultado client-side; passa `stripe_customer_id` + `stripe_payment_method_id` no submit da confirmação
- **`/api/reservations`**: aceita e persiste campos Stripe opcionais via `apiReservationSchema` (extensão de `fullReservationSchema`)
- **Cobrança no-show**: `POST /api/stripe/charge-no-show` (autenticada via sessão Supabase) — resolve valor por prioridade (reserva > exceção de data > global), cria PaymentIntent `off_session`, registra em `no_show_charges`, atualiza `reservations.no_show_charged`
- **Webhook**: `POST /api/stripe/webhook` com `runtime = 'nodejs'` — trata `payment_intent.succeeded` e `payment_intent.payment_failed`; NÃO trata `setup_intent.succeeded` (desnecessário, payment_method_id capturado client-side)
- **Admin UI — indicadores de cartão**: coluna sem título na tabela de reservas com ícones tooltipados:
  - `CreditCard` muted — cartão registrado como garantia
  - `CreditCard` amber — no-show pendente de cobrança
  - `CheckCircle2` emerald (+ valor no tooltip) — no-show cobrado
- **Admin UI — ação de cobrança**: item "Cobrar No-Show" no dropdown de ações (condicional: `status === no_show && hasCard && !no_show_charged`)
- **`ChargeNoShowDialog`**: dialog rico com resumo da reserva (cliente, data, hora, pessoas), valor a cobrar e banner de aviso sobre irreversibilidade — substitui `window.confirm`
- **Loading por linha no status**: `StatusDropdown` recebe `isLoading` prop; mostra `Loader2` animado no lugar do `ChevronDown` enquanto a Server Action está em andamento; linha permanece interativa individualmente
- **`src/utils/stripe/client.ts`**: instância Stripe server-side

### Resend (Fase 6)

- **Singleton Resend** em `src/lib/resend.ts`
- **Traduções i18n** PT/EN/ES em `src/lib/email-translations.ts`
- **Templates React Email** (inline styles) em `src/lib/email-templates/`: confirmation, cancellation, no-show-charge, admin-notification
- **Email service** em `src/services/email-service.ts` — 4 funções não-bloqueantes
- **Gatilhos**: confirmação + notif admin ao criar reserva, cancelamento ao cancelar via link, cobrança no-show ao cobrar
- **Locale do cliente**: emails enviados no idioma escolhido (PT/EN/ES); admin sempre em PT
- **ADMIN_NOTIFICATION_EMAIL** configurado em `.env.local`
- Badge "Mock — email real na Fase 6" removido da página `/reserva/sucesso`

## O que está mockado

Nada — todos os fluxos principais estão funcionando com integrações reais.

### Admin Features & UX (Fase 7)

- **RBAC**: `getCurrentAdminUser()` em `src/lib/queries/admin-users.ts`, layout autenticado busca role e passa para sidebar/topbar; staff não vê Configurações; apenas owner vê Acessos
- **Configurações protegidas**: `src/app/admin/(authenticated)/configuracoes/layout.tsx` redireciona staff para `/admin/dashboard`
- **Controle de Acesso** (`/admin/acessos`): exclusivo para `owner`; lista de admin_users; criação via login+senha (`{login}@domo.local`, sem email real); ativar/desativar, alterar cargo; proteção anti-auto-rebaixamento
- **Login por usuário**: tela de login aceita usuário simples (`joao.silva`) ou email completo; sufixo `@domo.local` acrescentado automaticamente se não houver `@`
- **Desativação força logout imediato**: middleware verifica `is_active` em toda request; usuário desativado é redirecionado para `/admin/logout` (Route Handler que faz `signOut()`) em qualquer navegação, sem precisar de reload
- **Dashboard período**: pills "Hoje / Esta semana / Próximos 15 dias" via `searchParams.period`; `getDashboardData(period)` com range de datas; card Ocupação (%) substituído por "Pessoas no Período" em multi-day; tabela com coluna Data para períodos >1 dia
- **Passantes — Filtros**: filtros nome/data/telefone server-driven via `searchParams`; `<TableFilters>` componente compartilhado; skeleton com `useTransition`
- **Lista de Espera — Filtros**: idem passantes
- **Drawer de Detalhes — Reservas**: `<ReservationDetailDrawer>` com cabeçalho fixo, corpo scrollável (cliente, solicitações, garantia Stripe, histórico de status) e rodapé fixo com ações (mudar status, cobrar no-show inline); lazy-loaded
- **Drawer de Detalhes — Passantes**: `<WalkInDetailDrawer>` read-only com mesmo padrão visual (cabeçalho fixo, corpo scrollável)
- **Drawer de Detalhes — Lista de Espera**: `<WaitlistDetailDrawer>` com ações rápidas (Acomodar/Remover) no rodapé fixo para entradas `waiting`

### Relatórios (Fase 8)

- **Página `/admin/relatorios`**: dados reais do Supabase, seletor de período (7d/30d/90d/custom via searchParams)
- **KPI Cards com delta comparativo**: Total Reservas, Total Covers, Taxa No-Show, Taxa Cancelamento — cada card exibe ↑/↓ % vs. período anterior
- **BarChart (Recharts via shadcn chart)**: reservas por dia do período, com tooltip de data + reservas + covers
- **Donut Chart (Recharts via shadcn chart)**: distribuição por status com legenda e percentuais
- **Tabela de Acomodações**: total de reservas, covers, no-shows e taxa de no-show por acomodação
- **Exportação CSV**: `GET /api/relatorios/export?start=X&end=Y` — autenticado via sessão Supabase, UTF-8 BOM para Excel
- **loading.tsx**: skeleton completo (header, pills, 4 cards, 2 gráficos, tabela)
- **Biblioteca**: `recharts` instalada via `npx shadcn add chart` — `src/components/ui/chart.tsx`
- **Server Actions**: `getReportData(startDate, endDate)` em `relatorios/actions.ts` — computa KPIs, byDay, byStatus, byAccommodation e previousKPIs para comparativo

### Refinamento Visual — Home & Formulário (Fase 9 — CONCLUÍDA)

- **Tokens globais atualizados** (`globals.css`):
  - `--primary`: verde escuro `oklch(0.270 0.055 162)` (#1F3A34)
  - `--background`: off-white quente `oklch(0.970 0.008 75)` (#F6F3EE)
  - `--muted`: `oklch(0.925 0.015 75)` — mais escuro/quente para contraste do header do card
  - `--accent`: verde claro `oklch(0.930 0.015 162)` — usado como bg de header em estados de sucesso
  - `--highlight`: terracota `oklch(0.600 0.095 28)` — token decorativo (não usado em superfícies)
  - `--radius`: 0.75rem
  - `cursor: pointer` global em elementos interativos
- **Padrão de card público**: `Card py-0 gap-0 overflow-hidden rounded-2xl` com:
  - Header `bg-muted` ou `bg-accent` (conforme estado): eyebrow "Reservas online" + ícone + título + subtítulo
  - Barra de progresso `h-1` flush ao header (apenas no formulário)
  - `CardContent pt-X pb-6` para o conteúdo
- **Skeletons**: `bg-muted animate-pulse` (cor quente, não cinza frio)
- **Incrementer de pessoas**: botões `rounded-full variant="outline"` substituem `<Select>`
- **Cards de seleção** (horário, acomodação): `bg-white` explícito, estado selecionado `ring-[1.5px] ring-primary bg-primary/[6%]`
- **Badge de vagas**: `bg-emerald-50 text-emerald-700` / `bg-amber-50` para poucas vagas
- **Aviso de garantia** (step de cartão): parchment/dourado `bg-[#FAF4E8] border-[#C9A96E]` — menos alarme, mais informação
- **Home** (`/`): redireciona para `/reserva`
- **Footer**: mantido com dados reais do restaurante (Server Component)

### Refinamento Visual — Admin Theme + Dashboard + Padronização (Fase 10 — CONCLUÍDA)

**Admin Theme Reset:**
- **Sidebar branca** (Notion/Figma-style): `--sidebar: #FFFFFF`, borda zinc-200, texto zinc-600, item ativo zinc-100+zinc-900; Logo "Domo" mantém `text-primary` (verde sobre branco)
- **Admin background zinc-100** (`#F4F4F5`): `bg-zinc-100` no wrapper do layout autenticado — bege `--background` preservado para páginas públicas
- **Topbar mobile-only**: `lg:hidden`; desktop sem topbar
- **Sidebar footer**: avatar com iniciais, displayName, label de cargo, botão logout — layout autenticado extrai e passa `displayName` para sidebar e topbar

**Dashboard Redesign:**
- **5 cards de estatísticas**: Total, Confirmadas, Pendentes, Canceladas, Clientes Esperados — card pattern: `rounded-xl border bg-card p-5 shadow-sm`, label (muted) + valor (3xl bold) à esquerda, icon (h-10 w-10 rounded-lg) à direita
- **Gráfico de barras** (`ReservationsChart`): hoje em verde-escuro `#1F3A34`, outros dias zinc-300, LabelList acima das barras, legenda abaixo — visível apenas para períodos >1 dia
- **Microcopy contextual**: Cards "Confirmadas" e "Pendentes" com textos baseados no valor real (não fixo positivo)
- **Pill ativo chumbo**: `bg-zinc-800 text-white`; container `bg-zinc-200 border-zinc-300`
- **Empty state**: `CalendarX2` + texto contextual por período
- **Responsividade**: colunas "Pessoas" ocultas em `<640px`, "Acomodação" em `<768px`
- **Botão Nova Reserva**: no header do dashboard, ao lado do PeriodSelector

**Padronização visual (Relatórios como referência):**

Padrão adotado em todas as páginas admin:
- **Cards**: `rounded-xl border bg-card p-5 shadow-sm` — label+value esquerda, icon h-10 w-10 direita
- **Gráficos**: bare `div.rounded-xl border bg-card p-5 shadow-sm` + `div.mb-4 > h3 + p.muted`
- **Tabelas**: `overflow-hidden rounded-xl border bg-card shadow-sm` wrapping `<Table>`

Arquivos migrados para esse padrão: `dashboard-stats.tsx`, `reservations-chart.tsx`, `period-reservations.tsx`, `reservation-table.tsx`, `reservas-page-content.tsx` (loading), `waitlist-table.tsx`, `walkin-table.tsx`, `admin-users-table.tsx`, `capacity-table.tsx`, `accommodations-table.tsx`, `time-slots-table.tsx`, `exceptions-table.tsx`, `configuracoes/page.tsx`

Correções de tokens quentes em componentes shared:
- `table.tsx` TableHead: `bg-muted/50` → `bg-zinc-200`; row hover: `hover:bg-muted/30` → `hover:bg-zinc-50`

### Refinamento Visual — Calendário (Fase 11 — CONCLUÍDA)

- **Container unificado**: card `rounded-xl border bg-card shadow-sm overflow-hidden` com `CalendarHeader` em seção `border-b` e `CalendarLegend` em seção `border-t`; inner grid sem `rounded-lg border` próprios
- **Células refinadas**: altura `min-h-[72px] md:min-h-[100px]`; dia atual com badge circular `bg-primary rounded-full w-7 h-7`; dados em "N reservas · X pax" (singular/plural) + "Y% ocupação" abaixo; dias fechados com célula inteira `bg-zinc-100`; dias vazios com ponto cinza que vira "Adicionar reserva" no hover
- **Limiares de ocupação revisados**: Baixa `< 35%`, Média `35–70%`, Alta `> 70%`; cores `bg-emerald-50 / bg-amber-100 / bg-rose-100` (sem tom bege)
- **Popover de preview**: `DayPopover` mostra até N reservas com dot de status (verde/âmbar/vermelho/cinza), nome completo, horário · pax, label de status; `max-h-60 overflow-y-auto`; footer com "Ver todas →"; days sem reservas navegam direto
- **Dados enriquecidos**: `getCalendarioData()` retorna `ReservationFull[]` (join customers + accommodation_types + time_slots)
- **Navegação**: `aria-label` nos botões; `useTransition` + `opacity-60` ao trocar mês
- **Legenda sincronizada**: cores idênticas às células; limiares atualizados; item "Sem reservas" com ponto cinza
- **Skeleton**: atualizado para estrutura card com header/grid/legenda

### Refinamento Visual — Reservas (Fase 12 — CONCLUÍDA)

- **Paleta de cor neutralizada**: tokens `--background`, `--muted`, `--secondary`, `--border`, `--input` migrados de bege quente para zinc puro (chroma = 0). Nenhum tom beige em bordas ou backgrounds.
- **Drawer de reserva redesenhado** (`reservation-detail-drawer.tsx`): eyebrow "RESERVA" + nome `text-[22px]` + badges (status + origem) em linha abaixo do nome; metadata 2×2 grid; data de criação "Reservado em…" no header; icon circles `h-6 w-6 bg-zinc-100` em campos de cliente; timeline flex-based (sem absolute, dots sempre centrados, conector `w-px bg-zinc-200`); timestamps com ano `dd/MM/yyyy 'às' HH:mm`; footer com hierarquia clara (ação primária full-width + secundárias outline em linha); fullscreen mobile `w-full sm:max-w-[460px]`.
- **Tabela corrigida**: cabeçalhos com acentuação correta (Horário, Acomodação, Ações), `hover:bg-zinc-50 transition-colors` nas linhas, coluna DATA oculta quando filtro de data está ativo (`hideDate` prop).
- **Filtros corrigidos**: "Todas as acomodações" (com acento), data exibida em formato compacto "Sex., 27/02/2026" via `formatDateShort()` em `availability.ts`.
- **Modais de criação e edição redesenhados**: `p-0 gap-0` com header/body/footer separados; seções com `SectionLabel` (11px uppercase zinc-400) e separadores `border-t border-zinc-100`; footer `bg-zinc-50`; loading state com `Loader2` no botão de submit.
- **Taxa de no-show no drawer**: resolução por prioridade (`reservations.no_show_fee_override` → `exception_dates.no_show_fee_override` → `settings.no_show_fee`); exibida com label de origem quando não é padrão; valor visível no aviso "pendente de cobrança" e no painel de confirmação de cobrança.
- **Seção Avançado (modal de edição)**: oculta quando reserva não possui `stripe_payment_method_id` — evita confusão sobre taxa em reservas sem cartão.
- **Histórico de edições no drawer**: migration `005_reservation_edit_history` — tabela `reservation_edit_history(id, reservation_id, changes JSONB, changed_by, created_at)`; `updateReservation()` detecta diff nos campos rastreados (data, horário, acomodação, pessoas, solicitações, taxa) e insere registro; `getReservationDetails()` busca histórico de edições junto ao de status; drawer exibe ambos intercalados e ordenados por data, com dot de cor diferente para edições e lista de campos `antes → depois`.
- **Tipo `ReservationEditHistory`** adicionado a `src/types/index.ts`; `ReservationDetails` extendido com `editHistory`, `effectiveNoShowFee` e `noShowFeeSource`.

### Refinamento Visual — Lista de Espera & Passantes (Fase 13 — CONCLUÍDA)

- **Filtros padronizados cross-cutting**: `TableFilters` e `ReservationFilters` refatorados com container delimitado (`rounded-xl border bg-card p-4 shadow-sm`), título "Filtros" com ícone `SlidersHorizontal`, labels `text-xs font-medium text-zinc-500` acima de cada campo, grid responsivo `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Aplicado em Reservas, Lista de Espera e Passantes.
- **Subcomponentes compartilhados**: `SectionLabel` e `IconRow` extraídos de `reservation-detail-drawer.tsx` para `src/components/shared/drawer-primitives.tsx`; importados por todos os drawers e dialogs de criação.
- **Drawers waitlist/walk-in redesenhados**: padrão Fase 12 — `bg-zinc-50/60` header, eyebrow `text-[11px] tracking-widest text-zinc-400`, nome `text-[22px]`, metadata 2×2 grid com ícones `h-3.5 w-3.5 text-zinc-400`, "Registrado em…" com `border-t`, body com `SectionLabel`/`IconRow` (contato, solicitações), timeline flex-based (waitlist: chegada/acomodado/removido com dots coloridos), fullscreen mobile `w-full sm:max-w-[460px] bg-white`.
- **Drawers — footer de ações**: waitlist (status=waiting) com "Acomodar" full-width emerald + "Remover da lista" outline stacked; walk-in sem footer (read-only).
- **Dialogs de criação redesenhados**: `p-0 gap-0` com header/body/footer separados, `SectionLabel` para seções "Cliente" e "Detalhes", `border-t border-zinc-100` separadores, footer `bg-zinc-50`, `Loader2` no submit, `<Textarea>` em vez de `<textarea>` inline.
- **Tabelas refinadas**: coluna "Chegada" → "Horário" (waitlist), hierarquia de tempo (`text-zinc-400 text-xs` data + `font-medium text-zinc-900` hora), `hover:bg-zinc-50 transition-colors` em todas as linhas, botão "Remover" com `text-rose-600 border-rose-200`, fallbacks `text-zinc-300` para campos vazios (walk-in).
- **Empty states com CTA**: botão "Adicionar à lista" / "Registrar passante" (`variant="outline"` + ícone `Plus`) visível no estado vazio via prop `onAdd`.
- **Loading skeletons atualizados**: skeleton do filter card (título + grid 3 colunas com labels) + skeleton de tabela em card `rounded-xl`.

## O que não existe ainda

- Refinamento visual por página — Configurações & Acessos (14)
- Produção & Deploy (Fase 15)

## Próximos Passos

Fase 14 — Refinamento Visual — Configurações & Acessos.

## Issues Conhecidas

- Warnings do React Compiler sobre `form.watch()` do React Hook Form (esperado, não afeta funcionalidade)

