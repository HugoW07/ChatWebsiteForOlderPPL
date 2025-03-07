// Importera nödvändiga moduler
const express = require("express"); // Webbservramverk för Node.js
const session = require("express-session"); // Modul för att hantera användarsessioner
const path = require("path"); // Modul för att arbeta med filsökvägar
const fs = require("fs"); // Modul för att arbeta med filsystemet
const app = express(); // Skapa en ny instans av Express

// Använd statiska filer från mappen "public"
app.use(express.static(path.join(__dirname, "public")));

// Parsa URL kodade formulärdata
app.use(express.urlencoded({ extended: true }));

// Konfigurera sessioner
app.use(
  session({
    secret: "your-secret-key", // Hemlig nyckel för att signera sessioncookies
    resave: false, // Spara inte sessionen om den inte ändrats
    saveUninitialized: false, // Skapa inte en session för varje request utanför innehåll
    cookie: {
      secure: process.env.NODE_ENV === "production", // Använd HTTPS i produktionsmiljön
      maxAge: 30 * 24 * 60 * 60 * 1000, // Maxålder för cookien (30 dagar)
    },
  })
);

// Använd EJS som templatemotor
app.set("view engine", "ejs");

// Läs in användardata från filen "users.json"
let users = [];
const USERS_FILE = path.join(__dirname, "users.json");

try {
  const data = fs.readFileSync(USERS_FILE, "utf8");
  users = JSON.parse(data);
} catch (error) {
  console.log("No existing user data found, starting fresh.");
}

// Funktion för att spara användardata till filen "users.json"
const saveUsersToFile = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
};

// Middleware för att kräva autentisering
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

// Huvudsida, kräver autentisering
app.get("/", requireAuth, (req, res) => {
  res.render("users/home", { user: req.session.user });
});

// Visa inloggningsformuläret
app.get("/login", (req, res) => {
  res.render("users/login");
});

// Hantera inloggningsförfrågan
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

// Hantera utloggningsförfrågan
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// Visa registreringsformuläret
app.get("/register", (req, res) => {
  res.render("users/register");
});

// Hantera registreringsförfrågan
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

// Visa användarprofilen
app.get("/profile", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/profile", { user });
});

// Visa formuläret för att återställa lösenord
app.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password");
});

// Visa villkorssidan
app.get("/terms", (req, res) => {
  res.render("users/terms");
});

// Visa inställningssidan, kräver autentisering
app.get("/settings", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/settings", { user });
});

// Uppdatera användarprofilen, kräver autentisering
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

// Uppdatera sekretessinställningar, kräver autentisering
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

// Ta bort användarkonto, kräver autentisering
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

// Visa hjälpsidan
app.get("/help", (req, res) => {
  res.render("users/help");
});

// Sök efter användare baserat på användarnamn
app.get("/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const results = users.filter((user) =>
    user.username.toLowerCase().includes(query)
  );
  res.json(results);
});

// Starta servern på port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
