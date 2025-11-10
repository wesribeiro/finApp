// Chaves de prefixo para o localStorage, para evitar conflitos
const EXPENSES_KEY = 'fin_expenses';
const SIMULATION_KEY = 'fin_simulation_data';

/**
 * Busca todas as despesas salvas no localStorage.
 * @returns {Array} Um array de objetos de despesa, ou um array vazio.
 */
export function getExpenses() {
    try {
        const expensesJSON = localStorage.getItem(EXPENSES_KEY);
        return expensesJSON ? JSON.parse(expensesJSON) : [];
    } catch (e) {
        console.error("Erro ao buscar despesas do localStorage:", e);
        return [];
    }
}

/**
 * Salva um array completo de despesas no localStorage.
 * @param {Array} expensesArray - O array de objetos de despesa a ser salvo.
 */
export function saveExpenses(expensesArray) {
    try {
        const expensesJSON = JSON.stringify(expensesArray);
        localStorage.setItem(EXPENSES_KEY, expensesJSON);
    } catch (e) {
        console.error("Erro ao salvar despesas no localStorage:", e);
    }
}

/**
 * Busca os dados da simulação atual (ex: saldo inicial).
 * @returns {Object} Um objeto com dados da simulação, ou um objeto com valor padrão.
 */
export function getSimulationData() {
    try {
        const simDataJSON = localStorage.getItem(SIMULATION_KEY);
        // Retorna o objeto salvo ou um padrão com saldo inicial 0
        return simDataJSON ? JSON.parse(simDataJSON) : { initialBalance: 0 };
    } catch (e) {
        console.error("Erro ao buscar dados da simulação:", e);
        return { initialBalance: 0 }; // Retorna um padrão seguro em caso de erro
    }
}

/**
 * Salva um objeto com os dados da simulação atual.
 * @param {Object} simulationData - O objeto (ex: { initialBalance: 5000 }) a ser salvo.
 */
export function saveSimulationData(simulationData) {
    try {
        const simDataJSON = JSON.stringify(simulationData);
        localStorage.setItem(SIMULATION_KEY, simDataJSON);
    } catch (e) {
        console.error("Erro ao salvar dados da simulação:", e);
    }
}