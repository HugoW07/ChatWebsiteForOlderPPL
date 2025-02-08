const express = require("express");
const session = require("express-session");
const path = require("path");

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

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

const users = [];

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
