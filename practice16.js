const colors = [
  "#FFD6A5",
  "#B8F2E6",
  "#AED9E0",
  "#FAF3B6",
  "#CDB4DB",
  "#FFADAD",
  "#BDE0FE",
  "#D9F99D"
];

const storageKey = "employeeCards";
const stack = document.querySelector("#stack");
const emptyCard = document.querySelector("#empty-card");
const addBtn = document.querySelector("#add-btn");
const nextBtn = document.querySelector("#next-btn");
const prevBtn = document.querySelector("#prev-btn");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelector("#close-btn");
const form = document.querySelector("#employee-form");
const nameInput = document.querySelector("#name");
const photoUrlInput = document.querySelector("#photo-url");
const ageInput = document.querySelector("#age");
const salaryInput = document.querySelector("#salary");
const salaryValue = document.querySelector("#salary-value");
const addressInput = document.querySelector("#address");

let employees = JSON.parse(localStorage.getItem(storageKey)) || [];
let topIndex = employees.length - 1;

function formatSalary(value) {
  return "Rs. " + Number(value || 50000).toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveEmployees() {
  localStorage.setItem(storageKey, JSON.stringify(employees));
}

function getPhotoSource(employee) {
  return employee.photo || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&auto=format&fit=crop&q=80";
}

function updateButtons() {
  const hasCards = employees.length > 0;
  nextBtn.disabled = !hasCards;
  prevBtn.disabled = !hasCards;
}

function updateSalaryText() {
  salaryValue.textContent = formatSalary(salaryInput.value);
}

function renderCards() {
  const oldCards = document.querySelectorAll(".employee-card");
  oldCards.forEach(function (card) {
    card.remove();
  });

  emptyCard.style.display = employees.length === 0 ? "flex" : "none";

  employees.forEach(function (employee, index) {
    const card = document.createElement("div");
    const distanceFromTop = (index - topIndex + employees.length) % employees.length;
    const isTopCard = index === topIndex;

    if (distanceFromTop >= 3) {
      return;
    }

    card.className = "employee-card";
    if (isTopCard) {
      card.classList.add("top-card");
    }

    card.style.backgroundColor = employee.color;
    card.style.zIndex = employees.length - distanceFromTop;

    if (isTopCard) {
      card.style.transform = "translate(0, 0) scale(1)";
      card.style.opacity = "1";
    } else {
      const offset = Math.min(distanceFromTop, 5) * 8;
      card.style.transform = `translate(${offset}px, ${offset}px) scale(0.96)`;
      card.style.opacity = "0.85";
    }

    card.innerHTML = `
      <div class="photo-panel">
        <img src="${escapeHTML(getPhotoSource(employee))}" alt="${escapeHTML(employee.name)}" />
      </div>
      <div class="card-info">
        <h2>${escapeHTML(employee.name)}</h2>
        <p>Age: ${escapeHTML(employee.age)}</p>
        <p>Gender: ${escapeHTML(employee.gender)}</p>
        <p>Salary: ${formatSalary(employee.salary)}</p>
        <p class="address">Address: ${escapeHTML(employee.address || "Not added")}</p>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;

    stack.appendChild(card);
  });

  updateButtons();
}

function openModal() {
  modal.classList.add("show");
  updateSalaryText();
  nameInput.focus();
}

function closeModal() {
  modal.classList.remove("show");
  form.reset();
  updateSalaryText();
}

addBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
salaryInput.addEventListener("input", updateSalaryText);

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

nextBtn.addEventListener("click", function () {
  if (employees.length === 0) {
    return;
  }

  topIndex = topIndex + 1;
  if (topIndex >= employees.length) {
    topIndex = 0;
  }

  renderCards();
});

prevBtn.addEventListener("click", function () {
  if (employees.length === 0) {
    return;
  }

  topIndex = topIndex - 1;
  if (topIndex < 0) {
    topIndex = employees.length - 1;
  }

  renderCards();
});

stack.addEventListener("click", function (event) {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }

  const index = Number(event.target.dataset.index);
  employees.splice(index, 1);

  if (employees.length === 0) {
    topIndex = -1;
  } else if (topIndex >= employees.length) {
    topIndex = employees.length - 1;
  }

  saveEmployees();
  renderCards();
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const gender = document.querySelector("input[name='gender']:checked").value;
  const employee = {
    name: nameInput.value.trim(),
    photo: photoUrlInput.value.trim(),
    age: ageInput.value,
    salary: salaryInput.value,
    gender: gender,
    address: addressInput.value.trim(),
    color: colors[employees.length % colors.length]
  };

  employees.push(employee);
  topIndex = employees.length - 1;
  saveEmployees();
  renderCards();
  closeModal();
});

updateSalaryText();
renderCards();
