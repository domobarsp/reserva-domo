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
                           └─ Fase 4.7 (Refinamentos UX/UI) ✅
                                └─ Fase 5 (Stripe) ✅
                                └─ Fase 6 (Resend) ✅
                                     └─ Fase 7 (Admin Features & UX) ✅
                                          └─ Fase 8 (Relatórios)
                                               └─ Fase 9 (Refinamento — Home & Formulário)
                                                    └─ Fase 10 (Refinamento — Dashboard)
                                                         └─ Fase 11 (Refinamento — Calendário)
                                                              └─ Fase 12 (Refinamento — Reservas)
                                                                   └─ Fase 13 (Refinamento — Lista de Espera & Passantes)
                                                                        └─ Fase 14 (Refinamento — Configurações & Acessos)
                                                                             └─ Fase 15 (Produção & Deploy)
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
**Status**: `COMPLETE`

**Escopo**:
- Templates React Email (confirmação, cancelamento, no-show, admin)
- Emails no idioma preferido do cliente
- Fluxo de cancelamento completo via link

**Critérios de aceitação**:
- [x] Email de confirmação enviado ao reservar
- [x] Link de cancelamento funcional
- [x] Email de cobrança ao cobrar no-show
- [x] Emails no idioma correto (PT/EN/ES)
- [ ] Política de cancelamento configurável (fora de escopo — adiado)

---

## Fase 7 — Admin Features & UX
**Status**: `COMPLETE`

**Escopo**:
Features e melhorias de UX no painel admin que aumentam a usabilidade operacional do sistema.

**Itens**:
- Dashboard: pills de período (Hoje, Esta semana, Próximos 15 dias) para expandir a visão além do dia atual
- Passantes: filtros (nome, data, telefone) para funcionar como registro de clientes
- Lista de Espera: filtros similares
- Drawer lateral de detalhes ao clicar em Reserva (dados do cliente, info completa da reserva, histórico de status)
- Drawer lateral para Passantes e Lista de Espera
- Controle de Acesso (`/admin/acessos`): gestão de admin users (convidar, ativar/desativar, alterar roles)
- RBAC: proteção de rotas e sidebar por role (staff sem acesso a configurações e acessos)

**Critérios de aceitação**:
- [x] Dashboard com seletor de período funcional
- [x] Passantes com filtros
- [x] Lista de Espera com filtros
- [x] Drawer de detalhes de reserva com dados do cliente e histórico
- [x] Drawer de detalhes para passantes e lista de espera
- [x] Página de controle de acesso com CRUD de admin users
- [x] Proteção de rotas e sidebar por role

---

## Fase 8 — Relatórios
**Status**: `NOT STARTED`

**Escopo**:
Implementação da página `/admin/relatorios` com dados reais, gráficos e exportação.

**Itens**:
- Visão geral do período: total de reservas, covers, taxa de no-show, taxa de ocupação
- Gráfico de reservas por dia (linha ou barra) com seletor de intervalo (7d / 30d / 90d / custom)
- Gráfico de distribuição por status (pizza ou donut)
- Tabela de top acomodações (mais reservadas, mais no-shows)
- Exportação CSV (reservas filtradas por período)
- Comparativo de período (ex: esta semana vs semana anterior)

**Critérios de aceitação**:
- [ ] Página `/admin/relatorios` com dados reais do Supabase
- [ ] Pelo menos 2 gráficos funcionais com biblioteca de charts
- [ ] Seletor de período funcional (atualiza todos os dados)
- [ ] Exportação CSV das reservas do período
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 9 — Refinamento Visual — Home & Formulário de Agendamento
**Status**: `NOT STARTED`

**Escopo**:
Revisão completa da experiência pública: landing page, formulário multi-step, página de sucesso e página de cancelamento.

**Itens**:
- Landing page: revisão de copy, hierarquia visual, CTA, responsividade mobile
- Formulário multi-step: UX de cada step (datas, acomodação, dados do cliente, cartão, confirmação), indicador de progresso, transições entre steps
- Step de cartão (Stripe): layout e feedback visual
- Página de sucesso: design, informações exibidas, link de cancelamento
- Página de cancelamento: fluxo, estados (carregando, já cancelado, erro)
- Consistência tipográfica e de espaçamento em todas as páginas públicas

**Critérios de aceitação**:
- [ ] Landing page responsiva e com hierarquia visual clara
- [ ] Formulário fluído em mobile e desktop, sem overflow ou truncamento
- [ ] Transições suaves entre steps
- [ ] Página de sucesso e cancelamento polidas
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 10 — Refinamento Visual — Dashboard
**Status**: `NOT STARTED`

**Escopo**:
Revisão profunda do dashboard admin: cards de estatísticas, seletor de período, tabela de reservas do dia e estados de loading/empty/error.

**Itens**:
- Cards de Big Numbers: revisão de layout, hierarquia, microcopy e cores por contexto (ok / alerta / crítico)
- Seletor de período: UX das pills, feedback visual de período ativo
- Tabela do período: densidade, legibilidade, coluna de Data para períodos >1 dia
- Empty state quando não há reservas no período
- Loading skeleton fiel à estrutura real dos dados
- Responsividade: comportamento em tablet e mobile

**Critérios de aceitação**:
- [ ] Cards visualmente consistentes e informativos
- [ ] Tabela legível em qualquer tamanho de tela
- [ ] Empty e loading states polidos
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 11 — Refinamento Visual — Calendário
**Status**: `NOT STARTED`

**Escopo**:
Revisão do calendário visual mensal: grid, células, legenda, navegação e estados de ocupação.

**Itens**:
- Grid mensal: espaçamento, proporção das células, tipografia do número do dia
- Indicadores de ocupação: revisão das cores (verde/amarelo/vermelho/cinza), legenda
- Célula com múltiplos dados (nº reservas, covers): hierarquia visual
- Dia atual e dia selecionado: destaque visual claro
- Navegação mês anterior/próximo: botões, exibição do mês/ano
- Responsividade: comportamento em telas menores (compactar ou scroll horizontal)
- Estado de loading ao mudar de mês

**Critérios de aceitação**:
- [ ] Grid proporcional e legível em desktop e tablet
- [ ] Indicadores de ocupação claros e com legenda
- [ ] Navegação fluída com feedback de loading
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 12 — Refinamento Visual — Reservas (Lista + Drawer)
**Status**: `NOT STARTED`

**Escopo**:
Revisão da página de gestão de reservas: filtros, tabela e drawer de detalhes.

**Itens**:
- Filtros: layout, UX do date picker, select de status e acomodação, botão de limpar
- Tabela: colunas, densidade, badges de status, ícones de cartão/cobrança, ações no dropdown
- Estados: loading skeleton, empty state (sem reservas no filtro), erro de busca
- Drawer de detalhes: revisão de cada seção (cabeçalho, cliente, histórico, garantia), tipografia, espaçamento
- Ações no drawer: botões de status (tamanho, cor, feedback de loading), painel de cobrança no-show
- Responsividade: tabela em mobile (colunas colapsáveis ou scroll), drawer em tela cheia no mobile

**Critérios de aceitação**:
- [ ] Filtros intuitivos e sem overflow
- [ ] Tabela legível com todas as informações necessárias
- [ ] Drawer polido com ações claras
- [ ] Experiência funcional em mobile
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 13 — Refinamento Visual — Lista de Espera & Passantes
**Status**: `NOT STARTED`

**Escopo**:
Revisão das páginas de Lista de Espera e Passantes: filtros, tabelas e drawers.

**Itens**:
- Filtros compartilhados (TableFilters): refinamento do layout e UX
- Tabela de Lista de Espera: colunas, status badges, ações (Acomodar/Remover)
- Tabela de Passantes: colunas, densidade, empty state
- Drawer de Lista de Espera: cabeçalho, seções de contato e timeline, ações no rodapé
- Drawer de Passantes: cabeçalho, seção de contato, solicitações especiais
- Consistência visual entre as duas páginas (mesmos padrões)

**Critérios de aceitação**:
- [ ] Filtros e tabelas consistentes entre as duas páginas
- [ ] Drawers com mesmo padrão visual da página de Reservas
- [ ] Empty states e loading states polidos
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 14 — Refinamento Visual — Configurações & Acessos
**Status**: `NOT STARTED`

**Escopo**:
Revisão das páginas de Configurações (hub + 6 sub-páginas) e Acessos.

**Itens**:
- Hub de Configurações: cards de navegação, descrições, ícones
- Sub-páginas (Horários, Acomodações, Capacidade, Garantia, Taxa, Exceções): layout dos formulários, tabelas de CRUD, dialogs de criação/edição
- Consistência de padrões entre sub-páginas (headers, botões de ação, empty states)
- Página de Acessos: tabela de usuários, badges de cargo/status, dialog de criação
- Feedback de ações: toasts, loading states nos botões

**Critérios de aceitação**:
- [ ] Hub de Configurações visualmente claro e navegável
- [ ] Sub-páginas com layout consistente
- [ ] Página de Acessos polida
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 15 — Produção & Deploy
**Status**: `NOT STARTED`

**Escopo**:
Preparação para produção: robustez técnica, segurança, SEO e deploy na Vercel.

**Itens**:
- Error boundaries em páginas críticas
- Rate limiting nas API routes públicas (`/api/reservations`, `/api/availability`)
- Prevenção de double-booking (lock otimista ou verificação transacional)
- SEO: meta tags, Open Graph, sitemap para páginas públicas
- Variáveis de ambiente de produção e checklist de segurança
- Deploy na Vercel com domínio customizado
- Verificação end-to-end completa (fluxo de reserva, cancelamento, no-show, emails)

**Critérios de aceitação**:
- [ ] Zero mocks restantes
- [ ] Rate limiting ativo nas rotas públicas
- [ ] Double-booking impossível sob carga concorrente
- [ ] SEO básico implementado
- [ ] Sistema deployado e funcionando em produção
- [ ] Verificação end-to-end completa
