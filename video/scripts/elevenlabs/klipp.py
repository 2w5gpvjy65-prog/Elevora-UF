# Klipp varje rad ur pitch-tagningarna, kolla mot det som ska sägas och spara ordens starttider.
import json, sys, os, glob, difflib, re, subprocess
import numpy as np, soundfile as sf, sherpa_onnx, librosa
asr_dir, outdir = sys.argv[1], sys.argv[2]
takes = sys.argv[3:]
d = glob.glob(os.path.join(asr_dir, '*'))[0]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=os.path.join(d, 'small-encoder.int8.onnx'), decoder=os.path.join(d, 'small-decoder.int8.onnx'),
    tokens=os.path.join(d, 'small-tokens.txt'), language='sv', task='transcribe', num_threads=4)
def norm(t):
    t = t.lower()
    for a, b in [("u f", "uf"), ("sexhundra", "600"), ("trehundra", "300"), ("elevorra", "elevora"), ("ele-vorra", "elevora"), ("ellevorra", "elevora"),
                 ("punkt s e", ".se"), ("1-2", "en till två"), ("1–2", "en till två"), ("webshop", "webbshop"), ("klana", "klarna")]:
        t = t.replace(a, b)
    return ' '.join(re.sub(r'[^a-zåäö0-9 ]', ' ', t).split())
os.makedirs(outdir, exist_ok=True)
res = {}
for base in takes:
    name = os.path.basename(base)
    if not os.path.exists(base + '.wav'):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base + '.mp3', '-ac', '1', '-ar', '44100', base + '.wav'], check=True)
    meta = json.load(open(base + '.json')); al = meta['alignment']
    x, sr = sf.read(base + '.wav', dtype='float32')
    st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
    spans = meta['spans']
    for i, (k, s, a, b) in enumerate(spans):
        t0 = max(0, st[a] - 0.06)
        nxt = st[spans[i + 1][2]] - 0.03 if i + 1 < len(spans) else len(x) / sr
        t1 = min(nxt, en[b - 1] + 0.45)
        seg = x[int(t0 * sr): int(t1 * sr)].copy()
        e = np.sqrt(np.convolve(seg ** 2, np.ones(441) / 441, 'same'))
        loud = np.where(e > 10 ** (-42 / 20))[0]
        if len(loud): seg = seg[: min(len(seg), loud[-1] + int(0.12 * sr))]
        f = int(0.008 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        # Ordens starttider (sekunder in i klippet)
        words = []
        for m in re.finditer(r"[^\s,.?!]+", s):
            words.append([m.group(0), round(st[a + m.start()] - t0, 3)])
        r16 = librosa.resample(seg, orig_sr=sr, target_sr=16000)
        stream = rec.create_stream(); stream.accept_waveform(16000, r16); rec.decode_stream(stream)
        heard = stream.result.text.strip()
        sc = difflib.SequenceMatcher(None, norm(heard), norm(s)).ratio()
        sf.write(os.path.join(outdir, f'{name}-{k}.wav'), seg, sr)
        res.setdefault(k, []).append({"score": round(sc, 3), "take": name, "sec": round(len(seg) / sr, 2), "heard": heard, "say": s, "words": words})
for k, rows in res.items():
    print(k)
    for r in sorted(rows, key=lambda r: -r["score"]): print(f"    {r['score']:.2f} {r['take']:3} {r['sec']:5.2f}s  {r['heard']}")
json.dump(res, open(os.path.join(outdir, 'res.json'), 'w'), ensure_ascii=False, indent=1)
