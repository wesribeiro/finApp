// ==== SELETORES DO DOM ====

// Controles de Navegação
const views = document.querySelectorAll("main");
const navButtons = document.querySelectorAll(".nav-button");

// Elementos do Card de Resumo
const summaryCard = document.getElementById("summary-card");
const summaryDetails = document.getElementById("summary-details");
const toggleSummaryIcon = document.getElementById("toggle-summary-icon");
const mainContent = document.getElementById("main-content");

// Campos de dados do Card
const summaryBalanceEl = document.getElementById("summary-balance");
const summaryPendingEl = document.getElementById("summary-pending");
const summaryProjectionEl = document.getElementById("summary-projection");
const summaryIgnoredEl = document.getElementById("summary-ignored");
const summaryPaidEl = document.getElementById("summary-paid");
const summaryInitialEl = document.getElementById("summary-initial");

// Container da Lista de Despesas
const expenseListEl = document.getElementById("expense-list");
const manageListEl = document.getElementById("manage-list"); // Lista da tela de Gestão

// Seletores de Modais
const modalOverlay = document.getElementById("modal-overlay");
const modalActions = document.getElementById("modal-actions");
const modalEdit = document.getElementById("modal-edit");
const modalDelete = document.getElementById("modal-delete");
const modalEditBalance = document.getElementById("modal-edit-balance");
const modalEditPermanent = document.getElementById("modal-edit-permanent"); 

const allModals = [modalActions, modalEdit, modalDelete, modalEditBalance, modalEditPermanent];

// ==== FORMATAÇÃO ====

/**
 * Formata um número para o padrão de moeda BRL (R$).
 * @param {number} value - O número a ser formatado.
 * @returns {string} - O valor formatado como R$ 1.234,56.
 */
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ==== NAVEGAÇÃO ====

/**
 * Controla a visibilidade das telas principais (views).
 * @param {string} viewId - O ID da view que deve ser mostrada (ex: 'view-simulation').
 */
export function showView(viewId) {
    views.forEach(view => {
        view.classList.add("hidden");
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove("hidden");
    }

    navButtons.forEach(button => {
        if (button.dataset.view === viewId) {
            button.classList.remove("text-slate-500");
            button.classList.add("text-indigo-600");
        } else {
            button.classList.remove("text-indigo-600");
            button.classList.add("text-slate-500");
        }
    });
}

// ==== CARD DE RESUMO ====

/**
 * Alterna a visibilidade dos detalhes do card de resumo.
 */
export function toggleSummaryCard() {
    summaryDetails.classList.toggle("hidden");
    
    setTimeout(() => {
        const headerHeight = summaryCard.offsetHeight;
        mainContent.style.paddingTop = `${headerHeight + 16}px`;
    }, 50); 

    toggleSummaryIcon.classList.toggle("rotate-180");
}

/**
 * Atualiza todos os valores no Card de Resumo.
 * @param {object} summaryData - Um objeto contendo as 5 métricas calculadas.
 */
export function updateSummaryCard(summaryData) {
    summaryBalanceEl.textContent = formatCurrency(summaryData.balance);
    summaryPendingEl.textContent = formatCurrency(summaryData.pending);
    summaryProjectionEl.textContent = formatCurrency(summaryData.projection);
    summaryIgnoredEl.textContent = formatCurrency(summaryData.ignored);
    summaryPaidEl.textContent = formatCurrency(summaryData.paid);
    summaryInitialEl.textContent = formatCurrency(summaryData.initialBalance);

    setTimeout(() => {
        const headerHeight = summaryCard.offsetHeight;
        mainContent.style.paddingTop = `${headerHeight + 16}px`;
    }, 50);
}

// ==== LISTA DE DESPESAS (SIMULAÇÃO) ====

/**
 * Renderiza (desenha) a lista completa de despesas na tela.
 * @param {Array} expenses - O array de objetos de despesa.
 */
export function renderExpenseList(expenses) {
    expenseListEl.innerHTML = '';

    if (expenses.length === 0) {
        expenseListEl.innerHTML = `
            <li class="p-4 bg-white rounded-lg shadow-sm text-slate-500 text-center">
                Nenhuma despesa encontrada. Adicione uma na aba '+'!
            </li>`;
        return;
    }

    const paidExpenses = expenses.filter(e => e.status === 'paid');
    const otherExpenses = expenses.filter(e => e.status !== 'paid');

    otherExpenses.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    otherExpenses.forEach(expense => {
        expenseListEl.appendChild(createExpenseItemElement(expense));
    });

    paidExpenses.forEach(expense => {
        expenseListEl.appendChild(createExpenseItemElement(expense));
    });
}

/**
 * Cria um elemento <li> para uma única despesa (tela de simulação).
 * @param {object} expense - O objeto de despesa.
 * @returns {HTMLLIElement} O elemento <li> pronto para ser adicionado ao DOM.
 */
function createExpenseItemElement(expense) {
    const li = document.createElement("li");
    
    li.className = "p-4 bg-white rounded-lg shadow-sm flex justify-between items-center transition-all cursor-pointer hover:shadow-lg";
    li.dataset.id = expense.id; 

    let nameDisplay = expense.name;
    let valueDisplay = formatCurrency(expense.currentValue);
    
    switch (expense.status) {
        case 'paid':
            li.classList.add("bg-green-100", "opacity-80");
            nameDisplay = `<span class="text-green-700 font-medium">(Pago)</span> ${expense.name}`;
            break;
        case 'ignored':
            li.classList.add("bg-slate-50", "opacity-60", "line-through");
            nameDisplay = `${expense.name}`; 
            valueDisplay = `${formatCurrency(expense.currentValue)}`;
            break;
    }

    if (expense.status !== 'ignored' && expense.currentValue !== expense.defaultValue) {
        valueDisplay = `
            <span class="line-through text-slate-400 text-sm">${formatCurrency(expense.defaultValue)}</span>
            <span class="font-bold text-orange-600">${formatCurrency(expense.currentValue)}</span>
        `;
    }

    li.innerHTML = `
        <div class="flex-1 min-w-0">
            <p class="text-base font-semibold text-slate-800 truncate">${nameDisplay}</p>
        </div>
        <div class="text-right ml-2 flex flex-col items-end">
            ${valueDisplay}
        </div>
    `;
    
    return li;
}

// ==== LISTA DE GESTÃO ====

/**
 * Renderiza a lista de despesas fixas na tela de Gestão.
 * @param {Array} fixedExpenses - Array de despesas com isTemporary: false
 */
export function renderManageList(fixedExpenses) {
    manageListEl.innerHTML = '';
     if (fixedExpenses.length === 0) {
        manageListEl.innerHTML = `
            <li class="p-4 bg-white rounded-lg shadow-sm text-slate-500 text-center">
                Nenhuma despesa fixa encontrada.
            </li>`;
        return;
    }

    // Ordena pela ordem definida
    fixedExpenses.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    fixedExpenses.forEach(expense => {
        manageListEl.appendChild(createManageItemElement(expense));
    });
}

/**
 * Cria um elemento <li> para a tela de Gestão.
 * @param {object} expense - O objeto de despesa.
 * @returns {HTMLLIElement} O elemento <li>.
 */
function createManageItemElement(expense) {
    const li = document.createElement("li");
    
    li.dataset.id = expense.id;
    // Adiciona 'select-none' para o item inteiro
    li.className = "p-4 bg-white rounded-lg shadow-sm flex justify-between items-center select-none";

    li.innerHTML = `
        <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 mr-3 cursor-move handle touch-action-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <div>
                <p class="text-base font-semibold text-slate-800">${expense.name}</p>
                <p class="text-sm text-slate-500">${formatCurrency(expense.defaultValue)} (Padrão)</p>
            </div>
        </div>
        <button data-id="${expense.id}" class="btn-edit-permanent p-2 text-slate-500 hover:text-indigo-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.829-2.828z" />
            </svg>
        </button>
    `;
    
    return li;
}


// ==== CONTROLES DE MODAL ====

/**
 * Exibe um modal específico e o overlay.
 * @param {string} modalId - O ID do modal a ser exibido (ex: 'modal-actions').
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
        
        if (modalId === 'modal-actions') {
            void modal.offsetWidth; 
            modal.classList.remove("translate-y-full");
        }
    }
}

/**
 * Oculta todos os modais abertos e o overlay.
 */
export function hideModal() {
    modalOverlay.classList.add("hidden");

    allModals.forEach(modal => {
        modal.classList.add("hidden");
        
        if (modal.id === 'modal-actions') {
            modal.classList.add("translate-y-full");
        }
    });
}

// ==== FUNÇÕES DE ATUALIZAÇÃO DE MODAL ====

/**
 * Atualiza o modal de Ações com base no status da despesa.
 * @param {object} expense - O objeto da despesa selecionada.
 */
export function updateActionsModal(expense) {
    document.getElementById('actions-title').textContent = expense.name;

    const toggleIgnoreButton = document.getElementById('action-toggle-ignore');
    if (expense.status === 'ignored') {
        toggleIgnoreButton.textContent = "Reativar Despesa";
        toggleIgnoreButton.classList.remove("bg-gray-500");
        toggleIgnoreButton.classList.add("bg-blue-500");
    } else {
        toggleIgnoreButton.textContent = "Ignorar este mês";
        toggleIgnoreButton.classList.remove("bg-blue-500");
        toggleIgnoreButton.classList.add("bg-gray-500");
    }
}

/**
 * Preenche o modal de Edição (Simulação) com os dados da despesa.
 * @param {object} expense - O objeto da despesa selecionada.
 */
export function updateEditModal(expense) {
    document.getElementById('edit-title').textContent = `Editar ${expense.name} (Simulação)`;
    
    const defaultValueEl = document.getElementById('edit-default-value');
    
    if (expense.currentValue !== expense.defaultValue) {
        defaultValueEl.innerHTML = `
            <span class="line-through text-slate-400">Padrão: ${formatCurrency(expense.defaultValue)}</span>
            <span class="font-bold text-orange-600 ml-2">Atual: ${formatCurrency(expense.currentValue)}</span>
        `;
    } else {
        defaultValueEl.innerHTML = `Padrão: ${formatCurrency(expense.defaultValue)}`;
    }

    document.getElementById('edit-expense-value').value = expense.currentValue;
}

/**
 * Preenche o modal de Edição de Saldo com o valor atual.
 * @param {number} currentBalance - O saldo inicial atual.
 */
export function updateEditBalanceModal(currentBalance) {
    document.getElementById('edit-balance-value').value = currentBalance;
}

/**
 * Preenche o modal de Edição Permanente com os dados da despesa.
 * @param {object} expense - O objeto da despesa selecionada.
 */
export function updateEditPermanentModal(expense) {
    document.getElementById('edit-permanent-name').value = expense.name;
    document.getElementById('edit-permanent-value').value = expense.defaultValue;
}