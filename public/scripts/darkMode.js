// Vänta tills DOM (Document Object Model) är helt laddad innan du kör skriptet
document.addEventListener("DOMContentLoaded", function () {
  // Hämta elementen från DOM
  const darkModeToggle = document.getElementById("darkModeToggle"); // Knappen för att växla mörkt/ljust läge
  const body = document.body; // Body-elementet för att lägga till/ta bort klasser
  const themeIcon = document.getElementById("themeIcon"); // Ikon för att visa aktuellt tema
  const themeLabel = darkModeToggle.nextElementSibling; // Text label bredvid knappen

  // Kontrollera om mörkt läge är aktiverat i localStorage
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";

  // Om mörkt läge är aktiverat, lägg till klassen "dark-mode" till body och uppdatera ikon och text
  if (isDarkMode) {
    body.classList.add("dark-mode");
    themeIcon.src = "/assets/Light_mode.svg"; // Byt ikon till ljuslägesikon
    themeLabel.textContent = "Light Mode"; // Byt text till "Light Mode"
  } else {
    themeIcon.src = "/assets/Dark_mode.svg"; // Byt ikon till mörktlägesikon
    themeLabel.textContent = "Dark Mode"; // Byt text till "Dark Mode"
  }

  // Lyssna efter klick på knappen för att växla mörkt/ljust läge
  darkModeToggle.addEventListener("click", function (event) {
    event.preventDefault(); // Förhindra standardbeteendet för knappen

    // Växla klassen "dark-mode" på body-elementet
    body.classList.toggle("dark-mode");

    // Om mörkt läge är aktiverat efter växling, uppdatera localStorage och ikon/text
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled"); // Spara att mörkt läge är aktiverat i localStorage
      themeIcon.src = "/assets/Light_mode.svg"; // Byt ikon till ljuslägesikon
      themeLabel.textContent = "Light Mode"; // Byt text till "Light Mode"
    } else {
      localStorage.setItem("darkMode", "disabled"); // Spara att mörkt läge är avaktiverat i localStorage
      themeIcon.src = "/assets/Dark_mode.svg"; // Byt ikon till mörktlägesikon
      themeLabel.textContent = "Dark Mode"; // Byt text till "Dark Mode"
    }
  });
});
