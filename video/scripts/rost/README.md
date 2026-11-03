# Rösten

Rösten är svensk talsyntes (Piper-rösten **sv_SE-nst-medium**, tränad på NST-data med CC0-licens) som körs lokalt med [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx). Ingen molntjänst och ingen API-nyckel behövs.

`repliker.json` innehåller varje replik: `say` är hur den stavas för att uttalas rätt (till exempel "Ar-tera", "U F", "sexhundra") och `expect` är det som står på skärmen.

`pick.py` spelar in 8 tagningar per replik och låter Whisper (taligenkänning) välja den tagning som hörs mest likt texten. Tempot styrs med miljövariabeln `LENGTH` (0.82 = snabbt reklamtempo). "Swish" stavas "Svisj" för att uttalas rätt.

## Byta mot en egen röst (rekommenderas)

1. Spela in varje replik i mobilen, en fil per rad, med samma namn som i `public/voice/` (till exempel `01-krok.wav`).
2. Lägg filerna i `public/voice/` (ersätt de gamla).
3. Uppdatera `seconds` för varje replik i `src/voice.json` (längden i sekunder).
4. Rendera om. Hela tidslinjen flyttar sig efter de nya längderna.

## Generera om talsyntesen

```console
python3 -m venv venv && venv/bin/pip install "sherpa-onnx<2" soundfile numpy
# Röst: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-sv_SE-nst-medium.tar.bz2
# Whisper: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
LENGTH=0.82 venv/bin/python pick.py <röstmapp> <whispermapp> <utmapp> repliker.json 8
```
