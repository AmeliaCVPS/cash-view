// ========================================
// CASH VIEW - MAIN.JS
// ========================================

// Config de milhas
const MILES_RATE = 0.05; // 1 milha = R$ 0.05
const FUND_ANNUAL_RATE = 0.10; // 10% a.a.
const MIN_INVESTMENT = 10; // R$ 10

// Estado da aplicação
let appState = {
    currentUser: null,
    transactions: [],
    achievements: [],
    points: 0,
    miles: 0,
    fundBalance: 0,
    fundHistory: [],
    totalMilesConverted: 0,
    monthlyReturn: 0,
    lastFundUpdate: Date.now()
};

// Conquistas
const ACHIEVEMENTS = [
    { id: 'first_transaction', title: 'Primeiros Passos', description: 'Primeira transação', icon: '🎯', check: s => s.transactions.length >= 1 },
    { id: 'first_save', title: 'Primeira Economia', description: 'Primeira receita', icon: '💰', check: s => s.transactions.some(t => t.type === 'income') },
    { id: 'five_transactions', title: 'Começando Bem', description: '5 transações', icon: '📊', check: s => s.transactions.length >= 5 },
    { id: 'positive_balance', title: 'No Azul', description: 'Saldo positivo', icon: '✅', check: s => calculateBalance(s.transactions) > 0 },
    { id: 'investor_100', title: 'Investidor Iniciante', description: 'R$ 100 investidos', icon: '💎', check: s => s.fundBalance >= 100 },
    { id: 'investor_500', title: 'Investidor Dedicado', description: 'R$ 500 investidos', icon: '👑', check: s => s.fundBalance >= 500 },
    { id: 'miles_master', title: 'Mestre das Milhas', description: '1000 milhas convertidas', icon: '✈️', check: s => s.totalMilesConverted >= 1000 }
];

// Verificar autenticação
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser && !window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

// Carregar dados
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem(`userData_${appState.currentUser.email}`)) || {};
    appState.transactions = userData.transactions || [];
    appState.achievements = userData.achievements || [];
    appState.points = userData.points || 0;
    appState.miles = userData.miles || 0;
    appState.fundBalance = userData.fundBalance || 0;
    appState.fundHistory = userData.fundHistory || [];
    appState.totalMilesConverted = userData.totalMilesConverted || 0;
    appState.monthlyReturn = userData.monthlyReturn || 0;
    appState.lastFundUpdate = userData.lastFundUpdate || Date.now();
    
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = appState.currentUser.name;
    }
    
    updateMilesDisplay();
    checkMonthlyReturn();
}

// Salvar dados
function saveUserData() {
    const userData = {
        transactions: appState.transactions,
        achievements: appState.achievements,
        points: appState.points,
        miles: appState.miles,
        fundBalance: appState.fundBalance,
        fundHistory: appState.fundHistory,
        totalMilesConverted: appState.totalMilesConverted,
        monthlyReturn: appState.monthlyReturn,
        lastFundUpdate: appState.lastFundUpdate
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
    updateFundPanel();
    updateMilesDisplay();
    updateCharts();
    checkAchievements();
}

// Atualizar saldo
function updateBalance() {
    const income = appState.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = appState.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    
    if (document.getElementById('currentBalance')) {
        document.getElementById('currentBalance').textContent = formatCurrency(balance);
        document.getElementById('totalIncome').textContent = formatCurrency(income);
        document.getElementById('totalExpense').textContent = formatCurrency(expense);
    }
}

// Atualizar lista de transações
function updateTransactionList() {
    const list = document.getElementById('transactionList');
    if (!list) return;
    
    if (appState.transactions.length === 0) {
        list.innerHTML = '<div class="empty-state">Nenhuma transação registrada ainda.</div>';
        return;
    }
    
    const sorted = [...appState.transactions].sort((a, b) => b.date - a.date);
    list.innerHTML = sorted.map(t => `
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
    
    // Bonificar milhas
    addMiles(1, 'Transação registrada');
    
    saveUserData();
    updateDashboard();
    showToast(`✓ Transação adicionada: ${description}`);
}

// Adicionar milhas
function addMiles(miles, reason = 'Boa conduta financeira') {
    appState.miles += miles;
    saveUserData();
    updateMilesDisplay();
    showToast(`✈️ +${miles} milhas! ${reason}`);
}

// Atualizar display de milhas
function updateMilesDisplay() {
    const milesEl = document.getElementById('userMiles');
    const countEl = document.getElementById('milesCount');
    const valueEl = document.getElementById('milesValue');
    const btnConvert = document.getElementById('btnConvertMiles');
    
    const milesValue = appState.miles * MILES_RATE;
    
    if (milesEl) milesEl.textContent = `✈️ ${appState.miles} milhas`;
    if (countEl) countEl.textContent = `${appState.miles} milhas`;
    if (valueEl) valueEl.textContent = `≈ ${formatCurrency(milesValue)}`;
    
    if (btnConvert) {
        btnConvert.disabled = milesValue < MIN_INVESTMENT;
        btnConvert.style.opacity = milesValue < MIN_INVESTMENT ? '0.5' : '1';
    }
}

// Atualizar painel do fundo
function updateFundPanel() {
    const balanceEl = document.getElementById('fundBalance');
    const returnEl = document.getElementById('monthlyReturn');
    const milesEl = document.getElementById('totalMilesConverted');
    
    if (balanceEl) balanceEl.textContent = formatCurrency(appState.fundBalance);
    if (returnEl) returnEl.textContent = '+' + formatCurrency(appState.monthlyReturn);
    if (milesEl) milesEl.textContent = `✈️ ${appState.totalMilesConverted}`;
    
    if (appState.fundBalance > 0) {
        renderFundChart();
    }
}

// Renderizar conquistas
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const isUnlocked = appState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${isUnlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
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
        newAchievements.forEach(a => showToast(`🎉 Conquista: ${a.title}!`));
    }
}

// Verificar rendimento mensal
function checkMonthlyReturn() {
    const now = Date.now();
    const lastUpdate = new Date(appState.lastFundUpdate);
    const current = new Date(now);
    
    const monthsPassed = (current.getMonth() - lastUpdate.getMonth()) + 
                        (12 * (current.getFullYear() - lastUpdate.getFullYear()));
    
    if (monthsPassed >= 1 && appState.fundBalance > 0) {
        applyMonthlyReturn();
    }
}

// Aplicar rendimento mensal
function applyMonthlyReturn() {
    const monthlyReturn = appState.fundBalance * (FUND_ANNUAL_RATE / 12);
    appState.monthlyReturn = monthlyReturn;
    appState.fundBalance += monthlyReturn;
    appState.lastFundUpdate = Date.now();
    
    appState.fundHistory.push({
        date: Date.now(),
        type: 'return',
        value: monthlyReturn,
        balance: appState.fundBalance
    });
    
    saveUserData();
    updateFundPanel();
    showToast(`💰 Rendimento mensal: +${formatCurrency(monthlyReturn)}`);
}

// Modal de conversão de milhas
function mostrarModalConversaoMilhas() {
    const milesValue = appState.miles * MILES_RATE;
    
    if (appState.miles === 0) {
        showToast('❌ Você não possui milhas para converter');
        return;
    }
    
    if (milesValue < MIN_INVESTMENT) {
        showToast(`⚠️ Acumule mais ${Math.ceil((MIN_INVESTMENT - milesValue) / MILES_RATE)} milhas`);
        return;
    }
    
    const modal = document.getElementById('investmentModal');
    modal.querySelector('.modal-miles').textContent = appState.miles;
    modal.querySelector('.modal-value').textContent = formatCurrency(milesValue);
    modal.classList.add('show');
}

function fecharModalInvestimento() {
    document.getElementById('investmentModal').classList.remove('show');
}

function confirmarConversao() {
    const milesValue = appState.miles * MILES_RATE;
    
    appState.fundBalance += milesValue;
    appState.totalMilesConverted += appState.miles;
    appState.miles = 0;
    
    appState.fundHistory.push({
        date: Date.now(),
        type: 'deposit',
        value: milesValue,
        balance: appState.fundBalance
    });
    
    saveUserData();
    updateDashboard();
    fecharModalInvestimento();
    
    showToast(`✅ R$ ${milesValue.toFixed(2)} investidos com sucesso!`);
    checkAchievements();
}

// Modal de projeção
function mostrarProjecao() {
    const modal = document.getElementById('projectionModal');
    const monthlyRate = FUND_ANNUAL_RATE / 12;
    
    const proj3m = appState.fundBalance * Math.pow(1 + monthlyRate, 3);
    const proj6m = appState.fundBalance * Math.pow(1 + monthlyRate, 6);
    const proj1y = appState.fundBalance * Math.pow(1 + monthlyRate, 12);
    
    modal.querySelector('.proj-3m').textContent = formatCurrency(proj3m);
    modal.querySelector('.proj-6m').textContent = formatCurrency(proj6m);
    modal.querySelector('.proj-1y').textContent = formatCurrency(proj1y);
    
    modal.classList.add('show');
    
    setTimeout(() => renderProjectionChart(proj3m, proj6m, proj1y), 100);
}

function fecharModalProjecao() {
    document.getElementById('projectionModal').classList.remove('show');
}

// Converter milhas em investimento (função global)
function converterMilhasEmInvestimento() {
    mostrarModalConversaoMilhas();
}

// Exportar dados
function exportData() {
    const data = {
        user: appState.currentUser.name,
        exportDate: new Date().toISOString(),
        transactions: appState.transactions,
        fundBalance: appState.fundBalance,
        miles: appState.miles,
        achievements: appState.achievements
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cashview_export_${Date.now()}.json`;
    link.click();
    
    showToast('📊 Dados exportados!');
}

// Mostrar toast
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
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

// Setup event listeners
function setupEventListeners() {
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
    
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            const description = document.getElementById('description').value;
            const type = document.getElementById('type').value;
            
            if (type === 'expense' && amount >= 100) {
                showReflectionModal(amount, description, type);
            } else {
                addTransaction({ amount, description, type });
                e.target.reset();
            }
        });
    }
    
    const interestForm = document.getElementById('interestForm');
    if (interestForm) {
        interestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateInterest();
            addMiles(5, 'Usou simulador de juros');
        });
    }
    
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', exportData);
    }
}

// Modal de reflexão
let pendingTransaction = null;

function showReflectionModal(amount, description, type) {
    pendingTransaction = { amount, description, type };
    const modal = document.getElementById('reflectionModal');
    modal.querySelector('#reflectionAmount').textContent = formatCurrency(amount);
    modal.classList.add('show');
    
    document.getElementById('btnDefer').onclick = () => {
        addMiles(10, 'Gasto adiado com reflexão');
        modal.classList.remove('show');
        document.getElementById('transactionForm').reset();
        pendingTransaction = null;
    };
    
    document.getElementById('btnConfirm').onclick = () => {
        if (pendingTransaction) {
            addTransaction(pendingTransaction);
            document.getElementById('transactionForm').reset();
        }
        modal.classList.remove('show');
        pendingTransaction = null;
    };
}

// Calcular juros
function calculateInterest() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const installments = parseInt(document.getElementById('installments').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100;
    
    const installmentValue = (amount * rate * Math.pow(1 + rate, installments)) / 
                            (Math.pow(1 + rate, installments) - 1);
    const totalWithInterest = installmentValue * installments;
    const totalInterest = totalWithInterest - amount;
    
    document.getElementById('cashValue').textContent = formatCurrency(amount);
    document.getElementById('totalWithInterest').textContent = formatCurrency(totalWithInterest);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('installmentValue').textContent = formatCurrency(installmentValue);
    
    document.getElementById('interestResults').classList.remove('hidden');
    renderInterestChart(amount, totalWithInterest);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    appState.currentUser = checkAuth();
    if (!appState.currentUser) return;
    
    loadUserData();
    setupEventListeners();
    updateDashboard();
    renderAchievements();
});
