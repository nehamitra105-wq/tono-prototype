/* =========================================================
   ONBOARDING (Figma section 1352:17729 "Onboarding Hi-fi") — a working sign-up, not a click-through.
   Welcome → (intro slides) → Create account → About you → Connect music apps (permission sheet)
   → You're in sync → Pick artists → Pick tracks → Subscription → Checkout (→ Add new card) → You're all set
   → Privacy setting → Home.   Sign in skips straight to Home.
   The app opens here (the lock-screen intro is skipped); "Restart flow" brings you back.
   ========================================================= */
(() => {
const A = 'assets/onb/';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const screen = document.getElementById('screen');
const lock = document.getElementById('lock');

/* ---------- data ---------- */
const APPS = [
  {id:'spotify', name:'Spotify', sub:'Playlists, top artists & saved songs', img:'app-spotify.png', artists:86, songs:'1,248'},
  {id:'apple', name:'Apple Music', sub:'Library & recently played', img:'app-apple.png', artists:64, songs:'932'},
  {id:'ytm', name:'YouTube Music', sub:'Likes & listening history', img:'app-ytm.png', artists:51, songs:'707'},
  {id:'soundcloud', name:'SoundCloud', sub:'Likes, reposts & follows', img:'app-soundcloud.png', artists:38, songs:'415'},
];
const SUGGESTED = [['Clairo', 'ar-clairo.png'], ['sombr', 'ar-sombr.png'], ['Faye Webster', 'ar-faye.png'], ['Mitski', 'ar-mitski.png'], ['Steve Lacy', 'ar-lacy.png']];
const MORE_ARTISTS = ['SZA', 'Malcolm Todd', 'Laufey', 'Frank Ocean', 'Lana Del Rey', 'Daniel Caesar', 'beabadoobee', 'Phoebe Bridgers',
  'Tyler, The Creator', 'Rex Orange County', 'Doja Cat', 'NewJeans', 'Magdalena Bay', 'The Marías', 'Justice', 'Sleep Token', 'Le Sserafim', 'Dominic Fike'];
const ALL_ARTISTS = [...SUGGESTED.map(a => a[0]), ...MORE_ARTISTS];
const H = 'assets/home2/', C = 'assets/community/';
const SONGS = [
  {t:'From The Start', a:'Laufey', img:A + 'sg-fromthestart.png'},
  {t:'Snooze', a:'SZA', img:A + 'sg-snooze.png'},
  {t:'Bags', a:'Clairo', img:A + 'sg-bags.png', why:'Laufey'},
  {t:'Best Part', a:'Daniel Caesar', img:A + 'sg-bestpart.png', why:'SZA'},
  {t:'Wonderwall', a:'Oasis', img:'assets/art-wonderwall.png', why:'Clairo'},
  {t:'Riptide', a:'Vance Joy', img:'assets/art-riptide.png', why:'Faye Webster'},
  {t:'Babydoll', a:'Dominic Fike', img:'assets/art-babydoll.png', why:'Steve Lacy'},
  {t:'Perfect Night', a:'Le Sserafim', img:C + 'perfect-night.png', why:'NewJeans'},
  {t:'Midnight City', a:'M83', img:C + 'midnight-city.png', why:'Magdalena Bay'},
  {t:'Late Night Lover', a:'三稜鏡', img:C + 'late-night-lover.png', why:'Mitski'},
  {t:'Sweet Venom', a:'Enhypen', img:C + 'sweet-venom.png', why:'NewJeans'},
  {t:'telepatia', a:'Kali Uchis', img:C + 'telepatia.png', why:'SZA'},
];
// the prompt's playlist, forming under the card on intro screen 3 (same Group top 10 as the Daily Prompt Playlist)
const TOP10 = [['Remember', 'Sam Ock'], ['Winter Waltz', 'FRANKIE'], ['Christmas Song', 'back number'], ['Love you on Christmas', 'Yerin Baek'], ['Come Softly', 'Grouper'],
  ['Winter Things', 'Ariana Grande'], ['snowy', 'Stella Jang'], ['In Winter', 'Chan'], ['Snow On The Beach', 'Taylor Swift'], ['Wintertime', 'Norah Jones']];
// the Home Daily Prompt card, live (same markup/classes as home2.js) so it always matches Home
const PROMPT_CARD = `<article class="card daily h2-daily">
    <div class="top"><p class="t-body">Daily Prompt</p></div>
    <h2 class="t-ginormous gradient-text">A song that feels like winter.</h2>
    <div class="tags"><span class="tag t-caption">Late Night Listeners</span><span class="tag t-caption">Soft Pop Fans</span></div>
    <div class="joined-wrap"><div class="joined">
      <div class="avatars"><span><b class="t-avatar">MK</b></span><span><b class="t-avatar">JL</b></span><span><b class="t-avatar">NS</b></span></div>
      <p class="t-caption">247 people joined today</p>
      <div class="streak"><div><img src="assets/home2/fire.svg" alt=""><span class="t-caption">5</span></div></div>
    </div></div>
    <div class="cta-wrap"><div class="cta-one"><span class="btn btn-primary t-body">Add a Song</span></div></div>
  </article>`;
const PLANS = {yearly:{label:'Yearly', price:79.99, per:'year'}, monthly:{label:'Monthly', price:9.99, per:'month'}};
const SLIDES = [
  {title:'Add a song on the map for everyone', art:'s1'},
  {title:'Send records to your friends', art:'s2'},
  {title:'Discover songs through community', art:'s3'},
  {title:'Find your music taste accurately', art:'s4'},
];

const fresh = () => ({email:'', pw:'', name:'', handle:'', photo:null, apps:{}, lastApp:null, artists:null, songs:[0, 1],
  plan:'yearly', trial:true, pay:'card', card:null, save:true, privacy:'public', slide:0});
let st = fresh();
const $o = sel => root.querySelector(sel);

/* ---------- dates & money ---------- */
const fmtMoney = n => `$${n.toFixed(2)}`;
const addDays = d => { const x = new Date(); x.setDate(x.getDate() + d); return x; };
const fmtDate = (d, year = true) => d.toLocaleDateString('en-US', {month:'short', day:'numeric', ...(year ? {year:'numeric'} : {})});
const renewDate = () => { const x = new Date(); st.plan === 'yearly' ? x.setFullYear(x.getFullYear() + 1) : x.setMonth(x.getMonth() + 1); return x; };

/* ---------- shell ---------- */
const root = document.createElement('section');
root.className = 'onb'; root.id = 'onb'; root.setAttribute('aria-label', 'Sign up');
const sb = document.querySelector('#app .statusbar').cloneNode(true);
sb.classList.remove('solid'); sb.classList.add('ob-sb');
root.appendChild(sb);
screen.appendChild(root);

/* screens slide in from the right like the rest of the app (600ms slow curve); Back reverses it */
const stack = [];
const SCREENS = {};
function el(id){
  let s = root.querySelector(`.ob-scr[data-s="${id}"]`);
  if (!s){ s = document.createElement('div'); s.className = 'ob-scr off-r'; s.dataset.s = id; root.insertBefore(s, sb); }
  return s;
}
function draw(id){ el(id).innerHTML = SCREENS[id](); after[id]?.(); }
function go(id, {replace = false} = {}){
  const from = stack[stack.length - 1];
  draw(id);
  const s = el(id);
  s.style.transition = 'none'; s.classList.add('off-r'); s.classList.remove('off-l'); s.offsetHeight; s.style.transition = '';
  s.classList.remove('off-r');
  if (from){ const f = el(from); if (replace) f.classList.add('off-r'); else f.classList.add('off-l'); }
  if (replace) stack.pop();
  stack.push(id);
  s.querySelector('.ob-body')?.scrollTo(0, 0);
}
function back(){
  if (stack.length < 2) return;
  const leaving = stack.pop(), to = stack[stack.length - 1];
  draw(to);
  el(to).classList.remove('off-l');
  el(leaving).classList.add('off-r');
}
function show(id){   // jump without animation (boot / restart)
  root.querySelectorAll('.ob-scr').forEach(s => { s.style.transition = 'none'; s.classList.add('off-r'); s.classList.remove('off-l'); });
  draw(id); el(id).classList.remove('off-r');
  root.offsetHeight; root.querySelectorAll('.ob-scr').forEach(s => { s.style.transition = ''; });
  stack.length = 0; stack.push(id);
}

/* ---------- shared bits ---------- */
const top = (step, noBack) => `<div class="ob-top">${noBack ? '' : `<button class="ob-back" data-back aria-label="Back"><img src="assets/caret-left.svg" alt=""></button>`}${step ? `
  <div class="ob-step"><p>Step ${step} of 4</p><div class="ob-prog">${[1, 2, 3, 4].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div></div>` : ''}</div>`;
const field = (label, name, ph, {type = 'text', val = '', mode = '', auto = 'off', max = ''} = {}) => `
  <label class="ob-in" data-f="${name}"><span class="lbl">${label}</span>
    <input class="t-body" name="${name}" type="${type}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="${auto}"${mode ? ` inputmode="${mode}"` : ''}${max ? ` maxlength="${max}"` : ''}>
    <span class="err"></span></label>`;
const hi = `<div class="ob-hi"><i></i></div>`;
const radio = on => `<i class="ob-radio ${on ? 'on' : ''}" aria-hidden="true"></i>`;
const appOf = id => APPS.find(a => a.id === id);
function setErr(name, msg){
  const f = root.querySelector(`.ob-scr:not(.off-r):not(.off-l) .ob-in[data-f="${name}"]`) || root.querySelector(`.ob-in[data-f="${name}"]`);
  if (!f) return; f.classList.toggle('bad', !!msg); f.querySelector('.err').textContent = msg || '';
}
let toastT = 0;
function toast(msg){
  const t = $o('.ob-toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400);
}
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/* ---------- screens ---------- */
// Welcome: three columns of concert photos drifting like a slow carousel (alternate directions, seamless loop)
const WALL_A = [['w100', 510 / 696], ['w97', 510 / 638], ['w101', 510 / 764], ['w103', 1080 / 1350], ['w106', 1280 / 1707]];
const WALL_B = [['w105', 1080 / 1349], ['w99', 447 / 670], ['w98', 447 / 596], ['w102', 2048 / 2731], ['w104', 1080 / 1409], ['w107', 1224 / 1632]];
const wallCol = (list, cls) => { const imgs = list.map(([f, r]) => `<img src="${A}wall/${f}.jpg" alt="" style="aspect-ratio:${r.toFixed(4)}">`).join('');
  return `<div class="wc ${cls}"><div class="run">${imgs}${imgs}</div></div>`; };
const wall = () => `<div class="wall" aria-hidden="true">${wallCol(WALL_A, 'a')}${wallCol(WALL_B, 'b')}${wallCol([...WALL_A.slice(2), ...WALL_A.slice(0, 2)], 'c')}</div>`;
SCREENS.welcome = () => `
  <div class="ob-splash">${wall()}<span class="tint"></span><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="blob b4"></span>
    <div class="hd"><p class="hi">Welcome to</p><img class="logo" src="${A}tono-logo.svg" alt="tono">
      <p class="tagline t-body">Curate your sound<img src="${A}disc-glyph.svg" alt="">Expand your community</p></div>
    <div class="ob-foot"><button class="ob-btn" data-go="intro">Create new account</button><button class="ob-btn sec" data-go="signin">Sign in</button></div>
  </div>`;

// intro (Figma 1352:18145 / 18198 / 18235 / 18248): one title per screen; no sideways slide — the picture cross-fades,
// the new title rises in from below as it fades 0 → 100%, and the progress fills one more segment
SCREENS.intro = () => `
  <div class="ob-intro">
    ${SLIDES.map((s, i) => `
      <div class="slide ${s.art} ${i === st.slide ? 'on' : ''}" data-slide="${i}">
        <div class="art">${{
          s1:`<img class="map" src="${A}s1-map.png" alt=""><img class="pop" src="${A}s1-pop.png" alt="">`,
          s2:`<img class="recs" src="${A}s2-records.png" alt="">`,
          s3:`<div class="prompt">${PROMPT_CARD}</div><div class="pl-hd"><b>Group top 10</b><span>Most Popular Answers</span></div><ol class="plist">${TOP10.map((t, k) => `<li style="--k:${k}"><span class="n">${String(k + 1).padStart(2, '0')}</span><img src="assets/home2/t10-${String(k + 1).padStart(2, '0')}.png" alt=""><span class="tx"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></span><img class="more" src="assets/home2/dots-three-26.svg" alt=""></li>`).join('')}</ol>`,
          s4:`<img class="board" src="${A}s4-board.png" alt="">`}[s.art]}<span class="veil"></span></div>
        <h2 class="copy">${esc(s.title)}</h2>
      </div>`).join('')}
    <div class="dots">${SLIDES.map((_, k) => `<i class="${k <= st.slide ? 'on' : ''}"></i>`).join('')}</div>
    <div class="bar"><button class="ghost t-body" data-go="create">Skip</button><button class="pill t-body" data-next>Next</button></div>
  </div>`;

SCREENS.signin = () => `
  <div class="ob-body">${top(0)}<h1>Sign in</h1>
    <div class="ob-form">${field('Email or username', 'login', 'you@example.com or @username', {val:st.email, mode:'email', auto:'username'})}
      ${field('Password', 'pw', '••••••••', {type:'password', auto:'current-password'})}
      <button class="ob-link right" data-forgot>Forgot password?</button></div>
    <button class="ob-btn" data-signin>Continue</button>
    <div class="ob-or"><i></i><span>or</span><i></i></div>
    <div class="ob-col"><button class="ob-btn" data-social="Google">Continue with Google</button><button class="ob-btn" data-social="Apple">Continue with Apple</button>
      <p class="ob-tl">New here? <button data-go="create">Create an account</button></p></div>
  </div>${hi}`;

SCREENS.create = () => `
  <div class="ob-body">${top(1)}<h1>Create account</h1>
    <div class="ob-form">${field('Email', 'email', 'you@example.com', {type:'email', val:st.email, mode:'email', auto:'email'})}
      ${field('Password', 'pw', 'At least 8 characters', {type:'password', val:st.pw, auto:'new-password'})}</div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-create>Create account</button>
    <p class="ob-fine">By creating an account you agree to our Terms and Privacy Policy.</p>
    <p class="ob-tl">Already have an account? <button data-go="signin" data-swap>Sign in</button></p></div>${hi}`;

SCREENS.profile = () => `
  <div class="ob-body">${top(1)}<div class="ob-hd"><h1>About you</h1><p class="t-body sub">This will be displayed on your profile. You can change it later in Profile &gt; Settings</p></div>
    <label class="ob-photo"><input type="file" accept="image/*" hidden data-photo>
      <span class="ava">${st.photo ? `<img src="${st.photo}" alt="">` : `<img class="plus" src="${A}ic-plus.svg" alt="">`}</span>
      <span class="tx"><b>${st.photo ? 'Looking good' : 'Add a photo'}</b><span>${st.photo ? 'Tap to change' : 'Optional'}</span></span>
      <span class="ob-pchip ${st.photo ? 'on' : ''}">Change</span></label>
    <div class="ob-form">${field('Display name', 'name', 'Your name', {val:st.name, auto:'name'})}${field('Username', 'handle', '@username', {val:st.handle, auto:'username'})}</div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-profile>Continue</button></div>${hi}`;

SCREENS.connect = () => {
  const any = Object.keys(st.apps).length;
  return `
  <div class="ob-body">${top(2)}<div class="ob-hd tight"><h1>Connect music apps</h1><p class="t-body sub">Connect the apps you already listen on.</p></div>
    <div class="ob-apps">${APPS.map(a => `
      <div class="ob-row"><span class="ico"><img src="${A}${a.img}" alt=""></span>
        <span class="tx"><b>${a.name}</b><span>${st.apps[a.id] ? 'Connected' : a.sub}</span></span>
        ${st.apps[a.id] ? `<span class="act done"><img src="${A}ic-check.svg" alt="">Connected</span>` : `<button class="act" data-connect="${a.id}">Connect</button>`}</div>`).join('')}</div>
    <div class="ob-or"><i></i><span>or</span><i></i></div>
    <button class="ob-btn" data-go="artists">${any ? 'Continue' : 'Connect my music apps later'}</button>
  </div>${hi}
  <div class="ob-sheet-wrap"><div class="bd" data-sheet-x></div><div class="ob-sheet"></div></div>`;
};
const sheetHTML = a => `
  <span class="grab"></span>
  <div class="ob-logos"><img class="lg-tono" src="${A}logo-tono-tile.svg" alt="tono"><img class="lg-wave" src="${A}link-wave.svg" alt=""><span class="lg-app"><img src="${A}${a.img}" alt="${a.name}"></span></div>
  <div class="hd"><p class="t-header">Allow Tono to connect to your ${a.name}?</p><p class="sub">You’ll sign in on ${a.name}’s secure page. We never see your password.</p></div>
  <div class="perms"><p class="eyebrow">Tono will be able to</p>
    <p class="perm"><i class="yes"><img src="${A}ic-check.svg" alt=""></i>See your saved songs and playlists</p>
    <p class="perm"><i class="yes"><img src="${A}ic-check.svg" alt=""></i>See your top artists and recently played</p>
    <p class="perm"><i class="no"><img src="${A}ic-x.svg" alt=""></i>Never post, delete or change your library</p></div>
  <div class="ob-col"><button class="ob-btn" data-allow="${a.id}">Continue to ${a.name}</button><button class="ob-btn ghost" data-sheet-x>Cancel</button></div>
  <p class="ob-fine">Disconnect anytime in Settings › Connected apps.</p>`;

// You're in sync (Figma 1352:18114) — plays the sync first: the orbit spins while your top artists pop in and the
// counts tick up, then it settles and turns into "You're in sync"
const ORBIT = [   // photo centre (x, y) in the 362×290 orbit box, photo size, name size, song count
  {n:'Clairo', img:'clairo', x:182, y:36, ph:42, fs:7.5, c:10},
  {n:'Malcolm Todd', img:'malcolm', x:88, y:102, ph:56, fs:10, c:14},
  {n:'SZA', img:'sza', x:283, y:92, ph:56, fs:10, c:10},
  {n:'Laufey', img:'laufey', x:65, y:222, ph:48, fs:8.5, c:8},
  {n:'Lana Del Rey', img:'lana', x:183, y:234, ph:43, fs:7.7, c:4},
  {n:'Frank Ocean', img:'frank', x:301, y:208, ph:56, fs:9.9, c:9},
];
SCREENS.sync = () => {
  const a = appOf(st.lastApp) || APPS[0], O = A + 'orbit/';
  return `
  <div class="ob-body sync">${top(2)}<span class="ob-badge wait"><i class="ring"></i><img src="${A}badge-check.svg" alt=""></span>
    <div class="ob-hd tight"><h1 data-sh>Syncing ${a.name}…</h1><p class="t-body sub" data-ss>Finding your artists and saved songs…</p></div>
    <div class="ob-row flat"><span class="ico"><img src="${A}${a.img}" alt=""></span><span class="tx"><b>${a.name}</b><span data-sr>Syncing… <i data-ca>0</i> artists · <i data-cs>0</i> songs</span></span></div>
    <div class="ob-orb" aria-label="Your top artists">
      <div class="rot">
        <img class="ring r185" src="${O}r185.svg" alt=""><img class="ring r120" src="${O}r120.svg" alt=""><img class="ring r60" src="${O}r60.svg" alt="">
        ${ORBIT.map((o, i) => `<div class="node" style="left:${o.x}px;top:${o.y}px;--h:${o.ph}px;--i:${i}"><div class="in">
          <img src="${O}${o.img}.png" alt="" style="width:${o.ph}px;height:${o.ph}px"><b style="font-size:${o.fs}px">${o.n}</b><i style="font-size:${Math.min(o.fs, 10)}px">${o.c} songs</i></div></div>`).join('')}
      </div>
      <img class="you" src="${st.photo || O + 'you.png'}" alt="You">
      <p class="more"><b>+${a.artists - ORBIT.length}</b><span>more</span></p>
    </div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-go="artists" data-sync-go disabled>Continue</button><button class="ob-btn sec" data-back>Connect another app</button></div>${hi}`;
};

SCREENS.artists = () => `
  <div class="ob-body">${top(2)}<h1>Pick 3+ artists to tune your first prompts.</h1>
    <label class="ob-search"><img src="${A}ic-search.svg" alt=""><input class="t-body" type="text" placeholder="Search artist..." data-asearch autocomplete="off"></label>
    <div class="ob-results" data-ares></div>
    <div class="ob-picked" data-picked></div>
    <div class="ob-sug"><p class="t-body ob-lbl">Suggested for you</p><div class="ob-chips" data-sugg></div></div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-go="songs" data-acont>Continue</button><p class="ob-fine" data-acount></p></div>${hi}`;

SCREENS.songs = () => `
  <div class="ob-body">${top(2)}<h1>Pick a few tracks. We’ll find what’s next.</h1>
    <label class="ob-search"><img src="${A}ic-search.svg" alt=""><input class="t-body" type="text" placeholder="Search songs..." data-ssearch autocomplete="off"></label>
    <div data-slists></div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-go="sub" data-scont>Continue</button><button class="ob-btn ghost" data-go="sub">Skip for now</button><p class="ob-fine" data-scount></p></div>${hi}`;

SCREENS.sub = () => `
  <div class="ob-body">${top(3)}<div class="ob-hd"><h1>Subscription</h1><p class="t-body sub">Make your experience more seamless with subscription</p></div>
    <div class="ob-col">${Object.entries(PLANS).map(([k, p]) => `
      <button class="ob-plan ${st.plan === k ? 'on' : ''}" data-plan="${k}"><span class="tx"><span class="t1">${p.label} · ${fmtMoney(p.price)} / ${p.per}${k === 'yearly' ? '<i class="save">Save 33%</i>' : ''}</span>
        <span class="t2">7-day free trial, then billed ${k === 'yearly' ? 'yearly' : 'monthly'}.</span></span></button>`).join('')}</div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-trial="1">Start 7-day free trial</button><button class="ob-btn sec" data-trial="0">Subscribe now</button><button class="ob-btn ghost" data-go="privacy">Not now</button></div>${hi}`;

SCREENS.checkout = () => {
  const p = PLANS[st.plan], ready = st.pay === 'paypal' || !!st.card, end = fmtDate(addDays(7), false);
  const cta = st.pay === 'paypal' ? 'Continue with PayPal' : !st.card ? 'Add new card' : st.trial ? 'Start my 7-day trial' : `Subscribe · ${fmtMoney(p.price)}`;
  return `
  <div class="ob-body">${top(3)}<div class="ob-hd"><h1>Checkout</h1>${ready ? '' : `<p class="t-body sub">${st.trial ? `No charge until your trial ends on ${end}.` : `You’ll be charged ${fmtMoney(p.price)} today.`}</p>`}</div>
    <div class="ob-row flat"><span class="tx"><b>${p.label} · ${st.trial ? '7-day free trial' : 'Billed today'}</b><span>Tono Premium</span></span><button class="act out" data-back>Change</button></div>
    <div class="ob-sum ${ready ? 'ready' : ''}">
      <p><span>${p.label} plan</span><b>${fmtMoney(p.price)} / ${p.per}</b></p>
      ${st.trial ? `<p><span>7-day free trial</span><b>– ${fmtMoney(p.price)}</b></p>` : ''}
      <p><span>Tax</span><b>$0.00</b></p><hr>
      <p class="due"><span>Due today</span><b>${st.trial ? '$0.00' : fmtMoney(p.price)}</b></p></div>
    ${ready ? `<p class="ob-fine left">${st.trial ? `No charge until your trial ends on ${end}. After that, you’ll be charged ${fmtMoney(p.price)}/${p.per} until you cancel.` : `Renews ${fmtDate(renewDate())} at ${fmtMoney(p.price)}/${p.per} until you cancel.`} Cancel anytime in Settings › Subscription.</p>` : ''}
    <div class="ob-col tight"><p class="t-body ob-lbl">Pay with</p>
      <button class="ob-pay ${st.pay === 'card' ? 'on' : ''}" data-pay="card"><span class="ico"><img src="${A}pay-card.svg" alt=""></span>
        <span class="tx"><span class="t1">Credit or debit card</span><span class="t2">${st.card ? `${st.card.brand} ****${st.card.last4}` : 'No card added yet'}</span></span></button>
      <button class="ob-pay ${st.pay === 'paypal' ? 'on' : ''}" data-pay="paypal"><span class="ico"><img class="brand" src="${A}pay-paypal.png" alt=""></span>
        <span class="tx"><span class="t1">Paypal</span><span class="t2">Log in to PayPal</span></span></button>
      ${st.card && st.pay === 'card' ? `<button class="ob-link" data-card-open>Use a different card</button>` : ''}</div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-checkout>${cta}</button>${ready ? '<p class="ob-fine">Cancel anytime in Settings</p>' : ''}</div>${hi}
  <div class="ob-sheet-wrap card-sheet"><div class="bd" data-card-x></div><div class="ob-sheet card">${cardForm()}</div></div>`;
};

SCREENS.done = () => {
  const p = PLANS[st.plan];
  const paid = st.pay === 'paypal' ? 'PayPal' : `${st.card.brand} ****${st.card.last4}`;
  return `
  <div class="ob-body">${top(3, true)}<span class="ob-badge"><img src="${A}badge-check.svg" alt=""></span>
    <div class="ob-hd"><h1>You’re all set</h1><p class="t-body sub">${st.trial ? 'Your 7-day free trial has started.' : 'Welcome to Premium.'} Unlimited prompts, offline listening and no ads are unlocked.</p></div>
    <div class="ob-sum ready"><p class="eyebrow">Your subscription</p>
      <p><span>Plan</span><b>Premium · ${p.label}</b></p>
      <p><span>${st.trial ? 'Free trial ends' : 'Renews'}</span><b>${fmtDate(st.trial ? addDays(7) : renewDate())}</b></p>
      <p><span>Then</span><b>${fmtMoney(p.price)} / ${p.per}</b></p>
      <p><span>Paid with</span><b>${esc(paid)}</b></p></div>
    <p class="ob-fine left">Receipt sent to ${esc(st.email || 'you@example.com')}.${st.trial ? ' We’ll remind you 2 days before your trial ends.' : ''}</p>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-go="privacy">Continue</button><p class="ob-fine">Manage anytime in Settings › Subscription</p></div>${hi}`;
};

SCREENS.privacy = () => `
  <div class="ob-body">${top(4)}<div class="ob-hd"><h1>Privacy setting</h1><p class="t-body sub">Choose how your profile shows up in Community. Change it any time in Profile › Settings.</p></div>
    <div class="ob-col">
      <button class="ob-pay ${st.privacy === 'public' ? 'on' : ''}" data-priv="public"><span class="ico"><img src="${A}ic-globe.svg" alt=""></span>
        <span class="tx"><span class="t1">Public</span><span class="t2">Anyone can see your profile, playlists and the songs you drop</span></span></button>
      <button class="ob-pay ${st.privacy === 'private' ? 'on' : ''}" data-priv="private"><span class="ico"><img src="${A}ic-lock.svg" alt=""></span>
        <span class="tx"><span class="t1">Private</span><span class="t2">Only people you accept can follow you and see your activity</span></span></button></div>
  </div>
  <div class="ob-foot"><button class="ob-btn" data-complete>Complete</button></div>${hi}`;

/* ---------- per-screen wiring after render ---------- */
const after = {};
after.intro = () => {
  // a swipe still steps through (it just triggers the fade, it doesn't drag the screen)
  const box = $o('.ob-intro'); let x0 = null;
  box.addEventListener('pointerdown', e => { x0 = e.clientX; });
  const end = e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
    if (dx < -50 && st.slide < SLIDES.length - 1) slideTo(st.slide + 1); else if (dx > 50 && st.slide > 0) slideTo(st.slide - 1); };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', () => { x0 = null; });
};
function slideTo(i){
  st.slide = i;
  root.querySelectorAll('.ob-intro .slide').forEach(s => s.classList.toggle('on', +s.dataset.slide === i));
  root.querySelectorAll('.ob-intro .dots i').forEach((d, k) => d.classList.toggle('on', k <= i));
}
let syncRun = 0;
after.sync = () => {
  const run = ++syncRun, a = appOf(st.lastApp) || APPS[0], box = $o('.ob-scr[data-s="sync"]');
  const q = sel => box.querySelector(sel), rot = q('.ob-orb .rot');
  const total = +String(a.songs).replace(/,/g, ''), T = 3400;
  let ang = 0, v = 70, t0 = performance.now(), last = t0, done = false, settled = false, from = 0, target = 0, tEnd = 0;
  // nodes pop in one by one while it spins
  box.querySelectorAll('.ob-orb .node').forEach((n, i) => setTimeout(() => { if (run === syncRun) n.classList.add('on'); }, 350 + i * 430));
  const fmt = n => n.toLocaleString('en-US');
  (function frame(now){
    if (run !== syncRun || !box.isConnected) return;
    const dt = (now - last) / 1000; last = now;
    const p = Math.min(1, (now - t0) / T), e = 1 - Math.pow(1 - p, 2);
    if (!done){
      q('[data-ca]').textContent = fmt(Math.round(a.artists * e)); q('[data-cs]').textContent = fmt(Math.round(total * e));
      ang += v * dt;
      if (p >= 1){ done = true; from = ang; target = Math.ceil((ang + 90) / 360) * 360; tEnd = now; finishSync(); }
    } else {
      // ease out to a full turn so the artists come to rest where the design has them
      const k = Math.min(1, (now - tEnd) / 1600);
      ang = from + (target - from) * (1 - Math.pow(1 - k, 3));
      if (k >= 1) settled = true;
    }
    rot.style.setProperty('--a', `${ang % 360}deg`);
    if (!settled) requestAnimationFrame(frame);
  })(t0);
  function finishSync(){
    q('.ob-badge').classList.remove('wait');
    q('.ob-orb').classList.add('done');
    const h = q('[data-sh]'), sub = q('[data-ss]');
    [h, sub].forEach(el => el.classList.add('swap'));
    setTimeout(() => {
      if (run !== syncRun) return;
      h.textContent = 'You’re in sync';
      sub.textContent = `${a.name} is linked. We found ${a.artists} artists and ${a.songs} saved songs to tune your first prompts.`;
      q('[data-sr]').textContent = 'Connected';
      [h, sub].forEach(el => el.classList.remove('swap'));
      q('[data-sync-go]').disabled = false;
    }, 300);
  }
};
after.artists = () => {
  if (st.artists === null) st.artists = Object.keys(st.apps).length ? ['SZA', 'Malcolm Todd', 'Laufey'] : [];   // what the connected app found
  const inp = $o('[data-asearch]');
  inp.addEventListener('input', drawArtistResults);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); $o('[data-ares] [data-artist]')?.click(); } });
  drawArtists();
};
// a face for each picked artist: the suggestion tiles, the orbit photos, else their initial
const artistPhoto = n => { const s = SUGGESTED.find(a => a[0] === n); if (s) return A + s[1];
  const o = {'SZA':'sza', 'Malcolm Todd':'malcolm', 'Laufey':'laufey', 'Frank Ocean':'frank', 'Lana Del Rey':'lana'}[n]; return o ? `${A}orbit/${o}.png` : null; };
function drawArtists(){
  const face = n => { const ph = artistPhoto(n);
    return ph ? `<img src="${ph}" alt="">` : `<i class="ini">${esc(n.replace(/^the\s+/i, '').slice(0, 1).toUpperCase())}</i>`; };
  // the artists tuning your prompts: photo with the name under it, a ✕ on the photo to remove
  $o('[data-picked]').innerHTML = st.artists.map(n => `<div class="ob-pick"><span class="ph">${face(n)}
      <button class="x" data-unpick="${esc(n)}" aria-label="Remove ${esc(n)}"><i class="ic" style="--i:url(assets/community/ph/x.svg)"></i></button></span><span class="nm">${esc(n)}</span></div>`).join('');
  // suggestions as tags: tap one to add it (it moves up into your picks)
  const sugg = [...SUGGESTED.map(a => a[0]), 'SZA', 'Malcolm Todd', 'Laufey', 'Frank Ocean', 'Lana Del Rey', ...MORE_ARTISTS].filter((x, i, arr) => arr.indexOf(x) === i && !st.artists.includes(x)).slice(0, 6);
  $o('[data-sugg]').innerHTML = sugg.map(n => `<button class="ob-tag" data-artist="${esc(n)}">${face(n)}<span>${esc(n)}</span><i class="add ic" style="--i:url(assets/community/ph/plus.svg)"></i></button>`).join('');
  const n = st.artists.length;
  $o('[data-acont]').disabled = n < 3;
  $o('[data-acount]').textContent = n < 3 ? `Pick ${3 - n} more` : `${n} artists picked`;
  drawArtistResults();
}
function drawArtistResults(){
  const q = ($o('[data-asearch]')?.value || '').trim().toLowerCase(), box = $o('[data-ares]');
  if (!q){ box.innerHTML = ''; box.classList.remove('on'); return; }
  const hits = ALL_ARTISTS.filter(n => n.toLowerCase().includes(q)).slice(0, 5);
  box.classList.add('on');
  box.innerHTML = hits.length ? hits.map(n => `<button class="ob-res" data-artist="${esc(n)}"><span>${esc(n)}</span><i>${st.artists.includes(n) ? 'Added' : 'Add'}</i></button>`).join('')
    : `<p class="none">No artists match “${esc(q)}”</p>`;
}
after.songs = () => { $o('[data-ssearch]').addEventListener('input', drawSongs); drawSongs(); };
function drawSongs(){
  const q = ($o('[data-ssearch]')?.value || '').trim().toLowerCase();
  const row = (i, act) => { const s = SONGS[i]; return `<div class="ob-row song"><span class="ico"><img src="${s.img}" alt=""></span>
    <span class="tx"><b>${esc(s.t)}</b><span>${esc(s.a)}${act === 'Add' && s.why && !q ? ` · Because you picked ${esc(s.why)}` : ''}</span></span><button class="ob-pm" data-song="${i}" aria-label="${act} ${esc(s.t)}"><i class="ic" style="--i:url(${act === 'Add' ? 'assets/community/ph/plus.svg' : A + 'ic-minus.svg'})"></i></button></div>`; };
  const added = st.songs.map(i => row(i, 'Remove')).join('');
  let pool = SONGS.map((_, i) => i).filter(i => !st.songs.includes(i));
  if (q) pool = pool.filter(i => `${SONGS[i].t} ${SONGS[i].a}`.toLowerCase().includes(q));
  else pool = pool.sort((a, b) => (st.artists || []).includes(SONGS[b].why) - (st.artists || []).includes(SONGS[a].why)).slice(0, 2);
  $o('[data-slists]').innerHTML = `${st.songs.length ? `<p class="t-body ob-lbl">Added</p>${added}` : ''}
    <p class="t-body ob-lbl">${q ? 'Results' : 'Suggested'}</p>${pool.length ? pool.map(i => row(i, 'Add')).join('') : `<p class="ob-fine left">No songs match “${esc(q)}”</p>`}`;
  const n = st.songs.length;
  $o('[data-scont]').disabled = !n;
  $o('[data-scount]').textContent = n ? `${n} song${n === 1 ? '' : 's'} added` : 'Add a song, or skip for now';
}

// card details come up as a sheet over Checkout
const cardForm = () => `
  <div class="sh-hd"><button class="sh-x" data-card-x aria-label="Close"><i class="ic" style="--i:url(assets/community/ph/x.svg)"></i></button><p class="t-header">Add new card</p><span></span></div>
  <div class="ob-form">${field('Card number', 'cc', '1234 5678 9012 3456', {mode:'numeric', auto:'cc-number', max:'19'})}
    <div class="ob-two">${field('Expiry', 'exp', 'MM / YY', {mode:'numeric', auto:'cc-exp', max:'7'})}${field('CVV', 'cvv', '123', {mode:'numeric', auto:'cc-csc', max:'4'})}</div>
    ${field('Name on card', 'cname', 'Full name', {val:st.name, auto:'cc-name'})}</div>
  <div class="ob-toggle-row"><span class="tx"><b>Save for future use</b><span>Stored securely for renewals. Remove it anytime in Settings › Payment.</span></span>
    <button class="ob-toggle ${st.save ? 'on' : ''}" role="switch" aria-checked="${st.save}" data-save aria-label="Save for future use"><i></i></button></div>
  <button class="ob-btn" data-card disabled>Add card</button>`;
const cardWrap = () => $o('.ob-scr[data-s="checkout"] .card-sheet');
function openCard(){
  const w = cardWrap(); w.querySelector('.ob-sheet').innerHTML = cardForm(); wireCard(w);
  w.offsetHeight; w.classList.add('on');
  setTimeout(() => w.querySelector('input[name="cc"]')?.focus({preventScroll:true}), 650);
}
const closeCard = () => { cardWrap()?.classList.remove('on'); document.activeElement?.blur(); };

function wireCard(scope){
  const f = n => scope.querySelector(`input[name="${n}"]`);
  const valid = () => {
    const cc = f('cc').value.replace(/\D/g, ''), [mm, yy] = f('exp').value.split('/').map(s => +s.trim());
    return cc.length >= 15 && mm >= 1 && mm <= 12 && yy >= 26 && f('cvv').value.length >= 3 && f('cname').value.trim();
  };
  const check = () => { scope.querySelector('[data-card]').disabled = !valid(); };
  f('cc').addEventListener('input', e => { const d = e.target.value.replace(/\D/g, '').slice(0, 16); e.target.value = d.replace(/(.{4})(?=.)/g, '$1 '); setErr('cc'); check(); });
  f('exp').addEventListener('input', e => { let d = e.target.value.replace(/\D/g, '').slice(0, 4); if (d.length === 1 && +d > 1) d = '0' + d; e.target.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; setErr('exp'); check(); });
  f('cvv').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); check(); });
  f('cname').addEventListener('input', check);
  f('cc').addEventListener('blur', e => { const n = e.target.value.replace(/\D/g, '').length; setErr('cc', n && n < 15 ? 'Enter the full card number' : ''); });
  f('exp').addEventListener('blur', e => { const [mm, yy] = e.target.value.split('/').map(s => +s.trim()); setErr('exp', e.target.value && !(mm >= 1 && mm <= 12 && yy >= 26) ? 'Check the expiry date' : ''); });
  check();
};

/* ---------- interactions ---------- */
function busy(btn, label, ms, then){
  btn.disabled = true; btn.classList.add('busy'); const was = btn.textContent; btn.innerHTML = `<i class="spin"></i>${label}`;
  setTimeout(() => { btn.disabled = false; btn.classList.remove('busy'); btn.textContent = was; then(); }, ms);
}
function openSheet(id){
  const w = $o('.ob-scr[data-s="connect"] .ob-sheet-wrap');
  w.querySelector('.ob-sheet').innerHTML = sheetHTML(appOf(id));
  w.offsetHeight; w.classList.add('on');
}
const closeSheet = () => $o('.ob-scr[data-s="connect"] .ob-sheet-wrap')?.classList.remove('on');
const val = n => (root.querySelector(`.ob-scr:not(.off-r):not(.off-l) input[name="${n}"]`)?.value || '').trim();

root.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-back]')) return back();
  const g = t.closest('[data-go]');
  if (g && !g.disabled){ return go(g.dataset.go, {replace:g.hasAttribute('data-swap')}); }
  if (t.closest('[data-next]')) return st.slide < SLIDES.length - 1 ? slideTo(st.slide + 1) : go('create');
  // sign in
  // sign in takes an email or a username (with or without the @)
  const okLogin = v => okEmail(v) || /^@?[a-z0-9._]{3,}$/i.test(v);
  if (t.closest('[data-forgot]')){ const id = val('login'); if (!okLogin(id)) return setErr('login', 'Enter your email or username first');
    return toast(okEmail(id) ? `Reset link sent to ${id}` : `Reset link sent to the email for @${id.replace(/^@/, '')}`); }
  if (t.closest('[data-signin]')){
    const id = val('login'), pw = val('pw');
    setErr('login', okLogin(id) ? '' : 'Enter a valid email or username'); setErr('pw', pw ? '' : 'Enter your password');
    if (!okLogin(id) || !pw) return;
    if (okEmail(id)) st.email = id; else st.handle = '@' + id.replace(/^@/, '').toLowerCase();
    return busy(t.closest('button'), 'Signing in…', 900, () => finish(true));
  }
  const so = t.closest('[data-social]'); if (so) return busy(so, `Continuing with ${so.dataset.social}…`, 900, () => finish(true));
  // create account
  if (t.closest('[data-create]')){
    const em = val('email'), pw = val('pw');
    setErr('email', okEmail(em) ? '' : 'Enter a valid email'); setErr('pw', pw.length >= 8 ? '' : 'Use at least 8 characters');
    if (!okEmail(em) || pw.length < 8) return;
    st.email = em; st.pw = pw; return go('profile');
  }
  if (t.closest('[data-profile]')){
    const nm = val('name'), h = val('handle').replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    setErr('name', nm ? '' : 'Add the name people will see'); setErr('handle', /^[a-z0-9._]{3,}$/.test(h) ? '' : 'At least 3 letters, numbers, . or _');
    if (!nm || !/^[a-z0-9._]{3,}$/.test(h)) return;
    st.name = nm; st.handle = '@' + h; return go('connect');
  }
  // connect apps
  const c = t.closest('[data-connect]'); if (c) return openSheet(c.dataset.connect);
  if (t.closest('[data-sheet-x]')) return closeSheet();
  const al = t.closest('[data-allow]');
  if (al) return busy(al, `Connecting to ${appOf(al.dataset.allow).name}…`, 1300, () => { st.apps[al.dataset.allow] = true; st.lastApp = al.dataset.allow; closeSheet(); setTimeout(() => go('sync'), 350); });
  // artists
  const ar = t.closest('[data-artist]');
  if (ar){ const n = ar.dataset.artist; st.artists = st.artists.includes(n) ? st.artists.filter(x => x !== n) : [...st.artists, n];
    if (ar.classList.contains('ob-res')){ const i = $o('[data-asearch]'); i.value = ''; }
    return drawArtists(); }
  const up = t.closest('[data-unpick]'); if (up){ st.artists = st.artists.filter(x => x !== up.dataset.unpick); return drawArtists(); }
  // songs
  const sg = t.closest('[data-song]'); if (sg){ const i = +sg.dataset.song; st.songs = st.songs.includes(i) ? st.songs.filter(x => x !== i) : [...st.songs, i]; return drawSongs(); }
  // plans
  const pl = t.closest('[data-plan]'); if (pl){ st.plan = pl.dataset.plan; return draw('sub'); }
  const tr = t.closest('[data-trial]'); if (tr){ st.trial = tr.dataset.trial === '1'; return go('checkout'); }
  const py = t.closest('[data-pay]'); if (py){ st.pay = py.dataset.pay; return draw('checkout'); }
  const co = t.closest('[data-checkout]');
  if (co){
    if (st.pay === 'paypal') return busy(co, 'Connecting to PayPal…', 1300, () => go('done'));
    if (!st.card) return openCard();
    return busy(co, st.trial ? 'Starting your trial…' : 'Processing…', 1100, () => go('done'));
  }
  // card sheet
  if (t.closest('[data-card-open]')) return openCard();
  if (t.closest('[data-card-x]')) return closeCard();
  if (t.closest('[data-save]')){ st.save = !st.save; const b = t.closest('[data-save]'); b.classList.toggle('on', st.save); b.setAttribute('aria-checked', st.save); return; }
  const cd = t.closest('[data-card]');
  if (cd && !cd.disabled){
    const num = val('cc').replace(/\D/g, '');
    const brand = /^4/.test(num) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(num) ? 'Mastercard' : /^3[47]/.test(num) ? 'Amex' : /^6/.test(num) ? 'Discover' : 'Card';
    st.card = {brand, last4:num.slice(-4)}; st.pay = 'card';
    return busy(cd, 'Adding card…', 800, () => { closeCard(); setTimeout(() => draw('checkout'), 600); });
  }
  // privacy
  const pv = t.closest('[data-priv]'); if (pv){ st.privacy = pv.dataset.priv; return draw('privacy'); }
  if (t.closest('[data-complete]')) return finish(false);
});
// profile photo
root.addEventListener('change', e => {
  if (!e.target.matches('[data-photo]')) return;
  const file = e.target.files?.[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => { st.name = val('name') || st.name; st.handle = val('handle') || st.handle; st.photo = r.result; draw('profile'); };
  r.readAsDataURL(file);
});
// Enter moves through the form
root.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches('.ob-in input')) return;
  e.preventDefault();
  const scope = e.target.closest('.ob-sheet') || e.target.closest('.ob-scr');
  const ins = [...scope.querySelectorAll('.ob-in input')], i = ins.indexOf(e.target);
  if (ins[i + 1]) ins[i + 1].focus(); else { e.target.blur(); scope.querySelector('[data-card], .ob-foot .ob-btn, .ob-body > .ob-btn')?.click(); }
});
root.addEventListener('input', e => { const f = e.target.closest('.ob-in'); if (f?.classList.contains('bad')) setErr(f.dataset.f); });

/* ---------- done: hand over to the app ---------- */
function finish(signedIn){
  window.tonoUser = signedIn ? {email:st.email, handle:st.handle || undefined} : {name:st.name, handle:st.handle, photo:st.photo, email:st.email,
    plan:st.pay ? st.plan : null, privacy:st.privacy, apps:Object.keys(st.apps), artists:st.artists, songs:st.songs.map(i => SONGS[i])};
  root.classList.add('leaving');
  setTimeout(() => { root.classList.add('gone'); root.classList.remove('leaving'); }, 650);
}

/* boot: the app opens on Welcome (no lock screen) */
function start(){
  st = fresh(); window.tonoUser = null;
  lock.style.transition = 'none'; lock.classList.add('unlocked'); lock.offsetHeight; lock.style.transition = '';
  root.classList.remove('gone', 'leaving');
  root.insertAdjacentHTML('beforeend', root.querySelector('.ob-toast') ? '' : '<p class="ob-toast t-body" role="status"></p>');
  show('welcome');
}
start();
document.getElementById('restart')?.addEventListener('click', () => setTimeout(start, 0));
window.tonoOnboarding = {start, get state(){ return {...st}; }};
})();
