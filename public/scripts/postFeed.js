document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");
  const postFeed = document.getElementById("postFeed");
  let postedIds = new Set(); // Track post IDs we've already displayed

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const post = await response.json();
        addPostToFeed(post);
        postedIds.add(post.id); // Track that we've added this post
        event.target.reset();

        // Clear the file name display
        document.getElementById("file-name-display").textContent =
          "No file selected";
      } else {
        alert("Failed to post.");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  });

  function addPostToFeed(post) {
    // Skip if we've already added this post
    if (postedIds.has(post.id)) {
      return;
    }

    const postCard = document.createElement("div");
    postCard.className = "post-card";

    postCard.innerHTML = `
      <h2>${post.user}</h2>
      <p>${post.content}</p>
      ${
        post.image
          ? `<img src="${post.image}" alt="Post Image" class="post-image">`
          : ""
      }
      <p class="post-time">
        Posted on ${new Date(post.createdAt).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    `;

    postedIds.add(post.id); // Track that we've added this post
    postFeed.prepend(postCard);
  }

  async function fetchPosts() {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const posts = await response.json();
        posts.forEach(addPostToFeed);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // Add file name display functionality
  const fileInput = document.getElementById("image-upload");
  const fileNameDisplay = document.getElementById("file-name-display");

  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", (event) => {
      if (event.target.files.length > 0) {
        fileNameDisplay.textContent = event.target.files[0].name;
      } else {
        fileNameDisplay.textContent = "No file selected";
      }
    });
  }

  fetchPosts();
});
