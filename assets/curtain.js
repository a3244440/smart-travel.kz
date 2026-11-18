// Экран загрузки главной (как постер): руки раздвигают бархатные шторы, в «замочной скважине» — Кааба
// и башня с часами, затем камера «влетает» в скважину и открывается сайт.
// Один раз за визит (sessionStorage), не показывается при «уменьшении движения»; клик или клавиша — сразу открыть.
(function(){
  const root = document.documentElement;
  let seen = false;
  try { seen = sessionStorage.getItem("st_curtain") === "1"; } catch(e){}
  if(seen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try { sessionStorage.setItem("st_curtain", "1"); } catch(e){}

  const L = (window.I18N && I18N.lang) || "ru";
  const hello = { ru:"Ассаляму алейкум", kk:"Ассаляму алейкум", en:"Assalamu alaikum", ar:"السلام عليكم" }[L] || "Ассаляму алейкум";
  const sub = window.t ? t("home.h1") : "Умра со своим поколением";
  const KEY = "M100 0a72 72 0 0 1 40 131.8L170 300H30l30-168.2A72 72 0 0 1 100 0Z";
  const el = document.createElement("div");
  el.className = "cur";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div class="cur-bg"></div>
    <div class="cur-key"><div class="cur-win"><img src="/assets/curtain-kaaba.webp" alt="" decoding="async"></div><svg viewBox="-4 -4 208 308"><path d="${KEY}"/></svg></div>
    <div class="cur-side cur-l"><img class="cur-hand" src="/assets/curtain-hand.svg" alt=""></div>
    <div class="cur-side cur-r"><img class="cur-hand" src="/assets/curtain-hand.svg" alt=""></div>
    <div class="cur-word"><small>${hello}</small><b>UMRA YOUTH</b><span>${sub}</span></div>`;
  root.classList.add("cur-on");
  (document.body || root).prepend(el);

  // размер скважины и насколько раздвинуть шторы — от размера экрана
  function fit(){
    const w = innerWidth, h = innerHeight;
    const k = Math.min(h * 0.62 / 300, w * 0.5 / 200, 2.2);
    el.style.setProperty("--k", k.toFixed(3));
    el.style.setProperty("--pull", Math.round(100 * k + w * 0.05) + "px");
  }
  fit(); addEventListener("resize", fit);

  const start = performance.now();
  const at = (ms, f) => setTimeout(f, Math.max(0, ms - (performance.now() - start)));
  at(120, () => el.classList.add("p1"));
  at(820, () => el.classList.add("p2"));

  let opened = false;
  function open(){
    if(opened) return; opened = true;
    el.classList.add("p1", "p2", "p3");
    document.dispatchEvent(new Event("curtainopen"));
    setTimeout(() => { root.classList.remove("cur-on"); el.remove(); removeEventListener("resize", fit); }, 1500);
  }
  // держим «постер» ~1 с после раскрытия; ждём загрузку страницы, но не дольше 4 с
  Promise.race([
    new Promise(r => addEventListener("load", r, { once:true })),
    new Promise(r => setTimeout(r, 4000))
  ]).then(() => at(2700, open));
  el.addEventListener("click", open);
  addEventListener("keydown", open, { once:true });
})();
