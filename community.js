/* =========================================================
   COMMUNITY — follows the Figma prototype (section 861:7443):
   Community ─ Pit Stop → pop-up (search a song → pick → Drop Off) → map pans to Jackson Heights, song pin shows
             ├ map pin → song card (tap again to hide)
             ├ "People who match your vibe" card → their profile ("You both like …")
             ├ Ask a question → sheet → Post question → My Activity tab
             ├ For You / General / My Activity tabs
             └ "Songs for a 3am drive?" → Q&A thread ─ Reply → sheet (search song, note) → Submit → your reply on top (Newest)
   ========================================================= */
(() => {
const C = 'assets/community/', PH = C + 'ph/';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic = (n, cls = '') => `<i class="cm-ic ${cls}" style="--i:url(${PH}${n}.svg)"></i>`;
const app = document.getElementById('app');
const tabbar = app.querySelector('.tabbar');
const P = () => window.tonoProfile;

const LOCATION = 'Jackson Heights, Brooklyn, NY';
const PIT_SONGS = [
  {t:'Juicy', a:'Notorious B.I.G.', img:C + 'juicy-biggie.png'},
  {t:'Juicy', a:'Doja Cat ft. Tyga', img:C + 'juicy-doja.png'},
  {t:'Juicy', a:'Victoria Monet', img:C + 'juicy-vm.png'},
];
const REPLY_SONGS = [
  {t:'telepatia', a:'Kali Uchis', img:C + 'telepatia.png'},
  {t:'Telephone', a:'Lady Gaga ft. Beyonce', img:C + 'telephone.png'},
  {t:'Telephone Man', a:'Meri Wilson', img:C + 'telephone-man.png'},
];
const TOP = [
  {n:1, t:'Coney Island Baby', a:'Lou Reed', img:C + 't1.png', ml:31},
  {n:2, t:'Empire State of Mind', a:'Jay-Z, Alicia Keys', img:C + 't2.png', ml:37},
  {n:3, t:'What’s Next', a:'Drake', img:C + 't3.png', ml:41},
];
// Find other listeners (Figma 982:13993 / Follower List 981:10812)
const C2 = 'assets/comm2/';
const MATCHES = [
  {name:'Anthony', full:'Anthony Reia', ig:'@ace_anthony34', handle:'@cosmogalaxy', img:C2 + 'ava-anthony.png', pct:92, likes:'Malcom Todd · R&B · K-pop', following:false},
  {name:'Suzi', handle:'@supanova', img:C2 + 'ava-suzi.png', pct:87, likes:'Aespa · K-pop · Pop', following:false},
  {name:'Bella', handle:'@b3llaella', img:C2 + 'ava-bella.png', pct:83, likes:'Twice · K-pop', following:false},
  {name:'Tina', handle:'@evitina', img:C2 + 'ava-tina.png', pct:83, likes:'Stray Kids · K-pop', following:false},
  {name:'Sofia', handle:'@pixelFox88', img:C2 + 'ava-sofia.png', pct:79, likes:'Laufey · Hearts2Hearts', following:false},
  {name:'Naomi', handle:'@mossy_lantern', img:C2 + 'ava-naomi.png', pct:79, likes:'Laufey · IVE', following:false},
  {name:'Zara', handle:'@glitchbloom', img:C2 + 'ava-zara.png', pct:70, likes:'Laufey · Classical', following:false},
];
const QS = {
  fy:[
    {t:'Songs for a 3am drive?', img:C + 'fy1.png', n:'250 replies', open:true},
    {t:'Best song to cry to?', img:C + 'fy2.png', n:'146 replies'},
    {t:'Guys what song gives off a rainy st...', img:C + 'fy3.png', n:'89 replies'},
    {t:'Underrated songs from 2010s?', img:C + 'fy4.png', n:'75 replies'},
  ],
  gn:[
    {t:'What are some underrated Hallo...', img:C + 'gn1.png', n:'192 replies'},
    {t:'Songs that feel like a pumpkin spice l...', img:C + 'gn2.png', n:'146 replies'},
    {t:'I rly wanna get into heavy metal what...', img:C + 'gn3.png', n:'89 replies'},
    {t:'Best OSTs of all time???', img:C + 'gn4.png', n:'75 replies'},
  ],
};
const LIKED = [
  {u:'chaewon4eva', ava:C + 'u-chaewon.png', big:true, songs:[{t:'Perfect Night', a:'Le Sserafim', img:C + 'perfect-night.png'}], note:'I feel like this is the perf song for a late night drive that won’t make you sleepy!', likes:'2.2k'},
  {u:'eve._.alp', ava:C + 'u-eve.png', songs:[{t:'Night Train', a:'Milena', img:C + 'night-train.png'}, {t:'Midnight City', a:'M83', img:C + 'midnight-city.png'}], note:'I think this fits the vibe! hope u like ittt', likes:'1.2k'},
  {u:'han2han', ava:C + 'u-han.png', songs:[{t:'Late Night Lover', a:'三稜鏡', img:C + 'late-night-lover.png'}], note:'The vibes and vocals on this is emmaculate', likes:'976'},
];
const NEWEST = [
  {u:'cherryberri', ava:C + 'u-cherry.png', songs:[{t:'vapor rub', a:'thuy', img:C + 'vapor-rub.png'}], note:'the beat on this is so gooddd', likes:'136'},
  {u:'ppfpsja', ava:C + 'u-ppf.png', songs:[{t:'Sweetest Pie', a:'Megan Thee Stallion, Dua Lipa', img:C + 'sweetest-pie.png'}], note:'The perfect girls night carpool karaoke song', likes:'245'},
  {u:'lunamothhh', ava:C + 'u-luna.png', songs:[{t:'Sweet Venom', a:'Enhypen', img:C + 'sweet-venom.png'}], note:'Upbeat song and great if u like kpop!', likes:'245'},
];

const fresh = () => ({drops:{}, open:null, spot:0, tab:'fy', posted:[], sort:'liked', mine:null});
let st = fresh();

/* ---------- views ---------- */
function makeView(id, label){
  const v = document.createElement('section');
  v.className = 'view cm-view offright'; v.id = id; v.setAttribute('aria-label', label);
  tabbar.before(v); return v;
}
const vC = makeView('view-community', 'Community');
const vQA = makeView('view-qa', 'Q&A');

const qCard = (q, i) => `<${q.open ? 'button data-q' : 'div'} class="cm-q">
  <p class="ttl t-body">${esc(q.t)}</p>
  ${q.img ? `<img src="${q.img}" alt="">` : `<img src="${C}ma1.png" alt="">`}
  <p class="t-caption">${esc(q.n)}</p></${q.open ? 'button' : 'div'}>`;

function qaGrid(){
  if (st.tab === 'ma'){
    return st.posted.length ? st.posted.map(t => qCard({t, n:'0 replies'})).join('')
      : `<p class="cm-empty t-body cm-mut">You haven’t asked anything yet</p>`;
  }
  return QS[st.tab].map(qCard).join('');
}

// songs other listeners already left at the drop-off points out of your reach
const S = (t, a, img) => ({t, a, img:C + img});
const AREA = [
  null,
  S('Midnight City', 'M83', 'midnight-city.png'),
  S('Empire State of Mind', 'Jay-Z, Alicia Keys', 't2.png'),
  S('Late Night Lover', '三稜鏡', 'late-night-lover.png'),
  S('What’s Next', 'Drake', 't3.png'),
  S('Coney Island Baby', 'Lou Reed', 't1.png'),
  S('Sweetest Pie', 'Megan Thee Stallion, Dua Lipa', 'sweetest-pie.png'),
  null,
];
// one per red dot: the drop-off points closest to you offer "Add a song" (then show yours);
// every other dot already has a song someone else dropped there
function locCard(i){
  const d = st.drops[i] || (isNear(i) ? null : AREA[i]), where = SPOTS[i].name;
  const pos = HAS_MAP ? 'left:0;top:0' : 'left:45px;top:235px';
  const top = d ? `<div class="card">
      <div class="row">
        <div class="cv"><img src="${d.img}" alt=""><span class="dim"></span>${ic('play-circle')}</div>
        <div class="tx"><div><p class="t-body">${esc(d.t)}</p><p class="t-caption">${esc(d.a)}</p></div><p class="t-caption">${esc(where)}</p></div>
      </div>
      <span class="cm-dots">${ic('dots-three')}</span>
    </div>` : `<button class="ask-drop t-body" data-pit>${ic('music-notes-plus')}Add a song</button>`;
  return `<div class="cm-loc ${st.open === i ? 'open' : ''} ${i === 0 ? 'me' : ''}" style="${pos}" data-loc data-spot="${i}">
    ${top}
    <button class="pin" data-pin aria-label="${d ? `Song at ${esc(where)}` : `Add a song at ${esc(where)}`}"><img src="${C}marker-on.png" alt=""></button>
  </div>`;
}

/* ---------- live map (Leaflet + Esri dark gray tiles, tinted navy in CSS) ---------- */
const HAS_MAP = typeof L !== 'undefined';
const HOME_VIEW = {c:[40.73, -73.955], z:11.5};
// every red dot is a spot a song can be dropped at; the first is where the listener is (Pit Stop button / re-center)
const SPOTS = [
  {name:LOCATION, ll:[40.7557, -73.8831]},
  {name:'West New York, NJ', ll:[40.793, -74.012]},
  {name:'Chelsea, Manhattan, NY', ll:[40.748, -73.996]},
  {name:'Woodside, Queens, NY', ll:[40.744, -73.903]},
  {name:'East New York, Brooklyn, NY', ll:[40.664, -73.893]},
  {name:'Crown Heights, Brooklyn, NY', ll:[40.676, -73.951]},
  {name:'Harlem, Manhattan, NY', ll:[40.815, -73.943]},
  {name:'East Elmhurst, Queens, NY', ll:[40.761, -73.865]},
];
const JH = SPOTS[0].ll;
const ME = [JH[0] + .0045, JH[1] + .011];          // where the listener is (the person icon)
const NEAR_MI = 1;                                  // you can only drop a song at points this close
const distMi = (a, b) => {
  const r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(h));
};
const isNear = i => distMi(ME, SPOTS[i].ll) <= NEAR_MI;
let map = null; const markers = [];
function buildMap(){
  vC.innerHTML = `
  <div class="cm-map">
    <p class="cm-map-title t-header">Leave a song on the map</p>
    <div class="cm-search">${ic('magnifying-glass')}<input type="text" placeholder="Search location..." aria-label="Search location"></div>
    <div class="cm-leaf" id="cm-leaf">${HAS_MAP ? '' : `<img class="map" src="${C}map.png" alt="">`}</div>
    <div class="cm-tools">
      <button class="cm-pit" data-recenter aria-label="Re-center"><span class="cm-round">${ic('gps-fix')}</span><span class="t-caption">Re-center</span></button>
    </div>
  </div>
  <div class="cm-rest"></div>`;
  if (!HAS_MAP){ vC.querySelector('.cm-leaf').insertAdjacentHTML('beforeend', locCard(0)); return; }
  map = L.map(vC.querySelector('#cm-leaf'), {zoomControl:false, scrollWheelZoom:false, zoomSnap:0, zoomDelta:.5, attributionControl:true, minZoom:10, maxZoom:17,
    maxBounds:[[40.45, -74.35], [41.0, -73.6]], maxBoundsViscosity:.8}).setView(HOME_VIEW.c, HOME_VIEW.z);
  map.attributionControl.setPrefix('');
  // pinch to zoom: touch pinch is Leaflet's own; a trackpad pinch arrives as ctrl+wheel (Chrome/Edge/Firefox)
  // or as gesture events (Safari). A plain wheel still scrolls the page.
  const leaf = map.getContainer();
  const zoomBy = (dz, e) => map.setZoomAround(map.mouseEventToContainerPoint(e), map.getZoom() + dz, {animate:false});
  leaf.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault(); e.stopPropagation();
    zoomBy(-e.deltaY * .012, e);
  }, {passive:false});
  let gz = null;
  leaf.addEventListener('gesturestart', e => { e.preventDefault(); gz = map.getZoom(); });
  leaf.addEventListener('gesturechange', e => { e.preventDefault(); if (gz !== null) map.setZoomAround(map.mouseEventToContainerPoint(e), gz + Math.log2(e.scale), {animate:false}); });
  leaf.addEventListener('gestureend', e => { e.preventDefault(); gz = null; });
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  L.tileLayer(ESRI + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {maxNativeZoom:16, attribution:'Esri, HERE, Garmin, © OpenStreetMap'}).addTo(map);
  L.tileLayer(ESRI + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {maxNativeZoom:16, pane:'overlayPane', className:'cm-labels'}).addTo(map);
  SPOTS.forEach((p, i) => { markers[i] = L.marker(p.ll, {icon:spotIcon(i), keyboard:false, interactive:false}).addTo(map); });
  L.marker(ME, {icon:L.divIcon({className:'cm-me-icon', html:`<i class="cm-ic" style="--i:url(${C2}person.svg)"></i>`, iconSize:[24, 24], iconAnchor:[12, 12]}), keyboard:false, interactive:false}).addTo(map);
}
const spotIcon = i => L.divIcon({className:'cm-loc-icon', html:locCard(i), iconSize:[280, 110], iconAnchor:[140, 103]});
function refreshPin(){
  if (HAS_MAP) markers.forEach((m, i) => { m.setIcon(spotIcon(i)); m.setZIndexOffset(st.open === i ? 2000 : 0); });
  else { vC.querySelector('[data-loc]')?.remove(); vC.querySelector('.cm-leaf').insertAdjacentHTML('beforeend', locCard(0)); }
}
// show one spot's prompt/card at a time, on top of the other pins
function setOpen(i){
  clearTimeout(st._pinT); st.open = i;
  vC.querySelectorAll('[data-loc]').forEach(el => el.classList.toggle('open', +el.dataset.spot === i));
  markers.forEach((m, k) => m.setZIndexOffset(k === i ? 2000 : 0));
  if (i !== null && map) requestAnimationFrame(() => fitCard(i));
}
// nudge the map so the open song list isn't cut off by the map's edges or the search bar
function fitCard(i){
  const card = vC.querySelector(`[data-spot="${i}"] .card`); if (!card) return;
  const c = card.getBoundingClientRect(), m = map.getContainer().getBoundingClientRect();
  const top = m.top + 64, pad = 12;
  let dx = 0, dy = 0;
  if (c.top < top) dy = c.top - top;
  if (c.left < m.left + pad) dx = c.left - m.left - pad;
  else if (c.right > m.right - 56) dx = c.right - m.right + 56;
  if (dx || dy) map.panBy([dx, dy], {duration:.4});
}
function recenter(z){ if (map) map.flyTo(JH, z ?? (st.drops[0] ? 13 : HOME_VIEW.z), {duration:.8}); }

function renderC(){
  requestAnimationFrame(() => { placeInk(false); sizePane(); });
  if (!vC.querySelector('.cm-rest')) buildMap();
  vC.querySelector('.cm-rest').innerHTML = `
  <div class="cm-sec">
    <p class="t-header">Top 10 songs in Brooklyn</p>
    <div class="cm-scroll">${TOP.map(s => `<div class="cm-top"><p class="rank">${s.n}</p>
      <div class="it" style="margin-left:${s.ml}px"><img src="${s.img}" alt=""><div class="tx"><p class="t-body">${esc(s.t)}</p><p class="t-caption cm-mut">${esc(s.a)}</p>
      <button class="cm-dots" data-more aria-label="More actions">${ic('dots-three')}</button></div></div></div>`).join('')}</div>
  </div>
  <div class="cm-sec">
    <div class="cm-sec-hd"><p class="t-header">Find other listeners</p><button class="cm-view-more" data-listeners><span class="t-caption">View more</span>${ic('caret-left')}</button></div>
    <div class="cm-scroll">${MATCHES.slice(0, 5).map((m, i) => `<button class="cm-match" data-match="${i}"><img src="${m.img}" alt=""><p class="t-body">${esc(m.name)}</p><p class="t-caption cm-mut">${m.pct}% match</p></button>`).join('')}</div>
  </div>
  <div class="cm-sec" style="gap:24px" id="cm-qa">
    <div class="cm-ask"><p class="t-header">Crowd Q&amp;A</p><button class="cm-btn t-body" data-ask>${ic('plus')}Ask a question</button></div>
    <div class="cm-qa">
      <div class="cm-tabs t-body">${[['fy', 'For You'], ['gn', 'General'], ['ma', 'My Activity']].map(([k, l]) => `<button class="${st.tab === k ? 'on' : ''}" data-qtab="${k}">${l}</button>`).join('')}<span class="cm-ink"></span></div>
      <div class="cm-pane"><div class="cm-grid">${qaGrid()}</div></div>
      <p class="cm-more-link t-body cm-mut${st.tab === 'ma' ? ' off' : ''}">View more</p>
    </div>
  </div>`;
}

/* ---------- Q&A thread ---------- */
const songRow = (s, big, side = '') => `<div class="qa-song"><div class="cd">${big ? `<span class="big"><img src="${s.img}" alt=""></span>` : `<img src="${s.img}" alt="">`}
  <div class="tx"><p class="t-body">${esc(s.t)}</p><p class="t-caption cm-mut">${esc(s.a)}</p></div></div>${side || ic('dots-three')}</div>`;
const like = n => `<div class="qa-like"><i class="cm-ic" style="--i:url(${PH}thumbs-up.svg)"></i><p class="t-caption">${esc(n)}</p></div>`;
function item(r){
  const last = r.songs.length - 1;
  const rows = r.songs.map((s, i) => songRow(s, r.big, !r.note && i === last ? `<div class="side">${ic('dots-three')}${like(r.likes)}</div>` : '')).join('');
  return `<div class="qa-item"><div class="qa-user ${r.me ? 'me' : ''}"><img src="${r.ava}" alt=""><p class="t-caption">${esc(r.u)}</p></div>
    ${rows}${r.note ? `<div class="qa-note"><p class="t-body">${esc(r.note)}</p>${like(r.likes)}</div>` : ''}</div>`;
}
function renderQA(){
  let list = st.sort === 'liked' ? LIKED.slice() : NEWEST.slice();
  if (st.mine){ if (st.sort === 'newest') list.unshift(st.mine); else list.push(st.mine); }
  vQA.innerHTML = `<div class="qa-body">
    <div class="qa-head"><button class="back" data-back aria-label="Back">${ic('caret-left')}</button><p class="t-header">Songs for a 3am drive?</p></div>
    <div class="qa-op"><div class="who"><img src="${C}op.png" alt=""><p class="t-body">n1ght0wl21</p></div>
      <div class="qa-tags t-body"><span>moody</span><span>chill</span><span>fun</span></div></div>
    <button class="cm-btn t-body" data-reply>${ic('chat-circle')}Reply</button>
    <div class="qa-resp">
      <div class="hd"><p class="t-header">Responses <span class="t-body">(${st.mine ? 251 : 250})</span></p>
        <button class="qa-sort" data-sort><span class="t-caption">${st.sort === 'liked' ? 'Most Liked' : 'Newest'}</span>${ic('caret-down')}</button></div>
      <div class="qa-list">${list.map(item).join('<hr>')}<hr></div>
    </div></div>`;
}

/* ---------- overlays ---------- */
function overlay(cls, html){
  const o = document.createElement('div');
  o.className = 'cm-ov'; o.innerHTML = `<div class="bd" data-close></div><div class="${cls}">${html}</div>`;
  app.appendChild(o); return o;
}
const open = o => { o.offsetHeight; o.classList.add('open'); };
const close = o => { o.classList.remove('open'); document.activeElement?.blur(); };

const pickRow = (s, i) => `<div class="cm-pick"><button data-unpick="${i}" aria-label="Remove ${esc(s.t)}">${ic('x')}</button><img src="${s.img}" alt=""><div class="tx"><p class="t-body">${esc(s.t)}</p><p class="t-caption cm-mut">${esc(s.a)}</p></div></div>`;
const results = (pool, q) => {
  q = q.trim().toLowerCase();
  const r = pool.filter(s => !q || (s.t + ' ' + s.a).toLowerCase().includes(q));
  return r.length ? r.map(s => `<button data-pick="${pool.indexOf(s)}"><img src="${s.img}" alt=""><span class="tx"><span class="t-body">${esc(s.t)}</span><span class="t-caption cm-mut">${esc(s.a)}</span></span></button>`).join('')
    : `<p class="t-body cm-mut">No songs found</p>`;
};

// song search shared by Pit Stop and Reply: focusing the field lists songs, typing filters, tapping picks
function songSearch(o, pool, picked, max, onChange){
  const input = o.querySelector('[data-song]'), res = o.querySelector('.cm-res'), box = o.querySelector('.cm-picked');
  const place = () => { res.style.top = `${input.offsetTop + input.offsetHeight + 1}px`; };
  const show = () => { res.innerHTML = results(pool, input.value); place(); res.classList.add('on'); };
  const draw = () => {
    box.innerHTML = picked.map(pickRow).join('');
    box.style.display = picked.length ? '' : 'none';
    input.style.display = picked.length >= max ? 'none' : '';
    res.classList.remove('on'); onChange();
  };
  input.addEventListener('focus', show);
  input.addEventListener('input', show);
  o.addEventListener('click', e => {
    const p = e.target.closest('[data-pick]');
    if (p){ const s = pool[+p.dataset.pick]; if (!picked.includes(s)) picked.push(s); input.value = ''; input.blur(); draw(); return; }
    const u = e.target.closest('[data-unpick]');
    if (u){ picked.splice(+u.dataset.unpick, 1); draw(); return; }
    if (!e.target.closest('[data-song], .cm-res')) res.classList.remove('on');
  });
  return {reset(){ picked.length = 0; input.value = ''; draw(); }};
}

/* Pit Stop pop-up */
const oPit = overlay('cm-pop', `
  <div class="cm-hd"><div class="ttl">${ic('music-notes-plus')}<p class="t-header">Pit Stop</p></div><button data-close aria-label="Close">${ic('x')}</button></div>
  <p class="t-body">Leave a song on the map!</p>
  <div class="cm-fields">
    <div class="cm-picked"></div>
    <input class="cm-field" data-song type="text" placeholder="Add a song" aria-label="Add a song">
    <div class="cm-res"></div>
    <label class="cm-loc-field">${ic('map-pin')}<input class="t-body" data-where type="text" placeholder="Add a location" aria-label="Location" autocomplete="off"></label>
    <div class="cm-res cm-spots" role="listbox"></div>
  </div>
  <button class="cm-btn t-body" data-drop disabled>Drop Off</button>`);
const pitPicked = [];
const pit = songSearch(oPit, PIT_SONGS, pitPicked, 1, () => dropOk());
// location: type to search, suggestions are the red dots nearest to you first
const spotList = oPit.querySelector('.cm-spots'), whereIn = oPit.querySelector('[data-where]');
const miles = (a, b) => {
  const r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(h));
};
const dropOk = () => { oPit.querySelector('[data-drop]').disabled = !(pitPicked.length && st.spot !== null); };
function setWhere(i){ st.spot = i; whereIn.value = i === null ? '' : SPOTS[i].name; dropOk(); }
function showSpots(on){
  spotList.classList.toggle('on', on); if (!on) return;
  const q = whereIn.value.trim().toLowerCase(), typed = q && !(st.spot !== null && SPOTS[st.spot].name.toLowerCase() === q);
  const hits = SPOTS.map((p, i) => ({p, i, d:miles(ME, p.ll)}))
    .filter(o => isNear(o.i) && (!typed || o.p.name.toLowerCase().includes(q))).sort((x, y) => x.d - y.d);
  spotList.style.top = `${whereIn.closest('.cm-loc-field').offsetTop + whereIn.closest('.cm-loc-field').offsetHeight + 1}px`;
  spotList.innerHTML = hits.length ? hits.map(({p, i, d}) => `<button role="option" data-spot-pick="${i}">${ic('map-pin')}<span class="tx"><span class="t-body">${esc(p.name)}</span><span class="t-caption cm-mut">${d < .5 ? 'Right by you' : `${d.toFixed(1)} mi away`}</span></span></button>`).join('')
    : `<p class="t-body cm-mut">No nearby spots</p>`;
}
whereIn.addEventListener('focus', () => { whereIn.select(); showSpots(true); });
whereIn.addEventListener('input', () => {
  const q = whereIn.value.trim().toLowerCase(), hit = SPOTS.findIndex((p, i) => isNear(i) && p.name.toLowerCase() === q);
  st.spot = hit < 0 ? null : hit; dropOk(); showSpots(true);
});
whereIn.addEventListener('keydown', e => { if (e.key === 'Enter'){ spotList.querySelector('[data-spot-pick]')?.click(); whereIn.blur(); } });
oPit.addEventListener('click', e => {
  const sp = e.target.closest('[data-spot-pick]'); if (sp){ setWhere(+sp.dataset.spotPick); whereIn.blur(); return showSpots(false); }
  if (!e.target.closest('.cm-loc-field')) showSpots(false);
  if (e.target.closest('[data-close]')) return close(oPit);
  if (e.target.closest('[data-drop]')){
    const i = st.spot;
    st.drops[i] = pitPicked[0]; st.open = i; close(oPit); refreshPin();
    vC.scrollTo({top:0, behavior:'smooth'}); if (map){ map.flyTo(SPOTS[i].ll, Math.max(13, map.getZoom()), {duration:.8}); map.once('moveend', () => { if (st.open === i) fitCard(i); }); }
    clearTimeout(st._pinT); st._pinT = setTimeout(() => setOpen(null), 3000);
  }
});

/* Ask a question sheet */
const oAsk = overlay('cm-sheet form', `
  <div class="cm-hd"><p class="t-header">Ask a question</p><button data-close aria-label="Close">${ic('x')}</button></div>
  <div class="cm-fields">
    <textarea class="cm-field" data-q-text placeholder="What do you want song recs for?" aria-label="Your question"></textarea>
    <input class="cm-field sm" type="text" placeholder="Add a tag (optional)" aria-label="Add a tag">
  </div>
  <div class="cm-anon"><p class="t-body">Post anonymously</p><button class="pf-toggle" role="switch" aria-checked="false" data-anon aria-label="Post anonymously"></button></div>
  <button class="cm-btn t-body" data-post disabled>Post question</button>`);
const qText = oAsk.querySelector('[data-q-text]');
qText.addEventListener('input', () => { oAsk.querySelector('[data-post]').disabled = !qText.value.trim(); });
oAsk.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return close(oAsk);
  const a = e.target.closest('[data-anon]'); if (a){ a.classList.toggle('on'); a.setAttribute('aria-checked', a.classList.contains('on')); return; }
  if (e.target.closest('[data-post]')){
    st.posted.unshift(qText.value.trim().replace(/\s+/g, ' ')); st.tab = 'ma';
    close(oAsk); renderC();
    vC.querySelector('#cm-qa').scrollIntoView({block:'end', behavior:'smooth'});
  }
});
function openAsk(){ qText.value = ''; oAsk.querySelectorAll('input').forEach(i => { i.value = ''; }); oAsk.querySelector('[data-post]').disabled = true; open(oAsk); }

/* Reply sheet */
const oReply = overlay('cm-sheet form', `
  <div class="cm-hd"><p class="t-header">Reply</p><button data-close aria-label="Close">${ic('x')}</button></div>
  <div class="cm-fields">
    <div class="cm-picked"></div>
    <input class="cm-field" data-song type="text" placeholder="Add a song" aria-label="Add a song">
    <input class="cm-field" data-note type="text" placeholder="Add a short note" aria-label="Add a short note">
    <div class="cm-res"></div>
  </div>
  <div class="cm-anon"><p class="t-body">Post anonymously</p><button class="pf-toggle" role="switch" aria-checked="false" data-anon aria-label="Post anonymously"></button></div>
  <button class="cm-btn t-body" data-submit disabled>Submit Response</button>`);
const replyPicked = [];
const reply = songSearch(oReply, REPLY_SONGS, replyPicked, 3, () => { oReply.querySelector('[data-submit]').disabled = !replyPicked.length; });
oReply.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return close(oReply);
  const a = e.target.closest('[data-anon]'); if (a){ a.classList.toggle('on'); a.setAttribute('aria-checked', a.classList.contains('on')); return; }
  if (e.target.closest('[data-submit]')){
    const anon = oReply.querySelector('[data-anon]').classList.contains('on');
    const note = oReply.querySelector('[data-note]').value.trim();
    st.mine = {u:anon ? 'anonymous' : 'mushqueen', ava:C + 'u-me.png', me:true, songs:replyPicked.slice(), note, likes:'0'};
    st.sort = 'newest'; close(oReply); renderQA(); vQA.scrollTo({top:0, behavior:'smooth'});
  }
});
function openReply(){ reply.reset(); oReply.querySelector('[data-note]').value = ''; open(oReply); }

/* More actions sheet */
const oMore = overlay('cm-sheet acts', [['heart', 'Add to liked songs'], ['plus', 'Add to playlist'], ['share', 'Share'], ['music-notes-minus', 'Not interested']]
  .map(([i, l]) => `<button class="cm-act t-body" data-close>${ic(i)}${l}</button>`).join(''));
oMore.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(oMore); });

const ALL_OV = [oPit, oAsk, oReply, oMore];

/* ---------- interactions ---------- */
// tapping anywhere outside an open pin hides its song card / prompt (a map drag doesn't count as a tap)
let downAt = null;
vC.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; }, true);
vC.addEventListener('click', e => {
  if (st.open === null || e.target.closest('[data-loc]')) return;
  if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  setOpen(null);
}, true);
vC.addEventListener('click', e => {
  const pitBtn = e.target.closest('[data-pit]');
  if (pitBtn){
    // the dot that was tapped is the location (it can still be changed in the field)
    setWhere(+(pitBtn.closest('[data-spot]')?.dataset.spot ?? 0)); showSpots(false);
    setOpen(null); pit.reset(); open(oPit); return;
  }
  const pin = e.target.closest('[data-pin]');
  if (pin){ const i = +pin.closest('[data-spot]').dataset.spot; setOpen(st.open === i ? null : i); return; }
  if (e.target.closest('[data-recenter]')){ recenter(); return; }
  if (e.target.closest('[data-more]')){ open(oMore); return; }
  const m = e.target.closest('[data-match]'); if (m){ P().openPerson(MATCHES[+m.dataset.match]); return; }
  if (e.target.closest('[data-listeners]')){ openListeners(); return; }
  if (e.target.closest('[data-ask]')){ openAsk(); return; }
  const t = e.target.closest('[data-qtab]'); if (t){ if (t.dataset.qtab !== st.tab){ const from = st.tab; st.tab = t.dataset.qtab; renderTabs(from); } return; }
  if (e.target.closest('[data-q]')){ st.sort = st.mine ? 'newest' : 'liked'; renderQA(); vQA.scrollTop = 0; P().go(vQA); }
});
const TABS = ['fy', 'gn', 'ma'];
// underline slides under the active tab
function placeInk(animate){
  const ink = vC.querySelector('.cm-ink'), on = vC.querySelector('[data-qtab].on');
  if (!ink || !on) return;
  ink.style.transition = animate ? '' : 'none';
  ink.style.left = `${on.offsetLeft}px`; ink.style.width = `${on.offsetWidth}px`;
  if (!animate){ ink.offsetHeight; ink.style.transition = ''; }
}
// cards slide away from the new tab: a tab to the right pushes the cards left, and vice versa
function renderTabs(from){
  vC.querySelectorAll('[data-qtab]').forEach(b => b.classList.toggle('on', b.dataset.qtab === st.tab));
  placeInk(true);
  const pane = vC.querySelector('.cm-pane'), old = pane.querySelector('.cm-grid');
  const dir = Math.sign(TABS.indexOf(st.tab) - TABS.indexOf(from));
  const next = document.createElement('div');
  next.className = 'cm-grid'; next.innerHTML = qaGrid();
  pane.querySelectorAll('.cm-grid.leaving').forEach(g => g.remove());
  old.classList.add('leaving');
  pane.appendChild(next);
  const ease = 'cubic-bezier(.32,.72,0,1)', dur = 380;
  old.animate([{transform:'translateX(0)', opacity:1}, {transform:`translateX(${-dir * 100}%)`, opacity:0}], {duration:dur, easing:ease, fill:'forwards'}).onfinish = () => old.remove();
  next.animate([{transform:`translateX(${dir * 100}%)`, opacity:0}, {transform:'translateX(0)', opacity:1}], {duration:dur, easing:ease});
  vC.querySelector('.cm-more-link').classList.toggle('off', st.tab === 'ma');
}
// the Q&A area keeps the height of its tallest tab, so switching tabs never shifts the page
function sizePane(){
  const pane = vC.querySelector('.cm-pane'); if (!pane) return;
  const keep = st.tab;
  const probe = document.createElement('div');
  probe.className = 'cm-grid'; probe.style.cssText = 'position:absolute;left:20px;right:20px;top:0;visibility:hidden;pointer-events:none';
  pane.appendChild(probe);
  let max = 0;
  TABS.forEach(t => { st.tab = t; probe.innerHTML = qaGrid(); max = Math.max(max, probe.offsetHeight); });
  st.tab = keep; probe.remove();
  pane.style.minHeight = `${max}px`;
}
vQA.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return P().back();
  if (e.target.closest('[data-reply]')) return openReply();
  if (e.target.closest('[data-sort]')){ st.sort = st.sort === 'liked' ? 'newest' : 'liked'; renderQA(); }
});
// iOS-style edge swipe back on the thread
{ let sx = null, sy = 0;
  vQA.addEventListener('pointerdown', e => { const r = vQA.getBoundingClientRect(); if ((e.clientX - r.left) / (r.width / 402) < 24){ sx = e.clientX; sy = e.clientY; } });
  vQA.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx, dy = Math.abs(e.clientY - sy); sx = null; if (dx > 60 && dx > dy) P().back(); }); }

/* ---------- Find other listeners (Figma 981:10812) ---------- */
const vL = makeView('view-listeners', 'Find other listeners');
function listenersHTML(q = ''){
  const list = MATCHES.filter(m => !q || (m.name + m.handle + m.likes).toLowerCase().includes(q.toLowerCase()));
  return list.length ? list.map(m => { const i = MATCHES.indexOf(m); return `<div class="cm-lrow">
      <button class="who" data-match="${i}"><span class="id"><img src="${m.img}" alt=""><span><span class="t-header">${esc(m.name)}</span><span class="t-body">${esc(m.handle)}</span></span></span>
        <span class="t-caption cm-mut">${m.pct}% match · ${esc(m.likes)}</span></button>
      <button class="cm-follow t-body ${m.following ? 'on' : ''}" data-follow="${i}">${m.following ? 'Following' : 'Follow'}</button></div>`; }).join('')
    : `<p class="t-body cm-mut">No listeners found</p>`;
}
function openListeners(){
  vL.innerHTML = `<div class="cm-lhead"><button class="back" data-back aria-label="Back">${ic('caret-left')}</button><p class="t-header">Find other listeners</p><span></span></div>
    <div class="cm-lbody">
      <div class="cm-search static">${ic('magnifying-glass')}<input type="text" placeholder="Search user..." aria-label="Search user"></div>
      <div class="cm-sec-hd"><p class="t-header">Top Matches</p><span class="cm-sort t-caption">Similar tastes${ic('caret-down')}</span></div>
      <div class="cm-llist">${listenersHTML()}</div>
    </div>`;
  vL.querySelector('input').addEventListener('input', e => { vL.querySelector('.cm-llist').innerHTML = listenersHTML(e.target.value.trim()); });
  vL.scrollTop = 0; P().go(vL);
}
vL.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return P().back();
  const f = e.target.closest('[data-follow]');
  if (f){ const m = MATCHES[+f.dataset.follow]; m.following = !m.following; f.classList.toggle('on', m.following); f.textContent = m.following ? 'Following' : 'Follow'; return; }
  const m = e.target.closest('[data-match]'); if (m) P().openPerson(MATCHES[+m.dataset.match]);
});

/* ---------- first visit: a 4-step walkthrough (Figma 1289:6630) ---------- */
const OB = [
  {el:'.cm-leaf', text:'See what songs people have left in the area', side:'over'},
  {el:'.cm-search', text:'Search or tap any location to leave a song for other people to discover', side:'below'},
  {el:'[data-ask]', text:'Have a question? Ask the community for their input!', side:'above'},
  {el:'.cm-qa', text:'View and respond to questions other users have asked in the community', side:'above'},
];
let seen = false, ob = -1, obWait = 0;
const obEl = document.createElement('div');
obEl.className = 'cm-ob'; obEl.setAttribute('role', 'dialog'); obEl.setAttribute('aria-label', 'Community walkthrough');
obEl.innerHTML = `<svg class="dim" aria-hidden="true"><path fill-rule="evenodd"></path><rect class="cover" rx="10" ry="10"></rect><rect class="ring" rx="10" ry="10"></rect></svg>
  <div class="bub"><span class="tip"></span><p class="t-caption txt"></p><div class="ft"><p class="t-caption n"></p><button class="t-caption go" data-ob-next>Next</button></div></div>`;
app.appendChild(obEl);
function obLayout(){
  if (ob < 0) return;
  const step = OB[ob], t = vC.querySelector(step.el); if (!t) return;
  const A = app.getBoundingClientRect(), k = A.width / 402, W = 402, H = A.height / k;
  const r = t.getBoundingClientRect(), pad = 4;
  const x = (r.left - A.left) / k - pad, y = (r.top - A.top) / k - pad, w = r.width / k + pad * 2, h = r.height / k + pad * 2;
  const svg = obEl.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const rr = 10;
  svg.querySelector('path').setAttribute('d', `M0 0H${W}V${H}H0Z M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`);
  svg.querySelectorAll('.ring, .cover').forEach(r => { r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h); });
  const bub = obEl.querySelector('.bub'), bh = bub.offsetHeight || 118;
  let top = step.side === 'above' ? y - 21 - bh : step.side === 'below' ? y + h + 21 : y + h - bh + 40;
  if (step.side === 'over') top = Math.min(top, y + h - 60);
  bub.style.top = `${top}px`;
  bub.style.left = `${Math.min(W - 201 - 20, Math.max(20, x + w - 201 - (step.side === 'over' ? 80 : 18)))}px`;
  bub.classList.toggle('up', step.side !== 'above');
}
// wait until a smooth scroll has come to rest (or there was nothing to scroll)
function settled(el, done){
  let last = el.scrollTop, still = 0, t0 = performance.now();
  const tick = now => {
    if (Math.abs(el.scrollTop - last) < .5) still++; else still = 0;
    last = el.scrollTop;
    if (still >= 5 || now - t0 > 1200) done(); else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
// one step at a time: fade the current step out → swap the words → scroll while hidden → fade the next one in
let obSeq = 0;
function obShow(i){
  const seq = ++obSeq, wasOn = obEl.classList.contains('on');
  obEl.classList.remove('on');
  setTimeout(() => {
    if (seq !== obSeq) return;
    ob = i;
    const step = OB[i], t = vC.querySelector(step.el);
    obEl.querySelector('.txt').textContent = step.text;
    obEl.querySelector('.n').innerHTML = `<b>${i + 1}</b>/<span>${OB.length}</span>`;
    obEl.querySelector('.go').textContent = i === OB.length - 1 ? 'OK' : 'Next';
    // bring the step's spot into view, leaving room for the bubble
    const vr = vC.getBoundingClientRect(), tr = t.getBoundingClientRect(), k = vr.width / 402;
    const want = step.side === 'above' ? (tr.top - vr.top) / k + vC.scrollTop - 330 : (tr.top - vr.top) / k + vC.scrollTop - 90;
    vC.scrollTo({top:i < 2 ? 0 : Math.max(0, want * k), behavior:'smooth'});
    settled(vC, () => { if (seq !== obSeq) return; obLayout(); requestAnimationFrame(() => { if (seq === obSeq) obEl.classList.add('on'); }); });
  }, wasOn ? 600 : 0);
}
function obStart(){ if (seen) return; seen = true; obEl.classList.add('live', 'shown'); obShow(0); }
function obEnd(){ ob = -1; ++obSeq; obEl.classList.remove('on', 'shown'); setTimeout(() => { if (ob < 0) obEl.classList.remove('live'); }, 600); }
obEl.addEventListener('click', e => { if (e.target.closest('[data-ob-next]')) ob < OB.length - 1 ? obShow(ob + 1) : obEnd(); });
// only follow the page while a step is showing; between steps it's hidden and gets placed once the scroll settles
vC.addEventListener('scroll', () => { if (ob >= 0 && obEl.classList.contains('on')) obLayout(); }, {passive:true});
vC.addEventListener('transitionend', e => { if (e.target === vC && ob >= 0 && obEl.classList.contains('on')) obLayout(); });   // if the page slid in
addEventListener('resize', () => { if (ob >= 0) obLayout(); });
document.addEventListener('click', e => { if (ob >= 0 && e.target.closest('.tabbar')) obEnd(); }, true);

function openCommunity(){
  ALL_OV.forEach(close);
  P().resetToHome(false);
  renderC(); refreshPin(); vC.scrollTop = 0;
  P().setTab('community'); P().go(vC);
  if (map) requestAnimationFrame(() => map.invalidateSize());
  // first visit: the walkthrough opens right away with the page (opening Community is what starts it)
  // first visit: a 2s beat on the page, then the walkthrough starts (only if they're still here)
  clearTimeout(obWait);
  if (!seen) obWait = setTimeout(() => { if (current === vC) obStart(); }, 2000);
}

document.getElementById('restart')?.addEventListener('click', () => { ALL_OV.forEach(close); clearTimeout(st._pinT); st = fresh(); seen = false; obEnd(); MATCHES.forEach(m => { m.following = false; }); if (map){ refreshPin(); map.setView(HOME_VIEW.c, HOME_VIEW.z); } });
renderC();
window.tonoCommunity = {open:openCommunity, get state(){ return {...st}; }};
})();
