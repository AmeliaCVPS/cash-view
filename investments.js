// ========================================
// CASH VIEW - INVESTMENTS.JS (ATUALIZADO)
// ========================================

// Verificar autenticação
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
} else {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('btnLogout').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

let investChart = null;
let comparisonChart = null;

// Configuração responsiva dos gráficos
const getResponsiveChartOptions = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: !isMobile,
                position: isMobile ? 'top' : 'bottom',
                labels: {
                    color: '#f1f5f9',
                    font: {
                        family: 'Inter',
                        size: isMobile ? 10 : 12
                    },
                    padding: isMobile ? 8 : 15,
                    boxWidth: isMobile ? 12 : 40
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: {
                    size: isMobile ? 11 : 13
                },
                bodyFont: {
                    size: isMobile ? 10 : 12
                },
                padding: isMobile ? 8 : 12
            }
        },
        scales: {
            y: {
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: isMobile ? 9 : 11
                    },
                    callback: (value) => {
                        if (isMobile && value >= 1000) {
                            return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                        }
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    }
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: isMobile ? 9 : 11
                    },
                    maxRotation: isMobile ? 45 : 0,
                    minRotation: isMobile ? 45 : 0
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            }
        }
    };
};

// Taxas de investimento (anualizadas)
const investmentRates = {
    poupanca: 0.06,           // 6% a.a.
    tesouro_selic: 0.1065,    // 10,65% a.a.
    cdb100: 0.1065,           // 100% CDI
    cdb110: 0.1172,           // 110% CDI
    cdb120: 0.1278,           // 120% CDI
    lci_lca: 0.09,            // 9% a.a. (isento IR)
    fundos_di: 0.095,         // 9,5% a.a.
    acoes: 0.15,              // 15% a.a. (médio histórico)
    cripto: 0.30              // 30% a.a. (muito volátil)
};

// Isenções de IR
const irExempt = ['poupanca', 'lci_lca', 'acoes']; // Ações tem isenção até R$ 20k/mês

// Simulador de investimentos
document.getElementById('investSimulator').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('investAmount').value);
    const months = parseInt(document.getElementById('investPeriod').value);
    const type = document.getElementById('investType').value;
    
    if (!type) {
        alert('Por favor, selecione um tipo de investimento.');
        return;
    }
    
    // Calcular rendimento
    const annualRate = investmentRates[type];
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
    const finalAmount = amount * Math.pow(1 + monthlyRate, months);
    const grossReturn = finalAmount - amount;
    
    // Calcular IR (tabela regressiva)
    let irRate = 0;
    if (!irExempt.includes(type)) {
        if (months <= 6) irRate = 0.225;        // 22,5%
        else if (months <= 12) irRate = 0.20;   // 20%
        else if (months <= 24) irRate = 0.175;  // 17,5%
        else irRate = 0.15;                     // 15%
    }
    
    const tax = grossReturn * irRate;
    const netFinal = amount + (grossReturn - tax);
    const netReturn = netFinal - amount;
    const percentReturn = ((netFinal / amount - 1) * 100).toFixed(2);
    
    // Atualizar resultados
    document.getElementById('investInitial').textContent = formatCurrency(amount);
    document.getElementById('investGross').textContent = formatCurrency(grossReturn);
    document.getElementById('investTax').textContent = formatCurrency(tax);
    document.getElementById('investFinal').textContent = formatCurrency(netFinal);
    
    // Mostrar resultados
    document.getElementById('investResults').classList.remove('hidden');
    
    // Renderizar gráfico de evolução
    renderInvestChart(amount, monthlyRate, months, type);
    
    // Scroll suave até os resultados
    document.getElementById('investResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Bonificar milhas se função existir
    if (typeof addMiles === 'function') {
        addMiles(10, 'Simulou investimento');
    }
});

// Renderizar gráfico de evolução do investimento
function renderInvestChart(initial, monthlyRate, months, type) {
    const ctx = document.getElementById('investChart');
    if (!ctx) return;
    
    if (investChart) {
        investChart.destroy();
    }
    
    // Gerar dados mês a mês
    const labels = [];
    const data = [];
    
    for (let m = 0; m <= months; m++) {
        labels.push(m === 0 ? 'Início' : `${m}m`);
        data.push(initial * Math.pow(1 + monthlyRate, m));
    }
    
    // Altura responsiva do gráfico
    const isMobile = window.innerWidth < 768;
    const chartHeight = isMobile ? 250 : 300;
    ctx.style.height = chartHeight + 'px';
    ctx.parentElement.style.height = chartHeight + 'px';
    
    investChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Evolução do Investimento (R$)',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: isMobile ? 2 : 3,
                pointHoverRadius: isMobile ? 4 : 6,
                borderWidth: isMobile ? 2 : 3
            }]
        },
        options: {
            ...getResponsiveChartOptions(),
            plugins: {
                ...getResponsiveChartOptions().plugins,
                legend: {
                    ...getResponsiveChartOptions().plugins.legend,
                    display: false
                },
                tooltip: {
                    ...getResponsiveChartOptions().plugins.tooltip,
                    callbacks: {
                        label: (context) => {
                            return 'Saldo: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico comparativo (carrega automaticamente)
function renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    const principal = 10000;
    const months = 12;
    
    // Calcular cada investimento
    const results = {};
    
    Object.keys(investmentRates).forEach(type => {
        const annualRate = investmentRates[type];
        const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
        const finalAmount = principal * Math.pow(1 + monthlyRate, months);
        const grossReturn = finalAmount - principal;
        
        // Aplicar IR
        let irRate = 0;
        if (!irExempt.includes(type)) {
            irRate = 0.20; // 12 meses = 20%
        }
        
        const tax = grossReturn * irRate;
        const netFinal = principal + (grossReturn - tax);
        
        results[type] = netFinal;
    });
    
    // Preparar dados para o gráfico
    const labels = [
        'Poupança',
        'Tesouro Selic',
        'CDB 100%',
        'CDB 110%',
        'CDB 120%',
        'LCI/LCA',
        'Fundos DI',
        'Ações',
        'Cripto'
    ];
    
    const data = [
        results.poupanca,
        results.tesouro_selic,
        results.cdb100,
        results.cdb110,
        results.cdb120,
        results.lci_lca,
        results.fundos_di,
        results.acoes,
        results.cripto
    ];
    
    const colors = [
        'rgba(148, 163, 184, 0.7)',  // Poupança
        'rgba(16, 185, 129, 0.7)',   // Tesouro
        'rgba(59, 130, 246, 0.7)',   // CDB 100
        'rgba(59, 130, 246, 0.8)',   // CDB 110
        'rgba(59, 130, 246, 0.9)',   // CDB 120
        'rgba(16, 185, 129, 0.8)',   // LCI/LCA
        'rgba(245, 158, 11, 0.7)',   // Fundos
        'rgba(245, 158, 11, 0.9)',   // Ações
        'rgba(239, 68, 68, 0.7)'     // Cripto
    ];
    
    // Altura responsiva
    const isMobile = window.innerWidth < 768;
    const chartHeight = isMobile ? 300 : 350;
    ctx.style.height = chartHeight + 'px';
    ctx.parentElement.style.height = chartHeight + 'px';
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    comparisonChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor Final em 12 meses (R$)',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1').replace('0.8', '1').replace('0.9', '1')),
                borderWidth: 2
            }]
        },
        options: {
            ...getResponsiveChartOptions(),
            plugins: {
                ...getResponsiveChartOptions().plugins,
                legend: {
                    display: false
                },
                tooltip: {
                    ...getResponsiveChartOptions().plugins.tooltip,
                    callbacks: {
                        label: (context) => {
                            const gain = context.parsed.y - principal;
                            return [
                                'Valor final: ' + formatCurrency(context.parsed.y),
                                'Ganho líquido: ' + formatCurrency(gain)
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    ...getResponsiveChartOptions().scales.y,
                    beginAtZero: false,
                    min: 9500
                },
                x: getResponsiveChartOptions().scales.x
            }
        }
    });
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Atualizar gráficos ao redimensionar janela
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (investChart) {
            investChart.options = getResponsiveChartOptions();
            investChart.update();
        }
        if (comparisonChart) {
            renderComparisonChart();
        }
    }, 250);
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar gráfico comparativo automaticamente
    setTimeout(() => {
        renderComparisonChart();
    }, 500);
});
