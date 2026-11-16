/* =========================================================
   Drag any pull-up sheet up or down (the Add-to-playlist sheet is left out on purpose).
   Down: it follows your finger and closes past ~90px (or a quick flick); up: it gives a little, then springs back.
   Each sheet closes the way it always does (its backdrop / grip), so the app's own state stays in charge.
   ========================================================= */
(() => {
const app = document.getElementById('app');
const bd = s => () => s.parentElement.querySelector('.bd, .sheet-backdrop')?.click();
const KINDS = [
  {sel:'#sheet', close:() => document.getElementById('sheet-backdrop').click()},          // song actions (Home)
  {sel:'.mc-sheet'}, {sel:'.cm-sheet'}, {sel:'.h2-sheet'}, {sel:'.pf-gsheet'}, {sel:'.ob-sheet'},
  // the full player: grab it by its lilac grip / header and pull it down to close
  {sel:'.player-view', handle:'.pl-grip, .pl-head, .pl-full', close:() => document.querySelector('.player-view [data-grip]')?.click()},
];
const scale = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;
let d = null;
app.addEventListener('pointerdown', e => {
  if (e.button > 0) return;
  for (const k of KINDS){
    const s = e.target.closest(k.sel); if (!s) continue;
    if (k.handle && !e.target.closest(k.handle)) return;
    if (e.target.closest('input, textarea, select, [contenteditable], .ob-toggle')) return;
    // let lists inside the sheet scroll first
    const sc = e.target.closest('.list, .body, .cm-res, .h2-res, [data-scroll]');
    if (sc && sc !== s && sc.scrollTop > 0) return;
    d = {s, k, y0:e.clientY, t0:performance.now(), dy:0, on:false, id:e.pointerId}; s._y0 = e.clientY;
    return;
  }
}, true);
addEventListener('pointermove', e => {
  if (!d || e.pointerId !== d.id) return;
  const dy = (e.clientY - d.y0) / scale();
  if (!d.on){ if (Math.abs(dy) < 6) return; d.on = true; d.s.style.transition = 'none'; }
  d.dy = dy;
  d.s.style.transform = `translateY(${dy > 0 ? dy : dy * .25}px)`;   // up only stretches a little
}, {passive:true});
const end = e => {
  if (!d || (e && e.pointerId !== d.id)) return;
  const {s, k, t0} = d; let {dy, on} = d; d = null;
  if (e && !on){ dy = (e.clientY - (s._y0 ?? 0)) / scale(); }
  if (!on && Math.abs(dy) < 6) return;
  const v = dy / Math.max(1, performance.now() - t0);
  s.style.transition = ''; s.style.transform = '';
  if (dy > 90 || (dy > 30 && v > .5)) (k.close || bd(s))();
  // the drag shouldn't also count as a tap on whatever it started on (added after closing, so the close itself goes through)
  const kill = ev => { ev.stopPropagation(); ev.preventDefault(); };
  addEventListener('click', kill, true); setTimeout(() => removeEventListener('click', kill, true), 80);
};
addEventListener('pointerup', end); addEventListener('pointercancel', end);
})();
