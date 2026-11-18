/* PULSO — tienda con filtros, orden y animaciones FLIP */
(() => {
  'use strict';
  const { $, $$, fmt, cardHTML, reveal, Favs, onChange, reduced, openLayer, closeAll } = window.PULSO;
  const P = window.PULSO_PRODUCTS, C = window.PULSO_COLORS, L = window.PULSO_LINES;
  const CAT = window.PULSO_CATEGORIES, GEN = window.PULSO_GENDERS;
  const PRICE_MIN = 300, PRICE_MAX = 2000;
  const ORDER = P.map((p) => p.id);
  const NEW_FIRST = ['hoodie-altitud', 'tank-sprint', 'top-impulso', 'mochila-ruta-42'];

  const qs = new URLSearchParams(location.search);
  const list = (k) => (qs.get(k) ? qs.get(k).split(',') : []);
  const state = {
    linea: list('linea'), cat: list('cat'), genero: list('genero'), talla: list('talla'), color: list('color'),
    min: Number(qs.get('min')) || PRICE_MIN, max: Number(qs.get('max')) || PRICE_MAX,
    oferta: qs.get('oferta') === '1', favoritos: qs.get('favoritos') === '1', orden: qs.get('orden') || 'featured'
  };
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allColors = [...new Set(P.flatMap((p) => p.colors))];

  function match(p, skip) {
    if (skip !== 'linea' && state.linea.length && !state.linea.includes(p.line)) return false;
    if (skip !== 'cat' && state.cat.length && !state.cat.includes(p.category)) return false;
    if (skip !== 'genero' && state.genero.length && !state.genero.includes(p.gender)) return false;
    if (skip !== 'talla' && state.talla.length && !p.sizes.some((s) => state.talla.includes(s))) return false;
    if (skip !== 'color' && state.color.length && !p.colors.some((c) => state.color.includes(c))) return false;
    if (p.price < state.min || p.price > state.max) return false;
    if (state.oferta && !p.compareAt) return false;
    if (state.favoritos && !Favs.has(p.id)) return false;
    return true;
  }
  const count = (key, val) => P.filter((p) => match(p, key) && ({ linea: p.line, cat: p.category, genero: p.gender }[key] === val)).length;

  function group(title, key, body, open = true) {
    return `<div class="filter-group ${open ? '' : 'is-collapsed'}" data-group="${key}">
      <button aria-expanded="${open}">${title}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="filter-group__body">${body}</div></div>`;
  }
  const checks = (key, map) => Object.entries(map).map(([k, v]) => `<label class="check"><input type="checkbox" data-k="${key}" value="${k}" ${state[key].includes(k) ? 'checked' : ''}><span>${v}</span><small data-c="${key}:${k}"></small></label>`).join('');

  function renderFilters() {
    $('[data-filter-groups]').innerHTML =
      group('Línea', 'linea', checks('linea', Object.fromEntries(Object.entries(L).map(([k, l]) => [k, `${l.short} · ${l.sport}`])))) +
      group('Categoría', 'cat', checks('cat', CAT)) +
      group('Género', 'genero', checks('genero', GEN)) +
      group('Talla', 'talla', `<div class="size-pills">${allSizes.map((s) => `<button class="size-pill" data-k="talla" data-v="${s}" aria-pressed="${state.talla.includes(s)}">${s}</button>`).join('')}</div>`) +
      group('Color', 'color', `<div class="color-pills">${allColors.map((c) => `<button class="color-pill" style="--c:${C[c].hex}" data-k="color" data-v="${c}" aria-pressed="${state.color.includes(c)}" aria-label="${C[c].name}" title="${C[c].name}"></button>`).join('')}</div>`) +
      group('Precio', 'precio', `<div class="range"><div class="range__track"><i data-range-fill></i></div>
          <label class="sr-only" for="pmin">Precio mínimo</label><input id="pmin" type="range" min="${PRICE_MIN}" max="${PRICE_MAX}" step="50" value="${state.min}" data-range="min">
          <label class="sr-only" for="pmax">Precio máximo</label><input id="pmax" type="range" min="${PRICE_MIN}" max="${PRICE_MAX}" step="50" value="${state.max}" data-range="max"></div>
          <div class="range-values"><span data-rmin></span><span data-rmax></span></div>`) +
      group('Más', 'mas', `<label class="check"><input type="checkbox" data-flag="oferta" ${state.oferta ? 'checked' : ''}><span>Solo ofertas</span></label>
          <label class="check"><input type="checkbox" data-flag="favoritos" ${state.favoritos ? 'checked' : ''}><span>Mis favoritos</span></label>`);
    syncRange();
  }
  function syncRange() {
    const fill = $('[data-range-fill]');
    const a = (state.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100, b = (state.max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100;
    fill.style.left = `${a}%`; fill.style.right = `${100 - b}%`;
    $('[data-rmin]').textContent = fmt(state.min); $('[data-rmax]').textContent = fmt(state.max);
  }
  function updateCounts() {
    $$('[data-c]').forEach((el) => { const [k, v] = el.dataset.c.split(':'); el.textContent = count(k, v); });
  }

  function sorted(arr) {
    const a = [...arr];
    switch (state.orden) {
      case 'price-asc': return a.sort((x, y) => x.price - y.price);
      case 'price-desc': return a.sort((x, y) => y.price - x.price);
      case 'name': return a.sort((x, y) => x.name.localeCompare(y.name, 'es'));
      case 'new': return a.sort((x, y) => (NEW_FIRST.indexOf(y.id) > -1 ? 1 : 0) - (NEW_FIRST.indexOf(x.id) > -1 ? 1 : 0) || ORDER.indexOf(x.id) - ORDER.indexOf(y.id));
      default: return a;
    }
  }

  function chips() {
    const out = [];
    ['linea', 'cat', 'genero', 'talla', 'color'].forEach((k) => state[k].forEach((v) => {
      const label = k === 'linea' ? L[v]?.name : k === 'cat' ? CAT[v] : k === 'genero' ? GEN[v] : k === 'color' ? C[v]?.name : `Talla ${v}`;
      out.push(`<button class="chip" data-chip="${k}:${v}">${label} ✕</button>`);
    }));
    if (state.min > PRICE_MIN || state.max < PRICE_MAX) out.push(`<button class="chip" data-chip="precio">${fmt(state.min)}–${fmt(state.max)} ✕</button>`);
    if (state.oferta) out.push('<button class="chip" data-chip="oferta">Ofertas ✕</button>');
    if (state.favoritos) out.push('<button class="chip" data-chip="favoritos">Favoritos ✕</button>');
    $('[data-chips]').innerHTML = out.join('');
  }

  function title() {
    let t = 'Tienda', sub = 'Doce prendas y accesorios diseñados para moverte. Filtra por deporte, talla, color o precio.';
    if (state.favoritos) { t = 'Favoritos'; sub = 'Lo que guardaste para después.'; }
    else if (state.linea.length === 1) { t = L[state.linea[0]].sport; sub = `${L[state.linea[0]].name}. ${L[state.linea[0]].blurb}`; }
    else if (state.cat.length === 1) t = CAT[state.cat[0]];
    else if (state.oferta) { t = 'Ofertas'; sub = 'Precios rebajados por tiempo limitado.'; }
    const h = $('[data-shop-title]');
    if (h.getAttribute('aria-label') !== t) { h.removeAttribute('data-split-done'); delete h.dataset.splitDone; h.classList.remove('is-in'); h.textContent = t; }
    $('[data-shop-sub]').textContent = sub; $('[data-crumb]').textContent = t;
    document.title = `${t} — PULSO Performance Wear`;
  }

  function writeURL() {
    const u = new URLSearchParams();
    ['linea', 'cat', 'genero', 'talla', 'color'].forEach((k) => state[k].length && u.set(k, state[k].join(',')));
    if (state.min > PRICE_MIN) u.set('min', state.min); if (state.max < PRICE_MAX) u.set('max', state.max);
    if (state.oferta) u.set('oferta', '1'); if (state.favoritos) u.set('favoritos', '1');
    if (state.orden !== 'featured') u.set('orden', state.orden);
    history.replaceState(null, '', `${location.pathname}${u.toString() ? `?${u}` : ''}`);
  }

  let first = true;
  function render() {
    const grid = $('[data-grid]');
    const res = sorted(P.filter((p) => match(p)));
    const before = new Map($$('.card', grid).map((c) => [c.dataset.id, c.getBoundingClientRect()]));
    const cnt = $('[data-count]');
    if (cnt.textContent !== String(res.length)) {
      cnt.textContent = res.length;
      if (!reduced) cnt.animate([{ transform: 'translateY(-60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    if (!res.length) {
      grid.innerHTML = `<div class="no-results"><h3>Sin resultados</h3><p class="muted">Ningún producto coincide con estos filtros. Quita alguno para ver más opciones.</p>
        <button class="btn btn--primary" data-clear style="margin-top:1rem">Limpiar filtros</button></div>`;
    } else {
      // Reutilizar tarjetas existentes para conservar estado y animar
      const existing = new Map($$('.card', grid).map((c) => [c.dataset.id, c]));
      const frag = document.createDocumentFragment();
      res.forEach((p, i) => {
        let el = existing.get(p.id);
        if (!el) { const t = document.createElement('div'); t.innerHTML = cardHTML(p, i); el = t.firstElementChild; if (!first) el.classList.add('is-in'); }
        frag.appendChild(el);
      });
      grid.innerHTML = ''; grid.appendChild(frag);
      if (!reduced && !first) {
        $$('.card', grid).forEach((c) => {
          const a = before.get(c.dataset.id); const b = c.getBoundingClientRect();
          if (a) { const dx = a.left - b.left, dy = a.top - b.top; if (dx || dy) c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' }); }
          else c.animate([{ opacity: 0, transform: 'scale(.9) translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
        });
      }
    }
    chips(); updateCounts(); title(); writeURL();
    window.PULSO.reveal(); first = false;
    // Sincronizar los favoritos en las tarjetas nuevas
    $$('[data-fav]', grid).forEach((b) => { const a = Favs.has(b.dataset.fav); b.classList.toggle('is-active', a); b.setAttribute('aria-pressed', a); });
  }

  function bind() {
    const box = $('#filters');
    box.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.k) { const arr = state[t.dataset.k]; t.checked ? arr.push(t.value) : arr.splice(arr.indexOf(t.value), 1); render(); }
      if (t.dataset.flag) { state[t.dataset.flag] = t.checked; render(); }
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]');
      if (b) { const arr = state[b.dataset.k]; const v = b.dataset.v; const on = !arr.includes(v); on ? arr.push(v) : arr.splice(arr.indexOf(v), 1); b.setAttribute('aria-pressed', on); render(); return; }
      const g = e.target.closest('.filter-group > button');
      if (g) { const gr = g.parentElement; gr.classList.toggle('is-collapsed'); g.setAttribute('aria-expanded', !gr.classList.contains('is-collapsed')); }
    });
    let raf;
    box.addEventListener('input', (e) => {
      const r = e.target.dataset.range; if (!r) return;
      let v = Number(e.target.value);
      if (r === 'min') { v = Math.min(v, state.max - 100); state.min = v; } else { v = Math.max(v, state.min + 100); state.max = v; }
      e.target.value = v; syncRange();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(render);
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear]')) {
        Object.assign(state, { linea: [], cat: [], genero: [], talla: [], color: [], min: PRICE_MIN, max: PRICE_MAX, oferta: false, favoritos: false });
        renderFilters(); render();
      }
      const ch = e.target.closest('[data-chip]');
      if (ch) {
        const [k, v] = ch.dataset.chip.split(':');
        if (k === 'precio') { state.min = PRICE_MIN; state.max = PRICE_MAX; }
        else if (k === 'oferta' || k === 'favoritos') state[k] = false;
        else state[k] = state[k].filter((x) => x !== v);
        renderFilters(); render();
      }
      if (e.target.closest('[data-open-filters]')) { openLayer(box); }
      if (e.target.closest('[data-close-filters]')) { closeAll(); }
    });
    $('[data-sort]').value = state.orden;
    $('[data-sort]').addEventListener('change', (e) => { state.orden = e.target.value; render(); });
    onChange(() => { if (state.favoritos) render(); });
  }

  renderFilters(); bind(); render(); reveal();
})();
