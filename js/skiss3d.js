// Dimma-kortet under "Så kan er sida se ut": flaskan ritas i 3D, både i datorbilden och i mobilen,
// och vrider sig ett varv medan kortet skrollar förbi. Etiketten står rakt fram när kortet är mitt på skärmen.
// Skärmdumparna ligger kvar under och syns om 3D inte går, och när "Minska rörelse" är på.
const media = document.querySelector('[data-dimma]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (media && !reduceMotion && 'IntersectionObserver' in window) {
  // Börja ladda en skärmhöjd innan kortet syns
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    start().catch(() => { /* skärmdumparna står kvar */ });
  }, { rootMargin: '100% 0px' });
  io.observe(media);
}

// Ett lager per skärm: canvas för 3D och en genomskinlig bild med menyn och texten ovanpå
function layer(parent, after, ui) {
  const el = document.createElement('span');
  el.className = 'project__live';
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.src = ui;
  el.append(canvas, img);
  if (after) after.after(el); else parent.append(el);
  return { el, canvas, img };
}

async function start() {
  const { createDimma, REST } = await import('./dimma3d.js?v=33');
  const views = [
    { ...layer(media, media.querySelector('.project__shot'), 'img/skisser/dimma-ui.png'), w: 1440, h: 900 },
    { ...layer(media.querySelector('.project__phone'), null, 'img/skisser/dimma-mobil-ui.png'), w: 390, h: 844 },
  ];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Canvasen fyller ramen som en bild med object-fit: cover, så upplösningen följer den sida som täcker
  const scaleOf = (v) => Math.max(0.1, Math.max(v.el.clientWidth / v.w, v.el.clientHeight / v.h) * dpr);

  for (const v of views) {
    v.scene = await createDimma(v.canvas, v.w, v.h, scaleOf(v));
    v.width = v.el.clientWidth;
  }
  await Promise.all(views.map((v) => v.img.decode().catch(() => {})));

  // Vinkel från hur långt kortet har skrollat: 0 när det kommer in nedtill, 1 när det har lämnat upptill
  const angleNow = () => {
    const r = media.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    return REST + (p - 0.5) * Math.PI * 2;
  };

  let raf = 0, inView = true, cur = angleNow();
  function draw() {
    for (const v of views) { v.scene.setAngle(cur); v.scene.render(); }
  }
  function frame() {
    raf = 0;
    const target = angleNow();
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    draw();
    if (cur !== target) request();
  }
  function request() { if (!raf && inView) raf = requestAnimationFrame(frame); }

  draw();
  media.classList.add('is-live');

  window.addEventListener('scroll', request, { passive: true });
  // Ritas bara när kortet syns. Kommer det tillbaka efter ett hopp på sidan står flaskan direkt rätt, utan att snurra ikapp.
  new IntersectionObserver((entries) => {
    const was = inView;
    inView = entries[0].isIntersecting;
    if (inView && !was) { cur = angleNow(); draw(); }
  }).observe(media);

  // Ny storlek (vridning av mobilen, fönstret ändras): rita om i rätt upplösning
  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      let changed = false;
      for (const v of views) {
        if (v.el.clientWidth && v.el.clientWidth !== v.width) {
          v.width = v.el.clientWidth;
          v.scene.setScale(scaleOf(v));
          changed = true;
        }
      }
      if (changed) draw();
    }, 150);
  }).observe(media);
}
