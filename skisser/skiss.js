// 3D för skisserna: silverringar (Ljusår) och en klocka (Tidvatten).
import * as THREE from '../js/vendor/three.module.min.js';
import { RoomEnvironment } from '../js/vendor/RoomEnvironment.js';

/* ---------- Gemensamt ---------- */
function renderer(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.setSize(w, h, false);
  r.setClearColor(0x000000, 0);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  return r;
}

// Mörk fotostudio: svart rum med några ljusa paneler, ger skarpa speglingar i silver
function studioEnv(r) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x030304);
  const panel = (w, h, pos, rot, v) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); s.add(m);
  };
  panel(7, 1.4, [0, 5, 0.5], [Math.PI / 2, 0, 0], 4);
  panel(1.1, 7, [-5, 0.5, 1.5], [0, Math.PI / 2, 0], 6);
  panel(0.6, 7, [5, 0, -1], [0, -Math.PI / 2, 0], 3);
  panel(4, 2.5, [0, 0.5, 6], [0, Math.PI, 0], 1.1);
  panel(9, 0.35, [0, -2.6, -4], [0, 0, 0], 2.2);
  const pm = new THREE.PMREMGenerator(r);
  const env = pm.fromScene(s, 0.015).texture;
  pm.dispose();
  return env;
}

function roomEnv(r) {
  const pm = new THREE.PMREMGenerator(r);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  return env;
}

function roundedRect(w, h, rad) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + rad, y); s.lineTo(x + w - rad, y);
  s.absarc(x + w - rad, y + rad, rad, -Math.PI / 2, 0, false); s.lineTo(x + w, y + h - rad);
  s.absarc(x + w - rad, y + h - rad, rad, 0, Math.PI / 2, false); s.lineTo(x + rad, y + h);
  s.absarc(x + rad, y + h - rad, rad, Math.PI / 2, Math.PI, false); s.lineTo(x, y + rad);
  s.absarc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5, false);
  return s;
}

function roundedBox(w, h, d, rad, bevel) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - 2 * bevel, h - 2 * bevel, rad), {
    depth: d - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 16,
  });
  g.translate(0, 0, -(d - 2 * bevel) / 2);
  return g;
}

/* ---------- Ringar ---------- */
const silver = () => new THREE.MeshPhysicalMaterial({ color: 0xeceef2, metalness: 1, roughness: 0.1, clearcoat: 0.4, clearcoatRoughness: 0.05 });
const gold = () => new THREE.MeshPhysicalMaterial({ color: 0xe9c88f, metalness: 1, roughness: 0.14, clearcoat: 0.3 });

// Ringskena: en rundad rektangel som svarvas runt Y-axeln
function bandGeo(R, thick, width) {
  const pts = [], r = Math.min(thick, width) * 0.46, ht = thick / 2, hw = width / 2;
  const corners = [[R + ht - r, hw - r, 0], [R - ht + r, hw - r, Math.PI / 2], [R - ht + r, -hw + r, Math.PI], [R + ht - r, -hw + r, Math.PI * 1.5]];
  for (const [cx, cy, a0] of corners) for (let i = 0; i <= 10; i++) {
    const a = a0 + (i / 10) * (Math.PI / 2);
    pts.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  pts.push(pts[0].clone());
  return new THREE.LatheGeometry(pts.reverse(), 160);
}

class Helix extends THREE.Curve {
  constructor(R, a, q, ph) { super(); this.R = R; this.a = a; this.q = q; this.ph = ph; }
  getPoint(t, out = new THREE.Vector3()) {
    const u = t * Math.PI * 2, w = this.q * u + this.ph, rr = this.R + this.a * Math.cos(w);
    return out.set(rr * Math.cos(u), this.a * Math.sin(w), rr * Math.sin(u));
  }
}

function gemGeo() {
  const p = [[0, -0.36], [0.3, -0.02], [0.3, 0.02], [0.2, 0.17], [0.001, 0.17]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(p, 16);
  return g.toNonIndexed();
}

function ring(kind, gemEnv) {
  const grp = new THREE.Group();
  const metal = kind.includes('gold') ? gold() : silver();
  const band = new THREE.Group();
  if (kind.startsWith('orbit')) {
    band.add(new THREE.Mesh(bandGeo(1, 0.13, 0.2), metal));
  } else if (kind.startsWith('twist')) {
    for (const ph of [0, Math.PI]) band.add(new THREE.Mesh(new THREE.TubeGeometry(new Helix(1, 0.055, 16, ph), 900, 0.058, 14, true), metal));
  } else if (kind.startsWith('dune')) {
    band.add(new THREE.Mesh(bandGeo(1, 0.15, 0.5), metal));
  } else {
    for (const y of [-0.075, 0.075]) { const m = new THREE.Mesh(bandGeo(1, 0.08, 0.1), metal); m.position.y = y; band.add(m); }
  }
  band.rotation.x = Math.PI / 2; // ringen står upp, öppningen mot kameran
  grp.add(band);

  if (kind.startsWith('orbit')) {
    const head = new THREE.Group();
    head.position.y = 1.2;
    const gem = new THREE.Mesh(gemGeo(), new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 1, roughness: 0, flatShading: true, envMap: gemEnv, envMapIntensity: 1.6,
      iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 900],
    }));
    gem.position.y = 0.2; gem.scale.setScalar(0.95);
    head.add(gem);
    const basket = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 12, 48), metal);
    basket.rotation.x = Math.PI / 2; basket.position.y = 0.16;
    head.add(basket);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const prong = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.34, 4, 10), metal);
      prong.position.set(Math.cos(a) * 0.27, 0.1, Math.sin(a) * 0.27);
      prong.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18);
      head.add(prong);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.2, 32), metal);
    stem.position.y = -0.04;
    head.add(stem);
    grp.add(head);
  }
  return grp;
}

/* ---------- Klocka ---------- */
function dialTexture(base) {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'), cx = 512;
  const grad = g.createRadialGradient(cx, cx * 0.85, 20, cx, cx, 520);
  grad.addColorStop(0, base[0]); grad.addColorStop(1, base[1]);
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 1024);
  // solstrålar
  g.globalAlpha = 0.05;
  for (let i = 0; i < 360; i++) {
    g.strokeStyle = i % 2 ? '#ffffff' : '#000000';
    g.beginPath(); g.moveTo(cx, cx);
    const a = (i / 360) * Math.PI * 2;
    g.lineTo(cx + Math.cos(a) * 520, cx + Math.sin(a) * 520); g.stroke();
  }
  g.globalAlpha = 1;
  // minutskala
  g.strokeStyle = 'rgba(255,255,255,.75)';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r1 = 490, r2 = i % 5 ? 470 : 462;
    g.lineWidth = i % 5 ? 2 : 4;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1); g.lineTo(cx + Math.cos(a) * r2, cx + Math.sin(a) * r2); g.stroke();
  }
  // index
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(cx + Math.cos(a) * 395, cx + Math.sin(a) * 395); g.rotate(a + Math.PI / 2);
    const w = i === 0 ? 34 : 20, h = i === 0 ? 92 : 78;
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8; g.shadowOffsetY = 3;
    g.fillStyle = '#f3f1ec';
    if (i === 0) { g.fillRect(-w / 2 - 12, -h / 2, w - 8, h); g.fillRect(w / 2 - 14, -h / 2, w - 8, h); }
    else g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.textAlign = 'center';
  g.font = '600 40px Geist, sans-serif';
  g.fillText('T I D V A T T E N', cx, 345);
  g.fillStyle = 'rgba(255,255,255,.6)';
  g.font = '500 24px "Geist Mono", monospace';
  g.fillText('AUTOMATIC · 100 M', cx, 700);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Dykarring: mörk keram med minutskala, siffror och en triangel vid 12
function bezelTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'), cx = 512, ro = 512, ri = 512 * 0.858 / 0.958, mid = (ro + ri) / 2;
  g.fillStyle = '#121a29';
  g.beginPath(); g.arc(cx, cx, ro, 0, Math.PI * 2); g.arc(cx, cx, ri, 0, Math.PI * 2, true); g.fill();
  g.fillStyle = '#dfe3e8'; g.strokeStyle = '#dfe3e8';
  const at = (a, r) => [cx + Math.sin(a) * r, cx - Math.cos(a) * r];
  for (let m = 0; m < 60; m++) {
    const a = m / 60 * Math.PI * 2;
    if (m === 0) {
      g.save(); g.translate(...at(0, mid)); g.beginPath(); g.moveTo(-15, -11); g.lineTo(15, -11); g.lineTo(0, 15); g.closePath(); g.fill(); g.restore();
    } else if (m % 10 === 0) {
      g.save(); g.translate(...at(a, mid)); g.rotate(a > Math.PI / 2 && a < Math.PI * 1.5 ? a + Math.PI : a);
      g.font = '600 30px Geist, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(m), 0, 1); g.restore();
    } else if (m < 15 || m % 5 === 0) {
      const [x1, y1] = at(a, mid - 9), [x2, y2] = at(a, mid + 9);
      g.lineWidth = m % 5 === 0 ? 5 : 2.5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function watch(dial) {
  const grp = new THREE.Group();
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xd6d9dd, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.1 });
  const brushed = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd0, metalness: 1, roughness: 0.38 });
  const prof = [[0.001, -0.14], [0.84, -0.14], [0.94, -0.12], [1.0, -0.06], [1.015, 0.02], [1.0, 0.09], [0.978, 0.124], [0.962, 0.132], [0.85, 0.132], [0.842, 0.1], [0.001, 0.1]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), steel);
  body.rotation.x = Math.PI / 2;
  grp.add(body);

  const dialMesh = new THREE.Mesh(new THREE.CircleGeometry(0.84, 128),
    new THREE.MeshPhysicalMaterial({ map: dialTexture(dial), metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }));
  dialMesh.position.z = 0.101;
  grp.add(dialMesh);

  const bezel = new THREE.Mesh(new THREE.RingGeometry(0.858, 0.958, 160, 1),
    new THREE.MeshPhysicalMaterial({ map: bezelTexture(), metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 }));
  bezel.position.z = 0.1335;
  grp.add(bezel);

  const handMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f1ed, metalness: 0.6, roughness: 0.25, clearcoat: 1 });
  const hand = (w, len, back, z, ang, mat) => {
    const geo = roundedBox(w, len + back, 0.012, w * 0.45, 0.003);
    geo.translate(0, (len - back) / 2, 0);
    const m = new THREE.Mesh(geo, mat); m.position.z = z; m.rotation.z = -ang; grp.add(m);
  };
  hand(0.07, 0.44, 0.08, 0.115, (10 + 10 / 60) / 12 * Math.PI * 2, handMat);
  hand(0.05, 0.68, 0.1, 0.13, 10 / 60 * Math.PI * 2, handMat);
  hand(0.014, 0.74, 0.18, 0.145, 35 / 60 * Math.PI * 2, new THREE.MeshStandardMaterial({ color: 0xe0592f, roughness: 0.4 }));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 32), steel);
  cap.rotation.x = Math.PI / 2; cap.position.z = 0.15; grp.add(cap);

  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.85, 96), new THREE.MeshPhysicalMaterial({
    color: 0x000000, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glass.position.z = 0.16; grp.add(glass);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.13, 40), brushed);
  crown.rotation.z = Math.PI / 2; crown.position.x = 1.07; grp.add(crown);
  const crownCap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.03, 40), steel);
  crownCap.rotation.z = Math.PI / 2; crownCap.position.x = 1.15; grp.add(crownCap);

  for (const sy of [1, -1]) for (const sx of [1, -1]) {
    const lug = new THREE.Mesh(roundedBox(0.15, 0.42, 0.16, 0.05, 0.03), brushed);
    lug.position.set(sx * 0.5, sy * 0.92, -0.04); lug.rotation.x = sy * 0.12; grp.add(lug);
  }
  const strapMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1f25, roughness: 0.58, clearcoat: 0.15, clearcoatRoughness: 0.5, sheen: 0.5, sheenRoughness: 0.5, sheenColor: 0x6b7480 });
  for (const rot of [0, Math.PI]) {
    const s = new THREE.Mesh(strapGeo(0.8, 0.09, 0.5, 0.85, 2.85), strapMat);
    s.position.y = 0; s.rotation.z = rot; grp.add(s);
  }
  return grp;
}

// Armband: tvärsnitt (rundad rektangel) som följer en kurva som går rakt ut och sedan böjer sig bakåt
function strapGeo(w, t, L0, Rb, len) {
  const sec = [], r = t * 0.45, hw = w / 2, ht = t / 2;
  const cs = [[hw - r, ht - r, 0], [-hw + r, ht - r, Math.PI / 2], [-hw + r, -ht + r, Math.PI], [hw - r, -ht + r, Math.PI * 1.5]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * Math.PI / 2; sec.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  const N = 90, M = sec.length, y0 = 0.86, pos = [], idx = [];
  for (let j = 0; j <= N; j++) {
    const s = (j / N) * len;
    let py, pz, ny, nz;
    if (s <= L0) { py = y0 + s; pz = -0.06; ny = 0; nz = 1; }
    else { const th = (s - L0) / Rb; py = y0 + L0 + Rb * Math.sin(th); pz = -0.06 - Rb * (1 - Math.cos(th)); ny = Math.sin(th); nz = Math.cos(th); }
    for (const [x, y] of sec) pos.push(x, py + ny * y, pz + nz * y);
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < M; i++) {
    const a = j * M + i, b = j * M + (i + 1) % M, c2 = (j + 1) * M + i, d = (j + 1) * M + (i + 1) % M;
    idx.push(a, c2, b, b, c2, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* ---------- Scener ---------- */
function shadowPlane(color, opacity, w, h) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, `rgba(${color},${opacity})`); grad.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
}

function fitCamera(cam, w, h, needH, needW) {
  cam.aspect = w / h;
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  cam.position.z = Math.max(needH / (2 * t), needW / (2 * t * cam.aspect));
  cam.updateProjectionMatrix();
}

async function fontsReady() { try { await document.fonts.ready; await document.fonts.load('600 40px Geist'); await document.fonts.load('500 24px "Geist Mono"'); } catch (e) { /* ok */ } }

async function main() {
  await fontsReady();
  const wide = window.innerWidth >= 900;

  // Ljusår: hero-ring
  const ringCanvas = document.querySelector('canvas[data-scene="ring"]');
  if (ringCanvas) {
    const box = ringCanvas.parentElement.getBoundingClientRect();
    const r = renderer(ringCanvas, box.width, box.height);
    const scene = new THREE.Scene();
    scene.environment = studioEnv(r);
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-2, 3, 4); scene.add(key);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
    const obj = ring('orbit', roomEnv(r));
    obj.rotation.set(0.32, -0.62, 0.1);
    obj.position.y = -0.12;
    scene.add(obj);
    fitCamera(cam, box.width, box.height, wide ? 3.9 : 3.5, 3.2);
    r.render(scene, cam);
  }

  // Ljusår: produktbilder
  const imgs = document.querySelectorAll('img[data-render]');
  if (imgs.length) {
    const c = document.createElement('canvas');
    const r = renderer(c, 700, 700);
    r.setPixelRatio(1);
    const env = studioEnv(r), gemEnv = roomEnv(r);
    for (const img of imgs) {
      const kind = img.dataset.render;
      const scene = new THREE.Scene(); scene.environment = env;
      const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-2, 3, 4); scene.add(key);
      const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
      const obj = ring(kind, gemEnv);
      const big = kind.endsWith('big');
      obj.rotation.set(big ? 0.3 : 0.42, big ? -0.7 : -0.55, big ? 0.1 : 0.12);
      obj.position.y = kind.startsWith('orbit') ? -0.18 : 0;
      scene.add(obj);
      fitCamera(cam, 700, 700, kind.startsWith('orbit') ? 3.5 : 3.0, 3.0);
      r.render(scene, cam);
      img.src = c.toDataURL('image/png');
    }
  }

  // Tidvatten: klockan
  const watchCanvas = document.querySelector('canvas[data-scene="watch"]');
  if (watchCanvas) {
    const box = watchCanvas.parentElement.getBoundingClientRect();
    const r = renderer(watchCanvas, box.width, box.height);
    r.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    scene.environment = roomEnv(r);
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 5); scene.add(key);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
    const obj = watch(['#3b67a8', '#0f203d']);
    obj.rotation.set(-0.3, 0.52, 0.16);
    scene.add(obj);
    const sh = shadowPlane('40,48,60', 0.22, 3.2, 3.2); sh.position.set(0.2, -0.15, -1.4); scene.add(sh);
    fitCamera(cam, box.width, box.height, wide ? 4.8 : 4.9, 3.1);
    r.render(scene, cam);
  }
  document.documentElement.dataset.ready = '1';
}

main();
