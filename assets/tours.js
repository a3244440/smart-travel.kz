// Каталог туров. price: null — показывается «Цена по запросу».
// Тексты на четырёх языках: { ru, kk, en, ar }.
(function(){
  const onRequest = { ru:"по запросу", kk:"сұраныс бойынша", en:"on request", ar:"عند الطلب" };
  window.TOURS = [
    { id:"cruise-umrah", group:"umrah", price:650000, oldPrice:1200000, visa:true,
      title:{ ru:"Круиз + Умра", kk:"Круиз + Умра", en:"Cruise + Umrah", ar:"رحلة بحرية + عمرة" },
      tier:{ ru:"Ультра премиум", kk:"Ультра премиум", en:"Ultra premium", ar:"ألترا بريميوم" },
      duration:{ ru:"14 дней / 13 ночей", kk:"14 күн / 13 түн", en:"14 days / 13 nights", ar:"14 يومًا / 13 ليلة" },
      points:{
        ru:["Саудовская Аравия, Египет, Турция","9 ночей круиза, All Inclusive","4 ночи — Мекка и Медина, отели первой линии","Умра в составе путешествия"],
        kk:["Сауд Арабиясы, Египет, Түркия","9 түн круиз, All Inclusive","4 түн — Мекке мен Медине, бірінші желідегі қонақүйлер","Саяхат құрамында Умра"],
        en:["Saudi Arabia, Egypt, Turkey","9 nights cruising, all inclusive","4 nights in Makkah and Madinah, front-line hotels","Umrah as part of the journey"],
        ar:["السعودية ومصر وتركيا","9 ليالٍ في رحلة بحرية شاملة كليًا","4 ليالٍ في مكة والمدينة في فنادق الصف الأول","العمرة ضمن الرحلة"] } },
    { id:"umrah-vip", group:"umrah", price:null, visa:true,
      title:{ ru:"Умра VIP", kk:"Умра VIP", en:"Umrah VIP", ar:"عمرة VIP" },
      tier:"VIP", duration:onRequest,
      points:{
        ru:["Отели с видом на Каабу","Индивидуальный трансфер","Сопровождение на всех обрядах"],
        kk:["Қағбаға қарайтын қонақүйлер","Жеке трансфер","Барлық рәсімдерде сүйемелдеу"],
        en:["Hotels overlooking the Kaaba","Private transfer","Guidance through every rite"],
        ar:["فنادق مطلة على الكعبة","نقل خاص","مرافقة في جميع المناسك"] } },
    { id:"umrah-luxe", group:"umrah", price:null, visa:true,
      title:{ ru:"Умра Luxe", kk:"Умра Luxe", en:"Umrah Luxe", ar:"عمرة Luxe" },
      tier:"Luxe", duration:onRequest,
      points:{
        ru:["Отели 5★ рядом с харамом","Групповой трансфер","Халяль-питание"],
        kk:["Харамға жақын 5★ қонақүйлер","Топтық трансфер","Халал тамақ"],
        en:["5★ hotels near the Haram","Group transfer","Halal meals"],
        ar:["فنادق 5★ قرب الحرم","نقل جماعي","وجبات حلال"] } },
    { id:"umrah-standard", group:"umrah", price:null, visa:true,
      title:{ ru:"Умра Standard", kk:"Умра Standard", en:"Umrah Standard", ar:"عمرة Standard" },
      tier:"Standard", duration:onRequest,
      points:{
        ru:["Отели 4★ в Мекке и Медине","Перелёт и трансферы","Групповой гид"],
        kk:["Мекке мен Мединедегі 4★ қонақүйлер","Ұшу және трансферлер","Топтық гид"],
        en:["4★ hotels in Makkah and Madinah","Flights and transfers","Group guide"],
        ar:["فنادق 4★ في مكة والمدينة","الطيران والتنقلات","مرشد للمجموعة"] } },
    { id:"dubai", group:"world", price:null, visa:false,
      title:{ ru:"Дубай", kk:"Дубай", en:"Dubai", ar:"دبي" },
      tier:{ ru:"Халяль-отели", kk:"Халал қонақүйлер", en:"Halal hotels", ar:"فنادق حلال" }, duration:onRequest,
      points:{
        ru:["Халяль-отели","Экскурсии по городу","Пляжный отдых"],
        kk:["Халал қонақүйлер","Қала бойынша экскурсиялар","Жағажай демалысы"],
        en:["Halal hotels","City tours","Beach holiday"],
        ar:["فنادق حلال","جولات في المدينة","عطلة شاطئية"] } },
    { id:"saadiyat", group:"world", price:null, visa:false,
      title:{ ru:"Саадият, Абу-Даби", kk:"Саадият, Әбу-Даби", en:"Saadiyat, Abu Dhabi", ar:"السعديات، أبوظبي" },
      tier:{ ru:"Курорт", kk:"Курорт", en:"Resort", ar:"منتجع" }, duration:onRequest,
      points:{
        ru:["Пляжи острова Саадият","Лувр Абу-Даби","Мечеть шейха Зайда"],
        kk:["Саадият аралының жағажайлары","Лувр Әбу-Даби","Шейх Заид мешіті"],
        en:["Saadiyat Island beaches","Louvre Abu Dhabi","Sheikh Zayed Grand Mosque"],
        ar:["شواطئ جزيرة السعديات","متحف اللوفر أبوظبي","جامع الشيخ زايد الكبير"] } },
    { id:"turkey", group:"world", price:null, visa:false,
      title:{ ru:"Турция", kk:"Түркия", en:"Turkey", ar:"تركيا" },
      tier:{ ru:"Горящие туры", kk:"Ыстық турлар", en:"Last-minute deals", ar:"عروض اللحظة الأخيرة" }, duration:onRequest,
      points:{
        ru:["Халяль-отели All Inclusive","Стамбул и побережье","Вылеты из Астаны и Алматы"],
        kk:["All Inclusive халал қонақүйлері","Стамбул және жағалау","Астана мен Алматыдан ұшу"],
        en:["All-inclusive halal hotels","Istanbul and the coast","Departures from Astana and Almaty"],
        ar:["فنادق حلال شاملة كليًا","إسطنبول والساحل","رحلات من أستانا وألماتي"] } }
  ];
})();
