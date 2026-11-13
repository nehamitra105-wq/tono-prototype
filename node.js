/* =========================================================
   NODE BOARD — drafts list + boards ("Night Drive", "Draft 2", new boards)
   Home → Node Discovery → drafts page (Figma 960:4906) → a board. Toolbar replaces the nav bar.
   ========================================================= */
(() => {
const A = 'assets/node/';
const MAX_NODES = 10;
const D = 'assets/deep/';
const KEY = id => `tono.node.${id}.v3`;
const LIST_KEY = 'tono.node.boards.v5';
const COLORS = {song:'#BD2FA9', text:'#E13F5D', photo:'#5858D0', audio:'#AA43F4', video:'#F75472'};
const PH_COLORS = {song:'#BD2FA9', text:'#E13F5D', photo:'#AA43F4', audio:'#AA43F4', video:'#F75472'};
// bar heights from the hi-fi audio widget
const BARS = [22,28,18,36,22,18,42,36,28,28,18,22,28,18,28,28,18,22,28,18,22,28,18,36,28,36,36,22,28,42,22,18,28,18,42,22,36,28,28,28,18,28,18,22,18,36,36,22,28,22,18,28,18,42,42,22,28,42,22,18,28,18,42,22,36];
const WAVE_W = BARS.length + (BARS.length - 1) * 3;
const PHOTOS = Array.from({length:19}, (_, i) => `${A}p${String(i+1).padStart(2,'0')}.png`);
const AUDIO_LIB = [
  {title:'i’m trying not to text my ex LMAO', dur:72},
  {title:'crashing out', dur:72},
  {title:'voice memo 2am', dur:48},
  {title:'rain on the windshield', dur:125},
  {title:'humming in the car', dur:31},
];
// photos + videos for "Add media" (Figma 1139:10769); each one's title comes from what's in the shot
const P = i => `${A}p${String(i).padStart(2,'0')}.png`;
const MEDIA = [
  {img:D+'neon.png', kind:'video', title:'cool number lights', dur:72},
  {img:P(1),  kind:'photo', title:'bright light in da city'},
  {img:P(2),  kind:'photo', title:'golden hour stroll'},
  {img:P(3),  kind:'photo', title:'bestie reunion'},
  {img:P(4),  kind:'video', title:'subway hands', dur:14},
  {img:P(5),  kind:'video', title:'running thru the field', dur:21},
  {img:P(6),  kind:'photo', title:'sitting pretty'},
  {img:P(7),  kind:'photo', title:'upside down faces'},
  {img:P(8),  kind:'photo', title:'cobblestone nights'},
  {img:P(9),  kind:'photo', title:'fisheye squad'},
  {img:P(10), kind:'photo', title:'floor hangout'},
  {img:P(11), kind:'photo', title:'city besties'},
  {img:P(12), kind:'photo', title:'sunset haze'},
  {img:P(13), kind:'photo', title:'birthday on the tiny screen'},
  {img:P(14), kind:'video', title:'wind in my hair', dur:38},
  {img:P(15), kind:'photo', title:'arms up in the field'},
  {img:P(16), kind:'video', title:'it girl moment', dur:9},
  {img:P(17), kind:'photo', title:'stoop talk'},
  {img:P(18), kind:'photo', title:'lazy picnic'},
  {img:P(19), kind:'photo', title:'shades on'},
];
const SONG_LIB = [
  ...(typeof SONGS !== 'undefined' ? SONGS : []).map(s => ({title:s.title, artist:s.artist, img:s.art})),
  ...(typeof TOP10 !== 'undefined' ? TOP10 : []).filter(r => r.img).map(r => ({title:r.t, artist:r.a, img:r.img})),
];
// songs a project can extract; the first discovery is always Perfect Night (as in the hi-fi)
const OUT_POOL = [{title:'Perfect Night', artist:'Le Sserafim', img:D+'perfect-night.png'},
  ...SONG_LIB.map(s => ({title:s.title, artist:s.artist, img:s.img}))]
  .filter((s, i, all) => all.findIndex(o => o.title === s.title) === i);
const EXT = {photo:'.png', video:'.mov', audio:'.mp3'};

// Night Drive as in Figma 1298:18952: a video, a photo and a clip, noodled into Perfect Night, with earlier finds in history
const DAY = 864e5;
const DEFAULT = () => ({
  seq: 10,
  nodes: [
    {id:'n1', type:'video', x:0, y:300, title:'cool number lights', img:A+'video-thumb.png', dur:72},
    {id:'n2', type:'photo', x:190, y:120, title:'bright lights in the big citayyy', img:A+'highway.png'},
    {id:'n3', type:'audio', x:160, y:520, title:'crashing out', dur:72, pos:.2},
    {id:'n4', type:'song',  x:400, y:290, title:'Perfect Night', sub:'Le Sserafim', img:D+'perfect-night.png', cd:false, generated:true},
  ],
  edges: [
    {id:'e1', from:'n1', to:'n2', kind:'connector'},
    {id:'e2', from:'n2', to:'n4', kind:'output'},
    {id:'e3', from:'n3', to:'n4', kind:'output'},
  ],
  outputs: [
    {title:'Telephone Man', artist:'Meri Wilson', img:D+'h-telephone-man.png', at:Date.now() - 8 * DAY, counts:'1 photo'},
    {title:'Telephone', artist:'Lady Gaga ft Beyonce', img:D+'h-telephone.png', at:Date.now() - 7.8 * DAY, counts:'2 photos'},
    {title:'telepatia', artist:'M83', img:D+'h-telepatia.png', at:Date.now() - 7.5 * DAY, counts:'2 photos · 1 audio'},
    {title:'Midnight City', artist:'M83', img:D+'h-midnight-city.png', at:Date.now() - 7.2 * DAY, counts:'2 photos'},
    {title:'Night Train', artist:'Milena', img:D+'h-night-train.png', at:Date.now() - 2 * DAY, counts:'2 photos · 1 video'},
  ],
  now: {title:'Perfect Night', artist:'Le Sserafim', img:D+'perfect-night.png', at:Date.now() - 3600e3, counts:'1 photo · 1 video · 1 audio'},
});
const EMPTY = () => ({seq:1, nodes:[], edges:[], outputs:[], now:null});
const STARTERS = {nightdrive:DEFAULT};
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

// the list of boards; each board's nodes are saved under its own key
// Night Drive doubles as the template the walkthrough opens (Figma 1301:29606)
let boards = [{id:'nightdrive', name:'Night Drive'}];
try { const l = JSON.parse(localStorage.getItem(LIST_KEY)); if (Array.isArray(l) && l.length) boards = l; } catch (_) {}
const saveList = () => { try { localStorage.setItem(LIST_KEY, JSON.stringify(boards)); } catch (_) {} };
function load(id){
  let b; try { b = JSON.parse(localStorage.getItem(KEY(id))); } catch (_) {}
  b = b && b.nodes ? b : (STARTERS[id] || EMPTY)();
  b.outputs = b.outputs || []; if (b.now === undefined) b.now = null;
  return b;
}
let cur = boards[0];
let board = load(cur.id);
// the board saves as it changes (the project page and the full board share it)
function persist(){
  const keep = {...board, nodes:board.nodes.map(({fresh, ...r}) => r), now:board.now && (({fresh, ...r}) => r)(board.now)};
  try { localStorage.setItem(KEY(cur.id), JSON.stringify(keep)); } catch (_) {}
}
function select(id){
  const b = boards.find(x => x.id === id); if (!b) return;
  if (b !== cur){ cur = b; board = load(cur.id); }
}

const ui = { z:1, sel:null, tool:null, kind:'connector', del:new Set(), pan:{x:0, y:0}, near:null, playing:null };

/* ================= DOM ================= */
const statusbar = `
  <div class="statusbar">
    <p class="time">9:41</p><div class="island-space"></div>
    <div class="levels">
      <div class="cell"><i style="height:6.333px"></i><i style="height:8.67px"></i><i style="height:11px"></i><i style="height:13.667px"></i></div>
      <img src="assets/wifi.svg" width="19.333" height="14.333" alt="">
      <img src="assets/battery.svg" width="29.333" height="13.667" alt="">
    </div>
  </div>`;

const view = document.createElement('section');
view.className = 'node-view offright';
view.id = 'view-node';
view.setAttribute('aria-label', 'Night Drive node board');
view.innerHTML = `
  <div class="nb-canvas" id="nb-canvas">
    <div class="nb-glow"></div><div class="nb-dots" id="nb-dots"></div>
    <div class="nb-world" id="nb-world">
      <svg class="nb-edges" id="nb-edges" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nb-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <g id="nb-grads"></g>
        </defs>
        <g id="nb-lines"></g>
        <path class="temp" id="nb-temp" d=""/>
      </svg>
      <div id="nb-rings"></div><div id="nb-nodes"></div>
      <div id="nb-handles"></div>
    </div>
  </div>
  <div class="nb-topfade"></div>
  ${statusbar}
  <div class="nb-title">
    <button class="back" id="nb-back" aria-label="Back"><img src="${A}caret-left.svg" alt=""></button>
    <h1 class="t-header"><b id="nb-name">Night Drive</b><span> - draft</span></h1>
    <button class="trash" id="nb-trash" aria-label="Delete selected nodes" hidden disabled><i class="sym" style="--i:url(${A}ph-trash.svg)"></i></button>
  </div>
  <div class="nb-banner t-caption" id="nb-banner" role="status"></div>
  <div class="nb-toast t-body" id="nb-toast" role="status"><i class="sym"></i><span></span></div>
  <div class="nb-toolbar" role="toolbar" aria-label="Board tools">
    <button id="tb-add"><img src="${A}tb-plus.svg" alt=""><span>Add</span></button>
    <button id="tb-connect" aria-pressed="true"><img src="${A}tb-flow.svg" alt=""><span>Connect</span></button>
    <button id="tb-output" aria-pressed="false"><i class="sym" style="--i:url(${D}ph-music-notes-plus.svg)"></i><span>Output</span></button>
    <button id="tb-cut"><img src="${A}tb-scissors.svg" alt=""><span>Cut</span></button>
    <button id="tb-edit"><img src="${A}tb-pencil.svg" alt=""><span>Edit</span></button>
  </div>

  <div class="nb-overlay" id="nb-add">
    <div class="add-pop" role="dialog" aria-label="Add an element">
      <div class="hd">
        <p class="t-header">Add an element</p>
        <button class="x" data-close aria-label="Close"><img src="${A}x.svg" alt=""></button>
        <button class="ok" data-ok aria-label="Add selected" hidden><img src="${A}check.svg" alt=""></button>
        <p class="sub t-caption" id="nb-add-sub"></p>
      </div>
      <div class="add-grid">
        <div class="col">
          <button class="tile tile-text" data-kind="text"><p class="quote">“</p><p class="t-body">text snippet</p></button>
          <button class="tile tile-photo" data-kind="photo"><img src="${A}highway.png" alt=""><span class="fade"></span><p class="t-body">photo</p></button>
          <button class="tile tile-audio" data-kind="audio">${waveHTML(.2)}<div class="meta"><p class="t-body">audio</p><p class="t-caption">1:12</p></div></button>
        </div>
        <div class="col">
          <button class="tile tile-song" data-kind="song"><div class="cd"><img src="${A}cd-art.png" alt=""></div><p class="t-body">song</p></button>
          <button class="tile tile-video" data-kind="video"><img src="${A}video-thumb.png" alt=""><span class="fade"></span><p class="t-body">video</p></button>
        </div>
      </div>
    </div>
  </div>

`;
document.getElementById('app').append(view);

const $v = s => view.querySelector(s);
const canvas = $v('#nb-canvas'), world = $v('#nb-world'), dotsBg = $v('#nb-dots');
const nodesEl = $v('#nb-nodes'), handlesEl = $v('#nb-handles'), ringsEl = $v('#nb-rings');
const gradsEl = $v('#nb-grads'), linesEl = $v('#nb-lines'), tempEl = $v('#nb-temp');

/* ================= RENDER ================= */
function waveHTML(pos){
  const cut = Math.round(pos * BARS.length);
  return `<div class="wave-row">${BARS.map((h, i) => `<i style="height:${h}px"${i >= cut ? ' class="dim"' : ''}></i>`).join('')}
    <img class="scrub" src="${A}scrubber.svg" alt="" style="left:${(pos * WAVE_W).toFixed(1)}px"></div>`;
}

// shown only while a node is selected: a hint that its photo / audio / text / song can be changed
const ED = `<i class="sym ed" style="--i:url(${A}tb-pencil.svg)" aria-hidden="true"></i>`;
function nodeHTML(n){
  const cls = `nd${ui.sel === n.id ? ' sel' : ''}${ui.del.has(n.id) ? ' del' : ''}`;
  const pos = `style="left:${n.x}px;top:${n.y}px"`;
  switch (n.type){
    case 'song': return `<div class="${cls} nd-song${n.fresh ? ' fresh' : ''}" data-id="${n.id}" ${pos}>
        <div class="cd"><img class="${n.cd ? '' : 'cover'}" src="${n.img}" alt=""></div>
        <div class="meta"><p class="t-body">${ED}${esc(n.title)}</p><p class="t-caption">${esc(n.sub)}</p></div></div>`;
    case 'text': return `<div class="${cls} nd-text" data-id="${n.id}" ${pos}>
        <p class="quote">“</p><p class="t-body">${ED}${esc(n.text)}</p>${n.sub ? `<p class="t-caption">${esc(n.sub)}</p>` : ''}</div>`;
    case 'photo':
    case 'video': return `<div class="${cls} nd-${n.type}" data-id="${n.id}" ${pos}>
        <img src="${n.img}" alt=""><span class="fade"></span><p class="t-body">${ED}${esc(n.title)}</p></div>`;
    case 'audio': return `<div class="${cls} nd-audio" data-id="${n.id}" ${pos}>
        ${waveHTML(n.pos || 0)}
        <div class="audio-meta t-caption">
          <button class="play-mini" data-play aria-label="Play ${esc(n.title)}"><i class="sym" style="--i:url(${A}ph-${ui.playing && ui.playing.id === n.id ? 'pause' : 'play'}.svg)"></i></button>
          ${ED}<span class="nm">${esc(n.title)}</span><span class="tm">${timeLabel(n)}</span>
        </div></div>`;
    case 'gen': return `<div class="${cls} nd-song nd-gen" data-id="${n.id}" ${pos}>
        <div class="cd"><span class="shine"></span></div>
        <div class="meta"><p class="t-body">generating…</p><p class="t-caption">from ${n.from || 1} node${(n.from || 1) === 1 ? '' : 's'}</p></div></div>`;
    case 'ph': return `<div class="${cls} nd-ph" data-kind="${n.kind}" data-id="${n.id}" ${pos}><p class="t-body">+ add ${n.kind === 'text' ? 'text' : n.kind}</p></div>`;
  }
  return '';
}
const timeLabel = n => (ui.playing && ui.playing.id === n.id) || ui.scrubbing === n.id ? fmt((n.pos || 0) * n.dur) : fmt(n.dur);

function render(){
  nodesEl.innerHTML = board.nodes.map(nodeHTML).join('');
  board.nodes.forEach(n => { if (n.fresh) delete n.fresh; });
  drawRings();
  drawEdges(); drawHandles(); syncChrome();
  board.nodes.filter(n => n.type === 'gen').forEach(scheduleGen);
}

// mass edit: an SVG ring per node so the dashes can be rounded, spaced and animated
function drawRings(){
  if (ui.tool !== 'edit'){ ringsEl.innerHTML = ''; return; }
  ringsEl.innerHTML = board.nodes.map(n => {
    const b = box(n.id); if (!b) return '';
    const w = b.w + 12, h = b.h + 12;
    return `<svg class="edit-ring${ui.del.has(n.id) ? ' on' : ''}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${b.x - 6}px;top:${b.y - 6}px" aria-hidden="true">
      <rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="15" ry="15"/></svg>`;
  }).join('');
}

/* output noodles generate a song: ~5s "generating" shimmer, then a song loads in */
const GEN_MS = 5000, genTimers = {};
function scheduleGen(n){
  if (genTimers[n.id]) return;
  const left = Math.max(400, (n.until || 0) - Date.now());
  genTimers[n.id] = setTimeout(() => {
    delete genTimers[n.id];
    const g = board.nodes.find(m => m.id === n.id);
    if (!g || g.type !== 'gen') return;
    const feeds = board.edges.filter(e => e.to === g.id).map(e => e.from);
    const s = nextOutput();
    Object.assign(g, {type:'song', title:s.title, sub:s.artist, img:s.img, cd:false, generated:true, fresh:true});
    delete g.until; delete g.from;
    recordOutput(s, board.nodes.filter(m => feeds.includes(m.id)));
    if (!view.classList.contains('offright')){ render(); settle(g.id); toast(`Extracted “${s.title}”`, `${D}ph-music-notes.svg`); }
    else renderProj();
  }, left);
}

/* ---------- nodes never overlap ---------- */
const GAP = 16;
function overlaps(x, y, w, h, others){
  return others.some(b => !(x + w + GAP <= b.x || x >= b.x + b.w + GAP || y + h + GAP <= b.y || y >= b.y + b.h + GAP));
}
// nearest free top-left to (x, y) for a w×h node, spiralling outward
function spotNear(x, y, w, h, exclude = [], extra = []){
  const others = board.nodes.filter(n => !exclude.includes(n.id)).map(n => box(n.id)).filter(Boolean).concat(extra);
  if (!overlaps(x, y, w, h, others)) return {x:Math.round(x), y:Math.round(y)};
  for (let r = 12; r <= 900; r += 12){
    const steps = Math.max(12, Math.round(r / 6));
    for (let i = 0; i < steps; i++){
      const a = (i / steps) * Math.PI * 2;
      const nx = x + r * Math.cos(a), ny = y + r * Math.sin(a);
      if (!overlaps(nx, ny, w, h, others)) return {x:Math.round(nx), y:Math.round(ny)};
    }
  }
  return {x:Math.round(x), y:Math.round(y)};
}
// after a node is placed, resized or dropped: slide it to the nearest free spot
function settle(id){
  const b = box(id); if (!b) return;
  const p = spotNear(b.x, b.y, b.w, b.h, [id]);
  if (p.x === b.x && p.y === b.y) return;
  const n = board.nodes.find(m => m.id === id), el = nodesEl.querySelector(`[data-id="${id}"]`);
  n.x = p.x; n.y = p.y;
  el.classList.add('settling'); el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
  const t0 = performance.now();
  const follow = () => { drawEdges(); drawHandles(); if (performance.now() - t0 < 260) requestAnimationFrame(follow); else el.classList.remove('settling'); };
  requestAnimationFrame(follow);
}

function box(id){
  const n = board.nodes.find(m => m.id === id);
  const e = nodesEl.querySelector(`[data-id="${id}"]`);
  return n && e ? {x:n.x, y:n.y, w:e.offsetWidth, h:e.offsetHeight} : null;
}
function colorOf(n){ return n.type === 'ph' ? PH_COLORS[n.kind] : n.type === 'gen' ? COLORS.song : COLORS[n.type]; }

function curve(a, b){
  const overlapX = b.x < a.x + a.w + 24 && b.x + b.w > a.x - 24;
  if (overlapX){ // stacked nodes: route bottom → top
    const down = b.y + b.h/2 >= a.y + a.h/2;
    const x1 = a.x + a.w/2, x2 = b.x + b.w/2;
    const y1 = down ? a.y + a.h : a.y, y2 = down ? b.y : b.y + b.h, s = down ? 1 : -1;
    const c = Math.max(30, Math.abs(y2 - y1) * .55);
    const cy1 = y1 + s*c, cy2 = y2 - s*c;
    return { d:`M${x1} ${y1} C${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`, x1, y1, x2, y2,
             mx:(x1 + 3*x1 + 3*x2 + x2)/8, my:(y1 + 3*cy1 + 3*cy2 + y2)/8 };
  }
  const forward = b.x + b.w/2 >= a.x + a.w/2;
  const x1 = forward ? a.x + a.w : a.x, x2 = forward ? b.x : b.x + b.w;
  const y1 = a.y + a.h/2, y2 = b.y + b.h/2, s = forward ? 1 : -1;
  const c = Math.max(30, Math.abs(x2 - x1) * .55);
  const cx1 = x1 + s*c, cx2 = x2 - s*c;
  return { d:`M${x1} ${y1} C${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`, x1, y1, x2, y2,
           mx:(x1 + 3*cx1 + 3*cx2 + x2)/8, my:(y1 + 3*y1 + 3*y2 + y2)/8 };
}

function drawEdges(){
  let grads = '', lines = '';
  board.edges.forEach(e => {
    let a = box(e.from), b = box(e.to); if (!a || !b) return;
    // a selected node's noodles start at its connection dots (14px out from each side)
    const grow = q => ({x:q.x - 14, y:q.y - 14, w:q.w + 28, h:q.h + 28});
    if (!ui.tool && ui.sel === e.from) a = grow(a);
    if (!ui.tool && ui.sel === e.to) b = grow(b);
    const na = board.nodes.find(n => n.id === e.from), nb = board.nodes.find(n => n.id === e.to);
    const c = curve(a, b), c1 = colorOf(na), c2 = colorOf(nb);
    grads += `<linearGradient id="g-${e.id}" gradientUnits="userSpaceOnUse" x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}">
      <stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
    lines += `<g class="edge" data-edge="${e.id}">
      <path class="line ${e.kind}" d="${c.d}" stroke="url(#g-${e.id})"/>
      ${e.kind === 'output' ? `<g class="badge"><circle cx="${c.mx}" cy="${c.my}" r="9" stroke="${c2}"/>
        <image href="${A}ph-waveform.svg" x="${c.mx-6}" y="${c.my-6}" width="12" height="12"/></g>` : ''}
      <path class="hit" data-edge="${e.id}" d="${c.d}"/></g>`;
  });
  gradsEl.innerHTML = grads; linesEl.innerHTML = lines;
}

function dotsFor(id, near){
  const b = box(id); if (!b) return '';
  const pts = [[b.x + b.w/2, b.y - 14], [b.x + b.w + 14, b.y + b.h/2], [b.x + b.w/2, b.y + b.h + 14], [b.x - 14, b.y + b.h/2]];
  return pts.map(([x, y]) => `<span class="nb-dot${near ? ' near' : ''}" data-from="${id}" style="left:${x}px;top:${y}px"></span>`).join('');
}
function drawHandles(){
  let h = '';
  const selNode = board.nodes.find(n => n.id === ui.sel);
  if (!ui.tool && selNode && selNode.type !== 'ph') h += dotsFor(ui.sel);
  if (ui.near && ui.near !== ui.sel) h += dotsFor(ui.near, true);
  handlesEl.innerHTML = h;
}

function applyPan(){
  world.style.transform = `translate(${ui.pan.x}px, ${ui.pan.y}px) scale(${ui.z})`;
  world.style.setProperty('--zi', (1 / ui.z).toFixed(3));
  // dot lattice follows the board: spacing shrinks/grows with zoom
  // eased, not linear: the dot field changes scale more slowly than the nodes, which reads as depth
  const dz = Math.pow(ui.z, .6);
  dotsBg.style.setProperty('--z', dz.toFixed(3));
  const mp = `${(ui.pan.x * .9 + 16 * dz).toFixed(1)}px ${(ui.pan.y * .9 - 8 * dz).toFixed(1)}px`;
  dotsBg.style.webkitMaskPosition = mp; dotsBg.style.maskPosition = mp;
}

function updateAudio(n){
  const e = nodesEl.querySelector(`[data-id="${n.id}"]`); if (!e) return;
  const cut = Math.round((n.pos || 0) * BARS.length);
  e.querySelectorAll('.wave-row i').forEach((b, i) => b.classList.toggle('dim', i >= cut));
  e.querySelector('.scrub').style.left = `${((n.pos || 0) * WAVE_W).toFixed(1)}px`;
  e.querySelector('.tm').textContent = timeLabel(n);
  e.querySelector('.play-mini .sym').style.setProperty('--i', `url(${A}ph-${ui.playing && ui.playing.id === n.id ? 'pause' : 'play'}.svg)`);
}

/* ================= CHROME: toast, banner, toolbar ================= */
let toastT;
function toast(text, icon){
  const t = $v('#nb-toast');
  t.querySelector('span').textContent = text;
  const ic = t.querySelector('.sym');
  ic.style.display = icon ? '' : 'none';
  if (icon) ic.style.setProperty('--i', `url(${icon})`);
  t.classList.add('on'); clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 1900);
}

function syncChrome(){
  canvas.classList.toggle('cut', ui.tool === 'cut');
  canvas.classList.toggle('editing', ui.tool === 'edit');
  $v('#tb-cut').classList.toggle('on', ui.tool === 'cut');
  $v('#tb-edit').classList.toggle('on', ui.tool === 'edit');
  const trash = $v('#nb-trash');
  trash.hidden = ui.tool !== 'edit';
  trash.disabled = ui.del.size === 0;
  const banner = $v('#nb-banner');
  if (ui.tool === 'edit'){ banner.textContent = `Deleting ${ui.del.size} node${ui.del.size === 1 ? '' : 's'}`; banner.classList.add('on'); }
  else if (ui.tool === 'cut'){ banner.textContent = 'Tap a noodle to cut it'; banner.classList.add('on'); }
  else banner.classList.remove('on');
}

// noodle type: Connect joins elements, Output extracts a song from them
function setKind(k){
  if (ui.tool){ ui.tool = null; ui.del.clear(); render(); }
  if (ui.kind === k) return;
  ui.kind = k;
  $v('#tb-connect').setAttribute('aria-pressed', k === 'connector');
  $v('#tb-output').setAttribute('aria-pressed', k === 'output');
  toast(k === 'connector' ? 'Noodles connect elements' : 'Noodles extract a song', k === 'connector' ? `${A}tb-flow.svg` : `${D}ph-music-notes-plus.svg`);
}
$v('#tb-connect').addEventListener('click', () => setKind('connector'));
$v('#tb-output').addEventListener('click', () => setKind('output'));
$v('#tb-cut').addEventListener('click', () => { ui.tool = ui.tool === 'cut' ? null : 'cut'; ui.sel = null; ui.del.clear(); render(); });
$v('#tb-edit').addEventListener('click', () => { ui.tool = ui.tool === 'edit' ? null : 'edit'; ui.sel = null; ui.del.clear(); render(); });
$v('#tb-add').addEventListener('click', () => openAdd(null));
$v('#nb-trash').addEventListener('click', () => {
  const n = ui.del.size; if (!n) return;
  board.nodes = board.nodes.filter(m => !ui.del.has(m.id));
  board.edges = board.edges.filter(e => !ui.del.has(e.from) && !ui.del.has(e.to));
  ui.del.forEach(id => { if (ui.playing && ui.playing.id === id) stopAudio(); });
  ui.del.clear(); render();
  toast(`Deleted ${n} node${n === 1 ? '' : 's'}`, `${A}ph-trash.svg`);
});

/* ================= POINTER: select, drag, pan, noodles, cut, scrub ================= */
function local(e){
  const r = canvas.getBoundingClientRect(), s = r.width / 402;
  return {x:(e.clientX - r.left) / s, y:(e.clientY - r.top) / s};
}
const toWorld = p => ({x:(p.x - ui.pan.x) / ui.z, y:(p.y - ui.pan.y) / ui.z});
const Z_MIN = .45, Z_MAX = 1.5;
function zoomAt(p, z){
  z = Math.min(Z_MAX, Math.max(Z_MIN, z));
  const w = toWorld(p);
  ui.z = z; ui.pan = {x:p.x - w.x * z, y:p.y - w.y * z}; applyPan();
}
const pts = new Map();   // active pointers, for pinch-to-zoom
const capture = e => { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} };
let drag = null;

function nearNode(w, except){
  for (let i = board.nodes.length - 1; i >= 0; i--){
    const n = board.nodes[i]; if (n.id === except) continue;
    const b = box(n.id);
    const m = 10 / ui.z;   // ~10px on screen
    if (b && w.x >= b.x - m && w.x <= b.x + b.w + m && w.y >= b.y - m && w.y <= b.y + b.h + m) return n.id;
  }
  return null;
}
function scrubTo(e, id){
  const n = board.nodes.find(m => m.id === id);
  const row = nodesEl.querySelector(`[data-id="${id}"] .wave-row`).getBoundingClientRect();
  n.pos = Math.min(1, Math.max(0, (e.clientX - row.left) / row.width));
  if (ui.playing && ui.playing.id === id) ui.playing.last = performance.now();
  updateAudio(n);
}

canvas.addEventListener('pointerdown', e => {
  if (e.button > 0) return;
  pts.set(e.pointerId, local(e));
  if (pts.size === 2){ startPinch(); capture(e); return; }
  if (pts.size > 2) return;
  const p = local(e), t = e.target;
  drag = {start:p, moved:false};
  const dot = t.closest('.nb-dot'), play = t.closest('[data-play]'), wave = t.closest('.nd-audio .wave-row');
  const nodeEl = t.closest('.nd'), hit = t.closest('path.hit');
  if (play && !ui.tool){ drag.type = 'play'; drag.id = nodeEl.dataset.id; }
  else if (ui.tool === 'cut' && hit){ drag.type = 'cut'; drag.edge = hit.dataset.edge; }
  else if (dot && !ui.tool){
    drag.type = 'noodle'; drag.from = dot.dataset.from;
    drag.anchor = {x:parseFloat(dot.style.left), y:parseFloat(dot.style.top)};
  }
  else if (wave && !ui.tool){ drag.type = 'scrub'; drag.id = nodeEl.dataset.id; ui.scrubbing = drag.id; scrubTo(e, drag.id); }
  else if (nodeEl){ const n = board.nodes.find(m => m.id === nodeEl.dataset.id); drag.type = 'node'; drag.id = n.id; drag.orig = {x:n.x, y:n.y}; }
  else { drag.type = 'pan'; drag.orig = {...ui.pan}; }
  capture(e);
});

function startPinch(){
  if (drag && drag.type === 'node') nodesEl.querySelector(`[data-id="${drag.id}"]`)?.classList.remove('dragging');
  tempEl.setAttribute('d', ''); ui.near = null; ui.scrubbing = null; canvas.classList.remove('panning');
  const [a, b] = [...pts.values()];
  drag = {type:'pinch', d0:Math.hypot(b.x - a.x, b.y - a.y) || 1, z0:ui.z, w:toWorld({x:(a.x + b.x)/2, y:(a.y + b.y)/2})};
  drawHandles();
}
canvas.addEventListener('pointermove', e => {
  if (pts.has(e.pointerId)) pts.set(e.pointerId, local(e));
  if (!drag) return;
  if (drag.type === 'pinch'){
    if (pts.size < 2) return;
    const [a, b] = [...pts.values()], m = {x:(a.x + b.x)/2, y:(a.y + b.y)/2};
    ui.z = Math.min(Z_MAX, Math.max(Z_MIN, drag.z0 * Math.hypot(b.x - a.x, b.y - a.y) / drag.d0));
    ui.pan = {x:m.x - drag.w.x * ui.z, y:m.y - drag.w.y * ui.z}; applyPan();
    return;
  }
  const p = local(e), dx = p.x - drag.start.x, dy = p.y - drag.start.y;
  if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
  if (!drag.moved) return;
  if (drag.type === 'pan'){
    canvas.classList.add('panning');
    ui.pan = {x:drag.orig.x + dx, y:drag.orig.y + dy}; applyPan();
  } else if (drag.type === 'node' && !ui.tool){
    const n = board.nodes.find(m => m.id === drag.id);
    n.x = Math.round(drag.orig.x + dx / ui.z); n.y = Math.round(drag.orig.y + dy / ui.z);
    const ne = nodesEl.querySelector(`[data-id="${n.id}"]`);
    ne.style.left = `${n.x}px`; ne.style.top = `${n.y}px`; ne.classList.add('dragging');
    if (n.type !== 'ph' && ui.sel !== n.id){ ui.sel = n.id; nodesEl.querySelectorAll('.nd.sel').forEach(x => x.classList.remove('sel')); ne.classList.add('sel'); }
    drawEdges(); drawHandles();
  } else if (drag.type === 'noodle'){
    const w = toWorld(p), a = drag.anchor;
    const c = Math.max(30, Math.abs(w.x - a.x) * .5) * (w.x >= a.x ? 1 : -1);
    tempEl.setAttribute('d', `M${a.x} ${a.y} C${a.x + c} ${a.y}, ${w.x - c} ${w.y}, ${w.x} ${w.y}`);
    tempEl.setAttribute('stroke', ui.kind === 'output' ? '#F75472' : '#D5A1FA');
    drag.last = w;
    const near = nearNode(w, drag.from);
    if (near !== ui.near){ ui.near = near; drawHandles(); }
  } else if (drag.type === 'scrub'){ scrubTo(e, drag.id); }
});

function spawnOutput(from, to, w){
  if (board.nodes.length >= MAX_NODES){ toast(`Boards are capped at ${MAX_NODES} nodes`); render(); return; }
  const W = 162, H = 208;
  let at;
  if (to){ const b = box(to); at = {x:b.x + b.w + 70, y:b.y + b.h/2 - H/2}; }
  else at = {x:w.x - W/2, y:w.y - H/2};
  const p = spotNear(at.x, at.y, W, H);
  const id = `n${++board.seq}`, feeds = to ? [from, to] : [from];
  board.nodes.push({id, type:'gen', x:p.x, y:p.y, until:Date.now() + GEN_MS, from:feeds.length});
  feeds.forEach(f => board.edges.push({id:`e${++board.seq}`, from:f, to:id, kind:'output'}));
  ui.sel = null; render(); settle(id); setTimeout(() => reveal(id), 280);
}
// pan just enough to show a node fully between the header and the toolbar
function reveal(id){
  const b = box(id); if (!b) return;
  const L = 14, R = 388, T = 120, B = 744, z = ui.z;
  const sx = ui.pan.x + b.x * z, sy = ui.pan.y + b.y * z, sw = b.w * z, sh = b.h * z;
  let dx = 0, dy = 0;
  if (sx < L) dx = L - sx; else if (sx + sw > R) dx = R - (sx + sw);
  if (sy < T) dy = T - sy; else if (sy + sh > B) dy = B - (sy + sh);
  if (!dx && !dy) return;
  const from = {...ui.pan}, t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - k, 3);
    ui.pan = {x:from.x + dx * e, y:from.y + dy * e}; applyPan();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function endDrag(e){
  pts.delete(e.pointerId);
  if (drag && drag.type === 'pinch'){ if (!pts.size) drag = null; return; }
  if (!drag) return;
  const d = drag; drag = null;
  canvas.classList.remove('panning');
  if (d.type === 'pan' && !d.moved){
    if (ui.tool) return;
    if (ui.sel){ ui.sel = null; render(); }
    else openAdd(toWorld(d.start));
  }
  else if (d.type === 'node'){
    const n = board.nodes.find(m => m.id === d.id);
    if (d.moved){ nodesEl.querySelector(`[data-id="${d.id}"]`)?.classList.remove('dragging'); settle(d.id); return; }
    if (ui.tool === 'edit'){ ui.del.has(n.id) ? ui.del.delete(n.id) : ui.del.add(n.id); render(); }
    else if (ui.tool === 'cut'){ /* nodes are inert while cutting */ }
    else if (n.type === 'ph'){ openMedia(n); }
    else { ui.sel = n.id; render(); }
  }
  else if (d.type === 'noodle'){
    tempEl.setAttribute('d', '');
    const to = ui.near; ui.near = null;
    if (ui.kind === 'output' && d.moved){ spawnOutput(d.from, to, d.last || toWorld(d.start)); return; }
    if (to && !board.edges.some(x => (x.from === d.from && x.to === to) || (x.from === to && x.to === d.from))){
      board.edges.push({id:`e${++board.seq}`, from:d.from, to, kind:ui.kind});
    }
    render();
  }
  else if (d.type === 'cut' && !d.moved){
    board.edges = board.edges.filter(x => x.id !== d.edge); render();
  }
  else if (d.type === 'play' && !d.moved){ togglePlay(d.id); }
  else if (d.type === 'scrub'){ ui.scrubbing = null; const n = board.nodes.find(m => m.id === d.id); updateAudio(n); }
}
canvas.addEventListener('pointerup', endDrag);
// trackpad pinch / ⌘-scroll zooms around the cursor; plain two-finger scroll pans
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const p = local(e), s = canvas.getBoundingClientRect().width / 402;
  if (e.ctrlKey || e.metaKey) zoomAt(p, ui.z * Math.exp(-e.deltaY * .01));
  else { ui.pan = {x:ui.pan.x - e.deltaX / s, y:ui.pan.y - e.deltaY / s}; applyPan(); }
}, {passive:false});
canvas.addEventListener('pointercancel', e => { pts.delete(e.pointerId); drag = null; tempEl.setAttribute('d', ''); ui.near = null; drawHandles(); });

/* ================= AUDIO WIDGET (soft synth preview) ================= */
let actx = null;
function startSynth(){
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    actx.resume();
    const out = actx.createGain(); out.gain.value = 0; out.connect(actx.destination);
    out.gain.linearRampToValueAtTime(.05, actx.currentTime + .4);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
    const oscs = [220, 261.63, 329.63, 392].map((f, i) => {
      const o = actx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      o.connect(lp); o.start(); return o;
    });
    return {out, oscs};
  } catch (_) { return null; }
}
function stopSynth(s){
  if (!s || !actx) return;
  s.out.gain.cancelScheduledValues(actx.currentTime);
  s.out.gain.linearRampToValueAtTime(0, actx.currentTime + .25);
  s.oscs.forEach(o => o.stop(actx.currentTime + .3));
}
function togglePlay(id){
  const same = ui.playing && ui.playing.id === id;
  stopAudio();
  if (same) return;
  const n = board.nodes.find(m => m.id === id);
  if ((n.pos || 0) >= .999) n.pos = 0;
  ui.playing = {id, last:performance.now(), synth:startSynth()};
  const tick = now => {
    if (!ui.playing || ui.playing.id !== id) return;
    if (ui.scrubbing !== id) n.pos = Math.min(1, (n.pos || 0) + (now - ui.playing.last) / 1000 / n.dur);
    ui.playing.last = now;
    if (n.pos >= 1){ stopAudio(); return; }
    updateAudio(n);
    ui.playing.raf = requestAnimationFrame(tick);
  };
  updateAudio(n);
  ui.playing.raf = requestAnimationFrame(tick);
}
function stopAudio(){
  if (!ui.playing) return;
  const p = ui.playing; ui.playing = null;
  cancelAnimationFrame(p.raf); stopSynth(p.synth);
  const n = board.nodes.find(m => m.id === p.id); if (n) updateAudio(n);
}

/* ================= ADD AN ELEMENT ================= */
const addOv = $v('#nb-add');
let addAt = null;
const picked = new Set();
function openAdd(at){
  if (board.nodes.length >= MAX_NODES){ toast(`Boards are capped at ${MAX_NODES} nodes`); return; }
  addAt = at; picked.clear(); syncAdd(); addOv.classList.add('on');
}
function syncAdd(){
  addOv.querySelectorAll('.tile').forEach(t => t.classList.toggle('on', picked.has(t.dataset.kind)));
  const left = MAX_NODES - board.nodes.length;
  addOv.querySelectorAll('.tile').forEach(t => t.classList.toggle('full', !picked.has(t.dataset.kind) && picked.size >= left));
  $v('#nb-add-sub').textContent = picked.size ? `${picked.size} element${picked.size === 1 ? '' : 's'} selected` : '';
  addOv.querySelector('[data-ok]').hidden = picked.size === 0;
}
addOv.addEventListener('click', e => {
  if (e.target === addOv || e.target.closest('[data-close]')){ addOv.classList.remove('on'); return; }
  const tile = e.target.closest('.tile');
  if (tile){
    const k = tile.dataset.kind;
    if (picked.has(k)) picked.delete(k);
    else if (picked.size >= MAX_NODES - board.nodes.length){ toast(`Boards are capped at ${MAX_NODES} nodes`); return; }
    else picked.add(k);
    syncAdd(); return;
  }
  if (e.target.closest('[data-ok]')){
    const order = ['text','photo','audio','song','video'].filter(k => picked.has(k));
    const base = addAt ? {x:addAt.x - 75, y:addAt.y - 75} : freeSpot(order.length);
    const placed = [];
    order.forEach((kind, i) => {
      const p = spotNear(base.x + (i % 2) * 165, base.y + Math.floor(i / 2) * 165, 149, 149, [], placed);
      placed.push({x:p.x, y:p.y, w:149, h:149});
      board.nodes.push({id:`n${++board.seq}`, type:'ph', kind, x:p.x, y:p.y});
    });
    addOv.classList.remove('on'); ui.sel = null; render();
  }
});

// + button: nearest open area to the middle of the visible board
function freeSpot(count){
  const w = count > 1 ? 314 : 149, h = Math.ceil(count / 2) * 165 - 16;
  const boxes = board.nodes.map(n => box(n.id)).filter(Boolean);
  const clear = (x, y) => boxes.every(b => x + w + 16 < b.x || x > b.x + b.w + 16 || y + h + 16 < b.y || y > b.y + b.h + 16);
  const cx = (201 - ui.pan.x) / ui.z - w/2, cy = (430 - ui.pan.y) / ui.z - h/2;
  for (let r = 0; r <= 600; r += 30){
    for (let a = 0; a < 360; a += r ? 30 : 360){
      const x = Math.round(cx + r * Math.cos(a * Math.PI / 180)), y = Math.round(cy + r * Math.sin(a * Math.PI / 180));
      if (clear(x, y)){
        if (r) { ui.pan = {x:201 - (x + w/2) * ui.z, y:430 - (y + h/2) * ui.z}; applyPan(); } // bring the new spot into view
        return {x, y};
      }
    }
  }
  return {x:Math.round(cx), y:Math.round(cy)};
}

/* =========================================================
   DEEP SEARCH — pickers, project page (Figma 1119:6744 → 1139:9197), landing page (982:12783)
   ========================================================= */
const app = document.getElementById('app');
const sym = (src, cls = '') => `<i class="sym ${cls}" style="--i:url(${src})" aria-hidden="true"></i>`;
const SIZE = {photo:[149,149], video:[149,149], audio:[277,84], text:[260,92], song:[162,208]};

// app-level toast + menu (they show over the project page and the pickers)
const aToast = document.createElement('div');
aToast.className = 'nb-toast dp-toast t-body'; aToast.setAttribute('role', 'status');
aToast.innerHTML = '<i class="sym"></i><span></span>';
app.append(aToast);
let aToastT;
function note(text, icon){
  if (!view.classList.contains('offright')) return toast(text, icon);
  aToast.querySelector('span').textContent = text;
  aToast.querySelector('.sym').style.setProperty('--i', `url(${icon || D + 'ph-check.svg'})`);
  aToast.classList.add('on'); clearTimeout(aToastT);
  aToastT = setTimeout(() => aToast.classList.remove('on'), 1900);
}

/* ---------- placing new elements on the board ---------- */
function centre(){
  const bs = board.nodes.map(n => box(n.id)).filter(Boolean);
  if (!bs.length) return {x:40, y:220};
  const x0 = Math.min(...bs.map(b => b.x)), x1 = Math.max(...bs.map(b => b.x + b.w));
  const y0 = Math.min(...bs.map(b => b.y)), y1 = Math.max(...bs.map(b => b.y + b.h));
  return {x:(x0 + x1) / 2, y:(y0 + y1) / 2};
}
function addNodes(list){
  const left = MAX_NODES - board.nodes.length;
  if (left <= 0){ note(`Projects are capped at ${MAX_NODES} inputs`); return []; }
  if (list.length > left) note(`Only ${left} more input${left === 1 ? '' : 's'} fit — added the first ${left}`);
  const c = centre(), placed = [], ids = [];
  list.slice(0, left).forEach(n => {
    const [w, h] = SIZE[n.type] || [149, 149];
    const p = spotNear(c.x - w / 2, c.y - h / 2, w, h, [], placed);
    placed.push({x:p.x, y:p.y, w, h});
    const id = `n${++board.seq}`; ids.push(id);
    board.nodes.push({id, x:p.x, y:p.y, ...n});
  });
  render(); persist();
  return ids;
}
const mediaNode = i => { const m = MEDIA[i]; return m.kind === 'video' ? {type:'video', title:m.title, img:m.img, dur:m.dur} : {type:'photo', title:m.title, img:m.img}; };
const audioNode = i => ({type:'audio', title:AUDIO_LIB[i].title, dur:AUDIO_LIB[i].dur, pos:0});

/* ================= PICKERS: Add media / Add audio / Add song / Add text ================= */
const picker = document.createElement('section');
picker.className = 'nb-screen dp-screen'; picker.setAttribute('aria-label', 'Add an input');
const detail = document.createElement('section');
detail.className = 'nb-screen dp-screen'; detail.setAttribute('aria-label', 'Add text');
app.append(picker, detail);
let flow = null;   // {kind, from:'proj'|'board', ph?, sel:Set, edit?}
const head = (title, okDisabled) => `
  <div class="fadetop"></div>${statusbar}
  <div class="scr-head"><button data-x aria-label="Close"><img src="${A}x.svg" alt=""></button>
  <p class="t-header">${title}</p><button class="ok" data-ok aria-label="Done" ${okDisabled ? 'disabled' : ''}><img src="${A}check.svg" alt=""></button></div>`;

// board placeholder → its picker (no describe step any more)
function openMedia(ph){
  const kind = ph.kind === 'photo' || ph.kind === 'video' ? 'media' : ph.kind;
  openPicker(kind, 'board', ph);
}
function openPicker(kind, from, ph){
  flow = {kind, from, ph, sel:new Set(), q:''};
  if (kind === 'text') return openText();
  renderPicker(); picker.classList.add('on');
}
function mediaGrid(){
  const sel = flow.sel;
  const b = (i, cls = '') => `<button class="${cls}${sel.has(i) ? ' on' : ''}" data-pick="${i}" aria-pressed="${sel.has(i)}" aria-label="${esc(MEDIA[i].title)} (${MEDIA[i].kind})">
    <img src="${MEDIA[i].img}" alt=""><span class="badge"><img src="${D}badge-${MEDIA[i].kind === 'video' ? 'video' : 'image'}.svg" alt=""></span></button>`;
  const q = flow.q.trim().toLowerCase();
  if (q || flow.only){
    const hits = MEDIA.map((m, i) => i).filter(i => (!flow.only || MEDIA[i].kind === flow.only) && (!q || MEDIA[i].title.includes(q) || MEDIA[i].kind.startsWith(q)));
    return hits.length ? `<div class="mp-flat">${hits.map(i => b(i)).join('')}</div>` : `<p class="mp-none t-body grey">No photos or videos match “${esc(flow.q)}”</p>`;
  }
  return `<div class="mp-grid">
    <div class="r4">${[1,2,3,4].map(i => b(i)).join('')}</div>
    <div class="rb">${b(0, 'big')}<div class="q">${[6,7,18,9].map(i => b(i)).join('')}</div></div>
    <div class="r4">${[15,16,8,17].map(i => b(i)).join('')}</div>
    <div class="rb"><div class="q">${[10,11,12,13].map(i => b(i)).join('')}</div>${b(14, 'big')}</div>
    <div class="r4">${[5,19,3,2].map(i => b(i)).join('')}</div></div>`;
}
function audioList(){
  return `<ul class="ap-list">${AUDIO_LIB.map((a, i) => `
    <li><button class="ap-card${flow.sel.has(i) ? ' on' : ''}" data-pick="${i}" aria-pressed="${flow.sel.has(i)}" aria-label="${esc(a.title)}">
      <span class="ap-play" data-aprev="${i}" role="button" aria-label="Preview">${sym(`${D}ph-${apv && apv.i === i ? 'pause' : 'play'}.svg`)}</span>
      ${waveWide(apv && apv.i === i ? apv.pos : .14, 70)}
      <span class="ap-tick">${sym(`${D}ph-check.svg`)}</span></button>
      <p class="ap-cap t-caption"><span>${esc(a.title)}.mp3</span><span>${fmt(a.dur)}</span></p></li>`).join('')}</ul>`;
}
function songList(){
  const q = flow.q.toLowerCase();
  const list = SONG_LIB.filter(s => !q || (s.title + ' ' + s.artist).toLowerCase().includes(q));
  return `<ul class="plist">${list.map(s => { const i = SONG_LIB.indexOf(s); return `
    <li data-pick="${i}" class="${flow.sel.has(i) ? 'on' : ''}"><div class="thumb"><img src="${s.img}" alt=""></div>
    <div class="names"><p class="t-body">${esc(s.title)}</p><p class="t-caption grey">${esc(s.artist)}</p></div><span class="tick"></span></li>`; }).join('')}</ul>`;
}
function pickerBody(){
  return flow.kind === 'media' ? mediaGrid() : flow.kind === 'audio' ? audioList() : songList();
}
function renderPicker(){
  const k = flow.kind;
  const title = flow.only ? `Add ${flow.only}s` : {media:'Add media', audio:'Add audio', song:'Add a song'}[k];
  const ph = flow.only ? `Search ${flow.only}s...` : {media:'Search photos and videos...', audio:'Search recordings...', song:'Search songs...'}[k];
  picker.innerHTML = `${head(title, flow.sel.size === 0)}
    <div class="scroll"><label class="pick-search"><img src="${A}magnifier.svg" alt=""><input type="text" placeholder="${ph}" value="${esc(flow.q)}" aria-label="${ph}"></label>
    <div class="pk-body">${pickerBody()}</div></div>`;
}
function syncPicker(){
  picker.querySelector('.pk-body').innerHTML = pickerBody();
  picker.querySelector('[data-ok]').disabled = flow.sel.size === 0;
}
picker.addEventListener('input', e => {
  if (!flow || !e.target.matches('input')) return;
  flow.q = e.target.value; syncPicker();
});

// audio previews in the picker
let apv = null;
function stopPreview(){ if (!apv) return; cancelAnimationFrame(apv.raf); stopSynth(apv.synth); apv = null; }
function preview(i){
  const same = apv && apv.i === i; stopPreview();
  if (!same){
    apv = {i, pos:.14, last:performance.now(), synth:startSynth()};
    const tick = now => {
      if (!apv || apv.i !== i) return;
      apv.pos += (now - apv.last) / 1000 / AUDIO_LIB[i].dur; apv.last = now;
      if (apv.pos >= 1){ stopPreview(); syncPicker(); return; }
      const w = picker.querySelector(`[data-pick="${i}"] .wave-row`);
      if (w) w.outerHTML = waveWide(apv.pos, 70);
      apv.raf = requestAnimationFrame(tick);
    };
    apv.raf = requestAnimationFrame(tick);
  }
  syncPicker();
}

function closePicker(){ stopPreview(); picker.classList.remove('on'); detail.classList.remove('on'); flow = null; }
picker.addEventListener('click', e => {
  if (!flow) return;
  if (e.target.closest('[data-x]')){ closePicker(); return; }
  const pv = e.target.closest('[data-aprev]');
  if (pv){ e.stopPropagation(); preview(+pv.dataset.aprev); return; }
  if (e.target.closest('[data-ok]')){ if (flow.sel.size) commitPicks(); return; }
  const p = e.target.closest('[data-pick]'); if (!p) return;
  const i = +p.dataset.pick;
  // from a board placeholder you fill that one spot, so it's a single choice
  if (flow.from === 'board' || flow.kind === 'song'){ const had = flow.sel.has(i); flow.sel.clear(); if (!had) flow.sel.add(i); }
  else if (flow.sel.has(i)) flow.sel.delete(i);
  else if (flow.sel.size >= MAX_NODES - board.nodes.length){ note(`Projects are capped at ${MAX_NODES} inputs`); return; }
  else flow.sel.add(i);
  syncPicker();
});
function commitPicks(){
  const k = flow.kind, picks = [...flow.sel];
  const nodes = picks.map(i => k === 'media' ? mediaNode(i) : k === 'audio' ? audioNode(i)
    : {type:'song', title:SONG_LIB[i].title, sub:SONG_LIB[i].artist, img:SONG_LIB[i].img, cd:false});
  if (flow.from === 'board'){
    const ph = flow.ph, idx = board.nodes.findIndex(m => m.id === ph.id);
    board.nodes[idx] = {id:ph.id, x:ph.x, y:ph.y, ...nodes[0]};
    closePicker(); ui.sel = ph.id; render(); settle(ph.id); persist(); setTimeout(() => reveal(ph.id), 280);
    return;
  }
  const ids = addNodes(nodes);
  closePicker(); renderProj();
  if (ids.length) note(`Added ${ids.length} input${ids.length === 1 ? '' : 's'}`, `${D}ph-plus.svg`);
}

/* text: write the snippet, that's it */
function openText(edit){
  if (flow) flow.edit = edit || null;
  detail.innerHTML = `${head(edit ? 'Edit text' : 'Add text', false)}
    <div class="det-text"><p class="quote">“</p><textarea id="det-body" placeholder="Write a text snippet" aria-label="Text snippet">${esc(edit ? edit.text : '')}</textarea>
    <input id="det-sub" type="text" placeholder="Who said it? (optional)" aria-label="Who said it" value="${esc(edit && edit.sub ? edit.sub.replace(/^-\s*/, '') : '')}"></div>`;
  detail.classList.add('on');
  setTimeout(() => detail.querySelector('#det-body')?.focus({preventScroll:true}), 620);
}
detail.addEventListener('click', e => {
  if (!flow) return;
  if (e.target.closest('[data-x]')){ closePicker(); return; }
  if (!e.target.closest('[data-ok]')) return;
  const body = detail.querySelector('#det-body').value.trim();
  if (!body){ detail.querySelector('#det-body').focus(); return; }
  const who = detail.querySelector('#det-sub').value.trim();
  const next = {type:'text', text:body, sub:who ? `- ${who.replace(/^-\s*/, '')}` : ''};
  if (flow.edit){ Object.assign(flow.edit, next); render(); persist(); closePicker(); renderProj(); return; }
  if (flow.from === 'board'){
    const ph = flow.ph, idx = board.nodes.findIndex(m => m.id === ph.id);
    board.nodes[idx] = {id:ph.id, x:ph.x, y:ph.y, ...next};
    closePicker(); ui.sel = ph.id; render(); settle(ph.id); persist(); setTimeout(() => reveal(ph.id), 280);
    return;
  }
  addNodes([next]); closePicker(); renderProj(); note('Added text', `${D}ph-plus.svg`);
});

/* ================= OUTPUTS ================= */
function nextOutput(){
  if (!board.outputs.length && !board.now) return OUT_POOL[0];
  const seen = new Set([...board.outputs, board.now].filter(Boolean).map(o => o.title));
  const pool = OUT_POOL.filter(s => !seen.has(s.title));
  const from = pool.length ? pool : OUT_POOL.filter(s => !board.now || s.title !== board.now.title);
  return from[(board.seq * 7 + board.outputs.length * 3) % from.length];
}
function countsOf(nodes){
  const c = {photo:0, video:0, audio:0, text:0, song:0};
  nodes.forEach(n => { if (c[n.type] !== undefined) c[n.type]++; });
  const word = {photo:'photo', video:'video', audio:'audio', text:'text', song:'song'};
  const parts = Object.keys(c).filter(k => c[k]).map(k => `${c[k]} ${word[k]}${c[k] > 1 && k !== 'audio' && k !== 'text' ? 's' : ''}`);
  return parts.join(' · ') || 'no inputs';
}
function recordOutput(s, from){
  board.outputs.push({title:s.title, artist:s.artist, img:s.img, at:Date.now(), counts:countsOf(from)});
  board.now = {...board.outputs[board.outputs.length - 1]};
  persist();
}
function ago(t){
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'Discovered now';
  if (m < 60) return `Discovered ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Discovered ${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Discovered ${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.floor(d / 7);
  return `Discovered ${w} week${w === 1 ? '' : 's'} ago`;
}

/* ================= PROJECT PAGE ================= */
const proj = document.createElement('section');
proj.className = 'view dp-view offright'; proj.id = 'view-proj'; proj.setAttribute('aria-label', 'Project');
document.querySelector('#app .tabbar').before(proj);
let extracting = false, extractT = null;

// inputs = what went in; songs the board extracted are outputs, not inputs
const inputsOf = () => board.nodes.filter(n => ['photo','video','audio','text','song'].includes(n.type) && !n.generated);
// a wider waveform for the project page + audio picker
function waveWide(pos, n = 80){
  const bars = Array.from({length:n}, (_, i) => BARS[(i * 7) % BARS.length]);
  const cut = Math.round(pos * n);
  return `<div class="wave-row dp-wave">${bars.map((h, i) => `<i style="height:${h}px"${i >= cut ? ' class="dim"' : ''}></i>`).join('')}
    <span class="dp-scrub" style="left:${(pos * 100).toFixed(2)}%"></span></div>`;
}
// minimized board (Figma 1211:17141): each input takes the next spot as it's added; the song output
// sits on the right and noodles only appear once a song has been extracted
const MINI = {
  video:{c:['#E13F5D','#BD2FA9'], w:69, h:69}, photo:{c:['#AA43F4','#5858D0'], w:72, h:72},
  audio:{c:['#BD2FA9','#AA43F4'], w:131, h:52}, text:{c:['#E13F5D','#C62F9D'], w:104, h:52}, song:{c:['#8E2BD0','#BD2FA9'], w:70, h:70},
};
// spot centres; the first three are the hi-fi's (left, top, bottom), later ones fill the gaps a little smaller
const SPOTS = [[51.5,114.5,1],[158,55,1],[120.5,199,1],[46,32,.62],[248,34,.62],[322,30,.62],[236,214,.62],[318,218,.62],[205,104,.55],[205,160,.55]];
const SONG_BOX = {x:259, y:86, w:84, h:98};
let miniSeen = null, miniOut = false;
function miniSVG(){
  const ins = inputsOf().slice(0, SPOTS.length);
  const fresh = miniSeen ? ins.filter(n => !miniSeen.has(n.id)).map(n => n.id) : [];
  miniSeen = new Set(ins.map(n => n.id));
  const out = !!board.now, drawIn = out && !miniOut;
  miniOut = out;
  const boxes = ins.map((n, i) => {
    const m = MINI[n.type] || MINI.song, [cx, cy, k] = SPOTS[i];
    return {n, m, x:cx - m.w * k / 2, y:cy - m.h * k / 2, w:m.w * k, h:m.h * k};
  });
  const defs = Object.entries(MINI).map(([t, m]) => `<linearGradient id="mg-${t}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.c[0]}"/><stop offset="1" stop-color="${m.c[1]}"/></linearGradient>`).join('')
    + `<radialGradient id="mg-out" cx="0" cy="0" r="1.4"><stop offset="0" stop-color="#BD2FA9"/><stop offset=".25" stop-color="#CD4EBC"/><stop offset=".5" stop-color="#DC6CCF"/><stop offset="1" stop-color="#FBA9F4"/></radialGradient>`;
  const S = SONG_BOX, tx = S.x, ty = S.y + S.h / 2;
  const lines = out ? boxes.map(b => {
    const x1 = b.x + b.w, y1 = b.y + b.h / 2, c = Math.max(30, (tx - x1) * .5);
    return `<path class="${drawIn ? 'in' : ''}" pathLength="1" d="M${x1.toFixed(1)} ${y1.toFixed(1)}C${(x1 + c).toFixed(1)} ${y1.toFixed(1)}, ${(tx - c).toFixed(1)} ${ty}, ${tx} ${ty}" stroke="${b.m.c[1]}"/>`;
  }).join('') : '';
  const rects = boxes.map(b => `<rect class="${fresh.includes(b.n.id) ? 'new' : ''}" x="${b.x.toFixed(1)}" y="${b.y.toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.h.toFixed(1)}" rx="10" fill="url(#mg-${MINI[b.n.type] ? b.n.type : 'song'})"/>`).join('');
  const song = out ? `<g class="mini-out${drawIn ? ' new' : ''}"><rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="10" fill="url(#mg-out)"/>
    <image href="${D}preview-disc.svg" x="${S.x + 6}" y="${S.y + 13}" width="72" height="72"/></g>` : '';
  return `<svg class="dp-mini-art" viewBox="0 0 362 245" aria-hidden="true"><defs>${defs}</defs><g class="mini-lines">${lines}</g>${rects}${song}</svg>`;
}
function outCard(o){
  if (extracting) return `<div class="dp-out finding" role="status"><div class="cov"><span class="glow"></span><img class="disc" src="${D}extracting-disc.svg" alt=""><span class="sq"></span></div>
    <p class="t-body">Extracting...</p><img class="dots" src="assets/dots-three.svg" alt=""></div>`;
  return `<div class="dp-out${o.fresh ? ' fresh' : ''}"><div class="cov"><span class="glow"></span><img class="disc" src="${D}vinyl.svg" alt=""><img class="art" src="${o.img}" alt=""></div>
    <div class="nm"><p class="t-body">${esc(o.title)}</p><p class="t-caption">${esc(o.artist)}</p></div>
    <button class="more" data-omenu aria-label="More options for ${esc(o.title)}"><img src="assets/dots-three.svg" alt=""></button></div>`;
}
/* Inputs (Figma 1298:18952 → 1301:31675): justified rows inside a roughly square box. With a few inputs the tiles
   are big and keep their titles + "…"; as more are added every tile shrinks, titles drop away once a tile is small,
   and tapping any tile opens its Edit / Delete menu. */
const ASPECT = {photo:1, video:1, song:1, audio:4.1, text:3.6};
const GRID_W = 362, CAP_MIN = 130;   // tiles shorter than this lose their titles
function gridRows(ins){
  const n = ins.length, gap = n > 3 ? 4 : 16;
  // past three inputs, audio clips pair up into a stack of two pills that shares one cell (Figma 1301:31675)
  const cells = [];
  ins.forEach(m => {
    if (n > 3 && m.type === 'audio'){
      const open = cells.find(c => c.stack && c.items.length < 2);
      if (open) open.items.push(m); else cells.push({stack:true, items:[m]});
    } else cells.push({items:[m]});
  });
  const asp = cells.map(c => c.stack ? (c.items.length === 2 ? 2.1 : ASPECT.audio) : (ASPECT[c.items[0].type] || 1));
  const N = cells.length;
  const rowH = (i, j) => (GRID_W - gap * (j - i - 1)) / asp.slice(i, j).reduce((a, b) => a + b, 0);
  // keep the order; pick the row breaks whose heights sit closest to an ideal row height
  const layout = ideal => {
    const best = [{cost:0, prev:-1}];
    for (let j = 1; j <= N; j++){
      best[j] = {cost:Infinity, prev:0};
      for (let i = 0; i < j; i++){ const c = best[i].cost + Math.log(rowH(i, j) / ideal) ** 2; if (c < best[j].cost) best[j] = {cost:c, prev:i}; }
    }
    const rows = []; for (let j = N; j > 0; j = best[j].prev) rows.unshift([best[j].prev, j]);
    const hs = rows.map(([i, j]) => Math.min(175, rowH(i, j)));
    return {rows, hs, total:hs.reduce((a, b) => a + b, 0) + gap * (rows.length - 1)};
  };
  // exactly r rows, each as close as possible to an even share of a square box
  const layoutRows = r => {
    const target = (GRID_W - gap * (r - 1)) / r;
    const best = Array.from({length:N + 1}, () => Array(r + 1).fill(null));
    best[0][0] = {cost:0, prev:-1};
    for (let k = 1; k <= r; k++) for (let j = k; j <= N; j++) for (let i = k - 1; i < j; i++){
      if (!best[i][k - 1]) continue;
      const c = best[i][k - 1].cost + Math.log(rowH(i, j) / target) ** 2;
      if (!best[j][k] || c < best[j][k].cost) best[j][k] = {cost:c, prev:i};
    }
    const rows = []; for (let j = N, k = r; k > 0; k--){ const i = best[j][k].prev; rows.unshift([i, j]); j = i; }
    const hs = rows.map(([i, j]) => Math.min(175, rowH(i, j)));
    return {rows, hs, total:hs.reduce((x, y) => x + y, 0) + gap * (rows.length - 1)};
  };
  // a few inputs keep their natural size; past three, pick the row count whose box is closest to square
  let L = layout(175);
  if (n > 3){
    L = null;
    for (let r = 1; r <= N; r++){ const t = layoutRows(r); if (!L || Math.abs(t.total - GRID_W) < Math.abs(L.total - GRID_W)) L = t; }
  }
  const rows = L.rows.map(([i, j], r) => cells.slice(i, j).map((c, k) => {
    const h = L.hs[r], w = h * asp[i + k];
    return c.stack && c.items.length === 2
      ? {stack:true, w, h, tiles:c.items.map(m => ({n:m, w, h:(h - gap) / 2}))}
      : {n:c.items[0], w, h};
  }));
  // titles go once the tiles get small — for the whole grid, so it reads as one mosaic
  const all = rows.flat().flatMap(c => c.stack ? c.tiles : [c]);
  const caps = all.every(t => t.h >= CAP_MIN);
  all.forEach(t => { t.caps = caps; });
  return {gap, rows};
}
function inputsHTML(ins){
  const {gap, rows} = gridRows(ins);
  return `<div class="dp-grid" style="--gap:${gap}px">${rows.map(r => `<div class="dp-row">${r.map(c => c.stack
    ? `<div class="dp-stack" style="width:${c.w.toFixed(1)}px">${c.tiles.map(tileHTML).join('')}</div>` : tileHTML(c)).join('')}</div>`).join('')}</div>`;
}
const audioBars = w => Math.max(10, Math.floor((w - 24) / 4));
function tileHTML({n, w, h, caps}){
  const size = `style="width:${w.toFixed(1)}px"`, box = `style="height:${h.toFixed(1)}px"`;
  const name = n.type === 'text' ? 'text snippet' : n.title + (EXT[n.type] || '');
  const cap = caps ? `<div class="cap"><p class="t-caption" data-name="${n.id}">${esc(name)}</p><button class="more" data-imenu="${n.id}" aria-label="More options"><img src="assets/dots-three.svg" alt=""></button></div>` : '';
  const small = h < 90 ? ' sm' : '';
  let inner;
  if (n.type === 'photo' || n.type === 'video') inner = `<div class="ph${small}" ${box}><img src="${n.img}" alt=""><span class="fade ${n.type}"></span>${n.type === 'video' ? `${sym(`${D}ph-play.svg`, 'vplay')}${h >= 90 ? `<span class="t-caption dur">${fmt(n.dur || 72)}</span>` : ''}` : ''}</div>`;
  else if (n.type === 'audio'){
    const bars = audioBars(w), playing = pp && pp.id === n.id;
    inner = `<div class="aud${h < 80 ? ' pill' : ''}" ${box} data-bars="${bars}">${waveWide(n.pos || 0, bars)}<div class="row"><button class="aplay" data-aplay="${n.id}" aria-label="Play ${esc(n.title)}">${sym(`${D}ph-${playing ? 'pause' : 'play'}.svg`)}</button><span class="t-caption">${fmt(playing ? (n.pos || 0) * n.dur : n.dur)}</span></div></div>`;
  }
  else if (n.type === 'text') inner = `<div class="txt${small}" ${box}><p class="quote">“</p><p class="t-body">${esc(n.text)}</p>${n.sub && h >= 90 ? `<p class="t-caption">${esc(n.sub)}</p>` : ''}</div>`;
  else inner = `<div class="ph song${n.cd ? ' cd' : ''}" ${box}>${n.cd ? `<span class="disc"><img src="${n.img}" alt=""></span>` : `<img src="${n.img}" alt="">`}</div>`;
  return `<div class="dp-in${caps ? '' : ' nocap'}" data-in="${n.id}" ${size} role="button" tabindex="0" aria-label="${esc(name)}: options">${inner}${cap}</div>`;
}
function histRow(o, i){
  const isNow = board.now && board.now.title === o.title && board.now.at === o.at;
  return `<div class="dp-hrow${isNow ? ' cur' : ''}"><img class="art" src="${o.img}" alt="">
    <div class="nm"><p class="t-body">${esc(o.title)}</p><p class="t-caption">${esc(o.artist)}</p></div>
    <div class="meta"><p class="t-caption">${ago(o.at)}</p><p class="t-caption grey">${esc(o.counts)}</p></div>
    <button class="more" data-hmenu="${i}" aria-label="More options for ${esc(o.title)}"><img src="assets/dots-three.svg" alt=""></button></div>`;
}
function renderProj(force){
  if (!force && proj.classList.contains('offright') && current !== proj) return;
  const ins = inputsOf(), o = board.now;
  const top = proj.scrollTop;
  // Night Drive follows its own frame (1298:18952): "- draft" title, add photo / video / audio under the inputs
  const nd = cur.id === 'nightdrive';
  const adds = nd ? `<div class="dp-adds below">
      <button class="dp-add a-media" data-add="photo"><span class="t-body">+ add photo</span></button>
      <button class="dp-add a-text" data-add="video"><span class="t-body">+ add video</span></button>
      <button class="dp-add a-audio" data-add="audio"><span class="t-body">+ add audio</span></button></div>`
    : `<div class="dp-adds">
      <button class="dp-add a-media" data-add="media"><span class="t-body">+ add media</span></button>
      <button class="dp-add a-text" data-add="text"><span class="t-body">+ add text</span></button>
      <button class="dp-add a-audio" data-add="audio"><span class="t-body">+ add audio</span></button></div>`;
  proj.innerHTML = `
  <div class="nd-head"><button class="back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button><p class="t-header">${esc(cur.name)}${nd ? '<span class="dim"> - draft</span>' : ''}</p></div>
  <button class="dp-mini" data-full aria-label="Open the full board"><span class="nd-dots"></span>${miniSVG()}</button>
  ${extracting || o ? `<section class="dp-sec dp-outsec">
      <div class="dp-sh"><p class="t-header">Sound output</p><button class="dp-shuffle" data-shuffle aria-label="Shuffle for another song" ${extracting ? 'disabled' : ''}><img src="${D}shuffle.svg" alt=""></button></div>
      ${outCard(o)}</section>`
    : `<button class="dp-discover" data-discover ${ins.length ? '' : 'disabled'}><img src="${D}music-notes-${ins.length ? 'on' : 'off'}.svg" alt=""><span class="t-body">Discover a song</span></button>`}
  <section class="dp-sec">
    <div class="dp-sh"><p class="t-header">Inputs</p><p class="t-body">${ins.length}/${MAX_NODES} used</p></div>
    ${nd ? '' : adds}
    ${ins.length ? inputsHTML(ins) : ''}
    ${nd ? adds : ''}
  </section>
  <section class="dp-sec dp-hist">
    <div class="dp-sh"><p class="t-header">Output history</p></div>
    ${board.outputs.length ? board.outputs.map(histRow).reverse().join('')
      : `<div class="dp-hrow empty"><span class="art"></span><p class="t-body grey">No songs discovered</p><img class="dots" src="assets/dots-three.svg" alt=""></div>`}
  </section>`;
  proj.scrollTop = top;
  if (o) delete o.fresh;
}

function extract(){
  if (extracting) return;
  if (!inputsOf().length){ note('Add an input first'); return; }
  stopProjAudio();
  extracting = true; renderProj();
  clearTimeout(extractT);
  extractT = setTimeout(() => {
    extracting = false;
    const s = nextOutput();
    recordOutput(s, inputsOf());
    board.now.fresh = true;
    linkOutput(board.now);
    renderProj();
  }, 2600);
}
// the board mirrors the preview (Figma 1298:23596): one song node on the right, an output noodle from every input.
// The first extraction adds it; shuffles and restores swap the song in place.
function linkOutput(o){
  render();   // lay the (hidden) board out so new spots can be measured
  let song = board.nodes.find(n => n.outNode) || board.nodes.find(n => n.type === 'song' && n.generated && board.edges.some(e => e.to === n.id && e.kind === 'output'));
  const ins = inputsOf();
  if (!song){
    // first song: lay the board out the way the preview shows it — inputs in their spots on the left, the song on the right
    const at = (cx, cy) => ({x:cx * 1.05 - 40, y:cy * 2.3 + 130});
    const placed = [];
    ins.slice(0, SPOTS.length).forEach((n, i) => {
      const b = box(n.id) || {w:149, h:149}, c = at(SPOTS[i][0], SPOTS[i][1]);
      const p = spotNear(c.x - b.w / 2, c.y - b.h / 2, b.w, b.h, board.nodes.map(m => m.id), placed);
      n.x = p.x; n.y = p.y; placed.push({x:p.x, y:p.y, w:b.w, h:b.h});
    });
    const [w, h] = SIZE.song, c = at(SONG_BOX.x + SONG_BOX.w / 2, SONG_BOX.y + SONG_BOX.h / 2);
    const p = spotNear(c.x - w / 2 + 30, c.y - h / 2, w, h, board.nodes.map(m => m.id), placed);
    song = {id:`n${++board.seq}`, type:'song', x:p.x, y:p.y, cd:false, generated:true};
    board.nodes.push(song);
  }
  Object.assign(song, {title:o.title, sub:o.artist, img:o.img, outNode:true, fresh:true});
  ins.forEach(n => {
    if (!board.edges.some(e => e.from === n.id && e.to === song.id)) board.edges.push({id:`e${++board.seq}`, from:n.id, to:song.id, kind:'output'});
  });
  render(); persist();
}

// audio inputs play right on the project page
let pp = null;
function stopProjAudio(){
  if (!pp) return;
  cancelAnimationFrame(pp.raf); stopSynth(pp.synth);
  const id = pp.id; pp = null; paintProjAudio(id);
}
function paintProjAudio(id){
  const n = board.nodes.find(m => m.id === id), el = proj.querySelector(`[data-in="${id}"]`);
  if (!n || !el) return;
  el.querySelector('.wave-row').outerHTML = waveWide(n.pos || 0, +el.querySelector('.aud').dataset.bars || 80);
  el.querySelector('.aplay .sym').style.setProperty('--i', `url(${D}ph-${pp && pp.id === id ? 'pause' : 'play'}.svg)`);
  el.querySelector('.row .t-caption').textContent = fmt(pp && pp.id === id ? (n.pos || 0) * n.dur : n.dur);
}
function projPlay(id){
  const same = pp && pp.id === id; stopProjAudio(); if (same) return;
  const n = board.nodes.find(m => m.id === id); if (!n) return;
  if ((n.pos || 0) >= .999) n.pos = 0;
  pp = {id, last:performance.now(), synth:startSynth()};
  const tick = now => {
    if (!pp || pp.id !== id) return;
    n.pos = Math.min(1, (n.pos || 0) + (now - pp.last) / 1000 / n.dur); pp.last = now;
    if (n.pos >= 1){ n.pos = 0; stopProjAudio(); return; }
    paintProjAudio(id); pp.raf = requestAnimationFrame(tick);
  };
  paintProjAudio(id); pp.raf = requestAnimationFrame(tick);
}

/* ---------- pop-up menus (Figma 1176:7278 + 1211:10511) ---------- */
const menu = document.createElement('div');
menu.className = 'dp-menuwrap';
app.append(menu);
let menuFor = null;
function openMenu(btn, items, ctx){
  menuFor = ctx;
  menu.innerHTML = `<div class="dp-menu" role="menu">${items.map(([act, icon, label]) =>
    `<button role="menuitem" data-act="${act}">${sym(D + icon)}<span class="t-body">${label}</span></button>`).join('')}</div>`;
  const ar = app.getBoundingClientRect(), s = ar.width / 402, r = btn.getBoundingClientRect();
  const m = menu.firstElementChild;
  menu.classList.add('on');
  const h = m.offsetHeight, H = ar.height / s;
  let top = (r.bottom - ar.top) / s + 6;
  if (top + h > H - 96) top = (r.top - ar.top) / s - h - 6;
  m.style.top = `${top}px`;
  m.style.right = `${Math.max(12, 402 - (r.right - ar.left) / s)}px`;
}
function closeMenu(){ menu.classList.remove('on'); menuFor = null; }
menu.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'), ctx = menuFor;
  closeMenu();
  if (!b || !ctx) return;
  const act = b.dataset.act;
  if (ctx.out != null){
    const o = ctx.out === 'now' ? board.now : board.outputs[ctx.out];
    if (act === 'restore'){ board.now = {...o, fresh:true}; linkOutput(board.now); renderProj(); proj.scrollTo({top:0, behavior:'smooth'}); note(`Restored “${o.title}”`, `${D}ph-arrow-counter-clockwise.svg`); }
    if (act === 'playlist') note(`Added “${o.title}” to a playlist`, `${D}ph-plus.svg`);
    if (act === 'save') note(`Saved “${o.title}” to your collection`, `${D}ph-heart.svg`);
    if (act === 'node'){
      const ids = addNodes([{type:'song', title:o.title, sub:o.artist, img:o.img, cd:false}]);
      if (ids.length){ renderProj(); note(`Took “${o.title}” to the board`, `${D}ph-flow-arrow.svg`); }
    }
    return;
  }
  const n = board.nodes.find(m => m.id === ctx.node); if (!n) return;
  if (act === 'delete'){
    if (pp && pp.id === n.id) stopProjAudio();
    board.nodes = board.nodes.filter(m => m.id !== n.id);
    board.edges = board.edges.filter(x => x.from !== n.id && x.to !== n.id);
    render(); persist(); renderProj(); note('Input deleted', `${D}ph-trash.svg`);
  }
  if (act === 'edit'){
    if (n.type === 'text'){ flow = {kind:'text', from:'proj', sel:new Set(), q:''}; openText(n); return; }
    rename(n);
  }
});
menu.addEventListener('pointerdown', e => { if (e.target === menu) closeMenu(); });

// Edit on a photo / video / audio / song: rename it in place
function rename(n){
  let p = proj.querySelector(`[data-name="${n.id}"]`);
  if (!p){   // small tiles have no title line: edit it in a strip laid over the tile's bottom edge
    const tile = proj.querySelector(`[data-in="${n.id}"]`); if (!tile) return;
    tile.insertAdjacentHTML('beforeend', '<div class="cap over"><p></p></div>');
    p = tile.querySelector('.cap.over p');
  }
  const ext = EXT[n.type] || '';
  p.outerHTML = `<label class="dp-rename"><input type="text" value="${esc(n.title)}" aria-label="Title"><span class="t-caption">${ext}</span></label>`;
  const inp = proj.querySelector('.dp-rename input');
  inp.focus(); inp.select();
  const done = () => { const v = inp.value.trim(); if (v && v !== n.title){ n.title = v; render(); persist(); } renderProj(); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape'){ inp.value = n.title; inp.blur(); } });
  inp.addEventListener('blur', done, {once:true});
}

proj.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-back]')) return cur.saved === false ? askSave() : backToLanding();
  if (t.closest('[data-full]')) return open();
  if (t.closest('[data-discover]') || t.closest('[data-shuffle]')) return extract();
  const add = t.closest('[data-add]');
  if (add){
    const k = add.dataset.add;
    if (k === 'photo' || k === 'video'){ openPicker('media', 'proj'); flow.only = k; renderPicker(); return; }
    return openPicker(k, 'proj');
  }
  const ap = t.closest('[data-aplay]');
  if (ap) return projPlay(ap.dataset.aplay);
  const om = t.closest('[data-omenu]');
  if (om) return openMenu(om, [['playlist','ph-plus.svg','Add to playlist'], ['save','ph-heart.svg','Save to collection'], ['node','ph-flow-arrow.svg','Take to node']], {out:'now'});
  const hm = t.closest('[data-hmenu]');
  if (hm) return openMenu(hm, [['restore','ph-arrow-counter-clockwise.svg','Restore output'], ['playlist','ph-plus.svg','Add to playlist'], ['save','ph-heart.svg','Save to collection'], ['node','ph-flow-arrow.svg','Take to node']], {out:+hm.dataset.hmenu});
  // "…" on a titled tile, or a tap anywhere on a tile, opens its Edit / Delete menu
  const im = t.closest('[data-imenu]') || t.closest('.dp-in');
  if (im){
    const id = im.dataset.imenu || im.dataset.in, anchor = im.matches('.dp-in') ? im.firstElementChild : im;
    return openMenu(anchor, [['edit','ph-pencil-simple.svg','Edit'], ['delete','ph-trash.svg','Delete']], {node:id});
  }
});

function openProject(id){
  select(id);
  miniSeen = null; miniOut = !!board.now;
  stopProjAudio(); clearTimeout(extractT); extracting = false;
  render();                       // the full board lays out (hidden) so the preview can measure it
  proj.setAttribute('aria-label', `${cur.name} project`);
  proj.style.transition = 'none'; proj.classList.remove('offleft'); proj.classList.add('offright'); proj.offsetHeight; proj.style.transition = '';
  renderProj(true); proj.scrollTop = 0;
  push(proj);
}
/* leaving a new project: keep it as a draft, or throw it away */
const saveDlg = document.createElement('div');
saveDlg.className = 'nb-overlay dp-save'; saveDlg.setAttribute('role', 'dialog'); saveDlg.setAttribute('aria-label', 'Save draft');
app.append(saveDlg);
function askSave(){
  stopProjAudio(); closeMenu();
  saveDlg.innerHTML = `<div class="save-pop"><p class="t-header">Save draft?</p>
    <p class="t-caption grey">Keep “${esc(cur.name)}” in your drafts to pick it up later.</p>
    <div class="row"><button class="btn btn-secondary t-body" data-nosave>Don’t save</button><button class="btn btn-primary t-body" data-save>Save</button></div></div>`;
  saveDlg.classList.add('on');
}
saveDlg.addEventListener('click', e => {
  if (e.target === saveDlg){ saveDlg.classList.remove('on'); return; }   // tap outside: stay on the project
  if (e.target.closest('[data-save]')){
    cur.saved = true; saveList(); persist();
    saveDlg.classList.remove('on'); backToLanding(); note(`Saved “${cur.name}” to your drafts`, `${D}ph-check.svg`);
  } else if (e.target.closest('[data-nosave]')){
    const gone = cur;
    boards = boards.filter(b => b !== gone); saveList();
    try { localStorage.removeItem(KEY(gone.id)); } catch (_) {}
    saveDlg.classList.remove('on'); backToLanding();
  }
});
function backToLanding(){
  stopProjAudio(); closeMenu();
  proj.classList.add('offright');
  landing.classList.remove('offleft');
  current = landing;
  setTimeout(() => proj.classList.remove('on-top'), 600);
  renderLanding();
}

/* ================= FULL BOARD: open / back ================= */
function open(id){
  if (id) select(id);
  stopProjAudio(); closeMenu(); aToast.classList.remove('on');
  $v('#nb-name').textContent = cur.name;
  view.setAttribute('aria-label', `${cur.name} node board`);
  ui.sel = null; ui.tool = null; ui.del.clear(); ui.pan = {x:0, y:0}; ui.z = 1; applyPan();
  view.classList.remove('offright');
  render();
  // a brand-new project's board starts with "Add an element" (Figma 982:11175)
  if (!board.nodes.length) setTimeout(() => { if (!view.classList.contains('offright') && !board.nodes.length) openAdd(null); }, 600);
}
function close(instant){
  stopAudio(); addOv.classList.remove('on'); closePicker();
  if (instant){ view.style.transition = 'none'; requestAnimationFrame(() => { view.style.transition = ''; }); }
  view.classList.add('offright');
  persist(); renderProj(); renderLanding();
}
$v('#nb-back').addEventListener('click', () => {
  if (ui.tool){ ui.tool = null; ui.del.clear(); }
  close();
});

/* ================= LANDING (Figma 982:12783) ================= */
const landing = document.createElement('section');
landing.className = 'view nd-view ds-view offright'; landing.id = 'view-nodes'; landing.setAttribute('aria-label', 'Deep Search');
document.querySelector('#app .tabbar').before(landing);

const POPULAR = [
  {img:D + 'pop-nostalgia.jpg', title:'nostalgia', tags:['2010s','Happy','Pop'], fade:'247,84,114'},
  {img:D + 'pop-beach.jpg', title:'da beach', tags:['House','Dance','Electric'], fade:'88,88,208'},
  {img:D + 'pop-spring.jpg', title:'spring', tags:['Indie','Acoustic','Folklore'], fade:'189,47,169'},
];
const popCard = p => `<div class="ds-pc"><div class="ph"><img src="${p.img}" alt=""><span class="fade" style="--f:${p.fade}"></span>
  <span class="who"><img src="${D}pfp.png" alt=""><span class="t-caption">supanova</span></span></div>
  <div class="txt"><p class="t-body">${esc(p.title)}</p><div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div></div></div>`;

// slide 1: a little board — text, photo and audio; a noodle draws itself from the audio to the song (Figma 1298:12505)
const SLIDE_BARS = BARS.map(h => `<i style="height:${(h * .65).toFixed(1)}px"></i>`).join('');
const S1_DRAW = 'M158.3 208.4C221 208.4 217 127 279 127';
// slide 2: a found song, shuffle, "Extracting…", then the next song lands
const s2Card = st => st === 'gen'
  ? `<div class="dp-out finding"><div class="cov"><span class="glow"></span><img class="disc" src="${D}extracting-disc.svg" alt=""><span class="sq"></span></div><p class="t-body">Extracting...</p><img class="dots" src="assets/dots-three.svg" alt=""></div>`
  : (o => `<div class="dp-out${st === 'b' ? ' fresh' : ''}"><div class="cov"><span class="glow"></span><img class="disc" src="${D}vinyl.svg" alt=""><img class="art" src="${o.img}" alt=""></div>
      <div class="nm"><p class="t-body">${esc(o.title)}</p><p class="t-caption">${esc(o.artist)}</p></div><img class="dots" src="assets/dots-three.svg" alt=""></div>`)(OUT_POOL[st === 'b' ? 1 : 0]);
// slide 3: the popular project cards, stepped down the diagonal as in the wireframe (Figma 1298:13494), drifting along it
const CASES = [...POPULAR, ...POPULAR];
const SLIDES = [
  {title:'Extract sounds from photos, videos, text or audio', art:`
    <svg class="s1-lines" viewBox="0 0 362 383" aria-hidden="true">
      <path d="M89.4 86C116 86 112 -2 139 -2"/><path d="M236.2 -2C259 -2 257 127 279 127"/><path class="draw" pathLength="1" d="${S1_DRAW}"/></svg>
    <div class="s1-text"><p class="q">“</p><p>driving at night puts you in some type of mood brooo</p><p class="s">- some dude</p></div>
    <div class="s1-photo"><img src="${D}highway.png" alt=""><span></span><p>mmm highway</p></div>
    <div class="s1-audio"><div class="bars">${SLIDE_BARS}<img src="${A}scrubber.svg" alt=""></div><p><span>crashing out</span><span>1:12</span></p></div>
    <span class="s1-tip" style="offset-path:path('${S1_DRAW}')"></span>
    <div class="s1-song"><div class="cd"><img src="${D}cd.png" alt=""></div><p>Heartbeat</p><p class="s">Childish Gambino</p></div>`},
  {title:'Shuffle song outputs to find the right sound', art:`
    <span class="blob b1"></span><span class="blob b2"></span>
    <div class="s2-card"><div class="s2-slot">${s2Card('a')}</div>
      <span class="s2-shuffle"><img src="${D}shuffle.svg" alt=""></span></div>`},
  {title:'View what others have discovered', art:`
    <div class="s3-casc">${CASES.map((p, i) => `<div class="s3-case" data-c="${i}">${popCard(p)}</div>`).join('')}</div>`},
];
let showcase = true, featAt = 0, popAt = 1, featLoop = null, popLoop = null;

const THUMB = {
  nightdrive:`<svg class="nd-art" viewBox="0 0 174 156" aria-hidden="true"><path d="M66 46C76.36 46 87.33 82 105 82" stroke="#BD2FA9" stroke-opacity=".9" fill="none"/><path d="M66 45.93C87.31 47.84 81.73 9 100 9" stroke="#8B4BE6" stroke-opacity=".9" fill="none"/>
    <rect x="12" y="7" width="51" height="67" rx="10" fill="#BD2FA9"/><rect x="103" y="-13" width="51" height="51" rx="10" fill="#8B4BE6"/><rect x="108" y="64" width="79" height="32" rx="10" fill="#E13F5D"/></svg>`,
};
const copies = (list, fn) => [0, 1, 2].map(c => list.map((x, k) => fn(x, k, c)).join('')).join('');
function renderLanding(){
  featLoop?.stop(); popLoop?.stop();
  landing.innerHTML = `
    ${showcase ? `<div class="ds-show" role="region" aria-roledescription="carousel" aria-label="What Deep Search does">
      <div class="ds-track">${copies(SLIDES, (s, k, c) => `<div class="ds-slide s${k + 1}" data-k="${k}" role="group" aria-roledescription="slide" aria-label="${k + 1} of 3"${c === 1 ? '' : ' aria-hidden="true"'}><span class="nd-dots"></span><span class="glowb"></span>
        <div class="art">${s.art}</div><span class="fadeb"></span><p class="t-header ttl">${s.title}</p></div>`)}</div>
      <div class="ds-ind">${SLIDES.map((_, i) => `<button data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>
      <button class="ds-x" data-dismiss aria-label="Dismiss feature tour">${sym(`${D}ph-x.svg`)}</button>
    </div>` : ''}
    <section class="ds-sec ds-popsec"><p class="t-header">Popular projects</p>
      <div class="ds-pop" role="region" aria-roledescription="carousel" aria-label="Popular projects"><div class="ds-poptrack">${copies(POPULAR, (p, k) => popCard(p).replace('class="ds-pc"', `class="ds-pc" data-k="${k}"`))}</div></div></section>
    <section class="ds-sec ds-draftsec"><p class="t-header">Drafts</p>
      <div class="nd-grid">
        ${boards.map(b => `<button class="nd-card${b.id === 'nightdrive' ? ' ds-tplcard' : ''}" data-board="${b.id}"><span class="nd-dots"></span>${THUMB[b.id] || miniThumb(b.id)}
          <span class="nd-txt"><span class="t-body-db">${esc(b.name)}</span><img src="assets/arrow-right-15.svg" alt=""></span>${b.id === 'nightdrive' ? '<span class="ds-tpl t-caption">Template</span>' : ''}</button>`).join('')}
        <button class="nd-card nd-new" data-new><span class="nd-dots"></span><span class="nd-txt"><i class="sym" style="--i:url(assets/community/ph/plus.svg)"></i><span class="t-body">New project</span></span></button>
      </div></section>`;
  if (showcase) featLoop = Loop(landing.querySelector('.ds-show'), landing.querySelector('.ds-track'), 3, 362, 0, featAt, k => { featAt = k; playSlide(k); });
  popLoop = Loop(landing.querySelector('.ds-pop'), landing.querySelector('.ds-poptrack'), 3, 314, 52, popAt, k => { popAt = k; });
  layoutCases();
}
// a draft's card art: its blocks, small
function miniThumb(id){
  let b; try { b = JSON.parse(localStorage.getItem(KEY(id))); } catch (_) {}
  const nodes = (b && b.nodes || []).filter(n => n.type !== 'ph').slice(0, 4);
  if (!nodes.length) return '';
  const x0 = Math.min(...nodes.map(n => n.x)), y0 = Math.min(...nodes.map(n => n.y));
  return `<svg class="nd-art" viewBox="0 0 174 156" aria-hidden="true">${nodes.map(n => {
    const [w, h] = SIZE[n.type] || [149, 149];
    return `<rect x="${12 + (n.x - x0) * .32}" y="${8 + (n.y - y0) * .32}" width="${w * .32}" height="${h * .32}" rx="8" fill="${COLORS[n.type] || COLORS.song}"/>`;
  }).join('')}</svg>`;
}

/* One-way infinite carousel: rests 5s, then the next card slides in from the right — always forward.
   The track holds three copies; once it passes the middle copy it quietly jumps back, so it never rewinds. */
const landingShown = () => current === landing && !landing.classList.contains('offright');
function Loop(root, track, n, step, base, start, onShow){
  const L = {i:n + start, dead:false, timer:0, fix:0, drag:null};
  const place = instant => {
    if (instant) track.style.transition = 'none';
    track.style.transform = `translateX(${base - L.i * step}px)`;
    if (instant){ track.offsetHeight; track.style.transition = ''; }
  };
  L.real = () => ((L.i % n) + n) % n;
  const queue = () => {
    clearTimeout(L.timer); if (L.dead) return;
    L.timer = setTimeout(() => { if (L.dead) return; if (landingShown() && !L.drag) L.go(L.i + 1); else queue(); }, 5000 + 600);
  };
  L.go = (k, instant) => {
    L.i = k; place(instant);
    clearTimeout(L.fix);
    if (L.i >= 2 * n || L.i < n) L.fix = setTimeout(() => { L.i = n + L.real(); place(true); }, 640);
    root.querySelectorAll('.ds-ind button').forEach((b, j) => b.classList.toggle('on', j === L.real()));
    onShow && onShow(L.real());
    queue();
  };
  L.stop = () => { L.dead = true; clearTimeout(L.timer); clearTimeout(L.fix); };
  L.to = k => L.go(L.i + ((k - L.real() + n) % n));   // the dots also only ever move forward
  // swipe by hand (either way); it picks the automatic rhythm back up afterwards
  root.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || e.button > 0) return;
    L.drag = {x:e.clientX, s:root.getBoundingClientRect().width / root.offsetWidth, moved:false};
  });
  root.addEventListener('pointermove', e => {
    const d = L.drag; if (!d) return;
    const dx = (e.clientX - d.x) / d.s;
    if (!d.moved && Math.abs(dx) < 8) return;
    if (!d.moved){ d.moved = true; clearTimeout(L.fix); if (L.i >= 2 * n || L.i < n){ L.i = n + L.real(); } }
    track.style.transition = 'none';
    track.style.transform = `translateX(${base - L.i * step + dx}px)`;
  });
  const end = e => {
    const d = L.drag; if (!d) return; L.drag = null;
    track.style.transition = '';
    if (!d.moved) return;
    const dx = (e.clientX - d.x) / d.s;
    L.go(Math.abs(dx) > 50 ? L.i + (dx < 0 ? 1 : -1) : L.i);
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  L.go(L.i, true);
  return L;
}

// each feature slide plays its little motion whenever it comes into view (on every copy, so the loop's jump is invisible)
let s2T = [];
function playSlide(k){
  landing.querySelectorAll('.ds-slide').forEach(el => el.classList.remove('play'));
  s2T.forEach(clearTimeout); s2T = [];
  const els = [...landing.querySelectorAll(`.ds-slide[data-k="${k}"]`)];
  void landing.offsetWidth;
  els.forEach(el => el.classList.add('play'));
  if (k === 1){
    const set = st => els.forEach(el => { el.querySelector('.s2-slot').innerHTML = s2Card(st); el.classList.toggle('shuffling', st === 'gen'); });
    set('a');
    s2T.push(setTimeout(() => set('gen'), 1500), setTimeout(() => set('b'), 3500));
  }
}
// slide 3's cards drift by themselves, forever, one way, keeping the wireframe's angle
const CC = {x:49.2, y:55.9}, CS = {x:172.5, y:61.4};
let cf = 0, cLast = 0;
function layoutCases(){
  const n = CASES.length;
  landing.querySelectorAll('.s3-case').forEach(el => {
    const i = +el.dataset.c, k = ((i - cf) % n + n * 1.5) % n - n / 2;
    el.style.transform = `translate(${(CC.x + k * CS.x).toFixed(1)}px, ${(CC.y + k * CS.y).toFixed(1)}px) scale(.877)`;
    el.style.zIndex = 50 + Math.round(k * 10);
  });
}
function drift(now){
  const dt = Math.min(64, now - (cLast || now)); cLast = now;
  if (landingShown() && landing.querySelector('.s3-casc')){ cf += dt / 1000 * .2; layoutCases(); }
  requestAnimationFrame(drift);
}
requestAnimationFrame(drift);

landing.addEventListener('click', e => {
  const dot = e.target.closest('[data-slide]');
  if (dot) return featLoop?.to(+dot.dataset.slide);
  if (e.target.closest('[data-dismiss]')){
    const box = landing.querySelector('.ds-show');
    box.style.height = `${box.offsetHeight}px`; box.offsetHeight;
    box.classList.add('gone'); box.style.height = '0px';
    showcase = false; featLoop?.stop(); s2T.forEach(clearTimeout);
    setTimeout(() => box.remove(), 600);
    return;
  }
  const b = e.target.closest('[data-board]'); if (b) return openProject(b.dataset.board);
  if (e.target.closest('[data-new]')){
    let n = 1; const name = k => k === 1 ? 'New project' : `New project ${k}`;
    while (boards.some(x => x.name === name(n))) n++;
    const nb = {id:`b${Date.now().toString(36)}`, name:name(n), saved:false};   // asks to be saved on the way out
    boards.push(nb); saveList(); openProject(nb.id);
  }
});

function openDrafts(){
  renderLanding();
  landing.classList.remove('offleft');
  push(landing);
  if (!obSeen) setTimeout(obStart, 2000);   // first visit: a 2s beat on the page, then the walkthrough (obStart checks they're still here)
}

/* ================= FIRST-VISIT WALKTHROUGH =================
   Same look as Community's: the landing's Popular projects and Drafts first, then the template project's
   five steps (Figma 1289:6629), then back to the landing. */
const OBS = [
  {page:'landing', el:'.ds-popsec', text:'View projects made by other users to get inspiration!', side:'below'},
  {page:'landing', el:'.ds-draftsec', text:'All of your projects and drafts are saved here!', side:'above'},
  {page:'proj', el:'.dp-mini', text:'Your draft board', side:'below'},
  {page:'proj', el:'.dp-outsec', text:'Your sound output will be here. You can then like, save, or add it to your playlist', side:'below'},
  {page:'proj', el:'.dp-shuffle', text:'Option for you to discover different song outputs', side:'below'},
  {page:'proj', el:'.dp-adds', text:'Add the song’s input (images, videos, text, and audio)', side:'below'},
  {page:'proj', el:'.dp-hist', text:'You can review your past output here', side:'above'},
];
let obSeen = false, obi = -1;
const obEl = document.createElement('div');
obEl.className = 'cm-ob ds-ob'; obEl.setAttribute('role', 'dialog'); obEl.setAttribute('aria-label', 'Deep Search walkthrough');
obEl.innerHTML = `<svg class="dim" aria-hidden="true"><path fill-rule="evenodd"></path><rect class="cover" rx="10" ry="10"></rect><rect class="ring" rx="10" ry="10"></rect></svg>
  <div class="bub"><span class="tip"></span><p class="t-caption txt"></p><div class="ft"><p class="t-caption n"></p><button class="t-caption go" data-ob-next>Next</button></div></div>
  <button class="ob-skip t-body" data-ob-skip>Skip</button>`;
app.append(obEl);
const obPage = st => st.page === 'proj' ? proj : landing;
function obLayout(){
  if (obi < 0) return;
  const st = OBS[obi], t = obPage(st).querySelector(st.el); if (!t) return;
  const A = app.getBoundingClientRect(), k = A.width / 402, W = 402, H = A.height / k;
  const r = t.getBoundingClientRect(), pad = 4, rr = 10;
  // full-bleed rows (Popular projects) get a ring that stays inside the screen edges
  const x = Math.max(12, (r.left - A.left) / k - pad), y = (r.top - A.top) / k - pad;
  const w = Math.min(W - 12, (r.right - A.left) / k + pad) - x, h = r.height / k + pad * 2;
  const svg = obEl.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.querySelector('path').setAttribute('d', `M0 0H${W}V${H}H0Z M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`);
  svg.querySelectorAll('.ring, .cover').forEach(r => { r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h); });
  const bub = obEl.querySelector('.bub'), bh = bub.offsetHeight || 118;
  bub.style.top = `${st.side === 'above' ? y - 21 - bh : y + h + 21}px`;
  // small targets (shuffle) get the bubble tucked under them on the right; wide ones start near their left edge
  bub.style.left = `${Math.min(W - 201 - 20, Math.max(20, w < 80 ? x + w - 201 + 6 : x + (st.side === 'above' ? w - 201 - 18 : 4)))}px`;
  bub.classList.toggle('up', st.side !== 'above');
  bub.classList.toggle('left', w >= 80 && st.side !== 'above');
}
function settled(el, done){
  let last = el.scrollTop, still = 0, t0 = performance.now();
  const tick = now => {
    if (Math.abs(el.scrollTop - last) < .5) still++; else still = 0;
    last = el.scrollTop;
    if (still >= 5 || now - t0 > 1200) done(); else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
// one step at a time: fade out → (open the project) → scroll while hidden → fade the next step in
let obSeq = 0;
function obShow(i){
  const seq = ++obSeq, wasOn = obEl.classList.contains('on');
  obEl.classList.remove('on');
  setTimeout(() => {
    if (seq !== obSeq) return;
    obi = i;
    const st = OBS[i], pg = obPage(st);
    obEl.querySelector('.txt').textContent = st.text;
    obEl.querySelector('.n').innerHTML = `<b>${i + 1}</b>/<span>${OBS.length}</span>`;
    obEl.querySelector('.go').textContent = i === OBS.length - 1 ? 'OK' : 'Next';
    const opening = st.page === 'proj' && current !== proj;
    if (opening) openProject('nightdrive');
    setTimeout(() => {
      if (seq !== obSeq) return;
      const t = pg.querySelector(st.el); if (!t) return;
      const vr = pg.getBoundingClientRect(), tr = t.getBoundingClientRect(), k = vr.width / 402;
      const y = (tr.top - vr.top) / k + pg.scrollTop;
      pg.scrollTo({top:Math.max(0, (st.side === 'above' ? y - 330 : y - 140) * k), behavior:'smooth'});   // leaves the top clear for Skip
      settled(pg, () => { if (seq !== obSeq) return; obLayout(); requestAnimationFrame(() => { if (seq === obSeq) obEl.classList.add('on'); }); });
    }, opening ? 650 : 0);
  }, wasOn ? 600 : 0);
}
function obStart(){
  if (obSeen || current !== landing) return;
  obSeen = true; obEl.classList.add('live', 'shown'); obShow(0);
}
function obEnd(){ obi = -1; ++obSeq; obEl.classList.remove('on', 'shown'); setTimeout(() => { if (obi < 0) obEl.classList.remove('live'); }, 600); }
obEl.addEventListener('click', e => {
  // Skip ends the walkthrough wherever it is and lands back on the Deep Search page
  if (e.target.closest('[data-ob-skip]')){ obEnd(); if (current === proj) backToLanding(); landing.scrollTo({top:0, behavior:'smooth'}); return; }
  if (!e.target.closest('[data-ob-next]')) return;
  if (obi < OBS.length - 1) return obShow(obi + 1);
  obEnd();
  backToLanding(); landing.scrollTo({top:0, behavior:'smooth'});
});
[landing, proj].forEach(v => v.addEventListener('scroll', () => { if (obi >= 0 && obEl.classList.contains('on')) obLayout(); }, {passive:true}));
addEventListener('resize', () => { if (obi >= 0) obLayout(); });
document.addEventListener('click', e => { if (obi >= 0 && e.target.closest('.tabbar')) obEnd(); }, true);
// Deep Search tab (global nav): the landing is a tab root, so whatever was showing is dropped first (tab switches are instant)
function openTab(){
  landing.classList.add('tab-root');
  if (!view.classList.contains('offright')) close(true);
  closePicker(); closeMenu(); stopProjAudio();
  if (current === landing){ landing.scrollTo({top:0, behavior:'smooth'}); return; }
  if (current !== home){
    const sub = current;
    sub.style.transition = 'none'; sub.classList.add('offright'); sub.classList.remove('on-top');
    requestAnimationFrame(() => { sub.style.transition = ''; });
    home.classList.remove('offleft'); current = home;
  }
  proj.classList.add('offright'); proj.classList.remove('offleft', 'on-top');
  window.tonoProfile?.setTab('deep');
  landing.style.transition = 'none';
  openDrafts();
  requestAnimationFrame(() => requestAnimationFrame(() => { landing.style.transition = ''; }));
}

// entry point on Home: the Node Discovery card (older home) opens the landing
const tile = document.querySelector('.more .tile');
if (tile) tile.addEventListener('click', openDrafts);
// restart flow: back to the lock screen with a fresh tour
document.getElementById('restart')?.addEventListener('click', () => { close(true); closePicker(); closeMenu(); showcase = true; featAt = 0; popAt = 1; obSeen = false; obEnd(); });
document.fonts && document.fonts.ready.then(() => { if (!view.classList.contains('offright')) render(); });
renderLanding();

window.tonoNode = {open, close, openDrafts, openTab, openProject, get boards(){ return boards.map(b => ({...b})); }, get board(){ return board; }};
})();
