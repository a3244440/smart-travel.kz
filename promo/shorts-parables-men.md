# Шортсы-притчи с мужчинами (по образцу @islamicwave_1t)

## Разбор референса («The Golden bobber story», 29 с)

| Что | Как сделано |
|---|---|
| Формат | 720×1280, 30 к/с, 29 с. Сплошной ИИ-видеоролик (Veo / Kling / Hailuo), склеен из 4–5 генераций по 5–8 с (стыки ≈ 3.6 / 6.3 / 9–11 / 16–17 / 20 с) |
| Текст | Нет вообще: ни субтитров, ни титров. Смысл понятен без слов |
| Звук | Нашид без музыкальных инструментов («Mustafa Mustafa»), ровно на весь ролик, громкость ≈ −12.6 LUFS, без диктора и без эффектов |
| Место | Одна локация на весь ролик: старинная мощёная улица, пасмурный ровный свет, камера стоит фронтально на уровне глаз |
| Герои | Двое: «праведный» (скромная одежда, спокойствие) и «мирской» (модная одежда, суета). Одни и те же лица и одежда во всех кадрах |
| Сюжет | Выбор между двумя предметами → мирской хватает блестящий (золотой мотоцикл) → предмет превращается в настоящий → позор: ломается, дым, герой падает → праведный берёт скромный (серебряный) → тот становится настоящим и служит ему → праведный уезжает, улыбаясь |
| Мораль | Без слов: не гонись за блеском этого мира, довольствуйся малым, и Аллах даст лучшее |
| Крючок | В первую секунду в кадре уже два героя и два предмета: зритель сразу ждёт выбора |

**Формула:** *два героя → два предмета → жадный выбор наказан → скромный выбор вознаграждён → чудо-превращение.* Одна локация, без слов, нашид.

## Мужская версия: правила

- Герои — двое мужчин. «Праведный»: светлый тобе или скромная рубашка, аккуратная борода, тюбетейка или куфия. «Мирской»: брендовый костюм или куртка, золотые часы, телефон в руке.
- Без женщин в кадре, без музыкальных инструментов в звуке (только нашид или вокальный дуф-ритм).
- Не изображать пророков и ангелов. Чудо — только превращение предметов.
- Финал: 1,5 с с логотипом smart-travel.kz и подписью «Умра из Казахстана» (кинетический движок `tools/kinetic/`), чтобы ролик работал на бренд.

### Как генерировать

1. Сначала картинка-якорь героев (Midjourney / Flux / Nano Banana): оба героя в полный рост в локации. Её же дать как первый кадр (image-to-video) в каждой генерации — так лица и одежда не «поплывут».
2. Каждый кадр ниже — отдельная генерация 5–8 с в 9:16. Последний кадр предыдущей генерации — первый кадр следующей.
3. Склейка в CapCut или ffmpeg, поверх нашид без инструментов (свободный от прав), громкость −14 LUFS.

Промпты на английском — генераторы видео понимают их лучше. Общая приставка ко всем кадрам:

> Vertical 9:16, photorealistic, cinematic, static front camera at eye level, soft overcast daylight, same two men in every shot, no text, no music instruments.

---

## Сценарий 1. «Золотые часы и чётки» (рынок, Стамбул)

**Мораль:** время дороже золота.

1. **0–6 с.** Old Istanbul bazaar street, a wooden table with a shiny gold watch and a simple wooden misbaha (prayer beads). Man A (white thobe, short beard, kufi) and Man B (designer suit, slick hair, phone in hand) stand behind the table, looking at the items.
2. **6–12 с.** Man B quickly grabs the gold watch, smirks, puts it on and walks away checking his phone. Man A calmly picks up the wooden misbaha and smiles.
3. **12–18 с.** The gold watch on Man B's wrist starts spinning its hands wildly, the gold cracks and turns to dust; Man B stares in panic, the street around him turns grey and rushed.
4. **18–24 с.** Man A walks slowly through the warm sunlit bazaar counting the misbaha beads; the beads glow softly with golden light, people greet him with smiles.
5. **24–29 с.** Man A sits peacefully on a step, the misbaha in his hand, closes his eyes with a serene smile. Fade to soft light → логотип.

## Сценарий 2. «Два чемодана» (бренд-сценарий про Умру)

**Мораль:** в главное путешествие берут не вещи, а намерение.

1. **0–6 с.** Airport terminal, two travel bags on the floor: a huge golden designer suitcase and a small plain white bag. Man A (simple white clothes, beard) and Man B (flashy jacket, sunglasses) stand behind them.
2. **6–12 с.** Man B grabs the golden suitcase with a proud smile and rolls it away; Man A picks up the small white bag, opens it — inside is a neatly folded white ihram cloth.
3. **12–18 с.** The golden suitcase bursts open, expensive clothes and gadgets spill across the floor; the zipper breaks, Man B kneels, frustrated, collecting things as people pass by.
4. **18–24 с.** Man A, now wearing a white ihram, walks toward a bright gate; the gate glows with warm light.
5. **24–29 с.** Wide shot: Man A among pilgrims in white, the Kaaba softly visible in the distance at golden hour, he raises his hands in dua. → логотип + «Умра из Казахстана».

## Сценарий 3. «Два коня» (степь, Казахстан)

**Мораль:** спешка — от шайтана, терпение — от Аллаха.

1. **0–6 с.** Kazakh steppe at dawn, two small horse figurines on a wooden table: one golden with jewels, one simple carved wood. Man A (modest chapan, tubeteika, beard) and Man B (expensive leather jacket, gold chain).
2. **6–12 с.** Man B snatches the golden figurine; it grows into a real golden horse with jewels. He jumps on it, laughing.
3. **12–18 с.** The golden horse bucks, its legs stiffen like metal, jewels fall off; Man B falls into the grass, the horse freezes into a lifeless gold statue.
4. **18–24 с.** Man A gently picks up the wooden figurine; it grows into a real calm brown horse that nuzzles his hand.
5. **24–29 с.** Man A rides slowly toward the sunrise across the steppe, smiling. → логотип.

## Сценарий 4. «Два ключа» (дом)

**Мораль:** благословение — не в размере, а в баракате.

1. **0–6 с.** A quiet street, a table with two keys: a big ornate golden key and a small old iron key. Man A (plain shirt, beard) and Man B (suit, gold rings).
2. **6–12 с.** Man B takes the golden key; behind him a huge glossy mansion appears. Man A takes the iron key; a small modest house appears behind him.
3. **12–18 с.** Man B opens the mansion door — inside it is empty, cold and dark, echoing; the walls crack.
4. **18–24 с.** Man A opens his small door — warm light, his elderly father and young sons greet him, a table with tea and bread.
5. **24–29 с.** Man A sits with his family making dua before the meal, everyone smiling. → логотип.

## Что могу сделать сам в этом репозитории

- Финальную плашку 1,5 с с логотипом, текстом и звуком на движке `tools/kinetic/`, чтобы её можно было приклеить к любому ролику.
- Сборку: склейку генераций, наложение нашида, нормализацию звука до −14 LUFS, сжатие под Shorts / Reels.
- Обложку и текст описания с хэштегами.

Сами ИИ-кадры нужно генерировать во внешнем сервисе (Veo 3, Kling, Hailuo, Sora): здесь нет доступа к генератору видео.
