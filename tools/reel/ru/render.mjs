// node render.mjs snap t1 t2 ...   |   node render.mjs all <fps> <sub> <from> <to>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const dir = process.cwd(); const [mode, ...a] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:1920, height:1080 } });
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if(m.type()==='error') errs.push(m.text()); });
await p.route('http://r/**', r => r.fulfill({ path: dir + decodeURIComponent(new URL(r.request().url()).pathname) }));
const F = Number(process.env.SPEED || 1);
await p.goto('http://r/reel.html');
await p.evaluate(F => { window.TS = F; }, F); await p.evaluate(() => window.ready); await p.waitForTimeout(300);
if (mode === 'snap') { fs.mkdirSync('snap', { recursive:true });
  for (const t of a.map(Number)) { await p.evaluate(([t, F]) => seek(t / F, Math.round(t*60)), [t, F]); await p.screenshot({ path:`snap/${t.toFixed(2)}.jpg`, type:'jpeg', quality:80 }); }
} else if (mode === 'list') { const [fps, sub, file] = [Number(a[0]), Number(a[1]), a[2]]; const frames = JSON.parse(fs.readFileSync(file)); fs.mkdirSync('sub8', { recursive:true });
  const shutter = 0.5 / fps;
  for (const n of frames) for (let s = 0; s < sub; s++) { const t = n / fps + (s / (sub - 1) - 0.5) * shutter; await p.evaluate(([t, n, F]) => seek(Math.max(0, t) / F, n), [t, n, F]); await p.screenshot({ path:`sub8/${String(n).padStart(4,'0')}_${s}.jpg`, type:'jpeg', quality:94 }); }
} else { const [fps, sub, from, to] = a.map(Number); fs.mkdirSync('sub', { recursive:true });
  const shutter = 0.5 / fps; // затвор 180°
  for (let n = from; n < to; n++) for (let s = 0; s < sub; s++) {
    const t = n / fps + (sub > 1 ? (s / (sub - 1) - 0.5) * shutter : 0);
    await p.evaluate(([t, n, F]) => seek(Math.max(0, t) / F, n), [t, n, F]);
    await p.screenshot({ path:`sub/${String(n).padStart(4,'0')}_${s}.jpg`, type:'jpeg', quality:94 });
  }
}
console.log('errors', errs); await b.close();
