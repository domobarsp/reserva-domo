# Estrutura do Projeto

## Árvore de Diretórios

```
domo-claude/
├── CLAUDE.md                        # Aponta para .docs/Agents.md
├── .docs/                           # Documentação do projeto (fonte da verdade)
│   ├── Agents.md
│   ├── AgentBehavior.md
│   ├── Phases.md
│   ├── CurrentState.md
│   ├── DecisionLog.md
│   ├── ProjectScope.md             # Requisitos de negócio e escopo funcional
│   ├── plans/
│   │   ├── current.md              # Plano ativo da fase atual (checkboxes)
│   │   └── completed/              # Planos de fases concluídas (histórico)
│   ├── ProjectStructure.md
│   ├── DatabaseSchema.md
│   └── Services.md
│
├── public/                          # Assets estáticos
│   └── images/
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (html, body, providers)
│   │   ├── page.tsx                 # Landing page (Domo)
│   │   │
│   │   ├── (public)/                # Rotas públicas (formulário, cancelamento)
│   │   │   ├── layout.tsx           # Header + Footer
│   │   │   ├── reserva/
│   │   │   │   └── page.tsx         # Formulário multi-step
│   │   │   └── cancelar/
│   │   │       └── [token]/
│   │   │           └── page.tsx     # Cancelamento de reserva
│   │   │
│   │   ├── admin/                   # Rotas admin (prefixo /admin/ na URL)
│   │   │   ├── layout.tsx           # Sidebar + Topbar
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login do admin
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── reservas/
│   │   │   │   └── page.tsx
│   │   │   ├── calendario/
│   │   │   │   └── page.tsx
│   │   │   ├── lista-espera/
│   │   │   │   └── page.tsx
│   │   │   ├── passantes/
│   │   │   │   └── page.tsx
│   │   │   ├── configuracoes/
│   │   │   │   ├── page.tsx         # Configurações gerais
│   │   │   │   ├── horarios/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── acomodacoes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── capacidade/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── garantia-cartao/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── no-show/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── excecoes/
│   │   │   │       └── page.tsx
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx
│   │   │   └── acessos/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                     # API Routes
│   │       ├── health/
│   │       │   └── route.ts
│   │       ├── reservations/
│   │       │   ├── route.ts         # POST: criar reserva (público)
│   │       │   └── cancel/
│   │       │       └── route.ts     # POST: cancelar por token
│   │       ├── availability/
│   │       │   └── route.ts         # GET: checar disponibilidade
│   │       ├── stripe/
│   │       │   ├── setup-intent/
│   │       │   │   └── route.ts
│   │       │   ├── charge-no-show/
│   │       │   │   └── route.ts
│   │       │   └── webhook/
│   │       │       └── route.ts
│   │       └── admin/               # API Routes protegidas
│   │           ├── reservations/
│   │           ├── waitlist/
│   │           ├── walk-ins/
│   │           ├── settings/
│   │           └── ...
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui (gerado automaticamente)
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── public-header.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   └── admin-topbar.tsx
│   │   ├── features/                # Componentes por domínio
│   │   │   ├── reservation/         # Formulário de reserva
│   │   │   ├── admin/               # Componentes do painel admin
│   │   │   │   ├── dashboard/
│   │   │   │   ├── calendar/
│   │   │   │   ├── reservations/
│   │   │   │   ├── waitlist/
│   │   │   │   ├── walk-ins/
│   │   │   │   ├── settings/
│   │   │   │   ├── reports/
│   │   │   │   └── users/
│   │   │   └── cancellation/
│   │   └── shared/                  # Componentes cross-feature
│   │       ├── page-header.tsx
│   │       └── loading-skeleton.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │
│   ├── lib/                         # Utilitários (client & server safe)
│   │   ├── utils.ts                 # cn() e helpers gerais
│   │   ├── mock-data.ts             # Dados mock (estrutura = schema do banco)
│   │   └── validations/             # Schemas Zod
│   │
│   ├── services/                    # Camada de negócio (server-side)
│   │
│   ├── types/                       # Tipos TypeScript
│   │   └── index.ts                 # Re-exports
│   │
│   ├── utils/                       # Utilitários de ambiente
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client (cookies)
│   │   │   └── middleware.ts         # Auth refresh
│   │   └── stripe/
│   │       └── client.ts            # Stripe server instance
│   │
│   ├── styles/
│   │   └── globals.css              # Tailwind directives + CSS vars
│   │
│   └── middleware.ts                # Next.js middleware (auth)
│
├── supabase/                        # Migrations e seed (Fase 4+)
│   └── migrations/
│
├── .env.local.example
├── .gitignore
├── components.json                  # shadcn/ui config
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Convenções de Nomes

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos/pastas | kebab-case | `reservation-form.tsx`, `mock-data.ts` |
| Componentes React | PascalCase | `ReservationForm`, `AdminSidebar` |
| Hooks | camelCase com prefixo `use` | `useReservationForm`, `useMockData` |
| Tipos/Interfaces | PascalCase | `Reservation`, `TimeSlot` |
| Enums | PascalCase + valores UPPER_SNAKE | `ReservationStatus.NO_SHOW` |
| API Routes | kebab-case | `/api/reservations/cancel` |
| Variáveis de ambiente | UPPER_SNAKE | `NEXT_PUBLIC_SUPABASE_URL` |

## Regras de Organização

### Componentes
- **`ui/`**: Apenas componentes gerados pelo shadcn/ui CLI. Não editar manualmente.
- **`layout/`**: Componentes que definem a estrutura da página (header, footer, sidebar).
- **`features/`**: Componentes com lógica de negócio, organizados por domínio.
- **`shared/`**: Componentes reutilizados em múltiplos domínios.

### Quando criar novo componente
1. É UI genérica? → `components/shared/`
2. É específica de um domínio? → `components/features/{domínio}/`
3. É layout da página? → `components/layout/`
4. É do shadcn/ui? → `components/ui/` (via CLI)

### API Routes
- Endpoints públicos: `src/app/api/{recurso}/route.ts`
- Endpoints admin: `src/app/api/admin/{recurso}/route.ts`
- Nomes dos arquivos sempre `route.ts`
- Use verbos HTTP (GET, POST, PATCH, DELETE), não endpoints separados por ação

### Server Actions
- Definir em arquivos `actions.ts` dentro da pasta da feature
- Exemplo: `src/app/admin/reservas/actions.ts`
- Sempre marcar com `'use server'`
