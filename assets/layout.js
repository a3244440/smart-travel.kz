// Общая шапка, подвал и орнамент для всех страниц
(function(){
  const S = window.SITE || {};
  const page = document.body.dataset.page || "";
  const link = (href, key, text, cls="") => `<a href="${href}" class="${cls}"${page===key?' aria-current="page"':''}>${text}</a>`;
  const header = document.createElement("header");
  header.innerHTML = `<div class="wrap">
    <a class="mark" href="index.html" aria-label="${S.brand} — на главную"><span class="logo" role="img" aria-label="smart-travel.kz"><i></i><i></i></span></a>
    <nav class="main">${link("index.html#tours","tours","Туры")}${link("visa.html","visa","Виза")}${link("cabinet.html","cabinet","Мои заявки")}<a class="ig" href="${S.instagram}" target="_blank" rel="noopener">Instagram</a></nav>
  </div>`;
  document.body.prepend(header);
  if(page !== "admin"){
    const footer = document.createElement("footer");
    footer.innerHTML = `<div class="wrap"><span>${S.brand} · ${S.city}</span><span>Решение по визе принимает МИД Саудовской Аравии · <a href="admin.html" style="color:inherit">Вход для менеджера</a></span></div>`;
    document.body.append(footer);
  }
  function setStar(){
    const c = getComputedStyle(document.documentElement).getPropertyValue("--brass").trim() || "#94722F";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='${c}' stroke-width='.6' opacity='.5'><rect x='18' y='18' width='20' height='20'/><rect x='18' y='18' width='20' height='20' transform='rotate(45 28 28)'/><path d='M0 0L10 10M56 0L46 10M0 56L10 46M56 56L46 46'/></g></svg>`;
    document.documentElement.style.setProperty("--star", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }
  setStar();
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setStar); } catch(e){}
  window.waLink = text => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  window.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.fmtDate = iso => { if(!iso) return ""; const [y,m,d] = String(iso).slice(0,10).split("-"); return d ? `${d}.${m}.${y}` : iso; };
  window.money = n => n == null ? "" : n.toLocaleString("ru-RU") + " " + (S.currency || "₸");
})();
