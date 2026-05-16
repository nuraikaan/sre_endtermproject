const express = require("express");
require("dotenv").config();

const client = require("prom-client");

const app = express();
app.use(express.json());


client.collectDefaultMetrics();


const httpRequests = new client.Counter({
  name: "user_http_requests_total",
  help: "Total HTTP requests in user service",
  labelNames: ["method", "route", "status"]
});

const httpErrors = new client.Counter({
  name: "user_http_errors_total",
  help: "Total HTTP errors in user service"
});

// middleware
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

// routes
const routes = require("./routes");
app.use("/users", routes);

// health
app.get("/health", (req, res) => res.send("User Service OK"));

app.use((err, req, res, next) => {
  console.error("USER ERROR:", err);
  httpErrors.inc();
  res.status(500).json({ message: "User service error" });
});

app.listen(3004, () => {
  console.log("User service running on port 3004");
});