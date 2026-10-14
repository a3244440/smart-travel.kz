// Анимации главной: первый экран, миссия по словам, линия «Что дальше», счётчики, параллакс фото
(function(){
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const $ = s => document.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // первый экран: появление после загрузки фото
  const hero = $(".xh");
  const imgs = [...document.querySelectorAll(".xh img")];
  Promise.all(imgs.map(i => i.decode ? i.decode().catch(() => {}) : null)).then(() => root.classList.add("xh-ready"));
  setTimeout(() => root.classList.add("xh-ready"), 1600);

  // миссия: каждое слово отдельно, проявляется по мере прокрутки
  function splitMission(){
    const el = $("#missionText"); if(!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span>${esc(w)}</span>`).join(" ");
  }

  // счётчики в цифрах: «5», «1000+» — анимация от нуля
  function countUp(){
    document.querySelectorAll("#stats b").forEach(b => {
      const m = b.textContent.match(/^(\d+)(.*)$/); if(!m || still) return;
      const end = +m[1], tail = m[2]; let t0 = 0;
      const io = new IntersectionObserver(es => es.forEach(e => {
        if(!e.isIntersecting) return; io.disconnect();
        const step = ts => { t0 = t0 || ts; const k = clamp((ts - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          b.textContent = v + (k === 1 ? tail : ""); if(k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }), { threshold:.6 });
      io.observe(b);
    });
  }

  // всё, что зависит от прокрутки, — в одном кадре
  let ticking = false;
  function frame(){
    ticking = false;
    const vh = innerHeight;
    if(hero){
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / r.height);
      hero.style.setProperty("--p", p.toFixed(4));
    }
    const m = $("#missionText");
    if(m){
      const r = m.getBoundingClientRect();
      const k = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const sp = m.children, n = sp.length;
      for(let i = 0; i < n; i++) sp[i].classList.toggle("on", still || i < k * n * 1.05);
    }
    const rs = $("#roadSteps");
    if(rs){
      const r = rs.getBoundingClientRect();
      rs.style.setProperty("--rp", clamp((vh * 0.8 - r.top) / (r.height + vh * 0.2)).toFixed(4));
    }
    document.querySelectorAll(".xq, .xtour-ph").forEach(el => {
      const r = el.getBoundingClientRect();
      if(r.bottom < 0 || r.top > vh) return;
      el.style.setProperty("--y", clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    });
  }
  const req = () => { if(!ticking){ ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive:true });
  addEventListener("resize", req, { passive:true });
  document.addEventListener("smoothscroll", req);

  function init(){ splitMission(); countUp(); req(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  document.addEventListener("langchange", () => setTimeout(() => { splitMission(); countUp(); req(); }));
})();
