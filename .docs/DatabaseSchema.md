# Schema do Banco de Dados (Supabase/PostgreSQL)

> Implementação real na Fase 4. Este doc serve como referência para mock data e tipos TypeScript desde a Fase 1.

## Diagrama de Relacionamentos

```
restaurants (1) ─── (N) accommodation_types
restaurants (1) ─── (N) time_slots
restaurants (1) ─── (N) capacity_rules
restaurants (1) ─── (N) reservations
restaurants (1) ─── (N) waitlist_entries
restaurants (1) ─── (N) walk_ins
restaurants (1) ─── (N) exception_dates
restaurants (1) ─── (N) settings
restaurants (1) ─── (N) admin_users

accommodation_types (1) ─── (N) capacity_rules
time_slots (1) ─── (N) capacity_rules

customers (1) ─── (N) reservations
accommodation_types (1) ─── (N) reservations
time_slots (1) ─── (N) reservations

reservations (1) ─── (N) reservation_status_history
reservations (1) ─── (N) no_show_charges
```

---

## Tabelas

### restaurants

Dados do restaurante. Single-tenant, mas com `id` para futuro multi-tenant.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | TEXT | NOT NULL | — | Nome do restaurante |
| slug | TEXT | NOT NULL | — | Slug único (URL-friendly) |
| address | TEXT | NULL | — | Endereço |
| phone | TEXT | NULL | — | Telefone |
| email | TEXT | NULL | — | Email de contato |
| timezone | TEXT | NOT NULL | 'America/Sao_Paulo' | Timezone do restaurante |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: UNIQUE(slug)

---

### accommodation_types

Tipos de acomodação: Mesa, Balcão, etc.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| name | TEXT | NOT NULL | — | Ex: "Mesa", "Balcão" |
| description | TEXT | NULL | — | Descrição curta |
| min_seats | INT | NOT NULL | 1 | Mínimo de pessoas |
| max_seats | INT | NOT NULL | 6 | Máximo de pessoas |
| display_order | INT | NOT NULL | 0 | Ordem de exibição |
| is_active | BOOLEAN | NOT NULL | TRUE | Ativo/inativo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: (restaurant_id)

---

### time_slots

Horários disponíveis para reserva.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| name | TEXT | NOT NULL | — | Ex: "Jantar 19h", "Jantar 21h30" |
| start_time | TIME | NOT NULL | — | Ex: '19:00' |
| end_time | TIME | NOT NULL | — | Ex: '21:00' |
| days_of_week | INT[] | NOT NULL | '{0,1,2,3,4,5,6}' | 0=Domingo, 6=Sábado |
| is_active | BOOLEAN | NOT NULL | TRUE | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: (restaurant_id)

---

### capacity_rules

Capacidade máxima por tipo de acomodação por horário.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| accommodation_type_id | UUID | NOT NULL | — | FK → accommodation_types |
| time_slot_id | UUID | NOT NULL | — | FK → time_slots |
| max_covers | INT | NOT NULL | — | Máximo de pessoas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: UNIQUE(accommodation_type_id, time_slot_id)

---

### customers

Clientes que fizeram reserva.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| first_name | TEXT | NOT NULL | — | Primeiro nome |
| last_name | TEXT | NOT NULL | — | Sobrenome |
| email | TEXT | NOT NULL | — | Email |
| phone | TEXT | NULL | — | Telefone (formato internacional) |
| preferred_locale | TEXT | NOT NULL | 'pt' | Idioma preferido (pt/en/es) |
| notes | TEXT | NULL | — | Notas internas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: (email)

---

### reservations

Tabela principal de reservas.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| customer_id | UUID | NOT NULL | — | FK → customers |
| accommodation_type_id | UUID | NOT NULL | — | FK → accommodation_types |
| time_slot_id | UUID | NOT NULL | — | FK → time_slots |
| date | DATE | NOT NULL | — | Data da reserva |
| reservation_time | TIME | NOT NULL | — | Horário específico |
| party_size | INT | NOT NULL | — | Número de pessoas (CHECK > 0) |
| status | TEXT | NOT NULL | 'pending' | pending/confirmed/seated/complete/no_show/cancelled |
| special_requests | TEXT | NULL | — | Solicitações especiais |
| stripe_customer_id | TEXT | NULL | — | ID do customer no Stripe |
| stripe_setup_intent_id | TEXT | NULL | — | ID do SetupIntent |
| stripe_payment_method_id | TEXT | NULL | — | ID do PaymentMethod salvo |
| cancellation_token | UUID | NULL | uuid_generate_v4() | Token para cancelamento via link |
| cancelled_at | TIMESTAMPTZ | NULL | — | Quando foi cancelado |
| cancelled_by | TEXT | NULL | — | 'customer' ou 'admin' |
| no_show_fee_override | INT | NULL | NULL | Valor planejado de no-show em centavos, editável pelo admin antes da cobrança (null=usar padrão da data ou global) |
| no_show_charged | BOOLEAN | NOT NULL | FALSE | Se foi cobrado no-show |
| no_show_charge_amount | INT | NULL | — | Valor efetivamente cobrado (centavos, preenchido após cobrança, imutável) |
| no_show_charge_id | TEXT | NULL | — | ID do PaymentIntent de cobrança |
| source | TEXT | NOT NULL | 'online' | online/admin/phone |
| locale | TEXT | NOT NULL | 'pt' | Idioma para emails (pt/en/es) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: (date), (status), (restaurant_id, date), (cancellation_token)
**Constraints**: CHECK(status IN ('pending','confirmed','seated','complete','no_show','cancelled')), CHECK(party_size > 0), CHECK(source IN ('online','admin','phone')), CHECK(locale IN ('pt','en','es'))

---

### reservation_status_history

Auditoria de mudanças de status.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| reservation_id | UUID | NOT NULL | — | FK → reservations (CASCADE) |
| from_status | TEXT | NULL | — | Status anterior (null na criação) |
| to_status | TEXT | NOT NULL | — | Novo status |
| changed_by | UUID | NULL | — | ID do admin (null = sistema/cliente) |
| notes | TEXT | NULL | — | Observação |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: (reservation_id)

---

### waitlist_entries

Fila de espera (registro simples, sem automação).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| customer_name | TEXT | NOT NULL | — | Nome completo |
| customer_email | TEXT | NULL | — | Email |
| customer_phone | TEXT | NOT NULL | — | Telefone (internacional) |
| party_size | INT | NOT NULL | — | Número de pessoas (CHECK > 0) |
| arrival_time | TIMESTAMPTZ | NOT NULL | NOW() | Horário de chegada |
| special_requests | TEXT | NULL | — | Observações |
| status | TEXT | NOT NULL | 'waiting' | waiting/seated/removed |
| seated_at | TIMESTAMPTZ | NULL | — | Quando foi acomodado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Constraints**: CHECK(status IN ('waiting','seated','removed'))

---

### walk_ins

Registro de passantes (clientes sem reserva).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| customer_name | TEXT | NOT NULL | — | Nome completo |
| customer_email | TEXT | NULL | — | Email |
| customer_phone | TEXT | NULL | — | Telefone (internacional) |
| party_size | INT | NOT NULL | — | Número de pessoas |
| special_requests | TEXT | NULL | — | Observações |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

---

### exception_dates

Fechamentos, overrides de capacidade e overrides de garantia de cartão em datas específicas.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| date | DATE | NOT NULL | — | Data da exceção |
| is_closed | BOOLEAN | NOT NULL | FALSE | Fechado nesta data? |
| reason | TEXT | NULL | — | Motivo (ex: "Feriado") |
| capacity_override | JSONB | NULL | — | Override de capacidade por acomodação |
| card_guarantee_override | BOOLEAN | NULL | NULL | true=exigir cartão, false=dispensar, null=seguir regra padrão |
| no_show_fee_override | INT | NULL | NULL | Override da taxa de no-show em centavos para esta data (null=usar padrão) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: UNIQUE(restaurant_id, date)

**Formato capacity_override**:
```json
{
  "<accommodation_type_id>": { "max_covers": 20 },
  "<accommodation_type_id>": { "max_covers": 0 }
}
```

---

### settings

Configurações do sistema (key-value).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| key | TEXT | NOT NULL | — | Chave da configuração |
| value | JSONB | NOT NULL | — | Valor |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Índices**: UNIQUE(restaurant_id, key)

**Chaves padrão**:
| Key | Valor padrão | Descrição |
|-----|-------------|-----------|
| `no_show_fee` | `{ "amount": 5000, "currency": "brl" }` | Taxa de no-show (centavos) |
| `card_guarantee_days` | `{ "days": [5, 6] }` | Dias da semana que exigem cartão (0=Dom, 5=Sex, 6=Sáb) |
| `booking_window_days` | `{ "value": 30 }` | Quantos dias no futuro aceita reserva |
| `cancellation_deadline_hours` | `{ "value": 2 }` | Horas antes da reserva para cancelamento gratuito |

---

### admin_users

Usuários administrativos (vinculados ao Supabase Auth).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | — | PK, FK → auth.users (CASCADE) |
| restaurant_id | UUID | NOT NULL | — | FK → restaurants |
| role | TEXT | NOT NULL | 'staff' | owner/manager/staff |
| display_name | TEXT | NOT NULL | — | Nome de exibição |
| is_active | BOOLEAN | NOT NULL | TRUE | Ativo/inativo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Constraints**: CHECK(role IN ('owner','manager','staff'))

---

### no_show_charges

Registro de cobranças de no-show via Stripe.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| reservation_id | UUID | NOT NULL | — | FK → reservations |
| stripe_payment_intent_id | TEXT | NOT NULL | — | ID do PaymentIntent |
| amount | INT | NOT NULL | — | Valor em centavos |
| currency | TEXT | NOT NULL | 'brl' | Moeda |
| status | TEXT | NOT NULL | 'pending' | pending/succeeded/failed |
| error_message | TEXT | NULL | — | Mensagem de erro (se falhou) |
| charged_by | UUID | NULL | — | FK → admin_users |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |

**Constraints**: CHECK(status IN ('pending','succeeded','failed'))

---

## Resolução do Valor de No-Show

Ao cobrar no-show, o sistema determina o valor com a seguinte prioridade (maior para menor):

1. `reservations.no_show_fee_override` — valor específico da reserva (editável pelo admin a qualquer momento antes da cobrança)
2. `exception_dates.no_show_fee_override` — valor específico da data da reserva
3. `settings.no_show_fee.amount` — valor padrão global

O admin pode editar o `no_show_fee_override` da reserva até o momento da cobrança. Após a cobrança, o valor efetivamente cobrado é salvo em `no_show_charge_amount` (imutável) e a tabela `no_show_charges` registra os detalhes da transação Stripe.

---

## Transições de Status Válidas

```
pending    → confirmed, cancelled
confirmed  → seated, no_show, cancelled
seated     → complete, no_show
complete   → (final)
no_show    → (final)
cancelled  → (final)
```

## Seed Data (Fase 4)

Ao criar o banco, seedar com:
- 1 restaurante (Domo)
- 2 tipos de acomodação: Mesa (1-6 pessoas), Balcão (1-3 pessoas)
- 2 horários: Jantar 19h (19:00-21:00), Jantar 21h30 (21:30-23:30)
- 4 capacity_rules (2 tipos × 2 horários)
- Settings padrão (no_show_fee, card_guarantee_days, booking_window_days, cancellation_deadline_hours)
- 1 admin_user (owner)
