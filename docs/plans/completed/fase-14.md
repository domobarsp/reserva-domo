# Fase 14 — Refinamento Visual — Configurações & Acessos

> Design spec aprovado em 2026-03-29

## Objetivo

Alinhar as páginas de Configurações (hub + 6 sub-páginas) e Acessos ao padrão visual Fase 12-13, e adicionar funcionalidades críticas de gestão de usuários.

## Escopo

Duas frentes:
1. **Visual/UX** — Consistência visual em todas as páginas de configurações e acessos
2. **Funcional** — Melhorias no sistema de gestão de usuários admin

---

## 1. Hub de Configurações

- Cards mantêm estrutura atual (ícone + título + descrição)
- Hover refinado: `hover:border-zinc-300 transition-colors`
- Ícones em container `h-10 w-10 rounded-lg bg-zinc-100` com ícone `h-5 w-5 text-zinc-600`

## 2. Header pattern para sub-páginas

Padrão uniforme para todas as 6 sub-páginas de configurações:
- Botão voltar: `ArrowLeft` em `variant="ghost"` à esquerda do título
- Título: `text-2xl font-semibold`
- Descrição: `text-sm text-zinc-500` abaixo do título
- Botão de ação primária à direita ("Novo Horário", etc.)

Cada sub-página recebe descrição contextual:
- Horários: "Gerencie os períodos de funcionamento do restaurante"
- Acomodações: "Configure os tipos de acomodação disponíveis"
- Capacidade: "Defina a capacidade máxima por acomodação e horário"
- Garantia com Cartão: "Configure os dias que exigem cartão de crédito"
- Taxa de No-Show: "Defina o valor cobrado em caso de não comparecimento"
- Exceções: "Crie regras especiais para datas específicas"

## 3. Chips de dias da semana (Horários)

Na tabela de horários, coluna "Dias da Semana":
- Sempre 7 chips visíveis: Dom, Seg, Ter, Qua, Qui, Sex, Sáb
- Dia ativo: `bg-emerald-50 text-emerald-700 border border-emerald-200`
- Dia inativo: `bg-zinc-50 text-zinc-300 border border-zinc-200 line-through`
- Chips em `text-xs rounded-full px-2 py-0.5`

## 4. Tabelas

Todas as tabelas de configurações e acessos:
- Já usam `overflow-hidden rounded-xl border bg-card shadow-sm` — manter
- Adicionar `hover:bg-zinc-50 transition-colors` nas linhas
- Botões de ação (Pencil/Trash2) com `Tooltip` do shadcn para labels
- Empty states: adicionar CTA button ("Criar horário", "Adicionar acomodação", etc.) via prop `onAdd`
- Switch "Ativo" mantém padrão atual

## 5. Dialogs — Redesign padrão Fase 12-13

Todos os 5 dialogs de configurações + InviteAdminDialog:

**Estrutura:**
- `DialogContent` com `p-0 gap-0`
- Header: `px-6 pt-6 pb-5 border-b border-zinc-100` com `DialogTitle` (`text-lg font-semibold tracking-tight`) + `DialogDescription` (`text-sm text-zinc-500 mt-0.5`)
- Body: `px-6 py-5 space-y-6` com `SectionLabel` para agrupar campos relacionados
- Footer: `bg-zinc-50 border-t border-zinc-100 px-6 py-4` com botões alinhados à direita
- Loading: `Loader2` no botão de submit + `disabled={isSubmitting}`
- `<Textarea>` component em vez de inline `<textarea>`

**Dialogs afetados:**
- `time-slot-dialog.tsx` — seções: Informações, Horário, Dias da Semana
- `accommodation-dialog.tsx` — seções: Informações, Capacidade
- `capacity-dialog.tsx` — seções: Configuração (acomodação + horário + max)
- `exception-dialog.tsx` — seções: Data, Configurações, Overrides de Capacidade
- `invite-admin-dialog.tsx` — seções: Credenciais, Perfil

**Novo dialog:**
- `edit-admin-dialog.tsx` — editar display_name de um usuário existente

## 6. Formulários de página inteira (Garantia + No-Show)

- Mesmo header pattern das sub-páginas (voltar + título + descrição)
- Card com `rounded-xl border bg-card shadow-sm p-6`
- Botão "Salvar" com `Loader2` durante submit + `disabled`

## 7. Página de Acessos — Visual

- Header: título "Controle de Acesso" + descrição "Gerencie os usuários do painel administrativo" + botão "Adicionar Usuário"
- Badge de role: violet (Owner), primary (Manager), muted (Staff) — manter
- Badge de status: emerald (Ativo), muted (Inativo) — manter
- Tabela com hover states
- Dropdown de ações com ícones por item

---

## 8. Acessos — Melhorias funcionais

### 8.1 Editar usuário

- Novo dialog `EditAdminDialog`: campo `display_name` editável
- Nova action `updateAdminUserDisplayName(id, displayName)`
- Acessível pelo dropdown de ações na tabela

### 8.2 Resetar senha

- Nova action `resetAdminUserPassword(id)` que:
  1. Gera senha aleatória (12 chars, alfanumérica)
  2. Chama `adminClient.auth.admin.updateUserById(id, { password })`
  3. Seta `must_change_password = true` na tabela `admin_users`
  4. Retorna a senha gerada para exibir ao owner
- Dialog de confirmação antes do reset
- Após reset: exibe a senha temporária em um card copiável (com botão "Copiar")
- Proteção: não pode resetar própria senha por este fluxo (owner pode trocar a própria via o fluxo normal de troca)

### 8.3 Forçar troca de senha no próximo login

- Nova migration: `ALTER TABLE admin_users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE`
- No middleware: se `must_change_password = true` → redirect para `/admin/trocar-senha`
- Nova página `/admin/trocar-senha`:
  - Form: nova senha + confirmação (min 8 chars)
  - Após submit: `adminClient.auth.admin.updateUserById()` + `must_change_password = false`
  - Redirect para `/admin/dashboard`
- Rota `/admin/trocar-senha` acessível apenas para usuários autenticados com `must_change_password = true`

### 8.4 Excluir usuário desativado

- Nova action `deleteAdminUser(id)` que:
  1. Verifica se o usuário está inativo
  2. Verifica se não é o último owner ativo
  3. Deleta de `admin_users` (CASCADE deleta de `auth.users`)
  4. Chama `adminClient.auth.admin.deleteUser(id)` para cleanup
- Disponível apenas no dropdown de ações para usuários inativos
- Dialog de confirmação destructive

### 8.5 Proteção do último owner

- `toggleAdminUserStatus()` e `updateAdminUserRole()`: antes de desativar ou demover um owner, verificar se existem outros owners ativos
- Se for o único owner ativo → retornar erro: "Não é possível desativar/demover o único proprietário ativo"
- Query: `SELECT COUNT(*) FROM admin_users WHERE role = 'owner' AND is_active = true AND id != :targetId`

---

## Arquivos afetados

### Visual/UX

| Arquivo | Ação |
|---------|------|
| `src/app/admin/(authenticated)/configuracoes/page.tsx` | Modify: hub cards refinados |
| `src/components/features/admin/settings/time-slots-table.tsx` | Modify: day chips, hover, tooltips, empty CTA |
| `src/components/features/admin/settings/accommodations-table.tsx` | Modify: hover, tooltips, empty CTA |
| `src/components/features/admin/settings/capacity-table.tsx` | Modify: hover, tooltips, empty CTA |
| `src/components/features/admin/settings/exceptions-table.tsx` | Modify: hover, tooltips, empty CTA |
| `src/components/features/admin/settings/time-slot-dialog.tsx` | Rewrite: padrão Fase 12-13 |
| `src/components/features/admin/settings/accommodation-dialog.tsx` | Rewrite: padrão Fase 12-13 |
| `src/components/features/admin/settings/capacity-dialog.tsx` | Rewrite: padrão Fase 12-13 |
| `src/components/features/admin/settings/exception-dialog.tsx` | Rewrite: padrão Fase 12-13 |
| `src/components/features/admin/settings/card-guarantee-form.tsx` | Modify: header pattern, card refinado |
| `src/components/features/admin/settings/no-show-fee-form.tsx` | Modify: header pattern, card refinado |
| `src/components/features/admin/settings/*-content.tsx` | Modify: header pattern com descrição |
| `src/components/features/admin/access/admin-users-table.tsx` | Modify: hover, novos menu items |
| `src/components/features/admin/access/invite-admin-dialog.tsx` | Rewrite: padrão Fase 12-13 |
| `src/components/features/admin/access/acessos-content.tsx` | Modify: header com descrição, novos dialogs |

### Funcional

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/006_must_change_password.sql` | Create: migration |
| `src/types/index.ts` | Modify: add `must_change_password` to AdminUser |
| `src/app/admin/(authenticated)/acessos/actions.ts` | Modify: novas actions + proteção último owner |
| `src/components/features/admin/access/edit-admin-dialog.tsx` | Create: dialog edição |
| `src/components/features/admin/access/reset-password-dialog.tsx` | Create: dialog reset + exibição senha |
| `src/app/admin/trocar-senha/page.tsx` | Create: página troca de senha obrigatória |
| `src/middleware.ts` | Modify: redirect must_change_password |

## Critérios de aceitação

### Visual
- [ ] Hub com cards de ícone em container rounded-lg bg-zinc-100
- [ ] Todas as sub-páginas com header padrão (voltar + título + descrição + ação)
- [ ] Chips de dias com visual ativo/inativo (emerald/zinc+line-through)
- [ ] Todos os dialogs redesenhados (p-0 gap-0, SectionLabel, footer bg-zinc-50)
- [ ] Tabelas com hover states e tooltips nos botões de ação
- [ ] Empty states com CTA button
- [ ] Botões com Loader2 ao submeter
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros

### Funcional
- [ ] Editar display_name de usuário via dialog
- [ ] Resetar senha gera senha temporária e exibe ao owner
- [ ] Usuário com senha resetada é forçado a trocar no próximo login
- [ ] Página `/admin/trocar-senha` funcional com validação
- [ ] Excluir usuário desativado com proteção (não último owner)
- [ ] Último owner ativo não pode ser desativado nem demovido
- [ ] Middleware redireciona `must_change_password` para `/admin/trocar-senha`
