// Vänta tills DOM (Document Object Model) är helt laddad innan skriptet körs
document.addEventListener("DOMContentLoaded", function () {
  // Hämta element från DOM
  const darkModeToggle = document.getElementById("darkModeToggle"); // Knapp för att växla mellan mörkt/ljust läge
  const body = document.body; // Body-element för att lägga till/ta bort klasser
  const themeIcon = document.getElementById("themeIcon"); // Ikon för att visa aktuellt tema
  const themeLabel = darkModeToggle.nextElementSibling; // Textetikett bredvid knappen

  // Loggor i navbar och footer
  const navbarLogo = document.querySelector(".navbar-logo"); // Logga i navbar
  const footerLogo = document.querySelector(".footer-logo"); // Logga i footer

  // Definiera sökvägar för loggor i ljust och mörkt läge
  const lightModeLogo = "/assets/VintageChat.png"; // Logga för ljust läge
  const darkModeLogo = "/assets/VintageChat_Light.png"; // Logga för mörkt läge

  // Kontrollera om mörkt läge är aktiverat i localStorage
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";

  // Funktion för att uppdatera loggor baserat på aktuellt läge
  function updateLogos(isDark) {
    if (isDark) {
      navbarLogo.src = darkModeLogo; // Uppdatera navbar-loggan till mörkt läge
      footerLogo.src = darkModeLogo; // Uppdatera footer-loggan till mörkt läge
    } else {
      navbarLogo.src = lightModeLogo; // Uppdatera navbar-loggan till ljust läge
      footerLogo.src = lightModeLogo; // Uppdatera footer-loggan till ljust läge
    }
  }

  // Initial kontroll av läge
  if (isDarkMode) {
    body.classList.add("dark-mode");
    themeIcon.src = "/assets/Light_mode.svg"; // Byt ikon till ljust läge
    themeLabel.textContent = "Light Mode"; // Byt text till "Light Mode"
    updateLogos(true); // Uppdatera loggor till mörkt läge
  } else {
    themeIcon.src = "/assets/Dark_mode.svg"; // Byt ikon till mörkt läge
    themeLabel.textContent = "Dark Mode"; // Byt text till "Dark Mode"
    updateLogos(false); // Uppdatera loggor till ljust läge
  }

  // Lyssna efter klick på knappen för att växla mellan mörkt/ljust läge
  darkModeToggle.addEventListener("click", function (event) {
    event.preventDefault(); // Förhindra standardbeteendet för knappen

    // Växla klassen "dark-mode" på body-elementet
    body.classList.toggle("dark-mode");

    // Om mörkt läge är aktiverat efter växling, uppdatera localStorage, ikon, text och loggor
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled"); // Spara att mörkt läge är aktiverat i localStorage
      themeIcon.src = "/assets/Light_mode.svg"; // Byt ikon till ljust läge
      themeLabel.textContent = "Light Mode"; // Byt text till "Light Mode"
      updateLogos(true); // Uppdatera loggor till mörkt läge
    } else {
      localStorage.setItem("darkMode", "disabled"); // Spara att mörkt läge är avaktiverat i localStorage
      themeIcon.src = "/assets/Dark_mode.svg"; // Byt ikon till mörkt läge
      themeLabel.textContent = "Dark Mode"; // Byt text till "Dark Mode"
      updateLogos(false); // Uppdatera loggor till ljust läge
    }
  });
});
