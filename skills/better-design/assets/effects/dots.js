/*
 * better-design · dot language (vanilla, no dependencies)
 *   BetterFx.dotSpotlight(el, opts)   fx:dot-field spotlight: dots brighten under the pointer
 *   BetterFx.dotMatrix(el, opts)      fx:dot-matrix: any image, SVG, text or function as dots
 *   BetterFx.dotGlobe(el, opts)       fx:dot-globe: rotating dotted sphere, arcs, HTML markers
 *   BetterFx.dotWave(el, opts)        fx:dot-wave: a band of dots with a travelling pulse
 *   BetterFx.dotBars(el, opts)        fx:dot-bars: data as columns of dots, optional scroll
 *   BetterFx.ledGlyph(el, opts)       fx:led-glyph: 5×5 LED status icon with frame sequences
 * Each returns { destroy() } (dotBars / ledGlyph / dotWave return the created SVG too).
 * Shared rules: DPR capped at 2, loops pause offscreen and in hidden tabs, reduced motion
 * shows a still final state, nothing here is focusable or announced (pure decoration);
 * the meaning must also exist in text next to it.
 */
(function (root) {
  'use strict';

  var reduceMq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // Runs fn(dtSeconds) on rAF while the element is on screen and the tab is visible.
  function visibleLoop(el, fn, fps) {
    var raf = 0, onScreen = false, last = 0, minDt = 1000 / (fps || 30), stopped = false;
    function tick(now) {
      raf = 0;
      if (stopped || !onScreen || document.visibilityState === 'hidden') return;
      if (!last) last = now - minDt;   // first frame advances immediately
      if (now - last >= minDt) { fn(Math.min(0.1, (now - last) / 1000)); last = now; }
      if (!stopped) raf = requestAnimationFrame(tick);   // fn may have stopped the loop
    }
    function kick() { if (!stopped && !raf && onScreen && document.visibilityState !== 'hidden') { last = 0; raf = requestAnimationFrame(tick); } }
    var io = new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; kick(); }, { rootMargin: '100px' });
    io.observe(el);
    document.addEventListener('visibilitychange', kick);
    return { stop: function () { stopped = true; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', kick); } };
  }

  function sizeCanvas(canvas, host, maxDpr) {
    var dpr = Math.min(root.devicePixelRatio || 1, maxDpr || 2);
    var w = host.clientWidth, h = host.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function makeCanvas(host) {
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(c);
    return c;
  }

  /* ── fx:dot-field spotlight ────────────────────────────────────────────────
     The field itself is CSS (.fx-dots). This only feeds the pointer position into
     --fx-mx / --fx-my and toggles [data-spot]. Pointer-fine devices only. */
  function dotSpotlight(el) {
    if (!root.matchMedia || !root.matchMedia('(hover: hover) and (pointer: fine)').matches) return { destroy: function () {} };
    var raf = 0, x = 0, y = 0;
    function apply() { raf = 0; el.style.setProperty('--fx-mx', x + 'px'); el.style.setProperty('--fx-my', y + 'px'); }
    function move(e) {
      var r = el.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top;
      el.setAttribute('data-spot', '');
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function leave() { el.removeAttribute('data-spot'); }
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return { destroy: function () { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); } };
  }

  /* ── fx:dot-matrix ─────────────────────────────────────────────────────────
     source: an <img>/<canvas>/<svg> element, an image URL, { text, font }, or a
     function (u, v) -> 0..1 with u, v in [0, 1]. Dark-on-transparent and light images
     both work: the sampler reads alpha × (invert ? 1 - luma : luma).
     mode 'size': dot radius follows the value (halftone). mode 'threshold': all dots
     the same size, shown above `cut` (LED sign). reveal: dots grow in by distance from
     `origin` once when the element first appears. */
  function dotMatrix(host, opts) {
    var o = Object.assign({
      source: null, pitch: 6, radius: 2.2, mode: 'size', cut: 0.35, invert: false,
      color: '#ffffff', dim: 0, fit: 'contain', reveal: true, origin: [0.5, 0.5], revealMs: 900, gamma: 1
    }, opts || {});
    var canvas = makeCanvas(host);
    var grid = null, field = null, revealT = (o.reveal && !reduceMq.matches) ? 0 : 1, loop = null, dead = false;

    function sampler(cb) {
      var s = o.source;
      if (typeof s === 'function') return cb(s);
      if (s && typeof s === 'object' && s.text != null) {
        return cb(rasterize(function (ctx, w, h) {
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = s.font || ('700 ' + Math.round(h * 0.8) + 'px system-ui, sans-serif');
          ctx.fillText(s.text, w / 2, h / 2 + h * 0.04);
        }, true));
      }
      var img = s;
      if (typeof s === 'string') { img = new Image(); img.crossOrigin = 'anonymous'; img.src = s; }
      if (img instanceof HTMLImageElement && !img.complete) { img.addEventListener('load', function () { if (!dead) cb(fromImage(img)); }, { once: true }); return; }
      cb(fromImage(img));
    }
    // Draw the source at full CSS size (so fonts and images use real pixels), then
    // downsample to one pixel per cell: each cell reads the average of its area.
    function rasterize(draw, alphaOnly) {
      var cols = grid.cols, rows = grid.rows;
      var hi = document.createElement('canvas'); hi.width = cols * o.pitch; hi.height = rows * o.pitch;
      draw(hi.getContext('2d'), hi.width, hi.height);
      var off = document.createElement('canvas'); off.width = cols; off.height = rows;
      var ctx = off.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(hi, 0, 0, cols, rows);
      var data = ctx.getImageData(0, 0, cols, rows).data;
      return function (u, v) {
        var i = (Math.min(rows - 1, Math.floor(v * rows)) * cols + Math.min(cols - 1, Math.floor(u * cols))) * 4;
        var a = data[i + 3] / 255;
        if (alphaOnly) return a;
        var l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        return a * (o.invert ? 1 - l : l);
      };
    }
    function fromImage(img) {
      return rasterize(function (ctx, w, h) {
        var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
        var s = o.fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
        ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
      });
    }

    function build() {
      var m = sizeCanvas(canvas, host, 2);
      grid = { ctx: m.ctx, w: m.w, h: m.h, cols: Math.max(1, Math.floor(m.w / o.pitch)), rows: Math.max(1, Math.floor(m.h / o.pitch)) };
      sampler(function (f) { field = f; draw(); });
    }
    function draw() {
      if (!field) return;
      var g = grid, ctx = g.ctx, p = o.pitch;
      var ox = (g.w - g.cols * p) / 2 + p / 2, oy = (g.h - g.rows * p) / 2 + p / 2;
      var maxD = Math.hypot(Math.max(o.origin[0], 1 - o.origin[0]) * g.w, Math.max(o.origin[1], 1 - o.origin[1]) * g.h);
      ctx.clearRect(0, 0, g.w, g.h);
      ctx.fillStyle = o.color;
      for (var r = 0; r < g.rows; r++) {
        for (var c = 0; c < g.cols; c++) {
          var v = Math.pow(clamp(field((c + 0.5) / g.cols, (r + 0.5) / g.rows), 0, 1), o.gamma);
          var x = ox + c * p, y = oy + r * p;
          // Reveal: each dot starts when the wavefront passes it, then eases in.
          var d = Math.hypot(x - o.origin[0] * g.w, y - o.origin[1] * g.h) / maxD;
          var k = clamp((revealT * 1.6 - d * 0.6) / 1, 0, 1); k = 1 - Math.pow(1 - k, 3);
          var on = o.mode === 'threshold' ? (v > o.cut ? 1 : 0) : v;
          var rad = on > 0.02 ? o.radius * (o.mode === 'threshold' ? 1 : Math.sqrt(on)) * k : 0;
          if (rad < 0.15 && o.dim > 0) { ctx.globalAlpha = o.dim; rad = o.radius * 0.45; } else ctx.globalAlpha = 1;
          if (rad < 0.15) continue;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    var ro = new ResizeObserver(function () { build(); });
    ro.observe(host);
    if (revealT < 1) {
      var started = false;
      loop = visibleLoop(host, function (dt) {
        started = true;
        revealT = Math.min(1, revealT + dt * 1000 / o.revealMs);
        draw();
        if (revealT >= 1) { loop.stop(); loop = null; }
      }, 60);
      void started;
    }
    return {
      redraw: build,
      destroy: function () { dead = true; ro.disconnect(); if (loop) loop.stop(); canvas.remove(); }
    };
  }

  /* ── fx:dot-globe ──────────────────────────────────────────────────────────
     Dots on a Fibonacci sphere, kept where `land(lat, lon)` is true (or a mask image in
     equirectangular projection: lon -180..180 left->right, lat 90..-90 top->bottom).
     Front dots fade with depth ("fog"); back dots are hidden or very faint. Arcs are
     lifted great circles; markers are your own HTML elements positioned on top. */
  function dotGlobe(host, opts) {
    var o = Object.assign({
      land: null, mask: null, samples: 9000, dotRadius: 1.15, color: '#f38020', backAlpha: 0.08,
      speed: 6, tilt: 18, lon0: -40, drag: true, arcs: [], arcColor: 'rgba(243,128,32,0.9)', markers: []
    }, opts || {});
    var canvas = makeCanvas(host);
    var pts = [], m = null, lon0 = o.lon0, dead = false, dragging = false, lastX = 0;
    var tiltR = o.tilt * Math.PI / 180;

    function build(landFn) {
      pts = [];
      var n = o.samples, ga = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) {
        var y = 1 - (i + 0.5) / n * 2, rr = Math.sqrt(1 - y * y), th = ga * i;
        var lat = Math.asin(y) * 180 / Math.PI;
        var lon = ((th * 180 / Math.PI) % 360) - 180;
        if (landFn(lat, lon)) pts.push([lat * Math.PI / 180, lon * Math.PI / 180]);
        void rr;
      }
      resize();
    }
    function maskFn(img) {
      var W = 360, H = 180, off = document.createElement('canvas'); off.width = W; off.height = H;
      var ctx = off.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, W, H);
      var d = ctx.getImageData(0, 0, W, H).data;
      return function (lat, lon) {
        var x = Math.min(W - 1, Math.floor((lon + 180) / 360 * W)), y = Math.min(H - 1, Math.floor((90 - lat) / 180 * H));
        var i = (y * W + x) * 4;
        return d[i + 3] > 128 && (d[i] + d[i + 1] + d[i + 2]) > 384;   // white, opaque = land
      };
    }
    // lat/lon (radians) -> screen, given the current rotation.
    function project(lat, lon) {
      var cl = Math.cos(lat), x = cl * Math.sin(lon + lon0), y = Math.sin(lat), z = cl * Math.cos(lon + lon0);
      var y2 = y * Math.cos(tiltR) - z * Math.sin(tiltR), z2 = y * Math.sin(tiltR) + z * Math.cos(tiltR);
      return [m.cx + x * m.R, m.cy - y2 * m.R, z2];
    }
    function resize() { m = sizeCanvas(canvas, host, 2); m.cx = m.w / 2; m.cy = m.h / 2; m.R = Math.min(m.w, m.h) * 0.46; draw(); }
    function slerp(a, b, t) {
      var va = [Math.cos(a[0]) * Math.cos(a[1]), Math.sin(a[0]), Math.cos(a[0]) * Math.sin(a[1])];
      var vb = [Math.cos(b[0]) * Math.cos(b[1]), Math.sin(b[0]), Math.cos(b[0]) * Math.sin(b[1])];
      var dot = clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1), om = Math.acos(dot);
      if (om < 1e-6) return a;
      var s0 = Math.sin((1 - t) * om) / Math.sin(om), s1 = Math.sin(t * om) / Math.sin(om);
      var v = [va[0] * s0 + vb[0] * s1, va[1] * s0 + vb[1] * s1, va[2] * s0 + vb[2] * s1];
      return [Math.asin(clamp(v[1], -1, 1)), Math.atan2(v[2], v[0])];
    }
    function draw() {
      if (!m || !pts.length) return;
      var ctx = m.ctx;
      ctx.clearRect(0, 0, m.w, m.h);
      ctx.fillStyle = o.color;
      for (var i = 0; i < pts.length; i++) {
        var p = project(pts[i][0], pts[i][1]);
        if (p[2] < 0) { if (!o.backAlpha) continue; ctx.globalAlpha = o.backAlpha; }
        else ctx.globalAlpha = 0.25 + 0.75 * p[2];            // fog toward the limb
        ctx.fillRect(p[0] - o.dotRadius, p[1] - o.dotRadius, o.dotRadius * 2, o.dotRadius * 2);
      }
      ctx.globalAlpha = 1;
      // Arcs: lifted great circles, drawn only on the front hemisphere.
      ctx.strokeStyle = o.arcColor; ctx.lineWidth = 1.4;
      o.arcs.forEach(function (arc) {
        var a = [arc[0][0] * Math.PI / 180, arc[0][1] * Math.PI / 180], b = [arc[1][0] * Math.PI / 180, arc[1][1] * Math.PI / 180];
        ctx.beginPath(); var pen = false;
        for (var s = 0; s <= 40; s++) {
          var t = s / 40, q = slerp(a, b, t), lift = 1 + 0.18 * Math.sin(Math.PI * t);
          var cl = Math.cos(q[0]), x = cl * Math.sin(q[1] + lon0), y = Math.sin(q[0]), z = cl * Math.cos(q[1] + lon0);
          var y2 = y * Math.cos(tiltR) - z * Math.sin(tiltR), z2 = y * Math.sin(tiltR) + z * Math.cos(tiltR);
          var X = m.cx + x * m.R * lift, Y = m.cy - y2 * m.R * lift;
          if (z2 < -0.05) { pen = false; continue; }
          if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y);
        }
        ctx.stroke();
      });
      o.markers.forEach(function (mk) {
        var p = project(mk.lat * Math.PI / 180, mk.lon * Math.PI / 180);
        mk.el.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px) translate(-50%,-50%) scale(' + (0.85 + 0.15 * Math.max(0, p[2])) + ')';
        mk.el.style.opacity = p[2] > 0.08 ? '1' : '0';
        mk.el.style.visibility = p[2] > 0 ? 'visible' : 'hidden';
      });
    }
    o.markers.forEach(function (mk) { mk.el.style.position = 'absolute'; mk.el.style.left = '0'; mk.el.style.top = '0'; mk.el.style.transition = 'opacity 300ms'; });

    var land = o.land;
    if (!land && o.mask) {
      var img = typeof o.mask === 'string' ? Object.assign(new Image(), { src: o.mask, crossOrigin: 'anonymous' }) : o.mask;
      if (img instanceof HTMLImageElement && !img.complete) img.addEventListener('load', function () { if (!dead) build(maskFn(img)); }, { once: true });
      else build(maskFn(img));
    } else build(land || function () { return true; });

    var ro = new ResizeObserver(resize); ro.observe(host);
    var loop = reduceMq.matches || !o.speed ? null : visibleLoop(host, function (dt) {
      if (!dragging) lon0 += dt * o.speed * Math.PI / 180;
      draw();
    }, 30);
    function down(e) { if (!o.drag) return; dragging = true; lastX = e.clientX; try { host.setPointerCapture(e.pointerId); } catch (err) {} }
    function move(e) { if (!dragging) return; lon0 += (e.clientX - lastX) * 0.005; lastX = e.clientX; if (!loop) draw(); }
    function up() { dragging = false; }
    if (o.drag) { host.style.touchAction = 'pan-y'; host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up); }
    return { destroy: function () { dead = true; ro.disconnect(); if (loop) loop.stop(); canvas.remove(); } };
  }

  /* ── fx:dot-wave ───────────────────────────────────────────────────────────
     A band of dots; a pulse travels along it (each dot brightens and nudges a fraction
     of a pixel). Pure CSS animation after creation: no JS loop. */
  function dotWave(host, opts) {
    var o = Object.assign({ cols: 52, rows: 4, pitch: 7, r: 1, period: 2.2, travel: 0.9, color: 'currentColor' }, opts || {});
    var w = o.cols * o.pitch, h = o.rows * o.pitch;
    var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true', focusable: 'false', class: 'fx-dot-wave', preserveAspectRatio: 'xMidYMid meet' });
    for (var r = 0; r < o.rows; r++) {
      for (var c = 0; c < o.cols; c++) {
        var phase = c / o.cols, ang = (r / Math.max(1, o.rows - 1) - 0.5) * 0.6;
        var dot = svgEl('circle', { cx: o.pitch / 2 + c * o.pitch, cy: o.pitch / 2 + r * o.pitch, r: o.r, fill: o.color, class: 'fx-dot-wave__dot' });
        dot.style.setProperty('--fx-wave-x', (o.travel * Math.cos(ang)).toFixed(3) + 'px');
        dot.style.setProperty('--fx-wave-y', (o.travel * Math.sin(ang)).toFixed(3) + 'px');
        dot.style.animationDelay = (phase * o.period).toFixed(3) + 's';
        dot.style.animationDuration = o.period + 's';
        svg.appendChild(dot);
      }
    }
    host.appendChild(svg);
    return { svg: svg, destroy: function () { svg.remove(); } };
  }

  /* ── fx:dot-bars ───────────────────────────────────────────────────────────
     values: numbers in [0, 1] (real data, or a labelled illustrative series). Each value
     becomes a column of dots growing up from the baseline (or mirrored around the middle
     with `mirror`). `scroll: seconds` duplicates the strip and loops it seamlessly. */
  function dotBars(host, opts) {
    var o = Object.assign({ values: [], rows: 18, pitch: 5, size: 1.2, mirror: true, color: 'currentColor', scroll: 0, shape: 'square' }, opts || {});
    var n = o.values.length, w = n * o.pitch, h = o.rows * o.pitch;
    var d = '';
    for (var i = 0; i < n; i++) {
      var k = Math.round(clamp(o.values[i], 0, 1) * (o.mirror ? Math.floor(o.rows / 2) : o.rows));
      for (var j = 0; j < k; j++) {
        var x = i * o.pitch + (o.pitch - o.size) / 2;
        var ys = o.mirror ? [h / 2 - (j + 0.5) * o.pitch, h / 2 + (j - 0.5) * o.pitch] : [h - (j + 1) * o.pitch];
        ys.forEach(function (y) { d += 'M' + x.toFixed(1) + ' ' + (y + (o.pitch - o.size) / 2).toFixed(1) + 'h' + o.size + 'v' + o.size + 'h-' + o.size + 'z'; });
      }
    }
    var strip = function () {
      var s = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false', 'shape-rendering': 'crispEdges' });
      s.appendChild(svgEl('path', { d: d, fill: o.color }));
      return s;
    };
    var wrap = document.createElement('div');
    wrap.className = 'fx-dot-bars' + (o.scroll ? ' fx-dot-bars--scroll' : '');
    wrap.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'fx-dot-bars__track';
    track.appendChild(strip());
    if (o.scroll) { track.appendChild(strip()); track.style.animationDuration = o.scroll + 's'; }
    wrap.appendChild(track);
    host.appendChild(wrap);
    return { el: wrap, destroy: function () { wrap.remove(); } };
  }

  /* ── fx:led-glyph ──────────────────────────────────────────────────────────
     A 5×5 dot matrix (16 px) that plays frames with steps() timing, like the status
     icons of an instrument. frames: arrays of 25 chars ('#' on, '.' off) or a preset.
     Pure CSS after creation. Reduced motion shows the `still` frame. */
  var LED = {
    pong: ['.....', '.....', '#....', '.....', '.....', '|', '.....', '.....', '.#...', '.....', '.....', '|', '.....', '.....', '..#..', '.....', '.....', '|', '.....', '.....', '...#.', '.....', '.....', '|', '.....', '.....', '....#', '.....', '.....', '|', '.....', '.....', '...#.', '.....', '.....', '|', '.....', '.....', '..#..', '.....', '.....', '|', '.....', '.....', '.#...', '.....', '.....'],
    scan: ['#....', '#....', '#....', '#....', '#....', '|', '.#...', '.#...', '.#...', '.#...', '.#...', '|', '..#..', '..#..', '..#..', '..#..', '..#..', '|', '...#.', '...#.', '...#.', '...#.', '...#.', '|', '....#', '....#', '....#', '....#', '....#'],
    pulse: ['.....', '.....', '..#..', '.....', '.....', '|', '.....', '.###.', '.#.#.', '.###.', '.....', '|', '#####', '#...#', '#...#', '#...#', '#####', '|', '.....', '.....', '.....', '.....', '.....'],
    spinner: ['###..', '.....', '.....', '.....', '.....', '|', '.###.', '.....', '.....', '.....', '.....', '|', '..###', '.....', '.....', '.....', '.....', '|', '...##', '....#', '.....', '.....', '.....', '|', '....#', '....#', '....#', '.....', '.....', '|', '.....', '....#', '....#', '....#', '.....', '|', '.....', '.....', '....#', '....#', '....#', '|', '.....', '.....', '.....', '....#', '...##', '|', '.....', '.....', '.....', '.....', '..###', '|', '.....', '.....', '.....', '.....', '.###.', '|', '.....', '.....', '.....', '.....', '###..', '|', '.....', '.....', '.....', '#....', '##...', '|', '.....', '.....', '#....', '#....', '#....', '|', '.....', '#....', '#....', '#....', '.....', '|', '#....', '#....', '#....', '.....', '.....', '|', '##...', '#....', '.....', '.....', '.....'],
    check: ['.....', '.....', '.....', '.....', '.....', '|', '.....', '.....', '#....', '.....', '.....', '|', '.....', '.....', '#....', '.#...', '.....', '|', '.....', '.....', '#....', '.#.#.', '..#..', '|', '.....', '....#', '#..#.', '.#.#.', '..#..', '|', '.....', '....#', '#..#.', '.#.#.', '..#..', '|', '.....', '....#', '#..#.', '.#.#.', '..#..']
  };
  function parseFrames(list) {
    var frames = [], cur = '';
    list.concat('|').forEach(function (row) { if (row === '|') { if (cur) frames.push(cur); cur = ''; } else cur += row; });
    return frames;
  }
  function ledGlyph(host, opts) {
    var o = Object.assign({ preset: 'pong', frames: null, ms: 1600, size: 16, color: 'currentColor', off: 0.25, still: -1, label: '' }, opts || {});
    var frames = o.frames ? parseFrames(o.frames) : parseFrames(LED[o.preset] || LED.pong);
    var id = 'fxled' + (++uid), n = frames.length, step = 100 / n, css = '';
    var svg = svgEl('svg', { viewBox: '0 0 16 16', width: o.size, height: o.size, class: 'fx-led ' + id, focusable: 'false' });
    if (o.label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', o.label); } else svg.setAttribute('aria-hidden', 'true');
    var still = frames[o.still < 0 ? n - 1 : o.still];
    for (var i = 0; i < 25; i++) {
      var r = Math.floor(i / 5), c = i % 5;
      svg.appendChild(svgEl('circle', { cx: 1 + c * 3.5, cy: 1 + r * 3.5, r: 1, fill: o.color, class: 'd' + i, opacity: still[i] === '#' ? 1 : o.off }));
      var kf = '';
      for (var f = 0; f < n; f++) kf += (f * step).toFixed(3) + '%{opacity:' + (frames[f][i] === '#' ? 1 : o.off) + '}';
      kf += '100%{opacity:' + (frames[n - 1][i] === '#' ? 1 : o.off) + '}';
      css += '@keyframes ' + id + 'd' + i + '{' + kf + '}.' + id + ' .d' + i + '{animation:' + id + 'd' + i + ' ' + o.ms + 'ms steps(1) infinite}';
    }
    var style = svgEl('style', {});
    style.textContent = '@media (prefers-reduced-motion: no-preference){' + css + '}';
    svg.insertBefore(style, svg.firstChild);
    host.appendChild(svg);
    return { svg: svg, destroy: function () { svg.remove(); } };
  }

  var api = root.BetterFx = root.BetterFx || {};
  api.dotSpotlight = dotSpotlight;
  api.dotMatrix = dotMatrix;
  api.dotGlobe = dotGlobe;
  api.dotWave = dotWave;
  api.dotBars = dotBars;
  api.ledGlyph = ledGlyph;
  api.ledPresets = LED;
  if (typeof module !== 'undefined' && module.exports) module.exports = { dotSpotlight: dotSpotlight, dotMatrix: dotMatrix, dotGlobe: dotGlobe, dotWave: dotWave, dotBars: dotBars, ledGlyph: ledGlyph, ledPresets: LED };
})(typeof globalThis !== 'undefined' ? globalThis : window);
