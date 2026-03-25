# Deploy final (gratis)

Este guia coloca a app em producao no plano gratuito.

## 1. Supabase

1. Criar projeto gratuito no Supabase.
2. Abrir SQL Editor e executar o conteudo de supabase/schema.sql.
3. Copiar:
- Project URL -> NEXT_PUBLIC_SUPABASE_URL
- Service Role Key -> SUPABASE_SERVICE_ROLE_KEY

## 2. Gerar chaves VAPID

No projeto local:

```bash
npm run generate:vapid
```

Se no Windows aparecer "npm is not recognized":

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\npm.cmd' run generate:vapid
```

Guardar os valores em:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY

## 3. Definir segredo de cron

Criar uma string longa aleatoria para:
- CRON_SECRET

Exemplo PowerShell:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

## 4. Deploy no Vercel

1. Ligar repositório GitHub ao Vercel.
2. Definir variaveis de ambiente no projeto Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- CRON_SECRET
3. Fazer deploy.

## 5. Agendar sincronizacao (cron-job.org)

Criar job HTTP:
- Method: POST
- URL: https://SEU_DOMINIO/api/cron/sync?token=CRON_SECRET

Frequencia recomendada:
- Dias de jogo: a cada 15 minutos entre 15:00-23:00
- Restantes horas: 1 vez por hora

## 6. Ativar notificacoes no Android

1. Abrir app no Chrome Android.
2. Instalar PWA no ecra inicial.
3. Abrir pagina /notifications.
4. Clicar em "Ativar notificacoes neste Android".

## 7. Checklist de aceitacao

- /api/health responde ok
- /api/sync devolve fetchedMatches > 0
- /api/standings devolve items > 0
- /notifications mostra pelo menos uma subscricao apos ativacao
- build e lint passam em CI
