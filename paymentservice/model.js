const pool = require("./db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      order_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      method VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTable();

module.exports = {
  create: async (user_id, order_id, amount, method, status) => {
    const res = await pool.query(
      "INSERT INTO payments (user_id, order_id, amount, method, status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [user_id, order_id, amount, method, status]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    return res.rows[0];
  }
};