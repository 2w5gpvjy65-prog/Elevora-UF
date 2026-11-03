# En hel tagning med Liam (eleven_v3) + tidsstämplar per tecken.
import json, sys, base64, urllib.request, os
out, stability, tags = sys.argv[1], float(sys.argv[2]), sys.argv[3] == "tags"
L = [
 ("01-krok", "Säljer ni fortfarande i D M?"),
 ("02-samma", "Samma frågor. Varje dag."),
 ("03-skaffa", "Så skaffa er egen webbshop!"),
 ("04-designar", "Vi designar den."),
 ("05-bygger", "Vi bygger den."),
 ("06-klart", "Klart på en till två veckor."),
 ("07-artera", "Som Artera U F. Vi byggde deras sida."),
 ("08-betalar", "Kunden betalar direkt på sidan."),
 ("09-betalsatt", "Swish, kort eller Klarna."),
 ("10-uf", "Fasta U F-priser."),
 ("11-webbshop", "Webbshop, sexhundra kronor."),
 ("12-hemsida", "Hemsida, trehundra kronor."),
 ("13-avgift", "Inga månadsavgifter till oss."),
 ("14-skiss", "Vi skissar er startsida, gratis!"),
 ("15-adress", "Ele-vora U F, punkt S E."),
]
T = {"01-krok": "[excited] ", "03-skaffa": "[confident] ", "14-skiss": "[excited] "} if tags else {}
text, spans, pos = "", [], 0
for i, (k, s) in enumerate(L):
    pre = T.get(k, "")
    text += pre
    a = len(text); text += s; b = len(text)
    spans.append((k, s, a, b))
    text += " "
body = json.dumps({"text": text.strip(), "model_id": "eleven_v3", "language_code": "sv",
                   "voice_settings": {"stability": stability}}).encode()
req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ/with-timestamps?output_format=mp3_44100_128",
                             data=body, headers={"Content-Type": "application/json"}, method="POST")
try:
    r = json.load(urllib.request.urlopen(req, timeout=180))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read()[:300]); sys.exit(1)
open(out + ".mp3", "wb").write(base64.b64decode(r["audio_base64"]))
al = r.get("alignment") or r.get("normalized_alignment")
json.dump({"text": text.strip(), "spans": spans, "alignment": al}, open(out + ".json", "w"), ensure_ascii=False)
chars = al["characters"]; print("tecken i alignment:", len(chars), "i text:", len(text.strip()), "längd:", round(al["character_end_times_seconds"][-1], 2), "s")
