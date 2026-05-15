# Dashboard de Agendamentos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um dashboard Next.js responsivo para um profissional de saúde solo gerenciar agendamentos, controlar presença de clientes e expor API REST consumida pelo n8n para envio de mensagens via WhatsApp.

**Architecture:** Next.js 14 com App Router. A página principal é um Client Component que busca dados via fetch nas API Routes internas. Banco SQLite via Prisma persistido em volume Docker. UI com Tailwind CSS + shadcn/ui. Dois endpoints dedicados ao n8n protegidos por API Key no header `X-API-Key`.

**Tech Stack:** Next.js 14, TypeScript, Prisma + SQLite, Tailwind CSS, shadcn/ui, Jest + React Testing Library, Docker, EasyPanel

---

## Mapa de Arquivos

```
dashboard/
├── app/
│   ├── layout.tsx                        ← HTML root, fonte Inter
│   ├── page.tsx                          ← Renderiza <Dashboard />
│   ├── globals.css                       ← CSS variables do shadcn/ui
│   ├── types.ts                          ← Tipos compartilhados
│   └── api/
│       ├── appointments/
│       │   ├── route.ts                  ← GET (dia/semana/faltas) + POST (criar)
│       │   └── [id]/route.ts             ← PATCH (atualizar status)
│       ├── clients/
│       │   └── route.ts                  ← GET (listar todos)
│       └── n8n/
│           ├── no-shows/route.ts         ← GET faltas (protegido por API Key)
│           └── tomorrow/route.ts         ← GET amanhã (protegido por API Key)
├── components/
│   ├── Dashboard.tsx                     ← Client component principal (estado global)
│   ├── StatsBar.tsx                      ← Cards de resumo (total/compareceram/faltas/novos)
│   ├── AttendanceToggle.tsx              ← Botões ✓/✗ por agendamento
│   ├── AppointmentRow.tsx               ← Linha de agendamento (nome, telefone, badge, toggle)
│   ├── NewAppointmentModal.tsx           ← Modal com formulário de cadastro
│   └── tabs/
│       ├── TodayTab.tsx                  ← Lista do dia
│       ├── WeekTab.tsx                   ← Lista semanal agrupada por data
│       ├── ClientsTab.tsx               ← Lista de clientes com histórico
│       └── NoShowsTab.tsx               ← Histórico de faltas
├── lib/
│   ├── prisma.ts                         ← Singleton do PrismaClient
│   └── auth.ts                           ← Validação da API Key
├── prisma/
│   └── schema.prisma
├── __tests__/
│   ├── api/
│   │   ├── appointments.test.ts
│   │   ├── appointments-id.test.ts
│   │   ├── n8n-no-shows.test.ts
│   │   └── n8n-tomorrow.test.ts
│   ├── lib/
│   │   └── auth.test.ts
│   └── components/
│       ├── StatsBar.test.tsx
│       ├── AttendanceToggle.test.tsx
│       └── NewAppointmentModal.test.tsx
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
└── .env.example
```

---

## Fase 1: Configuração do Projeto

### Task 1: Inicializar Next.js

**Files:**
- Create: estrutura base do Next.js + `package.json`

- [ ] **Step 1: Criar o projeto**

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-eslint
```

Quando solicitado:
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**

- [ ] **Step 2: Verificar estrutura criada**

```bash
ls
```

Expected: `app/`, `package.json`, `tailwind.config.ts`, `tsconfig.json`

- [ ] **Step 3: Inicializar git e fazer commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 14 project"
```

---

### Task 2: Instalar e configurar shadcn/ui

**Files:**
- Create: `components.json`
- Create: `components/ui/` (botton, dialog, input, label, card, badge, tabs)

- [ ] **Step 1: Inicializar shadcn/ui**

```bash
npx shadcn@latest init
```

Quando solicitado:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 2: Instalar componentes necessários**

```bash
npx shadcn@latest add button dialog input label card badge tabs
```

- [ ] **Step 3: Verificar componentes instalados**

```bash
ls components/ui/
```

Expected: `button.tsx dialog.tsx input.tsx label.tsx card.tsx badge.tsx tabs.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui components"
```

---

### Task 3: Configurar Prisma + SQLite

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: Instalar Prisma**

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Substituir conteúdo de `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

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
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])
  date      DateTime
  status    String   @default("scheduled")
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Atualizar `.env`**

```env
DATABASE_URL="file:./dev.db"
N8N_API_KEY="troque-por-uma-chave-segura"
```

- [ ] **Step 4: Criar `.env.example`**

```env
DATABASE_URL="file:/app/data/db.sqlite"
N8N_API_KEY="sua-chave-api-aqui"
```

- [ ] **Step 5: Garantir `.env` no `.gitignore`**

Abra `.gitignore` e confirme que contém:
```
.env
*.db
*.db-journal
```

- [ ] **Step 6: Criar o banco e gerar o client**

```bash
npx prisma migrate dev --name init
```

Expected output: `✔ Generated Prisma Client`

- [ ] **Step 7: Commit**

```bash
git add prisma/ .env.example .gitignore
git commit -m "chore: configure Prisma with SQLite schema"
```

---

### Task 4: Configurar Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar dependências de teste**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

- [ ] **Step 2: Criar `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 3: Criar `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Adicionar scripts de teste ao `package.json`**

Dentro de `"scripts"` no `package.json`, adicione:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Rodar testes para confirmar configuração**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 passed` sem erros de configuração

- [ ] **Step 6: Commit**

```bash
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: configure Jest for testing"
```

---

## Fase 2: Camada de Dados

### Task 5: Prisma Client singleton e tipos compartilhados

**Files:**
- Create: `lib/prisma.ts`
- Create: `app/types.ts`

- [ ] **Step 1: Criar `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Criar `app/types.ts`**

```typescript
export type AppointmentStatus = 'scheduled' | 'attended' | 'no-show'

export interface ClientData {
  id: string
  name: string
  phone: string
  isNew: boolean
  createdAt: string
}

export interface AppointmentData {
  id: string
  date: string
  status: AppointmentStatus
  clientId: string
  client: ClientData
  createdAt: string
}

export interface ClientWithAppointments extends ClientData {
  appointments: Array<{
    id: string
    date: string
    status: AppointmentStatus
  }>
}

export interface CreateAppointmentBody {
  name: string
  phone: string
  date: string
}

export interface UpdateStatusBody {
  status: AppointmentStatus
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/prisma.ts app/types.ts
git commit -m "feat: add Prisma singleton and shared TypeScript types"
```

---

### Task 6: API Route — Listar e criar agendamentos

**Files:**
- Create: `app/api/appointments/route.ts`
- Create: `__tests__/api/appointments.test.ts`

- [ ] **Step 1: Criar diretório de testes e escrever o teste**

```bash
mkdir -p __tests__/api
```

```typescript
// __tests__/api/appointments.test.ts
import { GET, POST } from '@/app/api/appointments/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    client: {
      create: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('POST /api/appointments', () => {
  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('cria cliente e agendamento com dados válidos', async () => {
    const mockClient = {
      id: 'c1', name: 'Ana Lima', phone: '11999990001',
      isNew: true, createdAt: new Date().toISOString(),
    }
    const mockAppointment = {
      id: 'a1', date: new Date('2026-05-16'), status: 'scheduled',
      clientId: 'c1', client: mockClient, createdAt: new Date().toISOString(),
    }
    ;(prisma.client.create as jest.Mock).mockResolvedValue(mockClient)
    ;(prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana Lima', phone: '11999990001', date: '2026-05-16' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})

describe('GET /api/appointments', () => {
  it('retorna lista de agendamentos do dia', async () => {
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])
    const req = new Request('http://localhost/api/appointments')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/api/appointments.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/appointments/route'`

- [ ] **Step 3: Criar `app/api/appointments/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateAppointmentBody } from '@/app/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') // 'day' | 'week' | 'no-shows'
  const dateParam = searchParams.get('date')

  if (mode === 'no-shows') {
    const noShows = await prisma.appointment.findMany({
      where: { status: 'no-show' },
      include: { client: true },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(noShows)
  }

  if (mode === 'week') {
    const start = dateParam ? new Date(dateParam) : new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: start, lt: end } },
      include: { client: true },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(appointments)
  }

  // default: day
  const date = dateParam ? new Date(dateParam) : new Date()
  date.setHours(0, 0, 0, 0)
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: date, lt: nextDay } },
    include: { client: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const body: CreateAppointmentBody = await request.json()
  const { name, phone, date } = body

  if (!name || !phone || !date) {
    return NextResponse.json(
      { error: 'name, phone e date são obrigatórios' },
      { status: 400 }
    )
  }

  const appointmentDate = new Date(date)
  appointmentDate.setHours(0, 0, 0, 0)

  const client = await prisma.client.create({
    data: { name, phone },
  })

  const appointment = await prisma.appointment.create({
    data: { clientId: client.id, date: appointmentDate, status: 'scheduled' },
    include: { client: true },
  })

  return NextResponse.json(appointment, { status: 201 })
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/api/appointments.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/appointments/route.ts __tests__/api/appointments.test.ts
git commit -m "feat: add GET and POST /api/appointments"
```

---

### Task 7: API Route — Atualizar status do agendamento

**Files:**
- Create: `app/api/appointments/[id]/route.ts`
- Create: `__tests__/api/appointments-id.test.ts`

- [ ] **Step 1: Escrever o teste**

```typescript
// __tests__/api/appointments-id.test.ts
import { PATCH } from '@/app/api/appointments/[id]/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: { update: jest.fn() },
    client: { update: jest.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

describe('PATCH /api/appointments/[id]', () => {
  it('retorna 400 para status inválido', async () => {
    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalido' }),
    })
    const res = await PATCH(req, { params: { id: 'a1' } })
    expect(res.status).toBe(400)
  })

  it('atualiza status e marca cliente como não-novo ao marcar attended', async () => {
    const mockAppointment = {
      id: 'a1', status: 'attended', clientId: 'c1',
      client: { id: 'c1', isNew: true },
    }
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)
    ;(prisma.client.update as jest.Mock).mockResolvedValue({})

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'attended' }),
    })
    const res = await PATCH(req, { params: { id: 'a1' } })
    expect(res.status).toBe(200)
    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isNew: false },
    })
  })

  it('não atualiza isNew ao marcar no-show', async () => {
    const mockAppointment = {
      id: 'a1', status: 'no-show', clientId: 'c1',
      client: { id: 'c1', isNew: true },
    }
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'no-show' }),
    })
    await PATCH(req, { params: { id: 'a1' } })
    expect(prisma.client.update).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/api/appointments-id.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `app/api/appointments/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateStatusBody, AppointmentStatus } from '@/app/types'

const VALID_STATUSES: AppointmentStatus[] = ['scheduled', 'attended', 'no-show']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body: UpdateStatusBody = await request.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
    include: { client: true },
  })

  if (status === 'attended' && updated.client.isNew) {
    await prisma.client.update({
      where: { id: updated.clientId },
      data: { isNew: false },
    })
  }

  return NextResponse.json(updated)
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/api/appointments-id.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/appointments/[id]/route.ts __tests__/api/appointments-id.test.ts
git commit -m "feat: add PATCH /api/appointments/[id] with isNew logic"
```

---

## Fase 3: API para n8n

### Task 8: Middleware de autenticação por API Key

**Files:**
- Create: `lib/auth.ts`
- Create: `__tests__/lib/auth.test.ts`

- [ ] **Step 1: Criar diretório e escrever o teste**

```bash
mkdir -p __tests__/lib
```

```typescript
// __tests__/lib/auth.test.ts
import { validateApiKey } from '@/lib/auth'

describe('validateApiKey', () => {
  beforeEach(() => {
    process.env.N8N_API_KEY = 'test-key-123'
  })

  it('retorna true para chave correta', () => {
    const req = new Request('http://localhost', {
      headers: { 'X-API-Key': 'test-key-123' },
    })
    expect(validateApiKey(req)).toBe(true)
  })

  it('retorna false para chave incorreta', () => {
    const req = new Request('http://localhost', {
      headers: { 'X-API-Key': 'wrong-key' },
    })
    expect(validateApiKey(req)).toBe(false)
  })

  it('retorna false quando header ausente', () => {
    const req = new Request('http://localhost')
    expect(validateApiKey(req)).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/lib/auth.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `lib/auth.ts`**

```typescript
export function validateApiKey(request: Request): boolean {
  const key = request.headers.get('X-API-Key')
  return key !== null && key === process.env.N8N_API_KEY
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/lib/auth.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts __tests__/lib/auth.test.ts
git commit -m "feat: add API key validation middleware"
```

---

### Task 9: Endpoint GET /api/n8n/no-shows

**Files:**
- Create: `app/api/n8n/no-shows/route.ts`
- Create: `__tests__/api/n8n-no-shows.test.ts`

- [ ] **Step 1: Escrever o teste**

```typescript
// __tests__/api/n8n-no-shows.test.ts
jest.mock('@/lib/prisma', () => ({
  prisma: { appointment: { findMany: jest.fn() } },
}))

jest.mock('@/lib/auth', () => ({
  validateApiKey: jest.fn(),
}))

import { GET } from '@/app/api/n8n/no-shows/route'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

describe('GET /api/n8n/no-shows', () => {
  it('retorna 401 sem API key válida', async () => {
    (validateApiKey as jest.Mock).mockReturnValue(false)
    const req = new Request('http://localhost/api/n8n/no-shows')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna lista de faltas com key válida', async () => {
    (validateApiKey as jest.Mock).mockReturnValue(true)
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([
      {
        date: new Date('2026-05-15'),
        client: { name: 'Carlos Melo', phone: '11999990002' },
      },
    ])
    const req = new Request('http://localhost/api/n8n/no-shows')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].clientName).toBe('Carlos Melo')
    expect(data[0].phone).toBe('11999990002')
    expect(data[0].missedDate).toBe('2026-05-15')
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/api/n8n-no-shows.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `app/api/n8n/no-shows/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sinceParam = searchParams.get('since')

  const since = sinceParam ? new Date(sinceParam) : new Date()
  if (!sinceParam) since.setDate(since.getDate() - 7)
  since.setHours(0, 0, 0, 0)

  const noShows = await prisma.appointment.findMany({
    where: { status: 'no-show', date: { gte: since } },
    include: { client: true },
    orderBy: { date: 'desc' },
  })

  const result = noShows.map((a) => ({
    clientName: a.client.name,
    phone: a.client.phone,
    missedDate: a.date.toISOString().split('T')[0],
  }))

  return NextResponse.json(result)
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/api/n8n-no-shows.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/n8n/no-shows/ __tests__/api/n8n-no-shows.test.ts
git commit -m "feat: add GET /api/n8n/no-shows endpoint"
```

---

### Task 10: Endpoint GET /api/n8n/tomorrow

**Files:**
- Create: `app/api/n8n/tomorrow/route.ts`
- Create: `__tests__/api/n8n-tomorrow.test.ts`

- [ ] **Step 1: Escrever o teste**

```typescript
// __tests__/api/n8n-tomorrow.test.ts
jest.mock('@/lib/prisma', () => ({
  prisma: { appointment: { findMany: jest.fn() } },
}))

jest.mock('@/lib/auth', () => ({
  validateApiKey: jest.fn(),
}))

import { GET } from '@/app/api/n8n/tomorrow/route'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

describe('GET /api/n8n/tomorrow', () => {
  it('retorna 401 sem API key válida', async () => {
    (validateApiKey as jest.Mock).mockReturnValue(false)
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna agendamentos de amanhã', async () => {
    (validateApiKey as jest.Mock).mockReturnValue(true)
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([
      {
        date: new Date(),
        client: { name: 'Maria Santos', phone: '11999990003' },
      },
    ])
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data[0].clientName).toBe('Maria Santos')
    expect(data[0]).toHaveProperty('appointmentDate')
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/api/n8n-tomorrow.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `app/api/n8n/tomorrow/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: { status: 'scheduled', date: { gte: tomorrow, lt: dayAfter } },
    include: { client: true },
    orderBy: { createdAt: 'asc' },
  })

  const result = appointments.map((a) => ({
    clientName: a.client.name,
    phone: a.client.phone,
    appointmentDate: a.date.toISOString().split('T')[0],
  }))

  return NextResponse.json(result)
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/api/n8n-tomorrow.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/n8n/tomorrow/ __tests__/api/n8n-tomorrow.test.ts
git commit -m "feat: add GET /api/n8n/tomorrow endpoint"
```

---

## Fase 4: Interface do Usuário

### Task 11: Componente StatsBar

**Files:**
- Create: `components/StatsBar.tsx`
- Create: `__tests__/components/StatsBar.test.tsx`

- [ ] **Step 1: Criar diretório e escrever o teste**

```bash
mkdir -p __tests__/components
```

```tsx
// __tests__/components/StatsBar.test.tsx
import { render, screen } from '@testing-library/react'
import { StatsBar } from '@/components/StatsBar'

describe('StatsBar', () => {
  it('exibe os 4 contadores corretamente', () => {
    render(<StatsBar total={8} attended={5} noShows={2} newClients={3} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('exibe os rótulos corretos', () => {
    render(<StatsBar total={0} attended={0} noShows={0} newClients={0} />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('Compareceram')).toBeInTheDocument()
    expect(screen.getByText('Faltaram')).toBeInTheDocument()
    expect(screen.getByText('Novos Clientes')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/components/StatsBar.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `components/StatsBar.tsx`**

```tsx
'use client'

import { Card } from '@/components/ui/card'

interface StatsBarProps {
  total: number
  attended: number
  noShows: number
  newClients: number
}

export function StatsBar({ total, attended, noShows, newClients }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="p-4 text-center">
        <p className="text-3xl font-bold">{total}</p>
        <p className="text-sm text-muted-foreground">Hoje</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-3xl font-bold text-green-500">{attended}</p>
        <p className="text-sm text-muted-foreground">Compareceram</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-3xl font-bold text-red-500">{noShows}</p>
        <p className="text-sm text-muted-foreground">Faltaram</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-3xl font-bold text-yellow-500">{newClients}</p>
        <p className="text-sm text-muted-foreground">Novos Clientes</p>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/components/StatsBar.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/StatsBar.tsx __tests__/components/StatsBar.test.tsx
git commit -m "feat: add StatsBar component"
```

---

### Task 12: Componente AttendanceToggle

**Files:**
- Create: `components/AttendanceToggle.tsx`
- Create: `__tests__/components/AttendanceToggle.test.tsx`

- [ ] **Step 1: Escrever o teste**

```tsx
// __tests__/components/AttendanceToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceToggle } from '@/components/AttendanceToggle'

describe('AttendanceToggle', () => {
  it('chama onMark com attended ao clicar em ✓ quando scheduled', () => {
    const onMark = jest.fn()
    render(<AttendanceToggle status="scheduled" onMark={onMark} />)
    fireEvent.click(screen.getByTestId('attended-btn'))
    expect(onMark).toHaveBeenCalledWith('attended')
  })

  it('chama onMark com no-show ao clicar em ✗ quando scheduled', () => {
    const onMark = jest.fn()
    render(<AttendanceToggle status="scheduled" onMark={onMark} />)
    fireEvent.click(screen.getByTestId('noshow-btn'))
    expect(onMark).toHaveBeenCalledWith('no-show')
  })

  it('chama onMark com scheduled ao clicar em ✓ quando já é attended (toggle off)', () => {
    const onMark = jest.fn()
    render(<AttendanceToggle status="attended" onMark={onMark} />)
    fireEvent.click(screen.getByTestId('attended-btn'))
    expect(onMark).toHaveBeenCalledWith('scheduled')
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/components/AttendanceToggle.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `components/AttendanceToggle.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import type { AppointmentStatus } from '@/app/types'

interface AttendanceToggleProps {
  status: AppointmentStatus
  onMark: (status: AppointmentStatus) => void
}

export function AttendanceToggle({ status, onMark }: AttendanceToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        data-testid="attended-btn"
        variant={status === 'attended' ? 'default' : 'outline'}
        className={status === 'attended' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        onClick={() => onMark(status === 'attended' ? 'scheduled' : 'attended')}
      >
        ✓
      </Button>
      <Button
        size="sm"
        data-testid="noshow-btn"
        variant={status === 'no-show' ? 'default' : 'outline'}
        className={status === 'no-show' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        onClick={() => onMark(status === 'no-show' ? 'scheduled' : 'no-show')}
      >
        ✗
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/components/AttendanceToggle.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/AttendanceToggle.tsx __tests__/components/AttendanceToggle.test.tsx
git commit -m "feat: add AttendanceToggle component"
```

---

### Task 13: Modal de Novo Agendamento

**Files:**
- Create: `components/NewAppointmentModal.tsx`
- Create: `__tests__/components/NewAppointmentModal.test.tsx`

- [ ] **Step 1: Escrever o teste**

```tsx
// __tests__/components/NewAppointmentModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewAppointmentModal } from '@/components/NewAppointmentModal'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('NewAppointmentModal', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
  })

  it('exibe o formulário ao abrir o modal', () => {
    render(<NewAppointmentModal onCreated={jest.fn()} />)
    fireEvent.click(screen.getByText('+ Novo Agendamento'))
    expect(screen.getByLabelText(/nome do cliente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('chama onCreated após salvar com sucesso', async () => {
    const onCreated = jest.fn()
    render(<NewAppointmentModal onCreated={onCreated} />)
    fireEvent.click(screen.getByText('+ Novo Agendamento'))
    fireEvent.change(screen.getByLabelText(/nome do cliente/i), { target: { value: 'Ana Lima' } })
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999990001' } })
    fireEvent.change(screen.getByLabelText(/data/i), { target: { value: '2026-05-16' } })
    fireEvent.click(screen.getByText('Salvar Agendamento'))
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test -- __tests__/components/NewAppointmentModal.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Criar `components/NewAppointmentModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

interface NewAppointmentModalProps {
  onCreated: () => void
}

export function NewAppointmentModal({ onCreated }: NewAppointmentModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, date }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      setName('')
      setPhone('')
      setDate('')
      onCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Novo Agendamento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Nome do cliente</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: João Silva"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="(11) 99999-0000"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Rodar os testes**

```bash
npm test -- __tests__/components/NewAppointmentModal.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/NewAppointmentModal.tsx __tests__/components/NewAppointmentModal.test.tsx
git commit -m "feat: add NewAppointmentModal component"
```

---

### Task 14: Componentes de linha e abas (sem testes — UI pura)

**Files:**
- Create: `components/AppointmentRow.tsx`
- Create: `components/tabs/TodayTab.tsx`
- Create: `components/tabs/WeekTab.tsx`
- Create: `components/tabs/ClientsTab.tsx`
- Create: `components/tabs/NoShowsTab.tsx`
- Create: `app/api/clients/route.ts`

- [ ] **Step 1: Criar `components/AppointmentRow.tsx`**

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { AttendanceToggle } from '@/components/AttendanceToggle'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface AppointmentRowProps {
  appointment: AppointmentData
  showDate?: boolean
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

export function AppointmentRow({ appointment, showDate = false, onStatusChange }: AppointmentRowProps) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-card">
      {showDate && (
        <div className="text-sm text-muted-foreground w-24 shrink-0">{formattedDate}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{appointment.client.name}</p>
        <p className="text-sm text-muted-foreground">{appointment.client.phone}</p>
      </div>
      {appointment.client.isNew && (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500 shrink-0 text-xs">
          NOVO
        </Badge>
      )}
      <AttendanceToggle
        status={appointment.status}
        onMark={(status) => onStatusChange(appointment.id, status)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/tabs/TodayTab.tsx`**

```tsx
'use client'

import { AppointmentRow } from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface TodayTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

export function TodayTab({ appointments, onStatusChange }: TodayTabProps) {
  if (appointments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum agendamento para hoje.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {appointments.map((appt) => (
        <AppointmentRow key={appt.id} appointment={appt} onStatusChange={onStatusChange} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Criar `components/tabs/WeekTab.tsx`**

```tsx
'use client'

import { AppointmentRow } from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface WeekTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

export function WeekTab({ appointments, onStatusChange }: WeekTabProps) {
  const grouped = appointments.reduce<Record<string, AppointmentData[]>>((acc, appt) => {
    const key = new Date(appt.date).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit',
    })
    if (!acc[key]) acc[key] = []
    acc[key].push(appt)
    return acc
  }, {})

  if (Object.keys(grouped).length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum agendamento para a semana.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([day, appts]) => (
        <div key={day}>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2 capitalize">
            {day}
          </h3>
          <div className="flex flex-col gap-2">
            {appts.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} onStatusChange={onStatusChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Criar `app/api/clients/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clients)
}
```

- [ ] **Step 5: Criar `components/tabs/ClientsTab.tsx`**

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { ClientWithAppointments } from '@/app/types'

interface ClientsTabProps {
  clients: ClientWithAppointments[]
}

export function ClientsTab({ clients }: ClientsTabProps) {
  if (clients.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum cliente cadastrado.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {clients.map((client) => (
        <Card key={client.id} className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{client.name}</p>
                {client.isNew && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                    NOVO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              {client.appointments.length} consulta(s)
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Criar `components/tabs/NoShowsTab.tsx`**

```tsx
'use client'

import { AppointmentRow } from '@/components/AppointmentRow'
import type { AppointmentData, AppointmentStatus } from '@/app/types'

interface NoShowsTabProps {
  appointments: AppointmentData[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

export function NoShowsTab({ appointments, onStatusChange }: NoShowsTabProps) {
  if (appointments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma falta registrada.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {appointments.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appointment={appt}
          showDate
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/ app/api/clients/
git commit -m "feat: add AppointmentRow, tab components and GET /api/clients"
```

---

### Task 15: Dashboard principal e layout

**Files:**
- Create: `components/Dashboard.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Atualizar `app/globals.css`**

Substitua todo o conteúdo pelo gerado pelo shadcn/ui na inicialização (já existente). Confirme que as três diretivas do Tailwind estão no topo:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

O restante do arquivo (variáveis CSS do shadcn) já foi gerado pelo `npx shadcn init` — não altere.

- [ ] **Step 2: Atualizar `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agendamentos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Criar `components/Dashboard.tsx`**

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsBar } from '@/components/StatsBar'
import { NewAppointmentModal } from '@/components/NewAppointmentModal'
import { TodayTab } from '@/components/tabs/TodayTab'
import { WeekTab } from '@/components/tabs/WeekTab'
import { ClientsTab } from '@/components/tabs/ClientsTab'
import { NoShowsTab } from '@/components/tabs/NoShowsTab'
import type { AppointmentData, AppointmentStatus, ClientWithAppointments } from '@/app/types'

export function Dashboard() {
  const [todayAppts, setTodayAppts] = useState<AppointmentData[]>([])
  const [weekAppts, setWeekAppts] = useState<AppointmentData[]>([])
  const [noShowAppts, setNoShowAppts] = useState<AppointmentData[]>([])
  const [clients, setClients] = useState<ClientWithAppointments[]>([])

  const fetchAll = useCallback(async () => {
    const [todayRes, weekRes, noShowRes, clientsRes] = await Promise.all([
      fetch('/api/appointments'),
      fetch('/api/appointments?mode=week'),
      fetch('/api/appointments?mode=no-shows'),
      fetch('/api/clients'),
    ])
    if (todayRes.ok) setTodayAppts(await todayRes.json())
    if (weekRes.ok) setWeekAppts(await weekRes.json())
    if (noShowRes.ok) setNoShowAppts(await noShowRes.json())
    if (clientsRes.ok) setClients(await clientsRes.json())
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAll()
  }

  const attended = todayAppts.filter((a) => a.status === 'attended').length
  const noShows = todayAppts.filter((a) => a.status === 'no-show').length
  const newClients = todayAppts.filter((a) => a.client.isNew).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-bold">Agendamentos</h1>
          <NewAppointmentModal onCreated={fetchAll} />
        </div>

        <StatsBar
          total={todayAppts.length}
          attended={attended}
          noShows={noShows}
          newClients={newClients}
        />

        <Tabs defaultValue="today">
          <TabsList className="w-full">
            <TabsTrigger value="today" className="flex-1">Hoje</TabsTrigger>
            <TabsTrigger value="week" className="flex-1">Semana</TabsTrigger>
            <TabsTrigger value="clients" className="flex-1">Clientes</TabsTrigger>
            <TabsTrigger value="noshows" className="flex-1">Faltas</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            <TodayTab appointments={todayAppts} onStatusChange={handleStatusChange} />
          </TabsContent>
          <TabsContent value="week" className="mt-4">
            <WeekTab appointments={weekAppts} onStatusChange={handleStatusChange} />
          </TabsContent>
          <TabsContent value="clients" className="mt-4">
            <ClientsTab clients={clients} />
          </TabsContent>
          <TabsContent value="noshows" className="mt-4">
            <NoShowsTab appointments={noShowAppts} onStatusChange={handleStatusChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Atualizar `app/page.tsx`**

```tsx
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  return <Dashboard />
}
```

- [ ] **Step 5: Testar no browser**

```bash
npm run dev
```

Abra `http://localhost:3000`. Valide:
- Cards de resumo aparecem no topo
- Botão "+ Novo Agendamento" abre o modal
- As 4 abas navegam sem erros no console
- Cadastre um agendamento para hoje e verifique que aparece na aba "Hoje"
- Clique ✓ e confirme que o botão fica verde e a contagem de "Compareceram" sobe

- [ ] **Step 6: Rodar todos os testes**

```bash
npm test -- --no-coverage
```

Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add app/ components/
git commit -m "feat: add Dashboard with all tabs and full UI"
```

---

## Fase 5: Docker e Deploy (EasyPanel)

### Task 16: Dockerfile multi-stage e configuração de deploy

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `next.config.ts`
- Create: `docker-compose.yml`
- Create: `DEPLOY.md`

- [ ] **Step 1: Adicionar `output: 'standalone'` ao `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
```

- [ ] **Step 2: Criar `Dockerfile`**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/data

EXPOSE 3000

# Inicializa o banco na primeira execução e sobe o servidor
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js db push --skip-generate 2>/dev/null; node server.js"]
```

- [ ] **Step 3: Criar `.dockerignore`**

```
node_modules
.next
.git
*.db
*.db-journal
.env
.superpowers
__tests__
```

- [ ] **Step 4: Criar `docker-compose.yml`**

```yaml
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: file:/app/data/db.sqlite
      N8N_API_KEY: ${N8N_API_KEY}
    volumes:
      - dashboard_data:/app/data
    restart: unless-stopped

volumes:
  dashboard_data:
```

- [ ] **Step 5: Criar `DEPLOY.md`**

```markdown
# Deploy no EasyPanel

## Configuração

1. No EasyPanel, crie um projeto e adicione um serviço **App**
2. Configure a fonte como **GitHub** (ou URL Git)
3. Em **Build**, selecione **Dockerfile**
4. Em **Environment Variables**, adicione:
   - `N8N_API_KEY` → sua chave secreta
   - `DATABASE_URL` → `file:/app/data/db.sqlite`
5. Em **Volumes**, adicione: mount path `/app/data`
6. Em **Ports**, exponha a porta `3000`
7. Clique em **Deploy**

O banco SQLite é criado automaticamente na primeira inicialização.

## Endpoints para o n8n

**Lembretes (um dia antes):**
GET https://seu-dominio.com/api/n8n/tomorrow
Header: X-API-Key: <sua-chave>

**Clientes que faltaram:**
GET https://seu-dominio.com/api/n8n/no-shows
Header: X-API-Key: <sua-chave>
Query opcional: ?since=YYYY-MM-DD (padrão: últimos 7 dias)
```

- [ ] **Step 6: Testar o build Docker localmente**

```bash
docker build -t dashboard .
docker run -p 3000:3000 \
  -e N8N_API_KEY=test-key \
  -e DATABASE_URL=file:/app/data/db.sqlite \
  -v dashboard_data:/app/data \
  dashboard
```

Acesse `http://localhost:3000` e confirme que o dashboard abre.

- [ ] **Step 7: Rodar todos os testes finais**

```bash
npm test -- --no-coverage
```

Expected: All tests PASS

- [ ] **Step 8: Commit final**

```bash
git add Dockerfile .dockerignore docker-compose.yml DEPLOY.md next.config.ts
git commit -m "chore: add Docker setup and EasyPanel deploy instructions"
```

---

## Checklist de Verificação Final

- [ ] `npm test -- --no-coverage` → todos os testes passam
- [ ] `npm run build` → build sem erros de TypeScript
- [ ] `docker build -t dashboard .` → imagem construída com sucesso
- [ ] Dashboard abre em `http://localhost:3000` com as 4 abas
- [ ] Modal de cadastro cria agendamento e atualiza a lista
- [ ] Botões ✓/✗ atualizam status e refletem na UI
- [ ] Badge "NOVO" aparece no primeiro agendamento e desaparece após marcar ✓
- [ ] `GET /api/n8n/no-shows` sem header → 401
- [ ] `GET /api/n8n/no-shows` com `X-API-Key` correto → 200 com JSON
- [ ] `GET /api/n8n/tomorrow` sem header → 401
- [ ] `GET /api/n8n/tomorrow` com `X-API-Key` correto → 200 com JSON
