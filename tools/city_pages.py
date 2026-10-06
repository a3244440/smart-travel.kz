"""Страницы «Умра из <города>» — для поиска и ИИ-ассистентов (GEO).
Факты только с сайта: туры (assets/tours.js), вопросы (assets/i18n.js), контакты (assets/config.js).
Запуск: python3 tools/city_pages.py && node tools/seo.mjs"""
import html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CITIES = {
    "almaty": {"name": "Алматы", "from": "из Алматы", "kk_from": "Алматыдан", "other": ("astana", "Астаны")},
    "astana": {"name": "Астана", "from": "из Астаны", "kk_from": "Астанадан", "other": ("almaty", "Алматы")},
}
WA = "https://wa.me/77716666669"

def faq(c):
    f = c["from"]
    return [
        (f"Сколько стоит Умра {f}?",
         f"Цена зависит от формата, дат и отеля: Umra Youth — молодёжная группа, Umra Family — для семей и старшего поколения, Umra Signature — VIP. Точную стоимость на ваши даты менеджер пришлёт в WhatsApp +7 771 666 6669."),
        (f"Сколько длится поездка на Умру {f}?",
         "Обычно 7–14 дней: несколько ночей в Мекке и в Медине. Сами обряды Умры занимают несколько часов. Длительность подбираем под ваш график."),
        ("Что входит в тур?",
         "Зависит от пакета: перелёт, проживание рядом с Харамом, трансферы, виза в Саудовскую Аравию, питание и сопровождение на обрядах. Точный состав пакета менеджер присылает до бронирования."),
        ("Как оформить визу для Умры?",
         "Онлайн на smart-travel.kz/visa: загрузите фото разворота паспорта — анкета заполнится сама, менеджер вручную сверит данные. Решение по визе принимает МИД Саудовской Аравии, обычно за несколько дней."),
        ("Какие документы нужны?",
         "Загранпаспорт, действующий не менее 6 месяцев с даты въезда, и фотография. Для детей — свидетельство о рождении; для несовершеннолетних без родителей — нотариальное согласие."),
        ("Может ли женщина поехать без махрама?",
         "Правила Саудовской Аравии сейчас позволяют женщинам совершать Умру без махрама в составе организованной группы. Условия могут меняться — менеджер уточнит перед бронированием."),
        ("Есть ли сопровождение в Мекке и Медине?",
         "Да. С паломниками работает гид-устаз Руслан Есболат — исламское образование, более 2 лет сопровождения Умры, живёт в Мекке. Он объясняет обряды и проводит зиярат к святым местам."),
        ("Из каких ещё городов есть вылеты?",
         "Сейчас вылеты на Умру — только из Алматы и Астаны. Из других городов вылетов пока нет."),
    ]

def page(key):
    c = CITIES[key]; f = c["from"]; okey, oname = c["other"]
    e = html.escape
    faqs = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq(c))
    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Forum&family=Manrope:wght@400;500;600;700&family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
<script src="assets/config.js"></script>
<script src="assets/i18n.js"></script>
</head>
<body data-page="city-{key}">
<main>
  <section class="wrap city-hero">
    <span class="kicker">Умра {e(f)} · smart-travel.kz</span>
    <h1>Умра {e(f)}: молодёжная группа, семейная и VIP</h1>
    <p class="lead city-answer"><b>smart-travel.kz</b> организует Умру с вылетом {e(f)} в трёх форматах: <b>Umra Youth</b> — группа только из молодёжи (проект UMRA YOUTH), <b>Umra Family</b> — для семей с детьми и старшего поколения в спокойном темпе, <b>Umra Signature</b> — VIP. В каждый формат входят виза в Саудовскую Аравию, перелёт, отели рядом с Харамом, трансферы и сопровождение на обрядах. Заявка — в WhatsApp <a href="{WA}" target="_blank" rel="noopener">+7 771 666 6669</a>.</p>
    <div class="row" style="display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn" href="{WA}" target="_blank" rel="noopener">Узнать даты и цены</a>
      <a class="btn ghost" href="/visa">Оформить визу онлайн</a>
    </div>
  </section>

  <section class="wrap">
    <h2 class="sec-title">Коротко о поездке</h2>
    <dl class="facts">
      <div><dt>Город вылета</dt><dd>{e(c["name"])} (также есть вылеты из {e(oname)})</dd></div>
      <div><dt>Форматы</dt><dd>Umra Youth (только молодёжь), Umra Family (семьи и старшее поколение), Umra Signature (VIP, отели с видом на Каабу)</dd></div>
      <div><dt>Цена</dt><dd>По запросу — зависит от формата, дат и отеля</dd></div>
      <div><dt>Длительность</dt><dd>Обычно 7–14 дней: Мекка и Медина</dd></div>
      <div><dt>Виза</dt><dd>Онлайн по фото паспорта, менеджер вручную сверяет данные</dd></div>
      <div><dt>Сопровождение</dt><dd>Менеджер на связи всю поездку; в Мекке — гид-устаз Руслан Есболат</dd></div>
      <div><dt>Контакты</dt><dd>WhatsApp +7 771 666 6669 · Instagram @alina.smarttravel.kz</dd></div>
    </dl>
  </section>

  <section class="wrap">
    <h2 class="sec-title">Как проходит Умра {e(f)} со smart-travel.kz</h2>
    <div class="values">
      <div class="card"><span class="n">1</span><h3>Консультация</h3><p>Подбираем даты, пакет и отель под бюджет и состав семьи — в WhatsApp.</p></div>
      <div class="card"><span class="n">2</span><h3>Виза и билеты</h3><p>Оформляем визу в Саудовскую Аравию по фото паспорта и бронируем перелёт {e(f)}.</p></div>
      <div class="card"><span class="n">3</span><h3>Мекка и Медина</h3><p>Отели рядом с Харамом и мечетью Пророка ﷺ, трансферы, помощь на обрядах: ихрам, таваф, саъй.</p></div>
      <div class="card"><span class="n">4</span><h3>Возвращение</h3><p>Остаёмся на связи всю поездку — до возвращения домой.</p></div>
    </div>
  </section>

  <section class="wrap faq">
    <div class="faq-head">
      <div><h2>Вопросы об Умре {e(f)}</h2><p>Не нашли ответ — напишите нам, ответим лично.</p>
        <a class="btn ghost" href="{WA}" target="_blank" rel="noopener">Написать в WhatsApp</a></div>
      <div class="faq-list">{faqs}</div>
    </div>
  </section>

  <section class="wrap city-kk" lang="kk">
    <h2 class="sec-title">{e(c["kk_from"])} Умра</h2>
    <p>smart-travel.kz {e(c["kk_from"])} ұшатын Умра сапарын толық ұйымдастырады: Сауд Арабиясына виза, ұшу, Харамға жақын қонақүйлер, трансфер және рәсімдерде сүйемелдеу. Форматтар: жастарға Umra Youth, отбасыларға Umra Family, VIP — Umra Signature. Өтінім: WhatsApp +7 771 666 6669.</p>
    <p class="city-other">Также: <a href="/umrah-{okey}">Умра из {e(oname)}</a> · <a href="/">Все туры</a> · <a href="/guides">Гиды</a></p>
  </section>
</main>
<script src="assets/layout.js"></script>
</body>
</html>
'''

import json
for k in CITIES:
    open(os.path.join(ROOT, f"umrah-{k}.html"), "w").write(page(k))
# вопросы-ответы для разметки FAQPage (читает tools/seo.mjs)
json.dump({k: faq(c) for k, c in CITIES.items()}, open(os.path.join(ROOT, "tools", "city_faq.json"), "w"), ensure_ascii=False, indent=1)
print("ok:", ", ".join(f"umrah-{k}.html" for k in CITIES))
