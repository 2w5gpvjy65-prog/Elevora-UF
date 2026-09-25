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

## Att göra innan sidan går live

- [ ] Byt `070-000 00 00` / `+46700000000` mot riktigt nummer (finns i `index.html` och `tack.html`)
- [ ] Byt `hej@elevora.se` och `@elevora.uf` mot riktig mejl och Instagram
- [ ] Lägg ett foto på er som `img/team.jpg` – det dyker upp automatiskt under "Om oss"
- [ ] Byt produktbilderna (just nu från Unsplash) mot egna eller kundens bilder
- [ ] När första kundsidan är klar: lägg den bredvid eller i stället för demobutiken
