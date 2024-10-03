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
            document.getElementById('userEmail').textContent = user.email;
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
document.getElementById('updateUser').addEventListener('click', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newEmail, newPassword })
        });

        if (response.ok) {
            document.getElementById('message').textContent = 'Usuário atualizado com sucesso!';
        } else {
            document.getElementById('message').textContent = 'Erro ao atualizar usuário.';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('message').textContent = 'Erro ao atualizar usuário.';
    }
});

// Evento para excluir o usuário
document.getElementById('deleteUser').addEventListener('click', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../login.html';
        return;
    }

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
            document.getElementById('message').textContent = 'Erro ao excluir usuário.';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('message').textContent = 'Erro ao excluir usuário.';
    }
});
