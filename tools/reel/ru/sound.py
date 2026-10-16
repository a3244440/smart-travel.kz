import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; F=4/3; DUR=15.0*F; N=int(DUR*SR); t=np.arange(N)/SR
rng=np.random.default_rng(21)
L=np.zeros(N); R=np.zeros(N)
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def nz(n): return rng.standard_normal(n)
def add(x,at,g=1.,pan=.5):
    i=int(at*F*SR); n=min(len(x),N-i)
    if n>0 and i>=0: L[i:i+n]+=x[:n]*g*np.sqrt(2*(1-pan)); R[i:i+n]+=x[:n]*g*np.sqrt(2*pan)
def env(n,a,d): tt=np.arange(n)/SR; return np.minimum(1,tt/max(a,1e-4))*np.exp(-tt/d)
def sweep(n,f0,f1,bw=1.6):
    x=nz(n); out=np.zeros(n); blk=960
    for i in range(0,n,blk):
        k=i/n; f=f0*(f1/f0)**k; seg=x[max(0,i-1920):i+blk]; out[i:i+blk]=bp(seg,max(30,f/bw),min(20000,f*bw))[-len(x[i:i+blk]):]
    return out
def whoosh(at,dur=.45,g=.5,pan_from=.2,pan_to=.8):
    dur*=F; n=int(dur*SR); tt=np.arange(n)/n; x=sweep(n,400,5000)*np.sin(np.pi*tt)**1.5
    p=np.linspace(pan_from,pan_to,n); i=int((at*F-dur*.6)*SR); m=min(n,N-i)
    if i<0: return
    L[i:i+m]+=x[:m]*g*np.sqrt(2*(1-p[:m])); R[i:i+m]+=x[:m]*g*np.sqrt(2*p[:m])
def thump(at,f=55,d=.18,g=.8):
    n=int(.6*SR); tt=np.arange(n)/SR; fr=f+90*np.exp(-tt*40); ph=2*np.pi*np.cumsum(fr)/SR
    add(np.sin(ph)*env(n,.002,d),at,g)
def hit(at,g=.7):
    thump(at,52,.22,g); n=int(.25*SR); add(bp(nz(n),800,7000)*env(n,.001,.035),at,g*.55)
    add(hp(nz(n),5000)*env(n,.0005,.012),at,g*.4,.35); add(hp(nz(n),5000)*env(n,.0005,.012),at+.007,g*.4,.65)
IR=lp(nz(int(1.8*SR)),5000)*np.exp(-np.arange(int(1.8*SR))/SR*3.2)
def boom(at,g=1.):
    n=int(2.4*SR); tt=np.arange(n)/SR; fr=34+60*np.exp(-tt*6); ph=2*np.pi*np.cumsum(fr)/SR
    add(np.sin(ph)*env(n,.003,.9),at,g); b=lp(nz(int(.3*SR)),2200)*env(int(.3*SR),.002,.06)
    tail=fftconvolve(b,IR)[:n]; tail/=np.abs(tail).max(); add(tail,at,.28*g,.3); add(np.roll(tail,700),at,.28*g,.7); add(b,at,.5*g)
def tick(at,g=.35,f=3800,pan=.5):
    n=int(.03*SR); add(bp(nz(n),f*.7,f*1.4)*env(n,.0003,.004),at,g,pan)
def riser(a,b,g=.35):
    n=int((b-a)*F*SR); tt=np.arange(n)/n; x=sweep(n,300,9000,1.3)*tt**2.4; add(x,a,g,.45); add(np.roll(x,400),a,g,.55)
def blip(at,f=1400,g=.18):
    n=int(.08*SR); tt=np.arange(n)/SR; add(np.sin(2*np.pi*f*tt*(1+tt*3))*env(n,.001,.02),at,g)

# пульс 120 BPM: с 3.5 до 13 (тише на интерфейсе)
for b in np.arange(3.5,13.0,0.5):
    g=.42 if not(8<=b<10) else .26
    thump(b,48,.16,g)
    tick(b+.25,.08,6000,.5+.25*np.sin(b*3))
# S1: точка, линия, арки, искры
blip(0.0,1200,.22); hit(0.0,.35); whoosh(.72,.4,.25,.5,.5); tick(.3,.3); tick(.72,.3)
for i in range(3): tick(.8+i*.08,.18,5200,.3+i*.2)
riser(.6,1.42,.32)
# S2: окно-арка, буквы, панорама
whoosh(1.9,.6,.55,.5,.5); boom(2.25,.75)
for i in range(10): tick(2.02+i*.035,.22,3000+i*120,.2+i*.06)
whoosh(3.45,.5,.75,.85,.1)
# S3: слова
for c in (3.5,4.0,4.5,5.0): hit(c,.75)
for i in range(5): tick(3.5+i*.04,.2,4200,.3+i*.1)
for i in range(5): tick(4.0+i*.045,.2,2600,.3+i*.1)
for i in range(8): tick(4.5+i*.012,.18,5200,.2+i*.08)
whoosh(5.45,.45,.5,.5,.5)
# S4: карта
boom(5.6,.55)
for i in range(60): tick(5.55+i*.02,.06,7000,rng.uniform(.2,.8))
for st,pan in ((5.95,(.85,.15)),(6.1,(.75,.25))):
    n=int(1.35*F*SR); tt=np.arange(n)/n; x=sweep(n,180,1400,1.5)*np.sin(np.pi*tt)**1.2
    p=np.linspace(*pan,n); i=int(st*F*SR); L[i:i+n]+=x*.32*np.sqrt(2*(1-p)); R[i:i+n]+=x*.32*np.sqrt(2*p)
for x in np.arange(5.95,7.2,0.045): tick(x,.07,3300)
blip(5.85,900,.12); blip(7.0,1100,.12); blip(7.1,1300,.1)
riser(7.0,7.6,.4); whoosh(7.95,.5,.6,.5,.5)
# S5: карточки
hit(8.0,.6)
for i in range(3): whoosh(8.15+i*.07,.3,.22,.3+i*.2,.3+i*.2)
whoosh(8.85,.35,.2,.3,.7); tick(9.05,.2,2400); blip(9.22,1800,.16); tick(9.22,.35,2000)
whoosh(9.75,.55,.6,.5,.5)
# S6: цифры
hit(10.0,.65)
for x in np.arange(10.1,11.1,0.035): tick(x,.08,4200,rng.uniform(.3,.7))
for i in range(3): blip(10.95+i*.12,1000+i*250,.12)
whoosh(11.45,.4,.4,.5,.5)
# S7: плитки
hit(11.5,.6)
for i in range(12): tick(11.5+i*.05,.16,2200+i*150,.15+(i%4)*.23)
whoosh(12.45,.4,.45,.5,.5); riser(12.4,13.0,.42)
# S8: частицы и логотип
for i in range(400):
    x=rng.uniform(13.0,13.85); tick(x,rng.uniform(.02,.06)*(1-(13.85-x)/0.85*.5),rng.uniform(3000,9000),rng.uniform(.1,.9))
hit(13.0,.45); boom(13.85,1.0)
n=int(1.4*SR); tt=np.arange(n)/n; add(hp(nz(n),6000)*np.sin(np.pi*tt)**2,14.3,.12,.4); add(hp(nz(n),6000)*np.sin(np.pi*tt)**2,14.32,.12,.6)
for i in range(22): tick(14.1+i*.012,.05,6500,.2+i*.03)

fade=np.clip((DUR-t)/.25,0,1); L*=fade; R*=fade
m=np.vstack([L,R]).T; m=hp(m.T,25).T; m/=np.abs(m).max()*1.02
wavfile.write('sfx.wav',SR,(m*32767).astype(np.int16)); print('ok')
