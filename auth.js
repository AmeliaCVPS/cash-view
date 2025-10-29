// ========================================
// CASH VIEW - AUTHENTICATION
// ========================================

// Verificar se já está logado
function checkExistingSession() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// Registrar novo usuário
function registerUser(name, email, password) {
    // Verificar se o usuário já existe
    const existingUser = localStorage.getItem(`user_${email}`);
    if (existingUser) {
        return { success: false, message: 'Este e-mail já está cadastrado!' };
    }
    
    // Validações
    if (!name || name.length < 3) {
        return { success: false, message: 'Nome deve ter pelo menos 3 caracteres!' };
    }
    
    if (!email || !email.includes('@')) {
        return { success: false, message: 'E-mail inválido!' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres!' };
    }
    
    // Criar usuário
    const user = {
        name,
        email,
        password: btoa(password), // Encoding simples (não é seguro em produção real)
        createdAt: Date.now()
    };
    
    // Salvar no localStorage
    localStorage.setItem(`user_${email}`, JSON.stringify(user));
    
    return { success: true, message: 'Cadastro realizado com sucesso!' };
}

// Fazer login
function loginUser(email, password) {
    // Buscar usuário
    const userStr = localStorage.getItem(`user_${email}`);
    
    if (!userStr) {
        return { success: false, message: 'Usuário não encontrado!' };
    }
    
    const user = JSON.parse(userStr);
    
    // Verificar senha
    if (btoa(password) !== user.password) {
        return { success: false, message: 'Senha incorreta!' };
    }
    
    // Criar sessão
    const sessionUser = {
        name: user.name,
        email: user.email
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(sessionUser));
    
    return { success: true, message: 'Login realizado com sucesso!' };
}

// Setup de página de login
if (window.location.pathname.includes('login.html')) {
    checkExistingSession();
    
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = loginUser(email, password);
            
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                showAuthError(result.message);
            }
        });
    });
}

// Setup de página de registro
if (window.location.pathname.includes('register.html')) {
    checkExistingSession();
    
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('registerForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAuthError('As senhas não coincidem!');
                return;
            }
            
            const result = registerUser(name, email, password);
            
            if (result.success) {
                // Fazer login automático
                loginUser(email, password);
                window.location.href = 'index.html';
            } else {
                showAuthError(result.message);
            }
        });
    });
}

// Mostrar erro de autenticação
function showAuthError(message) {
    let errorDiv = document.getElementById('authError');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'authError';
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 600;
        `;
        document.querySelector('.auth-form').prepend(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}