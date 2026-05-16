const express = require("express");
const router = express.Router();
const controller = require("./controller");
const auth = require("./middleware");

router.post("/cart", auth, controller.addToCart);
router.get("/cart", auth, controller.getCart);
router.delete("/cart/:productId", auth, controller.removeFromCart);

router.post("/orders", auth, controller.createOrder);
router.get("/orders", auth, controller.findOrdersByUser);
router.get("/orders/all", auth, controller.findAllOrders);

router.post("/favorites", auth, controller.addFavorite);
router.get("/favorites", auth, controller.getFavorites);
router.delete("/favorites/:productId", auth, controller.removeFavorite);

module.exports = router;