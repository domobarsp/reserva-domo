# Domo — Guia Principal do Agente

> Este é o documento central do projeto. Leia-o SEMPRE antes de iniciar qualquer tarefa.

## O que é o Domo?

Sistema de gerenciamento de reservas para restaurante com:
- Formulário público de reserva online (multi-step)
- Garantia com cartão de crédito via Stripe (sem cobrança no momento da reserva)
- Painel administrativo completo para gestão diária
- Cobrança automática de no-show
- Emails transacionais (confirmação, cancelamento, cobrança)

## Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **Next.js 15** (App Router) | Framework principal |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS** | Estilização |
| **shadcn/ui** | Biblioteca de componentes |
| **Supabase** | Banco de dados, autenticação, realtime |
| **Stripe** | Validação/armazenamento de cartão, cobrança no-show |
| **Resend** | Emails transacionais |
| **Vercel** | Deploy |

## Decisões Fundamentais

- **Idioma do site**: Português fixo. Sem sistema i18n/multilíngue.
- **Campo de idioma**: O formulário coleta preferência do cliente (PT/EN/ES) — usado APENAS para enviar emails no idioma escolhido.
- **Single-tenant**: Um restaurante por instalação. Schema usa `restaurant_id` para futuro multi-tenant.
- **Fases auto-contidas**: Ao final de cada fase, `npm run dev` deve funcionar com o sistema visível, mesmo com features mockadas.

## Navegação dos Documentos

### Leitura obrigatória (SEMPRE):
- `Phases.md` — Fase atual, o que fazer agora
- `CurrentState.md` — O que funciona, o que está mockado, issues
- `DecisionLog.md` — Decisões já tomadas (nunca re-discutir)
- `ProjectScope.md` — Requisitos de negócio e escopo funcional

### Controle de execução (SEMPRE ao iniciar/durante uma fase):
- `plans/current.md` — Plano detalhado da fase atual com tarefas granulares
- `plans/completed/` — Histórico de planos de fases anteriores (consulta opcional)

### Consulta sob demanda (conforme a tarefa):
- `DesignSystem.md` — Ao trabalhar com UI, cores, espaçamento, componentes visuais
- `ProjectStructure.md` — Ao criar/mover arquivos ou pastas
- `DatabaseSchema.md` — Ao trabalhar com dados, queries, tipos
- `Services.md` — Ao trabalhar com Supabase, Stripe ou Resend
- `AgentBehavior.md` — Referência de conduta e regras (ler na primeira sessão)

## Regras de Ouro

1. **Leia antes de agir** — Sempre consulte os docs obrigatórios antes de começar
2. **Documente decisões** — Registre em `DecisionLog.md` com data e contexto
3. **Atualize o estado** — Após mudar o sistema, atualize `CurrentState.md`
4. **Respeite as fases** — Não implemente features de fases futuras
5. **Mantenha auto-contido** — Cada fase deve terminar com o sistema rodando
6. **Crie docs quando necessário** — Se nenhum doc cobre o tema, crie um novo aqui em `.docs/` e referencie neste arquivo
7. **Mock data** — Use `src/lib/mock-data.ts` com estrutura espelhando o schema do banco
8. **Prefira simplicidade** — Não sobre-engenharia. Implemente o mínimo necessário para a fase atual.
9. **Planeje antes de executar** — Antes de iniciar uma fase, crie o plano detalhado em `plans/current.md`.
10. **Atualize `plans/current.md` EM TEMPO REAL** — Para CADA tarefa individual: marque `**[DOING]**` ANTES de começar, marque `[x]` IMEDIATAMENTE ao concluir. Nunca acumule múltiplas tarefas para marcar depois.
