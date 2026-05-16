const express = require("express");
const router = express.Router();
const controller = require("./paymentController");

router.post("/process", controller.processPayment);
router.get("/", controller.getPayments);
router.get("/:id", controller.getPaymentById);

module.exports = router;