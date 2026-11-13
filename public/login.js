const DASHBOARD_URL = "index.html";   // the page to open after login
const STORAGE_KEY = "astrohealth_user";

const form = document.getElementById("loginForm");
const input = document.getElementById("username");
const errorEl = document.getElementById("error");
const skipBtn = document.getElementById("skipBtn");

// Letters (any language), numbers, space, _ and -, 2 to 24 characters
const NAME_RULE = /^[\p{L}\p{N}_\- ]{2,24}$/u;

function saveUser(name, guest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, guest, at: Date.now() }));
  } catch (e) {
    // storage can be blocked (private mode); the app still continues
  }
}

function showError(message) {
  errorEl.textContent = message;
  input.classList.add("invalid");
  input.focus();
}

function clearError() {
  errorEl.textContent = "";
  input.classList.remove("invalid");
}

function goToDashboard() {
  window.location.href = DASHBOARD_URL;
}

// Login button (also runs when the user presses Enter)
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = input.value.trim();

  if (!name) return showError("Please enter a username.");
  if (!NAME_RULE.test(name)) {
    return showError("Use 2 to 24 letters or numbers (spaces, _ and - are allowed).");
  }

  saveUser(name, false);
  goToDashboard();
});

// Skip button: continue as a guest
skipBtn.addEventListener("click", () => {
  saveUser("Guest", true);
  goToDashboard();
});

input.addEventListener("input", clearError);

// Prefill the last real username
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved && !saved.guest) input.value = saved.name;
} catch (e) {}