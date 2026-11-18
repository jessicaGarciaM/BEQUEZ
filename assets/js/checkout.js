/* PULSO — checkout en tres pasos */
(() => {
  'use strict';
  const { $, $$, fmt, Cart, lineItemHTML, reduced, onChange } = window.PULSO;
  const root = $('[data-checkout]');
  const ESTADOS = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'];
  const SHIP = { estandar: ['Estándar', '3 a 5 días hábiles'], express: ['Express', '24 horas en CDMX, GDL y MTY'], tienda: ['Recoger en tienda', 'Showroom PULSO, Roma Norte'] };
  let step = 0; let ship = 'estandar'; let pay = 'tarjeta';
  const data = {};

  const field = (id, label, { type = 'text', full = false, auto = '', mode = '', max = '' } = {}) => `
    <div class="field ${full ? 'field--full' : ''}"><input id="${id}" name="${id}" type="${type}" placeholder=" " ${auto ? `autocomplete="${auto}"` : ''} ${mode ? `inputmode="${mode}"` : ''} ${max ? `maxlength="${max}"` : ''}>
      <label for="${id}">${label}</label><span class="err" id="${id}-err"></span></div>`;

  function shell() {
    if (!Cart.items.length) {
      root.innerHTML = `<div class="empty" style="min-height:60vh;align-content:center">
        <svg viewBox="0 0 70 60"><path d="${window.PULSO.PULSE_D}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h1 class="display" style="font-size:var(--step-4)">Tu carrito está vacío</h1>
        <p class="muted">Agrega productos para continuar con el pago.</p>
        <a href="tienda.html" class="btn btn--primary" data-magnetic><span class="btn__label">Ir a la tienda</span></a></div>`;
      return;
    }
    root.innerHTML = `
      <div class="checkout">
        <div>
          <ol class="steps" aria-label="Pasos de compra"><li><span>Datos</span></li><li><span>Envío</span></li><li><span>Pago</span></li></ol>
          <form novalidate data-form>
            <section class="step-panel" data-step="0" aria-labelledby="s0">
              <h2 id="s0">Tus datos</h2>
              <div class="fields">
                ${field('email', 'Correo electrónico', { type: 'email', full: true, auto: 'email' })}
                ${field('nombre', 'Nombre', { auto: 'given-name' })}${field('apellido', 'Apellidos', { auto: 'family-name' })}
                ${field('tel', 'Teléfono (10 dígitos)', { type: 'tel', auto: 'tel', mode: 'numeric', max: 10 })}
                ${field('cp', 'Código postal', { auto: 'postal-code', mode: 'numeric', max: 5 })}
                ${field('calle', 'Calle y número', { full: true, auto: 'address-line1' })}
                ${field('colonia', 'Colonia', { auto: 'address-line2' })}${field('ciudad', 'Ciudad o alcaldía', { auto: 'address-level2' })}
                <div class="field field--full"><select id="estado" name="estado" autocomplete="address-level1"><option value="">Selecciona</option>${ESTADOS.map((e) => `<option>${e}</option>`).join('')}</select><label for="estado">Estado</label><span class="err" id="estado-err"></span></div>
              </div>
            </section>
            <section class="step-panel" data-step="1" aria-labelledby="s1">
              <h2 id="s1">Método de envío</h2>
              <div class="ship-opts">${Object.entries(SHIP).map(([k, [t, d]]) => `<label class="ship-opt"><input type="radio" name="ship" value="${k}" ${k === ship ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span><b class="price" data-ship-price="${k}"></b></label>`).join('')}</div>
            </section>
            <section class="step-panel" data-step="2" aria-labelledby="s2">
              <h2 id="s2">Pago</h2>
              <p class="demo-note"><b>Tienda de demostración:</b> no se realiza ningún cargo. Para cobrar de verdad conecta Stripe o Mercado Pago (ver README).</p>
              <div class="pay-tabs" role="group" aria-label="Forma de pago">
                <button type="button" data-pay="tarjeta" aria-pressed="true">Tarjeta</button><button type="button" data-pay="oxxo" aria-pressed="false">OXXO</button><button type="button" data-pay="spei" aria-pressed="false">Transferencia SPEI</button>
              </div>
              <div data-pay-panel="tarjeta">
                <div class="card-preview" data-card aria-hidden="true">
                  <svg viewBox="0 0 70 60"><path d="${window.PULSO.PULSE_D}" fill="none" stroke="#FFE14D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div class="card-preview__num" data-cnum>•••• •••• •••• ••••</div>
                  <div class="card-preview__row"><span data-cname>Nombre en la tarjeta</span><span data-cexp>MM/AA</span><b data-cbrand></b></div>
                </div>
                <div class="fields">
                  ${field('cc', 'Número de tarjeta', { full: true, auto: 'cc-number', mode: 'numeric', max: 19 })}
                  ${field('ccname', 'Nombre en la tarjeta', { full: true, auto: 'cc-name' })}
                  ${field('ccexp', 'Vencimiento (MM/AA)', { auto: 'cc-exp', mode: 'numeric', max: 5 })}${field('cvv', 'CVV', { auto: 'cc-csc', mode: 'numeric', max: 4 })}
                </div>
              </div>
              <div data-pay-panel="oxxo" hidden><p>Al confirmar recibirás una referencia para pagar en cualquier OXXO. Tienes 48 horas para pagar; tu pedido se envía cuando se acredite el pago.</p></div>
              <div data-pay-panel="spei" hidden><p>Al confirmar te mostraremos una CLABE para transferir desde tu banca en línea. Los pagos SPEI se acreditan en minutos.</p></div>
            </section>
            <div class="step-nav">
              <button type="button" class="btn btn--ghost" data-back>Regresar</button>
              <button type="submit" class="btn btn--primary" data-next data-magnetic><span class="btn__label">Continuar</span></button>
            </div>
          </form>
        </div>
        <aside class="summary" aria-label="Resumen del pedido" data-summary></aside>
      </div>`;
    bind(); go(0); summary();
  }

  function summary() {
    const s = $('[data-summary]'); if (!s) return;
    s.innerHTML = `<h2>Resumen</h2>
      <div>${Cart.items.map((i) => lineItemHTML(i, { compact: true })).join('')}</div>
      <div class="totals">
        <div><span>Subtotal</span><span class="price">${fmt(Cart.subtotal())}</span></div>
        ${Cart.discount() ? `<div><span>Descuento (${Cart.promo})</span><span class="price">−${fmt(Cart.discount())}</span></div>` : ''}
        <div><span>Envío · ${SHIP[ship][0]}</span><span class="price">${Cart.shipping(ship) ? fmt(Cart.shipping(ship)) : 'Gratis'}</span></div>
        <div class="total"><span>Total</span><span class="price" data-total>${fmt(Cart.total(ship))}</span></div>
      </div>
      <p class="muted" style="font-size:.85rem;margin:0">IVA incluido. Pago 100% seguro.</p>`;
    $$('[data-ship-price]').forEach((el) => { const v = Cart.shipping(el.dataset.shipPrice); el.textContent = v ? fmt(v) : 'Gratis'; });
  }

  function go(n) {
    step = n;
    $$('.step-panel').forEach((p) => p.classList.toggle('is-active', Number(p.dataset.step) === n));
    $$('.steps li').forEach((li, i) => { li.classList.toggle('is-done', i < n); li.classList.toggle('is-current', i === n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    $('[data-back]').style.visibility = n === 0 ? 'hidden' : 'visible';
    $('[data-next] .btn__label').textContent = n === 2 ? `Confirmar pedido · ${fmt(Cart.total(ship))}` : 'Continuar';
    if (n > 0) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  const rules = {
    email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Escribe un correo válido.'],
    nombre: [(v) => v.length > 1, 'Escribe tu nombre.'],
    apellido: [(v) => v.length > 1, 'Escribe tus apellidos.'],
    tel: [(v) => /^\d{10}$/.test(v), 'El teléfono debe tener 10 dígitos.'],
    cp: [(v) => /^\d{5}$/.test(v), 'El código postal tiene 5 dígitos.'],
    calle: [(v) => v.length > 3, 'Escribe calle y número.'],
    colonia: [(v) => v.length > 1, 'Escribe tu colonia.'],
    ciudad: [(v) => v.length > 1, 'Escribe tu ciudad o alcaldía.'],
    estado: [(v) => !!v, 'Selecciona un estado.'],
    cc: [(v) => luhn(v.replace(/\s/g, '')), 'Revisa el número de tarjeta.'],
    ccname: [(v) => v.length > 3, 'Escribe el nombre como aparece en la tarjeta.'],
    ccexp: [(v) => validExp(v), 'Usa una fecha vigente con formato MM/AA.'],
    cvv: [(v) => /^\d{3,4}$/.test(v), 'El CVV tiene 3 o 4 dígitos.']
  };
  function luhn(n) { if (!/^\d{13,19}$/.test(n)) return false; let s = 0; n.split('').reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; }); return s % 10 === 0; }
  function validExp(v) { const m = v.match(/^(\d{2})\/(\d{2})$/); if (!m) return false; const mo = +m[1], yr = 2000 + +m[2]; if (mo < 1 || mo > 12) return false; const now = new Date(); return yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth() + 1); }
  function check(id) {
    const el = $(`#${id}`); if (!el) return true;
    const [fn, msg] = rules[id]; const ok = fn(el.value.trim());
    el.closest('.field').classList.toggle('is-invalid', !ok);
    $(`#${id}-err`).textContent = ok ? '' : msg;
    el.setAttribute('aria-invalid', !ok);
    if (!ok) el.setAttribute('aria-describedby', `${id}-err`);
    return ok;
  }
  function validStep() {
    const ids = step === 0 ? ['email', 'nombre', 'apellido', 'tel', 'cp', 'calle', 'colonia', 'ciudad', 'estado'] : step === 2 && pay === 'tarjeta' ? ['cc', 'ccname', 'ccexp', 'cvv'] : [];
    const bad = ids.filter((id) => !check(id));
    if (bad.length) { $(`#${bad[0]}`).focus(); return false; }
    ids.forEach((id) => { data[id] = $(`#${id}`).value.trim(); });
    return true;
  }

  function bind() {
    const form = $('[data-form]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validStep()) { const b = $('[data-next]'); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 }); return; }
      if (step < 2) go(step + 1); else placeOrder();
    });
    $('[data-back]').addEventListener('click', () => go(Math.max(0, step - 1)));
    form.addEventListener('focusout', (e) => { if (rules[e.target.id] && e.target.value) check(e.target.id); });
    form.addEventListener('change', (e) => { if (e.target.name === 'ship') { ship = e.target.value; summary(); go(step); } });
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.id === 'tel' || t.id === 'cp' || t.id === 'cvv') t.value = t.value.replace(/\D/g, '');
      if (t.id === 'cc') { t.value = t.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); $('[data-cnum]').textContent = (t.value + ' •••• •••• •••• ••••'.slice(t.value.length)).slice(0, 19) || '•••• •••• •••• ••••'; const d = t.value[0]; $('[data-cbrand]').textContent = d === '4' ? 'VISA' : d === '5' ? 'MASTERCARD' : d === '3' ? 'AMEX' : ''; }
      if (t.id === 'ccname') $('[data-cname]').textContent = t.value || 'Nombre en la tarjeta';
      if (t.id === 'ccexp') { let v = t.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`; t.value = v; $('[data-cexp]').textContent = v || 'MM/AA'; }
      if (t.closest('.field.is-invalid') && rules[t.id]) check(t.id);
    });
    const card = $('[data-card]');
    $('#cvv').addEventListener('focus', () => { if (!reduced) card.style.transform = 'rotateY(12deg) rotateX(4deg)'; });
    $('#cvv').addEventListener('blur', () => { card.style.transform = ''; });
    $$('[data-pay]').forEach((b) => b.addEventListener('click', () => {
      pay = b.dataset.pay;
      $$('[data-pay]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      $$('[data-pay-panel]').forEach((p) => { p.hidden = p.dataset.payPanel !== pay; });
    }));
  }

  function placeOrder() {
    const btn = $('[data-next]'); btn.disabled = true; btn.querySelector('.btn__label').textContent = 'Procesando…';
    setTimeout(() => {
      const no = `PUL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const total = Cart.total(ship); const n = Cart.count();
      const extra = pay === 'oxxo' ? `<p>Referencia OXXO: <b>${Math.floor(1e13 + Math.random() * 9e13)}</b> · paga antes de 48 horas.</p>` : pay === 'spei' ? '<p>CLABE de demostración: <b>000 000 0000 0000 00</b></p>' : '';
      Cart.clear();
      root.innerHTML = `<div class="confirm">
        <svg class="confirm__check" viewBox="0 0 110 110" fill="none"><circle cx="55" cy="55" r="52" stroke="var(--cobalto)" stroke-width="5"/><path d="M33 56 l15 15 l30 -32" stroke="var(--cobalto)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h1 class="display">¡Pedido confirmado!</h1>
        <span class="order-no">Pedido ${no}</span>
        <p class="lead" style="margin:0 auto">Gracias, ${data.nombre || 'atleta'}. Enviamos la confirmación a ${data.email || 'tu correo'}. ${n} ${n === 1 ? 'artículo' : 'artículos'} · total ${fmt(total)} · envío ${SHIP[ship][0].toLowerCase()}.</p>
        ${extra}
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center"><a href="tienda.html" class="btn btn--primary" data-magnetic><span class="btn__label">Seguir comprando</span></a><a href="index.html#club" class="btn btn--ghost"><span class="btn__label">Unirme al Club PULSO</span></a></div>
      </div>`;
      window.scrollTo(0, 0);
      confetti();
    }, 1200);
  }

  function confetti() {
    if (reduced) return;
    const cv = $('#confetti'); const ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#2C46B5', '#E5532E', '#FFE14D', '#141A3D', '#C9D4FF'];
    const ps = Array.from({ length: 180 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    let f = 0;
    (function loop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => { p.vy += 0.4; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (++f < 220) requestAnimationFrame(loop); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  shell();
  onChange(() => { if ($('[data-summary]')) summary(); });
})();
