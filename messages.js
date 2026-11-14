/* =========================================================
   MESSAGES (Figma section 1174:8959) — the message icon on Home opens these.
   Flow 1, ask (top row):  Messages → Maya → + → Request mixtape → write what you want → send
                           → your letter + View Question → Maya replies with a mixtape.
   Flow 2, answer (bottom row): Requests → Emilie → her letter → View Question
                           → Curate a mixtape (drop.js) → decorate the CD → Send → back in the chat.
   ========================================================= */
(() => {
const M = 'assets/msg/';
const app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ME = M + 'pfp-me.png';
const SANDRA_Q = 'Hi! I saw that your into kpop, I just wanted to ask what are the best house-esq songs in 3rd to 5th gen kpop?';
const MAYA_NOTE = 'Hiiii glad u reached out! here’s a few songs that i think fits the vibe! lmk what you think about XG, I LOVE them!';
const MAYA_MIX = [
  {t:'Hypnotize', a:'XG', img:M + 's-hypnotize.png'}, {t:'404 (New Era)', a:'KiiiKiii', img:M + 's-404.png'},
  {t:'Whiplash', a:'aespa', img:M + 's-whiplash.png'}, {t:'Perfect Night', a:'Le Sserafim', img:'assets/drop/art-perfect-night.png'},
];
const fresh = () => ({
  maya:{name:'Maya', handle:'@QuietMango42', ava:M + 'ava-maya.png', pfp:M + 'pfp-maya.png',
    thread:[{me:false, t:'did u see XG dropped a new single??'}, {me:true, t:'omg not yet, is it good'}, {me:false, t:'it’s SO good. the chorus has been on repeat all day'}], unread:1},
  elias:{name:'Elias', handle:'@neon_drifter', ava:M + 'ava-elias.png', pfp:M + 'ava-elias.png', thread:[{me:false, t:'that playlist you made was so good'}]},
  sofia:{name:'Sofia', handle:'@PixelFox88', ava:M + 'ava-sofia.png', pfp:M + 'ava-sofia.png', thread:[{me:true, t:'see u at the show friday!'}]},
  theo:{name:'Theo', handle:'@cosmic.pancake', ava:M + 'ava-theo.png', pfp:M + 'ava-theo.png', thread:[{me:false, t:'ok this song is stuck in my head now'}]},
  sandra:{name:'Emilie', handle:'@supanova', ava:M + 'pfp-sandra.png', pfp:M + 'pfp-sandra.png', request:true,   // her own face, so she doesn't read as Maya
    thread:[{me:true, t:'hey! saw your post in Community'}, {me:false, t:'omg hi!! sending u a question'}, {me:false, letter:true, q:SANDRA_Q}]},
});
let P = fresh(), who = null, tab = 'all', answered = false;

/* ---------- views (above the tab bar; under the curate pages from drop.js) ---------- */
function view(id, label){
  const v = document.createElement('section');
  v.className = 'view msg-view msg-layer offright'; v.id = id; v.setAttribute('aria-label', label);
  return v;
}
const vIn = view('view-msgs', 'Messages'), vChat = view('view-chat', 'Chat');
const drop = document.getElementById('view-drop'), fin = document.getElementById('view-drop-final');
drop.before(vIn, vChat);
[drop, fin].forEach(v => v.classList.add('msg-layer'));

const stack = [];
function go(v){
  if (current === home) stack.length = 0;
  v.style.transition = 'none'; v.classList.remove('offleft'); v.classList.add('offright'); v.offsetHeight; v.style.transition = '';
  stack.push(current); push(v);
}
function back(){
  const prev = stack.pop();
  if (!prev || prev === home){ stack.length = 0; goHome(); return; }
  const leaving = current;
  leaving.classList.add('offright'); prev.classList.remove('offleft'); current = prev;
  if (prev === vIn) renderInbox();   // read counts + last messages are fresh when you come back
  setTimeout(() => leaving.classList.remove('on-top'), 600);
}
// after Send: the two curate pages leave together and the chat slides back in
function backTo(target){
  while (stack.length && stack[stack.length - 1] !== target){
    const v = stack.pop(); if (v === home) break;
    v.style.transition = 'none'; v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); v.offsetHeight; v.style.transition = '';
  }
  back();
}

/* ---------- inbox (Figma 1204:10800) ---------- */
vIn.innerHTML = `
  <div class="msg-title"><button data-mback aria-label="Back"><img src="${M}caret-left.svg" alt=""></button><p class="t-header">Messages</p></div>
  <div class="mi-body">
    <label class="mi-search"><img src="${M}magnifying-glass.svg" alt=""><input type="text" placeholder="Search chat..." aria-label="Search chat"></label>
    <div class="mi-tabs"></div>
    <div class="mi-list"></div>
  </div>
  <div class="mc-bar"><span class="mc-plus"><img src="${M}plus.svg" alt=""></span><div class="mc-box"><div class="mc-line"><textarea rows="1" placeholder="Message..." aria-label="Message"></textarea></div></div></div>`;
// the inbox shows the last message in each chat ("You: …" when it was yours)
const lastLine = p => {
  const th = p.thread.filter(m => !m.typing), m = th[th.length - 1]; if (!m) return '';
  return m.letter ? (m.me ? 'You sent a question' : 'Sent you a question') : m.mix ? (m.me ? 'You sent a mixtape' : 'Sent you a mixtape') : (m.me ? `You: ${m.t}` : m.t);
};
function renderInbox(){
  const reqs = Object.values(P).filter(p => p.request && !answered).length;
  vIn.querySelector('.mi-tabs').innerHTML = `
    <button class="t-body ${tab === 'all' ? 'on' : ''}" data-tab-msg="all">Chats</button>
    <button class="t-body ${tab === 'req' ? 'on' : ''}" data-tab-msg="req">Requests${reqs ? `<span class="n">${reqs}</span>` : ''}</button>`;
  const q = vIn.querySelector('.mi-search input').value.trim().toLowerCase();
  const list = Object.entries(P).filter(([, p]) => (tab === 'req' ? p.request : !p.request || answered) && (!q || (p.name + p.handle).toLowerCase().includes(q)));
  vIn.querySelector('.mi-list').innerHTML = list.length ? list.map(([id, p]) => `
    <button class="mi-row" data-who="${id}"><img src="${p.ava}" alt="">
      <span class="who"><span class="t-header">${esc(p.name)}</span><span class="t-body ${(p.request && !answered) || p.unread ? '' : 'sub'}">${esc(lastLine(p))}</span></span>
      ${p.unread ? `<span class="mi-unread" aria-label="${p.unread} unread">${p.unread}</span>` : p.request && !answered ? '<span class="dot" aria-label="New"></span>' : ''}</button>`).join('')
    : `<p class="t-body mi-empty">${tab === 'req' ? 'No requests right now' : 'No chats found'}</p>`;
}
vIn.addEventListener('click', e => {
  if (e.target.closest('[data-mback]')) return back();
  const t = e.target.closest('[data-tab-msg]'); if (t){ tab = t.dataset.tabMsg; renderInbox(); return; }
  const r = e.target.closest('[data-who]'); if (r) openChat(r.dataset.who);
});
vIn.querySelector('.mi-search input').addEventListener('input', renderInbox);
function openInbox(){ tab = 'all'; vIn.querySelector('.mi-search input').value = ''; renderInbox(); go(vIn); }

/* ---------- chat ---------- */
vChat.innerHTML = `
  <div class="msg-title"><button data-mback aria-label="Back"><img src="${M}caret-left.svg" alt=""></button><p class="t-header"></p></div>
  <div class="mc-thread" aria-live="polite"></div>
  <div class="mc-menu" role="menu">
    <button role="menuitem" data-att="camera"><img src="${M}camera.svg" alt=""><span class="t-body">Camera</span></button>
    <button role="menuitem" data-att="photos"><img src="${M}image.svg" alt=""><span class="t-body">Photos</span></button>
    <button role="menuitem" data-att="stickers"><img src="${M}smiley-sticker.svg" alt=""><span class="t-body">Stickers</span></button>
  </div>
  <div class="mc-bar">
    <button class="mc-plus" data-plus aria-label="Attach"><img src="${M}plus.svg" alt=""></button>
    <!-- requesting a mixtape lives right in the bar now (Figma 1204:10968) -->
    <button class="mc-disc" data-req aria-label="Request a mixtape" aria-pressed="false"><img src="${M}disc.svg" alt=""></button>
    <div class="mc-box">
      <div class="att"><img src="${M}letter.png" alt="Mixtape request"></div>
      <div class="mc-line"><textarea rows="1" placeholder="Message..." aria-label="Message"></textarea>
        <button class="mc-send" data-send aria-label="Send"><img src="${M}paper-plane.svg" alt=""></button></div>
    </div>
  </div>`;
const thread = vChat.querySelector('.mc-thread'), bar = vChat.querySelector('.mc-bar'), menu = vChat.querySelector('.mc-menu'), ta = vChat.querySelector('textarea');
function bubble(m, p, animate){
  const pfp = `<img class="pfp" src="${m.me ? ME : p.pfp}" alt="">`;
  let inner;
  if (m.letter) inner = `<img class="mc-letter" src="${M}letter.png" alt="Mixtape request"><button class="btn btn-primary t-body mc-q" data-view-q>View Question</button>`;
  else if (m.mix) inner = `<button class="mc-mix" data-open-mix aria-label="Open mixtape"><img src="${M}mixtape.png" alt="">${m.color ? `<span class="tint" style="background:${m.color}"></span>` : ''}</button>${m.t ? `<p class="bub t-body">${esc(m.t)}</p>` : ''}`;
  else if (m.typing) inner = `<p class="bub mc-typing" aria-label="typing"><i></i><i></i><i></i></p>`;
  else inner = `<p class="bub t-body">${esc(m.t)}</p>`;
  const idx = p.thread.indexOf(m);
  return `<div class="mc-row ${m.me ? 'me' : ''} ${animate ? 'in' : ''}" data-m="${idx}">${m.me ? '' : pfp}<div class="stack">${inner}</div>${m.me ? pfp : ''}</div>`;
}
function renderChat(animateLast){
  const p = P[who];
  vChat.querySelector('.msg-title p').textContent = p.name;
  thread.innerHTML = p.thread.map((m, i) => bubble(m, p, animateLast && i === p.thread.length - 1)).join('');
  requestAnimationFrame(() => thread.scrollTo({top:thread.scrollHeight, behavior:animateLast ? 'smooth' : 'auto'}));
}
function setComposer(mode){
  bar.classList.toggle('letter', mode === 'letter');
  bar.querySelector('[data-req]').setAttribute('aria-pressed', mode === 'letter');
  ta.placeholder = mode === 'letter' ? 'What songs are you looking for?' : P[who].asked ? 'What do you want song recs for?' : 'Message...';
  syncSend();
}
function syncSend(){
  const typed = ta.value.trim().length > 0;
  bar.classList.toggle('typed', typed);
  bar.classList.toggle('ready', typed);
  ta.style.height = 'auto'; ta.style.height = Math.min(96, ta.scrollHeight) + 'px';
}
function toggleMenu(on){ menu.classList.toggle('on', on); bar.classList.toggle('menu', on); }
function openChat(id){
  who = id; P[id].unread = 0;   // opening the chat reads it
  ta.value = ''; toggleMenu(false); setComposer('text'); renderChat(false); go(vChat);
}
function add(m){ P[who].thread.push(m); renderChat(true); }
ta.addEventListener('input', syncSend);
ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
function send(){
  const t = ta.value.trim(), letter = bar.classList.contains('letter');
  if (!t) return;
  const p = P[who];
  ta.value = ''; setComposer('text');
  if (letter){
    add({me:true, letter:true, q:t}); p.asked = t; setComposer('text');
    // Maya answers the request with a mixtape (Figma 1222:11449)
    const target = who;
    setTimeout(() => { if (who !== target) return; add({me:false, typing:true}); }, 1400);
    setTimeout(() => {
      const th = P[target].thread; const ti = th.findIndex(m => m.typing); if (ti >= 0) th.splice(ti, 1);
      th.push({me:false, mix:MAYA_MIX, t:MAYA_NOTE});
      if (who === target) renderChat(true);
    }, 3600);
  } else add({me:true, t});
}
vChat.addEventListener('click', e => {
  if (e.target.closest('[data-mback]')){ toggleMenu(false); return back(); }
  if (e.target.closest('[data-plus]')){ toggleMenu(!menu.classList.contains('on')); return; }
  // the disc in the bar turns the message into a mixtape request (tap again to go back to a normal message)
  if (e.target.closest('[data-req]')){ toggleMenu(false); const on = !bar.classList.contains('letter'); setComposer(on ? 'letter' : 'text'); if (on) ta.focus({preventScroll:true}); return; }
  const a = e.target.closest('[data-att]');
  if (a){ toggleMenu(false); if (a.dataset.att === 'mixtape'){ setComposer('letter'); ta.focus({preventScroll:true}); } return; }
  if (e.target.closest('[data-unatt]')){ setComposer('text'); return; }
  if (e.target.closest('[data-send]')){ send(); return; }
  const q = e.target.closest('[data-view-q]');
  if (q){
    const m = P[who].thread[+q.closest('[data-m]').dataset.m];
    if (!m.me && !m.answered) return window.tonoDrop?.openFor({user:P[who].handle.slice(1), pfp:P[who].pfp, q:m.q});
    return showSheet('Question', `<div class="q"><div class="by"><img src="${m.me ? ME : P[who].pfp}" alt=""><span class="t-caption">${m.me ? 'you' : esc(P[who].handle.slice(1))}</span></div><p class="t-body">${esc(m.q)}</p></div>`);
  }
  const mx = e.target.closest('[data-open-mix]');
  if (mx){
    const m = P[who].thread[+mx.closest('[data-m]').dataset.m];
    showSheet('Mixtape', `<div class="mx-list">${m.t ? `<p class="t-body">${esc(m.t)}</p>` : ''}${m.mix.map(s => `<div class="mx-row">${s.img ? `<img src="${s.img}" alt="">` : '<span class="ph"></span>'}
      <div class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption">${esc(s.a)}</p></div>
      <button class="mx-more" data-mx-more aria-label="More for ${esc(s.t)}"><i class="cm-ic" style="--i:url(assets/community/ph/dots-three.svg)"></i></button></div>`).join('')}</div>`);
    return;
  }
  if (menu.classList.contains('on') && !e.target.closest('.mc-menu')) toggleMenu(false);
});

/* ---------- a sheet for questions and mixtapes ---------- */
const sw = document.createElement('div');
sw.className = 'mc-sheet-wrap';
sw.innerHTML = `<div class="bd" data-sclose></div><div class="mc-sheet" role="dialog"><span class="grab"></span>
  <div class="hd"><p class="t-header"></p><button data-sclose aria-label="Close"><img src="${M}x.svg" alt=""></button></div><div class="body"></div></div>`;
app.appendChild(sw);
function showSheet(title, html){ sw.querySelector('.t-header').textContent = title; sw.querySelector('.body').innerHTML = html; sw.classList.add('open'); }
sw.addEventListener('click', e => {
  if (e.target.closest('[data-sclose]')) sw.classList.remove('open');
  if (e.target.closest('[data-mx-more]')){ mxActs.offsetHeight; mxActs.classList.add('open'); }
});
/* the ⋯ on a mixtape song: the same song-actions sheet as Community's, over the mixtape */
const mxActs = document.createElement('div');
mxActs.className = 'cm-ov mx-acts';
mxActs.innerHTML = `<div class="bd" data-close></div><div class="cm-sheet acts">${[['heart', 'Add to liked songs'], ['plus', 'Add to playlist'], ['music-notes-plus', 'Add to queue'], ['share', 'Share']]
  .map(([i, l]) => `<button class="cm-act t-body" data-close><i class="cm-ic" style="--i:url(assets/community/ph/${i}.svg)"></i>${l}</button>`).join('')}</div>`;
app.appendChild(mxActs);
mxActs.addEventListener('click', e => { if (e.target.closest('[data-close]')) mxActs.classList.remove('open'); });

/* ---------- after Curate a mixtape → Send (called by drop.js) ---------- */
function mixtapeSent({picks, color, note}){
  answered = true;
  const th = P[who].thread, q = th.find(m => m.letter && !m.me); if (q) q.answered = true;
  th.push({me:true, mix:picks.map(s => ({t:s.t, a:s.a, img:s.art})), color, t:note});
  renderChat(true);
  backTo(vChat);
  renderInbox(); syncHomeBadge();
}

/* ---------- Home: the message icon (dot while a request is waiting) ---------- */
const homeBtn = document.querySelector('#view-home .head-actions [aria-label="Messages"]');
function syncHomeBadge(){ homeBtn?.classList.toggle('has-msg', !answered); }
homeBtn?.addEventListener('click', openInbox);
syncHomeBadge();

document.getElementById('restart')?.addEventListener('click', () => {
  P = fresh(); who = null; answered = false; stack.length = 0; sw.classList.remove('open');
  [vIn, vChat].forEach(v => { v.style.transition = 'none'; v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); v.offsetHeight; v.style.transition = ''; });
  syncHomeBadge();
});
// Message from someone's profile: open (or start) a chat with them
function openWith({name, handle, img}){
  const id = 'u_' + handle.replace(/\W/g, '').toLowerCase();
  if (!P[id]) P[id] = {name, handle, ava:img, pfp:img, thread:[]};
  openChat(id);
}
window.tonoMsgs = {openInbox, openChat, openWith, go, back, mixtapeSent};
})();
