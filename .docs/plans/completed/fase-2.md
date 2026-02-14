# Plano Ativo — Fase 2: Formulário de Reserva (Mock Data)

> Criado: 2026-02-12 | Fase: 2 | Status: COMPLETO

## Tarefas

### Dependências e Componentes UI
- [x] Instalar zod, react-hook-form, @hookform/resolvers
- [x] Instalar componentes shadcn/ui: input, label, select, calendar, popover, radio-group, textarea, form, progress, sonner (toast)

### Lógica de Disponibilidade (mock)
- [x] Criar `src/lib/availability.ts` com funções:
  - `getAvailableTimeSlots(date)` — retorna time_slots ativos para o dia da semana, filtrando exception_dates
  - `getAvailableAccommodations(date, timeSlotId)` — retorna accommodation_types com vagas restantes
  - `getRemainingCapacity(date, timeSlotId, accommodationTypeId)` — calcula vagas restantes (max_covers - reservas ativas)
  - `isDateClosed(date)` — verifica se data está em exception_dates com is_closed=true
  - `requiresCardGuarantee(date)` — verifica se exige cartão: primeiro checa exception_dates.card_guarantee_override para a data; se null, segue card_guarantee_days por dia da semana
  - `getBookingWindowDates()` — retorna min/max de datas aceitáveis (hoje até booking_window_days)

### Schemas de Validação Zod
- [x] Criar `src/lib/validations/reservation.ts` com:
  - `reservationInfoSchema` (Step 1): date, time_slot_id, accommodation_type_id, party_size, special_requests
  - `customerInfoSchema` (Step 2): first_name, last_name, email, phone, preferred_locale
  - `fullReservationSchema` — composição dos dois schemas acima

### Componente Multi-Step (estrutura)
- [x] Criar `src/components/features/reservation/reservation-form.tsx` — container principal "use client":
  - Estado do step atual (1-4)
  - React Hook Form com fullReservationSchema
  - Navegação avançar/voltar entre steps
  - Barra de progresso visual
- [x] Criar `src/components/features/reservation/step-indicator.tsx` — indicador visual de etapas (1 de 4)

### Step 1 — Informações da Reserva
- [x] Criar `src/components/features/reservation/step-reservation-info.tsx`:
  - Date picker (calendário) com datas desabilitadas (passadas, fora da janela, fechadas)
  - Seleção de horário (radio/select) — atualiza ao mudar data
  - Seleção de acomodação (radio cards) com info de capacidade restante e min/max pessoas
  - Seleção de número de pessoas (select/number) — limitado pelo min/max da acomodação
  - Campo de solicitações especiais (textarea, opcional)
  - Validação inline com mensagens em PT

### Step 2 — Dados do Cliente
- [x] Criar `src/components/features/reservation/step-customer-info.tsx`:
  - Campos: nome, sobrenome, email, telefone
  - Select para idioma preferido (PT/EN/ES) — padrão PT
  - Validação inline (email válido, campos obrigatórios)

### Step 3 — Cartão de Crédito (placeholder condicional)
- [x] Criar `src/components/features/reservation/step-card-placeholder.tsx`:
  - Renderizado APENAS se `requiresCardGuarantee(date)` for true
  - Mensagem explicando que validação Stripe será implementada na Fase 5
  - Visual placeholder simulando campos de cartão (desabilitados)
  - Se a data não exige cartão, o step é pulado automaticamente (Step 2 → Step 4)

### Step 4 — Confirmação e Submissão
- [x] Criar `src/components/features/reservation/step-confirmation.tsx`:
  - Resumo completo da reserva: data, horário, acomodação, pessoas, dados do cliente
  - Botão "Confirmar Reserva"
  - Ao confirmar: gerar ID fictício (UUID), simular submissão, redirecionar para página de sucesso

### Página de Reserva (integração)
- [x] Atualizar `src/app/(public)/reserva/page.tsx` para renderizar ReservationForm

### Página de Sucesso
- [x] Criar `src/app/(public)/reserva/sucesso/page.tsx`:
  - Exibe detalhes da reserva (via query params ou state)
  - ID da reserva
  - Link para cancelamento (mock token)
  - Mensagem de confirmação por email (mock)

### Página de Cancelamento (mock funcional)
- [x] Atualizar `src/app/(public)/cancelar/[token]/page.tsx`:
  - Busca reserva por token em mock data
  - Se encontrada: mostra detalhes e botão "Cancelar Reserva"
  - Ao cancelar: exibe confirmação de cancelamento (sem persistência)
  - Se não encontrada: mostra mensagem de erro
  - Se já cancelada: mostra mensagem apropriada

### Verificação Final
- [x] `npm run dev` funciona sem erros
- [x] Formulário completo navegável (avançar/voltar entre todos os steps)
- [x] Validação em tempo real funcional (mensagens em PT, inline)
- [x] Tipos de acomodação exibem capacidade restante corretamente
- [x] Etapa de cartão aparece condicionalmente (baseado em card_guarantee_override da data ou card_guarantee_days) e é pulada quando não exigida
- [x] Página de sucesso exibe ID fictício e detalhes da reserva
- [x] Página `/cancelar/[token]` funcional com mock data
- [x] `npx tsc --noEmit` sem erros
- [x] `npm run lint` sem erros (1 warning esperado do React Compiler sobre form.watch)
- [x] Responsivo (mobile + desktop)
- [x] CurrentState.md atualizado
- [x] Phases.md status → COMPLETE
- [x] DecisionLog.md atualizado com novas decisões

## Notas

- Toda lógica de disponibilidade usa mock data. Na Fase 4 será substituída por queries Supabase.
- O Step 3 (cartão) é pulado se a data não exige garantia. O contador de steps deve refletir isso (ex: "Etapa 2 de 3" se cartão não necessário, "Etapa 3 de 4" se necessário).
- A submissão não persiste dados (sem banco). Gera UUID mock e redireciona para sucesso.
- Cancelamento consulta mock data e simula ação sem persistência.
