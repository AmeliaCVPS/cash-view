// ========================================
// CASH VIEW - CHARTS
// ========================================

let dailyChart = null;
let monthlyChart = null;
let interestChart = null;

// Configuração padrão dos gráficos
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: '#f1f5f9',
                font: {
                    family: 'Inter'
                }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                color: '#94a3b8',
                callback: function(value) {
                    return 'R$ ' + value.toLocaleString('pt-BR');
                }
            },
            grid: {
                color: 'rgba(148, 163, 184, 0.1)'
            }
        },
        x: {
            ticks: {
                color: '#94a3b8'
            },
            grid: {
                color: 'rgba(148, 163, 184, 0.1)'
            }
        }
    }
};

// Atualizar todos os gráficos
function updateCharts() {
    updateDailyChart();
    updateMonthlyChart();
}

// Atualizar gráfico diário
function updateDailyChart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calcular gastos de hoje e ontem
    const todayExpenses = appState.transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= today)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const yesterdayExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= yesterday && date < today;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Atualizar ou criar gráfico
    const ctx = document.getElementById('dailyChart').getContext('2d');
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ontem', 'Hoje'],
            datasets: [{
                label: 'Gastos (R$)',
                data: [yesterdayExpenses, todayExpenses],
                backgroundColor: [
                    'rgba(148, 163, 184, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    '#94a3b8',
                    '#10b981'
                ],
                borderWidth: 2
            }]
        },
        options: chartDefaults
    });
    
    // Atualizar texto de comparação
    const comparisonText = document.getElementById('dailyComparison');
    if (yesterdayExpenses === 0 && todayExpenses === 0) {
        comparisonText.textContent = 'Sem gastos registrados ainda.';
        comparisonText.style.color = '#94a3b8';
    } else if (yesterdayExpenses === 0) {
        comparisonText.textContent = `Hoje você gastou R$ ${todayExpenses.toFixed(2)}`;
        comparisonText.style.color = '#94a3b8';
    } else {
        const difference = ((todayExpenses - yesterdayExpenses) / yesterdayExpenses * 100);
        if (difference < 0) {
            comparisonText.textContent = `Hoje você gastou ${Math.abs(difference).toFixed(0)}% menos que ontem 👏`;
            comparisonText.style.color = '#10b981';
        } else if (difference > 0) {
            comparisonText.textContent = `Hoje você gastou ${difference.toFixed(0)}% mais que ontem ⚠️`;
            comparisonText.style.color = '#f59e0b';
        } else {
            comparisonText.textContent = 'Gastos iguais aos de ontem';
            comparisonText.style.color = '#94a3b8';
        }
    }
}

// Atualizar gráfico mensal
function updateMonthlyChart() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Primeiro dia do mês atual
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    
    // Primeiro dia do mês anterior
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    // Calcular gastos do mês atual
    const currentMonthExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= currentMonthStart;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calcular gastos do mês anterior
    const lastMonthExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Atualizar ou criar gráfico
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const lastMonthName = monthNames[currentMonth - 1] || 'Mês Anterior';
    const currentMonthName = monthNames[currentMonth];
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [lastMonthName, currentMonthName],
            datasets: [{
                label: 'Gastos Mensais (R$)',
                data: [lastMonthExpenses, currentMonthExpenses],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: chartDefaults
    });
    
    // Atualizar texto de comparação
    const comparisonText = document.getElementById('monthlyComparison');
    if (lastMonthExpenses === 0 && currentMonthExpenses === 0) {
        comparisonText.textContent = 'Sem gastos registrados ainda.';
        comparisonText.style.color = '#94a3b8';
    } else if (lastMonthExpenses === 0) {
        comparisonText.textContent = `Este mês você gastou R$ ${currentMonthExpenses.toFixed(2)}`;
        comparisonText.style.color = '#94a3b8';
    } else {
        const percentage = (currentMonthExpenses / lastMonthExpenses * 100).toFixed(0);
        if (percentage < 100) {
            comparisonText.textContent = `Este mês representa ${percentage}% dos gastos do mês passado 👍`;
            comparisonText.style.color = '#10b981';
        } else if (percentage > 100) {
            comparisonText.textContent = `Este mês já ultrapassou ${percentage}% dos gastos do mês passado ⚠️`;
            comparisonText.style.color = '#ef4444';
        } else {
            comparisonText.textContent = `Gastos equivalentes ao mês passado`;
            comparisonText.style.color = '#94a3b8';
        }
    }
}

// Atualizar gráfico de juros
function updateInterestChart(cashValue, totalWithInterest) {
    const ctx = document.getElementById('interestChart').getContext('2d');
    
    if (interestChart) {
        interestChart.destroy();
    }
    
    const interestAmount = totalWithInterest - cashValue;
    
    interestChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Valor Principal', 'Juros'],
            datasets: [{
                data: [cashValue, interestAmount],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderColor: [
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            family: 'Inter',
                            size: 14
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': R$ ' + value.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            }
        }
    });
}