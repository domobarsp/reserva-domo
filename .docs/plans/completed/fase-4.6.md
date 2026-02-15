# Fase 4.6 — Design System (Lime/Gray/Inter/Vega)

**Status**: `COMPLETE`
**Início**: 2026-02-15

---

## 1 — Fundação: globals.css, layout.tsx, components.json

- [x] 1.1 Substituir todas as CSS variables `:root` e `.dark` em `globals.css` pela paleta Lime/Gray do DesignSystem.md
- [x] 1.2 Atualizar `--radius: 0.625rem` → `--radius: 0.45rem`
- [x] 1.3 Atualizar `--font-sans: var(--font-geist-sans)` → `--font-sans: var(--font-inter)`
- [x] 1.4 Trocar `Geist`/`Geist_Mono` por `Inter` em `layout.tsx`
- [x] 1.5 Atualizar `"baseColor": "neutral"` → `"baseColor": "gray"` em `components.json`
- [x] **Checkpoint**: `npm run dev` funciona, fonte Inter carregada, cor primária lime visível em botões

## 2 — Componente Table

- [x] 2.1 `TableHead`: adicionar `bg-muted/50`, aumentar padding para `px-4`, usar `text-xs font-medium uppercase tracking-wider text-muted-foreground`, altura `h-11`
- [x] 2.2 `TableCell`: padding `px-4 py-3.5`
- [x] 2.3 `TableRow`: hover `bg-muted/30`, borda `border-border/50`
- [x] **Checkpoint**: Tabelas admin com header com background sutil e mais respiro

## 3 — Status: cores e badges

- [x] 3.1 Atualizar `getStatusColor()` em `status-transitions.ts`: yellow→amber, green→emerald, red→rose, opacidades ajustadas
- [x] 3.2 Atualizar `getWaitlistStatusColor()`: mesmas mudanças
- [x] 3.3 Remover `variant="outline"` em `status-badge.tsx`, adicionar `rounded-full px-2.5 py-0.5 text-xs font-medium border-0`
- [x] **Checkpoint**: Badges pill-shaped, sem borda, cores amber/emerald/rose

## 4 — Dashboard Stats

- [x] 4.1 Redesign dos cards: layout vertical, ícone no topo sem container circular
- [x] 4.2 Número `text-3xl font-bold tracking-tight` abaixo do label
- [x] 4.3 Cards sem borda: `border-0 shadow-none`
- [x] 4.4 Backgrounds diferenciados: primary/10, emerald-50, amber-50, violet-50
- [x] 4.5 Ícones com cores: `text-primary`, `text-emerald-600`, `text-amber-600`, `text-violet-600`
- [x] **Checkpoint**: Dashboard com 4 cards verticais coloridos

## 5 — Admin Sidebar

- [x] 5.1 Logo "Domo" com `text-primary`
- [x] 5.2 Item ativo: `bg-primary/10 text-primary font-medium`
- [x] 5.3 Item hover: `hover:bg-muted/60`
- [x] 5.4 Ícones: `h-[18px] w-[18px]`
- [x] **Checkpoint**: Sidebar com logo lime e active state primário

## 6 — Calendário Visual

- [x] 6.1 `getOccupancyBg()`: green→emerald, yellow→amber, red→rose, gray→muted
- [x] 6.2 Grid border: `bg-gray-200` → `bg-border`
- [x] 6.3 Today ring: `ring-blue-500` → `ring-primary/30`, text: `text-blue-600` → `text-primary`
- [x] 6.4 Hover: adicionar `hover:ring-2 hover:ring-primary/50`
- [x] 6.5 Textos auxiliares: `text-gray-*` → `text-muted-foreground` com opacidades
- [x] 6.6 Células: padding `p-3`, adicionar `rounded-lg`
- [x] 6.7 Atualizar `calendar-legend.tsx`: green→emerald, yellow→amber, red→rose
- [x] **Checkpoint**: Calendário com cores semânticas e ring primary

## 7 — Empty State

- [x] 7.1 Adicionar container `border border-dashed border-border/50 rounded-lg`
- [x] 7.2 Ícone com opacity `/50`
- [x] 7.3 Título: `text-lg` → `text-base font-medium`
- [x] **Checkpoint**: Empty states com borda dashed

## 8 — Espaçamento e polish

- [x] 8.1 Layout admin: verificar/ajustar padding do conteúdo principal para `p-6 lg:p-8`
- [x] 8.2 Headers de página: verificar `text-2xl font-semibold` e `mb-8`
- [x] **Checkpoint**: Espaçamento generoso e consistente

## 9 — Verificação final e docs

- [x] 9.1 `npx tsc --noEmit` sem erros
- [x] 9.2 `npm run lint` sem erros novos
- [x] 9.3 Verificação visual: fonte Inter, cor lime, tabelas, badges, sidebar, calendário, empty states
- [x] 9.4 Atualizar `CurrentState.md`
- [x] 9.5 Atualizar `Phases.md` (status COMPLETE)
