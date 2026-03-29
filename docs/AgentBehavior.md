# Comportamento do Agente

Regras de conduta para qualquer agente AI trabalhando neste projeto.

## Antes de Começar uma Tarefa

1. Leia `Agents.md` (sempre)
2. Leia `Phases.md` — identifique a fase atual e seu escopo
3. Leia `CurrentState.md` — entenda o que funciona e o que está mockado
4. Leia `DecisionLog.md` — verifique decisões já tomadas para não re-discutir
5. Leia `ProjectScope.md` — entenda os requisitos de negócio relevantes para a tarefa
6. Leia `plans/current.md` — veja o plano da fase atual e identifique a próxima tarefa
7. Consulte `plans/completed/` se precisar de contexto sobre o que foi feito em fases anteriores
8. Leia o doc específico da tarefa (ProjectStructure, DatabaseSchema, Services) se necessário

## Ao Iniciar uma Nova Fase

Se `plans/current.md` não existe ou contém o plano de uma fase já completa:

1. Leia `Phases.md` para os critérios de aceitação da fase a iniciar
2. Leia `ProjectScope.md` para os requisitos funcionais relevantes
3. Consulte `plans/completed/` para contexto de fases anteriores (se aplicável)
4. Crie o plano detalhado em `plans/current.md` seguindo o template:
   - Header com número da fase, data de criação, status
   - Tarefas agrupadas por área lógica (checkboxes `- [ ]`)
   - Seção "Verificação Final" com todos os critérios de aceitação de `Phases.md`
   - Seção "Notas" (inicialmente vazia)
4. Registre a criação do plano em `DecisionLog.md`

## Durante o Trabalho

### Código
- Escreva código limpo e tipado (TypeScript strict)
- Use componentes shadcn/ui antes de criar componentes custom
- Siga as convenções de nomes em `ProjectStructure.md`
- Use mock data de `src/lib/mock-data.ts` quando a integração real ainda não existe
- Prefira Server Components; use `'use client'` apenas quando necessário (interatividade, hooks de browser)
- Prefira Server Actions para mutações do admin; API Routes para endpoints públicos
- Não instale dependências sem documentar em `Services.md`
- Não crie arquivos fora da estrutura definida em `ProjectStructure.md` sem atualizar o doc

### Decisões
- **Ao tomar qualquer decisão arquitetural**: registre imediatamente em `DecisionLog.md`
  - Formato: `### YYYY-MM-DD — Título\n\n**Contexto**: ...\n**Decisão**: ...\n**Razão**: ...`
  - Nunca apague entradas anteriores (append-only)
- **Se a decisão afeta estrutura**: atualize `ProjectStructure.md`
- **Se a decisão afeta schema**: atualize `DatabaseSchema.md`
- **Se a decisão afeta serviços**: atualize `Services.md`

### Estado do Sistema
- Ao final de cada tarefa significativa, atualize `CurrentState.md`:
  - O que mudou
  - O que funciona agora
  - Issues conhecidas

### Fases
- Não implemente features de fases futuras
- Se precisar de algo de uma fase futura, use mock/placeholder
- Antes de iniciar uma fase, crie o plano em `plans/current.md` (ver seção "Ao Iniciar uma Nova Fase" acima)
- Ao completar uma fase, atualize `Phases.md`:
  - Status → `COMPLETE`
  - Adicione notas sobre desvios do plano original
  - Atualize `CurrentState.md` com o snapshot final da fase

### Controle de Tarefas (plans/current.md) — CRÍTICO

> **REGRA INVIOLÁVEL**: O arquivo `plans/current.md` deve ser atualizado EM TEMPO REAL durante a execução.
> Nunca acumule múltiplas tarefas para marcar depois. Atualize ANTES de começar e IMEDIATAMENTE ao concluir cada tarefa.

- **ANTES** de começar a trabalhar em uma tarefa: marque-a com `**[DOING]**` (substituindo `- [ ]` por `- **[DOING]**`)
- **IMEDIATAMENTE** ao concluir uma tarefa: marque com `[x]` (substituindo `**[DOING]**` por `[x]`)
- Apenas UMA tarefa deve estar `**[DOING]**` por vez
- O fluxo correto para CADA tarefa individual é:
  1. Edit `plans/current.md` → marcar `**[DOING]**`
  2. Executar a tarefa
  3. Edit `plans/current.md` → marcar `[x]`
- **Nunca** pule os passos 1 e 3. Mesmo para tarefas pequenas.
- Se uma tarefa gerar sub-tarefas inesperadas, adicione-as ao plano antes de continuar
- Se uma tarefa se mostrar desnecessária, remova-a com uma nota na seção "Notas"
- Ao completar TODAS as tarefas incluindo "Verificação Final":
  1. Atualize `Phases.md` com status `COMPLETE`
  2. Atualize `CurrentState.md` com o snapshot da fase
  3. Mova `plans/current.md` → `plans/completed/fase-N.md` (preservando o histórico)
  4. Crie novo `plans/current.md` com o plano da próxima fase

## Criação de Novos Docs

Se nenhum documento existente cobre um tema que precisa ser documentado:
1. Crie um novo arquivo em `.docs/` com nome descritivo (PascalCase.md)
2. Adicione referência no `Agents.md` na seção "Consulta sob demanda"
3. Registre a criação em `DecisionLog.md`

## Tratamento de Erros

- Sempre use try/catch em Server Actions e API Routes
- Retorne objetos tipados de erro, nunca lance exceções não tratadas
- Logue erros no servidor, mostre mensagens amigáveis no cliente
- Em caso de dúvida sobre como tratar um erro, consulte padrões existentes no código

## Qualidade

- Teste manualmente cada feature ao terminar (`npm run dev`)
- Verifique responsividade (mobile e desktop)
- Garanta que o TypeScript compila sem erros (`npx tsc --noEmit`)
- Garanta que o linter passa (`npm run lint`)
