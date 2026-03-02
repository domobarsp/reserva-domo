# Design System — Domo

> **Referência**: Este documento define o padrão visual do Domo.
> Todas as decisões de UI devem seguir este guia. Atualizar conforme o sistema evolui.

---

## Direção Visual

Interface de reserva de restaurante com estética **premium, minimalista e sofisticada**.
Transmite elegância, exclusividade e confiança — inspirada em hotelaria de alto padrão e fine dining.

**Princípios:**
- Clean, respirável e organizado. Layout "arejado", nunca denso.
- Fundo em off-white quente, não branco puro.
- Cards brancos sobre fundo levemente tintado criam profundidade sutil.
- Cor primária profunda e refinada — verde escuro #1F3A34.
- Cor de acento (terracota) usada com parcimônia, apenas em indicadores e estados ativos.
- Dourado queimado reservado para microdetalhes premium (avaliações, progresso).
- Sombras suaves e realistas — presença leve, nunca dramáticas.
- Ícones lineares e discretos (Lucide).
- Tipografia elegante, bem espaçada, com clara hierarquia.
- Botões primários largos, presença forte, cantos bem arredondados.

**Evitar:**
- Cores vibrantes excessivas (o lime original foi substituído)
- Poluição visual ou layouts densos
- Microanimações chamativas
- Ilustrações caricatas
- Branco puro como fundo de página

---

## Paleta de Cores

### Cores Base

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| **Primária** | `#1F3A34` | Botões principais, datas selecionadas, CTAs, header, active states |
| **Primária claro** | `#2D5F47` | Hover dos botões primários, variante mais clara do primary |
| **Fundo** | `#F6F3EE` | Background de página (off-white quente) |
| **Card** | `#FFFFFF` | Background de cards e dialogs |
| **Acento** | `#C97C6A` | Estados ativos sutis, indicadores, pequenos destaques — usar com parcimônia |
| **Dourado** | `#B59A5A` | Avaliações, barras de progresso, microdetalhes premium — usar com parcimônia |
| **Borda** | `#E2DDD6` | Bordas de cards, inputs, separadores |
| **Borda sutil** | `#EDE9E3` | Bordas internas, separadores muito suaves |

### Cores de Texto

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| **Texto primário** | `#1C1C1C` | Títulos, labels, conteúdo principal |
| **Texto secundário** | `#6B6B6B` | Subtítulos, descrições, metadados |
| **Texto desabilitado** | `#A3A3A3` | Placeholders, texto inativo |
| **Texto invertido** | `#F6F3EE` | Texto sobre fundo primário (botões, header escuro) |

### Cores Semânticas (Feedback e Status)

Paleta de status levemente dessaturada para harmonizar com o tema sofisticado:

| Status | Background | Texto | Uso |
|--------|-----------|-------|-----|
| **Sucesso / Confirmado** | `#EBF5F0` | `#1A6040` | Confirmado, Sentado, Completo |
| **Pendente / Atenção** | `#FDF3E7` | `#8A4F00` | Pendente |
| **Erro / No-show** | `#FDEAEA` | `#8A1F1F` | Não Compareceu, Cancelado (destaque) |
| **Neutro / Cancelado** | `#F2F0EC` | `#6B6B6B` | Cancelado, Removido, Completo neutro |
| **Info** | `#EAF1F8` | `#1A4A6B` | Informativo, Aguardando |

### Cores de Gráficos (Status de Reserva)

Mantidas semânticas e distintas entre si, ajustadas para harmonia com o novo tema:

| Status | Cor | Hex |
|--------|-----|-----|
| Pendente | Âmbar suave | `#D4860A` |
| Confirmado | Verde escuro (primary) | `#1F3A34` |
| Sentado | Verde médio | `#2D5F47` |
| Completo | Cinza médio | `#8A8680` |
| Não Compareceu | Terracota | `#B85C4A` |
| Cancelado | Cinza claro | `#C8C3BC` |

---

## Tema Base (shadcn/ui)

| Propriedade | Valor |
|-------------|-------|
| **Biblioteca** | shadcn/ui (Radix) |
| **Fonte** | Inter (Google Fonts) |
| **Raio de borda padrão** | `0.75rem` (12px) — mais arredondado que antes |
| **Ícones** | Lucide |

### CSS Custom Properties — Light Mode (`:root`)

```css
/* Backgrounds */
--background: oklch(0.970 0.008 75);        /* #F6F3EE off-white quente */
--foreground: oklch(0.130 0.005 0);          /* #1C1C1C quase preto */

/* Cards & Popovers */
--card: oklch(1 0 0);                        /* #FFFFFF branco puro */
--card-foreground: oklch(0.130 0.005 0);

--popover: oklch(1 0 0);
--popover-foreground: oklch(0.130 0.005 0);

/* Primary — verde escuro #1F3A34 */
--primary: oklch(0.270 0.055 162);
--primary-foreground: oklch(0.970 0.008 75); /* off-white sobre verde */

/* Secondary */
--secondary: oklch(0.945 0.010 75);          /* bege levemente mais escuro que o bg */
--secondary-foreground: oklch(0.270 0.055 162);

/* Muted */
--muted: oklch(0.945 0.008 75);
--muted-foreground: oklch(0.480 0.010 60);   /* #6B6B6B texto secundário */

/* Accent — terracota #C97C6A (usado com parcimônia) */
--accent: oklch(0.650 0.090 28);
--accent-foreground: oklch(1 0 0);

/* Destructive */
--destructive: oklch(0.500 0.160 22);

/* Borders & Input */
--border: oklch(0.895 0.015 75);             /* #E2DDD6 */
--input: oklch(0.895 0.015 75);
--ring: oklch(0.270 0.055 162);              /* ring = primary */

/* Radius */
--radius: 0.75rem;

/* Charts (status — semânticos e distintos) */
--chart-1: oklch(0.570 0.110 50);            /* âmbar — pendente */
--chart-2: oklch(0.270 0.055 162);           /* verde escuro — confirmado */
--chart-3: oklch(0.420 0.075 162);           /* verde médio — sentado */
--chart-4: oklch(0.580 0.010 60);            /* cinza — completo */
--chart-5: oklch(0.530 0.120 25);            /* terracota — no-show */

/* Sidebar */
--sidebar: oklch(0.220 0.050 162);           /* verde escuro mais intenso */
--sidebar-foreground: oklch(0.920 0.010 75);
--sidebar-primary: oklch(0.970 0.008 75);
--sidebar-primary-foreground: oklch(0.220 0.050 162);
--sidebar-accent: oklch(0.280 0.060 162);
--sidebar-accent-foreground: oklch(0.970 0.008 75);
--sidebar-border: oklch(0.300 0.040 162);
--sidebar-ring: oklch(0.650 0.090 28);       /* terracota no focus da sidebar */
```

### CSS Custom Properties — Dark Mode (`.dark`)

> Dark mode a ser definido na Fase 15 (Produção). Por ora manter o padrão gerado pelo shadcn.

---

## Tipografia

### Fonte

**Inter** (Google Fonts) como sans-serif primária.

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

No `globals.css`:
```css
--font-sans: var(--font-inter);
```

### Escala Tipográfica

| Elemento | Classe Tailwind | Peso | Letter Spacing |
|----------|----------------|------|---------------|
| Título de página (admin) | `text-2xl` | `font-semibold` | `tracking-tight` |
| Título de seção pública | `text-3xl` ou `text-4xl` | `font-semibold` | `tracking-tight` |
| Subtítulo / seção | `text-lg` | `font-medium` | normal |
| Label de métrica | `text-sm` | `font-medium` | normal |
| Valor de métrica (big number) | `text-3xl` | `font-bold` | `tracking-tight` |
| Corpo de texto | `text-sm` ou `text-base` | `font-normal` | normal |
| Texto auxiliar / muted | `text-xs` ou `text-sm` | `font-normal` | normal |
| Header de tabela | `text-xs` | `font-medium uppercase` | `tracking-wider` |
| Label de input | `text-sm` | `font-medium` | normal |

**Princípios tipográficos:**
- Títulos com `tracking-tight` para elegância
- Corpo com espaçamento de linha generoso (`leading-relaxed`)
- Texto auxiliar sempre em `text-muted-foreground`, nunca em preto puro

---

## Sombras

Sombras suaves e realistas para criar profundidade leve. Nunca dramáticas.

```css
/* shadow-sm — cartões normais */
box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.04);

/* shadow-md — dialogs, dropdowns */
box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);

/* shadow-lg — modais elevados */
box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
```

No Tailwind, mapear em `globals.css` ou usar as classes utilitárias padrão com ajuste de opacidade.

---

## Espaçamento e Respiro

### Princípios

- **Mais respiro, menos aperto**: preferir `gap-6` sobre `gap-4`, `py-5` sobre `py-3` em cards.
- **Hierarquia por espaço**: seções separadas por `gap-8` ou `gap-10`, elementos internos por `gap-4`.
- **Padding generoso**: cards com `p-6`, inputs com `px-4 py-3`, tabelas com `px-5 py-4`.
- **Nunca comprimir**: se o layout parece denso, adicionar espaço — não remover conteúdo.

### Padrões de Layout

| Contexto | Espaçamento |
|----------|------------|
| Padding do conteúdo principal (admin) | `p-6 lg:p-8` |
| Entre seções de página | `gap-8` ou `space-y-8` |
| Grid de cards de métricas | `gap-5 sm:gap-6` |
| Padding interno de card | `p-6` |
| Margem entre header e conteúdo | `mb-8` |
| Gap entre label e campo | `gap-1.5` |
| Gap entre campos num formulário | `gap-5` |
| Padding de célula de tabela | `px-5 py-4` |

---

## Componentes — Diretrizes

### Cards

- Background: `bg-card` (branco) sobre `bg-background` (off-white)
- Borda: `border border-border` (sutil, sem peso visual excessivo)
- Sombra: `shadow-sm`
- Raio: `rounded-xl` (usa `--radius`, agora 0.75rem)
- Padding interno: `p-6`

```tsx
<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
```

### Botões

- **Primário**: background `bg-primary`, texto `text-primary-foreground`, `rounded-lg`, padding `px-6 py-2.5`
- **Secundário/Outline**: `border border-border bg-background hover:bg-secondary`, texto `text-foreground`
- **Ghost**: sem borda, sem background, `hover:bg-secondary/60`
- **Destrutivo**: manter vermelho semântico
- Botão primário em formulários públicos: `w-full` para presença forte
- Nunca usar botões muito pequenos para ações principais

### Inputs e Formulários

- Label: `text-sm font-medium text-foreground mb-1.5`
- Input: `rounded-lg border border-input bg-card px-4 py-3 text-sm focus:ring-1 focus:ring-primary`
- Placeholder: `text-muted-foreground`
- Mensagem de erro: `text-xs text-destructive mt-1`
- Gap entre campos: `gap-5`
- Fieldset groups com `gap-8` entre grupos distintos

### Tabelas (Admin)

- Container: `rounded-xl border border-border overflow-hidden`
- Header: `bg-secondary/60 text-xs font-medium uppercase tracking-wider text-muted-foreground px-5 py-3.5`
- Células: `px-5 py-4 text-sm`
- Linhas: `border-b border-border/50 hover:bg-secondary/40 transition-colors`
- Última linha sem borda inferior

### Sidebar (Admin)

- Fundo: `bg-sidebar` (verde escuro `#1F3A34` aprox.)
- Logo: texto `text-sidebar-foreground font-semibold`
- Item ativo: `bg-sidebar-accent text-sidebar-primary-foreground font-medium`
- Item hover: `hover:bg-sidebar-accent/60 hover:text-sidebar-foreground`
- Ícones: `h-[18px] w-[18px]`, monocromáticos, cor do texto

### Badges de Status

Sem borda. Background sutil + texto na cor semântica correspondente.

| Status | Classes |
|--------|---------|
| Pendente | `bg-amber-50 text-amber-800` |
| Confirmado | `bg-emerald-50 text-emerald-800` |
| Sentado | `bg-emerald-100 text-emerald-900` |
| Completo | `bg-gray-100 text-gray-600` |
| Não Compareceu | `bg-red-50 text-red-800` |
| Cancelado | `bg-gray-100 text-gray-500` |
| Aguardando | `bg-amber-50 text-amber-800` |
| Acomodado | `bg-emerald-50 text-emerald-800` |
| Removido | `bg-gray-100 text-gray-500` |

Shape: `rounded-full px-2.5 py-0.5 text-xs font-medium`

### Cards de Métricas (Big Numbers)

```
+------------------------------------------+
|  [ícone]  Label da Métrica               |
|                                           |
|  24                                       |
|  texto auxiliar / unidade                 |
|                                           |
|  ↑ +12% vs. período anterior             |
+------------------------------------------+
```

- Card: `rounded-xl border bg-card p-5 shadow-sm`
- Ícone: container `rounded-lg h-10 w-10` com `bg-primary/10` ou cor semântica `/10`
- Valor: `text-3xl font-bold tracking-tight`
- Label: `text-sm text-muted-foreground`
- Delta: `text-xs text-emerald-700` (positivo) / `text-xs text-red-700` (negativo)

### Empty States

- Container: `rounded-xl border border-dashed border-border py-16 flex flex-col items-center gap-3`
- Ícone: `h-10 w-10 text-muted-foreground/40`
- Título: `text-sm font-medium text-foreground`
- Descrição: `text-sm text-muted-foreground text-center max-w-xs`
- CTA (quando aplicável): botão outline abaixo

### Dialogs e Modais

- Máximo de largura: `max-w-lg` (padrão), `max-w-md` (formulários simples)
- Raio: `rounded-2xl` (levemente maior que cards)
- Sombra: `shadow-lg`
- Header com `border-b border-border pb-4 mb-4` para separação clara
- Botões no footer: primário à direita, ghost/cancel à esquerda

### Date Picker (Padrão do Projeto)

**Sempre usar `<Calendar>` + `<Popover>` shadcn. Nunca `<input type="date">` nativo.**

```tsx
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDatePtBr, dateToStr } from "@/lib/availability";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="justify-start text-left font-normal">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? formatDatePtBr(value) : "Selecionar data"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={value ? strToDate(value) : undefined}
      onSelect={(date) => date && onChange(dateToStr(date))}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

Helpers em `src/lib/availability.ts`: `formatDatePtBr`, `dateToStr`, `getTodayStr`.

---

## Regra de Componentes: Sempre Preferir shadcn/ui

Nunca usar elementos HTML nativos quando houver componente shadcn/ui equivalente instalado.

| Necessidade | Componente correto | Proibido |
|------------|-------------------|----------|
| Seleção de data | `<Calendar>` + `<Popover>` | `<input type="date">` nativo |
| Input de texto | `<Input>` | `<input>` nativo sem estilo |
| Botão | `<Button variant="...">` | `<button>` nativo sem classe |
| Caixa de diálogo | `<Dialog>` | `<dialog>` nativo ou `window.confirm` |
| Seleção de opção | `<Select>` | `<select>` nativo |
| Checkbox | `<Checkbox>` | `<input type="checkbox">` nativo |
| Toggle | `<Switch>` | `<input type="checkbox">` com CSS |
| Tooltip | `<Tooltip>` | atributo `title` HTML |
| Textarea | `<Textarea>` | `<textarea>` nativo |

---

## Formulário Público (Experiência de Reserva)

A experiência pública é a vitrine do restaurante. Deve transmitir sofisticação máxima.

- **Container**: card centralizado `max-w-xl`, `rounded-2xl border bg-card shadow-md p-8`
- **Fundo da página**: `bg-background` (off-white quente), nunca branco puro
- **Stepper**: indicador minimalista de etapas com cor primária para etapa ativa e `text-muted-foreground` para as demais. Sem números grandes, apenas pontos ou traços elegantes + label discreto.
- **Calendário**: highlight da data selecionada com `bg-primary text-primary-foreground`, sem bordas visíveis nos dias não selecionados
- **Seleções de horário/acomodação**: radio cards com `border border-border rounded-xl p-4` que ficam `border-primary bg-primary/5` quando selecionados
- **Seletor de pessoas**: incrementador +/- em vez de dropdown
- **Botão de avançar**: `w-full`, altura `h-12`, `rounded-xl`, `bg-primary text-primary-foreground font-medium`
- **Botão de voltar**: ghost, `text-muted-foreground`
- **Transições entre etapas**: fade suave (`transition-opacity duration-200`)
- **Página de sucesso**: ícone de check grande com `text-primary`, resumo da reserva, link de cancelamento bem visível
- **Página de cancelamento**: estados distintos com ícones e texto claro para cada situação

---

## Calendário Visual (Admin)

- Dias com reservas: escala de intensidade por ocupação (cores levemente ajustadas ao novo tema)
  - `≤50%`: `bg-emerald-50 text-emerald-800`
  - `51–80%`: `bg-amber-50 text-amber-800`
  - `81–100%`: `bg-red-50 text-red-800`
  - Fechado: `bg-muted text-muted-foreground`
- Dia atual: `ring-2 ring-primary/40`
- Hover: `hover:ring-2 hover:ring-primary/20 cursor-pointer`
- Células: `rounded-xl p-3` (raio consistente com o novo border-radius)

---

## Loading States

- Skeletons: `bg-muted animate-pulse rounded-lg` (base quente, não cinza frio)
- Spinners: `animate-spin text-primary` — tamanho `h-4 w-4` inline, `h-6 w-6` para loading de página
- Botões em loading: substituir label por `<Loader2 className="animate-spin" />` + manter `disabled`
- Evitar loading indicators grandes e chamativops; preferir skeletons inline que respeitam o layout

---

## Implementação Técnica (Fases 9–14)

### Prioridade de mudanças

1. **`globals.css`**: substituir paleta lime/gray pelas novas CSS variables (acima)
2. **`components.json`**: atualizar `"radius"` e `"baseColor"`
3. **`layout.tsx`**: manter Inter
4. **Componentes de UI**: `table.tsx`, `button.tsx`, `card.tsx` — ajustar classes default para novo raio e espaçamento
5. **`admin-sidebar.tsx`**: nova paleta de sidebar (verde escuro)
6. **`status-transitions.ts`**: atualizar `getStatusColor()` com novas classes semânticas
7. **Formulário público** (`/reserva`): maior impacto visual — redesign completo conforme diretrizes acima
8. **Dashboard e demais páginas admin**: refinamento incremental por fase

### Notas de migração

- O `baseColor` muda de `"gray"` para `"neutral"` ou custom — verificar impacto nos componentes shadcn gerados
- O `--radius` aumenta de `0.45rem` para `0.75rem` — todos os `rounded-lg` ficam maiores automaticamente via token
- Variáveis `--chart-*` mudam para refletir as cores de status do novo sistema
- A sidebar muda de `bg-sidebar` (cinza claro) para verde escuro — revisar contraste de todos os ícones e textos
