document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Armazena o token
            window.location.href = '../html/user-page.html';
        } else {
            const errorMessage = await response.json();
            messageElement.textContent = errorMessage.message || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.';
        }
    } catch (error) {
        console.error('Erro:', error);
        messageElement.textContent = 'Erro de rede. Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }
});
