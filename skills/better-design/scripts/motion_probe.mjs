#!/usr/bin/env node
/*
 * better-design · motion probe
 * Drives headless Chrome over the DevTools protocol (no dependencies, Node ≥ 22) and checks
 * that every interactive element on a page actually answers input:
 *   hover   pointer over the element changes its look (pointer-fine devices)
 *   press   a visible change within ~60 ms of pointer-down (scale, fill, bloom, …)
 *   release after the press it returns to rest (no stuck state)
 *   focus   keyboard focus produces a visible ring or style
 *   timing  state changes transition (not instant) and never use `transition: all`
 * The press is released OUTSIDE the element, so no click fires and nothing is activated.
 *
 * Usage:
 *   node scripts/motion_probe.mjs <url-or-file> [--width 1280] [--height 800]
 *        [--max 60] [--reduced-motion] [--selector "css"] [--json] [--chrome PATH]
 *        [--no-sandbox]   (implied when CI is set; only for trusted local pages)
 * Exit code 1 when any error is found. Errors: no press feedback on a control, no visible
 * focus, stuck after release. Warnings: no hover, instant changes, `transition: all`.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes('--' + name);
const VALUED = new Set(['--width', '--height', '--max', '--selector', '--chrome']);
const target = args.find((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
if (!target) { console.error('usage: node scripts/motion_probe.mjs <url-or-file> [--width W] [--height H] [--max N] [--reduced-motion] [--selector CSS] [--json]'); process.exit(2); }
const url = /^[a-z]+:\/\//i.test(target) ? target : pathToFileURL(resolve(target)).href;
const W = +opt('width', 1280), H = +opt('height', 800), MAX = +opt('max', 60);
const SELECTOR = opt('selector', 'button, a[href], [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="menuitem"], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])');

function findChrome() {
  const c = [opt('chrome'), process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'];
  return c.find((p) => p && existsSync(p));
}

const chromePath = findChrome();
if (!chromePath) { console.error('Chrome/Chromium/Edge not found; pass --chrome PATH or set CHROME_PATH'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'bd-motion-'));
// CI runners (e.g. Ubuntu 24.04 on GitHub Actions) often cannot start Chrome's sandbox.
const sandboxArgs = flag('no-sandbox') || process.env.CI ? ['--no-sandbox'] : [];
const proc = spawn(chromePath, [...sandboxArgs, '--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--disable-component-update', '--disable-background-networking', '--disable-sync', '--disable-extensions', '--disable-breakpad', '--metrics-recording-only', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
// Wait for Chrome to exit before removing its profile (Windows keeps files locked until then).
const chromeExited = new Promise((r) => proc.once('exit', r));
const removeProfile = () => { try { rmSync(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 }); } catch {} };
async function finish(code) {
  // Graceful close lets Chrome stop its helper processes before the profile is removed.
  try { await Promise.race([send('Browser.close'), new Promise((r) => setTimeout(r, 1500))]); } catch {}
  await Promise.race([chromeExited, new Promise((r) => setTimeout(r, 4000))]);
  try { proc.kill(); } catch {}
  for (let i = 0; i < 20 && existsSync(profile); i++) { removeProfile(); if (existsSync(profile)) await new Promise((r) => setTimeout(r, 250)); }
  process.exit(code);
}
process.on('SIGINT', () => finish(130));

const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  const t = setTimeout(() => rej(new Error('Chrome did not start')), 15000);
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map(); const listeners = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
  else listeners.forEach((l) => l(msg));
});
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
const cmd = (m, p) => send(m, p, S);
await cmd('Page.enable'); await cmd('Runtime.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
if (flag('reduced-motion')) await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
const loaded = new Promise((r) => listeners.push((m) => { if (m.method === 'Page.loadEventFired' && m.sessionId === S) r(); }));
await cmd('Page.navigate', { url });
await Promise.race([loaded, sleep(15000)]);
await sleep(800);

const evaluate = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };

// In-page helpers: list elements and snapshot the properties that carry feedback.
await evaluate(`(() => {
  const PROPS = ['transform','scale','translate','background-color','background-image','background-size','color','box-shadow','filter','opacity','outline-style','outline-color','outline-width','outline-offset','text-decoration-line','text-decoration-color','border-top-color','border-left-color','border-top-width'];
  window.__bdSnap = (id) => {
    const el = document.querySelector('[data-bd-probe="' + id + '"]'); if (!el) return null;
    const out = {}; const pick = (cs, pre) => PROPS.concat(pre ? ['width', 'height', 'left', 'top', 'right'] : []).forEach((p) => out[pre + p] = cs.getPropertyValue(p));
    pick(getComputedStyle(el), ''); pick(getComputedStyle(el, '::before'), 'before:'); pick(getComputedStyle(el, '::after'), 'after:');
    // children often carry the response (thumbs, icons, labels)
    [...el.children].slice(0, 4).forEach((c, i) => { const cs = getComputedStyle(c); ['transform','opacity','color','background-color'].forEach((p) => out['child' + i + ':' + p] = cs.getPropertyValue(p)); });
    const t = getComputedStyle(el); out.__transitionProperty = t.transitionProperty; out.__transitionDuration = t.transitionDuration;
    return out;
  };
  window.__bdList = (sel, max) => {
    const els = [...document.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[inert],[aria-hidden="true"]') && !el.disabled; });
    return els.slice(0, max).map((el, i) => {
      el.setAttribute('data-bd-probe', i);
      const kind = /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !/^(checkbox|radio|button|submit|reset)$/.test(el.type) ? 'field'
        : (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && !el.className.match(/btn|button|ui-press/)) ? 'inline-link' : 'control';
      const label = (el.getAttribute('aria-label') || el.textContent || el.value || el.placeholder || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 40);
      const current = el.getAttribute('aria-selected') === 'true' || el.hasAttribute('aria-current');
      return { id: i, tag: el.tagName.toLowerCase(), kind, label, current };
    });
  };
  window.__bdCenter = (id) => { const el = document.querySelector('[data-bd-probe="' + id + '"]'); el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
})()`);

const els = await evaluate(`window.__bdList(${JSON.stringify(SELECTOR)}, ${MAX})`);
const diff = (a, b) => Object.keys(a).filter((k) => !k.startsWith('__') && a[k] !== b[k]);
const mouse = (type, x, y, extra = {}) => cmd('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1, pointerType: 'mouse', ...extra });

const results = [];
for (const el of els) {
  const r = { ...el, hover: null, press: null, release: null, focus: null, warnings: [] };
  try {
    await mouse('mouseMoved', 1, 1); await evaluate('document.activeElement && document.activeElement.blur && document.activeElement.blur()');
    const c = await evaluate(`window.__bdCenter(${el.id})`);
    await sleep(350);
    const base = await evaluate(`window.__bdSnap(${el.id})`);
    if (/(^|,\s*)all(\s|,|$)/.test(base.__transitionProperty) && base.__transitionDuration.split(',').some((d) => parseFloat(d) > 0)) r.warnings.push('transition: all');
    if (base.__transitionDuration.split(',').every((d) => parseFloat(d) === 0)) r.warnings.push('no transitions (state changes cut)');

    await mouse('mouseMoved', c.x, c.y); await sleep(320);
    const hov = await evaluate(`window.__bdSnap(${el.id})`);
    r.hover = diff(base, hov);

    await mouse('mousePressed', c.x, c.y); await sleep(60);
    const pr = await evaluate(`window.__bdSnap(${el.id})`);
    r.press = diff(hov, pr);
    // Quality of the press: a lone 1–2 px nudge or a barely visible scale reads as dead.
    const geo = (t) => { const m = (t || '').match(/matrix\(([^)]+)\)/); if (!m) return { s: 1, d: 0 }; const v = m[1].split(',').map(Number); return { s: Math.hypot(v[0], v[1]), d: Math.hypot(v[4], v[5]) }; };
    const g0 = geo(hov.transform), g1 = geo(pr.transform);
    const nonTransform = r.press.filter((k) => !/^(transform|scale|translate)$/.test(k));
    const moved = Math.abs(g1.s - g0.s) > 0.001 || Math.abs(g1.d - g0.d) > 0.1 || r.press.includes('scale') || r.press.includes('translate');
    if (flag('reduced-motion') && moved && !(r.current)) r.warnings.push('moves under reduced motion; keep only color/opacity/shadow feedback');
    if (r.kind === 'control' && moved && !nonTransform.length && Math.abs(1 - g1.s / (g0.s || 1)) < 0.02 && Math.abs(g1.d - g0.d) <= 1.5)
      r.warnings.push('weak press: only a 1–2 px move or a tiny scale; add a fill step or bloom and a spring release (interaction kit)');
    // Release outside the element: no click is dispatched.
    await mouse('mouseMoved', 1, 1); await mouse('mouseReleased', 1, 1); await sleep(40);
    const early = await evaluate(`window.__bdSnap(${el.id})`);
    if (r.kind === 'control' && moved && !flag('reduced-motion') && early.transform === base.transform) r.warnings.push('release snaps back instantly; let it spring back (≈400–600 ms). If a spring is declared, a second transition shorthand on the element is overriding it');
    await sleep(860);
    const rel = await evaluate(`window.__bdSnap(${el.id})`);
    r.release = diff(base, rel).filter((k) => !/outline|focus/.test(k));

    await cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
    await cmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
    await evaluate(`(() => { const e = document.querySelector('[data-bd-probe="${el.id}"]'); e.blur(); })()`); await sleep(250);
    const unf = await evaluate(`window.__bdSnap(${el.id})`);
    await evaluate(`document.querySelector('[data-bd-probe="${el.id}"]').focus({ focusVisible: true })`); await sleep(300);
    const foc = await evaluate(`window.__bdSnap(${el.id})`);
    r.focus = diff(unf, foc);
    await evaluate(`document.querySelector('[data-bd-probe="${el.id}"]').blur()`);
  } catch (e) { r.error = String(e.message || e); }
  results.push(r);
}

const errors = [], warns = [];
for (const r of results) {
  const name = `${r.tag} "${r.label}"`;
  if (r.error) { warns.push(`${name}: probe failed (${r.error})`); continue; }
  if (r.kind === 'control' && !r.press.length) errors.push(`${name}: no press feedback within 60 ms`);
  if (r.kind === 'inline-link' && !r.press.length && !r.hover.length) warns.push(`${name}: link has neither hover nor press response`);
  if (r.release.length && r.kind !== 'field') errors.push(`${name}: did not return to rest after release (${r.release.slice(0, 3).join(', ')})`);
  if (!r.focus.length) errors.push(`${name}: no visible focus style`);
  if (r.kind !== 'field' && !r.current && !r.hover.length && !flag('reduced-motion')) warns.push(`${name}: no hover response`);
  r.warnings.forEach((w) => warns.push(`${name}: ${w}`));
}

const report = { url, viewport: `${W}x${H}`, reducedMotion: flag('reduced-motion'), elements: results.length, errors, warnings: warns,
  results: results.map((r) => ({ tag: r.tag, kind: r.kind, label: r.label, hover: r.hover?.slice(0, 4), press: r.press?.slice(0, 4), focus: r.focus?.slice(0, 3), release: r.release, warnings: r.warnings, error: r.error })) };
if (flag('json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`motion probe: ${url} @ ${W}x${H}${report.reducedMotion ? ' (reduced motion)' : ''}`);
  console.log(`elements: ${results.length}  errors: ${errors.length}  warnings: ${warns.length}`);
  for (const r of results) console.log(`  ${r.press?.length ? 'P' : '-'}${r.hover?.length ? 'H' : '-'}${r.focus?.length ? 'F' : '-'}${r.release?.length ? '!' : ' '} ${r.kind.padEnd(11)} ${r.tag} "${r.label}"`);
  if (errors.length) { console.log('\nERRORS'); errors.forEach((e) => console.log('  ' + e)); }
  if (warns.length) { console.log('\nWARNINGS'); warns.forEach((w) => console.log('  ' + w)); }
  console.log('\nlegend: P press · H hover · F focus · ! stuck after release');
}
await finish(errors.length ? 1 : 0);
