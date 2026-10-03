// SEO для всех страниц: заголовки, описания, Open Graph, hreflang, разметка schema.org,
// русский текст прямо в HTML (для поисковиков без JS) и sitemap.xml.
// Запуск после правок текстов или туров:  node tools/seo.mjs
import fs from "node:fs";
import vm from "node:vm";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE_URL = "https://smart-travel.kz";
const read = f => fs.readFileSync(ROOT + f, "utf8");

// словарь и туры — из тех же файлов, что использует сайт
const ctx = { URL, URLSearchParams, location: { search: "", hostname: "", protocol: "https:" }, navigator: { languages: ["ru"] },
  localStorage: { getItem: () => null, setItem() {} },
  document: { documentElement: { dataset: {} }, addEventListener() {} }, matchMedia: null };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(read("assets/config.js"), ctx);
vm.runInContext(read("assets/i18n.js"), ctx);
vm.runInContext(read("assets/tours.js"), ctx);
const { I18N, SITE, TOURS } = ctx;
const ru = (key, vars) => I18N.tIn("ru", key, { brand: SITE.brand, ...vars });
const strip = h => h.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const attr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const text = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const ORG = {
  "@type": "TravelAgency", "@id": SITE_URL + "/#org",
  name: SITE.brand, url: SITE_URL + "/",
  logo: SITE_URL + "/assets/logo.png", image: SITE_URL + "/assets/og.jpg",
  description: "Умра из Казахстана под ключ: туры в Мекку и Медину, круиз с Умрой, халяль-туры и виза в Саудовскую Аравию.",
  telephone: "+" + SITE.whatsapp, sameAs: [SITE.instagram],
  address: { "@type": "PostalAddress", addressCountry: "KZ" },
  areaServed: { "@type": "Country", name: "Kazakhstan" },
  founder: { "@type": "Person", name: "Алина", jobTitle: "Основатель smart-travel.kz" },
  priceRange: "₸₸",
  knowsLanguage: ["ru", "kk", "en", "ar"],
  contactPoint: { "@type": "ContactPoint", telephone: "+" + SITE.whatsapp, contactType: "customer service", availableLanguage: ["Russian", "Kazakh", "English", "Arabic"] }
};
const crumbs = (name, path) => ({ "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL + "/" },
  { "@type": "ListItem", position: 2, name, item: SITE_URL + path }] });

const VERIFY = {
  "google-site-verification": "XUpLZg0OK41c_UaEtTo_zrDsedYm_F2fpjHMLRf3msU"
};

const KEYWORDS = "умра, умра из Казахстана, умра 2026, умра цена, тур в Мекку, Мекка, Медина, поездка в Мекку и Медину, умра VIP, умра Standard, круиз с Умрой, виза в Саудовскую Аравию, электронная виза Умра, халяль туры, Қазақстаннан Умра, Меккеге сапар";

const PAGES = {
  "index.html": {
    path: "/", titleKey: "title.home", priority: "1.0",
    description: "Умра из Казахстана под ключ: туры в Мекку и Медину VIP, Luxe и Standard, круиз с Умрой от 650 000 ₸, виза в Саудовскую Аравию по фото паспорта. Ответим в WhatsApp.",
    schema: () => [
      ORG,
      { "@type": "WebSite", "@id": SITE_URL + "/#site", url: SITE_URL + "/", name: SITE.brand, inLanguage: ["ru", "kk", "en", "ar"], publisher: { "@id": SITE_URL + "/#org" } },
      { "@type": "ItemList", name: "Туры: Умра, Мекка, Медина и путешествия", itemListElement: TOURS.map((tr, i) => ({
        "@type": "ListItem", position: i + 1, item: {
          "@type": "TouristTrip", name: tr.title.ru, description: tr.points.ru.join(". "),
          image: SITE_URL + "/" + tr.photo, provider: { "@id": SITE_URL + "/#org" },
          ...(tr.price != null ? { offers: { "@type": "Offer", price: tr.price, priceCurrency: "KZT", availability: "https://schema.org/InStock", url: SITE_URL + "/#tours" } } : {})
        } })) },
      { "@type": "FAQPage", mainEntity: Array.from({ length: 9 }, (_, i) => ({
        "@type": "Question", name: ru(`faq.q${i + 1}`),
        acceptedAnswer: { "@type": "Answer", text: ru(`faq.a${i + 1}`) } })) }
    ]
  },
  "visa.html": {
    path: "/visa", titleKey: "title.visa", priority: "0.9",
    description: "Электронная виза в Саудовскую Аравию для Умры и туризма: загрузите фото паспорта — анкета заполнится сама. Для граждан Казахстана и всей семьи, статус заявки онлайн.",
    schema: () => [
      { "@type": "Service", name: "Виза в Саудовскую Аравию для Умры", serviceType: "Оформление визы", provider: { "@id": SITE_URL + "/#org" }, areaServed: { "@type": "Country", name: "Kazakhstan" }, url: SITE_URL + "/visa" },
      crumbs("Виза", "/visa")
    ]
  },
  "about.html": {
    path: "/about", titleKey: "title.about", priority: "0.7",
    description: "smart-travel.kz — команда Алины: 5 лет в туризме и 1000+ довольных клиентов. Организуем Умру, поездки в Мекку и Медину и халяль-отдых по миру — VIP-возможности по цене Standard.",
    schema: () => [{ "@type": "AboutPage", url: SITE_URL + "/about", about: ORG }, crumbs("О нас", "/about")]
  },
  "guides.html": {
    path: "/guides", titleKey: "title.guides", priority: "0.5",
    description: "Проверенные гиды для Умры в Мекке и Медине: опыт, языки и отзывы паломников. Раздел готовится — нужен гид сейчас, напишите нам в WhatsApp.",
    schema: () => [crumbs("Гиды", "/guides")]
  },
  "cabinet.html": {
    path: "/cabinet", titleKey: "title.cabinet", noindex: true,
    description: "Статус заявки на визу в Саудовскую Аравию: введите номер заявки и телефон."
  },
  "admin.html": { path: "/admin", noindex: true, nofollow: true, title: "Заявки — панель менеджера" }
};

function head(file, p) {
  const title = p.title || ru(p.titleKey);
  const url = SITE_URL + p.path;
  const L = [
    `<title>${text(title)}</title>`,
    p.description && `<meta name="description" content="${attr(p.description)}">`,
    `<meta name="robots" content="${p.noindex ? (p.nofollow ? "noindex,nofollow" : "noindex,follow") : "index,follow,max-image-preview:large"}">`,
    `<link rel="canonical" href="${url}">`
  ];
  // подтверждение владения сайтом (Google Search Console, Яндекс Вебмастер) — только на главной
  if (p.path === "/") for (const [name, code] of Object.entries(VERIFY)) L.push(`<meta name="${name}" content="${code}">`);
  if (!p.noindex) {
    L.push(`<meta name="keywords" content="${attr(KEYWORDS)}">`);
    for (const l of ["ru", "kk", "en", "ar"]) L.push(`<link rel="alternate" hreflang="${l}" href="${url}${l === "ru" ? "" : "?lang=" + l}">`);
    L.push(`<link rel="alternate" hreflang="x-default" href="${url}">`);
    L.push(
      `<meta name="geo.region" content="KZ">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="${SITE.brand}">`,
      `<meta property="og:locale" content="ru_RU">`,
      `<meta property="og:locale:alternate" content="kk_KZ">`,
      `<meta property="og:locale:alternate" content="en_GB">`,
      `<meta property="og:locale:alternate" content="ar_SA">`,
      `<meta property="og:title" content="${attr(title)}">`,
      `<meta property="og:description" content="${attr(p.description)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${SITE_URL}/assets/og.jpg">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta name="twitter:card" content="summary_large_image">`
    );
    const graph = p.schema();
    L.push(`<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`);
  }
  return "<!-- SEO: генерируется tools/seo.mjs -->\n" + L.filter(Boolean).join("\n") + "\n<!-- /SEO -->";
}

for (const [file, p] of Object.entries(PAGES)) {
  let s = read(file);
  // старые заголовки/описания заменяются блоком SEO
  s = s.replace(/<!-- SEO:[\s\S]*?<!-- \/SEO -->\n?/, "")
       .replace(/^<title>.*<\/title>\n/m, "")
       .replace(/^<meta (name="(description|robots|keywords)"|property="og:[^"]+")[^>]*>\n/gm, "");
  s = s.replace(/(<script src="assets\/i18n\.js"><\/script>\n)/, `$1${head(file, p)}\n`);
  if (!s.includes("<!-- SEO:")) throw new Error("нет места для SEO-блока в " + file);
  // русский текст внутри элементов с переводом — поисковик видит его без JS
  // (только разметка страницы — код внутри <script> не трогаем)
  if (file !== "admin.html") s = s.split(/(<script[\s\S]*?<\/script>)/).map((part, i) => i % 2 ? part : part
    .replace(/(<(\w+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, cur, close) => open + text(ru(key)) + close)
    .replace(/(<(\w+)\b[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, key, cur, close) => open + ru(key) + close)
  ).join("");
  fs.writeFileSync(ROOT + file, s);
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = Object.values(PAGES).filter(p => !p.noindex).map(p => {
  const u = SITE_URL + p.path;
  const alt = ["ru", "kk", "en", "ar"].map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${u}${l === "ru" ? "" : "?lang=" + l}"/>`).join("\n");
  return `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.priority}</priority>\n${alt}\n  </url>`;
});
fs.writeFileSync(ROOT + "sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
console.log("SEO обновлено:", Object.keys(PAGES).join(", "), "+ sitemap.xml");
