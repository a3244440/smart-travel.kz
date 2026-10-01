// Каталог туров. price: null — показывается «Узнать цену».
window.TOURS = [
  { id:"cruise-umrah", group:"umrah", title:"Круиз + Умра", tier:"Ультра премиум",
    duration:"14 дней / 13 ночей", price:650000, oldPrice:1200000, visa:true,
    points:["Саудовская Аравия, Египет, Турция","9 ночей круиза, All Inclusive","4 ночи — Мекка и Медина, отели первой линии","Умра в составе путешествия"] },
  { id:"umrah-vip", group:"umrah", title:"Умра VIP", tier:"VIP",
    duration:"по запросу", price:null, visa:true,
    points:["Отели с видом на Каабу","Индивидуальный трансфер","Сопровождение на всех обрядах"] },
  { id:"umrah-luxe", group:"umrah", title:"Умра Luxe", tier:"Luxe",
    duration:"по запросу", price:null, visa:true,
    points:["Отели 5★ рядом с харамом","Групповой трансфер","Халяль-питание"] },
  { id:"umrah-standard", group:"umrah", title:"Умра Standard", tier:"Standard",
    duration:"по запросу", price:null, visa:true,
    points:["Отели 4★ в Мекке и Медине","Перелёт и трансферы","Групповой гид"] },
  { id:"dubai", group:"world", title:"Дубай", tier:"Halal hotel",
    duration:"по запросу", price:null, visa:false,
    points:["Халяль-отели","Экскурсии по городу","Пляжный отдых"] },
  { id:"saadiyat", group:"world", title:"Саадият, Абу-Даби", tier:"Курорт",
    duration:"по запросу", price:null, visa:false,
    points:["Пляжи острова Саадият","Лувр Абу-Даби","Мечеть шейха Зайда"] },
  { id:"turkey", group:"world", title:"Турция", tier:"Горящие туры",
    duration:"по запросу", price:null, visa:false,
    points:["Халяль-отели All Inclusive","Стамбул и побережье","Вылеты из Астаны и Алматы"] }
];
