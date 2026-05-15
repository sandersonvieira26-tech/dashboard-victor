# Dashboard de Agendamentos — Design Spec

**Data:** 2026-05-15
**Status:** Aprovado

---

## Contexto

Dashboard web para profissional de saúde solo gerenciar agendamentos de clientes, controlar presença (compareceu / não compareceu), identificar novos clientes e expor dados via API REST para automação n8n que envia mensagens via WhatsApp.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | SQLite via Prisma ORM |
| Estilização | Tailwind CSS + shadcn/ui |
| Deploy | EasyPanel (Docker) |
| Integração | API REST consumida pelo n8n |

---

## Modelo de Dados

```prisma
model Client {
  id           String        @id @default(cuid())
  name         String
  phone        String
  isNew        Boolean       @default(true)
  createdAt    DateTime      @default(now())
  appointments Appointment[]
}

model Appointment {
  id        String   @id @default(cuid())
  client    Client   @relation(fields: [clientId], references: [id])
  clientId  String
  date      DateTime // apenas data (sem hora)
  status    String   @default("scheduled") // scheduled | attended | no-show
  createdAt DateTime @default(now())
}
```

**Regras de negócio:**
- `isNew` inicia como `true` e muda para `false` na primeira vez que o status é marcado como `attended`
- Apenas um agendamento por cliente por data é permitido
- Status `no-show` é exposto pela API para o n8n disparar mensagem de reagendamento
- Agendamentos do dia seguinte são expostos pela API para o n8n disparar lembretes

---

## Estrutura de Pastas

```
dashboard/
├── app/
│   ├── page.tsx                    ← Dashboard principal (abas)
│   ├── layout.tsx
│   └── api/
│       ├── appointments/
│       │   ├── route.ts            ← GET (listar) / POST (criar)
│       │   └── [id]/
│       │       └── route.ts        ← PATCH (atualizar status)
│       └── n8n/
│           ├── no-shows/
│           │   └── route.ts        ← GET faltas (para n8n)
│           └── tomorrow/
│               └── route.ts        ← GET amanhã (para n8n)
├── components/
│   ├── tabs/
│   │   ├── TodayTab.tsx
│   │   ├── WeekTab.tsx
│   │   ├── ClientsTab.tsx
│   │   └── NoShowsTab.tsx
│   ├── NewAppointmentModal.tsx
│   ├── AttendanceToggle.tsx
│   └── StatsBar.tsx
├── lib/
│   └── prisma.ts                   ← Cliente Prisma singleton
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── docker-compose.yml
```

---

## Interface — Telas

### Barra de Resumo (topo, sempre visível)

Quatro cards em linha:
- **Total hoje** — número de agendamentos do dia
- **Compareceram** — contagem de `attended` do dia (verde)
- **Faltaram** — contagem de `no-show` do dia (vermelho)
- **Novos clientes** — contagem de clientes com `isNew = true` do dia (amarelo)
- Botão **"+ Novo Agendamento"** à direita → abre modal

### Abas de Navegação

| Aba | Conteúdo |
|---|---|
| **Hoje** | Lista de agendamentos do dia atual com botões ✓/✗ para marcar presença |
| **Semana** | Lista de agendamentos dos próximos 7 dias agrupados por data |
| **Clientes** | Todos os clientes cadastrados, com histórico de agendamentos |
| **Faltas** | Histórico de todos os `no-show`, ordenado por data decrescente |

### Linha de Agendamento (aba Hoje)

Cada linha exibe:
- Data (para abas Semana/Faltas)
- Nome do cliente
- Telefone
- Badge **"NOVO"** (amarelo) se `isNew = true`
- Dois botões: **✓** (marcar como attended) e **✗** (marcar como no-show)
- Botão selecionado fica destacado (verde ou vermelho); o outro fica inativo

### Modal "Novo Agendamento"

Três campos obrigatórios:
1. **Nome do cliente** — texto livre
2. **Telefone** — texto (sem máscara obrigatória)
3. **Data** — date picker

Ao salvar: cria `Client` + `Appointment` com status `scheduled`. Fecha o modal e atualiza a lista.

---

## API REST para n8n

Todos os endpoints exigem o header `X-API-Key` com valor igual à variável de ambiente `N8N_API_KEY`.

### `GET /api/n8n/no-shows`

Retorna clientes que não compareceram e ainda não foram reagendados.

Parâmetro opcional: `?since=YYYY-MM-DD` (padrão: últimos 7 dias)

```json
[
  {
    "clientName": "Carlos Melo",
    "phone": "(11) 99999-0002",
    "missedDate": "2026-05-15"
  }
]
```

### `GET /api/n8n/tomorrow`

Retorna agendamentos marcados para o dia seguinte (para envio de lembretes).

```json
[
  {
    "clientName": "Maria Santos",
    "phone": "(11) 99999-0003",
    "appointmentDate": "2026-05-16"
  }
]
```

---

## Deploy — EasyPanel

- A aplicação roda em container Docker
- O banco SQLite é persistido via volume Docker montado em `/app/data/`
- Variáveis de ambiente necessárias:
  - `DATABASE_URL` — caminho do SQLite (ex: `file:/app/data/db.sqlite`)
  - `N8N_API_KEY` — chave secreta para autenticar chamadas do n8n
- `Dockerfile` usa build multi-stage (build + runtime) para imagem enxuta
- `docker-compose.yml` para facilitar setup local durante desenvolvimento

---

## Fora do Escopo

- Autenticação de usuário (login/senha) — o dashboard é de uso pessoal/local
- Múltiplos profissionais ou agendas
- Integração direta com WhatsApp — feita pelo n8n externamente
- Notificações em tempo real (WebSocket)
- Relatórios ou exportação de dados
