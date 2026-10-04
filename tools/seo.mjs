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
vm.runInContext(read("assets/guides.js"), ctx);
const { I18N, SITE, TOURS, GUIDES } = ctx;
const ru = (key, vars) => I18N.tIn("ru", key, { brand: SITE.brand, ...vars });
const strip = h => h.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const attr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const text = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const KW = {
  // общие запросы: Умра, Мекка, Медина
  home: [
    "умра", "умра из Казахстана", "умра из Астаны", "умра из Алматы", "умра из Алматы цена", "умра из Астаны цена", "вылет на умру из Алматы", "вылет на умру из Астаны", 
    "умра 2026", "умра 2027", "умра цена", "умра цена 2026", "стоимость умры", "сколько стоит умра", "умра недорого", "дешевая умра",
    "тур на умру", "туры на умру из Казахстана", "умра тур Алматы", "умра тур Астана", "поездка на умру", "паломничество в Мекку", "хадж и умра",
    "тур в Мекку", "тур в Мекку и Медину", "поездка в Мекку", "Мекка Медина тур", "Мекка из Казахстана", "Медина тур",
    "умра VIP", "умра люкс", "умра стандарт", "умра эконом", "умра 5 звезд", "отели у Харама", "отель рядом с Каабой",
    "умра в Рамадан", "умра на каникулы", "умра с детьми", "семейная умра", "умра для женщин", "умра без махрама", "умра групповой тур",
    "круиз с умрой", "круиз Умра", "халяль туры", "халяль отдых", "туры для мусульман", "мусульманские туры",
    "турагентство умра", "туроператор умра Казахстан", "организация умры",
    "виза в Саудовскую Аравию", "виза на умру", "электронная виза Саудовская Аравия",
    "Қазақстаннан Умра", "Умра сапары", "Умраға бару", "Умра бағасы", "Меккеге тур", "Мекке Медине сапары", "Алматыдан Умра", "Астанадан Умра",
    "Umrah from Kazakhstan", "Umrah Almaty", "Umrah Astana", "Umrah packages"
  ],
  visa: [
    "виза в Саудовскую Аравию", "виза в Саудовскую Аравию для казахстанцев", "виза в Саудовскую Аравию онлайн", "электронная виза Саудовская Аравия",
    "виза на умру", "умра виза", "туристическая виза Саудовская Аравия", "виза в Саудию", "eVisa Saudi", "стоимость визы в Саудовскую Аравию",
    "оформить визу в Саудовскую Аравию Алматы", "оформить визу в Саудовскую Аравию Астана", "Сауд Арабиясына виза", "Умра визасы"
  ],
  about: ["smart-travel.kz", "Алина smart travel", "организатор умры", "турагентство умра Казахстан", "туроператор Мекка Медина", "отзывы умра"],
  guides: ["Руслан Есболат", "гид-устаз", "гид в Мекке", "гид в Медине", "гид на умру", "сопровождение умры", "русскоязычный гид Мекка", "казахоязычный гид Умра"]
};
const CITIES = ["Алматы","Астана"];
const FAQ_COUNT = (() => { let n = 0; while (I18N.tIn("ru", `faq.q${n + 1}`) !== `faq.q${n + 1}`) n++; return n; })();

const ORG = {
  "@type": "TravelAgency", "@id": SITE_URL + "/#org",
  name: SITE.brand, url: SITE_URL + "/",
  logo: SITE_URL + "/assets/logo.png", image: SITE_URL + "/assets/og.jpg",
  description: "Умра из Казахстана под ключ: туры в Мекку и Медину, круиз с Умрой, халяль-туры и виза в Саудовскую Аравию.",
  telephone: "+" + SITE.whatsapp, sameAs: [SITE.instagram],
  address: { "@type": "PostalAddress", addressCountry: "KZ" },
  areaServed: [{ "@type": "Country", name: "Казахстан" }, ...CITIES.map(name => ({ "@type": "City", name }))],
  founder: { "@type": "Person", name: "Алина", jobTitle: "Основатель smart-travel.kz" },
  priceRange: "₸₸",
  keywords: KW.home.join(", "),
  knowsLanguage: ["ru", "kk", "en", "ar"],
  contactPoint: { "@type": "ContactPoint", telephone: "+" + SITE.whatsapp, contactType: "customer service", availableLanguage: ["Russian", "Kazakh", "English", "Arabic"] }
};
const crumbs = (name, path) => ({ "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL + "/" },
  { "@type": "ListItem", position: 2, name, item: SITE_URL + path }] });

const VERIFY = {
  "google-site-verification": "XUpLZg0OK41c_UaEtTo_zrDsedYm_F2fpjHMLRf3msU"
};


const PAGES = {
  "index.html": {
    path: "/", titleKey: "title.home", priority: "1.0", kw: KW.home,
    description: "Умра из Казахстана, Астаны и Алматы под ключ: туры в Мекку и Медину VIP, Luxe и Standard, круиз с Умрой от 650 000 ₸, отели у Харама, виза в Саудовскую Аравию по фото паспорта. Пишите в WhatsApp.",
    schema: () => [
      ORG,
      { "@type": "WebSite", "@id": SITE_URL + "/#site", url: SITE_URL + "/", name: SITE.brand, inLanguage: ["ru", "kk", "en", "ar"], publisher: { "@id": SITE_URL + "/#org" } },
      { "@type": "ItemList", name: "Туры: Умра, Мекка, Медина и путешествия", itemListElement: TOURS.map((tr, i) => ({
        "@type": "ListItem", position: i + 1, item: {
          "@type": "TouristTrip", name: tr.title.ru, description: tr.points.ru.join(". "),
          image: SITE_URL + "/" + tr.photo, provider: { "@id": SITE_URL + "/#org" },
          ...(tr.price != null ? { offers: { "@type": "Offer", price: tr.price, priceCurrency: "KZT", availability: "https://schema.org/InStock", url: SITE_URL + "/#tours" } } : {})
        } })) },
      { "@type": "FAQPage", mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
        "@type": "Question", name: ru(`faq.q${i + 1}`),
        acceptedAnswer: { "@type": "Answer", text: ru(`faq.a${i + 1}`) } })) }
    ]
  },
  "visa.html": {
    path: "/visa", titleKey: "title.visa", priority: "0.9", kw: KW.visa,
    description: "Виза в Саудовскую Аравию для казахстанцев онлайн: электронная виза для Умры и туризма по фото паспорта — Астана, Алматы и вся страна. Анкета заполнится сама, статус заявки онлайн.",
    schema: () => [
      { "@type": "Service", name: "Виза в Саудовскую Аравию для Умры", serviceType: "Оформление визы", provider: { "@id": SITE_URL + "/#org" }, areaServed: { "@type": "Country", name: "Kazakhstan" }, url: SITE_URL + "/visa" },
      crumbs("Виза", "/visa")
    ]
  },
  "about.html": {
    path: "/about", titleKey: "title.about", priority: "0.7", kw: KW.about,
    description: "smart-travel.kz — команда Алины: 5 лет в туризме и 1000+ довольных клиентов. Организуем Умру, поездки в Мекку и Медину и халяль-отдых по миру — VIP-возможности по цене Standard.",
    schema: () => [{ "@type": "AboutPage", url: SITE_URL + "/about", about: ORG }, crumbs("О нас", "/about")]
  },
  "guides.html": {
    path: "/guides", titleKey: "title.guides", priority: "0.5", kw: KW.guides,
    description: "Гид-устаз для Умры в Мекке и Медине — Руслан Есболат: исламское образование, более 2 лет сопровождения паломников, зиярат к святым и историческим местам. Живёт в Мекке.",
    schema: () => [crumbs("Гиды", "/guides"), ...GUIDES.map(g => ({
      "@type": "Person", name: g.name.ru, alternateName: g.name.kk, jobTitle: g.role.ru, description: g.about.ru,
      image: SITE_URL + "/" + g.photo, url: SITE_URL + "/guides#" + g.id, worksFor: { "@id": SITE_URL + "/#org" },
      homeLocation: { "@type": "Place", name: "Мекка" } }))]
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
    if (p.kw) L.push(`<meta name="keywords" content="${attr(p.kw.join(", "))}">`);
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
