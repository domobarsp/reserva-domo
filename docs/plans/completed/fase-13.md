# Fase 13 — Refinamento Visual — Lista de Espera & Passantes

> Design spec aprovado em 2026-03-29

## Objetivo

Alinhar as páginas de Lista de Espera e Passantes ao padrão visual refinado da Fase 12 (reservas), garantindo consistência cross-cutting nos filtros de todas as páginas admin e melhorando a UX operacional.

## 1. Filtros — Padronização cross-cutting

**Afeta:** Reservas, Lista de Espera, Passantes.

**Estrutura:**
- Container delimitado: `rounded-xl border bg-card p-4 shadow-sm`
- Título do bloco: ícone `SlidersHorizontal` + "Filtros" como label (`text-sm font-medium text-zinc-700`)
- Cada campo com `<label>` visível acima: `text-xs font-medium text-zinc-500 mb-1`
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (ajustável por página)
- Botão "Limpar filtros" alinhado ao final do grid

**Componente:** Refatorar `TableFilters` em `src/components/shared/table-filters.tsx` para suportar labels e container delimitado. A interface recebe array de campos configuráveis.

## 2. Tabelas

### Waitlist Table (`waitlist-table.tsx`)
- Renomear coluna "Chegada" → "Horário"
- Hierarquia: hora `font-medium text-zinc-900`, data `text-zinc-400` (quando sem filtro de data)
- Hover state: `hover:bg-zinc-50 transition-colors` + `cursor-pointer`
- Ações inline Acomodar/Remover mantidas

### Walk-in Table (`walkin-table.tsx`)
- Padronizar tokens de hierarquia no Horário: hora `font-medium text-zinc-900`, data `text-zinc-400`
- Coluna "Solicitações" fallback `—` em `text-zinc-300`
- Hover + cursor-pointer consistente

### Empty States (ambas)
- Manter `EmptyState` compartilhado
- Adicionar botão CTA: "Adicionar à lista" / "Registrar passante" — `variant="outline"` com ícone `Plus`
- Prop `action?: { label: string; onClick: () => void }` no componente `EmptyState`

## 3. Drawers — Alinhamento Fase 12

Ambos refatorados para seguir o padrão de `ReservationDetailDrawer`.

### Header
- Background: `bg-zinc-50/60`
- Eyebrow: `text-[11px] font-medium tracking-widest text-zinc-400` ("LISTA DE ESPERA" / "PASSANTE")
- Nome: `text-[22px] font-semibold tracking-tight text-zinc-900`
- Badge de status ao lado do nome (waitlist only)
- Metadata 2x2 grid com ícones em círculos `h-6 w-6 bg-zinc-100 rounded-full`

### Body
- `SectionLabel` subcomponente: `text-[11px] uppercase tracking-widest text-zinc-400`
- `IconRow` subcomponente: ícone em círculo + label + valor
- Seções: Contato, Solicitações Especiais (condicional)
- Waitlist: Timeline (chegada -> acomodado) com dots e conector `w-px bg-zinc-200`
- Separadores: `border-b border-zinc-100`

### Footer
- Waitlist (status=waiting): "Acomodar" full-width primary + "Remover" outline abaixo
- Walk-in: sem footer (read-only)

### Responsivo
- Fullscreen mobile: `w-full sm:max-w-[460px]`

## 4. Dialogs de Criação

Ambos redesenhados com padrão Fase 12:
- `DialogContent` com `p-0 gap-0`
- Header separado: título + descrição curta
- Body com seções usando `SectionLabel` + separadores `border-t border-zinc-100`
- Footer `bg-zinc-50 border-t` com botões alinhados à direita
- Loading state com `Loader2` no botão de submit
- Campos mantidos (mesma estrutura de form)

## 5. Subcomponentes compartilhados

Extrair de `reservation-detail-drawer.tsx` para `src/components/shared/drawer-primitives.tsx`:
- `SectionLabel` — label de seção uppercase
- `IconRow` — row com ícone circular + label + valor

Refatorar `reservation-detail-drawer.tsx` para importar desse shared.

## 6. Loading States

Atualizar `loading.tsx` de ambas as páginas para refletir a nova estrutura:
- Skeleton do bloco de filtros (card com labels + inputs)
- Skeleton da tabela (card pattern)

## Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/components/shared/table-filters.tsx` | Refactor: labels, container, grid |
| `src/components/shared/drawer-primitives.tsx` | Novo: SectionLabel, IconRow |
| `src/components/shared/empty-state.tsx` | Extend: prop action com CTA |
| `src/components/features/admin/waitlist/waitlist-table.tsx` | Refine: tokens, hierarquia, hover |
| `src/components/features/admin/waitlist/waitlist-detail-drawer.tsx` | Redesign: padrão Fase 12 |
| `src/components/features/admin/waitlist/waitlist-create-dialog.tsx` | Redesign: padrão Fase 12 |
| `src/components/features/admin/waitlist/lista-espera-content.tsx` | Update: integrar novo filtro + empty CTA |
| `src/components/features/admin/walk-ins/walkin-table.tsx` | Refine: tokens, hierarquia, hover |
| `src/components/features/admin/walk-ins/walk-in-detail-drawer.tsx` | Redesign: padrão Fase 12 |
| `src/components/features/admin/walk-ins/walkin-create-dialog.tsx` | Redesign: padrão Fase 12 |
| `src/components/features/admin/walk-ins/passantes-content.tsx` | Update: integrar novo filtro + empty CTA |
| `src/components/features/admin/reservations/reservation-detail-drawer.tsx` | Refactor: importar drawer-primitives |
| `src/components/features/admin/reservations/reservas-page-content.tsx` | Update: integrar novo filtro |
| `src/app/admin/(authenticated)/lista-espera/loading.tsx` | Update: skeleton nova estrutura |
| `src/app/admin/(authenticated)/passantes/loading.tsx` | Update: skeleton nova estrutura |

## Critérios de aceitação (do Phases.md)

- [ ] Filtros com labels visíveis e espaçamento adequado em ambas as páginas
- [ ] Filtros padronizados cross-cutting (Reservas, Lista de Espera, Passantes)
- [ ] Empty states com CTA de destaque (botão visível no estado vazio)
- [ ] Hierarquia visual na coluna de Horário (data muted, hora bold)
- [ ] Drawers de Lista de Espera e Passantes com mesmo padrão visual do drawer de Reservas
- [ ] Dialogs de criação redesenhados (padrão Fase 12)
- [ ] Subcomponentes SectionLabel/IconRow extraídos para shared
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros
