"""Озвучка сценария: каждое предложение синтезируется целиком (живая интонация),
затем по паузам и числу слогов находятся начала фраз — по ним анимация попадает в слова.
Запуск: python3 voice.py сценарий.json выход_папка   (переменные PIPER и PIPER_VOICE — путь к piper и голосу)
Свой голос (ElevenLabs и т.п.): положите voice.wav и timing.json с теми же id фраз — движок их подхватит."""
import json, os, subprocess, sys, numpy as np
from scipy.io import wavfile

script, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
S = json.load(open(script))
PIPER, VOICE = os.environ["PIPER"], os.environ["PIPER_VOICE"]
SR = 48000
VOW = set("аеёиоуыэюяaeiou")
syl = lambda s: max(1, sum(c in VOW for c in s.lower()))

def synth(text, path):
    raw = path + ".raw.wav"
    subprocess.run([PIPER, "-m", VOICE, "-f", raw, "--length_scale", "1.0", "--noise_scale", "0.45", "--noise_w", "0.6"],
                   input=text.encode(), check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af",
                    "atempo=1.04,highpass=f=90,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3500:t=q:w=1.2:g=-1.5,aresample=48000",
                    "-ac", "1", path], check=True)
    sr, x = wavfile.read(path); return x.astype(float) / 32768

def speech_span(x):
    w = int(.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i+w]**2)) for i in range(0, len(x) - w, w)])
    on = np.where(e > 0.012)[0]
    return on[0] * .01, on[-1] * .01 + .01, e

def pauses(e, a, b):
    res, start = [], None
    for i, v in enumerate(e):
        t = i * .01
        if t < a or t > b: continue
        if v < 0.006 and start is None: start = t
        if v >= 0.006 and start is not None:
            if t - start >= 0.07: res.append((start + t) / 2)
            start = None
    return res

voice, timing, t = [], {"phrases": {}, "sentences": []}, 0.6
for k, sen in enumerate(S["sentences"]):
    text = " ".join(p["say"] for p in sen["phrases"])
    x = synth(text, f"{out}/s{k}.wav")
    a, b, e = speech_span(x)
    seg = x[int(a * SR):int(b * SR)]
    ps = pauses(e, a, b)
    # начало каждой фразы: доля слогов внутри предложения, привязанная к ближайшей паузе
    tot = sum(syl(p["say"]) for p in sen["phrases"]); acc = 0
    for p in sen["phrases"]:
        est = a + (b - a) * acc / tot
        near = [q for q in ps if abs(q - est) < 0.3]
        start = (min(near, key=lambda q: abs(q - est)) if near and acc else est) - a
        timing["phrases"][p["id"]] = round(t + max(0, start), 3)
        acc += syl(p["say"])
    timing["sentences"].append({"scene": sen["scene"], "start": round(t, 3), "end": round(t + len(seg) / SR, 3)})
    voice.append((t, seg)); t += len(seg) / SR + S.get("gap_sentence", 0.3)
timing["voice_end"] = round(t, 3)
total = np.zeros(int((t + 3) * SR))
for st, seg in voice: total[int(st * SR):int(st * SR) + len(seg)] += seg
wavfile.write(f"{out}/voice.wav", SR, (total / max(1e-9, np.abs(total).max()) * 0.9 * 32767).astype(np.int16))
json.dump(timing, open(f"{out}/timing.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(timing, ensure_ascii=False))
