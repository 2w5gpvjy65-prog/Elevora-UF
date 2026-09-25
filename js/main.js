/* Elevora UF – meny, mobilknappar och demobutiken */

(function () {
  // ---------- Meny ----------
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

  // Prisknappar förväljer tjänst i offertformuläret
  var serviceSelect = document.getElementById('serviceSelect');
  document.querySelectorAll('[data-service]').forEach(function (btn) {
    btn.addEventListener('click', function () { serviceSelect.value = btn.dataset.service; });
  });

  // Mobilknapparna syns när man scrollat förbi hero, men inte vid formuläret
  var mobileCta = document.querySelector('.mobile-cta');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('offert');
  function updateCta() {
    var pastHero = hero.getBoundingClientRect().bottom < 0;
    var atContact = contact.getBoundingClientRect().top < window.innerHeight * 0.8;
    mobileCta.classList.toggle('is-visible', pastHero && !atContact);
  }
  window.addEventListener('scroll', updateCta, { passive: true });
  updateCta();

  document.getElementById('year').textContent = new Date().getFullYear();
})();

// ==========================================================
// Demobutik: "Norrsken Studio" (påhittat märke)
// ==========================================================
(function () {
  var IMG = 'https://images.unsplash.com/';
  var Q = '?auto=format&fit=crop&q=70&w=';

  var products = [
    {
      id: 'siljan', cat: 'Klockor', name: 'Siljan', price: 1299, label: 'Nyhet',
      img: 'photo-1523275335684-37898b6baf30',
      desc: 'Minimalistisk klocka med vit urtavla och safirglas. Tålig nog för vardagen, snygg nog för studenten.',
      opt: { name: 'Armband', values: ['Svart läder', 'Brunt läder', 'Stållänk'] }
    },
    {
      id: 'orsa', cat: 'Klockor', name: 'Orsa', price: 1499,
      img: 'photo-1524592094714-0f0654e20314',
      desc: 'Klassisk urtavla med tunn boett. Byt armband på tio sekunder utan verktyg.',
      opt: { name: 'Armband', values: ['Brunt läder', 'Svart läder'] }
    },
    {
      id: 'tallhed', cat: 'Klockor', name: 'Tallhed', price: 1199, label: 'Bästsäljare',
      img: 'photo-1522312346375-d1a52e2b99b3',
      desc: 'Ren design i borstat stål. Vattentät till 5 ATM, så den klarar regn och handtvätt.',
      opt: { name: 'Färg', values: ['Silver', 'Guld', 'Roséguld'] }
    },
    {
      id: 'morgon', cat: 'Smycken', name: 'Halsband Morgon', price: 449,
      img: 'photo-1599643478518-a784e5dc4c8f',
      desc: 'Tunn kedja i förgyllt stål som inte missfärgas. Justerbar längd 40–45 cm.',
      opt: { name: 'Färg', values: ['Guld', 'Silver'] }
    },
    {
      id: 'trio', cat: 'Smycken', name: 'Ringar Trio', price: 349, label: '-20%',
      img: 'photo-1515562141207-7a88fb7ce338',
      desc: 'Tre tunna ringar att stapla eller bära var för sig. Nickelfria.',
      opt: { name: 'Storlek', values: ['16', '17', '18', '19'] }
    },
    {
      id: 'droppe', cat: 'Smycken', name: 'Örhängen Droppe', price: 299,
      img: 'photo-1535632066927-ab7c9ab60908',
      desc: 'Lätta droppformade örhängen. Kommer i en liten presentask.',
      opt: { name: 'Färg', values: ['Guld', 'Silver'] }
    }
  ];

  var root = document.getElementById('shop');
  var pathEl = document.getElementById('demoPath');
  if (!root) return;

  var state = { view: 'list', filter: 'Alla', product: null, option: null, qty: 1, method: 'swish' };
  var SHIPPING = 49;

  function kr(n) { return n.toLocaleString('sv-SE') + ' kr'; }
  function img(id, w, alt) {
    return '<img src="' + IMG + id + Q + w + '" alt="' + (alt || '') + '" loading="lazy" onerror="this.remove()">';
  }
  function find(id) { return products.filter(function (p) { return p.id === id; })[0]; }

  function header() {
    return '' +
      '<div class="shop__head">' +
        '<button class="shop__brand" data-go="list">NORRSKEN</button>' +
        '<nav class="shop__menu" aria-hidden="true"><span>Klockor</span><span>Smycken</span><span>Om oss</span></nav>' +
        '<span class="shop__cart">Varukorg (' + (state.view === 'checkout' ? state.qty : 0) + ')</span>' +
      '</div>';
  }

  function viewList() {
    var cats = ['Alla', 'Klockor', 'Smycken'];
    var list = products.filter(function (p) { return state.filter === 'Alla' || p.cat === state.filter; });
    return '' +
      '<div class="shop__banner">' +
        img('photo-1508057198894-247b23fe5ade', 1400) +
        '<div><h3>Tid som håller.</h3><p>Klockor och smycken, designade i Dalarna.</p></div>' +
      '</div>' +
      '<div class="shop__section">' +
        '<div class="shop__filters" role="group" aria-label="Filtrera produkter">' +
          cats.map(function (c) {
            return '<button data-filter="' + c + '" aria-pressed="' + (state.filter === c) + '">' + c + '</button>';
          }).join('') +
        '</div>' +
        '<div class="grid">' +
          list.map(function (p, i) {
            return '<button class="card' + (i === 0 && state.filter !== 'Smycken' ? ' card--pulse' : '') + '" data-product="' + p.id + '">' +
              '<span class="card__img">' + img(p.img, 600, p.name) +
                (p.label ? '<span class="card__label">' + p.label + '</span>' : '') +
                '<span class="card__hint">Visa produkt</span>' +
              '</span>' +
              '<span class="card__name">' + p.name + '</span>' +
              '<span class="card__price">' + kr(p.price) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function viewProduct() {
    var p = state.product;
    return '' +
      '<div class="shop__section">' +
        '<button class="crumbs" data-go="list">← ' + p.cat + '</button>' +
        '<div class="product">' +
          '<div class="product__img">' + img(p.img, 1000, p.name) + '</div>' +
          '<div>' +
            '<h3>' + p.name + '</h3>' +
            '<p class="product__price">' + kr(p.price) + '</p>' +
            '<p class="product__desc">' + p.desc + '</p>' +
            '<div class="product__opt"><span>' + p.opt.name + ': ' + state.option + '</span>' +
              '<div class="chips">' + p.opt.values.map(function (v) {
                return '<button data-option="' + v + '" aria-pressed="' + (state.option === v) + '">' + v + '</button>';
              }).join('') + '</div>' +
            '</div>' +
            '<button class="buy" data-go="checkout">Köp nu – ' + kr(p.price) + '</button>' +
            '<div class="product__pay"><span class="pay pay--swish">Swish</span><span class="pay pay--card">Kort</span><span class="pay pay--klarna">Klarna</span></div>' +
            '<ul class="product__usp"><li>Skickas inom 1–2 vardagar</li><li>Fri retur i 30 dagar</li><li>2 års garanti</li></ul>' +
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
    return '<div class="method__body"><p>Betala om 30 dagar, eller dela upp i 3 räntefria delar om ' +
      kr(Math.ceil(total() / 3)) + '.</p></div>';
  }

  function total() { return state.product.price * state.qty + SHIPPING; }

  function viewCheckout() {
    var p = state.product;
    var methods = [
      { id: 'swish', label: 'Swish', badge: '<span class="pay pay--swish">Swish</span>' },
      { id: 'card', label: 'Kort', badge: '<span class="pay pay--card">Visa / Mastercard</span>' },
      { id: 'klarna', label: 'Klarna', badge: '<span class="pay pay--klarna">Klarna</span>' }
    ];
    return '' +
      '<div class="shop__section">' +
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
                  m.label + m.badge + '</label>' + (checked ? methodBody() : '');
              }).join('') +
            '</div>' +
            '<button class="buy" id="payBtn" data-go="pay">Betala ' + kr(total()) + '</button>' +
          '</div>' +
          '<aside class="checkout__summary">' +
            '<div class="line">' + '<span class="line__ph">' + img(p.img, 160, '') + '</span>' +
              '<div><strong>' + p.name + '</strong><small>' + p.opt.name + ': ' + state.option + '</small>' +
                '<span class="qty"><button data-qty="-1" aria-label="Minska antal">−</button><span>' + state.qty + '</span><button data-qty="1" aria-label="Öka antal">+</button></span>' +
              '</div>' +
            '</div>' +
            '<div class="sum"><span>Delsumma</span><span>' + kr(p.price * state.qty) + '</span></div>' +
            '<div class="sum"><span>Frakt (PostNord)</span><span>' + kr(SHIPPING) + '</span></div>' +
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
      '<div class="shop__section"><div class="done">' +
        '<div class="done__icon" aria-hidden="true">✓</div>' +
        '<h3>Tack för ditt köp!</h3>' +
        '<p>Order ' + order + ' är betald med ' + names[state.method] + '. En bekräftelse skickas till kund@exempel.se.</p>' +
        '<div class="done__box">' +
          '<p><strong>' + state.qty + ' × ' + p.name + '</strong> (' + state.option + ')</p>' +
          '<p>Totalt ' + kr(total()) + ' inkl. frakt</p>' +
        '</div>' +
        '<div class="done__pitch"><strong>Så enkelt blir det för era kunder.</strong>Ingen DM, ingen väntan. Ni får ordern direkt på mejlen och pengarna till ert konto.</div>' +
        '<div class="done__actions">' +
          '<a href="#offert" class="btn">Jag vill ha en sån här</a>' +
          '<button class="btn btn--outline" data-go="restart">Testa igen</button>' +
        '</div>' +
      '</div></div>';
  }

  var paths = { list: '', product: '/', checkout: '/kassa', done: '/tack' };

  function render(scroll) {
    var body = { list: viewList, product: viewProduct, checkout: viewCheckout, done: viewDone }[state.view]();
    root.innerHTML = header() + '<div class="shop-view">' + body + '</div>';
    pathEl.textContent = state.view === 'product' ? '/' + state.product.id : paths[state.view];
    if (scroll) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 130;
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
