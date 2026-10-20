/*
 * better-design · fx:dither-bake
 * Baked halftone glow: a procedural light shape (ribbon, rise, camo) rasterized once into
 * an SVG grid of square cells. Cell size follows intensity; faint areas are thinned through
 * an 8x8 Bayer matrix so the edge dissolves into scattered dots instead of a hard outline.
 * Three tone layers (hi / body / low) give depth with a single hue.
 *
 * Zero runtime cost: no canvas, no animation loop, crisp at any DPR, safe for dozens of
 * cards on one page. Same seed -> same picture, so a card keeps its art between renders.
 *
 *   const svg = BetterFx.bakeDither({ pattern: 'ribbon', seed: 7,
 *     tones: ['#f1d4cb', '#d97757', '#8a3f26'], avoid: [{ x: 1.86, y: 0.94, r: 0.26 }] });
 *   el.insertAdjacentHTML('beforeend', svg);
 *
 * Coordinates of `field` and `avoid`: x in [0, 2] (left -> right), y in [0, 1] (top -> bottom)
 * for the default 2:1 grid. `avoid` dims the art under content (price badge, title).
 */
(function (root) {
  'use strict';

  var BAYER8 = [
    [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]
  ];

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var gauss = function (d, s) { return Math.exp(-(d * d) / (2 * s * s)); };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  // Each preset returns field(x, y) -> intensity in [0, 1].
  var PRESETS = {
    // A luminous band that sweeps across the lower part, like light on a folded ribbon.
    ribbon: function (rnd) {
      var yc0 = 0.66 + rnd() * 0.12, tilt = (rnd() - 0.5) * 0.25, f = 1.2 + rnd() * 2.4,
          ph = rnd() * 6.28, w0 = 0.09 + rnd() * 0.05, peak = 0.4 + rnd() * 1.2;
      return function (x, y) {
        var yc = yc0 + tilt * (x - 1) + 0.06 * Math.sin(f * x + ph);
        var w = w0 * (1 + 0.35 * Math.sin(1.7 * x + ph));
        return 0.88 * gauss(x - peak, 0.9) * gauss(y - yc, w) + 0.06 * Math.pow(y, 2.6);
      };
    },
    // Glow rising from the bottom edge with a wavy crest; calm, good behind text.
    rise: function (rnd) {
      var base = 0.16 + rnd() * 0.08, a1 = 0.05 + rnd() * 0.05, f1 = 1.2 + rnd(), p1 = rnd() * 6.28;
      return function (x, y) {
        var h = base + a1 * Math.sin(f1 * x + p1) + 0.03 * Math.sin(3.3 * x + 2 * p1);
        return 0.96 * Math.exp(-Math.pow((1 - y) / h, 1.6));
      };
    },
    // Warped blobs with three tone zones; reads as terrain or camouflage.
    camo: function (rnd) {
      var a = 1.3 + 2.7 * rnd(), b = 0.6 + 1.9 * rnd(), c = 2.2 + 1.1 * rnd(), d = 4.1 + 0.8 * rnd();
      return function (x, y) {
        var u = x + 0.32 * Math.sin(2.1 * y + a) + 0.11 * Math.sin(5.3 * y + d);
        var v = y + 0.32 * Math.sin(1.7 * x + b) + 0.11 * Math.sin(4.7 * x + c);
        var g = clamp01(0.5 + 0.28 * Math.sin(2.6 * u + 1.3 * v + 1.9 * Math.sin(2.3 * v + c)) +
                        0.22 * Math.sin(3.7 * v - 1.1 * u + 2.1 * Math.sin(2.9 * u + d)));
        var fade = clamp01((y - 0.18) / 0.82); fade = fade * fade * (3 - 2 * fade);
        return fade * fade * (0.83 + 0.34 * (g - 0.5)) * (0.6 + 0.8 * g);
      };
    }
  };

  function num(v) { // compact numbers: 0.42 -> .42
    var s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return s.indexOf('0.') === 0 ? s.slice(1) : s;
  }

  function bakeDither(options) {
    var o = Object.assign({
      pattern: 'ribbon', seed: 1, cols: 120, rows: 60,
      tones: ['#ffffff', '#9aa3b2', '#4a505c'],   // hi, body, low
      split: [0.6, 0.26],                          // intensity thresholds hi / body
      gain: 1, avoid: [], className: 'fx-dither-bake', field: null
    }, options || {});
    var rnd = mulberry32(o.seed * 2654435761);
    var field = typeof o.field === 'function' ? o.field : (PRESETS[o.pattern] || PRESETS.ribbon)(rnd);
    var paths = ['', '', ''];

    for (var r = 0; r < o.rows; r++) {
      for (var c = 0; c < o.cols; c++) {
        var x = 2 * (c + 0.5) / o.cols, y = (r + 0.5) / o.rows;
        var i = Math.min(0.9, o.gain * field(x, y));
        for (var k = 0; k < o.avoid.length; k++) {
          var a = o.avoid[k];
          i *= 1 - (a.k == null ? 0.85 : a.k) * gauss(x - a.x, a.r) * gauss(y - a.y, a.r);
        }
        if (i < 0.015) continue;
        // Thin the faint edge with ordered dither so it dissolves instead of stopping.
        if (Math.min(1, i / 0.38) <= (BAYER8[r % 8][c % 8] + 0.5) / 64) continue;
        var s = Math.min(0.9, 0.42 + 0.54 * Math.pow(i, 1.15));
        var off = (1 - s) / 2;
        var tone = i > o.split[0] ? 0 : i > o.split[1] ? 1 : 2;
        paths[tone] += 'M' + num(c + off) + ' ' + num(r + off) + 'h' + num(s) + 'v' + num(s) + 'h-' + num(s) + 'z';
      }
    }

    var body = '';
    // Draw low -> hi so bright cells sit on top.
    for (var t = 2; t >= 0; t--) if (paths[t]) body += '<path fill="' + o.tones[t] + '" d="' + paths[t] + '"/>';
    return '<svg class="' + o.className + '" viewBox="0 0 ' + o.cols + ' ' + o.rows +
      '" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
      body + '</svg>';
  }

  var api = root.BetterFx = root.BetterFx || {};
  api.bakeDither = bakeDither;
  api.ditherPresets = PRESETS;
  if (typeof module !== 'undefined' && module.exports) module.exports = { bakeDither: bakeDither, ditherPresets: PRESETS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
