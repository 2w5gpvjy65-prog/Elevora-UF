// Elevora UF: priser, sidhuvud och små detaljer. Inget här krävs för att sidan ska fungera.
(function () {
  'use strict';

  // Priser från js/priser.js
  var P = window.ELEVORA_PRISER || {};
  var fmt = function (n) { return Number(n).toLocaleString('sv-SE'); };
  document.querySelectorAll('[data-pris]').forEach(function (el) {
    var v = P[el.getAttribute('data-pris')];
    if (v != null) el.textContent = fmt(v);
  });

  // Årtal i sidfoten
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Sidhuvudet får bakgrund när man har skrollat
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobilen i Ljusår-kortet: skärmen skrollar genom hela butiken medan kortet skrollar förbi.
  // Med "Minska rörelse" står den still på toppen av sidan.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var screens = document.querySelectorAll('[data-scroll-screen]');
  if (!reduce && screens.length) {
    var items = Array.prototype.map.call(screens, function (img) {
      return { img: img, box: img.closest('.project__media') || img, cur: -1 };
    });
    var raf = 0;
    var tick = function () {
      raf = 0;
      var vh = window.innerHeight, again = false;
      items.forEach(function (it) {
        var r = it.box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) { it.cur = -1; return; }
        // 0 när kortet kommer in nedtill, 1 när det har lämnat upptill; skärmen skrollar mellan 20 och 80 %
        var p = (vh - r.top) / (vh + r.height);
        var t = Math.min(1, Math.max(0, (p - 0.2) / 0.6)) * 100;
        it.cur = it.cur < 0 ? t : it.cur + (t - it.cur) * 0.14;
        if (Math.abs(t - it.cur) < 0.05) it.cur = t; else again = true;
        it.img.style.objectPosition = '50% ' + it.cur.toFixed(2) + '%';
      });
      if (again) raf = requestAnimationFrame(tick);
    };
    var request = function () { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();
  }

})();
