// Общая шапка, подвал, переключатели языка и темы, фоновый узор
(function(){
  const S = window.SITE || {};
  const page = document.body.dataset.page || "";
  // адреса без «.html»: smart-travel.kz/visa вместо smart-travel.kz/visa.html, главная — просто «/»
  if(/\.html$/.test(location.pathname)) try { history.replaceState(null, "", location.pathname.replace(/index\.html$/, "").replace(/\.html$/, "") + location.search + location.hash); } catch(e){}
  const icons = {
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>`,
    sun:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>`
  };

  const topbar = document.createElement("div");
  const header = document.createElement("header");
  const footer = document.createElement("footer");
  topbar.className = "topbar";
  // мобильное меню (полноэкранное)
  const menu = document.createElement("div");
  menu.className = "site-menu"; menu.id = "siteMenu"; menu.setAttribute("aria-hidden", "true");
  if(page !== "admin") document.body.append(menu);
  document.body.prepend(header);
  if(page !== "admin") document.body.prepend(topbar);
  if(page !== "admin") document.body.append(footer);

  // чтение публичных таблиц Supabase (курсы, аяты) без библиотеки
  window.sbGet = path => fetch(`${S.supabaseUrl}/rest/v1/${path}`, { headers:{ apikey:S.supabaseKey } })
    .then(r => r.ok ? r.json() : Promise.reject(r.status));
  const phone = "+" + String(S.whatsapp || "").replace(/^(\d)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4");

  // курс валют (MiG, mig.kz) — обновляется в базе каждые 30 минут
  let rates = null;
  function loadRates(){
    try { const c = JSON.parse(sessionStorage.getItem("ast_rates")); if(c && Date.now() - c.at < 15*60e3){ rates = c.rows; return Promise.resolve(); } } catch(e){}
    return sbGet("rates?select=code,sell,updated_at&code=in.(USD,EUR,RUB)").then(rows => {
      rates = rows; try { sessionStorage.setItem("ast_rates", JSON.stringify({ at:Date.now(), rows })); } catch(e){}
    }).catch(() => {});
  }
  function renderTopbar(){
    if(page === "admin") return;
    const order = ["USD","EUR","RUB"];
    const list = (rates || []).slice().sort((a,b) => order.indexOf(a.code) - order.indexOf(b.code));
    const time = list[0] ? new Date(list[0].updated_at).toLocaleTimeString(I18N.locale, { hour:"2-digit", minute:"2-digit" }) : "";
    const fx = list.length ? `<span class="fx" title="${esc(t("top.rates", { time }))}">${list.map(r =>
      `<span><b>${r.code}</b> ${Number(r.sell).toLocaleString("ru-RU", { maximumFractionDigits:2 })}</span>`).join("")}<small>₸</small></span>` : `<span class="fx"></span>`;
    topbar.innerHTML = `<div class="wrap">${fx}
      <a class="promo" href="/#tours">${t("top.promo")} <span aria-hidden="true">→</span></a>
      <a class="tel" href="${waLink("")}" target="_blank" rel="noopener" dir="ltr">${phone}</a></div>`;
  }

  function chrome(){
    const link = (href, key, text) => `<a href="${href}"${page===key?' aria-current="page"':''}>${text}</a>`;
    const dark = I18N.theme() === "dark";
    const langs = I18N.locked ? "" :
      `<label class="sr" for="langSel">${t("nav.lang")}</label>
       <select id="langSel" class="lang">${I18N.LANGS.map(l => `<option value="${l.code}"${l.code===I18N.lang?" selected":""} lang="${l.code}">${l.short}</option>`).join("")}</select>`;
    header.innerHTML = `<div class="wrap">
      <a class="mark" href="/" aria-label="${esc(S.brand)} — ${t("nav.home")}"><span class="logo" role="img" aria-label="smart-travel.kz"><i></i><i></i></span></a>
      <a class="wordmark" href="/" tabindex="-1" aria-hidden="true"><span><i></i><i></i></span></a>
      <nav class="main">${page==="admin" ? "" : link("/#tours","tours",t("nav.tours")) + link("/visa","visa",t("nav.visa")) + link("/guides","guides",t("nav.guides")) + link("/about","about",t("nav.about")) + link("/cabinet","cabinet",t("nav.cabinet"))}</nav>
      <div class="tools">${langs}
        <button class="theme-btn" id="themeBtn" type="button" aria-label="${t(dark ? "theme.light" : "theme.dark")}" title="${t(dark ? "theme.light" : "theme.dark")}">${dark ? icons.sun : icons.moon}</button>
        ${page==="admin" ? "" : `<button class="burger" id="burgerBtn" type="button" aria-expanded="false" aria-controls="siteMenu" aria-label="${t("nav.menu")}"><i></i><i></i></button>`}
      </div>
      <div class="flight" aria-hidden="true"><i class="route"></i><i class="trail"></i>
        <svg class="plane" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
    </div>`;
    if(page !== "admin") menu.innerHTML = `<nav class="menu-links">${[["/#tours","nav.tours"],["/visa","nav.visa"],["/guides","nav.guides"],["/about","nav.about"],["/cabinet","nav.cabinet"],["/#faq","nav.faq"]]
        .map(([h,k],i) => `<a href="${h}" style="--i:${i}">${t(k)}</a>`).join("")}</nav>
      <div class="menu-foot"><a class="btn" href="${waLink("")}" target="_blank" rel="noopener">${t("foot.wa")}</a>
        <a class="menu-tel" href="${waLink("")}" target="_blank" rel="noopener" dir="ltr">${phone}</a>
        <a class="menu-tel" href="${S.instagram}" target="_blank" rel="noopener" dir="ltr">@alina.smarttravel.kz</a></div>`;
    footer.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <a class="foot-logo" href="/" aria-label="${esc(S.brand)}"><span><i></i><i></i></span></a>
          <p>${t("foot.about")}</p>
          <div class="social">
            <a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
            <a href="${waLink("")}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z"/></svg></a>
          </div>
        </div>
        <div><h4>${t("foot.tours")}</h4><a href="/#tours">${t("foot.umrah")}</a><a href="/#tours">${t("foot.cruise")}</a><a href="/#tours">${t("foot.world")}</a><a href="/visa">${t("home.getVisa")}</a></div>
        <div><h4>${t("foot.company")}</h4><a href="/about">${t("nav.about")}</a><a href="/guides">${t("nav.guides")}</a><a href="/#faq">${t("faq.title")}</a><a href="/cabinet">${t("nav.cabinet")}</a></div>
        <div><h4>${t("foot.contact")}</h4>
          <a class="ci" href="${waLink("")}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z"/></svg><span dir="ltr">${phone}</span></a>
          <a class="ci" href="${S.instagram}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg><span dir="ltr">@alina.smarttravel.kz</span></a>
        </div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(S.brand)} · ${t("foot.rights")}</span><span>${t("footer.note")}</span><a href="/admin">${t("footer.manager")}</a></div>
    </div>`;
    renderTopbar();
  }
  header.addEventListener("change", e => { if(e.target.id === "langSel") I18N.setLang(e.target.value); });
  header.addEventListener("click", e => {
    if(e.target.closest("#themeBtn")) I18N.setTheme(I18N.theme() === "dark" ? "light" : "dark");
    if(e.target.closest("#burgerBtn")) setMenu(!document.documentElement.classList.contains("menu-open"));
  });
  function setMenu(open){
    document.documentElement.classList.toggle("menu-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    const b = document.getElementById("burgerBtn");
    if(b){ b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", t(open ? "nav.close" : "nav.menu")); }
    if(window.lenis) open ? lenis.stop() : lenis.start();
  }
  menu.addEventListener("click", e => { if(e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => { if(e.key === "Escape") setMenu(false); });
  matchMedia("(min-width:861px)").addEventListener("change", e => { if(e.matches) setMenu(false); });

  // узор из полумесяцев для карточки-арки
  function setPattern(){
    const c = getComputedStyle(document.documentElement).getPropertyValue("--night-gold").trim() || "#D4AF63";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='${c}' stroke-width='.7' opacity='.55'><path d='M26.92 21.08A7 7 0 1 0 34.83 29.52A5.8 5.8 0 0 1 26.92 21.08Z'/></g><g fill='${c}' opacity='.45'><circle cx='4' cy='4' r='.9'/><circle cx='52' cy='52' r='.9'/><circle cx='52' cy='4' r='.6'/><circle cx='4' cy='52' r='.6'/></g></svg>`;
    document.documentElement.style.setProperty("--pattern", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }

  window.statsHTML = () => {
    const st = S.stats || {};
    return [st.years && `<div><b>${esc(st.years)}</b><span>${t("stat.years")}</span></div>`,
            st.clients && `<div><b>${esc(st.clients)}</b><span>${t("stat.clients")}</span></div>`,
            `<div><b>3</b><span>${t("stat.idea")}</span></div>`].filter(Boolean).join("");
  };
  window.waLink = text => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  window.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.fmtDate = iso => { if(!iso) return ""; const [y,m,d] = String(iso).slice(0,10).split("-"); return d ? `${d}.${m}.${y}` : iso; };
  window.money = n => n == null ? "" : n.toLocaleString("ru-RU") + " " + (S.currency || "₸");

  // самолёт под шапкой: летит по мере прокрутки (одно свойство --fly, без перерисовки страницы)
  let fly = 0, target = 0, raf = 0;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function measure(){
    header.classList.toggle("scrolled", scrollY > 8);
    const hero = document.querySelector(".xh");
    header.classList.toggle("on-hero", !!hero && hero.getBoundingClientRect().bottom > 90);
    const max = document.documentElement.scrollHeight - innerHeight;
    target = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if(!raf) raf = requestAnimationFrame(step);
  }
  function step(){
    fly = still ? target : fly + (target - fly) * 0.14;
    if(Math.abs(target - fly) < 0.0005) fly = target;
    header.style.setProperty("--fly", fly.toFixed(4));
    const fl = header.querySelector(".flight");
    header.style.setProperty("--fly-x", (fly * ((fl ? fl.clientWidth : header.clientWidth) - 20)).toFixed(1) + "px");
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
    document.querySelectorAll("main .hero > *, main .page-head, main .work-head, main .tour, main .panel, main .arch-col, main .ayah figure, main .faq-head > *, main .values .card, main .steps-row > div, main .about-hero > div, main .cta-band, main .founder > *, main .member, main .story p, main .together, main .soon > div, main .xtour, main [data-rv]").forEach((el, i) => {
      if(el.getBoundingClientRect().top > innerHeight * 0.92){ el.classList.add("rv"); io.observe(el); }
      else { el.classList.add("rv", "rv-now"); el.style.setProperty("--rv-d", (i % 4) * 70 + "ms"); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in"))); }
    });
  }

  function smooth(){
    if(still || page === "admin" || matchMedia("(pointer:coarse)").matches) return;
    const sc = document.createElement("script");
    sc.src = "/assets/vendor/lenis.min.js";
    sc.onload = () => {
      if(!window.Lenis) return;
      window.lenis = new Lenis({ duration:1.15, easing:x => 1 - Math.pow(1 - x, 4), anchors:{ offset:-96 } });
      lenis.on("scroll", () => { measure(); document.dispatchEvent(new Event("smoothscroll")); });
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    };
    document.head.append(sc);
  }

  chrome(); setPattern(); measure(); smooth();
  if(page !== "admin") loadRates().then(renderTopbar);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal); else reveal();
  document.addEventListener("langchange", chrome);
  document.addEventListener("themechange", () => { chrome(); setPattern(); });
})();
