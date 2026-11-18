/* =========================================================
   PULSO — núcleo compartido
   Carrito, favoritos, búsqueda, vista rápida, cursor,
   transiciones y animaciones de scroll.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  const fmt = (n) => money.format(n);
  const FREE_SHIP = 999;
  const SHIP_COST = 129;
  const PROMOS = { PULSO10: { type: 'pct', value: 10, label: '10% de descuento' }, PRIMERKM: { type: 'fix', value: 150, label: '$150 de descuento' } };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* almacenamiento no disponible */ } }
  };

  const P = window.PULSO_PRODUCTS;
  const C = window.PULSO_COLORS;
  const byId = (id) => P.find((p) => p.id === id);
  const img = (id, color, view = 'front') => `assets/img/products/${id}--${color}--${view}.webp`;
  const url = (p, color) => `producto.html?id=${p.id}${color ? `&color=${color}` : ''}`;

  /* ---------- Iconos ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.3 0 5.4 3.1 4.2 6.3C19.5 15.4 12 20 12 20Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1 12.5H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 4.5 5 4.5"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/></svg>',
    st: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>'
  };
  const PULSE_D = 'M0,30 H22 L30,12 L40,50 L48,30 H70';

  /* Wordmark dibujado (mismo trazo que el logo SVG) */
  const WORD = [
    [39, 'M5,60 V5 H20 A14,14 0 0 1 20,33 H5'],
    [36, 'M5,0 V42 A13,13 0 0 0 31,42 V0'],
    [32, 'M5,0 V55 H32'],
    [36, 'M34,5 H17.5 A12.5,12.5 0 0 0 17.5,30 H18.5 A12.5,12.5 0 0 1 18.5,55 H2'],
    [38, null]
  ];
  function wordmarkSVG(cls = '', extra = '') {
    let x = 0; const parts = [];
    WORD.forEach(([w, d]) => {
      parts.push(d ? `<path pathLength="1" d="${d}" transform="translate(${x},0)"/>` : `<rect pathLength="1" x="${x + 5}" y="5" width="28" height="50" rx="14"/>`);
      x += w + 7;
    });
    return `<svg class="${cls}" viewBox="-6 -2 222 64" ${extra} aria-hidden="true"><g transform="skewX(-8)" fill="none" stroke="currentColor" stroke-width="10">${parts.join('')}</g></svg>`;
  }
  const markSVG = (bg = 'var(--cobalto)', fg = '#fff') => `<svg viewBox="0 0 100 100" aria-hidden="true" style="height:30px;width:30px"><rect class="logo__tile" width="100" height="100" rx="22" fill="${bg}"/><path class="logo__pulse" d="${PULSE_D}" transform="translate(15,20)" fill="none" stroke="${fg}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* ---------- Estado: carrito y favoritos ---------- */
  const listeners = new Set();
  const Cart = {
    items: store.get('pulso.cart', []),
    promo: store.get('pulso.promo', null),
    save() { store.set('pulso.cart', this.items); store.set('pulso.promo', this.promo); listeners.forEach((f) => f()); },
    key: (i) => `${i.id}|${i.color}|${i.size}`,
    add(id, color, size, qty = 1) {
      const ex = this.items.find((i) => i.id === id && i.color === color && i.size === size);
      if (ex) ex.qty = Math.min(10, ex.qty + qty); else this.items.push({ id, color, size, qty });
      this.save();
    },
    setQty(k, q) { const it = this.items.find((i) => this.key(i) === k); if (!it) return; it.qty = Math.max(1, Math.min(10, q)); this.save(); },
    remove(k) { this.items = this.items.filter((i) => this.key(i) !== k); this.save(); },
    clear() { this.items = []; this.promo = null; this.save(); },
    count() { return this.items.reduce((a, i) => a + i.qty, 0); },
    subtotal() { return this.items.reduce((a, i) => a + (byId(i.id)?.price || 0) * i.qty, 0); },
    discount() {
      const pr = this.promo && PROMOS[this.promo]; if (!pr) return 0;
      const s = this.subtotal();
      return pr.type === 'pct' ? Math.round(s * pr.value / 100) : Math.min(pr.value, s);
    },
    shipping(method = 'estandar') {
      if (!this.items.length) return 0;
      if (method === 'express') return 249;
      if (method === 'tienda') return 0;
      return this.subtotal() - this.discount() >= FREE_SHIP ? 0 : SHIP_COST;
    },
    total(method) { return Math.max(0, this.subtotal() - this.discount() + this.shipping(method)); },
    applyPromo(code) { code = (code || '').trim().toUpperCase(); if (PROMOS[code]) { this.promo = code; this.save(); return PROMOS[code]; } return null; }
  };
  const Favs = {
    ids: store.get('pulso.favs', []),
    has(id) { return this.ids.includes(id); },
    toggle(id) { this.ids = this.has(id) ? this.ids.filter((x) => x !== id) : [...this.ids, id]; store.set('pulso.favs', this.ids); listeners.forEach((f) => f()); return this.has(id); }
  };
  const onChange = (f) => listeners.add(f);

  /* ---------- Chrome: header, footer, overlays ---------- */
  const page = document.body.dataset.page || '';
  const navLinks = [
    ['tienda.html', 'Tienda', 'tienda'],
    ['tienda.html?linea=volt', 'Running', 'running'],
    ['tienda.html?linea=base', 'Training', 'training'],
    ['tienda.html?linea=calle', 'Lifestyle', 'lifestyle'],
    ['marca.html', 'La marca', 'marca']
  ];
  const params = new URLSearchParams(location.search);
  const currentNav = page === 'tienda' ? ({ volt: 'running', base: 'training', calle: 'lifestyle' }[params.get('linea')] || 'tienda') : page;

  function buildChrome() {
    const top = document.createElement('div');
    top.innerHTML = `
      <a class="skip-link" href="#main">Saltar al contenido</a>
      <div class="announce" role="region" aria-label="Avisos">
        <span class="announce__item is-active">Envío gratis en compras desde <strong>${fmt(FREE_SHIP)}</strong></span>
        <span class="announce__item">Usa <strong>PULSO10</strong> y obtén 10% en tu primera compra</span>
        <span class="announce__item">Devoluciones gratis durante <strong>30 días</strong></span>
      </div>
      <header class="site-header ${document.body.dataset.header === 'over' ? 'site-header--over' : ''}">
        <div class="wrap header__inner">
          <a href="index.html" class="logo" aria-label="PULSO, ir al inicio">${markSVG()}<span class="logo__word">${wordmarkSVG('', 'style="height:26px;width:auto"')}</span></a>
          <nav class="nav" aria-label="Principal">
            ${navLinks.map(([h, t, k]) => `<a href="${h}" ${k === currentNav ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
          </nav>
          <div class="header__actions">
            <button class="icon-btn" data-open-search aria-label="Buscar">${I.search}</button>
            <a class="icon-btn icon-btn--fav" href="tienda.html?favoritos=1" aria-label="Favoritos">${I.heart.replace('<svg', '<svg fill="none" stroke="currentColor"')}<span class="badge-count" data-fav-count></span></a>
            <button class="icon-btn" data-open-cart aria-label="Abrir carrito">${I.bag}<span class="badge-count" data-cart-count></span></button>
            <button class="icon-btn menu-toggle" aria-label="Menú" aria-expanded="false"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>
      <div class="mobile-menu" aria-hidden="true">
        <nav aria-label="Móvil">${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav>
        <p>Envío gratis desde ${fmt(FREE_SHIP)} · Devoluciones en 30 días</p>
      </div>`;
    document.body.prepend(...top.children);

    const bottom = document.createElement('div');
    bottom.innerHTML = `
      <footer class="footer">
        <div class="wrap">
          <div class="footer__grid">
            <div>
              <a href="index.html" class="logo" aria-label="PULSO">${markSVG('#fff', 'var(--cobalto)')}<span>${wordmarkSVG('', 'style="height:26px;width:auto"')}</span></a>
              <p style="margin-top:1.2rem;max-width:32ch;opacity:.8">Ropa deportiva diseñada en Ciudad de México y probada a 2,240 metros de altura.</p>
              <div class="socials">
                <a href="#" aria-label="Instagram">${I.ig}</a><a href="#" aria-label="TikTok">${I.tt}</a>
                <a href="#" aria-label="YouTube">${I.yt}</a><a href="#" aria-label="Strava">${I.st}</a>
              </div>
            </div>
            <div><h3>Comprar</h3><ul>
              <li><a href="tienda.html?linea=volt">Running</a></li><li><a href="tienda.html?linea=base">Training</a></li>
              <li><a href="tienda.html?linea=calle">Lifestyle</a></li><li><a href="tienda.html?cat=accesorios">Accesorios</a></li>
              <li><a href="tienda.html?oferta=1">Ofertas</a></li></ul></div>
            <div><h3>Ayuda</h3><ul>
              <li><a href="#" data-open-sizes>Guía de tallas</a></li><li><a href="#">Envíos y entregas</a></li>
              <li><a href="#">Cambios y devoluciones</a></li><li><a href="#">Rastrear pedido</a></li><li><a href="#">Contacto</a></li></ul></div>
            <div><h3>PULSO</h3><ul>
              <li><a href="marca.html">La marca</a></li><li><a href="index.html#club">Club PULSO</a></li>
              <li><a href="marca.html#valores">Sustentabilidad</a></li><li><a href="#">Aviso de privacidad</a></li><li><a href="#">Términos</a></li></ul></div>
          </div>
          <div class="footer__big" data-draw>${wordmarkSVG('', 'preserveAspectRatio="xMidYMid meet"')}</div>
          <div class="footer__bottom">
            <span>© ${new Date().getFullYear()} PULSO Performance Wear. Hecho en México.</span>
            <div class="pay-chips" aria-label="Métodos de pago"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>OXXO</span><span>SPEI</span><span>Meses sin intereses</span></div>
          </div>
        </div>
      </footer>
      <div class="scrim" data-scrim></div>
      <aside class="drawer" id="cart" aria-label="Carrito" aria-hidden="true" tabindex="-1">
        <div class="drawer__head"><h2>Tu carrito <span data-cart-count-text></span></h2><button class="icon-btn" data-close aria-label="Cerrar carrito">${I.close}</button></div>
        <div class="drawer__body" data-cart-body></div>
        <div class="drawer__foot" data-cart-foot></div>
      </aside>
      <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Buscar productos" aria-hidden="true">
        <div class="wrap">
          <div class="search__bar">${I.search.replace('<svg', '<svg width="36" height="36"')}
            <label class="sr-only" for="search-input">Buscar</label>
            <input id="search-input" type="search" placeholder="¿Qué buscas?" autocomplete="off">
            <button class="icon-btn" data-close aria-label="Cerrar búsqueda">${I.close}</button>
          </div>
          <div class="search__hint">${['Playera', 'Leggings', 'Hoodie', 'Running', 'Cobalto', 'Accesorios'].map((t) => `<button class="chip" data-q="${t}">${t}</button>`).join('')}</div>
          <div class="search__results" data-search-results></div>
        </div>
      </div>
      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="modal__box"><button class="icon-btn modal__close" data-close aria-label="Cerrar">${I.close}</button><div data-modal-body></div></div>
      </div>
      <div class="toasts" aria-live="polite"></div>
      <div class="page-wipe is-in" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="cursor is-hidden" aria-hidden="true"></div><div class="cursor-ring is-hidden" aria-hidden="true"></div>`;
    document.body.append(...bottom.children);
  }

  /* ---------- Overlays ---------- */
  let lastFocus = null;
  function openLayer(el) {
    closeAll(true);
    lastFocus = document.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    $('[data-scrim]').classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => (el.querySelector('input, button:not([data-close]), [href]') || el).focus({ preventScroll: true }), 80);
  }
  function closeAll(silent) {
    $$('.drawer.is-open, .search.is-open, .modal.is-open, .filters.is-open').forEach((el) => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    $('[data-scrim]')?.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (!silent && lastFocus) lastFocus.focus?.({ preventScroll: true });
  }
  const openCart = () => { renderCart(); openLayer($('#cart')); };

  /* ---------- Carrito (drawer) ---------- */
  function shipMeterHTML() {
    const left = FREE_SHIP - (Cart.subtotal() - Cart.discount());
    const pct = Math.min(1, (Cart.subtotal() - Cart.discount()) / FREE_SHIP);
    return `<div class="ship-meter ${left <= 0 ? 'is-full' : ''}">
      ${left <= 0 ? '<b>Tu envío es gratis.</b>' : `Te faltan <b>${fmt(left)}</b> para el envío gratis.`}
      <div class="ship-meter__bar"><i style="--p:${pct}"></i></div></div>`;
  }
  function lineItemHTML(i, { compact = false } = {}) {
    const p = byId(i.id); if (!p) return '';
    const k = Cart.key(i);
    return `<div class="line-item" data-key="${k}">
      <a class="line-item__img" href="${url(p, i.color)}">${compact ? `<b>${i.qty}</b>` : ''}<img src="${img(p.id, i.color)}" alt="${p.name} color ${C[i.color].name}"></a>
      <div><h3>${p.name}</h3><div class="line-item__var">${C[i.color].name} · Talla ${i.size}</div>
        ${compact ? '' : `<div class="qty" role="group" aria-label="Cantidad"><button data-dec aria-label="Quitar uno">−</button><output>${i.qty}</output><button data-inc aria-label="Agregar uno">+</button></div>
        <div><button class="line-item__remove" data-remove>Eliminar</button></div>`}
      </div>
      <div class="price">${fmt(p.price * i.qty)}</div></div>`;
  }
  function renderCart() {
    const body = $('[data-cart-body]'); const foot = $('[data-cart-foot]');
    if (!body) return;
    $('[data-cart-count-text]').textContent = Cart.count() ? `(${Cart.count()})` : '';
    if (!Cart.items.length) {
      body.innerHTML = `<div class="empty"><svg viewBox="0 0 70 60"><path d="${PULSE_D}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>Tu carrito está vacío</h3><p class="muted">Agrega algo para tu próximo entrenamiento.</p>
        <a href="tienda.html" class="btn btn--primary">Ver la tienda</a></div>`;
      foot.innerHTML = ''; foot.style.display = 'none';
      return;
    }
    foot.style.display = '';
    body.innerHTML = shipMeterHTML() + Cart.items.map((i) => lineItemHTML(i)).join('');
    const pr = Cart.promo && PROMOS[Cart.promo];
    foot.innerHTML = `
      <form class="promo" data-promo><label class="sr-only" for="promo-code">Código de descuento</label>
        <input id="promo-code" placeholder="Código de descuento" value="${Cart.promo || ''}"><button>Aplicar</button></form>
      <div class="promo-msg ${pr ? 'ok' : ''}" data-promo-msg>${pr ? `${Cart.promo}: ${pr.label}` : ''}</div>
      <div class="totals">
        <div><span>Subtotal</span><span class="price">${fmt(Cart.subtotal())}</span></div>
        ${Cart.discount() ? `<div><span>Descuento</span><span class="price">−${fmt(Cart.discount())}</span></div>` : ''}
        <div><span>Envío</span><span class="price">${Cart.shipping() ? fmt(Cart.shipping()) : 'Gratis'}</span></div>
        <div class="total"><span>Total</span><span class="price">${fmt(Cart.total())}</span></div>
      </div>
      <a href="checkout.html" class="btn btn--primary btn--block" data-magnetic><span class="btn__label">Pagar ahora</span></a>`;
  }
  function bindCart() {
    document.addEventListener('click', (e) => {
      const li = e.target.closest('.drawer .line-item');
      if (li) {
        const k = li.dataset.key; const it = Cart.items.find((i) => Cart.key(i) === k);
        if (e.target.closest('[data-inc]')) { Cart.setQty(k, it.qty + 1); renderCart(); }
        if (e.target.closest('[data-dec]')) { Cart.setQty(k, it.qty - 1); renderCart(); }
        if (e.target.closest('[data-remove]')) {
          li.classList.add('is-removing');
          setTimeout(() => { Cart.remove(k); renderCart(); }, reduced ? 0 : 420);
        }
      }
    });
    document.addEventListener('submit', (e) => {
      if (!e.target.matches('[data-promo]')) return;
      e.preventDefault();
      const code = e.target.querySelector('input').value;
      const pr = Cart.applyPromo(code);
      if (pr) { renderCart(); toast(`Código aplicado: ${pr.label}`); }
      else { const m = $('[data-promo-msg]'); m.className = 'promo-msg err'; m.textContent = 'Ese código no es válido. Prueba con PULSO10.'; }
    });
  }

  function updateBadges() {
    const n = Cart.count(); const f = Favs.ids.length;
    $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.classList.toggle('has-items', n > 0); });
    $$('[data-fav-count]').forEach((b) => { b.textContent = f; b.classList.toggle('has-items', f > 0); });
    $$('[data-fav]').forEach((b) => { const a = Favs.has(b.dataset.fav); b.classList.toggle('is-active', a); b.setAttribute('aria-pressed', a); });
  }
  function bump() { $$('[data-cart-count]').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }

  /* Animación: la prenda vuela al carrito */
  function flyToCart(fromEl, src) {
    const target = $('[data-open-cart]');
    if (reduced || !fromEl || !target) return Promise.resolve();
    const a = fromEl.getBoundingClientRect(); const b = target.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'fly'; f.innerHTML = `<img src="${src}" alt="">`;
    document.body.appendChild(f);
    const sx = a.left + a.width / 2 - 40, sy = a.top + a.height / 2 - 48;
    const ex = b.left + b.width / 2 - 40, ey = b.top + b.height / 2 - 48;
    const anim = f.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(1.2) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${(sx + ex) / 2}px, ${Math.min(sy, ey) - 140}px) scale(.8) rotate(-14deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${ex}px, ${ey}px) scale(.15) rotate(10deg)`, opacity: .2 }
    ], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' });
    return anim.finished.then(() => f.remove());
  }

  function addToCart({ id, color, size, qty = 1, from }) {
    const p = byId(id);
    flyToCart(from, img(id, color)).then(() => { bump(); });
    Cart.add(id, color, size, qty);
    toast(`${p.name} (${size}) agregado al carrito`, { action: 'Ver carrito', onAction: openCart });
  }

  /* ---------- Toast ---------- */
  function toast(msg, { action, onAction } = {}) {
    const wrap = $('.toasts'); if (!wrap) return;
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<i>✓</i><span>${msg}</span>${action ? `<button style="text-decoration:underline;font-weight:600;color:var(--senal)">${action}</button>` : ''}`;
    if (action) t.querySelector('button').addEventListener('click', () => { onAction(); t.remove(); });
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------- Tarjeta de producto ---------- */
  function cardHTML(p, i = 0) {
    const col = p.colors[0];
    const tagCls = p.badge?.startsWith('-') ? 'card__tag--sale' : p.badge === 'Nuevo' ? 'card__tag--new' : '';
    return `<article class="card" data-id="${p.id}" data-color="${col}" data-reveal style="--d:${(i % 4) * 0.07}s">
      <div class="card__media" data-tilt data-cursor="view">
        <div class="card__lanes"></div>
        ${p.badge ? `<span class="card__tag ${tagCls}">${p.badge}</span>` : ''}
        <img class="img-front" src="${img(p.id, col)}" alt="${p.name} color ${C[col].name}" loading="lazy" width="600" height="700">
        <img class="img-back" src="${img(p.id, col, 'back')}" alt="" loading="lazy" width="600" height="700">
        <button class="card__fav" data-fav="${p.id}" aria-label="Guardar ${p.name} en favoritos" aria-pressed="false">${I.heart}</button>
        <div class="card__quick"><p>Agregar rápido · elige talla</p><div class="card__sizes">
          ${p.sizes.map((s) => `<button data-quick-add="${s}" aria-label="Agregar talla ${s}">${s}</button>`).join('')}
        </div></div>
      </div>
      <div class="card__body">
        <h3 class="card__name"><a href="${url(p, col)}">${p.name}</a></h3>
        <div class="card__price price">${fmt(p.price)}${p.compareAt ? `<s>${fmt(p.compareAt)}</s>` : ''}</div>
        <div class="card__meta">${window.PULSO_LINES[p.line].name} · ${window.PULSO_GENDERS[p.gender]}</div>
        <div class="swatches" role="group" aria-label="Colores">
          ${p.colors.map((c, k) => `<button class="swatch ${k === 0 ? 'is-active' : ''}" style="--c:${C[c].hex}" data-swatch="${c}" aria-label="${C[c].name}"></button>`).join('')}
        </div>
      </div>
    </article>`;
  }
  function bindCards() {
    document.addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav]');
      if (fav) {
        e.preventDefault();
        const on = Favs.toggle(fav.dataset.fav);
        toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
        return;
      }
      const card = e.target.closest('.card');
      if (!card) return;
      const sw = e.target.closest('[data-swatch]');
      if (sw) {
        e.preventDefault();
        const c = sw.dataset.swatch; const p = byId(card.dataset.id);
        card.dataset.color = c;
        $$('.swatch', card).forEach((s) => s.classList.toggle('is-active', s === sw));
        const f = $('.img-front', card), b = $('.img-back', card);
        f.animate([{ opacity: 0, transform: 'translateY(16px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
        f.src = img(p.id, c); f.alt = `${p.name} color ${C[c].name}`; b.src = img(p.id, c, 'back');
        $('.card__name a', card).href = url(p, c);
        return;
      }
      const qa = e.target.closest('[data-quick-add]');
      if (qa) { e.preventDefault(); addToCart({ id: card.dataset.id, color: card.dataset.color, size: qa.dataset.quickAdd, from: $('.img-front', card) }); return; }
      if (e.target.closest('.card__media') && !e.target.closest('button')) $('.card__name a', card).click();
    });
  }

  /* ---------- Vista rápida y guía de tallas ---------- */
  function openSizes() {
    $('[data-modal-body]').innerHTML = `<div style="padding:2.5rem 2rem">
      <h2 class="display" style="font-size:var(--step-3);margin-bottom:.5rem">Guía de tallas</h2>
      <p class="muted">Medidas del cuerpo en centímetros. Si estás entre dos tallas, elige la mayor para un ajuste relajado.</p>
      <div style="overflow-x:auto"><table class="size-table"><thead><tr><th>Talla</th><th>Pecho</th><th>Cintura</th><th>Cadera</th></tr></thead><tbody>
      ${[['XS', '80–85', '64–69', '86–91'], ['S', '86–91', '70–75', '92–97'], ['M', '92–99', '76–83', '98–105'], ['L', '100–107', '84–91', '106–113'], ['XL', '108–115', '92–99', '114–121'], ['XXL', '116–124', '100–108', '122–130']].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></div>`;
    openLayer($('#modal'));
  }

  /* ---------- Búsqueda ---------- */
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function searchProducts(q) {
    q = norm(q.trim()); if (!q) return [];
    return P.filter((p) => norm([p.name, p.category, window.PULSO_LINES[p.line].name, window.PULSO_LINES[p.line].sport, p.gender, p.description, ...p.colors.map((c) => C[c].name), ...p.tech].join(' ')).includes(q));
  }
  function bindSearch() {
    const input = $('#search-input'); const out = $('[data-search-results]');
    const run = () => {
      const q = input.value; const res = searchProducts(q);
      if (!q.trim()) { out.innerHTML = P.slice(0, 5).map(miniHTML).join(''); return; }
      out.innerHTML = res.length ? res.map(miniHTML).join('') : `<p class="muted" style="grid-column:1/-1">No encontramos “${q.replace(/</g, '&lt;')}”. Prueba con una prenda, un color o un deporte.</p>`;
    };
    const miniHTML = (p, i) => `<a class="mini" href="${url(p)}" style="animation-delay:${i * 40}ms"><div class="mini__img"><img src="${img(p.id, p.colors[0])}" alt=""></div><b>${p.name}</b><span>${fmt(p.price)}</span></a>`;
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const r = searchProducts(input.value); if (r[0]) location.href = url(r[0]); } });
    $$('[data-q]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.q; run(); input.focus(); }));
    run();
  }

  /* ---------- Interacciones globales ---------- */
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); }
      else if (e.target.closest('[data-open-search]')) { e.preventDefault(); openLayer($('#search')); }
      else if (e.target.closest('[data-open-sizes]')) { e.preventDefault(); openSizes(); }
      else if (e.target.closest('[data-close]') || e.target.matches('[data-scrim]') || e.target.matches('.modal')) closeAll();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeAll(); document.body.classList.remove('menu-open'); }
      if (e.key === '/' && !e.target.closest('input, textarea')) { e.preventDefault(); openLayer($('#search')); }
      if (e.key === 'Tab') trapFocus(e);
    });
    const toggle = $('.menu-toggle');
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open); $('.mobile-menu').setAttribute('aria-hidden', !open);
      document.body.classList.toggle('is-locked', open);
    });
  }
  function trapFocus(e) {
    const layer = $('.drawer.is-open, .search.is-open, .modal.is-open'); if (!layer) return;
    const f = $$('a[href], button:not([disabled]), input, select', layer).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }

  /* Header: se oculta al bajar y aparece al subir */
  function headerScroll() {
    const h = $('.site-header'); let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 20);
      h.classList.toggle('is-hidden', y > 400 && y > last && !document.body.classList.contains('is-locked'));
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Barra de avisos rotativa */
  function announce() {
    const items = $$('.announce__item'); let i = 0;
    if (reduced || items.length < 2) return;
    setInterval(() => {
      const cur = items[i]; i = (i + 1) % items.length; const nxt = items[i];
      cur.classList.add('is-leaving'); cur.classList.remove('is-active');
      nxt.classList.remove('is-leaving'); nxt.classList.add('is-active');
      setTimeout(() => cur.classList.remove('is-leaving'), 700);
    }, 4200);
  }

  /* Cursor personalizado */
  function cursor() {
    if (!fine || reduced) return;
    const dot = $('.cursor'), ring = $('.cursor-ring');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.classList.add('is-hidden'); ring.classList.add('is-hidden'); });
    document.addEventListener('mouseover', (e) => {
      const v = e.target.closest('[data-cursor="view"]');
      const h = e.target.closest('a, button, [role="button"], input, select, label');
      ring.classList.toggle('is-view', !!v && !h?.closest('.card__quick, .card__fav'));
      ring.textContent = v && !h?.closest('.card__quick, .card__fav') ? 'VER' : '';
      ring.classList.toggle('is-hover', !!h && !v);
      ring.classList.toggle('is-dark', !!e.target.closest('.hero, .footer, .tech, .drop, .lanes, .brand-hero, .mobile-menu'));
    });
    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* Botones magnéticos */
  function magnetic() {
    if (!fine || reduced) return;
    document.addEventListener('mousemove', (e) => {
      const m = e.target.closest('[data-magnetic]');
      $$('[data-magnetic].is-mag').forEach((el) => { if (el !== m) { el.classList.remove('is-mag'); el.style.transform = ''; const l = el.querySelector('.btn__label'); if (l) l.style.transform = ''; } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
      m.classList.add('is-mag');
      m.style.transform = `translate(${dx * 14}px, ${dy * 12}px)`;
      const l = m.querySelector('.btn__label'); if (l) l.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
    }, { passive: true });
  }

  /* Inclinación 3D en tarjetas */
  function tilt() {
    if (!fine || reduced) return;
    document.addEventListener('mousemove', (e) => {
      const t = e.target.closest('[data-tilt]');
      $$('[data-tilt].is-tilt').forEach((el) => { if (el !== t) { el.classList.remove('is-tilt'); el.style.transform = ''; } });
      if (!t) return;
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.classList.add('is-tilt');
      t.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg) translateZ(0)`;
      t.style.setProperty('--mx', `${px * 100}%`); t.style.setProperty('--my', `${py * 100}%`);
    }, { passive: true });
  }

  /* Revelados por scroll */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
    el.dataset.splitDone = '1';
  }
  let io;
  function reveal(root = document) {
    $$('[data-split]', root).forEach(splitWords);
    if (!io) {
      io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    $$('[data-reveal]:not(.is-in), [data-split]:not(.is-in), [data-draw]:not(.is-in)', root).forEach((el) => io.observe(el));
  }

  /* Transición entre páginas */
  function pageTransitions() {
    const wipe = $('.page-wipe');
    setTimeout(() => wipe.classList.remove('is-in'), 900);
    if (reduced) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search && u.hash) return;
      e.preventDefault();
      wipe.classList.remove('is-in'); wipe.classList.add('is-out');
      setTimeout(() => { location.href = a.href; }, 650);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) { wipe.classList.remove('is-out'); } });
  }

  /* Ticker con velocidad ligada al scroll */
  function tickers() {
    $$('[data-ticker]').forEach((tk) => {
      const track = $('.ticker__track', tk);
      track.innerHTML += track.innerHTML;
      const dir = Number(tk.dataset.ticker) || -1;
      let x = 0, vel = 0, lastY = scrollY;
      const half = () => track.scrollWidth / 2;
      (function loop() {
        const dy = scrollY - lastY; lastY = scrollY;
        vel += (Math.abs(dy) * 0.12 - vel) * 0.1;
        x += dir * (reduced ? 0 : 0.6 + vel);
        if (x <= -half()) x += half(); if (x > 0) x -= half();
        track.style.transform = `translate3d(${x}px,0,0)`;
        requestAnimationFrame(loop);
      })();
    });
  }

  /* ---------- Arranque ---------- */
  function init() {
    buildChrome();
    bindGlobal(); bindCart(); bindCards(); bindSearch();
    headerScroll(); announce(); cursor(); magnetic(); tilt(); pageTransitions();
    onChange(() => { updateBadges(); });
    updateBadges();
    document.dispatchEvent(new CustomEvent('pulso:ready'));
    requestAnimationFrame(() => { reveal(); tickers(); });
  }

  window.PULSO = { $, $$, fmt, img, url, byId, Cart, Favs, onChange, addToCart, toast, cardHTML, reveal, openCart, openLayer, closeAll, openSizes, lineItemHTML, wordmarkSVG, I, PULSE_D, reduced, fine, FREE_SHIP };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
