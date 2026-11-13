/* =========================================================
   HOME — hi-fis post UT (Figma section 982:15128)
   · date strip: scroll back through earlier weeks; any day but today turns
     "Add a Song" into "View Playlist" (that day's playlist page)
   · Add a Song is a sheet; Submit Response → "Song submitted!" banner
   · Songs For You → short-form reels · Playlists For You → list → playlist
   · Your Saves (collections from other platforms) → folders → folder
   · Concerts Near You at the end
   Pages slide in; everything moves on the slow 600 ms curve.
   ========================================================= */
(() => {
const H = 'assets/home2/';
const app = document.getElementById('app');
const body = document.getElementById('home-body');
const tabbar = app.querySelector('.tabbar');
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// the strip runs from the week of the first prompt (EARLIEST, Nov 2025) to this week
const FIRST = mondayOf(EARLIEST);
const WEEKS = Math.round((mondayOf(TODAY) - FIRST) / 864e5 / 7) + 1;
const weekOf = d => Math.round((mondayOf(d) - FIRST) / 864e5 / 7);
const hs = {sel:new Date(TODAY)};
const stack = [];                                  // pages under the one on top (for Back)

/* ---------- data from the hi-fi ---------- */
const HOME_SONGS = [                               // [index into SONGS (reels), art on Home]
  [0, H + 'song-wonderwall.png'], [2, H + 'song-riptide.png'], [3, H + 'song-babydoll.png'],
  [4, null], [5, null], [6, null], [7, null], [8, null],
];
const RD = [H + 'rd1.png', H + 'rd3.png', H + 'rd4.png', H + 'rd2.png'];    // TL, TR, BL, BR
const PLAYLISTS = [
  {name:'Rainy Days', by:'odit_wang', ava:H + 'ava-odit.png', tags:['Calm', 'Indie Pop'], n:10, home:RD, art:RD},
  {name:'calm songs', by:'needsleep', ava:H + 'ava-need.png', tags:['Calm', 'Relaxing'], n:24,
    home:[H + 'cs3.png', H + 'cs2.png', H + 'cs1.png', H + 'cs4.png'], art:[H + 'pc2-1.png', H + 'pc2-3.png', H + 'pc2-4.png', H + 'pc2-2.png']},
  {name:'focus', by:'4dean', ava:H + 'ava-4dean.png', tags:['Calm', 'Quiet'], n:38,
    home:[H + 'fo1.png', H + 'fo4.png', H + 'fo3.png', H + 'fo2.png'], art:[H + 'pc3-1.png', H + 'pc3-3.png', H + 'pc3-4.png', H + 'pc3-2.png']},
  {name:'Winter!', by:'heehxx', ava:H + 'ava-heehxx.png', tags:['Winter', 'Indie', 'Calm'], n:12,
    art:[H + 'pc4-1.png', H + 'pc4-3.png', H + 'pc4-4.png', H + 'pc4-2.png']},
  {name:'snow', by:'4dean', ava:H + 'ava-4dean.png', tags:['Quiet', 'Calm'], n:38,
    art:[H + 'pc5-1.png', H + 'pc5-3.png', H + 'pc3-4.png', H + 'pc3-2.png']},
];
PLAYLISTS.forEach(p => { p.home = p.home || p.art; });
// Rainy Days track list (Figma 1171:7198); the other playlists borrow from the same pool
const TRACKS = [
  {t:'Remember', a:'Sam Ock', img:H + 'pd-01.png'}, {t:'Winter Waltz', a:'FRANKIE', img:H + 'pd-02.png'},
  {t:'Christmas Song', a:'back number', img:H + 'pd-03.png'}, {t:'Love you on Christmas', a:'Yerin Baek', img:H + 'pd-04.png'},
  {t:'Come Softly', a:'Grouper', img:H + 'pd-05.png'}, {t:'Venus Flytrap', a:'Feng Suave', img:H + 'rd1.png'},
  {t:'Paris in the Rain', a:'Lauv', img:H + 'rd3.png'}, {t:'2 soon', a:'keshi', img:H + 'rd4.png'},
  {t:'To be happy', a:'Nana Ouyang', img:H + 'pd-09.png'}, {t:'Limerence', a:'Yves Tumor', img:H + 'pd-10.png'},
];
const EXTRA = TOP10.map(r => ({t:r.t, a:r.a, img:r.img}));
const tracksFor = i => i === 0 ? TRACKS : [...EXTRA.slice(i * 2), ...TRACKS.slice(0, i * 2)].slice(0, 10);

// saved collections from other platforms; each cell: [src, crop (h, left, top, w in %) or null]
const OG = [[H + 'og2.png'], [H + 'og3.png'], [H + 'og1.png'], [H + 'og4.png']];
const FOLDERS = [
  {name:'Originals', cells:OG, src:['instagram', 'youtube', 'instagram', 'ytmusic']},
  {name:'Covers', cells:[[H + 'cv-s1.png', [100, -17.7, 0, 160.79]], [H + 'cv-s2.png', [101.62, -40.12, 0, 178.6]],
    [H + 'cv-s3.png', [100, -19.12, 0, 152.52]], [H + 'cv-s4.png', [105.02, -18.69, -4.08, 140.91]]], src:['youtube', 'instagram', 'youtube', 'instagram']},
  {name:'Playlists', cells:[[H + 'pl-s2.png', [100, -39.56, 0, 176.98]], [H + 'pl-s4.png', [100.39, -51.15, -0.19, 201.59]],
    [H + 'pl-s3.png', [100.3, -41.17, -0.15, 179.37]], [H + 'pl-s1.png', [100, -35.12, 0, 177.98]]], src:['ytmusic', 'youtube', 'ytmusic', 'youtube']},
];
const PLAT = {instagram:['Instagram', H + 'logo-ig.png'], ytmusic:['YouTube Music', H + 'chip-ytm.png'], youtube:['YouTube', H + 'chip-yt.png']};
const SHEET_SONGS = [
  {t:'Snowman', a:'Sia', img:H + 'snowman.png'}, {t:'snowfall', a:'Øneheart & reidenshi', img:H + 'snowfall.png'},
  {t:'Snow (Hey Oh)', a:'Red Hot Chili Peppers', img:H + 'snow-heyoh.png'},
];

/* ---------- small builders ---------- */
const more = (go, label = 'View more') => `<button class="h2-more" data-go="${go}"><span class="t-caption">${label}</span><img src="${H}caret-left.svg" alt=""></button>`;
const quad = srcs => `<div class="pq">${srcs.map(s => `<img src="${s}" alt="">`).join('')}</div>`;
const cell = ([src, crop]) => `<span class="c"><img ${crop ? `class="crop" style="height:${crop[0]}%;left:${crop[1]}%;top:${crop[2]}%;width:${crop[3]}%"` : ''} src="${src}" alt=""></span>`;
const back = cells => cells.map(cell).join('');
const folder = (f, i) => `<button class="fold" data-fold="${i}">
    <div class="stack"><div class="lay l1">${back(OG)}</div><div class="lay l2">${back(OG)}</div><div class="lay l3">${f.cells.map(cell).join('')}</div></div>
    <div class="lbl"><p class="t-body">${esc(f.name)}</p></div></button>`;
const byline = p => `<div class="h2-by"><img src="${p.ava}" alt=""><p class="t-caption">${esc(p.by)}</p></div>`;
const tagsHTML = tags => `<div class="tags">${tags.map(t => `<span class="tag t-caption">${esc(t)}</span>`).join('')}</div>`;
const subhead = (title, extra = '') => `<div class="subhead"><div class="row">
    <button class="back" data-hback aria-label="Back"><img src="${H}caret-left.svg" alt=""></button>
    <p class="t-body">${title}</p><span class="spacer"></span></div>${extra}</div>`;

/* ---------- Home ---------- */
function dayBtn(d){
  const future = d > TODAY || d < EARLIEST;
  return `<button class="h2-day${sameDay(d, hs.sel) ? ' sel' : ''}" data-day="${key(d)}" ${future ? 'disabled' : ''} aria-label="${MONTHS[d.getMonth()]} ${d.getDate()}">
    <span class="wd">${WD[d.getDay()]}</span><span class="n">${d.getDate()}</span></button>`;
}
function stripHTML(){
  const first = FIRST;
  let h = '';
  for (let w = 0; w < WEEKS; w++){
    h += `<div class="h2-week" data-week="${w}">`;
    for (let i = 0; i < 7; i++) h += dayBtn(addDays(first, w * 7 + i));
    h += '</div>';
  }
  return h;
}
function cardHTML(){
  const d = hs.sel, today = sameDay(d, TODAY), mine = submitted[key(d)];
  const joined = songsFor(d) + (today && mine ? 1 : 0);
  return `<article class="card daily h2-daily">
    <div class="top swap"><p class="t-body">Daily Prompt${today ? '' : ` · ${MON3[d.getMonth()]} ${d.getDate()}`}</p></div>
    <h2 class="t-ginormous gradient-text swap">${esc(promptFor(d))}</h2>
    <div class="tags"><span class="tag t-caption">Late Night Listeners</span><span class="tag t-caption">Soft Pop Fans</span></div>
    <div class="joined-wrap"><div class="joined">
      <div class="avatars"><span><b class="t-avatar">MK</b></span><span><b class="t-avatar">JL</b></span><span><b class="t-avatar">NS</b></span></div>
      <p class="t-caption swap">${joined} people joined${today ? ' today' : ''}</p>
      <div class="streak"><div><img src="${H}fire.svg" alt=""><span class="t-caption">5</span></div></div>
    </div></div>
    <div class="cta-wrap"><div class="cta-one">${today && !mine
      ? `<button class="btn btn-primary t-body" data-add>Add a Song</button>`
      : `<button class="btn btn-primary t-body" data-playlist>View Playlist</button>`}</div></div>
  </article>`;
}
function render(){
  body.innerHTML = `
    <div class="h2-top">
      <section class="h2-date" aria-label="Daily prompts by day">
        <div class="h2-head" style="width:356px"><p class="t-header-db" id="h2-month">${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}</p>
          <button class="h2-cal" data-cal-open aria-label="Open calendar" aria-expanded="false"><img src="${H}calendar-dots.svg" alt=""></button></div>
        <div class="h2-calpop" id="h2-calpop" role="dialog" aria-label="Pick a day"></div>
        <div class="h2-strip" id="h2-strip">${stripHTML()}</div>
      </section>
      <div id="h2-card">${cardHTML()}</div>
    </div>
    <section class="h2-sec">
      <div class="h2-head"><p class="t-header-db">Songs For You</p>${more('songs')}</div>
      <div class="albums">${HOME_SONGS.map(([i, art], k) => { const s = SONGS[i]; return `
        <div class="album">
          <button class="art ${k === 0 ? 'selected' : ''}" data-song="${i}" aria-label="Play ${esc(s.title)}">
            <img class="cover" src="${art || s.art}" alt="">${k === 0 ? `<span class="play2"><img src="${H}play-lg.svg" alt=""></span>` : ''}
          </button>
          <div class="txt"><p class="title t-body">${esc(s.title)}</p><p class="artist t-caption grey">${esc(s.artist)}</p>
            <button class="dots" data-more="${i}" aria-label="More actions"><img src="assets/dots-three.svg" alt=""></button></div>
        </div>`; }).join('')}</div>
    </section>
    <section class="h2-sec">
      <div class="h2-head"><p class="t-header-db">Playlists For You</p>${more('playlists')}</div>
      <div class="albums">${PLAYLISTS.map((p, i) => `
        <button class="h2-pl" data-pl="${i}">${quad(p.home)}
          <div class="txt"><p class="title t-body">${esc(p.name)}</p>${byline(p)}</div></button>`).join('')}</div>
    </section>
    <section class="h2-sec">
      <div class="h2-head"><div style="display:flex;gap:10px;align-items:center"><p class="t-header-db">Your Saves</p>
          <div class="h2-logos" aria-label="Instagram, YouTube Music, YouTube"><span class="ig"><img src="${H}logo-ig.png" alt=""></span><img class="ytm" src="${H}logo-ytm.png" alt=""><img class="yt" src="${H}logo-yt.png" alt=""></div></div>
        ${more('saves')}</div>
      <div class="albums">${FOLDERS.map(folder).join('')}</div>
    </section>
    <section class="h2-sec">
      <div class="h2-head"><p class="t-header-db">Concerts Near You</p><div class="h2-more"><span class="t-caption">View more</span><img src="${H}caret-left.svg" alt=""></div></div>
      <div class="albums">
        <div class="h2-gig pink"><div class="art"><img src="${H}concert-skz.png" alt=""><span class="fade"></span>
          <p class="b mon" style="left:33.5px;transform:translateX(-50%)">DEC</p><p class="d day">20</p><p class="b who">Stray Kids</p>
          <p class="where t-caption"><img src="${H}map-pin.svg" alt="">Atlanta, GA</p><p class="b from">From</p><p class="d price">$85</p></div>
          <div class="txt"><p class="t-body">&lt;Run It North America&gt; World Tour</p><p class="t-caption">Presale Open ~ 2026.11.18</p></div></div>
        <div class="h2-gig purple"><div class="art"><img src="${H}concert-lisa.png" alt=""><span class="fade"></span>
          <p class="b mon">JAN</p><p class="d day">03</p><p class="b who">LISA</p>
          <p class="where t-caption"><img src="${H}map-pin.svg" alt="">Las Vegas, NV</p><p class="b from">From</p><p class="d price" style="left:250px">$80</p></div>
          <div class="txt"><p class="t-body">&lt;VIVA LA LISA&gt;</p><p class="t-caption">Presale Opening Soon 2026.12.01 ~ 2026.12.10</p></div></div>
      </div>
    </section>`;
  const strip = body.querySelector('#h2-strip');
  strip.addEventListener('scroll', () => { clearTimeout(strip._t); strip._t = setTimeout(monthLabel, 80); }, {passive:true});
  toThisWeek(false);
}
const weekW = () => body.querySelector('.h2-week').offsetWidth + 5.665;
function toThisWeek(smooth){ toWeek(TODAY, smooth); }
function toWeek(d, smooth){
  const strip = body.querySelector('#h2-strip');
  requestAnimationFrame(() => {
    const left = weekOf(d) * weekW(), far = Math.abs(left - strip.scrollLeft) > weekW() * 3;   // long jumps land at once
    strip.scrollTo({left, behavior:smooth && !far ? 'smooth' : 'auto'});
    if (far || !smooth) setTimeout(monthLabel, 0);
  });
}
// the month title follows the week in view
function monthLabel(){
  const strip = body.querySelector('#h2-strip');
  const w = Math.round(strip.scrollLeft / weekW());
  const thu = addDays(FIRST, 7 * w + 3);
  body.querySelector('#h2-month').textContent = `${MONTHS[thu.getMonth()]} ${thu.getFullYear()}`;
}
function select(d){
  if (sameDay(d, hs.sel)) return;
  hs.sel = d;
  body.querySelectorAll('.h2-day').forEach(b => b.classList.toggle('sel', +b.dataset.day === key(d)));
  const card = body.querySelector('.h2-daily');
  card.classList.add('fading');
  clearTimeout(card._t);
  card._t = setTimeout(() => { body.querySelector('#h2-card').innerHTML = cardHTML(); const c = body.querySelector('.h2-daily'); c.classList.add('fading'); c.offsetHeight; c.classList.remove('fading'); }, 300);
}
/* ---------- calendar pop-up: month + year dropdowns, then a day ---------- */
const cal = {open:false, m:TODAY.getMonth(), y:TODAY.getFullYear()};
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const inRange = (y, m) => new Date(y, m + 1, 0) >= EARLIEST && new Date(y, m, 1) <= TODAY;
function calHTML(){
  const years = []; for (let y = EARLIEST.getFullYear(); y <= TODAY.getFullYear(); y++) years.push(y);
  const months = MONTHS.map((n, i) => [n, i]).filter(([, i]) => inRange(cal.y, i));
  const first = new Date(cal.y, cal.m, 1), lead = (first.getDay() + 6) % 7, days = new Date(cal.y, cal.m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span></span>';
  for (let n = 1; n <= days; n++){
    const d = new Date(cal.y, cal.m, n), off = d > TODAY || d < EARLIEST;
    cells += `<button class="cd${sameDay(d, hs.sel) ? ' sel' : ''}${sameDay(d, TODAY) ? ' today' : ''}" data-cal="${key(d)}" ${off ? 'disabled' : ''}>${n}</button>`;
  }
  return `<div class="cp-head">
      <label class="cp-sel"><select data-cal-m aria-label="Month">${months.map(([n, i]) => `<option value="${i}" ${i === cal.m ? 'selected' : ''}>${n}</option>`).join('')}</select><img src="${H}caret-down.svg" alt=""></label>
      <label class="cp-sel"><select data-cal-y aria-label="Year">${years.map(y => `<option ${y === cal.y ? 'selected' : ''}>${y}</option>`).join('')}</select><img src="${H}caret-down.svg" alt=""></label>
    </div>
    <div class="cp-letters">${LETTERS.map(l => `<span class="t-caption2">${l}</span>`).join('')}</div>
    <div class="cp-grid">${cells}</div>
    <button class="cp-today t-caption" data-cal-today>Today</button>`;
}
const pop = () => body.querySelector('#h2-calpop');
function drawCal(){ pop().innerHTML = calHTML(); }
function openCal(){
  cal.m = hs.sel.getMonth(); cal.y = hs.sel.getFullYear(); drawCal();
  cal.open = true; pop().classList.add('on'); body.querySelector('[data-cal-open]').setAttribute('aria-expanded', 'true');
}
function closeCal(){
  cal.open = false; pop()?.classList.remove('on'); body.querySelector('[data-cal-open]')?.setAttribute('aria-expanded', 'false');
}
body.addEventListener('change', e => {
  if (e.target.matches('[data-cal-m]')) cal.m = +e.target.value;
  else if (e.target.matches('[data-cal-y]')){
    cal.y = +e.target.value;
    if (!inRange(cal.y, cal.m)) cal.m = cal.y === TODAY.getFullYear() ? Math.min(cal.m, TODAY.getMonth()) : Math.max(cal.m, EARLIEST.getMonth());
  } else return;
  drawCal();
});
body.addEventListener('click', e => {
  const c = e.target.closest('[data-cal]');
  if (c){ const d = dayFromKey(+c.dataset.cal); select(d); toWeek(d, true); closeCal(); return; }
  if (e.target.closest('[data-cal-today]')){ select(new Date(TODAY)); toThisWeek(true); closeCal(); }
});
// a tap anywhere else closes it
document.addEventListener('pointerdown', e => { if (cal.open && !e.target.closest('#h2-calpop, [data-cal-open]')) closeCal(); }, true);

const dayFromKey = k => new Date(Math.floor(k / 10000), Math.floor(k / 100) % 100 - 1, k % 100);

body.addEventListener('click', e => {
  const day = e.target.closest('[data-day]'); if (day){ select(dayFromKey(+day.dataset.day)); return; }
  if (e.target.closest('[data-cal-open]')){ cal.open ? closeCal() : openCal(); return; }
  if (e.target.closest('#h2-calpop')) return;
  if (e.target.closest('[data-add]')){ openSheet(); return; }
  if (e.target.closest('[data-playlist]')){ openPlaylist(hs.sel); return; }
  const m = e.target.closest('[data-more]'); if (m){ openActions(+m.dataset.more); return; }
  const s = e.target.closest('[data-song]'); if (s){ openCatalogue(+s.dataset.song); return; }
  const p = e.target.closest('[data-pl]'); if (p){ openPlaylistPage(+p.dataset.pl); return; }
  const f = e.target.closest('[data-fold]'); if (f){ openFolder(+f.dataset.fold); return; }
  const go = e.target.closest('[data-go]');
  if (go){ ({songs:() => openCatalogue(0), playlists:openPlaylists, saves:openSaves})[go.dataset.go](); }
});
// the song "…" opens the existing actions sheet (defined in index.html)
const openActions = i => { const w = document.getElementById('sheet-wrap'); w.dataset.song = i; w.classList.add('open'); w.setAttribute('aria-hidden', 'false'); };

/* ---------- pages (slide in, Back slides them out) ---------- */
function page(id, label){
  const v = document.createElement('section');
  v.className = 'view h2-page offright'; v.id = id; v.setAttribute('aria-label', label);
  tabbar.before(v);
  v.addEventListener('click', e => { if (e.target.closest('[data-hback]')) backPage(); });
  return v;
}
const vLists = page('view-h2-playlists', 'Playlists For You');
const vList = page('view-h2-playlist', 'Playlist');
const vSaves = page('view-h2-saves', 'Your Saves');
const vFolder = page('view-h2-folder', 'Saved collection');
const PAGES = [vLists, vList, vSaves, vFolder];

function slideIn(v){
  if (current === home) stack.length = 0;
  v.style.transition = 'none'; v.classList.remove('offleft'); v.classList.add('offright'); v.offsetHeight; v.style.transition = '';
  stack.push(current);
  push(v);
}
function backPage(){
  const prev = stack.pop();
  if (!prev || prev === home){ stack.length = 0; goHome(); return; }
  const leaving = current;
  leaving.classList.add('offright');
  prev.classList.remove('offleft');
  current = prev;
  setTimeout(() => leaving.classList.remove('on-top'), 600);
}

// Playlists For You (Figma 1177:13527)
function openPlaylists(){
  vLists.innerHTML = subhead('Playlists For You', `
    <div class="cat-tools h2-tools" style="margin-top:0">
      <button class="tool-btn"><img src="${H}arrow-clockwise.svg" alt=""><span class="t-caption">Refresh</span></button>
      <button class="tool-select"><span class="t-caption">All Tags</span><img src="${H}caret-down.svg" alt=""></button>
      <label class="search-bar"><img src="${H}magnifying-glass.svg" alt=""><input type="text" placeholder="Search title, users, genre, or moods..." aria-label="Search playlists"></label>
    </div>`) + `
    <div class="h2-list">${PLAYLISTS.map((p, i) => cardRow(p, i)).join('')}</div>`;
  const input = vLists.querySelector('input');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    vLists.querySelectorAll('[data-open-pl]').forEach(c => {
      const p = PLAYLISTS[+c.dataset.openPl];
      c.hidden = !!q && !(p.name + ' ' + p.by + ' ' + p.tags.join(' ')).toLowerCase().includes(q);
    });
  });
  slideIn(vLists);
}
const cardRow = (p, i, tag = 'button') => `<${tag} class="h2-card" ${tag === 'button' ? `data-open-pl="${i}"` : ''}>${quad(p.art)}
    <div class="r"><div class="top"><p class="name">${esc(p.name)}</p>${tagsHTML(p.tags)}</div>
      <div class="h2-by"><img src="${p.ava}" alt=""><p class="t-caption">${esc(p.by)} · ${p.n} tracks</p></div></div></${tag}>`;
vLists.addEventListener('click', e => { const c = e.target.closest('[data-open-pl]'); if (c) openPlaylistPage(+c.dataset.openPl); });

// a playlist (Figma 1171:7198)
const follows = new Set(), adds = new Set();
function openPlaylistPage(i){
  const p = PLAYLISTS[i];
  vList.dataset.pl = i;
  vList.innerHTML = subhead('Playlists For You') + `
    <div class="h2-pbody">
      ${cardRow(p, i, 'div')}
      <div class="h2-acts">
        <button class="round" aria-label="Play ${esc(p.name)}"><img src="${H}play-48.svg" alt=""></button>
        <button class="round ${adds.has(i) ? 'on' : ''}" data-padd aria-label="Add ${esc(p.name)} to your library"><img src="${H}add-48.svg" alt=""></button>
        <button class="btn btn-secondary t-body ${follows.has(i) ? 'on' : ''}" data-follow>${follows.has(i) ? 'Following' : 'Follow Creator'}</button>
      </div>
      <ul class="h2-tracks">${tracksFor(i).map(t => `<li><span class="th">${t.img ? `<img src="${t.img}" alt="">` : ''}</span>
        <div class="names"><p class="t-body">${esc(t.t)}</p><p class="t-caption">${esc(t.a)}</p></div>
        <button class="dots-btn" aria-label="More for ${esc(t.t)}"><img src="${H}dots-three-26.svg" alt=""></button></li>`).join('')}</ul>
    </div>`;
  slideIn(vList);
}
vList.addEventListener('click', e => {
  const i = +vList.dataset.pl, p = PLAYLISTS[i];
  const f = e.target.closest('[data-follow]');
  if (f){ const on = !follows.has(i); on ? follows.add(i) : follows.delete(i); f.classList.toggle('on', on); f.textContent = on ? 'Following' : 'Follow Creator'; return; }
  const a = e.target.closest('[data-padd]');
  if (a){ const on = !adds.has(i); on ? adds.add(i) : adds.delete(i); a.classList.toggle('on', on); if (on) toast('Added to your library', `${p.name} · ${p.by}`); }
});

// Your Saves (Figma 1177:14028)
const folders = FOLDERS.slice();
let plat = 'all';
function savesHTML(){
  const chip = (id, label, logo) => `<button class="h2-chip ${id === 'all' ? 'all' : ''} ${plat === id ? 'on' : ''}" data-plat="${id}">${logo ? `<span class="lg ${id === 'instagram' ? 'ig' : ''}"><img src="${logo}" alt=""></span>` : ''}${label}</button>`;
  return subhead('Your Saves') + `
    <div class="h2-saves">
      <div class="h2-plat"><p class="t-header">Connected Platforms</p>
        <div class="h2-chips">${chip('all', 'All')}${Object.entries(PLAT).map(([id, [l, logo]]) => chip(id, l, logo)).join('')}</div></div>
      <div class="h2-folds">${[0, 2, 1, ...folders.keys()].filter((i, k, a) => a.indexOf(i) === k).map(i => { const f = folders[i];   // Figma order: Originals, Playlists, Covers
        return folder(f, i).replace('class="fold"', `class="fold ${plat !== 'all' && !(f.src || []).includes(plat) ? 'dim' : ''}"`); }).join('')}
        <button class="fold add" data-newfold><div class="stack"><div class="lay l1"></div><div class="lay l2"></div><div class="lay l3"><img src="${H}plus.svg" alt=""></div></div>
          <div class="lbl"><p class="t-body">Add Folder</p></div></button></div>
    </div>`;
}
function openSaves(){ plat = 'all'; vSaves.innerHTML = savesHTML(); slideIn(vSaves); }
vSaves.addEventListener('click', e => {
  const c = e.target.closest('[data-plat]');
  if (c){ plat = c.dataset.plat; const y = vSaves.scrollTop; vSaves.innerHTML = savesHTML(); vSaves.scrollTop = y; return; }
  if (e.target.closest('[data-newfold]')){
    folders.push({name:`Folder ${folders.length - 2}`, cells:[], src:[]});
    vSaves.innerHTML = savesHTML(); return;
  }
  const f = e.target.closest('[data-fold]'); if (f) openFolder(+f.dataset.fold);
});

// one collection: what was saved, and where from
function openFolder(i){
  const f = folders[i];
  vFolder.innerHTML = subhead(esc(f.name)) + `
    <div class="h2-saves">${f.cells.length ? `<div class="h2-fgrid">${f.cells.map(([src, crop], k) => {
      const [label, logo] = PLAT[f.src[k]];
      return `<div class="h2-item"><span class="sq"><img ${crop ? `class="crop" style="height:${crop[0]}%;left:${crop[1]}%;top:${crop[2]}%;width:${crop[3]}%"` : ''} src="${src}" alt=""></span>
        <span class="src t-caption">${f.src[k] === 'instagram' ? `<span class="ig"><img src="${logo}" alt=""></span>` : `<img src="${logo}" alt="">`}Saved from ${label}</span></div>`;
    }).join('')}</div>` : `<p class="t-body h2-empty">Nothing saved here yet. Save a post on Instagram or YouTube and it shows up here.</p>`}</div>`;
  slideIn(vFolder);
}

/* ---------- Add a Song sheet ---------- */
const wrap = document.createElement('div');
wrap.className = 'h2-sheet-wrap'; wrap.setAttribute('aria-hidden', 'true');
wrap.innerHTML = `<div class="bd" data-close></div>
  <div class="h2-sheet" role="dialog" aria-label="Add a Song">
    <span class="grab"></span>
    <div class="hd"><p class="t-header">Add a Song</p><button data-close aria-label="Close"><img src="${H}x.svg" alt=""></button></div>
    <div class="fld">
      <label class="h2-input"><input type="text" placeholder="Search title or artist" autocomplete="off" aria-label="Search title or artist"></label>
      <div class="h2-pick h2-song" hidden></div>
      <div class="h2-results" role="listbox"></div>
    </div>
    <button class="h2-submit t-body" disabled>Submit Response</button>
  </div>`;
app.appendChild(wrap);
const sheet = wrap.querySelector('.h2-sheet'), input = wrap.querySelector('input'), res = wrap.querySelector('.h2-results');
const pickBox = wrap.querySelector('.h2-pick'), submit = wrap.querySelector('.h2-submit'), field = wrap.querySelector('.h2-input');
let pick = null, found = [], seq = 0, timer;
const songRow = (s, i) => `<button type="button" class="h2-song" data-res="${i}">${s.img ? `<img src="${s.img}" alt="">` : '<span class="ph"></span>'}
  <span class="names"><span class="t-body">${esc(s.t)}</span><span class="t-caption">${esc(s.a)}</span></span></button>`;
function setPick(s){
  pick = s;
  pickBox.hidden = !s; field.hidden = !!s; submit.disabled = !s;
  res.classList.remove('on'); sheet.classList.remove('searching');
  pickBox.innerHTML = s ? `<button class="x" data-unpick aria-label="Remove ${esc(s.t)}"><img src="${H}x.svg" alt=""></button>
    ${s.img ? `<img src="${s.img}" alt="">` : '<span class="ph"></span>'}<span class="names"><p class="t-body">${esc(s.t)}</p><p class="t-caption">${esc(s.a)}</p></span>` : '';
}
function showResults(list){
  found = list;
  res.innerHTML = list.length ? list.map(songRow).join('') : `<p class="t-body none">No songs found</p>`;
  res.classList.add('on'); sheet.classList.add('searching');
}
input.addEventListener('input', () => {
  clearTimeout(timer);
  const q = input.value.trim();
  if (!q){ res.classList.remove('on'); sheet.classList.remove('searching'); return; }
  const local = SHEET_SONGS.filter(s => (s.t + ' ' + s.a).toLowerCase().includes(q.toLowerCase()));
  if (local.length) showResults(local);
  const my = ++seq;
  timer = setTimeout(async () => {
    const more = await searchSongs(q);
    if (my !== seq || input.value.trim() !== q) return;
    showResults([...local, ...more.filter(m => !local.some(l => same(l, m)))]);
  }, 250);
});
input.addEventListener('keydown', e => { if (e.key === 'Enter' && found.length){ e.preventDefault(); setPick(found[0]); input.blur(); } });
wrap.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return closeSheet();
  const r = e.target.closest('[data-res]'); if (r){ setPick(found[+r.dataset.res]); input.value = ''; input.blur(); return; }
  if (e.target.closest('[data-unpick]')){ setPick(null); input.focus({preventScroll:true}); return; }
  if (e.target === submit && pick){
    submitted[key(TODAY)] = pick;
    closeSheet();
    body.querySelector('#h2-card').innerHTML = cardHTML();
    // straight to today's Daily Prompt Playlist, where the song now ranks
    openPlaylist(TODAY);
    toast('Song submitted!');
  }
});
function openSheet(){
  setPick(null); input.value = '';
  wrap.classList.add('open'); wrap.setAttribute('aria-hidden', 'false');
  setTimeout(() => input.focus({preventScroll:true}), 600);
}
function closeSheet(){ wrap.classList.remove('open'); wrap.setAttribute('aria-hidden', 'true'); input.blur(); sheet.style.transform = ''; }
(() => { // drag the sheet down to dismiss
  let y0 = null;
  sheet.addEventListener('pointerdown', e => { if (e.target.closest('input, button, .h2-results')) return; y0 = e.clientY; sheet.style.transition = 'none'; });
  sheet.addEventListener('pointermove', e => { if (y0 !== null) sheet.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
  const end = e => { if (y0 === null) return; const dy = e.clientY - y0; y0 = null; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 70) closeSheet(); };
  sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
})();

/* ---------- banner ---------- */
const tst = document.createElement('div');
tst.className = 'h2-toast'; tst.setAttribute('role', 'status');
tst.innerHTML = `<span class="ok"><i></i></span><span class="tx"><p class="t-body-db"></p><p class="t-caption"></p></span>`;
app.appendChild(tst);
function toast(title, sub){
  tst.querySelector('.t-body-db').textContent = title;
  tst.querySelector('.t-caption').textContent = sub || '';
  tst.querySelector('.t-caption').hidden = !sub;
  tst.classList.add('on');
  clearTimeout(tst._t); tst._t = setTimeout(() => tst.classList.remove('on'), 2600);
}

/* ---------- restart flow ---------- */
function reset(){
  closeSheet(); tst.classList.remove('on');
  delete submitted[key(TODAY)];
  closeCal(); hs.sel = new Date(TODAY); stack.length = 0; follows.clear(); adds.clear(); folders.length = FOLDERS.length;
  PAGES.forEach(v => { v.style.transition = 'none'; v.classList.remove('offleft', 'on-top'); v.classList.add('offright'); v.offsetHeight; v.style.transition = ''; });
  render();
}

render();
document.fonts && document.fonts.ready.then(() => toThisWeek(false));
window.tonoHome = {reset, openSheet, select, toast};
})();
