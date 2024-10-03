// Adiciona um listener que aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Obtém o token do localStorage
    const token = localStorage.getItem('token');

    // Verifica se não há token; se não houver, redireciona para a página de login
    if (!token) {
        window.location.href = 'login.html'; // Redireciona para o login se não houver token
        return; // Interrompe a execução do código
    }

    // Obtém dados do usuário da API
    const response = await fetch('http://localhost:3000/user', {
        headers: {
            'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho de autorização
        }
    });

    // Seleciona os elementos do DOM onde as informações serão exibidas
    const userEmailElement = document.getElementById('userEmail');
    const messageElement = document.getElementById('message');

    // Verifica se a resposta da API foi bem-sucedida
    if (response.ok) {
        // Converte a resposta em JSON
        const userData = await response.json();
        userEmailElement.textContent = userData.email; // Exibe o email do usuário na página

        // Preenche os campos de entrada com os dados do usuário
        document.getElementById('newEmail').value = userData.email; // Preenche o novo email com o email atual
    } else {
        // Se houver erro ao obter dados do usuário, exibe uma mensagem
        messageElement.textContent = 'Erro ao obter dados do usuário.';
    }

    // Adiciona um listener para o evento de submissão do formulário de atualização
    document.getElementById('updateForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

        // Obtém os novos valores inseridos pelo usuário
        const newEmail = document.getElementById('newEmail').value; // Novo email
        const newPassword = document.getElementById('newPassword').value; // Nova senha

        // Envia a requisição para atualizar as informações do usuário
        const updateResponse = await fetch('http://localhost:3000/user', {
            method: 'PUT', // Define o método como PUT para atualizar os dados
            headers: {
                'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho de autorização
            },
            body: JSON.stringify({ newEmail, newPassword }) // Converte os dados em JSON
        });

        // Verifica se a atualização foi bem-sucedida
        if (updateResponse.ok) {
            messageElement.textContent = 'Usuário atualizado com sucesso.'; // Mensagem de sucesso
        } else {
            // Se houver erro na atualização, exibe a mensagem de erro
            const errorMessage = await updateResponse.text();
            messageElement.textContent = errorMessage;
        }
    });

    // Adiciona um listener para o evento de clique no botão de deletar conta
    document.getElementById('deleteUser').addEventListener('click', async () => {
        // Envia a requisição para deletar a conta do usuário
        const deleteResponse = await fetch('http://localhost:3000/user', {
            method: 'DELETE', // Define o método como DELETE para remover o usuário
            headers: {
                'Authorization': `Bearer ${token}` // Adiciona o token no cabeçalho de autorização
            }
        });

        // Verifica se a deleção foi bem-sucedida
        if (deleteResponse.ok) {
            messageElement.textContent = 'Usuário deletado com sucesso.'; // Mensagem de sucesso
            localStorage.removeItem('token'); // Remove o token do localStorage
            // Redireciona para a página de login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html'; // Redireciona para a página de login
            }, 2000);
        } else {
            // Se houver erro na deleção, exibe a mensagem de erro
            const errorMessage = await deleteResponse.text();
            messageElement.textContent = errorMessage;
        }
    });
});
