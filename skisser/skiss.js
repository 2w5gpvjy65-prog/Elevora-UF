// 3D för skissen Ljusår: silverringar.
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

/* ---------- Scener ---------- */
function fitCamera(cam, w, h, needH, needW) {
  cam.aspect = w / h;
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  cam.position.z = Math.max(needH / (2 * t), needW / (2 * t * cam.aspect));
  cam.updateProjectionMatrix();
}

async function fontsReady() { try { await document.fonts.ready; } catch (e) { /* ok */ } }

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

  document.documentElement.dataset.ready = '1';
}

main();
