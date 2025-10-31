// ========================================
// CASH VIEW - INVESTMENTS.JS
// ========================================

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

document.getElementById('investSimulator').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('investAmount').value);
    const months = parseInt(document.getElementById('investPeriod').value);
    const type = document.getElementById('investType').value;
    
    const rates = {
        poupanca: 0.06 / 12,
        tesouro: 0.1065 / 12,
        cdb100: 0.1065 / 12,
        cdb120: 0.1278 / 12,
        acoes: 0.15 / 12
    };
    
    const rate = rates[type];
    const finalAmount = amount * Math.pow(1 + rate, months);
    const grossReturn = finalAmount - amount;
    
    let irRate = 0;
    if (type !== 'poupanca' && type !== 'acoes') {
        if (months <= 6) irRate = 0.225;
        else if (months <= 12) irRate = 0.20;
        else if (months <= 24) irRate = 0.175;
        else irRate = 0.15;
    }
    
    const tax = grossReturn * irRate;
    const netFinal = amount + (grossReturn - tax);
    
    document.getElementById('investInitial').textContent = formatCurrency(amount);
    document.getElementById('investGross').textContent = formatCurrency(grossReturn);
    document.getElementById('investTax').textContent = formatCurrency(tax);
    document.getElementById('investFinal').textContent = formatCurrency(netFinal);
    
    document.getElementById('investResults').classList.remove('hidden');
    
    renderInvestChart(amount, netFinal);
    
    // Bonificar milhas (se main.js estiver carregado)
    if (typeof addMiles === 'function') {
        addMiles(10, 'Simulou investimento');
    }
});

function renderInvestChart(initial, final) {
    const ctx = document.getElementById('investChart');
    if (!ctx) return;
    
    if (investChart) investChart.destroy();
    
    investChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Investido', 'Valor Final'],
            datasets: [{
                label: 'Comparação (R$)',
                data: [initial, final],
                backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)'],
                borderColor: ['#3b82f6', '#10b981'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
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

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
