# 📜 Convenção de Mensagens de Commit

Para manter o histórico do nosso projeto limpo, legível e organizado, seguiremos um padrão para todas as mensagens de commit.

## Formato

Cada mensagem de commit deve seguir o formato:

`<tipo>(<escopo>): <assunto>`

### 1. Tipo (Obrigatório)

O `tipo` descreve a *categoria* da mudança. Usaremos os seguintes tipos:

* **feat:** (Feature) Adiciona uma nova funcionalidade ao usuário.
    * `feat(ui): adiciona modal de edição de saldo`
* **fix:** (Correção) Corrige um bug.
    * `fix(js): corrige cálculo do total ignorado`
* **style:** (Estilo) Mudanças que afetam apenas o visual (CSS, Tailwind), sem alterar a lógica.
    * `style(header): moderniza o tema de cores para índigo`
* **refactor:** (Refatoração) Mudança no código que não corrige um bug nem adiciona uma feature.
    * `refactor(storage): abstrai a lógica do localStorage`
* **docs:** (Documentação) Mudanças apenas em arquivos de documentação (`.md`).
    * `docs: atualiza README com features da v1.0`
* **chore:** (Tarefas) Mudanças em arquivos de build, configuração, etc. (Ex: `package.json`, `tailwind.config.js`).
    * `chore: adiciona biblioteca SortableJS`

### 2. Escopo (Opcional)

O `escopo` é o nome da seção do código que foi alterada. Ele deve estar entre parênteses.

* **Exemplos:** `ui`, `js`, `storage`, `header`, `modal`, `gestao`
* `feat(modal): adiciona botão de reativar despesa`

### 3. Assunto (Obrigatório)

O `assunto` é uma descrição curta, em **minúsculas** e no **modo imperativo** (como se você estivesse dando uma ordem).

* ✅ **Bom:** `feat(ui): adiciona botão de pagar`
* ❌ **Ruim:** `Adicionando o botão de pagar`
* ❌ **Ruim:** `Botão de pagar adicionado`

## Exemplo Completo