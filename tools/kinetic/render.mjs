// Рендер: node render.mjs <сцена.html> <папка_с_timing.json> [snap t1 t2 ...]
// Без "snap" — все кадры (30 fps) в <папка>/frames и звуковые метки в <папка>/cues.json
import fs from 'node:fs';
import path from 'node:path';
const PW = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const [htmlFile, outDir, mode, ...times] = process.argv.slice(2);
const root = path.dirname(path.resolve(htmlFile));
const repo = path.resolve(root, '../..');
const timing = fs.readFileSync(path.join(outDir, 'timing.json'), 'utf8');
const html = fs.readFileSync(htmlFile, 'utf8').replace('__TIMING__', timing);
const FPS = 30;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
// локальный «сервер»: http://k/<путь в репозитории> → файлы; сама сцена отдаётся как <папка сцены>/page.html
const rel = path.relative(repo, root);
await p.route('http://k/**', r => {
  const f = decodeURIComponent(new URL(r.request().url()).pathname);
  if (f === `/${rel}/page.html`) return r.fulfill({ body: html, contentType: 'text/html' });
  return r.fulfill({ path: path.join(repo, f) });
});
await p.goto(`http://k/${rel}/page.html`);
await p.evaluate(() => window.ready);
await p.waitForTimeout(300);
const dur = await p.evaluate(() => window.DURATION);
fs.writeFileSync(path.join(outDir, 'cues.json'), JSON.stringify(await p.evaluate(() => window.CUES), null, 0));
if (mode === 'snap') {
  for (const t of times.map(Number)) {
    await p.evaluate(([t]) => seek(t, 1), [t]);
    await p.screenshot({ path: path.join(outDir, `snap-${t}.jpg`), type: 'jpeg', quality: 80 });
  }
} else {
  const fdir = path.join(outDir, 'frames'); fs.mkdirSync(fdir, { recursive: true });
  const N = Math.ceil(dur * FPS);
  for (let n = 0; n < N; n++) {
    await p.evaluate(([t, n]) => seek(t, n), [n / FPS, n]);
    await p.screenshot({ path: path.join(fdir, String(n).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 });
    if (n % 150 === 0) console.log('кадр', n, '/', N);
  }
}
console.log('duration', dur, 'errors', errs);
await b.close();
