// Skissen Dimma: scenen ligger i js/dimma3d.js, som också används på startsidan.
import { createDimma } from '../js/dimma3d.js';

const canvas = document.querySelector('.dm-canvas');
const host = canvas.parentElement;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

const scene = await createDimma(canvas, host.clientWidth, host.clientHeight, dpr);
scene.render();
document.documentElement.dataset.ready = '1';
