# Elevora UF – minne för Claude

Läs detta först i varje session. Det sammanfattar vad Elevora är, hur vi jobbar och vad som redan är bestämt.

## Om Elevora UF
- UF-företag (Ung Företagsamhet) med **tre killar** som går gymnasiet i **Mora, Dalarna**. Jobbar på distans i hela Sverige och svarar efter skoldagen.
- Bygger **hemsidor och webbshoppar** åt **UF-företag och små varumärken**, främst sådana som säljer smycken, klockor, kläder och accessoarer via Instagram/TikTok med "länk i bion" och beställningar i DM eller på Plick.
- Använder AI (Claude) i arbetet, men granskar allt själva. Därför går leveransen på 1–2 veckor i stället för en månad, till priser små kunder har råd med.
- **Huvudbudskap:** "Sluta sälja i DM och på Plick – skaffa er egen sida." Kunden ska kunna sälja direkt från sin egen sida med Swish, kort och Klarna.
- Kontakt: **elevora.uf@gmail.com** (inget telefonnummer på sidan för tillfället). Domän: **elevorauf.se**.

## Priser
| Tjänst | UF-pris | Ordinarie |
|---|---|---|
| Webbshop | 1 200 kr | från 2 000 kr |
| Hemsida, en sida | 600 kr | 1 200 kr |
| Google-profil | 400 kr | – |
| Löpande uppdateringar | 200 kr/mån | – |

- Kunden äger domänen själv (cirka 200 kr/år). Betaltjänsten tar egen avgift per köp.
- Vid snabb affär får priset diskuteras ("ni skulle bli en av våra första kunder"). Bestäm lägsta pris innan förhandling.
- Säg "inga månadsavgifter till oss, bara en liten avgift per köp till betaltjänsten", aldrig "gratis att ta betalt".

## Arbetsgång med kunder
1. Kort gratissamtal (cirka 15 min) om vad de säljer och vilken stil de vill ha.
2. Skriftlig offert med fast pris, samma vecka.
3. Första förslaget inom en vecka. Ändringar tills kunden är nöjd.
4. Publicering: koppla domän och betaltjänst, gör ett testköp tillsammans med kunden.

**Säljprospektering via Instagram-DM:** kort och personligt. Berömm varumärket och stilen (inte "vi älskar era damklockor", vi är killar). Nämn Swish/kort/Klarna, 1–2 veckor och UF-pris. Erbjud en **gratis skiss** av deras startsida (starkaste kroken). Länka elevorauf.se. Påminn efter 3–4 dagar om de inte svarar. Första målkund som diskuterats: sohocollections.uf (vintage-damklockor, "curated in London").

## Ägarskap och säkerhet (kundprojekt)
- **Kunden äger allt** på sina egna konton och med sitt eget mejl: domän (t.ex. Loopia), GitHub-repo, Cloudflare, Stripe och Web3Forms. Elevora bjuds in som collaborator/member. Inga konton i Elevoras namn, inga delade lösenord.
- Under bygget ligger koden i ett privat repo hos Elevora med förhandsvisning på workers.dev. Vid leverans: **Transfer ownership** av repot till kunden, som bjuder in Elevora om de köper löpande uppdateringar. Slutar de fortsätter sidan fungera.
- Betalning: **Stripe** (kort, Klarna och Swish, ingen månadsavgift) via **Payment Links / Stripe Checkout**. Ingen server och inga hemliga nycklar i koden, kortuppgifter når aldrig sidan. Stripe-konto i kundens namn (kolla med UF-rådgivaren vem som står för det).
- Tvåstegsverifiering på alla konton, privata repon, säkerhetsrubriker i `_headers`.
- Skriv i offerten: kunden äger domän, kod och konton, Elevora får visa sidan som referens.

## Teknik för elevorauf.se
- Ren statisk HTML/CSS/JS, inget byggsteg: `index.html`, `css/style.css`, `js/main.js`, `tack.html`, `404.html`, `img/`.
- **Hosting: Cloudflare Workers** med statiska filer (`wrangler.jsonc`, `.assetsignore`, `_headers`). Domänen elevorauf.se ligger hos Loopia med Cloudflares namnservrar (adrian/mario.ns.cloudflare.com). Flyttade från Netlify eftersom gratiskrediterna tog slut och Netlify visade en "Powered by Netlify"-badge. `netlify.toml` finns kvar men används inte.
- Cloudflare publicerar automatiskt när `main` uppdateras.
- **Offertformuläret** går via **Web3Forms** till elevora.uf@gmail.com och skickar sedan vidare till `/tack.html`. Access-nyckeln står i `index.html` och är publik per design.
- Höj `?v=N` på style.css/main.js i alla HTML-filer vid ändringar, så att cachade versioner inte visas.
- Utvecklingsgren: `claude/elevora-uf-business-jy1hwa`. Användaren mergar själv via
  https://github.com/2w5gpvjy65-prog/Elevora-UF/compare/main...claude/elevora-uf-business-jy1hwa
  (Create pull request ×2 → Merge pull request → Confirm merge).

## Design (bestämt efter många iterationer)
- Varm beige/off-white bakgrund (`--bg: #f2ede6`), inte för vit. Svart text och knappar. **Mörk marinblå** accent (`#1b2a40`, `--navy: #18212d`) används sparsamt. Inget lila, rosa eller orange.
- Typsnitt: Geist (brödtext/rubriker), Source Serif 4 för ett blått accentord per rubrik (inte kursiv), Newsreader bara i demobutiken.
- Egen logga: ett "e" i penseldragsstil med svans och prick (`img/logo.svg`, `logo-ljus.svg`, `favicon.svg`). Stor ljus logga bredvid offertformuläret.
- Ordning: Hero (laptop-foto som visar demobutiken + kort "Er webbshop") → 01 Vad vi gör → Scroll-effekt "Från idé till färdig sida" (två halvor som sätts ihop, sticky, fungerar även med "Minska rörelse") → 02 Demobutik → DM vs egen butik → Er sida, er stil (mörkblått avsnitt) → 03 Priser → 04 Så funkar det → 05 Om oss → Offert.
- **Demobutiken "Norrsken"** säljer påhittade **fotoprints** (Kvällsbris, Tidlös, Riggen, Regnkväll) med bilder användaren laddat upp. Tydligt märkt som DEMO: OBS-notis, "Genomför demoköp", "Ej betald". Inget går att köpa. Demofönstret är mörkare beige än resten av sidan. Produktbilder i vita ramar med skugga.
- Mobil: fast meny med helt täckande bakgrund (Safari iOS 26 färgar annars inte ytan ovanför), papperskorn bara på dator, inget `viewport-fit=cover`.
- Användaren vill att sidan ser professionell och lite chic ut, inte "AI-gjord" eller kladdig. Gärna personlighet, men sparsamt.

## Att göra / kvar
- Foto på teamet (`img/team.jpg` visas automatiskt under Om oss).
- Riktigt kundexempel i stället för, eller bredvid, demobutiken.
- Instagram-länk när användarnamnet är bestämt. Bio-förslag: "Sluta sälja i DMs och på Plick. Skaffa er egen sida. ✨ UF-pris från 600 kr ↓"
- Kontrollera rättigheter för demobilderna om de inte är egna foton (en bild visar en Rolex-logga).

## Hur användaren vill ha svar
- Svara på **svenska**, kort och med **enkla steg-för-steg-instruktioner** om var man ska trycka. Användaren sitter ofta på mobilen och skickar skärmdumpar.
- Visa skärmdumpar och testa i både mobil och dator innan något sägs vara klart.
