const db = require("./model");
const axios = require("axios");

// Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const item = await db.addToCart(req.user.id, productId, quantity || 1);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const items = await db.getCart(req.user.id);
    const result = [];

    for (let item of items) {
      try {
        const product = await axios.get(
          `http://productservice:3003/products/${item.product_id}`
        );
        result.push({ ...item, product: product.data });
      } catch {
        result.push({ ...item, product: null });
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await db.removeFromCart(req.user.id, req.params.productId);
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
};

// Favorites
exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const fav = await db.addFavorite(req.user.id, productId);
    res.status(201).json(fav);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Already added or failed" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favs = await db.getFavorites(req.user.id);
    const result = [];

    for (let f of favs) {
      try {
        const product = await axios.get(
          `http://productservice:3003/products/${f.product_id}`
        );
        result.push(product.data);
      } catch {
        result.push({ id: f.product_id, error: "not found" });
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get favorites" });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await db.removeFavorite(req.user.id, req.params.productId);
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};

// Orders
exports.createOrder = async (req, res) => {
  try {
    const items = await db.getCart(req.user.id);

    if (!items.length)
      return res.status(400).json({ message: "Cart is empty" });

    let total = 0;
    for (let item of items) {
      try {
        const response = await axios.get(
          `http://productservice:3003/products/${item.product_id}`
        );
        total += response.data.price * item.quantity;
      } catch {
        total += 0;
      }
    }

    const order = await db.createOrder(
      req.user.id,
      items.map(i => ({ productId: i.product_id, quantity: i.quantity })),
      total
    );

    await db.clearCart(req.user.id);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order failed" });
  }
};

exports.findOrdersByUser = async (req, res) => {
  try {
    const orders = await db.findOrdersByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get orders" });
  }
};

exports.findAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admins only" });
    const orders = await db.findAllOrders();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all orders" });
  }
};