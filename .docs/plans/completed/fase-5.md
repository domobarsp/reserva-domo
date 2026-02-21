# Fase 5 — Integração Stripe

**Status**: `COMPLETE`
**Início**: 2026-02-18
**Conclusão**: 2026-02-21

---

## 0 — Fechar Fase 4.7 e preparar docs

- [x] 0.1 Mover `plans/current.md` → `plans/completed/fase-4.7.md` (marcar 4.3 como concluída)
- [x] 0.2 Atualizar `Phases.md` (Fase 4.7 → COMPLETE)
- [x] 0.3 Atualizar `CurrentState.md` (fase atual: 5)
- [x] 0.4 Criar novo `plans/current.md` (este arquivo)
- [x] **Checkpoint**: Docs de fechamento da 4.7 completos, docs da Fase 5 criados

---

## 1 — Dependências e infraestrutura Stripe

- [x] 1.1 Instalar `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
- [x] 1.2 Criar `src/utils/stripe/client.ts` (instância server-side)
- [x] 1.3 Vars de ambiente já presentes em `.env.local` (chaves de teste)
- [x] **Checkpoint**: `npm run dev` sem erros, imports Stripe disponíveis

---

## 2 — API Route: SetupIntent

- [x] 2.1 Criar `src/app/api/stripe/setup-intent/route.ts`
- [x] 2.2 Buscar/criar Stripe Customer por email (`stripe.customers.search` + `stripe.customers.create`)
- [x] 2.3 Criar SetupIntent com customer + metadata
- [x] 2.4 Retornar `{ clientSecret, stripeCustomerId }`
- [x] **Checkpoint**: POST `/api/stripe/setup-intent` retorna clientSecret válido

---

## 3 — Componente StepCardStripe

- [x] 3.1 Criar `src/components/features/reservation/step-card-stripe.tsx`
- [x] 3.2 Chamar `/api/stripe/setup-intent` na montagem para obter `clientSecret`
- [x] 3.3 Renderizar `<Elements>` + `<PaymentElement>` com o `clientSecret`
- [x] 3.4 Expor `triggerRef` (chamado pelo pai no "Avançar") que executa `confirmSetup({ redirect: 'if_required' })`
- [x] 3.5 Em sucesso: chamar `onSuccess(stripeCustomerId, paymentMethodId)`
- [x] 3.6 Em erro: exibir mensagem de erro do Stripe no componente
- [x] **Checkpoint**: Step de cartão renderiza `<PaymentElement>` real em ambiente de teste

---

## 4 — Integrar Stripe em reservation-form.tsx

- [x] 4.1 Adicionar estado local: `stripeCustomerId`, `paymentMethodId`, `isConfirmingCard`, `cardError`
- [x] 4.2 Ao clicar "Avançar" no card step: acionar `cardTriggerRef.current()` (não `handleNext` direto)
- [x] 4.3 No `onSuccess` do StepCardStripe: salvar IDs no estado e avançar para confirmação
- [x] 4.4 Substituir `<StepCardPlaceholder>` por `<StepCardStripe>` (condicional em `getCardStep()`)
- [x] 4.5 No `handleSubmit` (confirmação): incluir `stripe_customer_id` + `stripe_payment_method_id` no body do POST se `needsCard`
- [x] **Checkpoint**: Fluxo completo com cartão de teste `4242 4242 4242 4242` → reserva criada com campos Stripe

---

## 5 — Atualizar /api/reservations para aceitar campos Stripe

- [x] 5.1 Adicionar `apiReservationSchema` em `validations/reservation.ts` (estende `fullReservationSchema` com campos Stripe opcionais)
- [x] 5.2 API route usa `apiReservationSchema` e salva campos quando presentes
- [x] **Checkpoint**: Reserva no Supabase tem `stripe_payment_method_id` preenchido após fluxo com cartão

---

## 6 — API Route: Cobrar No-Show

- [x] 6.1 Criar `src/app/api/stripe/charge-no-show/route.ts` (autenticada)
- [x] 6.2 Verificar sessão Supabase (admin autenticado)
- [x] 6.3 Buscar reserva + exception_dates + settings para resolver valor do no-show
- [x] 6.4 Validar pré-condições: status `no_show`, `stripe_payment_method_id` presente, `!no_show_charged`
- [x] 6.5 Criar `PaymentIntent` (`off_session: true, confirm: true`)
- [x] 6.6 Inserir em `no_show_charges` (status `pending`)
- [x] 6.7 Atualizar `reservations.no_show_charged = true`, `no_show_charge_amount`, `no_show_charge_id`
- [x] **Checkpoint**: POST `/api/stripe/charge-no-show` cria cobrança no Stripe Test Dashboard

---

## 7 — Webhook Handler

- [x] 7.1 Criar `src/app/api/stripe/webhook/route.ts` com `export const runtime = 'nodejs'`
- [x] 7.2 Verificar assinatura com `stripe.webhooks.constructEvent`
- [x] 7.3 Handler `payment_intent.succeeded`: atualizar `no_show_charges.status = 'succeeded'`
- [x] 7.4 Handler `payment_intent.payment_failed`: atualizar status `'failed'` + salvar `error_message`
- [x] **Checkpoint**: Webhook configurado (STRIPE_WEBHOOK_SECRET via `stripe listen`)

---

## 8 — Admin UI: badge de cartão e ação "Cobrar No-Show"

- [x] 8.1 Em `reservation-table.tsx`: coluna "Cartão" com ícone 💳 se `stripe_payment_method_id` presente
- [x] 8.2 No `DropdownMenu` de ações: item "Cobrar No-Show" condicional
- [x] 8.3 Badge "Cobrado" (emerald) após cobrança bem-sucedida
- [x] 8.4 Em `reservas-page-content.tsx`: `handleChargeNoShow` → POST + toast + atualização otimista
- [x] **Checkpoint**: Admin consegue cobrar no-show com um clique e ver feedback visual do resultado

---

## 9 — Verificação final e docs

- [x] 9.1 `npx tsc --noEmit` sem erros
- [x] 9.2 `npm run lint` sem novos erros
- [x] 9.3 Atualizar `CurrentState.md`
- [x] 9.4 Atualizar `Phases.md` (Fase 5 → COMPLETE)
- [x] 9.5 Mover este arquivo → `plans/completed/fase-5.md`
- [x] **Checkpoint**: Critérios de aceitação da Fase 5 todos cumpridos

---

## Notas Técnicas

- **Sem webhook para SetupIntent**: `payment_method_id` capturado diretamente do `confirmSetup` client-side — sem necessidade de evento `setup_intent.succeeded`
- **Reserva criada só na confirmação**: mesmo com cartão, nenhuma reserva "zumbi" é criada se o usuário abandona no step de cartão
- **`apiReservationSchema`** estende `fullReservationSchema` sem alterar o tipo do formulário (`FullReservationData`) — separação limpa entre form e API
- **`triggerRef`**: padrão ref para comunicação pai→filho sem prop drilling excessivo, adequado para o `confirmSetup` que precisa do contexto do `<Elements>`
