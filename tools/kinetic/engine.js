// Kinetic — движок вертикальных роликов в стиле «кинетическая типографика».
// Всё детерминировано: seek(t) рисует кадр на момент t, поэтому рендер покадровый и без рассинхрона.
// Каждое появление элемента и каждый переход добавляют звуковую метку в CUES — звуки потом ставятся ровно в эти моменты.
(function(){
  const W = 1080, H = 1920;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    expo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
  };
  const P = (t, at, dur) => clamp((t - at) / dur);
  const CUES = [];
  const cue = (t, type, o = {}) => CUES.push(Object.assign({ t: +t.toFixed(3), type }, o));

  const scenes = [];
  // Анимации появления: каждая возвращает стиль элемента в момент t и регистрирует свой звук
  const PRESETS = {
    pop:   { dur: .45, sfx: "pop",   f: (p) => ({ o: clamp(p * 3), s: lerp(.2, 1, E.back(p)) }) },
    rise:  { dur: .55, sfx: "tick",  f: (p) => ({ o: clamp(p * 2), y: lerp(70, 0, E.out(p)) }) },
    drop:  { dur: .5,  sfx: "tick",  f: (p) => ({ o: clamp(p * 2), y: lerp(-70, 0, E.out(p)) }) },
    left:  { dur: .55, sfx: "swish", f: (p) => ({ o: clamp(p * 2), x: lerp(-160, 0, E.expo(p)) }) },
    right: { dur: .55, sfx: "swish", f: (p) => ({ o: clamp(p * 2), x: lerp(160, 0, E.expo(p)) }) },
    track: { dur: .8,  sfx: "swish", f: (p) => ({ o: clamp(p * 1.6), blur: lerp(12, 0, E.out(p)), ls: lerp(.6, 0, E.out(p)) }) },
    zoom:  { dur: .6,  sfx: "pop",   f: (p) => ({ o: clamp(p * 2.5), s: lerp(2.4, 1, E.expo(p)), blur: lerp(10, 0, E.out(p)) }) },
    slam:  { dur: .35, sfx: "impact",f: (p) => ({ o: clamp(p * 4), s: lerp(3, 1, E.out(p)) }) },
    fade:  { dur: .6,  sfx: null,    f: (p) => ({ o: E.out(p) }) },
    mask:  { dur: .55, sfx: "tick",  f: (p) => ({ o: 1, clip: lerp(100, 0, E.out(p)) }) },
    glass: { dur: .6,  sfx: "whoosh_s", f: (p) => ({ o: clamp(p * 2), s: lerp(.6, 1, E.back(p)), blur: lerp(8, 0, p) }) }
  };

  function Scene(name, start, end, opts = {}){
    const root = document.createElement("div");
    root.className = "scene " + (opts.theme || "night");
    root.innerHTML = `<div class="cam"></div>`;
    document.getElementById("stage").appendChild(root);
    const cam = root.firstChild;
    const sc = { name, start, end, root, cam, items: [], opts, enter: opts.enter || "zoom" };
    scenes.push(sc);
    // элемент сцены: html, позиция и анимация появления/ухода
    sc.add = (html, o = {}) => {
      const d = document.createElement("div");
      d.className = "el " + (o.cls || "");
      d.innerHTML = html;
      Object.assign(d.style, { left: (o.x ?? 540) + "px", top: (o.y ?? 960) + "px", width: o.w ? o.w + "px" : "", zIndex: o.z || 1 });
      if (o.anchor !== false) d.style.transform = "translate(-50%,-50%)";
      cam.appendChild(d);
      const it = { d, at: o.at ?? start, anim: o.anim || "pop", out: o.out, outAnim: o.outAnim || "fade", dur: o.dur, float: o.float, tick: o.tick, sfx: o.sfx };
      sc.items.push(it);
      const pr = PRESETS[it.anim];
      const s = it.sfx === undefined ? pr && pr.sfx : it.sfx;
      if (s) cue(it.at, s, o.sfxOpts || {});
      if (o.type) { // печать по буквам
        const txt = d.querySelector("[data-type]");
        it.typeEl = txt; it.typeText = txt.textContent; it.typeCps = o.cps || 22;
        for (let i = 0; i < it.typeText.length; i++) if (it.typeText[i] !== " ") cue(it.at + i / it.typeCps, "key", { v: .35 });
      }
      if (o.count) { it.count = o.count; }
      return it;
    };
    sc.cue = cue;
    return sc;
  }

  function styleOf(it, t){
    const pr = PRESETS[it.anim];
    const dur = it.dur || (pr ? pr.dur : .5);
    const p = P(t, it.at, dur);
    let st = pr ? pr.f(p) : { o: 1 };
    if (t < it.at) st = Object.assign({}, st, { o: 0 });
    if (it.out != null && t > it.out) {
      const q = E.in(P(t, it.out, .35));
      st = Object.assign({}, st, { o: (st.o ?? 1) * (1 - q), s: (st.s ?? 1) * lerp(1, it.outAnim === "zoom" ? 1.6 : .9, q), blur: (st.blur || 0) + q * 8 });
    }
    if (it.float) st.y = (st.y || 0) + Math.sin((t + it.at) * 1.3) * it.float;
    return st;
  }

  function apply(it, t){
    const st = styleOf(it, t), d = it.d;
    d.style.opacity = st.o ?? 1;
    const tr = `translate(-50%,-50%) translate(${(st.x || 0).toFixed(1)}px,${(st.y || 0).toFixed(1)}px) scale(${(st.s ?? 1).toFixed(4)})`;
    d.style.transform = tr;
    d.style.filter = st.blur > .05 ? `blur(${st.blur.toFixed(2)}px)` : "";
    if (st.ls != null) d.style.letterSpacing = st.ls.toFixed(3) + "em";
    if (st.clip != null) d.style.clipPath = `inset(${st.clip.toFixed(1)}% 0 0 0)`;
    if (it.typeEl) {
      const n = Math.floor(clamp((t - it.at) * it.typeCps, 0, it.typeText.length));
      it.typeEl.innerHTML = it.typeText.slice(0, n) + (n < it.typeText.length && t >= it.at ? '<span class="caret">|</span>' : "");
    }
    if (it.count) {
      const [a, b, dur] = it.count, q = E.out(P(t, it.at, dur || .8));
      d.querySelector("[data-count]").textContent = Math.round(lerp(a, b, q));
    }
    if (it.tick) it.tick(d, t, P);
  }

  // Переходы между сценами: камера «пролетает» в следующую сцену
  const ENTER = {
    zoom:   p => ({ o: clamp(p * 3), s: lerp(.82, 1, E.expo(p)), blur: lerp(14, 0, E.out(p)) }),
    up:     p => ({ o: 1, y: lerp(H, 0, E.expo(p)) }),
    left:   p => ({ o: 1, x: lerp(W, 0, E.expo(p)) }),
    circle: p => ({ o: 1, clip: `circle(${lerp(0, 125, E.inOut(p)).toFixed(2)}% at 50% 50%)` }),
    cut:    p => ({ o: 1 })
  };
  const EXIT = {
    zoom:   q => ({ s: lerp(1, 1.5, E.in(q)), blur: q * 18, o: 1 - q }),
    up:     q => ({ y: lerp(0, -H * .35, E.in(q)) }),
    left:   q => ({ x: lerp(0, -W * .4, E.in(q)) }),
    circle: q => ({}),
    cut:    q => ({})
  };
  const TD = .5; // длительность перехода

  function finalize(){
    scenes.sort((a, b) => a.start - b.start);
    scenes.forEach((sc, i) => { if (i > 0) cue(sc.start - .12, sc.enter === "circle" ? "whoosh" : "whoosh", { v: 1 }); });
    window.CUES = CUES.sort((a, b) => a.t - b.t);
  }

  window.seek = function(t, frame){
    scenes.forEach((sc, i) => {
      const next = scenes[i + 1];
      const visible = t >= sc.start - .001 && (!next || t < next.start + TD);
      sc.root.style.display = visible ? "" : "none";
      if (!visible) return;
      let st = { o: 1, s: 1, x: 0, y: 0, blur: 0 };
      if (i > 0 && t < sc.start + TD) Object.assign(st, ENTER[sc.enter](P(t, sc.start, TD)));
      if (next && t > next.start) Object.assign(st, EXIT[next.enter](P(t, next.start, TD)));
      sc.root.style.zIndex = i;
      sc.root.style.opacity = st.o ?? 1;
      sc.root.style.clipPath = st.clip || "";
      sc.root.style.transform = `translate(${st.x || 0}px,${st.y || 0}px) scale(${st.s ?? 1})`;
      sc.root.style.filter = st.blur > .05 ? `blur(${st.blur.toFixed(2)}px)` : "";
      // постоянный лёгкий «дрейф» камеры внутри сцены, как в референсе
      const k = P(t, sc.start, Math.max(.5, (next ? next.start : sc.end) - sc.start + TD));
      const cm = sc.opts.cam || { s: [1, 1.07], y: [0, 0] };
      const camY = typeof cm.y === "function" ? cm.y(t) : lerp(cm.y[0], cm.y[1], E.inOut(k));
      sc.cam.style.transform = `translateY(${camY}px) scale(${lerp(cm.s[0], cm.s[1], k)})`;
      sc.items.forEach(it => apply(it, t));
      if (sc.opts.tick) sc.opts.tick(sc, t);
    });
    if (window.grain) window.grain(frame || 0);
  };

  window.K = { Scene, cue, finalize, E, P, lerp, clamp, W, H, CUES };
})();
