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

  document.getElementById('year').textContent = new Date().getFullYear();
})();

// ==========================================================
// Demobutik: Norrsken (påhittat smyckesmärke)
// Byt produkter, bilder och priser i listan nedan.
// ==========================================================
(function () {
  var products = [
    {
      id: 'orsa', cat: 'Ringar', type: 'Ring', name: 'Orsa', price: 399, label: 'Nyhet',
      img: 'img/produkter/orsa.jpg',
      desc: 'Tunn, blank ring i förgyllt sterlingsilver. Enkel nog att bära varje dag, fin att stapla med fler.',
      opt: { name: 'Storlek', values: ['16', '17', '18', '19'] }
    },
    {
      id: 'siljan', cat: 'Ringar', type: 'Ringset', name: 'Siljan', price: 549,
      img: 'img/produkter/siljan.jpg',
      desc: 'Två ringar i borstat sterlingsilver, en bred och en smal. Bär dem tillsammans eller var för sig.',
      opt: { name: 'Storlek', values: ['16', '17', '18', '19'] }
    },
    {
      id: 'tallberg', cat: 'Örhängen', type: 'Creoler', name: 'Tällberg', price: 449, label: 'Bästsäljare',
      img: 'img/produkter/tallberg.jpg',
      desc: 'Klassiska ringörhängen i förgyllt stål. Lätta, nickelfria och tåliga mot vatten.',
      opt: { name: 'Storlek', values: ['20 mm', '30 mm'] }
    },
    {
      id: 'polstjarna', cat: 'Örhängen', type: 'Örhängen', name: 'Polstjärna', price: 349,
      img: 'img/produkter/polstjarna.jpg',
      desc: 'Små stiftörhängen formade som en fyruddig stjärna. Förgyllt silver med facetterad yta som fångar ljuset.',
      opt: { name: 'Antal', values: ['Par', 'Singel'] }
    },
    {
      id: 'vika', cat: 'Halsband', type: 'Halsband', name: 'Vika', price: 599,
      img: 'img/produkter/vika.jpg',
      desc: 'Ankarkedja i förgyllt silver med en sötvattenspärla. Justerbar längd.',
      opt: { name: 'Längd', values: ['40–45 cm', '45–50 cm'] }
    },
    {
      id: 'leksand', cat: 'Armband', type: 'Armring', name: 'Leksand', price: 499,
      img: 'img/produkter/leksand.jpg',
      desc: 'Öppen armring i förgyllt stål med mjukt rundade ändar. Går att justera lite för handleden.',
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
            '<button class="buy" id="payBtn" data-go="pay">Betala ' + kr(total()) + '</button>' +
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
            '<p class="demo-flag">Det här är en demo. Inga pengar dras och ingen order skickas.</p>' +
          '</aside>' +
        '</div>' +
      '</div>';
  }

  function viewDone() {
    var p = state.product;
    var names = { swish: 'Swish', card: 'kort', klarna: 'Klarna' };
    var order = 'NS-' + (1000 + Math.floor(Math.random() * 9000));
    return '' +
      '<div class="shop__section shop__section--pad"><div class="done">' +
        '<div class="done__icon" aria-hidden="true">✓</div>' +
        '<h3>Tack för ditt köp</h3>' +
        '<p>Order ' + order + ' är betald med ' + names[state.method] + '. En bekräftelse skickas till kund@exempel.se.</p>' +
        '<div class="done__box">' +
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
      t.innerHTML = '<span class="spinner"></span>' + (state.method === 'swish' ? 'Väntar på Swish…' : 'Behandlar betalning…');
      setTimeout(function () { state.view = 'done'; render(true); }, 1400);
      return;
    }
    if (go === 'restart') { state.view = 'list'; state.filter = 'Alla'; render(true); return; }
    if (go) { state.view = go; render(true); }
  });

  root.addEventListener('change', function (e) {
    if (e.target.name === 'demo-pay') { state.method = e.target.value; render(false); }
  });

  render(false);
})();
