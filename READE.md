# 💰 Simulador Financeiro Pessoal

**Projeto:** Simulador Financeiro Pessoal
**Versão:** 1.0 (Commits Fechados) / 2.0 (Planejamento)
**Data:** 09/11/2025

Este documento serve como o diário de bordo e a documentação técnica oficial do Simulador Financeiro Pessoal.

---

/simulador-financeiro/
├── 📄 .gitignore
├── 📄 COMMIT_MESSAGE.md
├── 📄 index.html
├── 📄 package.json
├── 📄 README.md
├── 📄 tailwind.config.js
├── 📁 dist/
│   └── 📄 output.css
└── 📁 src/
    ├── 📄 input.css
    └── 📁 js/
        ├── 📄 main.js
        ├── 📄 sortable.min.js
        ├── 📄 storage.js
        └── 📄 ui.js

## 1. Documentação v1.0 (Concluída)

Esta seção descreve a primeira versão funcional do aplicativo.

### 1.1. Conceito e Objetivos

A v1.0 substitui um processo manual de planejamento em papel por uma ferramenta digital (Mobile-First) focada em "simulação de mês único". O objetivo principal é permitir ao usuário simular cenários de pagamento (pagar, pagar parcialmente, ignorar) e ver o impacto imediato no saldo, sem a necessidade de reescrever despesas ou fazer cálculos manuais.

### 1.2. Stack de Tecnologia (v1.0)

* **Linguagem:** Vanilla JavaScript (ES6 Modules)
* **Estilização:** Tailwind CSS
* **Armazenamento:** `localStorage` do Navegador
* **Bibliotecas Externas:** `SortableJS` (para Drag-and-Drop)

### 1.3. Modelo de Dados (v1.0)

Os dados são armazenados em duas chaves principais no `localStorage`:

1.  `fin_expenses`: Um array de objetos `Expense`.
2.  `fin_simulation_data`: Um objeto contendo o `initialBalance`.

**Objeto `Expense` (v1.0):**
```json
{
  "id": "1731193200000",
  "name": "Aluguel",
  "defaultValue": 380,
  "currentValue": 380,
  "status": "pending",
  "isTemporary": false,
  "sortOrder": 1
}
1.4. Manual da Aplicação (Features v1.0)
A aplicação é dividida em três telas principais, acessíveis pela barra de navegação inferior.

Tela: Início (Simulação)

Card de Resumo: Exibe Saldo Atual e A Pagar. É minimizável e, quando expandido, mostra Projeção Final, Ignorado/Economizado, Já Pago e Saldo Inicial.

Editar Saldo Inicial: Um ícone ✏️ no card permite alterar o initialBalance a qualquer momento.

Lista de Despesas: Exibe todas as despesas do mês. Clicar em um item abre o Modal de Ações.

Modal de Ações:

Pagar: Marca a despesa como paid.

Editar Valor (Simulação): Permite inserir um currentValue (valor parcial) apenas para este mês.

Ignorar/Reativar: Alterna o status da despesa entre pending e ignored (o item fica visualmente "apagado").

Excluir (Permanente): Remove a despesa do localStorage.

Tela: Adicionar (+)

Formulário para cadastrar novas despesas.

Permite definir a despesa como "Fixa (Automática)" ou "Temporária (Só este mês)".

Tela: Despesas (Gestão)

Lista de Gestão: Exibe apenas despesas fixas.

Editar (Permanente): Um ícone ✏️ permite editar o Nome e o Valor Padrão (defaultValue) da despesa.

Drag-and-Drop: Permite reordenar a lista arrastando pelo ícone ☰. (Requer delay de 200ms em toque).

Botão "Iniciar Novo Mês":

Verifica Despesas Temporárias (pergunta se quer torná-las fixas ou descartá-las).

Reseta todas as despesas fixas para status: 'pending'.

Solicita o novo Saldo Inicial.

2. Especificação da v2.0 (Planejamento)
Esta seção descreve a próxima grande evolução do projeto.

2.1. Objetivos da v2.0
O objetivo principal é migrar de um simulador de mês único para um sistema de previsão de fluxo de caixa de vários meses, com persistência de dados em um banco de dados real. Isso introduz o conceito de tempo à aplicação, permitindo o gerenciamento de parcelas, faturas de cartão e a visualização de gastos futuros.

Novas Features-Chave:

Backend e Banco de Dados: Migração do localStorage para Node.js + SQLite.

Autenticação: O usuário poderá criar uma conta e acessar seus dados de qualquer dispositivo.

Nova Tela "Parcelas": Uma tela dedicada para gerenciar compras parceladas e faturas (Cartões, Pessoas, etc.).

Navegação de Mês: A tela "Início" e "Parcelas" ganharão navegação de mês (ex: < Março >).

Faturas Híbridas: As despesas do tipo "Fatura" (ex: "Nubank") terão seu valor padrão calculado automaticamente pela soma das parcelas daquele mês, mas o usuário poderá sobrescrever manualmente (simular) um valor total diferente para o mês corrente.

2.2. Requisitos Técnicos (Stack v2.0)
Frontend: Vanilla JavaScript (ES6 Modules), Tailwind CSS (Estrutura existente).

Backend: Node.js (Express.js) para uma API RESTful.

Banco de Dados: SQLite (para simplicidade de deploy) gerenciado via Knex.js (Query Builder e Migrations).

Autenticação: JSON Web Tokens (JWT) para gerenciamento de sessão da API.

2.3. Modelo de Dados Detalhado (v2.0)
Esta é a fundação da v2.0. O banco de dados substituirá fin_expenses e fin_simulation_data.

Tabela: Users

user_id (PK, UUID)

email (String, Unique)

password_hash (String)

Tabela: Accounts (As "Faturas" / "Tags")

account_id (PK, UUID)

user_id (FK para Users)

name (String, ex: "Nubank", "Larissa", "PicPay")

color (String, ex: "purple", "pink")

type (String, ex: "credit_card", "person")

Tabela: RecurringExpenses (As despesas fixas da v1.0)

expense_id (PK, UUID)

user_id (FK para Users)

name (String, ex: "Aluguel", "Internet")

default_value (Decimal)

sort_order (Integer)

Tabela: Installments (As "Parcelas")

installment_id (PK, UUID)

user_id (FK para Users)

account_id (FK para Accounts)

name (String, ex: "Celular Novo", "Escola")

value (Decimal)

due_date (Date, YYYY-MM-DD, ex: "2025-03-01")

parcel_number (Integer, ex: 3)

total_parcels (Integer, ex: 10)

Tabela: MonthlySimulations (O "Contexto" do Mês)

sim_id (PK, UUID)

user_id (FK para Users)

month (Date, YYYY-MM-01, ex: "2025-03-01")

initial_balance (Decimal)

Tabela: SimulationEntries (O "Estado" da Simulação daquele Mês)

entry_id (PK, UUID)

sim_id (FK para MonthlySimulations)

name (String, ex: "Aluguel", "Fatura Nubank")

default_value (Decimal, O valor recorrente ou a soma das parcelas calculada)

current_value (Decimal, O valor que o usuário editou na simulação)

status (String, 'pending', 'paid', 'ignored')

sort_order (Integer)

is_fatura (Boolean, true se for um Account e não um RecurringExpense)

2.4. Fluxos de Lógica Detalhada (v2.0)
Lógica 1: Navegação de Mês (ex: para "Março")

Usuário navega para "Março".

App verifica se existe uma MonthlySimulations para "Março".

Se não:

App cria um novo registro em MonthlySimulations (com initial_balance 0).

App gera as SimulationEntries para Março:

Busca todos RecurringExpenses e cria uma SimulationEntry para cada (ex: Aluguel, 380).

Busca todos Accounts (Faturas).

Para cada Account (ex: "Nubank"), calcula SUM(value) de Installments onde due_date é "Março".

Cria uma SimulationEntry para "Fatura Nubank" com o default_value calculado.

App busca e exibe as SimulationEntries recém-criadas.

Se sim:

App simplesmente busca e exibe as SimulationEntries existentes para Março.

Lógica 2: Fatura Híbrida (Override)

Cenário: "Fatura Nubank" calculada (default_value) é R$ 251. Usuário edita (current_value) para R$ 700.

Ação: O app salva current_value = 700 na SimulationEntries de Setembro.

Próximo Mês: O usuário navega para Outubro. O app gera as entradas de Outubro. O cálculo de parcelas agora é R$ 140.72. Uma nova SimulationEntry é criada para "Fatura Nubank" com default_value = 140.72 e current_value = 140.72.

Resultado: O override de R$ 700 foi descartado, como solicitado, e o novo valor calculado é o ponto de partida.

Lógica 3: Adicionar Parcela (com valores variáveis)

Usuário clica em "Adicionar Parcela" na tela "Parcelas".

Formulário principal: Nome ("Escola"), Fatura/Account ("Boleto"), Nº de Parcelas (3), Valor da Parcela (150), Mês Início (Maio 2025).

O app cria 3 Installments (Maio, Junho, Julho) de R$ 150.

Botão "Valores Variáveis":

Se clicado, o formulário muda e mostra: Mês 1 (Maio): [150], Mês 2 (Junho): [150], Mês 3 (Julho): [ 80].

O usuário pode editar o valor de cada parcela antes de salvar.

Lógica 4: UI da Tela "Parcelas" (Design Aprovado)

Card Superior (com Swipe):

O usuário pode deslizar o card horizontalmente.

O app gerencia um state.selectedAccountIndex.

O Card 1 (index 0) é "Total", os seguintes são as Accounts (Nubank, Larissa, etc.).

O Card exibe: Total Mês Atual (calculado), Total Próximo Mês (calculado), Total Restante (soma de todas as parcelas futuras).

Navegação de Mês (com Botões):

< Março >

Os botões < e > (fáceis de clicar) mudam o state.viewingMonth.

Lista de Parcelas:

A lista é filtrada com base no state.selectedAccountIndex (do card) e state.viewingMonth (dos botões).

Cada item exibe: Nome, Parcela Atual/Total (ex: 3/10), Valor Total Restante (ex: R$ 1015) e Mês de Término (ex: Fev. 2026).

3. Plano de Ação (v2.0)
Passos para implementar a v2.0, migrando da v1.0.

Fase 1: Fundação do Backend (Node.js/SQLite)

Setup: Inicializar novo projeto Node.js com Express.js, cors, bcrypt.js (para senhas), jsonwebtoken.

Banco de Dados: Instalar knex.js e sqlite3.

Migrations: Criar os arquivos de migração (scripts) para gerar as 6 tabelas do Modelo de Dados v2.0.

Autenticação: Implementar rotas /auth/register e /auth/login. Criar um middleware de autenticação (checkAuth) que verifica o token JWT.

Fase 2: Migração do Core (Backend)

Rotas CRUD: Criar rotas protegidas pelo checkAuth para:

RecurringExpenses (CRUD completo).

Accounts (CRUD completo).

Installments (CRUD completo).

Lógica de Simulação (Backend):

Criar o endpoint principal: GET /simulation/:month (ex: /simulation/2025-03-01).

Este endpoint executa a Lógica 1 (Navegação de Mês):

Verifica se SimulationEntries existem.

Se não, gera-as (buscando RecurringExpenses e calculando Installments).

Retorna a lista completa de SimulationEntries para aquele mês.

Criar endpoints para atualizar a simulação: PUT /simulation/entry/:entry_id (para editar current_value e status).

Fase 3: Migração do Frontend (api.js)

Autenticação: Criar uma tela de Login no index.html.

api.js: Renomear/Reescrever storage.js para api.js.

Este módulo api.js terá funções como login(), register().

Após o login, ele armazena o token JWT no localStorage.

Todas as chamadas subsequentes (fetch) incluem o token no Header Authorization: Bearer <token>.

Core Loop (Frontend):

Substituir todas as chamadas storage.get... por api.getSimulation(month).

Substituir todas as chamadas storage.save... por api.updateSimulationEntry(...).

A tela "Início" agora deve conter a navegação de mês < >.

O main.js agora terá uma variável state.viewingMonth.

Fase 4: Implementação da Tela "Parcelas" (Frontend)

UI: Adicionar view-parcels ao index.html e o ícone na barra de navegação.

Layout: Construir o layout (Card, Botões < >, Lista) conforme a Lógica 4 (UI).

Card Swipe: Implementar o swipe do card superior (com touchstart, touchmove, touchend).

Formulários: Criar os modais para "Adicionar/Editar Account" e "Adicionar/Editar Installment" (incluindo a lógica de "Valores Variáveis").

Integração: Conectar todos os botões e formulários aos seus respectivos endpoints da API (criados na Fase 2).

Fase 5: Documentação e Fechamento (v2.0)

Atualizar o README.md para refletir a v2.0 como "Concluída".

Garantir que todas as rotas da API estejam documentadas.

Confirmar que o fluxo "Híbrido" e "Reset de Mês" (agora Lógica 1) funcionam como esperado.