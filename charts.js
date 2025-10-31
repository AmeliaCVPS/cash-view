// ========================================
// CASH VIEW - CHARTS.JS
// ========================================

let dailyChart = null;
let monthlyChart = null;
let interestChart = null;
let fundChart = null;
let projectionChart = null;

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: '#f1f5f9',
                font: { family: 'Inter' }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                color: '#94a3b8',
                callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
            },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
        }
    }
};

// Atualizar todos os gráficos
function updateCharts() {
    updateDailyChart();
    updateMonthlyChart();
}

// Gráfico diário
function updateDailyChart() {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayExpenses = appState.transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= today)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const yesterdayExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= yesterday && date < today;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    if (dailyChart) dailyChart.destroy();
    
    dailyChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Ontem', 'Hoje'],
            datasets: [{
                label: 'Gastos (R$)',
                data: [yesterdayExpenses, todayExpenses],
                backgroundColor: ['rgba(148, 163, 184, 0.7)', 'rgba(16, 185, 129, 0.7)'],
                borderColor: ['#94a3b8', '#10b981'],
                borderWidth: 2
            }]
        },
        options: chartDefaults
    });
    
    const comparisonText = document.getElementById('dailyComparison');
    if (comparisonText) {
        if (yesterdayExpenses === 0 && todayExpenses === 0) {
            comparisonText.textContent = 'Sem gastos registrados.';
            comparisonText.style.color = '#94a3b8';
        } else if (yesterdayExpenses === 0) {
            comparisonText.textContent = `Hoje você gastou R$ ${todayExpenses.toFixed(2)}`;
            comparisonText.style.color = '#94a3b8';
        } else {
            const diff = ((todayExpenses - yesterdayExpenses) / yesterdayExpenses * 100);
            if (diff < 0) {
                comparisonText.textContent = `Hoje gastou ${Math.abs(diff).toFixed(0)}% menos que ontem 👏`;
                comparisonText.style.color = '#10b981';
            } else if (diff > 0) {
                comparisonText.textContent = `Hoje gastou ${diff.toFixed(0)}% mais que ontem ⚠️`;
                comparisonText.style.color = '#f59e0b';
            } else {
                comparisonText.textContent = 'Gastos iguais aos de ontem';
                comparisonText.style.color = '#94a3b8';
            }
        }
    }
}

// Gráfico mensal
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const currentMonthExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= currentMonthStart;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthExpenses = appState.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    if (monthlyChart) monthlyChart.destroy();
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const lastMonthName = monthNames[currentMonth - 1] || 'Mês Anterior';
    const currentMonthName = monthNames[currentMonth];
    
    monthlyChart = new Chart(ctx.getContext('2d'), {
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
    
    const comparisonText = document.getElementById('monthlyComparison');
    if (comparisonText) {
        if (lastMonthExpenses === 0 && currentMonthExpenses === 0) {
            comparisonText.textContent = 'Sem gastos registrados.';
            comparisonText.style.color = '#94a3b8';
        } else if (lastMonthExpenses === 0) {
            comparisonText.textContent = `Este mês: R$ ${currentMonthExpenses.toFixed(2)}`;
            comparisonText.style.color = '#94a3b8';
        } else {
            const percentage = (currentMonthExpenses / lastMonthExpenses * 100).toFixed(0);
            if (percentage < 100) {
                comparisonText.textContent = `Este mês representa ${percentage}% do mês passado 👍`;
                comparisonText.style.color = '#10b981';
            } else if (percentage > 100) {
                comparisonText.textContent = `Este mês ultrapassou ${percentage}% do mês passado ⚠️`;
                comparisonText.style.color = '#ef4444';
            } else {
                comparisonText.textContent = 'Gastos equivalentes ao mês passado';
                comparisonText.style.color = '#94a3b8';
            }
        }
    }
}

// Gráfico de juros
function renderInterestChart(cashValue, totalWithInterest) {
    const ctx = document.getElementById('interestChart');
    if (!ctx) return;
    
    if (interestChart) interestChart.destroy();
    
    const interestAmount = totalWithInterest - cashValue;
    
    interestChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Valor Principal', 'Juros'],
            datasets: [{
                data: [cashValue, interestAmount],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderColor: ['#10b981', '#ef4444'],
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
                        font: { family: 'Inter', size: 14 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
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

// Gráfico do fundo
function renderFundChart() {
    const ctx = document.getElementById('fundGrowthChart');
    if (!ctx) return;
    
    if (fundChart) fundChart.destroy();
    
    const labels = [];
    const data = [];
    
    if (appState.fundHistory.length > 0) {
        appState.fundHistory.forEach(entry => {
            const date = new Date(entry.date);
            labels.push(date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }));
            data.push(entry.balance);
        });
    } else {
        labels.push('Início');
        data.push(appState.fundBalance);
    }
    
    fundChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Crescimento do Fundo (R$)',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f1f5f9' } },
                tooltip: {
                    callbacks: {
                        label: (context) => 'Saldo: R$ ' + context.parsed.y.toFixed(2)
                    }
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#94a3b8',
                        callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Gráfico de projeção
function renderProjectionChart(proj3m, proj6m, proj1y) {
    const ctx = document.getElementById('projectionChart');
    if (!ctx) return;
    
    if (projectionChart) projectionChart.destroy();
    
    const periods = ['Hoje', '3m', '6m', '1a'];
    const values = [appState.fundBalance, proj3m, proj6m, proj1y];
    
    projectionChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: periods,
            datasets: [{
                label: 'Projeção de Saldo (R$)',
                data: values,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => 'R$ ' + context.parsed.y.toFixed(2)
                    }
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#94a3b8',
                        callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}
