// ===== The Sterling Club — site scripts =====

// Where booking requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "reserve@thesterlingclub.com";

// The service that is booked by consultation (no prices shown on the site).
const CONSULTATION_SERVICE = "Christmas lighting";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Announcement bar ----------
// Closes for this visit only. Nothing is stored in the browser.
const announce = $("#announce");
$(".announce-close").addEventListener("click", () => {
  announce.classList.add("is-hidden");
  $(".site-header .brand").focus();
});

// ---------- Header, back-to-top, active nav ----------
const header = $(".site-header");
const toTop = $(".to-top");
const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
  toTop.classList.toggle("show", window.scrollY > 900);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

const navMap = new Map($$(".nav-links a[href^='#']").map((a) => [a.getAttribute("href").slice(1), a]));
if ("IntersectionObserver" in window) {
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = navMap.get(e.target.id);
      if (link && e.isIntersecting) {
        navMap.forEach((l) => l.classList.remove("is-current"));
        link.classList.add("is-current");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });
}

// ---------- Mobile menu ----------
const toggle = $(".nav-toggle");
const navLinks = $("#nav-links");
function setMenu(open) {
  navLinks.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
toggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Booking form helpers ----------
const serviceSelect = $("#f-service");
const msg = $("#f-msg");
const meet = $("#meet");
const dateLabel = $("#f-date-label");

// Christmas lighting starts with a consultation: ask how to meet.
function updateConsultation() {
  const isConsult = serviceSelect.value === CONSULTATION_SERVICE;
  meet.hidden = !isConsult;
  dateLabel.firstChild.textContent = isConsult ? "Preferred consultation date " : "Preferred date ";
}
serviceSelect.addEventListener("change", updateConsultation);

// Buttons elsewhere on the page pre-fill the service (and detailing package).
$$("[data-service]").forEach((a) => a.addEventListener("click", () => {
  serviceSelect.value = a.dataset.service;
  if (a.dataset.detail && !msg.value.includes(a.dataset.detail)) msg.value = `${a.dataset.detail}\n${msg.value}`;
  updateConsultation();
}));

// Earliest bookable date is tomorrow
const dateInput = $("#f-date");
const tmr = new Date(Date.now() + 864e5);
dateInput.min = tmr.toISOString().slice(0, 10);

// ---------- ZIP checker ----------
// A quick check only: Houston-area ZIP codes start with 770, 772, 773, 774 or 775.
// Some of those areas may be farther than you travel, so results say "we'll confirm".
const SERVED_PREFIXES = ["770", "772", "773", "774", "775"];
$("#zip-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const zip = $("#zip").value.trim();
  const out = $("#zip-result");
  out.className = "zip-result";
  if (!/^\d{5}$/.test(zip)) { out.textContent = "Enter a 5-digit ZIP code."; out.classList.add("no"); return; }
  if (SERVED_PREFIXES.includes(zip.slice(0, 3))) {
    out.textContent = `${zip} looks like it's in the Houston area. Request an appointment and we'll confirm we can travel to you.`;
    out.classList.add("ok");
  } else {
    out.textContent = `${zip} may be outside our service area. Call (786) 488-9561 to check.`;
    out.classList.add("no");
  }
});
$("#zip").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5); });

// ---------- Booking form: checks required fields, then opens the visitor's email app ----------
const form = $("#quote-form");
const note = $("#form-note");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const required = $$("[required]", form);
  const missing = required.filter((el) => (el.type === "checkbox" ? !el.checked : !el.value.trim()));
  required.forEach((el) => el.setAttribute("aria-invalid", String(missing.includes(el))));
  if (missing.length) {
    const names = missing.filter((el) => el.type !== "checkbox")
      .map((el) => $(`label[for="${el.id}"]`, form).textContent.replace("*", "").trim().toLowerCase());
    const parts = [];
    if (names.length) parts.push(`add your ${names.join(" and ")}`);
    if (missing.some((el) => el.type === "checkbox")) parts.push("check the box to agree to be contacted");
    note.textContent = `To send your request, please ${parts.join(", and ")}.`;
    note.classList.add("error");
    missing[0].focus();
    return;
  }
  const d = new FormData(form);
  const isConsult = d.get("service") === CONSULTATION_SERVICE;
  const subject = isConsult ? "Consultation request: Christmas lighting" : `Appointment request: ${d.get("service")}`;
  const body = [
    `Name: ${d.get("name")}`,
    `Phone: ${d.get("phone")}`,
    `Email: ${d.get("email") || "-"}`,
    `Service: ${d.get("service")}`,
    ...(isConsult ? [`Consultation: ${d.get("meet")}`] : []),
    `Preferred date: ${d.get("date") || "Flexible"}`,
    `Time window: ${d.get("time")}`,
    `Address / ZIP: ${d.get("address") || "-"}`,
    `Best way to reach: ${d.get("pref")}`,
    "Agreed to be contacted about this request: Yes",
    "",
    "Details:",
    d.get("message") || "-",
  ].join("\n");
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.classList.remove("error");
  note.textContent = "Your email app should now be open with your request filled in. Press send there to send it to us. If nothing opened, email reserve@thesterlingclub.com or call (786) 488-9561.";
  form.reset();
  updateConsultation();
});
