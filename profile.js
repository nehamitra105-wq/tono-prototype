/* =========================================================
   PROFILE — follows the Figma prototype:
   Profile ─ gear → Settings → (Basic info · Connected music apps · Privacy controls · Notifications · Payments)
           └ followers/following → Follower list → tap a person → their profile ("You both like …")
   week/month switch on the listening-hours card on both profiles.
   ========================================================= */
(() => {
const PF = 'assets/profile/';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const app = document.getElementById('app');
const tabbar = app.querySelector('.tabbar');

const PEOPLE = [
  {name:'Maya', handle:'@QuietMango42', img:PF+'f01.png', following:true},
  {name:'Elias', handle:'@neon_drifter', img:PF+'f02.png', following:true},
  {name:'Sofia', handle:'@PixelFox88', img:PF+'f03.png', following:true},
  {name:'Theo', handle:'@cosmic.pancake', img:PF+'f04.png', following:true},
  {name:'Amara', handle:'@VelvetThunder', img:PF+'f05.png', following:false},
  {name:'Naomi', handle:'@mossy_lantern', img:PF+'f06.png', following:false},
  {name:'Felix', handle:'@TurboWalrus7', img:PF+'f07.png', following:false},
  {name:'Zara', handle:'@glitchbloom', img:PF+'f08.png', following:false},
  {name:'Rafael', handle:'@SleepyComet', img:PF+'f09.png', following:false},
  {name:'Imani', handle:'@ember.circuit', img:PF+'f10.png', following:false},
];
const PROMPT = 'Songs for a 3am drive?';

/* ---------- shared card builders ---------- */
const stats = () => `<div class="pf-stats">
  <div><p class="pf-num">442</p><p class="t-caption">Artists</p></div>
  <div><p class="pf-num">800</p><p class="t-caption">Albums</p></div>
  <div><p class="pf-num">1,423</p><p class="t-caption">Tracks</p></div></div>`;
const card = (lead, big, sub = '', bigW = '') => `<div class="pf-card">
  <p class="lead t-body">${lead}</p>
  <p class="big gradient-text"${bigW ? ` style="width:${bigW}px"` : ''}>${big}</p>${sub ? `<p class="sub t-caption">${sub}</p>` : ''}</div>`;
// each tile opens a sheet with the artists that make up that genre (Figma 1124:18479 / 1108:14438)
const genres = c => `<div class="pf-genres"><p class="hd">Top genres</p><div class="pf-tiles">
  <div class="col">
    <button class="pf-tile" data-genre="Pop" style="height:147px;background:${c[0]}"><p class="pf-num" style="font-size:32px">34%</p><p class="lbl" style="top:51px">Pop</p></button>
    <button class="pf-tile" data-genre="Dream pop" style="flex:1;background:${c[1]}"><p class="pf-num" style="font-size:28px">25%</p><p class="lbl" style="top:46px">Dream pop</p></button>
  </div>
  <div class="col">
    <button class="pf-tile" data-genre="Jazz" style="height:105px;background:${c[2]}"><p class="pf-num" style="font-size:26px">18%</p><p class="lbl" style="top:44px">Jazz</p></button>
    <button class="pf-tile" data-genre="Neosoul" style="height:88px;background:${c[3]}"><p class="pf-num" style="font-size:22px">13%</p><p class="lbl" style="top:40px">Neosoul</p></button>
    <button class="pf-tile flow" data-genre="Electro-pop" style="flex:1;background:${c[4]}"><p class="pf-num" style="font-size:18px">10%</p><p class="lbl">Electro-pop</p></button>
  </div></div></div>`;
const tops = (title, hl, rows) => `<div class="pf-tops">
  <div class="hd"><p class="t-body">${title}</p><p class="t-caption mut">This month</p></div>
  <div class="hl"><img src="${hl.img}" alt=""><div class="tx">${hl.lines.join('')}</div></div>
  <ol class="t-caption">${rows.map((r, i) => `<li><span><span class="mut">#${i + 2}</span>${esc(r[0])}</span><span class="mut">${r[1]}</span></li>`).join('')}</ol></div>`;

const ARROWS = `<button class="cb" aria-label="Previous"><img src="assets/arrow-left-cal.svg" alt=""></button>`;
function hours(mode){
  const range = `<div class="pf-range"><button class="t-caption ${mode === 'week' ? 'on' : ''}" data-range="week">week</button><button class="t-caption ${mode === 'month' ? 'on' : ''}" data-range="month">month</button></div>`;
  const nav = label => `<div class="pf-nav">${ARROWS}<div class="mid"><p class="t-body">${label}</p><span><img src="assets/calendar-dots.svg" alt=""></span></div>
    <button class="cb" aria-label="Next"><img src="assets/arrow-right-cal.svg" alt=""></button></div>`;
  if (mode === 'week'){
    const H = [40, 29, 51, 34, 64, 88, 61], D = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], V = ['2.5','1.8','3.2','2.1','4.0','5.5','3.8'];
    return `<div class="pf-hours" data-hours>
      <div class="hd"><p class="t-caption" style="color:#fff">Weekly listening hours</p>${range}</div>
      ${nav('Oct 2026  · Week 3')}
      <div class="pf-total"><p class="t-caption2 mut">Total this week</p><div class="row"><p class="pf-num">22.9</p><p class="t-caption mut">hrs</p></div></div>
      <div class="pf-chart">
        <div class="pf-bars"><div class="y t-caption2 mut"><p>6h</p><p>4h</p><p>2h</p><p>0</p></div>${H.map((h, i) => `<div class="b${i === 5 ? ' top' : ''}"><i style="height:${h}px"></i></div>`).join('')}</div>
        <div class="pf-days t-caption2 mut"><span class="sp"></span>${D.map((d, i) => `<p class="${i === 5 ? 'hi' : ''}">${d}</p>`).join('')}</div>
        <div class="pf-days t-caption2 mut"><span class="sp"></span>${V.map((d, i) => `<p class="${i === 5 ? 'hi' : ''}">${d}</p>`).join('')}</div>
      </div>
      <div class="pf-foot"><div><p class="t-caption2 mut">Most active day</p><p class="t-caption">Saturday · 5.5 hrs</p></div><div><p class="t-caption2 mut">Daily avg</p><p class="t-caption">3.3 hrs</p></div></div>
    </div>`;
  }
  // month: intensities from the hi-fi calendar
  const I = [.25,.25,.5,.25,.75,.25,.25,.5,1,.25,.75,.75,1,.25,.25,.5,.25,.75,1,1,.25,.25,.5,1,1,.75,1,.25,.25,.25];
  const cells = [`<span></span>`, ...I.map((o, i) => `<span class="d t-caption" style="opacity:${o};color:${o > .5 ? 'var(--off-black)' : 'var(--navy)'}">${i + 1}</span>`)];
  while (cells.length % 7) cells.push('<span></span>');
  const weeks = []; for (let i = 0; i < cells.length; i += 7) weeks.push(`<div class="wk">${cells.slice(i, i + 7).join('')}</div>`);
  return `<div class="pf-hours month" data-hours>
    <div class="hd"><p class="t-caption" style="color:#fff">Monthly listening hours</p>${range}</div>
    ${nav('October 2026')}
    <div class="pf-total"><p class="t-caption2 mut">Total this month</p><div class="row"><p class="pf-num">74.5</p><p class="t-caption mut">hrs</p></div></div>
    <div class="pf-cal"><div class="wk t-caption2">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<p class="wd">${d}</p>`).join('')}</div>${weeks.join('')}</div>
    <div class="pf-legend"><p class="t-caption2 mut">Listening hours per day</p><div class="scale t-caption2 mut">
      <span><i style="opacity:.25"></i>&lt;2</span><span><i style="opacity:.5"></i>2–4</span><span><i style="opacity:.75"></i>4–6</span><span><i></i>6+</span></div></div>
    <div class="pf-foot"><div><p class="t-caption2">Most active day</p><p class="t-caption">Sat, 19 Sep · 6.5 hrs</p></div><div><p class="t-caption2 mut">Daily avg</p><p class="t-caption">2.5 hrs</p></div></div>
  </div>`;
}

/* ---------- views ---------- */
function makeView(id, label){
  const v = document.createElement('section');
  v.className = 'view pf-view offright'; v.id = id; v.setAttribute('aria-label', label);
  tabbar.before(v); return v;
}
const vMe = makeView('view-profile', 'Your profile');
const vThem = makeView('view-person', 'Profile');
const vFollow = makeView('view-followers', 'Followers');
const vSettings = makeView('view-settings', 'Settings');
const vPage = makeView('view-settings-page', 'Settings page');

let meHours = 'week', themHours = 'month', person = null, themBack = false, followTab = 'followers', followQuery = '';
const toggles = {private:true, sync:true, saveLiked:true, suggest:false, nf_followers:false, nf_recs:true, nf_comm:false, nf_daily:true, nf_mile:true, nf_weekly:true, nf_quiet:true};

function renderMe(){
  vMe.innerHTML = `<div class="pf-body">
    <div class="pf-head">
      <div class="pf-top">
        <div class="pf-id"><img class="ava" src="${PF}me.png" alt=""><div class="who"><p class="t-header">Sandra</p><p class="t-body">@mushqueen</p></div></div>
        <button class="pf-gear" data-go="settings" aria-label="Settings"><img src="${PF}ph-gear.svg" alt=""></button>
      </div>
      <div class="pf-row2">
        <span class="pf-chip t-body">Top Curator</span>
        <button class="pf-follows t-body" data-go="followers"><span>865 followers</span><span>865  following</span></button>
      </div>
      <div class="pf-prompt"><p class="t-caption">${esc(PROMPT)}</p></div>
      <p class="pf-bio t-body">IG: @mushqueen<br>You’re exactly where you’re meant to be~ ✨</p>
    </div>
    <div class="pf-stack">
      ${stats()}
      <div class="pf-cards">${card('You helped 356 people discover this song', 'Lowlife by That Poppy', '', 264)}${card('You’re in the top 5% of', 'Ethel Cain')}</div>
      ${genres(['#AA43F4', '#F75472', '#5858D0', '#B66EE9', '#E13F5D'])}
      ${tops('Top artists', {img:PF + 'sleep-token.png', lines:['<p class="t-caption">Sleep Token</p>', '<p class="t-caption2 dim">456 plays</p>']}, [['Justice', 94], ['NewJeans', 88], ['Magdalena Bay', 75], ['The Maria’s', 61]])}
      ${hours(meHours)}
    </div></div>`;
}
const first = p => (p.full || p.name).split(' ')[0];
function renderThem(){
  const p = person;
  vThem.innerHTML = `${themBack ? `<div class="pf-subhead"><button class="back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button><p class="t-body">${esc(first(p))}’s profile</p><span class="sp"></span></div>` : ''}
    <div class="pf-body${themBack ? ' under-head' : ''}">
    <div class="pf-head">
      <div class="pf-top">
        <div class="pf-id"><img class="ava" src="${p.img}" alt=""><div class="who"><p class="t-header">${esc(p.full || p.name)}</p><p class="t-body">${esc(p.handle)}</p></div></div>
        <button class="pf-gear" data-go="settings" aria-label="Settings"><img src="${PF}ph-gear.svg" alt=""></button>
      </div>
      <div class="pf-row2">
        <span class="pf-chip t-body">Top Explorer</span>
        <button class="pf-follows gap t-body" data-go="followers"><span>865 followers</span><span>865  following</span></button>
      </div>
      <div class="pf-prompt" style="left:0"><p class="t-caption">${esc(PROMPT)}</p></div>
      <p class="pf-bio t-body">IG: ${esc(p.ig || '@' + p.handle.replace(/^@/, '').toLowerCase())}</p>
      <div class="pf-btns">
        <button class="pf-action t-body ${p.following ? 'on' : ''}" data-follow>${p.following ? 'Following' : 'Follow'}</button>
        <button class="pf-msg t-body" data-message>Message</button>
      </div>
    </div>
    <div class="pf-stack">
      ${stats()}
      <div class="pf-cards">${card('You both like', 'Malcolm Todd', 'Chest Pain (I Love) is a midnight favorite for you two.', 246)}${card('They’ve recently been listening to...', 'Summer-daze Afrobeats')}</div>
      ${genres(['#F75472', '#BD2FA9', '#812FD1', '#5858D0', '#C62F9D'])}
      ${tops('Top songs', {img:PF + 'starboy.png', lines:['<p class="t-caption2 dim">The Weeknd</p>', '<p class="t-caption">Starboy</p>', '<p class="t-caption2 dim">326 plays</p>']}, [['See You Again by Tyler, The Creator', 94], ['Change in the House of Flies by Deftones', 88], ['Killshot by Magdalena Bay', 75], ['Sienna by the Marias', 61]])}
      ${hours(themHours)}
    </div></div>`;
}

/* ---------- genre sheet: the artists behind a genre ---------- */
const P2 = 'assets/pf2/';
const ART = {weeknd:['The Weeknd', P2 + 'a-weeknd.png'], kid:['Kid Bloom', P2 + 'a-kidbloom.png'], justice:['Justice', P2 + 'a-justice.png'],
  tyler:['Tyler, the Creator', P2 + 'a-tyler.png'], cas:['Cigarettes After Sex', P2 + 'a-cas.png'], ethel:['Ethel Cain', P2 + 'a-ethel.png']};
// Pop follows the hi-fi; the other genres reuse the same artists in another order
const ORDERS = {'Pop':['weeknd', 'kid', 'justice', 'tyler', 'cas'], 'Dream pop':['cas', 'ethel', 'kid', 'weeknd', 'justice'], 'Jazz':['tyler', 'justice', 'cas', 'kid', 'ethel'],
  'Neosoul':['kid', 'weeknd', 'ethel', 'tyler', 'cas'], 'Electro-pop':['justice', 'weeknd', 'tyler', 'kid', 'ethel']};
const SHARED = ['justice', 'cas', 'kid', 'ethel', 'weeknd'];
const PLAYS = [456, 112, 100, 87, 56], SPLAYS = [231, 211, 195, 95, 92];
const artistRows = (keys, plays) => keys.map((k, i) => `<div class="pf-artist"><span class="n t-caption">${String(i + 1).padStart(2, '0')}</span>
  <img src="${ART[k][1]}" alt=""><span class="nm"><span class="t-body">${esc(ART[k][0])}</span><span class="t-caption">${plays[i]} plays</span></span>
  <span class="dots"><img src="${P2}dots.svg" alt=""></span></div>`).join('');
const acc = (id, title, body, open) => `<div class="pf-acc ${open ? 'open' : ''}" data-acc="${id}">
  <button class="hd t-body" data-acc-tog>${title}<img src="${P2}caret-down.svg" alt=""></button>
  <div class="bd"><div class="in">${body}</div></div></div>`;
const gsw = document.createElement('div');
gsw.className = 'pf-gsheet-wrap'; gsw.setAttribute('aria-hidden', 'true');
gsw.innerHTML = `<div class="bd" data-gclose></div><div class="pf-gsheet" role="dialog"><span class="grab"></span>
  <div class="hd"><p class="t-header"></p><button data-gclose aria-label="Close"><img src="${P2}x.svg" alt=""></button></div><div class="body"></div></div>`;
app.appendChild(gsw);
function openGenre(g, them){
  const keys = ORDERS[g] || ORDERS.Pop, low = g.toLowerCase();
  gsw.querySelector('.t-header').textContent = g;
  gsw.querySelector('.body').innerHTML = them
    ? acc('shared', `Shared ${low} artists`, `<div class="pf-shared"><p class="big">${32 - Object.keys(ORDERS).indexOf(g) * 5} shared artists</p><p class="t-body">You both always go back to ${esc(ART[SHARED[0]][0])}.</p></div>${artistRows(SHARED, SPLAYS)}`, true)
      + acc('top', `${esc(first(person))}’s top ${low} artists`, artistRows(keys, PLAYS), false)
    : `<div class="pf-acc open static"><p class="hd t-body">Top ${low} artists</p><div class="bd"><div class="in">${artistRows(keys, PLAYS)}</div></div></div>`;
  gsw.querySelector('.pf-gsheet').scrollTop = 0;
  gsw.classList.add('open'); gsw.setAttribute('aria-hidden', 'false');
}
gsw.addEventListener('click', e => {
  if (e.target.closest('[data-gclose]')){ gsw.classList.remove('open'); gsw.setAttribute('aria-hidden', 'true'); return; }
  const t = e.target.closest('[data-acc-tog]'); if (t) t.closest('.pf-acc').classList.toggle('open');
});
[vMe, vThem].forEach(v => v.addEventListener('click', e => { const g = e.target.closest('[data-genre]'); if (g) openGenre(g.dataset.genre, v === vThem); }));

function renderFollowers(){
  const q = followQuery.trim().toLowerCase();
  const list = PEOPLE.filter(p => (followTab === 'followers' || p.following) && (!q || (p.name + ' ' + p.handle).toLowerCase().includes(q)));
  const listHTML = list.length ? list.map(p => `<div class="pf-person" data-person="${PEOPLE.indexOf(p)}" role="button" tabindex="0">
      <img src="${p.img}" alt=""><div class="nm"><p class="t-header">${esc(p.name)}</p><p class="t-body">${esc(p.handle)}</p></div>
      <button class="pf-action t-body ${p.following ? 'following' : ''}" data-fol="${PEOPLE.indexOf(p)}">${p.following ? 'Following' : 'Follow'}</button></div>`).join('')
    : `<p class="pf-empty t-body">No one matches “${esc(followQuery)}”</p>`;
  if (!vFollow.firstChild){
    vFollow.innerHTML = `<div class="pf-subhead"><button class="back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button><p class="t-body">Followers</p><span class="sp"></span></div>
      <div class="pf-fbody">
        <label class="pf-search"><img src="assets/magnifier.svg" alt=""><input type="text" placeholder="Search people..." data-fsearch></label>
        <div class="pf-seg"><button class="t-body" data-ftab="followers">Followers</button><button class="t-body" data-ftab="following">Following</button></div>
        <div class="pf-list"><p class="cnt t-body" data-fcount></p><div class="pf-people" data-flist></div></div>
      </div>`;
  }
  vFollow.querySelectorAll('[data-ftab]').forEach(b => b.classList.toggle('on', b.dataset.ftab === followTab));
  vFollow.querySelector('.pf-subhead .t-body').textContent = followTab === 'followers' ? 'Followers' : 'Following';
  vFollow.querySelector('[data-fcount]').textContent = followTab === 'followers' ? 'Followers (865)' : 'Following (865)';
  vFollow.querySelector('[data-flist]').innerHTML = listHTML;
}

/* settings + its pages */
const caret = `<img class="caret" src="${PF}ph-caret-right.svg" alt="">`;
const tog = k => `<button class="pf-toggle ${toggles[k] ? 'on' : ''}" data-toggle="${k}" role="switch" aria-checked="${toggles[k]}"></button>`;
const sub = title => `<div class="pf-subhead"><button class="back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button><p class="t-body">${title}</p><span class="sp"></span></div>`;
const row = (t1, t2, go) => `<button class="pf-srow" data-page="${go}"><span class="tx"><span class="t1">${t1}</span><span class="t2">${t2}</span></span>${caret}</button>`;
const pref = (t1, t2, right) => `<div class="pf-srow pref"><span class="tx"><span class="t1">${t1}</span><span class="t2">${t2}</span></span>${right}</div>`;
const opt = (t1, t2, btn) => `<div class="pf-opt"><div class="tx"><p class="t1">${t1}</p><p class="t2">${t2}</p></div><button>${btn}</button></div>`;
const D = '<div class="div"></div>';
function renderSettings(){
  vSettings.innerHTML = `${sub('Settings')}<div class="pf-sbody">
    <div class="pf-sec"><p class="t-body">Manage account</p><div class="pf-group">
      ${row('Basic info', 'Email, password, phone number', 'basic')}${D}
      ${row('Connected music apps', 'Manage your connected music services', 'apps')}${D}
      <div class="pf-srow"><span class="tx"><span class="t1">Private account</span><span class="t2">Only approved followers see your stats</span></span>${tog('private')}</div>
    </div></div>
    <div class="pf-sec"><p class="t-body">Privacy &amp; data</p><div class="pf-group">${row('Privacy controls', 'Listening visibility and personal data', 'privacy')}</div></div>
    <div class="pf-sec"><p class="t-body">Notifications</p><div class="pf-group">${row('Push notification settings', 'Manage all notification types', 'notifs')}</div></div>
    <div class="pf-sec"><p class="t-body">Payment</p><div class="pf-group">${row('Payment methods &amp; billing', 'Manage payments and subscription', 'pay')}</div></div>
  </div>`;
}
const PAGES = {
  basic: () => `${sub('Basic info')}<div class="pf-sbody">
    <p class="pf-intro">Update the contact details for your account.</p>
    <label class="pf-field"><span class="lb t-body">Email</span><input type="email" value="banana@gmail.com"></label>
    <label class="pf-field"><span class="lb t-body">Password</span><input type="password" value="bananasplit123"></label>
    <label class="pf-field"><span class="lb t-body"><span>Phone number</span><span class="t-caption mut">Optional</span></span><input type="tel" value="720-234-1234"></label>
  </div>`,
  apps: () => `${sub('Connected music apps')}<div class="pf-sbody tight">
    <div class="pf-sec" style="gap:12px">${opt('Spotify', 'Connected · Preferred playback', 'Manage')}${opt('Apple Music', 'Connected · Available for playback', 'Manage')}${opt('Deezer', 'Not connected', 'Connect')}</div>
    <div class="pf-sec"><p class="t-body">Playback &amp; sync</p><div class="pf-group">
      ${pref('Preferred playback', 'Open tracks in Spotify', '<span class="val">Spotify</span>')}${D}
      ${pref('Sync listening history', 'From both connected services', tog('sync'))}${D}
      ${pref('Save liked songs to Spotify', 'Apple Music library stays unchanged', tog('saveLiked'))}
    </div></div>
  </div>`,
  privacy: () => `${sub('Privacy controls')}<div class="pf-sbody tight">
    <p class="pf-intro">Control your listening visibility and data.</p>
    <div class="pf-sec"><p class="t-body">Listening visibility</p><div class="pf-group">
      ${pref('Listening activity', 'Recent tracks and now playing', '<span class="val">Followers only</span>')}${D}
      ${pref('Listening stats', 'Top artists, genres and recaps', '<span class="val">Followers only</span>')}
    </div><p class="pf-note">${toggles.private ? 'Private account is on. Only approved followers have access.' : 'Private account is off. Anyone can see your listening.'}</p></div>
    <div class="pf-sec"><p class="t-body">Discoverability &amp; personal data</p><div class="pf-group">${pref('Suggest my profile', 'Appear in people suggestions', tog('suggest'))}</div></div>
    <div class="pf-sec"><p class="t-body">Your account data</p>${opt('Download my data', 'Request a copy of your account and history', 'Request')}${opt('Delete account data', 'Review permanent deletion before confirming', 'Review')}</div>
  </div>`,
  notifs: () => `${sub('Notifications')}<div class="pf-sbody tight">
    <p class="pf-intro">Keep the updates that matter to you.</p>
    <div class="pf-sec"><p class="t-body">Notification types</p><div class="pf-group">
      ${pref('New followers', 'Requests and approved followers', tog('nf_followers'))}${D}
      ${pref('Song recommendations', 'Tracks shared with you', tog('nf_recs'))}${D}
      ${pref('Community activity', 'Comments, replies and mentions', tog('nf_comm'))}${D}
      ${pref('Daily playlist prompts', 'A reminder to find something new', tog('nf_daily'))}${D}
      ${pref('Listening milestones', 'Personal listening achievements', tog('nf_mile'))}${D}
      ${pref('Weekly recap', 'Your listening week, every Sunday', tog('nf_weekly'))}
    </div></div>
    <div class="pf-sec"><p class="t-body">Quiet hours</p><div class="pf-group">${pref('Pause push notifications', 'Every day · 10:00 pm–8:00 am', tog('nf_quiet'))}</div></div>
  </div>`,
  pay: () => `${sub('Payments')}<div class="pf-sbody tight">
    <p class="pf-intro">Your subscription and billing details.</p>
    <div class="pf-sec" style="gap:10px"><div class="pf-plan"><p class="t-body" style="color:var(--off-white)">Premium · Active</p><p class="price gradient-text">$9.99 / month</p></div>
      <div class="pf-renew"><p class="mut">Renews Nov 18, 2026 · $5.99 USD</p><button>Cancel</button></div></div>
    <div class="pf-sec"><p class="t-body">Payment method</p>${opt('Visa •••• 4242', 'Example card · Expires 08/2028', 'Update')}<p class="pf-note">Receipts to alex.morgan@example.com</p></div>
    <div class="pf-sec"><p class="t-body">Payment history</p><div class="pf-group">
      ${pref('Oct 18, 2026', 'Monthly subscription', '<span class="val">$5.99 · Paid</span>')}${D}
      ${pref('Sep 18, 2026', 'Monthly subscription', '<span class="val">$5.99 · Paid</span>')}${D}
      ${pref('Aug 18, 2026', 'Monthly subscription', '<span class="val">$5.99 · Paid</span>')}
    </div></div>
  </div>`,
};
let page = null;
function renderPage(){ vPage.innerHTML = PAGES[page](); }

/* ---------- navigation stack ---------- */
const stack = [];
const ALL = () => [...app.querySelectorAll('.view')];
function instantly(el, fn){ el.style.transition = 'none'; fn(); el.offsetHeight; requestAnimationFrame(() => { el.style.transition = ''; }); }
// put every screen away and show Home (optionally sliding the top screen out)
function resetToHome(animate){
  const top = current;
  ALL().forEach(v => { if (v !== home && v !== top) instantly(v, () => { v.classList.add('offright'); v.classList.remove('offleft', 'on-top'); }); });
  if (top && top !== home){
    if (animate){ top.classList.add('offright'); setTimeout(() => top.classList.remove('on-top'), 600); }
    else instantly(top, () => { top.classList.add('offright'); top.classList.remove('on-top'); });
  }
  instantly(home, () => home.classList.remove('offleft'));
  stack.forEach(v => { if (v !== top || !animate) v.style.zIndex = ''; });
  if (top && animate) setTimeout(() => { top.style.zIndex = ''; }, 600);
  current = home; stack.length = 0;
}
function go(v){
  // a screen already in the stack (e.g. Followers → their profile → their followers): step back to it
  if (stack.includes(v)){ while (stack[stack.length - 1] !== v) back(); return; }
  stack.push(v); v.style.zIndex = 2 + stack.length; push(v);
}
function back(){
  if (stack.length < 2){ return; }
  const top = stack.pop(), prev = stack[stack.length - 1];
  top.classList.add('offright'); prev.classList.remove('offleft'); current = prev;
  setTimeout(() => { if (!stack.includes(top)){ top.classList.remove('on-top'); top.style.zIndex = ''; } }, 600);
  if (prev === vSettings) renderSettings();
}
const setTab = name => tabbar.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
function openProfile(){
  resetToHome(false);
  meHours = 'week'; renderMe(); vMe.scrollTop = 0;
  setTab('profile'); go(vMe);
}

// tab bar: Profile / Discovery handled here; Player gets a clean stack first
tabbar.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (!t) return;
  // switching tabs swaps screens instantly — slides are only for moving within a tab
  app.classList.add('instant');
  clearTimeout(tabbar._instantT);
  requestAnimationFrame(() => requestAnimationFrame(() => { tabbar._instantT = setTimeout(() => app.classList.remove('instant'), 50); }));
  const inProfile = stack.length && stack.includes(current);
  if (t.dataset.tab === 'profile'){ e.stopImmediatePropagation(); openProfile(); }
  else if (t.dataset.tab === 'discovery' && inProfile){ e.stopImmediatePropagation(); resetToHome(true); setTab('discovery'); }
  else if (t.dataset.tab === 'player' && inProfile){ resetToHome(false); }
  else if (t.dataset.tab === 'community'){ e.stopImmediatePropagation(); window.tonoCommunity?.open(); }
  else if (t.dataset.tab === 'deep'){ e.stopImmediatePropagation(); if (inProfile) resetToHome(false); window.tonoNode?.openTab(); }
  else if (t.dataset.tab === 'discovery') setTab('discovery');
}, true);

/* ---------- interactions ---------- */
function onHours(e, isMe){
  const r = e.target.closest('[data-range]'); if (!r) return false;
  if (isMe){ meHours = r.dataset.range; } else { themHours = r.dataset.range; }
  const card = e.target.closest('[data-hours]');
  card.outerHTML = hours(r.dataset.range);
  return true;
}
vMe.addEventListener('click', e => {
  if (onHours(e, true)) return;
  const g = e.target.closest('[data-go]'); if (!g) return;
  if (g.dataset.go === 'settings'){ renderSettings(); vSettings.scrollTop = 0; go(vSettings); }
  if (g.dataset.go === 'followers'){ followTab = 'followers'; followQuery = ''; vFollow.innerHTML = ''; renderFollowers(); vFollow.scrollTop = 0; go(vFollow); }
});
vThem.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return back();
  if (onHours(e, false)) return;
  if (e.target.closest('[data-follow]')){ person.following = !person.following; renderThem(); return; }
  if (e.target.closest('[data-message]')){ window.tonoMsgs?.openWith({name:first(person), handle:person.handle, img:person.img}); return; }
  const g = e.target.closest('[data-go]'); if (!g) return;
  if (g.dataset.go === 'settings'){ renderSettings(); vSettings.scrollTop = 0; go(vSettings); }
  if (g.dataset.go === 'followers'){ followTab = 'followers'; followQuery = ''; vFollow.innerHTML = ''; renderFollowers(); vFollow.scrollTop = 0; go(vFollow); }
});
vFollow.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return back();
  const tb = e.target.closest('[data-ftab]'); if (tb){ followTab = tb.dataset.ftab; renderFollowers(); return; }
  const f = e.target.closest('[data-fol]'); if (f){ const p = PEOPLE[+f.dataset.fol]; p.following = !p.following; renderFollowers(); return; }
  const row = e.target.closest('[data-person]');
  if (row){ person = PEOPLE[+row.dataset.person]; themHours = 'month'; renderThem(); vThem.scrollTop = 0; go(vThem); }
});
vFollow.addEventListener('input', e => { if (e.target.matches('[data-fsearch]')){ followQuery = e.target.value; renderFollowers(); } });
vSettings.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return back();
  const t = e.target.closest('[data-toggle]'); if (t){ toggles[t.dataset.toggle] = !toggles[t.dataset.toggle]; t.classList.toggle('on'); t.setAttribute('aria-checked', toggles[t.dataset.toggle]); return; }
  const p = e.target.closest('[data-page]'); if (p){ page = p.dataset.page; renderPage(); vPage.scrollTop = 0; go(vPage); }
});
vPage.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return back();
  const t = e.target.closest('[data-toggle]'); if (t){ toggles[t.dataset.toggle] = !toggles[t.dataset.toggle]; t.classList.toggle('on'); t.setAttribute('aria-checked', toggles[t.dataset.toggle]); }
});

// iOS-style edge swipe back on profile screens (someone else's profile has no back arrow in the hi-fi)
[vThem, vFollow, vSettings, vPage].forEach(v => {
  let sx = null, sy = 0;
  v.addEventListener('pointerdown', e => { const r = v.getBoundingClientRect(); if ((e.clientX - r.left) / (r.width / 402) < 24){ sx = e.clientX; sy = e.clientY; } });
  v.addEventListener('pointerup', e => { if (sx === null) return; const dx = (e.clientX - sx), dy = Math.abs(e.clientY - sy); sx = null; if (dx > 60 && dx > dy) back(); });
});

document.getElementById('restart')?.addEventListener('click', () => { resetToHome(false); setTab('discovery'); gsw.classList.remove('open'); });
// shared with community.js: same screen stack, and someone else's profile
function openPerson(p){ person = p; themBack = true; themHours = 'month'; renderThem(); vThem.scrollTop = 0; go(vThem); }
window.tonoProfile = {open:openProfile, openPerson, go, back, resetToHome, setTab, get stack(){ return stack.map(v => v.id); }};
})();
