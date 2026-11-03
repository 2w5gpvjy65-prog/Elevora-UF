# Röst, musik och ljudeffekter från ElevenLabs

Rösten är **Liam** (voice id `TX3LPaxmHKxFdv7VOQHJ`) med modellen **eleven_v3** och stabilitet 0.5 ("Natural"). Grundtonen är lugn och naturlig; bara fyra rader har taggen `[excited]` ("Skaffa er egen webbshop", "klar på en till två veckor", "Swish, kort eller Klarna", "helt gratis"). Användaren tyckte att för mycket entusiasm lät AI-aktigt.

Rösten håller en **kort pitch** som säger mer än texten på skärmen (manuset står i `pitch.py`). Varje replik hör till en text i videon. Uttal: skriv `DM` (inte "D M") och `Elevora` (uttalas "elev-ora" utan paus, testat).

Hela manuset läses i **en tagning** så att tonfall och tempo hänger ihop.

## Så gjordes den
1. `pitch.py <ut> 0.5 Elevora` gör en hel tagning med tidsstämplar per tecken (`/with-timestamps`). Vi gjorde tre tagningar (M1–M3).
2. `klipp.py` klipper ut varje rad ur tagningarna och låter Whisper jämföra med det som ska sägas. Den bästa versionen av varje rad valdes (`take` i `src/voice.json`). Ordens starttider sparas (`words`), så att mobilen kan scrolla på "hittar fatet", trycka på "kundvagnen" och öppna kassan på "betalar".
3. Raderna nivåanpassades (RMS -19 dBFS) och ligger i `public/voice/`.
4. Musiken (`public/musik.mp3`) är gjord med Eleven Music (instrumental, ca 120 BPM, utan slut så att den kan tonas ut). Ljudeffekterna (`public/sfx/`) är gjorda med Sound Effects.
5. `src/sound.tsx` sänker musiken när rösten pratar och lägger effekterna på rörelserna. Den färdiga filen normaliseras till -14 LUFS.

## Nyckeln
API-nyckeln ligger aldrig i koden. I molnmiljön läggs den till automatiskt som en *Network secret* för `api.elevenlabs.io` (header `xi-api-key`). Nyckeln behöver behörigheterna Text to Speech, Sound Effects och Music (Voices Read om man vill söka röster).
Lokalt: sätt `xi-api-key` i anropen själv, till exempel via miljövariabeln `ELEVENLABS_API_KEY`.
