# div2app

MVP pessoal para acompanhar a II divisao nacional senior masculina de voleibol, com foco no Esmoriz GC e cobertura da competicao.

## Estado atual

- Next.js App Router com paginas mobile-first
- Repositorio assincrono com fallback local e persistencia Supabase quando configurado
- Sync com persistencia de jogos/classificacao e log de execucoes (scraper_runs)
- Deteccao e deduplicacao de alertas via notification_events
- Pagina de notificacoes Android em /notifications
- Registo de Service Worker e fluxo de subscricao de push

## Requisitos locais

1. Node.js 20+
2. npm 10+

## Arranque rapido

1. Instalar dependencias:

```bash
npm install
```

1. Correr em desenvolvimento:

```bash
npm run dev
```

1. Abrir no browser:

- <http://localhost:3000>

## Endpoints atuais

- GET /api/health
- GET /api/matches
- GET /api/standings?phase=2a%20Fase%20-%20Prim.
- GET /api/team-form?team=Esmoriz%20GC&limit=5
- GET /api/h2h?teamA=Esmoriz%20GC&teamB=C.N.%20Ginastica
- POST /api/subscribe
- GET /api/subscribe
- POST /api/sync
- GET /api/push/public-key
- POST /api/cron/sync (protegido com token)

## Base de dados

Aplicar o schema em Supabase:

- supabase/schema.sql

Tabelas usadas no estado atual:

- matches
- standings_rows
- subscriptions
- scraper_runs
- notification_events

## Configuracao de ambiente

Para push Android (PWA no Chrome):

- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY

Para persistencia completa em Supabase:

- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Para proteger o endpoint de cron:

- CRON_SECRET

Sem estas variaveis, a app continua funcional em modo fallback local.

## Automatizacao gratuita de sync

Pode usar cron-job.org (gratuito) para chamar:

- POST /api/cron/sync?token=CRON_SECRET

Recomendacao de frequencia:

- Dias de jogo: 15 em 15 minutos entre 15:00 e 23:00
- Fora desse periodo: 1 em 1 hora

## Proximas fases

1. Ajustar parser FPV para extrair fase e sets por parcial com maior precisao.
2. Adicionar historico de forma por periodo e filtros por fase no frontend.

## Deploy

Guia completo de producao:

- DEPLOY.md
