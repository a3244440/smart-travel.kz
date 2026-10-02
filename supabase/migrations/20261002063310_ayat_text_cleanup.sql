-- служебный знак ۞ перед арабским текстом; в казахском переводе источника потеряны скобки пояснений — возвращаем
update public.ayat set ar = trim(substr(ar, 2)) where ar like '۞%';
update public.ayat set kk = replace(kk,'Үйдің Қағбаның орнын','Үйдің (Қағбаның) орнын') where ref='22:26';
update public.ayat set kk = replace(kk,'Үйді Қағбаны','Үйді (Қағбаны)') where ref='2:125';
update public.ayat set kk = replace(kk,'Үйге Қағбаға','Үйге (Қағбаға)') where ref='2:158';
update public.ayat set kk = replace(kk,'мәңгілік өмірде ақиретте игілік','мәңгілік өмірде (ақиретте) игілік') where ref='2:201';
update public.ayat set kk = replace(kk,'мұныбағынышты','мұны бағынышты') where ref='43:13';
update public.ayat set kk = replace(kk,'жауап берсін бұйрығымды орындасын және','жауап берсін (бұйрығымды орындасын) және') where ref='2:186';
update public.ayat set kk = replace(kk,'жандандырамыз игілікті өмір сүргіземіз .Әрі','жандандырамыз (игілікті өмір сүргіземіз). Әрі') where ref='16:97';
update public.ayat set kk = replace(replace(kk,'Айт Оларға Аллаһтың сөзін :','Айт (оларға Аллаһтың сөзін):'),'Мейірімді », деп','Мейірімді»,- деп') where ref='39:53';
update public.ayat set kk = replace(replace(kk,'Имандылар мүміндер','Имандылар (мүміндер)'),'тапсырсын тәуекел етсін », деп','тапсырсын (тәуекел етсін)»,- деп') where ref='9:51';
update public.ayat set kk = replace(kk,'Еске салуымен Құранмен','Еске салуымен (Құранмен)') where ref='13:28';
update public.ayat set kk = replace(kk,'шүкір етіңдер берген игіліктеріме алғыс білдіріңдер және күпірлік етпеңдер серік қосу, күнә, шүкірсіздік арқылықарсы келмеңдер','шүкір етіңдер (берген игіліктеріме алғыс білдіріңдер) және күпірлік етпеңдер (серік қосу, күнә, шүкірсіздік арқылы қарсы келмеңдер)') where ref='2:152';
update public.ayat set kk = replace(kk,'алыс жерлерден жердің түкпір-түкпірінен','алыс жерлерден (жердің түкпір-түкпірінен)') where ref='22:27';
