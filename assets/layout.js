// Общая шапка, подвал, переключатели языка и темы, фоновый узор
(function(){
  const S = window.SITE || {};
  const page = document.body.dataset.page || "";
  // адрес главной без «index.html»: smart-travel.kz/ вместо smart-travel.kz/index.html
  if(/\/index\.html$/.test(location.pathname)) try { history.replaceState(null, "", location.pathname.replace(/index\.html$/, "") + location.search + location.hash); } catch(e){}
  const icons = {
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>`,
    sun:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>`
  };

  const header = document.createElement("header");
  const footer = document.createElement("footer");
  document.body.prepend(header);
  if(page !== "admin") document.body.append(footer);

  function chrome(){
    const link = (href, key, text) => `<a href="${href}"${page===key?' aria-current="page"':''}>${text}</a>`;
    const dark = I18N.theme() === "dark";
    const langs = I18N.locked ? "" :
      `<label class="sr" for="langSel">${t("nav.lang")}</label>
       <select id="langSel" class="lang">${I18N.LANGS.map(l => `<option value="${l.code}"${l.code===I18N.lang?" selected":""} lang="${l.code}">${l.short}</option>`).join("")}</select>`;
    header.innerHTML = `<div class="wrap">
      <a class="mark" href="./" aria-label="${esc(S.brand)} — ${t("nav.home")}"><span class="logo" role="img" aria-label="smart-travel.kz"><i></i><i></i></span></a>
      <a class="wordmark" href="./" tabindex="-1" aria-hidden="true"><span><i></i><i></i></span></a>
      <nav class="main">${page==="admin" ? "" : link("./#tours","tours",t("nav.tours")) + link("visa.html","visa",t("nav.visa")) + link("cabinet.html","cabinet",t("nav.cabinet")) + `<a class="ig" href="${S.instagram}" target="_blank" rel="noopener">Instagram</a>`}</nav>
      <div class="tools">${langs}
        <button class="theme-btn" id="themeBtn" type="button" aria-label="${t(dark ? "theme.light" : "theme.dark")}" title="${t(dark ? "theme.light" : "theme.dark")}">${dark ? icons.sun : icons.moon}</button>
      </div>
    </div>
    <div class="flight" aria-hidden="true"><i class="route"></i><i class="trail"></i>
      <svg class="plane" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`;
    footer.innerHTML = `<div class="wrap"><span>${esc(S.brand)}</span><span>${t("footer.note")} · <a href="admin.html" style="color:inherit">${t("footer.manager")}</a></span></div>`;
  }
  header.addEventListener("change", e => { if(e.target.id === "langSel") I18N.setLang(e.target.value); });
  header.addEventListener("click", e => { if(e.target.closest("#themeBtn")) I18N.setTheme(I18N.theme() === "dark" ? "light" : "dark"); });

  // узор из полумесяцев для карточки-арки
  function setPattern(){
    const c = getComputedStyle(document.documentElement).getPropertyValue("--night-gold").trim() || "#D4AF63";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='${c}' stroke-width='.7' opacity='.55'><path d='M26.92 21.08A7 7 0 1 0 34.83 29.52A5.8 5.8 0 0 1 26.92 21.08Z'/></g><g fill='${c}' opacity='.45'><circle cx='4' cy='4' r='.9'/><circle cx='52' cy='52' r='.9'/><circle cx='52' cy='4' r='.6'/><circle cx='4' cy='52' r='.6'/></g></svg>`;
    document.documentElement.style.setProperty("--pattern", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }

  window.waLink = text => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  window.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.fmtDate = iso => { if(!iso) return ""; const [y,m,d] = String(iso).slice(0,10).split("-"); return d ? `${d}.${m}.${y}` : iso; };
  window.money = n => n == null ? "" : n.toLocaleString("ru-RU") + " " + (S.currency || "₸");

  // самолёт под шапкой: летит по мере прокрутки (одно свойство --fly, без перерисовки страницы)
  let fly = 0, target = 0, raf = 0;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function measure(){
    const max = document.documentElement.scrollHeight - innerHeight;
    target = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if(!raf) raf = requestAnimationFrame(step);
  }
  function step(){
    fly = still ? target : fly + (target - fly) * 0.14;
    if(Math.abs(target - fly) < 0.0005) fly = target;
    header.style.setProperty("--fly", fly.toFixed(4));
    header.style.setProperty("--fly-x", (fly * (header.clientWidth - 20)).toFixed(1) + "px");
    raf = fly === target ? 0 : requestAnimationFrame(step);
  }
  addEventListener("scroll", measure, { passive:true });
  addEventListener("resize", measure, { passive:true });

  // плавное появление блоков при прокрутке
  function reveal(){
    if(still || page === "admin" || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin:"0px 0px -8% 0px", threshold:0.08 });
    document.querySelectorAll("main .hero > *, main .page-head, main .work-head, main .tour, main .panel, main .arch-col").forEach((el, i) => {
      if(el.getBoundingClientRect().top > innerHeight * 0.92){ el.classList.add("rv"); io.observe(el); }
      else { el.classList.add("rv", "rv-now"); el.style.setProperty("--rv-d", (i % 4) * 70 + "ms"); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in"))); }
    });
  }

  chrome(); setPattern(); measure();
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal); else reveal();
  document.addEventListener("langchange", chrome);
  document.addEventListener("themechange", () => { chrome(); setPattern(); });
})();
