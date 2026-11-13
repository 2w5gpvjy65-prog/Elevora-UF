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

})();
