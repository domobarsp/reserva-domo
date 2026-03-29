# Fase 9 — Refinamento Visual — Home & Formulário de Agendamento

**Status**: `PLANNED`
**Data**: 2026-03-02

---

## Contexto

Esta fase combina dois escopos:
1. **Migração do design system** para o novo tema premium (verde escuro, off-white, raio maior) — aplicada apenas nas páginas públicas nesta fase
2. **Refinamentos de UX/UI** identificados no escopo original da Fase 9

O código atual usa lime como primária, fundo branco puro e raio 0.45rem. O admin não é tocado nesta fase — apenas as páginas públicas (`/`, `/reserva`, `/reserva/sucesso`, `/cancelar/[token]`) e os componentes `public-header.tsx` e `public-footer.tsx`.

---

## Arquivos que serão modificados

```
src/app/globals.css                                    → tokens do novo design system
src/app/(public)/page.tsx                              → landing page completa
src/components/layout/public-header.tsx                → header com nav e novo visual
src/components/layout/public-footer.tsx                → footer com info do restaurante
src/components/features/reservation/
  reservation-form.tsx                                  → stepper e container
  step-reservation-info.tsx                             → calendário, transições, incrementer, cards
  step-customer-info.tsx                                → grid mobile, label idioma
  step-card-stripe.tsx                                  → loading/error Stripe
  step-confirmation.tsx                                 → revisão visual
src/app/(public)/reserva/sucesso/page.tsx               → redesign
src/app/(public)/cancelar/[token]/page.tsx              → estados distintos
src/components/features/reservation/cancel-page-content.tsx → redesign
```

---

## Decisões de Implementação

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Escopo de migração DS | Apenas páginas públicas | Admin migrado nas fases 10–14 por seção |
| globals.css | Atualizar tokens globais | `--radius`, `--primary` e `--background` impactam toda a app — fazer de vez |
| Person selector | Incrementer +/- com `<Button>` ghost | Mais intuitivo em mobile; substituir `<Select>` de party_size |
| Calendar auto-close | `useState` open + fechar no `onSelect` | Evita sobreposição dos time slots abaixo |
| Transições dinâmicas | `transition-opacity duration-200` + `animate-in fade-in` do tw-animate | Já instalado; sem nova dependência |
| Seções da landing | Hero + "Como funciona" + Info do restaurante | Mínimo viável para a página não ser estéril |
| Footer | Endereço, horários, redes sociais (dados do restaurante do banco) | Buscados via Server Component |

---

## Tarefas

### T1 — Migração dos tokens globais (`globals.css`)

- [ ] Substituir todos os valores oklch das CSS variables pelo novo tema:
  - `--background`: `oklch(0.970 0.008 75)` — off-white quente #F6F3EE
  - `--foreground`: `oklch(0.130 0.003 0)` — #1C1C1C
  - `--card`: `oklch(1 0 0)` — branco puro
  - `--primary`: `oklch(0.270 0.055 162)` — verde escuro #1F3A34
  - `--primary-foreground`: `oklch(0.970 0.008 75)`
  - `--secondary`: `oklch(0.945 0.008 75)` — bege mais escuro
  - `--muted`: `oklch(0.945 0.008 75)`
  - `--muted-foreground`: `oklch(0.480 0.003 0)` — #6B6B6B
  - `--accent`: `oklch(0.600 0.095 28)` — terracota #C97C6A
  - `--accent-foreground`: `oklch(1 0 0)`
  - `--border`: `oklch(0.895 0.012 75)` — #E2DDD6
  - `--input`: `oklch(0.895 0.012 75)`
  - `--ring`: `oklch(0.270 0.055 162)` — primary
  - `--radius`: `0.75rem`
  - `--chart-1..5`: cores semânticas de status (âmbar, verde escuro, verde médio, cinza, terracota)
  - `--sidebar-*`: verde escuro para sidebar admin (não muda visualmente no admin ainda, mas prepara)
- [ ] Verificar que `npx tsc --noEmit` e `npm run lint` não quebram após mudança

### T2 — Header público (`public-header.tsx`)

- [ ] Fundo: `bg-card` (branco) com `border-b border-border shadow-sm` leve
- [ ] Logo "Domo" em `text-primary font-semibold tracking-tight`
- [ ] Adicionar links de âncora: "Como funciona" → `/#como-funciona`, "Informações" → `/#informacoes`
- [ ] Botão "Reservar": `bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium`
- [ ] Mobile: links de nav ocultos em mobile, botão "Reservar" com respiro lateral adequado
- [ ] `max-w-5xl mx-auto` para alinhamento com o conteúdo

### T3 — Footer público (`public-footer.tsx`)

- [ ] Estrutura: 3 colunas (desktop) / empilhado (mobile)
  - Col 1: logo + tagline
  - Col 2: Horários de funcionamento (buscados do banco via `time_slots`)
  - Col 3: Endereço + telefone + email (de `restaurants` table)
- [ ] Linha inferior: copyright + links discretos
- [ ] Visual: `bg-card border-t border-border`, texto `text-sm text-muted-foreground`
- [ ] Server Component — buscar dados reais do restaurante

### T4 — Landing page (`page.tsx`)

- [ ] **Fundo**: `bg-background` (off-white), não branco
- [ ] **Hero**:
  - Container `max-w-2xl mx-auto text-center py-24 px-4`
  - Eyebrow discreto (ex: "Reservas Online") em `text-xs uppercase tracking-widest text-muted-foreground`
  - Título `text-4xl sm:text-5xl font-semibold tracking-tight text-foreground`
  - Descrição `text-base text-muted-foreground leading-relaxed mt-4 max-w-md mx-auto`
  - CTA `bg-primary text-primary-foreground rounded-xl px-8 py-3.5 text-sm font-medium mt-8`
- [ ] **Seção "Como funciona"** (`id="como-funciona"`):
  - 3 cards: "Escolha a data e horário" → "Informe seus dados" → "Confirmação imediata"
  - Ícones Lucide: `CalendarDays`, `User`, `CheckCircle2`
  - Cards com `rounded-xl border bg-card p-6 shadow-sm`
  - Numeração ou ícone colorido em `text-primary`
- [ ] **Seção "Informações"** (`id="informacoes"`):
  - Endereço, horários de funcionamento, telefone — dados reais do banco
  - Layout em 2 colunas (info + mapa placeholder ou imagem sutil)
  - Visual editorial, sem caixas excessivas
- [ ] Responsividade completa: 320px, 375px, 768px, 1280px

### T5 — Container e stepper do formulário

- [ ] **Página `/reserva`**: fundo `bg-background`, não branco
- [ ] **Card do formulário**: `max-w-xl mx-auto rounded-2xl border bg-card shadow-md p-8`
- [ ] **Stepper redesign**:
  - Indicador minimalista: pontos (`•`) ou traços (`—`) com label discreto abaixo
  - Etapa ativa: `text-primary font-medium`
  - Etapas futuras: `text-muted-foreground/50`
  - Etapas concluídas: checkmark `text-primary/70` ou traço preenchido
  - Sem números grandes, sem cores chamativas
- [ ] **Botão Avançar**: `w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium mt-6`
- [ ] **Botão Voltar**: `ghost`, `text-muted-foreground`, discreto
- [ ] Respiro entre último campo e botões: `mt-8`

### T6 — Step 1: calendário, transições, incrementer, cards de acomodação

- [ ] **Calendário auto-close**: controlar abertura do Popover com `open`/`onOpenChange`; fechar no `onSelect`
- [ ] **Transições de campos dinâmicos**:
  - Wrapper `<div className="transition-all duration-200 overflow-hidden">` com altura animada
  - Ou usar `animate-in fade-in-0 slide-in-from-top-2 duration-200` do tw-animate nos containers condicionais
- [ ] **Cards de acomodação**:
  - `border border-border rounded-xl p-4` → selecionado: `border-primary bg-primary/5 ring-1 ring-primary`
  - Hierarquia clara: nome em `font-medium`, capacidade em `text-sm text-muted-foreground`, vagas restantes em badge pequeno
- [ ] **Seletor de pessoas — incrementer**:
  - Substituir `<Select>` por `<div>` com botões ghost `−` e `+` e valor central
  - Respeitar `min_seats` e `max_seats` da acomodação selecionada
  - Visual: `rounded-lg border border-input flex items-center justify-between px-4 py-2.5`
  - Botões: `<Button variant="ghost" size="icon">` com `Minus` e `Plus` do Lucide

### T7 — Step 2: dados do cliente

- [ ] **Grid mobile**: campos Nome + Sobrenome em `grid grid-cols-1 sm:grid-cols-2 gap-4`  — empilhados em mobile
- [ ] **Label do seletor de idioma**: aumentar contraste — `text-sm text-muted-foreground` em vez de muted/40; texto "(emails de confirmação)" com tamanho `text-xs` mas cor legível
- [ ] **Inputs**: `rounded-lg px-4 py-3 border-input` — alinhados com novo border-radius

### T8 — Step de Cartão (Stripe)

- [ ] **Loading state**: spinner `<Loader2>` visível enquanto busca `clientSecret` do SetupIntent
- [ ] **Erro**: mensagem inline em `text-destructive text-sm` se SetupIntent falhar
- [ ] **Container do Payment Element**: padding consistente com os demais cards do formulário
- [ ] **Botão "Confirmar Reserva"**: mesmo estilo do botão Avançar (`w-full h-12 rounded-xl`)

### T9 — Página de Sucesso (`/reserva/sucesso`)

- [ ] **Ícone de check**: `CheckCircle2` grande em `text-primary`, container `rounded-full bg-primary/10 p-4`
- [ ] **Título**: `text-2xl font-semibold tracking-tight`
- [ ] **Card de detalhes**: `rounded-xl border bg-card p-6 shadow-sm` com grid 2 colunas para data/hora/acomodação/pessoas
- [ ] **Info de email**: substituir `bg-blue-50 border-blue-200` por `bg-primary/5 border-primary/20 text-sm`
- [ ] **Link de cancelamento**: visível, claro, `text-muted-foreground underline text-sm`
- [ ] **Botões**: "Voltar ao início" como ghost, "Nova Reserva" como primary
- [ ] Layout `max-w-lg mx-auto py-16 px-4`

### T10 — Página de Cancelamento (`/cancelar/[token]`)

- [ ] **Estado: carregando** — skeleton do card (já existe via loading.tsx do Next.js se necessário)
- [ ] **Estado: já cancelado** — ícone `Info` em âmbar, texto explicativo claro, botão para home
- [ ] **Estado: token inválido/não encontrado** — ícone `XCircle` em rose, texto claro sem jargão técnico
- [ ] **Estado: sucesso do cancelamento** — ícone `CheckCircle2` em primary, confirmação, botão home
- [ ] **`CancelPageContent`**: botão de cancelar com loading state (`isLoading`, `disabled`)
- [ ] Todos os estados com mesmo container `max-w-lg mx-auto py-16 px-4 text-center`
- [ ] Card de detalhes da reserva visível antes de confirmar cancelamento

### T11 — Validação final

- [ ] `npx tsc --noEmit` — zero erros
- [ ] `npm run lint` — zero erros novos
- [ ] Testar responsividade: 320px, 375px, 768px, 1280px
- [ ] Verificar formulário completo (todas as etapas, incluindo Stripe em modo teste)
- [ ] Verificar landing page em mobile: hero, seções, header, footer
- [ ] Verificar que o admin não regrediu visualmente com a mudança de tokens

---

## Critérios de Aceitação (da Fase)

- [ ] Novo design system aplicado em todas as páginas públicas (cor primária, fundo off-white, raio maior)
- [ ] Landing page com hero refinado + seção "Como funciona" + seção de informações do restaurante
- [ ] Header com links de navegação e visual premium; footer com dados do restaurante
- [ ] Calendário fecha automaticamente ao selecionar data
- [ ] Campos dinâmicos surgem com transição suave
- [ ] Incrementer +/- para seleção de pessoas
- [ ] Formulário legível e sem overflow em mobile (320px+)
- [ ] Página de sucesso e cancelamento com design polido e estados claros
- [ ] Admin não regrediu visualmente (tokens globais mudados, mas componentes admin mantêm leitura)
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Ordem de Execução

T1 (tokens) → T2 (header) → T3 (footer) → T4 (landing) → T5 (form container/stepper) → T6 (step 1) → T7 (step 2) → T8 (stripe) → T9 (sucesso) → T10 (cancelamento) → T11 (validação)

> T1 primeiro pois afeta toda a app via CSS variables. Verificar admin após T1 antes de prosseguir.
