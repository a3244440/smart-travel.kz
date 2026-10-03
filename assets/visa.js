(function(){

  // ---------- schema ----------
  const PASSPORT = [
    ['surname','f.surname','text'],
    ['given_names','f.given_names','text'],
    ['sex','f.sex','select',[['','—'],['M','sex.M'],['F','sex.F']]],
    ['date_of_birth','f.date_of_birth','date'],
    ['place_of_birth','f.place_of_birth','text'],
    ['nationality','f.nationality','text'],
    ['passport_number','f.passport_number','text'],
    ['personal_number','f.personal_number','text'],
    ['issue_date','f.issue_date','date'],
    ['expiry_date','f.expiry_date','date'],
    ['issuing_authority','f.issuing_authority','text','wide'],
    ['mrz','f.mrz','textarea','wide']
  ];
  const REQUIRED = ['surname','given_names','sex','date_of_birth','nationality','passport_number','issue_date','expiry_date'];
  const TRIP = [
    ['purpose','f.purpose','select',[['umrah','p.umrah'],['tourism','p.tourism'],['cruise_umrah','p.cruise_umrah'],['business','p.business']]],
    ['arrival','f.arrival','date'],
    ['nights','f.nights','number'],
    ['contact_name','f.contact_name','text'],
    ['phone','f.phone','tel'],
    ['email','f.email','email'],
    ['comment','f.comment','textarea2','wide']
  ];

  let uid = 0;
  const newTraveller = () => ({ id: ++uid, status:'empty', preview:null, fileName:'', fields:{}, ai:{}, error:'' });
  const state = { travellers:[newTraveller()], active:0, trip:{purpose:'umrah'} };
  const cur = () => state.travellers[state.active];

  // ---------- capabilities ----------
  let sample = null, canImages = false, downloads = null;
  const ready = (async () => {
    if(!window.claude || typeof claude.use!=='function') return;
    try{
      sample = await claude.use('sample');
      if(sample){ const lim = await sample.limits().catch(()=>null); canImages = !!(lim && lim.images); }
    }catch(e){ sample = null; }
    try{ downloads = await claude.use('downloads'); }catch(e){ downloads = null; }
  })();

  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const fmt = iso => { if(!iso) return ''; const [y,m,d] = iso.split('-'); return d && m && y ? `${d}.${m}.${y}` : iso; };
  const isISO = s => /^\d{4}-\d{2}-\d{2}$/.test(s||'');
  const L = key => key.includes('.') ? t(key) : key;                // подпись на языке сайта
  const RU = (key, vars) => I18N.tIn('ru', key, vars);             // для менеджера — всегда по-русски
  const fieldName = k => t('f.' + k).toLowerCase();

  function mrzDigit(str){
    const w=[7,3,1]; let sum=0;
    for(let i=0;i<str.length;i++){
      const c=str[i]; let v=0;
      if(c==='<') v=0; else if(/[0-9]/.test(c)) v=+c; else if(/[A-Z]/.test(c)) v=c.charCodeAt(0)-55; else return -1;
      sum += v*w[i%3];
    }
    return sum%10;
  }
  function checkMRZ(mrz, f){
    const lines = String(mrz||'').toUpperCase().replace(/[ \t]/g,'').split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const l2 = lines.find(l => l.length===44 && /^[A-Z0-9<]+$/.test(l) && !l.startsWith('P'));
    if(!l2) return null;
    const parts = [[l2.slice(0,9),l2[9]],[l2.slice(13,19),l2[19]],[l2.slice(21,27),l2[27]]];
    const sumsOk = parts.every(([v,d]) => String(mrzDigit(v))===d);
    const num = l2.slice(0,9).replace(/</g,'');
    const numMatch = !f.passport_number || num === String(f.passport_number).toUpperCase().replace(/\s/g,'');
    return { sumsOk, numMatch };
  }
  function addMonths(d,n){ const x=new Date(d); x.setMonth(x.getMonth()+n); return x; }

  // ---------- file handling ----------
  async function pdfToBlob(file){
    if(!window.pdfjsLib) throw new Error('pdf');
    try{ pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }catch(e){}
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:buf}).promise;
    const page = await pdf.getPage(1);
    const vp0 = page.getViewport({scale:1});
    const scale = Math.min(3, 1800/Math.max(vp0.width,vp0.height));
    const vp = page.getViewport({scale});
    const cv = document.createElement('canvas'); cv.width=vp.width; cv.height=vp.height;
    await page.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
    return await new Promise(r => cv.toBlob(r,'image/jpeg',.92));
  }

  async function handleFile(file){
    if(!file) return;
    const t = cur();
    const isPdf = file.type==='application/pdf' || /\.pdf$/i.test(file.name);
    const isImg = /^image\/(jpeg|png|webp)$/.test(file.type);
    $('#work').hidden = false;
    t.fileName = file.name; t.error=''; t.progress=''; t.status='reading';
    render();
    $('#work').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});

    let blob;
    try{
      if(isPdf) blob = await pdfToBlob(file);
      else if(isImg) blob = file;
      else throw new Error('type');
    }catch(e){
      t.status='error';
      t.error = e.message==='type' ? 'm.badType' : 'm.badPdf';
      render(); return;
    }
    if(t.preview) URL.revokeObjectURL(t.preview);
    t.preview = URL.createObjectURL(blob);
    render();

    await ready;
    if(!sample || !canImages){
      try{
        const data = await readMRZ(blob, msg => { t.progress = msg; renderDoc(); });
        applyData(t, data);
        t.status = 'done';
        t.partial = true;
      }catch(e){
        t.status='error';
        t.error = 'm.mrzFail';
      }
      render(); return;
    }
    try{
      const prompt = `The image is the photo/data page of a passport, uploaded by its holder to fill in a Saudi Arabia eVisa (Umrah/tourist) application.
Extract the data exactly as printed. Use the Latin-script version of names (as in the MRZ/Latin fields, without "<" fillers). Dates as YYYY-MM-DD. Sex as "M" or "F". Nationality as the country name in English. If a field is not visible or unreadable, use null — never guess.
Copy the two MRZ lines (bottom of the page) exactly, each 44 characters, separated by "\\n".
If the image is not a passport data page, reply {"error":"not_passport"}.
Reply with only this JSON object:
{"surname":string|null,"given_names":string|null,"sex":"M"|"F"|null,"date_of_birth":string|null,"place_of_birth":string|null,"nationality":string|null,"passport_number":string|null,"personal_number":string|null,"issue_date":string|null,"expiry_date":string|null,"issuing_authority":string|null,"mrz":string|null}`;
      const data = await sample.json(prompt, { images: blob });
      if(!data || typeof data!=='object') throw {code:'invalid_json'};
      if(data.error==='not_passport'){
        t.status='error'; t.error='m.notPassport'; render(); return;
      }
      applyData(t, data);
      t.status='done'; t.partial=false;
    }catch(e){
      t.status='error';
      const code = e && e.code;
      t.error = code==='not_granted' || code==='sampling_disabled' ? 'm.notGranted'
        : code==='rate_limited' ? 'm.rate'
        : code==='image_rejected' ? 'm.imgRejected'
        : 'm.recognizeFail';
    }
    render();
  }


  function applyData(t, data){
    t.ai = {};
    for(const [k,,type] of PASSPORT){
      let v = data[k];
      if(v===null || v===undefined || v==='') continue;
      v = String(v).trim();
      if(type==='date' && !isISO(v)) continue;
      if(k==='sex') v = v.toUpperCase().startsWith('F') ? 'F' : v.toUpperCase().startsWith('M') ? 'M' : '';
      if(['surname','given_names','passport_number'].includes(k)) v = v.toUpperCase();
      if(!t.fields[k]) { t.fields[k] = v; t.ai[k] = true; }
    }
  }

  // ---------- MRZ OCR in the browser (Tesseract.js), used outside claude.ai ----------
  const COUNTRIES = {KAZ:'Kazakhstan',RUS:'Russia',UZB:'Uzbekistan',KGZ:'Kyrgyzstan',TJK:'Tajikistan',TKM:'Turkmenistan',AZE:'Azerbaijan',TUR:'Turkey',ARM:'Armenia',GEO:'Georgia',BLR:'Belarus',UKR:'Ukraine',MNG:'Mongolia',CHN:'China',D:'Germany',GBR:'United Kingdom',USA:'United States'};
  function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  function cropToCanvas(img, fromY){
    const scale = Math.min(2.5, 2400 / img.naturalWidth);
    const w = Math.round(img.naturalWidth*scale), sy = Math.round(img.naturalHeight*fromY), sh = img.naturalHeight - sy;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = Math.round(sh*scale);
    const ctx = cv.getContext('2d'); ctx.filter = 'grayscale(1) contrast(1.6)';
    ctx.drawImage(img, 0, sy, img.naturalWidth, sh, 0, 0, cv.width, cv.height);
    return cv;
  }
  const toDigits = s => s.replace(/O|Q|D/g,'0').replace(/I|L/g,'1').replace(/Z/g,'2').replace(/S/g,'5').replace(/B/g,'8').replace(/G/g,'6');
  function mrzDate(s, future){
    s = toDigits(s); if(!/^\d{6}$/.test(s)) return null;
    const yy = +s.slice(0,2), now = new Date().getFullYear() % 100;
    const year = future ? 2000+yy : (yy > now ? 1900+yy : 2000+yy);
    return `${year}-${s.slice(2,4)}-${s.slice(4,6)}`;
  }
  function parseTD3(text){
    const lines = text.toUpperCase().replace(/[ «»]/g,'').replace(/[^A-Z0-9<\n]/g,'').split('\n').filter(l => l.length >= 36);
    const i1 = lines.findIndex(l => /^P[A-Z<]/.test(l));
    let l1 = i1 >= 0 ? lines[i1] : null, l2 = i1 >= 0 ? lines[i1+1] : lines[lines.length-1];
    if(!l2) throw new Error('no mrz');
    l2 = (l2 + '<'.repeat(44)).slice(0,44);
    const out = { mrz: (l1 ? (l1+'<'.repeat(44)).slice(0,44)+'\n' : '') + l2 };
    out.passport_number = l2.slice(0,9).replace(/</g,'');
    const nat = l2.slice(10,13).replace(/</g,'').replace(/0/g,'O');
    out.nationality = COUNTRIES[nat] || nat;
    out.date_of_birth = mrzDate(l2.slice(13,19), false);
    out.sex = l2[20]==='F' ? 'F' : l2[20]==='M' ? 'M' : null;
    out.expiry_date = mrzDate(l2.slice(21,27), true);
    const pn = toDigits(l2.slice(28,42).replace(/</g,'')); if(/^\d{12}$/.test(pn)) out.personal_number = pn;
    if(l1){
      const names = l1.slice(5).replace(/0/g,'O').split('<<');
      out.surname = (names[0]||'').replace(/</g,' ').trim() || null;
      out.given_names = (names.slice(1).join(' ')||'').replace(/</g,' ').replace(/\s+/g,' ').trim() || null;
    }
    if(!out.passport_number || !out.date_of_birth) throw new Error('weak');
    return out;
  }
  let tessWorker = null;
  async function readMRZ(blob, onMsg){
    onMsg && onMsg('m.loadingOcr');
    if(!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js');
    if(!tessWorker){
      tessWorker = await Tesseract.createWorker('eng');
      await tessWorker.setParameters({ tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', preserve_interword_spaces:'0' });
    }
    const img = await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=URL.createObjectURL(blob); });
    onMsg && onMsg('m.readingMrz');
    let lastErr;
    for(const fromY of [0.62, 0.45, 0]){
      try{
        const { data } = await tessWorker.recognize(cropToCanvas(img, fromY));
        return parseTD3(data.text);
      }catch(e){ lastErr = e; }
    }
    throw lastErr;
  }

  // ---------- render ----------
  function render(){
    renderTabs(); renderDoc(); renderPassport(); renderTrip(); renderChecks();
  }
  function travellerLabel(t,i){
    const n = [t.fields.given_names, t.fields.surname].filter(Boolean).join(' ');
    return n ? n.split(' ').filter(Boolean).map(w=>w[0]+w.slice(1).toLowerCase()).join(' ') : window.t('traveller', { n: i+1 });
  }
  function renderTabs(){
    const el = $('#tabs');
    el.innerHTML = state.travellers.map((t,i) =>
      `<button class="tab" role="tab" aria-selected="${i===state.active}" data-i="${i}"><span class="dot ${t.status}"></span>${esc(travellerLabel(t,i))}</button>`
    ).join('') + `<button class="tab add" id="addT">${t('addPassport')}</button>`;
  }
  function renderDoc(){
    const t = cur();
    $('#docBox').innerHTML = t.preview
      ? `<div class="doc"><img src="${t.preview}" alt="${window.t('uploadedAlt')}"><div class="cap"><span>${esc(t.fileName)}</span><button id="replace">${window.t('replace')}</button></div></div>`
      : `<button class="btn ghost" id="replace" style="width:100%">${window.t('uploadBtn')}</button>`;
    let s = '';
    if(t.status==='reading') s = `<div class="status reading">${esc(window.t(t.progress||'m.reading'))}<div class="bar"><i></i></div></div>`;
    else if(t.status==='error') s = `<div class="status error">${esc(window.t(t.error))}</div>`;
    else if(t.status==='done') s = t.partial
      ? `<div class="status">${window.t('m.partial')}</div>`
      : `<div class="status">${window.t('m.full')}</div>`;
    $('#statusBox').innerHTML = s;
  }
  function fieldHTML(def, val, scope, extraCls=''){
    const [k,label,type,a] = def;
    const wide = (a==='wide' || def[3]==='wide' || def[4]==='wide') ? ' wide' : '';
    const id = `${scope}_${k}`;
    const dir = scope==='p' || ['tel','email','date','number'].includes(type) ? 'ltr' : 'auto';
    let ctrl;
    if(type==='select'){
      ctrl = `<select id="${id}" data-k="${k}" data-s="${scope}">${a.map(([v,l])=>`<option value="${v}"${v===(val||'')?' selected':''}>${L(l)}</option>`).join('')}</select>`;
    }else if(type==='textarea' || type==='textarea2'){
      ctrl = `<textarea id="${id}" data-k="${k}" data-s="${scope}" dir="${dir}" ${type==='textarea2'?'style="font-family:var(--sans);font-size:15px;letter-spacing:0"':''} rows="2" spellcheck="false">${esc(val)}</textarea>`;
    }else{
      ctrl = `<input id="${id}" data-k="${k}" data-s="${scope}" dir="${dir}" type="${type}" value="${esc(val)}" class="${extraCls}" ${type==='number'?'min="1" max="60"':''} autocomplete="off" spellcheck="false">`;
    }
    return `<div class="f${wide}"><label for="${id}">${L(label)}</label>${ctrl}<span class="hint" id="${id}_h"></span></div>`;
  }
  function renderPassport(){
    const t = cur();
    $('#passportFields').innerHTML = PASSPORT.map(d => fieldHTML(d, t.fields[d[0]], 'p', t.ai[d[0]]?'ai':'')).join('');
    $('#pSub').textContent = window.t(t.status==='done' ? 'visa.pAuto' : 'visa.pLatin');
    updateHints();
  }
  function renderTrip(){
    $('#tripFields').innerHTML = TRIP.map(d => fieldHTML(d, state.trip[d[0]], 't')).join('');
  }
  function updateHints(){
    const f = cur().fields;
    const latin = /^[A-Z][A-Z' \-]*$/;
    const set = (k,msg) => { const h=$(`#p_${k}_h`), i=$(`#p_${k}`); if(!h) return; h.textContent=msg||''; h.className='hint'+(msg?' bad':''); i && i.classList.toggle('bad',!!msg); };
    set('surname', f.surname && !latin.test(f.surname) ? t('h.latin') : '');
    set('given_names', f.given_names && !latin.test(f.given_names) ? t('h.latin') : '');
    const v = validity(f);
    set('expiry_date', v && v.level==='err' ? v.short : '');
  }
  function validity(f){
    if(!isISO(f.expiry_date)) return null;
    const from = isISO(state.trip.arrival) ? new Date(state.trip.arrival) : new Date();
    const exp = new Date(f.expiry_date);
    const need = addMonths(from,6);
    const fromTxt = t(isISO(state.trip.arrival) ? 'v.fromArrival' : 'v.fromToday');
    if(exp < from) return {level:'err', title:t('v.expired'), note:t('v.expiredOn', { date: fmt(f.expiry_date) }), short:t('v.expired')};
    if(exp < need) return {level:'err', title:t('v.less6'), note:t('v.need', { date: need.toLocaleDateString(I18N.locale), from: fromTxt }), short:t('v.need6')};
    return {level:'ok', title:t('v.ok'), note:t('v.validUntil', { date: fmt(f.expiry_date) })};
  }
  function renderChecks(){
    const f = cur().fields;
    const items = [];
    const missing = REQUIRED.filter(k => !f[k]);
    items.push(missing.length
      ? {level: missing.length===REQUIRED.length?'idle':'warn', title:t('c.notAll'), note:t('c.left', { list: missing.map(fieldName).join(t('sep')) })}
      : {level:'ok', title:t('c.allDone')});
    const v = validity(f);
    items.push(v || {level:'idle', title:t('c.validity'), note:t('c.enterExpiry')});
    const m = checkMRZ(f.mrz, f);
    if(!m) items.push({level:'idle', title:t('c.mrz'), note:t('c.mrzWait')});
    else if(!m.sumsOk) items.push({level:'warn', title:t('c.mrzBad'), note:t('c.mrzBadNote')});
    else if(!m.numMatch) items.push({level:'warn', title:t('c.numMismatch'), note:t('c.checkNumber')});
    else items.push({level:'ok', title:t('c.mrzOk'), note:t('c.mrzOkNote')});
    if(isISO(f.date_of_birth)){
      const age = Math.floor((Date.now()-new Date(f.date_of_birth))/31557600000);
      if(age<18) items.push({level:'warn', title:t('c.minor', { age }), note:t('c.minorNote')});
    }
    const icon = {ok:'✓',warn:'!',err:'×',idle:''};
    $('#checks').innerHTML = items.map(i=>`<li class="${i.level}"><i>${icon[i.level]}</i><div>${esc(i.title)}${i.note?`<small>${esc(i.note)}</small>`:''}</div></li>`).join('');
  }

  // ---------- export ----------
  const PURPOSE = {umrah:'Умра',tourism:'Туризм',cruise_umrah:'Круиз + Умра',business:'Деловая'};
  function buildText(){
    const tr = state.trip;
    let out = `ЗАЯВКА НА ВИЗУ — САУДОВСКАЯ АРАВИЯ\n${(window.SITE && SITE.brand) || "smart-travel.kz"}\n\n`;
    out += `Цель: ${PURPOSE[tr.purpose]||''}\nДата въезда: ${fmt(tr.arrival)||'—'}\nНочей: ${tr.nights||'—'}\nКонтакт: ${tr.contact_name||'—'}, ${tr.phone||'—'}, ${tr.email||'—'}\n`;
    if(tr.comment) out += `Пожелания: ${tr.comment}\n`;
    state.travellers.forEach((t,i)=>{
      out += `\n— Путешественник ${i+1} —\n`;
      PASSPORT.forEach(([k,l,type])=>{
        if(k==='mrz') return;
        let v = t.fields[k]||''; if(type==='date') v = fmt(v); if(k==='sex') v = v==='M'?'Мужской':v==='F'?'Женский':'';
        out += `${RU(l)}: ${v||'—'}\n`;
      });
    });
    return out;
  }
  function buildCsv(){
    const cols = [...PASSPORT.filter(d=>d[0]!=='mrz').map(d=>d[0]), 'purpose','arrival','nights','contact_name','phone','email','comment'];
    const head = [...PASSPORT.filter(d=>d[0]!=='mrz').map(d=>RU(d[1])), 'Цель','Дата въезда','Ночей','Контакт','Телефон','Email','Пожелания'];
    const q = v => `"${String(v??'').replace(/"/g,'""')}"`;
    const rows = state.travellers.map(t => cols.map(c => {
      if(c in state.trip || ['purpose','arrival','nights','contact_name','phone','email','comment'].includes(c)){
        const v = state.trip[c]; return q(c==='purpose'?PURPOSE[v]:(c==='arrival'?fmt(v):v));
      }
      const type = (PASSPORT.find(d=>d[0]===c)||[])[2];
      return q(type==='date'?fmt(t.fields[c]):t.fields[c]);
    }).join(';'));
    return '\uFEFF' + [head.map(q).join(';'), ...rows].join('\r\n');
  }
  let sent = null;
  function renderDone(){
    if(!sent) return;
    const msg = t('s.waHello', { id: sent.id }) + '\n\n' + sent.text;
    $('#done').innerHTML = `<div class="success" role="status">
        <h3>${t('s.sent')}</h3>
        <p style="margin:0 0 6px;color:var(--ink-2)">${t('s.sentText')}</p>
        <div class="code" dir="ltr">${esc(sent.id)}</div>
        <div class="actions"><a class="btn" href="${waLink(msg)}" target="_blank" rel="noopener">${t('s.sendWa')}</a>
        <a class="btn ghost" href="/cabinet?id=${encodeURIComponent(sent.id)}">${t('s.checkStatus')}</a></div></div>`;
  }
  function toast(msg,bad){ const el=$('#toast'); el.textContent=msg; el.className='toast'+(bad?' bad':''); clearTimeout(toast.t); toast.t=setTimeout(()=>el.textContent='',4000); }

  // ---------- events ----------
  const fileInput = $('#file');
  const drop = $('#drop');
  fileInput.addEventListener('change', e => { handleFile(e.target.files[0]); fileInput.value=''; });
  drop.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fileInput.click(); } });
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

  document.addEventListener('click', async e => {
    const tab = e.target.closest('.tab[data-i]');
    if(tab){ state.active = +tab.dataset.i; render(); return; }
    if(e.target.closest('#addT')){ state.travellers.push(newTraveller()); state.active = state.travellers.length-1; render(); fileInput.click(); return; }
    if(e.target.closest('#replace')){ fileInput.click(); return; }
    if(e.target.closest('#submitApp')){
      const problems = [];
      state.travellers.forEach((t,i) => {
        const miss = REQUIRED.filter(k => !t.fields[k]);
        if(miss.length) problems.push(window.t('s.missing', { who: travellerLabel(t,i), list: miss.map(fieldName).join(window.t('sep')) }));
        const v = validity(t.fields); if(v && v.level==='err') problems.push(`${travellerLabel(t,i)}: ${v.title.toLowerCase()}`);
      });
      if(!state.trip.phone) problems.push(t('s.phone'));
      if(problems.length){ toast(problems[0], true); return; }
      const btn = e.target.closest('#submitApp');
      if(btn.disabled) return;
      btn.disabled = true; toast(t('s.sending'));
      let rec;
      try { rec = await Store.add({ trip: Object.assign({}, state.trip), travellers: state.travellers.map(t => ({ fields: Object.assign({}, t.fields) })) }); }
      catch(err){ toast(t('s.fail'), true); return; }
      finally { btn.disabled = false; }
      toast('');
      sent = { id: rec.id, text: buildText() };
      renderDone();
      $('#done').scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }
    if(e.target.closest('#saveCsv')){
      const name = (state.travellers[0].fields.surname||'zayavka').toLowerCase().replace(/[^a-z0-9]+/g,'-');
      const filename = `viza-saudi-${name}.csv`;
      await ready;
      if(downloads){
        try{ await downloads.save({filename, data: buildCsv()}); toast(t('s.saved')); }
        catch(err){ if(err && err.code!=='declined') toast(t('s.saveFail'), true); }
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([buildCsv()], {type:'text/csv;charset=utf-8'}));
      a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      toast(t('s.saved'));
      return;
    }
    if(e.target.closest('#copyTxt')){
      try{ await navigator.clipboard.writeText(buildText()); toast(t('s.copied')); }
      catch(err){ toast(t('s.copyFail'), true); }
    }
  });

  document.addEventListener('input', e => {
    const el = e.target; const k = el.dataset && el.dataset.k; if(!k) return;
    if(el.dataset.s==='p'){
      const t = cur();
      let v = el.value;
      if(['surname','given_names','passport_number'].includes(k)){ const pos=el.selectionStart; v=v.toUpperCase(); el.value=v; try{el.setSelectionRange(pos,pos);}catch(_){} }
      t.fields[k]=v; delete t.ai[k]; el.classList.remove('ai');
      if(k==='surname'||k==='given_names') renderTabs();
      updateHints(); renderChecks();
    }else{
      state.trip[k]=el.value;
      if(k==='arrival'){ updateHints(); renderChecks(); }
    }
  });
  document.addEventListener('change', e => {
    const el=e.target; if(el.tagName==='SELECT' && el.dataset.k){
      if(el.dataset.s==='p'){ cur().fields[el.dataset.k]=el.value; } else state.trip[el.dataset.k]=el.value;
      renderChecks();
    }
  });

  document.addEventListener('langchange', () => { render(); renderDone(); $('#toast').textContent = ''; });
  render();
})();
