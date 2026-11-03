# Röst, musik och ljudeffekter från ElevenLabs

Rösten är **Liam** (voice id `TX3LPaxmHKxFdv7VOQHJ`) med modellen **eleven_v3**, stabilitet 0.0 ("Creative") och taggarna `[excited]`/`[confident]` för en livlig men proffsig ton. Hela manuset läses i **en tagning** så att tonfall och tempo hänger ihop.

## Så gjordes den
1. `tagning.py <ut> 0.0 tags` gör en hel tagning med tidsstämplar per tecken (`/with-timestamps`). Vi gjorde flera tagningar (A, A2, A3, A4).
2. `klipp.py` klipper ut varje rad ur tagningarna med tidsstämplarna och låter Whisper jämföra med texten. Den bästa versionen av varje rad valdes (vilken tagning står i `src/voice.json`, fältet `take`).
3. Raderna nivåanpassades (RMS -19 dBFS) och ligger i `public/voice/`. Ordstarterna för "Swish, kort eller Klarna" kommer från tidsstämplarna (`words` i `voice.json`).
4. Musiken (`public/musik.mp3`) är gjord med Eleven Music (instrumental, ca 120 BPM, utan slut så att den kan tonas ut). Ljudeffekterna (`public/sfx/`) är gjorda med Sound Effects.
5. `src/sound.tsx` sänker musiken när rösten pratar och lägger effekterna på rörelserna. Den färdiga filen normaliseras till -14 LUFS.

## Nyckeln
API-nyckeln ligger aldrig i koden. I molnmiljön läggs den till automatiskt som en *Network secret* för `api.elevenlabs.io` (header `xi-api-key`). Nyckeln behöver behörigheterna Text to Speech, Sound Effects och Music (Voices Read om man vill söka röster).
Lokalt: sätt `xi-api-key` i anropen själv, till exempel via miljövariabeln `ELEVENLABS_API_KEY`.
