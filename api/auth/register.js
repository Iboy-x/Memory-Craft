const bcrypt = require('bcryptjs');
const pool = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Check if username exists
    const existingUser = await pool.sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${hashedPassword})
      RETURNING id, username
    `;

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: result.rows[0].id, username: result.rows[0].username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 