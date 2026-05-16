const pool = require("./db");

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      product_id VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      quantity INTEGER DEFAULT 1
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      product_id VARCHAR(100) NOT NULL
    )
  `);
};

createTables();

clearCart: async (userId) => {
    await pool.query("DELETE FROM carts WHERE user_id = $1", [userId]);
  },
  
module.exports = {
  // Orders
  createOrder: async (userId, products, total) => {
    const orderRes = await pool.query(
      "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *",
      [userId, total]
    );
    const order = orderRes.rows[0];

    for (const item of products) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
        [order.id, item.productId, item.quantity]
      );
    }
    return order;
  },
  findOrdersByUser: async (userId) => {
    const res = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return res.rows;
  },
  findAllOrders: async () => {
    const res = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    return res.rows;
  },

  // Cart
  addToCart: async (userId, productId, quantity) => {
    const res = await pool.query(
      "INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [userId, productId, quantity]
    );
    return res.rows[0];
  },
  getCart: async (userId) => {
    const res = await pool.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );
    return res.rows;
  },
  removeFromCart: async (userId, productId) => {
    await pool.query(
      "DELETE FROM carts WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
  },

  // Favorites
  addFavorite: async (userId, productId) => {
    const res = await pool.query(
      "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *",
      [userId, productId]
    );
    return res.rows[0];
  },
  getFavorites: async (userId) => {
    const res = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1",
      [userId]
    );
    return res.rows;
  },
  removeFavorite: async (userId, productId) => {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
  }
};