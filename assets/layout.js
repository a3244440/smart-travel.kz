// Общая шапка, подвал, переключатели языка и темы, фоновый узор
(function(){
  const S = window.SITE || {};
  const page = document.body.dataset.page || "";
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
      <a class="mark" href="index.html" aria-label="${esc(S.brand)} — ${t("nav.home")}"><span class="logo" role="img" aria-label="smart-travel.kz"><i></i><i></i></span></a>
      <nav class="main">${page==="admin" ? "" : link("index.html#tours","tours",t("nav.tours")) + link("visa.html","visa",t("nav.visa")) + link("cabinet.html","cabinet",t("nav.cabinet")) + `<a class="ig" href="${S.instagram}" target="_blank" rel="noopener">Instagram</a>`}</nav>
      <div class="tools">${langs}
        <button class="theme-btn" id="themeBtn" type="button" aria-label="${t(dark ? "theme.light" : "theme.dark")}" title="${t(dark ? "theme.light" : "theme.dark")}">${dark ? icons.sun : icons.moon}</button>
      </div>
    </div>`;
    footer.innerHTML = `<div class="wrap"><span>${esc(S.brand)} · ${t("footer.city")}</span><span>${t("footer.note")} · <a href="admin.html" style="color:inherit">${t("footer.manager")}</a></span></div>`;
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

  chrome(); setPattern();
  document.addEventListener("langchange", chrome);
  document.addEventListener("themechange", () => { chrome(); setPattern(); });
})();
