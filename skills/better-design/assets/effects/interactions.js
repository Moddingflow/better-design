/*
 * better-design · interactive effects (vanilla, no dependencies)
 *   BetterFx.headerMorph(headerEl)              fx:header-morph
 *   BetterFx.coverflow(scrollerEl, opts)        fx:coverflow
 *   BetterFx.rulerScrubber(rootEl, opts)        fx:ruler-scrubber
 *   BetterFx.storyStack(rootEl, opts)           fx:story-stack
 *   BetterFx.rotatingPhrase(spanEl, opts)       fx:rotating-phrase
 *   BetterFx.dotnav(rootEl, opts)               fx:dotnav-progress
 * Each returns { destroy() }. Markup and CSS hooks are in effects.css. In React/Vue/Svelte,
 * port the logic into the stack's idiom (refs + effects) instead of mounting from outside;
 * keep the accessibility and reduced-motion behaviour.
 */
(function (root) {
  'use strict';

  var reduceMq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* fx:header-morph — toggles [data-compact] once the page leaves the top. */
  function headerMorph(header, opts) {
    var o = Object.assign({ offset: 8 }, opts || {});
    var ticking = false;
    function update() {
      ticking = false;
      if (root.scrollY > o.offset) header.setAttribute('data-compact', '');
      else header.removeAttribute('data-compact');
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    root.addEventListener('scroll', onScroll, { passive: true });
    update();
    return { destroy: function () { root.removeEventListener('scroll', onScroll); } };
  }

  /* fx:coverflow — slides scale and fade by distance from the center of a native
     scroll-snap scroller. The centered slide is full size; neighbours recede.
     Scrolling, swipe, wheel and keyboard stay native. Optional autoplay stops for good on
     the first interaction and never runs under reduced motion. */
  function coverflow(scroller, opts) {
    var o = Object.assign({ minScale: 0.78, minOpacity: 0.45, falloff: 0.8, autoplayMs: 0, tween: '.fx-coverflow__tween' }, opts || {});
    var slides = Array.prototype.slice.call(scroller.children);
    var raf = 0, timer = 0, stopped = false;
    function apply() {
      raf = 0;
      var box = scroller.getBoundingClientRect();
      var center = box.left + box.width / 2;
      slides.forEach(function (slide) {
        var r = slide.getBoundingClientRect();
        var d = (r.left + r.width / 2 - center) / (r.width || 1);   // distance in slide widths
        var s = clamp(1 - Math.abs(d) * o.falloff, 0, 1);
        var t = slide.querySelector(o.tween) || slide;
        t.style.transform = 'scale(' + (o.minScale + (1 - o.minScale) * s).toFixed(4) + ')';
        t.style.opacity = (o.minOpacity + (1 - o.minOpacity) * s).toFixed(3);
      });
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(apply); }
    function centeredIndex() {
      var box = scroller.getBoundingClientRect(), c = box.left + box.width / 2, best = 0, bd = Infinity;
      slides.forEach(function (s, i) { var r = s.getBoundingClientRect(); var d = Math.abs(r.left + r.width / 2 - c); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function go(i) {
      var s = slides[(i + slides.length) % slides.length];
      scroller.scrollTo({ left: s.offsetLeft - (scroller.clientWidth - s.offsetWidth) / 2, behavior: reduceMq.matches ? 'auto' : 'smooth' });
    }
    function stop() { stopped = true; clearInterval(timer); }
    scroller.addEventListener('scroll', schedule, { passive: true });
    root.addEventListener('resize', schedule);
    ['pointerdown', 'wheel', 'keydown', 'focusin', 'mouseenter'].forEach(function (e) { scroller.addEventListener(e, stop, { passive: true }); });
    if (o.autoplayMs > 0 && !reduceMq.matches) timer = setInterval(function () { if (!stopped && document.visibilityState === 'visible') go(centeredIndex() + 1); }, o.autoplayMs);
    apply();
    return {
      next: function () { stop(); go(centeredIndex() + 1); },
      prev: function () { stop(); go(centeredIndex() - 1); },
      destroy: function () { stop(); cancelAnimationFrame(raf); scroller.removeEventListener('scroll', schedule); root.removeEventListener('resize', schedule); }
    };
  }

  /* fx:ruler-scrubber — a barcode timeline of thin ticks with a draggable thumb.
     items: [{ title, caption, date, tone?, major? }]; tone = CSS color for incidents.
     Labels above and below follow the thumb. role=slider with full keyboard support. */
  function rulerScrubber(rootEl, opts) {
    var o = Object.assign({ items: [], index: null, label: 'Timeline', pageStep: 7, onChange: null }, opts || {});
    var n = o.items.length;
    var index = o.index == null ? n - 1 : o.index;
    rootEl.classList.add('fx-ruler');
    rootEl.innerHTML =
      '<div class="fx-ruler__label fx-ruler__label--top" aria-hidden="true"></div>' +
      '<div class="fx-ruler__track" role="slider" tabindex="0"></div>' +
      '<div class="fx-ruler__label fx-ruler__label--bottom" aria-hidden="true"></div>';
    var top = rootEl.children[0], track = rootEl.children[1], bottom = rootEl.children[2];
    track.setAttribute('aria-label', o.label);
    track.setAttribute('aria-valuemin', '1');
    track.setAttribute('aria-valuemax', String(n));
    var ticks = o.items.map(function (it, i) {
      var t = document.createElement('span');
      t.className = 'fx-ruler__tick';
      t.setAttribute('aria-hidden', 'true');
      if (it.major) t.setAttribute('data-major', '');
      if (it.tone) { t.setAttribute('data-tone', ''); t.style.setProperty('--tone', it.tone); }
      t.appendChild(document.createElement('i'));
      t.addEventListener('click', function () { set(i); });
      track.appendChild(t);
      return t;
    });
    function render() {
      ticks.forEach(function (t, i) { if (i === index) t.setAttribute('data-current', ''); else t.removeAttribute('data-current'); });
      var it = o.items[index] || {};
      top.textContent = it.title || '';
      bottom.innerHTML = '';
      if (it.caption) { var p = document.createElement('div'); p.textContent = it.caption; bottom.appendChild(p); }
      if (it.date) { var d = document.createElement('div'); d.className = 'fx-ruler__date'; d.textContent = it.date; bottom.appendChild(d); }
      var rr = rootEl.getBoundingClientRect(), tk = ticks[index].getBoundingClientRect();
      var x = tk.left + tk.width / 2 - rr.left;
      // Follow the thumb, but keep each label fully inside the component.
      [top, bottom].forEach(function (lab) {
        var half = lab.offsetWidth / 2;
        lab.style.left = clamp(x, Math.min(half, rr.width / 2), Math.max(rr.width - half, rr.width / 2)) + 'px';
      });
      track.setAttribute('aria-valuenow', String(index + 1));
      track.setAttribute('aria-valuetext', [it.date, it.title].filter(Boolean).join(' — '));
    }
    function set(i) {
      var next = clamp(i, 0, n - 1);
      if (next === index) return;
      index = next; render();
      if (o.onChange) o.onChange(index, o.items[index]);
    }
    function fromX(clientX) {
      var r = track.getBoundingClientRect();
      if (r.width) set(Math.floor((clientX - r.left) / r.width * n));
    }
    var dragging = false;
    function down(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try { track.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      dragging = true; track.setAttribute('data-dragging', ''); fromX(e.clientX);
    }
    function move(e) { if (dragging) fromX(e.clientX); }
    function up(e) {
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      dragging = false; track.removeAttribute('data-dragging');
    }
    function key(e) {
      var map = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -o.pageStep, PageUp: o.pageStep, Home: -n, End: n };
      if (map[e.key] == null) return;
      e.preventDefault(); set(index + map[e.key]);
    }
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('keydown', key);
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(render) : null;
    if (ro) ro.observe(rootEl);
    render();
    return {
      set: set,
      destroy: function () { if (ro) ro.disconnect(); track.removeEventListener('keydown', key); }
    };
  }

  /* fx:story-stack — a deck of cards. The front card can be dragged down to send it to
     the back; cards behind are clickable; segmented progress auto-advances and pauses on
     hover, focus and drag. Autoplay is off under reduced motion, and a pause control
     ([data-fx-stack-toggle]) is required when autoplay runs (WCAG 2.2.2).
     Markup: .fx-stack > .fx-stack__card × n, optional .fx-stack__progress,
     [data-fx-stack-next], [data-fx-stack-toggle]. */
  function storyStack(rootEl, opts) {
    var o = Object.assign({ ms: 7000, depthY: -26, depthScale: 0.05, visible: 3, threshold: 80, velocity: 0.3, autoplay: true }, opts || {});
    var cards = Array.prototype.slice.call(rootEl.querySelectorAll('.fx-stack__card'));
    var order = cards.map(function (_, i) { return i; });   // order[0] is the front card
    var progress = rootEl.querySelector('.fx-stack__progress');
    var nextBtn = rootEl.querySelector('[data-fx-stack-next]');
    var toggle = rootEl.querySelector('[data-fx-stack-toggle]');
    var auto = o.autoplay && !reduceMq.matches;
    var userPaused = false, hoverPaused = false;
    var segs = [];
    var spring = '600ms cubic-bezier(0.22, 1, 0.36, 1)';     // critically damped feel, no overshoot

    if (progress) {
      progress.setAttribute('aria-hidden', 'true');
      segs = cards.map(function () {
        var s = document.createElement('span'); s.className = 'fx-stack__seg'; s.appendChild(document.createElement('i'));
        progress.appendChild(s); return s;
      });
      rootEl.style.setProperty('--fx-stack-ms', o.ms + 'ms');
    }

    function layout(animate) {
      order.forEach(function (ci, depth) {
        var c = cards[ci];
        c.style.transition = animate && !reduceMq.matches ? 'transform ' + spring + ', opacity ' + spring : 'none';
        c.style.zIndex = String(cards.length - depth);
        c.setAttribute('data-depth', String(depth));
        var shown = depth < o.visible;
        c.style.transform = 'translateY(' + depth * o.depthY + 'px) scale(' + (1 - depth * o.depthScale) + ')';
        c.style.opacity = shown ? '1' : '0';
        c.style.pointerEvents = shown ? 'auto' : 'none';
        if (depth === 0) { c.removeAttribute('aria-hidden'); c.removeAttribute('inert'); }
        else { c.setAttribute('aria-hidden', 'true'); c.setAttribute('inert', ''); }
      });
      var front = order[0];
      segs.forEach(function (s, i) {
        s.removeAttribute('data-current'); s.removeAttribute('data-done');
        var fresh = s.firstChild.cloneNode(); s.replaceChild(fresh, s.firstChild);   // restart animation
        if (i < front) s.setAttribute('data-done', '');
        if (i === front) {
          if (auto) { s.setAttribute('data-current', ''); fresh.addEventListener('animationend', advance, { once: true }); }
          else s.setAttribute('data-done', '');
        }
      });
      syncPause();
    }
    function bringToFront(ci) {
      while (order[0] !== ci) order.push(order.shift());
      layout(true);
    }
    function advance() {
      var out = cards[order[0]];
      order.push(order.shift());
      layout(true);
      // The outgoing card fades while it travels behind the deck, so it never crosses
      // over the new front card.
      if (!reduceMq.matches && out.animate) {
        out.animate([{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }],
          { duration: 600, easing: 'linear' });
      }
    }
    function syncPause() {
      if (userPaused || hoverPaused || dragging) rootEl.setAttribute('data-paused', '');
      else rootEl.removeAttribute('data-paused');
      if (toggle) toggle.setAttribute('aria-pressed', String(userPaused));
    }

    // Drag the front card down to dismiss it.
    var dragging = false, startY = 0, lastY = 0, lastT = 0, vel = 0, dragCard = null, justDragged = false;
    function down(e) {
      var c = e.target.closest('.fx-stack__card');
      if (!c || c.getAttribute('data-depth') !== '0' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragCard = c; dragging = true; startY = lastY = e.clientY; lastT = e.timeStamp; vel = 0;
      try { c.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      c.setAttribute('data-dragging', ''); c.style.transition = 'none'; syncPause();
    }
    function move(e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      var y = dy > 0 ? dy : dy * 0.2;                        // elastic resistance upward
      dragCard.style.transform = 'translateY(' + y + 'px)';
      var dt = e.timeStamp - lastT; if (dt > 0) vel = (e.clientY - lastY) / dt;
      lastY = e.clientY; lastT = e.timeStamp;
    }
    function up(e) {
      if (!dragging) return;
      // A fast flick may deliver few or no pointermove events: count the release point too.
      if (e && e.type === 'pointerup') {
        var dt = e.timeStamp - lastT;
        if (dt > 0 && e.clientY !== lastY) vel = (e.clientY - lastY) / dt;
        lastY = e.clientY;
      }
      dragging = false; dragCard.removeAttribute('data-dragging');
      var dy = lastY - startY;
      // The click that follows this pointerup must not bring the dismissed card back.
      if (Math.abs(dy) > 4) { justDragged = true; setTimeout(function () { justDragged = false; }, 0); }
      if (dy > o.threshold || vel > o.velocity) advance(); else layout(true);
      dragCard = null; syncPause();
    }
    function clickBehind(e) {
      if (justDragged) return;
      var c = e.target.closest('.fx-stack__card');
      if (c && c.getAttribute('data-depth') !== '0') bringToFront(cards.indexOf(c));
    }
    rootEl.addEventListener('pointerdown', down);
    rootEl.addEventListener('pointermove', move);
    rootEl.addEventListener('pointerup', up);
    rootEl.addEventListener('pointercancel', up);
    rootEl.addEventListener('click', clickBehind);
    rootEl.addEventListener('mouseenter', function () { hoverPaused = true; syncPause(); });
    rootEl.addEventListener('mouseleave', function () { hoverPaused = false; syncPause(); });
    rootEl.addEventListener('focusin', function () { hoverPaused = true; syncPause(); });
    rootEl.addEventListener('focusout', function () { hoverPaused = false; syncPause(); });
    if (nextBtn) nextBtn.addEventListener('click', advance);
    if (toggle) {
      if (!auto) toggle.hidden = true;
      toggle.addEventListener('click', function () { userPaused = !userPaused; syncPause(); });
    }
    layout(false);
    return { next: advance, show: bringToFront, destroy: function () { rootEl.removeEventListener('pointerdown', down); } };
  }

  /* fx:rotating-phrase — an inline chip inside a sentence cycles its phrasings; the chip
     width eases to fit each one. Screen readers get every phrasing once, statically.
     Rotation pauses on hover/focus and offscreen, stops under reduced motion. */
  function rotatingPhrase(el, opts) {
    var o = Object.assign({ variants: [], interval: 3200 }, opts || {});
    if (o.variants.length < 2) return { destroy: function () {} };
    var i = 0, timer = 0, hovered = false, onScreen = false;
    el.classList.add('fx-phrase');
    el.setAttribute('aria-hidden', 'true');
    var sr = document.createElement('span');
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;';
    sr.textContent = o.variants.join(' / ');
    el.parentNode.insertBefore(sr, el.nextSibling);
    var cur = document.createElement('span');
    cur.className = 'fx-phrase__text';
    cur.textContent = o.variants[0];
    el.textContent = '';
    el.appendChild(cur);
    var padX = function () { var cs = getComputedStyle(el); return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); };
    function measure(text) {
      var m = cur.cloneNode(); m.textContent = text; m.style.cssText = 'position:absolute;visibility:hidden;';
      el.appendChild(m); var w = m.getBoundingClientRect().width; m.remove(); return w;
    }
    el.style.width = (measure(o.variants[0]) + padX()) + 'px';
    function next() {
      i = (i + 1) % o.variants.length;
      var text = o.variants[i];
      el.style.width = (measure(text) + padX()) + 'px';
      var old = cur;
      old.className = 'fx-phrase__text fx-phrase__text--out';
      old.addEventListener('animationend', function () { old.remove(); }, { once: true });
      cur = document.createElement('span');
      cur.className = 'fx-phrase__text fx-phrase__text--in';
      cur.textContent = text;
      el.appendChild(cur);
    }
    function schedule() {
      clearInterval(timer); timer = 0;
      if (!reduceMq.matches && onScreen && !hovered) timer = setInterval(next, o.interval);
    }
    var host = el.closest('p, h1, h2, h3, li, div') || el;
    host.addEventListener('mouseenter', function () { hovered = true; schedule(); });
    host.addEventListener('mouseleave', function () { hovered = false; schedule(); });
    var io = new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; schedule(); });
    io.observe(el);
    return { next: next, destroy: function () { clearInterval(timer); io.disconnect(); } };
  }

  /* fx:dotnav-progress — timed dot navigation in a glass pill with a play/pause button.
     The current dot stretches into a bar that fills over `ms`, then advances. A tablist:
     arrows move between dots, Enter/Space or click selects. Autoplay is off under reduced
     motion, stops on pause, and does not advance while the gallery is offscreen. */
  function dotnav(rootEl, opts) {
    var o = Object.assign({ count: 0, ms: 6000, label: 'Gallery', labels: null, onSelect: null, autoplay: true }, opts || {});
    var timed = o.autoplay && !reduceMq.matches, index = 0, playing = timed, onScreen = true;
    rootEl.classList.add('fx-dotnav');
    rootEl.style.setProperty('--fx-dotnav-ms', o.ms + 'ms');
    rootEl.innerHTML = '<div class="fx-dotnav__pill" role="tablist"></div><button class="fx-dotnav__play" type="button"></button>';
    var pill = rootEl.firstChild, play = rootEl.lastChild;
    pill.setAttribute('aria-label', o.label);
    var dots = [];
    for (var k = 0; k < o.count; k++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fx-dotnav__dot'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', o.labels ? o.labels[k] : 'Item ' + (k + 1) + ' of ' + o.count);
      (function (n) { b.addEventListener('click', function () { select(n, true); }); })(k);
      b.addEventListener('animationend', function () { if (playing && onScreen) select((index + 1) % o.count, false); });
      pill.appendChild(b); dots.push(b);
    }
    pill.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault(); select((index + d + o.count) % o.count, true); dots[index].focus();
    });
    var ICON_PAUSE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg>';
    var ICON_PLAY = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9.5-5.5z" fill="currentColor"/></svg>';
    function render() {
      dots.forEach(function (d, n) {
        var sel = n === index;
        d.setAttribute('aria-selected', String(sel)); d.tabIndex = sel ? 0 : -1;
      });
      // data-playing = timed mode (the bar fills); data-paused freezes the fill in place.
      if (timed) rootEl.setAttribute('data-playing', ''); else rootEl.removeAttribute('data-playing');
      if (!playing || !onScreen) rootEl.setAttribute('data-paused', ''); else rootEl.removeAttribute('data-paused');
      play.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    function select(n, user) {
      index = n;
      // Restart the fill: toggle the attribute so the ::after animation runs again.
      rootEl.removeAttribute('data-playing'); void rootEl.offsetWidth;
      render();
      if (o.onSelect) o.onSelect(index, user);
    }
    play.addEventListener('click', function () { playing = !playing; render(); });
    if (!timed) play.hidden = true;
    var io = new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; render(); }, { threshold: 0.3 });
    io.observe(rootEl);
    render();
    return { select: select, destroy: function () { io.disconnect(); } };
  }

  var api = root.BetterFx = root.BetterFx || {};
  api.rotatingPhrase = rotatingPhrase;
  api.dotnav = dotnav;
  api.headerMorph = headerMorph;
  api.coverflow = coverflow;
  api.rulerScrubber = rulerScrubber;
  api.storyStack = storyStack;
  if (typeof module !== 'undefined' && module.exports) module.exports = { headerMorph: headerMorph, coverflow: coverflow, rulerScrubber: rulerScrubber, storyStack: storyStack };
})(typeof globalThis !== 'undefined' ? globalThis : window);
