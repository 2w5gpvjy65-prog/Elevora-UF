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

Alla bilder är riktiga foton från [Pexels](https://www.pexels.com) och får användas fritt, även kommersiellt.

- `img/hero.jpg` – laptop på skrivbord ([foto 6177610](https://www.pexels.com/photo/6177610/)). På skärmen har vi lagt in en skärmdump av vår egen demobutik.
- `img/produkter/` – produkterna i demobutiken Norrsken, ett påhittat märke:
  - orsa.jpg – [15727970](https://www.pexels.com/photo/15727970/)
  - tallberg.jpg – [20943477](https://www.pexels.com/photo/20943477/)
  - polstjarna.jpg – [5370642](https://www.pexels.com/photo/5370642/)
  - vika.jpg – [12194265](https://www.pexels.com/photo/12194265/)
  - rattvik.jpg – [7134458](https://www.pexels.com/photo/7134458/)
  - leksand.jpg – [12194316](https://www.pexels.com/photo/12194316/)

När ni har ett riktigt kundexempel kan ni byta ut bilderna. Behåll samma filnamn eller ändra sökvägarna i `js/main.js`.

## Att göra

- [ ] Lägg ett foto på er som `img/team.jpg`. Det dyker upp automatiskt under "Om oss"
- [ ] Lägg till telefonnummer och Instagram när ni vill ha med dem
- [ ] När första kundsidan är klar: lägg den bredvid eller i stället för demobutiken
