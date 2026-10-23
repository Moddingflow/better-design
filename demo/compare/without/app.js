(() => {
  "use strict";

  /* ---------- Data ---------- */
  const CITIES = {
    AMS: { name: "Amsterdam", station: "Amsterdam Centraal", lon: 4.90, lat: 52.37, lab: "r" },
    BRU: { name: "Brussels", station: "Bruxelles-Midi", lon: 4.35, lat: 50.85, lab: "r" },
    PAR: { name: "Paris", station: "Paris Est", lon: 2.35, lat: 48.86, lab: "b" },
    HAM: { name: "Hamburg", station: "Hamburg Hbf", lon: 10.00, lat: 53.55, lab: "l" },
    CPH: { name: "Copenhagen", station: "København H", lon: 12.57, lat: 55.68, lab: "r" },
    BER: { name: "Berlin", station: "Berlin Hbf", lon: 13.40, lat: 52.52, lab: "r" },
    PRG: { name: "Prague", station: "Praha hl.n.", lon: 14.42, lat: 50.08, lab: "r" },
    VIE: { name: "Vienna", station: "Wien Hbf", lon: 16.37, lat: 48.21, lab: "r" },
    BUD: { name: "Budapest", station: "Budapest-Keleti", lon: 19.04, lat: 47.50, lab: "b" },
    MUC: { name: "Munich", station: "München Hbf", lon: 11.58, lat: 48.14, lab: "r" },
    ZRH: { name: "Zurich", station: "Zürich HB", lon: 8.54, lat: 47.37, lab: "l" },
    VCE: { name: "Venice", station: "Venezia S. Lucia", lon: 12.33, lat: 45.44, lab: "r" },
    ROM: { name: "Rome", station: "Roma Termini", lon: 12.50, lat: 41.90, lab: "r" }
  };

  // days: 0=Sun..6=Sat on which the outbound train departs (reverse uses same set)
  const ROUTES = [
    { id: "AMS-VIE", a: "AMS", b: "VIE", no: 401, out: ["19:28", "09:58"], back: ["20:10", "10:05"], via: ["Köln", "Frankfurt", "Nürnberg", "Linz"], base: [55, 85, 169], bend: -30 },
    { id: "PAR-BER", a: "PAR", b: "BER", no: 413, out: ["19:12", "10:24"], back: ["18:52", "10:02"], via: ["Strasbourg", "Mannheim", "Erfurt"], base: [49, 79, 159], bend: -40 },
    { id: "BRU-PRG", a: "BRU", b: "PRG", no: 425, out: ["19:22", "09:40"], back: ["18:56", "09:05"], via: ["Liège", "Köln", "Leipzig", "Dresden"], base: [45, 75, 155], bend: 18 },
    { id: "ZRH-HAM", a: "ZRH", b: "HAM", no: 437, out: ["20:59", "08:40"], back: ["20:24", "09:05"], via: ["Basel", "Mannheim", "Hannover"], base: [45, 72, 152], bend: 22 },
    { id: "MUC-ROM", a: "MUC", b: "ROM", no: 449, out: ["20:20", "09:30"], back: ["19:05", "08:55"], via: ["Innsbruck", "Verona", "Bologna", "Firenze"], base: [52, 85, 175], bend: -26 },
    { id: "VIE-VCE", a: "VIE", b: "VCE", no: 451, out: ["21:27", "08:20"], back: ["20:57", "08:17"], via: ["Villach", "Udine"], base: [39, 69, 149], bend: 20, days: [0, 4, 5, 6] },
    { id: "PAR-VIE", a: "PAR", b: "VIE", no: 463, out: ["19:40", "10:35"], back: ["19:10", "09:57"], via: ["Strasbourg", "München", "Salzburg"], base: [59, 89, 179], bend: 34 },
    { id: "CPH-MUC", a: "CPH", b: "MUC", no: 475, out: ["18:35", "09:15"], back: ["19:45", "10:10"], via: ["Hamburg", "Hannover", "Nürnberg"], base: [55, 85, 169], bend: -20, days: [1, 3, 5, 0] },
    { id: "ZRH-BUD", a: "ZRH", b: "BUD", no: 487, out: ["20:40", "09:19"], back: ["19:25", "08:36"], via: ["Innsbruck", "Salzburg", "Linz", "Győr"], base: [49, 79, 159], bend: 30 }
  ];

  const CLASSES = {
    seat: { name: "Seat", perks: ["Reclining seat, 6-seat compartment", "Pillow, blanket and water", "Shared washroom"] },
    couchette: { name: "Couchette", perks: ["Flat berth with sheets", "Lockable compartment", "Breakfast included"] },
    cabin: { name: "Private cabin", perks: ["Beds for 1–3, just your party", "Washbasin, key card", "Breakfast served to the cabin"] }
  };

  const BIKE = 15, BREAKFAST = 9, FOUR_BERTH = 15, DELUXE = 60;

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const eur = n => "€" + Math.round(n).toLocaleString("en-GB");
  const fmtDate = (d, opts) => d.toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short" });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const dur = (dep, arr) => { let m = toMin(arr) - toMin(dep); if (m <= 0) m += 1440; return `${Math.floor(m / 60)}h ${pad(m % 60)}m`; };
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = addDays(today, 180);

  function scrollToEl(el) {
    // Scroll only this document (never the embedding page).
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- Route logic ---------- */
  function trainsFor(from, to, dateStr) {
    const d = parseIso(dateStr);
    return ROUTES.flatMap(r => {
      let dir = null;
      if (r.a === from && r.b === to) dir = "out";
      else if (r.b === from && r.a === to) dir = "back";
      if (!dir) return [];
      if (r.days && !r.days.includes(d.getDay())) return [];
      const [dep, arr] = r[dir];
      const via = dir === "out" ? r.via : r.via.slice().reverse();
      const no = dir === "out" ? r.no : r.no + 1;
      const k = hash(r.id + dir + dateStr);
      const wk = d.getDay();
      const demand = (wk === 5 || wk === 0 ? 1.18 : wk === 6 ? 1.08 : 1) * (0.9 + k * 0.28);
      const price = {
        seat: Math.round(r.base[0] * demand),
        couchette: Math.round(r.base[1] * demand),
        cabin: Math.round(r.base[2] * demand)
      };
      const left = {
        seat: 4 + Math.floor(hash("s" + r.id + dateStr + dir) * 40),
        couchette: Math.floor(hash("c" + r.id + dateStr + dir) * 22),
        cabin: Math.floor(hash("k" + r.id + dateStr + dir) * 7)
      };
      return [{ key: r.id + ":" + dir, route: r, from, to, dep, arr, via, no: "DL " + no, price, left, date: dateStr }];
    });
  }
  const destinations = from => ROUTES.flatMap(r => r.a === from ? [r.b] : r.b === from ? [r.a] : []);
  const minPrice = t => Math.min(t.price.seat);

  /* ---------- State ---------- */
  const state = { from: "AMS", to: "VIE", date: iso(addDays(today, 7)), pax: 2, train: null, cls: null, berth: "6", cabinType: "standard", bike: 0, breakfast: false, step: 0 };

  /* ---------- Search form ---------- */
  const fromSel = $("#from"), toSel = $("#to"), dateIn = $("#date"), paxSel = $("#pax");
  const cityCodes = Object.keys(CITIES).sort((x, y) => CITIES[x].name.localeCompare(CITIES[y].name));

  function fillFrom() {
    fromSel.innerHTML = cityCodes.map(c => `<option value="${c}">${CITIES[c].name}</option>`).join("");
    fromSel.value = state.from;
  }
  function fillTo() {
    const dests = destinations(state.from).sort((x, y) => CITIES[x].name.localeCompare(CITIES[y].name));
    if (!dests.includes(state.to)) state.to = dests[0];
    toSel.innerHTML = dests.map(c => `<option value="${c}">${CITIES[c].name}</option>`).join("");
    toSel.value = state.to;
  }
  dateIn.min = iso(today); dateIn.max = iso(maxDate); dateIn.value = state.date;

  fromSel.addEventListener("change", () => { state.from = fromSel.value; fillTo(); paintMap(); });
  toSel.addEventListener("change", () => { state.to = toSel.value; paintMap(); });
  $("#swap").addEventListener("click", () => {
    [state.from, state.to] = [state.to, state.from];
    fromSel.value = state.from; fillTo(); toSel.value = state.to; paintMap();
  });

  $("#search").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#searchError");
    const v = dateIn.value;
    if (!v || parseIso(v) < today || parseIso(v) > maxDate) {
      err.textContent = `Choose a night between ${fmtDate(today)} and ${fmtDate(maxDate)}.`;
      err.hidden = false; dateIn.setAttribute("aria-invalid", "true"); dateIn.focus();
      return;
    }
    err.hidden = true; dateIn.removeAttribute("aria-invalid");
    state.from = fromSel.value; state.to = toSel.value; state.date = v; state.pax = +paxSel.value;
    startBooking();
  });

  /* ---------- Map ---------- */
  const svg = $("#map");
  const NS = "http://www.w3.org/2000/svg";
  const pos = c => ({ x: (CITIES[c].lon + 1) * 26, y: (56.5 - CITIES[c].lat) * 40 + 20 });
  function curve(r) {
    const p = pos(r.a), q = pos(r.b);
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
    const cx = mx + (-dy / len) * r.bend, cy = my + (dx / len) * r.bend;
    return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function buildMap() {
    const stars = el("g", { "aria-hidden": "true" }, svg);
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 70; i++) {
      el("circle", { cx: (rnd() * 560).toFixed(1), cy: (rnd() * 640).toFixed(1), r: (0.4 + rnd() * 0.9).toFixed(2), class: "m-star", opacity: (0.15 + rnd() * 0.4).toFixed(2) }, stars);
    }
    const lines = el("g", {}, svg);
    ROUTES.forEach(r => el("path", { d: curve(r), class: "m-line", "data-route": r.id, id: "line-" + r.id }, lines));
    el("g", { id: "trainDot" }, svg);
    const cities = el("g", {}, svg);
    Object.entries(CITIES).forEach(([code, c]) => {
      const p = pos(code);
      const g = el("g", { class: "m-city", "data-city": code, tabindex: "0", role: "button", "aria-label": c.name }, cities);
      el("circle", { cx: p.x, cy: p.y, r: 16, class: "hit" }, g);
      el("circle", { cx: p.x, cy: p.y, r: 5.5, class: "dot" }, g);
      const t = el("text", {}, g);
      const off = { r: [11, 4, "start"], l: [-11, 4, "end"], t: [0, -12, "middle"], b: [0, 21, "middle"] }[c.lab];
      t.setAttribute("x", p.x + off[0]); t.setAttribute("y", p.y + off[1]); t.setAttribute("text-anchor", off[2]);
      t.textContent = c.name;
      const pick = () => mapPick(code);
      g.addEventListener("click", pick);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
  }
  function mapPick(code) {
    if (code !== state.from && destinations(state.from).includes(code) && state.to !== code) {
      state.to = code;
    } else {
      state.from = code;
      fromSel.value = code;
    }
    fillTo(); paintMap();
    const reach = destinations(state.from).map(c => CITIES[c].name).join(", ");
    $("#mapCaption").textContent = `From ${CITIES[state.from].name}: ${reach}.`;
  }
  function paintMap() {
    const active = ROUTES.find(r => (r.a === state.from && r.b === state.to) || (r.b === state.from && r.a === state.to));
    $$(".m-line", svg).forEach(p => {
      const r = ROUTES.find(x => x.id === p.dataset.route);
      const touches = r.a === state.from || r.b === state.from;
      p.classList.toggle("is-on", r === active);
      p.classList.toggle("is-dim", !touches && r !== active);
    });
    $$(".m-city", svg).forEach(g => {
      g.classList.toggle("is-from", g.dataset.city === state.from);
      g.classList.toggle("is-to", g.dataset.city === state.to);
    });
    const dotG = $("#trainDot");
    dotG.innerHTML = "";
    if (active && !reduceMotion) {
      const forward = active.a === state.from;
      const c = el("circle", { r: 4, class: "m-train" }, dotG);
      const am = el("animateMotion", { dur: "6s", repeatCount: "indefinite", keyPoints: forward ? "0;1" : "1;0", keyTimes: "0;1", calcMode: "linear" }, c);
      el("mpath", { href: "#line-" + active.id }, am);
    }
  }

  /* ---------- Booking flow ---------- */
  const book = $("#book");

  function setStep(n) {
    state.step = n;
    $("#stepTrain").hidden = n !== 1;
    $("#stepClass").hidden = n !== 2;
    $("#stepDetails").hidden = n !== 3;
    $$(".steps li").forEach(li => {
      const s = +li.dataset.step;
      li.classList.toggle("is-current", s === n);
      li.classList.toggle("is-done", s < n);
      if (s === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    renderSummary();
  }

  function startBooking() {
    state.train = null; state.cls = null; state.bike = 0; state.breakfast = false;
    book.hidden = false;
    renderResults();
    setStep(1);
    paintMap();
    scrollToEl(book);
  }

  function renderResults() {
    const d = parseIso(state.date);
    $("#resultsTitle").textContent = `${CITIES[state.from].name} → ${CITIES[state.to].name}`;
    // Day strip
    const strip = $("#daystrip");
    strip.innerHTML = "";
    for (let i = -3; i <= 3; i++) {
      const day = addDays(d, i), ds = iso(day);
      const ts = trainsFor(state.from, state.to, ds);
      const past = day < today || day > maxDate;
      const b = document.createElement("button");
      b.type = "button"; b.className = "day";
      b.setAttribute("aria-pressed", String(i === 0));
      b.disabled = past;
      b.innerHTML = `<small>${day.toLocaleDateString("en-GB", { weekday: "short" })}</small><b>${day.getDate()} ${day.toLocaleDateString("en-GB", { month: "short" })}</b>` +
        (past ? "<em>&nbsp;</em>" : ts.length ? `<em>${eur(minPrice(ts[0]))}</em>` : `<em style="color:var(--muted)">No train</em>`);
      b.addEventListener("click", () => { state.date = ds; dateIn.value = ds; state.train = null; state.cls = null; renderResults(); renderSummary(); });
      strip.appendChild(b);
    }
    const list = $("#results");
    const ts = trainsFor(state.from, state.to, state.date);
    if (!ts.length) {
      const r = ROUTES.find(x => (x.a === state.from && x.b === state.to) || (x.b === state.from && x.a === state.to));
      const days = r && r.days ? r.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(n => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n]).join(", ") : "";
      let next = null;
      for (let i = 1; i < 8 && !next; i++) { const ds = iso(addDays(d, i)); if (trainsFor(state.from, state.to, ds).length) next = ds; }
      list.innerHTML = `<div class="empty"><p>No train on ${fmtDate(d, { weekday: "long", day: "numeric", month: "long" })}.</p>
        <p>${days ? `This route runs on ${days} nights. ` : ""}${next ? `<button type="button" class="link" data-jump="${next}">Show ${fmtDate(parseIso(next), { weekday: "long", day: "numeric", month: "short" })}</button>` : ""}</p></div>`;
      const j = $("[data-jump]", list);
      if (j) j.addEventListener("click", () => { state.date = j.dataset.jump; dateIn.value = state.date; renderResults(); });
      return;
    }
    list.innerHTML = ts.map(t => {
      const fromC = CITIES[t.from], toC = CITIES[t.to];
      const arrDate = addDays(d, 1);
      return `<article class="train">
        <div class="train__times">
          <div class="train__t"><b>${t.dep}</b><small>${esc(fromC.station)}</small></div>
          <div class="train__track"><span>${dur(t.dep, t.arr)}</span></div>
          <div class="train__t train__t--end"><b>${t.arr}<sup title="Arrives ${fmtDate(arrDate, { weekday: "long" })}">+1</sup></b><small>${esc(toC.station)}</small></div>
        </div>
        <div class="train__price"><div><small>Seat from</small><strong>${eur(t.price.seat)}</strong> <small style="display:inline">per person</small></div>
          <button type="button" class="btn btn--lamp btn--sm" data-train="${t.key}">Select</button></div>
        <div class="train__meta"><span><b>${t.no}</b></span><span>Calls at ${t.via.map(esc).join(", ")}</span>
          <span>Couchette from <b>${eur(t.price.couchette)}</b></span><span>Cabin from <b>${eur(t.price.cabin)}</b></span></div>
      </article>`;
    }).join("");
    $$("[data-train]", list).forEach(b => b.addEventListener("click", () => {
      state.train = ts.find(t => t.key === b.dataset.train);
      state.cls = null;
      renderClasses(); setStep(2); scrollToEl(book);
    }));
  }

  function cabinsNeeded(p) { return p <= 3 ? [p] : [2, p - 2]; }
  function cabinPrice(single, occupants) { return single * [1, 1, 1.35, 1.7][occupants]; }

  function classPrice(cls, t = state.train, opts = state) {
    if (!t) return 0;
    const p = opts.pax;
    if (cls === "seat") return t.price.seat * p;
    if (cls === "couchette") return (t.price.couchette + (opts.berth === "4" ? FOUR_BERTH : 0)) * p;
    return cabinsNeeded(p).reduce((s, o) => s + cabinPrice(t.price.cabin, o) + (opts.cabinType === "deluxe" ? DELUXE : 0), 0);
  }
  function availability(cls) {
    const t = state.train, p = state.pax;
    if (cls === "cabin") { const need = cabinsNeeded(p).length; return { ok: t.left.cabin >= need, n: t.left.cabin, unit: t.left.cabin === 1 ? "cabin" : "cabins" }; }
    const n = t.left[cls];
    return { ok: n >= p, n, unit: cls === "seat" ? (n === 1 ? "seat" : "seats") : (n === 1 ? "berth" : "berths") };
  }

  function renderClasses() {
    const t = state.train;
    $("#classSub").textContent = `${t.no} · ${fmtDate(parseIso(t.date), { weekday: "long", day: "numeric", month: "long" })} · ${state.pax} ${state.pax === 1 ? "traveller" : "travellers"}. Prices are for your whole party.`;
    const wrap = $("#classOptions");
    wrap.innerHTML = Object.entries(CLASSES).map(([k, c]) => {
      const a = availability(k);
      const note = !a.ok ? (a.n === 0 ? "Sold out" : `Only ${a.n} ${a.unit} left — not enough for your party`) : a.n <= 4 ? `${a.n} ${a.unit} left` : "Available";
      const per = k === "cabin" ? (cabinsNeeded(state.pax).length > 1 ? "2 cabins" : "1 cabin") : `${eur(k === "seat" ? t.price.seat : t.price.couchette)} each`;
      return `<div class="opt" role="radio" tabindex="${k === (state.cls || "seat") ? 0 : -1}" aria-checked="${state.cls === k}" aria-disabled="${!a.ok}" data-cls="${k}">
        <span class="opt__check" aria-hidden="true"></span>
        <h3>${c.name}</h3>
        <p class="opt__price"><strong data-price="${k}">${eur(classPrice(k))}</strong> · ${per}</p>
        <ul>${c.perks.map(x => `<li>${x}</li>`).join("")}</ul>
        <p class="opt__avail${!a.ok || a.n <= 4 ? " is-low" : ""}">${note}</p>
      </div>`;
    }).join("");
    const opts = $$(".opt", wrap);
    const choose = o => {
      if (o.getAttribute("aria-disabled") === "true") return;
      state.cls = o.dataset.cls;
      opts.forEach(x => { x.setAttribute("aria-checked", String(x === o)); x.tabIndex = x === o ? 0 : -1; });
      renderExtras(); renderSummary();
      $("#toDetails").disabled = false;
    };
    opts.forEach((o, i) => {
      o.addEventListener("click", () => choose(o));
      o.addEventListener("keydown", e => {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); choose(o); }
        if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
          const n = opts[(i + dir + opts.length) % opts.length];
          n.focus(); choose(n);
        }
      });
    });
    $("#toDetails").disabled = !state.cls;
    renderExtras();
  }

  function renderExtras() {
    const box = $("#extras");
    if (!state.cls) { box.innerHTML = ""; return; }
    let html = "";
    if (state.cls === "couchette") {
      html += `<h3>Compartment</h3><div class="choice-row">
        <label class="chip"><input type="radio" name="berth" value="6" ${state.berth === "6" ? "checked" : ""}> 6 berths</label>
        <label class="chip"><input type="radio" name="berth" value="4" ${state.berth === "4" ? "checked" : ""}> 4 berths, more headroom <small>+${eur(FOUR_BERTH)} pp</small></label></div>`;
    }
    if (state.cls === "cabin") {
      html += `<h3>Cabin</h3><div class="choice-row">
        <label class="chip"><input type="radio" name="cabinType" value="standard" ${state.cabinType === "standard" ? "checked" : ""}> Standard, washbasin</label>
        <label class="chip"><input type="radio" name="cabinType" value="deluxe" ${state.cabinType === "deluxe" ? "checked" : ""}> Deluxe, shower &amp; WC <small>+${eur(DELUXE)} per cabin</small></label></div>`;
    }
    html += `<h3>Add-ons</h3><div class="choice-row">`;
    if (state.cls === "seat") html += `<label class="chip"><input type="checkbox" name="breakfast" ${state.breakfast ? "checked" : ""}> Breakfast box <small>+${eur(BREAKFAST)} pp</small></label>`;
    html += `<label class="chip"><input type="checkbox" name="bike" ${state.bike ? "checked" : ""}> Bicycle space <small>+${eur(BIKE)}</small></label></div>`;
    box.innerHTML = html;
    box.onchange = e => {
      const i = e.target;
      if (i.name === "berth") state.berth = i.value;
      if (i.name === "cabinType") state.cabinType = i.value;
      if (i.name === "breakfast") state.breakfast = i.checked;
      if (i.name === "bike") state.bike = i.checked ? 1 : 0;
      $$("[data-price]").forEach(s => { s.textContent = eur(classPrice(s.dataset.price)); });
      renderSummary();
    };
  }

  function lineItems() {
    const t = state.train, p = state.pax, items = [];
    if (!t || !state.cls) return items;
    if (state.cls === "seat") items.push([`${p} × seat`, t.price.seat * p]);
    if (state.cls === "couchette") items.push([`${p} × ${state.berth}-berth couchette`, (t.price.couchette + (state.berth === "4" ? FOUR_BERTH : 0)) * p]);
    if (state.cls === "cabin") cabinsNeeded(p).forEach(o => items.push([`${state.cabinType === "deluxe" ? "Deluxe" : "Standard"} cabin for ${o}`, cabinPrice(t.price.cabin, o) + (state.cabinType === "deluxe" ? DELUXE : 0)]));
    if (state.cls === "seat" && state.breakfast) items.push([`${p} × breakfast box`, BREAKFAST * p]);
    if (state.bike) items.push(["Bicycle space", BIKE]);
    return items;
  }
  const total = () => lineItems().reduce((s, [, v]) => s + Math.round(v), 0);

  function renderSummary() {
    const body = $("#summaryBody");
    const d = parseIso(state.date);
    const t = state.train;
    const fromC = CITIES[state.from], toC = CITIES[state.to];
    let html = `<div class="sum-route"><i aria-hidden="true"></i>
      <div><b>${esc(fromC.station)}</b><small>${fmtDate(d)}${t ? " · " + t.dep : ""}</small></div>
      <div><b>${esc(toC.station)}</b><small>${fmtDate(addDays(d, 1))}${t ? " · " + t.arr : ""}</small></div></div>`;
    html += `<div class="sum-lines"><div class="sum-line"><span>Travellers</span><span>${state.pax}</span></div>`;
    if (t) html += `<div class="sum-line"><span>Train</span><span>${t.no}</span></div>`;
    html += `</div>`;
    const items = lineItems();
    if (items.length) {
      html += `<div class="sum-lines">${items.map(([l, v]) => `<div class="sum-line"><span>${l}</span><span>${eur(v)}</span></div>`).join("")}</div>`;
      html += `<div class="sum-total"><span>Total</span><strong>${eur(total())}</strong></div>`;
    } else {
      html += `<p class="sum-muted">${t ? "Choose a sleeping option to see the total." : "Select a train to see prices."}</p>`;
    }
    body.innerHTML = html;
  }

  $("#toDetails").addEventListener("click", () => {
    if (!state.cls) return;
    renderPaxFields(); setStep(3); scrollToEl(book);
    const first = $("#paxFields input"); if (first) first.focus({ preventScroll: true });
  });
  $$("[data-back]").forEach(b => b.addEventListener("click", () => { setStep(+b.dataset.back); scrollToEl(book); }));

  const names = [];
  function renderPaxFields() {
    const box = $("#paxFields");
    box.innerHTML = Array.from({ length: state.pax }, (_, i) =>
      `<label class="field"><span class="field__label">Traveller ${i + 1} <b>· full name</b></span>
        <input type="text" name="name${i}" autocomplete="${i === 0 ? "name" : "off"}" value="${esc(names[i] || "")}" required></label>`).join("");
    $$("input", box).forEach((inp, i) => inp.addEventListener("input", () => { names[i] = inp.value; inp.removeAttribute("aria-invalid"); }));
  }

  $("#detailsForm").addEventListener("submit", e => {
    e.preventDefault();
    let bad = null;
    const mark = (inp, ok, msg) => {
      inp.setAttribute("aria-invalid", String(!ok));
      const lab = inp.closest("label");
      let m = lab.querySelector(".err");
      if (!ok) {
        if (!m) { m = document.createElement("span"); m.className = "err"; m.id = inp.name + "-err"; lab.appendChild(m); }
        m.textContent = msg; inp.setAttribute("aria-describedby", m.id);
        if (!bad) bad = inp;
      } else if (m) { m.remove(); inp.removeAttribute("aria-describedby"); }
    };
    $$("#paxFields input").forEach(inp => mark(inp, inp.value.trim().length >= 2, "Enter the name as it appears on ID."));
    const em = $("#email");
    mark(em, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()), "Enter an email address like name@example.com.");
    if (bad) { bad.focus(); return; }
    openReview();
  });
  $("#email").addEventListener("input", e => e.target.removeAttribute("aria-invalid"));

  const dialog = $("#review");
  function openReview() {
    const t = state.train, d = parseIso(state.date);
    const rows = [
      ["Route", `${CITIES[t.from].name} → ${CITIES[t.to].name}`],
      ["Departs", `${fmtDate(d)}, ${t.dep}`],
      ["Arrives", `${fmtDate(addDays(d, 1))}, ${t.arr}`],
      ["Train", t.no],
      ["Sleeping", lineItems().filter(([l]) => !/Bicycle|breakfast/.test(l)).map(([l]) => l).join(", ")],
      ["Travellers", $$("#paxFields input").map(i => esc(i.value.trim())).join(", ")],
      ["Tickets to", esc($("#email").value.trim())],
      ["Total", `<strong>${eur(total())}</strong>`]
    ];
    $("#reviewBody").innerHTML = `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "new") {
      book.hidden = true; state.train = null; state.cls = null;
      names.length = 0; $("#email").value = "";
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      fromSel.focus({ preventScroll: true });
    }
  });

  /* ---------- Route cards ---------- */
  function renderRouteCards() {
    const ds = iso(today);
    const arrow = `<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6h15M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    $("#routecards").innerHTML = ROUTES.map(r => {
      const tonight = trainsFor(r.a, r.b, ds)[0];
      const price = tonight ? tonight.price.seat : Math.round(r.base[0] * 0.95);
      const days = r.days ? r.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(n => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n]).join(" · ") : "Every night";
      return `<li><button type="button" class="rc" data-a="${r.a}" data-b="${r.b}">
        <span class="rc__cities">${CITIES[r.a].name} ${arrow} ${CITIES[r.b].name}</span>
        <span class="rc__times"><span>${r.out[0]} → ${r.out[1]}</span><span>${dur(r.out[0], r.out[1])}</span></span>
        <span class="rc__foot"><span>${days}</span><span>from <strong>${eur(price)}</strong></span></span>
      </button></li>`;
    }).join("");
    $$(".rc").forEach(b => b.addEventListener("click", () => {
      state.from = b.dataset.a; fromSel.value = state.from; fillTo();
      state.to = b.dataset.b; toSel.value = state.to;
      let d = parseIso(dateIn.value || state.date);
      if (d < today) d = today;
      // jump to the next night this route runs
      for (let i = 0; i < 7 && !trainsFor(state.from, state.to, iso(d)).length; i++) d = addDays(d, 1);
      state.date = iso(d); dateIn.value = state.date; state.pax = +paxSel.value;
      startBooking();
    }));
  }

  // "from" prices in the class explainer reflect the lowest base fares
  const lows = [0, 1, 2].map(i => Math.round(Math.min(...ROUTES.map(r => r.base[i])) * 0.9));
  $$(".tier__from strong").forEach((s, i) => { s.textContent = eur(lows[i]); });
  $(".hero .eyebrow").textContent = `Overnight sleeper trains · ${ROUTES.length} routes · ${Object.keys(CITIES).length} cities`;

  fillFrom(); fillTo(); buildMap(); paintMap(); renderRouteCards();
})();
