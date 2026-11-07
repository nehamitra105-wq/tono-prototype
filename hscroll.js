/* =========================================================
   Horizontal rows (Music Catalogue, Top 10, vibe matches) scroll sideways
   with a mouse/trackpad too: drag them, or use the wheel over them.
   A drag doesn't count as a tap on the item underneath.
   ========================================================= */
(() => {
const ROWS = '.albums, .cm-scroll';
let d = null;
document.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch' || e.button !== 0) return;   // touch already scrolls natively
  const row = e.target.closest(ROWS); if (!row || row.scrollWidth <= row.clientWidth) return;
  d = {row, x:e.clientX, left:row.scrollLeft, moved:false};
});
document.addEventListener('pointermove', e => {
  if (!d) return;
  const dx = e.clientX - d.x;
  if (!d.moved && Math.abs(dx) < 6) return;
  if (!d.moved){ d.moved = true; d.row.style.scrollSnapType = 'none'; d.row.style.cursor = 'grabbing'; }
  d.row.scrollLeft = d.left - dx;
});
const end = () => {
  if (!d) return;
  const {row, moved} = d; d = null;
  row.style.cursor = '';
  if (moved){
    row.style.scrollSnapType = '';
    // swallow the click that follows a drag
    const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', stop, {capture:true, once:true});
    setTimeout(() => window.removeEventListener('click', stop, {capture:true}), 0);
  }
};
document.addEventListener('pointerup', end);
document.addEventListener('pointercancel', end);
// vertical wheel over a row moves it sideways (until it hits an end, then the page scrolls)
document.addEventListener('wheel', e => {
  const row = e.target.closest(ROWS); if (!row || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const max = row.scrollWidth - row.clientWidth;
  if (max <= 0) return;
  if ((e.deltaY > 0 && row.scrollLeft >= max - 1) || (e.deltaY < 0 && row.scrollLeft <= 0)) return;
  e.preventDefault();
  row.scrollLeft += e.deltaY;
}, {passive:false});
// keep native image dragging from hijacking the gesture
document.addEventListener('dragstart', e => { if (e.target.closest(ROWS)) e.preventDefault(); });
})();
