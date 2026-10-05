# ИИ-ассистент smart-travel.kz для Instagram — n8n, без SendPulse

Схема: клиент пишет в Instagram → Meta присылает сообщение в n8n → Claude отвечает → n8n отправляет ответ через Instagram API.
Если клиент оставил имя и телефон или просит менеджера — заявка появляется в админке сайта (smart-travel.kz/admin → «Заявки из Instagram-бота»).
Если в диалоге ответил человек (Алина) — бот молчит в этом диалоге 12 часов.

Файлы:
- `smart-travel-instagram.workflow.json` — workflow для импорта в n8n (основной).
- `system-prompt.md` — инструкция и база знаний (уже вставлены в узел «ИИ-ассистент Аиша»).
- `smart-travel-bot.workflow.json` — прежний вариант через SendPulse (не нужен, если используете этот).

## 1. n8n
n8n Cloud (n8n.io) или свой сервер с публичным https-адресом → **Workflows → Import from File** → `smart-travel-instagram.workflow.json`.

## 2. Приложение Meta (Instagram API with Instagram Login)
1. developers.facebook.com → **Create App** → сценарий «Manage messaging & content on Instagram».
2. Instagram → **API setup with Instagram login** → **Add account** → войти в Instagram, который будет ботом (для теста — @alikhan_seiilbek; аккаунт должен быть профессиональным: Business или Creator).
3. **Generate token** — это токен доступа (живёт 60 дней). В n8n: Credentials → **Header Auth**, имя `Instagram token`:
   Name: `Authorization`, Value: `Bearer <токен>`.
4. **Configure webhooks**:
   - Callback URL — **Production URL** узла «Instagram: сообщения» в n8n (у узла проверки тот же адрес);
   - Verify token — значение из узла «Токен совпал?» (`smart-travel-…`);
   - сначала **включите workflow в n8n (Active)**, потом нажмите **Verify and save**;
   - подпишитесь на поле **messages**.
5. В самом Instagram: Настройки → Конфиденциальность → Сообщения → **Подключённые инструменты → Разрешить доступ к сообщениям**.

**Режим разработки**: пока приложение не прошло проверку Meta, бот отвечает только аккаунтам с ролью в приложении.
Для теста: App roles → Roles → **Instagram Testers** → добавьте тестовый аккаунт (например, GoWork) и примите приглашение в Instagram (Настройки → Приложения и сайты → Приглашения тестировщиков).
Для настоящих клиентов: **App Review** на разрешение `instagram_business_manage_messages` + подтверждение компании (Business Verification).

## 3. Ключ Claude
console.anthropic.com → API Keys → в узле «Claude» создать credential *Anthropic account*. Модель: `claude-opus-5-5` (можно сменить в узле).

## 4. Заявки в админку сайта
В Supabase → SQL Editor выполните:
```sql
select value from app_secrets where name = 'bot_lead_token';
```
Скопируйте значение в узел **«Настройки»** (поле `lead_token`) вместо `ВСТАВЬТЕ_ТОКЕН_ИЗ_SUPABASE`. Этот токен позволяет только добавлять заявки — читать их могут только менеджеры в админке.

## 5. Проверка
1. Workflow включён (Active), вебхук в Meta подтверждён.
2. С тестового аккаунта напишите боту: «Сколько стоит Умра?», затем имя и телефон.
3. В n8n → **Executions** видно каждое сообщение: что пришло, что ответил Claude, ушёл ли ответ.
4. Заявка появится на smart-travel.kz/admin внизу, в разделе «Заявки из Instagram-бота».

## Важно
- Токен Instagram живёт 60 дней. Продлить: откройте в браузере
  `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<текущий токен>`
  и замените токен в credential «Instagram token». Делайте раз в ~50 дней.
- Instagram разрешает отвечать в течение 24 часов после последнего сообщения клиента — бот отвечает сразу, так что это не мешает.
- Пауза бота после ответа человека — 12 часов (`PAUSE_HOURS` в узле «Разобрать события»).
