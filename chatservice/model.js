const pool = require("./db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      from_user VARCHAR(100) NOT NULL,
      to_user VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTable();

module.exports = {
  create: async (from, to, message) => {
    const res = await pool.query(
      "INSERT INTO messages (from_user, to_user, message) VALUES ($1, $2, $3) RETURNING *",
      [from, to, message]
    );
    return res.rows[0];
  },
  getConversation: async (user1, user2) => {
    const res = await pool.query(`
      SELECT * FROM messages
      WHERE (from_user = $1 AND to_user = $2)
         OR (from_user = $2 AND to_user = $1)
      ORDER BY created_at ASC
    `, [user1, user2]);
    return res.rows;
  },
  getInbox: async (username) => {
    const res = await pool.query(
      "SELECT * FROM messages WHERE from_user = $1 OR to_user = $1 ORDER BY created_at DESC",
      [username]
    );
    return res.rows;
  },
  markRead: async (fromUser, toUser) => {
    await pool.query(
      "UPDATE messages SET read = true WHERE from_user = $1 AND to_user = $2",
      [fromUser, toUser]
    );
  }
};