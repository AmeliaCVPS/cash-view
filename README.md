# 💰 Cash View - Visualize seu Dinheiro

![Cash View Logo](assets/logo.png)

## 📋 Sobre o Projeto

O **Cash View** é um aplicativo web educativo e gamificado que transforma o "dinheiro invisível" do mundo digital em algo visual e compreensível, promovendo consciência financeira para jovens e adultos.

### 🎯 Origem

Este projeto nasceu como evolução da pesquisa acadêmica **"Paper Money: From Trust to Transformation"**, desenvolvida por estudantes do Colégio Porto Seguro. A pesquisa investigou a evolução histórica do dinheiro e os desafios da desmaterialização financeira na era digital.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login e cadastro de usuários
- Dados armazenados localmente (LocalStorage)
- Sessão persistente
- Validações de segurança

### 💳 Dashboard Financeiro
- **Visualização de Saldo**: Acompanhe seu saldo atual, receitas e despesas
- **Registro de Transações**: Adicione receitas e despesas rapidamente
- **Histórico Completo**: Veja todas as suas transações organizadas por data

### 📊 Análises e Comparações
- **Comparação Diária**: Compare seus gastos de hoje com ontem
- **Comparação Mensal**: Visualize a evolução dos gastos entre meses
- **Gráficos Interativos**: Utilize Chart.js para visualizações profissionais

### 🧮 Simulador de Juros Avançado
- Calcule o impacto real dos juros em compras parceladas
- Compare pagamento à vista vs. parcelado
- Visualize graficamente a diferença entre valor principal e juros
- Mensagens educativas sobre consciência financeira

### 💹 Página de Investimentos (NOVO!)
- **Educação Financeira Completa**: Aprenda sobre Renda Fixa e Variável
- **Simulador de Renda Fixa**: Calcule rendimentos de Poupança, Tesouro Direto, CDB
- **Simulador de Renda Variável**: Projete cenários de Ações e Criptomoedas
- **Comparativos Visuais**: Gráficos interativos comparando investimentos
- **Explicações Didáticas**: CDI, Selic, IR, volatilidade e mais
- **Gráfico Risco x Retorno**: Visualize o trade-off de cada investimento
- **Dados Reais**: Taxas atualizadas de 2025 (CDI 10,65% a.a.)

### 💭 Modo Reflexão
- Modal educativo para gastos acima de R$ 100
- Perguntas reflexivas antes de confirmar despesas grandes
- Sistema de pontos extra ao adiar gastos
- Incentivo à tomada de decisão consciente

### 🏆 Sistema de Conquistas Gamificado
Desbloqueie conquistas em três níveis de dificuldade:

**🥉 Simples**
- Primeiros Passos (primeira transação)
- Primeira Economia (primeira receita)
- Começando Bem (5 transações)

**🥈 Média**
- No Azul (saldo positivo)
- Dedicado (10 transações)
- Mestre da Reflexão (3 gastos adiados)

**🥇 Difícil**
- Persistente (20 transações)
- Grande Poupador (R$ 1.000 em receitas)
- Equilibrado (saldo acima de R$ 500)

### 📤 Exportação de Dados
- Exporte seus dados financeiros em formato JSON
- Inclui: transações, conquistas, pontos e saldo
- Backup completo para segurança

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design moderno com variáveis CSS e gradientes
- **JavaScript ES6+**: Lógica da aplicação, orientação a objetos
- **Chart.js**: Gráficos interativos e responsivos
- **LocalStorage API**: Persistência de dados client-side
- **Google Fonts (Inter)**: Tipografia moderna e legível

## 📁 Estrutura de Arquivos

```
cash-view/
│
├── index.html              # Dashboard principal
├── login.html              # Página de login
├── register.html           # Página de cadastro
├── about.html              # Sobre o projeto
├── investimentos.html      # Página de investimentos (NOVO!)
│
├── styles/
│   └── style.css           # Estilos completos
│
├── scripts/
│   ├── main.js             # Lógica do dashboard
│   ├── auth.js             # Autenticação e registro
│   ├── charts.js           # Configuração dos gráficos
│   └── investments.js      # Simuladores de investimentos (NOVO!)
│
├── assets/
│   └── team-photo.jpg      # Foto da equipe
│
└── README.md               # Documentação
```

## 🚀 Como Executar

### Opção 1: Localmente

1. Clone ou faça download do repositório
2. Abra o arquivo `login.html` em um navegador moderno
3. Crie uma conta e comece a usar!

### Opção 2: GitHub Pages

1. Faça fork deste repositório
2. Vá em **Settings** → **Pages**
3. Selecione a branch `main` e a pasta `root`
4. Clique em **Save**
5. Acesse o link gerado (exemplo: `https://seu-usuario.github.io/cash-view`)

## 💡 Como Usar

### 1️⃣ Criar Conta
- Acesse `register.html`
- Preencha nome, e-mail e senha
- Sua conta será criada localmente no navegador

### 2️⃣ Fazer Login
- Use seu e-mail e senha cadastrados
- Você será redirecionado ao dashboard

### 3️⃣ Adicionar Transações
- No card "Adicionar Transação"
- Preencha valor, descrição e tipo (receita/despesa)
- Para despesas acima de R$ 100, responda à reflexão

### 4️⃣ Simular Juros
- Preencha valor, parcelas e taxa de juros
- Veja o impacto real dos juros no longo prazo
- Compare à vista vs. parcelado

### 5️⃣ Desbloquear Conquistas
- Use o app regularmente
- Conquistas são desbloqueadas automaticamente
- Acompanhe seu progresso

### 6️⃣ Exportar Dados
- Clique em "Exportar Dados"
- Baixe um arquivo JSON com todas as informações
- Use como backup ou análise externa

### 7️⃣ Explorar Investimentos (NOVO!)
- Acesse a página "Investimentos" na navbar
- Aprenda sobre Renda Fixa (Tesouro, CDB, Poupança)
- Aprenda sobre Renda Variável (Ações, Criptomoedas)
- Use os simuladores para projetar seus investimentos
- Compare diferentes tipos de investimento visualmente
- Entenda conceitos como CDI, Selic, IR e volatilidade
- Exporte suas simulações de investimentos

## 🎨 Design

O Cash View utiliza um tema escuro elegante com:
- Paleta de cores profissional (verde acqua, dourado, azul)
- Gradientes sutis e sombras suaves
- Animações de microinteração
- Layout 100% responsivo (desktop e mobile)
- Efeitos hover e transições suaves

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: Todos os dados ficam no navegador do usuário
- **Sem Backend**: Nenhuma informação é enviada para servidores externos
- **Senha Codificada**: Senhas são codificadas (Base64) no LocalStorage
- **Sessão Temporária**: SessionStorage para controle de login

> ⚠️ **Importante**: Este é um projeto educacional. Para uso em produção real, implemente criptografia adequada e backend seguro.

## 👥 Equipe

**Estudantes do Ensino Médio | Colégio Porto Seguro**

- Daniel Gomes
- Marcos Pires
- Thiago Nascimento
- Edson Oliveira

## 📚 Inspiração

Baseado no projeto acadêmico **"Paper Money: From Trust to Transformation"**, que explorou:

- A evolução do dinheiro desde o escambo até criptomoedas
- O papel da confiança nos sistemas financeiros
- Os desafios da desmaterialização do dinheiro
- Educação financeira e inclusão digital
- Segurança em transações eletrônicas

## 🏫 Créditos

- **Instituição**: Colégio Porto Seguro
- **Disciplina**: Escola de Negócios - Ensino Médio
- **Ano**: 2025
- **Projeto Original**: Paper Money: From Trust to Transformation

## 📄 Licença

Este projeto é educacional e está disponível para fins acadêmicos e de aprendizado.

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas! Este projeto foi criado com fins educativos e pode ser expandido com:

- Integração com APIs bancárias reais
- Gráficos mais avançados (D3.js)
- Sistema de metas financeiras
- Notificações push
- PWA (Progressive Web App)
- Multi-idioma
- Modo claro/escuro toggle
- Importação de extratos bancários

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto:
- 📧 projeto.papermoney@escola.edu.br
- 📱 @papermoney.edu

---

**Cash View** © 2025 - Transformando a relação das pessoas com o dinheiro digital.

> 💡 "Money is just a means, never the end. True wealth lies in knowledge and awareness."
