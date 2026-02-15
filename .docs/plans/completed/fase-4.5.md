# Fase 4.5 — Polish Pós-Supabase

**Status**: `COMPLETE`
**Início**: 2026-02-14

---

## 1 — Redirect `/admin` → `/admin/dashboard`
- [x] 1.1 Criar `src/app/admin/page.tsx` com `redirect("/admin/dashboard")`
- [x] **Checkpoint**: Acessar `/admin` logado redireciona para dashboard

## 2 — Filtro de data sem overflow
- [x] 2.1 Adicionar `truncate` no botão de data em `reservation-filters.tsx`
- [x] **Checkpoint**: Texto de data não vaza do botão

## 3 — Horários HH:mm (sem segundos)
- [x] 3.1 Criar `formatTime()` em `src/lib/utils.ts`
- [x] 3.2 Aplicar em `reservation-table.tsx`
- [x] 3.3 Aplicar em `time-slots-table.tsx`
- [x] 3.4 Aplicar em `step-confirmation.tsx`
- [x] 3.5 Refatorar `today-reservations.tsx` para usar a função compartilhada
- [x] 3.6 Aplicar em `step-reservation-info.tsx`
- [x] **Checkpoint**: Nenhum horário com `:ss` visível na UI

## 4 — Select de horário no dialog admin
- [x] 4.1 Substituir `<Input>` por `<Select>` em `reservation-create-dialog.tsx`
- [x] 4.2 Substituir `<Input>` por `<Select>` em `reservation-edit-dialog.tsx` (+ adicionar prop `timeSlots`)
- [x] 4.3 Passar `timeSlots` ao `ReservationEditDialog` em `reservas-page-content.tsx`
- [x] **Checkpoint**: Dialogs mostram dropdown de time slots

## 5 — Filtros preservados via URL (realtime)
- [x] 5.1 Adicionar props `defaultStatus` e `defaultAccommodationType` em `reservation-filters.tsx`
- [x] 5.2 Atualizar `reservas-page-content.tsx`: ler filtros dos searchParams, `handleFilterChange` usa `router.replace` com params
- [x] **Checkpoint**: Cancelar reserva atualiza lista sem perder filtros ativos

## 6 — Loading states (skeletons)
- [x] 6.1 Instalar componente `skeleton` do shadcn
- [x] 6.2 Criar `loading.tsx` para dashboard
- [x] 6.3 Criar `loading.tsx` para reservas
- [x] 6.4 Criar `loading.tsx` para calendário
- [x] 6.5 Criar `loading.tsx` para lista-espera
- [x] 6.6 Criar `loading.tsx` para passantes
- [x] 6.7 Criar `loading.tsx` para configurações
- [x] 6.8 Adicionar spinner no botão submit do formulário público
- [x] **Checkpoint**: Loading skeletons visíveis ao navegar entre páginas admin

## 7 — Verificação e Docs
- [x] 7.1 `npx tsc --noEmit` sem erros
- [x] 7.2 `npm run lint` sem erros novos (0 erros, 28 warnings preexistentes)
- [x] 7.3 Atualizar `CurrentState.md`
- [x] 7.4 Atualizar `Phases.md` (status COMPLETE)
