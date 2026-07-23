/* ═══════════════════════════════════════════════════════════
   PerfectFlow — Landing · interacciones
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── 1. Header con sombra al hacer scroll ─── */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── 2. Menú móvil ─── */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const closeNav = () => { nav.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  /* ─── 3. Reveal on scroll (IntersectionObserver) ─── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (entry.target.dataset.delay || '0') + 'ms';
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // pequeño escalonado por grupos de hermanos
    reveals.forEach((el) => {
      const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      el.dataset.delay = String(Math.min(sibs.indexOf(el), 5) * 70);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ─── 4. Integraciones: render + búsqueda ─── */
  // slug = logo oficial (Simple Icons vía jsDelivr) pintado en su color de marca.
  // Sin slug → badge con iniciales.
  const ICON_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/';
  const INTEGRATIONS = [
    { name: 'Twilio',     slug: 'twilio',     color: '#F22F46', initials: 'Tw' },
    { name: 'Mailjet',                        color: '#FFB900', initials: 'Mj' },
    { name: 'Stripe',     slug: 'stripe',     color: '#635BFF', initials: 'St' },
    { name: 'WhatsApp',   slug: 'whatsapp',   color: '#25D366', initials: 'Wa' },
    { name: 'Slack',      slug: 'slack',      color: '#4A154B', initials: 'Sl' },
    { name: 'Mailchimp',  slug: 'mailchimp',  color: '#FFB400', initials: 'Mc' },
    { name: 'Shopify',    slug: 'shopify',    color: '#7AB55C', initials: 'Sh' },
    { name: 'HubSpot',    slug: 'hubspot',    color: '#FF7A59', initials: 'Hs' },
    { name: 'Telegram',   slug: 'telegram',   color: '#26A5E4', initials: 'Tg' },
    { name: 'WordPress',  slug: 'wordpress',  color: '#21759B', initials: 'Wp' },
    { name: 'WooCommerce',slug: 'woocommerce',color: '#96588A', initials: 'Wc' },
    { name: 'Zapier',     slug: 'zapier',     color: '#FF4F00', initials: 'Zp' },
    { name: 'Notion',     slug: 'notion',     color: '#000000', initials: 'No' },
    { name: 'Dropbox',    slug: 'dropbox',    color: '#0061FF', initials: 'Db' },
    { name: 'PayPal',     slug: 'paypal',     color: '#003087', initials: 'Pp' },
    { name: 'Zoom',       slug: 'zoom',       color: '#0B5CFF', initials: 'Zm' },
    { name: 'Trello',     slug: 'trello',     color: '#0052CC', initials: 'Tr' },
    { name: 'QuickBooks', slug: 'quickbooks', color: '#2CA01C', initials: 'QB' },
    { name: 'Discord',    slug: 'discord',    color: '#5865F2', initials: 'Dc' },
    { name: 'Webhooks',                       color: '#1860F0', initials: '{ }' },
  ];

  const grid = document.getElementById('integGrid');
  const empty = document.getElementById('integEmpty');
  const search = document.getElementById('integSearch');

  function chip(it) {
    const el = document.createElement('div');
    el.className = 'integ';
    el.dataset.name = it.name.toLowerCase();

    const logo = document.createElement('span');
    logo.className = 'integ__logo';
    if (it.slug) {
      const ico = document.createElement('i');
      ico.className = 'integ__ico';
      ico.style.setProperty('--src', 'url("' + ICON_BASE + it.slug + '.svg")');
      ico.style.backgroundColor = it.color;   // color de marca (sobre máscara SVG)
      logo.appendChild(ico);
    } else {
      logo.classList.add('integ__logo--badge');
      logo.style.background = it.color;
      logo.textContent = it.initials;
    }

    const name = document.createElement('span');
    name.className = 'integ__name';
    name.textContent = it.name;
    el.append(logo, name);
    return el;
  }

  if (grid) {
    INTEGRATIONS.forEach((it) => grid.appendChild(chip(it)));

    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      grid.querySelectorAll('.integ').forEach((el) => {
        const match = el.dataset.name.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      empty.hidden = visible !== 0;
    });
  }

  /* ─── 5. Toggle de precios mensual/anual ─── */
  const switchEl = document.getElementById('priceSwitch');
  const opts = document.querySelectorAll('.price-toggle__opt');
  const amounts = document.querySelectorAll('.plan__amount');
  const billed = document.querySelectorAll('.plan__billed[data-month]');
  // Los CTA con checkout directo dependen del ciclo: el link de pago es
  // mensual, así que en anual el plan pasa por ventas.
  const cycleCtas = document.querySelectorAll('[data-cycle-cta]');

  function setCycle(cycle) {
    const year = cycle === 'year';
    switchEl.classList.toggle('year', year);
    opts.forEach((o) => o.classList.toggle('is-active', o.dataset.cycle === cycle));
    amounts.forEach((a) => {
      const target = year ? a.dataset.year : a.dataset.month;
      if (target != null) animateNumber(a, parseInt(a.textContent, 10) || 0, parseInt(target, 10));
    });
    billed.forEach((b) => { b.textContent = year ? b.dataset.year : b.dataset.month; });
    cycleCtas.forEach((cta) => {
      const href = year ? cta.dataset.hrefYear : cta.dataset.hrefMonth;
      const label = year ? cta.dataset.labelYear : cta.dataset.labelMonth;
      if (href) cta.setAttribute('href', href);
      if (label) cta.textContent = label;
      if (href && /^https?:/.test(href)) {
        cta.setAttribute('target', '_blank');
        cta.setAttribute('rel', 'noopener');
      } else {
        cta.removeAttribute('target');
        cta.removeAttribute('rel');
      }
    });
  }
  if (switchEl) {
    switchEl.addEventListener('click', () => setCycle(switchEl.classList.contains('year') ? 'month' : 'year'));
    opts.forEach((o) => o.addEventListener('click', () => setCycle(o.dataset.cycle)));
  }

  /* ─── 6. Contadores animados (stats + precios) ─── */
  function animateNumber(el, from, to, suffix) {
    const dur = 600, start = performance.now();
    const sfx = suffix != null ? suffix : '';
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased) + sfx;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const stats = document.querySelectorAll('.stat__num');
  if ('IntersectionObserver' in window && stats.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateNumber(el, 0, parseInt(el.dataset.count, 10), el.dataset.suffix || '');
          so.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach((s) => so.observe(s));
  }

  /* ─── 7. Dashboard interactivo ─── */
  const showcase = document.querySelector('.showcase');
  if (showcase) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 7a. Sidebar: cambiar módulo activo → título + acento
    const dashTitle = document.getElementById('dashTitle');
    document.querySelectorAll('#dashNav .dnav').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#dashNav .dnav').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (dashTitle) dashTitle.textContent = btn.dataset.title;
        showcase.style.setProperty('--dash-accent', btn.dataset.accent);
      });
    });

    // 7b. Gráfico: pestañas Hoy / Semana / Mes
    const chart = document.getElementById('dashChart');
    const DATASETS = {
      hoy:    [38, 62, 48, 78, 55, 90, 70, 84, 60, 96, 74, 88],
      semana: [54, 40, 72, 58, 86, 64, 92, 70, 50, 80, 66, 94],
      mes:    [70, 82, 60, 90, 74, 96, 64, 88, 78, 100, 84, 92],
    };
    function paintChart(key) {
      if (!chart) return;
      const data = DATASETS[key] || DATASETS.hoy;
      chart.querySelectorAll('.dbar').forEach((bar, i) => {
        bar.style.setProperty('--h', (data[i] != null ? data[i] : 50) + '%');
      });
    }
    document.querySelectorAll('#dashTabs .dtab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#dashTabs .dtab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        paintChart(tab.dataset.tab);
      });
    });

    // 7c. KPIs: contadores al entrar en vista
    function animKpi(el) {
      const to = parseInt(el.dataset.count, 10);
      const pre = el.dataset.prefix || '';
      const start = performance.now(), dur = 1100;
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(to * eased).toLocaleString('es');
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }

    // 7d. Feed de actividad en vivo
    const feed = document.getElementById('dashFeed');
    const P = {
      msg:  '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
      cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
      zap:  '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    };
    function svg(p, c) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    }
    const EVENTS = [
      { p: P.msg,  c: '#1B7a4f', fb: '#DFF2E5', t: 'WhatsApp enviado', d: 'a María López' },
      { p: P.cart, c: '#1860F0', fb: '#E6F0FF', t: 'Nuevo pedido', d: '#1042 · $1.240' },
      { p: P.mail, c: '#7D66FF', fb: '#EFEBFF', t: 'Factura emitida', d: 'vía Mailjet' },
      { p: P.card, c: '#1B7a4f', fb: '#DFF2E5', t: 'Pago confirmado', d: 'Stripe · $680' },
      { p: P.zap,  c: '#0E9DB8', fb: '#D9F2F7', t: 'Automatización', d: 'stock actualizado' },
      { p: P.user, c: '#D6336C', fb: '#FFE3EC', t: 'Cliente nuevo', d: 'Carlos Paz' },
    ];
    let ei = 0;
    function feedItem(ev, ago) {
      const li = document.createElement('li');
      li.innerHTML = '<span class="fi" style="--fb:' + ev.fb + '">' + svg(ev.p, ev.c) + '</span>' +
        '<span><span class="ft">' + ev.t + '</span> · ' + ev.d + '</span>' +
        '<span class="fm">' + ago + '</span>';
      return li;
    }
    if (feed) {
      const seed = ['ahora', 'hace 1 min', 'hace 3 min', 'hace 6 min'];
      for (let k = 0; k < 4; k++) { feed.appendChild(feedItem(EVENTS[k], seed[k])); ei = k + 1; }
      if (!reduce) {
        setInterval(() => {
          ei = (ei + 1) % EVENTS.length;
          const li = feedItem(EVENTS[ei], 'ahora');
          feed.insertBefore(li, feed.firstChild);
          while (feed.children.length > 4) feed.removeChild(feed.lastChild);
        }, 2600);
      }
    }

    // Disparar contadores cuando el dashboard entra en vista
    if ('IntersectionObserver' in window) {
      const dobs = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            showcase.querySelectorAll('.kpi__val[data-count]').forEach(animKpi);
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      dobs.observe(showcase);
    }
  }

  /* ─── 8. Año dinámico (footer + modales) ─── */
  document.querySelectorAll('[data-year-now]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ─── 9. Modales legales ─── */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModals() {
    document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(btn.dataset.modalOpen); });
  });
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });

  /* ─── 10. Banner de cookies ─── */
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookies = document.getElementById('acceptCookies');
  if (cookieBanner && acceptCookies) {
    let accepted = false;
    try { accepted = localStorage.getItem('pf_cookies') === '1'; } catch (_) {}
    if (!accepted) setTimeout(() => cookieBanner.classList.add('open'), 3000);
    acceptCookies.addEventListener('click', () => {
      cookieBanner.classList.remove('open');
      try { localStorage.setItem('pf_cookies', '1'); } catch (_) {}
    });
  }
})();
