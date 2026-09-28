// Testar scroll-effekten och menyn i WebKit (Safari-motorn) med emulerad iPhone.
import { webkit, devices } from 'playwright';
const b = await webkit.launch();
for (const name of ['iPhone 13', 'iPhone SE', 'iPhone 13 landscape']) {
  const ctx = await b.newContext({ ...devices[name] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);
  const base = await p.evaluate(() => ({
    anim: document.querySelector('.build').classList.contains('build--anim'),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    sticky: getComputedStyle(document.querySelector('.build__sticky')).position,
    trackH: document.querySelector('.build__track').offsetHeight, vh: innerHeight,
    headerTop: document.querySelector('.header').getBoundingClientRect().top,
  }));
  const info = await p.evaluate(() => { const r = document.querySelector('.build__track').getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  const rows = [];
  for (let i = 0; i <= 6; i++) {
    const y = info.top + i * (info.h - base.vh) / 6;
    await p.mouse.wheel(0, 0);
    await p.evaluate(y => window.scrollTo(0, y), y);
    await p.waitForTimeout(300);
    rows.push(await p.evaluate(() => {
      const s = document.querySelector('.build__sticky').getBoundingClientRect();
      const r = document.querySelector('.build__half--r');
      return `stickyTop=${s.top.toFixed(0)} rOpacity=${(+getComputedStyle(r).opacity).toFixed(2)} p=${document.querySelector('.build__bar').style.getPropertyValue('--p')}`;
    }));
  }
  await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(300);
  const hdr = await p.evaluate(() => document.querySelector('.header').getBoundingClientRect().top);
  console.log('=== ' + name, JSON.stringify(base), 'headerTopAfterScroll=' + hdr);
  rows.forEach(r => console.log('   ' + r));
  console.log('   errors:', JSON.stringify(errs));
  await ctx.close();
}
await b.close();
