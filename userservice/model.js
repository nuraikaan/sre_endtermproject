const pool = require("./db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) UNIQUE NOT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      avatar VARCHAR(255) DEFAULT 'default.png',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTable();

module.exports = {
  findByUserId: async (userId) => {
    const res = await pool.query(
      "SELECT * FROM profiles WHERE user_id = $1", [userId]
    );
    return res.rows[0];
  },
  upsert: async (userId, username, email, avatar) => {
    const res = await pool.query(`
      INSERT INTO profiles (user_id, username, email, avatar)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
      SET email = $3, avatar = $4
      RETURNING *
    `, [userId, username, email, avatar]);
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query("SELECT * FROM profiles");
    return res.rows;
  },
  deleteByUserId: async (userId) => {
    await pool.query(
      "DELETE FROM profiles WHERE user_id = $1", [userId]
    );
  }
};