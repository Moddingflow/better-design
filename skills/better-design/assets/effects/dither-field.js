/*
 * better-design · fx:dither-field
 * Live ordered-dither field (WebGL, no dependencies): a slowly moving procedural
 * pattern quantized through a Bayer matrix onto a coarse pixel grid. One ink color
 * over a transparent or solid back color, like a halftone print of liquid metal.
 *
 * Usage (classic script or bundler):
 *   const fx = BetterFx.mountDitherField(hostEl, { shape: 'warp', bayer: 4, pxSize: 2 });
 *   fx.destroy();
 *
 * The host keeps its own children as the CSS fallback (for example a radial-gradient
 * div). When the first WebGL frame is drawn the host gets `data-fx-live`, and
 * effects.css crossfades fallback -> canvas. Without WebGL nothing changes.
 *
 * Behaviour that must not be removed when adapting:
 *   - mounts after idle, renders only while on screen and the tab is visible;
 *   - prefers-reduced-motion: one static frame, no loop;
 *   - devicePixelRatio capped (maxDpr) so a 4K screen does not render 4x the pixels;
 *   - handles context loss and resizes through ResizeObserver.
 */
(function (root) {
  'use strict';

  var SHAPES = { warp: 0, simplex: 1, wave: 2, ripple: 3, swirl: 4 };

  var VERT =
    'attribute vec2 a_pos;\n' +
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }\n';

  // GLSL ES 1.00 so the same source runs on WebGL1 and WebGL2 contexts.
  var FRAG = [
    'precision highp float;',
    'uniform vec2  u_res;',      // canvas size in device px
    'uniform float u_time;',
    'uniform float u_px;',       // dither cell size in device px
    'uniform float u_scale;',
    'uniform float u_shape;',
    'uniform float u_bayer;',    // 2, 4 or 8
    'uniform float u_gain;',     // contrast of the pattern before quantizing
    'uniform vec4  u_front;',    // premultiplied rgba
    'uniform vec4  u_back;',
    'uniform float u_debug;',

    // Recursive Bayer thresholds, in [0,1).
    'float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }',
    'float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }',
    'float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }',

    'vec3 permute(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }',
    // 2D simplex noise (Ashima / Ian McEwan, MIT).
    'float snoise(vec2 v){',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
    '  vec2 i = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;',
    '  i = mod(i, 289.0);',
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);',
    '  m = m * m; m = m * m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);',
    '  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',
    'float fbm(vec2 p){',
    '  float s = 0.0, a = 0.5;',
    '  for (int i = 0; i < 3; i++){ s += a * snoise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }',
    '  return s;',
    '}',

    // Pattern value in [0,1] for a point in aspect-corrected space.
    'float pattern(vec2 p, float t){',
    '  if (u_shape < 0.5) {',                      // warp: creased satin / liquid metal
    // Iterative sine warp: each pass bends the plane by a smaller, faster wave. Smooth at
    // every scale, so the dither shows large folds instead of speckle.
    '    vec2 w = p * 1.6;',
    '    for (int i = 1; i < 6; i++) {',
    '      float fi = float(i);',
    '      w.x += 0.6 / fi * cos(fi * 2.5 * w.y + t);',
    '      w.y += 0.6 / fi * cos(fi * 1.5 * w.x + t * 0.8);',
    '    }',
    // Bright crests where the folded plane turns toward the light, dark valleys between.
    '    float crest = 0.22 / max(0.02, abs(sin(t * 0.5 - w.y - w.x)));',
    '    return clamp(pow(crest, 1.35) - 0.04, 0.0, 1.0);',
    '  } else if (u_shape < 1.5) {',               // simplex: soft clouds
    '    return 0.5 + 0.5 * fbm(p * 0.9 + vec2(t * 0.08, -t * 0.05));',
    '  } else if (u_shape < 2.5) {',               // wave: banded ribbons
    '    float y = p.y + 0.35 * sin(p.x * 1.3 + t * 0.4) + 0.15 * snoise(p * 0.7 + t * 0.1);',
    '    return 0.5 + 0.5 * sin(y * 3.4);',
    '  } else if (u_shape < 3.5) {',               // ripple: rings from the center
    '    float d = length(p);',
    '    return (0.5 + 0.5 * sin(d * 7.0 - t * 1.4)) * smoothstep(3.2, 0.2, d);',
    '  }',
    '  float a = atan(p.y, p.x), d = length(p);',  // swirl
    '  return 0.5 + 0.5 * sin(a * 3.0 + d * 4.0 - t * 0.9 + 0.6 * snoise(p + t * 0.1));',
    '}',

    'void main(){',
    '  vec2 cell = floor(gl_FragCoord.xy / u_px);',
    '  vec2 uv = (cell + 0.5) * u_px / u_res;',                 // sample at cell center
    // Height-normalized space: y spans about 1.5 / u_scale noise units, so shapes keep
    // their size on wide bands and tall panels alike.
    '  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * (1.5 / u_scale);',
    '  float v = pattern(p, u_time);',
    '  v = clamp((v - 0.5) * u_gain + 0.5, 0.0, 1.0);',
    '  float th = u_bayer < 3.0 ? bayer2(cell) : (u_bayer < 6.0 ? bayer4(cell) : bayer8(cell));',
    '  if (u_debug > 0.5) { gl_FragColor = vec4(vec3(v), 1.0); return; }',  // raw field, for tuning
    '  gl_FragColor = v > th ? u_front : u_back;',
    '}'
  ].join('\n');

  function parseColor(str) {
    // Accepts #rgb, #rgba, #rrggbb, #rrggbbaa, 'transparent'. Returns premultiplied rgba.
    if (!str || str === 'transparent') return [0, 0, 0, 0];
    var h = String(str).trim().replace('#', '');
    if (h.length === 3 || h.length === 4) h = h.replace(/./g, function (c) { return c + c; });
    var n = function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; };
    var a = h.length >= 8 ? n(6) : 1;
    return [n(0) * a, n(2) * a, n(4) * a, a];
  }

  function onIdle(fn) {
    if (typeof root.requestIdleCallback === 'function') return root.requestIdleCallback(fn, { timeout: 1200 });
    return setTimeout(fn, 60);
  }

  function mountDitherField(host, options) {
    var o = Object.assign({
      shape: 'warp',       // warp | simplex | wave | ripple | swirl
      bayer: 4,            // 2 | 4 | 8; 4 reads as print, 8 is finer and smoother
      pxSize: 2,           // dither cell in CSS px; 2-3 for backgrounds, 4+ for chunky retro
      scale: 0.6,          // pattern zoom; smaller = larger shapes
      speed: 0.18,         // time units per second; 0 = still
      gain: 1,             // pattern contrast before quantizing; >1 harder edges
      colorFront: '#ffffff',
      colorBack: 'transparent',
      maxDpr: 2,
      debug: false,        // true renders the raw pattern in grayscale for tuning
      seed: Math.random() * 100
    }, options || {});

    var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)');
    var state = { gl: null, prog: null, raf: 0, visible: true, onScreen: false, t0: 0, elapsed: o.seed, last: 0, destroyed: false };
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'fx-dither-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';

    function compile(gl, type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('dither-field shader: ' + log);
      }
      return s;
    }

    function init() {
      var attrs = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' };
      var gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs);
      if (!gl) return false;
      var prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('dither-field link: ' + gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var u = {};
      ['u_res', 'u_time', 'u_px', 'u_scale', 'u_shape', 'u_bayer', 'u_gain', 'u_front', 'u_back', 'u_debug'].forEach(function (n) {
        u[n] = gl.getUniformLocation(prog, n);
      });
      state.gl = gl; state.prog = prog; state.u = u;
      return true;
    }

    function resize() {
      if (!state.gl) return;
      var dpr = Math.min(root.devicePixelRatio || 1, o.maxDpr);
      var w = Math.max(1, Math.round(host.clientWidth * dpr));
      var h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      state.dpr = dpr;
      draw();
    }

    function draw() {
      var gl = state.gl, u = state.u;
      if (!gl || gl.isContextLost()) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.u_res, canvas.width, canvas.height);
      gl.uniform1f(u.u_time, state.elapsed);
      gl.uniform1f(u.u_px, Math.max(1, Math.round(o.pxSize * state.dpr)));
      gl.uniform1f(u.u_scale, o.scale);
      gl.uniform1f(u.u_shape, SHAPES[o.shape] != null ? SHAPES[o.shape] : 0);
      gl.uniform1f(u.u_bayer, o.bayer);
      gl.uniform1f(u.u_gain, o.gain);
      gl.uniform4fv(u.u_front, parseColor(o.colorFront));
      gl.uniform4fv(u.u_back, parseColor(o.colorBack));
      gl.uniform1f(u.u_debug, o.debug ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!host.hasAttribute('data-fx-live')) host.setAttribute('data-fx-live', '');
    }

    function animating() {
      return state.visible && state.onScreen && o.speed > 0 && !(reduce && reduce.matches);
    }

    function loop(now) {
      state.raf = 0;
      if (!animating()) return;
      // Cap at ~30 fps: the field is slow ambient texture, not interaction feedback.
      if (now - state.last >= 32) {
        state.elapsed += Math.min(0.1, (now - (state.last || now)) / 1000) * o.speed;
        state.last = now;
        draw();
      }
      state.raf = requestAnimationFrame(loop);
    }

    function kick() {
      if (state.destroyed) return;
      if (animating() && !state.raf) { state.last = 0; state.raf = requestAnimationFrame(loop); }
    }

    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    var io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(function (es) { state.onScreen = es[es.length - 1].isIntersecting; kick(); }, { rootMargin: '200px' })
      : null;
    function onVis() { state.visible = document.visibilityState !== 'hidden'; kick(); }
    function onReduce() { draw(); kick(); }
    function onLost(e) { e.preventDefault(); cancelAnimationFrame(state.raf); state.raf = 0; host.removeAttribute('data-fx-live'); }
    function onRestored() { if (init()) { resize(); kick(); } }

    var idleId = onIdle(function () {
      if (state.destroyed) return;
      try { if (!init()) return; } catch (err) { if (root.console) console.warn(err); return; }
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(canvas);
      canvas.addEventListener('webglcontextlost', onLost);
      canvas.addEventListener('webglcontextrestored', onRestored);
      document.addEventListener('visibilitychange', onVis);
      if (reduce && reduce.addEventListener) reduce.addEventListener('change', onReduce);
      if (ro) ro.observe(host); else root.addEventListener('resize', resize);
      if (io) io.observe(host); else state.onScreen = true;
      resize();
      kick();
    });

    return {
      canvas: canvas,
      setOptions: function (next) { Object.assign(o, next || {}); draw(); kick(); },
      destroy: function () {
        state.destroyed = true;
        if (typeof root.cancelIdleCallback === 'function') root.cancelIdleCallback(idleId); else clearTimeout(idleId);
        cancelAnimationFrame(state.raf);
        if (ro) ro.disconnect(); else root.removeEventListener('resize', resize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        if (reduce && reduce.removeEventListener) reduce.removeEventListener('change', onReduce);
        var ext = state.gl && state.gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        canvas.remove();
        host.removeAttribute('data-fx-live');
      }
    };
  }

  var api = root.BetterFx = root.BetterFx || {};
  api.mountDitherField = mountDitherField;
  if (typeof module !== 'undefined' && module.exports) module.exports = { mountDitherField: mountDitherField };
})(typeof globalThis !== 'undefined' ? globalThis : window);
