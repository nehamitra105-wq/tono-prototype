/* =========================================================
   Home teasers — Record Dropoff: the cover cascade (Figma 960:4891)
   slowly shuffles forward, hinting at dragging through the real one.
   ========================================================= */
(() => {
const stack = document.querySelector('.tz-drop .tz-stack');
if (!stack) return;
const D = 'assets/drop/';
const ART = ['art-m83.png', 'art-perfect-night.png', 'art-night-train.png', 'art-riptide.jpg'];
// back → front: left, top, opacity (front sits lowest and most faded, as in the hi-fi)
const SLOTS = [[84, 4, .9], [64, 25, .8], [37, 44, .7], [12, 63, .6]];
const cards = ART.map(a => { const i = document.createElement('img'); i.className = 'cv'; i.src = D + a; i.alt = ''; stack.appendChild(i); return i; });
let order = cards.map((_, i) => i);          // order[slot] = card index
function place(){
  order.forEach((c, slot) => {
    const [l, t, o] = SLOTS[slot], el = cards[c];
    el.style.left = `${l}px`; el.style.top = `${t}px`; el.style.opacity = o; el.style.zIndex = slot + 1;
  });
}
place();
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
setInterval(() => {
  if (document.hidden) return;
  // the front cover slips away and comes back in at the back; the rest step forward
  const front = cards[order[order.length - 1]];
  front.style.opacity = 0;
  setTimeout(() => {
    order = [order[order.length - 1], ...order.slice(0, -1)];
    front.style.transition = 'none'; front.style.zIndex = 1;
    const [l, t] = SLOTS[0]; front.style.left = `${l + 10}px`; front.style.top = `${t - 8}px`;
    front.offsetHeight; front.style.transition = '';
    place();
  }, 450);
}, 2800);
})();
