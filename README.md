# STUV — Sistema de Testes Único Viável

Plataforma web para gestão de testes de software: planos, casos de uso, casos de teste, execuções, defeitos e relatórios. Três perfis: Administrador, Gerente de Projeto, Testador.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Backend | NestJS + TypeScript + Prisma ORM |
| Banco | PostgreSQL 16 |
| Auth | JWT (Passport) |
| Monorepo | npm workspaces |

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 16 rodando localmente

---

## Setup inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Crie um banco PostgreSQL e configure a variável de ambiente:

```bash
# Linux / macOS
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/stuv"

# Ou crie um arquivo apps/api/.env
echo 'DATABASE_URL="postgresql://usuario:senha@localhost:5432/stuv"' > apps/api/.env
```

> **PostgreSQL local (Ubuntu/Debian):**
> ```bash
> sudo -u postgres psql -c "CREATE USER stuv WITH PASSWORD 'stuv';"
> sudo -u postgres psql -c "CREATE DATABASE stuv OWNER stuv;"
> export DATABASE_URL="postgresql://stuv:stuv@localhost:5432/stuv"
> ```

### 3. Executar migrations e seed

```bash
npm run prisma:migrate   # cria as tabelas
npm run prisma:seed      # popula dados de exemplo
```

### 4. Compilar o pacote compartilhado

```bash
cd packages/shared && npx tsc -p tsconfig.cjs.json && cd ../..
```

---

## Rodando o projeto

### Dois terminais (recomendado)

**Terminal 1 — API** (porta 3000):
```bash
npm run dev:api
```

**Terminal 2 — Frontend** (porta 5173):
```bash
npm run dev:web
```

### Um terminal (com concurrently)

```bash
npm run dev
```

Aguarde `Nest application successfully started` antes de usar o frontend.

---

## Acessando

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |

### Credenciais do seed

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | admin@stuv.com | admin123 |
| Gerente | gerente@stuv.com | gerente123 |
| Testador | testador@stuv.com | testador123 |

---

## Testes

```bash
# Testes unitários e de integração (API)
npm test --workspace=apps/api

# Com cobertura
npm run test:cov --workspace=apps/api
```

---

## Estrutura do monorepo

```
stuv/
├── apps/
│   ├── api/          # NestJS — backend
│   └── web/          # React — frontend
└── packages/
    └── shared/       # Enums e tipos compartilhados (compilado como CJS)
```

### Observações técnicas

- O build da API gera output em `apps/api/dist/apps/api/src/main.js` (não `dist/main.js`) por causa do path alias `@stuv/shared` que expande o rootDir implícito do TypeScript.
- O pacote `packages/shared` deve ser compilado como CJS antes de rodar a API: `cd packages/shared && npx tsc -p tsconfig.cjs.json`.
- Uploads de evidências vão para `apps/api/uploads/` (criado automaticamente).
- Logs de auditoria são gravados automaticamente via Proxy sobre os delegates do Prisma — nenhum service escreve logs manualmente.

---

## Funcionalidades implementadas

- **Autenticação JWT** com três perfis (RBAC via guard global)
- **Planos de Teste** — wizard de criação em etapas, ciclo de vida completo
- **Casos de Uso** — wizard com fluxo principal e alternativo
- **Casos de Teste** — vinculados a UC, com prioridade
- **Execuções** — registro de resultado, motivo condicional (FALHOU/BLOQUEADO), upload de evidências
- **Defeitos** — máquina de estados com transições validadas, vinculados a execuções
- **Relatórios** — dashboard com Recharts, exportação PDF e CSV, filtros por plano/período/executor/resultado
- **Auditoria** — log automático de create/update/delete em todas as entidades via AsyncLocalStorage + Proxy
