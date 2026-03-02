# Design System — Domo

> **Referencia**: Este documento define o padrao visual do Domo.
> Todas as decisoes de UI devem seguir este guia. Atualizar conforme o sistema evolui.

---

## Tema Base

| Propriedade | Valor |
|-------------|-------|
| **Base** | Radix |
| **Estilo** | Vega |
| **Cor base** | Gray (com leve tom azulado, nao neutral puro) |
| **Cor primaria** | Lime (verde-lima vibrante) |
| **Icones** | Lucide |
| **Fonte** | Inter |
| **Raio de borda** | Small (0.45rem / ~7px) |
| **Menu accent** | Subtle |
| **Origem** | [shadcn/ui create](https://ui.shadcn.com/create?base=radix&style=vega&baseColor=gray&theme=lime&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=small) |

---

## Paleta de Cores (CSS Custom Properties)

### Light Mode (`:root`)

```css
/* Backgrounds */
--background: oklch(1 0 0);
--foreground: oklch(0.13 0.028 261.692);

/* Cards & Popovers */
--card: oklch(1 0 0);
--card-foreground: oklch(0.13 0.028 261.692);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.13 0.028 261.692);

/* Primary (Lime) */
--primary: oklch(0.65 0.18 132);
--primary-foreground: oklch(0.99 0.03 121);

/* Secondary & Muted */
--secondary: oklch(0.967 0.001 286.375);
--secondary-foreground: oklch(0.21 0.006 285.885);
--muted: oklch(0.967 0.003 264.542);
--muted-foreground: oklch(0.551 0.027 264.364);

/* Accent */
--accent: oklch(0.967 0.003 264.542);
--accent-foreground: oklch(0.21 0.034 264.665);

/* Feedback */
--destructive: oklch(0.577 0.245 27.325);

/* Borders & Input */
--border: oklch(0.928 0.006 264.531);
--input: oklch(0.928 0.006 264.531);
--ring: oklch(0.707 0.022 261.325);

/* Charts (escala lime) */
--chart-1: oklch(0.90 0.18 127);
--chart-2: oklch(0.85 0.21 129);
--chart-3: oklch(0.77 0.20 131);
--chart-4: oklch(0.65 0.18 132);
--chart-5: oklch(0.53 0.14 132);

/* Sidebar */
--sidebar: oklch(0.985 0.002 247.839);
--sidebar-foreground: oklch(0.13 0.028 261.692);
--sidebar-primary: oklch(0.65 0.18 132);
--sidebar-primary-foreground: oklch(0.99 0.03 121);
--sidebar-accent: oklch(0.967 0.003 264.542);
--sidebar-accent-foreground: oklch(0.21 0.034 264.665);
--sidebar-border: oklch(0.928 0.006 264.531);
--sidebar-ring: oklch(0.707 0.022 261.325);

/* Radius */
--radius: 0.45rem;
```

### Dark Mode (`.dark`)

```css
--background: oklch(0.13 0.028 261.692);
--foreground: oklch(0.985 0.002 247.839);

--card: oklch(0.21 0.034 264.665);
--card-foreground: oklch(0.985 0.002 247.839);
--popover: oklch(0.21 0.034 264.665);
--popover-foreground: oklch(0.985 0.002 247.839);

--primary: oklch(0.77 0.20 131);
--primary-foreground: oklch(0.27 0.07 132);

--secondary: oklch(0.274 0.006 286.033);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.278 0.033 256.848);
--muted-foreground: oklch(0.707 0.022 261.325);

--accent: oklch(0.278 0.033 256.848);
--accent-foreground: oklch(0.985 0.002 247.839);

--destructive: oklch(0.704 0.191 22.216);

--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.551 0.027 264.364);

--chart-1: oklch(0.90 0.18 127);
--chart-2: oklch(0.85 0.21 129);
--chart-3: oklch(0.77 0.20 131);
--chart-4: oklch(0.65 0.18 132);
--chart-5: oklch(0.53 0.14 132);

--sidebar: oklch(0.21 0.034 264.665);
--sidebar-foreground: oklch(0.985 0.002 247.839);
--sidebar-primary: oklch(0.85 0.21 129);
--sidebar-primary-foreground: oklch(0.27 0.07 132);
--sidebar-accent: oklch(0.278 0.033 256.848);
--sidebar-accent-foreground: oklch(0.985 0.002 247.839);
--sidebar-border: oklch(1 0 0 / 10%);
--sidebar-ring: oklch(0.551 0.027 264.364);
```

---

## Cores Utilitarias (Tailwind)

Cores fora do sistema de tokens, usadas pontualmente para comunicar semantica.

### Status de Reserva

| Status | Background | Texto | Borda |
|--------|-----------|-------|-------|
| Pendente | `bg-amber-50` | `text-amber-700` | `border-amber-200/60` |
| Confirmado | `bg-blue-50` | `text-blue-700` | `border-blue-200/60` |
| Sentado | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200/60` |
| Completo | `bg-gray-50` | `text-gray-600` | `border-gray-200/60` |
| Nao Compareceu | `bg-rose-50` | `text-rose-700` | `border-rose-200/60` |
| Cancelado | `bg-gray-50` | `text-gray-400` | `border-gray-200/60` |

### Status Lista de Espera

| Status | Background | Texto | Borda |
|--------|-----------|-------|-------|
| Aguardando | `bg-amber-50` | `text-amber-700` | `border-amber-200/60` |
| Acomodado | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200/60` |
| Removido | `bg-gray-50` | `text-gray-400` | `border-gray-200/60` |

### Cores Funcionais para Cards de Metricas

| Metrica | Cor do icone/accent | Background do container |
|---------|--------------------|-----------------------|
| Reservas do periodo | `text-primary` | `bg-primary/10` |
| Confirmadas | `text-emerald-600` | `bg-emerald-50` |
| Pendentes | `text-amber-600` | `bg-amber-50` |
| Ocupacao | `text-violet-600` | `bg-violet-50` |

---

## Tipografia

### Fonte

**Inter** (Google Fonts) como sans-serif primaria. Substituir Geist por Inter no `layout.tsx`:

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

### Escala Tipografica

| Elemento | Classe | Peso |
|----------|--------|------|
| Titulo de pagina | `text-2xl` | `font-semibold` (nao bold) |
| Subtitulo/secao | `text-lg` | `font-medium` |
| Label de metrica | `text-sm` | `font-medium text-muted-foreground` |
| Valor de metrica | `text-3xl` | `font-bold tracking-tight` |
| Corpo de texto | `text-sm` | `font-normal` |
| Texto auxiliar | `text-xs` | `font-normal text-muted-foreground` |
| Header de tabela | `text-xs` | `font-medium uppercase tracking-wider text-muted-foreground` |

---

## Espacamento e Respiro

### Principios

- **Mais respiro, menos aperto**: Preferir `gap-6` sobre `gap-4`, `py-4` sobre `py-2` em tabelas.
- **Hierarquia por espaco**: Seccoes separadas por `gap-8`, elementos internos por `gap-4`.
- **Padding generoso**: Cards com `p-6`, tabelas com celulas `px-4 py-3.5`.

### Padroes de Layout

| Contexto | Espacamento |
|----------|------------|
| Entre secoes de pagina | `space-y-8` |
| Dentro de secao | `space-y-4` ou `gap-4` |
| Grid de cards metricas | `gap-4 sm:gap-6` |
| Padding do conteudo principal | `p-6 lg:p-8` |
| Margem entre header da pagina e conteudo | `mb-8` |

---

## Componentes — Diretrizes

### Cards de Metricas (Big Numbers)

**Antes (template):** Card com icone circular + numero lateral, tudo na mesma cor.
**Depois (refinado):**

```
+------------------------------------------+
|  [icone]  Reservas Hoje                  |
|                                           |
|  24                          +12% ↑       |
|  vs. semana passada                       |
+------------------------------------------+
```

- Card sem borda visivel: usar `border-0 shadow-none bg-muted/40` ou `bg-primary/5`
- Icone no topo com cor de accent, sem container circular
- Numero grande (`text-3xl font-bold tracking-tight`) abaixo do label
- Opcional: indicador de variacao (`text-xs text-emerald-600` para positivo, `text-xs text-rose-600` para negativo)
- Usar cor de fundo sutil diferente por card (primary/5, emerald/5, amber/5, violet/5) para diferenciar visualmente

### Tabelas

**Antes:** `TableHead` branco com `h-10 px-2`, celulas com `p-2`, visual apertado.
**Depois:**

- **Header**: Background sutil `bg-muted/50`, texto `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- **Celulas**: Padding `px-4 py-3.5` (mais altura, mais respiro horizontal)
- **Linhas**: `hover:bg-muted/30` sutil, sem borda entre linhas OU borda muito leve `border-border/50`
- **Container**: `rounded-lg` sem borda externa, ou borda muito sutil. Preferir sombra leve `shadow-sm` se necessario delimitar
- **Acoes**: Icones ghost discretos, sem fundo. Aparecem com opacity parcial e ficam 100% no hover da linha

Implementar no `table.tsx` (ui component):

```tsx
// TableHead
"text-muted-foreground bg-muted/50 h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider"

// TableCell
"px-4 py-3.5 align-middle"

// TableRow
"hover:bg-muted/30 border-b border-border/50 transition-colors"
```

### Sidebar

- Fundo levemente diferente do conteudo: `bg-sidebar` (ja definido no tema)
- Logo area: usar cor primaria como accent sutil (`text-primary` para "Domo")
- Badge "Admin": `bg-primary/15 text-primary` com border radius pill
- Item ativo: `bg-primary/10 text-primary font-medium` ao inves de accent generico
- Item hover: `hover:bg-muted/60`
- Icones: `h-[18px] w-[18px]` (entre 4 e 5, mais legivel)
- Separadores entre grupos de nav, nao entre cada item

### Badges de Status

- Sem borda: usar background colorido + texto. Remover `variant="outline"` e `border-*`
- Shape: `rounded-full` (pill), padding `px-2.5 py-0.5`
- Cores com opacidade baixa no background, cor forte no texto (ver tabela de cores utilitarias)
- Font: `text-xs font-medium`

### Botoes

- Botao primario: `bg-primary text-primary-foreground` (verde-lima)
- Botoes secundarios: `bg-secondary` ou `variant="outline"`
- Botoes destrutivos: manter vermelho
- Botoes ghost em tabelas: manter discretos
- Nos headers de pagina, botao de acao principal alinhado a direita

### Dialogs e Forms

- Dialogs com `max-w-lg` como padrao (nao muito largos)
- Campos de formulario com labels `text-sm font-medium` e descricoes `text-xs text-muted-foreground`
- Espacamento entre campos: `gap-4`
- Botoes de acao no footer: primario a direita, cancelar a esquerda como ghost

### Empty States

- Centralizado, icone em `text-muted-foreground/50`, tamanho `h-12 w-12`
- Titulo `text-base font-medium` + descricao `text-sm text-muted-foreground`
- Container com `border-dashed border-border/50 rounded-lg py-12`

### Loading States

- Spinner simples com animacao `animate-spin`
- Skeletons para tabelas e cards: `bg-muted/60 animate-pulse rounded`
- Evitar loading indicators grandes; preferir skeletons inline

---

## Calendario Visual (Admin)

- Dias com reservas: usar escala de intensidade baseada em ocupacao
  - `<=50%`: `bg-emerald-50 text-emerald-700`
  - `51-80%`: `bg-amber-50 text-amber-700`
  - `81-100%`: `bg-rose-50 text-rose-700`
  - Fechado: `bg-muted text-muted-foreground`
- Dia atual: ring `ring-2 ring-primary/30`
- Hover: `hover:ring-2 hover:ring-primary/50`
- Celulas com `rounded-lg p-3` (generoso)

---

## Formulario Publico

- Card centralizado com max-width `max-w-2xl`
- Progress/stepper com cor primaria (lime) para etapas completadas
- Botoes de navegacao: primario para avancar, ghost para voltar
- Selecoes de horario/acomodacao: radio cards com `border-2 border-transparent` que ficam `border-primary bg-primary/5` quando selecionados
- Calendar: highlight do dia selecionado com `bg-primary text-primary-foreground`

---

## Padroes Visuais Gerais

### Preferir cor sobre borda

Em vez de `border` para delimitar secoes, usar:
- Backgrounds sutis (`bg-muted/30`, `bg-primary/5`)
- Espacamento (gap maior entre secoes)
- Sombras leves (`shadow-sm`) apenas quando necessario para elevacao

### Hierarquia visual

1. Cor primaria (lime) para acoes e destaques
2. Cores semanticas (emerald, amber, rose, violet) para status e metricas
3. Tons de cinza (gray base) para estrutura e texto secundario
4. Branco/background para areas de conteudo

### Profundidade

- Sidebar: sem sombra, separada por cor de fundo levemente diferente
- Cards: `shadow-sm` ou nenhuma sombra (diferenciar por background)
- Dialogs: `shadow-lg` para elevacao clara
- Dropdowns: `shadow-md`

### Consistencia

- Mesmo border-radius em todos os containers: `rounded-lg` (usa --radius)
- Mesmo espacamento entre label e campo em todos os formularios
- Mesma altura de celula em todas as tabelas
- Mesma formatacao de datas (DD/MM/AAAA) e horas (HH:mm) em todo o sistema

---

## Regra de Componentes: Sempre Preferir shadcn/ui

**Regra**: Nunca usar elementos HTML nativos quando houver um componente shadcn/ui equivalente instalado.

| Necessidade | Componente correto | Proibido |
|------------|-------------------|----------|
| Seleção de data | `<Calendar>` + `<Popover>` | `<input type="date">` nativo |
| Input de texto | `<Input>` | `<input>` nativo sem estilo |
| Botão | `<Button variant="...">` | `<button>` nativo sem classe |
| Caixa de diálogo | `<Dialog>` | `<dialog>` nativo ou `window.confirm` |
| Seleção de opção | `<Select>` | `<select>` nativo |
| Checkbox | `<Checkbox>` | `<input type="checkbox">` nativo |
| Toggle | `<Switch>` | `<input type="checkbox">` com CSS |
| Tooltip | `<Tooltip>` | `title` attribute HTML |
| Textarea | `<Textarea>` | `<textarea>` nativo |

### Date picker — padrão do projeto

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

Helpers já existentes em `src/lib/availability.ts`:
- `formatDatePtBr(dateStr)` — formata `YYYY-MM-DD` para exibição em PT-BR
- `dateToStr(date)` — converte `Date` para `YYYY-MM-DD`
- `getTodayStr()` — retorna data de hoje como `YYYY-MM-DD`

---

## Mudancas Tecnicas Necessarias

### 1. `globals.css`
- Substituir todas as CSS variables pela paleta lime/gray documentada acima
- Atualizar `--radius` de `0.625rem` para `0.45rem`
- Atualizar `--font-sans` para `var(--font-inter)`

### 2. `layout.tsx`
- Trocar import de `Geist`/`Geist_Mono` por `Inter`
- Atualizar CSS variable de `--font-geist-sans` para `--font-inter`

### 3. `components.json`
- Atualizar `"baseColor"` de `"neutral"` para `"gray"`
- Nota: `"style"` permanece `"new-york"` pois "vega" nao e reconhecido pelo CLI shadcn como style separado; o visual vega e alcancado pelas CSS variables e customizacoes de componentes

### 4. `table.tsx` (UI component)
- Atualizar `TableHead`: adicionar `bg-muted/50`, aumentar padding, usar texto uppercase
- Atualizar `TableCell`: aumentar padding para `px-4 py-3.5`
- Atualizar `TableRow`: borda mais sutil `border-border/50`

### 5. `status-transitions.ts`
- Atualizar cores de status: trocar `yellow-*` por `amber-*`, `green-*` por `emerald-*`, `red-*` por `rose-*`
- Remover bordas dos badges (so background + texto)

### 6. `dashboard-stats.tsx`
- Redesign dos cards de metricas: numero maior, layout vertical, backgrounds coloridos sutis, sem borda
- Icone menor e integrado ao label, nao em container circular

### 7. `admin-sidebar.tsx`
- Item ativo: `bg-primary/10 text-primary` ao inves de accent generico
- Logo "Domo" com `text-primary`

---

## Referencia Visual

- **Tema configurado**: [shadcn/ui create](https://ui.shadcn.com/create?base=radix&style=vega&baseColor=gray&theme=lime&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=small&item=preview)
- **Blocos de referencia**: [shadcn/ui blocks](https://ui.shadcn.com/blocks) — especialmente os dashboards e tabelas
- **Objetivo**: Visual moderno, com uso de cor e respiro, que nao pareca template generico. Refinado, limpo, profissional.
