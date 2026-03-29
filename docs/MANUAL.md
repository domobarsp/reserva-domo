# Manual do Usuário — Dōmo Reservas

Bem-vindo ao sistema de reservas do Dōmo. Este manual explica como usar todas as funcionalidades da plataforma.

---

## Sumário

1. [Acessando o painel](#1-acessando-o-painel)
2. [Dashboard](#2-dashboard)
3. [Reservas](#3-reservas)
4. [Calendário](#4-calendário)
5. [Lista de Espera](#5-lista-de-espera)
6. [Passantes](#6-passantes)
7. [Relatórios](#7-relatórios)
8. [Configurações](#8-configurações)
9. [Controle de Acesso](#9-controle-de-acesso)
10. [Como funciona a reserva online (visão do cliente)](#10-como-funciona-a-reserva-online)
11. [Perguntas frequentes](#11-perguntas-frequentes)

---

## 1. Acessando o painel

### Login

1. Acesse o endereço do painel administrativo (ex: `seudominio.com/admin`)
2. Digite seu **usuário** (ex: `joao.silva`) e sua **senha**
3. Clique em **Entrar**

> Se sua senha foi resetada pelo proprietário, o sistema vai pedir para você criar uma nova senha no primeiro acesso.

### Menu lateral

Após o login, você verá o menu lateral com as seguintes opções:

| Menu | O que faz |
|------|-----------|
| **Dashboard** | Visão geral das reservas do dia/semana |
| **Reservas** | Gerenciar todas as reservas |
| **Calendário** | Visualização mensal de ocupação |
| **Lista de Espera** | Clientes aguardando mesa |
| **Passantes** | Registrar clientes sem reserva |
| **Relatórios** | Dados e estatísticas do restaurante |
| **Configurações** | Horários, acomodações, capacidade, etc. |
| **Acessos** | Gerenciar usuários do sistema (apenas proprietário) |

> Dependendo do seu cargo, algumas opções podem não aparecer. Operadores não veem Configurações e Acessos. Gerentes não veem Acessos.

### Sair do sistema

Clique no botão **Sair** no canto inferior do menu lateral.

---

## 2. Dashboard

O Dashboard é a primeira tela que você vê ao entrar. Ele mostra um resumo das reservas.

### Período

No canto superior direito, você pode escolher o período:
- **Hoje** — mostra apenas as reservas do dia
- **Esta semana** — reservas dos próximos 7 dias
- **Próximos 15 dias** — visão mais ampla

### Cards de estatísticas

Cinco cards mostram os números do período selecionado:

- **Total de Reservas** — quantas reservas existem no período
- **Confirmadas** — reservas já confirmadas
- **Pendentes** — reservas aguardando confirmação
- **Canceladas** — reservas canceladas
- **Clientes Esperados** — total de pessoas em reservas ativas

### Gráfico

Para períodos de mais de um dia, aparece um gráfico de barras mostrando o volume de reservas por dia.

### Tabela de reservas

Abaixo, uma tabela mostra as reservas do período com horário, cliente, acomodação e status.

### Criar reserva rápida

Clique em **Nova Reserva** no canto superior direito para criar uma reserva manualmente.

---

## 3. Reservas

A página de Reservas é onde você gerencia todas as reservas do restaurante.

### Filtros

Use os filtros para encontrar reservas:
- **Data** — selecione uma data específica (padrão: hoje)
- **Status** — filtre por Pendente, Confirmado, Cancelado, etc.
- **Acomodação** — filtre por tipo de acomodação (Mesa, Balcão, etc.)
- **Limpar** — volta os filtros ao padrão

### Tabela de reservas

Cada linha mostra: data, horário, nome do cliente, acomodação, número de pessoas e status.

**Ícones de cartão** (coluna antes das ações):
- 💳 cinza = cartão registrado como garantia
- 💳 amarelo = no-show pendente de cobrança
- ✓ verde = no-show já cobrado

### Ações disponíveis

**Clicar na linha** → abre o painel de detalhes da reserva no lado direito.

**Menu de ações (...)** de cada reserva:
- **Editar** — alterar data, horário, acomodação, número de pessoas
- **Cobrar No-Show** — cobrar a taxa do cartão (apenas para no-shows com cartão)

**Mudança de status** via dropdown:
- Pendente → Confirmado ou Cancelado
- Confirmado → Sentado, Não Compareceu ou Cancelado
- Sentado → Concluído ou Não Compareceu

### Painel de detalhes

Ao clicar em uma reserva, o painel lateral mostra:
- **Dados do cliente** — nome, email, telefone, idioma
- **Solicitações especiais** — pedidos especiais do cliente
- **Garantia e cobrança** — se tem cartão, se foi cobrado no-show
- **Histórico** — todas as mudanças de status e edições com data e hora

No rodapé do painel, botões de ação aparecem conforme o status atual:
- **Confirmar reserva** — muda de Pendente para Confirmado
- **Marcar como sentado** — cliente chegou
- **Concluir atendimento** — cliente terminou
- **Não compareceu** — marca como no-show
- **Cancelar reserva** — cancela a reserva
- **Cobrar no-show** — cobra o cartão (com confirmação)

### Criar reserva manualmente

1. Clique em **Nova Reserva**
2. Preencha os dados do cliente (nome, email, telefone, idioma)
3. Escolha data, horário, acomodação e número de pessoas
4. Adicione solicitações especiais se necessário
5. Selecione a origem: "Admin" (criada internamente) ou "Telefone" (cliente ligou)
6. Clique em **Criar Reserva**

---

## 4. Calendário

O Calendário mostra uma visão mensal da ocupação do restaurante.

### Como ler o calendário

Cada dia mostra o número de reservas e o total de pessoas. As cores indicam o nível de ocupação:

- 🟢 **Verde** (até 35%) — ocupação baixa
- 🟡 **Amarelo** (35% a 70%) — ocupação média
- 🔴 **Vermelho** (acima de 70%) — ocupação alta
- ⚫ **Cinza** — dia fechado
- **Ponto cinza** — sem reservas nesse dia

### Navegação

- Use as setas **‹** e **›** para mudar de mês
- O dia atual é destacado com um círculo

### Clique em um dia

Ao clicar em um dia, você é levado direto para a página de Reservas filtrada por aquela data.

---

## 5. Lista de Espera

A Lista de Espera serve para registrar clientes que chegam sem reserva e precisam aguardar.

### Adicionar à lista

1. Clique em **Adicionar**
2. Preencha: nome, telefone, email (opcional), número de pessoas e solicitações especiais
3. Clique em **Adicionar**

### Gerenciar a lista

Cada cliente na lista mostra: horário de chegada, nome, telefone, pessoas e status.

**Ações disponíveis** (apenas para clientes "Aguardando"):
- **Acomodar** — o cliente foi sentado (muda para "Acomodado")
- **Remover** — remove da lista (muda para "Removido")

### Detalhes

Clique em uma linha para ver os detalhes completos, incluindo contato, solicitações e linha do tempo (quando chegou, quando foi acomodado).

---

## 6. Passantes

A seção de Passantes serve para registrar clientes que chegam sem reserva e são atendidos diretamente, como um registro/log.

### Registrar passante

1. Clique em **Registrar**
2. Preencha: nome, telefone (opcional), email (opcional), número de pessoas e solicitações especiais
3. Clique em **Registrar**

### Consultar

Use os filtros de nome e telefone para buscar registros. Clique em uma linha para ver os detalhes completos.

---

## 7. Relatórios

A página de Relatórios mostra estatísticas detalhadas do restaurante.

### Período

Escolha o período de análise:
- **7 dias** — última semana
- **30 dias** — último mês (padrão)
- **90 dias** — último trimestre
- **Personalizado** — escolha datas de início e fim

### Indicadores (KPIs)

Quatro cards mostram os números do período com comparação ao período anterior (seta ↑ ou ↓):
- **Total de Reservas**
- **Total de Pessoas** (covers)
- **Taxa de No-Show** (%)
- **Taxa de Cancelamento** (%)

### Gráficos

- **Reservas por dia** — gráfico de barras mostrando o volume diário
- **Distribuição por status** — gráfico de rosca com percentuais

### Tabela de acomodações

Mostra o desempenho de cada tipo de acomodação: reservas, pessoas, no-shows e taxa de no-show.

### Exportar dados

Clique em **Exportar CSV** para baixar uma planilha com todas as reservas do período. O arquivo abre no Excel.

---

## 8. Configurações

> Disponível apenas para Proprietários e Gerentes.

### Horários

Configure os períodos de funcionamento:
- **Nome** — ex: "Almoço", "Jantar 19h", "Jantar 21h30"
- **Início e Término** — horário de funcionamento
- **Dias da semana** — quais dias esse horário está ativo
- **Antecedência mínima** — até quantos minutos antes do início aceita reservas (ex: 60 = aceita até 1h antes)
- **Ativo/Inativo** — desative temporariamente sem excluir

### Acomodações

Configure os tipos de acomodação:
- **Nome** — ex: "Mesa", "Balcão", "Área VIP"
- **Descrição** — breve descrição para o cliente
- **Mínimo e Máximo de lugares** — capacidade da acomodação
- **Ordem de exibição** — ordem que aparece para o cliente
- **Ativo/Inativo** — desative sem excluir

### Capacidade

Defina quantas pessoas cada combinação de acomodação + horário comporta:
- Exemplo: "Mesa" no "Jantar 19h" = máximo 30 pessoas
- Isso controla quantas vagas aparecem para o cliente na reserva online

> **Importante:** Se você criar um novo horário ou acomodação, precisa criar as regras de capacidade correspondentes. Sem regra de capacidade, o horário aparecerá como "Esgotado".

### Garantia & No-Show

**Garantia com Cartão:**
- Marque os dias da semana em que o cliente precisa registrar um cartão de crédito para confirmar a reserva
- Exemplo: sexta e sábado exigem cartão

**Taxa de No-Show:**
- Define o valor cobrado quando o cliente não comparece (ex: R$ 50,00)
- Este valor pode ser alterado por data específica (via Exceções) ou por reserva individual

### Exceções

Crie regras especiais para datas específicas:
- **Fechar o restaurante** em um feriado
- **Alterar capacidade** para um evento especial
- **Dispensar garantia** de cartão em uma data
- **Alterar taxa de no-show** para uma data

---

## 9. Controle de Acesso

> Disponível apenas para o Proprietário.

### Usuários

A página mostra todos os usuários do sistema com nome, login, cargo e status.

### Cargos

| Cargo | O que pode fazer |
|-------|-----------------|
| **Proprietário** | Tudo — incluindo gerenciar usuários e configurações |
| **Gerente** | Tudo, exceto gerenciar usuários |
| **Operador** | Dashboard, reservas, calendário, lista de espera, passantes e relatórios |

### Ações disponíveis

No menu **⋯** de cada usuário:

- **Editar** — alterar o nome de exibição
- **Resetar senha** — gera uma senha temporária que você deve compartilhar com o usuário. No próximo login, ele será obrigado a criar uma nova senha.
- **Mudar cargo** — alterar entre Proprietário, Gerente e Operador
- **Desativar** — bloqueia o acesso imediatamente (o usuário é deslogado na hora)
- **Ativar** — reativa um usuário desativado
- **Excluir permanentemente** — remove o usuário do sistema (só funciona para usuários desativados)

### Adicionar novo usuário

1. Clique em **Adicionar Usuário**
2. Preencha:
   - **Login** — nome de usuário (ex: `joao.silva`)
   - **Senha** — senha inicial (informe ao usuário)
   - **Confirmar senha**
   - **Nome de exibição** — nome que aparece no sistema
   - **Cargo** — Proprietário, Gerente ou Operador
3. Clique em **Criar**

> O usuário faz login com o nome de usuário que você definir. Não é necessário email.

### Proteções

- Você não pode desativar ou rebaixar a si mesmo
- O sistema não permite desativar ou rebaixar o último Proprietário ativo (sempre deve haver pelo menos um)

---

## 10. Como funciona a reserva online

Esta é a experiência que o **cliente** vê ao acessar o site de reservas.

### Passo 1 — Escolher data e horário

O cliente escolhe:
1. **Data** — calendário mostra os próximos dias disponíveis
2. **Horário** — aparecem os turnos disponíveis para o dia (ex: Almoço, Jantar 19h)
3. **Acomodação** — Mesa ou Balcão, com indicação de vagas restantes
4. **Número de pessoas** — dentro da capacidade disponível
5. **Solicitações especiais** — campo opcional (aniversário, restrição alimentar, etc.)

### Passo 2 — Dados pessoais

O cliente informa nome, email, telefone e idioma preferido para os emails de confirmação.

### Passo 3 — Garantia com cartão (quando necessário)

Se a data exige garantia, o cliente registra um cartão de crédito. **Nenhuma cobrança é feita neste momento.** O cartão só será cobrado em caso de não comparecimento.

### Passo 4 — Confirmação

O cliente revisa todos os dados e confirma a reserva.

### Após a reserva

- O cliente recebe um **email de confirmação** com os detalhes e um link para cancelar
- O restaurante recebe uma **notificação por email**
- A reserva aparece automaticamente no painel administrativo

### Cancelamento pelo cliente

O cliente pode cancelar clicando no link do email de confirmação. A reserva é cancelada imediatamente.

---

## 11. Perguntas frequentes

### Por que um horário aparece como "Esgotado" mesmo sem reservas?

Provavelmente falta criar uma regra de capacidade. Vá em **Configurações > Capacidade** e crie uma regra para a combinação de acomodação + horário.

### Por que não consigo cobrar no-show de um cliente?

Para cobrar no-show, a reserva precisa:
1. Ter status "Não Compareceu"
2. O cliente ter registrado um cartão de crédito na reserva
3. A cobrança ainda não ter sido feita

### Como fecho o restaurante em um feriado?

Vá em **Configurações > Exceções**, clique em **Criar Exceção**, selecione a data e marque como "Fechado". O dia não aparecerá mais como disponível para reservas.

### Como mudo a senha de um funcionário?

Vá em **Acessos**, encontre o usuário no menu **⋯** e clique em **Resetar senha**. Uma senha temporária será gerada. Compartilhe com o funcionário — ele será obrigado a criar uma nova no próximo acesso.

### Os clientes são cobrados ao registrar o cartão?

Não. O cartão é apenas registrado como garantia. A cobrança só acontece se o cliente não comparecer e o operador acionar a cobrança de no-show.

### Como altero a taxa de no-show para uma data específica?

Vá em **Configurações > Exceções**, crie uma exceção para a data desejada e preencha o campo de valor da taxa.

### Como sei se o restaurante está lotado?

O **Calendário** mostra cores para cada dia indicando o nível de ocupação. Vermelho = acima de 70% da capacidade.

### As reservas atualizam em tempo real?

Sim. Quando uma nova reserva é criada, cancelada ou modificada, todas as telas do painel atualizam automaticamente sem precisar recarregar a página.
