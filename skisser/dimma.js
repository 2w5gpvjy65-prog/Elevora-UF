// Skissen Dimma: scenen ligger i js/dimma3d.js, som också används på startsidan.
// ?ljus=0.8 vrider ljuset (radianer), för att testa hur flaskan ser ut i olika ljus.
import { createDimma } from '../js/dimma3d.js';

const canvas = document.querySelector('.dm-canvas');
const host = canvas.parentElement;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

const scene = await createDimma(canvas, host.clientWidth, host.clientHeight, dpr);
scene.setLight(Number(new URLSearchParams(location.search).get('ljus')) || 0);
scene.render();
document.documentElement.dataset.ready = '1';
