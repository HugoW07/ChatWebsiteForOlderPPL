document.addEventListener("DOMContentLoaded", function () {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = darkModeToggle.nextElementSibling;

  const isDarkMode = localStorage.getItem("darkMode") === "enabled";

  if (isDarkMode) {
    body.classList.add("dark-mode");
    themeIcon.src = "/assets/Light_mode.svg";
    themeLabel.textContent = "Light Mode";
  } else {
    themeIcon.src = "/assets/Dark_mode.svg";
    themeLabel.textContent = "Dark Mode";
  }

  darkModeToggle.addEventListener("click", function (event) {
    event.preventDefault();

    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      themeIcon.src = "/assets/Light_mode.svg";
      themeLabel.textContent = "Light Mode";
    } else {
      localStorage.setItem("darkMode", "disabled");
      themeIcon.src = "/assets/Dark_mode.svg";
      themeLabel.textContent = "Dark Mode";
    }
  });
});