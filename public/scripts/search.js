// Vänta tills DOM (Document Object Model) är helt laddad innan du kör skriptet
document.addEventListener("DOMContentLoaded", function () {
  // Hämta elementen från DOM
  const searchBar = document.getElementById("searchBar"); // Sökfältet
  const searchResultsContainer = document.getElementById("searchResults"); // Behållaren för sökresultaten

  // Lyssna efter input-händelser på sökfältet
  searchBar.addEventListener("input", function () {
    // Hämta och trimma frågesträngen från sökfältet, konvertera den till små bokstäver
    const query = searchBar.value.trim().toLowerCase();

    // Om frågesträngen är tom, dölj sökresultatsbehållaren och rensa dess innehåll
    if (query.length === 0) {
      searchResultsContainer.classList.remove("visible");
      searchResultsContainer.innerHTML = "";
      return;
    }

    // Visa sökresultatsbehållaren
    searchResultsContainer.classList.add("visible");

    // Skicka en GET-förfrågan till servern för att hämta sökresultaten
    fetch(`/search?query=${encodeURIComponent(query)}`)
      .then((response) => response.json()) // Konvertera svaret till JSON
      .then((data) => {
        displaySearchResults(data); // Visa sökresultaten
      })
      .catch((error) => {
        console.error("Error fetching search results:", error); // Logga eventuella fel
      });
  });

  // Funktion för att visa sökresultaten
  function displaySearchResults(users) {
    // Om inga användare hittades, visa ett meddelande om att inga resultat funnet
    if (users.length === 0) {
      searchResultsContainer.innerHTML = `<p>No results found</p>`;
      return;
    }

    // Skapa HTML för sökresultaten
    let resultsHTML = `<h2>Search Results</h2><ul>`;
    users.forEach((user) => {
      resultsHTML += `<li><a href="/profile/${user.id}">${user.username}</a></li>`; // Lägg till varje användare som en länk
    });
    resultsHTML += `</ul>`;

    // Sätt in genererade HTML i sökresultatsbehållaren
    searchResultsContainer.innerHTML = resultsHTML;
  }
});
