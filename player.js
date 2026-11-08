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
    <button class="view-changer" data-view aria-label="Change view"><img src="${P}dots-1.svg" alt=""></button>
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
  $p('.view-changer img').src = `${P}dots-${VIEWS.indexOf(st.view) + 1}.svg`;
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

/* or swipe sideways across the player (or the dots): left = next view, right = previous */
let sw = null;
v.addEventListener('pointerdown', e => {
  if (e.button || e.target.closest('#pl-remote, #pl-tag-ov, [data-back]')) return;
  sw = {x:e.clientX, y:e.clientY};
});
v.addEventListener('pointerup', e => {
  if (!sw) return;
  const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
  const i = VIEWS.indexOf(st.view) + (dx < 0 ? 1 : -1);
  if (i >= 0 && i < VIEWS.length){ st.view = VIEWS[i]; render(); }
  // a swipe that ends on the dots isn't also a tap on them
  const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
  window.addEventListener('click', stop, {capture:true, once:true});
  setTimeout(() => window.removeEventListener('click', stop, {capture:true}), 0);
});
v.addEventListener('pointercancel', () => { sw = null; });
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

/* ---------- tab bar: Discovery ⇄ Player ---------- */
const tabs = app.querySelectorAll('.tabbar .tab');
const setTab = name => tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
function openPlayer(){
  if (current === v) return;
  // leave any sub-screen (playlist, catalogue, drop-off) without animating Home in first
  if (current !== home){
    const sub = current;
    sub.style.transition = 'none'; sub.classList.add('offright'); sub.classList.remove('on-top');
    requestAnimationFrame(() => { sub.style.transition = ''; });
    home.classList.remove('offleft'); current = home;
  }
  setTab('player'); push(v);
}
function closePlayer(){ setTab('discovery'); goHome(); }
tabs.forEach(t => t.addEventListener('click', () => {
  if (t.dataset.tab === 'player') openPlayer();
  else if (t.dataset.tab === 'discovery' && current === v) closePlayer();
  else if (t.dataset.tab === 'discovery' && current !== home) goHome();
}));
$p('[data-back]').addEventListener('click', closePlayer);
document.getElementById('restart')?.addEventListener('click', () => { setTab('discovery'); ov.classList.remove('on'); });

render();
window.tonoPlayer = {open:openPlayer, get state(){ return {...st, tags:st.tags.slice()}; }};
})();
