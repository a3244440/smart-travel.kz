// Языки и тема. Подключается в <head>, до отрисовки страницы.
// Перевод: t("ключ", {переменные}). Порядок в словаре: ru, kk, en, ar.
(function(){
  const LANGS = [
    { code:"ru", short:"РУС",  name:"Русский",  locale:"ru-RU" },
    { code:"kk", short:"ҚАЗ",  name:"Қазақша",  locale:"kk-KZ" },
    { code:"en", short:"ENG",  name:"English",  locale:"en-GB" },
    { code:"ar", short:"عربي", name:"العربية", locale:"ar-u-nu-latn", rtl:true }
  ];
  const D = {
    // шапка и подвал
    "nav.home":      ["На главную","Басты бетке","Home","الصفحة الرئيسية"],
    "nav.tours":     ["Туры","Турлар","Tours","الرحلات"],
    "nav.visa":      ["Виза","Виза","Visa","التأشيرة"],
    "nav.cabinet":   ["Мои заявки","Өтінімдерім","My applications","طلباتي"],
    "nav.lang":      ["Язык сайта","Сайт тілі","Site language","لغة الموقع"],
    "theme.dark":    ["Включить тёмную тему","Қараңғы тақырыпты қосу","Switch to dark theme","تفعيل الوضع الداكن"],
    "theme.light":   ["Включить светлую тему","Жарық тақырыпты қосу","Switch to light theme","تفعيل الوضع الفاتح"],
    "footer.city":   ["Астана","Астана","Astana","أستانا"],
    "footer.note":   ["Решение по визе принимает МИД Саудовской Аравии","Виза бойынша шешімді Сауд Арабиясының СІМ қабылдайды","The visa decision is made by the Saudi Ministry of Foreign Affairs","يصدر قرار التأشيرة عن وزارة الخارجية السعودية"],
    "footer.manager":["Вход для менеджера","Менеджерге кіру","Manager login","دخول المدير"],

    // главная
    "title.home":    ["{brand} — Умра, Мекка, Медина и туры по миру","{brand} — Умра, Мекке, Медине және әлем бойынша турлар","{brand} — Umrah, Makkah, Madinah and world tours","{brand} — العمرة ومكة والمدينة ورحلات حول العالم"],
    "home.h1":       ["Умра, Мекка и Медина — с заботой о каждой детали","Умра, Мекке және Медине — әр егжей-тегжейге қамқорлықпен","Umrah, Makkah and Madinah — with care in every detail","العمرة ومكة والمدينة — بعناية في كل التفاصيل"],
    "home.lead":     ["Туры VIP, Luxe и Standard, круиз с Умрой и халяль-отдых по миру. Визу в Саудовскую Аравию оформим по фото паспорта.",
                      "VIP, Luxe және Standard турлары, Умрамен круиз және әлем бойынша халал демалыс. Сауд Арабиясына визаны паспорт фотосы бойынша рәсімдейміз.",
                      "VIP, Luxe and Standard tours, a cruise with Umrah and halal holidays worldwide. We arrange your Saudi visa from a photo of your passport.",
                      "رحلات VIP وLuxe وStandard، ورحلة بحرية مع العمرة، وعطلات حلال حول العالم. نستخرج تأشيرة السعودية من صورة جواز سفرك."],
    "home.choose":   ["Выбрать тур","Тур таңдау","Choose a tour","اختر رحلة"],
    "home.getVisa":  ["Оформить визу","Виза рәсімдеу","Apply for a visa","قدّم على التأشيرة"],
    "home.archTitle":["Виза за 5 минут","Виза 5 минутта","Visa in 5 minutes","التأشيرة في 5 دقائق"],
    "home.archText": ["Загрузите фото паспорта —<br>анкета заполнится сама","Паспорт фотосын жүктеңіз —<br>сауалнама өзі толады","Upload a passport photo —<br>the form fills itself in","ارفع صورة جواز السفر —<br>وسيُملأ النموذج تلقائيًا"],
    "home.start":    ["Начать","Бастау","Start","ابدأ"],
    "filter.all":    ["Все","Барлығы","All","الكل"],
    "filter.umrah":  ["Умра","Умра","Umrah","العمرة"],
    "filter.world":  ["Туры по миру","Әлем бойынша турлар","World tours","رحلات حول العالم"],
    "tour.more":     ["Узнать подробнее","Толығырақ","Learn more","اعرف المزيد"],
    "tour.onRequest":["Цена по запросу","Бағасы сұраныс бойынша","Price on request","السعر عند الطلب"],
    "tour.ask":      ["Здравствуйте! Интересует тур «{title}». Подскажите даты и стоимость.","Сәлеметсіз бе! «{title}» туры қызықтырады. Күндері мен бағасын айтып жібересіз бе?","Hello! I'm interested in the “{title}” tour. Could you tell me the dates and price?","مرحبًا! أنا مهتم برحلة «{title}». هل يمكنكم إخباري بالمواعيد والسعر؟"],

    // виза: страница
    "title.visa":    ["Виза в Саудовскую Аравию по фото паспорта — {brand}","Паспорт фотосы бойынша Сауд Арабиясына виза — {brand}","Saudi Arabia visa from a passport photo — {brand}","تأشيرة السعودية بصورة جواز السفر — {brand}"],
    "visa.h1":       ["Виза в Саудовскую Аравию по фото паспорта","Паспорт фотосы бойынша Сауд Арабиясына виза","Saudi Arabia visa from a passport photo","تأشيرة السعودية بصورة جواز السفر"],
    "visa.lead":     ["Сфотографируйте разворот паспорта — анкета заполнится сама. Вам останется проверить данные и отправить их менеджеру.",
                      "Паспорттың деректер бетін суретке түсіріңіз — сауалнама өзі толады. Сізге деректерді тексеріп, менеджерге жіберу ғана қалады.",
                      "Take a photo of your passport's data page — the form fills itself in. Then just check the details and send them to the manager.",
                      "صوّر صفحة بيانات جواز سفرك — وسيُملأ النموذج تلقائيًا. بعدها راجع البيانات وأرسلها إلى المدير."],
    "visa.s1":       ["Загрузите паспорт.","Паспортты жүктеңіз.","Upload your passport.","ارفع جواز السفر."],
    "visa.s1t":      ["Фото или PDF разворота с фотографией.","Фотосуреті бар беттің фотосы немесе PDF.","A photo or PDF of the page with your picture.","صورة أو ملف PDF لصفحة البيانات."],
    "visa.s2":       ["Проверьте анкету.","Сауалнаманы тексеріңіз.","Check the form.","راجع النموذج."],
    "visa.s2t":      ["Мы сверим срок действия и машиночитаемую строку.","Жарамдылық мерзімі мен машинамен оқылатын жолды тексереміз.","We check the expiry date and the machine-readable zone.","سنتحقق من تاريخ الصلاحية والسطر المقروء آليًا."],
    "visa.s3":       ["Сохраните и отправьте.","Сақтап, жіберіңіз.","Save and send.","احفظ وأرسل."],
    "visa.s3t":      ["Можно добавить паспорта всей семьи в одну заявку.","Бір өтінімге бүкіл отбасының паспорттарын қосуға болады.","You can add the whole family's passports to one application.","يمكنك إضافة جوازات العائلة كلها في طلب واحد."],
    "visa.upload":   ["Загрузите паспорт","Паспортты жүктеңіз","Upload your passport","ارفع جواز السفر"],
    "visa.drop":     ["Перетащите файл сюда или нажмите.<br>JPG, PNG или PDF","Файлды осында сүйреңіз немесе басыңыз.<br>JPG, PNG немесе PDF","Drag a file here or tap.<br>JPG, PNG or PDF","اسحب الملف إلى هنا أو اضغط.<br>JPG أو PNG أو PDF"],
    "visa.choose":   ["Выбрать файл","Файл таңдау","Choose file","اختر ملفًا"],
    "visa.fine":     ["Фото паспорта не сохраняется на сайте. Данные используются только для оформления визы.","Паспорт фотосы сайтта сақталмайды. Деректер тек виза рәсімдеу үшін қолданылады.","The passport photo is not stored on the site. Your data is used only to process the visa.","لا تُحفظ صورة الجواز على الموقع، وتُستخدم البيانات لإصدار التأشيرة فقط."],
    "visa.app":      ["Заявка на визу","Визаға өтінім","Visa application","طلب التأشيرة"],
    "visa.checks":   ["Проверка","Тексеру","Checks","التحقق"],
    "visa.pData":    ["Паспортные данные","Паспорт деректері","Passport details","بيانات الجواز"],
    "visa.pLatin":   ["Как в паспорте, латиницей.","Паспорттағыдай, латын әрпімен.","As in the passport, in Latin letters.","كما في الجواز، بالأحرف اللاتينية."],
    "visa.pAuto":    ["Заполнено автоматически. Исправьте, если что-то не так.","Автоматты түрде толтырылды. Қате болса, түзетіңіз.","Filled in automatically. Correct anything that's wrong.","تمت التعبئة تلقائيًا. صحّح أي خطأ."],
    "visa.trip":     ["Поездка и контакты","Сапар және байланыс","Trip and contacts","الرحلة وبيانات التواصل"],
    "visa.tripSub":  ["Общие для всей заявки.","Бүкіл өтінімге ортақ.","Shared by the whole application.","مشتركة لكامل الطلب."],
    "visa.submit":   ["Отправить заявку","Өтінімді жіберу","Submit application","إرسال الطلب"],
    "visa.csv":      ["Скачать CSV","CSV жүктеу","Download CSV","تنزيل CSV"],
    "visa.copy":     ["Скопировать текст","Мәтінді көшіру","Copy text","نسخ النص"],

    // виза: поля
    "f.surname":     ["Фамилия","Тегі","Surname","اسم العائلة"],
    "f.given_names": ["Имя","Аты","Given names","الاسم"],
    "f.sex":         ["Пол","Жынысы","Sex","الجنس"],
    "sex.M":         ["Мужской","Ер","Male","ذكر"],
    "sex.F":         ["Женский","Әйел","Female","أنثى"],
    "f.date_of_birth":["Дата рождения","Туған күні","Date of birth","تاريخ الميلاد"],
    "f.place_of_birth":["Место рождения","Туған жері","Place of birth","مكان الميلاد"],
    "f.nationality": ["Гражданство","Азаматтығы","Nationality","الجنسية"],
    "f.passport_number":["Номер паспорта","Паспорт нөмірі","Passport number","رقم الجواز"],
    "f.personal_number":["ИИН / личный номер","ЖСН / жеке нөмір","IIN / personal number","الرقم الشخصي (IIN)"],
    "f.issue_date":  ["Дата выдачи","Берілген күні","Date of issue","تاريخ الإصدار"],
    "f.expiry_date": ["Действителен до","Жарамдылық мерзімі","Date of expiry","تاريخ الانتهاء"],
    "f.issuing_authority":["Кем выдан","Берген орган","Issuing authority","جهة الإصدار"],
    "f.mrz":         ["Машиночитаемая строка (MRZ)","Машинамен оқылатын жол (MRZ)","Machine-readable zone (MRZ)","السطر المقروء آليًا (MRZ)"],
    "f.purpose":     ["Цель поездки","Сапар мақсаты","Purpose of travel","الغرض من السفر"],
    "p.umrah":       ["Умра","Умра","Umrah","عمرة"],
    "p.tourism":     ["Туризм","Туризм","Tourism","سياحة"],
    "p.cruise_umrah":["Круиз + Умра","Круиз + Умра","Cruise + Umrah","رحلة بحرية + عمرة"],
    "p.business":    ["Деловая","Іскерлік","Business","أعمال"],
    "f.arrival":     ["Дата въезда","Келу күні","Arrival date","تاريخ الدخول"],
    "f.nights":      ["Количество ночей","Түндер саны","Number of nights","عدد الليالي"],
    "f.contact_name":["Контактное лицо","Байланыс тұлғасы","Contact person","اسم الشخص للتواصل"],
    "f.phone":       ["Телефон / WhatsApp","Телефон / WhatsApp","Phone / WhatsApp","الهاتف / واتساب"],
    "f.email":       ["Email","Email","Email","البريد الإلكتروني"],
    "f.comment":     ["Пожелания","Тілектер","Notes","ملاحظات"],

    // виза: сообщения
    "m.badType":     ["Этот формат не подходит. Загрузите JPG, PNG или PDF.","Бұл формат келмейді. JPG, PNG немесе PDF жүктеңіз.","This format isn't supported. Upload a JPG, PNG or PDF.","هذه الصيغة غير مدعومة. ارفع ملف JPG أو PNG أو PDF."],
    "m.badPdf":      ["Не удалось открыть PDF. Сделайте фото разворота и загрузите его.","PDF ашылмады. Беттің суретін түсіріп, жүктеңіз.","Couldn't open the PDF. Take a photo of the page and upload that instead.","تعذّر فتح ملف PDF. صوّر الصفحة وارفع الصورة."],
    "m.mrzFail":     ["Не удалось прочитать машиночитаемую строку внизу паспорта. Загрузите ровное фото без бликов или заполните поля вручную.","Паспорттың төменгі жағындағы машинамен оқылатын жол оқылмады. Жарқылсыз, түзу фото жүктеңіз немесе өрістерді қолмен толтырыңыз.","Couldn't read the machine-readable lines at the bottom of the passport. Upload a straight photo without glare, or fill in the fields by hand.","تعذّرت قراءة السطر المقروء آليًا أسفل الجواز. ارفع صورة مستقيمة بلا انعكاسات أو املأ الحقول يدويًا."],
    "m.notPassport": ["На фото не видно разворота паспорта. Загрузите страницу с фотографией и данными.","Фотода паспорттың деректер беті көрінбейді. Фотосуреті мен деректері бар бетті жүктеңіз.","The photo doesn't show a passport data page. Upload the page with your picture and details.","لا تظهر صفحة بيانات الجواز في الصورة. ارفع الصفحة التي فيها صورتك وبياناتك."],
    "m.notGranted":  ["Автозаполнение не разрешено. Введите данные вручную.","Автотолтыруға рұқсат жоқ. Деректерді қолмен енгізіңіз.","Autofill isn't allowed. Enter the details by hand.","التعبئة التلقائية غير مسموحة. أدخل البيانات يدويًا."],
    "m.rate":        ["Слишком много запросов подряд. Подождите минуту и загрузите файл снова.","Сұраныстар тым көп. Бір минут күтіп, файлды қайта жүктеңіз.","Too many requests in a row. Wait a minute and upload the file again.","طلبات كثيرة متتالية. انتظر دقيقة وارفع الملف مجددًا."],
    "m.imgRejected": ["Файл не удалось прочитать. Попробуйте другое фото — ровное, без бликов.","Файл оқылмады. Басқа фото жүктеп көріңіз — түзу, жарқылсыз.","Couldn't read the file. Try another photo — straight, without glare.","تعذّرت قراءة الملف. جرّب صورة أخرى مستقيمة بلا انعكاسات."],
    "m.recognizeFail":["Не удалось распознать паспорт. Загрузите более чёткое фото или заполните поля вручную.","Паспорт танылмады. Анығырақ фото жүктеңіз немесе өрістерді қолмен толтырыңыз.","Couldn't recognise the passport. Upload a sharper photo or fill in the fields by hand.","تعذّر التعرف على الجواز. ارفع صورة أوضح أو املأ الحقول يدويًا."],
    "m.loadingOcr":  ["Загружаем распознавание… (первый раз ~10 секунд)","Тану жүйесі жүктелуде… (алғаш рет ~10 секунд)","Loading recognition… (about 10 seconds the first time)","جارٍ تحميل أداة التعرف… (نحو 10 ثوانٍ في المرة الأولى)"],
    "m.readingMrz":  ["Читаем строку MRZ внизу паспорта…","Паспорттың төменгі жағындағы MRZ жолын оқып жатырмыз…","Reading the MRZ lines at the bottom of the passport…","نقرأ سطر MRZ أسفل الجواز…"],
    "m.reading":     ["Читаем паспорт… обычно 10–30 секунд.","Паспортты оқып жатырмыз… әдетте 10–30 секунд.","Reading the passport… usually 10–30 seconds.","نقرأ الجواز… عادةً من 10 إلى 30 ثانية."],
    "m.partial":     ["Заполнено по строке MRZ. Добавьте вручную место рождения, дату выдачи и кем выдан.","MRZ жолы бойынша толтырылды. Туған жерін, берілген күнін және берген органды қолмен қосыңыз.","Filled in from the MRZ lines. Add the place of birth, date of issue and issuing authority by hand.","تمت التعبئة من سطر MRZ. أضف يدويًا مكان الميلاد وتاريخ الإصدار وجهة الإصدار."],
    "m.full":        ["Поля заполнены по фото. Сверьте каждое с паспортом.","Өрістер фото бойынша толтырылды. Әрқайсысын паспортпен салыстырыңыз.","Fields filled in from the photo. Check each one against the passport.","مُلئت الحقول من الصورة. طابق كل حقل مع الجواز."],
    "traveller":     ["Путешественник {n}","{n}-саяхатшы","Traveller {n}","المسافر {n}"],
    "addPassport":   ["+ Ещё паспорт","+ Тағы паспорт","+ Another passport","+ جواز آخر"],
    "uploadedAlt":   ["Загруженный паспорт","Жүктелген паспорт","Uploaded passport","الجواز المرفوع"],
    "replace":       ["Заменить","Ауыстыру","Replace","استبدال"],
    "uploadBtn":     ["Загрузить паспорт","Паспортты жүктеу","Upload passport","رفع الجواز"],
    "h.latin":       ["Только латиница, как в паспорте","Тек латын әрпімен, паспорттағыдай","Latin letters only, as in the passport","بالأحرف اللاتينية فقط كما في الجواز"],
    "v.fromArrival": ["даты въезда","келу күнінен","the arrival date","تاريخ الدخول"],
    "v.fromToday":   ["сегодня","бүгіннен","today","اليوم"],
    "v.expired":     ["Паспорт просрочен","Паспорттың мерзімі өткен","Passport has expired","انتهت صلاحية الجواز"],
    "v.expiredOn":   ["Истёк {date}","{date} аяқталған","Expired on {date}","انتهت في {date}"],
    "v.less6":       ["Срок паспорта меньше 6 месяцев","Паспорт мерзімі 6 айдан аз","Passport valid for less than 6 months","صلاحية الجواز أقل من 6 أشهر"],
    "v.need":        ["Нужно действие минимум до {date} (6 мес. от {from})","Кемінде {date} дейін жарамды болуы керек ({from} 6 ай)","Must be valid until at least {date} (6 months from {from})","يجب أن يكون صالحًا حتى {date} على الأقل (6 أشهر من {from})"],
    "v.need6":       ["Нужно минимум 6 месяцев","Кемінде 6 ай қажет","At least 6 months required","مطلوب 6 أشهر على الأقل"],
    "v.ok":          ["Срок паспорта подходит","Паспорт мерзімі жарамды","Passport validity is fine","صلاحية الجواز مناسبة"],
    "v.validUntil":  ["Действителен до {date}","{date} дейін жарамды","Valid until {date}","صالح حتى {date}"],
    "c.notAll":      ["Заполнены не все поля","Барлық өріс толтырылмаған","Not all fields are filled in","لم تُملأ كل الحقول"],
    "sep":           [", ",", ",", ","، "],
    "c.left":        ["Осталось: {list}","Қалды: {list}","Still needed: {list}","المتبقي: {list}"],
    "c.allDone":     ["Обязательные поля заполнены","Міндетті өрістер толтырылды","Required fields are filled in","الحقول المطلوبة مكتملة"],
    "c.validity":    ["Срок действия паспорта","Паспорттың жарамдылық мерзімі","Passport validity","صلاحية الجواز"],
    "c.enterExpiry": ["Укажите дату окончания","Аяқталу күнін көрсетіңіз","Enter the expiry date","أدخل تاريخ الانتهاء"],
    "c.mrz":         ["Сверка MRZ","MRZ салыстыру","MRZ check","التحقق من MRZ"],
    "c.mrzWait":     ["Появится, когда будет строка MRZ","MRZ жолы толтырылғанда шығады","Appears once the MRZ lines are filled in","يظهر عند إدخال سطر MRZ"],
    "c.mrzBad":      ["MRZ прочитана с ошибкой","MRZ қатемен оқылды","MRZ read with errors","قُرئ MRZ بأخطاء"],
    "c.mrzBadNote":  ["Контрольные цифры не сходятся — сверьте строку с паспортом","Бақылау сандары сәйкес емес — жолды паспортпен салыстырыңыз","Check digits don't match — compare the lines with the passport","أرقام التحقق غير متطابقة — طابق السطر مع الجواز"],
    "c.numMismatch": ["Номер не совпадает с MRZ","Нөмір MRZ-пен сәйкес емес","Number doesn't match the MRZ","الرقم لا يطابق MRZ"],
    "c.checkNumber": ["Проверьте номер паспорта","Паспорт нөмірін тексеріңіз","Check the passport number","تحقق من رقم الجواز"],
    "c.mrzOk":       ["MRZ сверена","MRZ тексерілді","MRZ verified","تم التحقق من MRZ"],
    "c.mrzOkNote":   ["Контрольные цифры совпадают","Бақылау сандары сәйкес","Check digits match","أرقام التحقق متطابقة"],
    "c.minor":       ["Несовершеннолетний ({age})","Кәмелетке толмаған ({age})","Minor ({age})","قاصر ({age})"],
    "c.minorNote":   ["Понадобится свидетельство о рождении и согласие родителей","Туу туралы куәлік пен ата-ананың келісімі қажет болады","A birth certificate and parental consent will be needed","ستحتاج إلى شهادة الميلاد وموافقة الوالدين"],
    "s.missing":     ["{who}: не заполнено — {list}","{who}: толтырылмаған — {list}","{who}: missing — {list}","{who}: غير مكتمل — {list}"],
    "s.phone":       ["Укажите телефон для связи","Байланыс телефонын көрсетіңіз","Enter a contact phone number","أدخل رقم هاتف للتواصل"],
    "s.sending":     ["Отправляем…","Жіберілуде…","Sending…","جارٍ الإرسال…"],
    "s.fail":        ["Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз","Өтінім жіберілмеді. Интернетті тексеріп, қайталап көріңіз","Couldn't send the application. Check your connection and try again","تعذّر إرسال الطلب. تحقق من الاتصال وحاول مجددًا"],
    "s.sent":        ["Заявка отправлена","Өтінім жіберілді","Application sent","تم إرسال الطلب"],
    "s.sentText":    ["Номер заявки — сохраните его, по нему можно проверить статус:","Өтінім нөмірі — оны сақтаңыз, ол арқылы мәртебені тексеруге болады:","Your application number — save it to check the status later:","رقم الطلب — احفظه لمتابعة الحالة:"],
    "s.sendWa":      ["Отправить в WhatsApp","WhatsApp-қа жіберу","Send via WhatsApp","إرسال عبر واتساب"],
    "s.checkStatus": ["Проверить статус","Мәртебені тексеру","Check status","متابعة الحالة"],
    "s.waHello":     ["Здравствуйте! Отправляю заявку на визу {id}.","Сәлеметсіз бе! {id} визаға өтінімін жіберемін.","Hello! Sending my visa application {id}.","مرحبًا! أرسل طلب التأشيرة رقم {id}."],
    "s.saved":       ["Файл сохранён","Файл сақталды","File saved","تم حفظ الملف"],
    "s.saveFail":    ["Не удалось сохранить файл","Файл сақталмады","Couldn't save the file","تعذّر حفظ الملف"],
    "s.copied":      ["Текст скопирован — вставьте его в WhatsApp менеджеру","Мәтін көшірілді — оны менеджерге WhatsApp-қа қойыңыз","Text copied — paste it into WhatsApp to the manager","تم نسخ النص — الصقه في واتساب للمدير"],
    "s.copyFail":    ["Браузер не дал скопировать. Используйте «Скачать CSV»","Браузер көшіруге рұқсат бермеді. «CSV жүктеу» батырмасын қолданыңыз","The browser blocked copying. Use “Download CSV” instead","منع المتصفح النسخ. استخدم «تنزيل CSV»"],

    // статус заявки
    "title.cabinet": ["Мои заявки — {brand}","Өтінімдерім — {brand}","My applications — {brand}","طلباتي — {brand}"],
    "cab.h1":        ["Статус визы","Виза мәртебесі","Visa status","حالة التأشيرة"],
    "cab.lead":      ["Введите номер заявки и телефон, который указали при оформлении.","Өтінім нөмірін және рәсімдеу кезінде көрсеткен телефонды енгізіңіз.","Enter your application number and the phone number you gave when applying.","أدخل رقم الطلب ورقم الهاتف الذي استخدمته عند التقديم."],
    "cab.id":        ["Номер заявки","Өтінім нөмірі","Application number","رقم الطلب"],
    "cab.phone":     ["Телефон","Телефон","Phone","الهاتف"],
    "cab.show":      ["Показать статус","Мәртебені көрсету","Show status","عرض الحالة"],
    "cab.empty":     ["Здесь появится ход оформления визы.","Мұнда визаны рәсімдеу барысы көрсетіледі.","Your visa progress will appear here.","سيظهر هنا سير معاملة التأشيرة."],
    "cab.need":      ["Укажите номер заявки и телефон.","Өтінім нөмірі мен телефонды көрсетіңіз.","Enter the application number and phone.","أدخل رقم الطلب والهاتف."],
    "cab.server":    ["Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.","Сервермен байланыс орнамады. Интернетті тексеріп, қайталап көріңіз.","Couldn't reach the server. Check your connection and try again.","تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مجددًا."],
    "cab.notFound":  ["Заявка не найдена. Проверьте номер и телефон — или напишите менеджеру.","Өтінім табылмады. Нөмір мен телефонды тексеріңіз немесе менеджерге жазыңыз.","Application not found. Check the number and phone — or message the manager.","لم يُعثر على الطلب. تحقق من الرقم والهاتف أو راسل المدير."],
    "cab.mine":      ["Заявки с этого устройства","Осы құрылғыдан жіберілген өтінімдер","Applications from this device","الطلبات المرسلة من هذا الجهاز"],
    "cab.app":       ["Заявка {id}","{id} өтінімі","Application {id}","الطلب {id}"],
    "cab.arrival":   ["въезд {date}","келу {date}","arrival {date}","الدخول {date}"],
    "cab.noDate":    ["дата въезда не указана","келу күні көрсетілмеген","arrival date not set","تاريخ الدخول غير محدد"],
    "cab.note":      ["Комментарий менеджера:","Менеджер пікірі:","Manager's comment:","تعليق المدير:"],
    "cab.write":     ["Написать менеджеру","Менеджерге жазу","Message the manager","راسل المدير"],
    "cab.waAsk":     ["Здравствуйте! Вопрос по заявке {id}","Сәлеметсіз бе! {id} өтінімі бойынша сұрақ","Hello! A question about application {id}","مرحبًا! لدي سؤال بخصوص الطلب {id}"],
    "st.new":        ["Заявка получена","Өтінім қабылданды","Application received","تم استلام الطلب"],
    "st.review":     ["Проверяем документы","Құжаттарды тексеріп жатырмыз","Checking documents","نراجع المستندات"],
    "st.submitted":  ["Подана на визу","Визаға тапсырылды","Submitted for visa","قُدّم طلب التأشيرة"],
    "st.approved":   ["Виза одобрена","Виза мақұлданды","Visa approved","تمت الموافقة على التأشيرة"],
    "st.fix":        ["Нужны исправления","Түзету қажет","Corrections needed","مطلوب تصحيحات"]
  };

  const root = document.documentElement;
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k,v){ try { localStorage.setItem(k, v); } catch(e){} }
  };
  const find = code => LANGS.find(l => l.code === code);
  function detect(){
    if(root.dataset.lockLang) return root.dataset.lockLang;
    const q = new URLSearchParams(location.search).get("lang");
    if(find(q)){ store.set("lang", q); return q; }
    const saved = store.get("lang"); if(find(saved)) return saved;
    for(const n of (navigator.languages || [navigator.language || ""])){
      const c = String(n).slice(0,2).toLowerCase();
      if(c === "kk" || c === "kz") return "kk";
      if(find(c)) return c;
    }
    return "ru";
  }
  let lang = detect();
  const idx = () => LANGS.findIndex(l => l.code === lang);

  function tIn(code, key, vars){
    const row = D[key], i = LANGS.findIndex(l => l.code === code);
    let s = row ? (row[i] ?? row[0]) : key;
    if(vars) s = s.replace(/\{(\w+)\}/g, (m,k) => vars[k] ?? m);
    return s;
  }
  function t(key, vars){
    const row = D[key];
    let s = row ? (row[idx()] ?? row[0]) : key;
    if(vars) s = s.replace(/\{(\w+)\}/g, (m,k) => vars[k] ?? m);
    return s;
  }
  // значение из объекта вида {ru, kk, en, ar} или строка
  const pick = v => v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.ru) : v;

  function setRoot(){
    const L = find(lang);
    root.lang = lang;
    root.dir = L.rtl ? "rtl" : "ltr";
  }
  function apply(scope){
    const el = scope || document;
    const brand = (window.SITE && SITE.brand) || "";
    el.querySelectorAll("[data-i18n]").forEach(n => n.textContent = t(n.dataset.i18n));
    el.querySelectorAll("[data-i18n-html]").forEach(n => n.innerHTML = t(n.dataset.i18nHtml));
    el.querySelectorAll("[data-i18n-ph]").forEach(n => n.placeholder = t(n.dataset.i18nPh));
    el.querySelectorAll("[data-i18n-aria]").forEach(n => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    const tk = document.body && document.body.dataset.title;
    if(tk) document.title = t(tk, { brand });
  }
  function setLang(code){
    if(!find(code) || code === lang) return;
    lang = code; store.set("lang", code); setRoot(); apply();
    const u = new URL(location.href);
    if(u.searchParams.has("lang")){ u.searchParams.set("lang", code); history.replaceState(null, "", u); }
    document.dispatchEvent(new CustomEvent("langchange", { detail:{ lang } }));
  }

  // тема: сохранённый выбор или настройка устройства
  const darkMQ = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  function theme(){ return root.dataset.theme || (darkMQ && darkMQ.matches ? "dark" : "light"); }
  function setTheme(v){
    root.dataset.theme = v; store.set("theme", v);
    document.dispatchEvent(new CustomEvent("themechange", { detail:{ theme:v } }));
  }
  const savedTheme = store.get("theme");
  if(savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  if(darkMQ) try { darkMQ.addEventListener("change", () => { if(!root.dataset.theme) document.dispatchEvent(new CustomEvent("themechange")); }); } catch(e){}

  setRoot();
  document.addEventListener("DOMContentLoaded", () => apply());

  window.I18N = {
    LANGS, t, tIn, pick, apply, setLang, theme, setTheme,
    get lang(){ return lang; },
    get locale(){ return find(lang).locale; },
    get locked(){ return !!root.dataset.lockLang; }
  };
  window.t = t;
})();
