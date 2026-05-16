const pool = require("./db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      image_url VARCHAR(255) NOT NULL,
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTable();

module.exports = {
  findAll: async () => {
    const res = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query(
      "SELECT * FROM products WHERE id = $1", [id]
    );
    return res.rows[0];
  },
  create: async (name, price, imageUrl, inStock = true) => {
    const res = await pool.query(
      "INSERT INTO products (name, price, image_url, in_stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, imageUrl, inStock]
    );
    return res.rows[0];
  },
  update: async (id, name, price, imageUrl, inStock) => {
    const res = await pool.query(
      `UPDATE products 
       SET name=$1, price=$2, image_url=$3, in_stock=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, price, imageUrl, inStock, id]
    );
    return res.rows[0];
  },
  delete: async (id) => {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
  }
};