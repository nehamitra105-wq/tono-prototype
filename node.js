/* =========================================================
   NODE BOARD — "Night Drive" draft
   Opened from Home → Node Discovery. Toolbar replaces the nav bar.
   ========================================================= */
(() => {
const A = 'assets/node/';
const MAX_NODES = 10;
const STORE = 'tono.node.nightdrive.v1';
const COLORS = {song:'#BD2FA9', text:'#E13F5D', photo:'#5858D0', audio:'#AA43F4', video:'#F75472'};
const PH_COLORS = {song:'#BD2FA9', text:'#E13F5D', photo:'#AA43F4', audio:'#AA43F4', video:'#F75472'};
// bar heights from the hi-fi audio widget
const BARS = [22,28,18,36,22,18,42,36,28,28,18,22,28,18,28,28,18,22,28,18,22,28,18,36,28,36,36,22,28,42,22,18,28,18,42,22,36,28,28,28,18,28,18,22,18,36,36,22,28,22,18,28,18,42,42,22,28,42,22,18,28,18,42,22,36];
const WAVE_W = BARS.length + (BARS.length - 1) * 3;
const PHOTOS = Array.from({length:19}, (_, i) => `${A}p${String(i+1).padStart(2,'0')}.png`);
const AUDIO_LIB = [
  {title:'crashing out', dur:72},
  {title:'voice memo · 2am', dur:48},
  {title:'rain on the windshield', dur:125},
  {title:'humming in the car', dur:31},
];
const SONG_LIB = [
  ...(typeof SONGS !== 'undefined' ? SONGS : []).map(s => ({title:s.title, artist:s.artist, img:s.art})),
  ...(typeof TOP10 !== 'undefined' ? TOP10 : []).filter(r => r.img).map(r => ({title:r.t, artist:r.a, img:r.img})),
];
const NOUN = {photo:'photo', video:'video', song:'song', audio:'audio clip', text:'text snippet'};

const DEFAULT = () => ({
  seq: 10,
  nodes: [
    {id:'n1', type:'song',  x:17,  y:243, title:'song', sub:'artiste', img:A+'cd-art.png', cd:true},
    {id:'n2', type:'photo', x:272, y:175, title:'mmm highway', img:A+'highway.png'},
    {id:'n3', type:'text',  x:321, y:515, text:'driving at night puts you in some type of mood brooo', sub:'- some dude'},
    {id:'n4', type:'audio', x:-53, y:596, title:'crashing out', dur:72, pos:.2},
  ],
  edges: [
    {id:'e1', from:'n1', to:'n2', kind:'connector'},
    {id:'e2', from:'n1', to:'n3', kind:'connector'},
  ],
});

const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const snapshot = b => JSON.stringify({nodes:b.nodes.map(({pos, ...r}) => r), edges:b.edges});

let saved;
try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (_) {}
if (!saved || !saved.nodes) saved = DEFAULT();
let board = clone(saved);

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
    <h1 class="t-header">Night Drive<span> - draft</span></h1>
    <button class="trash" id="nb-trash" aria-label="Delete selected nodes" hidden disabled><i class="sym" style="--i:url(${A}ph-trash.svg)"></i></button>
  </div>
  <div class="nb-banner t-caption" id="nb-banner" role="status"></div>
  <div class="nb-toast t-body" id="nb-toast" role="status"><i class="sym"></i><span></span></div>
  <div class="nb-toolbar" role="toolbar" aria-label="Board tools">
    <button class="t1" id="tb-add" aria-label="Add a node"><img src="${A}tb-plus.svg" alt=""></button>
    <button class="t2" id="tb-noodle" aria-label="Noodle type: connector"><img src="${A}tb-flow.svg" alt=""></button>
    <button class="t3" id="tb-cut" aria-label="Cut noodles"><img src="${A}tb-scissors.svg" alt=""></button>
    <button class="t4" id="tb-edit" aria-label="Mass edit"><img src="${A}tb-pencil.svg" alt=""></button>
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

  <div class="nb-overlay" id="nb-save">
    <div class="save-pop" role="dialog" aria-label="Save changes">
      <p class="t-header">Save changes?</p>
      <p class="t-caption grey">You’ve made changes to Night Drive.</p>
      <div class="row">
        <button class="btn btn-secondary t-body" data-nosave>Don’t save</button>
        <button class="btn btn-primary t-body" data-save>Save</button>
      </div>
    </div>
  </div>

  <section class="nb-screen" id="nb-picker" aria-label="Choose media"></section>
  <section class="nb-screen" id="nb-detail" aria-label="Describe media"></section>`;
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

function nodeHTML(n){
  const cls = `nd${ui.sel === n.id ? ' sel' : ''}${ui.del.has(n.id) ? ' del' : ''}`;
  const pos = `style="left:${n.x}px;top:${n.y}px"`;
  switch (n.type){
    case 'song': return `<div class="${cls} nd-song${n.fresh ? ' fresh' : ''}" data-id="${n.id}" ${pos}>
        <div class="cd"><img class="${n.cd ? '' : 'cover'}" src="${n.img}" alt=""></div>
        <div class="meta"><p class="t-body">${esc(n.title)}</p><p class="t-caption">${esc(n.sub)}</p></div></div>`;
    case 'text': return `<div class="${cls} nd-text" data-id="${n.id}" ${pos}>
        <p class="quote">“</p><p class="t-body">${esc(n.text)}</p>${n.sub ? `<p class="t-caption">${esc(n.sub)}</p>` : ''}</div>`;
    case 'photo':
    case 'video': return `<div class="${cls} nd-${n.type}" data-id="${n.id}" ${pos}>
        <img src="${n.img}" alt=""><span class="fade"></span><p class="t-body">${esc(n.title)}</p></div>`;
    case 'audio': return `<div class="${cls} nd-audio" data-id="${n.id}" ${pos}>
        ${waveHTML(n.pos || 0)}
        <div class="audio-meta t-caption">
          <button class="play-mini" data-play aria-label="Play ${esc(n.title)}"><i class="sym" style="--i:url(${A}ph-${ui.playing && ui.playing.id === n.id ? 'pause' : 'play'}.svg)"></i></button>
          <span class="nm">${esc(n.title)}</span><span class="tm">${timeLabel(n)}</span>
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
    const onBoard = new Set(board.nodes.filter(m => m.type === 'song').map(m => m.title));
    const pool = SONG_LIB.filter(x => !onBoard.has(x.title));
    const s = (pool.length ? pool : SONG_LIB)[(board.seq * 7 + g.x) % (pool.length || SONG_LIB.length) | 0] || SONG_LIB[0];
    Object.assign(g, {type:'song', title:s.title, sub:s.artist, img:s.img, cd:false, generated:true, fresh:true});
    delete g.until; delete g.from;
    if (!view.classList.contains('offright')){ render(); settle(g.id); toast(`Generated “${s.title}”`, `${A}ph-waveform.svg`); }
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

$v('#tb-noodle').addEventListener('click', () => {
  ui.kind = ui.kind === 'connector' ? 'output' : 'connector';
  const b = $v('#tb-noodle');
  b.innerHTML = ui.kind === 'connector'
    ? `<img class="swap" src="${A}tb-flow.svg" alt="">`
    : `<i class="sym swap" style="--i:url(${A}ph-waveform.svg)"></i>`;
  b.setAttribute('aria-label', `Noodle type: ${ui.kind}`);
  toast(`Changed to ${ui.kind}`, ui.kind === 'connector' ? `${A}tb-flow.svg` : `${A}ph-waveform.svg`);
});
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

/* ================= MEDIA: pick → describe ================= */
const picker = $v('#nb-picker'), detail = $v('#nb-detail');
let flow = null;
const head = (title, okDisabled) => `
  <div class="fadetop"></div>${statusbar}
  <div class="scr-head"><button data-x aria-label="Close"><img src="${A}x.svg" alt=""></button>
  <p class="t-header">${title}</p><button class="ok" data-ok aria-label="Done" ${okDisabled ? 'disabled' : ''}><img src="${A}check.svg" alt=""></button></div>`;
const cap = s => s[0].toUpperCase() + s.slice(1);

function openMedia(ph){
  flow = {ph, kind:ph.kind, choice:null, tags:[]};
  if (flow.kind === 'text') return openDetail();
  renderPicker(); picker.classList.add('on');
}
function photoGrid(){
  const b = i => `<button data-pick="${i}"><img src="${PHOTOS[i]}" alt=""></button>`;
  return `<div class="pgrid">
    <div class="r4">${[0,1,2,3].map(b).join('')}</div>
    <div class="rb"><button class="big" data-pick="4"><img src="${PHOTOS[4]}" alt=""></button><div class="q">${[5,6,7,8].map(b).join('')}</div></div>
    <div class="r4">${[14,15,16,17].map(b).join('')}</div>
    <div class="rb"><div class="q">${[9,10,11,12].map(b).join('')}</div><button class="big" data-pick="13"><img src="${PHOTOS[13]}" alt=""></button></div>
    <div class="r4">${[2,5,18,1].map(b).join('')}</div></div>`;
}
function renderPicker(q = ''){
  const k = flow.kind;
  let body = '';
  if (k === 'photo' || k === 'video') body = photoGrid();
  else if (k === 'song'){
    const list = SONG_LIB.filter(s => !q || (s.title + ' ' + s.artist).toLowerCase().includes(q.toLowerCase()));
    body = `<ul class="plist">${list.map(s => { const i = SONG_LIB.indexOf(s); return `
      <li data-pick="${i}" class="${flow.choice === i ? 'on' : ''}"><div class="thumb"><img src="${s.img}" alt=""></div>
      <div class="names"><p class="t-body">${esc(s.title)}</p><p class="t-caption grey">${esc(s.artist)}</p></div><span class="tick"></span></li>`; }).join('')}</ul>`;
  } else if (k === 'audio'){
    body = `<ul class="plist">${AUDIO_LIB.map((a, i) => `
      <li data-pick="${i}" class="${flow.choice === i ? 'on' : ''}"><div class="thumb aud"><img src="${A}ph-waveform.svg" alt="" style="width:22px;height:22px;filter:invert(1)"></div>
      <div class="names"><p class="t-body">${esc(a.title)}</p><p class="t-caption grey">${fmt(a.dur)}</p></div><span class="tick"></span></li>`).join('')}</ul>`;
  }
  const ph = {photo:'Search photos...', video:'Search videos...', song:'Search songs...', audio:'Search recordings...'}[k];
  picker.innerHTML = `${head(`Add ${k === 'audio' ? 'audio' : k}`, flow.choice === null)}
    <div class="scroll"><label class="pick-search"><img src="${A}magnifier.svg" alt=""><input type="text" placeholder="${ph}" value="${esc(q)}"></label>${body}</div>`;
  if (flow.choice !== null) picker.querySelectorAll(`[data-pick="${flow.choice}"]`).forEach(x => x.classList.add('on'));
}
picker.addEventListener('input', e => { if (flow && flow.kind === 'song' && e.target.matches('input')){ const pos = e.target.selectionStart; renderPicker(e.target.value); const i = picker.querySelector('input'); i.focus(); i.setSelectionRange(pos, pos); } });
picker.addEventListener('click', e => {
  if (e.target.closest('[data-x]')){ picker.classList.remove('on'); flow = null; return; }
  if (e.target.closest('[data-ok]')){ if (flow.choice !== null) openDetail(); return; }
  const p = e.target.closest('[data-pick]');
  if (p){
    flow.choice = +p.dataset.pick;
    picker.querySelectorAll('[data-pick]').forEach(x => x.classList.toggle('on', +x.dataset.pick === flow.choice));
    picker.querySelector('[data-ok]').disabled = false;
  }
});

function openDetail(){
  const k = flow.kind, noun = NOUN[k];
  let media = '', title = '';
  if (k === 'photo' || k === 'video') media = `<img class="det-media" src="${PHOTOS[flow.choice]}" alt="">`;
  if (k === 'song'){ const s = SONG_LIB[flow.choice]; media = `<img class="det-media" src="${s.img}" alt="">`; title = s.title; }
  if (k === 'audio'){ const a = AUDIO_LIB[flow.choice]; title = a.title;
    media = `<div class="det-media audio">${waveHTML(0)}<div class="audio-meta t-caption"><span class="nm">${esc(a.title)}</span><span>${fmt(a.dur)}</span></div></div>`; }
  if (k === 'text') media = `<div class="det-text"><p class="quote">“</p><textarea id="det-body" placeholder="Write a text snippet"></textarea><input id="det-sub" type="text" placeholder="Who said it? (optional)"></div>`;
  detail.innerHTML = `${head(`Add ${k === 'text' ? 'text' : k === 'audio' ? 'audio' : k}`, false)}
    ${media}
    ${k === 'text' ? '' : `<label class="det-title"><input id="det-title" type="text" placeholder="Title the ${k === 'audio' ? 'clip' : k}" value="${esc(title)}"><span class="ul"></span></label>`}
    <div class="det-form">
      <textarea id="det-desc" placeholder="What do you want to take from this ${noun}?"></textarea>
      <input id="det-tag" type="text" placeholder="Add a tag (optional)">
      <div class="chips" id="det-chips"></div>
    </div>`;
  detail.classList.add('on');
}
function renderChips(){
  detail.querySelector('#det-chips').innerHTML = flow.tags.map((t, i) =>
    `<button class="chip" data-untag="${i}"><img src="${A}tag-x.svg" alt=""><span class="t-body">${esc(t)}</span></button>`).join('');
}
detail.addEventListener('keydown', e => {
  if (e.target.id === 'det-tag' && e.key === 'Enter'){
    e.preventDefault();
    const v = e.target.value.trim();
    if (v && flow.tags.length < 6){ flow.tags.push(v); e.target.value = ''; renderChips(); }
  }
});
detail.addEventListener('click', e => {
  const un = e.target.closest('[data-untag]');
  if (un){ flow.tags.splice(+un.dataset.untag, 1); renderChips(); return; }
  if (e.target.closest('[data-x]')){
    detail.classList.remove('on');
    if (flow.kind === 'text') flow = null;
    return;
  }
  if (!e.target.closest('[data-ok]')) return;
  const k = flow.kind, n = flow.ph;
  const titleIn = detail.querySelector('#det-title');
  const pending = detail.querySelector('#det-tag').value.trim();
  if (pending) flow.tags.push(pending);
  const meta = {desc:detail.querySelector('#det-desc').value.trim(), tags:flow.tags.slice()};
  let next;
  if (k === 'photo' || k === 'video') next = {type:k, title:(titleIn.value.trim() || `untitled ${k}`), img:PHOTOS[flow.choice]};
  if (k === 'song'){ const s = SONG_LIB[flow.choice]; next = {type:'song', title:titleIn.value.trim() || s.title, sub:s.artist, img:s.img, cd:false}; }
  if (k === 'audio'){ const a = AUDIO_LIB[flow.choice]; next = {type:'audio', title:titleIn.value.trim() || a.title, dur:a.dur, pos:0}; }
  if (k === 'text'){
    const body = detail.querySelector('#det-body').value.trim();
    if (!body){ detail.querySelector('#det-body').focus(); return; }
    const who = detail.querySelector('#det-sub').value.trim();
    next = {type:'text', text:body, sub:who ? `- ${who.replace(/^-\s*/, '')}` : ''};
  }
  const idx = board.nodes.findIndex(m => m.id === n.id);
  board.nodes[idx] = {id:n.id, x:n.x, y:n.y, ...next, ...meta};
  detail.classList.remove('on'); picker.classList.remove('on'); flow = null;
  ui.sel = n.id; render(); settle(n.id); setTimeout(() => reveal(n.id), 280);
});

/* ================= OPEN / BACK / SAVE ================= */
const saveOv = $v('#nb-save');
function dirty(){ return snapshot(board) !== snapshot(saved); }
function open(){
  ui.sel = null; ui.tool = null; ui.del.clear(); ui.pan = {x:0, y:0}; ui.z = 1; applyPan();
  view.classList.remove('offright');
  render();
  // audio widget starts selected, as in the hi-fi
  if (board.nodes.some(n => n.id === 'n4')){ ui.sel = 'n4'; render(); }
}
function close(instant){
  stopAudio(); saveOv.classList.remove('on'); addOv.classList.remove('on');
  picker.classList.remove('on'); detail.classList.remove('on'); flow = null;
  if (instant){ view.style.transition = 'none'; requestAnimationFrame(() => { view.style.transition = ''; }); }
  view.classList.add('offright');
}
$v('#nb-back').addEventListener('click', () => {
  if (ui.tool){ ui.tool = null; ui.del.clear(); }
  if (dirty()) saveOv.classList.add('on'); else close();
});
saveOv.addEventListener('click', e => {
  if (e.target === saveOv){ saveOv.classList.remove('on'); return; }
  if (e.target.closest('[data-save]')){
    saved = clone(board);
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (_) {}
    close();
  } else if (e.target.closest('[data-nosave]')){
    board = clone(saved);
    close();
  }
});

// entry points on Home: the Node Discovery tile
const tile = document.querySelector('.more .tile');
if (tile) tile.addEventListener('click', open);
// restart flow returns to the lock screen
document.getElementById('restart')?.addEventListener('click', () => close(true));
document.fonts && document.fonts.ready.then(() => { if (!view.classList.contains('offright')) render(); });

window.tonoNode = {open, close, get board(){ return board; }, get saved(){ return saved; }};
})();
