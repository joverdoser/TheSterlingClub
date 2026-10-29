// ===== The Sterling Club — site scripts =====

// Where booking requests are sent. Change this to your real email address.
const BUSINESS_EMAIL = "reserve@thesterlingclub.com";

// Estimate calculator prices. Keep in sync with the prices on the page.
// Detailing prices are the owner's real package prices; the other services are still estimates.
const PRICING = {
  lights: {
    label: "Christmas lighting",
    size: [["Single-story", 299], ["Two-story", 499], ["Large / estate", 799]],
    includedFeet: 120, perFoot: 2.5,
    addons: [["Trees & shrubs", 150], ["Walkway lights", 100], ["Wreaths & garland", 75]],
  },
  gutters: {
    label: "Gutter cleaning",
    size: [["Single-story", 129], ["Two-story", 189], ["Three-story", 249]],
    includedFeet: 150, perFoot: 0.6,
  },
  detail: {
    label: "Mobile detailing",
    vehicle: ["Car (sedan or coupe)", "SUV", "Truck"],
    // [name, [car, SUV, truck]]
    packages: [["Signature Detail", [150, 180, 210]], ["Sterling Detail", [220, 250, 290]]],
    // Optional add-ons: [name, low, high]. Engine bay is included in Sterling (package index 1).
    optional: [["Engine bay cleaning", 40, 60], ["Stain removal & shampoo extraction", 120, 400]],
    engineIncludedIn: 1,
    headlights: [["None", 0], ["One headlight", 75], ["Both headlights", 150]],
    // Upcharges when the vehicle needs them: [name, low, high]. Open-ended ("+").
    conditions: [["Pet hair removal", 50, 125], ["Heavy dirt, spills or neglected interior", 25, 150]],
  },
  mechanic: {
    label: "Mobile mechanic",
    vehicle: [["Car", 1], ["SUV / truck", 1.15], ["Luxury / European", 1.3]],
    pkg: [["Conventional oil change", 79], ["Full synthetic oil change", 119], ["Tune-up", 149], ["Brakes, front axle", 189], ["Brakes, front + rear", 359]],
  },
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// ---------- Hero slideshow + spotlight ----------
const slides = $$(".hero-slide");
const dots = $$(".hero-dots button");
const pauseBtn = $(".hero-pause");
let slideIdx = 0, slideTimer, paused = reduceMotion;
function showSlide(i) {
  slideIdx = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle("is-active", n === slideIdx));
  dots.forEach((d, n) => { d.classList.toggle("is-active", n === slideIdx); d.setAttribute("aria-pressed", String(n === slideIdx)); });
}
function startSlides() { clearInterval(slideTimer); if (!paused) slideTimer = setInterval(() => showSlide(slideIdx + 1), 6000); }
function setPaused(p) {
  paused = p;
  pauseBtn.setAttribute("aria-pressed", String(p));
  pauseBtn.setAttribute("aria-label", p ? "Play background photos" : "Pause background photos");
  $("use", pauseBtn).setAttribute("href", p ? "#i-play" : "#i-pause");
  startSlides();
}
pauseBtn.addEventListener("click", () => setPaused(!paused));
dots.forEach((d, n) => d.addEventListener("click", () => { showSlide(n); startSlides(); }));
setPaused(paused);

const hero = $(".hero");
const glow = $(".hero-glow");
hero.addEventListener("pointermove", (e) => {
  const r = hero.getBoundingClientRect();
  glow.style.setProperty("--mx", `${e.clientX - r.left}px`);
  glow.style.setProperty("--my", `${e.clientY - r.top}px`);
});

// ---------- Scroll reveal ----------
const reveals = $$(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// ---------- Service tabs ----------
const tabs = $$(".tabs [role='tab']");
function openTab(name, focus = false) {
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    if (on && focus) t.focus();
  });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => openTab(t.dataset.tab));
  t.addEventListener("keydown", (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (dir) { e.preventDefault(); openTab(tabs[(i + dir + tabs.length) % tabs.length].dataset.tab, true); }
  });
});
// Panels and footer links open the matching tab
$$("a[data-tab]").forEach((a) => a.addEventListener("click", () => openTab(a.dataset.tab)));

// ---------- Instant estimate ----------
const estForm = $("#est-form");
const estOptions = $("#est-options");
const estLow = $("#est-low"), estHigh = $("#est-high"), estLines = $("#est-lines");
let lastEstimate = null;

const chipGroup = (name, items, type = "radio", checkedIdx = 0) =>
  `<div class="chips">${items.map(([label], i) =>
    `<label class="chip"><input type="${type}" name="${name}" value="${i}" ${type === "radio" && i === checkedIdx ? "checked" : ""} /><span>${label}${type === "checkbox" ? ` (+${money(items[i][1])})` : ""}</span></label>`).join("")}</div>`;

function renderOptions(svc) {
  const P = PRICING[svc];
  let html = "";
  if (svc === "lights" || svc === "gutters") {
    html += `<div class="est-group"><p>Home size</p>${chipGroup("size", P.size)}</div>`;
    const [min, max, def] = svc === "lights" ? [50, 400, 120] : [80, 400, 150];
    html += `<div class="est-group"><p>${svc === "lights" ? "Roofline to light" : "Gutter length"} (approx.)</p>
      <div class="range-row"><input class="slider" type="range" name="feet" min="${min}" max="${max}" step="10" value="${def}" aria-label="Linear feet" /><output>${def} ft</output></div></div>`;
    if (P.addons) html += `<div class="est-group"><p>Add-ons</p>${chipGroup("addon", P.addons, "checkbox")}</div>`;
  } else if (svc === "detail") {
    const chips = (name, labels, type = "radio", checked = 0) => `<div class="chips">${labels.map((l, i) =>
      `<label class="chip"><input type="${type}" name="${name}" value="${i}" ${type === "radio" && i === checked ? "checked" : ""} /><span>${l}</span></label>`).join("")}</div>`;
    const range = (lo, hi, open) => lo === hi ? money(lo) : `${money(lo)}–${money(hi)}${open ? "+" : ""}`;
    html += `<div class="est-group"><p>Vehicle</p>${chips("vehicle", P.vehicle)}</div>`;
    html += `<div class="est-group"><p>Package</p>${chips("pkg", P.packages.map(([n]) => n))}</div>`;
    html += `<div class="est-group"><p>Optional add-ons</p>${chips("opt", P.optional.map(([n, lo, hi]) => `${n} (+${range(lo, hi)})`), "checkbox")}</div>`;
    html += `<div class="est-group"><p>Headlight restoration</p>${chips("lamps", P.headlights.map(([n, p]) => p ? `${n} (+${money(p)})` : n))}</div>`;
    html += `<div class="est-group"><p>Does your vehicle need any of these?</p>${chips("cond", P.conditions.map(([n, lo, hi]) => `${n} (+${range(lo, hi, true)})`), "checkbox")}
      <p class="est-hint">Upcharges are confirmed with you before that work begins. Biohazard cleanup (such as bodily fluids) is quoted separately after an assessment, starting at $75.</p></div>`;
  } else {
    html += `<div class="est-group"><p>Vehicle</p>${chipGroup("vehicle", P.vehicle.map(([l]) => [l]))}</div>`;
    html += `<div class="est-group"><p>Service</p>${chipGroup("pkg", P.pkg)}</div>`;
  }
  estOptions.innerHTML = html;
}

function calcEstimate() {
  const data = new FormData(estForm);
  const svc = data.get("svc");
  const P = PRICING[svc];
  const lines = [];
  let total = 0;
  if (svc === "lights" || svc === "gutters") {
    const [sizeLabel, base] = P.size[data.get("size") || 0];
    const feet = Number(data.get("feet"));
    lines.push([`${sizeLabel} home`, base]); total += base;
    const extra = Math.max(0, feet - P.includedFeet) * P.perFoot;
    if (extra) { lines.push([`Extra length (${feet - P.includedFeet} ft)`, extra]); total += extra; }
    data.getAll("addon").forEach((i) => { const [l, p] = P.addons[i]; lines.push([l, p]); total += p; });
    lines.push([svc === "lights" ? "Maintenance & takedown" : "Downspout flush & photos", "Included"]);
    const range = estOptions.querySelector("input[name='feet']");
    range.nextElementSibling.textContent = `${feet} ft`;
    range.style.setProperty("--fill", `${((feet - range.min) / (range.max - range.min)) * 100}%`);
  } else if (svc === "detail") {
    // Detailing uses the owner's actual prices: show exact totals, and ranges only where the price list has ranges.
    const v = Number(data.get("vehicle") || 0);
    const pk = Number(data.get("pkg") || 0);
    const [pName, prices] = P.packages[pk];
    let lo = prices[v], hi = prices[v], open = false;
    const rows = [[`${pName} (${P.vehicle[v]})`, money(prices[v])]];
    const engineBox = estOptions.querySelector("input[name='opt'][value='0']");
    engineBox.disabled = pk === P.engineIncludedIn;
    if (engineBox.disabled) engineBox.checked = false;
    engineBox.nextElementSibling.textContent = engineBox.disabled ? "Engine bay cleaning (included in Sterling)" : `Engine bay cleaning (+${money(P.optional[0][1])}–${money(P.optional[0][2])})`;
    if (pk === P.engineIncludedIn) rows.push(["Engine bay cleaning", "Included"]);
    data.getAll("opt").forEach((i) => { const [n, a, b] = P.optional[i]; lo += a; hi += b; rows.push([n, `${money(a)}–${money(b)}`]); });
    const [lampName, lamp] = P.headlights[Number(data.get("lamps") || 0)];
    if (lamp) { lo += lamp; hi += lamp; rows.push([`Headlight restoration (${lampName.toLowerCase()})`, money(lamp)]); }
    data.getAll("cond").forEach((i) => { const [n, a, b] = P.conditions[i]; lo += a; hi += b; open = true; rows.push([n, `${money(a)}–${money(b)}+`]); });
    estLow.textContent = money(lo);
    const single = lo === hi && !open;
    estHigh.textContent = money(hi) + (open ? "+" : "");
    estHigh.hidden = single; $(".est-dash").hidden = single;
    $(".est-label").textContent = single ? "Estimated price" : "Estimated range";
    estLines.innerHTML = rows.map(([l, p]) => `<li><span>${l}</span><span>${p}</span></li>`).join("");
    const priceEl = $(".est-price");
    priceEl.classList.remove("bump"); void priceEl.offsetWidth; priceEl.classList.add("bump");
    lastEstimate = { service: P.label, text: single ? money(lo) : `${money(lo)} to ${money(hi)}${open ? "+" : ""}`, lines: rows };
    return;
  } else {
    const [vLabel, mult] = P.vehicle[data.get("vehicle") || 0];
    const [pLabel, base] = P.pkg[data.get("pkg") || 0];
    const price = base * mult;
    lines.push([`${pLabel} (${vLabel})`, price]); total += price;
  }
  const low = Math.round(total / 5) * 5;
  const high = Math.round((total * 1.2) / 5) * 5;
  estLow.textContent = money(low);
  estHigh.textContent = money(high);
  estHigh.hidden = false; $(".est-dash").hidden = false;
  $(".est-label").textContent = "Estimated range";
  estLines.innerHTML = lines.map(([l, p]) => `<li><span>${l}</span><span>${typeof p === "number" ? money(p) : p}</span></li>`).join("");
  const priceEl = $(".est-price");
  priceEl.classList.remove("bump"); void priceEl.offsetWidth; priceEl.classList.add("bump");
  lastEstimate = { service: P.label, text: `${money(low)} to ${money(high)}`, lines };
}

function setService(svc) {
  const radio = estForm.querySelector(`input[name='svc'][value='${svc}']`);
  if (radio) radio.checked = true;
  renderOptions(svc);
  calcEstimate();
}
estForm.addEventListener("change", (e) => {
  if (e.target.name === "svc") renderOptions(e.target.value);
  calcEstimate();
});
estForm.addEventListener("input", (e) => { if (e.target.name === "feet") calcEstimate(); });
$$("[data-preset]").forEach((a) => a.addEventListener("click", () => {
  setService(a.dataset.preset);
  if (a.dataset.pkg) {
    const r = estForm.querySelector(`input[name='pkg'][value='${a.dataset.pkg}']`);
    if (r) { r.checked = true; calcEstimate(); }
  }
}));
setService("lights");

// ---------- Booking form helpers ----------
const serviceSelect = $("#f-service");
const msg = $("#f-msg");
$("#est-book").addEventListener("click", () => {
  if (!lastEstimate) return;
  serviceSelect.value = lastEstimate.service;
  msg.value = `Instant estimate: ${lastEstimate.text}\n` +
    lastEstimate.lines.map(([l, p]) => `- ${l}: ${typeof p === "number" ? money(p) : p}`).join("\n") + "\n\n";
  $("#book").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  setTimeout(() => $("#f-name").focus({ preventScroll: true }), 700);
});
$$("[data-service]").forEach((a) => a.addEventListener("click", () => { serviceSelect.value = a.dataset.service; }));

// Earliest bookable date is tomorrow
const dateInput = $("#f-date");
const tmr = new Date(Date.now() + 864e5);
dateInput.min = tmr.toISOString().slice(0, 10);

// ---------- Membership billing toggle ----------
$$(".billing-toggle button").forEach((b) => b.addEventListener("click", () => {
  $$(".billing-toggle button").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
  const mode = b.dataset.billing;
  $$(".tier [data-monthly]").forEach((el) => { el.textContent = el.dataset[mode]; });
}));

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
    out.textContent = `${zip} looks like it's in the Houston area. Request a quote and we'll confirm we can travel to you.`;
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
  const subject = `Quote request: ${d.get("service")}`;
  const body = [
    `Name: ${d.get("name")}`,
    `Phone: ${d.get("phone")}`,
    `Email: ${d.get("email") || "-"}`,
    `Service: ${d.get("service")}`,
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
});
