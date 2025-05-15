// Importera nödvändiga moduler
const express = require("express"); // Webbserver-ramverk för Node.js
const session = require("express-session"); // Modul för hantering av användarsessioner
const path = require("path"); // Modul för att arbeta med filsökvägar
const fs = require("fs"); // Modul för att arbeta med filsystemet
const multer = require("multer"); // Modul för att hantera multipart/form-data (filuppladdningar)

const app = express(); // Skapa en ny Express-instans

// Konfigurera multer för filstorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Se till att katalogen "uploads" finns
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Skapa ett unikt filnamn med originalförlängning
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Använd statiska filer från mappen "public"
app.use(express.static(path.join(__dirname, "public")));

// Parsa URL-kodade formulärdata
app.use(express.urlencoded({ extended: true }));

// Parsa JSON-begäranden
app.use(express.json());

// Konfigurera sessioner
app.use(
  session({
    secret: "your-secret-key", // Hemlig nyckel för att signera sessionscookies
    resave: false, // Spara inte sessionen om den inte har ändrats
    saveUninitialized: false, // Skapa ingen session förrän något lagras
    cookie: {
      secure: process.env.NODE_ENV === "production", // Använd HTTPS i produktion
      maxAge: 30 * 24 * 60 * 60 * 1000, // Maximal ålder på cookie (30 dagar)
    },
  })
);

// Använd EJS som mallmotor
app.set("view engine", "ejs");

// Läs in användardata från filen "users.json"
let users = [];
const USERS_FILE = path.join(__dirname, "users.json");

try {
  const data = fs.readFileSync(USERS_FILE, "utf8");
  users = JSON.parse(data);
} catch (error) {
  console.log("Inga användardata hittades, börjar från början.");
}

// Funktion för att spara användardata till filen "users.json"
const saveUsersToFile = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
};

// Läs in inläggsdata från filen "posts.json"
let posts = [];
const POSTS_FILE = path.join(__dirname, "posts.json");

try {
  const data = fs.readFileSync(POSTS_FILE, "utf8");
  posts = JSON.parse(data);
} catch (error) {
  console.log("Inga inläggsdata hittades, börjar från början.");
}

// Funktion för att spara inläggsdata till filen "posts.json"
const savePostsToFile = () => {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
};

// Mellanprogram för att kräva autentisering
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

// Huvudsida, kräver autentisering
app.get("/", requireAuth, (req, res) => {
  res.render("users/home", { user: req.session.user, posts });
});

// Visa inloggningsformulär
app.get("/login", (req, res) => {
  res.render("users/login");
});

// Hantera inloggningsförfrågan
app.post("/login", (req, res) => {
  const { username, password, rememberMe } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return res.status(400).send("Ogiltiga uppgifter");
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

// Visa registreringsformulär
app.get("/register", (req, res) => {
  res.render("users/register");
});

// Hantera registreringsförfrågan
app.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    if (users.some((u) => u.username === username)) {
      return res.status(400).json({ error: "Användarnamnet finns redan" });
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
    res.status(500).json({ error: "Fel vid registrering av användare" });
  }
});

// Visa användarprofil
app.get("/profile", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/profile", { user });
});

// Visa lösenordsåterställningsformulär
app.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password");
});

// Visa villkorssida
app.get("/terms", (req, res) => {
  res.render("users/terms");
});

app.get("/chat", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/chat", { user });
});

// Visa inställningssida, kräver autentisering
app.get("/settings", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("users/settings", { user });
});

// Uppdatera användarprofil, kräver autentisering
app.post("/update-profile", requireAuth, (req, res) => {
  const { username, email } = req.body;
  const userIndex = users.findIndex((u) => u.id === req.session.userId);
  if (userIndex !== -1) {
    users[userIndex].username = username;
    users[userIndex].email = email;
    saveUsersToFile();
    res.redirect("/settings");
  } else {
    res.status(404).send("Användaren hittades inte");
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
    res.status(404).send("Användaren hittades inte");
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
    res.status(404).send("Användaren hittades inte");
  }
});

// Visa hjälpsida
app.get("/help", (req, res) => {
  res.render("users/help");
});

// Sök efter användare efter användarnamn
app.get("/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const results = users.filter((user) =>
    user.username.toLowerCase().includes(query)
  );
  res.json(results);
});

// Hämta alla inlägg
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// Skapa ett nytt inlägg med multer
app.post("/api/posts", requireAuth, upload.single("image"), (req, res) => {
  try {
    // req.file innehåller information om den uppladdade filen
    // req.body innehåller textfälten (som content)

    const user = req.session.user.username;
    const content = req.body.content;
    let image = null;

    if (req.file) {
      // Skapa en webbaserad sökväg till filen
      image = `/uploads/${req.file.filename}`;
    }

    const newPost = {
      user,
      content,
      image,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    savePostsToFile();

    res.json(newPost);
  } catch (error) {
    console.error("Fel vid skapande av inlägg:", error);
    res.status(500).json({ error: "Fel vid skapande av inlägg" });
  }
});

// Här lägger vi till nya konstanter för chatten
const MESSAGES_FILE = path.join(__dirname, "messages.json");
const ROOMS_FILE = path.join(__dirname, "rooms.json");

// Läs in chattmeddelanden från filen "messages.json"
let messages = {};
try {
  const data = fs.readFileSync(MESSAGES_FILE, "utf8");
  messages = JSON.parse(data);
} catch (error) {
  console.log("Inga chattmeddelanden hittades, börjar från början.");
  // Skapa grundstruktur för meddelanden per rum
  messages = {
    general: [],
    announcements: [],
    support: [],
  };
}

// Funktion för att spara chattmeddelanden till filen "messages.json"
const saveMessagesToFile = () => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
};

// Läs in rum från filen "rooms.json"
let rooms = {};
try {
  const data = fs.readFileSync(ROOMS_FILE, "utf8");
  rooms = JSON.parse(data);
} catch (error) {
  console.log("Inga rumdata hittades, börjar från början.");
  // Skapa grundstruktur för rum
  rooms = {
    general: {
      name: "General",
      description:
        "Welcome to the General chat room. This is a space for all users to chat together.",
      members: [],
    },
    announcements: {
      name: "Announcements",
      description:
        "Important updates and announcements from the VintageChat team.",
      members: [],
    },
    support: {
      name: "Support",
      description:
        "Need help? Ask your questions here and get support from our team and community.",
      members: [],
    },
  };
}

// Funktion för att spara rumdata till filen "rooms.json"
const saveRoomsToFile = () => {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), "utf8");
};

// Hålla reda på online-användare
let onlineUsers = [];

// API-routes för chat

// Hämta meddelanden för ett specifikt rum
app.get("/api/messages/:room", (req, res) => {
  const room = req.params.room;
  const since = req.query.since ? parseInt(req.query.since) : 0;

  if (!messages[room]) {
    return res.status(404).json({ error: "Rummet hittades inte" });
  }

  // Returnera endast meddelanden efter den angivna tidsstämpeln
  const newMessages = messages[room].filter((msg) => {
    return new Date(msg.timestamp).getTime() > since;
  });

  res.json(newMessages);
});

// Skicka ett nytt meddelande
app.post("/api/messages", requireAuth, (req, res) => {
  const { room, content } = req.body;
  const user = req.session.user;

  if (!room || !content) {
    return res.status(400).json({ error: "Rum och innehåll krävs" });
  }

  if (!messages[room]) {
    return res.status(404).json({ error: "Rummet hittades inte" });
  }

  const newMessage = {
    id: Date.now().toString(),
    username: user.username,
    content,
    timestamp: new Date().toISOString(),
  };

  messages[room].push(newMessage);

  // Begränsa antalet meddelanden per rum för att undvika att filen blir för stor
  if (messages[room].length > 100) {
    messages[room] = messages[room].slice(-100);
  }

  saveMessagesToFile();

  // Lägg till användaren som medlem i rummet om de inte redan är det
  if (!rooms[room].members.includes(user.username)) {
    rooms[room].members.push(user.username);
    saveRoomsToFile();
  }

  res.json(newMessage);
});

// Hämta online-användare
app.get("/api/users/online", (req, res) => {
  // Rensa användare som inte varit aktiva på mer än 5 minuter
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  onlineUsers = onlineUsers.filter((user) => user.lastActive > fiveMinutesAgo);

  res.json(onlineUsers.map((user) => ({ username: user.username })));
});

// Uppdatera användarstatus
app.post("/api/users/status", requireAuth, (req, res) => {
  const { status } = req.body;
  const user = req.session.user;

  if (status === "online") {
    // Uppdatera eller lägg till användaren i listan över online-användare
    const existingUser = onlineUsers.find((u) => u.username === user.username);
    if (existingUser) {
      existingUser.lastActive = Date.now();
    } else {
      onlineUsers.push({
        username: user.username,
        lastActive: Date.now(),
      });
    }
  } else if (status === "offline") {
    // Ta bort användaren från listan över online-användare
    onlineUsers = onlineUsers.filter((u) => u.username !== user.username);
  }

  res.json({ success: true });
});

// Hämta medlemmar i ett rum
app.get("/api/rooms/:room/members", (req, res) => {
  const room = req.params.room;

  if (!rooms[room]) {
    return res.status(404).json({ error: "Rummet hittades inte" });
  }

  res.json({
    count: rooms[room].members.length,
    members: rooms[room].members,
  });
});

// Servera uppladdade filer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Starta servern på port 3000
app.listen(3000, () => {
  console.log("Servern körs på port 3000");
});
