/* =========================================================
   RECORD DROP-OFF
   Someone sent a prompt; tono picked this listener to answer it.
   Pick up to 5 songs from the cascade (or search), then send them off.
   ========================================================= */
(() => {
const D = 'assets/drop/';
const MAX_PICKS = 5;
const M = 'assets/msg/';
// the question being answered (set by Messages → View Question)
let REQUEST = {user:'supanova', pfp:M + 'pfp-supanova.png', q:'Hi! I saw that your into kpop, I just wanted to ask what are the best house-esq songs in 3rd to 5th gen kpop?'};
const KPOP = [{t:'404 (New Era)', a:'KiiiKiii', art:M + 's-404.png'}, {t:'Hypnotize', a:'XG', art:M + 's-hypnotize.png'}, {t:'Whiplash', a:'aespa', art:M + 's-whiplash.png'}];
const COLORS = ['#FFFFFF', '#E84545', '#EF8655', '#FFE030', '#77DA3A', '#3ADAB7', '#4D86E9', '#8257EE', '#EF64CF'];

// suggestions from the listener's library — order follows the hi-fi cascade (top-right → bottom-left)
const CASCADE = [
  {t:'Coney Island Baby', a:'Lou Reed', art:D+'art-coney.png'},
  {t:'Winter Waltz', a:'FRANKIE', art:D+'art-winter-waltz.jpg'},
  {t:'Remember', a:'Sam Ock', art:D+'art-remember.jpg'},
  {t:'Love you on Christmas', a:'Yerin Baek', art:D+'art-love-you.jpg'},
  {t:'Perfect Night', a:'Le Sserafim', art:D+'art-perfect-night.png'},
  {t:'Midnight City', a:'M83', art:D+'art-m83.png'},
  {t:'Christmas Song', a:'back number', art:D+'art-back-number.jpg'},
  {t:'Riptide', a:'Vance Joy', art:D+'art-riptide.jpg'},
  {t:'Night Train', a:'Unknown artist', art:D+'art-night-train.png'},
];
const LIKES = [0,0,0,0,276,243,219,198,164,131];
const LIBRARY = (() => {
  const out = [];
  const add = s => { if (!out.some(o => key(o) === key(s))) out.push(s); };
  KPOP.forEach(s => add({...s}));
  (typeof TOP10 !== 'undefined' ? TOP10 : []).forEach((r, i) => add({t:r.t, a:r.a, art:r.img, likes:LIKES[i] || 0}));
  (typeof SONGS !== 'undefined' ? SONGS : []).forEach(s => add({t:s.title, a:s.artist, art:s.art}));
  CASCADE.forEach(s => add({t:s.t, a:s.a, art:s.art, c:s.c}));
  return out;
})();
function key(s){ return (s.t + '|' + s.a).toLowerCase(); }
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const thumbOf = s => s.art || s.c || '';

let deck = CASCADE.map(s => ({...s}));
let picks = [];
let f = 4;                  // float index of the song in front (Perfect Night)
const isPicked = s => picks.some(p => key(p) === key(s));

/* ================= DOM ================= */
const app = document.getElementById('app');
const tabbar = app.querySelector('.tabbar');

const drop = document.createElement('section');
drop.className = 'view drop-view offright';
drop.id = 'view-drop';
drop.setAttribute('aria-label', 'Curate a mixtape');
drop.innerHTML = `
  <div class="dhead">
    <button data-back aria-label="Back"><img src="${M}caret-left.svg" alt=""></button>
    <p class="t-header">Curate a mixtape</p>
    <span style="width:24px"></span>
  </div>
  <div class="dscroll">
  <div class="dtop">
    <div class="req">
      <div class="who"><img id="drop-pfp" src="${REQUEST.pfp}" alt=""><span class="t-caption" id="drop-user">${esc(REQUEST.user)}</span></div>
      <p class="t-body" id="drop-qtext">${esc(REQUEST.q)}</p>
    </div>
    <div class="ddots" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="dpicks" id="drop-picks"></div>
    <p class="dcount t-caption" id="drop-pcount"></p>
    <label class="dsearch"><img src="assets/magnifier.svg" alt="">
      <input type="text" id="drop-q" placeholder="Add a song" autocomplete="off">
      <button class="clear" data-clear aria-label="Close search"><img src="assets/node/x.svg" alt=""></button>
    </label>
  </div>
  <div class="sugg-title"><p class="t-header">Suggested Answers</p><p class="t-caption grey" id="drop-count" hidden></p></div>
  <div class="now" id="drop-now"></div>
  <div class="cascade" id="drop-cascade" aria-label="Drag to shuffle suggestions"></div>
  <div class="dresults" id="drop-results"><div class="ranked"><ul></ul></div></div>
  </div>
  <button class="dcontinue t-body" data-next disabled>Continue</button>`;

const fin = document.createElement('section');
fin.className = 'view final-view offright';
fin.id = 'view-drop-final';
fin.setAttribute('aria-label', 'Decorate your mixtape');
fin.innerHTML = `
  <div class="msg-title" style="position:absolute"><button data-back aria-label="Back"><img src="${M}caret-left.svg" alt=""></button><p class="t-header">Curate a mixtape</p></div>
  <div class="mx-page">
    <div class="mx-cd-wrap">
      <div class="mx-cd" id="mx-cd"><img class="case" src="${M}cd-case.png" alt="Your mixtape"><span class="tint"></span><img class="label" alt=""><canvas width="590" height="518"></canvas></div>
      <div class="mx-pal" id="mx-pal"><div class="row">${COLORS.map((c, i) => `<button style="background:${c}" data-color="${i}" aria-label="Colour ${i + 1}"></button>`).join('')}</div>
        <span class="tip"><img src="${M}pointer.svg" alt=""></span></div>
      <div class="mx-tools" role="toolbar" aria-label="Decorate the CD">
        <button data-tool="color" aria-label="Colour"><span class="swatch"></span></button>
        <button data-tool="pen" aria-label="Draw"><img src="${M}pen.svg" alt=""></button>
        <button data-tool="image" aria-label="Add a cover"><img src="${M}image.svg" alt=""></button>
        <button data-tool="sticker" aria-label="Add a sticker"><img src="${M}smiley-sticker.svg" alt=""></button>
      </div>
    </div>
    <label class="mx-note"><textarea rows="1" id="mx-note" placeholder="Add a note" aria-label="Add a note"></textarea></label>
    <div class="mx-list"><p class="t-body title">My List</p><div id="mx-mylist"></div></div>
  </div>
  <button class="mx-send t-body" data-send><img src="${M}plane-dark.svg" alt="">Send</button>`;
const toastEl = document.createElement('div');
toastEl.className = 'drop-toast t-body';
toastEl.innerHTML = '<i class="sym"></i><span></span>';
const sent = document.createElement('div');
sent.className = 'sent-ov';
sent.innerHTML = `<div class="plane"><i class="sym" style="--i:url(${D}paper-plane.svg)"></i></div>
  <p class="t-header">Sent to ${esc(REQUEST.user)}</p><p class="t-caption grey" id="drop-sent-sub"></p>`;

tabbar.before(drop, fin);
app.append(toastEl, sent);

const $d = s => drop.querySelector(s);
const cascade = $d('#drop-cascade'), nowEl = $d('#drop-now'), qIn = $d('#drop-q');

let toastT;
function toast(text, icon){
  toastEl.querySelector('span').textContent = text;
  const ic = toastEl.querySelector('.sym');
  ic.style.display = icon ? '' : 'none';
  if (icon) ic.style.setProperty('--i', `url(${icon})`);
  toastEl.classList.add('on'); clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('on'), 1800);
}

/* ================= CASCADE ================= */
const C = {x:119.5, y:228};       // centre slot (in cascade coords)
const S = {x:-48, y:38};          // one step down the diagonal
const PULL = {x:86.5, y:20};      // the front song is pulled out of the stack
const S2 = S.x * S.x + S.y * S.y;
const wrap = (k, n) => ((k % n) + n * 1.5) % n - n / 2;   // → [-n/2, n/2)
const idx = () => ((Math.round(f) % deck.length) + deck.length) % deck.length;

function buildCases(){
  // every cover is the full square artwork, warped into the slanted case shape
  cascade.innerHTML = deck.map((s, i) => `<div class="case" data-i="${i}">
      <div class="sq">${s.art ? `<img src="${s.art}" alt="">` : ''}</div>
      <span class="tick"><i class="sym" style="--i:url(assets/node/check.svg)"></i></span></div>`).join('');
  layout();
}
function layout(){
  const n = deck.length;
  cascade.querySelectorAll('.case').forEach(el => {
    const i = +el.dataset.i, k = wrap(i - f, n), a = Math.abs(k);
    const pull = Math.max(0, 1 - a);
    const x = C.x + k * S.x + pull * PULL.x, y = C.y + k * S.y + pull * PULL.y;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.style.opacity = a > 4.6 ? 0 : 1;
    el.style.zIndex = 50 + Math.round(k);   // keep stack order: the cover below stays in front of the one jutting out
    el.classList.toggle('chosen', isPicked(deck[i]));
  });
}
let shown = -1;
function renderNow(force){
  const i = idx();
  if (i === shown && !force) return;
  const changed = i !== shown; shown = i;
  const n = deck.length, at = j => deck[(i + j) % n];
  const cur = at(0);
  nowEl.innerHTML = `
    <div class="row cur"><button class="pick ${isPicked(cur) ? 'on' : ''}" data-pick aria-label="${isPicked(cur) ? 'Remove' : 'Add'} ${esc(cur.t)}">
      <i class="sym" style="--i:url(${isPicked(cur) ? 'assets/node/check.svg' : D + 'plus.svg'})"></i></button>
      <button class="meta snip-btn ${playing === i ? 'on' : ''}" data-snip aria-label="${playing === i ? 'Stop' : 'Play'} a snippet of ${esc(cur.t)}">
        <span class="title-row"><span class="t-body">${esc(cur.t)}</span>${playing === i ? '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : ''}</span>
        <span class="t-caption ar">${esc(cur.a)}</span></button></div>
    <div class="row n1"><div class="meta"><p class="t-body">${esc(at(1).t)}</p><p class="t-caption ar">${esc(at(1).a)}</p></div></div>
    <div class="row n2"><div class="meta"><p class="t-body">${esc(at(2).t)}</p><p class="t-caption ar">${esc(at(2).a)}</p></div></div>`;
  if (changed){
    if (playing !== null && playing !== i) stopSnippet();
    nowEl.classList.remove('swap'); void nowEl.offsetWidth; nowEl.classList.add('swap'); clearTimeout(renderNow.t); renderNow.t = setTimeout(() => nowEl.classList.remove('swap'), 400);
  }
}

/* ================= SNIPPET PREVIEW (synth stand-in for the song clip) ================= */
let playing = null, snip = null, actx = null;
const SNIP_LEN = 15;
function startSnippet(i){
  stopSnippet(true);
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    actx.resume();
    const t0 = actx.currentTime, out = actx.createGain();
    out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(.06, t0 + .3);
    out.gain.setValueAtTime(.06, t0 + SNIP_LEN - 1); out.gain.linearRampToValueAtTime(0, t0 + SNIP_LEN);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(out); out.connect(actx.destination);
    // each song gets its own chord + a soft four-on-the-floor pulse
    const root = 196 * Math.pow(2, (i * 5 % 12) / 12);
    const oscs = [1, 1.26, 1.5, 1.89].map((r, j) => { const o = actx.createOscillator(); o.type = j % 2 ? 'sine' : 'triangle'; o.frequency.value = root * r; o.connect(lp); o.start(t0); o.stop(t0 + SNIP_LEN); return o; });
    const kick = actx.createOscillator(), kg = actx.createGain(); kick.type = 'sine'; kick.connect(kg); kg.connect(out); kg.gain.value = 0;
    for (let b = 0; b < SNIP_LEN * 2; b++){ const t = t0 + b * .5; kick.frequency.setValueAtTime(120, t); kick.frequency.exponentialRampToValueAtTime(45, t + .12); kg.gain.setValueAtTime(1.4, t); kg.gain.exponentialRampToValueAtTime(.001, t + .2); }
    kick.start(t0); kick.stop(t0 + SNIP_LEN);
    snip = {out, oscs:[...oscs, kick], timer:setTimeout(() => stopSnippet(), SNIP_LEN * 1000)};
  } catch (_) { snip = null; }
  playing = i; renderNow(true);
}
function stopSnippet(silent){
  if (snip){
    clearTimeout(snip.timer);
    try { const t = actx.currentTime; snip.out.gain.cancelScheduledValues(t); snip.out.gain.setValueAtTime(snip.out.gain.value, t); snip.out.gain.linearRampToValueAtTime(0, t + .15); snip.oscs.forEach(o => { try { o.stop(t + .2); } catch (_) {} }); } catch (_) {}
    snip = null;
  }
  const was = playing; playing = null;
  if (!silent && was !== null) renderNow(true);
}
function syncCount(){
  $d('#drop-picks').innerHTML = picks.map((s, i) => `<div class="dpick"><button data-unpick="${i}" aria-label="Remove ${esc(s.t)}"><img src="${M}x.svg" alt=""></button>
    ${thumbOf(s) ? `<img src="${thumbOf(s)}" alt="">` : '<span class="ph"></span>'}<div class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption">${esc(s.a)}</p></div></div>`).join('');
  $d('#drop-pcount').textContent = picks.length ? `${picks.length}/${MAX_PICKS} Songs` : '';
  $d('[data-next]').disabled = !picks.length;
  place(); layout(); renderNow(true);
}
// everything under the question moves down as songs are added (Figma 1045:5257)
function place(){
  const top = $d('.dtop'), h = top.offsetHeight;
  drop.style.setProperty('--sy', `${120 + h + 24}px`);      // Suggested Answers sits 24px under Add a song
  drop.style.setProperty('--ry', `${120 + h + 12}px`);
}

let anim = null;
function animateTo(target){
  cancelAnimationFrame(anim);
  const from = f, t0 = performance.now(), dur = 420;
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    f = from + (target - from) * e; layout(); renderNow();
    if (p < 1) anim = requestAnimationFrame(step); else { f = target; layout(); renderNow(); }
  };
  anim = requestAnimationFrame(step);
}

// drag anywhere on the graphic: cases slide along the diagonal and the front song changes
let drag = null;
const localPt = e => { const r = cascade.getBoundingClientRect(), s = r.width / 402; return {x:(e.clientX - r.left) / s, y:(e.clientY - r.top) / s}; };
cascade.addEventListener('pointerdown', e => {
  cancelAnimationFrame(anim);
  const p = localPt(e);
  drag = {p0:p, f0:f, last:p, t:performance.now(), v:0, moved:false};
  cascade.setPointerCapture(e.pointerId); cascade.classList.add('grabbing');
});
cascade.addEventListener('pointermove', e => {
  if (!drag) return;
  const p = localPt(e), dx = p.x - drag.p0.x, dy = p.y - drag.p0.y;
  if (!drag.moved && Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  // the cases follow the finger along the diagonal (horizontal swipes work too)
  const along = (dx * S.x + dy * S.y) / S2;
  const now = performance.now();
  const stepD = ((p.x - drag.last.x) * S.x + (p.y - drag.last.y) * S.y) / S2;
  drag.v = -stepD / Math.max(1, now - drag.t) * 16;
  drag.last = p; drag.t = now;
  f = drag.f0 - along; layout(); renderNow();
});
function endCascade(e){
  if (!drag) return;
  const d = drag; drag = null; cascade.classList.remove('grabbing');
  if (!d.moved){
    // tap a case to bring it to the front
    const p = localPt(e);
    let best = null, bz = -1;
    cascade.querySelectorAll('.case').forEach(el => {
      const m = el.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/); if (!m) return;
      const x = +m[1], y = +m[2], z = +el.style.zIndex;
      if (+el.style.opacity > 0 && p.x >= x && p.x <= x + 149 && p.y >= y && p.y <= y + 191 && z > bz){ best = el; bz = z; }
    });
    if (best){ const i = +best.dataset.i, n = deck.length; animateTo(f + wrap(i - f, n)); }
    return;
  }
  animateTo(Math.round(f + Math.max(-3, Math.min(3, d.v * 6))));
}
cascade.addEventListener('pointerup', endCascade);
cascade.addEventListener('pointercancel', () => { drag = null; cascade.classList.remove('grabbing'); animateTo(Math.round(f)); });

/* ================= PICKING ================= */
function togglePick(s){
  if (isPicked(s)){ picks = picks.filter(p => key(p) !== key(s)); syncCount(); return true; }
  if (picks.length >= MAX_PICKS){ toast(`You can pick up to ${MAX_PICKS} songs`); return false; }
  picks.push({t:s.t, a:s.a, art:s.art, c:s.c}); syncCount();
  if (picks.length === MAX_PICKS) toast(`${MAX_PICKS}/${MAX_PICKS} picked · ready to send`, D + 'paper-plane.svg');
  return true;
}
nowEl.addEventListener('click', e => {
  if (e.target.closest('[data-pick]')) togglePick(deck[idx()]);
  else if (e.target.closest('[data-snip]')){ const i = idx(); playing === i ? stopSnippet() : startSnippet(i); }
});

/* ================= SEARCH ================= */
function renderResults(){
  const q = qIn.value.trim().toLowerCase();
  const list = q ? LIBRARY.filter(s => (s.t + ' ' + s.a).toLowerCase().includes(q)) : LIBRARY.slice(0, 10);
  const ul = $d('#drop-results ul');
  ul.innerHTML = list.length ? list.map((s, i) => `
    <li>
      <p class="t-caption grey">${String(i + 1).padStart(2, '0')}</p>
      <div class="thumb">${thumbOf(s) ? `<img src="${thumbOf(s)}" alt="">` : ''}</div>
      <div class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption grey">${esc(s.a)}</p></div>
      <div class="right">${s.likes ? `<span class="likes t-caption"><img src="assets/heart.svg" alt="">${s.likes}</span>` : ''}
        <button class="plus ${isPicked(s) ? 'on' : ''}" data-add="${LIBRARY.indexOf(s)}" aria-label="${isPicked(s) ? 'Remove' : 'Add'} ${esc(s.t)}">
          <img src="${isPicked(s) ? 'assets/node/check.svg' : 'assets/plus-circle.svg'}" alt=""></button></div>
    </li>`).join('') : `<p class="empty t-body">No songs match “${esc(qIn.value)}”</p>`;
}
function openSearch(){ stopSnippet(); drop.classList.add('searching'); $d('.dscroll').scrollTop = 0; renderResults(); }
function closeSearch(){ drop.classList.remove('searching'); qIn.value = ''; qIn.blur(); layout(); renderNow(true); }
qIn.addEventListener('focus', openSearch);
qIn.addEventListener('input', renderResults);
$d('[data-clear]').addEventListener('click', e => { e.preventDefault(); closeSearch(); });
$d('#drop-results').addEventListener('click', e => {
  const b = e.target.closest('[data-add]'); if (!b) return;
  const s = LIBRARY[+b.dataset.add];
  const adding = !isPicked(s);
  if (!togglePick(s)) return;
  if (adding){
    // the searched song's art joins the graphic, in front
    let i = deck.findIndex(d => key(d) === key(s));
    if (i < 0){ i = idx() + 1; deck.splice(i, 0, {t:s.t, a:s.a, art:s.art, c:s.c}); if (i <= idx()) f += 1; buildCases(); }
    f = i; layout(); renderNow(true);
    toast(`Added ${s.t}`, 'assets/node/check.svg');
  }
  renderResults();
});

/* ================= NAV: open, review, send ================= */
function openFor(req){
  if (req) REQUEST = {...REQUEST, ...req};
  $d('#drop-user').textContent = REQUEST.user; $d('#drop-pfp').src = REQUEST.pfp; $d('#drop-qtext').textContent = REQUEST.q;
  open();
}
function open(){
  closeSearch(); syncCount();
  window.tonoMsgs ? window.tonoMsgs.go(drop) : push(drop);
  requestAnimationFrame(place);
}
function back(){
  if (drop.classList.contains('searching')) return closeSearch();
  stopSnippet();
  window.tonoMsgs ? window.tonoMsgs.back() : goHome();
}
/* ================= DECORATE THE CD (Figma 982:12703 → 1070:5232) ================= */
const cd = fin.querySelector('#mx-cd'), pal = fin.querySelector('#mx-pal'), canvas = cd.querySelector('canvas'), ctx = canvas.getContext('2d');
const deco = {color:0, tool:null};
function paint(){
  const c = COLORS[deco.color];
  cd.querySelector('.tint').style.background = deco.color ? c : 'transparent';
  fin.querySelector('.swatch').style.background = c;
  pal.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('on', +b.dataset.color === deco.color));
  fin.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === deco.tool));
  pal.classList.toggle('on', deco.tool === 'color');
}
function renderFinal(){
  fin.querySelector('#mx-mylist').innerHTML = picks.map(s => `<div class="mx-row">${thumbOf(s) ? `<img src="${thumbOf(s)}" alt="">` : '<span class="ph"></span>'}
    <div class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption">${esc(s.a)}</p></div></div>`).join('');
  paint();
}
function resetDeco(){
  deco.color = 0; deco.tool = null; ctx.clearRect(0, 0, canvas.width, canvas.height);
  cd.querySelectorAll('.stk').forEach(x => x.remove()); cd.querySelector('.label').style.display = 'none';
  fin.querySelector('#mx-note').value = ''; paint();
}
fin.addEventListener('click', e => {
  const t = e.target.closest('[data-tool]');
  if (t){
    const tool = t.dataset.tool;
    if (tool === 'image'){       // the first song's cover becomes the disc label
      const lab = cd.querySelector('.label'), s0 = picks.find(thumbOf);
      if (s0){ lab.src = thumbOf(s0); lab.style.display = lab.style.display === 'block' ? 'none' : 'block'; }
      deco.tool = null;
    } else if (tool === 'sticker'){
      const k = document.createElement('span'), r = `${Math.round(Math.random() * 50 - 25)}deg`; k.className = 'stk';
      k.style.left = `${50 + Math.random() * 190}px`; k.style.top = `${25 + Math.random() * 180}px`; k.style.setProperty('--r', r); k.style.transform = `rotate(${r})`;
      cd.appendChild(k); deco.tool = null;
    } else deco.tool = deco.tool === tool ? null : tool;
    paint(); return;
  }
  const c = e.target.closest('[data-color]'); if (c){ deco.color = +c.dataset.color; deco.tool = null; paint(); return; }
  if (deco.tool === 'color' && !e.target.closest('.mx-pal')){ deco.tool = null; paint(); }
});
// pen: draw on the disc
let pen = null;
const cdPt = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * canvas.width, (e.clientY - r.top) / r.height * canvas.height]; };
cd.addEventListener('pointerdown', e => {
  if (deco.tool !== 'pen') return;
  pen = cdPt(e); cd.setPointerCapture(e.pointerId);
  ctx.strokeStyle = deco.color ? COLORS[deco.color] : '#D5A1FA'; ctx.lineWidth = 6; ctx.lineCap = ctx.lineJoin = 'round';
});
cd.addEventListener('pointermove', e => { if (!pen) return; const p = cdPt(e); ctx.beginPath(); ctx.moveTo(...pen); ctx.lineTo(...p); ctx.stroke(); pen = p; });
cd.addEventListener('pointerup', () => { pen = null; });
cd.addEventListener('pointercancel', () => { pen = null; });
const note = fin.querySelector('#mx-note');
note.addEventListener('input', () => { note.style.height = 'auto'; note.style.height = note.scrollHeight + 'px'; });

function review(){
  if (!picks.length){ toast('Add at least 1 song'); return; }
  stopSnippet();
  renderFinal();
  fin.scrollTop = 0;
  window.tonoMsgs ? window.tonoMsgs.go(fin) : push(fin);
}
function backFromFinal(){
  window.tonoMsgs?.back();
  syncCount();
}
function send(){
  if (!picks.length) return;
  const out = {picks:picks.slice(), color:deco.color ? COLORS[deco.color] : null, note:note.value.trim()};
  window.tonoMsgs?.mixtapeSent(out);
  setTimeout(() => { picks = []; deck = CASCADE.map(s => ({...s})); f = 4; buildCases(); syncCount(); resetDeco(); }, 700);
}

drop.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) back();
  else if (e.target.closest('[data-next]')) review();
});
fin.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) backFromFinal();
  else if (e.target.closest('[data-send]')) send();
});
$d('#drop-picks').addEventListener('click', e => { const u = e.target.closest('[data-unpick]'); if (u){ picks.splice(+u.dataset.unpick, 1); syncCount(); } });

// entry point on Home: the Record Drop-off tile
document.querySelector('.more .tile:nth-child(2)')?.addEventListener('click', open);
document.getElementById('restart')?.addEventListener('click', () => {
  [drop, fin].forEach(v => { v.style.transition = 'none'; v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); requestAnimationFrame(() => v.style.transition = ''); });
  picks = []; deck = CASCADE.map(s => ({...s})); f = 4; buildCases(); syncCount(); resetDeco();
});

buildCases(); syncCount();
window.tonoDrop = {open, openFor, get picks(){ return picks; }, get front(){ return deck[idx()].t; }};
})();
