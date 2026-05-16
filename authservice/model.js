const pool = require("./db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTable();

module.exports = {
  findOne: async (username) => {
    const res = await pool.query(
      "SELECT * FROM users WHERE username = $1", [username]
    );
    return res.rows[0];
  },
  create: async (username, password, role) => {
    const res = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
      [username, password, role]
    );
    return res.rows[0];
  }
};