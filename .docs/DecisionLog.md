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

---

### 2026-02-21 — Fase 5 (Stripe): reserva criada apenas na confirmação, sem reservas zumbi

**Contexto**: O fluxo do formulário com cartão poderia criar a reserva antes do step de cartão (para passar o `reservationId` ao SetupIntent) — mas isso criaria reservas "zumbi" se o usuário abandonasse no step de cartão.
**Decisão**: A reserva é criada **somente** no step de confirmação (último), independentemente de haver ou não step de cartão. O `paymentMethodId` é capturado diretamente do retorno do `confirmSetup` client-side e passado no body do POST `/api/reservations`.
**Razão**: Evita reservas pendentes no banco sem intenção real. Simplifica o fluxo: um único ponto de criação de reserva independente do caminho (com ou sem cartão).

---

### 2026-02-21 — Fase 5 (Stripe): sem webhook para setup_intent.succeeded

**Contexto**: A documentação original do Stripe sugeria tratar `setup_intent.succeeded` no webhook para salvar o `stripe_payment_method_id` na reserva.
**Decisão**: Não tratar `setup_intent.succeeded` no webhook. O `payment_method` está disponível diretamente no retorno de `stripe.confirmSetup()` client-side. O ID é capturado ali e enviado junto com os dados da reserva no submit.
**Razão**: Elimina latência de webhook para o fluxo crítico. Reduz complexidade (sem necessidade de lookup de reserva por setup_intent_id). O webhook foca apenas em `payment_intent.*` (cobranças de no-show).

---

### 2026-02-21 — Fase 5 (Stripe): cobrança de no-show via API Route autenticada, não Server Action

**Contexto**: A cobrança de no-show poderia ser implementada como Server Action (padrão das outras mutations admin) ou como API Route.
**Decisão**: Usar API Route (`POST /api/stripe/charge-no-show`) com verificação de sessão Supabase explícita.
**Razão**: Operação financeira sensível: API Route oferece controle explícito de status HTTP, melhor tratamento de erros do Stripe, e log mais claro. Server Actions retornam objetos JSON sem código HTTP — adequados para mutations de formulário, mas menos expressivos para operações com múltiplos estados de falha (authn, validação, Stripe error).

---

### 2026-02-21 — Realtime: REPLICA IDENTITY FULL obrigatório para UPDATE/DELETE com RLS

**Contexto**: Após implementar o Supabase Realtime nas tabelas `reservations` e `waitlist_entries`, eventos de INSERT chegavam mas UPDATE (mudança de status, cancelamento) e DELETE silenciosamente não eram entregues ao cliente admin.
**Decisão**: Adicionar `ALTER TABLE public.reservations REPLICA IDENTITY FULL` e idem para `waitlist_entries` via migration `004_replica_identity.sql`.
**Razão**: Com RLS ativo, o Supabase Realtime precisa verificar se o usuário subscrito tem acesso à **linha anterior** de um UPDATE/DELETE. Sem `REPLICA IDENTITY FULL`, o PostgreSQL não inclui os dados anteriores no WAL — o Supabase não consegue fazer o check de RLS e descarta o evento silenciosamente. Com `FULL`, a linha completa antes e depois da mudança é incluída no WAL, permitindo a verificação correta.
**⚠️ Regra crítica**: Qualquer nova tabela adicionada ao realtime (`ALTER PUBLICATION supabase_realtime ADD TABLE`) com RLS ativo **deve** ter `REPLICA IDENTITY FULL` configurado, caso contrário UPDATE/DELETE não serão entregues.

---

### 2026-02-21 — Realtime: canal com nome único por instância + callback via ref

**Contexto**: O hook `useRealtimeSubscription` usava o nome de canal `realtime-${table}` (fixo). Múltiplas páginas admin abertas ou componentes montados criavam canais com o mesmo nome, causando conflito no Supabase Realtime. Adicionalmente, `onEvent` estava no array de dependências do `useEffect`, causando re-subscrição quando a referência da função mudava entre renders.
**Decisão**: (1) Adicionar sufixo aleatório ao nome do canal: `realtime-${table}-${random}`. (2) Armazenar `onEvent` em um `useRef` atualizado a cada render, removendo-o das dependências do `useEffect`.
**Razão**: Canais com nome único evitam conflito entre instâncias. O padrão de ref para callback é a forma correta de usar funções estáveis em `useEffect` sem re-subscrever — garante que o canal seja criado uma vez por montagem e destruído apenas no unmount.
**⚠️ Regra crítica**: Ao usar `useRealtimeSubscription`, nunca passar uma função instável (criada inline) como `onEvent` — embora o hook seja robusto via ref, manter o callback estável (via `useCallback`) é boa prática.

---

### 2026-02-22 — Resend: render via React.createElement + render(), não prop `react`

**Contexto**: Ao integrar Resend com React Email, a SDK do Resend aceita uma prop `react` no `emails.send()` que renderiza o componente internamente. Porém, em contextos Next.js App Router com RSC e TypeScript strict, essa abordagem gera conflitos de tipos.
**Decisão**: Usar `render()` do `@react-email/components` explicitamente para gerar o HTML, passando-o como prop `html` para o `resend.emails.send()`. Instanciar o componente via `React.createElement(Component, props)`.
**Razão**: Abordagem mais explícita, sem dependência de comportamento interno da SDK, e sem conflitos de tipos. Validado em produção com entrega confirmada.

---

### 2026-02-22 — Resend: emails não-bloqueantes (fire-and-forget com log)

**Contexto**: Os emails são enviados após operações críticas (criar reserva, cancelar, cobrar no-show). Uma falha no Resend não deve impedir a operação principal de retornar sucesso ao usuário.
**Decisão**: Todas as funções em `src/services/email-service.ts` fazem `try/catch` interno — erros são logados via `console.error` mas nunca relançados. A chamada `await sendXxxEmail(...)` nas rotas aguarda a conclusão mas não propaga erros.
**Razão**: A reserva existe independentemente do email. Forçar falha na reserva por falha no email cria experiência ruim e perde dados. O log permite diagnóstico sem impacto no fluxo principal. Para produção, pode-se evoluir para fila/retry assíncrono.

---

### 2026-02-22 — Resend: templates com inline styles obrigatórios

**Contexto**: Os templates React Email precisam funcionar em clientes de email como Gmail, Outlook, Apple Mail, que suportam apenas subconjuntos de CSS.
**Decisão**: Usar exclusivamente inline styles (objetos `React.CSSProperties`) nos templates. Não usar Tailwind, CSS Modules ou styled-components.
**Razão**: React Email foi projetado para isso — clientes de email removem `<style>` tags e classes externas. Inline styles são a única forma confiável de estilização cross-client. Validado com entrega bem-formada no Gmail.

---

### 2026-02-22 — Fase 7: Seletor de período no dashboard via searchParams

**Contexto**: O dashboard mostrava apenas dados do dia atual. A Fase 7 introduz pills de período (Hoje / Esta semana / Próximos 15 dias).
**Decisão**: Período controlado via `searchParams.period` na page server-side. `getDashboardData(period)` calcula range de datas e retorna reservas do período. Card de Ocupação (%) mantido apenas para "Hoje" — para multi-day, substituído por "Total de Pessoas no Período" (ocupação não é significativa para múltiplos dias sem capacidade diária separada).
**Razão**: Padrão consistente com filtros de Reservas (server-driven via searchParams). Evita estado client-side extra. Permite deep-link/refresh preservando o período selecionado.

---

### 2026-02-22 — Fase 7: RBAC via Server Components, não middleware

**Contexto**: Precisávamos restringir acesso a `/admin/configuracoes/*` e `/admin/acessos` para usuários com role `staff`.
**Decisão**: Proteção aplicada nos Server Components das páginas protegidas (e no layout autenticado para o sidebar), não no middleware. `getCurrentAdminUser()` helper centralizado em `src/lib/queries/admin-users.ts`. Middleware continua verificando apenas autenticação (sessão válida). Roles mapeadas para UI: owner/manager → "Administrador", staff → "Operador".
**Razão**: Adicionar queries de banco no middleware aumentaria latência de todas as requisições. Server Components protegem as páginas com custo de performance mínimo (query cached por request). O middleware fica leve e focado em autenticação.

---

### 2026-02-22 — Fase 7: Convite via Supabase Auth Admin + insert manual em admin_users

**Contexto**: Para convidar novos admins, precisamos criar o usuário no Supabase Auth e registrá-lo em `admin_users`.
**Decisão**: Usar `supabase.auth.admin.inviteUserByEmail(email)` (requer service role key) para criar o usuário e enviar email de convite. O user retornado pela API contém o `id` — usado para inserir imediatamente em `admin_users` com o role e display_name escolhidos.
**Razão**: Fluxo atômico: convite e registro em admin_users na mesma Server Action. O email de convite do Supabase é enviado automaticamente (sem depender do Resend). Não é necessário webhook para sincronizar.

---

### 2026-02-22 — Fase 7: Drawers de detalhes com lazy loading

**Contexto**: Os drawers de detalhes (reservas, passantes, lista de espera) precisam exibir informações completas — incluindo histórico de status para reservas — que não são buscadas na listagem principal.
**Decisão**: Os dados de detalhe são buscados ao abrir o drawer (lazy), não pré-carregados. O drawer recebe o `id` do item selecionado e faz a busca internamente (ou via action chamada no `onOpenChange`). Para reservas, inclui `reservation_status_history` ordered by `created_at ASC`.
**Razão**: Evita over-fetching na listagem (que pode ter dezenas de linhas). Histórico de status é raramente consultado — buscar só quando necessário reduz carga no banco.

---

### 2026-02-22 — Login admin por usuário (sem email obrigatório)

**Contexto**: Funcionários sem email corporativo não conseguiam usar o fluxo de convite por email do Supabase. O link de convite redirecionava para a home sem completar o cadastro.
**Decisão**: Substituir `inviteUserByEmail` por `createUser` com email sintético no formato `{login}@domo.local` e `email_confirm: true`. A tela de login aceita usuário simples (ex: `joao.silva`) ou email completo — se não contiver `@`, o sufixo `@domo.local` é acrescentado antes de autenticar. A tabela de usuários exibe o login sem o sufixo.
**Razão**: Elimina dependência de email real para acesso ao painel. Fluxo simples: admin cria usuário com login + senha diretamente, funcionário usa essas credenciais. O domínio `@domo.local` é fictício e nunca recebe emails reais.

---

### 2026-02-22 — RBAC: página Acessos restrita a Proprietário

**Contexto**: Definição de quem pode gerenciar usuários do sistema.
**Decisão**: Apenas `role = owner` pode acessar `/admin/acessos`. Gerentes (`manager`) têm acesso a Configurações mas não a Acessos. Operadores (`staff`) não acessam nenhum dos dois. Proteção em duas camadas: middleware verifica `is_active`, page verifica `role !== owner`.
**Razão**: Gestão de acessos é responsabilidade exclusiva do proprietário — permite que gerentes operem o restaurante sem poder criar/desativar contas.

---

### 2026-02-22 — Desativação de conta força logout imediato via middleware

**Contexto**: Ao desativar uma conta em `/admin/acessos`, o usuário desativado continuava navegando normalmente até o próximo full reload (o layout autenticado é um Server Component que não re-executa em navegações client-side do Next.js App Router).
**Decisão**: Mover a verificação de `is_active` para o middleware (`updateSession`), que executa em toda request. Se o usuário autenticado tiver `is_active = false` em `admin_users`, o middleware redireciona para `/admin/logout` (Route Handler que faz `signOut()` e redireciona para login). O layout mantém o check como defesa em profundidade.
**Razão**: O middleware é o único ponto que roda em toda navegação (incluindo client-side routing do Next.js). O custo de uma query extra por request é aceitável para um painel admin com poucos usuários simultâneos — a query é um lookup por PK indexada. Alternativas (JWT custom claims, polling, WebSocket) adicionariam complexidade desproporcional ao caso de uso.

---

### 2026-03-02 — Fase 8: biblioteca de gráficos — shadcn chart (Recharts)

**Contexto**: A página de relatórios precisa de gráficos. Nenhuma biblioteca estava instalada.
**Decisão**: Usar `shadcn chart` (`npx shadcn add chart`), que é um wrapper sobre Recharts com integração ao design system via CSS variables e `ChartConfig`.
**Razão**: Já usávamos shadcn/ui — adicionar o chart mantém a consistência de API e estilo. Recharts é maduro, bem suportado no React 19 e Server Components. Alternativas (Chart.js, Nivo, Tremor) adicionariam uma segunda biblioteca visual ao projeto.

---

### 2026-03-02 — Fase 8: cores dos gráficos de status — hex semântico, não CSS variables do chart

**Contexto**: As variáveis `--chart-1` a `--chart-5` do design system são todas variações de lime (cor primária). Usá-las no gráfico de distribuição por status tornava todos os segmentos indistinguíveis.
**Decisão**: Para gráficos que representam status de reserva, usar cores hexadecimais semânticas diretas no `ChartConfig` e no atributo `fill` dos componentes Recharts: amber-500 (`#f59e0b`) para Pendente, blue-500 (`#3b82f6`) para Confirmado, emerald-500 (`#10b981`) para Sentado, gray-500 (`#6b7280`) para Completo, rose-500 (`#f43f5e`) para Não Compareceu, slate-300 (`#cbd5e1`) para Cancelado.
**Razão**: As mesmas famílias de cor já são usadas nos badges de status (`status-transitions.ts`) — manter consistência semântica é mais importante do que usar as CSS variables do tema nesse contexto. As CSS variables do chart são reservadas para gráficos de métrica única (ex: total de reservas por dia).

---

### 2026-03-02 — Fase 8: stacked bar chart sem border-radius nas camadas

**Contexto**: O Recharts aplica `radius` em cada segmento individualmente no stacked bar. Se uma camada do meio tem valor 0, o segmento acima fica com arredondamento na base ao invés do topo, gerando artefato visual.
**Decisão**: Usar `radius={0}` em todos os `<Bar>` de gráficos empilhados.
**Razão**: Não há forma simples de aplicar radius apenas no topo do stack total sem implementar um `shape` customizado. O custo visual de barras sem arredondamento é zero — a alternativa seria complexidade desnecessária.

---

### 2026-03-02 — Regra de componentes: sempre preferir shadcn/ui sobre HTML nativo

**Contexto**: O seletor de datas nos relatórios foi inicialmente implementado com `<input type="date">` nativo, ficando visualmente inconsistente com o restante do painel admin.
**Decisão**: Sempre usar o componente shadcn/ui equivalente quando disponível. Para date picker: `<Calendar>` + `<Popover>`. Regra documentada em `DesignSystem.md` com tabela de mapeamento e exemplo de código.
**Razão**: Consistência visual com o design system. O `<input type="date">` tem aparência dependente de OS/browser e não segue o tema lime/gray do projeto.

---

### 2026-03-02 — Fase 8: terminologia "Pessoas" em vez de "Covers"

**Contexto**: O termo "covers" (padrão do setor de restaurantes para número de pessoas atendidas) não é intuitivo para usuários brasileiros sem experiência no setor.
**Decisão**: Usar "Pessoas" em toda a UI de relatórios. O campo interno continua sendo `party_size` no banco — apenas o label de exibição foi alterado.
**Razão**: Clareza para o operador. O sistema é para uso diário por funcionários que podem não conhecer jargão técnico do setor.

---

### 2026-02-22 — Resend: locale da reserva para idioma do email

**Contexto**: Ao enviar email de cancelamento ou no-show, precisamos saber o idioma preferido do cliente sem query extra.
**Decisão**: Usar `reservations.locale` (copiado de `customers.preferred_locale` no momento da criação da reserva via `POST /api/reservations`). Para cancelamento e no-show, o campo `locale` é selecionado diretamente no select da reserva — sem join adicional em `customers`.
**Razão**: O campo `locale` na tabela `reservations` existe exatamente para esse caso de uso — snapshot do idioma no momento da reserva, acessível sem join. Evita uma query desnecessária.

---

### 2026-03-02 — Redesign do sistema visual: premium, minimalista e sofisticado

**Contexto**: O design system original usava lime (verde-lima vibrante) como cor primária, com fundo branco puro e raio de borda pequeno (0.45rem). A direção visual não transmitia a sofisticação esperada para uma interface de reservas de restaurante premium.
**Decisão**: Adotar nova direção visual documentada em `DesignSystem.md`:
- Cor primária: verde escuro `#1F3A34` (forest green profundo)
- Fundo: off-white quente `#F6F3EE` — nunca branco puro
- Cards: branco puro sobre fundo tintado, criando profundidade sutil
- Acento: terracota `#C97C6A` — usado com parcimônia
- Detalhe premium: dourado queimado `#B59A5A` — apenas em microdetalhes (avaliações, progresso)
- Raio de borda: `0.75rem` (de 0.45rem) — mais arredondado, mais moderno
- Sombras: suaves e realistas, nunca dramáticas
- Tipografia: Inter mantida, mas com tracking-tight em títulos e leading-relaxed no corpo
- Estética geral: editorial, hotelaria de alto padrão, "luxo moderno não extravagante"
**Razão**: O produto é uma interface de reservas para restaurante sofisticado. A experiência pública (formulário de reserva) é a vitrine do restaurante e deve transmitir elegância e confiança. O lime vibrante era inconsistente com essa proposta.
**Impacto**: Afeta principalmente as fases de refinamento visual (9–14). O `DesignSystem.md` foi reescrito com todos os tokens, diretrizes de componentes e notas de implementação técnica.

---

### 2026-03-02 — Fase 9: calendário auto-close com estado controlado

**Contexto**: O Popover do calendário no formulário de reserva ficava aberto após selecionar uma data, sobrepondo os campos dinâmicos que aparecem abaixo.
**Decisão**: Usar `open`/`onOpenChange` + `useState(false)` para controlar o Popover; fechar no callback `handleDateSelect` após setar o valor.
**Razão**: Elimina sobreposição visual e melhora a percepção de fluidez — o usuário seleciona a data e o calendário fecha automaticamente, revelando os horários disponíveis.

---

### 2026-03-02 — Fase 9: incrementer +/- para seleção de pessoas (substituição do Select)

**Contexto**: O `<Select>` de party_size era menos intuitivo em mobile e não comunicava os limites min/max da acomodação selecionada.
**Decisão**: Substituir `<Select>` por um incrementer com botões ghost `−` e `+` e valor central, respeitando `min_seats` e `max_seats` da acomodação selecionada.
**Razão**: Mais intuitivo em touch, comunica visualmente os limites (botão desabilitado quando no extremo), e elimina o dropdown que frequentemente causa problemas de scroll em mobile.

---

### 2026-03-02 — Fase 9: tokens globais aplicados antes das páginas individuais

**Contexto**: A migração do design system afeta CSS variables que impactam toda a app (admin e público).
**Decisão**: Atualizar `globals.css` como primeiro passo da Fase 9 (T1), verificar admin antes de prosseguir, e aplicar tokens nas páginas públicas nas tarefas seguintes.
**Razão**: Centralização dos tokens evita inconsistências; o admin usa `--sidebar-*` que foram atualizados para verde escuro — visualmente melhora o admin mesmo sem tocar nos componentes admin individualmente.

---

### 2026-03-02 — Fase 9: --accent repurposed como verde claro; --highlight para terracota

**Contexto**: No sistema shadcn/ui, `--accent` é usado como background de hover em Calendar, Select, Command, etc. A Fase 9 precisava de terracota como cor de destaque (barra de progresso, títulos de etapa), mas usar terracota em `--accent` tornava todos os hovers visualmente agressivos.
**Decisão**: Separar em dois tokens: `--accent: oklch(0.930 0.015 162)` (verde menta claro, para hover e bg de superfície sutil) e `--highlight: oklch(0.600 0.095 28)` (terracota, apenas para elementos decorativos pontuais). Mapeado em `@theme inline` como `--color-highlight` para uso via `bg-highlight`, `text-highlight`.
**Razão**: Preserva o comportamento esperado dos componentes shadcn/ui (hover em verde sutil) enquanto mantém o terracota disponível para uso explícito. O `--highlight` é usado com parcimônia — não como bg de superfície grande.

---

### 2026-03-02 — Fase 9: --muted escurecido para contraste do header do card

**Contexto**: O card do formulário usa `bg-muted` no header para criar uma camada visual distinta do body branco. Com `--muted: oklch(0.945 0.008 75)` (levemente mais claro que a página `oklch(0.970)`), a diferença era imperceptível em telas calibradas.
**Decisão**: Alterar `--muted` para `oklch(0.925 0.015 75)` — mais escuro e levemente mais quente, equivalente a ~#EFEAE4. Criando a hierarquia correta: página (97% L) → header do card (92.5% L) → body do card (100% L branco).
**Razão**: A profundidade visual (página → header → body) é fundamental para a identidade premium. Sem esse contraste, o card parece um bloco plano sem estrutura.

---

### 2026-03-02 — Fase 9: padrão de card público com py-0 gap-0

**Contexto**: O componente `Card` do shadcn/ui tem `py-6 gap-6` por padrão (padding vertical e gap entre filhos flex). Para o layout desejado (header colado ao topo + barra de progresso sem gaps), essas classes bloqueavam a estrutura.
**Decisão**: Sempre usar `<Card className="overflow-hidden rounded-2xl py-0 gap-0">` nos cards públicos (formulário, sucesso, cancelamento). O espaçamento vertical é controlado manualmente pelos filhos (header tem seus próprios `pt-5 pb-4`, CardContent tem `pt-5 pb-6`).
**Razão**: `overflow-hidden` + `rounded-2xl` faz o header `bg-muted/accent` respeitar os cantos arredondados do card sem necessidade de adicionar raio ao header em separado. `py-0 gap-0` dá controle total do espaçamento.

---

### 2026-03-02 — Fase 9: identidade visual unificada entre formulário, sucesso e cancelamento

**Contexto**: As páginas de sucesso e cancelamento tinham layouts próprios (centrado, sem card estruturado) que não correspondiam à identidade visual do formulário de reserva.
**Decisão**: Todas as páginas públicas seguem o mesmo padrão: logo Domo no topo (círculo `bg-primary` + "D" + "Restaurante Domo") + card com header colorido + conteúdo em `CardContent`. O header usa `bg-accent` (verde claro) para estados de sucesso/confirmação e `bg-muted` para estados neutros ou de ação.
**Razão**: Consistência visual cria confiança. O usuário navega pelo fluxo completo (formulário → sucesso → eventual cancelamento) sem perceber quebra de identidade. O padrão de card com header também facilita scan rápido: o header comunica o estado, o body traz os detalhes.

---

### 2026-03-02 — Fase 9: aviso de garantia em parchment/dourado em vez de âmbar

**Contexto**: O aviso de garantia com cartão no step Stripe usava `bg-amber-50 border-amber-200` — padrão de alerta/warning que criava tensão visual desnecessária numa tela já sensível (dados de cartão).
**Decisão**: Substituir por `bg-[#FAF4E8] border-[#C9A96E]` (parchment quente + borda dourado suave) com textos `text-[#4A3500]` / `text-[#5C4510]`. Ícone `ShieldAlert text-[#8B6914]`.
**Razão**: O objetivo do aviso não é alarmar — é informar com elegância. O tom parchment/dourado é consistente com a paleta quente do design system e transmite "informação premium" em vez de "alerta de sistema".

---

### 2026-03-02 — Fase 9: botões de navegação com labels dinâmicos por etapa

**Contexto**: O botão "Avançar" era genérico em todas as etapas, sem comunicar o que aconteceria a seguir.
**Decisão**: Labels dinâmicos: Step 1 → "Continuar"; Step 2 com cartão → "Continuar para garantia"; Step 2 sem cartão → "Continuar para revisão"; Step de cartão → "Revisar reserva"; Confirmação → "Confirmar e finalizar".
**Razão**: Cada etapa tem um contexto diferente — antecipar o próximo passo reduz ansiedade e aumenta confiança no fluxo. "Confirmar e finalizar" comunica claramente que a reserva será criada.


---

### 2026-03-04 — Admin Theme: sidebar branca (light) e fundo cinza neutro frio

**Contexto**: O painel admin usava `--sidebar: oklch(0.270 0.055 162)` (verde escuro `#1F3A34`) como fundo da sidebar e herdava `--background: oklch(0.970 0.008 75)` (bege quente `#F6F3EE`) como fundo das páginas. O verde da sidebar é a cor primária do restaurante — adequada para a vitrine pública, mas no admin cria UI pesada e temática em vez de profissional. O bege, igualmente, é premium para o formulário mas parece "papel velho" num contexto de ferramenta.
**Decisão**:
- **Sidebar**: Mudar para branca (`#FFFFFF`) com borda direita zinc-200 (`#E4E4E7`). Texto: zinc-600. Item ativo: bg zinc-100 + texto zinc-900 bold. Item hover: zinc-100/60. Logo "Domo" mantém `text-primary` (verde no branco = excelente contraste + marca presente). Referência visual: Notion, Figma, Clerk.
- **Admin background**: Adicionar `bg-[#F4F4F5]` diretamente no wrapper do layout autenticado admin. O `--background` global (bege quente) permanece inalterado para as páginas públicas.
- **Separação**: A identidade visual do formulário público (premium, warm, elegante) e do painel admin (clean, neutral, profissional) são explicitamente separadas.
**Razão**: Ferramentas admin devem se comportar como ferramentas — neutrais, escaneáveis, sem cor temática como superfície estrutural. A cor primária verde é reservada para ações (botões CTA, badges de status, active accents), não como background de navegação.
**Impacto**: Afeta `globals.css` (vars `--sidebar-*`), `admin-sidebar.tsx` (classes nav items), `layout.tsx` do admin autenticado (bg do wrapper). Nenhum impacto nas páginas públicas.

---

### 2026-03-02 — Cancelamento: header neutro, ícones semânticos e botão único

**Contexto**: A página de "Reserva cancelada" usava `bg-accent` (verde claro) no header e `CheckCircle2` como ícone — visual de "sucesso" inadequado para uma ação de cancelamento. O header de confirmação de cancelamento usava `XCircle`. Havia dois links de navegação ("Fazer nova reserva" + "Voltar ao início").
**Decisão**:
- Estado "Reserva cancelada": header `bg-muted` (neutro) + ícone `XCircle text-muted-foreground`
- Estado "Cancelar reserva" (confirmação): ícone `AlertTriangle` (warning, mais semântico para ação destrutiva iminente)
- Navegação pós-cancelamento: único link "Fazer nova reserva" — "Voltar ao início" removido
**Razão**: Cancelamento não é uma ação positiva — o verde claro e o check transmitiam a mensagem errada. `XCircle` comunica encerramento/remoção; `AlertTriangle` comunica atenção antes de uma ação irreversível. Um único CTA pós-cancelamento é mais focado: o usuário ou refaz uma reserva ou fecha a aba.

---

### 2026-03-04 — Fase 10: topbar mobile-only; logout e info de usuário no footer da sidebar

**Contexto**: O admin tinha um topbar persistente em desktop mostrando título da página + logout. Com o novo tema de sidebar branca, o topbar criava redundância visual (duas faixas horizontais) e o logout ficava isolado do contexto do usuário.
**Decisão**: Adicionar `lg:hidden` ao topbar — ele passa a existir apenas em mobile (sheet drawer). Adicionar footer à sidebar com: avatar de iniciais, displayName, label de cargo (Proprietário/Gerente/Operador) e botão de logout inline. Cada página passa a gerenciar seu próprio header (título + ações).
**Razão**: Em desktop, o topbar era redundante com o header de cada página. Mover o logout para a sidebar coloca a identidade do usuário sempre visível e a ação de saída próxima a esse contexto — padrão adotado por Notion, Linear, Figma e similares.
**Impacto**: `admin-sidebar.tsx` (footer), `admin-topbar.tsx` (lg:hidden + sheet footer), `layout.tsx` (passa displayName), todas as páginas admin (header próprio).

---

### 2026-03-04 — Fase 10: 5 cards no dashboard (adicionado "Canceladas")

**Contexto**: O dashboard tinha 4 cards: Total, Confirmadas, Pendentes, Clientes Esperados. A taxa de cancelamento é uma métrica operacional relevante que estava ausente.
**Decisão**: Adicionar 5º card "Canceladas" com `bg-zinc-100 text-zinc-400` (neutro, não alarme) e description mostrando `X% do total` ou "nenhum cancelamento". Grid atualizado para `lg:grid-cols-5`.
**Razão**: Cancelamentos frequentes indicam problema operacional (reservas demoram para ser confirmadas, horários mal calibrados, etc). A taxa de cancelamento ao lado da taxa de confirmação dá contexto imediato para o operador.

---

### 2026-03-04 — Fase 10: dashboard card pattern alinhado com Relatórios (KpiCard)

**Contexto**: Os cards do dashboard usavam layout próprio: icon pequeno no topo-esquerda, valor abaixo, label abaixo do valor. Os cards de Relatórios (KpiCard) usavam layout diferente: label muted em cima, valor 3xl bold, icon h-10 w-10 na direita.
**Decisão**: Adotar o padrão KpiCard do Relatórios em todos os cards do sistema admin. Wrapper: `rounded-xl border bg-card p-5 shadow-sm`. Layout: `flex items-start justify-between` com `div.flex-1` (label + value + description) e icon container `h-10 w-10 rounded-lg` à direita.
**Razão**: Consistência visual entre Dashboard e Relatórios. O padrão KpiCard é mais escaneável (label explica o número antes de o usuário lê-lo) e o icon grande à direita cria um ponto focal visual sem competir com o número.

---

### 2026-03-04 — Fase 10: Relatórios como fonte da verdade para padrões de card/tabela/gráfico

**Contexto**: Diferentes páginas admin usavam wrappers inconsistentes para tabelas (`rounded-md border`, `rounded border border-border/60`, `overflow-hidden rounded-xl border border-border/60`) e cards sem padrão unificado. A página de Relatórios tinha o padrão mais refinado.
**Decisão**: Usar a página de Relatórios como fonte da verdade para três padrões:
- **Card**: `rounded-xl border bg-card p-5 shadow-sm`
- **Gráfico**: bare `div.rounded-xl border bg-card p-5 shadow-sm` + `div.mb-4 > h3 + p.muted` header
- **Tabela**: `overflow-hidden rounded-xl border bg-card shadow-sm` wrapping `<Table>`

Todos os arquivos de tabela do admin foram migrados para esse padrão (ver lista completa em `plans/completed/fase-10.md`).
**Razão**: Consistência visual reduz carga cognitiva do operador e simplifica manutenção. Um único padrão para cada tipo de container elimina variações acidentais. Usar Relatórios como referência (em vez de criar padrão novo) mantém o trabalho já feito como âncora.

---

### 2026-03-04 — Fase 11: CalendarHeader dentro do card como seção border-b

**Contexto**: O plano original deixava o `CalendarHeader` (navegação de mês) fora do card, flutuando entre o título e o grid. Isso criava dois blocos visuais separados onde deveria haver um único bloco coeso.
**Decisão**: Renderizar `CalendarHeader` como a seção `border-b px-4 py-4` do card, acima do grid. A estrutura final é: card > (border-b header) + (grid overflow-x-auto) + (border-t legenda).
**Razão**: O padrão tabela do admin tem sempre um header `border-b` como parte do card (ver Relatórios, top-accommodations-table). Aplicar o mesmo padrão ao calendário cria consistência e faz o header de navegação "pertencer" visualmente ao calendário.

---

### 2026-03-04 — Fase 11: limiares de ocupação do calendário revisados (35%/70%)

**Contexto**: Os limiares originais eram ≤ 50% = Baixa, 51–80% = Média, > 80% = Alta. Na prática, `getTotalCapacityForDate` soma capacidade de TODOS os horários × TODAS as acomodações do dia — o denominador é alto. Um dia com 1 reserva de 25 pessoas num restaurante com 2 turnos × 2 tipos × 50 covers = capacidade 200 → 12,5% = Baixa, mesmo sendo operacionalmente relevante.
**Decisão**: Ajustar limiares para < 35% = Baixa, 35–70% = Média, > 70% = Alta. Adicionar percentual explícito na célula ("X% ocupação") para que o admin sempre veja o valor real, independente da classificação de cor.
**Razão**: Limiares mais baixos tornam o calendário mais útil como ferramenta operacional — dias parcialmente ocupados ficam visíveis antes de atingir metade da capacidade. O percentual explícito elimina ambiguidade e compensa variações de configuração (restaurantes com capacidade muito alta ou muito baixa).

---

### 2026-03-04 — Fase 11: ocupação usa bg-amber-100 (não bg-amber-50) para evitar confusão com bege

**Contexto**: `bg-amber-50` (#fffbeb) é visualmente indistinguível do bege `--background` (#F6F3EE) das páginas públicas. Células de média ocupação apareciam com a mesma tonalidade do fundo aquecido, tornando a indicação inútil.
**Decisão**: Usar `bg-amber-100` (#fef3c7) para Média e `bg-rose-100` (#ffe4e6) para Alta — tints de nível 100 são perceptivelmente coloridos sem serem agressivos. Baixa continua em `bg-emerald-50` (verde claro é naturalmente distinto do bege). Legenda atualizada para usar as mesmas classes exatas.
**Razão**: A legenda e as células precisam usar exatamente os mesmos tokens — qualquer divergência quebra a confiança do usuário na legenda. Tints -100 resolvem a confusão com bege sem precisar de cores mais saturadas.

---

### 2026-03-04 — Fase 11: popover de preview de reservas no calendário

**Contexto**: Clicar em um dia navegava diretamente para `/admin/reservas?date=X`, forçando uma troca de página para ver quais reservas existem. Para dias com poucas reservas, o admin precisava de um preview rápido sem sair do calendário.
**Decisão**: Dias com reservas abrem um `Popover` (side=right, align=start) com: header (contagem + total pax), lista de reservas com dot de status, nome do cliente, horário · pax, label de status, `max-h-60 overflow-y-auto`. Footer com link "Ver todas →". Dias sem reservas ou fechados ainda navegam direto ao clicar.
**Razão**: O popover preserva o contexto do calendário para consulta rápida. O link "Ver todas" preserva o caminho de navegação profunda para dias movimentados. A distinção de comportamento (popover com reservas / navegar sem reservas) é intuitiva — clicar num dia vazio = intenção de criar reserva.

---

### 2026-03-04 — Fase 11: getCalendarioData retorna ReservationFull[]

**Contexto**: O calendário buscava `reservations` com `select("*")` — tipo base sem joins. O novo popover precisa do nome do cliente (`customer.first_name/last_name`).
**Decisão**: Mudar query para `select("*, customer:customers(*), accommodation_type:accommodation_types(*), time_slot:time_slots(*)")`, retornando `ReservationFull[]`. Propagar o tipo em `CalendarioData`, `CalendarioContent` e `MonthGrid`.
**Razão**: Join necessário para o popover. A sobrecarga de dados é aceitável — o calendário carrega reservas do mês inteiro de uma vez; adicionar joins de cliente e acomodação não muda a estrutura de queries, apenas enriquece o payload com dados já existentes no banco.


---

### 2026-03-04 — Fase 12: paleta admin migrada de bege quente para zinc puro

**Contexto**: Tokens `--background`, `--muted`, `--secondary`, `--border`, `--input` usavam oklch com chroma/hue aquecido (`0.008–0.015 75`), resultando em um tom bege perceptível em fundos e bordas do admin — conflitando com o design system neutro zinc desejado para o painel.
**Decisão**: Migrar todos esses tokens para oklch com chroma = 0 (zinc puro), preservando a luminosidade. Tokens das páginas públicas (`--background` bege, `--muted` quente, `--accent` verde-claro) permanecem inalterados.
**Razão**: Admin deve usar escala de cinza fria e neutra; o bege é identidade das páginas públicas do restaurante. Separação clara evita contaminação visual entre os dois contextos.

---

### 2026-03-04 — Fase 12: timeline do drawer usa flex-col (não position absolute)

**Contexto**: A implementação original da timeline do histórico usava `absolute -left-[22px]` para posicionar os dots, causando desalinhamento de ~6px em relação à linha conectora.
**Decisão**: Cada item da timeline é `flex gap-4`; coluna esquerda é `flex flex-col items-center` com dot `h-2.5 w-2.5` e conector `w-px flex-1 bg-zinc-200 my-1` — tudo em fluxo normal sem absolute.
**Razão**: Flex-col garante alinhamento perfeito independente do tamanho do conteúdo. Solução mais simples e robusta que calcular offsets manuais.

---

### 2026-03-04 — Fase 12: histórico de edições em tabela separada (reservation_edit_history)

**Contexto**: O usuário pediu que edições de campos (data, horário, acomodação, pessoas, etc.) aparecessem no histórico do drawer, junto às mudanças de status. A opção era reutilizar `reservation_status_history` com notas especiais ou criar tabela dedicada.
**Decisão**: Criar migration `005_reservation_edit_history` com tabela `reservation_edit_history(id, reservation_id, changes JSONB, changed_by, created_at)`. O campo `changes` armazena array de `{field, label, from, to}` com valores já formatados para exibição.
**Razão**: `reservation_status_history` tem schema acoplado a status (`from_status`, `to_status` como enums). Misturar edições quebraria o tipo e a semântica. Tabela dedicada mantém separação de responsabilidades e permite consultas independentes. Valores pré-formatados no insert evitam resolver nomes de acomodação no client.

---

### 2026-03-04 — Fase 12: resolução de taxa de no-show por prioridade

**Contexto**: A taxa de no-show pode ser configurada em três lugares: `reservations.no_show_fee_override` (por reserva), `exception_dates.no_show_fee_override` (por data), e `settings.no_show_fee.amount` (global). O drawer precisa mostrar o valor efetivo que será cobrado.
**Decisão**: Prioridade explícita: reserva > data > global. Resolvido em `getReservationDetails()` — retorna `effectiveNoShowFee: number | null` e `noShowFeeSource: "reservation_override" | "date_override" | "default" | "none"`. Drawer exibe o valor com label de origem quando não é o padrão.
**Razão**: A resolução deve acontecer no server (Server Action), não no client — evita múltiplas queries separadas e garante consistência com a lógica usada em `charge-no-show`.

---

### 2026-03-04 — Fase 12: seção Avançado do modal de edição oculta sem cartão

**Contexto**: O campo de override de taxa de no-show no modal de edição é irrelevante para reservas sem cartão cadastrado — não há como cobrar no-show sem `stripe_payment_method_id`.
**Decisão**: Seção "Avançado" (que contém apenas o campo de taxa) renderiza condicionalmente: `{reservation?.stripe_payment_method_id && (...)}`. Separador também oculto junto.
**Razão**: Reduz ruído cognitivo para o operador. Um campo desabilitado ainda levanta dúvidas; ocultá-lo é mais limpo e evita edições inúteis.
