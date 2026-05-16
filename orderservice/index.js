const express = require("express");
require("dotenv").config();

const client = require("prom-client");

const app = express();
app.use(express.json());

client.collectDefaultMetrics();

const httpRequests = new client.Counter({
  name: "order_http_requests_total",
  help: "Total HTTP requests in order service",
  labelNames: ["method", "route", "status"]
});

const httpErrors = new client.Counter({
  name: "order_http_errors_total",
  help: "Total HTTP errors in order service"
});

// middleware для подсчёта
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });

    if (res.statusCode >= 400) {
      httpErrors.inc();
    }
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const routes = require("./routes");
app.use("/", routes);

app.get("/health", (req, res) => res.send("Order Service OK"));

app.use((err, req, res, next) => {
  console.error("ORDER ERROR:", err);
  httpErrors.inc();
  res.status(500).json({ message: "Order service error" });
});

app.listen(3002, () => {
  console.log("Order service running on port 3002");
});
