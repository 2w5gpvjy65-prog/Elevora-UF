# Elevora UF

Hemsida för vårt UF-företag Elevora. Ren HTML, CSS och JavaScript, inget byggsteg. Publiceras på Cloudflare Workers (statiska filer) när `main` uppdateras.

## Filer

| Fil | Vad |
|---|---|
| `index.html` | Hela startsidan: hero med 3D-mobil, DM eller egen sida, skisser, priser, ni äger allt, så går det till, om oss, frågor, gratis skiss |
| `js/priser.js` | **Alla priser.** Ändra siffrorna här så byts de överallt på sidan |
| `css/style.css` | All styling. Färger och typsnitt ligger överst under `:root` |
| `js/hero3d.js` | 3D-mobilen i heron (three.js). Skärmen visar `img/skisser/ljusar-mobil.jpg` |
| `js/main.js` | Fyller i priser, ger sidhuvudet bakgrund vid skroll, sätter årtal |
| `js/vendor/` | three.js 0.170.0 och GSAP 3.13.0 (egna kopior, inga externa CDN) |
| `fonts/` | Geist och Source Serif 4 (egna kopior, inget Google Fonts) |
| `tack.html`, `404.html` | Tack-sidan efter formuläret och sidan som visas när en länk inte finns |
| `_headers` | Säkerhetsrubriker (CSP) och cache. Nya externa adresser måste läggas till här |

## Publicera

Cloudflare publicerar automatiskt när `main` uppdateras (`wrangler.jsonc`, statiska filer). Domänen elevorauf.se ligger hos Loopia med Cloudflares namnservrar.

Offertformuläret skickas via [Web3Forms](https://web3forms.com). Nyckeln (`access_key`) står i `index.html` och är publik med flit.

## Bilder

- `img/skisser/`: skärmdumpar av två påhittade märken: Ljusår (smyckesbutik, hela sidan) och Dimma (parfym, bara första skärmen). Källsidorna ligger i `skisser/` och publiceras inte (`.assetsignore`). Starta en lokal server i mappen, öppna `skisser/ljusar.html` eller `skisser/dimma.html` och ta nya skärmdumpar om något ändras.
- `img/og.jpg`: bilden som visas när länken delas.
- De gamla bilderna (`hero.jpg`, `bygge.jpg`, `produkter/`) används inte längre men ligger kvar.

## Att göra

- [ ] Lägg ett foto på er som `img/team.jpg` och klistra in raden som står i kommentaren under "Om oss" i `index.html`
- [ ] Lägg till Instagram när användarnamnet är bestämt
- [ ] Visa en riktig kundsida bredvid skisserna när en kund har sagt ja till det
