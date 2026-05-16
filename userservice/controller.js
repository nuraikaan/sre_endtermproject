const UserProfile = require("./model");

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, avatar } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { email, avatar },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    const users = await UserProfile.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    await UserProfile.findOneAndDelete({ userId: req.params.id });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};