# Elevora UF

Hemsida för vårt UF-företag Elevora. Ren HTML, CSS och JavaScript, inget byggsteg. Publiceras gratis via Netlify.

## Filer

| Fil | Vad |
|---|---|
| `index.html` | Hela startsidan: hero, demobutik, priser, så funkar det, om oss, offertformulär |
| `css/style.css` | All styling. Färger och typsnitt ligger överst under `:root` |
| `js/main.js` | Meny, mobilknappar och demobutiken (produkterna ligger i listan `products`) |
| `tack.html` | Sidan man hamnar på efter att ha skickat offertformuläret |
| `netlify.toml` | Inställningar för Netlify |

## Publicera på Netlify

1. Netlify → *Add new site* → *Import from GitHub* → välj det här repot.
2. Build command: lämna tomt. Publish directory: `.`
3. Offertformuläret använder Netlify Forms. Förfrågningar syns under *Forms* i Netlify, och där kan ni slå på mejlnotiser.
4. Koppla domänen under *Domain management*.

## Bilder

Hero-bilden kommer från [Pexels](https://www.pexels.com) och får användas fritt, även kommersiellt.

- `img/hero.jpg` – laptop på skrivbord ([foto 6177610](https://www.pexels.com/photo/6177610/)). På skärmen har vi lagt in en skärmdump av vår egen demobutik.
- `img/produkter/` – bilderna i demobutiken Norrsken, en påhittad butik med fotoprints: kvallsbris.jpg, tidlos.jpg, riggen.jpg och regnkvall.jpg. De är uppladdade av oss. Om de inte är våra egna foton behöver vi ha tillstånd att använda dem.

När ni har ett riktigt kundexempel kan ni byta ut bilderna. Behåll samma filnamn eller ändra sökvägarna i `js/main.js`.

## Att göra

- [ ] Köp en domän (t.ex. elevora.se) och koppla den i Netlify under Domain management

- [ ] Lägg ett foto på er som `img/team.jpg`. Det dyker upp automatiskt under "Om oss"
- [ ] Lägg till telefonnummer och Instagram när ni vill ha med dem
- [ ] När första kundsidan är klar: lägg den bredvid eller i stället för demobutiken
