#!/usr/bin/env node
// Better Design bench: renders generated pages in headless Chrome and measures two things a
// skill change should move: convergence (do unrelated briefs come out as one look?) and the
// mechanically detectable slop tells. No dependencies; Node 22+ and Chrome/Edge.
//
//   node scripts/bench_metrics.mjs measure <page.html ...> --label v18 --out v18.json [--shots DIR]
//   node scripts/bench_metrics.mjs compare old.json new.json [--md report.md]
//
// It is a measuring stick, not a judge of beauty: pair it with a blind visual review
// (references/evaluations.md, "A/B against the previous version").
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const mode = args[0];
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const VALUED = new Set(['--label', '--out', '--shots', '--md', '--chrome']);
const files = args.slice(1).filter((a, i, all) => !a.startsWith('--') && !VALUED.has(all[i - 1]));
if (!['measure', 'compare'].includes(mode) || !files.length) {
  console.error('usage: bench_metrics.mjs measure <page.html ...> --label L --out L.json [--shots DIR]\n       bench_metrics.mjs compare A.json B.json [--md report.md]');
  process.exit(2);
}

// ---------- page probe (runs inside the page) ----------
const PROBE = String.raw`(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0.05; };
  const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const hsl = (c) => { const r = c.r / 255, g = c.g / 255, b = c.b / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return { h: Math.round(h), s: +s.toFixed(2), l: +l.toFixed(2) }; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0.5) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const fam = (el) => (getComputedStyle(el).fontFamily.split(',')[0] || '').replace(/["']/g, '').trim();
  const text = (el) => (el.innerText || '').trim();
  const all = [...document.querySelectorAll('body *')].filter(vis);
  const h1 = document.querySelector('h1') || all.find((e) => /^H[1-3]$/.test(e.tagName));
  const bodyP = [...document.querySelectorAll('p, li')].filter(vis).sort((a, b) => text(b).length - text(a).length)[0] || document.body;
  const canvas = bgOf(document.body);
  const heroBg = h1 ? bgOf(h1) : canvas;
  // accent: the most frequent saturated colour among controls, links and fills
  const tally = new Map();
  for (const el of all) {
    const s = getComputedStyle(el);
    for (const c of [el.matches('a, button, [role=button]') ? s.color : null, s.backgroundColor, s.borderTopColor]) {
      const p = parse(c); if (!p || p.a < 0.5) continue; const q = hsl(p); if (q.s < 0.25 || q.l < 0.12 || q.l > 0.92) continue;
      const k = Math.round(q.h / 15) * 15; tally.set(k, (tally.get(k) || 0) + 1);
    }
  }
  const accentHue = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const flags = {};
  const hit = (k, el) => { (flags[k] ||= []).length < 3 && flags[k].push((text(el) || el.tagName).slice(0, 60)); };
  const heads = [...document.querySelectorAll('h1, h2, h3')].filter(vis);
  for (const h of heads) {
    // eyebrow: a short inert line right above a heading, smaller or tracked or capitalised
    let prev = h.previousElementSibling; while (prev && !vis(prev)) prev = prev.previousElementSibling;
    if (prev && !prev.matches('h1,h2,h3,h4,nav,figure,img,svg,picture,button,a,form,label,time,ol,ul,table') && !prev.querySelector('a,button,input,img,svg,time')) {
      const t = text(prev), ps = getComputedStyle(prev), hs = getComputedStyle(h);
      const small = parseFloat(ps.fontSize) < parseFloat(hs.fontSize) * 0.6;
      const styled = ps.textTransform === 'uppercase' || parseFloat(ps.letterSpacing) > 0.5 || small;
      if (t && t.split(/\s+/).length <= 6 && !/[.!?]$/.test(t) && styled) hit('eyebrow', prev);
    }
    // accented word: a child span/em/strong in another colour, weight or style
    const hs = getComputedStyle(h);
    for (const c of h.querySelectorAll('span, em, strong, i, b, mark')) {
      const cs = getComputedStyle(c); if (!text(c) || text(c).length > text(h).length * 0.7 || /^[\d\s.,%+−-]+$/.test(text(c))) continue; // a count badge is not an accented word
      if (cs.color !== hs.color || cs.fontStyle !== hs.fontStyle || Math.abs(+cs.fontWeight - +hs.fontWeight) >= 200 || cs.backgroundImage !== 'none') { hit('accented-word', h); break; }
    }
    if (/^\s*0?\d{1,2}\s*[\/.—–-]/.test(text(h)) || (prev && /^\s*(0\d|\d{1,2}\s*\/\s*\d{1,2})\s*$/.test(text(prev)))) hit('numbered-section-label', h);
  }
  for (const el of all) {
    const s = getComputedStyle(el); const t = el.childElementCount === 0 ? text(el) : '';
    if (!t) continue;
    const fs = parseFloat(s.fontSize);
    if (fs <= 15 && t.length > 2 && /[a-zа-я]/i.test(t) && (s.textTransform === 'uppercase' || s.fontVariantCaps.includes('small-caps') || (/[A-ZА-Я]{4}/.test(t) && t === t.toUpperCase()) || parseFloat(s.letterSpacing) > fs * 0.06) && !el.closest('h1,h2,[class*=logo],[class*=wordmark],[class*=brand]')) hit('tracked-caps-label', el);
    if ((t.match(/\s·\s|\s•\s/g) || []).length >= 2) hit('middle-dot-meta', el);
    if (/^(🚀|✨|⚡|🔥|💡|✅|📦|🎯|💰|🔒|📈|🛠|❤️|⭐)/u.test(t)) hit('emoji-icon', el);
    if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') hit('gradient-text', el);
  }
  for (const el of document.querySelectorAll('a, button')) { if (vis(el) && /(→|->|↗|›)\s*$/.test(text(el))) hit('arrow-glued', el); }
  for (const el of all) {
    const bi = getComputedStyle(el).backgroundImage; if (!bi || bi === 'none') continue;
    const hues = [...bi.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0])).filter((c) => c && c.a > 0.15).map(hsl).filter((q) => q.s > 0.3);
    if (hues.some((q) => q.h >= 250 && q.h <= 300) && hues.some((q) => q.h >= 190 && q.h < 250 || q.h > 300 && q.h <= 340)) hit('ai-gradient', el);
    if (/radial-gradient/.test(bi) && hues.length && el.getBoundingClientRect().width > 300) hit('radial-glow', el);
    if (/repeating-linear-gradient|linear-gradient\([^)]*(90deg|0deg)[^)]*\)\s*,\s*linear-gradient/.test(bi) && el.getBoundingClientRect().width > 600) hit('decorative-grid-bg', el);
  }
  let transitionAll = 0;
  for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) { const t = r.cssText || ''; if (/transition(-property)?:\s*all\b/.test(t)) transitionAll++; } } catch {} }
  if (transitionAll) flags['transition-all'] = [transitionAll + ' rules'];
  const bodyText = text(document.body);
  const dashes = (bodyText.match(/—/g) || []).length;
  if (dashes >= 8) flags['dash-overuse'] = [dashes + ' em dashes'];
  const BANNED = /^(inter|roboto|open sans|lato|poppins|montserrat|nunito|raleway|work sans|dm sans|plus jakarta sans|system-ui|-apple-system|blinkmacsystemfont|segoe ui|arial|helvetica|helvetica neue|sf pro display|sf pro text)$/i;
  const displayFont = h1 ? fam(h1) : '';
  if (h1 && BANNED.test(displayFont)) flags['default-display-font'] = [displayFont];
  // hero fold: headline and a primary action on the first 1280x800 screen
  const firstAction = [...document.querySelectorAll('main a, main button, header a[class], header button, section a[class], section button, form button, a[class*=btn], a[class*=button]')].filter(vis).find((e) => e.getBoundingClientRect().top > (h1 ? h1.getBoundingClientRect().top - 400 : 0));
  const foldOk = !!(h1 && h1.getBoundingClientRect().bottom < 800 && firstAction && firstAction.getBoundingClientRect().bottom < 800);
  if (!foldOk) flags['hero-fold'] = ['headline or action below 800px'];
  // sample notices painted on the first screen (slop:sample-banner)
  const sampleRe = /(sample page|sample data|example data|placeholder|макет|образец|пример данных|для примера)/i;
  for (const el of all) { const r = el.getBoundingClientRect(); if (r.top < 800 && el.childElementCount === 0 && sampleRe.test(text(el)) && text(el).length < 120) { hit('sample-banner', el); } }
  const words800 = (() => { let n = 0; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let x; while ((x = w.nextNode())) { const p = x.parentElement; if (!p || !vis(p)) continue; const r = p.getBoundingClientRect(); if (r.top < 800 && r.bottom > 0) n += (x.textContent.match(/[\p{L}\p{N}]+/gu) || []).length; } return n; })();
  const centered = heads.filter((h) => getComputedStyle(h).textAlign === 'center').length;
  const sections = document.querySelectorAll('main > section, body > section, main > div > section, section[id]').length;
  const fonts = [...new Set(all.slice(0, 600).map(fam))].filter(Boolean);
  const hc = h1 ? getComputedStyle(h1) : null;
  return {
    canvas: { lum: +lum(canvas).toFixed(3), ...hsl(canvas) }, heroBg: { lum: +lum(heroBg).toFixed(3), ...hsl(heroBg) },
    displayFont, bodyFont: fam(bodyP), fonts, h1Size: hc ? parseFloat(hc.fontSize) : null, h1Weight: hc ? +hc.fontWeight : null, h1Italic: hc ? hc.fontStyle === 'italic' : null,
    h1Align: hc ? hc.textAlign : null, accentHue, words800, sections, headings: heads.length, centeredHeadingShare: heads.length ? +(centered / heads.length).toFixed(2) : 0,
    pageHeight: document.documentElement.scrollHeight, flags,
  };
})()`;

// Thumbnail + colour histogram from a PNG, decoded by the browser itself.
const THUMB = (dataUrl) => String.raw`(async () => {
  const img = new Image(); img.src = ${JSON.stringify(dataUrl)}; await img.decode();
  const c = document.createElement('canvas'); c.width = 32; c.height = 20; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 32, 20);
  const d = x.getImageData(0, 0, 32, 20).data; const gray = []; const hist = new Array(27).fill(0); const q = (v) => Math.min(2, Math.floor(v / 86));
  for (let i = 0; i < d.length; i += 4) { gray.push(+((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255).toFixed(3)); hist[q(d[i]) * 9 + q(d[i + 1]) * 3 + q(d[i + 2])]++; }
  return { gray, hist: hist.map((v) => +(v / 640).toFixed(4)) };
})()`;

// ---------- Chrome ----------
function findChrome() {
  const c = [opt('chrome'), process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return c.find((p) => p && existsSync(p));
}

async function measure() {
  const chromePath = findChrome();
  if (!chromePath) { console.error('Chrome/Edge not found; pass --chrome PATH'); process.exit(2); }
  const profile = mkdtempSync(join(tmpdir(), 'bd-bench-'));
  const proc = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--disable-extensions', '--disable-sync', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const exited = new Promise((r) => proc.once('exit', r));
  let tail = ''; proc.stderr.on('data', (d) => { tail = (tail + d).slice(-4000); });
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome did not start')), 45000);
    const poll = setInterval(() => {
      const m = tail.match(/DevTools listening on (ws:\/\/\S+)/);
      let u = m && m[1];
      if (!u) try { const [port, path] = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').trim().split('\n'); if (port && path) u = `ws://127.0.0.1:${port.trim()}${path.trim()}`; } catch {}
      if (u) { clearInterval(poll); clearTimeout(t); res(u); }
    }, 100);
  });
  const ws = new WebSocket(wsUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else listeners.forEach((l) => l(m)); });
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shots = opt('shots'); if (shots) mkdirSync(shots, { recursive: true });
  const label = opt('label', 'run');
  const out = { label, pages: [] };
  for (const f of files) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
    const cmd = (m, p) => send(m, p, S);
    const evaluate = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    await cmd('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    const loaded = new Promise((r) => listeners.push((m) => { if (m.method === 'Page.loadEventFired' && m.sessionId === S) r(); }));
    await cmd('Page.navigate', { url: pathToFileURL(resolve(f)).href });
    await Promise.race([loaded, sleep(15000)]);
    await evaluate('document.fonts ? document.fonts.ready.then(() => 1) : 1'); await sleep(1500);
    const id = `${basename(dirname(resolve(f)))}`;
    let page;
    try { page = await evaluate(PROBE); } catch (e) { page = { error: e.message }; }
    const { data } = await cmd('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 } });
    if (shots) writeFileSync(join(shots, `${label}-${id}-hero.png`), Buffer.from(data, 'base64'));
    const thumb = await evaluate(THUMB('data:image/png;base64,' + data));
    // phone: horizontal overflow and a full-height capture for review
    await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(600);
    const overflowX = await evaluate('Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth');
    if (shots) { const m = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(shots, `${label}-${id}-phone.png`), Buffer.from(m.data, 'base64')); }
    if (page && page.flags && overflowX > 1) page.flags['phone-overflow-x'] = [overflowX + 'px'];
    out.pages.push({ id, file: f, ...page, thumb, overflowX });
    await send('Target.closeTarget', { targetId });
    console.log(`${id}: ${page.error ? 'ERROR ' + page.error : `${page.displayFont} / ${page.bodyFont} · canvas L${page.canvas.l} · accent ${page.accentHue ?? '-'} · flags ${Object.keys(page.flags).join(', ') || 'none'}`}`);
  }
  try { await Promise.race([send('Browser.close'), sleep(1500)]); } catch {}
  await Promise.race([exited, sleep(4000)]); try { proc.kill(); } catch {}
  for (let i = 0; i < 20 && existsSync(profile); i++) { try { rmSync(profile, { recursive: true, force: true }); } catch {} if (existsSync(profile)) await sleep(250); }
  const dest = opt('out', `${label}.json`); writeFileSync(dest, JSON.stringify(out, null, 1)); console.log('wrote ' + dest);
  process.exit(0);
}

// ---------- convergence + summary ----------
const corr = (a, b) => { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n; let x = 0, y = 0, z = 0; for (let i = 0; i < n; i++) { x += (a[i] - ma) * (b[i] - mb); y += (a[i] - ma) ** 2; z += (b[i] - mb) ** 2; } return y && z ? x / Math.sqrt(y * z) : 1; };
const histDist = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / 2; // total variation, 0..1
const band = (l) => (l < 0.3 ? 'dark' : l > 0.85 ? 'light' : 'mid');
function summarize(run) {
  const P = run.pages.filter((p) => !p.error);
  const pairs = []; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) pairs.push([P[i], P[j]]);
  const meanPair = (fn) => pairs.length ? pairs.reduce((s, [a, b]) => s + fn(a, b), 0) / pairs.length : 0;
  const layoutSim = meanPair((a, b) => corr(a.thumb.gray, b.thumb.gray));
  const colourDist = meanPair((a, b) => histDist(a.thumb.hist, b.thumb.hist));
  const distinct = (k) => new Set(P.map(k)).size;
  const house = P.filter((p) => p.canvas.lum < 0.02 && (p.accentHue == null || (p.accentHue >= 195 && p.accentHue <= 225))).length;
  const flagCount = P.reduce((s, p) => s + Object.keys(p.flags || {}).length, 0);
  const tally = {}; for (const p of P) for (const k of Object.keys(p.flags || {})) tally[k] = (tally[k] || 0) + 1;
  return {
    label: run.label, n: P.length,
    layoutSimilarity: +layoutSim.toFixed(3), colourDistance: +colourDist.toFixed(3),
    distinctCanvasBands: distinct((p) => band(p.canvas.l)), distinctDisplayFonts: distinct((p) => p.displayFont.toLowerCase()),
    distinctAccentHues: distinct((p) => p.accentHue == null ? 'none' : Math.round(p.accentHue / 30)), houseLook: house,
    slopFlagsPerPage: +(flagCount / Math.max(1, P.length)).toFixed(2), flagTally: tally,
    meanWordsFirstScreen: Math.round(P.reduce((s, p) => s + p.words800, 0) / Math.max(1, P.length)),
    pages: P.map((p) => ({ id: p.id, display: p.displayFont, body: p.bodyFont, canvas: `${band(p.canvas.l)} h${p.canvas.h} L${p.canvas.l}`, accent: p.accentHue, flags: Object.keys(p.flags || {}) })),
  };
}
function compare() {
  const runs = files.map((f) => summarize(JSON.parse(readFileSync(f, 'utf8'))));
  const rows = [
    ['Pages measured', 'n'], ['Hero layout similarity, mean pairwise (lower = more varied)', 'layoutSimilarity'], ['Hero colour distance, mean pairwise (higher = more varied)', 'colourDistance'],
    ['Distinct canvas bands (dark/mid/light)', 'distinctCanvasBands'], ['Distinct display fonts', 'distinctDisplayFonts'], ['Distinct accent hue families', 'distinctAccentHues'],
    ['Pages in the black + blue house look', 'houseLook'], ['Mechanical slop flags per page', 'slopFlagsPerPage'], ['Words on the first screen, mean', 'meanWordsFirstScreen'],
  ];
  let md = `| Metric | ${runs.map((r) => r.label).join(' | ')} |\n| --- | ${runs.map(() => '---').join(' | ')} |\n`;
  for (const [name, k] of rows) md += `| ${name} | ${runs.map((r) => r[k]).join(' | ')} |\n`;
  const keys = [...new Set(runs.flatMap((r) => Object.keys(r.flagTally)))].sort();
  if (keys.length) { md += `\n| Flag (pages hit) | ${runs.map((r) => r.label).join(' | ')} |\n| --- | ${runs.map(() => '---').join(' | ')} |\n`; for (const k of keys) md += `| ${k} | ${runs.map((r) => r.flagTally[k] || 0).join(' | ')} |\n`; }
  for (const r of runs) { md += `\n**${r.label}**\n\n| Page | Display / body | Canvas | Accent hue | Flags |\n| --- | --- | --- | --- | --- |\n`; for (const p of r.pages) md += `| ${p.id} | ${p.display} / ${p.body} | ${p.canvas} | ${p.accent ?? '-'} | ${p.flags.join(', ') || '-'} |\n`; }
  console.log(md);
  if (opt('md')) writeFileSync(opt('md'), md);
}

if (mode === 'measure') await measure(); else compare();
