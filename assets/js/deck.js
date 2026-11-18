/* PULSO — presentación de marca y del sitio */
(() => {
  'use strict';
  const { $, $$, toast, wordmarkSVG, reduced } = window.PULSO;
  const slides = $$('[data-slide]');
  const cur = $('[data-deck-cur]'), part = $('[data-deck-part]'), bar = $('[data-deck-progress]');
  const dots = $$('[data-deck-go]');
  const nav = $('.deck-nav');
  let index = 0;

  // Logotipo grande de portada, dibujado en vivo
  const wm = $('[data-wordmark]');
  if (wm) wm.innerHTML = wordmarkSVG('cover__word', 'role="img" aria-label="PULSO"');

  slides.forEach((s, i) => { $$('[data-in]', s).forEach((el, k) => el.style.setProperty('--k', k)); s.dataset.index = i; });

  function setActive(i) {
    index = i;
    slides.forEach((s, k) => s.classList.toggle('is-current', k === i));
    cur.textContent = i + 1;
    part.textContent = slides[i].dataset.part;
    bar.style.transform = `scaleX(${(i + 1) / slides.length})`;
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    const dark = /slide--(cobalto|tinta|pista)/.test(slides[i].className);
    nav.classList.toggle('is-dark', dark);
    $('.deck-dots').classList.toggle('is-dark', dark);
  }

  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-active');
        if (en.intersectionRatio >= 0.5 || en.boundingClientRect.top < innerHeight * 0.35) setActive(Number(en.target.dataset.index));
      }
    });
  }, { threshold: [0.2, 0.5] });
  slides.forEach((s) => io.observe(s));

  // Ocultar la navegación al llegar al pie de página
  const foot = $('.footer');
  if (foot) new IntersectionObserver(([en]) => { nav.classList.toggle('is-away', en.isIntersecting); $('.deck-dots').classList.toggle('is-away', en.isIntersecting); }).observe(foot);

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const top = slides[i].getBoundingClientRect().top + scrollY;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }
  $('[data-deck-next]').addEventListener('click', () => go(index + 1));
  $('[data-deck-prev]').addEventListener('click', () => go(index - 1));
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.deckGo))));

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select') || document.body.classList.contains('is-locked')) return;
    if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); go(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); go(index - 1); }
  });

  // Deslizar a los lados en el celular también cambia de diapositiva
  let sx = null, sy = null;
  document.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  });

  // Copiar colores de la paleta
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const hex = b.dataset.copy; const done = () => toast(`${hex} copiado`);
    if (navigator.clipboard) navigator.clipboard.writeText(hex).then(done, done); else done();
  });

  // Demo del latido: el número sube y baja solo
  const bpm = $('[data-demo-bpm]');
  if (bpm && !reduced) {
    let t = 0;
    setInterval(() => { t += 0.08; bpm.textContent = Math.round(96 + Math.sin(t) * 30); }, 120);
  }

  setActive(0);
  window.PULSO.reveal();
})();
