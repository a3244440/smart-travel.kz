# ИИ-ассистент smart-travel.kz через n8n

Схема: клиент пишет в Instagram → SendPulse (блок «Запрос API») → n8n → Claude отвечает → n8n отправляет ответ через SendPulse API.
Если клиент оставил имя и телефон или просит менеджера — n8n создаёт сделку в CRM SendPulse (воронка «Умра — заявки smart-travel», этап «Новая заявка из бота»).

Файлы:
- `smart-travel-bot.workflow.json` — workflow для импорта в n8n.
- `system-prompt.md` — инструкция и база знаний ассистента (она уже вставлена в узел «ИИ-ассистент Аиша»; при изменении цен/туров правьте текст в этом узле).

## 1. n8n
1. n8n Cloud (n8n.io) или свой сервер с публичным https-адресом.
2. **Workflows → Import from File** → `smart-travel-bot.workflow.json`.

## 2. Ключи (только в n8n, никому не пересылать)
- **Anthropic API** — ключ из console.anthropic.com → в узле «Claude» создать credential *Anthropic account*. Модель: `claude-opus-5-5` (можно сменить на более дешёвую в этом же узле).
- **SendPulse API** — SendPulse → Настройки аккаунта → API → Client ID и Secret. В n8n: Credentials → **OAuth2 API**:
  - Grant Type: **Client Credentials**
  - Access Token URL: `https://api.sendpulse.com/oauth/access_token`
  - Client ID / Client Secret — из SendPulse
  - Authentication: **Send credentials in body**
  Выбрать этот credential в узлах «Отправить ответ клиенту» и «Сделка в CRM SendPulse».

## 3. SendPulse
1. Откройте узел «Сообщение из SendPulse» в n8n → скопируйте **Production URL** вебхука.
2. В цепочке «Стандартный ответ» замените блок «ИИ Агент» на блок **«Запрос API»**:
   - метод POST, URL — Production URL из n8n;
   - тело (JSON):
     ```json
     {"contact_id": "{{contact_id}}", "text": "{{last_message}}", "name": "{{full_name}}", "channel": "instagram"}
     ```
     Названия переменных сверьте со списком переменных в самом блоке (кнопка вставки переменной): нужны ID контакта и текст последнего сообщения.
3. Сохраните цепочку. В n8n включите workflow (**Active**).

## 4. Проверка
Напишите боту с другого аккаунта. В n8n → **Executions** видно каждое сообщение: что пришло, что ответил Claude, ушёл ли ответ. Ошибка на первом узле «Нет contact_id или text» — значит, в п.3 переменные называются иначе: пришлите текст ошибки, поправим.
