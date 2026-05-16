const express = require("express");
const router = express.Router();
const controller = require("./controller");
const middleware = require("./middleware");

router.post("/send", middleware, controller.sendMessage);
router.get("/inbox", middleware, controller.getInbox);
router.get("/:username", middleware, controller.getConversation);
router.put("/read/:username", middleware, controller.markRead);

module.exports = router;