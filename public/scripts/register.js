// Vänta tills DOM (Document Object Model) är helt laddad innan du kör skriptet
document.addEventListener("DOMContentLoaded", function () {
  // Hämta elementen från DOM
  const showPwBtn = document.querySelector("#toggle-password"); // Knappen för att visa/dölja lösenord
  const showPwIcon = showPwBtn.querySelector("img"); // Ikonen på knappen för att visa/dölja lösenord
  const pwInput = document.querySelector("#password"); // Lösenordsfältet
  const confirmPasswordInput = document.querySelector("#confirm-password"); // Bekräfta lösenordsfältet
  const registerForm = document.querySelector("#registerForm"); // Registreringsformuläret
  const popupMessage = document.querySelector("#popupMessage"); // Popupmeddelande för felmeddelanden

  // Lyssna efter klick på knappen för att visa/dölja lösenord
  showPwBtn.addEventListener("click", () => {
    // Kontrollera om lösenordet är synligt (typen är "text")
    const isPasswordVisible = pwInput.type === "text";

    // Växla typen av lösenordsfältet och bekräfta lösenordsfältet mellan "password" och "text"
    pwInput.type = isPasswordVisible ? "password" : "text";
    confirmPasswordInput.type = isPasswordVisible ? "password" : "text";

    // Uppdatera ikonen på knappen beroende på om lösenordet är synligt eller ej
    showPwIcon.src = isPasswordVisible
      ? "/assets/Visibility.svg" // Visa ikonen för att dölja lösenord
      : "/assets/Visibility_off.svg"; // Visa ikonen för att visa lösenord
  });

  // Funktion för att validera att lösenorden matchar
  function validatePasswords() {
    if (pwInput.value !== confirmPasswordInput.value) {
      // Om lösenorden inte matchar, visa ett felmeddelande
      popupMessage.textContent = "Passwords do not match!";
      popupMessage.classList.add("error");
      popupMessage.style.display = "block";
      return false;
    } else {
      // Om lösenorden matchar, dölj eventuella tidigare felmeddelanden
      popupMessage.style.display = "none";
      return true;
    }
  }

  // Lyssna efter submit-händelse på registreringsformuläret
  registerForm.addEventListener("submit", function (event) {
    // Validera lösenorden
    if (!validatePasswords()) {
      event.preventDefault(); // Förhindra formulärets submission om lösenorden inte matchar
    }
  });
});

/*document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const popupMessage = document.getElementById("popupMessage");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    popupMessage.innerHTML = "";
    popupMessage.classList.remove("error");
    popupMessage.style.display = "none";

    const formData = new FormData(form);

    fetch(form.action, {
      method: form.method,
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          popupMessage.innerHTML = data.error;
          popupMessage.classList.add("error");
          popupMessage.style.display = "block";
        } else {
          console.log("Registration successful:", data.message);
          window.location.href = "/login";
        }
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        popupMessage.innerHTML = "An unexpected error occurred.";
        popupMessage.classList.add("error");
        popupMessage.style.display = "block";
      });
  });
}); */

/*  */
