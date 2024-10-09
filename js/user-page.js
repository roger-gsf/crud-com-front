// Evento para carregar os dados do usuário ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('userEmail').textContent = user.user_email;
        } else {
            console.error('Erro ao obter usuário:', response.statusText);
            window.location.href = '../login.html';
        }
    } catch (error) {
        console.error('Erro:', error);
        window.location.href = '../login.html';
    }
});

// Evento para atualizar o usuário
document.getElementById('updateUser').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const messageElement = document.getElementById('message');

    const body = {};
    if (newEmail) body.newEmail = newEmail;
    if (newPassword) body.newPassword = newPassword;

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            messageElement.textContent = 'Usuário atualizado com sucesso!';
        } else {
            const errorMessage = await response.json();
            messageElement.textContent = errorMessage.message || 'Erro ao atualizar usuário. Verifique os dados e tente novamente.';
        }
    } catch (error) {
        console.error('Erro:', error);
        messageElement.textContent = 'Erro de rede. Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }
});

// Evento para excluir o usuário
document.getElementById('deleteUser').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    const messageElement = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
        } else {
            const errorMessage = await response.json();
            messageElement.textContent = errorMessage.message || 'Erro ao excluir usuário.';
        }
    } catch (error) {
        console.error('Erro:', error);
        messageElement.textContent = 'Erro de rede. Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }
});
