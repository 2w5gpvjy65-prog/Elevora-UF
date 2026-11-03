# Elevora-video (Remotion)

Reklamvideo för Elevora UF i tre format, byggd med [Remotion](https://www.remotion.dev).

| Komposition | Storlek | Används till |
|---|---|---|
| `Reel` | 1080 × 1920 (9:16) | TikTok, Reels, Stories |
| `Feed` | 1080 × 1350 (4:5) | Instagram-flödet |
| `Wide` | 1920 × 1080 (16:9) | Hemsidan, YouTube, LinkedIn |

30 fps, cirka 38 sekunder, med röst från ElevenLabs (Liam, eleven_v3) som läser all text, plus musik och ljudeffekter från ElevenLabs. Scener:
1. Krok "Säljer ni fortfarande i DM?" med en inkorg i 3D som fylls på
2. Svep med motion blur till bygget: kolumnrutnät → wireframe som ritas med markeringsruta och mått → kod som skrivs → **Arteras riktiga sida** framkallas med en skanningslinje, "Publicerad"
3. Artera i 3D: dator och mobil, kamera som glider (iris-övergång)
4. Köpet: scroll till Vika, kassa där Swish, kort och Klarna lyser upp i takt med rösten, kvitto och "Ny beställning" (ränder-övergång)
5. Priser med siffror som rullar fram
6. Avslutning: loggan vrids fram, adressen skrivs bokstav för bokstav

## Kom igång (på din dator)

1. Installera [Node.js](https://nodejs.org) (LTS).
2. I den här mappen: `npm i`
3. Förhandsvisa: `npm run dev` (öppnar Remotion Studio i webbläsaren)
4. Rendera, till exempel Reel-formatet:

```console
npx remotion render Reel out/elevora-reel-9x16.mp4
```

Inställningarna i `remotion.config.ts` ger redan skarp text: PNG-bildrutor, h264, CRF 16 och yuv420p.

## Var saker finns

- `src/theme.ts`: färger, typsnitt, easing-kurvor och säkra ytor per format
- `src/timeline.ts`: tidslinjen. Den räknas ut från röstens längder i `src/voice.json`, så varje text syns när den sägs.
- `src/scenes/`: en fil per scen. Texterna står direkt i scenerna.
- `public/voice/`: rösten, en fil per replik. Se `scripts/elevenlabs/README.md`. Vill ni byta till egen röst: se `scripts/rost/README.md`.
- `public/musik.mp3`, `public/sfx/`: musik och ljudeffekter, mixas i `src/sound.tsx`.
- `public/artera/`: skärmdumpar av Arteras sida (`scripts/artera-skarmdump.js`)
- `public/`: bilder och loggor (visas med `<Img>` och `staticFile()`)

## Regler vi följer

- Animera bara med `useCurrentFrame()`, `interpolate()` och `spring()`. Inga CSS-animationer.
- Inget `Math.random()`, använd `random("seed")`.
- Motion blur bara på svepet från DM till webbshop.
- Reel: inget viktigt innehåll närmare än 270 px från toppen, 440 px från botten eller 160 px från högerkanten, där TikToks och Instagrams knappar och texter ligger.

## Molnmiljö

Om Remotion inte kan ladda ner sin egen webbläsare: sätt `REMOTION_BROWSER` till en Chrome-sökväg innan du renderar.

Remotion är gratis för företag med upp till 3 anställda.
