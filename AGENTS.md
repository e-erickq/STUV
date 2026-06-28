# AGENTS.md

## Objetivo do projeto

Este projeto tem como objetivo recriar, em React com JavaScript e CSS, as telas exportadas do Figma em uma nova base de código limpa, organizada e fácil de manter.

A pasta exportada do Figma deve ser usada apenas como referência visual e estrutural.
Ela não deve ser alterada nem tratada como produto final.

---

## Stack obrigatória

* React
* JavaScript (sem TypeScript)
* Vite
* CSS tradicional
* React Router

---

## Restrições

* Não usar TypeScript
* Não usar Tailwind
* Não usar bibliotecas de UI prontas
* Não usar código exportado do Figma como base final
* Não criar componentes gigantes
* Não abusar de `position: absolute`
* Não misturar lógica, layout e estilo no mesmo arquivo quando isso puder ser evitado

---

## Estrutura esperada

Criar uma nova aplicação React em uma pasta separada, com a seguinte organização sugerida:

src/
components/
pages/
layouts/
styles/
assets/

---

## Regras de construção

* Cada tela do Figma deve virar uma página React.
* Componentes repetidos devem ser reutilizados.
* Cada componente deve ter responsabilidade clara e única.
* CSS deve ser organizado por componente, página ou layout.
* A interface deve ser responsiva.
* Layouts devem priorizar Flexbox e Grid.
* Os dados iniciais podem ser mockados com arrays e objetos.
* A navegação deve ser feita com React Router.
* A sidebar deve refletir o estado da página ativa.

---

## Passo a passo obrigatório de execução

### Etapa 1 — Análise inicial

1. Ler o AGENTS.md inteiro antes de começar.
2. Inspecionar a pasta do Figma exportado apenas para entender quais telas existem.
3. Identificar nomes de telas, padrões visuais e componentes repetidos.
4. Definir mentalmente a ordem de implementação.

### Etapa 2 — Criação da base do projeto

1. Se não existir projeto React, criar um novo com Vite.
2. Configurar React com JavaScript.
3. Criar a estrutura de pastas.
4. Configurar o React Router.
5. Criar estilos globais.

### Etapa 3 — Layout base

1. Criar a estrutura principal do app.
2. Implementar sidebar fixa.
3. Implementar header/topbar.
4. Criar container principal de conteúdo.
5. Garantir funcionamento em todas as páginas.

### Etapa 4 — Componentes reutilizáveis

1. Criar componentes que aparecem em várias telas.
2. Priorizar:

   * Sidebar
   * Header / Topbar
   * Botões
   * Cards
   * Badges
   * Tabela
   * Campo de busca
3. Separar em arquivos próprios.
4. Criar CSS quando necessário.

### Etapa 5 — Implementação por tela

1. Implementar uma tela por vez.
2. Começar pela principal.
3. Validar fidelidade ao Figma.
4. Reutilizar componentes.
5. Só depois avançar.

### Etapa 6 — Organização e refinamento

1. Ajustar espaçamentos, cores e tipografia.
2. Revisar responsividade.
3. Remover duplicações.
4. Melhorar nomes e estrutura.

### Etapa 7 — Validação final

1. Verificar se roda sem erros.
2. Conferir rotas.
3. Garantir que telas principais foram recriadas.
4. Validar organização final.

---

## Ordem de implementação recomendada

1. Estrutura base
2. Layout principal
3. Componentes reutilizáveis
4. Tela inicial
5. Telas de listagem
6. Telas de criação/edição
7. Ajustes finais

---

## Critérios de qualidade

* Código limpo
* Componentes pequenos
* Estrutura clara
* Reutilização
* CSS organizado
* Responsividade
* Fidelidade ao Figma
* Facilidade de manutenção

---

## Regra principal

Não tentar fazer tudo de uma vez.

Implementar em etapas pequenas e validar antes de avançar.

---

## Resultado esperado

* Projeto funcional
* React com JavaScript
* CSS tradicional
* Interface fiel ao Figma
* Código organizado e escalável
