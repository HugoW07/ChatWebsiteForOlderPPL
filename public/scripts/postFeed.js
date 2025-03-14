document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");
  const postFeed = document.getElementById("postFeed");

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
        event.target.reset();
      } else {
        alert("Failed to post.");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  });

  function addPostToFeed(post) {
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
    `;

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

  fetchPosts();
});
