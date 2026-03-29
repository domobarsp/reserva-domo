# Plano Ativo — Fase 1: Scaffolding e Layout Base

> Criado: 2026-02-12 | Fase: 1 | Status: COMPLETO

## Tarefas

### Inicialização do Projeto
- [x] Inicializar repositório git
- [x] Criar projeto Next.js 15 com TypeScript e App Router (`create-next-app`)
- [x] Instalar e configurar shadcn/ui (`npx shadcn@latest init`)
- [x] Configurar tsconfig.json com strict mode e path aliases (@/)
- [x] Criar .env.local.example com variáveis placeholder (Supabase, Stripe, Resend)
- [x] Configurar .gitignore

### Tipos TypeScript
- [x] Criar src/types/index.ts com tipos espelhando DatabaseSchema.md:
  - Restaurant, AccommodationType, TimeSlot, CapacityRule
  - Customer, Reservation, ReservationStatus, ReservationStatusHistory
  - WaitlistEntry, WalkIn, ExceptionDate, Settings, AdminUser, NoShowCharge

### Mock Data
- [x] Criar src/lib/mock-data.ts com dados de exemplo:
  - 1 restaurante, 2 acomodações (Mesa, Balcão), 2 horários (19h, 21h30)
  - 4 capacity rules, settings padrão, clientes e reservas de exemplo
- [x] Criar src/lib/utils.ts com helper cn() — criado automaticamente pelo shadcn/ui

### Layouts
- [x] Criar root layout (src/app/layout.tsx) com html, body, fontes, metadata
- [x] Criar globals.css com Tailwind directives e CSS vars (em src/app/globals.css, padrão do Next.js)
- [x] Criar layout público (src/app/(public)/layout.tsx) com PublicHeader e PublicFooter
- [x] Criar src/components/layout/public-header.tsx e public-footer.tsx
- [x] Criar layout admin (src/app/admin/layout.tsx) com AdminSidebar e AdminTopbar
- [x] Criar src/components/layout/admin-sidebar.tsx e admin-topbar.tsx
- [x] Garantir que ambos layouts são responsivos (mobile + desktop)

### Páginas Públicas
- [x] Criar landing page (src/app/page.tsx) com branding Domo e CTA para reserva
- [x] Criar placeholder de reserva (src/app/(public)/reserva/page.tsx)
- [x] Criar placeholder de cancelamento (src/app/(public)/cancelar/[token]/page.tsx)

### Páginas Admin (todas placeholder com título)
- [x] Criar placeholder de login (src/app/admin/login/page.tsx)
- [x] Criar placeholder de dashboard (src/app/admin/dashboard/page.tsx)
- [x] Criar placeholder de reservas (src/app/admin/reservas/page.tsx)
- [x] Criar placeholder de calendário (src/app/admin/calendario/page.tsx)
- [x] Criar placeholder de lista de espera (src/app/admin/lista-espera/page.tsx)
- [x] Criar placeholder de passantes (src/app/admin/passantes/page.tsx)
- [x] Criar placeholder de relatórios (src/app/admin/relatorios/page.tsx)
- [x] Criar placeholder de acessos (src/app/admin/acessos/page.tsx)
- [x] Criar placeholder de configurações (src/app/admin/configuracoes/page.tsx)
- [x] Criar sub-páginas de configurações:
  - horarios, acomodacoes, capacidade, garantia-cartao, no-show, excecoes

### API Placeholder
- [x] Criar rota de health check (src/app/api/health/route.ts)

### Verificação Final
- [x] `npm run dev` funciona sem erros
- [x] Landing page visível com branding Domo
- [x] Navegação funcional entre todas as rotas públicas e admin
- [x] Layout público e admin responsivos (mobile + desktop)
- [x] Mock data tipado em src/lib/mock-data.ts
- [x] Tipos em src/types/
- [x] `npx tsc --noEmit` sem erros
- [x] `npm run lint` sem erros
- [x] CurrentState.md atualizado
- [x] Phases.md status → COMPLETE
- [x] DecisionLog.md atualizado com novas decisões

## Notas

- Rotas admin usam pasta `admin/` (não route group `(admin)/`) para gerar prefixo `/admin/` na URL
- Login page fica em `/admin/login` com o mesmo layout admin por enquanto (Fase 4 pode separar)
- globals.css mantido em `src/app/globals.css` (padrão do Next.js + shadcn/ui) em vez de `src/styles/globals.css`
