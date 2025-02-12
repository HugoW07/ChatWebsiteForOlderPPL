const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.set("view engine", "ejs");

let users = [];
const USERS_FILE = path.join(__dirname, "users.json");

try {
  const data = fs.readFileSync(USERS_FILE, "utf8");
  users = JSON.parse(data);
} catch (error) {
  console.log("No existing user data found, starting fresh.");
}

const saveUsersToFile = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
};

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", requireAuth, (req, res) => {
  res.render("users/home", { user: req.session.user });
});

app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post("/login", (req, res) => {
  const { username, password, rememberMe } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return res.status(400).send("Invalid credentials");
  req.session.userId = user.id;
  req.session.user = user;
  if (rememberMe) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  }
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.get("/register", (req, res) => {
  res.render("users/register");
});

app.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    if (users.some((u) => u.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      email: "",
      privacy: "public",
    };
    users.push(newUser);
    saveUsersToFile();
    res.redirect("/login");
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

app.get("/profile", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/profile", { user });
});

app.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password");
});

app.get("/terms", (req, res) => {
  res.render("users/terms");
});

app.get("/settings", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/settings", { user });
});

app.post("/update-profile", requireAuth, (req, res) => {
  const { username, email } = req.body;
  const userIndex = users.findIndex((u) => u.id === req.session.userId);
  if (userIndex !== -1) {
    users[userIndex].username = username;
    users[userIndex].email = email;
    saveUsersToFile();
    res.redirect("/settings");
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/update-privacy", requireAuth, (req, res) => {
  const { privacy } = req.body;
  const userIndex = users.findIndex((u) => u.id === req.session.userId);
  if (userIndex !== -1) {
    users[userIndex].privacy = privacy;
    saveUsersToFile();
    res.redirect("/settings");
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/delete-account", requireAuth, (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.session.userId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    saveUsersToFile();
    req.session.destroy((err) => {
      if (err) return res.redirect("/");
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  } else {
    res.status(404).send("User not found");
  }
});

app.get("/help", (req, res) => {
  res.render("users/help");
});

app.get("/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const results = users.filter((user) =>
    user.username.toLowerCase().includes(query)
  );
  res.json(results);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
