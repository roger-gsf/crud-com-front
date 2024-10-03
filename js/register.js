document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            messageElement.textContent = 'Usuário registrado com sucesso!';
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 2000);
        } else {
            const errorMessage = await response.json();
            messageElement.textContent = errorMessage.message || 'Erro ao registrar. Tente novamente.';
        }
    } catch (error) {
        console.error('Erro:', error);
        messageElement.textContent = 'Erro de rede. Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }
});
