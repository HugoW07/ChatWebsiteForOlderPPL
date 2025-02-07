const express = require("express");
const router = express.Router();

const users = [];

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    if (users.some((u) => u.username === username)) {
      return res.status(400).send("Username already exists");
    }
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
    };
    users.push(newUser);
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

router.get("/profile", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/profile", { user });
});

module.exports = router;
