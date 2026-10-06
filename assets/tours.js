// Форматы Умры. price: null — «Цена по запросу». Тексты на четырёх языках: { ru, kk, en, ar }.
// Идея: группа собирается из людей одного ритма жизни — молодёжь отдельно, семьи и старшее поколение отдельно, VIP отдельно.
(function(){
  const onRequest = { ru:"даты по запросу", kk:"күндері сұраныс бойынша", en:"dates on request", ar:"المواعيد عند الطلب" };
  window.TOURS = [
    { id:"umra-youth", photo:"assets/tours/umrah-luxe.jpg", group:"umrah", price:null, visa:true, featured:true,
      title:{ ru:"Umra Youth", kk:"Umra Youth", en:"Umra Youth", ar:"Umra Youth" },
      tier:{ ru:"Только молодёжная группа", kk:"Тек жастар тобы", en:"Youth-only group", ar:"مجموعة للشباب فقط" },
      duration:{ ru:"Набор в UMRA YOUTH | 01", kk:"UMRA YOUTH | 01 тобына қабылдау", en:"Now forming: UMRA YOUTH | 01", ar:"التسجيل في UMRA YOUTH | 01" },
      points:{
        ru:["Группа из ровесников — без разрыва по возрасту","Поклонение, знания и братство вместе со своим поколением","Гид-устаз рядом на обрядах и зиярате","Сообщество после возвращения домой"],
        kk:["Құрдастар тобы — жас айырмашылығынсыз","Ғибадат, білім және бауырластық өз буыныңмен бірге","Рәсімдер мен зияратта гид-ұстаз қасыңда","Үйге оралғаннан кейін де қауымдастық"],
        en:["A group of peers — no age gap","Worship, knowledge and brotherhood with your generation","A guide and teacher beside you during the rites and ziyarat","A community that continues after you return home"],
        ar:["مجموعة من الأقران — بلا فجوة عمرية","عبادة وعلم وأخوّة مع جيلك","مرشد ومعلّم بجانبك في المناسك والزيارة","مجتمع يستمر بعد العودة إلى الوطن"] } },
    { id:"umra-family", photo:"assets/tours/umrah-standard.jpg", group:"umrah", price:null, visa:true,
      title:{ ru:"Umra Family", kk:"Umra Family", en:"Umra Family", ar:"Umra Family" },
      tier:{ ru:"Для семей и старшего поколения", kk:"Отбасылар мен аға буынға", en:"For families and elders", ar:"للعائلات وكبار السن" },
      duration:onRequest,
      points:{
        ru:["Спокойный темп для родителей и старших","Поездка с детьми — программа под семью","Отели рядом с Харамом, меньше ходьбы","Сопровождение и помощь на каждом этапе"],
        kk:["Ата-ана мен үлкендерге арналған байсалды қарқын","Балалармен сапар — отбасыға лайық бағдарлама","Харамға жақын қонақүйлер, жаяу жүру аз","Әр кезеңде сүйемелдеу мен көмек"],
        en:["A calm pace for parents and elders","Travelling with children — a family-friendly programme","Hotels close to the Haram, less walking","Support and help at every step"],
        ar:["إيقاع هادئ للوالدين وكبار السن","السفر مع الأطفال — برنامج يناسب العائلة","فنادق قريبة من الحرم ومشي أقل","مرافقة ومساعدة في كل مرحلة"] } },
    { id:"umra-signature", photo:"assets/tours/umrah-vip.jpg", group:"umrah", price:null, visa:true,
      title:{ ru:"Umra Signature", kk:"Umra Signature", en:"Umra Signature", ar:"Umra Signature" },
      tier:{ ru:"VIP · индивидуально", kk:"VIP · жеке", en:"VIP · private", ar:"VIP · خاص" },
      duration:onRequest,
      points:{
        ru:["Отели с видом на Каабу","Индивидуальный трансфер","Персональное сопровождение на всех обрядах","Даты и программа под вас"],
        kk:["Қағбаға қарайтын қонақүйлер","Жеке трансфер","Барлық рәсімдерде жеке сүйемелдеу","Күндері мен бағдарламасы сізге лайықталады"],
        en:["Hotels overlooking the Kaaba","Private transfers","Personal guidance through all the rites","Dates and programme tailored to you"],
        ar:["فنادق مطلة على الكعبة","تنقلات خاصة","مرافقة شخصية في جميع المناسك","مواعيد وبرنامج حسب رغبتك"] } }
  ];
})();
