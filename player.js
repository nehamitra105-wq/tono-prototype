/* =========================================================
   PLAYER — remote for whatever the listener is playing.
   Flows follow the Figma prototype:
   · dots toggle: turntable → album cover → music video → turntable
   · drag the remote: expanded ⇄ collapsed (each view has both)
   · play / add / like / repeat / shuffle toggle to their "on" variants
   · "+ Tag" opens "Add a Song Tag": × removes, recommended adds, Confirm applies
   ========================================================= */
(() => {
const P = 'assets/player/';
const SONG = {title:'Please Don’t Stop The Music', artist:'Rhianna', context:'Movin’'};
const VIEWS = ['tt', 'cv', 'vd'];
const REMOTE_TOP = {tt:513, cv:471, vd:513};
const COLLAPSED_TOP = 749;
// full screen on a shorter phone: the remote keeps its distance from the bottom and the artwork above it shrinks to fit
const DY = () => Math.min(0, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sh')) || 874) - 874);
const REC_POOL = ['2010s', 'Happy', 'Electric', 'Club', 'R&B', 'Throwback', 'Pop', 'Dance', 'Late Night'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const st = {view:'tt', collapsed:false, playing:false, add:false, like:false, repeat:false, shuffle:false, tags:['Pop', 'Dance'], pos:.42};

const app = document.getElementById('app');
const v = document.createElement('section');
v.className = 'view player-view offright';
v.id = 'view-player';
v.setAttribute('aria-label', 'Player');
const title = (cls = '') => `<div class="pl-title ${cls}"><p class="t-header">${esc(SONG.title)}</p><p class="t-body">${esc(SONG.artist)}</p></div>`;
v.innerHTML = `
  <div class="pl-stage">
    <div class="pl-layer vd-l" data-layer="vd"><div class="vd-wrap"><div class="vd"><img src="${P}video.png" alt=""></div></div>${title()}</div>
    <div class="pl-layer tt" data-layer="tt">
      <div class="tt-angle"><img src="${P}vinyl-angle.png" alt=""></div>
      <img class="tt-top" src="${P}vinyl-top.png" alt="">
      ${title()}
    </div>
    <div class="pl-layer cv" data-layer="cv"><img class="cv-art" src="${P}cover.png" alt="">${title()}</div>
  </div>
  <div class="pl-head">
    <button class="back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button>
    <p class="t-body">${esc(SONG.context)}</p>
    <button class="view-changer" data-view aria-label="Change view"><i class="vc-dot" data-i="0"></i><i class="vc-dot" data-i="1"></i><i class="vc-dot" data-i="2"></i><i class="vc-knob"></i></button>
  </div>
  <div class="remote" id="pl-remote" aria-label="Remote">
    <img class="handle" src="${P}handle.svg" alt="">
    <div class="grab" data-grab></div>
    <div class="inner">
      <div class="skip"><img src="${P}skip-bar.svg" alt=""><div class="knob-hit" data-seek aria-label="Seek"></div></div>
      <div class="ctrl-row">
        <button class="pbtn big" data-btn="playing" aria-label="Play"><img src="${P}play.svg" alt=""></button>
        <div class="ctrl-right">
          <div class="btn-row">
            <button class="pbtn sm" data-btn="add" aria-label="Add to playlist"><img src="${P}add.svg" alt=""></button>
            <button class="pbtn sm" data-btn="like" aria-label="Like"><img src="${P}like.svg" alt=""></button>
            <button class="pbtn sm" data-btn="repeat" aria-label="Repeat"><img src="${P}repeat.svg" alt=""></button>
            <button class="pbtn sm" data-btn="shuffle" aria-label="Shuffle"><img src="${P}shuffle.svg" alt=""></button>
          </div>
          <div class="tag-row"><div class="chips" id="pl-tags"></div></div>
        </div>
      </div>
    </div>
  </div>
  <div class="tag-ov" id="pl-tag-ov">
    <div class="tag-pop" role="dialog" aria-label="Add a Song Tag">
      <div class="stack">
        <div class="hd"><p class="t-header">Add a Song Tag</p><button data-close aria-label="Close"><img src="assets/node/x.svg" alt=""></button></div>
        <div class="grp">
          <textarea id="pl-tag-in" placeholder="What matches this song best?..."></textarea>
          <p class="lbl t-body">Your current tags</p>
          <div class="chips" id="pl-cur"></div>
          <p class="lbl t-body">Recommend tags</p>
          <div class="chips" id="pl-rec"></div>
        </div>
        <button class="confirm t-body" data-confirm disabled>Confirm</button>
      </div>
    </div>
  </div>`;
app.querySelector('.tabbar').before(v);

const $p = s => v.querySelector(s);
const remote = $p('#pl-remote');
const ICON = {playing:['play', 'pause'], add:['add', 'add-on'], like:['like', 'like-on'], repeat:['repeat', 'repeat-on'], shuffle:['shuffle', 'shuffle-on']};

function render(){
  v.classList.toggle('collapsed', st.collapsed);
  v.classList.toggle('playing', st.playing);
  v.querySelectorAll('[data-layer]').forEach(l => l.classList.toggle('on', l.dataset.layer === st.view));
  placeKnob(VIEWS.indexOf(st.view));
  const dy = DY(), top = st.collapsed ? COLLAPSED_TOP : REMOTE_TOP[st.view];
  remote.style.top = `${top + dy}px`;
  $p('.pl-stage').style.transform = dy ? `scale(${((top + dy - 62) / (top - 62)).toFixed(4)})` : '';
  remote.classList.toggle('bordered', st.view !== 'tt' && !st.collapsed);
  Object.keys(ICON).forEach(k => {
    const b = $p(`[data-btn="${k}"]`);
    b.querySelector('img').src = `${P}${ICON[k][st[k] ? 1 : 0]}.svg`;
    b.setAttribute('aria-pressed', st[k]);
  });
  $p('[data-btn="playing"]').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
  $p('#pl-tags').innerHTML = st.tags.map(t => `<span class="pchip">${esc(t)}</span>`).join('') + `<button class="pchip add" data-tag-open><i class="plus" aria-hidden="true"></i>Tag</button>`;
}

/* view changer: turntable → cover → video → turntable */
addEventListener('tono-fit', () => render());
$p('[data-view]').addEventListener('click', () => { st.view = VIEWS[(VIEWS.indexOf(st.view) + 1) % VIEWS.length]; render(); });

/* the dots: the white knob sits on the current view; drag it along (all the way to either end) to pick a view */
const SLOT = [15, 38, 59];                       // knob centres inside the 78px pill (Figma dots-1/2/3)
const DOT = [[0, 44, 66], [9, 0, 67], [8, 30, 0]]; // the small dots' centres for each view (Figma)
const vc = $p('.view-changer'), knob = vc.querySelector('.vc-knob');
function placeKnob(i, x){
  knob.style.left = `${(x ?? SLOT[i]) - 10}px`;
  vc.querySelectorAll('.vc-dot').forEach(d => {
    const k = +d.dataset.i, far = Math.abs(k - i) > 1;
    if (k !== i) d.style.left = `${DOT[i][k] - (far ? 3 : 4)}px`;
    d.classList.toggle('far', far); d.classList.toggle('hide', k === i);
  });
}
const nearest = x => SLOT.reduce((b, c, k) => Math.abs(c - x) < Math.abs(SLOT[b] - x) ? k : b, 0);
let kd = null;
vc.addEventListener('pointerdown', e => {
  if (e.button) return;
  const r = vc.getBoundingClientRect();
  kd = {x0:e.clientX, s:r.width / 78, left:r.left, moved:false};
  try { vc.setPointerCapture(e.pointerId); } catch (_) {}
});
vc.addEventListener('pointermove', e => {
  if (!kd) return;
  if (!kd.moved && Math.abs(e.clientX - kd.x0) < 4) return;
  kd.moved = true;
  const x = Math.min(SLOT[2], Math.max(SLOT[0], (e.clientX - kd.left) / kd.s));
  knob.style.transition = 'none';
  const i = nearest(x);
  if (VIEWS[i] !== st.view){ st.view = VIEWS[i]; render(); }
  placeKnob(i, x);
});
const endKnob = () => {
  if (!kd) return;
  const moved = kd.moved; kd = null;
  knob.style.transition = '';
  placeKnob(VIEWS.indexOf(st.view));
  if (moved) swallowClick();
};
vc.addEventListener('pointerup', endKnob);
vc.addEventListener('pointercancel', endKnob);
function swallowClick(){
  const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
  window.addEventListener('click', stop, {capture:true, once:true});
  setTimeout(() => window.removeEventListener('click', stop, {capture:true}), 0);
}

/* or swipe sideways across the player: left = next view, right = previous.
   Touch uses touch events (they still finish if the browser takes over the gesture); a mouse uses pointer events. */
let sw = null;
const swStart = (x, y, t) => { sw = t.closest('#pl-remote, #pl-tag-ov, [data-back], .view-changer') ? null : {x, y}; };
const swEnd = (x, y) => {
  if (!sw) return;
  const dx = x - sw.x, dy = y - sw.y; sw = null;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
  const i = VIEWS.indexOf(st.view) + (dx < 0 ? 1 : -1);
  if (i >= 0 && i < VIEWS.length){ st.view = VIEWS[i]; render(); }
  swallowClick();
};
v.addEventListener('touchstart', e => { const t = e.touches[0]; if (e.touches.length === 1) swStart(t.clientX, t.clientY, e.target); else sw = null; }, {passive:true});
v.addEventListener('touchend', e => { const t = e.changedTouches[0]; swEnd(t.clientX, t.clientY); }, {passive:true});
v.addEventListener('touchcancel', () => { sw = null; });
v.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && !e.button) swStart(e.clientX, e.clientY, e.target); });
v.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') swEnd(e.clientX, e.clientY); });
v.addEventListener('dragstart', e => { if (e.target.closest('.pl-stage, .pl-head')) e.preventDefault(); });

/* remote buttons toggle to their "on" variant */
remote.addEventListener('click', e => {
  const b = e.target.closest('[data-btn]');
  if (b){ st[b.dataset.btn] = !st[b.dataset.btn]; render(); return; }
  if (e.target.closest('[data-tag-open]')) openTags();
});

/* drag the remote down to collapse it, up to expand; a tap on the collapsed edge expands too */
let drag = null;
const scale = () => v.getBoundingClientRect().width / 402;
remote.addEventListener('pointerdown', e => {
  if (e.target.closest('[data-btn], [data-tag-open], [data-seek]')) return;
  drag = {y0:e.clientY, top0:parseFloat(remote.style.top), moved:false};
  try { remote.setPointerCapture(e.pointerId); } catch (_) {}
});
remote.addEventListener('pointermove', e => {
  if (!drag) return;
  const dy = (e.clientY - drag.y0) / scale();
  if (Math.abs(dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  remote.style.transition = 'none';
  const lo = REMOTE_TOP[st.view] + DY() - 30, hi = COLLAPSED_TOP + DY() + 20;
  remote.style.top = `${Math.min(hi, Math.max(lo, drag.top0 + dy))}px`;
});
const endRemote = e => {
  if (!drag) return;
  const d = drag; drag = null;
  remote.style.transition = '';
  const dy = (e.clientY - d.y0) / scale();
  if (!d.moved){ if (st.collapsed){ st.collapsed = false; } }
  else if (dy > 40) st.collapsed = true;
  else if (dy < -40) st.collapsed = false;
  render();
};
remote.addEventListener('pointerup', endRemote);
remote.addEventListener('pointercancel', endRemote);

/* ---------- song tags ---------- */
const ov = $p('#pl-tag-ov');
let draft = [];
function recs(){ return REC_POOL.filter(t => !draft.some(d => d.toLowerCase() === t.toLowerCase())).slice(0, 3); }
function renderTags(){
  $p('#pl-cur').innerHTML = draft.length
    ? draft.map((t, i) => `<button class="pchip" data-rm="${i}" aria-label="Remove ${esc(t)}"><img src="assets/node/tag-x.svg" alt="">${esc(t)}</button>`).join('')
    : `<p class="none t-caption">No tags yet</p>`;
  $p('#pl-rec').innerHTML = recs().map(t => `<button class="pchip" data-addtag="${esc(t)}">${esc(t)}</button>`).join('');
  $p('[data-confirm]').disabled = draft.join('|') === st.tags.join('|');
}
function openTags(){ draft = st.tags.slice(); $p('#pl-tag-in').value = ''; renderTags(); ov.classList.add('on'); }
ov.addEventListener('click', e => {
  if (e.target === ov || e.target.closest('[data-close]')){ ov.classList.remove('on'); return; }
  const rm = e.target.closest('[data-rm]'); if (rm){ draft.splice(+rm.dataset.rm, 1); renderTags(); return; }
  const ad = e.target.closest('[data-addtag]'); if (ad){ draft.push(ad.dataset.addtag); renderTags(); return; }
  if (e.target.closest('[data-confirm]')){ st.tags = draft.slice(); ov.classList.remove('on'); render(); }
});
// typing a tag and pressing return adds it
$p('#pl-tag-in').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const t = e.target.value.trim().replace(/\s+/g, ' ');
  if (t && !draft.some(d => d.toLowerCase() === t.toLowerCase())){ draft.push(t.length > 18 ? t.slice(0, 18) : t); e.target.value = ''; renderTags(); }
});

/* ---------- mini player (Figma 1003:19676) ----------
   Shows on the four tab landing pages (we assume something is always playing), tucked just above the nav bar.
   Tapping it slides the full player up; Back slides it down to the page it came from. */
const tabs = app.querySelectorAll('.tabbar .tab');
const LAND = new Set(['view-home', 'view-community', 'view-nodes', 'view-profile']);
const mini = document.createElement('div');
mini.className = 'mini-pl'; mini.setAttribute('role', 'region'); mini.setAttribute('aria-label', 'Now playing');
mini.innerHTML = `
  <button class="mp-open" data-open aria-label="Open the player: ${esc(SONG.title)} by ${esc(SONG.artist)}"><span class="t-header">${esc(SONG.title)}</span><span class="t-body">${esc(SONG.artist)}</span></button>
  <button class="mp-btn" data-madd aria-label="Add to playlist"><img src="${P}mini-add.svg" alt=""></button>
  <button class="mp-btn" data-mplay aria-label="Play"><img src="${P}mini-play.svg" alt=""></button>
  <div class="mp-bar" aria-hidden="true"><i></i></div>`;
app.querySelector('.tabbar').before(mini);
function renderMini(){
  mini.querySelector('[data-mplay] img').src = `${P}mini-${st.playing ? 'pause' : 'play'}.svg`;
  mini.querySelector('[data-mplay]').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
  mini.querySelector('[data-madd] img').src = `${P}mini-add${st.add ? '-on' : ''}.svg`;
  mini.querySelector('[data-madd]').setAttribute('aria-pressed', st.add);
  mini.querySelector('.mp-bar i').style.width = `${(st.pos * 100).toFixed(2)}%`;
}
mini.addEventListener('click', e => {
  if (e.target.closest('[data-open]')) return openPlayer();
  if (e.target.closest('[data-mplay]')){ st.playing = !st.playing; render(); renderMini(); return; }
  if (e.target.closest('[data-madd]')){ st.add = !st.add; render(); renderMini(); }
});
// keep the mini player in step with the full one (its buttons share the same state)
remote.addEventListener('click', () => requestAnimationFrame(renderMini));
// show it only while a landing page is the current screen
function syncMini(){
  const on = !!current && LAND.has(current.id);
  mini.classList.toggle('on', on);
  app.classList.toggle('mini-on', on);
}
setInterval(syncMini, 120);
// while playing, the progress line creeps along
let lastT = performance.now();
(function tick(now){
  if (st.playing){ st.pos = (st.pos + (now - lastT) / 1000 / 222) % 1; mini.querySelector('.mp-bar i').style.width = `${(st.pos * 100).toFixed(2)}%`; }
  lastT = now; requestAnimationFrame(tick);
})(lastT);

let from = null;
function openPlayer(){
  if (current === v) return;
  from = current;
  v.style.transition = 'none'; v.classList.remove('offright', 'offleft'); v.classList.add('offdown', 'on-top'); v.offsetHeight; v.style.transition = '';
  requestAnimationFrame(() => v.classList.remove('offdown'));
  current = v; syncMini();
}
function hideNow(){
  v.style.transition = 'none'; v.classList.remove('offdown', 'on-top'); v.classList.add('offright'); v.offsetHeight; v.style.transition = '';
}
function closePlayer(){
  if (current !== v) return;
  v.classList.add('offdown');
  current = from || home; from = null; syncMini();
  setTimeout(() => { if (current !== v) hideNow(); }, 600);
}
// switching tabs from the full player: drop it instantly and let the tab do its usual thing
document.addEventListener('click', e => {
  if (current !== v || !e.target.closest('.tabbar .tab')) return;
  hideNow(); current = from || home; from = null;
}, true);
$p('[data-back]').addEventListener('click', closePlayer);
document.getElementById('restart')?.addEventListener('click', () => { if (current === v){ hideNow(); current = home; } ov.classList.remove('on'); });

render(); renderMini();
window.tonoPlayer = {open:openPlayer, close:closePlayer, get state(){ return {...st, tags:st.tags.slice()}; }};
})();
