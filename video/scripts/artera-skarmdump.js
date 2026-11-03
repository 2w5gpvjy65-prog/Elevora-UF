// Användning: kör Arteras repo lokalt (python3 -m http.server 8765 i arterauf/) och sedan
//   node artera-skarmdump.js <utmapp>
// Bitarna (part-*.png) sätts ihop till public/artera/artera-mobil.jpg, header.png blir artera-meny.jpg.
// Gör en lång "scrollremsa" av Arteras startsida i mobilstorlek, utan den fasta menyn,
// plus menyn som en egen bild. Skriver också ut var Vikas "Lägg i kundvagnen"-knapp ligger.
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; }));
  // Scrolla igenom en gång så att allt laddas
  for (let y = 0; y < 4000; y += 400) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(150); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  const header = await page.$('.header');
  const hb = await header.boundingBox();
  await header.screenshot({ path: `${out}/header.png` });
  const btn = await page.evaluateHandle(() => [...document.querySelectorAll('[data-lagg-i]')][0]);
  const card = await page.evaluateHandle(b => b.closest('article, li, .vara') || b.parentElement, btn);
  const info = await page.evaluate(([b, c]) => {
    const r = b.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { btn: { x: r.x + r.width / 2, y: r.y + window.scrollY + r.height / 2, w: r.width, h: r.height }, cardTop: cr.y + window.scrollY, cardBottom: cr.bottom + window.scrollY, name: c.innerText.split('\n')[0] };
  }, [btn, card]);
  info.header = hb;
  // Göm menyn och ta skärmbilder bit för bit
  await page.addStyleTag({ content: '.header{visibility:hidden !important}' });
  const end = Math.ceil(info.cardBottom + 120);
  const parts = [];
  for (let y = 0, i = 0; y < end; y += 852, i++) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(700);
    const real = await page.evaluate(() => window.scrollY);
    const f = `${out}/part-${i}.png`;
    await page.screenshot({ path: f });
    parts.push({ f, y: real });
  }
  info.parts = parts; info.end = end;
  fs.writeFileSync(`${out}/info.json`, JSON.stringify(info, null, 1));
  console.log(JSON.stringify({ btn: info.btn, cardTop: info.cardTop, cardBottom: info.cardBottom, name: info.name, header: hb, parts: parts.map(p => p.y) }));
  await browser.close();
})();
