// Dimma: en parfymflaska i bärnstensfärgat glas framför en jättestor rubrik som glaset bryter.
import * as THREE from '../js/vendor/three.module.min.js';
import { RoomEnvironment } from '../js/vendor/RoomEnvironment.js';

const MIST = '#e3e5e0';
const PINE = '#16241b';
const LINES = ['Skogen i', 'en flaska.'];

const canvas = document.querySelector('.dm-canvas');
const host = canvas.parentElement;

function v2(pts) { return pts.map(([x, y]) => new THREE.Vector2(x, y)); }

// Rundad profil: punkter längs en båge
function arc(out, cx, cy, r, a0, a1, n = 10) {
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
}

/* ---------- Flaskan ---------- */
const R = 0.64, BODY = 1.5, NECK = 0.17;

function glassGeo() {
  const p = [[0, 0]];
  arc(p, R - 0.07, 0.07, 0.07, -Math.PI / 2, 0, 8);          // nedre kant
  arc(p, R - 0.16, BODY - 0.16, 0.16, 0, Math.PI / 2, 14);    // axel
  p.push([NECK + 0.02, BODY], [NECK, BODY + 0.02], [NECK, BODY + 0.1], [0, BODY + 0.1]);
  return new THREE.LatheGeometry(v2(p), 128);
}

function capGeo() {
  const r = 0.37, h = 0.62, c = 0.05, p = [[0, 0]];
  arc(p, r - c, c, c, -Math.PI / 2, 0, 6);
  arc(p, r - c, h - c, c, 0, Math.PI / 2, 6);
  p.push([0, h]);
  return new THREE.LatheGeometry(v2(p), 96);
}

function labelTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(246, 244, 238, .94)';
  g.textAlign = 'center';
  g.font = '700 74px Geist, sans-serif';
  g.letterSpacing = '22px';
  g.fillText('DIMMA', 522, 210);
  g.letterSpacing = '6px';
  g.font = '500 30px "Geist Mono", monospace';
  g.fillText('NR 02  KÅDA', 515, 300);
  g.fillText('EAU DE PARFUM  50 ML', 515, 350);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function bottle() {
  const grp = new THREE.Group();
  const glass = new THREE.Mesh(glassGeo(), new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.0, metalness: 0, transmission: 1, thickness: 0.32, ior: 1.5,
    attenuationColor: new THREE.Color('#d8892c'), attenuationDistance: 0.42,
    specularIntensity: 1, envMapIntensity: 1.25, clearcoat: 1, clearcoatRoughness: 0.03, dispersion: 0.35,
  }));
  grp.add(glass);

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.003, R + 0.003, 0.52, 64, 1, true, -0.62, 1.24),
    new THREE.MeshBasicMaterial({ map: labelTexture(), transparent: true, depthWrite: false, toneMapped: false }));
  label.position.y = 0.66;
  grp.add(label);

  const brass = new THREE.MeshPhysicalMaterial({ color: 0xd8b77f, metalness: 1, roughness: 0.22, clearcoat: 0.3 });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.09, 64), brass);
  collar.position.y = BODY + 0.11;
  grp.add(collar);

  const cap = new THREE.Mesh(capGeo(), new THREE.MeshPhysicalMaterial({
    color: 0x121412, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35,
  }));
  cap.position.y = BODY + 0.155;
  grp.add(cap);
  return grp;
}
const TOTAL_H = BODY + 0.155 + 0.62;

/* ---------- Skugga och ljusfläck på golvet ---------- */
function floorTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const blob = (x, y, rx, ry, stops) => {
    g.save(); g.translate(x, y); g.scale(rx / 100, ry / 100);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 100);
    for (const [o, col] of stops) gr.addColorStop(o, col);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 100, 0, Math.PI * 2); g.fill(); g.restore();
  };
  // kontaktskugga under flaskan och en mjuk kastad skugga snett fram åt höger
  blob(600, 300, 330, 200, [[0, 'rgba(20,30,24,.20)'], [1, 'rgba(20,30,24,0)']]);
  blob(512, 256, 175, 165, [[0, 'rgba(20,30,24,.45)'], [0.55, 'rgba(20,30,24,.2)'], [1, 'rgba(20,30,24,0)']]);
  // ljuset som glaset samlar: en varm fläck i skuggan
  blob(612, 318, 150, 120, [[0, 'rgba(255,190,105,.85)'], [0.5, 'rgba(232,146,58,.4)'], [1, 'rgba(232,146,58,0)']]);
  blob(618, 322, 55, 42, [[0, 'rgba(255,238,200,.85)'], [1, 'rgba(255,222,160,0)']]);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Bakgrund med rubriken ---------- */
function layout(w, h) {
  const wide = w >= 900;
  return wide
    ? { wide, fit: 0.86, maxF: h * 0.235, bottleH: 0.6, bottleY: 0.49 }
    : { wide, fit: 0.87, maxF: h * 0.115, bottleH: 0.43, bottleY: 0.505 };
}

// Granskog i dimma: två lager trädlinje, det bakre ljusare och suddigare. Fast slumpfrö så att bilden blir likadan varje gång.
function forest(g, w, h) {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const unit = Math.min(w, h * 1.1);
  const layers = [
    { y: 0.6, hMin: 0.05, hMax: 0.13, a: 0.09, blur: 6 },
    { y: 0.68, hMin: 0.07, hMax: 0.2, a: 0.15, blur: 2.8 },
  ];
  for (const Lr of layers) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x2 = c.getContext('2d');
    x2.fillStyle = '#16241b';
    const base = h * Lr.y;
    let x = -20;
    while (x < w + 20) {
      const th = unit * (Lr.hMin + rnd() * (Lr.hMax - Lr.hMin));
      const bw = th * (0.26 + rnd() * 0.08);
      const top = base - th, n = 7;
      x2.beginPath();
      x2.moveTo(x, top);
      for (let k = 1; k <= n; k++) {
        const yk = top + (th * k) / n, wk = (bw / 2) * (k / n);
        x2.lineTo(x + wk * (1 + rnd() * 0.25), yk);
        x2.lineTo(x + wk * 0.45, yk - (th / n) * 0.15);
      }
      x2.lineTo(x + bw * 0.04, base + 2);
      x2.lineTo(x - bw * 0.04, base + 2);
      for (let k = n; k >= 1; k--) {
        const yk = top + (th * k) / n, wk = (bw / 2) * (k / n);
        x2.lineTo(x - wk * 0.45, yk - (th / n) * 0.15);
        x2.lineTo(x - wk * (1 + rnd() * 0.25), yk);
      }
      x2.closePath();
      x2.fill();
      x += bw * (0.35 + rnd() * 0.5);
    }
    x2.fillRect(0, base, w, h - base);
    g.save();
    g.globalAlpha = Lr.a;
    g.filter = 'blur(' + (Lr.blur * unit) / 900 + 'px)';
    g.drawImage(c, 0, 0, w, h);
    g.restore();
  }
  // dimma som lägger sig över marken där flaskan står
  const fog = g.createLinearGradient(0, h * 0.58, 0, h);
  fog.addColorStop(0, 'rgba(227,229,224,0)');
  fog.addColorStop(0.5, 'rgba(227,229,224,.55)');
  fog.addColorStop(1, 'rgba(227,229,224,.9)');
  g.fillStyle = fog;
  g.fillRect(0, h * 0.58, w, h * 0.42);
}

function backdropTexture(w, h, dpr, L) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  // dimmig bakgrund: lite ljusare där flaskan står
  const bg = g.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, Math.max(w, h) * 0.75);
  bg.addColorStop(0, '#eceee9'); bg.addColorStop(1, '#d9dcd6');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);

  forest(g, w, h);

  g.fillStyle = PINE;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  let f = 100;
  g.font = `800 ${f}px Geist, sans-serif`;
  g.letterSpacing = `${-0.058 * f}px`;
  const widest = Math.max(...LINES.map((s) => g.measureText(s).width));
  f = Math.min(L.maxF, (w * L.fit) / widest * 100);
  g.font = `800 ${f}px Geist, sans-serif`;
  g.letterSpacing = `${-0.058 * f}px`;
  const lh = f * 0.9;
  // dator: rubriken börjar där locket slutar, så att glaset bryter båda raderna
  // mobil: rubriken står ovanför flaskan
  const b1 = L.wide ? L.capBottom + f * 0.74 + h * 0.025 : L.bottleTop - h * 0.035 - lh;
  LINES.forEach((s, i) => g.fillText(s, w / 2 + f * (L.wide ? 0.02 : 0.03), b1 + i * lh));

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return t;
}

/* ---------- Scenen ---------- */
async function main() {
  try {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('800 100px Geist'), document.fonts.load('500 30px "Geist Mono"')]);
  } catch (e) { /* systemtypsnitt duger */ }

  const w = host.clientWidth, h = host.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const L = layout(w, h);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  pm.dispose();
  const key = new THREE.DirectionalLight(0xfff4e6, 2.2); key.position.set(-3, 5, -2); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8f0ff, 0.6); fill.position.set(3, 2, 4); scene.add(fill);

  const fov = 26;
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const dist = TOTAL_H / L.bottleH / (2 * t);
  const tilt = THREE.MathUtils.degToRad(11);
  // flaskans mitt hamnar på bottleY (andel uppifrån) av höjden
  const viewH = 2 * dist * t;
  const lookY = TOTAL_H / 2 + (L.bottleY - 0.5) * viewH;
  cam.position.set(0, lookY + Math.sin(tilt) * dist, Math.cos(tilt) * dist);
  cam.lookAt(0, lookY, 0);
  scene.add(cam);

  const toPx = (y) => { const v = new THREE.Vector3(0, y, 0); cam.updateMatrixWorld(); v.project(cam); return (1 - v.y) / 2 * h; };
  L.capBottom = toPx(BODY + 0.155);
  L.bottleTop = toPx(TOTAL_H);

  const D = 30;
  const bh = 2 * D * t, bw = bh * (w / h);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh),
    new THREE.MeshBasicMaterial({ map: backdropTexture(w, h, dpr, L), toneMapped: false, depthWrite: false }));
  back.position.z = -D;
  back.renderOrder = -1;
  cam.add(back);

  const obj = bottle();
  obj.rotation.y = -0.16;
  scene.add(obj);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2),
    new THREE.MeshBasicMaterial({ map: floorTexture(), transparent: true, depthWrite: false, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.002;
  scene.add(floor);

  renderer.render(scene, cam);
  document.documentElement.dataset.ready = '1';
}

main();
