# Fase 8 — Relatórios

**Status**: `PLANNED`
**Data**: 2026-03-02

---

## Contexto

A página `/admin/relatorios` existe como placeholder. A sidebar já tem o link "Relatórios". Nenhuma biblioteca de gráficos está instalada ainda.

---

## Decisões de Implementação

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Biblioteca de gráficos | `shadcn chart` (Recharts) | Já usamos shadcn/ui; styles do design system ficam automáticos |
| Seletor de período | `searchParams` (7d/30d/90d + custom) | Mesmo padrão do dashboard; deep-link funciona |
| Custom range | Dois `<input type="date">` nativos | Simples, sem dependência extra; já temos date-fns |
| Data loading | Server Component + Server Actions | Padrão já estabelecido no projeto |
| Exportação CSV | API Route GET `/api/relatorios/export` | Permite download direto via `<a href>` |
| Comparativo | Período anterior de mesmo tamanho | Ex: 7d atual vs 7 dias antes |

---

## Arquivos a Criar/Modificar

```
src/app/admin/(authenticated)/relatorios/
  page.tsx                    → Server Component (busca dados, renderiza layout)
  actions.ts                  → Server Actions: getReportData()
  loading.tsx                 → Skeleton da página
  _components/
    period-selector.tsx        → Pills 7d/30d/90d + inputs custom
    report-kpi-cards.tsx       → 4 cards com delta comparativo
    reservations-by-day-chart.tsx → BarChart
    reservations-by-status-chart.tsx → PieChart (donut)
    top-accommodations-table.tsx → Tabela simples
    export-csv-button.tsx      → Botão de download do CSV

src/app/api/relatorios/export/route.ts → GET: gera CSV
```

---

## Tarefas

### T1 — Instalar shadcn chart
- [ ] Rodar `npx shadcn add chart`
- [ ] Confirmar que `src/components/ui/chart.tsx` foi criado

### T2 — Server Actions (`relatorios/actions.ts`)
- [ ] Definir tipos: `ReportKPIs`, `DayData`, `StatusData`, `AccommodationData`, `ReportData`
- [ ] `getDateRange(period, customStart?, customEnd?)` — retorna `{ start, end }` para o período atual e anterior
- [ ] `getReportData(startDate, endDate)` — query Supabase:
  - Busca todas as reservas no intervalo (com joins em customers, accommodation_types, time_slots)
  - Computa KPIs: `totalReservations`, `totalCovers`, `noShowRate`, `cancellationRate`, `confirmedRate`
  - Computa `byDay[]`: `{ date, count, covers }`
  - Computa `byStatus[]`: `{ status, label, count }`
  - Computa `byAccommodation[]`: `{ name, total, noShows, covers }`
  - Busca período anterior (mesmo delta) e computa `previousKPIs` para deltas dos cards

### T3 — `page.tsx` (Server Component)
- [ ] Ler `searchParams.period` (default `30d`) e `searchParams.start`/`end` (custom)
- [ ] Chamar `getReportData(start, end)` e `getReportData(prevStart, prevEnd)`
- [ ] Montar layout: header + `<PeriodSelector>` + grid de KPIs + gráficos + tabela
- [ ] Passar dados como props para client components

### T4 — `PeriodSelector` (Client Component)
- [ ] Pills: "7 dias", "30 dias", "90 dias" — cada um faz push para `?period=7d|30d|90d`
- [ ] Seção "Personalizado": dois inputs `type="date"` → push para `?start=X&end=Y`
- [ ] Pill ativo com estilo preenchido (mesmo padrão do dashboard)
- [ ] `useTransition` para estado pending enquanto `router.push` carrega

### T5 — `ReportKpiCards` (Client Component)
- [ ] 4 cards: Total Reservas, Total Covers, Taxa de No-Show, Taxa de Cancelamento
- [ ] Cada card: valor atual + delta comparativo (↑/↓ %) vs. período anterior
- [ ] Delta em verde se melhora (mais reservas, menos no-show/cancelamento), vermelho se piora
- [ ] Reutilizar padrão visual dos cards do dashboard (borda, raio, chip colorido)

### T6 — `ReservationsByDayChart` (Client Component)
- [ ] `BarChart` (Recharts via shadcn chart)
- [ ] Eixo X: datas do período; Eixo Y: número de reservas
- [ ] Tooltip com data, total de reservas e covers
- [ ] Cores seguindo o design system (primary lime)

### T7 — `ReservationsByStatusChart` (Client Component)
- [ ] `PieChart` em modo donut (Recharts via shadcn chart)
- [ ] Fatias por status: pending, confirmed, seated, complete, no_show, cancelled
- [ ] Cores: amber (pending), emerald (confirmed/complete/seated), rose (no_show/cancelled)
- [ ] Legenda lateral com label + count + percentual

### T8 — `TopAccommodationsTable` (Client Component)
- [ ] Tabela simples com colunas: Acomodação, Total Reservas, Total Covers, No-Shows, Taxa No-Show (%)
- [ ] Ordenada por Total Reservas (desc)
- [ ] Reutilizar padrão visual de tabela do projeto (header bg-muted/50, etc.)

### T9 — API Route de Exportação CSV (`/api/relatorios/export/route.ts`)
- [ ] GET com query params `?start=YYYY-MM-DD&end=YYYY-MM-DD`
- [ ] Verificar sessão Supabase (autenticado) — retornar 401 se não autenticado
- [ ] Buscar reservas do período com joins (customer, accommodation_type, time_slot)
- [ ] Gerar CSV:
  - Headers: `ID,Data,Horário,Cliente,Email,Acomodação,Pessoas,Status,Fonte,Valor No-Show (R$)`
  - Separador: vírgula; encoding UTF-8 com BOM para Excel
- [ ] Resposta com `Content-Type: text/csv` e `Content-Disposition: attachment; filename=relatorio-YYYY-MM-DD.csv`

### T10 — `ExportCsvButton` (Client Component)
- [ ] Botão "Exportar CSV" que monta a URL do endpoint com as datas atuais (vindas de props)
- [ ] Usa `<a href>` nativo com `download` attribute para disparar o download sem navegar
- [ ] Estado loading enquanto aguarda (opcional: substituir por link direto)

### T11 — `loading.tsx`
- [ ] Skeleton do header + pills de período
- [ ] Skeleton dos 4 KPI cards
- [ ] Skeleton de dois gráficos (placeholder de altura fixa)
- [ ] Skeleton da tabela (5 linhas)

### T12 — Validação Final
- [ ] `npx tsc --noEmit` sem novos erros
- [ ] `npm run lint` sem novos erros
- [ ] Testar todos os seletores de período (7d, 30d, 90d, custom)
- [ ] Testar download CSV em browser
- [ ] Verificar responsividade (charts devem ter `width="100%"`)

---

## Critérios de Aceitação (da Fase)

- [ ] Página `/admin/relatorios` com dados reais do Supabase
- [ ] Pelo menos 2 gráficos funcionais (BarChart + PieChart)
- [ ] Seletor de período funcional (7d / 30d / 90d / custom) — atualiza todos os dados
- [ ] Exportação CSV das reservas do período
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

---

## Ordem de Execução

T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12
