const Message = require("./model");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const msg = await Message.create({
      from: req.user.username,
      to,
      message
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { username } = req.params;
    const me = req.user.username;

    const messages = await Message.find({
      $or: [
        { from: me, to: username },
        { from: username, to: me }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get conversation" });
  }
};

// Get all conversations for current user
exports.getInbox = async (req, res) => {
  try {
    const me = req.user.username;

    const messages = await Message.find({
      $or: [{ from: me }, { to: me }]
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get inbox" });
  }
};

// Mark messages as read
exports.markRead = async (req, res) => {
  try {
    const { username } = req.params;
    const me = req.user.username;

    await Message.updateMany(
      { from: username, to: me, read: false },
      { read: true }
    );

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark read" });
  }
};