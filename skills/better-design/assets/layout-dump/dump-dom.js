// Dumps the rendered DOM under a root element to better-design-layout-v1 JSON for
// scripts/check_layout.py. Read-only apart from a temporary zero-size probe used to find
// text baselines, which is removed immediately.
//
// Usage (browser tool or DevTools console):
//   copy(JSON.stringify(betterDesignDumpLayout('#settings'), null, 1))
// or evaluate the whole file and return betterDesignDumpLayout('main').
//
// Optional per-element hints (data attributes): data-ui-role=window|container|control|text|
// icon|image|decor, data-ui-align=start|center|end, data-ui-optical="dx,dy", data-ui-group,
// data-ui-overlap, data-ui-edge, data-ui-ignore.
function betterDesignDumpLayout(rootSelector = 'body', options = {}) {
  const root = typeof rootSelector === 'string' ? document.querySelector(rootSelector) : rootSelector;
  if (!root) throw new Error('Root not found: ' + rootSelector);
  const nodes = [];
  let counter = 0;
  const CONTROL = 'button, a[href], input, select, textarea, summary, [role=button], [role=switch], ' +
    '[role=tab], [role=checkbox], [role=radio], [role=slider], [role=menuitem], [role=option]';
  const WINDOW = 'dialog, [role=dialog], [role=alertdialog]';
  const px = v => parseFloat(v) || 0;
  const round = v => Math.round(v * 100) / 100;
  const box = r => [round(r.left), round(r.top), round(r.width), round(r.height)];

  const visible = el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0 && r.width > 0 && r.height > 0;
  };
  const ownText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const paints = cs => cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' ||
    px(cs.borderTopWidth) + px(cs.borderLeftWidth) > 0 || cs.boxShadow !== 'none';
  const padding = cs => [px(cs.paddingTop) + px(cs.borderTopWidth), px(cs.paddingRight) + px(cs.borderRightWidth),
    px(cs.paddingBottom) + px(cs.borderBottomWidth), px(cs.paddingLeft) + px(cs.borderLeftWidth)];

  // Text "ink": horizontal glyph extent x the cap band (baseline up to cap height), so
  // descenders and accents do not move the measured center.
  const canvas = document.createElement('canvas').getContext('2d');
  function textInk(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter(r => r.width > 0);
    if (!rects.length) return null;
    const cs = getComputedStyle(el);
    canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const cap = canvas.measureText('H').actualBoundingBoxAscent;
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    const first = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    el.insertBefore(probe, first || null);
    const firstBaseline = probe.getBoundingClientRect().top;
    el.appendChild(probe);
    const lastBaseline = probe.getBoundingClientRect().top;
    probe.remove();
    const left = Math.min(...rects.map(r => r.left));
    const right = Math.max(...rects.map(r => r.right));
    return [round(left), round(firstBaseline - cap), round(right - left), round(lastBaseline - firstBaseline + cap)];
  }

  function roleOf(el, cs, parentRole) {
    if (el.dataset.uiRole) return el.dataset.uiRole;
    if (el.matches(WINDOW)) return 'window';
    if (el.matches(CONTROL)) return 'control';
    if (el.matches('svg, img, picture, canvas, video, i[class*=icon], span[class*=icon]')) {
      return parentRole === 'control' || el.getBoundingClientRect().width <= 64 ? 'icon' : 'image';
    }
    if (ownText(el)) return 'text';
    return 'container';
  }

  function walk(el, parentId, parentRole, depth) {
    if (depth > (options.maxDepth || 40) || el.dataset.uiIgnore !== undefined || !visible(el)) return;
    const cs = getComputedStyle(el);
    const role = roleOf(el, cs, parentRole);
    const kids = [...el.children].filter(visible);
    // Collapse pass-through wrappers: one child, no own text, no paint, no padding.
    const wrapper = role === 'container' && el !== root && kids.length === 1 && !ownText(el) &&
      !paints(cs) && padding(cs).every(v => v === 0) && !el.dataset.uiRole;
    if (wrapper) return walk(kids[0], parentId, parentRole, depth + 1);

    const id = (el.id || el.getAttribute('aria-label') || el.tagName.toLowerCase()) + '#' + (++counter);
    const node = { id, parent: parentId, role, rect: box(el.getBoundingClientRect()) };
    const name = (el.getAttribute('aria-label') || (ownText(el) ? el.textContent.trim() : '') || el.id || '').slice(0, 40);
    if (name) node.name = name + ' (' + id + ')';
    if (role === 'text') {
      const ink = textInk(el);
      if (ink) node.ink = ink;
      // The checker works in screen x, so map logical alignment to the physical edge.
      const align = cs.textAlign, ltr = cs.direction !== 'rtl';
      const right = align === 'right' || (align === 'end' && ltr) || ((align === 'start' || align === 'justify') && !ltr);
      node.align = align === 'center' ? 'center' : right ? 'end' : 'start';
    }
    if (role === 'window' || role === 'container' && paints(cs)) {
      const pad = padding(cs);
      if (pad.some(v => v > 0)) node.padding = pad;
    }
    if (role === 'control' && el.dataset.uiAlign) node.align = el.dataset.uiAlign;
    if (role === 'control' && !el.dataset.uiAlign && cs.justifyContent.match(/start|left|normal/) && cs.display.includes('flex')) node.align = 'start';
    if (el.dataset.uiOptical) node.optical = el.dataset.uiOptical.split(',').map(Number);
    if (el.dataset.uiGroup) node.group = el.dataset.uiGroup;
    if (el.dataset.uiOverlap !== undefined || cs.position === 'absolute' || cs.position === 'fixed') node.overlap = true;
    if (el.dataset.uiEdge !== undefined) node.edge = true;
    const sx = /(auto|scroll)/.test(cs.overflowX), sy = /(auto|scroll)/.test(cs.overflowY);
    if (sx || sy) node.scroll = sx && sy ? 'both' : sx ? 'x' : 'y';
    nodes.push(node);
    // A control's own text (e.g. <button>Save</button>) becomes a text child so it can be centered.
    if (role === 'control' && ownText(el)) {
      const ink = textInk(el);
      if (ink) nodes.push({ id: id + '/label', parent: id, role: 'text', rect: node.rect, ink, align: 'center' });
    }
    if (role === 'text' || role === 'icon' || role === 'image') return;
    for (const kid of kids) walk(kid, id, role, depth + 1);
  }

  walk(root, null, null, 0);
  const vw = innerWidth || document.documentElement.clientWidth || document.documentElement.scrollWidth;
  const vh = innerHeight || document.documentElement.clientHeight || document.documentElement.scrollHeight;
  if (nodes[0] && nodes[0].role === 'container') nodes[0].role = 'window';
  return {
    format: 'better-design-layout-v1',
    note: `DOM dump of ${typeof rootSelector === 'string' ? rootSelector : 'element'} at ${vw}x${vh}, devicePixelRatio ${devicePixelRatio}`,
    viewport: { width: vw, height: vh },
    nodes,
  };
}
