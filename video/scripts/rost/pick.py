# Spela in flera tagningar per replik och välj den som Whisper hör bäst.
# Användning: python pick.py <röstmapp> <asrmapp> <utmapp> <lines.json> <tagningar>
import json, sys, os, glob, difflib, re
import numpy as np, soundfile as sf, sherpa_onnx

voice_dir, asr_dir, out_dir, lines_file, takes = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5])
name = [f for f in os.listdir(voice_dir) if f.endswith('.onnx')][0]
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(
        model=os.path.join(voice_dir, name), tokens=os.path.join(voice_dir, 'tokens.txt'),
        data_dir=os.path.join(voice_dir, 'espeak-ng-data'),
        noise_scale=0.5, noise_scale_w=0.6, length_scale=0.92),
    num_threads=4)))
d = glob.glob(os.path.join(asr_dir, '*'))[0]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=os.path.join(d, 'small-encoder.int8.onnx'), decoder=os.path.join(d, 'small-decoder.int8.onnx'),
    tokens=os.path.join(d, 'small-tokens.txt'), language='sv', task='transcribe', num_threads=4)

norm = lambda t: re.sub(r'[^a-zåäö0-9 ]', '', t.lower().replace('-', ' ').replace('.', ' ')).split()
os.makedirs(out_dir, exist_ok=True)
manifest = []
for l in json.load(open(lines_file)):
    best = None
    for k in range(takes):
        a = tts.generate(l['say'], sid=0, speed=1.0)
        x = np.array(a.samples, dtype=np.float32)
        idx = np.where(np.abs(x) > 0.002)[0]
        pre, post = int(0.06 * a.sample_rate), int(0.12 * a.sample_rate)
        x = x[max(idx[0] - pre, 0): idx[-1] + post]
        f = int(0.005 * a.sample_rate)
        x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        s = rec.create_stream(); s.accept_waveform(a.sample_rate, x); rec.decode_stream(s)
        heard = s.result.text.strip()
        score = difflib.SequenceMatcher(None, ' '.join(norm(heard)), ' '.join(norm(l['expect']))).ratio()
        if best is None or score > best[0]:
            best = (score, x, a.sample_rate, heard)
        if score > 0.97:
            break
    score, x, sr, heard = best
    # Normalisera ljudnivån (topp -1 dBFS)
    x = x / np.max(np.abs(x)) * 0.89
    sf.write(os.path.join(out_dir, l['id'] + '.wav'), x, sr)
    manifest.append({'id': l['id'], 'text': l['expect'], 'seconds': round(len(x) / sr, 3)})
    print(f"{l['id']:11} {score:.2f} {len(x)/sr:.2f}s  hörde: {heard}", flush=True)
json.dump(manifest, open(os.path.join(out_dir, 'manifest.json'), 'w'), ensure_ascii=False, indent=2)
