// ===== The Sterling Club — site scripts =====

// Where booking requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "reserve@thesterlingclub.com";

// The service that is booked by consultation (no prices shown on the site).
const CONSULTATION_SERVICE = "Christmas lighting";

// Bulb positions in images/hero-lights.jpg (1672 x 941 px), as x, y pairs, in the order they switch on:
// left wing, left roof, main eave, the three dormers, right wing, then the door garland.
const BULBS = [144,533,144,548,170,540,176,533,183,532,186,524,192,522,198,512,298,392,304,384,321,517,340,518,359,519,377,520,394,521,409,522,422,519,422,531,298,392,304,384,312,388,314,373,318,384,323,378,329,372,336,365,340,360,351,348,357,342,372,324,381,311,396,293,404,288,414,276,417,269,423,264,428,256,432,250,436,243,429,252,436,243,437,253,451,243,469,245,485,247,503,249,521,251,538,253,549,255,567,257,585,259,605,261,624,263,639,266,656,267,673,269,691,272,705,273,719,275,736,277,751,279,766,281,782,283,800,284,817,286,833,289,849,291,857,291,871,293,888,295,903,297,917,299,933,301,950,302,967,305,984,307,999,309,1016,311,1032,312,1039,314,1055,316,1069,317,1083,319,1098,321,1113,323,1125,324,1133,325,1147,327,1162,329,1177,331,1193,333,1208,335,1222,337,1234,338,1247,340,1264,342,1280,344,1294,346,1306,348,1319,349,1331,351,1344,352,1354,354,1354,367,1362,363,1363,355,1372,360,702,242,774,236,701,226,774,221,701,211,774,206,702,194,774,187,671,183,676,179,702,176,680,174,775,170,684,169,689,165,782,165,776,164,694,161,700,158,778,154,765,147,701,143,709,142,718,139,752,137,724,136,732,131,741,128,917,299,903,297,1018,291,1020,282,958,275,1022,268,958,261,1022,253,958,246,1022,238,957,230,1021,222,912,221,919,216,957,213,925,212,932,207,1022,205,943,202,948,196,1028,196,955,195,958,188,1017,187,959,180,966,180,1003,176,977,173,986,169,993,167,1223,310,1169,303,1225,297,1168,289,1225,283,1167,275,1225,270,1168,260,1225,253,1114,249,1121,246,1167,244,1130,242,1138,238,1227,237,1146,234,1153,230,1167,230,1229,230,1161,226,1223,222,1208,221,1172,216,1214,215,1179,212,1205,209,1191,206,1199,202,1346,544,1360,546,1372,546,1384,547,1396,547,1406,549,1413,548,1422,549,1434,550,1446,551,1457,552,1468,552,1479,554,1489,554,1499,555,1509,555,1510,565,1516,558,1524,557,1014,766,892,760,907,738,1031,732,1025,731,1024,723,1033,721,1011,719,908,718,1004,716,1012,712,1024,711,1037,709,1031,704,1023,699,1007,698,1013,697,1037,693,907,691,901,685,1024,685,1032,685,908,682,895,676,1038,676,904,667,1024,667,1034,667,898,664,908,659,896,658,1024,658,1038,656,907,653,1006,650,1035,650,1068,650,1047,649,1076,649,1029,648,900,647,908,647,1022,647,848,646,869,646,875,644,859,641,894,641,1066,641,884,639,1056,639,1038,638,878,637,844,636,866,635,1006,635,908,634,1083,632,899,631,1044,631,1030,630,1064,629,1074,628,1022,626,861,625,883,625,844,624,1034,622,1045,622,907,621,1056,621,872,619,1086,619,1031,616,1065,616,1044,614,897,613,951,613,844,611,1025,611,854,610,861,610,879,610,1005,610,1055,609,960,608,908,607,1020,607,1044,606,844,604,914,603,858,600,1033,600,899,599,883,598,1022,596,1038,594,909,593,878,592,900,590,1026,588,907,584,1038,583,1032,582,896,581,914,578,1024,578,1036,574,935,572,1028,572,904,570,979,570,896,568,1022,568,931,566,914,564,964,564,1009,564,950,563,904,562,1034,562,959,560,984,560,1026,560,926,559,934,558,968,558,1003,558,917,556,1010,556,974,555,912,551,989,551,947,550,974,547,961,546];

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

// ---------- Christmas lighting: the house lights up as you scroll ----------
const lights = $("#lighting");
const bulbs = [];
let lit = 0;
if (lights) {
  const NS = "http://www.w3.org/2000/svg";
  const glow = $(".bulbs-glow", lights), core = $(".bulbs-core", lights);
  const dot = (x, y, r) => { const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", r); return c; };
  for (let i = 0; i < BULBS.length; i += 2) {
    const g = dot(BULBS[i], BULBS[i + 1], 9), c = dot(BULBS[i], BULBS[i + 1], 3.4);
    glow.append(g); core.append(c); bulbs.push([g, c]);
  }
}
function updateLights() {
  if (!lights) return;
  const r = lights.getBoundingClientRect();
  const p = reduceMotion ? 1 : clamp(-r.top / Math.max(r.height - window.innerHeight, 1));
  // 6%-70% of the scroll: bulbs switch on in order. 72%-90%: the windows and garden lights come up.
  const n = Math.round(clamp((p - 0.06) / 0.64) * bulbs.length);
  for (let i = Math.min(n, lit); i < Math.max(n, lit); i++) bulbs[i].forEach((c) => c.classList.toggle("on", i < n));
  lit = n;
  const on = clamp((p - 0.72) / 0.18);
  lights.style.setProperty("--on", on.toFixed(3));
  lights.style.setProperty("--bulbs", (1 - on * 0.85).toFixed(3));
  lights.style.setProperty("--p", p.toFixed(3));
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
