// ===== The Sterling Club — site scripts =====

// Where quote requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "hello@thesterlingclub.com";

document.documentElement.classList.add("js");
document.getElementById("year").textContent = new Date().getFullYear();

// Header gets a solid background once you scroll
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
}
toggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Fade sections in as they scroll into view
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Before / after sliders
document.querySelectorAll(".compare").forEach((fig) => {
  const range = fig.querySelector("input[type='range']");
  const update = () => fig.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", update);
  update();
});

// Membership buttons pre-select the plan in the quote form
const serviceSelect = document.getElementById("f-service");
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => { serviceSelect.value = link.dataset.service; });
});

// Quote form: checks required fields, then opens the visitor's email app
// with the request filled in.
const form = document.getElementById("quote-form");
const note = document.getElementById("form-note");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const required = [...form.querySelectorAll("[required]")];
  const missing = required.filter((el) => !el.value.trim());
  required.forEach((el) => el.setAttribute("aria-invalid", String(missing.includes(el))));

  if (missing.length) {
    const names = missing.map((el) => form.querySelector(`label[for="${el.id}"]`).textContent.trim().toLowerCase());
    note.textContent = `Add your ${names.join(" and ")} so we can send your quote.`;
    note.classList.add("error");
    missing[0].focus();
    return;
  }

  const data = new FormData(form);
  const subject = `Quote request: ${data.get("service")}`;
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

  note.classList.remove("error");
  note.textContent = "Your email app should open with the request ready. Press send and we'll reply with your price.";
  form.reset();
});
