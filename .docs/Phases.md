# Fases de Implementação

## Grafo de Dependências

```
Fase 0 (Docs) ✅
  └─ Fase 1 (Scaffolding) ✅
       ├─ Fase 2 (Formulário público, mock) ✅
       └─ Fase 3 (Admin UI, mock) ✅
            └─ Fase 4 (Supabase) ✅
                 └─ Fase 4.5 (Polish Pós-Supabase) ✅
                      └─ Fase 4.6 (Design System) ✅
                           └─ Fase 4.7 (Refinamentos UX/UI)
                                └─ Fase 5 (Stripe)
                                └─ Fase 6 (Resend)
                                     └─ Fase 7 (Admin Features & UX)
                                          └─ Fase 8 (UI Polish)
                                               └─ Fase 9 (Relatórios + Produção)
```

> **Planejamento granular**: Antes de iniciar cada fase, o agente deve criar um plano
> detalhado em `plans/current.md` com tarefas derivadas dos critérios de aceitação abaixo.
> Ao concluir a fase, o plano é movido para `plans/completed/fase-N.md`.

---

## Fase 0 — Documentação de Projeto
**Status**: `COMPLETE`

**Escopo**:
- Criar CLAUDE.md na raiz
- Criar todos os arquivos `.docs/`
- Nenhum código executável

**Critérios de aceitação**:
- [x] CLAUDE.md aponta para .docs/Agents.md
- [x] Agents.md documenta o projeto, stack e regras
- [x] Todos os 8 docs de suporte criados
- [x] DecisionLog.md com decisões iniciais registradas

---

## Fase 1 — Scaffolding e Layout Base
**Status**: `COMPLETE`

**Escopo**:
- Inicializar Next.js + TypeScript + Tailwind + shadcn/ui
- Layouts público (header/footer) e admin (sidebar/topbar)
- Landing page Domo com CTA
- Páginas placeholder para todas as rotas
- Mock data tipado + tipos TypeScript
- Tudo em português

**Critérios de aceitação**:
- [x] `npm run dev` funciona sem erros
- [x] Landing page visível com branding Domo
- [x] Navegação funcional entre todas as rotas
- [x] Layout público e admin responsivos
- [x] Mock data tipado em `src/lib/mock-data.ts`
- [x] Tipos em `src/types/`
- [x] `npx tsc --noEmit` sem erros

---

## Fase 2 — Formulário de Reserva (Mock Data)
**Status**: `COMPLETE`

**Escopo**:
- Formulário multi-step: (1) Info Reserva, (2) Dados Cliente, (3) Cartão placeholder, (4) Confirmação
- Validação Zod + React Hook Form
- Disponibilidade calculada de mock data
- Página de sucesso e cancelamento (mock)

**Critérios de aceitação**:
- [x] Formulário completo navegável (avançar/voltar)
- [x] Validação em tempo real
- [x] Tipos de acomodação com capacidade restante
- [x] Etapa de cartão como placeholder condicional
- [x] Página de sucesso com ID fictício
- [x] Página `/cancelar/[token]` funcional (mock)

**Notas**:
- Zod v4 instalado (API diferente de v3: sem `required_error`, `.default()` cria tipo input optional)
- Indicador de etapas dinâmico (3 ou 4 etapas conforme necessidade de cartão)

---

## Fase 3 — Painel Admin (Mock Data)
**Status**: `COMPLETE`

**Escopo**:
- Dashboard com cards de resumo
- Calendário visual mensal
- Lista e gestão de reservas (CRUD, transições de status)
- Lista de espera e passantes
- Configurações (horários, capacidade, regras, exceções)
- Tudo com estado local (React state)

**Critérios de aceitação**:
- [x] Dashboard com stats do dia
- [x] Calendário com densidade visual
- [x] CRUD de reservas funcional (memória)
- [x] Transições de status corretas
- [x] Criação manual de reservas
- [x] Lista de espera e passantes funcionais
- [x] Configurações editáveis
- [x] Responsivo

**Notas**:
- Estado admin via React Context (AdminDataProvider) — substituído por Supabase na Fase 4
- Funções de disponibilidade refatoradas com variantes parametrizadas para uso no admin
- Helpers de transição de status com validação de transições permitidas
- Calendário usa grid CSS customizado (não shadcn Calendar que é apenas date picker)

---

## Fase 4 — Integração Supabase
**Status**: `COMPLETE`

**Escopo**:
- Schema completo (13 tabelas) com migrations
- Autenticação admin (email/password)
- Middleware de proteção de rotas
- Server Actions e API Routes reais
- Realtime para atualizações ao vivo
- Seed data

**Critérios de aceitação**:
- [x] Dados persistem entre recarregamentos
- [x] Admin exige login
- [x] Reservas aparecem em tempo real
- [x] Capacidade calculada do banco
- [x] Todas as configurações persistem
- [x] RLS policies funcionais

**Notas**:
- Migrations usam `gen_random_uuid()` (nativo PostgreSQL 13+) em vez de `uuid_generate_v4()`
- Admin pages usam Server Components + Client Content wrappers (props em vez de Context)
- Public pages usam API Routes (`/api/availability`, `/api/reservations`, `/api/reservations/cancel`)
- Realtime via `useRealtimeSubscription` hook em Dashboard, Reservas, Lista de Espera, Calendário
- Route group `(authenticated)/` separa login (sem sidebar) de pages autenticadas

---

## Fase 4.5 — Polish Pós-Supabase
**Status**: `COMPLETE`

**Escopo**:
Correção de bugs e melhorias de UX identificadas após a integração Supabase. Devem ser resolvidas antes do Stripe para garantir estabilidade.

**Itens**:
- `/admin` retorna 404 quando logado — deve redirecionar para `/admin/dashboard`
- Cancelar reserva não atualiza lista automaticamente via realtime; refresh manual perde filtros ativos
- Filtro de data na página de reservas: texto cortado/saindo do select
- Loading indicators (spinners) no formulário de reserva e nas páginas admin
- Horários exibidos com segundos desnecessários (mostrar apenas HH:mm)
- Dialog de criação de reserva admin: campo de horário deve ser select dos time slots disponíveis (não input livre)

**Critérios de aceitação**:
- [x] `/admin` redireciona para `/admin/dashboard` quando autenticado
- [x] Cancelamento de reserva atualiza lista em tempo real sem perder filtros
- [x] Filtro de data renderiza corretamente sem overflow
- [x] Loading states visíveis durante fetches (formulário público + pages admin)
- [x] Horários exibidos como HH:mm em toda a UI
- [x] Criação de reserva admin usa select de horários de serviço

**Notas**:
- `/admin` usa `redirect()` do Next.js em `src/app/admin/page.tsx`
- Filtros de reserva movidos para URL searchParams — `router.refresh()` do realtime preserva filtros
- `formatTime()` compartilhada em `src/lib/utils.ts`, usada em 6 arquivos
- Dialogs de criação/edição usam `<Select>` com valor composto `time_slot_id|start_time`
- Loading skeletons via `loading.tsx` do Next.js em 6 páginas admin
- Componente `skeleton` do shadcn instalado

---

## Fase 4.6 — Design System (Lime/Gray/Inter/Vega)
**Status**: `COMPLETE`

**Escopo**:
Aplicação do design system definido em `.docs/DesignSystem.md`. Substitui o tema padrão neutro do shadcn/ui pela identidade visual Domo: cor primária Lime, base Gray com tom azulado, fonte Inter, raio de borda reduzido.

**Itens**:
- Fundação: globals.css (paleta Lime/Gray completa, light + dark), layout.tsx (fonte Inter), components.json (baseColor gray)
- Componentes base: table.tsx (header bg sutil, mais respiro), status-transitions.ts (cores amber/emerald/rose), status-badge.tsx (sem outline)
- Componentes de página: dashboard-stats.tsx (cards verticais coloridos), admin-sidebar.tsx (logo lime, active primary/10), empty-state.tsx (dashed border), month-grid.tsx + calendar-legend.tsx (cores semânticas), layout admin (padding generoso)

**Critérios de aceitação**:
- [x] Cor primária lime em botões, links, accents
- [x] Fonte Inter em todo o sistema
- [x] Border radius 0.45rem
- [x] Tabelas com header bg sutil, mais respiro nas células
- [x] Badges de status sem borda, com cores amber/emerald/rose
- [x] Dashboard cards verticais com backgrounds coloridos diferenciados
- [x] Sidebar com logo lime e active state primary/10
- [x] Calendário com cores emerald/amber/rose e ring primary
- [x] Empty states com borda dashed
- [x] Headers de página com font-semibold e padding generoso

---

## Fase 4.7 — Refinamentos UX/UI (Dashboard + Filtros)
**Status**: `COMPLETE`

**Escopo**:
Ajustes visuais e de feedback de carregamento para elevar a qualidade percebida do admin antes da integração Stripe, sem misturar escopo com as features da Fase 7.

**Itens**:
- Dashboard: refino dos cards de Big Numbers para visual mais próximo da referência (superfície com borda, cantos arredondados, espaçamento, hierarquia de conteúdo e microcopy)
- Reservas: loading/skeleton ao aplicar filtros em `/admin/reservas`, incluindo estado pending durante transição
- UX/UI sweep: padronização de headers, espaçamentos e estados assíncronos (loading/disabled/aria-busy) nas telas impactadas
- Validação responsiva (desktop/mobile) dos novos padrões

**Critérios de aceitação**:
- [ ] Cards de Big Numbers com borda visível, raio, padding e gap consistentes, próximos da referência visual compartilhada
- [ ] Ao alterar filtros em `/admin/reservas`, a área de conteúdo entra em loading com skeleton até os novos dados renderizarem
- [ ] Filtros continuam preservados na URL e atualização realtime não perde o estado filtrado
- [ ] Melhorias gerais de UX/UI aplicadas nas páginas impactadas sem regressão visual em mobile/desktop
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 5 — Integração Stripe
**Status**: `COMPLETE`

**Escopo**:
- SetupIntent para captura condicional de cartão
- Stripe Payment Element no formulário
- Cobrança de no-show via PaymentIntent
- Webhook handler

**Critérios de aceitação**:
- [ ] Cartão de teste capturado sem cobrança
- [ ] Etapa Stripe aparece condicionalmente
- [ ] Admin cobra no-show com um clique
- [ ] Webhook processa eventos corretamente
- [ ] Badge de cartão/cobrança visível no admin

---

## Fase 6 — Integração Resend
**Status**: `NOT STARTED`

**Escopo**:
- Templates React Email (confirmação, cancelamento, no-show, admin)
- Emails no idioma preferido do cliente
- Fluxo de cancelamento completo via link

**Critérios de aceitação**:
- [ ] Email de confirmação enviado ao reservar
- [ ] Link de cancelamento funcional
- [ ] Email de cobrança ao cobrar no-show
- [ ] Emails no idioma correto (PT/EN/ES)
- [ ] Política de cancelamento configurável

---

## Fase 7 — Admin Features & UX
**Status**: `NOT STARTED`

**Escopo**:
Features e melhorias de UX no painel admin que aumentam a usabilidade operacional do sistema.

**Itens**:
- Dashboard: pills de período (Hoje, Esta semana, Próximos 15 dias) para expandir a visão além do dia atual
- Passantes: filtros (nome, data, telefone) para funcionar como registro de clientes
- Lista de Espera: filtros similares
- Drawer lateral de detalhes ao clicar em Reserva (dados do cliente, info completa da reserva, histórico de status)
- Drawer lateral para Passantes e Lista de Espera
- Controle de Acesso (`/admin/acessos`): gestão de admin users (convidar, ativar/desativar, alterar roles)

**Critérios de aceitação**:
- [ ] Dashboard com seletor de período funcional
- [ ] Passantes com filtros
- [ ] Lista de Espera com filtros
- [ ] Drawer de detalhes de reserva com dados do cliente e histórico
- [ ] Drawer de detalhes para passantes e lista de espera
- [ ] Página de controle de acesso com CRUD de admin users

---

## Fase 8 — UI Polish & Padronização
**Status**: `NOT STARTED`

**Escopo**:
Revisão visual completa para padronizar e melhorar a experiência do usuário em todas as páginas.

**Itens**:
- Padronizar espaçamentos, tipografia e cores entre páginas admin
- Melhorar responsividade em telas pequenas
- Consistência de empty states, loading states e error states
- Transições e animações sutis
- Acessibilidade (foco, contraste, aria labels)

**Critérios de aceitação**:
- [ ] UI consistente entre todas as páginas admin
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Loading/empty/error states padronizados
- [ ] Acessibilidade básica (WCAG AA)

---

## Fase 9 — Relatórios, Polish e Produção
**Status**: `NOT STARTED`

**Escopo**:
- Relatórios (reservas, no-shows, ocupação) com gráficos
- Exportação CSV
- Error boundaries, SEO
- Rate limiting, prevenção de double-booking
- Deploy Vercel

**Critérios de aceitação**:
- [ ] Relatórios com dados reais e gráficos
- [ ] Exportação CSV funcional
- [ ] Zero mocks restantes
- [ ] Sistema deployado na Vercel
- [ ] Verificação end-to-end completa (12 itens)
