/* =========================================================
   RECORD DROP-OFF
   Someone sent a prompt; tono picked this listener to answer it.
   Pick up to 5 songs from the cascade (or search), then send them off.
   ========================================================= */
(() => {
const D = 'assets/drop/';
const MAX_PICKS = 5;
const REQUEST = {user:'Username', q:'What are the best house-esq songs in 3rd to 5th gen kpop?'};

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
drop.setAttribute('aria-label', 'Record drop off');
drop.innerHTML = `
  <div class="dhead">
    <button data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button>
    <p class="t-header">Record Drop off</p>
    <button data-next aria-label="Review picks"><img src="${D}arrow-right.svg" alt=""></button>
  </div>
  <div class="req">
    <div class="who"><img src="${D}pfp.svg" alt=""><span class="t-caption">${esc(REQUEST.user)}</span></div>
    <p class="t-body">${esc(REQUEST.q)}</p>
  </div>
  <label class="dsearch"><img src="assets/magnifier.svg" alt="">
    <input type="text" id="drop-q" placeholder="Search kpop songs..." autocomplete="off">
    <button class="clear" data-clear aria-label="Close search"><img src="assets/node/x.svg" alt=""></button>
  </label>
  <div class="sugg-title"><p class="t-header">Our suggestions</p><p class="t-caption grey" id="drop-count"></p></div>
  <div class="now" id="drop-now"></div>
  <div class="cascade" id="drop-cascade" aria-label="Drag to shuffle suggestions"></div>
  <div class="dresults" id="drop-results"><div class="ranked"><ul></ul></div></div>`;

const fin = document.createElement('section');
fin.className = 'view final-view offright';
fin.id = 'view-drop-final';
fin.setAttribute('aria-label', 'Send off');
fin.innerHTML = `
  <div class="dhead" style="position:absolute">
    <button data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button>
    <p class="t-header">Record Drop off</p>
    <button data-send aria-label="Send picks"><img src="${D}paper-plane.svg" alt=""></button>
  </div>
  <div class="cd"><img src="${D}cd-case.png" alt=""></div>
  <label class="fname"><input id="drop-name" type="text" value="My kpop house recs" aria-label="Name your picks"></label>
  <p class="fcount t-body" id="drop-fcount"></p>
  <div class="flist ranked"><ul id="drop-flist"></ul></div>`;
fin.style.padding = '0';
fin.querySelector('.dhead').style.cssText = 'position:absolute;left:0;top:72px;width:402px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;z-index:6';
fin.querySelectorAll('.dhead button').forEach(b => b.style.cssText = 'width:24px;height:24px;display:grid;place-items:center');

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
    el.classList.toggle('picked', isPicked(deck[i]));
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
  $d('#drop-count').textContent = `${picks.length}/${MAX_PICKS} picked`;
  layout(); renderNow(true);
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
function openSearch(){ stopSnippet(); drop.classList.add('searching'); renderResults(); }
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
function open(){
  closeSearch(); syncCount();
  if (typeof push === 'function') push(drop);
}
function back(){
  if (drop.classList.contains('searching')) return closeSearch();
  stopSnippet();
  if (typeof goHome === 'function') goHome();
}
function renderFinal(){
  fin.querySelector('#drop-fcount').textContent = `${picks.length}/${MAX_PICKS} songs picked`;
  fin.querySelector('#drop-flist').innerHTML = picks.map((s, i) => `
    <li>
      <p class="t-caption grey">${String(i + 1).padStart(2, '0')}</p>
      <div class="thumb">${thumbOf(s) ? `<img src="${thumbOf(s)}" alt="">` : ''}</div>
      <div class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption grey">${esc(s.a)}</p></div>
      <button class="rm" data-rm="${i}" aria-label="Remove ${esc(s.t)}"><img src="assets/node/x.svg" alt=""></button>
    </li>`).join('');
  fin.querySelector('[data-send]').disabled = picks.length === 0;
}
function review(){
  if (!picks.length){ toast('Pick at least 1 song to send'); return; }
  stopSnippet();
  renderFinal();
  fin.scrollTop = 0;
  fin.classList.add('on-top');
  requestAnimationFrame(() => { fin.classList.remove('offright'); drop.classList.add('offleft'); current = fin; });
}
function backFromFinal(){
  fin.classList.add('offright'); drop.classList.remove('offleft'); current = drop;
  setTimeout(() => fin.classList.remove('on-top'), 450);
  syncCount();
}
function send(){
  if (!picks.length) return;
  const n = picks.length, name = fin.querySelector('#drop-name').value.trim() || 'My picks';
  sent.querySelector('#drop-sent-sub').textContent = `“${name}” · ${n} song${n === 1 ? '' : 's'}`;
  sent.classList.add('on');
  setTimeout(() => {
    // back to Home; the mailbox is cleared
    fin.style.transition = drop.style.transition = 'none';
    fin.classList.add('offright'); fin.classList.remove('on-top');
    drop.classList.remove('offleft'); current = drop;
    requestAnimationFrame(() => { fin.style.transition = drop.style.transition = ''; goHome(); });
    sent.classList.remove('on');
    document.querySelector('.more .badge')?.remove();
    picks = []; deck = CASCADE.map(s => ({...s})); f = 4; buildCases(); syncCount();
  }, 1700);
}

drop.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) back();
  else if (e.target.closest('[data-next]')) review();
});
fin.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) backFromFinal();
  else if (e.target.closest('[data-send]')) send();
  else { const r = e.target.closest('[data-rm]'); if (r){ picks.splice(+r.dataset.rm, 1); renderFinal(); if (!picks.length) backFromFinal(); } }
});

// entry point on Home: the Record Drop-off tile
document.querySelector('.more .tile:nth-child(2)')?.addEventListener('click', open);
document.getElementById('restart')?.addEventListener('click', () => {
  [drop, fin].forEach(v => { v.style.transition = 'none'; v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); requestAnimationFrame(() => v.style.transition = ''); });
});

buildCases(); syncCount();
window.tonoDrop = {open, get picks(){ return picks; }, get front(){ return deck[idx()].t; }};
})();
