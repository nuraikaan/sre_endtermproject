const express = require("express");
const router = express.Router();
const controller = require("./controller");
const middleware = require("./middleware");

router.get("/profile", middleware, controller.getProfile);
router.put("/profile", middleware, controller.updateProfile);
router.get("/all", middleware, controller.getAllUsers);
router.delete("/:id", middleware, controller.deleteUser);

module.exports = router;