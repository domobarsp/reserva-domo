# Fase 12 — Refinamento Visual — Reservas (Lista + Drawer)

**Status**: COMPLETO
**Concluído em**: 2026-03-04

---

## O que foi feito

### Paleta
- Tokens admin (`--background`, `--muted`, `--secondary`, `--border`, `--input`) migrados de bege quente (oklch chroma 0.008–0.015 hue 75) para zinc puro (chroma = 0)
- Páginas públicas preservaram seu bege característico

### Tabela de Reservas
- Cabeçalhos com acentuação correta: Horário, Acomodação, Ações
- `hover:bg-zinc-50 transition-colors` nas linhas
- Coluna DATA oculta quando filtro de data está ativo (`hideDate` prop)

### Filtros
- "Todas as acomodações" com acento
- Data exibida em formato compacto via `formatDateShort()` ("Sex., 27/02/2026")

### Drawer de Reserva — Redesign completo
- Header: eyebrow "RESERVA" + nome 22px + badges abaixo do nome + metadata 2×2 + "Reservado em…"
- Corpo: seções com `SectionLabel`, icon circles `h-6 w-6 bg-zinc-100`, scroll independente
- Timeline flex-based (sem absolute): dot + conector em coluna flex, sempre alinhados
- Footer: ação primária full-width + secundárias outline em linha, hierarquia clara
- Fullscreen mobile (`w-full sm:max-w-[460px]`)

### Taxa de No-Show no Drawer
- Resolução por prioridade: override da reserva → override da data → padrão global
- Exibição no drawer: valor + label de origem quando não é padrão
- Aviso "pendente de cobrança" exibe o valor efetivo
- Painel de confirmação de cobrança exibe o valor

### Seção Avançado no Modal de Edição
- Oculta quando `!reservation.stripe_payment_method_id`
- Evita edição de taxa em reservas sem cartão

### Histórico de Edições
- Migration `005_reservation_edit_history`: tabela com `changes JSONB` array de `{field, label, from, to}`
- `updateReservation()` detecta diff e insere registro (data, horário, acomodação, pessoas, solicitações, taxa)
- `getReservationDetails()` busca `editHistory` e retorna junto ao `statusHistory`
- Drawer mescla e ordena ambos por data; dot de cor diferente para edições; lista de campos alterados

### Modais Criação e Edição — Redesign
- `p-0 gap-0` com header/body/footer separados por bordas
- Seções com `SectionLabel` e separadores `border-t border-zinc-100`
- Footer `bg-zinc-50` com loading state (`Loader2` no submit)
- Criação: seções Cliente, Reserva, Configuração
- Edição: seções Reserva, Avançado (condicional)

### Tipos e Infra
- `ReservationEditHistory` adicionado a `src/types/index.ts`
- `ReservationDetails` extendido com `editHistory`, `effectiveNoShowFee`, `noShowFeeSource`
- `NoShowFeeSource` exportado de `actions.ts`

---

## Commits

- `b41db37` — drawer redesign, palette fix, table corrections
- `933494d` — modal de criação e edição redesenhados
- `f0d9696` — no-show fee no drawer, histórico de edições, seção avançado condicional
- `eb292b6` — valor de no-show no aviso pendente e painel de confirmação
