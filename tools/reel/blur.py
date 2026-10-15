# усреднение подкадров = настоящий motion blur; потоково отдаёт кадры в ffmpeg
import numpy as np, sys, glob
from PIL import Image
N=900; SUB=3
out=sys.stdout.buffer
for n in range(N):
    acc=None
    import os
    src,k=('sub8',8) if os.path.exists(f'sub8/{n:04d}_7.jpg') else ('sub',SUB)
    for s in range(k):
        a=np.asarray(Image.open(f'{src}/{n:04d}_{s}.jpg').convert('RGB'),dtype=np.float32)
        acc=a if acc is None else acc+a
    out.write((acc/k+0.5).clip(0,255).astype(np.uint8).tobytes())
