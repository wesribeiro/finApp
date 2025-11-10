// Importa as funções dos módulos
import * as ui from './ui.js';
import * as storage from './storage.js';

// ---- ESTADO GLOBAL DA APLICAÇÃO ----
let state = {
    expenses: [],           // Array de objetos de despesa
    simulationData: {},     // Objeto com { initialBalance }
    currentExpenseId: null, // Guarda o ID da despesa sendo manipulada
};

// ---- FUNÇÕES DE CÁLCULO (LÓGICA DE NEGÓCIO) ----

/**
 * Calcula todas as métricas para o Card de Resumo com base no estado atual.
 * @returns {object} Um objeto com as 5 métricas calculadas.
 */
function calculateSummary() {
    const { expenses, simulationData } = state;
    const initialBalance = simulationData.initialBalance || 0;

    let pending = 0;    // A Pagar (só 'pending')
    let paid = 0;       // Já Pago (só 'paid')
    let ignored = 0;    // Ignorado/Economizado (só 'ignored' + edições)

    expenses.forEach(exp => {
        switch (exp.status) {
            case 'pending':
                pending += exp.currentValue;
                break;
            case 'paid':
                paid += exp.currentValue;
                break;
            case 'ignored':
                ignored += exp.defaultValue; 
                break;
        }

        if (exp.status !== 'ignored' && exp.currentValue < exp.defaultValue) {
            ignored += (exp.defaultValue - exp.currentValue);
        }
    });

    const balance = initialBalance - paid; // Saldo Atual
    const projection = balance - pending;  // Projeção Final

    return {
        balance,
        pending,
        projection,
        ignored,
        paid,
        initialBalance
    };
}

// ---- FUNÇÕES DE ORQUESTRAÇÃO ----

/**
 * Salva o estado atual (despesas) no storage e atualiza toda a UI.
 * Esta é a função central de atualização.
 */
function saveAndRefresh() {
    storage.saveExpenses(state.expenses);
    
    // Filtra apenas as despesas fixas para a tela de gestão
    const fixedExpenses = state.expenses
        .filter(e => !e.isTemporary)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Pede ao ui.js para desenhar as listas
    ui.updateSummaryCard(calculateSummary());
    ui.renderExpenseList(state.expenses);
    ui.renderManageList(fixedExpenses);

    console.log("UI Atualizada", state);
}

/**
 * Carrega os dados iniciais do localStorage para o 'state' e inicia a UI.
 */
function loadInitialData() {
    state.expenses = storage.getExpenses();
    state.simulationData = storage.getSimulationData();
    
    // Se não houver despesas (primeiro uso), adiciona dados de exemplo
    if (state.expenses.length === 0) {
        state.expenses = [
            { id: "1", name: "Aluguel", defaultValue: 380, currentValue: 380, status: 'pending', isTemporary: false, sortOrder: 1 },
            { id: "2", name: "Compras", defaultValue: 200, currentValue: 200, status: 'pending', isTemporary: false, sortOrder: 2 },
            { id: "3", name: "Internet", defaultValue: 120, currentValue: 120, status: 'pending', isTemporary: false, sortOrder: 3 },
            { id: "4", name: "Energia", defaultValue: 200, currentValue: 200, status: 'pending', isTemporary: false, sortOrder: 4 },
            { id: "5", name: "PicPay", defaultValue: 4260, currentValue: 4260, status: 'pending', isTemporary: false, sortOrder: 5 },
            { id: "6", name: "Nubank", defaultValue: 1660.34, currentValue: 1660.34, status: 'pending', isTemporary: false, sortOrder: 6 }
        ];
        storage.saveExpenses(state.expenses); 
    }

    if (!state.simulationData.initialBalance) {
        state.simulationData.initialBalance = 5000; // Exemplo
        storage.saveSimulationData(state.simulationData);
    }

    // Agora que o 'state' está preenchido, desenha a UI inicial
    saveAndRefresh();
}

// ---- HANDLERS DE AÇÕES DA SIMULAÇÃO (Fase 4) ----

function handleExpenseClick(event) {
    const expenseItem = event.target.closest('li[data-id]'); 
    if (!expenseItem) return; 

    const id = expenseItem.dataset.id;
    state.currentExpenseId = id; 

    const expense = state.expenses.find(e => e.id === id);
    if (!expense) return;

    ui.updateActionsModal(expense);
    ui.showModal('modal-actions');
}

function handleActionPay() {
    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        expense.status = 'paid';
        saveAndRefresh();
    }
    ui.hideModal();
    state.currentExpenseId = null;
}

function handleToggleIgnore() {
    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        if (expense.status === 'ignored') {
            expense.status = 'pending';
        } else {
            expense.status = 'ignored';
            expense.currentValue = expense.defaultValue; 
        }
        saveAndRefresh();
    }
    ui.hideModal();
    state.currentExpenseId = null;
}

function handleActionEdit() {
    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        ui.updateEditModal(expense);
        ui.hideModal();
        ui.showModal('modal-edit');
    }
}

function handleActionDelete() {
    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        document.getElementById('delete-text').textContent = `Tem certeza que deseja excluir "${expense.name}" permanentemente?`;
        ui.hideModal(); 
        ui.showModal('modal-delete');
    }
}

function handleEditSave(event) {
    event.preventDefault();
    const newValueInput = document.getElementById('edit-expense-value');
    const newValue = parseFloat(newValueInput.value);

    if (isNaN(newValue) || newValue < 0) {
        alert("Por favor, insira um valor válido.");
        return;
    }

    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        expense.currentValue = newValue;
        expense.status = 'pending'; 
        saveAndRefresh();
    }
    
    ui.hideModal();
    state.currentExpenseId = null;
}

function handleDeleteConfirm() {
    state.expenses = state.expenses.filter(e => e.id !== state.currentExpenseId);
    
    // Re-calcula a ordem após a exclusão
    state.expenses
        .filter(e => !e.isTemporary)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .forEach((e, index) => {
            e.sortOrder = index + 1;
        });

    saveAndRefresh();
    ui.hideModal();
    state.currentExpenseId = null;
}

// ---- HANDLERS DE EDIÇÃO DO CARD (Fase 4.5) ----

function handleEditInitialBalance() {
    ui.updateEditBalanceModal(state.simulationData.initialBalance);
    ui.showModal('modal-edit-balance');
}

function handleEditBalanceSave(event) {
    event.preventDefault();
    const newValueInput = document.getElementById('edit-balance-value');
    const newValue = parseFloat(newValueInput.value);

    if (isNaN(newValue) || newValue < 0) {
        alert("Por favor, insira um valor válido.");
        return;
    }

    state.simulationData.initialBalance = newValue;
    storage.saveSimulationData(state.simulationData);
    saveAndRefresh();
    ui.hideModal();
}

// ---- HANDLER DE ADIÇÃO DE DESPESA (Fase 3) ----

function handleAddExpense(event) {
    event.preventDefault(); 
    const form = event.target;
    const nameInput = document.getElementById('expense-name');
    const valueInput = document.getElementById('expense-value');
    const typeInput = document.querySelector('input[name="expense-type"]:checked');

    const name = nameInput.value.trim();
    const value = parseFloat(valueInput.value);
    const isTemporary = typeInput.value === 'temp';

    if (!name || isNaN(value) || value <= 0) {
        alert("Por favor, preencha o nome e um valor válido.");
        return;
    }

    const newExpense = {
        id: Date.now().toString(), 
        name: name,
        defaultValue: value,
        currentValue: value,
        status: 'pending',
        isTemporary: isTemporary,
        sortOrder: state.expenses.filter(e => !e.isTemporary).length + 1
    };

    state.expenses.push(newExpense);
    form.reset();
    saveAndRefresh();
    ui.showView('view-simulation');
    console.log("Nova despesa adicionada:", newExpense);
}

// ---- HANDLERS DE GESTÃO (Fase 5) ----

/**
 * Manipula o clique nos botões "Editar" (permanente) na lista de gestão.
 * @param {Event} event - O evento de clique.
 */
function handleManageEditClick(event) {
    const editButton = event.target.closest('.btn-edit-permanent');
    if (!editButton) return;

    const id = editButton.dataset.id;
    state.currentExpenseId = id;

    const expense = state.expenses.find(e => e.id === id);
    if (!expense) return;

    ui.updateEditPermanentModal(expense);
    ui.showModal('modal-edit-permanent');
}

/**
 * Salva as alterações permanentes (nome, valor padrão) de uma despesa.
 * @param {Event} event - O evento de submit do formulário.
 */
function handleEditPermanentSave(event) {
    event.preventDefault();
    const newName = document.getElementById('edit-permanent-name').value.trim();
    const newValue = parseFloat(document.getElementById('edit-permanent-value').value);

    if (!newName || isNaN(newValue) || newValue <= 0) {
        alert("Por favor, preencha um nome e valor válidos.");
        return;
    }

    const expense = state.expenses.find(e => e.id === state.currentExpenseId);
    if (expense) {
        expense.name = newName;
        expense.defaultValue = newValue;
        
        if (expense.currentValue === expense.defaultValue || expense.status !== 'pending') {
             expense.currentValue = newValue;
        }
    }

    saveAndRefresh();
    ui.hideModal();
    state.currentExpenseId = null;
}

/**
 * Inicia o fluxo de "Novo Mês".
 */
async function handleNewMonthClick() {
    if (!confirm("Tem certeza que deseja iniciar um novo mês? Isso resetará toda a simulação atual.")) {
        return;
    }

    const tempExpenses = state.expenses.filter(e => e.isTemporary);
    const expensesToKeep = [];

    // 1. Lida com despesas temporárias
    for (const expense of tempExpenses) {
        if (confirm(`Deseja tornar a despesa temporária "${expense.name}" (R$ ${expense.defaultValue}) uma despesa fixa?`)) {
            expense.isTemporary = false;
            expensesToKeep.push(expense);
        }
    }

    // 2. Adiciona as despesas fixas
    state.expenses
        .filter(e => !e.isTemporary)
        .forEach(e => expensesToKeep.push(e));

    // 3. Reseta o estado de todas as despesas mantidas
    expensesToKeep.forEach((expense, index) => {
        expense.status = 'pending';
        expense.currentValue = expense.defaultValue;
        expense.sortOrder = index + 1; // Re-indexa a ordem
    });

    state.expenses = expensesToKeep;

    // 4. Pede o novo saldo
    const newBalanceStr = prompt("Qual é o seu Saldo Inicial para este novo mês?", state.simulationData.initialBalance);
    const newBalance = parseFloat(newBalanceStr);

    if (!isNaN(newBalance) && newBalance >= 0) {
        state.simulationData.initialBalance = newBalance;
        storage.saveSimulationData(state.simulationData);
    }

    // 5. Salva e atualiza tudo
    saveAndRefresh();
    ui.showView('view-simulation');
    alert("Novo mês iniciado com sucesso!");
}

/**
 * [MUDANÇA] Inicializa a funcionalidade de Drag-and-Drop na lista de gestão.
 */
function initializeSortable() {
    const list = document.getElementById('manage-list');
    
    // ---- DEBUGGING ----
    if (!list) {
        console.error("Erro no Drag&Drop: Lista #manage-list não encontrada no DOM.");
        return;
    }
    // Verifica se a biblioteca Sortable (importada do CDN) está disponível
    if (typeof Sortable === 'undefined') {
        console.error("Erro no Drag&Drop: Biblioteca SortableJS não foi carregada. Verifique o link no index.html.");
        return;
    }
    console.log("SortableJS: Biblioteca carregada e lista #manage-list encontrada. Inicializando...");
    // -------------------

    new Sortable(list, {
        animation: 150,
        handle: '.handle', // Define o ícone como a "alça" para arrastar
        
        // [NOVO] Adiciona um atraso de 200ms apenas em dispositivos de toque.
        // Isso previne o conflito com o "scroll" da página.
        delay: 200, 
        delayOnTouchOnly: true,

        // ---- DEBUGGING ----
        onStart: () => {
            console.log("SortableJS: Arrastar INICIADO.");
        },
        // -------------------

        onEnd: (event) => {
            console.log("SortableJS: Arrastar FINALIZADO. Salvando nova ordem...");
            
            // Pega a nova ordem dos IDs a partir do DOM
            const newOrderIds = Array.from(event.target.children).map(li => li.dataset.id);

            // Atualiza o 'sortOrder' no 'state'
            newOrderIds.forEach((id, index) => {
                const expense = state.expenses.find(e => e.id === id);
                if (expense) {
                    expense.sortOrder = index + 1;
                }
            });

            // [MUDANÇA] Salva a nova ordem, MAS NÃO RE-RENDERIZA A LISTA DE GESTÃO.
            // A re-renderização (saveAndRefresh) estava quebrando a instância do Sortable.
            // O DOM já está na ordem correta, só precisamos salvar o estado.
            storage.saveExpenses(state.expenses);
            
            // Re-renderiza a lista de simulação para refletir a nova ordem
            ui.renderExpenseList(state.expenses);
            
            console.log("Nova ordem salva.");
        }
    });
}


/**
 * Função principal de inicialização da aplicação.
 */
function initializeApp() {
    // 1. Configura os listeners de navegação
    const navButtons = document.querySelectorAll(".nav-button");
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const viewId = button.dataset.view;
            ui.showView(viewId);
        });
    });

    // 2. Configura os listeners do CARD
    document.getElementById("toggle-summary").addEventListener("click", ui.toggleSummaryCard);
    document.getElementById("btn-edit-initial-balance").addEventListener("click", handleEditInitialBalance);

    // 3. Configura o listener do formulário de ADIÇÃO
    document.getElementById("form-add-expense").addEventListener("submit", handleAddExpense);

    // 4. Configura o listener da lista de SIMULAÇÃO (clique no item)
    document.getElementById("expense-list").addEventListener("click", handleExpenseClick);

    // 5. Configura o listener da lista de GESTÃO (clique no botão editar)
    document.getElementById("manage-list").addEventListener("click", handleManageEditClick);

    // 6. Configura o listener do botão "NOVO MÊS"
    document.getElementById("btn-new-month").addEventListener("click", handleNewMonthClick);

    // 7. Configura os listeners do modal de AÇÕES (Simulação)
    document.getElementById("action-pay").addEventListener("click", handleActionPay);
    document.getElementById("action-toggle-ignore").addEventListener("click", handleToggleIgnore);
    document.getElementById("action-edit").addEventListener("click", handleActionEdit);
    document.getElementById("action-delete").addEventListener("click", handleActionDelete);
    document.getElementById("action-cancel").addEventListener("click", ui.hideModal);
    
    // 8. Configura os listeners do modal de EDIÇÃO (SIMULAÇÃO)
    document.getElementById("form-edit-expense").addEventListener("submit", handleEditSave);
    document.getElementById("edit-cancel").addEventListener("click", ui.hideModal);

    // 9. Configura os listeners do modal de EXCLUSÃO
    document.getElementById("delete-confirm").addEventListener("click", handleDeleteConfirm);
    document.getElementById("delete-cancel").addEventListener("click", ui.hideModal);

    // 10. Configura os listeners do modal de EDIÇÃO DE SALDO
    document.getElementById("form-edit-balance").addEventListener("submit", handleEditBalanceSave);
    document.getElementById("edit-balance-cancel").addEventListener("click", ui.hideModal);

    // 11. Configura os listeners do modal de EDIÇÃO PERMANENTE
    document.getElementById("form-edit-permanent").addEventListener("submit", handleEditPermanentSave);
    document.getElementById("edit-permanent-cancel").addEventListener("click", ui.hideModal);

    // 12. Configura o listener do overlay (fundo escuro) para fechar modais
    document.getElementById("modal-overlay").addEventListener("click", ui.hideModal);

    // 13. Define a view inicial
    ui.showView("view-simulation");

    // 14. Carrega os dados do storage e desenha a UI inicial
    loadInitialData(); // Isso chama saveAndRefresh() que renderiza as listas

    // 15. Inicializa o Drag-and-Drop DEPOIS que a lista foi renderizada
    initializeSortable();

    console.log("Aplicativo v1.0 Inicializado.");
}

// Garante que o DOM esteja carregado antes de rodar o script
document.addEventListener("DOMContentLoaded", initializeApp);