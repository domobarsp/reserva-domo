# Plano Atual — Fase 16: Home do Estabelecimento (single-tenant)

> Pivot multi-estabelecimento (Fases MT-16–20) adiado. Ver `DecisionLog.md` 2026-06-23.

## Tarefas

- [x] Documentação: DecisionLog, Phases, CurrentState, DatabaseSchema, DEPLOY
- [x] Migration 010 + bucket `restaurant-media` + seed
- [x] Tipos + query `getEstablishmentPageData`
- [x] Admin `/admin/configuracoes/estabelecimento` (perfil + uploads)
- [x] Home `/` (hero, sobre, galeria, horários, mapa)
- [x] CSP + metadata SEO + next/image remotePatterns
- [x] Verificação: tsc, lint, build

## Critérios de aceite

- [x] `/` exibe landing completa (não redirect)
- [x] Admin edita descrição, capa e galeria
- [x] Mapa embed + link Google Maps
- [x] Upload persiste no Storage e renderiza na home
- [x] Responsivo mobile/tablet/desktop
