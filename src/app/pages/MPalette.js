// Généré par scripts/dc2preact.py depuis design/app/MPalette.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class MPalette extends DCLogic {
  componentDidMount() { if (this.inp) this.inp.focus(); }
  renderVals() {
    let AP = [{"k": "app", "n": "Rizz App", "niche": "Séduction IA", "mk": [{"c": "US"}, {"c": "ID"}, {"c": "MX"}], "v30": "59,7 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": true, "covs": [{"src": "/media/app/v-7702250997850098958.jpg", "v": "2,6 M"}, {"src": "/media/app/v-7700724672438045965.jpg", "v": "2,5 M"}, {"src": "/media/app/v-7702290769213672718.jpg", "v": "1,9 M"}], "href": "/app/apps/astraai", "key": "Rizz App Séduction IA"}, {"k": "app", "n": "Astra AI", "niche": "Études", "mk": [{"c": "ID"}, {"c": "US"}, {"c": "ES"}], "v30": "57,7 M", "acc": "—", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7700392351268752661.jpg", "v": "2,6 M"}, {"src": "/media/app/v-7697654738124442896.jpg", "v": "2,6 M"}, {"src": "/media/app/v-7702743575934684437.jpg", "v": "2,3 M"}], "href": "/app/apps/astraai", "key": "Astra AI Études"}, {"k": "app", "n": "Knowunity", "niche": "Études", "mk": [{"c": "US"}, {"c": "ID"}, {"c": "ES"}], "v30": "44,4 M", "acc": "—", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7699151144400244000.jpg", "v": "5,7 M"}, {"src": "/media/app/v-7702625361716170002.jpg", "v": "3,5 M"}, {"src": "/media/app/v-7698010148391947552.jpg", "v": "2,5 M"}], "href": "/app/apps/astraai", "key": "Knowunity Études"}, {"k": "app", "n": "Love8", "niche": "Couple", "mk": [{"c": "ID"}, {"c": "US"}, {"c": "FR"}], "v30": "35,1 M", "acc": "—", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7705441234847862037.jpg", "v": "2 M"}, {"src": "/media/app/v-7705024255746002182.jpg", "v": "1,9 M"}, {"src": "/media/app/v-7701914062296337685.jpg", "v": "1,8 M"}], "href": "/app/apps/astraai", "key": "Love8 Couple"}, {"k": "app", "n": "WRizz", "niche": "Séduction IA", "mk": [{"c": "US"}, {"c": "ID"}], "v30": "31,9 M", "acc": "—", "logo": "/media/app/app-wrizz.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7706018218397273362.jpg", "v": "5 M"}, {"src": "/media/app/v-7700803310495829266.jpg", "v": "3 M"}, {"src": "/media/app/v-7701533350825037063.jpg", "v": "1,9 M"}], "href": "/app/apps/astraai", "key": "WRizz Séduction IA"}, {"k": "app", "n": "Wing AI", "niche": "Séduction IA", "mk": [{"c": "US"}, {"c": "MX"}], "v30": "19,6 M", "acc": "—", "logo": "/media/app/app-wing-ai.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7703242451120688405.jpg", "v": "1,4 M"}, {"src": "/media/app/v-7701632447951211798.jpg", "v": "876 k"}, {"src": "/media/app/v-7705479809580715284.jpg", "v": "869 k"}], "href": "/app/apps/astraai", "key": "Wing AI Séduction IA"}, {"k": "app", "n": "Cal AI", "niche": "Santé et physique", "mk": [{"c": "US"}], "v30": "17,1 M", "acc": "—", "logo": "/media/app/app-cal-ai.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7701127438704577823.jpg", "v": "1,3 M"}, {"src": "/media/app/v-7702142316479384853.jpg", "v": "878 k"}, {"src": "/media/app/v-7706561664451136788.jpg", "v": "757 k"}], "href": "/app/apps/astraai", "key": "Cal AI Santé et physique"}, {"k": "app", "n": "Praktika", "niche": "Langues", "mk": [{"c": "ID"}, {"c": "US"}, {"c": "FR"}], "v30": "16,6 M", "acc": "—", "logo": "/media/app/app-praktika.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7704867469072141588.jpg", "v": "2,1 M"}, {"src": "/media/app/v-7704226978622082324.jpg", "v": "1,9 M"}, {"src": "/media/app/v-7703758186087566612.jpg", "v": "1,5 M"}], "href": "/app/apps/astraai", "key": "Praktika Langues"}, {"k": "app", "n": "RecentFollow", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}], "v30": "13,1 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": true, "covs": [{"src": "/media/app/v-7705376808862076182.jpg", "v": "1,2 M"}, {"src": "/media/app/v-7706834426096815382.jpg", "v": "874 k"}, {"src": "/media/app/v-7700279402319367425.jpg", "v": "854 k"}], "href": "/app/apps/astraai", "key": "RecentFollow Jalousie et ex"}, {"k": "app", "n": "The Cringe", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "FR"}, {"c": "ID"}], "v30": "12,2 M", "acc": "—", "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": "", "hasCov": true, "covs": [{"src": "/media/app/v-7703301496879861014.jpg", "v": "2,5 M"}, {"src": "/media/app/v-7705159889147923734.jpg", "v": "1,1 M"}, {"src": "/media/app/v-7701454363897629974.jpg", "v": "1,1 M"}], "href": "/app/apps/astraai", "key": "The Cringe Jalousie et ex"}, {"k": "app", "n": "Plug AI", "niche": "Séduction IA", "mk": [{"c": "US"}, {"c": "ID"}], "v30": "11,0 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Plug AI Séduction IA"}, {"k": "app", "n": "Umax", "niche": "Santé et physique", "mk": [{"c": "US"}], "v30": "10,2 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Umax Santé et physique"}, {"k": "app", "n": "The Ick", "niche": "Jalousie et ex", "mk": [{"c": "ID"}, {"c": "FR"}, {"c": "US"}], "v30": "9,8 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "The Ick Jalousie et ex"}, {"k": "app", "n": "FollowOtter", "niche": "Jalousie et ex", "mk": [{"c": "US"}], "v30": "8,7 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "FollowOtter Jalousie et ex"}, {"k": "app", "n": "Shortfy", "niche": "Side hustle", "mk": [{"c": "FR"}], "v30": "7,3 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Shortfy Side hustle"}, {"k": "app", "n": "Airbuds", "niche": "Social et loisirs", "mk": [{"c": "US"}, {"c": "MX"}, {"c": "ID"}], "v30": "7,1 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Airbuds Social et loisirs"}, {"k": "app", "n": "Sweatcoin", "niche": "Side hustle", "mk": [{"c": "MX"}, {"c": "US"}, {"c": "ID"}], "v30": "5,2 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Sweatcoin Side hustle"}, {"k": "app", "n": "Voca AI", "niche": "Langues", "mk": [{"c": "US"}, {"c": "BR"}, {"c": "ID"}], "v30": "5,0 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Voca AI Langues"}, {"k": "app", "n": "Snitchy", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "FR"}, {"c": "ID"}], "v30": "4,9 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Snitchy Jalousie et ex"}, {"k": "app", "n": "Fluencify", "niche": "Side hustle", "mk": [{"c": "BR"}, {"c": "US"}, {"c": "MX"}], "v30": "4,7 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Fluencify Side hustle"}, {"k": "app", "n": "What Brandon Thinks", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}, {"c": "BR"}], "v30": "4,5 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "What Brandon Thinks Jalousie et ex"}, {"k": "app", "n": "Flo", "niche": "Santé et physique", "mk": [{"c": "US"}, {"c": "BR"}, {"c": "ID"}], "v30": "4,4 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Flo Santé et physique"}, {"k": "app", "n": "Bible Chat", "niche": "Foi", "mk": [{"c": "US"}, {"c": "ID"}, {"c": "MX"}], "v30": "4,4 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Bible Chat Foi"}, {"k": "app", "n": "Quittr", "niche": "Santé et physique", "mk": [{"c": "US"}], "v30": "3,7 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Quittr Santé et physique"}, {"k": "app", "n": "Creed", "niche": "Foi", "mk": [{"c": "US"}, {"c": "ID"}], "v30": "3,3 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Creed Foi"}, {"k": "app", "n": "Airlearn", "niche": "Langues", "mk": [{"c": "US"}, {"c": "MX"}], "v30": "3,2 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Airlearn Langues"}, {"k": "app", "n": "FollowSpy", "niche": "Jalousie et ex", "mk": [{"c": "MX"}, {"c": "US"}], "v30": "3,2 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "FollowSpy Jalousie et ex"}, {"k": "app", "n": "Retain Cards", "niche": "Études", "mk": [{"c": "FR"}, {"c": "ID"}, {"c": "US"}], "v30": "3,0 M", "acc": "—", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": "", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Retain Cards Études"}, {"k": "app", "n": "Glam AI", "niche": "Beauté IA", "mk": [{"c": "US"}, {"c": "ID"}, {"c": "MX"}], "v30": "2,6 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Glam AI Beauté IA"}, {"k": "app", "n": "Shady", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}, {"c": "FR"}], "v30": "1,7 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Shady Jalousie et ex"}, {"k": "app", "n": "Fit AI", "niche": "Santé et physique", "mk": [{"c": "US"}], "v30": "1,6 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Fit AI Santé et physique"}, {"k": "app", "n": "Finch", "niche": "Santé et physique", "mk": [{"c": "US"}], "v30": "1,5 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Finch Santé et physique"}, {"k": "app", "n": "Serializd", "niche": "Social et loisirs", "mk": [{"c": "US"}], "v30": "1,3 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Serializd Social et loisirs"}, {"k": "app", "n": "Rizz Master", "niche": "Séduction IA", "mk": [{"c": "US"}], "v30": "1,1 M", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Rizz Master Séduction IA"}, {"k": "app", "n": "CheatLove", "niche": "Jalousie et ex", "mk": [{"c": "FR"}], "v30": "780 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "CheatLove Jalousie et ex"}, {"k": "app", "n": "Loverzz", "niche": "Couple", "mk": [{"c": "US"}, {"c": "ID"}, {"c": "BR"}], "v30": "640 k", "acc": "—", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": "", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Loverzz Couple"}, {"k": "app", "n": "Flert Now", "niche": "Séduction IA", "mk": [], "v30": "430 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Flert Now Séduction IA"}, {"k": "app", "n": "Sunsay", "niche": "Autres", "mk": [], "v30": "380 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Sunsay Autres"}, {"k": "app", "n": "Stalkie", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "BR"}, {"c": "MX"}], "v30": "340 k", "acc": "—", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": "", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Stalkie Jalousie et ex"}, {"k": "app", "n": "SafeNow", "niche": "Autres", "mk": [], "v30": "220 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "SafeNow Autres"}, {"k": "app", "n": "Katch", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "FR"}], "v30": "110 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Katch Jalousie et ex"}, {"k": "app", "n": "Palima", "niche": "Autres", "mk": [{"c": "FR"}], "v30": "90 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Palima Autres"}, {"k": "app", "n": "Lurk", "niche": "Jalousie et ex", "mk": [{"c": "MX"}, {"c": "US"}], "v30": "90 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Lurk Jalousie et ex"}, {"k": "app", "n": "TrendSaaS", "niche": "Side hustle", "mk": [{"c": "FR"}, {"c": "ID"}], "v30": "60 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "TrendSaaS Side hustle"}, {"k": "app", "n": "Susly", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}, {"c": "ID"}], "v30": "60 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Susly Jalousie et ex"}, {"k": "app", "n": "Kairo Alarme", "niche": "Autres", "mk": [{"c": "BR"}], "v30": "20 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Kairo Alarme Autres"}, {"k": "app", "n": "Leaked DMs", "niche": "Jalousie et ex", "mk": [], "v30": "10 k", "acc": "—", "logo": "", "nologo": true, "blank": "sw-app-blank", "hasCov": false, "covs": [], "href": "/app/apps/astraai", "key": "Leaked DMs Jalousie et ex"}];
    let FM = [{"k": "fm", "t": "« Ich lösche das in 2h‼️ »", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "med": "39×", "ok": "3 sur 4", "max": "106 k", "apps": "Retain Cards", "n": 3, "covs": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k"}], "href": "/app/formats", "key": "Ich lösche das in 2h‼️ Retain Cards Études"}, {"k": "fm", "t": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "med": "17×", "ok": "3 sur 4", "max": "38 k", "apps": "Astra AI", "n": 3, "covs": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k"}], "href": "/app/formats", "key": "‼️🚨GUARDA E PARTILHA🚨‼️ Astra AI Études"}, {"k": "fm", "t": "exam vibes", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "med": "7×", "ok": "4 sur 6", "max": "23 k", "apps": "Astra AI", "n": 5, "covs": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k"}], "href": "/app/formats", "key": "exam vibes Astra AI Études"}, {"k": "fm", "t": "original sound - dicsovn", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "med": "5,7×", "ok": "2 sur 3", "max": "1,67 M", "apps": "Love8", "n": 3, "covs": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152"}], "href": "/app/formats", "key": "original sound - dicsovn Love8 Couple"}, {"k": "fm", "t": "« HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️ »", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "med": "4,9×", "ok": "3 sur 4", "max": "24 k", "apps": "Knowunity", "n": 4, "covs": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k"}], "href": "/app/formats", "key": "HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️ Knowunity Études"}, {"k": "fm", "t": "« “POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar  »", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "med": "4,7×", "ok": "7 sur 11", "max": "9 k", "apps": "Retain Cards", "n": 4, "covs": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k"}], "href": "/app/formats", "key": "“POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar  Retain Cards Études"}, {"k": "fm", "t": "purple", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "med": "3,5×", "ok": "2 sur 3", "max": "4 k", "apps": "Love8 et Airbuds", "n": 3, "covs": [{"src": "/media/app/v-7706958665764408597.jpg", "v": "4 k"}, {"src": "/media/app/v-7703620473116036382.jpg", "v": "3 k"}, {"src": "/media/app/v-7701384137596226838.jpg", "v": "3 k"}], "href": "/app/formats", "key": "purple Love8 et Airbuds Couple"}, {"k": "fm", "t": "« Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada »", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "med": "3,3×", "ok": "2 sur 3", "max": "71 k", "apps": "RecentFollow", "n": 3, "covs": [{"src": "/media/app/v-7705537368907959573.jpg", "v": "71 k"}, {"src": "/media/app/v-7706784554777939208.jpg", "v": "4 k"}, {"src": "/media/app/v-7704179787698359604.jpg", "v": "717"}], "href": "/app/formats", "key": "Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada RecentFollow Jalousie et ex"}, {"k": "fm", "t": "original sound - ex7stence", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "med": "3,2×", "ok": "2 sur 3", "max": "28 k", "apps": "RecentFollow", "n": 3, "covs": [{"src": "/media/app/v-7704011591062261023.jpg", "v": "28 k"}, {"src": "/media/app/v-7707075093578419476.jpg", "v": "7 k"}, {"src": "/media/app/v-7704407707469630741.jpg", "v": "6 k"}], "href": "/app/formats", "key": "original sound - ex7stence RecentFollow Jalousie et ex"}, {"k": "fm", "t": "Hey There Delilah", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "med": "3,2×", "ok": "2 sur 3", "max": "5 k", "apps": "Loverzz et Palima", "n": 3, "covs": [{"src": "/media/app/v-7705565722017090848.jpg", "v": "5 k"}, {"src": "/media/app/v-7706135581293628705.jpg", "v": "3 k"}, {"src": "/media/app/v-7705866119814417684.jpg", "v": "456"}], "href": "/app/formats", "key": "Hey There Delilah Loverzz et Palima Couple"}];
    let CR = [{"av": "", "noav": true, "k": "cr", "h": "@bobbybinks21", "s": "Shortfy · France · 197 k vues médianes", "app": "Shortfy", "med": "197 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}, {"src": "/media/app/v-7675164782881705249.jpg", "v": "396 k"}, {"src": "/media/app/v-7677716930513390881.jpg", "v": "375 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@bobbybinks21 Shortfy"}, {"av": "/media/app/av-meli83.fit.jpg", "noav": false, "k": "cr", "h": "@meli83.fit", "s": "Stalkie · France · 78 k vues médianes", "app": "Stalkie", "med": "78 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}, {"src": "/media/app/v-7620350138447482115.jpg", "v": "157 k"}, {"src": "/media/app/v-7621474381801245974.jpg", "v": "109 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@meli83.fit Stalkie"}, {"av": "", "noav": true, "k": "cr", "h": "@paul.crown4", "s": "The Cringe · France · 33 k vues médianes", "app": "The Cringe", "med": "33 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}, {"src": "/media/app/v-7641285202513251616.jpg", "v": "72 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@paul.crown4 The Cringe"}, {"av": "/media/app/av-laure_acc2.jpg", "noav": false, "k": "cr", "h": "@laure_acc2", "s": "Shortfy · France · 32 k vues médianes", "app": "Shortfy", "med": "32 k", "ryt": "7 vidéos en 7 j", "covs": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}, {"src": "/media/app/v-7705018413185355040.jpg", "v": "92 k"}, {"src": "/media/app/v-7703942570576989472.jpg", "v": "58 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@laure_acc2 Shortfy"}, {"av": "/media/app/av-enjoy.gossip.jpg", "noav": false, "k": "cr", "h": "@enjoy.gossip", "s": "Katch · France · 24 k vues médianes", "app": "Katch", "med": "24 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7633896569149934870.jpg", "v": "606 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@enjoy.gossip Katch"}, {"av": "/media/app/av-noah_031108.jpg", "noav": false, "k": "cr", "h": "@noah_031108", "s": "Knowunity · France · 13 k vues médianes", "app": "Knowunity", "med": "13 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}, {"src": "/media/app/v-7631504730258214166.jpg", "v": "114 k"}, {"src": "/media/app/v-7647175218573692192.jpg", "v": "21 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@noah_031108 Knowunity"}, {"av": "/media/app/av-stalkie_fr.jpg", "noav": false, "k": "cr", "h": "@stalkie_fr", "s": "Stalkie · France · 9 k vues médianes", "app": "Stalkie", "med": "9 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}, {"src": "/media/app/v-7628297994512747798.jpg", "v": "11 k"}, {"src": "/media/app/v-7627904478116613398.jpg", "v": "10 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@stalkie_fr Stalkie"}, {"av": "/media/app/av-emma.studytips.jpg", "noav": false, "k": "cr", "h": "@emma.studytips", "s": "Retain Cards · France · 8 k vues médianes", "app": "Retain Cards", "med": "8 k", "ryt": "Rien en 7 j", "covs": [{"src": "/media/app/v-7641320209013345569.jpg", "v": "24 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@emma.studytips Retain Cards"}, {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "k": "cr", "h": "@zinedine.gsbb", "s": "Shortfy · France · 8 k vues médianes", "app": "Shortfy", "med": "8 k", "ryt": "3 vidéos en 7 j", "covs": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@zinedine.gsbb Shortfy"}, {"av": "/media/app/av-toma.ia.jpg", "noav": false, "k": "cr", "h": "@toma.ia", "s": "Shortfy · France · 8 k vues médianes", "app": "Shortfy", "med": "8 k", "ryt": "3 vidéos en 7 j", "covs": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}, {"src": "/media/app/v-7703174889695497505.jpg", "v": "12 k"}, {"src": "/media/app/v-7703522210333429024.jpg", "v": "11 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@toma.ia Shortfy"}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "k": "cr", "h": "@remistudy", "s": "Astra AI · France · 7 k vues médianes", "app": "Astra AI", "med": "7 k", "ryt": "6 vidéos en 7 j", "covs": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}, {"src": "/media/app/v-7688445041966157088.jpg", "v": "134 k"}, {"src": "/media/app/v-7692158250019573024.jpg", "v": "130 k"}], "href": "/app/createurs/zinedine.gsbb", "key": "@remistudy Astra AI"}, {"av": "/media/app/av-learnwithjoel1.jpg", "noav": false, "k": "cr", "h": "@learnwithjoel1", "s": "Astra AI · Espagne · 12,2 k abonnés · 65× sa normale", "app": "Astra AI", "med": "28,5 k", "ryt": "65× sa normale", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@learnwithjoel1 Astra AI"}, {"av": "", "noav": true, "k": "cr", "h": "@ivylearns8", "s": "Astra AI · États-Unis · 3,1 k abonnés", "app": "Astra AI", "med": "17,9 k", "ryt": "—", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@ivylearns8 Astra AI"}, {"av": "/media/app/av-ira.belajaryuk.jpg", "noav": false, "k": "cr", "h": "@ira.belajaryuk", "s": "Astra AI · Indonésie · 4,2 k abonnés", "app": "Astra AI", "med": "550", "ryt": "—", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@ira.belajaryuk Astra AI"}, {"av": "/media/app/av-studywithruney.jpg", "noav": false, "k": "cr", "h": "@studywithruney", "s": "Astra AI · Indonésie · 2,4 k abonnés", "app": "Astra AI", "med": "418", "ryt": "—", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@studywithruney Astra AI"}, {"av": "/media/app/av-belajarbersamaespi.jpg", "noav": false, "k": "cr", "h": "@belajarbersamaespi", "s": "Astra AI · Indonésie · 6,5 k abonnés · 2 333× sa normale", "app": "Astra AI", "med": "855", "ryt": "2 333× sa normale", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@belajarbersamaespi Astra AI"}, {"av": "", "noav": true, "k": "cr", "h": "@studywith_elsie", "s": "Astra AI · 572 abonnés · 1 226× sa normale", "app": "Astra AI", "med": "—", "ryt": "1 226× sa normale", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@studywith_elsie Astra AI"}, {"av": "", "noav": true, "k": "cr", "h": "@hocba.tapsu", "s": "Astra AI · Vietnam · 455× sa normale", "app": "Astra AI", "med": "—", "ryt": "455× sa normale", "covs": [], "href": "/app/createurs/zinedine.gsbb", "key": "@hocba.tapsu Astra AI"}];
    FM = FM.map((f) => Object.assign({ sub: f.kind + ' · ' + f.n + ' comptes · ' + f.med + ' la normale' }, f));
    // Sur le site : l'index de recherche du Radar (document « search », lu par get), complété par « apps » (marchés, vidéos)
    // et « formats » (multiplicateur) quand ils sont là. Sur le canevas : l'exemple.
    const get = this.props && this.props.get;
    const S = get ? get('search') : null;
    if (S && S.apps) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + '\u202fj'; };
      const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const AD = get('apps'), FD = get('formats');
      const byApp = {}, byFmt = {};
      ((AD && AD.apps) || []).forEach((a) => { byApp[a.slug] = a; });
      ((FD && FD.formats) || []).forEach((f) => { byFmt[f.id] = f; });
      AP = S.apps.map((a) => { const full = byApp[a.slug];
        const covs = full ? (full.top || []).filter((t) => t.cover).map((t) => ({ src: t.cover, v: nf(t.views) })) : [];
        return Object.assign({ k: 'app', n: a.name, niche: a.niche || '', mk: full ? flags(full.markets.map((x) => x[0])) : [], v30: nf(a.views30 || 0), acc: full && typeof full.accounts === 'number' ? full.accounts.toLocaleString('en-US').replace(/,/g, '\u202f') : '—',
          hasCov: covs.length > 0, covs, href: '/app/apps/' + a.slug, key: a.name + ' ' + (a.niche || '') }, ico(a)); });
      FM = S.formats.map((f) => { const full = byFmt[f.id]; const hook = f.kind !== 'sound';
        return { k: 'fm', t: hook ? '« ' + f.label + ' »' : 'Son « ' + f.label + ' »', kind: hook ? 'Accroche' : 'Son', ico: hook ? TXT : SON,
          sub: [hook ? 'Accroche' : 'Son', f.accounts + ' comptes', full && full.medX ? xf(full.medX) + ' la normale' : ''].filter(Boolean).join(' · '),
          href: '/app/formats/' + f.id, key: f.label }; });
      CR = S.creators.map((c) => ({ av: c.avatar || '', noav: true, handle: c.handle, k: 'cr', h: '@' + c.handle, s: [c.app, nf(c.fans || 0) + ' abonnés', c.median ? nf(c.median) + ' vues médianes' : ''].filter(Boolean).join(' · '),
        href: '/app/createurs/' + c.handle, key: '@' + c.handle + ' ' + (c.app || '') }));
    }
    const st = this.state || {};
    const q = st.q || '';
    const scope = st.scope || 'tout';
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q.trim());
    const hit = (s) => !nq || norm(s).indexOf(nq) >= 0;
    let apps = AP.filter((a) => hit(a.key)), fms = FM.filter((f) => hit(f.key)), crs = CR.filter((c) => hit(c.key));
    apps = apps.slice(0, nq ? 8 : 5); fms = fms.slice(0, nq ? 5 : 3); crs = crs.slice(0, nq ? 5 : 3);
    if (scope === 'apps') { fms = []; crs = []; }
    if (scope === 'formats') { apps = []; crs = []; }
    if (scope === 'createurs') { apps = []; fms = []; }
    const cur = apps[0] || null;
    // Un créateur trouvé (onglet Créateurs, ou aucune app) : sa photo, son rythme et ses 3 dernières vidéos avec image (document « creator: »).
    const crHit = nq && (scope === 'createurs' || !cur) ? crs[0] || null : null;
    let cc = {};
    if (crHit) {
      const g = this.props && typeof this.props.get === 'function' ? this.props.get : null;
      const d = g && crHit.handle ? g('creator:' + crHit.handle) : null;
      const nfc = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const covs = d && d.videos ? d.videos.filter((v) => v.cover).slice(0, 3).map((v) => ({ src: v.cover, v: nfc(v.views) })) : (crHit.covs || []);
      const p7 = d ? d.posts7d || 0 : null;
      cc = Object.assign({}, crHit, { av: crHit.av || (d && d.avatar) || '', noav: true, covs, hasCov: covs.length > 0,
        ryt: p7 === null ? (crHit.ryt || '—') : p7 ? p7 + (p7 > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j' });
    }
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    return {
      q, close, onQ: (e) => this.setState({ q: e.target.value }), setInput: (el) => { this.inp = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      scopes: [['tout', 'Tout'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs']].map((s) => ({ l: s[1], on: s[0] === scope ? 'true' : 'false', pick: () => this.setState({ scope: s[0] }) })),
      apps: apps.slice(cur && nq ? 1 : 0), fms, crs: crHit ? crs.slice(1) : crs, pc: !!crHit, cc, hasApps: apps.length > (cur && nq ? 1 : 0), hasFms: fms.length > 0, hasCrs: crs.length > (crHit ? 1 : 0),
      gApps: nq ? 'Autres apps' : 'Les plus vues en 30 jours', gFms: nq ? 'Formats' : 'Formats de la semaine', gCrs: nq ? 'Créateurs' : 'Créateurs à suivre',
      pa: !!cur && !!nq, cur: cur || {}, none: apps.length + fms.length + crs.length === 0
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: fixed; inset: 0; z-index: 60; overflow-y: auto; overscroll-behavior: contain; background: var(--ground); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "role": "search", "onKeyDown": $v.keys, "style": "position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 8px; padding: 10px 12px 10px 16px; background: rgba(5,7,12,0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("div", { "class": "sw-search", "style": "flex: 1; min-width: 0; height: 48px; padding: 0 12px; box-shadow: none; border-radius: 14px; border-color: var(--accent-edge);" },
            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0;" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("input", { "ref": $v.setInput, "type": "search", "enterkeyhint": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Une app, un format, un compte…", "autocomplete": "off", "style": "flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--ink); font-family: var(--font-body); font-size: 17px;" })
          ),
          $h("button", { "type": "button", "onClick": $v.close, "style": "min-height: 44px; padding: 0 6px; border: 0; background: transparent; color: var(--accent); font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer;" },
            "Annuler"
          )
        ),
        $h("div", { "style": "display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px 4px; scrollbar-width: none;" },
          ($l($v.scopes)).map((s) => [
            $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": s?.on, "onClick": s?.pick, "style": "height: 44px; flex-shrink: 0;" },
              $t(s?.l)
            )
          ])
        ),
        ($v.none) ? [
          $h("div", { "class": "sw-empty", "style": "padding: 56px 24px;" },
            $h("div", { "class": "sw-empty-radar" }),
            $h("p", { "class": "sw-empty-title" },
              "Rien pour « ", $t($v.q), " »"
            ),
            $h("p", { "class": "sw-empty-text" },
              "Essaie un nom d’app, un @compte ou un mot de l’accroche."
            )
          )
        ] : null,
        $h("div", { "style": "padding: 0 16px 32px;" },
          ($v.pa) ? [
            $h("a", { "href": $v.cur?.href, "class": "sw-card is-featured", "style": "margin-top: 12px; border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 12px;" },
                $h("span", { "class": `sw-app-icon ${$t($v.cur?.blank)}`, "style": "width: 52px; height: 52px; border-radius: 15px;" },
                  ($v.cur?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": $v.cur?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.cur?.nologo) ? [
                    $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.cur?.n)
                  ),
                  $h("span", { "style": "display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--ink-faint);" },
                    $t($v.cur?.niche),
                    ($l($v.cur?.mk)).map((m) => [
                      $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" })
                    ])
                  )
                )
              ),
              $h("span", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" },
                $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                  $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; min-height: 30px; line-height: 15px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Vues en 30 j"
                  ),
                  $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                    $t($v.cur?.v30)
                  )
                ),
                $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                  $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; min-height: 30px; line-height: 15px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Comptes qui le poussent"
                  ),
                  $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                    $t($v.cur?.acc)
                  )
                )
              ),
              ($v.cur?.hasCov) ? [
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  ($l($v.cur?.covs)).map((v) => [
                    $h("span", { "class": "sw-video", "style": "display: block; border-radius: 12px;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                )
              ] : null,
              $h("span", { "style": "align-self: flex-end; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--accent);" },
                "Ouvrir la fiche",
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.pc) ? [
            $h("a", { "href": $v.cc?.href, "class": "sw-card is-featured", "style": "margin-top: 12px; border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 12px;" },
                $h("span", { "style": "width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  ($v.cc?.av) ? [
                    $h("img", { "src": $v.cc?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.cc?.noav) ? [
                    $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.cc?.h)
                  ),
                  $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-faint);" },
                    $t($v.cc?.s)
                  )
                )
              ),
              $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                $h("span", { "class": "sw-tile-label" },
                  "Rythme"
                ),
                $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                  $t($v.cc?.ryt)
                )
              ),
              ($v.cc?.hasCov) ? [
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  ($l($v.cc?.covs)).map((v) => [
                    $h("span", { "class": "sw-video", "style": "display: block; border-radius: 12px;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                )
              ] : null,
              $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; min-height: 24px; font-size: 14px; font-weight: 600; color: var(--accent);" },
                "Ouvrir la fiche",
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.hasApps) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gApps)
            ),
            ($l($v.apps)).map((a) => [
              $h("a", { "href": a?.href, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 12px;" },
                  (a?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (a?.nologo) ? [
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(a?.n)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(a?.niche), " · ", $t(a?.v30), " vues en 30 j"
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null,
          ($v.hasFms) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gFms)
            ),
            ($l($v.fms)).map((f) => [
              $h("a", { "href": f?.href, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-soft);" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(f?.t)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(f?.sub)
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null,
          ($v.hasCrs) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gCrs)
            ),
            ($l($v.crs)).map((c) => [
              $h("a", { "href": c?.href, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  (c?.av) ? [
                    $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (c?.noav) ? [
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(c?.h)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(c?.s)
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null
        )
      )
    ];
  }
}
