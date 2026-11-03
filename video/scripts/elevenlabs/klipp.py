# Klipp varje rad ur tagningarna med marginal till nästa rad, kolla med Whisper.
import json, sys, os, glob, difflib, re
import numpy as np, soundfile as sf, sherpa_onnx, librosa
asr_dir, outdir = sys.argv[1], sys.argv[2]
takes = sys.argv[3:]
d = glob.glob(os.path.join(asr_dir, '*'))[0]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=os.path.join(d, 'small-encoder.int8.onnx'), decoder=os.path.join(d, 'small-decoder.int8.onnx'),
    tokens=os.path.join(d, 'small-tokens.txt'), language='sv', task='transcribe', num_threads=4)
EXP = {"01-krok": "Säljer ni fortfarande i DM?", "02-samma": "Samma frågor. Varje dag.", "03-skaffa": "Så skaffa er egen webbshop.",
 "04-designar": "Vi designar den.", "05-bygger": "Vi bygger den.", "06-klart": "Klart på en till två veckor.",
 "07-artera": "Som Artera UF. Vi byggde deras sida.", "08-betalar": "Kunden betalar direkt på sidan.", "09-betalsatt": "Swish, kort eller Klarna.",
 "10-uf": "Fasta UF-priser.", "11-webbshop": "Webbshop 600 kronor.", "12-hemsida": "Hemsida 300 kronor.", "13-avgift": "Inga månadsavgifter till oss.",
 "14-skiss": "Vi skissar er startsida gratis.", "15-adress": "elevorauf.se"}
norm = lambda t: ' '.join(re.sub(r'[^a-zåäö0-9 ]', '', t.lower().replace('-', ' ').replace('.', ' ').replace('1 2', 'en till två')).split())
os.makedirs(outdir, exist_ok=True)
res = {}
for base in takes:
    name = os.path.basename(base)
    meta = json.load(open(base + '.json')); al = meta['alignment']
    x, sr = sf.read(base + '.wav', dtype='float32')
    st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
    spans = meta['spans']
    for i, (k, s, a, b) in enumerate(spans):
        t0 = max(0, st[a] - 0.06)
        nxt = st[spans[i + 1][2]] - 0.03 if i + 1 < len(spans) else len(x) / sr
        t1 = min(nxt, en[b - 1] + 0.45)
        seg = x[int(t0 * sr): int(t1 * sr)].copy()
        # Kapa tystnad i slutet men behåll en kort svans
        e = np.sqrt(np.convolve(seg ** 2, np.ones(441) / 441, 'same'))
        loud = np.where(e > 10 ** (-42 / 20))[0]
        if len(loud): seg = seg[: min(len(seg), loud[-1] + int(0.12 * sr))]
        f = int(0.008 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        r16 = librosa.resample(seg, orig_sr=sr, target_sr=16000)
        stream = rec.create_stream(); stream.accept_waveform(16000, r16); rec.decode_stream(stream)
        heard = stream.result.text.strip()
        sc = difflib.SequenceMatcher(None, norm(heard), norm(EXP[k])).ratio()
        p = os.path.join(outdir, f'{name}-{k}.wav'); sf.write(p, seg, sr)
        res.setdefault(k, []).append((round(sc, 3), name, round(len(seg) / sr, 2), heard))
for k in EXP:
    print(k)
    for r in sorted(res[k], reverse=True): print('   ', r)
json.dump(res, open(os.path.join(outdir, 'res.json'), 'w'), ensure_ascii=False, indent=1)
