// 3D-mobilen i heron.
// Skärmen visar Arteras riktiga webbshop (img/arbete/artera-mobil.jpg).
// När man skrollar vrider sig mobilen lite och skärmen skrollar med.
// Med "Minska rörelse" står den still. Utan WebGL 2 visas en vanlig bild i stället.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const stage = document.querySelector('[data-phone-stage]');
const canvas = stage && stage.querySelector('canvas');

const SCREEN_IMAGE = 'img/arbete/artera-mobil.jpg';

// Mått (godtyckliga enheter, ungefär som en iPhone)
const W = 1.0, H = 2.06, D = 0.105, R = 0.17, B = 0.028;
const SW = W - 0.084, SH = H - 0.084, SR = 0.122; // skärmen
const SB = 0.132; // statusraden högst upp

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktopMQ = window.matchMedia('(min-width: 960px)');

function hasWebGL2() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; }
}

const conn = navigator.connection;
const lowEnd = (conn && conn.saveData) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

if (stage && canvas) {
  if (!hasWebGL2() || lowEnd) {
    stage.classList.add('is-fallback');
  } else {
    init().catch(() => stage.classList.add('is-fallback'));
  }
}

/* ---------- Former ---------- */
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function topRoundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x, y);
  s.lineTo(x + w, y);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y);
  return s;
}

// ShapeGeometry ger UV = position; gör om till 0..1 över formens yta
function planarUV(geo, w, h) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geo;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sampleColor(img, x, y) {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const g = c.getContext('2d');
  g.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
  const d = g.getImageData(0, 0, 1, 1).data;
  return `rgb(${d[0]},${d[1]},${d[2]})`;
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Statusraden (klockan, mottagning, batteri) ritas på en canvas
function statusBarCanvas(bg) {
  const cw = 1024, ch = Math.round(cw * SB / SW);
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, cw, ch);
  const ink = '#1b1814';
  const cy = ch * 0.56;
  const fs = Math.round(cw * 0.044);
  g.fillStyle = ink;
  g.font = `600 ${fs}px Geist, system-ui, sans-serif`;
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText('9:41', cw * 0.165, cy + 2);

  // mottagning
  const bw = cw * 0.0085, gap = cw * 0.005;
  let x = cw * 0.705;
  for (let i = 0; i < 4; i++) {
    const h = fs * (0.32 + i * 0.13);
    rr(g, x, cy + fs * 0.36 - h, bw, h, bw * 0.4);
    g.fill();
    x += bw + gap;
  }
  // wifi
  const wx = cw * 0.79, wy = cy + fs * 0.34;
  g.lineCap = 'round';
  g.strokeStyle = ink;
  for (let i = 0; i < 3; i++) {
    g.lineWidth = cw * 0.0065;
    g.beginPath();
    g.arc(wx, wy, fs * (0.22 + i * 0.22), -Math.PI * 0.75, -Math.PI * 0.25);
    g.stroke();
  }
  // batteri
  const bx = cw * 0.835, bh = fs * 0.62, bwid = cw * 0.058;
  g.globalAlpha = 0.4;
  g.lineWidth = cw * 0.0028;
  rr(g, bx, cy - bh / 2, bwid, bh, bh * 0.32);
  g.stroke();
  rr(g, bx + bwid + cw * 0.003, cy - bh * 0.18, cw * 0.004, bh * 0.36, cw * 0.002);
  g.fill();
  g.globalAlpha = 1;
  rr(g, bx + cw * 0.004, cy - bh / 2 + cw * 0.004, bwid * 0.78, bh - cw * 0.008, bh * 0.22);
  g.fill();
  return c;
}

async function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentRotation.set(0, -0.5, 0);
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  const phone = new THREE.Group();
  scene.add(phone);

  /* Material */
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x2c2d30, metalness: 1, roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.18,
  });
  const backMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0b, metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06,
  });

  /* Kropp: rundad låda med fasad metallkant */
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(W - 2 * B, H - 2 * B, R - B), {
    depth: D - 2 * B, bevelEnabled: true, bevelThickness: B, bevelSize: B,
    bevelSegments: 10, curveSegments: 48,
  });
  bodyGeo.translate(0, 0, -(D - 2 * B) / 2);
  phone.add(new THREE.Mesh(bodyGeo, [backMat, frameMat]));

  /* Knappar på sidorna */
  const btn = (len, x, y) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, len, 4, 12), frameMat);
    m.scale.set(0.6, 1, 1);
    m.position.set(x, y, 0);
    phone.add(m);
  };
  btn(0.06, -W / 2 - 0.002, 0.64);
  btn(0.12, -W / 2 - 0.002, 0.44);
  btn(0.12, -W / 2 - 0.002, 0.25);
  btn(0.2, W / 2 + 0.002, 0.4);

  /* Skärmen */
  const img = await loadImage(SCREEN_IMAGE);
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  const repeatY = Math.min(1, (img.naturalWidth / (SW / SH)) / img.naturalHeight);
  tex.repeat.set(1, repeatY);
  const sbFrac = SB / SH;
  const offTop = 1 - (1 - sbFrac) * repeatY; // sidans topp precis under statusraden
  const scrollRange = Math.max(0, offTop) * 0.62; // hur långt skärmen hinner skrolla
  tex.offset.set(0, offTop);

  const z0 = D / 2;
  const screen = new THREE.Mesh(
    planarUV(new THREE.ShapeGeometry(roundedRect(SW, SH, SR), 32), SW, SH),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
  );
  screen.position.z = z0 + 0.0008;
  phone.add(screen);

  try { await document.fonts.load('600 40px Geist'); } catch (e) { /* systemtypsnitt duger */ }
  const sbTex = new THREE.CanvasTexture(statusBarCanvas(sampleColor(img, 12, 12)));
  sbTex.colorSpace = THREE.SRGBColorSpace;
  sbTex.anisotropy = tex.anisotropy;
  const statusBar = new THREE.Mesh(
    planarUV(new THREE.ShapeGeometry(topRoundedRect(SW, SB, SR), 24), SW, SB),
    new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false })
  );
  statusBar.position.set(0, SH / 2 - SB / 2, z0 + 0.0012);
  phone.add(statusBar);

  const island = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(0.29, 0.086, 0.043), 16),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  island.position.set(0, SH / 2 - 0.066, z0 + 0.0016);
  phone.add(island);

  const homeBar = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(0.3, 0.011, 0.0055), 8),
    new THREE.MeshBasicMaterial({ color: 0x1c1a17, toneMapped: false })
  );
  homeBar.position.set(0, -SH / 2 + 0.03, z0 + 0.0016);
  phone.add(homeBar);

  /* Glaset: bara speglingar läggs ovanpå skärmen */
  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(W - 2 * B, H - 2 * B, R - B), 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x000000, roughness: 0.05, metalness: 0, envMapIntensity: 1.4,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  glass.position.z = z0 + 0.0024;
  phone.add(glass);

  /* Mjuk skugga under mobilen */
  const sc = document.createElement('canvas');
  sc.width = 256; sc.height = 64;
  const sg = sc.getContext('2d');
  const grad = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(45,32,20,0.4)');
  grad.addColorStop(0.4, 'rgba(45,32,20,0.15)');
  grad.addColorStop(1, 'rgba(45,32,20,0)');
  sg.fillStyle = grad;
  sg.save(); sg.scale(1, 0.25); sg.fillRect(0, 0, 256, 256); sg.restore();
  const shadowTex = new THREE.CanvasTexture(sc);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.48),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false })
  );
  shadow.position.set(0.04, -H / 2 - 0.2, -0.6);
  scene.add(shadow);

  /* Storlek */
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dH = (H * (desktopMQ.matches ? 1.38 : 1.24)) / (2 * t);
    const dW = (W * 1.95) / (2 * t * camera.aspect);
    camera.position.z = Math.max(dH, dW);
    camera.updateProjectionMatrix();
  }
  fit();

  /* Läge: p = skrollning 0..1, intro 0..1, px/py = muspekaren */
  const target = { p: 0, px: 0, py: 0 };
  const cur = { p: 0, px: 0, py: 0 };
  const state = { intro: reduceMotion ? 1 : 0 };
  const lerp = (a, b, t) => a + (b - a) * t;

  if (reduceMotion) { target.p = cur.p = 0.18; }

  function apply() {
    const p = cur.p, i = state.intro;
    const e = 1 - i;
    phone.rotation.set(
      lerp(0.07, -0.05, p) + cur.py * 0.05,
      lerp(-0.44, 0.3, p) + cur.px * 0.08 - e * 1.15,
      lerp(0.05, -0.03, p)
    );
    phone.position.y = lerp(0.02, 0.2, p) - e * 0.4;
    phone.scale.setScalar(0.94 + 0.06 * i);
    tex.offset.y = offTop - (reduceMotion ? 0 : Math.min(1, p * 1.15) * scrollRange);
    shadow.material.opacity = (0.75 + 0.25 * (1 - p)) * i;
    shadow.scale.set(1 - p * 0.1, 1, 1);
  }

  /* Ritas bara när något ändras och mobilen syns */
  let raf = 0, inView = true;
  function frame() {
    raf = 0;
    cur.p = lerp(cur.p, target.p, 0.14);
    cur.px = lerp(cur.px, target.px, 0.07);
    cur.py = lerp(cur.py, target.py, 0.07);
    apply();
    renderer.render(scene, camera);
    const moving =
      Math.abs(target.p - cur.p) > 0.0004 ||
      Math.abs(target.px - cur.px) > 0.0008 ||
      Math.abs(target.py - cur.py) > 0.0008;
    if (moving) request();
  }
  function request() { if (!raf && inView) raf = requestAnimationFrame(frame); }

  new ResizeObserver(() => { fit(); request(); }).observe(stage);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) request();
  }).observe(stage);

  // Första bilden, sedan tonas den in
  apply();
  renderer.render(scene, camera);
  stage.classList.add('is-ready');

  if (reduceMotion) return;

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;

  // Intro: mobilen vrider in sig en gång
  if (gsap) {
    gsap.to(state, { intro: 1, duration: 2, ease: 'expo.out', delay: 0.15, onUpdate: request });
  } else {
    state.intro = 1;
    request();
  }

  // Skroll: mobilen följer med lugnt (ingen låsning av sidan)
  if (gsap && ST) {
    gsap.registerPlugin(ST);
    ST.create({
      trigger: stage,
      start: () => (desktopMQ.matches ? 'top top' : 'top 50%'),
      end: 'bottom top',
      invalidateOnRefresh: true,
      onUpdate: (self) => { target.p = self.progress; request(); },
    });
  } else {
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = desktopMQ.matches ? 0 : vh * 0.5;
      const total = desktopMQ.matches ? r.height : r.height + vh * 0.5;
      target.p = Math.min(1, Math.max(0, (start - r.top) / total));
      request();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Muspekaren: en liten lutning på dator
  if (finePointer) {
    window.addEventListener('pointermove', (e) => {
      if (!inView) return;
      target.px = (e.clientX / window.innerWidth - 0.5) * 2;
      target.py = (e.clientY / window.innerHeight - 0.5) * 2;
      request();
    }, { passive: true });
  }
}
