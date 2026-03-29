# Fase 11 — Plano Concluído

> Concluída em: 2026-03-04

## Objetivo

Refinamento visual do calendário mensal: container unificado em card, células mais ricas, popover de preview, ocupação revisada e legenda alinhada.

---

## T1 — Container unificado

`calendario-content.tsx`:
- Card `rounded-xl border bg-card shadow-sm overflow-hidden` envolve header + grid + legenda
- `CalendarHeader` em seção `border-b px-4 py-4` dentro do card
- `CalendarLegend` em seção `border-t px-4 py-3`
- Inner grid: `rounded-lg border` removidos — card provê borda externa; `bg-border gap-px` mantido para linhas internas

---

## T2 — Grid e células

`month-grid.tsx`:
- Altura: `min-h-[72px] md:min-h-[100px]`
- Dia atual: badge circular `bg-primary rounded-full w-7 h-7`
- Número do dia: `font-semibold text-zinc-700`
- Formato de dados: "2 reservas · 47 pax" (singular/plural) + linha "58% ocupação"
- Dias fechados: célula inteira `bg-zinc-100 hover:bg-zinc-100` + label "Fechado" em `text-zinc-400`
- Dias vazios: ponto `bg-zinc-200` que vira "Adicionar reserva" no hover (`group-hover`)
- Hover: `hover:bg-zinc-50 transition-colors` (sem ring)
- Weekday headers: `bg-zinc-50 text-zinc-500`

---

## T3 — Legenda

`calendar-legend.tsx`:
- Indicadores em pílula `h-3 w-6 rounded-sm` com mesmas cores exatas das células
- Item "Sem reservas" com ponto `bg-zinc-200`
- Limiares atualizados: < 35% / 35–70% / > 70%

---

## T4 — Navegação com feedback

`calendar-header.tsx` + `calendario-content.tsx`:
- `aria-label` "Mês anterior" / "Próximo mês"
- `useTransition` em `setCurrentMonth` → `opacity-60` no grid durante troca

---

## T5 — Popover de preview

`day-popover.tsx` (novo componente) + `month-grid.tsx`:
- `getCalendarioData()` agora retorna `ReservationFull[]` (join customers + accommodation_types + time_slots)
- Clicar em dia com reservas abre `Popover` (side=right, align=start)
- Header: "N reservas / X pessoas no total"
- Item: dot de status (verde/âmbar/vermelho/cinza) + nome completo + horário · pax + label de status
- `max-h-60 overflow-y-auto` — scroll interno
- Footer: link "Ver todas as reservas →" → `/admin/reservas?date=X`
- Dias sem reservas ou fechados: clique navega direto

---

## T6 — Responsividade

- `min-h-[72px] md:min-h-[100px]`
- Headers: `text-[10px] sm:text-xs`
- `overflow-x-auto` no wrapper do grid

---

## T7 — Skeleton

`loading.tsx`:
- Card com `border-b` (header nav) + grid 7×35 skeleton `min-h-[100px]` + `border-t` (legenda)

---

## Correções adicionais (pós-implementação)

- **Limiares de ocupação revisados**: Baixa `< 35%`, Média `35–70%`, Alta `> 70%` (antes: 50%/80%)
- **Bege → neutral**: `bg-amber-50` (#fffbeb ≈ bege) → `bg-amber-100` (#fef3c7); `bg-rose-50` → `bg-rose-100`
- **Legenda sincronizada**: cores `bg-emerald-50 / bg-amber-100 / bg-rose-100 / bg-zinc-100` idênticas às células
- **Ocupação explícita**: percentual "X% ocupação" visível na célula

---

## Validação

- `npx tsc --noEmit` — sem erros
- `npm run lint` — sem novos erros
