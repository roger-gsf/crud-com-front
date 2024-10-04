require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'my_secret_key'; // Troque para um segredo seguro

app.use(cors());
app.use(bodyParser.json());

// Configurando conexão com o MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'login_system'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados MySQL!');
});

// Middleware para autenticação do token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }

    req.user = user;
    next();
  });
}

// Registro de usuários
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Rota para obter dados do usuário logado
app.get('/user', authenticateToken, (req, res) => {
  db.query('SELECT user_email FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(result[0]);
  });
});

// Rota para atualizar o usuário logado
app.put('/user', authenticateToken, (req, res) => {
  const { newEmail, newPassword } = req.body;

  if (!newEmail && !newPassword) {
    return res.status(400).json({ message: 'Email ou senha são necessários para atualizar.' });
  }

  let fields = [];
  let values = [];

  if (newEmail) {
    fields.push('user_email = ?');
    values.push(newEmail);
  }

  if (newPassword) {
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Erro ao criptografar a senha. Tente novamente mais tarde.' });

      fields.push('user_password = ?');
      values.push(hash);

      executeUpdate();
    });
  } else {
    executeUpdate();
  }

  function executeUpdate() {
    const query = `UPDATE users SET ${fields.join(', ')} WHERE user_email = ?`;
    values.push(req.user.email);

    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ message: 'Erro ao atualizar usuário. Tente novamente mais tarde.' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      res.json({ message: 'Usuário atualizado com sucesso.' });
    });
  }
});

// Rota para deletar o usuário logado
app.delete('/user', authenticateToken, (req, res) => {
  db.query('DELETE FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário deletado com sucesso.' });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
