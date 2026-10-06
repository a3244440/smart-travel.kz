"""Звук ролика: синтезированные эффекты по меткам из анимации (cues.json) + лёгкая музыка + голос.
Запуск: python3 sound.py <папка с cues.json, timing.json, voice.wav> <длительность, с>
Результат: <папка>/mix.wav"""
import json, sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

D = sys.argv[1]; DUR = float(sys.argv[2])
SR = 48000; N = int(DUR * SR)
rng = np.random.default_rng(5)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR

# ---------- библиотека эффектов ----------
def whoosh(d=.6, peak=.75, lo=250, hi=7000, soft=False):
    t = tt(d); n = rng.uniform(-1, 1, len(t)); out = np.zeros(len(t)); seg = 480
    for k in range(0, len(t), seg):
        c = k / len(t); f = lo + (hi - lo) * (c / peak if c < peak else max(0, 1 - (c - peak) / (1 - peak))) ** 1.4
        out[k:k + seg] = bp(n[k:k + seg], max(80, f * .5), min(SR / 2 - 200, f * 1.6 + 300), 1)
    env = np.where(t / d < peak, (t / d / peak) ** 2.2, np.exp(-(t / d - peak) * 9))
    return lp(out * env, 9000) * (.55 if soft else 1)
def swish(): return hp(whoosh(.28, .55, 1500, 9000), 1200) * .7
def pop(pitch=1.0):
    t = tt(.12); f = 620 * pitch * (1 + 1.2 * np.exp(-t * 45))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34)
    click = hp(rng.uniform(-1, 1, len(t)), 2500) * np.exp(-t * 500) * .35
    return tone + click
def tick():
    t = tt(.05); return (np.sin(2 * np.pi * 2300 * t) * .5 + hp(rng.uniform(-1, 1, len(t)), 3000) * .5) * np.exp(-t * 160)
def key():
    t = tt(.04); thock = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 120) * .5
    return bp(rng.uniform(-1, 1, len(t)), 1800, 6000) * np.exp(-t * 260) + thock
def click():
    a = key() * .8; b = key() * .6; out = np.zeros(int(.09 * SR)); out[:len(a)] += a; out[int(.055 * SR):int(.055 * SR) + len(b)] += b[:len(out) - int(.055 * SR)]
    return out
def ding():
    t = tt(.35); return (np.sin(2 * np.pi * 1180 * t) + .35 * np.sin(2 * np.pi * 2360 * t)) * np.exp(-t * 14) * np.minimum(1, t / .004) * .45
def impact():
    t = tt(1.1); f = 42 + 60 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    return boom + lp(rng.uniform(-1, 1, len(t)), 900) * np.exp(-t * 14) * .5
LIB = {"whoosh": (lambda o: whoosh(), .45, -.45), "whoosh_s": (lambda o: whoosh(.45, .6, 300, 5000, True), .4, -.27),
       "swish": (lambda o: swish(), .35, 0), "pop": (lambda o: pop(o.get("pitch", 1) * (0.92 + rng.random() * .16)), .42, 0),
       "tick": (lambda o: tick(), .3, 0), "key": (lambda o: key(), .22, 0), "click": (lambda o: click(), .5, 0),
       "ding": (lambda o: ding(), .38, 0), "impact": (lambda o: impact(), .8, 0)}
# (функция, громкость, сдвиг: у вжухов пик приходится ровно на смену сцены)

sfx = np.zeros((2, N))
for c in json.load(open(f"{D}/cues.json")):
    if c["type"] not in LIB: continue
    fn, vol, shift = LIB[c["type"]]
    x = fn(c) * vol * c.get("v", 1)
    i = int((c["t"] + shift) * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n <= 0: continue
    pan = (rng.random() - .5) * .5
    sfx[0, i:i + n] += x[:n] * (1 - pan); sfx[1, i:i + n] += x[:n] * (1 + pan)

# ---------- музыка: мягкий пэд + лёгкий бит (100 BPM), без колокольчиков ----------
t = np.arange(N) / SR; BEAT = 60 / 100
def midi(m): return 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
bar = BEAT * 4
for k in range(int(DUR / bar) + 1):
    a = k * bar; notes = CH[k % 4]; i0, i1 = int(a * SR), min(N, int((a + bar + .4) * SR))
    if i0 >= N: break
    tl = np.arange(i1 - i0) / SR; env = np.minimum(1, tl / .5) * np.minimum(1, (bar + .4 - tl) / .5)
    for m in notes:
        for det in (-.07, .07):
            ph = 2 * np.pi * midi(m) * 2 ** (det / 12) * tl
            music[i0:i1] += (np.sin(ph) + .3 * np.sin(2 * ph) + .12 * np.sin(3 * ph)) * env * .12
music = lp(music, 1600)
kick = lambda: (lambda tk: np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-tk * 30)) / SR) * np.exp(-tk * 7))(tt(.35))
hat = lambda: hp(rng.uniform(-1, 1, int(.05 * SR)), 7000) * np.exp(-tt(.05) * 90) * .25
b = 0.0
while b < DUR - .5:
    for x, off in ((kick(), 0), (hat(), BEAT / 2)):
        i = int((b + off) * SR); n = min(len(x), N - i)
        if n > 0: music[i:i + n] += x[:n] * (.55 if off == 0 else 1)
    b += BEAT
music *= np.clip(t / 1.0, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1)

# ---------- голос и сведение ----------
sr, v = wavfile.read(f"{D}/voice.wav"); v = v.astype(float) / 32768
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
env = lp(np.abs(voice), 5); env /= env.max() + 1e-9
duck = lp(1 - .6 * np.clip(env * 5, 0, 1), 3)                  # музыка тише под голосом
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
music = music / rms(music) * 10 ** (-24 / 20) * duck
voice = voice / np.abs(voice).max() * 10 ** (-2.5 / 20)
mix = np.vstack([voice + music, voice + music]) + sfx * 10 ** (-3 / 20) / max(1e-9, np.abs(sfx).max())   # эффекты хорошо слышны, как в референсе
mix *= 10 ** (-1 / 20) / np.abs(mix).max()
wavfile.write(f"{D}/mix.wav", SR, (mix.T * 32767).astype(np.int16))
m = mix.mean(0)
print("RMS по секундам:", [round(20 * np.log10(rms(m[i * SR:(i + 1) * SR]))) for i in range(int(DUR))])
