const Payment = require("./model");

exports.processPayment = async (req, res) => {
  try {
    const { user_id, order_id, amount, method } = req.body;

    if (!user_id || !order_id || !amount || !method)
      return res.status(400).json({ message: "Missing fields" });

    const validMethods = ["credit_card", "debit_card", "paypal"];
    if (!validMethods.includes(method))
      return res.status(400).json({ message: "Invalid payment method" });

    const status = Math.random() > 0.1 ? "success" : "failed";

    const payment = await Payment.create(user_id, order_id, amount, method, status);
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
};