require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Change this for a secure secret
const SECRET_KEY = process.env.SECRET_KEY || 'my_secret_key';

// Configuring MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS  || '',
  database: process.env.DB_NAME|| 'login_system'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database!');
});

// Middleware for JWT token authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token not provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  });
}

// User registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('SELECT user_email FROM users WHERE user_email = ?', [email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error. Try again later.' });

      if (result.length > 0) {
        return res.status(400).json({ message: 'User already exists.' });
      }

      db.query('INSERT INTO users (user_email, user_password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: 'Error registering user. Try again later.' });

        res.json({ message: 'User registered successfully.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request. Try again later.' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  db.query('SELECT * FROM users WHERE user_email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error. Try again later.' });

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].user_password))) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Route to get logged-in user data
app.get('/user', authenticateToken, (req, res) => {
  db.query('SELECT user_email FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error. Try again later.' });

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(result[0]);
  });
});

// Route to update logged-in user
app.put('/user', authenticateToken, (req, res) => {
  const { newEmail, newPassword } = req.body;

  if (!newEmail && !newPassword) {
    return res.status(400).json({ message: 'Email or password are necessary to update.' });
  }

  let fields = [];
  let values = [];

  if (newEmail) {
    fields.push('user_email = ?');
    values.push(newEmail);
  }

  if (newPassword) {
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Error hashing password. Try again later.' });

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
      if (err) return res.status(500).json({ message: 'Error updating user. Try again later.' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.json({ message: 'User updated successfully.' });
    });
  }
});

// Delete logged-in user
app.delete('/user', authenticateToken, (req, res) => {
  db.query('DELETE FROM users WHERE user_email = ?', [req.user.email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error. Try again later.' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
