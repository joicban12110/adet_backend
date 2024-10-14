const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { fullname, username, password } = req.body;   

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('INSERT INTO users (fullname, username, password) VALUES (?, ?, ?)', [fullname, username, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users', [username]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials!' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials!' });
    }

    const token = jwt.sign(
      { user_id: user.id, username: user.username, type_id: user.type_id, type_name: user.type_name },process.env.JWT_SECRET,{ expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME });

    res.json({ token });

  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };