"""Звук для umrah-promo10: без инструментов — вокальная подложка (хмыканье-гармонии + вокальный битбокс, 110 BPM)
и эффекты по меткам из cues.json. Запуск: python3 umrah-promo10.sound.py <папка с cues.json> → <папка>/mix.wav"""
import json, sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

D = sys.argv[1]; DUR = 10.0
SR = 48000; N = int(DUR * SR)
rng = np.random.default_rng(11)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[..., -i:]; i = 0
    n = min(x.shape[-1], buf.shape[-1] - i)
    if n > 0: buf[..., i:i + n] += x[..., :n] * g

# ---------- голос «м-м / у-у»: аддитивный синтез гармоник через формантную огибающую ----------
FORM = [(300, 90, 1.0), (850, 140, .22), (2300, 220, .06)]   # закрытый гласный, почти хмыканье
def hum(m, d, seed, vib=.22):
    t = tt(d); r = np.random.default_rng(seed)
    f0 = midi(m) * 2 ** ((vib * np.sin(2 * np.pi * (5.0 + r.random()) * t + r.random() * 6) * np.minimum(1, t / .6)
                          + .04 * lp(r.standard_normal(len(t)), 4) ) / 12)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    out = np.zeros(len(t)); base = midi(m)
    for k in range(1, int(3600 / base)):
        fk = k * base
        a = sum(g / (1 + ((fk - F) / bw) ** 2) for F, bw, g in FORM) / k ** .6
        out += a * np.sin(k * ph + r.random() * 6)
    breath = bp(r.uniform(-1, 1, len(t)), 2500, 7000) * .015
    return out + breath

BEAT = 60 / 110; BAR = BEAT * 4
CH = [([50, 57, 62, 65], 38), ([46, 53, 58, 62], 34), ([43, 50, 55, 58], 31), ([45, 52, 57, 61], 33)]   # Dm  B♭  Gm  A
bed = np.zeros(N)
for k in range(4):
    a = k * BAR; notes, root = CH[k]; d = BAR + .35
    env = lambda n: np.minimum(1, tt(d)[:n] / .18) * np.minimum(1, (d - tt(d)[:n]) / .3)
    for j, m in enumerate(notes):
        x = hum(m, d, 100 * k + j); put(bed, x * env(len(x)) * .5, a)
    # басовый «дум» на 1 и 3 долю
    for b in (0, 2):
        x = hum(root, BEAT * 1.8, 7 * k + b, vib=.08)
        put(bed, x * np.exp(-tt(BEAT * 1.8)[:len(x)] * 1.6) * np.minimum(1, tt(BEAT * 1.8)[:len(x)] / .03) * .9, a + b * BEAT)
# разрешение: тёплый тянущийся ре-мажор до самого конца
END0 = 4 * BAR
for j, m in enumerate([38, 50, 57, 62, 66]):
    d = DUR - END0 + .1
    x = hum(m, d, 900 + j, vib=.15); tl = tt(d)[:len(x)]
    put(bed, x * np.minimum(1, tl / .25) * (.5 if j else .8), END0)
bed = lp(bed, 4200)

# ---------- вокальный битбокс ----------
def kick():
    t = tt(.22); f = 55 + 80 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16) + lp(rng.uniform(-1, 1, len(t)), 500) * np.exp(-t * 60) * .6
def snare():
    t = tt(.16); n = bp(rng.uniform(-1, 1, len(t)), 1200, 5200) * np.exp(-t * 28)
    return n * .9 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 40) * .25
def hat():
    t = tt(.07); return hp(rng.uniform(-1, 1, len(t)), 6500) * np.exp(-t * 70) * .45
PAT = ["k", "h", "s", "h", "k", "k", "s", "h"]
beat = np.zeros(N); i = 0; tb = 0.0
while tb < 9.2:
    s = PAT[i % 8]; x = kick() if s == "k" else snare() if s == "s" else hat()
    put(beat, x * (1 if s != "h" else .8) * (.75 + .25 * rng.random()), tb + rng.normal(0, .004))
    i += 1; tb += BEAT / 2

rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
bed = bed / rms(bed) * 10 ** (-22 / 20)
beat = beat / rms(beat) * 10 ** (-27 / 20)
music = bed + beat
t = np.arange(N) / SR
music *= np.clip(t / .25, 0, 1) * np.clip((DUR - t) / .3, 0, 1)

# ---------- эффекты ----------
def whoosh(d=.6, peak=.75, lo=250, hi=7000, rise=False):
    t = tt(d); n = rng.uniform(-1, 1, len(t)); out = np.zeros(len(t)); seg = 480
    for k in range(0, len(t), seg):
        c = k / len(t); u = (c / peak if c < peak else max(0, 1 - (c - peak) / (1 - peak))) if not rise else c
        f = lo + (hi - lo) * u ** 1.4
        out[k:k + seg] = bp(n[k:k + seg], max(80, f * .5), min(SR / 2 - 200, f * 1.6 + 300), 1)
    env = np.where(t / d < peak, (t / d / peak) ** 2.2, np.exp(-(t / d - peak) * 9))
    return lp(out * env, 9000)
def pop(pitch=1.0, glide=0):
    t = tt(.12); f = 600 * pitch * (1 + 1.1 * np.exp(-t * 45)) * (1 + glide * t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34) + hp(rng.uniform(-1, 1, len(t)), 2500) * np.exp(-t * 500) * .3
def tick():
    t = tt(.04); return (np.sin(2 * np.pi * 2600 * t) * .5 + hp(rng.uniform(-1, 1, len(t)), 3500) * .5) * np.exp(-t * 190)
def chime():
    t = tt(1.4); x = sum(a * np.sin(2 * np.pi * 1046.5 * r * t) * np.exp(-t * dk) for r, a, dk in ((1, 1, 3.2), (2.0, .3, 5), (3.01, .12, 8)))
    return x * np.minimum(1, t / .004)
def boing():
    t = tt(.55); f = 170 + 170 * (1 - np.exp(-t * 8)) + 45 * np.exp(-t * 6) * np.sin(2 * np.pi * 15 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * np.minimum(1, t / .01)
def tap():
    t = tt(.08); return (np.sin(2 * np.pi * 320 * t) * np.exp(-t * 70) + bp(rng.uniform(-1, 1, len(t)), 1500, 5000) * np.exp(-t * 220) * .5)
# тип → (звук, громкость, сдвиг начала)
LIB = {
    "pop":   (lambda c: pop(c.get("pitch", 1) * (.9 + rng.random() * .2)), .26, 0),
    "tick":  (lambda c: tick(), .32, 0),
    "chime": (lambda c: chime(), .38, 0),
    "whoosh":(lambda c: whoosh(.5, .45), .8, -.12),
    "whip":  (lambda c: whoosh(.32, .55, 900, 9500), .95, -.1),
    "rise":  (lambda c: whoosh(.4, .9, 300, 3500 + 1200 * c["i"], rise=True), .55, -.3),
    "popup": (lambda c: pop(c["pitch"] * 1.1, glide=.8), .5, 0),
    "airy":  (lambda c: lp(whoosh(.5, .5, 400, 6000), 5000), .6, -.15),
    "boing": (lambda c: boing(), .42, 0),
    "plane": (lambda c: hp(whoosh(.3, .7, 1200, 8000), 900), .55, 0),
    "tap":   (lambda c: tap(), .5, 0),
}
sfx = np.zeros((2, N))
for c in json.load(open(f"{D}/cues.json")):
    if c["type"] not in LIB: continue
    fn, vol, sh = LIB[c["type"]]
    x = fn(c); x = x / (np.abs(x).max() + 1e-9) * vol * c.get("v", 1)
    pan = (rng.random() - .5) * .4
    put(sfx, np.vstack([x * (1 - pan), x * (1 + pan)]), c["t"] + sh)

mix = np.vstack([music, music]) * np.array([[1.0], [.97]]) + sfx * 10 ** (-6 / 20)
mix *= 10 ** (-1 / 20) / np.abs(mix).max()
fade = np.clip((DUR - t) / .05, 0, 1); mix *= fade
wavfile.write(f"{D}/mix.wav", SR, (mix.T * 32767).astype(np.int16))
print("RMS по секундам:", [round(20 * np.log10(rms(mix.mean(0)[i * SR:(i + 1) * SR]))) for i in range(int(DUR))])
