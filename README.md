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

- `img/hero.jpg` – stora bilden högst upp
- `img/produkter/*.jpg` – produkterna i demobutiken (Norrsken är ett påhittat märke)

Bilderna är 3D-renderade studiobilder som vi har gjort själva, så de är fria att använda. När ni har ett riktigt kundexempel kan ni byta ut dem. Behåll samma filnamn eller ändra sökvägarna i `js/main.js`.

## Att göra

- [ ] Lägg ett foto på er som `img/team.jpg`. Det dyker upp automatiskt under "Om oss"
- [ ] Lägg till telefonnummer och Instagram när ni vill ha med dem
- [ ] När första kundsidan är klar: lägg den bredvid eller i stället för demobutiken
