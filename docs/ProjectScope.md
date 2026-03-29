# Escopo do Projeto — Domo

> Documento de referência de requisitos de negócio.
> Derivado da proposta comercial, filtrado para conteúdo relevante ao desenvolvimento.
> Para stack técnica, consulte `Agents.md`. Para schema, consulte `DatabaseSchema.md`.

## Objetivo do Sistema

O Domo é um sistema de gerenciamento de reservas para restaurante. Seu objetivo é:
- Gerenciar reservas de clientes de forma digital
- Reduzir no-shows por meio de garantia com cartão de crédito
- Facilitar a operação diária do restaurante
- Automatizar cobranças de no-show quando aplicável

---

## Funcionalidades do Cliente (Público)

### Formulário de Reserva Online

Formulário multi-step acessível via web:

**Step 1 — Informações da Reserva:**
- Seleção de data
- Seleção de horário pré-definido (ex: 19:00, 21:30 — configurável pelo admin)
- Seleção do tipo de acomodação:
  - Mesa (1 a 6 pessoas)
  - Balcão (1 a 3 pessoas)
  - Grupos maiores dependem de confirmação da casa
  - Tamanhos customizáveis no painel administrativo
- Campo aberto para solicitações especiais

**Step 2 — Dados do Cliente:**
- Nome completo
- E-mail
- Telefone
- Seleção de idioma preferido (PT/EN/ES) — usado apenas para emails

**Step 3 — Dados do Cartão (condicional):**
- Aparece apenas se o dia da reserva exige garantia com cartão (configurável pelo admin)
- Validação e armazenamento seguro via Stripe (SetupIntent)
- Nenhuma cobrança é realizada neste momento

**Step 4 — Tela de Conclusão:**
- Confirmação visual com detalhes da reserva
- ID da reserva

### Garantia com Cartão de Crédito

- Exigida em dias configuráveis pelo administrador (ex: sexta e sábado)
- Dados do cartão são validados e armazenados de forma segura via Stripe
- Nenhuma cobrança no momento da reserva
- O valor da taxa de no-show é editável pelo admin (geral ou por reserva específica)

### Confirmação e Cancelamento

- Cliente recebe e-mail de confirmação com link de cancelamento
- Cancelamento pode ser feito sem contato com o restaurante (self-service via link único)
- Cancelamento antes da data da reserva não gera cobrança
- Prazo de cancelamento configurável (ex: até 2 horas antes da reserva)

---

## Funcionalidades do Admin (Painel)

### Dashboard
- Cards de resumo do dia: total de reservas, confirmadas, pendentes, ocupação
- Acesso rápido às reservas do dia
- Atualizações em tempo real

### Calendário
- Visualização mensal com volume de pessoas/reservas por dia
- Clique no dia para ver reservas daquela data
- Codificação visual por status

### Gestão de Reservas
- Lista de reservas com filtros (data, status, tipo de acomodação)
- Edição de reservas existentes diretamente no admin
- Criação manual de reservas com horários customizados (não limitados aos horários padrão do site)
- Visualização de: nome, horário, tipo de acomodação, quantidade de pessoas, status

### Fluxo de Status
- Fluxo: **Pendente → Confirmado → Sentado → Completo**
- Transições alternativas: Confirmado/Sentado → Não Compareceu (No-Show)
- Transições alternativas: Pendente/Confirmado → Cancelado
- Status atualizado **manualmente pela equipe** — o sistema não altera status automaticamente

### Gestão de No-Show
- Ao marcar reserva como "Não Compareceu":
  - Sistema realiza automaticamente a cobrança da taxa no cartão salvo
- Valor determinado por prioridade: override na reserva > override na data > valor global
- Valor editável pelo admin: globalmente (settings), por data específica (exceções), ou por reserva individual (antes da cobrança)
- Tracking do status da cobrança (pendente/sucesso/falha)

### Lista de Espera
- Registro de clientes sem reserva que chegam ao restaurante:
  - Horário de chegada
  - Nome completo
  - Telefone (formato internacional)
  - E-mail
  - Tamanho da mesa
  - Solicitações especiais
- Visualização da fila com confirmação se foi acomodado ou não
- Sem automações, notificações ou priorização automática

### Passantes (Walk-ins)
- Registro de clientes walk-in:
  - Nome completo
  - Telefone (formato internacional)
  - E-mail
  - Tamanho da mesa
  - Solicitações especiais
- Registro simples para histórico — sem fluxo de status

### Configurações do Sistema
- **Horários**: Definição de horários de reserva disponíveis por turno
- **Acomodações**: Tipos de acomodação com tamanhos min/max
- **Capacidade**: Máximo de pessoas por tipo de acomodação por turno; ao atingir limite, acomodação fica indisponível para o turno
- **Garantia com Cartão**: Quais dias da semana exigem cartão (default: sexta e sábado, configurável)
- **Taxa de No-Show**: Valor padrão editável; override por data específica (exceções); override por reserva individual
- **Exceções**: Bloqueio total de reservas em datas específicas; ajustes pontuais de capacidade em datas específicas; override de garantia de cartão por data (exigir ou dispensar independente do dia da semana)
- **Capacidade pode ser alterada** em dias/turnos específicos

### Controle de Acesso
- **Admin**: Acesso total — reservas, configurações, acessos, relatórios
- **Usuário Normal**: Acesso operacional — ver/adicionar/editar reservas, passantes, lista de espera, ver relatórios. Sem acesso a configurações gerais e gestão de acessos

### Seções do Painel
- Reservas (com calendário visual)
- Passantes
- Lista de Espera
- Relatórios
- Configurações Gerais
- Acessos

---

## Relatórios

- Exportação da base geral de dados (CSV)
- Relatórios em formato de tabela:
  - Total de reservas por período
  - Total de no-shows por período
  - Valor total cobrado em taxas de no-show
  - Ocupação por horário
- Relatório geral padrão por período (configurável)

---

## Regras de Negócio Importantes

1. Capacidade é calculada por combinação tipo_acomodação + turno/horário
2. Datas de exceção podem fechar o restaurante ou alterar capacidade específica
3. Garantia com cartão é condicional por dia da semana (configurável)
4. Taxa de no-show é cobrada no cartão salvo, não é um novo pagamento
5. Cancelamento é gratuito antes do prazo; após prazo, o cartão pode ser cobrado
6. Emails são enviados no idioma preferido do cliente (PT/EN/ES)
7. O site é em português fixo (sem sistema i18n)
8. Single-tenant com restaurant_id para futuro multi-tenant
9. O sistema não altera status de reserva automaticamente — tudo é manual pela equipe
10. Grupos maiores que o limite configurado dependem de confirmação da casa

---

## Fora do Escopo

- Operação multi-restaurante/multi-tenant (schema e sistema suporta, mas não é necessário a implementação agora)
- Atribuição de mesa/assento específico (capacidade é por pessoas, não por mesa)
- Pagamento online no momento da reserva (apenas validação de cartão)
- Contas/login de clientes (interagem apenas via formulário + link de cancelamento)
- Notificações por SMS
- Conversão automática lista de espera → reserva
- Integração com sistemas POS
- Interface do site em múltiplos idiomas (apenas emails são multilíngue)
- Priorização ou automação na lista de espera
