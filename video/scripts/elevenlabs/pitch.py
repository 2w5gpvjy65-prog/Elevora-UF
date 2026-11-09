# Pitch-manus: rösten säger mer än texten på skärmen, men varje rad hör ihop med en text.
# En hel tagning med tidsstämplar. Användning: python pitch.py <ut> <stabilitet> <elevora-stavning> [första-id sista-id]
# Med första/sista id läses bara den delen (till exempel 10-priser 12-viska när bara priserna ändras).
import json, sys, base64, urllib.request
out, stability, ELV = sys.argv[1], float(sys.argv[2]), sys.argv[3]
first, last = (sys.argv[4], sys.argv[5]) if len(sys.argv) > 5 else (None, None)
L = [
 ("01-krok", "Säljer ni fortfarande i DM?"),
 ("02-samma", "Samma frågor, varje dag. Finns den kvar? Vad kostar frakten? Kan jag swisha?"),
 ("03-skaffa", "Det finns ett enklare sätt. Skaffa er egen webbshop!"),
 ("04-designar", f"Vi på {ELV} designar den efter er stil,"),
 ("05-bygger", "bygger den från grunden,"),
 ("06-klart", "och den är klar på en till två veckor."),
 ("07-artera", "Som för Artera U F. Vi byggde deras webbshop för handgjorda keramikfat."),
 ("08-betalar", "Kunden hittar fatet, lägger det i kundvagnen och betalar direkt på sidan."),
 ("09-betalsatt", "Med Swish, kort eller Klarna."),
 ("10-priser", "Och priset? Vi har fasta priser."),
 ("11-webbshop", "En webbshop kostar åttahundra kronor,"),
 ("12-hemsida", "en hemsida fyrahundra."),
 # Viskat, som en hemlighet: UF-priserna
 ("12-viska", "[whispers] Men för U F-företag... sexhundra och trehundra."),
 ("13-avgift", "och inga månadsavgifter till oss."),
 ("14-skiss", "Nyfikna? Vi skissar er startsida, helt gratis."),
 ("15-adress", f"Hör av er på {ELV} U F punkt S E."),
]
if first:
    keys = [k for k, _ in L]
    L = L[keys.index(first): keys.index(last) + 1]
text, spans = "", []
for k, s in L:
    tag = ""
    if s.startswith("["):
        tag, s = s.split("] ", 1); tag += "] "
    text += tag
    a = len(text); text += s; b = len(text)
    spans.append((k, s, a, b)); text += " "
body = json.dumps({"text": text.strip(), "model_id": "eleven_v3", "language_code": "sv", "voice_settings": {"stability": stability}}).encode()
req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ/with-timestamps?output_format=mp3_44100_128",
                             data=body, headers={"Content-Type": "application/json"}, method="POST")
try:
    r = json.load(urllib.request.urlopen(req, timeout=240))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read()[:300]); sys.exit(1)
open(out + ".mp3", "wb").write(base64.b64decode(r["audio_base64"]))
al = r.get("alignment") or r.get("normalized_alignment")
json.dump({"text": text.strip(), "spans": spans, "alignment": al}, open(out + ".json", "w"), ensure_ascii=False)
print(out, "längd", round(al["character_end_times_seconds"][-1], 2), "s")
