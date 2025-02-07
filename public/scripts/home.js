let fullName = document.getElementById("nameEditor");
let friends = [];
const oneDay = 24 * 60 * 60 * 1000;
let friendHolder = document.getElementById("friendHolder");
let sortButton = document.getElementById("sortButton");
document.getElementById("sortByName").addEventListener("click", sortName);
document.getElementById("sortByLastName").addEventListener("click", sortLName);
document.getElementById("sortByBirthdate").addEventListener("click", sortBDay);

function sortName() {
  friends.sort((a, b) => a.objName.localeCompare(b.objName));
  updateTable();
}

function sortLName() {
  friends.sort((a, b) => a.objLName.localeCompare(b.objLName));
  updateTable();
}

function sortBDay() {
  friends.sort((a, b) => new Date(a.objBirthDate) - new Date(b.objBirthDate));
  updateTable();
}

function createTrashCan() {
  const trashCan = new Image(20, 20);
  trashCan.src = "/assets/Trash.png";
  trashCan.classList.add("trash-can");

  trashCan.addEventListener("click", function (e) {
    const row = e.target.closest("tr");
    if (row) {
      const index = row.rowIndex - 1;
      friends.splice(index, 1);
      updateTable();

      if (friends.length === 0) {
        friendHolder.style.setProperty("display", "none");
      }
    }
  });

  return trashCan;
}

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function updateTable() {
  const tableBody = document
    .getElementById("contactTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";

  friends.forEach((friend) => {
    const newRow = tableBody.insertRow();

    const firstNameCell = newRow.insertCell(0);
    const lastNameCell = newRow.insertCell(1);
    const birthDateCell = newRow.insertCell(2);
    const daysTillBDayCell = newRow.insertCell(3);
    const trashCanCell = newRow.insertCell(4);

    firstNameCell.innerText = friend.objName;
    lastNameCell.innerText = friend.objLName;
    birthDateCell.innerText = friend.objBirthDate;

    const today = new Date();
    const birthdateObj = new Date(friend.objBirthDate);
    let nextBirthday = new Date(
      today.getFullYear(),
      birthdateObj.getMonth(),
      birthdateObj.getDate()
    );

    if (today > nextBirthday) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysTillBDay = Math.ceil((nextBirthday - today) / oneDay);
    daysTillBDayCell.innerText = daysTillBDay;

    trashCanCell.append(createTrashCan());

    if (daysTillBDay < 14) {
      alert("One of your friends has a birthday soon!");
    }
  });

  friendHolder.style.setProperty("display", friends.length ? "block" : "none");
}

function userForm(event) {
  event.preventDefault();

  const nameParts = fullName.querySelectorAll("input");
  const surname = document.getElementById("userName");
  surname.innerText =
    " " +
    nameParts[0].value +
    " " +
    nameParts[1].value +
    " " +
    nameParts[2].value;

  const nameHolder = document.getElementById("nameHolder");
  nameHolder.style.setProperty("display", "block");
  fullName.style.setProperty("display", "none");
}
fullName.addEventListener("submit", userForm);

document
  .getElementById("friendEditor")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const objName = document.getElementById("fName").value;
    const objLName = document.getElementById("lName").value;
    const objBirthDate = document.getElementById("bDate").value;

    friends.push({
      objName: objName.trim(),
      objLName: objLName.trim(),
      objBirthDate: objBirthDate.trim(),
    });

    updateTable();
    document.getElementById("friendEditor").reset();
  });
