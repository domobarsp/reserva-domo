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
                                          └─ Fase 8 (Relatórios) ✅
                                               └─ Fase 9 (Refinamento — Home & Formulário) ✅
                                                    └─ Fase 10 (Refinamento — Admin Theme + Dashboard + Padronização) ✅
                                                         └─ Fase 11 (Refinamento — Calendário) ✅
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
**Status**: `COMPLETE`

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
**Status**: `COMPLETE`

**Escopo**:
Revisão completa da experiência pública: landing page, formulário multi-step, página de sucesso e página de cancelamento.

**Itens**:

### Landing Page
- Hero muito minimalista: ausência de imagens, texturas ou seções de conteúdo torna a página "estéril"
- Header sem links de navegação úteis (ex: âncora para seção de info, horários)
- Footer sem dados relevantes do restaurante (endereço, horários, redes sociais)
- CTA único — avaliar adicionar uma seção "Como funciona" ou "Destaques" abaixo do hero
- Botão "Reservar" no navbar fica sem respiro nas laterais em mobile
- Revisar contraste do texto branco sobre `bg-primary` (verde-limão) para acessibilidade

### Formulário Multi-step
- Popover do calendário de datas sobrepõe os campos que aparecem abaixo (time slots), confundindo o usuário — fechar automaticamente ao selecionar data
- Campos surgem dinamicamente (data → horário → acomodação → pessoas): adicionar transição suave (fade/slide-in) para evitar "saltos" de layout
- Cards de acomodação (Mesa vs Balcão): hierarquia visual das informações de vagas/capacidade ligeiramente desorganizada
- Seletor de número de pessoas é dropdown simples — avaliar incrementador (+/-) para facilitar
- Step 2 (dados do cliente): campos Nome + Sobrenome em grid 2 colunas ficam estreitos demais em mobile — empilhar verticalmente
- Label "(emails de confirmação)" ao lado do seletor de idioma com pouco contraste e tamanho de fonte pequeno
- Botões "Voltar" / "Avançar" com pouco respiro em relação ao último campo do formulário

### Step de Cartão (Stripe)
- Revisar layout do Stripe Payment Element no contexto do card do formulário
- Garantir feedback visual de loading/erro durante comunicação com Stripe

### Página de Sucesso
- Revisar quais informações são exibidas (data, horário, acomodação, nome do cliente)
- Verificar se o link de cancelamento está visível e claro
- Polimento visual geral da página

### Página de Cancelamento
- Garantir estados distintos e informativos: carregando, já cancelado, erro, sucesso
- Texto e hierarquia visual claros para cada estado

**Critérios de aceitação**:
- [ ] Landing page com pelo menos uma seção de conteúdo adicional ao hero (destaques, como funciona ou info do restaurante)
- [ ] Header e footer públicos com informações relevantes
- [ ] Calendário fecha automaticamente ao selecionar data e não sobrepõe campos seguintes
- [ ] Aparição de campos dinâmicos com transição suave (sem salto abrupto)
- [ ] Formulário legível e sem overflow em mobile (320px+)
- [ ] Página de sucesso e cancelamento com estados claros e design polido
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 10 — Refinamento Visual — Dashboard
**Status**: `COMPLETE`

**Escopo**:
Duas frentes: (1) Admin Theme Reset cross-cutting — sidebar branca e fundo cinza neutro frio para todas as páginas admin, base para fases 10–14; (2) Refinamento específico do dashboard: cards, seletor de período, tabela, estados empty/loading.

**Itens**:

### Admin Theme Reset (cross-cutting — executar primeiro)

- Sidebar: mudar de verde escuro para branca (light), estilo Notion/Figma — `bg-sidebar` → `#FFFFFF`, borda zinc-200, texto zinc-600, item ativo zinc-100 + zinc-900
- Admin background: `bg-[#F4F4F5]` no wrapper do layout autenticado — o bege `--background` permanece para páginas públicas
- Validar todas as páginas admin visualmente após as mudanças

### Cards de Estatísticas
- 4 cards (Reservas Hoje, Confirmadas, Pendentes, Ocupação) com badge colorido no topo e microcopy descritivo — estrutura boa, mas cards com `0` ficam sem contexto visual de urgência vs. normalidade
- Badge de ícone verde no card "Reservas Hoje" usa ícone de calendário mas o label do badge (`0 no dia`) repete informação do valor — avaliar badge mais informativo (ex: tendência, comparativo com dia anterior)
- Card "Ocupação" mostra `0/76` no badge — `76` é pouco intuitivo sem unidade (deve ser `76 cadeiras` ou similar)
- Cards com valor `0%` para "Confirmadas" e `0` para "Pendentes" têm microcopy fixo positivo ("Boa taxa de confirmação") — deve ser contextual ao valor real
- Espaçamento entre os 4 cards e a seção "Reservas de Hoje" pode ter mais respiro

### Seletor de Período
- Pills (Hoje / Esta semana / Próximos 15 dias) funcionais, mas sem feedback visual claro de qual está ativo além do outline
- Pill ativo deveria ter preenchimento sólido para contraste maior

### Tabela do Período
- Estado empty "Nenhuma reserva para hoje" com texto simples e sem ícone — adicionar ícone e texto mais encorajador
- Para períodos > 1 dia, adicionar coluna de Data à tabela (atualmente não visível)
- Sem coluna de resumo de covers (pax) na tabela do dashboard

### Responsividade
- Cards em grid de 4 colunas — verificar comportamento em tablet (provavelmente quebra feio)
- Tabela precisa de colunas colapsáveis ou scroll horizontal em mobile

**Critérios de aceitação**:
- [ ] Sidebar branca com borda zinc, texto zinc, item ativo zinc-100
- [ ] Admin background zinc-100 (`#F4F4F5`) — bege preservado para páginas públicas
- [ ] Todas as páginas admin visualmente validadas pós-theme-reset
- [ ] Cards com microcopy contextual ao valor atual (não texto fixo positivo quando há pendências)
- [ ] Pill ativo com visual sólido/preenchido
- [ ] Empty state da tabela com ícone e texto adequado
- [ ] Cards responsivos em tablet (2 colunas) e mobile (1 coluna)
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 11 — Refinamento Visual — Calendário
**Status**: `COMPLETE`

**Escopo**:
Revisão do calendário visual mensal: grid, células, legenda, navegação e estados de ocupação.

**Itens**:

### Grid e Células
- Células dos dias sem reserva ficam completamente vazias — sem indicador visual de "disponível" vs. "fechado"
- Células com dados (ex: dia 27: "4 res. 9 pax") ficam com texto pequeno e sem hierarquia — número de reservas e pax deveriam ter pesos diferentes
- Proporção das células: altura relativamente baixa, tornando o calendário comprimido — aumentar altura mínima por célula
- O número do dia (ex: "22") está em verde (dia atual) mas sem ring/destaque de borda suficientemente forte para destacar
- Dias sem movimento têm apenas o número — uma célula cinza sutil ou um ponto indicaria "sem reservas" vs. "fechado"

### Legenda
- Legenda (Baixa / Média / Alta / Fechado) está no rodapé do calendário — funciona, mas os ícones de cor são muito pequenos
- Considerar mover a legenda para próximo do header do calendário ou tooltip em hover

### Navegação
- Botões de navegar mês (‹ ›) são pequenos e sem label — adicionar `aria-label` e talvez exibir o mês de destino em hover (tooltip)
- Sem feedback de loading ao mudar de mês (troca imediata pode parecer travamento)

### Clique em Célula
- Clicar em um dia navega para `/admin/reservas?data=X` — confirmar que esse comportamento é perceptível (talvez cursor pointer e hover state na célula)

### Responsividade
- Em telas menores que 768px o grid de 7 colunas fica muito comprimido — avaliar scroll horizontal ou visualização alternativa compacta

**Critérios de aceitação**:
- [ ] Células com altura mínima maior e texto com hierarquia (res. em bold, pax em muted)
- [ ] Dia atual com destaque de borda visível e cor
- [ ] Dias sem reservas com indicador visual sutil de status (disponível vs. fechado)
- [ ] Navegação de mês com feedback de loading
- [ ] Responsividade adequada em tablet
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 12 — Refinamento Visual — Reservas (Lista + Drawer)
**Status**: `COMPLETE`

**Escopo**:
Revisão da página de gestão de reservas: filtros, tabela e drawer de detalhes.

**Itens**:

### Filtros
- Filtro de data exibe texto truncado ("sexta-feira, 27 de feve...") — aumentar largura ou abreviar formato de exibição
- Select "Todas acomodacoe" sem acento — corrigir texto ("Todas as acomodações")
- Os 3 filtros + "Limpar filtros" ficam em uma linha plana sem agrupamento visual — poderia ter um label "Filtros:" ou separador
- Botão "Nova Reserva" muito distante dos filtros (extremo oposto da tela) — avaliar se faz sentido ou se o header poderia ser reestruturado

### Tabela
- Coluna "DATA" repete a mesma data em todas as linhas quando filtrado por dia — desnecessário; pode ser suprimida quando há filtro de data ativo
- Badge de status "Cancelado" exibido em texto cinza sem cor de fundo — sem destaque visual (diferente de "Não Compareceu" que tem fundo vermelho) — padronizar
- Ícones de cartão (coluna antes de "...") têm significado pouco claro sem tooltip — o que o ícone de cartão cinza vs. laranja significa?
- Coluna "ACÕES" sem acento — corrigir para "AÇÕES"
- Sem indicador de clique na linha (cursor pointer, hover state) — usuário pode não saber que a linha é clicável para abrir o drawer

### Drawer de Detalhes
- Estrutura boa: cabeçalho com nome + badge de status, metadados (data, horário, tipo, pessoas), seções Cliente, Garantia & Cobrança, Histórico
- Seções com label em uppercase pequeno (`CLIENTE`, `GARANTIA & COBRANÇA`, `HISTÓRICO`) — boa hierarquia
- Histórico: timestamps no formato `21/02 17:23` sem o ano — pode gerar ambiguidade; avaliar `21/02/2026 17:23`
- Falta de ações de transição de status diretamente no drawer (ex: botões "Confirmar", "Check-in", "No-show") — o usuário precisa ir ao menu `...` na tabela
- Drawer não tem scroll próprio quando o conteúdo é longo — avaliar overflow interno
- Sem ação de "Fechar" óbvia além do `X` no canto — ESC deveria funcionar (confirmar)

### Responsividade
- Tabela com 7 colunas em mobile ficaria muito comprimida — colunas menos relevantes devem ser ocultadas (DATA, ACOMODAÇÃO)
- Drawer deve ocupar tela cheia em mobile

**Critérios de aceitação**:
- [ ] Textos com erros de acentuação corrigidos em toda a página
- [ ] Badge "Cancelado" com cor de fundo consistente com os demais status
- [ ] Linha da tabela com hover state e cursor pointer indicando clicabilidade
- [ ] Drawer com botões de ação de transição de status
- [ ] Drawer responsivo (fullscreen em mobile)
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 13 — Refinamento Visual — Lista de Espera & Passantes
**Status**: `COMPLETE`

**Escopo**:
Revisão das páginas de Lista de Espera e Passantes: filtros, tabelas e drawers.

**Itens**:

### Filtros (compartilhados entre as duas páginas)
- Layout de filtros idêntico em ambas as páginas (Nome, Telefone, Data) — campo de busca ocupa ~70% da largura, os outros 2 ficam menores e sem label visível
- Input de telefone sem formatação/máscara — pode confundir o operador ao digitar
- Filtro de Data exibe apenas o placeholder "Data" sem indicar se é para filtro de data de entrada ou data de criação

### Lista de Espera
- Empty state bem executado (ícone + texto centralizado)
- Botão "Adicionar" no canto superior direito — pouco visível se a lista estiver vazia (sem CTA de destaque no empty state)
- Tabela deve ter colunas: Nome, Pessoas, Horário desejado, Contato, Status, Ações — confirmar que todas estão presentes
- Ação "Acomodar" deve ter confirmação ou transição de status clara

### Passantes
- Tabela tem: Horário (formato `22/02 20:29` — legível), Nome, Telefone, Email, Pessoas, Solicitações
- Coluna "Solicitações" exibe `—` quando vazia — frio visualmente; avaliar `Nenhuma` em muted
- Horário com data e hora junto (`22/02 20:29`) — data em muted e hora em negrito melhoraria hierarquia
- Sem destaque visual para registros do dia atual vs. passados
- Empty state: sem registros = página muito vazia sem direcionamento para o operador
- Linha clicável para drawer? Verificar se o drawer de passantes está acessível via clique na linha (não só pelo `...`)

### Consistência entre páginas
- Header pattern idêntico (título + botão de ação) ✓
- Filtros no mesmo layout ✓
- Garantir que os drawers de ambas as páginas sigam o mesmo padrão visual do drawer de Reservas

**Critérios de aceitação**:
- [ ] Filtros com labels visíveis e espaçamento adequado em ambas as páginas
- [ ] Empty states com CTA de destaque (botão "Adicionar" visível no estado vazio)
- [ ] Hierarquia visual na coluna de Horário (data muted, hora bold)
- [ ] Drawers de Lista de Espera e Passantes com mesmo padrão visual do drawer de Reservas
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 14 — Refinamento Visual — Configurações & Acessos
**Status**: `COMPLETE`

**Escopo**:
Revisão das páginas de Configurações (hub + 6 sub-páginas) e Acessos.

**Itens**:

### Hub de Configurações
- Grid de cards de navegação — verificar se os cards têm ícone, título e descrição curta visível
- Verificar hierarquia e tamanho dos cards; cards muito grandes ou muito pequenos para o conteúdo que descrevem

### Sub-página: Horários
- Tabela limpa e funcional (NOME / INÍCIO / TÉRMINO / DIAS DA SEMANA / ATIVO / AÇÕES)
- Chips dos dias da semana (Dom, Seg, Ter...) individualmente — quando todos são exibidos, a coluna fica larga e densa
  - Avaliar exibir em formato compacto quando são todos os dias ("Diário" ou "Dom–Sáb")
- Toggle "Ativo" (switch verde) bem posicionado — confirmar que há feedback de carregamento ao alternar
- Botões de ação (editar ✏️ e excluir 🗑️) pequenos, sem label — confirmar que têm tooltip
- Dialog de edição/criação: revisar layout e UX dos campos (nome, horário início/fim, dias, ativo)

### Sub-páginas: Acomodações, Capacidade, Garantia, Taxa, Exceções
- Garantir que todas seguem o mesmo padrão de header de sub-página (botão de voltar ← + título + descrição + botão de ação primária)
- Formulários de CRUD devem ter labels claros, campos com tamanho adequado e feedback de erro inline
- Empty states padronizados com mesmo ícone + texto + CTA

### Página de Acessos
- Tabela com badges de cargo e status — verificar legibilidade e contraste
- Menu de ações por linha (`...`) — avaliar se ações críticas (desativar, remover) têm confirmação
- Dialog de criação/convite: campo de email + seletor de role; revisar layout e feedback

### Feedback Global
- Toasts de confirmação (sucesso/erro) padronizados e com posição consistente
- Loading states nos botões de submit dos formulários e dialogs
- Confirmar que todas as sub-páginas têm breadcrumb ou link de volta ao hub de Configurações

**Critérios de aceitação**:
- [ ] Chips de dias da semana com versão comprimida para "todos os dias"
- [ ] Todas as sub-páginas com header padrão (voltar + título + descrição + ação)
- [ ] Empty states padronizados em todas as sub-páginas
- [ ] Toasts de feedback presentes em todas as ações de CRUD
- [ ] Botões com loading state ao submeter
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Fase 15 — Produção & Deploy
**Status**: `COMPLETE`

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
