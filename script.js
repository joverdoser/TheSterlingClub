// ===== The Sterling Club — site scripts =====

// Where booking requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "reserve@thesterlingclub.com";

// Your CRM's web app address (see crm/SETUP.md), ending in /exec. While this is empty,
// the form falls back to opening the visitor's email app.
const CRM_ENDPOINT = "";

// The service that is booked by consultation (no prices shown on the site).
const CONSULTATION_SERVICE = "Christmas lighting";


const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);
document.documentElement.classList.add("js");

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

// ---------- Christmas lighting: three homes light up in turn as you scroll ----------
// Each home gets a third of the section: it fades in dark, then a soft wave of light sweeps across it.
const lights = $("#lighting");
const scenes = lights ? $$(".scene", lights) : [];
const stepBars = lights ? $$(".lights-steps i", lights) : [];
const sceneLabel = lights ? $(".lights-label", lights) : null;
let shownLabel = -1;
function updateLights() {
  if (!lights || reduceMotion) return;
  const r = lights.getBoundingClientRect();
  const p = clamp(-r.top / Math.max(r.height - window.innerHeight, 1));
  const seg = p * scenes.length;
  const i = Math.min(Math.floor(seg), scenes.length - 1);
  const local = seg - i;
  scenes.forEach((s, k) => {
    const vis = k < i ? 1 : k === i ? (k === 0 ? 1 : clamp(local / 0.15)) : 0;
    const lit = k < i ? 1 : k === i ? clamp((local - (k === 0 ? 0.05 : 0.15)) / 0.6) : 0;
    s.style.setProperty("--vis", vis.toFixed(3));
    s.style.setProperty("--s", lit.toFixed(3));
  });
  stepBars.forEach((b, k) => b.style.setProperty("--f", (k < i ? 1 : k === i ? clamp(local / 0.8) : 0).toFixed(3)));
  if (i !== shownLabel) { sceneLabel.textContent = scenes[i].dataset.label; shownLabel = i; }
}

// ---------- Service photos drift slightly slower than the page ----------
const panels = $$(".panel");
function updatePanels() {
  if (reduceMotion) return;
  for (const s of panels) {
    const r = s.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const k = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    s.style.setProperty("--py", `${(k * -70).toFixed(1)}px`);
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    header.classList.toggle("scrolled", window.scrollY > 24);
    toTop.classList.toggle("show", window.scrollY > 900);
    updateLights();
    updatePanels();
  });
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

// ---------- Scroll reveals ----------
// Items in the same block appear one after another.
const reveals = $$("[data-reveal], .panel");
reveals.forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
  const i = sibs.indexOf(el);
  if (i > 0) el.style.setProperty("--d", `${i * 0.09}s`);
});
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// ---------- Membership cards tilt toward the pointer, with a soft glare ----------
if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add("tilting");
      card.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty("--glare", "1");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--glare", "0");
    });
  });
}
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
const photoField = $("#photo-field");

// Christmas lighting starts with a consultation: ask how to meet.
function updateConsultation() {
  const isConsult = serviceSelect.value === CONSULTATION_SERVICE;
  meet.hidden = !isConsult;
  // House photos are only collected when the form sends straight to the CRM.
  photoField.hidden = !isConsult || !CRM_ENDPOINT;
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

// ---------- Booking form: checks required fields, then sends the request ----------
// With CRM_ENDPOINT set, the request goes straight to the CRM (Google Sheet, alerts, confirmation).
// Without it, the visitor's email app opens with the request filled in.
const form = $("#quote-form");
const note = $("#form-note");
const submitBtn = $("button[type='submit']", form);
if (CRM_ENDPOINT) {
  submitBtn.textContent = "Send request";
  $(".form-how", form).textContent = "We'll reply with a written quote and available times. For Christmas lighting, we'll call to set up your consultation.";
}

// Shrink photos in the browser before sending: faster on phones and well under upload limits.
function photoToDataUrl(file, max = 1800) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) return resolve("");
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve("");
    img.src = URL.createObjectURL(file);
  });
}

form.addEventListener("submit", async (event) => {
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

  if (CRM_ENDPOINT) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    note.classList.remove("error");
    note.textContent = "";
    const payload = {
      name: d.get("name"), phone: d.get("phone"), email: d.get("email"), service: d.get("service"),
      meet: isConsult ? d.get("meet") : "", date: d.get("date"), time: d.get("time"), address: d.get("address"),
      pref: d.get("pref"), message: d.get("message"), consent: true, website: d.get("website"),
      photo: isConsult ? await photoToDataUrl($("#f-photo").files[0]) : "",
    };
    try {
      // Sent as plain text so the browser doesn't need a cross-site preflight; Google Apps Script reads the body.
      await fetch(CRM_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      note.textContent = isConsult
        ? "Request sent. We'll call you to set up your lighting consultation."
        : "Request sent. We'll reply with a written quote and available times.";
      form.reset();
      updateConsultation();
    } catch {
      note.textContent = "Your request didn't send. Check your connection and try again, or call (786) 488-9561.";
      note.classList.add("error");
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
    return;
  }

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
  note.textContent = `Your email app should now be open with your request filled in. Press send there to send it to us. If nothing opened, email ${BUSINESS_EMAIL} or call (786) 488-9561.`;
  form.reset();
  updateConsultation();
});
