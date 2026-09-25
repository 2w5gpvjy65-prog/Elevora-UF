/* Elevora UF – meny, mobilknapp och demobutiken */

(function () {
  // ---------- Meny ----------
  var header = document.querySelector('.header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Mobilknappen syns när man scrollat förbi hero, men inte vid formuläret
  var mobileCta = document.querySelector('.mobile-cta');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('offert');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.pageYOffset > 8);
    var pastHero = hero.getBoundingClientRect().bottom < 0;
    var atContact = contact.getBoundingClientRect().top < window.innerHeight;
    mobileCta.classList.toggle('is-visible', pastHero && !atContact);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Logotypen: tillbaka till toppen och demobutikens startsida
  document.querySelectorAll('.logo').forEach(function (logo) {
    logo.addEventListener('click', function (e) {
      e.preventDefault();
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      document.dispatchEvent(new Event('shop:reset'));
    });
  });

  // Mjuk intoning när avsnitten kommer in i bild
  var reveal = document.querySelectorAll('.head, .service-list li, .browser, .notice, .compare__grid > div, .price-table, .step-list li, .style__list li, .about__text, .facts, .contact__grid > *');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveal.forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(i, 3) * 90 + 'ms';
      el.classList.add('reveal');
    });
    var pending = Array.prototype.slice.call(reveal);
    var ticking = false;
    function showVisible() {
      ticking = false;
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('is-in'); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onRevealScroll);
    }
    function onRevealScroll() { if (!ticking) { ticking = true; requestAnimationFrame(showVisible); } }
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);
    showVisible();
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();

// ==========================================================
// Demobutik: Norrsken (påhittat smyckesmärke)
// Byt produkter, bilder och priser i listan nedan.
// ==========================================================
(function () {
  var products = [
    {
      id: 'orsa', cat: 'Ringar', type: 'Ring', name: 'Orsa', price: 449, label: 'Nyhet',
      img: 'img/produkter/orsa.jpg',
      desc: 'Ring formad som en orm som biter sig själv i svansen. Förgyllt silver med graverade fjäll och små svarta ögon.',
      opt: { name: 'Storlek', values: ['16', '17', '18', '19'] }
    },
    {
      id: 'tallberg', cat: 'Örhängen', type: 'Creoler', name: 'Tällberg', price: 549, label: 'Bästsäljare',
      img: 'img/produkter/tallberg.jpg',
      desc: 'Creoler i förgyllt silver med en rad glittrande stenar runt hela ringen. Stängs med ett klick.',
      opt: { name: 'Storlek', values: ['15 mm', '20 mm'] }
    },
    {
      id: 'polstjarna', cat: 'Örhängen', type: 'Stiftörhängen', name: 'Polstjärna', price: 399,
      img: 'img/produkter/polstjarna.jpg',
      desc: 'Stiftörhängen i sterlingsilver. En stor sten omgiven av en krans av små stenar som gnistrar som en stjärnhimmel.',
      opt: { name: 'Antal', values: ['Par', 'Singel'] }
    },
    {
      id: 'vika', cat: 'Halsband', type: 'Halsband', name: 'Vika', price: 349,
      img: 'img/produkter/vika.jpg',
      desc: 'Tunn, blank kedja i förgyllt silver. Fin att bära ensam eller med ett hänge.',
      opt: { name: 'Längd', values: ['40 cm', '45 cm', '50 cm'] }
    },
    {
      id: 'rattvik', cat: 'Halsband', type: 'Halsband med hänge', name: 'Rättvik', price: 649,
      img: 'img/produkter/rattvik.jpg',
      desc: 'Förgyllt halsband med ett hänge i filigran och en droppformad sten. Gjort för fest, men fungerar lika bra till vardags.',
      opt: { name: 'Längd', values: ['42 cm', '47 cm'] }
    },
    {
      id: 'leksand', cat: 'Armband', type: 'Armring', name: 'Leksand', price: 499,
      img: 'img/produkter/leksand.jpg',
      desc: 'Smal armring i förgyllt stål med små stenar längs ena sidan. Öppnas med ett gångjärn.',
      opt: { name: 'Storlek', values: ['S', 'M', 'L'] }
    }
  ];

  var root = document.getElementById('shop');
  var pathEl = document.getElementById('demoPath');
  if (!root) return;

  var state = { view: 'list', filter: 'Alla', product: null, option: null, qty: 1, method: 'swish', touched: false };
  var SHIPPING = 39;

  function kr(n) { return n.toLocaleString('sv-SE') + ' kr'; }
  function img(src, alt) { return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy">'; }
  function find(id) { return products.filter(function (p) { return p.id === id; })[0]; }
  function total() { return state.product.price * state.qty + SHIPPING; }

  function header() {
    return '<div class="shop__head">' +
      '<nav class="shop__menu" aria-hidden="true"><span>Ringar</span><span>Örhängen</span><span>Halsband</span></nav>' +
      '<button class="shop__brand" data-go="list">Norrsken</button>' +
      '<span class="shop__cart">Varukorg (' + (state.view === 'checkout' ? state.qty : 0) + ')</span>' +
    '</div>';
  }

  function viewList() {
    var cats = ['Alla', 'Ringar', 'Örhängen', 'Halsband', 'Armband'];
    var list = products.filter(function (p) { return state.filter === 'Alla' || p.cat === state.filter; });
    return '' +
      '<div class="shop__intro">' +
        '<div><h3>Smycken från Dalarna</h3><p>Förgyllt och sterlingsilver. Fri frakt över 500 kr.</p></div>' +
        '<div class="shop__filters" role="group" aria-label="Filtrera produkter">' +
          cats.map(function (c) { return '<button data-filter="' + c + '" aria-pressed="' + (state.filter === c) + '">' + c + '</button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="shop__section">' +
        (state.touched ? '' : '<p class="shop__hint">Tryck på en produkt för att testa köpet.</p>') +
        '<div class="grid">' +
          list.map(function (p) {
            return '<button class="card" data-product="' + p.id + '">' +
              '<span class="card__img">' + img(p.img, p.type + ' ' + p.name) +
                (p.label ? '<span class="card__label">' + p.label + '</span>' : '') +
              '</span>' +
              '<span class="card__row"><span><span class="card__name">' + p.name + '</span><span class="card__type">' + p.type + '</span></span>' +
              '<span class="card__price">' + kr(p.price) + '</span></span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function viewProduct() {
    var p = state.product;
    return '' +
      '<div class="shop__section shop__section--pad">' +
        '<button class="crumbs" data-go="list">← Alla smycken</button>' +
        '<div class="product">' +
          '<div class="product__img">' + img(p.img, p.type + ' ' + p.name) + '</div>' +
          '<div class="product__info">' +
            '<p class="product__type">' + p.type + '</p>' +
            '<h3>' + p.name + '</h3>' +
            '<p class="product__price">' + kr(p.price) + '</p>' +
            '<p class="product__desc">' + p.desc + '</p>' +
            '<div class="product__opt"><span>' + p.opt.name + ': ' + state.option + '</span>' +
              '<div class="chips">' + p.opt.values.map(function (v) {
                return '<button data-option="' + v + '" aria-pressed="' + (state.option === v) + '">' + v + '</button>';
              }).join('') + '</div>' +
            '</div>' +
            '<button class="buy" data-go="checkout">Köp nu</button>' +
            '<p class="demo-only">Demo: det går inte att köpa något på riktigt här.</p>' +
            '<div class="paylist"><span>Swish</span><span>Kort</span><span>Klarna</span></div>' +
            '<ul class="product__usp"><li>Skickas inom 1–2 vardagar</li><li>Fri retur i 30 dagar</li><li>Levereras i presentask</li></ul>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function methodBody() {
    if (state.method === 'swish') {
      return '<div class="method__body"><p>Du får en betalningsförfrågan i Swish-appen.</p>' +
        '<label class="field">Mobilnummer<input type="tel" value="070-123 45 67" readonly></label></div>';
    }
    if (state.method === 'card') {
      return '<div class="method__body"><p>Demo: fälten är ifyllda med ett testkort. Skriv aldrig in riktiga kortuppgifter här.</p>' +
        '<label class="field">Kortnummer<input value="4242 4242 4242 4242" readonly></label>' +
        '<div class="field-row"><label class="field">Giltigt till<input value="12/29" readonly></label>' +
        '<label class="field">CVC<input value="123" readonly></label></div></div>';
    }
    return '<div class="method__body"><p>Betala om 30 dagar, eller dela upp i 3 räntefria delar om ' + kr(Math.ceil(total() / 3)) + '.</p></div>';
  }

  function viewCheckout() {
    var p = state.product;
    var methods = [
      { id: 'swish', label: 'Swish', note: 'Direkt' },
      { id: 'card', label: 'Kort', note: 'Visa, Mastercard' },
      { id: 'klarna', label: 'Klarna', note: 'Faktura eller delbetalning' }
    ];
    return '' +
      '<div class="shop__section shop__section--pad">' +
        '<button class="crumbs" data-go="product">← Tillbaka till ' + p.name + '</button>' +
        '<div class="checkout">' +
          '<div>' +
            '<h3>Kassa</h3>' +
            '<p class="checkout__step">1. Leverans</p>' +
            '<label class="field">E-post<input type="email" value="kund@exempel.se" readonly></label>' +
            '<div class="field-row"><label class="field">Postnummer<input value="792 30" readonly></label>' +
            '<label class="field">Ort<input value="Mora" readonly></label></div>' +
            '<p class="checkout__step">2. Betalning</p>' +
            '<div class="methods" role="radiogroup" aria-label="Betalsätt">' +
              methods.map(function (m) {
                var checked = state.method === m.id;
                return '<label class="method"><input type="radio" name="demo-pay" value="' + m.id + '"' + (checked ? ' checked' : '') + '>' +
                  m.label + '<small>' + m.note + '</small></label>' + (checked ? methodBody() : '');
              }).join('') +
            '</div>' +
            '<button class="buy" id="payBtn" data-go="pay">Genomför demoköp · ' + kr(total()) + '</button>' +
            '<p class="demo-only">Ingen betalning görs. Knappen visar bara hur det ser ut för kunden.</p>' +
          '</div>' +
          '<aside class="checkout__summary">' +
            '<div class="line"><span class="line__ph">' + img(p.img, '') + '</span>' +
              '<div><strong>' + p.name + '</strong><small>' + p.type + ', ' + p.opt.name.toLowerCase() + ' ' + state.option + '</small>' +
                '<span class="qty"><button data-qty="-1" aria-label="Minska antal">−</button><span>' + state.qty + '</span><button data-qty="1" aria-label="Öka antal">+</button></span>' +
              '</div>' +
            '</div>' +
            '<div class="sum"><span>Delsumma</span><span>' + kr(p.price * state.qty) + '</span></div>' +
            '<div class="sum"><span>Frakt</span><span>' + kr(SHIPPING) + '</span></div>' +
            '<div class="sum sum--total"><span>Totalt</span><span>' + kr(total()) + '</span></div>' +
            '<p class="demo-flag">Demo. Inga pengar dras och ingen order skickas.</p>' +
          '</aside>' +
        '</div>' +
      '</div>';
  }

  function viewDone() {
    var p = state.product;
    var names = { swish: 'Swish', card: 'kort', klarna: 'Klarna' };
    var order = 'DEMO-' + (1000 + Math.floor(Math.random() * 9000));
    return '' +
      '<div class="shop__section shop__section--pad"><div class="done">' +
        '<div class="done__icon" aria-hidden="true">✓</div>' +
        '<h3>Så här ser det ut för kunden</h3>' +
        '<p>Det här var ett demoköp med ' + names[state.method] + '. Ingenting har köpts och inga pengar har dragits. I en riktig butik får kunden en orderbekräftelse på mejlen.</p>' +
        '<div class="done__box">' +
          '<p class="done__order"><span>' + order + '</span><span>Ej betald</span></p>' +
          '<p><span>' + state.qty + ' × ' + p.name + ' (' + state.option + ')</span><span>' + kr(total()) + '</span></p>' +
        '</div>' +
        '<div class="done__pitch"><strong>Så enkelt blir det för era kunder.</strong>Ingen DM och ingen väntan. Ni får ordern på mejlen och pengarna till ert konto.</div>' +
        '<div class="done__actions">' +
          '<a href="#offert" class="btn">Jag vill ha en sån här</a>' +
          '<button class="btn btn--line" data-go="restart">Testa igen</button>' +
        '</div>' +
      '</div></div>';
  }

  var paths = { list: '', checkout: '/kassa', done: '/tack' };

  function render(scroll) {
    var body = { list: viewList, product: viewProduct, checkout: viewCheckout, done: viewDone }[state.view]();
    root.innerHTML = header() + '<div class="shop-view">' + body + '</div>';
    pathEl.textContent = state.view === 'product' ? '/' + state.product.id : paths[state.view];
    if (scroll) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 120;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t || !root.contains(t)) return;

    if (t.dataset.filter) { state.filter = t.dataset.filter; render(false); return; }
    if (t.dataset.product) {
      state.product = find(t.dataset.product);
      state.option = state.product.opt.values[0];
      state.qty = 1;
      state.touched = true;
      state.view = 'product';
      render(true);
      return;
    }
    if (t.dataset.option) { state.option = t.dataset.option; render(false); return; }
    if (t.dataset.qty) {
      state.qty = Math.min(9, Math.max(1, state.qty + Number(t.dataset.qty)));
      render(false);
      return;
    }

    var go = t.dataset.go;
    if (go === 'pay') {
      t.disabled = true;
      t.innerHTML = '<span class="spinner"></span>' + (state.method === 'swish' ? 'Visar Swish-steget…' : 'Visar betalningen…');
      setTimeout(function () { state.view = 'done'; render(true); }, 1400);
      return;
    }
    if (go === 'restart') { state.view = 'list'; state.filter = 'Alla'; render(true); return; }
    if (go) { state.view = go; render(true); }
  });

  document.addEventListener('shop:reset', function () {
    state.view = 'list'; state.filter = 'Alla'; state.touched = false;
    render(false);
  });

  root.addEventListener('change', function (e) {
    if (e.target.name === 'demo-pay') { state.method = e.target.value; render(false); }
  });

  render(false);
})();
