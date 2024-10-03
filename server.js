const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = 'seu_segredo_aqui'; // Troque para um segredo seguro

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
  const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a senha

  db.query('SELECT user_email FROM users WHERE user_email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      return res.status(400).send('Usuário já existe');
    }

    db.query('INSERT INTO users (user_email, user_password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
      if (err) throw err;
      res.send('Usuário registrado com sucesso');
    });
  });
});

// Login de usuários
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE user_email = ?', [email], async (err, result) => {
    if (err) throw err;

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
      return res.status(400).send('Email ou senha inválidos');
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' }); // Gera o token
    res.json({ token }); // Retorna o token ao cliente
  });
});

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Adiciona os dados do usuário ao req
    next();
  });
};

// Rota para obter dados do usuário logado
app.get('/user', authenticateToken, (req, res) => {
  db.query('SELECT user_email FROM users WHERE user_email = ?', [req.user.user_email], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.json(result[0]); // Retorna os dados do usuário
  });
});

// Rota para atualizar informações do usuário
app.put('/user', authenticateToken, async (req, res) => {
  const { newEmail, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10); // Criptografa a nova senha

  db.query('UPDATE users SET user_email = ?, user_password = ? WHERE user_email = ?', [newEmail, hashedPassword, req.user.user_email], (err, result) => {
    if (err) throw err;

    if (result.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.send('Usuário atualizado com sucesso');
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
