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
| Webbshop | 800 kr | 2 500 kr |
| Hemsida, en sida | 400 kr | 1 800 kr |
| Google-profil | 400 kr | – |
| Löpande uppdateringar | 200 kr/mån | – |

- Priserna ändrades i november 2026 (förut UF 600 / 300 kr, ordinarie "från 2 000 kr" / 1 200 kr). Samma priser på elevorauf.se och i videon.
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

## Reklamvideo (Remotion)
- Ligger i `video/` (Remotion, React). Tre kompositioner: `Reel` 9:16, `Feed` 4:5, `Wide` 16:9, 30 fps, cirka 59 s (v3: snabbare, fler tekniska effekter; v4: ElevenLabs-röst, musik och ljudeffekter; v5: rösten håller en kort pitch med mer än texten på skärmen; v6: ordinarie priser i bild, UF-priserna viskas). Se `video/README.md`.
- Remotion-skills är installerade i `.claude/skills/` (`npx skills add remotion-dev/skills`). Gratis licens för upp till 3 anställda.
- `video/` och `skills-lock.json` står i `.assetsignore` så att de inte publiceras på elevorauf.se. Renderade MP4-filer (`video/out/`) committas inte.
- Molnsession: Remotion kan inte ladda ner sin egen webbläsare. Rendera med `REMOTION_BROWSER=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (Chrome for Testing, som också kan hämta Google Fonts via proxyn).
- Motion blur (`HtmlInCanvasMotionBlur`) bara på svepet DM → webbshop, med 15 samples och bakgrunden utanför oskärpan. Fler samples ger färgförskjutning (8-bitars avrundning).
- **Röst (sedan v4):** ElevenLabs, rösten Liam med eleven_v3, stabilitet 0.5 utan taggar: lugn och naturlig ton rakt igenom (`[excited]` lät AI-aktigt). Rösten säger en kort pitch, mer än texten på skärmen. Uttal: "DM" som ett ord, "Elevora" = "elev-ora" utan paus (stavas Elevora, inte Elevorra). En tagning, bästa raden per tagning vald med Whisper. Användaren tyckte att den gamla talsyntesen (Piper) lät robotaktig. Musik från Eleven Music och ljudeffekter från Sound Effects, mixade i `src/sound.tsx` (musiken sänks under rösten), slutfilen normaliserad till -14 LUFS. Se `video/scripts/elevenlabs/README.md`.
- **Priser i videon:** de ordinarie priserna syns och sägs (webbshop 2 500 kr, hemsida 1 800 kr). Sedan viskar rösten UF-priserna som en liten hemlis ("Men för UF-företag… åttahundra och fyrahundra", taggen `[whispers]`, enda taggen i manuset) och en mindre mörkblå etikett "UF-pris 800 kr / 400 kr" dyker upp under varje pris när det sägs.
- **ElevenLabs-nyckeln** ligger som *Network secret* i molnmiljön (header `xi-api-key`, domän `api.elevenlabs.io`), aldrig i koden. Planen är Starter: mp3 128 kbit/s (192 kräver Creator). Nyckeln saknar Voices Read och User Read.
- **Kundexempel i videon:** Arteras riktiga sida (repo `2w5gpvjy65-prog/arterauf`, keramikfat, fyra tjejer från Mora) i mobilen: scroll till Vika → "Lägg i kundvagnen" → kassa (Swish/kort/Klarna, 349 + 39 kr frakt) → "Tack för ditt köp!". Kassan i videon är en förenklad bild, inte Stripes riktiga. Skärmdumpar via `video/scripts/artera-skarmdump.js`.
- Prisfrågan: arterauf-repots CLAUDE.md säger webbshop UF 1 200 kr / hemsida 600 kr, men elevorauf.se och videon säger UF-pris 800 / 400 kr (ordinarie 2 500 / 1 800 kr). Det som står på elevorauf.se gäller.

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
- Instagram-länk när användarnamnet är bestämt. Bio-förslag: "Sluta sälja i DMs och på Plick. Skaffa er egen sida. ✨ UF-pris från 400 kr ↓"
- Kontrollera rättigheter för demobilderna om de inte är egna foton (en bild visar en Rolex-logga).

## Hur användaren vill ha svar
- Svara på **svenska**, kort och med **enkla steg-för-steg-instruktioner** om var man ska trycka. Användaren sitter ofta på mobilen och skickar skärmdumpar.
- Visa skärmdumpar och testa i både mobil och dator innan något sägs vara klart.
