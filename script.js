// ===== The Sterling Club — site scripts =====

// Where quote requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "hello@thesterlingclub.com";

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu toggle
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// "Book ..." links on service cards pre-select the service in the form
const serviceSelect = document.getElementById("service-select");
document.querySelectorAll(".service-link").forEach((link) => {
  link.addEventListener("click", () => {
    serviceSelect.value = link.dataset.service;
  });
});

// Quote form: opens the visitor's email app with the request filled in
const form = document.getElementById("quote-form");
const note = document.getElementById("form-note");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const subject = `Quote Request: ${data.get("service")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Email: ${data.get("email") || "-"}`,
    `Service: ${data.get("service")}`,
    "",
    "Details:",
    data.get("message") || "-",
  ].join("\n");

  window.location.href =
    `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  note.textContent = "Thanks! Your email app should open with your request ready to send.";
  form.reset();
});
