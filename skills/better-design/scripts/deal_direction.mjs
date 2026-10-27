#!/usr/bin/env node
// Deals a starting direction for a surface the user gave no visual direction for, so that
// consecutive builds do not converge on one look. See references/direction-deal.md.
//
//   node scripts/deal_direction.mjs deal --keywords "bakery, local, bread" [--surface page|app]
//        [--material photo|product|words|data] [--job book] [--seed hex] [--log PATH] [--json]
//   node scripts/deal_direction.mjs log --entry '{"material":"azulejo","axes":"light/roman-serif/cool","face":"Alegreya","hue":"cobalt 250","shape":"..."}'
//   node scripts/deal_direction.mjs list
//
// The log (default ~/.better-design/log.json, the 20 latest builds across projects) is what
// rotation reads; --log overrides it, --no-log ignores it. Dealing and drawing structure from
// a log is adapted from Hallmark's theme.mjs (MIT); the "build a lower-ranked candidate" roll
// from Impeccable's concept seed (Apache-2.0). Vocabulary and code here are our own.
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d; };
const has = (k) => args.includes('--' + k);
const LOG = resolve(opt('log', join(homedir(), '.better-design', 'log.json')));

function rng(seed) {
  let h = createHash('sha256').update(seed).digest(); let i = 0;
  return () => { if (i > h.length - 4) { h = createHash('sha256').update(h).digest(); i = 0; } const v = h.readUInt32BE(i); i += 4; return v / 0x100000000; };
}
function readLog() { if (has('no-log')) return []; try { const j = JSON.parse(readFileSync(LOG, 'utf8')); return Array.isArray(j) ? j : []; } catch { return []; } }
function materials() {
  const md = readFileSync(join(HERE, '..', 'references', 'materials.md'), 'utf8');
  return md.split('\n').filter((l) => /^\| `[a-z-]+` \|/.test(l)).map((l) => {
    const c = l.split('|').slice(1, -1).map((s) => s.trim());
    return { slug: c[0].replace(/`/g, ''), family: c[1], ground: c[2], display: c[3], accent: c[4], posture: c[5], material: c[6], faces: c[7], keywords: c[8].split(',').map((k) => k.trim().toLowerCase()).filter(Boolean) };
  });
}
const axes = (m) => `${m.ground}/${m.display}/${m.accent}`;
const stem = (w) => w.toLowerCase().replace(/(ies)$/, 'y').replace(/(ing|ers|er|es|s)$/, '');

// Structural vocabulary: the decisions a model converges on when left alone.
const DRAW = {
  shapes: {
    photo: ['photo-led folds', 'marquee first screen', 'diptych rows', 'catalogue', 'timeline of a day or season', 'mosaic', 'interview (questions as heads)', 'letter', 'sticky story'],
    product: ['workbench tour of the product', 'sticky story', 'mosaic', 'timeline of a job done', 'marquee first screen', 'diptych rows', 'interview (questions as heads)', 'map / diagram', 'number-led (a real figure the user gave)'],
    words: ['long document', 'manifesto', 'letter', 'index-first', 'interview (questions as heads)', 'marquee first screen', 'timeline'],
    data: ['workbench tour of the product', 'map / diagram', 'index-first', 'diptych rows', 'long document'],
  },
  heroes: ['settled (text and visual share the screen)', 'stage (a big visual on 7 of 12 columns)', 'banner (half height, the first section shows)', 'ledge (a tall field, the head resting at its base)', 'corridor (one narrow centred column, large head)', 'poster (full-bleed picture or canvas)', 'counter (the action itself is the visual: the booking, the field, the buy box)', 'index (the list is the visual: the menu, the lineup, the issues)'],
  navs: ['edge-aligned bar', 'floating capsule', 'masthead (name large, links under it)', 'slab (a solid band in the signal colour)', 'action-led (the job\'s verb is the only button)', 'banner over a bar that retracts on scroll'],
  footers: ['mast (the name set large over the links)', 'statement (one closing line and the action)', 'colophon (facts, credits, address in columns)', 'letter close (a signed sign-off)', 'index columns', 'the job\'s action again, beside hours or facts'],
  openers: ['split', 'showcase', 'mosaic', 'rows', 'table', 'statement', 'rail (horizontal scroller)', 'pinned run', 'switcher (tabs)', 'index', 'schedule', 'offer'],
  leaveOut: ['text-beside-picture split', 'three-across card grid', 'full-width call-to-action band', 'numbered three steps', 'row of big figures', 'testimonial carousel'],
  leads: { photo: ['the place', 'the thing itself, close', 'the making', 'the offer and its price', 'the season or the date', 'people at work'], product: ['the job it does', 'the screen at work', 'its limit or speed (if given)', 'the material it handles', 'the price', 'before and after'], words: ['the claim', 'the question', 'the first line of the argument', 'the date and the place', 'the list itself'], data: ['the live state', 'the exception that needs action', 'the queue', 'the map'] },
  appShells: ['sidebar + workspace', 'top bar + full canvas', 'master-detail split', 'command board (queues as columns)', 'triage inbox with a detail pane', 'map with a docked panel', 'timeline with a selection inspector'],
  appLeads: ['the exception that needs a decision now', 'the live queue', 'the map of what is moving', 'the single number that changes the next action, with its context', 'the timeline of today'],
  jobs: {
    subscribe: { action: ['the field in the first screen beside the latest issue', 'the field first and again under the archive'], native: ['a sample issue set as it arrives', 'the archive as an index (sample titles)', 'who writes it', 'one issue\'s contents as rows'] },
    book: { action: ['booking times as buttons in the first screen', 'a sticky booking bar', 'booking beside the menu or classes'], native: ['the menu or classes as a switcher or rows (sample items)', 'the room as one large photograph', 'hours and address as their own section', 'the next free times'] },
    visit: { action: ['today\'s hours and address in the first screen', 'a sticky bar with today\'s hours'], native: ['what is on now', 'what is coming as dated rows', 'the shelves or rooms as a rail', 'getting there'] },
    attend: { action: ['tickets in the nav and first screen', 'tickets beside the lineup', 'a sticky ticket bar'], native: ['the days as a schedule', 'the lineup as an index set large', 'ticket tiers as rows', 'the venue and how to get there', 'questions'] },
    buy: { action: ['the offer as the first screen', 'a sticky buy bar', 'the offer after a close-up'], native: ['the range as a rail (sample names)', 'the thing in use, close and large', 'how it is made', 'delivery and care as plain facts'] },
    try: { action: ['store buttons under the head beside the main screen', 'download first and beside the last screen'], native: ['named moments shown in screens (pinned or switcher)', 'a before and after', 'platforms and requirements'] },
    'sign up': { action: ['start free in the nav and first screen, terms in one line', 'the install command as the action'], native: ['the product at work as a pinned run', 'a code sample or integration', 'pricing as a table', 'questions as rows'] },
    hire: { action: ['a plain email/phone in the nav and after the work'], native: ['the work as an index of projects with pictures', 'one project opened as a case', 'what the studio does, briefly', 'where it is'] },
    join: { action: ['join or "your first visit" in the first screen', 'join beside the schedule'], native: ['what a session is like, shown', 'when and where as a schedule', 'membership options as rows', 'first-visit guidance'] },
    listen: { action: ['the player or record in the first screen', 'listen first and the dates beside it'], native: ['the record and its tracks as an index', 'dates as rows with ticket links', 'earlier work as covers in a rail', 'a live photograph or video'] },
  },
};

function deal() {
  const seed = opt('seed', randomBytes(4).toString('hex'));
  const r = rng(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const take = (a, n) => { const p = [...a]; const out = []; while (out.length < n && p.length) out.push(p.splice(Math.floor(r() * p.length), 1)[0]); return out; };
  const surface = opt('surface', 'page');
  const material = opt('material', surface === 'app' ? 'data' : 'photo');
  const kw = new Set(String(opt('keywords', opt('prompt', ''))).toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 2).map(stem));
  const log = readLog();
  const recent = log.slice(0, 3);
  const recentSlugs = new Set(recent.map((e) => e.material));
  const recentAxes = new Set(recent.map((e) => e.axes).filter(Boolean));
  let pool = materials();
  if (surface === 'app') pool = pool.filter((m) => !['pixel', 'hand'].includes(m.display) && ['restrained', 'committed'].includes(m.posture));
  const scored = pool.filter((m) => !recentSlugs.has(m.slug)).map((m) => {
    const hits = m.keywords.filter((k) => k.split(/\s+/).map(stem).every((w) => kw.has(w)));
    let fit = Math.min(hits.length, 2) * 1.5 + r() * 3; // jitter: a fitting row is likely, never certain
    if (recentAxes.has(axes(m))) fit -= 3;
    if (m.slug === 'house') fit -= 1; // the house look is opt-in by request; it may still be dealt
    return { m, hits, fit };
  }).sort((a, b) => b.fit - a.fit);
  const hand = [];
  for (const s of scored) {
    if (hand.length === 3) break;
    if (hand.some((h) => h.m.family === s.m.family || axes(h.m) === axes(s.m))) continue;
    if (hand.length === 2 && new Set(hand.map((h) => h.m.ground)).size === 1 && s.m.ground === hand[0].m.ground && scored.some((x) => x.m.ground !== hand[0].m.ground && !hand.includes(x))) continue;
    hand.push(s);
  }
  const notFrom = (list, key, n) => { const bad = log.slice(0, n).map((e) => String(e[key] || '').toLowerCase()); const ok = list.filter((o) => !bad.some((b) => b && b.includes(o.split(' (')[0].toLowerCase()))); return ok.length ? ok : list; };
  const job = DRAW.jobs[String(opt('job', '')).toLowerCase()] || null;
  // build the model's own 3rd..7th ranked direction, never its top two; a working tool, where execution outranks novelty, builds #2 or #3
  const buildRank = surface === 'app' ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 5);
  const out = {
    seed, surface, material, log: has('no-log') ? null : LOG, recent: recent.map((e) => `${e.material || '?'} (${e.axes || '?'})`),
    deal: hand.map((h, i) => ({ n: i + 1, slug: h.m.slug, family: h.m.family, axes: axes(h.m), posture: h.m.posture, material: h.m.material, faces: h.m.faces, fit: h.hits })),
    buildRank,
    avoidFaces: [...new Set(log.slice(0, 5).map((e) => e.face).filter(Boolean))],
    avoidHues: [...new Set(log.slice(0, 3).map((e) => e.hue).filter(Boolean))],
  };
  if (surface === 'app') Object.assign(out, { shell: pick(notFrom(DRAW.appShells, 'shape', 2)), lead: pick(DRAW.appLeads) });
  else Object.assign(out, {
    shape: pick(notFrom(DRAW.shapes[material] || DRAW.shapes.photo, 'shape', 3)), hero: pick(notFrom(DRAW.heroes, 'hero', 2)), nav: pick(notFrom(DRAW.navs, 'nav', 3)),
    footer: pick(notFrom(DRAW.footers, 'footer', 3)), opener: pick(DRAW.openers), leaveOut: take(DRAW.leaveOut, 2), lead: pick(DRAW.leads[material] || DRAW.leads.photo),
    ...(job ? { action: pick(job.action), native: take(job.native, 3) } : {}),
  });
  if (has('json')) { console.log(JSON.stringify(out, null, 1)); return; }
  console.log(`deal ${seed} · ${surface}${out.recent.length ? ` · clear of recent: ${out.recent.join(', ')}` : ' · log empty'}`);
  for (const d of out.deal) console.log(`${d.n}. ${d.slug} [${d.family}] ${d.axes} · ${d.posture}\n   ${d.material}\n   faces, a sample of the class: ${d.faces}${d.fit.length ? `\n   fits: ${d.fit.join(', ')}` : ''}`);
  console.log(`\nroll: rank seven directions of your own (three of them may start from the materials above); build #${buildRank}, never #1${surface === 'app' ? '' : ' or #2'}. Show #1 in one line as the road not taken.`);
  if (out.avoidFaces.length) console.log(`recent display faces, do not reuse: ${out.avoidFaces.join(', ')}`);
  const grounds = log.slice(0, 3).map((e) => String(e.axes || '').split('/')[0].match(/light|mid|dark/)?.[0]).filter(Boolean);
  if (grounds.length >= 2 && grounds.every((g) => g === grounds[0])) console.log(`recent grounds were all ${grounds[0]}: build on another ground unless the scene sentence demands it`);
  if (out.avoidHues.length) console.log(`recent ground/signal hues, move at least 40 degrees away: ${out.avoidHues.join(', ')}`);
  if (surface === 'app') console.log(`structure: shell ${out.shell} · leads with ${out.lead}`);
  else {
    console.log(`structure: shape ${out.shape} · first screen ${out.hero} · nav ${out.nav} · footer ${out.footer}`);
    console.log(`first section after the hero: ${out.opener} · leave out this time: ${out.leaveOut.join(' and ')} · lead with ${out.lead}, if the brief has it`);
    if (job) console.log(`job: the action ${out.action} · build the category's own sections: ${out.native.join('; ')}`);
    else console.log('no --job: name the visitor\'s job (subscribe, book, visit, attend, buy, try, sign up, hire, join, listen) and deal again with --job');
  }
  console.log(`take the structure unless the brief's material refuses a pick; name every swap in the direction card. After building: node scripts/deal_direction.mjs log --entry '{"material":"<slug or custom>","axes":"<ground/display/accent>","face":"<display face>","hue":"<dominant ground or signal colour, name and hue>","shape":"...","hero":"...","nav":"...","footer":"...","seed":"${seed}"}'`);
}

function log() {
  let entry; try { entry = JSON.parse(opt('entry', '')); } catch { console.error('--entry takes one JSON object'); process.exit(2); }
  const cur = readLog();
  const next = [{ date: new Date().toISOString().slice(0, 10), ...entry }, ...cur].slice(0, 20);
  mkdirSync(dirname(LOG), { recursive: true });
  writeFileSync(LOG, JSON.stringify(next, null, 1));
  console.log(`logged ${entry.material || '?'} (${entry.axes || 'no axes'}) at the top of ${LOG} (${next.length} of 20)`);
}

if (cmd === 'deal') deal();
else if (cmd === 'log') log();
else if (cmd === 'list') for (const m of materials()) console.log(`${m.slug.padEnd(18)} ${m.family.padEnd(10)} ${axes(m).padEnd(34)} ${m.posture}`);
else { console.error('usage: deal_direction.mjs deal --keywords "..." [--surface page|app] [--material photo|product|words|data] [--job <job>] [--seed hex] [--log PATH|--no-log] [--json]\n       deal_direction.mjs log --entry \'{json}\'\n       deal_direction.mjs list'); process.exit(2); }
