// ========================================
// CASH VIEW - MAIN JAVASCRIPT
// ========================================

// Verificar autenticação
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

// Estado da aplicação
let appState = {
    currentUser: null,
    transactions: [],
    achievements: [],
    points: 0
};

// Conquistas disponíveis
const ACHIEVEMENTS = [
    {
        id: 'first_transaction',
        title: 'Primeiros Passos',
        description: 'Registre sua primeira transação',
        icon: '🎯',
        difficulty: 'easy',
        check: (state) => state.transactions.length >= 1
    },
    {
        id: 'first_save',
        title: 'Primeira Economia',
        description: 'Registre sua primeira receita',
        icon: '💰',
        difficulty: 'easy',
        check: (state) => state.transactions.some(t => t.type === 'income')
    },
    {
        id: 'five_transactions',
        title: 'Começando Bem',
        description: 'Registre 5 transações',
        icon: '📊',
        difficulty: 'easy',
        check: (state) => state.transactions.length >= 5
    },
    {
        id: 'positive_balance',
        title: 'No Azul',
        description: 'Mantenha saldo positivo',
        icon: '✅',
        difficulty: 'medium',
        check: (state) => calculateBalance(state.transactions) > 0
    },
    {
        id: 'ten_transactions',
        title: 'Dedicado',
        description: 'Registre 10 transações',
        icon: '🏅',
        difficulty: 'medium',
        check: (state) => state.transactions.length >= 10
    },
    {
        id: 'reflection_master',
        title: 'Mestre da Reflexão',
        description: 'Adie 3 gastos grandes',
        icon: '🧠',
        difficulty: 'medium',
        check: (state) => (state.deferrals || 0) >= 3
    },
    {
        id: 'twenty_transactions',
        title: 'Persistente',
        description: 'Registre 20 transações',
        icon: '💪',
        difficulty: 'hard',
        check: (state) => state.transactions.length >= 20
    },
    {
        id: 'big_saver',
        title: 'Grande Poupador',
        description: 'Acumule R$ 1.000 em receitas',
        icon: '💎',
        difficulty: 'hard',
        check: (state) => {
            const totalIncome = state.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            return totalIncome >= 1000;
        }
    },
    {
        id: 'balanced',
        title: 'Equilibrado',
        description: 'Mantenha saldo acima de R$ 500',
        icon: '⚖️',
        difficulty: 'hard',
        check: (state) => calculateBalance(state.transactions) >= 500
    }
];

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    appState.currentUser = checkAuth();
    if (!appState.currentUser) return;
    
    loadUserData();
    setupEventListeners();
    updateDashboard();
    renderAchievements();
});

// Carregar dados do usuário
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem(`userData_${appState.currentUser.email}`)) || {};
    appState.transactions = userData.transactions || [];
    appState.achievements = userData.achievements || [];
    appState.points = userData.points || 0;
    appState.deferrals = userData.deferrals || 0;
    
    document.getElementById('userName').textContent = appState.currentUser.name;
}

// Salvar dados do usuário
function saveUserData() {
    const userData = {
        transactions: appState.transactions,
        achievements: appState.achievements,
        points: appState.points,
        deferrals: appState.deferrals
    };
    localStorage.setItem(`userData_${appState.currentUser.email}`, JSON.stringify(userData));
}

// Calcular saldo
function calculateBalance(transactions) {
    return transactions.reduce((balance, t) => {
        return t.type === 'income' ? balance + t.amount : balance - t.amount;
    }, 0);
}

// Atualizar dashboard
function updateDashboard() {
    updateBalance();
    updateTransactionList();
    updateCharts();
    checkAchievements();
}

// Atualizar saldo
function updateBalance() {
    const income = appState.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = appState.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    document.getElementById('currentBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expense);
}

// Atualizar lista de transações
function updateTransactionList() {
    const list = document.getElementById('transactionList');
    
    if (appState.transactions.length === 0) {
        list.innerHTML = '<div class="empty-state">Nenhuma transação registrada ainda.</div>';
        return;
    }
    
    const sortedTransactions = [...appState.transactions].sort((a, b) => b.date - a.date);
    
    list.innerHTML = sortedTransactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${t.description}</div>
                <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
            </div>
        </div>
    `).join('');
}

// Configurar event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // Form de transação
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Form de juros
    document.getElementById('interestForm').addEventListener('submit', handleInterestCalculation);
    
    // Exportar dados
    document.getElementById('btnExport').addEventListener('click', exportData);
    
    // Modal de reflexão
    document.getElementById('btnDefer').addEventListener('click', handleDeferExpense);
    document.getElementById('btnConfirm').addEventListener('click', handleConfirmExpense);
}

// Variável temporária para transação pendente
let pendingTransaction = null;

// Manipular submissão de transação
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    
    // Se for despesa acima de R$ 100, mostrar modal de reflexão
    if (type === 'expense' && amount >= 100) {
        pendingTransaction = { amount, description, type };
        showReflectionModal(amount);
        return;
    }
    
    // Adicionar transação diretamente
    addTransaction({ amount, description, type });
    e.target.reset();
}

// Mostrar modal de reflexão
function showReflectionModal(amount) {
    document.getElementById('reflectionAmount').textContent = formatCurrency(amount);
    document.getElementById('reflectionModal').classList.add('show');
}

// Esconder modal de reflexão
function hideReflectionModal() {
    document.getElementById('reflectionModal').classList.remove('show');
}

// Adiar gasto
function handleDeferExpense() {
    appState.points += 10;
    appState.deferrals = (appState.deferrals || 0) + 1;
    saveUserData();
    checkAchievements();
    
    showToast('🎉 Ótima decisão! +10 pontos por adiar o gasto');
    hideReflectionModal();
    document.getElementById('transactionForm').reset();
    pendingTransaction = null;
}

// Confirmar gasto
function handleConfirmExpense() {
    if (pendingTransaction) {
        addTransaction(pendingTransaction);
        pendingTransaction = null;
    }
    hideReflectionModal();
    document.getElementById('transactionForm').reset();
}

// Adicionar transação
function addTransaction({ amount, description, type }) {
    const transaction = {
        id: Date.now(),
        amount,
        description,
        type,
        date: Date.now()
    };
    
    appState.transactions.push(transaction);
    saveUserData();
    updateDashboard();
    
    showToast(`✓ Transação adicionada: ${description}`);
}

// Calcular juros
function handleInterestCalculation(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const installments = parseInt(document.getElementById('installments').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100;
    
    // Cálculo de juros compostos
    const installmentValue = (amount * rate * Math.pow(1 + rate, installments)) / 
                            (Math.pow(1 + rate, installments) - 1);
    const totalWithInterest = installmentValue * installments;
    const totalInterest = totalWithInterest - amount;
    
    // Atualizar resultados
    document.getElementById('cashValue').textContent = formatCurrency(amount);
    document.getElementById('totalWithInterest').textContent = formatCurrency(totalWithInterest);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('installmentValue').textContent = formatCurrency(installmentValue);
    
    // Mostrar resultados
    document.getElementById('interestResults').classList.remove('hidden');
    
    // Atualizar gráfico
    updateInterestChart(amount, totalWithInterest);
}

// Renderizar conquistas
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    
    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const isUnlocked = appState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${isUnlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <span class="achievement-difficulty difficulty-${achievement.difficulty}">
                    ${achievement.difficulty === 'easy' ? '🥉 Simples' : 
                      achievement.difficulty === 'medium' ? '🥈 Média' : '🥇 Difícil'}
                </span>
            </div>
        `;
    }).join('');
}

// Verificar conquistas
function checkAchievements() {
    let newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!appState.achievements.includes(achievement.id) && achievement.check(appState)) {
            appState.achievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    });
    
    if (newAchievements.length > 0) {
        saveUserData();
        renderAchievements();
        
        newAchievements.forEach(achievement => {
            showToast(`🎉 Conquista desbloqueada: ${achievement.title}!`);
        });
    }
}

// Exportar dados
function exportData() {
    const data = {
        user: appState.currentUser.name,
        exportDate: new Date().toISOString(),
        transactions: appState.transactions,
        achievements: appState.achievements.map(id => {
            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            return achievement ? achievement.title : id;
        }),
        points: appState.points,
        balance: calculateBalance(appState.transactions)
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cashview_export_${Date.now()}.json`;
    link.click();
    
    showToast('📊 Dados exportados com sucesso!');
}

// Mostrar toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatar data
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}