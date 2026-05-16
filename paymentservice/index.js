const express = require("express");
require("dotenv").config();
const client = require("prom-client");

const app = express();
app.use(express.json());

client.collectDefaultMetrics();

const httpRequests = new client.Counter({
  name: "payment_http_requests_total",
  help: "Total HTTP requests to payment service",
  labelNames: ["method", "route", "status"]
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const routes = require("./routes");
app.use("/payments", routes);

app.get("/health", (req, res) => res.send("Payment Service OK"));

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal error" });
});

app.listen(3006, () => console.log("Payment service running on port 3006"));