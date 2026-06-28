# STUV — Sistema de Design

> Referência obrigatória. Toda tela nova deve usar as tokens abaixo — nunca inventar cores ad hoc.

---

## Conceito

**"Diagnostic Interface"** — a linguagem visual de um painel de diagnóstico técnico: precisa, sem ruído, com personalidade própria.

A barra lateral usa fundo escuro (Slate-900). O conteúdo usa fundo quase-branco (Stone-50). Cards de status têm uma faixa de cor vertical à esquerda — herança visual da marcação de modificações em IDEs, aplicada ao conceito de "resultado de teste".

---

## Paleta Principal

| Token               | Cor                      | Hex       | Uso                                          |
|---------------------|--------------------------|-----------|----------------------------------------------|
| `primary`           | Indigo-600               | `#4F46E5` | Ações principais, botões, links ativos       |
| `primary-dark`      | Indigo-700               | `#4338CA` | Hover de ações primárias                     |
| `accent`            | Cyan-500                 | `#06B6D4` | Indicadores interativos, highlights          |
| `sidebar-bg`        | Slate-900                | `#0F172A` | Fundo da barra lateral                       |
| `sidebar-active`    | Indigo-600               | `#4F46E5` | Item ativo na sidebar                        |
| `page-bg`           | Stone-50                 | `#FAFAF9` | Fundo das páginas                            |
| `card-bg`           | White                    | `#FFFFFF` | Cards e painéis                              |
| `text-primary`      | Slate-900                | `#0F172A` | Títulos e texto principal                    |
| `text-secondary`    | Slate-500                | `#64748B` | Labels, texto auxiliar                       |
| `border`            | Slate-200                | `#E2E8F0` | Bordas de inputs, separadores                |

---

## Cores de Status (ResultadoExecucao)

Usadas em badges, barras de progresso e indicadores de execução.

| Status           | Texto            | Hex texto  | Fundo           | Hex fundo  |
|------------------|------------------|------------|-----------------|------------|
| `PASSOU`         | `text-green-700` | `#15803D`  | `bg-green-50`   | `#F0FDF4`  |
| `FALHOU`         | `text-red-700`   | `#B91C1C`  | `bg-red-50`     | `#FEF2F2`  |
| `BLOQUEADO`      | `text-orange-700`| `#C2410C`  | `bg-orange-50`  | `#FFF7ED`  |
| `PULADO`         | `text-slate-600` | `#475569`  | `bg-slate-100`  | `#F1F5F9`  |
| `EM_EXECUCAO`    | `text-blue-700`  | `#1D4ED8`  | `bg-blue-50`    | `#EFF6FF`  |
| `NAO_EXECUTADO`  | `text-slate-400` | `#94A3B8`  | `bg-slate-50`   | `#F8FAFC`  |

---

## Cores de Gravidade (GravidadeDefeito)

| Gravidade  | Texto             | Hex        | Fundo            | Hex        |
|------------|-------------------|------------|------------------|------------|
| `CRITICA`  | `text-red-900`    | `#7F1D1D`  | `bg-red-100`     | `#FEE2E2`  |
| `ALTA`     | `text-red-700`    | `#B91C1C`  | `bg-red-50`      | `#FEF2F2`  |
| `MEDIA`    | `text-amber-700`  | `#B45309`  | `bg-amber-50`    | `#FFFBEB`  |
| `BAIXA`    | `text-green-700`  | `#15803D`  | `bg-green-50`    | `#F0FDF4`  |

---

## Cores de Perfil (PerfilUsuario)

| Perfil         | Texto              | Fundo             |
|----------------|--------------------|-------------------|
| `ADMINISTRADOR`| `text-indigo-700`  | `bg-indigo-50`    |
| `GERENTE`      | `text-cyan-700`    | `bg-cyan-50`      |
| `TESTADOR`     | `text-slate-600`   | `bg-slate-100`    |

---

## Cores de Status do Plano (StatusPlano)

| Status         | Texto              | Fundo             |
|----------------|--------------------|-------------------|
| `RASCUNHO`     | `text-slate-600`   | `bg-slate-100`    |
| `ATIVO`        | `text-green-700`   | `bg-green-50`     |
| `EM_EXECUCAO`  | `text-blue-700`    | `bg-blue-50`      |
| `CONCLUIDO`    | `text-indigo-700`  | `bg-indigo-50`    |

---

## Tipografia

| Tipo         | Fonte                | Peso         | Uso                                  |
|--------------|----------------------|--------------|--------------------------------------|
| Display      | **Plus Jakarta Sans**| 600–800      | Títulos de página, logo, headings    |
| Body         | **Inter**            | 400–500      | Parágrafos, labels, descrições       |
| Mono         | **JetBrains Mono**   | 400          | Passos de teste, logs, código        |

Importar via Google Fonts CDN no `index.html`.

---

## Assinatura Visual

1. **Sidebar escura com ícone ativo destacado:** item ativo recebe `bg-indigo-600` e texto branco; os demais ficam em `text-slate-400` com hover `text-white`.
2. **Faixa de status à esquerda do card:** todo card de resultado tem `border-l-4` colorido conforme status — substitui o badge genérico como indicador primário.
3. **Logo STUV:** monograma "ST" em fonte bold com checkmark (`✓`) integrado ao "T". Fundo indigo, texto branco.
4. **Badges pill com dot:** `● Passou` — ponto colorido + label, sem borda, fundo suave.
