// ========================================
// CASH VIEW - INVESTMENTS
// ========================================

// Verificar autenticação
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
} else {
    document.getElementById('userName').textContent = currentUser.name;
}

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Estado das simulações
let simulationHistory = {
    fixedIncome: [],
    variableIncome: []
};

// Carregar simulações salvas
function loadSimulations() {
    const saved = localStorage.getItem(`simulations_${currentUser.email}`);
    if (saved) {
        simulationHistory = JSON.parse(saved);
    }
}

// Salvar simulações
function saveSimulations() {
    localStorage.setItem(`simulations_${currentUser.email}`, JSON.stringify(simulationHistory));
}

// ========================================
// GRÁFICOS INICIAIS
// ========================================

// Gráfico Risco x Retorno
function createRiskReturnChart() {
    const ctx = document.getElementById('riskReturnChart').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Poupança',
                data: [{ x: 1, y: 6 }],
                backgroundColor: 'rgba(148, 163, 184, 0.7)',
                pointRadius: 8
            }, {
                label: 'Tesouro Selic',
                data: [{ x: 1.5, y: 10.75 }],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                pointRadius: 8
            }, {
                label: 'CDB 120% CDI',
                data: [{ x: 2, y: 12.8 }],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                pointRadius: 8
            }, {
                label: 'Ações (Média)',
                data: [{ x: 6, y: 15 }],
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                pointRadius: 8
            }, {
                label: 'Criptomoedas',
                data: [{ x: 9, y: 30 }],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                pointRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f1f5f9', font: { family: 'Inter' } }
                },
                title: {
                    display: true,
                    text: 'Risco vs Retorno Esperado',
                    color: '#f1f5f9',
                    font: { size: 16, family: 'Inter' }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Risco (1-10)', color: '#94a3b8' },
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    min: 0,
                    max: 10
                },
                y: {
                    title: { display: true, text: 'Retorno Anual (%)', color: '#94a3b8' },
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    min: 0,
                    max: 35
                }
            }
        }
    });
}

// Gráfico Comparativo
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    const principal = 10000;
    const months = 12;
    
    // Cálculos
    const poupanca = principal * Math.pow(1 + 0.005, months); // 0.5% a.m.
    const cdiRate = 0.1065 / 12; // 10.65% a.a. = 0.8875% a.m.
    const tesouro = principal * Math.pow(1 + cdiRate, months);
    const cdb100 = principal * Math.pow(1 + cdiRate, months);
    const cdb120 = principal * Math.pow(1 + (cdiRate * 1.2), months);
    
    // Aplicar IR (12 meses = 20%)
    const irRate = 0.20;
    const tesouroLiq = principal + (tesouro - principal) * (1 - irRate);
    const cdb100Liq = principal + (cdb100 - principal) * (1 - irRate);
    const cdb120Liq = principal + (cdb120 - principal) * (1 - irRate);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Poupança', 'Tesouro Selic', 'CDB 100% CDI', 'CDB 120% CDI'],
            datasets: [{
                label: 'Valor Final em 12 meses (R$)',
                data: [poupanca, tesouroLiq, cdb100Liq, cdb120Liq],
                backgroundColor: [
                    'rgba(148, 163, 184, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const gain = context.parsed.y - principal;
                            return [
                                'Valor final: R$ ' + context.parsed.y.toFixed(2),
                                'Ganho líquido: R$ ' + gain.toFixed(2)
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#94a3b8',
                        callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    beginAtZero: false,
                    min: 9800
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Gráfico de Volatilidade Cripto
function createCryptoVolatilityChart() {
    const ctx = document.getElementById('cryptoVolatilityChart').getContext('2d');
    
    // Simular 30 dias de volatilidade
    const days = 30;
    const labels = Array.from({ length: days }, (_, i) => `Dia ${i + 1}`);
    const data = [100]; // Começa em 100 (índice)
    
    for (let i = 1; i < days; i++) {
        const change = (Math.random() - 0.5) * 15; // ±7.5% por dia
        data.push(Math.max(50, data[i - 1] + change));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Variação de Preço (%)',
                data: data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f1f5f9' } },
                title: {
                    display: true,
                    text: 'Exemplo de Volatilidade em 30 Dias',
                    color: '#f1f5f9'
                }
            },
            scales: {
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Índice de Preço', color: '#94a3b8' }
                },
                x: {
                    ticks: { color: '#94a3b8', maxTicksLimit: 10 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ========================================
// SIMULADOR DE RENDA FIXA
// ========================================

let fixedIncomeChart = null;

document.getElementById('fixedIncomeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('fixedAmount').value);
    const months = parseInt(document.getElementById('fixedPeriod').value);
    const type = document.getElementById('fixedType').value;
    
    // Taxas (mensais)
    const rates = {
        poupanca: 0.005, // 0.5% a.m. (~6% a.a.)
        tesouro: 0.1065 / 12, // 10.65% a.a.
        cdb100: 0.1065 / 12,
        cdb110: (0.1065 * 1.1) / 12,
        cdb120: (0.1065 * 1.2) / 12
    };
    
    const rate = rates[type];
    const finalAmount = amount * Math.pow(1 + rate, months);
    const grossReturn = finalAmount - amount;
    
    // Calcular IR (tabela regressiva)
    let irRate = 0;
    if (type !== 'poupanca') { // Poupança é isenta
        if (months <= 6) irRate = 0.225;
        else if (months <= 12) irRate = 0.20;
        else if (months <= 24) irRate = 0.175;
        else irRate = 0.15;
    }
    
    const tax = grossReturn * irRate;
    const netFinal = amount + (grossReturn - tax);
    
    // Atualizar resultados
    document.getElementById('fixedInvested').textContent = formatCurrency(amount);
    document.getElementById('fixedGross').textContent = formatCurrency(grossReturn);
    document.getElementById('fixedTax').textContent = formatCurrency(tax);
    document.getElementById('fixedFinal').textContent = formatCurrency(netFinal);
    
    // Mostrar resultados
    document.getElementById('fixedIncomeResults').classList.remove('hidden');
    
    // Criar gráfico de evolução
    createFixedIncomeChart(amount, rate, months, netFinal);
    
    // Salvar simulação
    simulationHistory.fixedIncome.push({
        date: new Date().toISOString(),
        type,
        amount,
        months,
        netFinal
    });
    saveSimulations();
    
    showToast(`✓ Simulação de ${type.toUpperCase()} calculada!`);
});

function createFixedIncomeChart(initial, monthlyRate, months, finalValue) {
    const ctx = document.getElementById('fixedIncomeChart').getContext('2d');
    
    if (fixedIncomeChart) {
        fixedIncomeChart.destroy();
    }
    
    // Gerar dados mensais
    const labels = [];
    const values = [];
    
    for (let m = 0; m <= months; m++) {
        labels.push(`Mês ${m}`);
        values.push(initial * Math.pow(1 + monthlyRate, m));
    }
    
    fixedIncomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Evolução do Investimento (R$)',
                data: values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f1f5f9' } }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#94a3b8',
                        callback: (value) => 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8', maxTicksLimit: 12 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ========================================
// SIMULADOR DE RENDA VARIÁVEL
// ========================================

let variableIncomeChart = null;

document.getElementById('variableIncomeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('varAmount').value);
    const annualReturn = parseFloat(document.getElementById('varReturn').value) / 100;
    const years = parseInt(document.getElementById('varPeriod').value);
    const volatility = parseFloat(document.getElementById('varVolatility').value) / 100;
    
    // Calcular cenários
    const pessimistic = amount * Math.pow(1 + (annualReturn - volatility), years);
    const realistic = amount * Math.pow(1 + annualReturn, years);
    const optimistic = amount * Math.pow(1 + (annualReturn + volatility), years);
    const average = (pessimistic + realistic + optimistic) / 3;
    
    // Atualizar resultados
    document.getElementById('varPessimistic').textContent = formatCurrency(pessimistic);
    document.getElementById('varRealistic').textContent = formatCurrency(realistic);
    document.getElementById('varOptimistic').textContent = formatCurrency(optimistic);
    document.getElementById('varAverage').textContent = formatCurrency(average);
    
    // Mostrar resultados
    document.getElementById('variableIncomeResults').classList.remove('hidden');
    
    // Criar gráfico com volatilidade
    createVariableIncomeChart(amount, annualReturn, years, volatility);
    
    // Salvar simulação
    simulationHistory.variableIncome.push({
        date: new Date().toISOString(),
        amount,
        years,
        annualReturn: annualReturn * 100,
        volatility: volatility * 100,
        average
    });
    saveSimulations();
    
    showToast('✓ Simulação de Renda Variável calculada!');
});

function createVariableIncomeChart(initial, annualReturn, years, volatility) {
    const ctx = document.getElementById('variableIncomeChart').getContext('2d');
    
    if (variableIncomeChart) {
        variableIncomeChart.destroy();
    }
    
    const months = years * 12;
    const monthlyReturn = annualReturn / 12;
    const monthlyVol = volatility / Math.sqrt(12);
    
    // Gerar 3 cenários com volatilidade
    const labels = [];
    const pessimisticData = [initial];
    const realisticData = [initial];
    const optimisticData = [initial];
    
    for (let m = 1; m <= months; m++) {
        labels.push(`Mês ${m}`);
        
        // Simulação com volatilidade aleatória
        const randomShock = (Math.random() - 0.5) * 2 * monthlyVol;
        
        pessimisticData.push(pessimisticData[m - 1] * (1 + monthlyReturn - monthlyVol + randomShock * 0.5));
        realisticData.push(realisticData[m - 1] * (1 + monthlyReturn + randomShock));
        optimisticData.push(optimisticData[m - 1] * (1 + monthlyReturn + monthlyVol + randomShock * 0.5));
    }
    
    variableIncomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cenário Pessimista',
                    data: pessimisticData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: 'Cenário Realista',
                    data: realisticData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 3
                },
                {
                    label: 'Cenário Otimista',
                    data: optimisticData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f1f5f9' } },
                tooltip: {
                    callbacks: {
                        label: (context) => context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2)
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
                    ticks: { color: '#94a3b8', maxTicksLimit: 12 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ========================================
// EXPORTAR SIMULAÇÕES
// ========================================

document.getElementById('btnExportSimulations').addEventListener('click', () => {
    const exportData = {
        user: currentUser.name,
        exportDate: new Date().toISOString(),
        simulations: simulationHistory
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cashview_investments_${Date.now()}.json`;
    link.click();
    
    showToast('📊 Simulações exportadas com sucesso!');
});

// ========================================
// UTILITÁRIOS
// ========================================

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadSimulations();
    createRiskReturnChart();
    createComparisonChart();
    createCryptoVolatilityChart();
});