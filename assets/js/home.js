/* PULSO — página de inicio */
(() => {
  'use strict';
  const { $, $$, img, cardHTML, reveal, reduced, fine } = window.PULSO;
  const P = window.PULSO_PRODUCTS;
  const L = window.PULSO_LINES;

  /* ---------- Loader (una vez por sesión) ---------- */
  function loader() {
    const el = $('#loader');
    let seen = false;
    try { seen = sessionStorage.getItem('pulso.loaded'); sessionStorage.setItem('pulso.loaded', '1'); } catch { /* sin storage */ }
    const start = () => document.body.classList.add('is-ready');
    if (seen || reduced) { el.remove(); start(); return; }
    const count = $('[data-count]', el); const t0 = performance.now(); const dur = 1200;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      count.textContent = Math.round(60 + (1 - Math.pow(1 - p, 3)) * 120);
      if (p < 1) requestAnimationFrame(tick);
      else {
        el.classList.add('is-done');
        setTimeout(start, 450);
        setTimeout(() => el.classList.add('is-gone'), 200);
        setTimeout(() => el.remove(), 1800);
      }
    })(t0);
  }

  /* ---------- Hero: línea de pulso en vivo ---------- */
  function heroPulse() {
    const cv = $('.hero__canvas'); const ctx = cv.getContext('2d');
    const bpmEl = $('[data-bpm]'); const hero = $('.hero');
    let w, h, dpr; const pts = [];
    let bpm = 72, target = 72, phase = 0, energy = 0, lastX = null, lastY = scrollY;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts.length = 0; for (let i = 0; i < Math.ceil(w / 3) + 2; i++) pts.push(0);
    };
    resize(); addEventListener('resize', resize);
    // Forma de un latido (onda PQRST simplificada)
    const beat = (t) => {
      if (t < 0.10) return Math.sin(t / 0.10 * Math.PI) * 0.12;
      if (t < 0.16) return 0;
      if (t < 0.19) return -(t - 0.16) / 0.03 * 0.18;
      if (t < 0.23) return -0.18 + (t - 0.19) / 0.04 * 1.18;
      if (t < 0.27) return 1 - (t - 0.23) / 0.04 * 1.45;
      if (t < 0.30) return -0.45 + (t - 0.27) / 0.03 * 0.45;
      if (t < 0.42) return 0;
      if (t < 0.56) return Math.sin((t - 0.42) / 0.14 * Math.PI) * 0.22;
      return 0;
    };
    hero.addEventListener('pointermove', (e) => {
      if (lastX !== null) energy = Math.min(1, energy + Math.abs(e.clientX - lastX) / 900);
      lastX = e.clientX;
      if (fine) {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        $('.hero__product-inner').style.transform = `translate(${dx * -30}px, ${dy * -20}px) rotate(${dx * 6}deg)`;
      }
    });
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
    let last = performance.now(); let shown = 72;
    (function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      requestAnimationFrame(loop);
      if (!visible) return;
      const dy = Math.abs(scrollY - lastY); lastY = scrollY;
      energy = Math.min(1, energy + dy / 1500);
      energy *= 0.985;
      target = 64 + energy * 120;
      bpm += (target - bpm) * 0.04;
      phase += dt * (bpm / 60) * (reduced ? 0 : 1);
      const amp = h * 0.36;
      const speed = 2 + energy * 2;
      for (let s = 0; s < speed; s++) {
        pts.shift(); pts.push(beat(phase % 1) * amp);
      }
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(0.5, 'rgba(255,255,255,.55)'); grad.addColorStop(1, '#FFE14D');
      ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach((v, i) => { const x = i * 3, y = h / 2 - v; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      const lx = (pts.length - 1) * 3, ly = h / 2 - pts[pts.length - 1];
      ctx.fillStyle = '#FFE14D'; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,225,77,.25)'; ctx.beginPath(); ctx.arc(lx, ly, 14, 0, Math.PI * 2); ctx.fill();
      const r = Math.round(bpm);
      if (r !== shown) { shown = r; bpmEl.textContent = r; document.documentElement.style.setProperty('--beat', `${(60 / bpm).toFixed(2)}s`); }
    })(last);
  }

  /* ---------- Carriles ---------- */
  function lanes() {
    const host = $('[data-lanes]');
    host.innerHTML = Object.entries(L).map(([k, l], i) => {
      const items = P.filter((p) => p.line === k).slice(0, 3);
      return `<a class="lane" href="tienda.html?linea=${k}" data-reveal style="--d:${i * 0.1}s" data-cursor="view">
        <span class="lane__num">${i + 1}</span>
        <span class="lane__title">${l.short}<span class="lane__sport">${l.sport} · ${l.blurb}</span></span>
        <span class="lane__items">${items.map((p) => `<img src="${img(p.id, p.colors[0])}" alt="${p.name}" loading="lazy">`).join('')}</span>
        <span class="lane__runner" aria-hidden="true"></span>
      </a>`;
    }).join('');
  }

  /* ---------- Destacados con filtros animados (FLIP) ---------- */
  function featured() {
    const grid = $('[data-featured]'); const tabs = $('[data-tabs]'); const ink = $('.tabs__ink', tabs);
    const list = P.slice(0, 8);
    grid.innerHTML = list.map(cardHTML).join('');
    const moveInk = (b) => { ink.style.left = `${b.offsetLeft}px`; ink.style.width = `${b.offsetWidth}px`; };
    const sel = () => $('[aria-selected="true"]', tabs);
    requestAnimationFrame(() => moveInk(sel()));
    addEventListener('resize', () => moveInk(sel()));
    if (document.fonts) document.fonts.ready.then(() => moveInk(sel()));
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      $$('[data-filter]', tabs).forEach((x) => x.setAttribute('aria-selected', x === b));
      moveInk(b);
      const f = b.dataset.filter;
      const cards = $$('.card', grid);
      const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
      const pool = f === 'all' ? P.slice(0, 8) : P.filter((p) => p.category === f);
      const ids = new Set(pool.map((p) => p.id));
      // Ocultar los que no aplican
      cards.forEach((c) => { c.style.display = ids.has(c.dataset.id) ? '' : 'none'; });
      // Agregar los que falten
      pool.forEach((p, i) => {
        if (!$(`.card[data-id="${p.id}"]`, grid)) {
          grid.insertAdjacentHTML('beforeend', cardHTML(p, i));
          const n = grid.lastElementChild; n.classList.add('is-in');
          n.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      });
      if (reduced) return;
      $$('.card', grid).forEach((c) => {
        if (c.style.display === 'none') return;
        const a = first.get(c);
        if (!a || a.width === 0) { c.animate([{ opacity: 0, transform: 'translateY(30px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' }); return; }
        const bR = c.getBoundingClientRect();
        const dx = a.left - bR.left, dy = a.top - bR.top;
        if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
    });
  }

  /* ---------- Tecnología: scroll horizontal fijado ---------- */
  function techRail() {
    const pin = $('[data-hscroll]'); const rail = $('[data-hrail]'); const bar = $('[data-hprogress]');
    const viz = [
      '<svg class="tech-card__viz" viewBox="0 0 100 100"><g fill="#fff">' + Array.from({ length: 49 }, (_, i) => `<circle cx="${(i % 7) * 14 + 8}" cy="${Math.floor(i / 7) * 14 + 8}" r="${2 + (i % 3)}"/>`).join('') + '</g></svg>',
      '<svg class="tech-card__viz" viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="3">' + [0, 1, 2, 3, 4].map((i) => `<path d="M0 ${20 + i * 15} Q25 ${10 + i * 15} 50 ${20 + i * 15} T100 ${20 + i * 15}"/>`).join('') + '</svg>',
      '<svg class="tech-card__viz" viewBox="0 0 100 100" fill="none" stroke="#141A3D" stroke-width="3">' + [10, 22, 34, 46].map((r) => `<circle cx="50" cy="50" r="${r}"/>`).join('') + '</svg>',
      '<svg class="tech-card__viz" viewBox="0 0 100 100" fill="none" stroke="#141A3D" stroke-width="3">' + [0, 30, 60, 90, 120, 150].map((a) => `<line x1="50" y1="50" x2="${50 + 48 * Math.cos(a * Math.PI / 180)}" y2="${50 + 48 * Math.sin(a * Math.PI / 180)}"/><line x1="50" y1="50" x2="${50 - 48 * Math.cos(a * Math.PI / 180)}" y2="${50 - 48 * Math.sin(a * Math.PI / 180)}"/>`).join('') + '</svg>'
    ];
    rail.innerHTML = window.PULSO_TECH.map((t, i) => `<article class="tech-card">${viz[i]}
      <div><h3>${t.title}</h3><p style="margin-top:.8rem">${t.text}</p></div>
      <div><div class="tech-card__stat" data-count-to="${t.stat}">${t.stat}</div><div class="tech-card__label">${t.statLabel}</div></div></article>`).join('');
    const setH = () => { pin.style.height = `${rail.scrollWidth - innerWidth + innerHeight + 80}px`; };
    setH(); addEventListener('resize', setH);
    const onScroll = () => {
      const r = pin.getBoundingClientRect();
      const total = pin.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const max = Math.max(0, rail.scrollWidth - innerWidth + 40);
      rail.style.transform = `translate3d(${-p * max}px,0,0)`;
      bar.style.transform = `scaleX(${p})`;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- Manifiesto: se ilumina palabra por palabra ---------- */
  function manifesto() {
    const el = $('[data-manifesto]');
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="mw" aria-hidden="true">${w}</span>`).join(' ');
    const spans = $$('.mw', el);
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.floor(p * spans.length);
      spans.forEach((s, i) => { s.classList.toggle('is-lit', i < lit); s.classList.toggle('is-hot', i >= lit - 2 && i < lit); });
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- Cuenta regresiva ---------- */
  function countdown() {
    const box = $('[data-countdown]'); const end = new Date(box.dataset.countdown).getTime();
    const els = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      let t = Math.max(0, end - Date.now());
      if (t === 0) { box.innerHTML = '<p class="lead"><b>La Línea Nocturna ya está disponible.</b></p>'; return; }
      const v = { d: Math.floor(t / 864e5), h: Math.floor(t / 36e5) % 24, m: Math.floor(t / 6e4) % 60, s: Math.floor(t / 1e3) % 60 };
      Object.entries(v).forEach(([k, n]) => {
        const s = pad(n);
        if (els[k].textContent !== s) { els[k].textContent = s; if (!reduced) { els[k].classList.remove('flip'); void els[k].offsetWidth; els[k].classList.add('flip'); } }
      });
      setTimeout(tick, 1000);
    };
    tick();
  }

  function newsletter() {
    const f = $('[data-newsletter]'); const msg = $('[data-nl-msg]');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = f.querySelector('input').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = 'Escribe un correo válido, por ejemplo nombre@correo.com.'; return; }
      msg.textContent = `Listo. Te avisaremos en ${v} 24 horas antes del lanzamiento.`;
      f.reset();
      window.PULSO.toast('Suscripción confirmada');
    });
  }

  loader(); heroPulse(); lanes(); featured(); techRail(); manifesto(); countdown(); newsletter();
  reveal();
})();
