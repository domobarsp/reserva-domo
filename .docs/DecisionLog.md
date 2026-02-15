# Log de Decisões

> **REGRA**: Este arquivo é append-only. Nunca apague entradas anteriores. Sempre adicione no final.

---

### 2026-02-12 — Nome do sistema: Domo

**Contexto**: Precisávamos definir o nome/marca do sistema para uso em docs, UI, emails e título do app.
**Decisão**: O sistema se chama "Domo".
**Razão**: Nome alinhado com o repositório (domo-claude) e escolhido pelo cliente.

---

### 2026-02-12 — Site fixo em português, sem sistema i18n

**Contexto**: O spec menciona suporte a PT/EN/ES. Precisávamos definir se o site inteiro seria multilíngue.
**Decisão**: O site é 100% em português. Não usar next-intl nem qualquer sistema de internacionalização. O campo de idioma no formulário de reserva é apenas uma preferência do cliente, usada para enviar emails no idioma escolhido.
**Razão**: Decisão do cliente. Simplifica significativamente a arquitetura (sem `[locale]` nas rotas, sem arquivos de tradução, sem middleware de locale).

---

### 2026-02-12 — Rotas em português

**Contexto**: Com o site fixo em PT, as rotas devem usar nomes em português.
**Decisão**: Rotas públicas: `/reserva`, `/cancelar/[token]`. Rotas admin: `/admin/dashboard`, `/admin/reservas`, `/admin/calendario`, `/admin/lista-espera`, `/admin/passantes`, `/admin/configuracoes`, `/admin/relatorios`, `/admin/acessos`.
**Razão**: Consistência com o idioma do site. URLs amigáveis para usuários brasileiros/portugueses.

---

### 2026-02-12 — Etapas do formulário seguem o spec original

**Contexto**: O spec define 4 etapas: (1) Info Reserva, (2) Dados Cliente, (3) Cartão, (4) Confirmação.
**Decisão**: Seguir exatamente essas 4 etapas, sem subdividir.
**Razão**: Manter fidelidade ao spec do cliente.

---

### 2026-02-12 — Single-tenant com restaurant_id

**Contexto**: O sistema é para um restaurante, mas o schema pode ser futuro-proofed.
**Decisão**: Todas as tabelas incluem `restaurant_id` como foreign key, mas a Fase 1-7 opera com um único restaurante seedado.
**Razão**: Custo mínimo de implementação com flexibilidade para multi-tenant futuro.

---

### 2026-02-12 — Rotas admin com prefixo /admin/ (pasta real, não route group)

**Contexto**: O ProjectStructure.md usava `(admin)/` (route group do Next.js) que NÃO gera prefixo `/admin/` na URL. Porém, o DecisionLog anterior definia rotas como `/admin/dashboard`, `/admin/reservas`, etc.
**Decisão**: Usar pasta `admin/` (sem parênteses) em vez de route group `(admin)/`. Isso gera URLs com prefixo `/admin/` automaticamente: `/admin/dashboard`, `/admin/reservas`, `/admin/login`, etc.
**Razão**: Separação explícita entre rotas públicas e admin. Consistente com a decisão original de rotas em português. Mais claro para middleware de autenticação futura (Fase 4).

---

### 2026-02-12 — globals.css mantido em src/app/ (padrão Next.js)

**Contexto**: O ProjectStructure.md previa `src/styles/globals.css`, mas o `create-next-app` e o `shadcn/ui init` geraram o arquivo em `src/app/globals.css` com todas as CSS vars e imports corretos.
**Decisão**: Manter globals.css em `src/app/globals.css` em vez de mover para `src/styles/globals.css`.
**Razão**: Padrão do Next.js 15 e do shadcn/ui. Evita reconfiguração desnecessária. O layout.tsx já importa de `./globals.css`.

---

### 2026-02-12 — Garantia de cartão com override por data específica

**Contexto**: A garantia com cartão (Step 3 do formulário) tinha regra apenas por dia da semana (`card_guarantee_days` em settings). Porém, o admin precisa poder exigir ou dispensar cartão em datas específicas (ex: feriados, eventos especiais), independentemente do dia da semana.
**Decisão**: Adicionar campo `card_guarantee_override` (BOOLEAN NULL) na tabela `exception_dates`. Lógica: se a data tem exception com `card_guarantee_override` não-null, usa o valor do override; senão, segue a regra padrão por dia da semana.
**Razão**: Flexibilidade operacional para o restaurante. Custo mínimo (um campo nullable). Mantém a regra por dia da semana como default e permite exceções pontuais.

---

### 2026-02-12 — Taxa de no-show com 3 níveis de override e campos separados

**Contexto**: A taxa de no-show tinha apenas valor global (`settings.no_show_fee`). O admin precisa poder: (1) alterar o valor para datas específicas, (2) alterar o valor para uma reserva individual antes de cobrar. Além disso, é necessário distinguir entre o valor planejado (editável) e o valor efetivamente cobrado (imutável).
**Decisão**:
- Adicionar `no_show_fee_override` (INT NULL, centavos) em `exception_dates` — override por data.
- Adicionar `no_show_fee_override` (INT NULL, centavos) em `reservations` — override por reserva, editável até a cobrança.
- Manter `no_show_charge_amount` em `reservations` como valor efetivamente cobrado (imutável após cobrança).
- Prioridade de resolução: reserva > data > global.
**Razão**: Máxima flexibilidade para o admin. Dois campos separados (planejado vs cobrado) garantem auditoria e evitam perda de informação se o admin alterar o valor após a reserva ser criada.

---

### 2026-02-12 — Zod v4 com API diferente de v3

**Contexto**: Ao instalar `zod` para o formulário de reserva (Fase 2), a versão instalada foi v4.3.6, que tem API diferente da v3 comumente documentada.
**Decisão**: Usar Zod v4 sem downgrade. Adaptar código para a API v4: usar `{ error: "..." }` em vez de `{ required_error: "..." }` para `z.number()`, e não usar `.default()` nos schemas (causa tipo input `T | undefined` que conflita com o zodResolver).
**Razão**: Usar a versão mais recente. Os defaults são tratados no `defaultValues` do React Hook Form em vez do schema Zod.

---

### 2026-02-12 — Indicador de steps dinâmico (3 ou 4 etapas)

**Contexto**: O formulário de reserva tem opcionalmente um step de cartão de crédito. Se a data não exige garantia, o step é pulado.
**Decisão**: O indicador de etapas (step-indicator) e a contagem total de steps são calculados dinamicamente com base em `requiresCardGuarantee(date)`. Se cartão não é necessário: 3 etapas (Reserva, Dados, Confirmação). Se necessário: 4 etapas (Reserva, Dados, Cartão, Confirmação).
**Razão**: UX mais clara — o usuário não vê "Etapa 3 de 4" com um step inexistente. Reflete com precisão o fluxo real.

---

### 2026-02-13 — Estado do admin via React Context (Fase 3)

**Contexto**: A Fase 3 (Painel Admin com Mock Data) precisa de estado mutável compartilhado entre múltiplas páginas admin (dashboard mostra stats das mesmas reservas que `/admin/reservas` modifica).
**Decisão**: Usar React Context (`AdminDataProvider`) envolvendo o layout admin. O context contém todo o estado mutável (reservations, customers, waitlistEntries, walkIns, timeSlots, accommodationTypes, capacityRules, exceptionDates, settings) com funções CRUD. Inicializado com dados de `mock-data.ts`. Acessado via hook `useAdminData()`.
**Razão**: Compartilha estado entre páginas sem dependências externas. Será substituído por queries Supabase na Fase 4. Mais simples que Zustand/Redux para uma fase temporária de mock data.

---

### 2026-02-13 — Diretório src/contexts/ para React Contexts

**Contexto**: O `ProjectStructure.md` não previa um diretório para contexts. O `AdminDataProvider` precisa de um local.
**Decisão**: Criar `src/contexts/` para abrigar React Contexts do projeto. Primeiro arquivo: `admin-data-context.tsx`.
**Razão**: Separação clara de concerns. Contexts não são hooks (que vão em `src/hooks/`) nem componentes. Padrão comum em projetos Next.js.

---

### 2026-02-13 — Key prop pattern em vez de useEffect+setState para dialogs

**Contexto**: O React Compiler (eslint plugin) reporta erro ao chamar `setState` sincronamente dentro de `useEffect`, um padrão usado para inicializar o estado de dialogs baseado na prop `editing`. Isso causa cascading renders.
**Decisão**: Usar o padrão de key prop: o componente pai incrementa uma `dialogKey` ao abrir o dialog, forçando remount com estado fresco. O dialog inicializa state diretamente das props em vez de usar `useEffect` para sincronizar.
**Razão**: Recomendação oficial do React ("You Might Not Need an Effect"). Elimina cascading renders. Compatível com React Compiler.

---

### 2026-02-13 — Fase 4: Substituição total do AdminDataProvider (sem fallback)

**Contexto**: A Fase 4 migra de mock data (React Context) para Supabase. Precisávamos decidir entre migração incremental (com fallback) ou substituição total.
**Decisão**: Substituir AdminDataProvider de uma vez. Pages admin convertidas para Server Components que fazem fetch → passam dados como props para Client Content wrappers. Mutations via Server Actions com `revalidatePath()`.
**Razão**: O AdminDataProvider era temporário (Fase 3). Migração incremental adicionaria complexidade sem benefício, já que todas as entidades seriam migradas na mesma fase.

---

### 2026-02-13 — Fase 4: Server Actions para admin, API Routes para público

**Contexto**: Precisávamos escolher entre Server Actions e API Routes para as mutations.
**Decisão**: Server Actions (`'use server'`) para todas as mutations admin. API Routes (`/api/*`) para endpoints públicos (disponibilidade, criação de reserva, cancelamento).
**Razão**: Server Actions são mais ergonômicos para forms admin (chamada direta, sem fetch). API Routes para endpoints públicos permitem chamadas fetch do client side e são mais adequados para APIs sem autenticação.

---

### 2026-02-13 — Fase 4: Admin client (service role) para API Routes públicas

**Contexto**: As API Routes públicas (`/api/availability`, `/api/reservations`, `/api/reservations/cancel`) precisam ler/escrever dados sem autenticação do usuário.
**Decisão**: Usar `createAdminClient()` (service role key) nas API Routes públicas, sem depender de RLS policies anon.
**Razão**: Simplifica as RLS policies. O service role bypassa RLS, então a validação de capacidade e regras de negócio são feitas no código da API Route.

---

### 2026-02-13 — Fase 4: Route group (authenticated) para layout condicional

**Contexto**: O login admin não deve ter sidebar/topbar, mas as outras pages admin sim.
**Decisão**: Criar route group `src/app/admin/(authenticated)/` com layout que inclui sidebar + topbar. O login fica fora do route group em `src/app/admin/login/`. URLs não mudam (route groups não afetam paths).
**Razão**: Solução nativa do Next.js App Router para layouts condicionais. Sem lógica condicional no layout.

---

### 2026-02-13 — Fase 4: gen_random_uuid() em vez de uuid_generate_v4()

**Contexto**: A migration inicial usava `uuid_generate_v4()` da extensão `uuid-ossp`, que falhou no Supabase porque a extensão é instalada no schema `extensions`, não `public`.
**Decisão**: Usar `gen_random_uuid()` (função nativa do PostgreSQL 13+) em todas as migrations e seed.
**Razão**: Disponível nativamente sem extensões no PostgreSQL 13+, que é a versão usada pelo Supabase. Mais simples e confiável.

---

### 2026-02-13 — Reorganização de fases: 4.5, 7, 8, 9

**Contexto**: Após completar a Fase 4 (Supabase), foram identificados 12 débitos técnicos e melhorias de UX. Precisávamos organizar esses itens em fases sem atrasar as integrações core (Stripe, Resend).
**Decisão**: Criar 3 novas fases e renumerar:
- **Fase 4.5 (Polish Pós-Supabase)**: Bugs e fixes urgentes (redirect /admin, realtime cancelamento, loading states, horários HH:mm, filtros overflow, select de time slot no form admin). Antes do Stripe.
- **Fase 7 (Admin Features & UX)**: Features novas (dashboard pills de período, filtros passantes/espera, drawers de detalhes, controle de acesso). Após Resend.
- **Fase 8 (UI Polish)**: Padronização visual completa. Após features.
- **Fase 9 (Relatórios + Produção)**: Era Fase 7, renumerada.
**Razão**: Fixes urgentes (4.5) devem ser resolvidos antes de adicionar Stripe para garantir estabilidade. Features de UX (7) e polish visual (8) podem aguardar as integrações core. A sequência prioriza funcionalidade → estabilidade → polish.

---

### 2026-02-13 — Design System: Vega + Lime + Gray + Inter

**Contexto**: O projeto usava o tema padrão do shadcn/ui (new-york, neutral, Geist) sem customização visual. A UI parecia genérica ("template pronto"). O cliente definiu o padrão visual desejado via configurador do shadcn/ui.
**Decisão**: Adotar como padrão visual:
- **Estilo**: Vega (referência shadcn/ui)
- **Cor primária**: Lime (verde-lima vibrante, oklch hue ~132)
- **Cor base**: Gray (com leve tom azulado, não neutral puro)
- **Fonte**: Inter (substituindo Geist)
- **Raio de borda**: Small (0.45rem)
- **Diretrizes adicionais**: Mais cor e menos bordas, table headers com background sutil, mais respiro nas tabelas, cards de métricas com backgrounds coloridos diferenciados, sidebar com accent primário (lime)
**Razão**: Definir um padrão visual coeso e moderno antes da Fase 8 (UI Polish). Documentado em `.docs/DesignSystem.md` para guiar todas as decisões de UI futuras. A referência visual é o configurador shadcn/ui com os parâmetros acima + os blocos de dashboard da biblioteca.

---

### 2026-02-14 — Fase 4.6 (Design System) antecipada antes do Stripe

**Contexto**: O design system (Lime/Gray/Inter/Vega) estava planejado para a Fase 8 (UI Polish). No entanto, aplicar a identidade visual antes do Stripe evita retrabalho visual nos componentes do Stripe e garante que o sistema tenha aparência final mais cedo.
**Decisão**: Criar Fase 4.6 entre 4.5 (Polish) e 5 (Stripe). Escopo: aplicar todas as mudanças definidas em `.docs/DesignSystem.md` — fundação (globals.css, layout.tsx, components.json), componentes base (table, badges, status colors) e componentes de página (dashboard stats, sidebar, calendário, empty states). A Fase 8 permanece para padronização fina e acessibilidade.
**Razão**: Aplicar identidade visual cedo reduz retrabalho. Componentes Stripe (Payment Element, badges de cobrança) já nascerão no tema correto. A Fase 8 foca em refinamentos que dependem de todas as features estarem implementadas.

---

### 2026-02-15 — Fase 4.7 de refinamentos UX/UI antes do Stripe

**Contexto**: Após a Fase 4.6, foram identificados pontos de qualidade visual e feedback de carregamento ainda abaixo do esperado: cards de Big Numbers no dashboard sem aparência de superfície consolidada e ausência de skeleton durante aplicação de filtros em reservas.
**Decisão**: Criar a Fase 4.7 entre 4.6 e 5, com três frentes: (1) refino dos cards de Big Numbers para layout mais próximo da referência visual compartilhada (borda, raio, espaçamento e hierarquia de conteúdo), (2) loading/skeleton ao aplicar filtros em `/admin/reservas`, e (3) rodada curta de melhorias gerais de UX/UI nas telas impactadas (consistência tipográfica, espaçamento e estados assíncronos).
**Razão**: Resolver esses débitos antes do Stripe melhora a qualidade percebida do produto, reduz fricção operacional no admin e evita carregar inconsistências visuais para as próximas fases.

---

### 2026-02-15 — Filtros de Reservas migrados para server-driven com pending local

**Contexto**: A página `/admin/reservas` filtrava os dados somente no client sobre uma lista completa já carregada. Isso impedia feedback de loading real ao aplicar filtros e mantinha dados antigos visíveis durante a transição.
**Decisão**: Migrar aplicação de filtros para o server (`page.tsx` recebe `searchParams` e chama `getReservationsFull()` já filtrado) e manter estado `useTransition` no client para exibir skeleton da tabela e desabilitar controles durante navegação por filtros.
**Razão**: O fluxo server-driven garante dados consistentes com a URL e permite UX de carregamento clara (skeleton/pending) sem regressão de realtime nem perda de filtros ativos.

---

### 2026-02-15 — Dashboard stats com card branco compacto e foco tipográfico no número

**Contexto**: O redesign inicial dos Big Numbers ficou visualmente pesado, com excesso de área interna e destaque exagerado no texto de insight em relação ao valor numérico.
**Decisão**: Manter o card com superfície branca completa (sem faixas internas), reduzir proporções gerais (padding/gaps/tamanhos) e tornar o título de insight mais discreto. O maior destaque tipográfico do card deve ser sempre o número principal.
**Razão**: Aproxima o layout da referência visual, melhora escaneabilidade e reforça hierarquia de informação correta para uso operacional do dashboard.

---

### 2026-02-15 — Regressão de auto-atualização em Reservas: refresh orientado a transição + estado otimista local

**Contexto**: Após a migração de filtros de `/admin/reservas` para fluxo server-driven, a listagem deixou de refletir algumas mudanças de status em tempo hábil (ex.: `cancelado`) sem refresh manual da página.
**Decisão**: Em `reservas-page-content.tsx`, centralizar refresh em callback `refreshReservations()` usando `startTransition(() => router.refresh())` para eventos de realtime e pós-mutation, além de manter um estado local de reservas com atualização otimista imediata do status (incluindo remoção da linha quando deixa de satisfazer o filtro de status ativo).
**Razão**: A combinação de refresh em transição com fallback otimista elimina a percepção de stale UI, preserva consistência com dados do servidor e evita dependência de reload manual.
