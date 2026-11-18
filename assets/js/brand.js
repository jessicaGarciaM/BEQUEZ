/* PULSO — página de marca: copiar colores */
(() => {
  'use strict';
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const hex = b.dataset.copy;
    const done = () => window.PULSO.toast(`${hex} copiado`);
    if (navigator.clipboard) navigator.clipboard.writeText(hex).then(done, done); else done();
  });
  window.PULSO.reveal();
})();
