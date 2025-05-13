// Chattfunktionalitet för VintageChat
document.addEventListener("DOMContentLoaded", function () {
  // Hämta DOM-element
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("chat-messages");
  const chatMessage = document.getElementById("chat-message");
  const onlineUsers = document.getElementById("online-users");
  const currentRoomEl = document.getElementById("current-room");
  const roomMembers = document.getElementById("room-members");
  const roomDescription = document.getElementById("room-description");
  const chatRooms = document.getElementById("chat-rooms");

  // Hämta användarnamn från sessionen
  const username = document
    .querySelector(".user-info strong + p")
    .textContent.split(": ")[1];

  // Anslut till Socket.io-servern
  const socket = io();

  // Aktuellt chattrum
  let currentRoom = "general";

  // Hantera rumsval
  chatRooms.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
      const room = e.target.getAttribute("data-room");

      // Lämna nuvarande rum och gå med i det nya
      if (room !== currentRoom) {
        // Uppdatera UI
        document
          .querySelector(`#chat-rooms li[data-room="${currentRoom}"]`)
          .classList.remove("active");
        e.target.classList.add("active");

        // Töm meddelanderna
        chatMessages.innerHTML = "";

        // Meddela servern att användaren byter rum
        socket.emit("leaveRoom", currentRoom);
        socket.emit("joinRoom", { username, room });

        // Uppdatera rumsvariabler
        currentRoom = room;
        currentRoomEl.textContent =
          room.charAt(0).toUpperCase() + room.slice(1);

        // Uppdatera rumsbeskrivning
        updateRoomDescription(room);
      }
    }
  });

  // Uppdatera rumsbeskrivning baserat på aktuellt rum
  function updateRoomDescription(room) {
    const descriptions = {
      general:
        "Welcome to the General chat room. This is a space for all users to chat together.",
      announcements:
        "Welcome to the Announcements room. Here you can find important updates and news about VintageChat.",
      support:
        "Welcome to the Support room. If you need help with anything, ask here and someone will assist you.",
    };

    roomDescription.innerHTML = `<p>${
      descriptions[room] || descriptions.general
    }</p>`;
  }

  // Skicka chattmeddelande
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Hämta meddelande
    const msg = chatMessage.value.trim();

    if (msg) {
      // Skicka meddelande till servern
      socket.emit("chatMessage", {
        room: currentRoom,
        message: msg,
      });

      // Rensa input-fältet
      chatMessage.value = "";
      chatMessage.focus();
    }
  });

  // Lyssna efter rum-join event
  socket.on("roomUsers", function (data) {
    const { room, users } = data;

    // Uppdatera rumsmedlemmar
    roomMembers.textContent = `${users.length} user${
      users.length !== 1 ? "s" : ""
    } online`;

    // Uppdatera online användare
    updateOnlineUsersList(users);
  });

  // Uppdatera listan på online användare
  function updateOnlineUsersList(users) {
    onlineUsers.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user.username;
      onlineUsers.appendChild(li);
    });
  }

  // Förbered för meddelande-UI
  function formatTime() {
    const now = new Date();
    return (
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0")
    );
  }

  // Ta emot meddelande från servern
  socket.on("message", function (message) {
    // Skapa meddelandeelement
    const div = document.createElement("div");
    div.classList.add("message");

    // Kolla om meddelandet är från den inloggade användaren
    const isOwnMessage = message.username === username;
    div.classList.add(isOwnMessage ? "message-own" : "message-other");

    // Bygg meddelande-HTML
    div.innerHTML = `
      <div class="message-sender">${message.username}</div>
      <p class="message-content">${message.text}</p>
      <div class="message-time">${formatTime()}</div>
    `;

    // Lägg till meddelandet i chattflödet
    chatMessages.appendChild(div);

    // Scrolla ner till senaste meddelandet
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Lyssna efter välkomstmeddelande
  socket.on("welcome", function (message) {
    // Visa systemmeddelande
    const div = document.createElement("div");
    div.classList.add("message", "message-system");
    div.innerHTML = `
      <p class="message-content">${message.text}</p>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Skicka användarinfo till servern när sidan laddas
  socket.emit("joinRoom", { username, room: currentRoom });

  // Ping-pong för att hålla anslutningen aktiv
  setInterval(() => {
    socket.emit("keepAlive");
  }, 30000);
});
