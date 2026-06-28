# Regras do Projeto — STUV

> Leia este arquivo no início de cada fase. Ele contém todas as convenções, padrões e restrições do projeto. Os prompts de fase não repetem o que está aqui.

---

## 1. Visão geral

STUV — Sistema de Testes Único Viável. Plataforma web para gestão de testes de software: planos de teste, casos de uso, casos de teste, execuções, defeitos e relatórios. Três perfis: Administrador, Gerente de Projeto, Testador/Analista.

## 2. Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Estado de servidor | TanStack Query |
| Formulários | react-hook-form +    zod |
| Roteamento | React Router v6 |
| Backend | Nest.js + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 16 (local) |
| Auth | JWT (Passport + @nestjs/jwt) |
| Upload | Multer (disco local) |
| PDF/CSV | pdf-lib + csv-stringify |
| Gráficos | Recharts |
| Testes back | Jest (cobertura ≥ 80%) |
| Testes front | Vitest + Testing Library |
| Monorepo | npm workspaces |

## 3. Convenções de código

- **Idioma:** identificadores em inglês. Nomes de domínio podem ser em português (ex: `planos_teste`). Strings visíveis ao usuário em PT-BR.
- **Prefixo de API:** `/api/v1`
- **Chave primária:** UUID em todas as entidades.
- **Commits:** mensagens objetivas em português.

## 4. Padrões de backend (aplicar em TODO módulo novo)

- DTOs de entrada validados com `class-validator`.
- `@ApiTags` no controller, `@ApiOperation` nos endpoints principais.
- Testes Jest cobrindo fluxo principal + cenários de erro + RBAC.
- Erros tratados com exception filters padronizados.

## 5. Padrões de frontend (aplicar em TODA tela nova)

- Formulários com react-hook-form + zod.
- Dados de servidor via TanStack Query (useQuery/useMutation) — nunca useState para dados que vêm da API.
- Cores de status e gravidade conforme `apps/web/DESIGN.md` — nunca inventar cores ad hoc.
- **Antes de criar um componente, verifique se já existe um similar em `components/`.** Reutilize e estenda em vez de duplicar.

## 6. Matriz de permissões (RBAC)

Implementada como `RolesGuard` + `@Roles()`. C=Criar R=Ler U=Atualizar D=Excluir.

| Entidade | Administrador | Gerente | Testador |
|---|---|---|---|
| Usuários | CRUD | R | — |
| Planos de Teste | CRUD | CRU | R |
| Casos de Uso | CRUD | CRU | CRU |
| Casos de Teste | CRUD | CRU | CRU |
| Execuções | RD | CRU | CRU |
| Defeitos | RUD | RU | CRU |
| Relatórios | R | CR | R |

**Atenção:** Gerente pode executar testes (CRU em Execuções).

## 7. O que NÃO implementar (MVP)

Se qualquer item abaixo parecer necessário, **pare e peça confirmação** antes de implementar:

- Bloqueio de conta por tentativas de login
- Inativação de usuário
- Entidade "Projeto" acima de Plano
- Suítes de Teste
- Rastreabilidade CT ↔ Requisito Funcional
- Reabertura de defeito (enum existe, transição não)
- Lixeira / soft-delete
- Expiração de sessão por inatividade
- Integração externa (Jira, TestRail, OAuth)

## 8. Regra de segurança arquitetural

Se a implementação exigir qualquer uma destas ações, **interrompa e peça confirmação**:

- Alterar estrutura de pastas do monorepo
- Criar nova entidade no Prisma schema
- Mudar padrão de autenticação ou guarda de rotas
- Adicionar dependência não listada na stack
- Refatorar componente que já funciona em outra tela
