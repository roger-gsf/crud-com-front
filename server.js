const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = 'my_secret_key'; // Troque para um segredo seguro

app.use(cors());
app.use(bodyParser.json());

// Configurando conexão com o MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ajuste o nome de usuário se necessário
  password: '', // Insira a senha se houver
  database: 'login_system'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

// Registro de usuários
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a senha

    db.query('SELECT user_email FROM users WHERE user_email = ?', [email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });

      if (result.length > 0) {
        return res.status(400).json({ message: 'Usuário já existe.' });
      }

      db.query('INSERT INTO users (user_email, user_password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: 'Erro ao registrar usuário. Tente novamente mais tarde.' });

        res.json({ message: 'Usuário registrado com sucesso.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a solicitação. Tente novamente mais tarde.' });
  }
});

// Login de usuários
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  db.query('SELECT * FROM users WHERE user_email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].user_password))) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' }); // Gera o token
    res.json({ token }); // Retorna o token ao cliente
  });
});

// Rota para obter dados do usuário logado
app.get('/user', authenticateToken, (req, res) => {
  db.query('SELECT user_email FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.json(result[0]); // Retorna os dados do usuário
  });
});


// Rota para atualizar o usuário logado
app.put('/user', authenticateToken, (req, res) => {
  const { newEmail, newPassword } = req.body;

  if (!newEmail || !newPassword) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Erro ao criptografar a senha. Tente novamente mais tarde.' });

    db.query(
      'UPDATE users SET user_email = ?, user_password = ? WHERE user_email = ?',
      [newEmail, hash, req.user.email],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao atualizar usuário. Tente novamente mais tarde.' });

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Usuário atualizado com sucesso.' });
      }
    );
  });
});


// Rota para deletar o usuário
app.delete('/user', authenticateToken, (req, res) => {
  db.query('DELETE FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) throw err;

    if (result.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.send('Usuário deletado com sucesso');
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
