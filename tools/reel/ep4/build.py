import subprocess, os, sys
S=sys.argv[1]; F='/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FPS=30; XF=0.4
# (image, duration, zoom dir, [(t0,t1,text)], extra overlays)
sc=[
 ('u1',3.2,'in', [(0.3,3.0,'Ата, ішіңіз!')]),
 ('u2',3.8,'in', [(0.2,3.6,'Ата, тағы бір рет…\nқайтадан ішіңізші.')]),
 ('u3',2.8,'in', []),
 ('u4',5.2,'out',[(0.3,2.3,'Кімге бердің?'),(2.6,5.0,'Аллаһ үшін, әрине!')]),
 ('u7',4.0,'in', [(0.3,2.2,'Ал мынау кімге?')]),
 ('u6',5.0,'in', []),
 ('u5',6.4,'in', [(0.3,2.3,'Мұны ешкім көрмеді.'),(2.6,3.9,'Ешкім…'),(4.3,6.2,'Аллаһтан басқа.')]),
 ('u10',3.8,'out',[]),
 ('u9',3.4,'in', []),
 ('u8',4.2,'still',[]),
]
parts=[]
for i,(img,d,z,subs) in enumerate(sc):
    n=int(d*FPS)
    if z=='in': zexp=f"1.0+0.07*on/{n}"
    elif z=='out': zexp=f"1.07-0.07*on/{n}"
    else: zexp=f"1.0+0.02*on/{n}"
    vf=(f"scale=2160:3840,zoompan=z='{zexp}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1080x1920:fps={FPS}")
    if img=='u4':  # 1000 ❤ overlay on the phone moment
        t=os.path.join(S,'txt','likes.txt'); open(t,'w').write('1000 ♥')
        vf+=(f",drawtext=fontfile={F}:textfile={t}:fontsize=64:fontcolor=white:box=1:boxcolor=0xE0245E@0.92:boxborderw=22"
             f":x=w-tw-90:y=640:enable='between(t,0.4,{d})'")
    for k,(a,b,s) in enumerate(subs):
        t=os.path.join(S,'txt',f's{i}_{k}.txt'); open(t,'w').write(s)
        vf+=(f",drawtext=fontfile={F}:textfile={t}:fontsize=58:line_spacing=14:fontcolor=white"
             f":borderw=5:bordercolor=black@0.85:shadowx=0:shadowy=4:shadowcolor=black@0.5"
             f":x=(w-tw)/2:y=h*0.74:text_align=C:alpha='min(1,(t-{a})/0.15)*min(1,({b}-t)/0.15)':enable='between(t,{a},{b})'")
    out=os.path.join(S,'build',f'c{i:02d}.mp4')
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-loop','1','-i',os.path.join(S,'img',img+'.png'),
        '-vf',vf,'-frames:v',str(n),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p',out],check=True)
    parts.append((out,d))
# xfade chain
args=[]; [args.extend(['-i',p]) for p,_ in parts]
fl=[]; off=0; prev='[0:v]'
for i in range(1,len(parts)):
    off+=parts[i-1][1]-XF
    lab=f'[v{i}]'
    fl.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.2f}{lab}")
    prev=lab
fl.append(f"{prev}fade=t=in:st=0:d=0.4,fade=t=out:st={off+parts[-1][1]-0.6:.2f}:d=0.6[v]")
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error',*args,'-filter_complex',';'.join(fl),'-map','[v]',
  '-c:v','libx264','-crf','20','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',os.path.join(S,'sol-kolyn-silent.mp4')],check=True)
# print scene start times for audio sync
t=0
for i,(p,d) in enumerate(parts): print(i, sc[i][0], round(t,2)); t+=d-XF
print('total',round(t+XF,2))
