document.addEventListener("DOMContentLoaded", function () {
  const showPwBtn = document.querySelector("#toggle-password");
  const showPwIcon = showPwBtn.querySelector("img");
  const pwInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirm-password");

  showPwBtn.addEventListener("click", () => {
    const isPasswordVisible = pwInput.type === "text";

    pwInput.type = isPasswordVisible ? "password" : "text";
    confirmPasswordInput.type = isPasswordVisible ? "password" : "text";

    showPwIcon.src = isPasswordVisible
      ? "/assets/Visibility.svg"
      : "/assets/Visibility_off.svg";
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
