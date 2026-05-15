# Deploy — EasyPanel

## Pré-requisitos

- EasyPanel instalado e rodando
- Repositório acessível (GitHub, GitLab, ou upload direto)

## Variáveis de Ambiente

Configure as seguintes variáveis no EasyPanel:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `file:/app/data/db.sqlite` |
| `N8N_API_KEY` | Sua chave secreta para o n8n |

## Volume

Monte um volume Docker em `/app/data` para persistir o banco SQLite entre restarts.

## Build

O Dockerfile usa build multi-stage. O EasyPanel detecta automaticamente o Dockerfile na raiz do repositório.

## Primeiro Deploy

1. Configure as variáveis de ambiente
2. Monte o volume em `/app/data`
3. Faça o deploy — as migrações do banco são executadas automaticamente no startup

## Desenvolvimento Local

```bash
docker-compose up --build
```

Acesse em: http://localhost:3000

## API para n8n

Todos os endpoints `/api/n8n/*` exigem o header:
```
X-API-Key: <valor de N8N_API_KEY>
```

### Endpoints disponíveis:
- `GET /api/n8n/no-shows` — Clientes que faltaram (últimos 7 dias, ou `?since=YYYY-MM-DD`)
- `GET /api/n8n/tomorrow` — Agendamentos de amanhã (para lembretes)
