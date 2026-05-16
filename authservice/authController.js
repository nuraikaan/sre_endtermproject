const User = require("./model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, password, role, adminCode } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne(username);
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    let finalRole = "user";
    if (role === "admin") {
      if (adminCode !== process.env.ADMIN_CODE)
        return res.status(403).json({ message: "Invalid admin code" });
      finalRole = "admin";
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create(username, hashed, finalRole);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne(username);
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};