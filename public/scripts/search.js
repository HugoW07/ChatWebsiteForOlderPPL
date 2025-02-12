document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("searchBar");
  const searchResultsContainer = document.getElementById("searchResults");

  searchBar.addEventListener("input", function () {
    const query = searchBar.value.trim().toLowerCase();
    if (query.length === 0) {
      searchResultsContainer.classList.remove("visible");
      searchResultsContainer.innerHTML = "";
      return;
    }

    searchResultsContainer.classList.add("visible");

    fetch(`/search?query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        displaySearchResults(data);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  });

  function displaySearchResults(users) {
    if (users.length === 0) {
      searchResultsContainer.innerHTML = `<p>No results found</p>`;
      return;
    }

    let resultsHTML = `<h2>Search Results</h2><ul>`;
    users.forEach((user) => {
      resultsHTML += `<li><a href="/profile/${user.id}">${user.username}</a></li>`;
    });
    resultsHTML += `</ul>`;
    searchResultsContainer.innerHTML = resultsHTML;
  }
});
