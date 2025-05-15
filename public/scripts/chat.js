// Chat functionality using AJAX instead of Socket.io
document.addEventListener("DOMContentLoaded", function () {
  // Chat state
  const currentUser = document
    .querySelector(".user-info p strong")
    .nextSibling.textContent.trim();
  let currentRoom = "general";
  let lastMessageTimestamp = 0;

  // DOM elements
  const chatForm = document.getElementById("chat-form");
  const chatMessageInput = document.getElementById("chat-message");
  const chatMessagesContainer = document.getElementById("chat-messages");
  const currentRoomTitle = document.getElementById("current-room");
  const roomMembersText = document.getElementById("room-members");
  const chatRooms = document.getElementById("chat-rooms");
  const roomDescription = document.getElementById("room-description");

  // Room descriptions
  const roomDescriptions = {
    general:
      "Welcome to the General chat room. This is a space for all users to chat together.",
    announcements:
      "Important updates and announcements from the VintageChat team.",
    support:
      "Need help? Ask your questions here and get support from our team and community.",
  };

  // Function to format time
  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Function to create a message element
  function createMessageElement(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className =
      message.username === currentUser
        ? "message message-own"
        : "message message-other";

    const senderDiv = document.createElement("div");
    senderDiv.className = "message-sender";
    senderDiv.textContent = message.username;

    const contentP = document.createElement("p");
    contentP.className = "message-content";
    contentP.textContent = message.content;

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.textContent = formatTime(message.timestamp);

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeDiv);

    return messageDiv;
  }

  // Function to load messages for a room
  function loadMessages(room) {
    fetch(`/api/messages/${room}?since=${lastMessageTimestamp}`)
      .then((response) => response.json())
      .then((messages) => {
        if (messages.length > 0) {
          messages.forEach((message) => {
            chatMessagesContainer.appendChild(createMessageElement(message));
            lastMessageTimestamp = Math.max(
              lastMessageTimestamp,
              new Date(message.timestamp).getTime()
            );
          });

          // Scroll to bottom of chat
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      })
      .catch((error) => console.error("Error loading messages:", error));
  }

  // Function to update online users
  function updateOnlineUsers() {
    fetch("/api/users/online")
      .then((response) => response.json())
      .then((users) => {
        const onlineUsersList = document.getElementById("online-users");
        onlineUsersList.innerHTML = "";

        users.forEach((user) => {
          const li = document.createElement("li");
          li.textContent = user.username;
          onlineUsersList.appendChild(li);
        });
      })
      .catch((error) => console.error("Error updating online users:", error));
  }

  // Function to send a message
  function sendMessage(content) {
    fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: currentRoom,
        content: content,
      }),
    })
      .then((response) => response.json())
      .then((message) => {
        chatMessagesContainer.appendChild(createMessageElement(message));
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        lastMessageTimestamp = new Date(message.timestamp).getTime();
      })
      .catch((error) => console.error("Error sending message:", error));
  }

  // Function to switch chat room
  function switchRoom(room) {
    // Update UI
    currentRoom = room;
    currentRoomTitle.textContent = room.charAt(0).toUpperCase() + room.slice(1);
    roomDescription.innerHTML = `<p>${roomDescriptions[room]}</p>`;

    // Clear messages
    chatMessagesContainer.innerHTML = "";
    lastMessageTimestamp = 0;

    // Load messages for the new room
    loadMessages(room);

    // Update active room in the rooms list
    const roomItems = chatRooms.querySelectorAll("li");
    roomItems.forEach((item) => {
      if (item.dataset.room === room) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update room members
    fetch(`/api/rooms/${room}/members`)
      .then((response) => response.json())
      .then((data) => {
        roomMembersText.textContent = `${data.count} members`;
      })
      .catch((error) => console.error("Error fetching room members:", error));
  }

  // Event listeners
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const message = chatMessageInput.value.trim();
    if (message) {
      sendMessage(message);
      chatMessageInput.value = "";
    }
  });

  // Room switching
  chatRooms.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
      const room = e.target.dataset.room;
      switchRoom(room);
    }
  });

  // Initialize
  switchRoom("general");
  updateOnlineUsers();

  // Set up polling for new messages and online users
  setInterval(() => loadMessages(currentRoom), 3000);
  setInterval(updateOnlineUsers, 10000);

  // Update user status as online
  fetch("/api/users/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "online" }),
  }).catch((error) => console.error("Error updating status:", error));

  // Set user as offline when leaving page
  window.addEventListener("beforeunload", function () {
    fetch("/api/users/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "offline" }),
      keepalive: true,
    }).catch((error) => console.error("Error updating status:", error));
  });
});
