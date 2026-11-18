/* PULSO — página de producto */
(() => {
  'use strict';
  const { $, $$, fmt, img, url, byId, addToCart, Favs, cardHTML, reveal, I, openSizes, reduced, fine } = window.PULSO;
  const P = window.PULSO_PRODUCTS, C = window.PULSO_COLORS, L = window.PULSO_LINES;
  const qs = new URLSearchParams(location.search);
  const p = byId(qs.get('id')) || P[0];
  let color = p.colors.includes(qs.get('color')) ? qs.get('color') : p.colors[0];
  let size = p.sizes.length === 1 ? p.sizes[0] : null;
  let qty = 1; let view = 'front';
  const views = [['front', 'Frente'], ['back', 'Espalda'], ['detail', 'Detalle']];

  // Recientemente vistos
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('pulso.recent') || '[]'); localStorage.setItem('pulso.recent', JSON.stringify([p.id, ...recent.filter((x) => x !== p.id)].slice(0, 8))); } catch { /* */ }

  document.title = `${p.name} — PULSO Performance Wear`;
  document.querySelector('meta[name="description"]').content = p.description;

  const line = L[p.line];
  const related = P.filter((x) => x.id !== p.id && (x.line === p.line || x.category === p.category)).slice(0, 4);
  const recentP = recent.filter((id) => id !== p.id).map(byId).filter(Boolean).slice(0, 4);

  $('[data-pdp]').innerHTML = `
    <div class="wrap" style="padding-top:2rem">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span><a href="tienda.html?linea=${p.line}">${line.sport}</a><span>/</span><span>${p.name}</span></nav>
      <div class="pdp">
        <div class="gallery">
          <div class="gallery__thumbs" role="group" aria-label="Vistas">${views.map(([v, t], i) => `<button data-view="${v}" aria-current="${i === 0}" aria-label="${t}"><img src="${img(p.id, color, v)}" alt=""></button>`).join('')}</div>
          <div class="gallery__main" data-zoom aria-label="Imagen del producto. Pasa el cursor para ampliar."><img data-main src="${img(p.id, color)}" alt="${p.name} color ${C[color].name}" width="600" height="700"></div>
        </div>
        <div class="pdp__info">
          <a class="pdp__line" href="tienda.html?linea=${p.line}"><i></i>${line.name}</a>
          <h1 class="display" data-split>${p.name}</h1>
          <div class="pdp__price price">${fmt(p.price)}${p.compareAt ? `<s>${fmt(p.compareAt)}</s> <span class="card__tag card__tag--sale" style="position:static;margin-left:.5rem">Ahorras ${fmt(p.compareAt - p.price)}</span>` : ''}</div>
          <p class="muted" style="margin:0">o 3 pagos de ${fmt(Math.ceil(p.price / 3))} sin intereses</p>
          <p style="margin:0;max-width:52ch">${p.description}</p>
          <div>
            <div class="opt-label">Color <span data-color-name>${C[color].name}</span></div>
            <div class="pdp-colors" role="group" aria-label="Elegir color">${p.colors.map((c) => `<button class="pdp-color" data-pcolor="${c}" aria-pressed="${c === color}" aria-label="${C[c].name}"><img src="${img(p.id, c)}" alt=""></button>`).join('')}</div>
          </div>
          <div>
            <div class="opt-label">Talla <button data-open-sizes>Guía de tallas</button></div>
            <div class="pdp-sizes" role="group" aria-label="Elegir talla" data-sizes>${p.sizes.map((s) => `<button data-size="${s}" aria-pressed="${s === size}">${s}</button>`).join('')}</div>
            <div class="size-error" data-size-error role="alert"></div>
          </div>
          <div class="pdp__buy" data-buy>
            <div class="qty qty--l" role="group" aria-label="Cantidad"><button data-qstep="-1" aria-label="Quitar uno">−</button><output data-qty>1</output><button data-qstep="1" aria-label="Agregar uno">+</button></div>
            <button class="btn btn--primary" data-add data-magnetic><span class="btn__label">Agregar al carrito · ${fmt(p.price)}</span></button>
            <button class="fav-toggle" data-fav="${p.id}" aria-label="Guardar en favoritos" aria-pressed="false">${I.heart}</button>
          </div>
          <div class="perks">
            <div class="perk">${I.truck}<b>Envío gratis</b><span>En compras desde ${fmt(window.PULSO.FREE_SHIP)}</span></div>
            <div class="perk">${I.swap}<b>30 días</b><span>Cambios y devoluciones gratis</span></div>
            <div class="perk">${I.shield}<b>Pago seguro</b><span>Tarjeta, OXXO y SPEI</span></div>
          </div>
          <div class="tech-tags">${p.tech.map((t) => `<span>${t}</span>`).join('')}</div>
          <div class="accordion">
            ${[['Características', `<ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>`, true],
              ['Tecnología', `<div>${window.PULSO_TECH.filter((t) => p.tech.includes(t.key)).map((t) => `<p><b>${t.title}.</b> ${t.text}</p>`).join('')}</div>`],
              ['Cuidado', '<p>Lava en frío con colores similares, del revés. No uses suavizante ni secadora: alarga la vida de las fibras técnicas. No planchar sobre estampados ni reflectivos.</p>'],
              ['Envío y devoluciones', `<p>Envío estándar de 3 a 5 días hábiles (${fmt(129)}, gratis desde ${fmt(999)}). Express en 24 horas en CDMX, Guadalajara y Monterrey. Tienes 30 días para cambios o devoluciones sin costo.</p>`]]
              .map(([t, c, o]) => `<div class="acc-item ${o ? 'is-open' : ''}"><button aria-expanded="${!!o}">${t}<i></i></button><div class="acc-panel"><div>${c}</div></div></div>`).join('')}
          </div>
          <p class="muted" style="font-size:.88rem;margin:0">Peso: ${p.weight} · Modelo: ${p.id.toUpperCase().replace(/-/g, ' ')}</p>
        </div>
      </div>
    </div>
    <section class="section" style="padding-top:0" aria-labelledby="rel-title">
      <div class="wrap">
        <div class="section-head"><h2 id="rel-title" class="display" data-split>Completa el look</h2><a href="tienda.html" class="link-underline">Ver toda la tienda</a></div>
        <div class="grid">${related.map(cardHTML).join('')}</div>
      </div>
    </section>
    ${recentP.length ? `<section class="section" style="padding-top:0" aria-labelledby="rec-title"><div class="wrap">
      <div class="section-head"><h2 id="rec-title" class="display" style="font-size:var(--step-3)">Vistos recientemente</h2></div>
      <div class="grid">${recentP.map(cardHTML).join('')}</div></div></section>` : ''}
    <div class="sticky-buy" data-sticky aria-hidden="true">
      <div class="sticky-buy__inner">
        <img data-sticky-img src="${img(p.id, color)}" alt="">
        <div class="sticky-buy__name"><b>${p.name}</b><span class="muted" data-sticky-var>${C[color].name}</span></div>
        <span class="price">${fmt(p.price)}</span>
        <button class="btn btn--primary" data-add style="min-height:46px"><span class="btn__label">Agregar</span></button>
      </div>
    </div>`;

  const main = $('[data-main]'); const zoom = $('[data-zoom]');

  function swapMain(src, alt) {
    if (reduced) { main.src = src; main.alt = alt; return; }
    main.classList.add('is-swapping');
    setTimeout(() => { main.src = src; main.alt = alt; main.onload = () => main.classList.remove('is-swapping'); setTimeout(() => main.classList.remove('is-swapping'), 200); }, 220);
  }
  function setColor(c) {
    color = c;
    $$("[data-pcolor]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.pcolor === c));
    $('[data-color-name]').textContent = C[c].name;
    $$('[data-view]').forEach((b) => { b.querySelector('img').src = img(p.id, c, b.dataset.view); });
    swapMain(img(p.id, c, view), `${p.name} color ${C[c].name}`);
    $('[data-sticky-img]').src = img(p.id, c); $('[data-sticky-var]').textContent = `${C[c].name}${size ? ` · ${size}` : ''}`;
    history.replaceState(null, '', url(p, c));
  }

  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-view]');
    if (v) { view = v.dataset.view; $$('[data-view]').forEach((b) => b.setAttribute('aria-current', b === v)); swapMain(img(p.id, color, view), `${p.name}, vista ${v.getAttribute('aria-label').toLowerCase()}`); }
    const c = e.target.closest("[data-pcolor]"); if (c) setColor(c.dataset.pcolor);
    const s = e.target.closest('[data-size]');
    if (s) { size = s.dataset.size; $$('[data-size]').forEach((b) => b.setAttribute('aria-pressed', b === s)); $('[data-size-error]').textContent = ''; $('[data-sticky-var]').textContent = `${C[color].name} · ${size}`; }
    const q = e.target.closest("[data-qstep]");
    if (q) { qty = Math.max(1, Math.min(10, qty + Number(q.dataset.qstep))); $('[data-qty]').textContent = qty; $('[data-add] .btn__label').textContent = `Agregar al carrito · ${fmt(p.price * qty)}`; }
    const a = e.target.closest('[data-add]');
    if (a) {
      if (!size) {
        const box = $('[data-sizes]'); $('[data-size-error]').textContent = 'Elige una talla para continuar.';
        box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        return;
      }
      addToCart({ id: p.id, color, size, qty, from: a.closest('.sticky-buy') ? $('[data-sticky-img]') : main });
      const lbl = a.querySelector('.btn__label'); const old = lbl.textContent;
      lbl.textContent = 'Agregado ✓'; setTimeout(() => { lbl.textContent = old; }, 1600);
    }
    const acc = e.target.closest('.acc-item > button');
    if (acc) { const it = acc.parentElement; const open = it.classList.toggle('is-open'); acc.setAttribute('aria-expanded', open); }
  });

  // Zoom con lupa
  if (fine) {
    zoom.addEventListener('mouseenter', () => zoom.classList.add('is-zoom'));
    zoom.addEventListener('mouseleave', () => zoom.classList.remove('is-zoom'));
    zoom.addEventListener('mousemove', (e) => {
      const r = zoom.getBoundingClientRect();
      main.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
      main.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }
  // Deslizar entre vistas en móvil
  let sx = null;
  zoom.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  zoom.addEventListener('touchend', (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) < 40) return;
    const i = views.findIndex(([v]) => v === view); const n = views[(i + (dx < 0 ? 1 : views.length - 1)) % views.length][0];
    $(`[data-view="${n}"]`).click();
  });

  // Barra fija de compra
  const sticky = $('[data-sticky]');
  new IntersectionObserver(([en]) => {
    const show = !en.isIntersecting && en.boundingClientRect.top < 0;
    sticky.classList.toggle('is-visible', show); sticky.setAttribute('aria-hidden', !show);
  }).observe($('[data-buy]'));

  // Favoritos sincronizados
  const syncFav = () => $$('[data-fav]').forEach((b) => { const a = Favs.has(b.dataset.fav); b.classList.toggle('is-active', a); b.setAttribute('aria-pressed', a); });
  syncFav(); window.PULSO.onChange(syncFav);
  reveal();
})();
