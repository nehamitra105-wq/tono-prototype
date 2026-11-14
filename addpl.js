/* =========================================================
   ADD TO PLAYLIST — one sheet for every "Add to playlist" in the app
   (Home song ⋯, Community ⋯, mixtape ⋯, Deep Search output ⋯, the player's +).
   Pick one or more of your playlists → the check in the top right adds the song,
   the sheet closes, then a pop-up says “Added to ‘name’”.
   ========================================================= */
(() => {
const H = 'assets/home2/';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// your own playlists (covers borrowed from the art already in the prototype)
const MINE = [
  {name:'late night drives', n:42, art:['cs1', 'cs2', 'cs3', 'cs4']},
  {name:'winter 2026', n:18, art:['pc4-1', 'pc4-3', 'pc4-4', 'pc4-2']},
  {name:'study', n:57, art:['fo1', 'fo4', 'fo3', 'fo2']},
  {name:'sad girl autumn', n:23, art:['pc2-1', 'pc2-3', 'pc2-4', 'pc2-2']},
  {name:'gym', n:31, art:['pc3-1', 'pc3-3', 'pc3-4', 'pc3-2']},
  {name:'Rainy Days', n:10, art:['rd1', 'rd3', 'rd4', 'rd2']},
];
const app = document.getElementById('app');
const w = document.createElement('div');
w.className = 'apl-wrap'; w.setAttribute('aria-hidden', 'true');
w.innerHTML = `<div class="bd" data-apl-close></div>
  <div class="apl-sheet" role="dialog" aria-label="Add to playlist">
    <div class="hd"><button class="x" data-apl-close aria-label="Close"><i class="ic" style="--i:url(assets/community/ph/x.svg)"></i></button><p class="t-header">Add to playlist</p>
      <button class="ok" data-apl-ok aria-label="Done" disabled><i class="ic" style="--i:url(assets/deep/ph-check.svg)"></i></button></div>
    <div class="song"></div>
    <div class="list"></div>
  </div>`;
app.appendChild(w);
// the pop-up carries the logo of the streaming service you play through (Spotify, set in Profile → Streaming)
const toastEl = document.createElement('p');
toastEl.className = 'apl-toast t-body'; toastEl.setAttribute('role', 'status');
toastEl.innerHTML = `<img src="assets/player/spotify.png" alt="Spotify"><span></span>`;
app.appendChild(toastEl);

let picked = new Set(), onDone = null;
const draw = () => {
  w.querySelector('.list').innerHTML = MINE.map((p, i) => `<button class="row ${picked.has(i) ? 'on' : ''}" data-apl="${i}" aria-pressed="${picked.has(i)}">
    <span class="grid">${p.art.map(a => `<img src="${H}${a}.png" alt="">`).join('')}</span>
    <span class="tx"><span class="t-body">${esc(p.name)}</span><span class="t-caption">${p.n} songs</span></span>
    <i class="box" aria-hidden="true"></i></button>`).join('');
  w.querySelector('[data-apl-ok]').disabled = !picked.size;
};
function open(song, done){
  picked = new Set(); onDone = done || null;
  w.querySelector('.song').innerHTML = song && song.t ? `${song.img ? `<img src="${esc(song.img)}" alt="">` : ''}<span class="tx"><span class="t-body">${esc(song.t)}</span>${song.a ? `<span class="t-caption">${esc(song.a)}</span>` : ''}</span>` : '';
  w.querySelector('.song').hidden = !(song && song.t);
  draw(); w.querySelector('.list').scrollTop = 0;
  w.offsetHeight; w.classList.add('open'); w.setAttribute('aria-hidden', 'false');
}
function close(){ w.classList.remove('open'); w.setAttribute('aria-hidden', 'true'); }
let toastT = 0;
function toast(msg){
  clearTimeout(toastT); toastEl.querySelector('span').textContent = msg; toastEl.classList.add('on');
  toastT = setTimeout(() => toastEl.classList.remove('on'), 2400);
}
w.addEventListener('click', e => {
  if (e.target.closest('[data-apl-close]')) return close();
  const r = e.target.closest('[data-apl]');
  if (r){ const i = +r.dataset.apl; picked.has(i) ? picked.delete(i) : picked.add(i); draw(); return; }
  if (e.target.closest('[data-apl-ok]') && picked.size){
    const names = [...picked].sort((a, b) => a - b).map(i => MINE[i].name);
    close(); onDone?.(names);
    const msg = names.length === 1 ? `Added to ‘${names[0]}’` : names.length === 2 ? `Added to ‘${names[0]}’ and ‘${names[1]}’` : `Added to ‘${names[0]}’ and ${names.length - 1} more`;
    setTimeout(() => toast(msg), 420);   // once the sheet is down
  }
});

/* ---------- hooks: whichever "Add to playlist" was tapped opens this sheet ---------- */
// remember which song a ⋯ belonged to (Home card, mixtape row, Community reply)
let last = null;
document.addEventListener('click', e => {
  const more = e.target.closest('[data-more], [data-mx-more]'); if (!more) return;
  const row = more.closest('.album, .mx-row, .qa-song, .qa-item, li, .cm-q') || more.parentElement;
  const t = row?.querySelector('.title, .names .t-body, .t-body'), a = row?.querySelector('.artist, .names .t-caption, .t-caption');
  const img = row?.querySelector('img.cover, img');
  last = t ? {t:t.textContent.trim(), a:a?.textContent.trim(), img:img?.getAttribute('src')} : null;
}, true);
// Home song sheet, Community ⋯ sheet, mixtape ⋯ sheet: the row labelled "Add to playlist"
document.addEventListener('click', e => {
  const b = e.target.closest('#sheet [data-act="playlist"], .cm-act');
  if (!b || !/add to playlist/i.test(b.textContent)) return;
  const song = last;
  setTimeout(() => open(song), 300);   // let the first sheet drop away
});
window.tonoAddToPlaylist = open;
document.getElementById('restart')?.addEventListener('click', () => { close(); toastEl.classList.remove('on'); });
})();
