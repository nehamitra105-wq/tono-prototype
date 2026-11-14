/* =========================================================
   NOTIFICATIONS (Figma 1363:6708) — the bell on Home (Figma 1352:33812)
   All / Unread (n) chips, Mark all as read; tapping a row marks it read.
   Uses Messages' page stack (tonoMsgs.go / back) so Back returns to Home.
   ========================================================= */
(() => {
const N = 'assets/notif/', M = 'assets/msg/';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fresh = () => [
  {who:'Maya', what:'liked your response', when:'1h ago', img:'n-maya.png', unread:true},
  {who:'4dean', what:'replied to your question', when:'1h ago', img:'n-4dean.png', unread:true},
  {who:'Theo', what:'followed you', when:'4h ago', img:'n-theo.png', unread:true},
  {who:'donT', what:'followed you', when:'6h ago', img:'n-dont.png'},
  {who:'4dean', what:'asked a new question', when:'19h ago', img:'n-4dean.png'},
  {who:'Mark', what:'liked your response', when:'1d ago', img:'n-mark.png'},
  {who:'Daniel', what:'followed you', when:'1d ago', img:'n-daniel.png'},
  {who:'Daniel', what:'liked your response', when:'1d ago', img:'n-daniel.png'},
  {who:'ronz', what:'replied to your question', when:'2d ago', img:'n-ronz.png'},
];
let items = fresh(), tab = 'all';

const v = document.createElement('section');
v.className = 'view msg-view msg-layer offright'; v.id = 'view-notifs'; v.setAttribute('aria-label', 'Notifications');
document.getElementById('view-drop').before(v);
v.innerHTML = `
  <div class="msg-title"><button data-nback aria-label="Back"><img src="${M}caret-left.svg" alt=""></button><p class="t-header">Notifications</p></div>
  <div class="nf-body">
    <div class="nf-bar"><div class="nf-chips"></div><button class="nf-mark t-caption" data-nmark>Mark all as read</button></div>
    <div class="nf-list"></div>
  </div>`;

const unread = () => items.filter(n => n.unread).length;
function render(){
  const u = unread();
  v.querySelector('.nf-chips').innerHTML = `<button class="nf-chip t-caption ${tab === 'all' ? 'on' : ''}" data-ntab="all">All</button><button class="nf-chip t-caption ${tab === 'unread' ? 'on' : ''}" data-ntab="unread">Unread (${u})</button>`;
  v.querySelector('[data-nmark]').disabled = !u;
  const list = items.map((n, i) => ({n, i})).filter(({n}) => tab === 'all' || n.unread);
  v.querySelector('.nf-list').innerHTML = list.length
    ? list.map(({n, i}) => `<button class="nf-row ${n.unread ? 'unread' : ''}" data-n="${i}"><img src="${N}${n.img}" alt="">
        <span class="tx"><span class="t-body"><b>${esc(n.who)}</b> ${esc(n.what)}</span><span class="t-caption">${esc(n.when)}</span></span><i class="dot" aria-hidden="true"></i></button>`).join('')
    : `<p class="t-body nf-empty">You're all caught up</p>`;
  bell?.classList.toggle('has-msg', u > 0);
}
v.addEventListener('click', e => {
  if (e.target.closest('[data-nback]')) return window.tonoMsgs.back();
  const t = e.target.closest('[data-ntab]'); if (t){ tab = t.dataset.ntab; render(); return; }
  if (e.target.closest('[data-nmark]')){ items.forEach(n => { n.unread = false; }); render(); return; }
  const r = e.target.closest('[data-n]'); if (r){ items[+r.dataset.n].unread = false; render(); }
});

/* Home: the bell sits between search and messages (dot while anything is unread) */
const actions = document.querySelector('#view-home .head-actions');
const bell = document.createElement('button');
bell.className = 'btn-search'; bell.setAttribute('aria-label', 'Notifications');
bell.innerHTML = `<img src="assets/home2/glyph-bell.svg" alt="">`;
actions?.querySelector('[aria-label="Messages"]')?.before(bell);
bell.addEventListener('click', () => { tab = 'all'; render(); v.querySelector('.nf-list').scrollTop = 0; window.tonoMsgs.go(v); });

document.getElementById('restart')?.addEventListener('click', () => {
  items = fresh(); tab = 'all'; render();
  v.style.transition = 'none'; v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); v.offsetHeight; v.style.transition = '';
});
render();
})();
