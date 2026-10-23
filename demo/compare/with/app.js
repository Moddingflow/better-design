/* Driftline demo. Timetable, fares and availability below are SAMPLE FIXTURES, not real
   services. Nothing is sent anywhere: the booking flow ends in a demo notice. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ── Fixtures ─────────────────────────────────────────── */
  var CITIES = {
    AMS: { name: 'Amsterdam', station: 'Amsterdam Centraal', lat: 52.37, lon: 4.90, lx: -14, ly: -14, anchor: 'end' },
    BRU: { name: 'Brussels', station: 'Bruxelles-Midi', lat: 50.85, lon: 4.35, lx: -14, ly: 5, anchor: 'end' },
    PAR: { name: 'Paris', station: 'Paris Est', lat: 48.86, lon: 2.35, lx: 0, ly: 30, anchor: 'middle' },
    HAM: { name: 'Hamburg', station: 'Hamburg Hbf', lat: 53.55, lon: 10.00, lx: 0, ly: -16, anchor: 'middle' },
    BER: { name: 'Berlin', station: 'Berlin Hbf', lat: 52.52, lon: 13.40, lx: 14, ly: -12, anchor: 'start' },
    PRG: { name: 'Prague', station: 'Praha hl.n.', lat: 50.08, lon: 14.44, lx: 14, ly: -10, anchor: 'start' },
    VIE: { name: 'Vienna', station: 'Wien Hbf', lat: 48.21, lon: 16.37, lx: 14, ly: 6, anchor: 'start' },
    ZRH: { name: 'Zurich', station: 'Zürich HB', lat: 47.37, lon: 8.54, lx: 0, ly: 32, anchor: 'middle' },
    BUD: { name: 'Budapest', station: 'Budapest-Keleti', lat: 47.50, lon: 19.04, lx: 0, ly: 32, anchor: 'middle' }
  };
  // days: 0 = Sunday. out/back: [departure, arrival next morning].
  var ROUTES = [
    { a: 'AMS', b: 'VIE', no: [421, 420], out: ['19:28', '09:42'], back: ['20:38', '10:01'], via: 'Köln, Frankfurt', bend: 20, fare: [69, 109, 289] },
    { a: 'PAR', b: 'BER', no: [469, 468], out: ['19:12', '09:56'], back: ['20:18', '10:24'], via: 'Strasbourg, Mannheim', bend: -22, fare: [59, 99, 269] },
    { a: 'BRU', b: 'PRG', no: [453, 452], out: ['19:22', '10:31'], back: ['19:05', '09:52'], via: 'Köln, Leipzig, Dresden', bend: -60, fare: [59, 95, 259], outDays: [1, 3, 5], backDays: [0, 2, 4] },
    { a: 'AMS', b: 'ZRH', no: [403, 402], out: ['19:58', '09:15'], back: ['19:59', '09:03'], via: 'Köln, Basel', bend: -16, fare: [65, 105, 279] },
    { a: 'PAR', b: 'VIE', no: [467, 466], out: ['19:40', '10:13'], back: ['19:10', '09:45'], via: 'Strasbourg, München', bend: 26, fare: [69, 115, 299] },
    { a: 'HAM', b: 'VIE', no: [491, 490], out: ['20:04', '09:32'], back: ['20:11', '09:22'], via: 'Hannover, Nürnberg', bend: -20, fare: [65, 105, 279] },
    { a: 'BER', b: 'BUD', no: [477, 476], out: ['18:50', '08:58'], back: ['19:20', '09:18'], via: 'Dresden, Bratislava', bend: -34, fare: [55, 95, 249] },
    { a: 'HAM', b: 'ZRH', no: [471, 470], out: ['20:24', '08:56'], back: ['20:02', '08:40'], via: 'Frankfurt, Basel', bend: 8, fare: [65, 105, 279] },
    { a: 'ZRH', b: 'PRG', no: [479, 478], out: ['20:40', '09:14'], back: ['19:51', '08:47'], via: 'München, Plzeň', bend: -18, fare: [59, 99, 259] }
  ];
  var CLASSES = [
    { id: 'seat', name: 'Seat', unit: 'per person', facts: [['Lie flat', 'No'], ['Shared with', 'Up to 5 others'], ['Bedding', 'None'], ['Breakfast', 'Not included']], noun: ['seat', 'seats'] },
    { id: 'couchette', name: 'Couchette', unit: 'per person', facts: [['Lie flat', 'Yes'], ['Shared with', 'Up to 3 others'], ['Bedding', 'Sheet, pillow, blanket'], ['Breakfast', 'Included']], noun: ['berth', 'berths'] },
    { id: 'cabin', name: 'Private cabin', unit: 'per cabin · sleeps 2', facts: [['Lie flat', 'Yes'], ['Shared with', 'Your group only'], ['Bedding', 'Made-up bed, towels'], ['Breakfast', 'Included']], noun: ['cabin', 'cabins'] }
  ];
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_LONG = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MAX_DAYS = 180;

  /* ── Helpers ──────────────────────────────────────────── */
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseIso(s) { var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!p) return null; var d = new Date(+p[1], +p[2] - 1, +p[3]); return isNaN(d) ? null : d; }
  function fmtDay(d) { return DAY[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }
  function mins(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function eur(n) { return '€' + n.toLocaleString('en-GB'); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function findLeg(from, to) {
    for (var i = 0; i < ROUTES.length; i++) {
      var r = ROUTES[i];
      if (r.a === from && r.b === to) return { r: r, from: from, to: to, dep: r.out[0], arr: r.out[1], no: r.no[0], days: r.outDays };
      if (r.b === from && r.a === to) return { r: r, from: from, to: to, dep: r.back[0], arr: r.back[1], no: r.no[1], days: r.backDays };
    }
    return null;
  }
  function runs(leg, d) { return !leg.days || leg.days.indexOf(d.getDay()) >= 0; }
  function runsText(leg) { return leg.days ? leg.days.map(function (x) { return DAY[x]; }).join(', ') : 'Daily'; }

  // Deterministic sample availability and fares per train and night.
  function offer(leg, d) {
    if (!runs(leg, d)) return null;
    var h = hash(leg.no + iso(d));
    var weekend = d.getDay() === 5 || d.getDay() === 6;
    var left = [8 + h % 52, (h >>> 6) % 7 === 0 ? 0 : 2 + (h >>> 9) % 22, (h >>> 14) % 9];
    var fare = leg.r.fare.map(function (f, i) { return f + (weekend ? [10, 15, 40][i] : 0); });
    return { left: left, fare: fare };
  }
  function units(cls, pax) { return cls === 2 ? Math.ceil(pax / 2) : pax; }
  function cheapest(o, pax) {
    for (var i = 0; i < 3; i++) if (o.left[i] >= units(i, pax)) return i === 2 ? Math.ceil(o.fare[2] / Math.min(pax, 2)) : o.fare[i];
    return null;
  }

  /* ── State ────────────────────────────────────────────── */
  var state = { from: 'AMS', to: 'VIE', date: addDays(today(), 1), pax: 1, cls: null, token: 0 };

  /* ── Network map ──────────────────────────────────────── */
  var svgNS = 'http://www.w3.org/2000/svg';
  function px(c) { return { x: 70 + (c.lon - 2.35) * 50, y: 60 + (53.55 - c.lat) * 78.6 }; }
  function el(tag, attrs, parent) { var e = document.createElementNS(svgNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var map = $('map'), routeEls = [];
  function curve(r) {
    var p = px(CITIES[r.a]), q = px(CITIES[r.b]);
    var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
    var cx = mx - dy / len * r.bend, cy = my + dx / len * r.bend;
    return 'M' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + q.x.toFixed(1) + ' ' + q.y.toFixed(1);
  }
  function routeLabel(r) { return CITIES[r.a].name + ' – ' + CITIES[r.b].name; }
  function buildMap() {
    var gRoutes = el('g', {}, map);
    ROUTES.forEach(function (r) {
      var g = el('g', { class: 'route', tabindex: '0', role: 'button', 'aria-label': 'Book ' + routeLabel(r) + ', ' + r.out[0] + ' to ' + r.out[1] }, gRoutes);
      el('path', { class: 'line', d: curve(r) }, g);
      g._r = r;
      routeEls.push(g);
      g.addEventListener('focus', function () { caption(r); });
      g.addEventListener('blur', function () { caption(null); });
      g.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault(); if (!e.repeat) press(g); pickRoute(r.a, r.b, true);
      });
      g.addEventListener('keyup', function () { release(); });
    });
    routeEls.forEach(function (g) {
      var line = g.querySelector('.line'), L = line.getTotalLength();
      g._pts = []; for (var i = 0; i <= 80; i++) { var p = line.getPointAtLength(L * i / 80); g._pts.push([p.x, p.y]); }
    });
    // Lines cross, so the pointer picks the nearest line rather than whichever is drawn on top.
    function nearest(e) {
      var m = map.getScreenCTM(); if (!m) return null;
      var pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      var best = null, bd = Infinity;
      routeEls.forEach(function (g) { g._pts.forEach(function (p) { var d = Math.hypot(p[0] - pt.x, p[1] - pt.y); if (d < bd) { bd = d; best = g; } }); });
      return bd * m.a <= 22 ? best : null; // within 22 CSS px of a line
    }
    var hovered = null, pressed = null, pressedAt = 0;
    function hover(g) {
      if (g === hovered) return;
      if (hovered) hovered.classList.remove('hov');
      hovered = g; map.classList.toggle('pointing', !!g);
      if (g) { g.classList.add('hov'); caption(g._r); } else caption(null);
    }
    function press(g) { pressed = g; pressedAt = performance.now(); g.setAttribute('data-pressed', ''); }
    function release() {
      var g = pressed; pressed = null; if (!g) return;
      setTimeout(function () { g.removeAttribute('data-pressed'); }, Math.max(0, 90 - (performance.now() - pressedAt)));
    }
    map.addEventListener('pointermove', function (e) { hover(nearest(e)); });
    map.addEventListener('pointerleave', function () { hover(null); });
    map.addEventListener('pointerdown', function (e) { var g = nearest(e); if (g) press(g); });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    map.addEventListener('click', function (e) { var g = nearest(e); if (g) pickRoute(g._r.a, g._r.b, true); });
    var gCities = el('g', { 'aria-hidden': 'true' }, map);
    Object.keys(CITIES).forEach(function (k) {
      var c = CITIES[k], p = px(c);
      var g = el('g', { class: 'city', 'data-city': k }, gCities);
      el('circle', { cx: p.x, cy: p.y, r: 6 }, g);
      var t = el('text', { x: p.x + c.lx, y: p.y + c.ly, 'text-anchor': c.anchor }, g);
      t.textContent = c.name;
    });
  }
  function caption(r) {
    var cap = $('mapCap');
    var leg = r ? findLeg(r.a, r.b) : findLeg(state.from, state.to);
    if (!leg) { cap.textContent = 'Select a line to book that route.'; return; }
    cap.innerHTML = '<b>' + esc(CITIES[leg.from].name + ' → ' + CITIES[leg.to].name) + '</b> · ' + leg.dep + ' → ' + leg.arr + ' · ' + runsText(leg);
  }
  function syncMap(animate) {
    var leg = findLeg(state.from, state.to);
    routeEls.forEach(function (g) {
      var on = !!leg && g._r === leg.r, was = g.classList.contains('on');
      g.classList.toggle('on', on);
      if (on && !was && animate && !reduce.matches && g.animate) {
        var line = g.querySelector('.line'), L = line.getTotalLength();
        line.animate([{ strokeDasharray: L + ' ' + L, strokeDashoffset: leg.from === g._r.a ? L : -L }, { strokeDasharray: L + ' ' + L, strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(0.28, 0.11, 0.32, 1)' });
      }
    });
    map.querySelectorAll('.city').forEach(function (c) { var k = c.getAttribute('data-city'); c.classList.toggle('on', k === state.from || k === state.to); });
    caption(null);
  }

  /* ── Search form ──────────────────────────────────────── */
  var fromSel = $('from'), toSel = $('to'), dateIn = $('date');
  function fillSelects() {
    var keys = Object.keys(CITIES).sort(function (a, b) { return CITIES[a].name.localeCompare(CITIES[b].name); });
    var opts = keys.map(function (k) { return '<option value="' + k + '">' + esc(CITIES[k].name) + '</option>'; }).join('');
    fromSel.innerHTML = opts; toSel.innerHTML = opts;
    dateIn.min = iso(today()); dateIn.max = iso(addDays(today(), MAX_DAYS));
  }
  function syncForm() {
    fromSel.value = state.from; toSel.value = state.to; dateIn.value = iso(state.date);
    $('pax').value = state.pax; $('pax').textContent = state.pax;
    $('paxMinus').setAttribute('aria-disabled', String(state.pax <= 1));
    $('paxPlus').setAttribute('aria-disabled', String(state.pax >= 6));
  }
  function pickRoute(a, b, jump) {
    state.from = a; state.to = b; state.cls = null;
    syncForm(); syncMap(true); search();
    if (jump) {
      var top = $('book').getBoundingClientRect().top + window.scrollY - 52;
      window.scrollTo({ top: top, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }

  /* ── Results ──────────────────────────────────────────── */
  var results = $('results');
  function skeleton() {
    var nights = ''; for (var i = 0; i < 7; i++) nights += '<div class="sk sk-night"></div>';
    results.setAttribute('aria-busy', 'true');
    results.innerHTML = '<div class="sk-row">' + nights + '</div>' +
      '<div class="journey"><div class="j-times"><div class="sk sk-time"></div><div></div><div class="sk sk-time"></div></div><div class="sk sk-bar"></div></div>' +
      '<div class="sk-classes"><div class="sk-label"></div><div class="sk sk-card"></div><div class="sk sk-card"></div><div class="sk sk-card"></div></div>';
  }
  // Simulated request: fixtures resolve after a short, fixed latency so the loading state is real.
  function search() {
    var token = ++state.token;
    var showSkeleton = setTimeout(skeleton, 120);
    setTimeout(function () {
      clearTimeout(showSkeleton);
      if (token !== state.token) return; // a newer search replaced this one
      render();
    }, 520);
  }
  function nightsStrip(leg) {
    var start = addDays(state.date, -3);
    if (start < today()) start = today();
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i);
      if (d > addDays(today(), MAX_DAYS)) break;
      var o = offer(leg, d), p = o ? cheapest(o, state.pax) : null;
      var on = iso(d) === iso(state.date);
      var price = !o ? 'No train' : p == null ? 'Full' : 'from ' + eur(p);
      html += '<button type="button" class="night ui-press ' + (on ? '' : 'ui-press--on-dark ') + 'ui-focus" data-date="' + iso(d) + '" aria-pressed="' + on + '" aria-label="' + fmtDay(d) + ', ' + price + '">' +
        '<span class="nd">' + DAY[d.getDay()] + ' ' + d.getDate() + '</span><span class="np">' + price + '</span></button>';
    }
    return '<div class="nights" role="group" aria-label="Nights">' + html + '</div>';
  }
  function nightbar(leg) {
    var S = 17 * 60, SPAN = 20 * 60; // axis 17:00 → 13:00 next day
    var pos = function (m) { return ((m - S + 1440) % 1440) / SPAN * 100; };
    var a = pos(mins(leg.dep));
    var arr = ((mins(leg.arr) + 1440 - S) / SPAN) * 100;
    var dk0 = pos(22 * 60), dk1 = ((7 * 60 + 1440 - S) / SPAN) * 100;
    var ticks = [['17:00', 0], ['20:00', 15], ['00:00', 35], ['04:00', 55], ['08:00', 75], ['13:00', 100]];
    return '<div class="nightbar" aria-hidden="true"><div class="nb-track">' +
      '<span class="nb-dark" style="left:' + dk0 + '%;width:' + (dk1 - dk0) + '%"></span>' +
      '<span class="nb-trip" style="left:' + a + '%;width:' + (arr - a) + '%"></span></div>' +
      '<div class="nb-ticks">' + ticks.map(function (t) { return '<span style="left:' + t[1] + '%">' + t[0] + '</span>'; }).join('') + '</div></div>';
  }
  function duration(leg) { var m = mins(leg.arr) + 1440 - mins(leg.dep); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; }

  function render() {
    results.removeAttribute('aria-busy');
    var leg = findLeg(state.from, state.to);
    var out = '';
    if (state.from === state.to) {
      out = '<div class="state"><h3>From and To are the same city.</h3><p>Pick a different destination.</p>' + destChips() + '</div>';
      state.cls = null;
    } else if (!leg) {
      out = '<div class="state"><h3>No Driftline train runs between ' + esc(CITIES[state.from].name) + ' and ' + esc(CITIES[state.to].name) + '.</h3>' +
        '<p>Night trains from ' + esc(CITIES[state.from].name) + ' go to:</p>' + destChips() + '</div>';
      state.cls = null;
    } else {
      out += nightsStrip(leg);
      var o = offer(leg, state.date);
      if (!o) {
        state.cls = null;
        out += '<div class="state"><h3>No train on ' + fmtDay(state.date) + '.</h3><p>' + esc(CITIES[leg.from].name) + ' → ' + esc(CITIES[leg.to].name) + ' runs on ' + leg.days.map(function (x) { return DAY_LONG[x]; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '. Pick another night above.</p></div>';
      } else {
        out += '<article class="journey" aria-label="Train ' + leg.no + '">' +
          '<div class="j-times"><div class="j-end"><span class="t">' + leg.dep + '</span><span class="s">' + esc(CITIES[leg.from].station) + '</span></div>' +
          '<div class="j-mid">' + duration(leg) + '</div>' +
          '<div class="j-end j-arr"><span class="t">' + leg.arr + '<sup>+1</sup></span><span class="s">' + esc(CITIES[leg.to].station) + '</span></div></div>' +
          nightbar(leg) +
          '<p class="j-meta">DL ' + leg.no + ' · via ' + esc(leg.r.via) + '</p></article>';
        out += classes(o);
      }
    }
    results.innerHTML = '<div class="fade-in">' + out + '</div>';
    wireResults();
    if (!reduce.matches) {
      var trip = results.querySelector('.nb-trip');
      if (trip && trip.animate) trip.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, easing: 'cubic-bezier(0.28, 0.11, 0.32, 1)' });
    }
    summary();
    if (state.refocus) { var f = results.querySelector(state.refocus); state.refocus = null; if (f) f.focus({ preventScroll: true }); }
  }
  function destChips() {
    var list = ROUTES.filter(function (r) { return r.a === state.from || r.b === state.from; }).map(function (r) { return r.a === state.from ? r.b : r.a; });
    return '<div class="chips">' + list.map(function (k) { return '<button type="button" class="chip ui-press ui-press--on-dark ui-focus" data-to="' + k + '">' + esc(CITIES[k].name) + '</button>'; }).join('') + '</div>';
  }
  function classes(o) {
    var labels = CLASSES[0].facts.map(function (f, i) { return '<span class="c-label row-' + (i + 3) + '" aria-hidden="true">' + f[0] + '</span>'; }).join('');
    var cards = CLASSES.map(function (c, i) {
      var need = units(i, state.pax), left = o.left[i], ok = left >= need;
      if (!ok && state.cls === i) state.cls = null;
      var price = o.fare[i];
      var avail = left === 0 ? 'Sold out' : !ok ? 'Only ' + left + ' ' + c.noun[left === 1 ? 0 : 1] + ' left, you need ' + need : left <= 4 ? 'Only ' + left + ' left' : left + ' ' + c.noun[1] + ' left';
      var facts = c.facts.map(function (f) { return '<span class="fact"><span class="k">' + f[0] + ' </span><span class="v' + (/^(No|None|Not included)$/.test(f[1]) ? ' no' : '') + '">' + f[1] + '</span></span>'; }).join('');
      return '<button type="button" role="radio" data-ui-align="start" class="cls col-' + (i + 1) + ' ui-press ui-press--surface ui-press--on-dark ui-focus" data-cls="' + i + '" aria-checked="' + (state.cls === i) + '"' + (ok ? '' : ' aria-disabled="true"') + '>' +
        '<span class="c-head"><span class="c-name">' + c.name + '</span><span class="radio" aria-hidden="true"></span></span>' +
        '<span class="c-price"><b>' + eur(price) + '</b><small>' + c.unit + '</small></span>' + facts +
        '<span class="c-avail">' + avail + '</span></button>';
    }).join('');
    return '<div class="classes" role="radiogroup" aria-label="Class">' + labels + cards + '</div>';
  }
  function wireResults() {
    results.querySelectorAll('.night').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = parseIso(b.getAttribute('data-date'));
        if (!d || iso(d) === iso(state.date)) return;
        state.date = d; state.refocus = '.night[data-date="' + iso(d) + '"]'; syncForm(); search();
      });
    });
    results.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { pickRoute(state.from, b.getAttribute('data-to'), false); });
    });
    var radios = Array.prototype.slice.call(results.querySelectorAll('.cls'));
    radios.forEach(function (b, idx) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-disabled') === 'true') return;
        state.cls = +b.getAttribute('data-cls');
        radios.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        summary();
      });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        for (var k = 1; k <= radios.length; k++) {
          var n = radios[(idx + d * k + radios.length * 3) % radios.length];
          if (n.getAttribute('aria-disabled') !== 'true') { n.focus({ preventScroll: true }); n.click(); break; }
        }
      });
    });
    // roving tabindex: one tab stop for the radio group
    var cur = radios.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0] || radios.filter(function (x) { return x.getAttribute('aria-disabled') !== 'true'; })[0];
    radios.forEach(function (x) { x.tabIndex = x === cur ? 0 : -1; });
    radios.forEach(function (x) { x.addEventListener('click', function () { radios.forEach(function (y) { y.tabIndex = y === x ? 0 : -1; }); }); });
  }

  /* ── Summary and total ────────────────────────────────── */
  var shownTotal = null;
  function quote() {
    var leg = findLeg(state.from, state.to);
    if (!leg) return null;
    var o = offer(leg, state.date);
    if (!o) return { leg: leg };
    if (state.cls == null) return { leg: leg, o: o };
    var n = units(state.cls, state.pax);
    return { leg: leg, o: o, n: n, total: n * o.fare[state.cls] };
  }
  function rows(q) {
    var r = [['Route', CITIES[q.leg.from].name + ' → ' + CITIES[q.leg.to].name]];
    if (q.o) r.push(['Night', fmtDay(state.date) + ', ' + q.leg.dep], ['Train', 'DL ' + q.leg.no]);
    r.push(['Travellers', String(state.pax)]);
    if (q.total != null) r.push(['Class', state.cls === 2 ? q.n + ' private cabin' + (q.n === 1 ? '' : 's') : CLASSES[state.cls].name + ' × ' + q.n]);
    return r.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('');
  }
  function summary() {
    var q = quote(), btn = $('continue'), note = $('sumNote');
    $('sumList').innerHTML = q ? rows(q) : '<div><dt>Route</dt><dd>Not available</dd></div>';
    var ready = !!(q && q.total != null);
    btn.setAttribute('aria-disabled', String(!ready));
    note.textContent = !q || !q.o ? 'Pick a route and night with a train.' : ready ? 'Demo: nothing is booked or charged.' : 'Choose a class to see the total.';
    rollTotal(ready ? q.total : null);
  }
  function rollTotal(v) {
    var t = $('total');
    if (v == null) { t.textContent = '–'; shownTotal = null; return; }
    var from = shownTotal == null ? v : shownTotal; shownTotal = v;
    if (reduce.matches || from === v) { t.textContent = eur(v); return; }
    var t0 = performance.now(), D = 420;
    cancelAnimationFrame(t._raf);
    (function step(now) {
      var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      t.textContent = eur(Math.round(from + (v - from) * e));
      if (k < 1) t._raf = requestAnimationFrame(step);
    })(t0);
  }

  /* ── Review sheet (demo end) ──────────────────────────── */
  var dlg = $('review');
  function openReview() {
    var q = quote();
    if (!q || q.total == null) { BetterUI.shake($('continue')); return; }
    $('revList').innerHTML = rows(q);
    $('revTotal').textContent = eur(q.total);
    $('revForm').hidden = false; $('revDone').hidden = true;
    dlg.showModal();
    $('pname').focus({ preventScroll: true });
  }
  function setErr(input, msg) {
    var e = $(input.id + 'Err');
    input.setAttribute('aria-invalid', String(!!msg));
    e.hidden = !msg;
    e.innerHTML = msg ? '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.8v3.6M8 11.1v.1"/></svg>' + esc(msg) : '';
  }
  function validate() {
    var n = $('pname'), m = $('pmail'), ok = true;
    if (!n.value.trim()) { setErr(n, 'Enter the lead traveller’s name.'); ok = false; } else setErr(n, '');
    if (!m.value.trim()) { setErr(m, 'Enter an email address.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim())) { setErr(m, 'This email address looks incomplete.'); ok = false; }
    else setErr(m, '');
    if (!ok) { var first = $('paxForm').querySelector('[aria-invalid="true"]'); BetterUI.shake(first); first.focus({ preventScroll: true }); }
    return ok;
  }
  $('paxForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var btn = $('revSubmit'), q = quote();
    // No request is made: the demo shows where the live site would submit the booking.
    BetterUI.runWithState(btn, function () { return new Promise(function (r) { setTimeout(r, 600); }); }, { doneMs: 400 }).then(function () {
      setTimeout(function () {
        $('doneText').textContent = 'Nothing was booked and no payment was taken. On the live Driftline site, this request (' +
          CITIES[q.leg.from].name + ' → ' + CITIES[q.leg.to].name + ', ' + fmtDay(state.date) + ', ' + CLASSES[state.cls].name.toLowerCase() + ' for ' + state.pax + ', ' + eur(q.total) +
          ') would be submitted for confirmation and payment, and tickets would go to ' + $('pmail').value.trim() + '.';
        $('revForm').hidden = true; $('revDone').hidden = false;
        $('doneTitle').focus({ preventScroll: true });
      }, 380);
    });
  });
  ['pname', 'pmail'].forEach(function (id) { $(id).addEventListener('input', function () { if ($(id).getAttribute('aria-invalid') === 'true') setErr($(id), ''); }); });
  $('revBack').addEventListener('click', function () { dlg.close(); });
  $('revClose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { $('continue').focus({ preventScroll: true }); });
  $('continue').addEventListener('click', openReview);

  /* ── Berths ───────────────────────────────────────────── */
  var BERTHS = {
    seat: 'Six reclining seats face each other, each with a fold-down table and a reading light.',
    couchette: 'Four berths in two bunks, 190 × 70 cm, with a curtain, a reading light and a USB-C socket each.',
    cabin: 'Two beds that fold into a sofa by evening, a washbasin, and a door that locks from inside.'
  };
  function planSvg(kind) {
    // Top-down plans of one compartment: corridor along the bottom, window along the top.
    var s = '<svg viewBox="0 0 480 360" role="img" aria-label="Floor plan of a ' + (kind === 'cabin' ? 'private cabin' : kind + ' compartment') + '">';
    s += '<rect class="wall" x="40" y="40" width="400" height="230" rx="6"/>';
    s += '<line class="glass" x1="120" y1="40" x2="360" y2="40"/>';
    s += '<text x="240" y="28" text-anchor="middle">Window</text>';
    s += '<line class="thin" x1="40" y1="300" x2="440" y2="300"/><text x="240" y="330" text-anchor="middle">Corridor</text>';
    s += '<rect class="fill" x="200" y="262" width="80" height="16" rx="2"/>'; // door
    if (kind === 'seat') {
      for (var i = 0; i < 3; i++) {
        s += '<rect class="fill" x="64" y="' + (64 + i * 62) + '" width="96" height="54" rx="10"/>';
        s += '<rect class="fill" x="320" y="' + (64 + i * 62) + '" width="96" height="54" rx="10"/>';
      }
      s += '<rect class="thin" x="210" y="56" width="60" height="40" rx="4"/><text x="240" y="122" text-anchor="middle">Table</text>';
    } else if (kind === 'couchette') {
      s += '<rect class="fill" x="64" y="64" width="128" height="182" rx="8"/><rect class="thin" x="76" y="76" width="104" height="36" rx="6"/>';
      s += '<rect class="fill" x="288" y="64" width="128" height="182" rx="8"/><rect class="thin" x="300" y="76" width="104" height="36" rx="6"/>';
      s += '<text x="128" y="190" text-anchor="middle">2 berths</text><text x="352" y="190" text-anchor="middle">2 berths</text>';
      s += '<text x="240" y="160" text-anchor="middle">Ladder</text><line class="thin" x1="210" y1="174" x2="270" y2="174"/>';
    } else {
      s += '<rect class="fill" x="64" y="64" width="150" height="182" rx="8"/><rect class="thin" x="78" y="78" width="122" height="38" rx="6"/>';
      s += '<text x="139" y="190" text-anchor="middle">2 beds</text>';
      s += '<rect class="fill" x="330" y="64" width="86" height="64" rx="8"/><circle class="thin" cx="373" cy="96" r="20"/><text x="373" y="152" text-anchor="middle">Basin</text>';
      s += '<rect class="thin" x="300" y="196" width="40" height="40" rx="4"/><text x="380" y="221" text-anchor="middle">Lock</text><circle class="thin" cx="320" cy="216" r="6"/>';
    }
    return s + '</svg>';
  }
  function showBerth(kind, animate) {
    $('berthText').textContent = BERTHS[kind];
    var plan = $('plan');
    plan.innerHTML = planSvg(kind);
    plan.setAttribute('aria-labelledby', 'tab-' + kind);
    if (animate) plan.firstChild.classList.add('enter');
  }

  /* ── Timetable ────────────────────────────────────────── */
  function timetable() {
    $('ttBody').innerHTML = ROUTES.map(function (r) {
      var o = findLeg(r.a, r.b), b = findLeg(r.b, r.a);
      return '<div class="tt-row" role="row">' +
        '<span class="r" role="cell">' + esc(CITIES[r.a].name + ' – ' + CITIES[r.b].name) + '<span class="via">via ' + esc(r.via) + '</span></span>' +
        '<span role="cell" data-k="Outbound">' + o.dep + ' → ' + o.arr + '</span>' +
        '<span role="cell" data-k="Return">' + b.dep + ' → ' + b.arr + '</span>' +
        '<span role="cell" data-k="Runs">' + (r.outDays ? runsText(o) + ' out' : 'Daily') + '</span>' +
        '<span role="cell" class="num" data-k="Seats from">' + eur(r.fare[0]) + '</span>' +
        '<span role="cell" class="act"><a class="more ui-dim ui-focus" href="#book" data-a="' + r.a + '" data-b="' + r.b + '" aria-label="Book ' + esc(CITIES[r.a].name + ' to ' + CITIES[r.b].name) + '">Book<span class="ui-icon-nudge" aria-hidden="true">›</span></a></span></div>';
    }).join('');
    $('ttBody').querySelectorAll('a[data-a]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); pickRoute(a.getAttribute('data-a'), a.getAttribute('data-b'), true); });
    });
  }

  /* ── Wiring ───────────────────────────────────────────── */
  // In-page anchors scroll this document only (the page may be framed).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1), t = id === 'top' ? document.body : $(id);
    if (!t) return;
    e.preventDefault();
    var top = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 52;
    window.scrollTo({ top: top, behavior: reduce.matches ? 'auto' : 'smooth' });
    if (id !== 'top') { var h = t.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  });
  fromSel.addEventListener('change', function () {
    state.from = fromSel.value; state.cls = null;
    if (state.to === state.from || !findLeg(state.from, state.to)) {
      var r = ROUTES.filter(function (x) { return x.a === state.from || x.b === state.from; })[0];
      if (r) state.to = r.a === state.from ? r.b : r.a;
    }
    syncForm(); syncMap(true); search();
  });
  toSel.addEventListener('change', function () { state.to = toSel.value; state.cls = null; syncMap(true); search(); });
  dateIn.addEventListener('change', function () {
    var d = parseIso(dateIn.value);
    if (!d || d < today() || d > addDays(today(), MAX_DAYS)) { BetterUI.shake(dateIn); dateIn.value = iso(state.date); return; }
    state.date = d; search();
  });
  $('swap').addEventListener('click', function () { var f = state.from; state.from = state.to; state.to = f; state.cls = null; syncForm(); syncMap(true); search(); });
  $('paxMinus').addEventListener('click', function () { if (state.pax > 1) { state.pax--; syncForm(); search(); } });
  $('paxPlus').addEventListener('click', function () { if (state.pax < 6) { state.pax++; syncForm(); search(); } });
  $('search').addEventListener('submit', function (e) { e.preventDefault(); });

  BetterUI.init(document);
  var seg = $('berthSeg');
  BetterUI.segmented(seg, { onChange: function (i, b) { showBerth(b.id.slice(4), true); } });

  fillSelects(); syncForm(); buildMap(); syncMap(false); timetable(); showBerth('couchette', false);
  render();
})();
