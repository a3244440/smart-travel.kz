import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const dir = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage();
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('fail ' + r.url()));
await p.goto('file://' + dir + '/cert.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.pdf({ path: dir + '/out.pdf', width:'297mm', height:'210mm', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
console.log('errors', errs); await b.close();
