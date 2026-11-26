// Généré par scripts/dc2preact.py depuis design/SimulateurMobile.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../runtime.js';

export default class SimulateurMobile extends DCLogic {
  // Données du simulateur (relevé du 26/11/2026), constantes et petites fonctions. Rangées dans la classe : la conversion
  // du site (scripts/dc2preact.py) n'accepte aucun code hors de la classe. Chaque méthode reprend ce qu'elle lit.
  static K = (() => {
    const DATA = {"releve":"26/11/2026","niches":[{"nom":"Social et loisirs","apps":111,"vuesParVideo":10460,"top":[{"nom":"MoboReels","store":"MoboReels: Short Drama Series","logo":"/media/simulateur/moboreels.jpg","comptes":98,"comptesFR":0,"videosSemaine":1252,"meilleure":{"vues":"12,7 k","compte":"austinobest1","video":"7710617508012756231"},"note":{"note":"4,5","avis":"7,2 k"},"prix":{"min":"6,99","max":"59,99"},"accroches":[{"texte":"My Unborn Baby's Voice Made Me a Winner Mommy,look down,it's me!","vuesTxt":"1,3 k","compte":"austinobest1","comptes":1,"video":"7710617880169172231"},{"texte":"I'm just a janitor's daughter","vuesTxt":"857","compte":"netflixtime_8","comptes":1,"video":"7710556274538204438"},{"texte":"Puth and Rian","vuesTxt":"835","compte":"cat888818","comptes":1,"video":"7708799388117716238"}],"quoi":"Short Drama Series","reseau":[{"pseudo":"austinobest1","abonnes":"10,8 k","vuesMed":"572","pays":"NG"},{"pseudo":"vehdgsv","abonnes":"9,9 k","vuesMed":"188","pays":"US"},{"pseudo":"nephejxloz6","abonnes":"3,8 k","vuesMed":"184","pays":"US"},{"pseudo":"qn657hpbr5","abonnes":"57","vuesMed":"146","pays":"US"},{"pseudo":"blanche.webb85","abonnes":"9","vuesMed":"139","pays":"CA"},{"pseudo":"catsen180","abonnes":"23","vuesMed":"89","pays":"US"}]},{"nom":"SlowRead","store":"SlowRead : Bibliothèque & PAL","logo":"/media/simulateur/slowread.jpg","comptes":70,"comptesFR":0,"videosSemaine":792,"meilleure":{"vues":"35,8 k","compte":"andrea.booktoker","video":"7706174306748845334"},"note":{"note":"3,8","avis":"36"},"prix":{"min":"7,79","max":"129,99"},"accroches":[{"texte":"Okay I need to lock in no distractions","vuesTxt":"10,5 k","compte":"chelskait_other","comptes":1,"video":"7710039825193241886"},{"texte":"i overheard a girl at the airport saying she used girl math to get her nails done with rewards from playing games… and after seeing her nail","vuesTxt":"6,8 k","compte":"living.better0","comptes":4,"video":"7710856114467785998"},{"texte":"Keep Lucia. I have 57 fictional men who'd burn the world down for me.","vuesTxt":"4,3 k","compte":"totallybooked18","comptes":5,"video":"7711841689144397070"}],"quoi":"Bibliothèque & PAL","reseau":[{"pseudo":"stirreel","abonnes":"42","vuesMed":"1,7 k","pays":"CA"},{"pseudo":"tabs_reads","abonnes":"28","vuesMed":"1,1 k","pays":"US"},{"pseudo":"relatable.bri","abonnes":"53","vuesMed":"1 k","pays":"US"},{"pseudo":"bookish.linds","abonnes":"706","vuesMed":"798","pays":"US"},{"pseudo":"summerkore7","abonnes":"74","vuesMed":"752","pays":"US"},{"pseudo":"emma.readss1","abonnes":"8","vuesMed":"752","pays":"US"}]},{"nom":"DramaBox","store":"DramaBox - Film et Drame Court","logo":"/media/simulateur/dramabox.jpg","comptes":88,"comptesFR":0,"videosSemaine":618,"meilleure":{"vues":"260 k","compte":"j3w3lz.rose","video":"7709357476939877646"},"note":{"note":"4,6","avis":"57,2 k"},"prix":{"min":"0,99","max":"14,99"},"accroches":[{"texte":"¡HUMILLARON A MI ABUELA POR VENDER TACOS! A MI ABUELA POR VENDER TACOS!","vuesTxt":"260 k","compte":"j3w3lz.rose","comptes":1,"video":"7709357476939877646"},{"texte":"DramaBox EP7-8 كل ما فعلته هوجني المال من الثري الذي يُنفق علي وفي النهاية حققت الحرية المالية حصريا DramaBox","vuesTxt":"199 k","compte":"dramabox_ar","comptes":1,"video":"7707578346397240584"},{"texte":"DramaBox EP3-4 الندم المتأخر DramaBox حصريا","vuesTxt":"151 k","compte":"dramabox_ar","comptes":1,"video":"7709069812281953544"}],"quoi":"Film et Drame Court","reseau":[{"pseudo":"dramabox_br_1","abonnes":"6,2 M","vuesMed":"580 k","pays":"BR"},{"pseudo":"bu_chintya","abonnes":"52,3 k","vuesMed":"395 k","pays":"ID"},{"pseudo":"populardrama","abonnes":"180 k","vuesMed":"104 k","pays":"SG"},{"pseudo":"user8577202100918","abonnes":"25,3 k","vuesMed":"77,1 k","pays":"JP"},{"pseudo":"guobrose","abonnes":"97,6 k","vuesMed":"66,4 k","pays":"US"},{"pseudo":"dramabox818","abonnes":"17,9 k","vuesMed":"53,5 k","pays":"PK"}]}]},{"nom":"Santé et physique","apps":70,"vuesParVideo":4598,"top":[{"nom":"Mise","store":"mise - meal planner","logo":"/media/simulateur/mise.jpg","comptes":130,"comptesFR":7,"videosSemaine":1353,"meilleure":{"vues":"1,3 M","compte":"paula.eatss","video":"7710492306742283528"},"note":{"note":"4,5","avis":"98"},"prix":{"min":"9,99","max":"59,99"},"accroches":[{"texte":"Il avait rendez-vous avec Emma pour me tromper... il ignorait qui elle était Ouais Emma c'est","vuesTxt":"1,5 M","compte":"la.folleduvillage","comptes":1,"video":"7709498093850381600"},{"texte":"My baby daddy gave me $150 to feed these kids","vuesTxt":"1,4 M","compte":"meme.atethat","comptes":32,"video":"7709218149148757261"},{"texte":"J’ai empêché mon mari de me tromper ce soir en quittant la maison avant lui maquilles?","vuesTxt":"935 k","compte":"la.folleduvillage","comptes":1,"video":"7710582935258287392"}],"quoi":"Meal planner","reseau":[{"pseudo":"nacho_porcal","abonnes":"15,8 k","vuesMed":"117 k","pays":"UY"},{"pseudo":"mise.cxvii","abonnes":"3,4 k","vuesMed":"52,9 k","pays":"AR"},{"pseudo":"lnamise","abonnes":"34 k","vuesMed":"34,2 k","pays":"VN"},{"pseudo":"7mise","abonnes":"8,5 k","vuesMed":"21,4 k","pays":"MX"},{"pseudo":"mise23hum","abonnes":"2,4 k","vuesMed":"16,4 k","pays":"AR"},{"pseudo":"objectifepargne","abonnes":"129 k","vuesMed":"8,9 k","pays":"FR"}]},{"nom":"Musa","store":"Musa: Period & Pregnancy","logo":"/media/simulateur/musa.jpg","comptes":32,"comptesFR":2,"videosSemaine":526,"meilleure":{"vues":"289 k","compte":"marina.pragnancy","video":"7710412757409041694"},"note":{"note":"4,7","avis":"181"},"prix":{"min":"6,99","max":"34,99"},"accroches":[{"texte":"I think November has delayed every girls period… · We must all be stressed","vuesTxt":"43,2 k","compte":"mariana.hormones","comptes":13,"video":"7710291978721725710"},{"texte":"I searched \"my Disney baby\"","vuesTxt":"31,1 k","compte":"brooke.pregnancy","comptes":1,"video":"7709197987737505038"},{"texte":"Girl to girl.. what’s the most obvious sign that your period is about to start?","vuesTxt":"16,3 k","compte":"fal.cycletips","comptes":6,"video":"7710808728353639710"}],"quoi":"Period & Pregnancy","reseau":[{"pseudo":"ccinloveeee","abonnes":"154","vuesMed":"5,9 k","pays":"US"},{"pseudo":"bree.pregnancy","abonnes":"94","vuesMed":"2,9 k","pays":"US"},{"pseudo":"elena.burgueno","abonnes":"28","vuesMed":"2 k","pays":"FR"},{"pseudo":"mur.cyclesync","abonnes":"118","vuesMed":"1,3 k","pays":"US"},{"pseudo":"aylin.hormones","abonnes":"1,5 k","vuesMed":"1,3 k","pays":"US"},{"pseudo":"ari.hormones","abonnes":"1,8 k","vuesMed":"1,1 k","pays":"PT"}]},{"nom":"Solaia","store":"Solaia: Équilibre hormonal","logo":"/media/simulateur/solaia.jpg","comptes":64,"comptesFR":52,"videosSemaine":453,"meilleure":{"vues":"1,7 M","compte":"byelizen","video":"7709915874399964448"},"note":{"note":"4,6","avis":"2,5 k"},"prix":{"min":"8,99","max":"79,99"},"accroches":[{"texte":"18:00-22:00 Post workout routine low|","vuesTxt":"1,5 M","compte":"byelizen","comptes":1,"video":"7709915874399964448"},{"texte":"100% moi les premières semaines où j’ai pris ma pilule","vuesTxt":"96,6 k","compte":"justinendo","comptes":1,"video":"7708363079444155681"},{"texte":"mon rêve niche c’est de guérir des tca","vuesTxt":"55,7 k","compte":"indoinsa","comptes":1,"video":"7708153950515563809"}],"quoi":"Équilibre hormonal","reseau":[{"pseudo":"lou56632","abonnes":"279","vuesMed":"14,4 k","pays":"AE"},{"pseudo":"indoinsa","abonnes":"37,8 k","vuesMed":"10,1 k","pays":"FR"},{"pseudo":"man.amedor","abonnes":"8,9 k","vuesMed":"6,7 k","pays":"FR"},{"pseudo":"lya_au_feminin","abonnes":"76","vuesMed":"4,1 k","pays":"FR"},{"pseudo":"emaaadbs","abonnes":"765","vuesMed":"3,6 k","pays":"FR"},{"pseudo":"health_elisa","abonnes":"925","vuesMed":"1,7 k","pays":"FR"}]}]},{"nom":"Side hustle","apps":50,"vuesParVideo":1405,"top":[{"nom":"SideShift","store":"SideShift - Earn Money","logo":"/media/simulateur/sideshift.jpg","comptes":158,"comptesFR":19,"videosSemaine":1339,"meilleure":{"vues":"4,3 M","compte":"prankswithgenn_","video":"7710695480325311765"},"note":{"note":"4,8","avis":"411"},"prix":{"min":"0,99","max":"89,99"},"accroches":[{"texte":"Mon objectif est de devenir financièrement indépendante avant mes 25 ans. Je suis ouverte à toutes les idées pour faire de l'argent.","vuesTxt":"1 M","compte":"kelly.advice","comptes":1,"video":"7707745824872156448"},{"texte":"Hoy contacté a 100 marcas. 70 nunca respondieron. 20 dijeron que NO. 10 dijeron que Sl. Y 5 de esas me pagaron 200 dl cada una. Eso es un to","vuesTxt":"280 k","compte":"fernandaj_ugc","comptes":19,"video":"7712028053731429665"},{"texte":"TRES TRABAJOS DE NOCHE QUE PUEDES HACER DESDE TU CASA","vuesTxt":"191 k","compte":"mafe.guzman29","comptes":4,"video":"7709728438550056213"}],"quoi":"Earn Money","reseau":[{"pseudo":"creatorera.edivany11","abonnes":"2,1 k","vuesMed":"26,2 k","pays":"BR"},{"pseudo":"ilianaconugc","abonnes":"9,1 k","vuesMed":"11,4 k","pays":"HN"},{"pseudo":"martiapproves","abonnes":"3,6 k","vuesMed":"10,3 k","pays":"AR"},{"pseudo":"be_like_olaa","abonnes":"688","vuesMed":"5,4 k","pays":"PL"},{"pseudo":"kingspranks","abonnes":"8,8 k","vuesMed":"5,3 k","pays":"GB"},{"pseudo":"eve.hustles","abonnes":"2 k","vuesMed":"4,2 k","pays":"GB"}]},{"nom":"Hub Capture","store":"Hub Capture","logo":"/media/simulateur/hub-capture.jpg","comptes":54,"comptesFR":0,"videosSemaine":180,"meilleure":{"vues":"79,2 k","compte":"tamiresrrosati","video":"7711010891512171784"},"note":null,"prix":null,"accroches":[{"texte":"Gente, eu sem óculos não exergo nada perdão na leitura a informação foi nada kk","vuesTxt":"9,3 k","compte":"rennynooff","comptes":1,"video":"7709532252459404565"},{"texte":"oração pra hub capture voltar hoje às 23h99","vuesTxt":"8,9 k","compte":"isatmai","comptes":3,"video":"7711836519509658900"},{"texte":"“MÃO DE ZUMBI”","vuesTxt":"8,5 k","compte":"yasmin.robo","comptes":1,"video":"7709571679147625749"}],"quoi":"Plateforme de revenus en ligne par parrainage, avec dropshipping et création de contenu UGC pour TikTok Shop","reseau":[{"pseudo":"leonardoorozco","abonnes":"553","vuesMed":"6,2 k","pays":"VE"},{"pseudo":"treinador_de_robo","abonnes":"398","vuesMed":"4,5 k","pays":"BR"},{"pseudo":"isatmai","abonnes":"6 k","vuesMed":"3,9 k","pays":"BR"},{"pseudo":"rennynooff","abonnes":"66,8 k","vuesMed":"3,5 k","pays":"BR"},{"pseudo":"oovilanovaa","abonnes":"189","vuesMed":"3,2 k","pays":"BR"},{"pseudo":"sindygital.us","abonnes":"12,7 k","vuesMed":"3,2 k","pays":"US"}]},{"nom":"TikAlyzer","store":"TikAlyzer: Deviens Viral","logo":"/media/simulateur/tikalyzer.jpg","comptes":51,"comptesFR":0,"videosSemaine":87,"meilleure":{"vues":"1,1 k","compte":"viviana.tikalyzr","video":"7711334652664974622"},"note":{"note":"4,2","avis":"5"},"prix":{"min":"6,99","max":"69,99"},"accroches":[],"quoi":"Deviens Viral","reseau":[{"pseudo":"blair.clipss","abonnes":"10","vuesMed":"527","pays":"BD"},{"pseudo":"allie.growth","abonnes":"37","vuesMed":"493","pays":"US"},{"pseudo":"ronnygrowth","abonnes":"32","vuesMed":"472","pays":"AO"},{"pseudo":"duke.clips4","abonnes":"8","vuesMed":"408","pays":"US"},{"pseudo":"bluetoria2","abonnes":"35","vuesMed":"368","pays":"US"},{"pseudo":"tikatori22","abonnes":"51","vuesMed":"356","pays":"US"}]}]},{"nom":"Création de contenu","apps":41,"vuesParVideo":19873,"top":[{"nom":"Djay","store":"djay - DJ App & AI Mixer","logo":"/media/simulateur/djay.jpg","comptes":163,"comptesFR":3,"videosSemaine":355,"meilleure":{"vues":"61,7 k","compte":"djayoverlaps","video":"7710786478829358366"},"note":{"note":"4,6","avis":"6,7 k"},"prix":{"min":"0,00","max":"49,99"},"accroches":[{"texte":"گیانەکەم ، ئەتۆ نەبووی فێری گیانت کردم ؟ ئێستاش بێ گیانت کردم","vuesTxt":"135 k","compte":".avii1i","comptes":1,"video":"7709586609292823828"},{"texte":"I LOVE MUSIC LIKE THIS, WHO DOESN'T LIKE BOUNCE MUSIC?","vuesTxt":"16,6 k","compte":"howyallfindingme2","comptes":1,"video":"7711484463041039648"},{"texte":"can yall catch this beatt??","vuesTxt":"12,2 k","compte":"howyallfindingme2","comptes":1,"video":"7711520404019399968"}],"quoi":"DJ App & AI Mixer","reseau":[{"pseudo":"etherealalofa","abonnes":"8,4 k","vuesMed":"186 k","pays":"US"},{"pseudo":"user8875467886","abonnes":"2,5 k","vuesMed":"133 k","pays":"US"},{"pseudo":"thy._.kdmh","abonnes":"45,3 k","vuesMed":"104 k","pays":"KH"},{"pseudo":"kaya.aj","abonnes":"1,8 k","vuesMed":"91,1 k","pays":"US"},{"pseudo":"userr2087764","abonnes":"1,3 k","vuesMed":"85,5 k","pays":"US"},{"pseudo":"msladydjay","abonnes":"1,8 k","vuesMed":"82,3 k","pays":"US"}]},{"nom":"Crsel","store":"Crsel: Carrousel & Story Maker","logo":"/media/simulateur/crsel.jpg","comptes":14,"comptesFR":0,"videosSemaine":104,"meilleure":{"vues":"6,8 k","compte":"emilycreatescontent","video":"7710974418348035359"},"note":{"note":"4,7","avis":"1,2 k"},"prix":{"min":"5,99","max":"29,99"},"accroches":[],"quoi":"Carrousel & Story Maker","reseau":[{"pseudo":"withgeorgy","abonnes":"199 k","vuesMed":"37,8 k","pays":"PL"},{"pseudo":"val_edits162","abonnes":"15,6 k","vuesMed":"4,9 k","pays":"PL"},{"pseudo":"creatlvblin","abonnes":"1,3 k","vuesMed":"3,4 k","pays":"PL"},{"pseudo":"sarahs_collages","abonnes":"3,5 k","vuesMed":"1,9 k","pays":"DE"},{"pseudo":"crselautenticooficial","abonnes":"11,6 k","vuesMed":"1,5 k","pays":"CO"},{"pseudo":"myaplikasiku","abonnes":"163","vuesMed":"1,4 k","pays":"ID"}]},{"nom":"VanDraw","store":"VanDraw","logo":"/media/simulateur/vandraw.jpg","comptes":19,"comptesFR":0,"videosSemaine":73,"meilleure":{"vues":"73,1 k","compte":"inspovikk","video":"7711450203571719444"},"note":{"note":"4,6","avis":"173"},"prix":{"min":"6,00","max":"60,00"},"accroches":[{"texte":"grand theft auto","vuesTxt":"57,1 k","compte":"inspovikk","comptes":1,"video":"7711450203571719444"}],"quoi":"App de dessin qui permet de dessiner des avatars et des personnages à partir des commentaires ou de photos","reseau":[{"pseudo":"simpleartjournal","abonnes":"12,5 k","vuesMed":"40 k","pays":"BR"},{"pseudo":"shezuun","abonnes":"840","vuesMed":"11,1 k","pays":"ID"},{"pseudo":"inspovikk","abonnes":"495","vuesMed":"9,4 k","pays":"UA"},{"pseudo":"john.arts.drawing","abonnes":"7,4 k","vuesMed":"6,5 k","pays":"PH"},{"pseudo":"lia.squisy_art","abonnes":"631","vuesMed":"3,8 k","pays":"ID"},{"pseudo":"draw4chilll","abonnes":"1,2 k","vuesMed":"3,8 k","pays":"US"}]}]},{"nom":"Langues","apps":36,"vuesParVideo":6669,"top":[{"nom":"Vocabulary","store":"Vocabulary - Apprenez mots","logo":"/media/simulateur/vocabulary.jpg","comptes":71,"comptesFR":0,"videosSemaine":637,"meilleure":{"vues":"4,2 k","compte":"edforyou6","video":"7710309824344460566"},"note":{"note":"4,7","avis":"4 k"},"prix":{"min":"5,99","max":"59,99"},"accroches":[{"texte":"My roommate told me about this sound which blocks your brain from overthinking. I’ve been listening for 4 hours straight","vuesTxt":"6,5 k","compte":"itskatiegirl8","comptes":11,"video":"7710312659320638751"},{"texte":"when people are using klarna to make payments to play the new GTA but I'm only $19 away from getting it using this app called vybs","vuesTxt":"3 k","compte":"lobotomized_fish101","comptes":9,"video":"7710387036712111373"},{"texte":"Sous vide burger","vuesTxt":"977","compte":"hazaeyrw6ue","comptes":1,"video":"7710757769732738334"}],"quoi":"Apprenez mots","reseau":[{"pseudo":"app.lingopic","abonnes":"82 k","vuesMed":"32,2 k","pays":"US"},{"pseudo":"yocable.app","abonnes":"17","vuesMed":"2,1 k","pays":"PH"},{"pseudo":"linds.learning","abonnes":"92","vuesMed":"2 k","pays":"US"},{"pseudo":"daisy.another.inc","abonnes":"24","vuesMed":"1,4 k","pays":"GB"},{"pseudo":"littlespanishdail","abonnes":"449","vuesMed":"1,1 k","pays":"US"},{"pseudo":"amanda.eats45","abonnes":"36","vuesMed":"900","pays":"US"}]},{"nom":"Pingo AI","store":"Apprendre des langues Pingo AI","logo":"/media/simulateur/pingo-ai.jpg","comptes":147,"comptesFR":7,"videosSemaine":480,"meilleure":{"vues":"78,3 k","compte":"nadiaspeaksgerman","video":"7711006014425795861"},"note":{"note":"4,6","avis":"1,8 k"},"prix":{"min":"14,99","max":"119,99"},"accroches":[{"texte":"· · WHO ARE YOU? · I ASKED BETTER! · I’M A BRITISH AI!!! · WHAT?? · YOUR VOICE SOUNDS UGLY! · WHAAAAT?? · WHAAAAT????!?? · WHAAAA-","vuesTxt":"246 k","compte":"englishgurukat","comptes":2,"video":"7708769313393511687"},{"texte":"¿Quién dijo la frase? official Spanish nationality exam","vuesTxt":"198 k","compte":"camilopolyglot","comptes":3,"video":"7710652660596133142"},{"texte":"How do you say \"green flag\" in Chinese","vuesTxt":"173 k","compte":"howtosaynihao","comptes":4,"video":"7710191199314824469"}],"quoi":"Application d'apprentissage des langues par IA qui corrige les phrases et répond aux questions de vocabulaire","reseau":[{"pseudo":"britttttspanishlearning","abonnes":"202 k","vuesMed":"674 k","pays":"US"},{"pseudo":"maksim_po_russki","abonnes":"39 k","vuesMed":"554 k","pays":"BR"},{"pseudo":"yuli_portuguese","abonnes":"88,7 k","vuesMed":"237 k","pays":"BR"},{"pseudo":"maris.german","abonnes":"11 k","vuesMed":"195 k","pays":"EE"},{"pseudo":"violla.languages","abonnes":"7,7 k","vuesMed":"193 k","pays":"IT"},{"pseudo":"sabinelearnsfrench","abonnes":"53,1 k","vuesMed":"178 k","pays":"US"}]},{"nom":"Bunpo","store":"Bunpo: Apprendre les langues","logo":"/media/simulateur/bunpo.jpg","comptes":86,"comptesFR":0,"videosSemaine":206,"meilleure":{"vues":"18,9 k","compte":"frenchwithlars","video":"7709922289172647201"},"note":{"note":"4,8","avis":"1,1 k"},"prix":{"min":"9,99","max":"99,99"},"accroches":[{"texte":"I don’t have money お金が ありません","vuesTxt":"344 k","compte":"bunpo_learnjapanese","comptes":1,"video":"7709163578669960481"},{"texte":"you’re a villain but you’re still learning Japanese 日本語勉強中のラスボス この漢字が読めないんだけど I actually can't read that kanji","vuesTxt":"44,3 k","compte":"studytomodachi","comptes":1,"video":"7710927397977197844"},{"texte":"Anzeige Learning Spanish while eating fruit","vuesTxt":"20,2 k","compte":"vittoria.aprende","comptes":1,"video":"7709806475069230358"}],"quoi":"Apprendre les langues","reseau":[{"pseudo":"germanwithgitte","abonnes":"1,1 k","vuesMed":"41,8 k","pays":"BE"},{"pseudo":"studytomodachi","abonnes":"23,9 k","vuesMed":"23,6 k","pays":"JP"},{"pseudo":"moco.minute","abonnes":"4,7 k","vuesMed":"15,1 k","pays":"VN"},{"pseudo":"japanesewithgia","abonnes":"16,6 k","vuesMed":"8,4 k","pays":"JP"},{"pseudo":"snowstudy.kr","abonnes":"15,9 k","vuesMed":"5,3 k","pays":"US"},{"pseudo":"koreanseonghy","abonnes":"3,7 k","vuesMed":"4,5 k","pays":"KR"}]}]},{"nom":"Études","apps":35,"vuesParVideo":4542,"top":[{"nom":"Aistote","store":"Aistote : QUIZ IA","logo":"/media/simulateur/aistote.jpg","comptes":46,"comptesFR":6,"videosSemaine":532,"meilleure":{"vues":"206 k","compte":"wow_its_clifford","video":"7711615369651277087"},"note":{"note":"4,5","avis":"2,4 k"},"prix":{"min":"8,99","max":"49,99"},"accroches":[{"texte":"POV: you use a big word in your English essay and pray it means what you think it means","vuesTxt":"206 k","compte":"wow_its_clifford","comptes":1,"video":"7711615369651277087"},{"texte":"POV: you finally find a question you actually know and it's only worth 1 point","vuesTxt":"174 k","compte":"wow_its_clifford","comptes":1,"video":"7709376662114225439"},{"texte":"Le marché de Noël a ouvert à Nantes","vuesTxt":"89,9 k","compte":"arkenyxe","comptes":1,"video":"7709988833684770081"}],"quoi":"QUIZ IA","reseau":[{"pseudo":"elissastudyy","abonnes":"3 k","vuesMed":"2,3 k","pays":"US"},{"pseudo":"studywithme_vena","abonnes":"1,1 k","vuesMed":"2,3 k","pays":"US"},{"pseudo":"felix_studytips","abonnes":"54","vuesMed":"1,3 k","pays":"US"},{"pseudo":"aceofstudies","abonnes":"1,3 k","vuesMed":"1,3 k","pays":"US"},{"pseudo":"mat.astuces","abonnes":"512","vuesMed":"1,2 k","pays":"FR"},{"pseudo":"studytok_nessa","abonnes":"1,7 k","vuesMed":"1,1 k","pays":"US"}]},{"nom":"NurseMind","store":"NurseMind: AI Nursing Guide","logo":"/media/simulateur/nursemind.jpg","comptes":112,"comptesFR":0,"videosSemaine":435,"meilleure":{"vues":"2 k","compte":"learninghacks4u","video":"7711442404619881742"},"note":null,"prix":{"min":"9,99","max":"34,99"},"accroches":[{"texte":"these are the BEST outside the box ways to bring in some extra money","vuesTxt":"1,7 k","compte":"anicaa275","comptes":7,"video":"7710488999206341909"},{"texte":"3 things I bought this week just by playing cute mobile games on my phone","vuesTxt":"1,6 k","compte":"anicaa275","comptes":15,"video":"7710708717120916757"},{"texte":"if i could redo my first shift as a nurse what i'd do differently, from the first five minutes to clocking out.","vuesTxt":"1,5 k","compte":"doweknowhurrr","comptes":6,"video":"7709400617407614238"}],"quoi":"AI Nursing Guide","reseau":[{"pseudo":"cloud.drift02","abonnes":"1","vuesMed":"755","pays":"US"},{"pseudo":"growwithsade","abonnes":"1,9 k","vuesMed":"744","pays":"US"},{"pseudo":"everythingbella_3","abonnes":"58","vuesMed":"722","pays":"GB"},{"pseudo":"ugcbyciara","abonnes":"24","vuesMed":"697","pays":"CA"},{"pseudo":"nursemindhn","abonnes":"22","vuesMed":"683","pays":"HN"},{"pseudo":"glossyangelx7","abonnes":"7","vuesMed":"678","pays":"GB"}]},{"nom":"Diane AI","store":"Diane AI - Flashcards","logo":"/media/simulateur/diane-ai.jpg","comptes":53,"comptesFR":49,"videosSemaine":403,"meilleure":{"vues":"51,8 k","compte":"el1ott_lapt","video":"7710371564923014432"},"note":{"note":"4,6","avis":"385"},"prix":{"min":"19,99","max":"89,99"},"accroches":[{"texte":"« Votre motivation pour réviser les partiels » · « Parce que faut être motivé en plus ? »","vuesTxt":"109 k","compte":"jade_dianeai","comptes":1,"video":"7710994709463715105"},{"texte":"On se retrouve à 8h pour aller à la bu mais on est ni du matin ni des partiels","vuesTxt":"87,3 k","compte":"jade_dianeai","comptes":2,"video":"7712069998566559015"},{"texte":"Juillet 2025, j'obtiens mon bac, j'ai officiellement terminé le lycée ...","vuesTxt":"71,8 k","compte":"el1ott_lapt","comptes":1,"video":"7708731515743604001"}],"quoi":"Flashcards","reseau":[{"pseudo":"oldberouitsa","abonnes":"4,1 k","vuesMed":"26,1 k","pays":"DZ"},{"pseudo":"jade_dianeai","abonnes":"1,3 k","vuesMed":"11,4 k","pays":"FR"},{"pseudo":"julye_aoot","abonnes":"1,8 k","vuesMed":"6,6 k","pays":"FR"},{"pseudo":"fantine.diane","abonnes":"452","vuesMed":"6,5 k","pays":"FR"},{"pseudo":"shana_diane","abonnes":"2,3 k","vuesMed":"5,1 k","pays":"FR"},{"pseudo":"studyemilie.dianeai","abonnes":"2,4 k","vuesMed":"4,9 k","pays":"FR"}]}]},{"nom":"Productivité","apps":27,"vuesParVideo":4020,"top":[{"nom":"TapCook","store":"TapCook: Budget Meal Plans","logo":"/media/simulateur/tapcook.jpg","comptes":184,"comptesFR":0,"videosSemaine":3342,"meilleure":{"vues":"31,7 k","compte":"mealprepsteve","video":"7711485707772054792"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"9,99","max":"34,99"},"accroches":[{"texte":"¿EN COSTCO CON UN PRESUPUESTO AL AZAR?","vuesTxt":"6,2 k","compte":"laurapresupuesto","comptes":2,"video":"7711195276014374157"},{"texte":"No Frills Canada $45 to Feed 8 people Dinners for two days this weekend","vuesTxt":"4,6 k","compte":"grocevypwoq","comptes":31,"video":"7710684040143146260"},{"texte":"$80 this week for a family of 4!","vuesTxt":"3,9 k","compte":"familytips44","comptes":49,"video":"7711872874465840402"}],"quoi":"Budget Meal Plans","reseau":[{"pseudo":"kimbudgets","abonnes":"74","vuesMed":"3,7 k","pays":"CA"},{"pseudo":"symoneakira.cooks","abonnes":"4","vuesMed":"1,2 k","pays":"US"},{"pseudo":"nickistrunk.cooks","abonnes":"982","vuesMed":"1,1 k","pays":"US"},{"pseudo":"lulu.budget","abonnes":"126","vuesMed":"601","pays":"CA"},{"pseudo":"janelyncook","abonnes":"57","vuesMed":"564","pays":"CA"},{"pseudo":"taylor.budget","abonnes":"10","vuesMed":"357","pays":"US"}]},{"nom":"FocusTown","store":"FocusTown : Minuteur Pomodoro","logo":"/media/simulateur/focustown.jpg","comptes":50,"comptesFR":0,"videosSemaine":432,"meilleure":{"vues":"165 k","compte":"yellen_forellen","video":"7707246180899573025"},"note":{"note":"4,7","avis":"2,1 k"},"prix":{"min":"0,99","max":"34,99"},"accroches":[{"texte":"why does this study room kinda looks like a horror movie","vuesTxt":"5,7 k","compte":"amiesstudycorner","comptes":1,"video":"7709462763969514785"},{"texte":"macbeth is so much more interesting when you realise it’s basically a fan fic","vuesTxt":"4,6 k","compte":"downtownacademic","comptes":1,"video":"7710709185335315715"},{"texte":"WAIT THERE‘S A WINTER CAFE TO READ WITH FRIENDS ONLINE?!","vuesTxt":"3,9 k","compte":"amiesstudycorner","comptes":1,"video":"7711991636317801761"}],"quoi":"Minuteur Pomodoro","reseau":[{"pseudo":"jiwoostudy","abonnes":"7,2 k","vuesMed":"29,7 k","pays":"KR"},{"pseudo":"jsparkstudy","abonnes":"2,9 k","vuesMed":"8,1 k","pays":"GB"},{"pseudo":"amiesstudycorner","abonnes":"937","vuesMed":"4,2 k","pays":"DE"},{"pseudo":"lisa.studycorner","abonnes":"4,9 k","vuesMed":"3 k","pays":"AL"},{"pseudo":"alessio.studies","abonnes":"5 k","vuesMed":"2,5 k","pays":"CA"},{"pseudo":"allie.studycorner","abonnes":"3,5 k","vuesMed":"2,5 k","pays":"US"}]},{"nom":"EcoGPT","store":"EcoGPT","logo":"/media/simulateur/ecogpt.jpg","comptes":130,"comptesFR":0,"videosSemaine":426,"meilleure":{"vues":"98,4 k","compte":"ecowithlourdes","video":"7709927167127325973"},"note":{"note":"4,7","avis":"1,3 k"},"prix":{"min":"6,99","max":"79,99"},"accroches":[{"texte":"Coincidences that could happen only once in a lifetime","vuesTxt":"1,7 M","compte":"plainachos","comptes":1,"video":"7707806717182004511"},{"texte":"Photos of times people forgot something and faced the consequences Pt.13","vuesTxt":"1,5 M","compte":"plainachos","comptes":2,"video":"7708832040137035038"},{"texte":"La vaquita marina está extinta","vuesTxt":"901 k","compte":"ecologiacongaby","comptes":8,"video":"7710416614897880340"}],"quoi":"Application d'IA conversationnelle présentée par les créatrices comme un moyen d'agir pour la planète à travers ses usages quotidiens","reseau":[{"pseudo":"blueforgood","abonnes":"528 k","vuesMed":"549 k","pays":"GB"},{"pseudo":"devix516","abonnes":"95,8 k","vuesMed":"126 k","pays":"DE"},{"pseudo":"plainachos","abonnes":"47 k","vuesMed":"77,3 k","pays":"US"},{"pseudo":"savetheplanettoday1","abonnes":"133 k","vuesMed":"63 k","pays":"GB"},{"pseudo":"earthsimpact","abonnes":"63,7 k","vuesMed":"34,9 k","pays":"GB"},{"pseudo":"ecogpt.vale","abonnes":"71,2 k","vuesMed":"33,8 k","pays":"MX"}]}]},{"nom":"Foi","apps":23,"vuesParVideo":4871,"top":[{"nom":"Sacred Shorts","store":"Sacred Shorts: Bible Videos","logo":"/media/simulateur/sacred-shorts.jpg","comptes":54,"comptesFR":0,"videosSemaine":715,"meilleure":{"vues":"392","compte":"guadalupedolores33","video":"7710685921921731861"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"14,99","max":"69,99"},"accroches":[{"texte":"le regalé esto a mi mamá en su cumpleaños y lloró","vuesTxt":"190","compte":"julianagarcia4007","comptes":2,"video":"7709334200461151508"},{"texte":"pidió su herencia antes de tiempo y la perdió toda","vuesTxt":"183","compte":"alexandraquizano","comptes":3,"video":"7708835521094798612"},{"texte":"mi hermano en el ejército me pidió que se la recomendara","vuesTxt":"181","compte":"melisagomez747","comptes":4,"video":"7708834799347174708"}],"quoi":"Bible Videos","reseau":[{"pseudo":"lucia.pilar98","abonnes":"22","vuesMed":"146","pays":"MX"},{"pseudo":"estheravv0","abonnes":"73","vuesMed":"146","pays":"MX"},{"pseudo":"vic_predica","abonnes":"33","vuesMed":"142","pays":"MX"},{"pseudo":"gabby_guille","abonnes":"30","vuesMed":"139","pays":"MX"},{"pseudo":"peyton.walker96","abonnes":"3","vuesMed":"74","pays":"US"}]},{"nom":"Tarteel","store":"Tarteel: Coran et Mémorisation","logo":"/media/simulateur/tarteel.jpg","comptes":50,"comptesFR":4,"videosSemaine":217,"meilleure":{"vues":"10,4 k","compte":"tarteel.travel","video":"7711109620495928589"},"note":{"note":"4,8","avis":"2,9 k"},"prix":{"min":"14,99","max":"249,99"},"accroches":[{"texte":"“Find peace in Quran after a long day”","vuesTxt":"34,8 k","compte":"muhammadibrahim007458","comptes":1,"video":"7710354141012380935"},{"texte":"MK : Muroja'ah dengan irama \"jiharka\"","vuesTxt":"34,5 k","compte":"iqbalrajasaa","comptes":1,"video":"7709421671882427654"},{"texte":"POV: Your friend gets put in charge of the Hifz class","vuesTxt":"16,7 k","compte":"zafrul18","comptes":1,"video":"7711058774496169238"}],"quoi":"Coran et Mémorisation","reseau":[{"pseudo":"islamic.clips113","abonnes":"4,7 k","vuesMed":"104 k","pays":"EG"},{"pseudo":"nassim_2510","abonnes":"76,9 k","vuesMed":"60,8 k","pays":"FR"},{"pseudo":"iqbalrajasaa","abonnes":"389 k","vuesMed":"58,2 k","pays":"ID"},{"pseudo":"muhammadibrahim007458","abonnes":"99,7 k","vuesMed":"46,2 k","pays":"GH"},{"pseudo":"sanasidiabasse","abonnes":"967 k","vuesMed":"28,2 k","pays":"EG"},{"pseudo":"mazeyy","abonnes":"91,9 k","vuesMed":"22,1 k","pays":"GB"}]},{"nom":"Scroll The Bible","store":"Scroll The Bible","logo":"/media/simulateur/scroll-the-bible.jpg","comptes":29,"comptesFR":0,"videosSemaine":159,"meilleure":{"vues":"665 k","compte":"juless4jesus","video":"7711219585697058062"},"note":{"note":"4,9","avis":"30"},"prix":{"min":"5,99","max":"44,99"},"accroches":[{"texte":"God wants you To pray against Anxiety & worry!","vuesTxt":"14,2 k","compte":"cirley.ruballo","comptes":2,"video":"7711527992677174559"},{"texte":"God wants you to hear his voice this week","vuesTxt":"12,3 k","compte":"jodavscroll","comptes":1,"video":"7711583732796378382"},{"texte":"A message from God for YOU","vuesTxt":"6,3 k","compte":"jodavscroll","comptes":1,"video":"7711615722098527502"}],"quoi":"App qui propose des sujets de prière quotidiens et des passages bibliques à partir de la Parole de Dieu","reseau":[{"pseudo":"gabereadsbible","abonnes":"13,7 k","vuesMed":"20 k","pays":"US"},{"pseudo":"leila.lovesjesus","abonnes":"3,9 k","vuesMed":"14,8 k","pays":"US"},{"pseudo":"johnsbiblescrolls","abonnes":"1,4 k","vuesMed":"11,5 k","pays":"US"},{"pseudo":"cirley.ruballo","abonnes":"4,4 k","vuesMed":"8,2 k","pays":"US"},{"pseudo":"audrey.scrollthebible","abonnes":"20,9 k","vuesMed":"7,5 k","pays":"US"},{"pseudo":"izackforchrist","abonnes":"10,2 k","vuesMed":"5,3 k","pays":"US"}]}]},{"nom":"Beauté IA","apps":23,"vuesParVideo":11777,"top":[{"nom":"Fits","store":"Fits – Closet & Outfit Maker","logo":"/media/simulateur/fits.jpg","comptes":11,"comptesFR":1,"videosSemaine":67,"meilleure":{"vues":"699","compte":".username._.com","video":"7710009869608307971"},"note":{"note":"4,5","avis":"1,3 k"},"prix":{"min":"1,99","max":"79,99"},"accroches":[],"quoi":"Closet & Outfit Maker","reseau":[]},{"nom":"Tatship","store":"Tatship: Simulateur Tatouage","logo":"/media/simulateur/tatship.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"1,5 k","compte":"tatshiphq","video":"7711336534154218765"},"note":{"note":"4,4","avis":"118"},"prix":{"min":"14,99","max":"39,99"},"accroches":[{"texte":"Tattoo request forms are HARD for clients","vuesTxt":"106","compte":"tatshiphq","comptes":1,"video":"7712079092878757133"},{"texte":"my tattoo artist just sent me this app to use before my appointment","vuesTxt":"38","compte":"tatshiphq","comptes":1,"video":"7711801152064572703"}],"quoi":"Simulateur Tatouage","reseau":[{"pseudo":"theinkdiary6","abonnes":"245","vuesMed":"1,7 k","pays":"US"},{"pseudo":"tattooswithjas","abonnes":"62","vuesMed":"564","pays":"US"},{"pseudo":"tatshiphq","abonnes":"663","vuesMed":"103","pays":"US"}]},{"nom":"Closfi","store":"Closfi: Tu Clóset Virtual IA","logo":"/media/simulateur/closfi.jpg","comptes":21,"comptesFR":0,"videosSemaine":19,"meilleure":{"vues":"4,5 k","compte":"carolina_outfits","video":"7709294200990321926"},"note":null,"prix":{"min":"3,99","max":"59,99"},"accroches":[],"quoi":"Tu Clóset Virtual IA","reseau":[{"pseudo":"rosa.anaya.rivera","abonnes":"36","vuesMed":"1,8 k","pays":"CO"},{"pseudo":"mcami.style","abonnes":"15","vuesMed":"1,2 k","pays":"CO"},{"pseudo":"lisyeoutfits_","abonnes":"30","vuesMed":"843","pays":"CO"},{"pseudo":"mariangelic_7","abonnes":"6","vuesMed":"800","pays":"CO"},{"pseudo":"closfi.app","abonnes":"1,3 k","vuesMed":"796","pays":"CO"},{"pseudo":"nazafashion24","abonnes":"24","vuesMed":"782","pays":"CO"}]}]},{"nom":"Jalousie et ex","apps":22,"vuesParVideo":4219,"top":[{"nom":"The Cringe","store":"The Cringe: Chat Wrapped","logo":"/media/simulateur/the-cringe.jpg","comptes":14,"comptesFR":2,"videosSemaine":95,"meilleure":{"vues":"144 k","compte":"ele_peivateaccoun","video":"7710709720662674721"},"note":{"note":"4,0","avis":"849"},"prix":{"min":"9,99","max":"44,99"},"accroches":[],"quoi":"Chat Wrapped","reseau":[{"pseudo":"paul.crown4","abonnes":"104","vuesMed":"33,4 k","pays":"FR"},{"pseudo":"andra_privateacc","abonnes":"2,8 k","vuesMed":"8,4 k","pays":"RO"},{"pseudo":"anastasia_private3","abonnes":"412","vuesMed":"4,8 k","pays":"DE"},{"pseudo":"laure_privateacco","abonnes":"163","vuesMed":"3,8 k","pays":"FR"},{"pseudo":"dorcsyy_privateacc2","abonnes":"401","vuesMed":"2 k","pays":"HU"},{"pseudo":"privateacc_lucy","abonnes":"1,2 k","vuesMed":"1,3 k","pays":"ES"}]},{"nom":"Red Flag","store":"Red Flag: Track Recent Follows","logo":"/media/simulateur/red-flag.jpg","comptes":21,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":{"note":"5,0","avis":"1"},"prix":{"min":"3,99","max":"89,99"},"accroches":[],"quoi":"Track Recent Follows","reseau":[{"pseudo":"loveradaron","abonnes":"45","vuesMed":"1,6 k","pays":"US"},{"pseudo":"lovesignalcheck","abonnes":"9","vuesMed":"1,5 k","pays":"US"},{"pseudo":"theglowupfiles0","abonnes":"2","vuesMed":"1,5 k","pays":"US"},{"pseudo":"theredflagfiles","abonnes":"4","vuesMed":"1,4 k","pays":"US"},{"pseudo":"emotionalredflags","abonnes":"321","vuesMed":"1,4 k","pays":"US"},{"pseudo":"decodeyourdesign","abonnes":"2","vuesMed":"1,2 k","pays":"US"}]},{"nom":"Lucen","store":"Lucen: AI Text Dating Advice","logo":"/media/simulateur/lucen.jpg","comptes":1,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":null,"prix":null,"accroches":[],"quoi":"AI Text Dating Advice","reseau":[{"pseudo":"kerijagal","abonnes":"109","vuesMed":"716","pays":"US"}]}]},{"nom":"Bien-être mental","apps":18,"vuesParVideo":1580,"top":[{"nom":"Daimon","store":"Daimon: Honest Advice","logo":"/media/simulateur/daimon.jpg","comptes":5,"comptesFR":0,"videosSemaine":26,"meilleure":{"vues":"304 k","compte":"evelyn.0935","video":"7710878609850010910"},"note":{"note":"4,9","avis":"904"},"prix":{"min":"0,99","max":"9,99"},"accroches":[],"quoi":"Honest Advice","reseau":[{"pseudo":"siennaa260","abonnes":"511","vuesMed":"1,1 k","pays":"US"}]},{"nom":"Gratitude Plus","store":"Gratitude Plus – Journal","logo":"/media/simulateur/gratitude-plus.jpg","comptes":5,"comptesFR":0,"videosSemaine":24,"meilleure":{"vues":"10,2 k","compte":"chaos_butmakeitcute_ish","video":"7711057129750203662"},"note":{"note":"4,9","avis":"41"},"prix":{"min":"6,99","max":"399,99"},"accroches":[{"texte":"I was tired of checking by bank account before every purchase So I started making videos of myself doing simple tasks around the house And p","vuesTxt":"275","compte":"pis.taschio","comptes":1,"video":"7711600228968762637"}],"quoi":"Journal","reseau":[{"pseudo":"gratitudebrooklyn","abonnes":"48","vuesMed":"24,8 k","pays":"US"},{"pseudo":"chaos_butmakeitcute_ish","abonnes":"16","vuesMed":"326","pays":"US"},{"pseudo":"gratitude.caroline","abonnes":"575","vuesMed":"293","pays":"US"},{"pseudo":"jane.gratitude","abonnes":"407","vuesMed":"267","pays":"US"},{"pseudo":"pis.taschio","abonnes":"4","vuesMed":"128","pays":"US"}]},{"nom":"Cora","store":"Cora - Become Her","logo":"/media/simulateur/cora.jpg","comptes":3,"comptesFR":0,"videosSemaine":4,"meilleure":{"vues":"737","compte":"becomingherpru","video":"7711053380331883798"},"note":{"note":"4,4","avis":"34"},"prix":{"min":"6,99","max":"49,99"},"accroches":[],"quoi":"Become Her","reseau":[{"pseudo":"chloefitco","abonnes":"48","vuesMed":"1,6 k","pays":"US"},{"pseudo":"becomingherpru","abonnes":"777","vuesMed":"737","pays":"GB"},{"pseudo":"fitnesswithcorrin","abonnes":"34","vuesMed":"448","pays":"US"}]}]},{"nom":"Séduction IA","apps":17,"vuesParVideo":18550,"top":[{"nom":"Liggo","store":"Liggo: Phrases de Drague IA","logo":"/media/simulateur/liggo.jpg","comptes":17,"comptesFR":0,"videosSemaine":111,"meilleure":{"vues":"492 k","compte":"inspectordelrizz","video":"7710020762337365268"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"3,99","max":"39,99"},"accroches":[{"texte":"quien me acompaña a un casamiento quien es la afortunada?","vuesTxt":"492 k","compte":"inspectordelrizz","comptes":2,"video":"7710020762337365268"},{"texte":"mi Sabés bien que nunca de cosas por vos, siempre fu JAJAJAJ QUE MANERA DE REÍRME que romántico que sos amigo!! mi wacha está durmiendo al l","vuesTxt":"58,1 k","compte":"santidigraziaa","comptes":1,"video":"7710072887532604693"},{"texte":"DIOSITO DESÉAME SUERTE","vuesTxt":"33,4 k","compte":"mrrizz49","comptes":1,"video":"7710027247943568662"}],"quoi":"Phrases de Drague IA","reseau":[{"pseudo":"elbegsito_","abonnes":"891 k","vuesMed":"190 k","pays":"PE"},{"pseudo":"santidigraziaa","abonnes":"85,9 k","vuesMed":"42,4 k","pays":"AR"},{"pseudo":"profesorliggo","abonnes":"29,8 k","vuesMed":"21 k","pays":"AR"},{"pseudo":"leony2x","abonnes":"103 k","vuesMed":"17,1 k","pays":"AR"},{"pseudo":"la_mvnc","abonnes":"36,3 k","vuesMed":"10,4 k","pays":"CO"},{"pseudo":"storiedichatfakee","abonnes":"28,2 k","vuesMed":"7,9 k","pays":"IT"}]},{"nom":"Trick AI","store":"Trick AI","logo":"/media/simulateur/trick-ai.jpg","comptes":2,"comptesFR":0,"videosSemaine":36,"meilleure":{"vues":"70,8 k","compte":"ustamanipulator","video":"7709913632540200199"},"note":{"note":"5,0","avis":"1"},"prix":{"min":"1,99","max":"69,99"},"accroches":[{"texte":"Beni arkadaş bölgesine attı. Sonra arkadaşlığımdan şikâyet etti.","vuesTxt":"1,2 k","compte":"manipulasyonustasi","comptes":1,"video":"7711809213969763591"},{"texte":"Partide başka biriyle öpüştü. Ertesi gün \"sarhoştum, sayılmaz\" dedi.","vuesTxt":"385","compte":"manipulasyonustasi","comptes":1,"video":"7711747195254410504"},{"texte":"Beni telefonuna \"Ayşe Hoca\" diye kaydetmiş. Meğer başka biriyle sevgiliymiş.","vuesTxt":"304","compte":"ustamanipulator","comptes":1,"video":"7711360663272099079"}],"quoi":"Application qui aide à décoder et écrire les messages dans une conversation amoureuse, avec des conseils de réponse","reseau":[{"pseudo":"manipulasyonustasi","abonnes":"2,5 k","vuesMed":"1,2 k","pays":"TR"},{"pseudo":"ustamanipulator","abonnes":"2,3 k","vuesMed":"870","pays":"TR"}]},{"nom":"Yazcam","store":"Yazcam : Assistant Chat IA","logo":"/media/simulateur/yazcam.jpg","comptes":2,"comptesFR":0,"videosSemaine":10,"meilleure":{"vues":"7,8 k","compte":"alfaflort","video":"7710996900811525383"},"note":null,"prix":{"min":"5,99","max":"79,99"},"accroches":[{"texte":"1 Haftadır konuştuğum Flört \"sevgilim var\" dedi","vuesTxt":"4,2 k","compte":"tavlarizz","comptes":1,"video":"7711472131514617106"},{"texte":"POV: Kız 'ben çok kıskancım, baştan söyleyeyim' dedi ve sen kıskançlık yarışması açtın","vuesTxt":"553","compte":"alfaflort","comptes":1,"video":"7711831768579493138"}],"quoi":"Assistant Chat IA","reseau":[{"pseudo":"tavlarizz","abonnes":"3 k","vuesMed":"5,2 k","pays":"TR"},{"pseudo":"alfaflort","abonnes":"238","vuesMed":"3,5 k","pays":"TR"}]}]},{"nom":"Rencontres","apps":17,"vuesParVideo":9647,"top":[{"nom":"Bump","store":"Bump - va voir tes amis IRL","logo":"/media/simulateur/bump.jpg","comptes":74,"comptesFR":7,"videosSemaine":302,"meilleure":{"vues":"621 k","compte":"brendon.bump","video":"7710034092078763286"},"note":{"note":"4,9","avis":"12 k"},"prix":{"min":"2,49","max":"34,99"},"accroches":[{"texte":"Azt mondja ne talizzunk ma, sokat dolgozott, inkább alszik... Most tényleg ennyire madárnak tűnök?","vuesTxt":"779 k","compte":"szaffi.bump","comptes":4,"video":"7708325383120178454"},{"texte":"Bumpon a kacsás játékba is lehetne ilyen funkció","vuesTxt":"621 k","compte":"brendon.bump","comptes":2,"video":"7710034092078763286"},{"texte":"Avisando al resto del grupo que encontramos EL sitio","vuesTxt":"345 k","compte":"gabyb2609","comptes":1,"video":"7709923930659704096"}],"quoi":"Va voir tes amis IRL","reseau":[{"pseudo":"sofi.bump","abonnes":"959","vuesMed":"233 k","pays":"BE"},{"pseudo":"riribump8","abonnes":"886","vuesMed":"138 k","pays":"FR"},{"pseudo":"radatedi.bump","abonnes":"1,6 k","vuesMed":"115 k","pays":"BG"},{"pseudo":"dany.bump","abonnes":"3,4 k","vuesMed":"110 k","pays":"CZ"},{"pseudo":"julioo.no","abonnes":"4,1 k","vuesMed":"74,9 k","pays":"FR"},{"pseudo":"eden.x.bump","abonnes":"1,7 k","vuesMed":"67,1 k","pays":"IL"}]},{"nom":"Milionegle","store":"Milionegle","logo":"/media/simulateur/milionegle.jpg","comptes":6,"comptesFR":0,"videosSemaine":65,"meilleure":{"vues":"5,1 k","compte":"rebecca.emprende","video":"7710313631069654294"},"note":null,"prix":{"min":"0,99","max":"49,99"},"accroches":[{"texte":"Hackearon la web de mi cliente y me llamó diciendo que fue mi culpa.","vuesTxt":"10,3 k","compte":"gonzles1258","comptes":1,"video":"7711506773764623636"},{"texte":"con una aplicación","vuesTxt":"1,3 k","compte":"hurtaldo","comptes":1,"video":"7711059996775173398"},{"texte":"Entregué la web, el cliente dijo «perfecto» y nunca pagó los últimos $700.","vuesTxt":"1,2 k","compte":"gonzles1258","comptes":1,"video":"7711433814211366165"}],"quoi":"App pour rencontrer d'autres entrepreneurs et développer une mentalité entrepreneuriale","reseau":[{"pseudo":"hurtaldo","abonnes":"4,2 k","vuesMed":"1,2 k","pays":"ES"},{"pseudo":"gonzles1258","abonnes":"55","vuesMed":"1,1 k","pays":"GT"},{"pseudo":"arnauinsights","abonnes":"63","vuesMed":"870","pays":"ES"},{"pseudo":"enzo.lascano10","abonnes":"17","vuesMed":"699","pays":"ES"},{"pseudo":"alvaro.mangrac","abonnes":"4","vuesMed":"493","pays":"GT"},{"pseudo":"milionegle.com","abonnes":"294","vuesMed":null,"pays":"ES"}]},{"nom":"Dion","store":"Dion","logo":"/media/simulateur/dion.jpg","comptes":17,"comptesFR":0,"videosSemaine":41,"meilleure":{"vues":"8,3 k","compte":"gabyandsips","video":"7711092471748398354"},"note":{"note":"4,9","avis":"53"},"prix":{"min":"24,99","max":"359,99"},"accroches":[],"quoi":"Application de mise en relation sur invitation pour rencontrer de nouvelles personnes et développer son réseau","reseau":[{"pseudo":"dxbytheglass","abonnes":"222","vuesMed":"7,5 k","pays":"AE"},{"pseudo":"revekkapal","abonnes":"475","vuesMed":"2,6 k","pays":"US"},{"pseudo":"dxbgirlsclub","abonnes":"204","vuesMed":"1,8 k","pays":"AE"},{"pseudo":"_littlelondonlife","abonnes":"70","vuesMed":"1,6 k","pays":"GB"},{"pseudo":"psmiamivibes","abonnes":"48","vuesMed":"744","pays":"ES"},{"pseudo":"genevainmiami","abonnes":"257","vuesMed":"708","pays":"US"}]}]},{"nom":"Finance","apps":17,"vuesParVideo":4049,"top":[{"nom":"Zoya","store":"Zoya: Halal Investing App","logo":"/media/simulateur/zoya.jpg","comptes":4,"comptesFR":0,"videosSemaine":31,"meilleure":{"vues":"96 k","compte":"malak.finance","video":"7710788908916788494"},"note":{"note":"4,8","avis":"83"},"prix":{"min":"4,99","max":"129,99"},"accroches":[{"texte":"realizing that islam gives you instructions on everything including your finances, wealth, and halal investing","vuesTxt":"3,2 k","compte":"keishaonwealth","comptes":1,"video":"7711143938639400223"},{"texte":"girls who invest >","vuesTxt":"868","compte":"keishaonwealth","comptes":1,"video":"7711144567369731342"}],"quoi":"Halal Investing App","reseau":[]},{"nom":"WeStash","store":"WeStash: Budget & Épargne","logo":"/media/simulateur/westash.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"4,3 k","compte":"eliestash","video":"7712115282680089878"},"note":{"note":"4,4","avis":"28"},"prix":{"min":"3,99","max":"24,99"},"accroches":[],"quoi":"Budget & Épargne","reseau":[{"pseudo":"lilistash56","abonnes":"99","vuesMed":"2 k","pays":"EE"},{"pseudo":"eliestash","abonnes":"343","vuesMed":"716","pays":"EE"},{"pseudo":"aliciastash","abonnes":"20","vuesMed":"510","pays":"EE"}]},{"nom":"Finzee","store":"Finzee - Budget planner","logo":"/media/simulateur/finzee.jpg","comptes":13,"comptesFR":11,"videosSemaine":20,"meilleure":{"vues":"270 k","compte":"budget.forgirls","video":"7711038070874819872"},"note":{"note":"4,8","avis":"791"},"prix":{"min":"4,99","max":"99,99"},"accroches":[],"quoi":"Budget planner","reseau":[{"pseudo":"budget.forgirls","abonnes":"2,8 k","vuesMed":"9,9 k","pays":"FR"},{"pseudo":"hello.budget","abonnes":"269","vuesMed":"4,9 k","pays":"FR"},{"pseudo":"lartdubudget","abonnes":"10,7 k","vuesMed":"3 k","pays":"NL"},{"pseudo":"economiesmalines1","abonnes":"12 k","vuesMed":"2,8 k","pays":"FR"},{"pseudo":"budget.julian","abonnes":"260","vuesMed":"1,2 k","pays":"FR"},{"pseudo":"finzee.app.budget","abonnes":"403","vuesMed":"971","pays":"FR"}]}]},{"nom":"Couple","apps":9,"vuesParVideo":5149,"top":[{"nom":"Amorly","store":"Amorly: Jeux de Couple & Quiz","logo":"/media/simulateur/amorly.jpg","comptes":2,"comptesFR":0,"videosSemaine":50,"meilleure":{"vues":"258 k","compte":"mayanowak076","video":"7710313265775054112"},"note":{"note":"2,0","avis":"2"},"prix":{"min":"5,99","max":"79,99"},"accroches":[{"texte":"4 oznaki, że twoja dziewczyna naprawdę cię kocha >>>","vuesTxt":"182 k","compte":"majanowak074","comptes":2,"video":"7711359646866345248"},{"texte":"Oznaki, że bombarduje cię miłością","vuesTxt":"15,8 k","compte":"mayanowak076","comptes":1,"video":"7711374442089286945"},{"texte":"13 czerwonych flag w związku ; Przeczytaj to >","vuesTxt":"556","compte":"mayanowak076","comptes":1,"video":"7711993201426582823"}],"quoi":"Jeux de Couple & Quiz","reseau":[{"pseudo":"majanowak074","abonnes":"7 k","vuesMed":"18 k","pays":"PL"},{"pseudo":"mayanowak076","abonnes":"871","vuesMed":"3,8 k","pays":"PL"}]},{"nom":"Pukutan","store":"Pukutan: Journal & Élevage","logo":"/media/simulateur/pukutan.jpg","comptes":30,"comptesFR":0,"videosSemaine":37,"meilleure":{"vues":"4,5 k","compte":"kydropout","video":"7709343468132322580"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"0,99","max":"69,99"},"accroches":[],"quoi":"Journal & Élevage","reseau":[{"pseudo":"pukutan_eileen","abonnes":"11","vuesMed":"1,7 k","pays":"JP"},{"pseudo":"zhangaxing99","abonnes":"96","vuesMed":"1,6 k","pays":"CN"},{"pseudo":"kawaiipukutan","abonnes":"47","vuesMed":"1,3 k","pays":"JP"},{"pseudo":"vivi._.desu","abonnes":"84","vuesMed":"1,1 k","pays":"CN"},{"pseudo":"pukutan_jp","abonnes":"175","vuesMed":"1 k","pays":"JP"},{"pseudo":"yukarin_coco","abonnes":"1,5 k","vuesMed":"1 k","pays":"JP"}]}]}]};
    const NICHES = DATA.niches;
    const NNBSP = " ", NBSP = " ";
    const AMOUNTS = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000];
    const QUICK = [1000, 3000, 5000, 10000];
    const TIMES = [{ v: 30, label: "30" + NBSP + "min", vids: 1 }, { v: 60, label: "1" + NBSP + "h", vids: 3 }, { v: 120, label: "2" + NBSP + "h", vids: 6 }, { v: 180, label: "3" + NBSP + "h" + NBSP + "+", vids: 9 }];
    const BUDGETS = [{ v: "0", label: "0" + NBSP + "€", coins: 1 }, { v: "lt100", label: "Moins de 100" + NBSP + "€", coins: 2 }, { v: "100-500", label: "100 à 500" + NBSP + "€", coins: 3 }, { v: "gt500", label: "Plus de 500" + NBSP + "€", coins: 4 }];
    const CODES = ["non", "outils", "oui"];
    const MARKETS = ["FR", "US", "GB", "ES", "BR", "ALL"];
    const RADAR_BIG = [{ l: 66.5, t: 26.3, d: 0.5 }, { l: 66.3, t: 78.3, d: 1.2 }, { l: 25.8, t: 56.5, d: 1.9 }];
    const RADAR_SMALL = [{ l: 16.7, t: 30.8, d: 0.25 }, { l: 43.1, t: 31, d: 0.6 }, { l: 85.8, t: 29.3, d: 0.9 }, { l: 90.8, t: 42.9, d: 1.4 }, { l: 35.9, t: 88.8, d: 2.1 }, { l: 16.9, t: 77.9, d: 2.5 }];
    const PARTICLES = Array.from({ length: 24 }, (_, i) => {
      const a = i * (360 / 24) + ((i * 37) % 11) - 5;
      const r = 140 + ((i * 53) % 90);
      const sz = 6 + ((i * 7) % 6);
      const c = ["#4C9AFF", "#0B6FE0", "#7CC4FF"][i % 3];
      return { st: "--a: " + a.toFixed(1) + "deg; --r: " + r + "px; --s: " + sz + "px; --c: " + c + "; animation-delay: " + ((i % 4) * 30) + "ms;" };
    });

    function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP); }
    function fr(x, d) { let s = x.toFixed(d); if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, ""); return s.replace(".", ","); }
    function fmtDur(m) { const h = Math.floor(m / 60), r = m % 60; if (!h) return r + NBSP + "min"; return h + NBSP + "h" + (r ? NBSP + String(r).padStart(2, "0") : ""); }
    function parseV(t) {
      if (!t) return 0;
      const m = String(t).replace(/\s/g, "").match(/^([\d,]+)([kM]?)$/);
      if (!m) return 0;
      const x = parseFloat(m[1].replace(",", "."));
      return m[2] === "M" ? x * 1e6 : m[2] === "k" ? x * 1e3 : x;
    }
    function vuesTxt(t) { const s = String(t).replace(/\s/g, NBSP); return /M$/.test(s) ? s + " de vues" : s + " vues"; }
    function clean(t) {
      return String(t || "")
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{FE0E}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
        .replace(/\s+/g, " ").replace(/\s+([,.;:…])/g, "$1").trim();
    }
    function bgOf(u) { return u ? "background-image: url(" + u + ");" : ""; }
    // Le lecteur TikTok de la fiche vidéo de l'app (src/app/pages/MVideo.js), sans lecture automatique.
    function embed(id) { return /^\d+$/.test(String(id || "")) ? "https://www.tiktok.com/player/v1/" + id + "?rel=0&description=0&music_info=0&native_context_menu=0" : ""; }
    function profil(p) { return /^[A-Za-z0-9._]{1,64}$/.test(String(p || "")) ? "https://www.tiktok.com/@" + p : ""; }
    // Le relevé coupe les accroches à 140 caractères : on coupe au dernier mot, avec « … ».
    function cut(t) {
      if (t.length < 140) return t;
      const sp = t.lastIndexOf(" ", 139);
      return t.slice(0, sp > 80 ? sp : 139).replace(/[\s,.;:·\-–—]+$/, "") + "…";
    }
    // « 15,8 k abonnés », « 6,2 M d’abonnés », « 1 abonné ».
    function count(v, one, many, deMany) {
      const s = String(v == null ? "" : v).trim();
      if (!s) return "";
      const n = s.replace(/\s/g, NBSP);
      if (/M$/.test(n)) return n + NBSP + deMany.replace(/ /g, NBSP);
      return n + NBSP + (parseV(s) <= 1 ? one : many).replace(/ /g, NBSP);
    }
    const REGIONS = (() => { try { return new Intl.DisplayNames(["fr"], { type: "region" }); } catch (e) { return null; } })();
    function paysNom(c) {
      const k = String(c || "").toUpperCase();
      if (!/^[A-Z]{2}$/.test(k)) return "";
      try { return (REGIONS && REGIONS.of(k)) || k; } catch (e) { return k; }
    }
    function range(n) { return Array.from({ length: n }, (_, i) => i); }
    function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

    const ALL_TOP = NICHES.reduce((acc, n) => acc.concat(n.top), []).filter((a) => a.meilleure)
      .sort((a, b) => parseV(b.meilleure.vues) - parseV(a.meilleure.vues)).slice(0, 3);
    const ALL = { nom: "toutes les niches", apps: 653, vuesParVideo: 7400, top: ALL_TOP, all: true };
    return { DATA, NICHES, NNBSP, NBSP, AMOUNTS, QUICK, TIMES, BUDGETS, CODES, MARKETS, RADAR_BIG, RADAR_SMALL, PARTICLES, grp, fr, fmtDur, parseV, vuesTxt, clean, bgOf, embed, profil, cut, count, paysNom, range, plural, ALL_TOP, ALL };
  })();

  constructor(p) {
    super(p);
    const { AMOUNTS } = this.constructor.K;
    this.state = {
      step: 1, prevStep: 1, amount: 3000, niche: "Santé et physique", time: 120, budget: "lt100", code: "non", market: "FR",
      app: 0, showCalc: false, paywallOpen: false, pwOut: false, sheet: false, shOut: false, leaving: false, leaveY: 380,
      armed: false, picked: false, touched: false, ripple: null, bump: 0, phase: 0, seen: {}, scrolled: false, hookHit: -1, hookN: 0,
    };
    this.timers = [];
    this.pending = [];
    this.rip = 0;
    this.scrollRef = (el) => {
      this.scroller = el || null;
      if (el) { this.ensureIO(); const p = this.pending; this.pending = []; p.forEach((x) => this.observe(x)); }
    };
    this.rvRef = (el) => { if (el) this.observe(el); };
    this.onScroll = (e) => {
      const sc = !!(e && e.currentTarget && e.currentTarget.scrollTop > 6);
      if (sc !== this.state.scrolled) this.setState({ scrolled: sc });
    };
    this.onAmount = (e) => {
      const i = Math.max(0, Math.min(10, Number(e.target.value) || 0));
      if (AMOUNTS[i] === this.state.amount) return;
      this.setState({ amount: AMOUNTS[i], bump: this.state.bump + 1, ripple: null, touched: true });
    };
    this.back = () => { const s = this.state.step; if (s === 9) this.go(8); else if (s > 1 && s <= 6) this.go(s - 1); };
    this.restart = () => this.go(1);
    this.next = () => { const s = this.state.step; if (s >= 1 && s <= 6) this.go(s + 1); };
    this.toggleCalc = () => this.setState({ showCalc: !this.state.showCalc });
    this.openPaywall = () => { if (this.isPaywall()) this.setState({ paywallOpen: true, pwOut: false }); };
    this.closePaywall = () => {
      if (!this.state.paywallOpen || this.state.pwOut) return;
      this.setState({ pwOut: true });
      this.later(() => this.setState({ paywallOpen: false, pwOut: false }), this.rm ? 0 : 220);
    };
    // Résultat : la meilleure vidéo de l'app en clair, dans une feuille qui monte du bas (croix, fond ou Échap).
    this.openSheet = () => {
      try { this.sheetFrom = document.activeElement; } catch (e) { this.sheetFrom = null; }
      this.setState({ sheet: true, shOut: false });
    };
    this.closeSheet = () => {
      if (!this.state.sheet || this.state.shOut) return;
      this.setState({ shOut: true });
      this.later(() => {
        this.setState({ sheet: false, shOut: false });
        const el = this.sheetFrom; this.sheetFrom = null;
        if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { /* rien */ } }
      }, this.rm ? 0 : 260);
    };
    this.onSheetKey = (e) => { if (e && e.key === "Escape") { e.preventDefault(); this.closeSheet(); } };
    this.sheetX = (el) => { if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { /* rien */ } } };
    this.nextApp = () => { const n = this.sortedApps(this.nicheData()).length || 1; this.go(9, { app: ((this.state.app || 0) + 1) % n }); };
    this.toPlan = () => this.go(8);
  }

  componentDidMount() {
    try { this.rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { this.rm = false; }
    this.onEnter(this.state.step);
  }
  componentWillUnmount() {
    this.clearTimers();
    clearTimeout(this.pickT);
    if (this.io) this.io.disconnect();
  }

  later(fn, ms) { const t = setTimeout(() => { this.timers = this.timers.filter((x) => x !== t); fn(); }, ms); this.timers.push(t); return t; }
  clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }
  isPaywall() { return this.props.paywall ?? true; }

  ensureIO() {
    if (this.io || this.noIO) return;
    if (typeof IntersectionObserver === "undefined") { this.noIO = true; return; }
    this.io = new IntersectionObserver((entries) => {
      const add = {}; let any = false;
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const k = en.target.getAttribute("data-rv");
        if (k && !this.state.seen[k]) { add[k] = true; any = true; }
        this.io.unobserve(en.target);
      });
      if (any) this.setState({ seen: Object.assign({}, this.state.seen, add) });
    }, { root: this.scroller || null, rootMargin: "0px 0px -8% 0px", threshold: 0 });
  }
  observe(el) {
    if (this.noIO) { const k = el.getAttribute("data-rv"); if (k && !this.state.seen[k]) this.setState({ seen: Object.assign({}, this.state.seen, { [k]: true }) }); return; }
    if (!this.scroller) { this.pending.push(el); return; }
    this.ensureIO();
    if (this.io) this.io.observe(el);
    else { const k = el.getAttribute("data-rv"); if (k) this.setState({ seen: Object.assign({}, this.state.seen, { [k]: true }) }); }
  }

  go(n, patch) {
    if (this.state.leaving) return;
    this.clearTimers();
    clearTimeout(this.pickT);
    const sc = this.scroller;
    const y = sc ? sc.scrollTop + 380 : 380;
    this.setState({ leaving: true, leaveY: y, paywallOpen: false, pwOut: false, sheet: false, shOut: false });
    const swap = () => {
      if (this.io) this.io.disconnect();
      if (this.scroller) this.scroller.scrollTop = 0;
      const base = Object.assign({ leaving: false, picked: false, touched: false, ripple: null, showCalc: false, scrolled: false, phase: 0, seen: {}, armed: false, hookHit: -1 }, patch || {});
      if (n === this.state.step) {
        this.setState(Object.assign(base, { step: 0, prevStep: n }));
        this.later(() => { this.setState({ step: n }); this.onEnter(n); }, 40);
      } else {
        this.setState(Object.assign(base, { step: n, prevStep: n }));
        this.onEnter(n);
      }
    };
    this.later(swap, this.rm ? 0 : 300);
  }

  onEnter(n) {
    const at = n === 1 ? 420 : n === 8 ? 320 : 260;
    this.later(() => this.setState({ armed: true }), this.rm ? 0 : at);
    if (n === 7) this.runCalc();
  }

  runCalc() {
    const f = this.rm ? 0 : 1;
    this.later(() => this.setState({ phase: 1 }), 1100 * f);
    this.later(() => this.setState({ phase: 2 }), 2000 * f);
    this.later(() => this.setState({ phase: 3 }), 2800 * f);
    this.later(() => this.setState({ phase: 4 }), 2960 * f);
    this.later(() => this.go(8), this.rm ? 1200 : 4500);
  }

  rippleFrom(e, key) {
    const el = e && e.currentTarget;
    if (!el || !el.getBoundingClientRect) return null;
    const r = el.getBoundingClientRect();
    const w = el.offsetWidth || r.width || 1, h = el.offsetHeight || r.height || 1;
    const k = r.width ? r.width / w : 1;
    let x = w / 2, y = h / 2;
    if (e.detail !== 0 && (e.clientX || e.clientY)) { x = (e.clientX - r.left) / k; y = (e.clientY - r.top) / k; }
    x = Math.max(0, Math.min(w, x)); y = Math.max(0, Math.min(h, y));
    const size = 2 * Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
    this.rip += 1;
    return { key, n: this.rip, x, y, size };
  }

  choose(group, val, e) {
    if (this.state.leaving) return;
    const rp = this.rippleFrom(e, group + ":" + val);
    if (group === "amount") {
      this.setState({ amount: val, ripple: rp, touched: true, bump: val === this.state.amount ? this.state.bump : this.state.bump + 1 });
      return;
    }
    this.setState({ [group]: val, ripple: rp, picked: true, touched: true });
    clearTimeout(this.pickT);
    const from = this.state.step;
    this.pickT = setTimeout(() => { this.pickT = null; if (this.state.step === from) this.go(from + 1); }, this.rm ? 200 : 650);
  }

  tapHook(i) { this.setState({ hookHit: i, hookN: this.state.hookN + 1 }); }

  nicheData() {
    const { NICHES, ALL } = this.constructor.K;
    const s = this.state;
    if (s.niche === "all") return ALL;
    return NICHES.find((n) => n.nom === s.niche) || NICHES[1];
  }
  sortedApps(nd) {
    const fr0 = this.state.market === "FR";
    return nd.top.slice().sort((a, b) => fr0
      ? ((b.comptesFR || 0) - (a.comptesFR || 0)) || ((b.videosSemaine || 0) - (a.videosSemaine || 0))
      : ((b.videosSemaine || 0) - (a.videosSemaine || 0)));
  }
  plan(nd) {
    const { fmtDur } = this.constructor.K;
    const s = this.state, A = s.amount, vpv = nd.vuesParVideo;
    const vMin = A / 3.5 * 1000, vMax = A / 2.5 * 1000;
    const mn = Math.max(1, Math.round(vMin / vpv / 30));
    const mx = Math.max(mn, Math.ceil(vMax / vpv / 30), 1);
    const comptes = Math.max(1, Math.ceil(mx / 3));
    // tConseil = moyenne(mini, maxi) × 20 min, arrondi à la demi-heure.
    const tmin = Math.max(30, Math.round(((mn + mx) / 2) * 20 / 30) * 30);
    const cap = Math.floor(s.time / 20);
    const manque = Math.max(0, mn - cap);
    const crea = Math.ceil(manque / 2); // hypothèse : une créatrice fait 2 vidéos par jour
    const cout = manque * 5 * 30;
    let kind;
    if (manque === 0) kind = "A";
    // « Plus de 500 € » : sans plafond ; « 100 à 500 € » : les créatrices doivent tenir dans 500 €.
    else if (s.budget === "gt500" || (s.budget === "100-500" && cout <= 500)) kind = "B";
    else kind = "C";
    const creaTxt = crea === 1 ? "une créatrice" : crea + " créatrices";
    const verdict = kind === "A" ? "Faisable avec ton temps" : kind === "B" ? "Faisable avec " + creaTxt : "Trop juste avec " + fmtDur(s.time);
    // 2e pastille : jamais plus de 10 h affichées.
    const pillTime = kind === "A" || (kind === "C" && tmin <= 600);
    return { A, vpv, vMin, vMax, mn, mx, comptes, tmin, cap, manque, crea, cout, kind, verdict, ok: kind !== "C", pillTime, perAcc: Math.max(1, Math.ceil(mx / comptes)) };
  }
  viewsTxt(a, b) {
    const { NBSP, fr } = this.constructor.K;
    if (b >= 1e6) { const f = (v) => { const m = v / 1e6; return m < 1 ? fr(m, 2) : fr(m, 1); }; return f(a) + " à " + f(b) + NBSP + "M de vues"; }
    return Math.round(a / 1000) + " à " + Math.round(b / 1000) + NBSP + "k vues";
  }

  roller(str, tpl, armed, delay) {
    const chars = Array.from(str);
    const T = Array.from(tpl || str.replace(/\d/g, "#"));
    const flat = [{ isD: false, isS: true, ch: str, cls: "kpm-sl kpm-sep", st: "" }];
    if (chars.length > T.length) return flat;
    const pad = T.length - chars.length;
    for (let i = 0; i < chars.length; i++) { if (/\d/.test(chars[i]) !== (T[pad + i] === "#")) return flat; }
    return T.map((t, i) => {
      const on = i >= pad;
      const ch = on ? chars[i - pad] : "";
      const isD = t === "#";
      const k = T.length - 1 - i;
      // Avant armement, la colonne montre déjà le bon chiffre un tour plus haut : à l'armement elle fait un tour complet.
      const d = isD && on ? Number(ch) + (armed ? 0 : 10) : 0;
      return {
        isD, isS: !isD,
        ch: isD || t === "_" ? "" : (on ? ch : t),
        cls: "kpm-sl" + (isD ? " is-d" : t === "_" ? " kpm-gap" : " kpm-sep") + (on ? "" : " is-off"),
        st: "transform: translateY(" + (-d) + "em); transition-delay: " + ((delay || 0) + k * 45) + "ms;",
      };
    });
  }

  opt(group, val, i, iBase, base) {
    const s = this.state;
    const sel = s[group] === val;
    const key = group + ":" + val;
    const rp = s.ripple && s.ripple.key === key ? s.ripple : null;
    const ii = iBase + i;
    const hd = s.touched ? 0 : ii * 55 + 80 + 560;
    return {
      sel, aria: sel ? "true" : "false",
      cls: (base || "kpm-opt") + (sel ? " is-sel" : "") + (sel && rp ? " is-hit" : ""),
      wrapStyle: "--i: " + ii + "; --hd: " + hd + "ms; --hf: " + (s.touched ? 0 : ii * 55 + 240) + "ms;",
      rA: !!rp && rp.n % 2 === 0, rB: !!rp && rp.n % 2 === 1,
      rStyle: rp ? "left: " + (rp.x - rp.size / 2).toFixed(1) + "px; top: " + (rp.y - rp.size / 2).toFixed(1) + "px; width: " + rp.size.toFixed(1) + "px; height: " + rp.size.toFixed(1) + "px;" : "",
      pick: (e) => this.choose(group, val, e),
    };
  }

  rv(k, extra) { return "kpm-rv" + (extra ? " " + extra : "") + (this.state.seen[k] ? " is-seen" : ""); }

  renderVals() {
    const { NICHES, NNBSP, NBSP, AMOUNTS, QUICK, TIMES, BUDGETS, CODES, MARKETS, RADAR_BIG, RADAR_SMALL, PARTICLES, grp, fmtDur, vuesTxt, clean, bgOf, embed, profil, cut, count, paysNom, range, plural } = this.constructor.K;
    const s = this.state;
    const pw = this.isPaywall();
    const step = s.step;
    const shown = step || s.prevStep || 1;
    const nd = this.nicheData();
    const apps = this.sortedApps(nd);
    const nTop = apps.length;
    const P = this.plan(nd);
    const v = {};
    for (let i = 1; i <= 9; i++) v["isStep" + i] = step === i;
    v.paywall = pw; v.film = !pw;
    v.scrollRef = this.scrollRef; v.rvRef = this.rvRef; v.onScroll = this.onScroll;
    v.stageCls = "kpm-stage" + (s.leaving ? " is-leaving" : "");
    v.stageStyle = "transform-origin: 50% " + Math.round(s.leaveY || 380) + "px;";
    v.headCls = "kpm-head" + (s.scrolled ? " is-scrolled" : "");
    v.dotsStyle = "transform: translate(" + (-shown * 5) + "px, " + (-shown * 8) + "px);";
    v.segs = range(6).map((i) => {
      const q = i + 1;
      let c = "kpm-seg";
      if (shown >= 7 || q < shown) c += " is-done";
      else if (q === shown) c += " is-cur";
      return { cls: c };
    });
    v.progNow = String(Math.min(6, shown));
    v.hasBack = (shown >= 2 && shown <= 6) || shown === 9;
    v.backLabel = shown === 9 ? "Retour au plan" : "Question précédente";
    v.back = this.back; v.restart = this.restart; v.next = this.next;
    v.groupCls = s.picked ? "has-picked" : "";

    // 1 — Montant
    const ai = Math.max(0, AMOUNTS.indexOf(s.amount));
    v.amtIdx = ai;
    v.rangeStyle = "--p: " + (ai / 10) + ";";
    v.rangeCls = "kpm-range" + (s.bump ? (s.bump % 2 ? " kpm-tA" : " kpm-tB") : "");
    v.numCls = "kpm-roll kpm-num" + (s.bump ? (s.bump % 2 ? " kpm-bA" : " kpm-bB") : "");
    v.numStyle = "--k: " + (s.amount >= 10000 ? "var(--kbig)" : 1) + ";";
    v.amtRoll = this.roller(grp(s.amount), "##_###", s.armed, 0);
    v.dayRoll = this.roller(grp(Math.round(s.amount / 30)), "#_###", s.armed, 160);
    v.amtText = grp(s.amount) + " € par mois";
    v.amtSr = grp(s.amount) + " €";
    v.daySr = grp(Math.round(s.amount / 30)) + " €";
    v.onAmount = this.onAmount;
    v.quick = QUICK.map((a, i) => Object.assign(this.opt("amount", a, i, 5), { label: grp(a) + NBSP + "€" }));
    v.toStep2 = () => this.go(2);

    // 2 — Niche
    v.nicheItems = NICHES.map((n, i) => {
      const o = this.opt("niche", n.nom, i, 2, "kpm-opt kpm-tile");
      o.nom = n.nom;
      o.logos = n.top.slice(0, 3).map((a, j) => ({ bg: bgOf(a.logo), st: "--j: " + j + "; --r: " + [-10, 0, 10][j] + "deg; z-index: " + (3 - j) + ";" }));
      // 3 colonnes : une dernière tuile seule sur sa ligne prendrait toute la largeur.
      if (i === NICHES.length - 1 && NICHES.length % 3 === 1) o.wrapStyle += " grid-column: 1 / -1;";
      return o;
    });
    v.nsp = this.opt("niche", "all", NICHES.length, 2, "kpm-nsp");

    // 3 — Temps
    v.timeItems = TIMES.map((t, i) => {
      const o = this.opt("time", t.v, i, 2, "kpm-opt kpm-tcard");
      o.label = t.label;
      o.sub = plural(t.vids, "vidéo", "vidéos") + " par jour";
      o.sr = t.label + ", " + o.sub;
      o.subStyle = "--n: " + t.vids + ";";
      o.thumbs = range(t.vids).map((j) => ({ st: "--j: " + j + ";" }));
      return o;
    });

    // 4 — Budget
    v.budgetItems = BUDGETS.map((b, i) => {
      const o = this.opt("budget", b.v, i, 2, "kpm-opt kpm-bcard");
      o.label = b.label;
      o.coins = range(b.coins).map((j) => ({ cls: "kpm-coin" + (j === b.coins - 1 ? " is-top" : ""), st: "--j: " + j + "; z-index: " + (j + 1) + ";" }));
      return o;
    });

    // 5 — Code / 6 — Marché
    CODES.forEach((c, i) => { v["cd" + i] = this.opt("code", c, i, 2, "kpm-opt kpm-crow"); });
    MARKETS.forEach((m, i) => { v["mk" + i] = this.opt("market", m, i, 2, "kpm-opt kpm-mcard"); });

    // 7 — Calcul
    const ph = s.phase || 0;
    const cnt = ph >= 4 ? nTop : ph >= 1 ? nd.apps : 653;
    v.calcRollA = this.roller(String(cnt), "###", true, 0);
    v.calcRollB = this.roller(String(ph >= 4 ? nTop : nd.apps), "###", true, 0);
    v.lineACls = "kpm-lineA kpm-c7f" + (ph >= 3 ? " is-out" : "");
    v.phase3 = ph >= 3;
    v.burst = ph >= 4;
    v.foundWord = nTop > 1 ? "apps trouvées" : "app trouvée";
    v.foundSr = String(nTop);
    v.ck0 = "kpm-ckli" + (ph >= 1 ? " is-done" : "");
    v.ck1 = "kpm-ckli" + (ph >= 2 ? " is-done" : "");
    v.ck2 = "kpm-ckli" + (ph >= 3 ? " is-done" : "");
    v.calcPct = String(Math.min(100, ph * 25));
    v.radarBig = apps.slice(0, 3).map((a, i) => {
      const b = RADAR_BIG[i];
      return {
        bg: bgOf(a.logo),
        st: "left: " + b.l + "%; top: " + b.t + "%; width: 40px; height: 40px; margin: -20px 0 0 -20px; animation-delay: " + b.d + "s;",
        pingSt: "animation-delay: " + (b.d + 0.2) + "s;",
        ping2St: "animation-delay: " + (b.d + 1.2) + "s;",
        imgCls: "kpm-rbig kpm-img" + (ph >= 4 ? " is-found" : ""),
      };
    });
    const bigSet = {};
    apps.forEach((a) => { bigSet[a.logo] = 1; });
    v.radarSmall = NICHES.filter((n) => nd.all || n.nom !== nd.nom).map((n) => n.top[0] && n.top[0].logo).filter((l) => l && !bigSet[l]).slice(0, 6)
      .map((l, i) => { const b = RADAR_SMALL[i]; return { bg: bgOf(l), st: "left: " + b.l + "%; top: " + b.t + "%; width: 22px; height: 22px; margin: -11px 0 0 -11px; animation-delay: " + b.d + "s;" }; });
    v.particles = PARTICLES;

    // 8 — Résultat
    v.resRollMin = this.roller(String(P.mn), "###", s.armed, 0);
    v.resRollMax = this.roller(String(P.mx), "###", s.armed, 90);
    v.resRange = P.mn !== P.mx;
    v.resSr = v.resRange ? P.mn + " à " + P.mx : String(P.mn);
    v.resUnit = (P.mx > 1 ? "vidéos" : "vidéo") + " par jour";
    const nd8 = String(P.mn).length + (v.resRange ? String(P.mx).length : 0);
    const fs8 = nd8 <= 2 ? 80 : nd8 === 3 ? 76 : nd8 === 4 ? 66 : nd8 === 5 ? 56 : 50;
    v.resNumStyle = "font-size: " + fs8 + "px;";
    v.resAStyle = "font-size: " + Math.round(fs8 * 0.45) + "px; margin: " + Math.round(fs8 * 0.26) + "px " + Math.round(fs8 * 0.15) + "px 0 " + Math.round(fs8 * 0.1) + "px;";
    v.comptesTxt = plural(P.comptes, "compte", "comptes");
    // 2e pastille : A -> temps conseillé ; B -> coût des créatrices ; C -> temps conseillé (≤ 10 h) sinon nombre de créatrices.
    v.pill2Cost = P.kind === "B";
    v.pill2Time = P.pillTime; v.pill2Crea = !P.pillTime && !v.pill2Cost;
    v.pill2Txt = v.pill2Cost ? grp(P.cout) + NNBSP + "€ par mois" : P.pillTime ? fmtDur(P.tmin) + " par jour" : plural(P.crea, "créatrice", "créatrices");
    v.verdict = P.verdict; v.vOk = P.ok; v.vWarn = !P.ok;
    v.calcCls = "kpm-acc" + (s.showCalc ? " is-open" : "");
    v.calcAria = s.showCalc ? "true" : "false";
    v.toggleCalc = this.toggleCalc;
    v.calc1 = grp(P.A) + NBSP + "€ ÷ 2,50 à 3,50" + NBSP + "€ pour 1" + NNBSP + "000" + NBSP + "vues";
    v.calc2 = "= " + this.viewsTxt(P.vMin, P.vMax) + " par mois";
    v.calc3 = "÷ " + grp(P.vpv) + " vues par vidéo ÷ 30 jours";
    v.calc4 = "= " + (v.resRange ? P.mn + " à " + P.mx : String(P.mn)) + " " + v.resUnit;
    v.calcCrea = P.kind !== "A";
    v.calc5 = "Créatrices : " + P.manque + " × 5" + NBSP + "€ × 30 = " + grp(P.cout) + NBSP + "€ par mois";
    v.nApps = nTop;
    const a0 = apps[0];
    const best0 = a0.meilleure ? embed(a0.meilleure.video) : "";
    v.f = {
      bg: bgOf(a0.logo), nom: a0.nom, quoi: a0.quoi || "",
      hasBest: !!a0.meilleure,
      // Avec sa vidéo, le chiffre l'ouvre (feuille du bas) ; sans, il reste un simple chiffre.
      bestVid: !!best0, bestTxt: !!a0.meilleure && !best0, play: this.openSheet,
      bestSr: a0.meilleure ? String(a0.meilleure.vues) : "",
      best: a0.meilleure ? this.roller(String(a0.meilleure.vues).replace(/\s/g, NBSP), null, s.armed, 650) : [],
      comptesTxt: plural(a0.comptes, "compte", "comptes"),
      open: () => this.go(9, { app: 0 }),
    };
    v.others = apps.slice(1).map((a, i) => ({
      bg: bgOf(a.logo), nom: a.nom, quoi: a.quoi || "",
      line: a.meilleure ? vuesTxt(a.meilleure.vues) + " sur sa meilleure vidéo" : (a.quoi || ""),
      aria: "Voir la stratégie de " + a.nom,
      open: () => this.go(9, { app: i + 1 }),
      rvKey: "s8-row" + i,
      rowCls: "kpm-row " + this.rv("s8-row" + i, "kpm-rv3"),
      rowStyle: "--d: " + (i * 90) + "ms;",
    }));
    v.lockedGrid = "grid-template-columns: repeat(" + Math.max(1, Math.min(2, nTop - 1)) + ", minmax(0, 1fr));";
    v.rvLocked = this.rv("s8-locked", "kpm-rv3");
    v.rvBand = this.rv("s8-band");
    const moreN = Math.max(0, nd.apps - nTop);
    v.moreTxt = "+ " + grp(moreN) + " autres apps";
    v.moreFilm = v.moreTxt + (nd.all ? " sur le Radar" : " dans " + nd.nom);
    v.openPaywall = this.openPaywall;
    v.showPaywall = pw && s.paywallOpen;
    v.pwCls = "kpm-pw" + (s.pwOut ? " is-out" : "");
    v.closePaywall = this.closePaywall;
    v.showSheet = !!(s.sheet && best0);
    v.sheetCls = "kpm-sh" + (s.shOut ? " is-out" : "");
    v.closeSheet = this.closeSheet; v.onSheetKey = this.onSheetKey; v.sheetX = this.sheetX;
    const pc0 = a0.meilleure ? profil(a0.meilleure.compte) : "";
    v.sh = {
      titre: "Sa meilleure vidéo",
      embed: best0,
      title: a0.meilleure ? "Vidéo TikTok de @" + a0.meilleure.compte + ", la plus vue pour " + a0.nom : "",
      vues: a0.meilleure ? vuesTxt(a0.meilleure.vues) : "",
      compte: a0.meilleure ? "@" + a0.meilleure.compte : "",
      profil: pc0, hasProfil: !!pc0,
      profilAria: a0.meilleure ? "Profil TikTok de @" + a0.meilleure.compte : "",
    };

    // 9 — Stratégie
    // Version normale : seule l'app en clair a sa stratégie ; les vidéos et les comptes des autres ne sont jamais chargés.
    const ix = pw ? 0 : Math.min(Math.max(0, s.app || 0), nTop - 1);
    const a = apps[ix];
    const hooksRaw = (a.accroches || []).map((h) => Object.assign({}, h, { texte: clean(h.texte) })).filter((h) => h.texte);
    const hasHooks = hooksRaw.length > 0;
    const rots = [-2, 1, 2.5];
    // Une carte du carrousel : la vraie vidéo (lecteur TikTok, droite, 224 px de large) ou, sans vidéo, la carte texte.
    const card = (i, vid, rot) => ({
      isVid: !!vid, isCard: !vid, embed: vid,
      st: "--k: " + i + "; --rot: " + (vid ? 0 : rot) + "deg; --kx: " + (vid ? 236 : 162) + "px; z-index: " + (3 - i) + "; width: " + (vid ? 224 : 150) + "px;",
      cls: "kpm-hook" + (s.hookHit === i ? (s.hookN % 2 ? " kpm-hA" : " kpm-hB") : ""),
      tap: () => this.tapHook(i),
    });
    const who = (c) => { const u = profil(c); return { compte: "@" + c, profil: u, hasProfil: !!u, noProfil: !u, profilAria: "Profil TikTok de @" + c }; };
    let hooks = hooksRaw.slice(0, 3).map((h, i) => {
      const vid = embed(h.video);
      const L = h.texte.length;
      const fs = L <= 30 ? 19 : L <= 55 ? 17 : L <= 80 ? 15 : 14;
      return Object.assign(card(i, vid, rots[i]), who(h.compte), {
        isHook: true, isBest: false, hasCap: true, texte: vid ? cut(h.texte) : h.texte, big: "",
        title: "Vidéo TikTok de @" + h.compte + " : " + cut(h.texte),
        textSt: "font-size: " + fs + "px;",
        vues: vuesTxt(h.vuesTxt),
      });
    });
    if (!hasHooks && a.meilleure) {
      const vid = embed(a.meilleure.video);
      hooks = [Object.assign(card(0, vid, -2), who(a.meilleure.compte), {
        isHook: false, isBest: true, hasCap: false, texte: "", big: String(a.meilleure.vues).replace(/\s/g, NBSP), textSt: "",
        title: "Vidéo TikTok de @" + a.meilleure.compte + ", la plus vue pour " + a.nom,
        vues: vid ? vuesTxt(a.meilleure.vues) : "",
      })];
    }
    // Ses vrais comptes (6 au plus) : pseudo, abonnés, vues médianes par vidéo, pays.
    const reseau = (a.reseau || []).filter((r) => r && profil(r.pseudo)).slice(0, 6).map((r, j) => {
      const m = String(r.pseudo).match(/[A-Za-z0-9]/);
      const abo = count(r.abonnes, "abonné", "abonnés", "d’abonnés");
      const vues = count(r.vuesMed, "vue par vidéo", "vues par vidéo", "de vues par vidéo");
      const pays = paysNom(r.pays);
      const stats = [abo, vues].filter(Boolean).join(NBSP + "· ");
      return {
        handle: "@" + r.pseudo, href: profil(r.pseudo), ini: m ? m[0].toUpperCase() : "@", pays, stats,
        aria: ["@" + r.pseudo, abo, vues, pays].filter(Boolean).join(", ") + " : ouvrir son profil TikTok",
        st: "--j: " + j + ";",
      };
    });
    const codeTxt = s.code === "oui" ? "en code" : s.code === "outils" ? "avec des outils sans code" : "sans coder";
    const pub = Math.max(1, P.perAcc - 1);
    const pMinS = a.prix ? String(a.prix.min) : "", pMaxS = a.prix ? String(a.prix.max) : "";
    const pLen = pMinS.length + pMaxS.length;
    const pfs = pLen <= 9 ? 44 : pLen <= 10 ? 40 : 36;
    const priceSeen = !!s.seen["s9-price"];
    v.s9 = {
      bg: bgOf(a.logo), nom: a.nom, alt: "Logo de " + a.nom,
      sub: [a.quoi, a.note && a.note.note ? a.note.note + " sur l’App Store" : ""].filter(Boolean).join(NBSP + "·" + NBSP),
      hasHooks: hooks.length > 0,
      hooksTitle: hasHooks ? "Les accroches qui marchent" : "Sa meilleure vidéo",
      hooks,
      hasRes: reseau.length > 0, reseau,
      planA: "Ouvre " + plural(P.comptes, "compte", "comptes") + " comme eux",
      planB: plural(P.perAcc, "vidéo", "vidéos") + " par jour" + (P.comptes > 1 ? " chacun" : ""),
      appComptes: grp(a.comptes),
      weeks: [
        { n: "1", k: "Construire", t: "Ta version de l’app, " + codeTxt },
        { n: "2", k: "Chauffer", t: plural(P.comptes, "compte", "comptes") + " : regarde et like la niche" },
        { n: "3", k: "Publier", t: plural(pub, "vidéo", "vidéos") + " par jour et par compte" },
        { n: "4", k: "Doubler", t: "Ce qui marche, à " + plural(P.perAcc, "vidéo", "vidéos") + " par jour" },
      ].map((w, j) => Object.assign(w, { st: "--j: " + j + ";" })),
      hasPrice: !!a.prix,
      priceSr: a.prix ? pMinS + " à " + pMaxS + " €" : "",
      priceStyle: "font-size: " + pfs + "px;",
      priceAStyle: "font-size: " + Math.round(pfs * 0.5) + "px; margin: " + Math.round(pfs * 0.28) + "px " + Math.round(pfs * 0.2) + "px 0 " + Math.round(pfs * 0.16) + "px;",
      pMin: a.prix ? this.roller(pMinS, null, priceSeen, 250) : [],
      pMax: a.prix ? this.roller(pMaxS, null, priceSeen, 420) : [],
      lockN: grp(Math.max(0, nd.apps - 1)) + " autres apps",
      lockTitle: apps.length > 1 ? "Copie " + apps[ix === 0 ? 1 : 0].nom : "Copie",
      lockLogos: apps.filter((x, j) => j !== ix).slice(0, 2).map((x, j) => ({ st: bgOf(x.logo) + " margin-left: " + (j ? -12 : 0) + "px;" })),
    };
    v.rvHooks = this.rv("s9-hooks");
    v.rvAcc = this.rv("s9-acc");
    v.rvWeeks = this.rv("s9-weeks");
    v.rvPrice = this.rv("s9-price");
    v.rvEnd = this.rv("s9-end");
    v.nextApp = this.nextApp;
    v.toPlan = this.toPlan;
    return v;
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw kpm-root", "data-theme": "light", "style": "--kpm-rest: inset 0 0 0 1px #E6E7EC, 0 1px 2px rgba(16,24,40,0.04), 0 10px 28px rgba(16,24,40,0.06); --kpm-sel: inset 0 0 0 2px #0B6FE0, 0 1px 2px rgba(16,24,40,0.04), 0 16px 38px rgba(11,111,224,0.22); position: relative; width: 100%; height: 100vh; height: 100svh; box-sizing: border-box; overflow: hidden; background: #F6F7F9; color: #0E0F12; font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; overflow: hidden; pointer-events: none;" },
          $h("span", { "class": "kpm-blob kpm-b1" }),
          $h("span", { "class": "kpm-blob kpm-b2" }),
          $h("span", { "class": "kpm-blob kpm-b3" }),
          $h("span", { "class": "kpm-dots", "style": $v.dotsStyle })
        ),
        $h("div", { "class": "kpm-scroll", "ref": $v.scrollRef, "onscroll": $v.onScroll, "style": "position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto;" },
          $h("div", { "class": $v.stageCls, "style": $v.stageStyle },
            ($v.isStep1) ? [
              $h("main", { "class": "kpm-q" },
                $h("h1", { "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Combien"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "tu"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "veux"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 3;" },
                      "gagner"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 4;" },
                      "par"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 5;" },
                      "mois ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "style": "position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-halo", "style": "position: absolute; z-index: -1; left: 50%; top: 44%; width: 440px; height: 440px; margin: -220px 0 0 -220px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.07) 52%, rgba(11,111,224,0) 100%); pointer-events: none;" }),
                    $h("output", { "for": "montant", "class": "kpm-in kpm-amt", "style": "--i: 2; display: block; padding-left: 0.06em; font-family: var(--font-display); font-weight: 800; letter-spacing: -0.06em; color: #0E0F12;" },
                      $h("span", { "class": "visually-hidden" },
                        $t($v.amtSr)
                      ),
                      $h("span", { "aria-hidden": "true", "class": $v.numCls, "style": $v.numStyle },
                        ($l($v.amtRoll)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ]),
                        $h("span", { "class": "kpm-sl kpm-gap" }),
                        $h("span", { "style": "display: block; background: linear-gradient(180deg, #4C9AFF 10%, #0B6FE0 90%); -webkit-background-clip: text; background-clip: text; color: transparent; padding: 0 .12em; margin: 0 -.12em;" },
                          "€"
                        )
                      )
                    ),
                    $h("span", { "class": "kpm-in kpm-day", "style": "--i: 3; display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: 999px; background: #FFFFFF; box-shadow: var(--kpm-rest); font-size: 15px; color: #4A4F57; white-space: nowrap;" },
                      $h("span", { "class": "visually-hidden" },
                        $t($v.daySr)
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kpm-roll", "style": "font-weight: 600; color: #0E0F12;" },
                        ($l($v.dayRoll)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ]),
                        $h("span", { "class": "kpm-sl kpm-sep" },
                          " €"
                        )
                      ),
                      $h("span", { "style": "margin-left: 5px; line-height: 1;" },
                        "par jour"
                      )
                    )
                  ),
                  $h("div", { "class": "kpm-in kpm-slide", "style": "--i: 4; width: 100%; padding: 0 4px; box-sizing: border-box;" },
                    $h("label", { "for": "montant", "class": "visually-hidden" },
                      "Ton objectif par mois, de 500 € à 30 000 €"
                    ),
                    $h("input", { "id": "montant", "class": $v.rangeCls, "type": "range", "min": "0", "max": "10", "step": "1", "value": $v.amtIdx, "aria-valuetext": $v.amtText, "onInput": $v.onAmount, "onChange": $v.onAmount, "style": $v.rangeStyle })
                  ),
                  $h("div", { "role": "radiogroup", "aria-label": "Montants rapides", "class": "kpm-quick", "style": "width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));" },
                    ($l($v.quick)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick, "style": "display: flex; align-items: center; justify-content: center; gap: 10px; padding: 0 16px; border-radius: 999px; font-size: 17px; font-weight: 600; color: #0E0F12; font-variant-numeric: tabular-nums; white-space: nowrap;" },
                          (o?.sel) ? [
                            $h("span", { "aria-hidden": "true", "class": "kpm-tick kpm-tick-in" },
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          ] : null,
                          $h("span", { "style": "position: relative;" },
                            $t(o?.label)
                          ),
                          (o?.rA) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null,
                          (o?.rB) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null
                        )
                      )
                    ])
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 9;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.toStep2 },
                      "Continuer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep2) ? [
              $h("main", { "class": `kpm-q ${$t($v.groupCls)}` },
                $h("h1", { "id": "q-niche", "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Quelle"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "niche"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "te"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 3;" },
                      "parle ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-niche", "class": "kpm-ngrid" },
                    ($l($v.nicheItems)).map((o) => [
                      $h("div", { "class": "kpm-in nb", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick },
                          $h("span", { "aria-hidden": "true", "style": "position: relative; display: flex;" },
                            ($l(o?.logos)).map((l) => [
                              $h("span", { "class": "kpm-lg", "style": l?.st },
                                $h("span", { "class": "kpm-logo kpm-img", "style": l?.bg })
                              )
                            ])
                          ),
                          $h("span", { "class": "kpm-tname" },
                            $t(o?.nom)
                          ),
                          (o?.sel) ? [
                            $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          ] : null,
                          (o?.rA) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null,
                          (o?.rB) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null
                        )
                      )
                    ])
                  ),
                  $h("div", { "class": "kpm-in kpm-nspw", "style": $v.nsp?.wrapStyle },
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.nsp?.aria, "class": $v.nsp?.cls, "onClick": $v.nsp?.pick },
                      ($v.nsp?.sel) ? [
                        $h("span", { "aria-hidden": "true", "class": "kpm-tick kpm-tick-in" },
                          $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      ] : null,
                      $h("span", { "class": "kpm-ul", "style": "position: relative;" },
                        "Je ne sais pas encore"
                      ),
                      ($v.nsp?.rA) ? [
                        $h("span", { "class": "kpm-ripple", "style": $v.nsp?.rStyle })
                      ] : null,
                      ($v.nsp?.rB) ? [
                        $h("span", { "class": "kpm-ripple", "style": $v.nsp?.rStyle })
                      ] : null
                    )
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 19;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.next },
                      "Continuer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep3) ? [
              $h("main", { "class": `kpm-q ${$t($v.groupCls)}` },
                $h("h1", { "id": "q-temps", "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Combien"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "de"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "temps"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 3;" },
                      "par"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 4;" },
                      "jour ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-temps", "class": "kpm-g2" },
                    ($l($v.timeItems)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "aria-label": o?.sr, "class": o?.cls, "onClick": o?.pick },
                          $h("span", { "class": "kpm-tlbl" },
                            $t(o?.label)
                          ),
                          $h("span", { "aria-hidden": "true", "style": "position: relative; margin-top: auto; display: flex; gap: 3px;" },
                            ($l(o?.thumbs)).map((t) => [
                              $h("span", { "class": "kpm-v" },
                                $h("span", { "class": "kpm-vf", "style": t?.st })
                              )
                            ])
                          ),
                          $h("span", { "aria-hidden": "true", "class": "kpm-tsub" },
                            (o?.sel) ? [
                              $h("span", { "class": "kpm-sub", "style": `${$t(o?.subStyle)} font-size: 15px; line-height: 18px; font-weight: 600; color: #0A63C9; white-space: nowrap;` },
                                $t(o?.sub)
                              )
                            ] : null
                          ),
                          (o?.sel) ? [
                            $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          ] : null,
                          (o?.rA) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null,
                          (o?.rB) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null
                        )
                      )
                    ])
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 7;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.next },
                      "Continuer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep4) ? [
              $h("main", { "class": `kpm-q ${$t($v.groupCls)}` },
                $h("h1", { "id": "q-budget", "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Ton"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "budget"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "par"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 3;" },
                      "mois ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-budget", "class": "kpm-g2" },
                    ($l($v.budgetItems)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick },
                          $h("span", { "aria-hidden": "true", "class": "kpm-coins" },
                            ($l(o?.coins)).map((c) => [
                              $h("svg", { "class": c?.cls, "style": c?.st, "width": "88", "height": "88", "viewBox": "0 0 56 56", "aria-hidden": "true" },
                                $h("g", { "fill": "#FFFFFF", "stroke": "currentColor", "stroke-width": "1.15", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                  $h("path", { "d": "M10 41V48A18 5.5 0 0 0 46 48V41" }),
                                  $h("ellipse", { "cx": "28", "cy": "41", "rx": "18", "ry": "5.5" }),
                                  $h("ellipse", { "class": "kpm-face", "cx": "28", "cy": "41", "rx": "11", "ry": "3.2" })
                                )
                              )
                            ])
                          ),
                          $h("span", { "class": "kpm-blbl" },
                            $t(o?.label)
                          ),
                          (o?.sel) ? [
                            $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          ] : null,
                          (o?.rA) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null,
                          (o?.rB) ? [
                            $h("span", { "class": "kpm-ripple", "style": o?.rStyle })
                          ] : null
                        )
                      )
                    ])
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 7;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.next },
                      "Continuer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep5) ? [
              $h("main", { "class": `kpm-q ${$t($v.groupCls)}` },
                $h("h1", { "id": "q-code", "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Tu"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "sais"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "coder ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-code", "class": "kpm-clist" },
                    $h("div", { "class": "kpm-in", "style": $v.cd0?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd0?.aria, "class": $v.cd0?.cls, "onClick": $v.cd0?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-plate" },
                          $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("g", { "class": "kpm-draw", "fill": "none", "stroke": "currentColor", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("path", { "d": "M5.4 3.6a4.2 4.2 0 0 1 6 0" }),
                              $h("g", { "transform": "translate(1.2 2.6) scale(0.9)", "stroke-width": "1.33" },
                                $h("path", { "d": "M22 14a8 8 0 0 1-8 8" }),
                                $h("path", { "d": "M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }),
                                $h("path", { "d": "M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" }),
                                $h("path", { "d": "M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" }),
                                $h("path", { "d": "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" })
                              )
                            )
                          )
                        ),
                        $h("span", { "class": "kpm-clbl" },
                          "Pas du tout"
                        ),
                        ($v.cd0?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick", "style": "top: 50%; right: 18px; margin-top: -11px;" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.cd0?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd0?.rStyle })
                        ] : null,
                        ($v.cd0?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd0?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.cd1?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd1?.aria, "class": $v.cd1?.cls, "onClick": $v.cd1?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-plate" },
                          $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("g", { "class": "kpm-draw", "fill": "none", "stroke": "currentColor", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("rect", { "x": "14", "y": "3", "width": "7", "height": "7", "rx": "1" }),
                              $h("path", { "d": "M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" })
                            )
                          )
                        ),
                        $h("span", { "class": "kpm-clbl" },
                          "Avec des outils sans code"
                        ),
                        ($v.cd1?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick", "style": "top: 50%; right: 18px; margin-top: -11px;" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.cd1?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd1?.rStyle })
                        ] : null,
                        ($v.cd1?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd1?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.cd2?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd2?.aria, "class": $v.cd2?.cls, "onClick": $v.cd2?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-plate" },
                          $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("g", { "class": "kpm-draw", "fill": "none", "stroke": "currentColor", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("path", { "d": "M18 16l4-4-4-4" }),
                              $h("path", { "d": "M6 8l-4 4 4 4" }),
                              $h("path", { "d": "M14.5 4l-5 16" })
                            )
                          )
                        ),
                        $h("span", { "class": "kpm-clbl" },
                          "Oui, je code"
                        ),
                        ($v.cd2?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick", "style": "top: 50%; right: 18px; margin-top: -11px;" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.cd2?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd2?.rStyle })
                        ] : null,
                        ($v.cd2?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.cd2?.rStyle })
                        ] : null
                      )
                    )
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 6;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.next },
                      "Continuer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep6) ? [
              $h("main", { "class": `kpm-q ${$t($v.groupCls)}` },
                $h("h1", { "id": "q-marche", "class": "kpm-qh" },
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 0;" },
                      "Où"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 1;" },
                      "tu"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 2;" },
                      "veux"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kpm-w" },
                    $h("span", { "style": "--w: 3;" },
                      "lancer ?"
                    )
                  )
                ),
                $h("div", { "class": "kpm-qm" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-marche", "class": "kpm-g2" },
                    $h("div", { "class": "kpm-in", "style": $v.mk0?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk0?.aria, "class": $v.mk0?.cls, "onClick": $v.mk0?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#FFFFFF" }),
                            $h("rect", { "width": "13.4", "height": "40", "fill": "#0055A4" }),
                            $h("rect", { "x": "26.6", "width": "13.4", "height": "40", "fill": "#EF4135" })
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "France"
                        ),
                        ($v.mk0?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk0?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk0?.rStyle })
                        ] : null,
                        ($v.mk0?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk0?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.mk1?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk1?.aria, "class": $v.mk1?.cls, "onClick": $v.mk1?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#FFFFFF" }),
                            $h("rect", { "y": "0", "width": "40", "height": "5.72", "fill": "#B22234" }),
                            $h("rect", { "y": "11.43", "width": "40", "height": "5.72", "fill": "#B22234" }),
                            $h("rect", { "y": "22.86", "width": "40", "height": "5.72", "fill": "#B22234" }),
                            $h("rect", { "y": "34.29", "width": "40", "height": "5.72", "fill": "#B22234" }),
                            $h("rect", { "width": "21", "height": "22.86", "fill": "#3C3B6E" })
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "États-Unis"
                        ),
                        ($v.mk1?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk1?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk1?.rStyle })
                        ] : null,
                        ($v.mk1?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk1?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.mk2?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk2?.aria, "class": $v.mk2?.cls, "onClick": $v.mk2?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#012169" }),
                            $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#FFFFFF", "stroke-width": "8" }),
                            $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#C8102E", "stroke-width": "2.6" }),
                            $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#FFFFFF", "stroke-width": "11" }),
                            $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#C8102E", "stroke-width": "6" })
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "Royaume-Uni"
                        ),
                        ($v.mk2?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk2?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk2?.rStyle })
                        ] : null,
                        ($v.mk2?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk2?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.mk3?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk3?.aria, "class": $v.mk3?.cls, "onClick": $v.mk3?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#F1BF00" }),
                            $h("rect", { "width": "40", "height": "10", "fill": "#AA151B" }),
                            $h("rect", { "y": "30", "width": "40", "height": "10", "fill": "#AA151B" })
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "Espagne"
                        ),
                        ($v.mk3?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk3?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk3?.rStyle })
                        ] : null,
                        ($v.mk3?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk3?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.mk4?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk4?.aria, "class": $v.mk4?.cls, "onClick": $v.mk4?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#009C3B" }),
                            $h("path", { "d": "M20 6L36 20L20 34L4 20Z", "fill": "#FFDF00" }),
                            $h("circle", { "cx": "20", "cy": "20", "r": "7.5", "fill": "#002776" })
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "Brésil"
                        ),
                        ($v.mk4?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk4?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk4?.rStyle })
                        ] : null,
                        ($v.mk4?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk4?.rStyle })
                        ] : null
                      )
                    ),
                    $h("div", { "class": "kpm-in", "style": $v.mk5?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk5?.aria, "class": $v.mk5?.cls, "onClick": $v.mk5?.pick },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag", "style": "background: #EAF2FF; display: grid; place-items: center;" },
                          $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 26px; height: 26px;" },
                            $h("g", { "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("circle", { "cx": "12", "cy": "12", "r": "9.5" }),
                              $h("path", { "d": "M12 2.5a13.5 13.5 0 0 0 0 19a13.5 13.5 0 0 0 0-19" }),
                              $h("path", { "d": "M2.5 12h19" })
                            )
                          )
                        ),
                        $h("span", { "class": "kpm-mlbl" },
                          "Partout"
                        ),
                        ($v.mk5?.sel) ? [
                          $h("span", { "aria-hidden": "true", "class": "kpm-tick" },
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        ] : null,
                        ($v.mk5?.rA) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk5?.rStyle })
                        ] : null,
                        ($v.mk5?.rB) ? [
                          $h("span", { "class": "kpm-ripple", "style": $v.mk5?.rStyle })
                        ] : null
                      )
                    )
                  )
                ),
                $h("div", { "class": "kpm-in kpm-qb", "style": "--i: 9;" },
                  $h("span", { "class": "kpm-cta" },
                    $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.next },
                      "Voir mon plan",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              )
            ] : null,
            ($v.isStep7) ? [
              $h("main", { "class": "kpm-q kpm-q7" },
                $h("div", { "aria-hidden": "true", "class": "kpm-in kpm-radar", "style": "--i: 0;" },
                  $h("div", { "class": "kpm-halo", "style": "position: absolute; left: -36.7%; top: -36.7%; width: 173.4%; height: 173.4%; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.06) 55%, rgba(11,111,224,0) 100%);" }),
                  $h("div", { "style": "position: absolute; inset: 0; border-radius: 50%; overflow: hidden; background: radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FBFCFE 62%, #F2F6FD 100%); box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 20px 50px rgba(16,24,40,0.10), inset 0 0 0 1px #E6E6EA;" },
                    $h("span", { "class": "kpm-sweep", "style": "position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, rgba(11,111,224,0) 0deg, rgba(11,111,224,0) 250deg, rgba(11,111,224,0.07) 310deg, rgba(11,111,224,0.22) 356deg, rgba(11,111,224,0.85) 359.4deg, rgba(11,111,224,0) 360deg);" }),
                    $h("span", { "style": "position: absolute; left: 12.5%; top: 12.5%; width: 75%; height: 75%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                    $h("span", { "style": "position: absolute; left: 25%; top: 25%; width: 50%; height: 50%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                    $h("span", { "style": "position: absolute; left: 37.5%; top: 37.5%; width: 25%; height: 25%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                    $h("span", { "style": "position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #EEF0F4;" }),
                    $h("span", { "style": "position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #EEF0F4;" }),
                    $h("span", { "style": "position: absolute; left: 20%; top: 45%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 55%; top: 12%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 78%; top: 66%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 48%; top: 72%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 30%; top: 18%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 84%; top: 80%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 60%; top: 92%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" }),
                    $h("span", { "style": "position: absolute; left: 10%; top: 62%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: #C9CFD8;" })
                  ),
                  ($v.burst) ? [
                    $h("span", { "class": "kpm-flash" }),
                    $h("span", { "class": "kpm-wave" }),
                    $h("span", { "class": "kpm-wave kpm-wave2" })
                  ] : null,
                  ($l($v.radarSmall)).map((r) => [
                    $h("span", { "class": "kpm-rpop", "style": r?.st },
                      $h("span", { "class": "kpm-img", "style": `${$t(r?.bg)} display: block; width: 22px; height: 22px; border-radius: 6px; opacity: 0.42;` })
                    )
                  ]),
                  ($l($v.radarBig)).map((r) => [
                    $h("span", { "class": "kpm-rpop", "style": r?.st },
                      $h("span", { "class": "kpm-ping", "style": r?.pingSt }),
                      $h("span", { "class": "kpm-ping kpm-ping2", "style": r?.ping2St }),
                      $h("span", { "class": r?.imgCls, "style": r?.bg })
                    )
                  ]),
                  $h("span", { "class": "kpm-core", "style": "position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin: -24px 0 0 -24px; border-radius: 50%; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: 0 0 0 7px rgba(11,111,224,0.08), 0 12px 28px rgba(11,111,224,0.35), inset 0 1px 0 rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                      $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                      $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                      $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
                    )
                  ),
                  ($v.burst) ? [
                    $h("span", { "style": "position: absolute; left: 50%; top: 50%; width: 0; height: 0;" },
                      ($l($v.particles)).map((p) => [
                        $h("span", { "class": "kpm-part", "style": p?.st })
                      ])
                    )
                  ] : null
                ),
                $h("div", { "class": "kpm-in kpm-c7t", "style": "--i: 2; position: relative; width: 100%; display: grid; justify-items: center; align-items: center; text-align: center;" },
                  $h("p", { "class": $v.lineACls, "aria-hidden": "true", "style": "grid-area: 1 / 1; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.04em; color: #0E0F12;" },
                    $h("span", { "style": "display: flex; align-items: flex-start; line-height: 1;" },
                      $h("span", null,
                        "On fouille "
                      ),
                      $h("span", { "class": "kpm-roll kpm-grad", "style": "font-weight: 800;" },
                        ($l($v.calcRollA)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ])
                      ),
                      $h("span", null,
                        " apps"
                      )
                    ),
                    $h("span", { "style": "display: block; line-height: 1.1;" },
                      "pour toi"
                    )
                  ),
                  ($v.phase3) ? [
                    $h("h1", { "class": "kpm-found kpm-c7f", "style": "grid-area: 1 / 1; margin: 0; display: flex; align-items: flex-start; line-height: 1; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap;" },
                      $h("span", { "class": "visually-hidden" },
                        $t($v.foundSr)
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kpm-roll kpm-grad", "style": "font-weight: 800;" },
                        ($l($v.calcRollB)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ])
                      ),
                      $h("span", null,
                        " ", $t($v.foundWord)
                      )
                    )
                  ] : null
                ),
                $h("ul", { "class": "kpm-in kpm-c7l", "style": "--i: 3; position: relative; list-style: none; margin-bottom: 0; margin-left: 0; margin-right: 0; padding: 0; display: flex; align-items: center;" },
                  $h("li", { "class": $v.ck0, "style": "display: flex; align-items: center; gap: 7px;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-ck" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kpm-ckp", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "class": "kpm-cklbl", "style": "font-size: 15px; font-weight: 500;" },
                      "Ta niche"
                    )
                  ),
                  $h("li", { "class": $v.ck1, "style": "display: flex; align-items: center; gap: 7px;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-ck" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kpm-ckp", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "class": "kpm-cklbl", "style": "font-size: 15px; font-weight: 500;" },
                      "Ton marché"
                    )
                  ),
                  $h("li", { "class": $v.ck2, "style": "display: flex; align-items: center; gap: 7px;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-ck" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kpm-ckp", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "class": "kpm-cklbl", "style": "font-size: 15px; font-weight: 500;" },
                      "Ton temps"
                    )
                  )
                ),
                $h("div", { "role": "progressbar", "aria-label": "Recherche", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": $v.calcPct, "class": "kpm-in kpm-c7p", "style": "--i: 4; position: relative; width: 220px; height: 4px; border-radius: 2px; overflow: hidden; background: #E3E5EA;" },
                  $h("span", { "class": "kpm-bar" })
                )
              )
            ] : null,
            ($v.isStep8) ? [
              $h("main", { "style": "position: relative; overflow-x: clip; flex: 1 0 auto; padding: 0 20px 64px; box-sizing: border-box;" },
                $h("section", { "aria-labelledby": "plan-titre", "style": "position: relative; padding-top: 40px; display: flex; flex-direction: column; align-items: center; text-align: center;" },
                  $h("div", { "aria-hidden": "true", "class": "kpm-halo", "style": "position: absolute; left: 50%; top: -20px; width: 520px; height: 420px; margin-left: -260px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.05) 60%, rgba(11,111,224,0) 100%); pointer-events: none;" }),
                  $h("span", { "class": "kpm-in", "style": "--i: 0; position: relative; display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 14px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 6px 16px rgba(16,24,40,0.05); font-size: 15px; font-weight: 600; color: var(--ink-soft);" },
                    $h("span", { "aria-hidden": "true", "style": "width: 7px; height: 7px; border-radius: 50%; background: #0B6FE0;" }),
                    "Ton plan"
                  ),
                  $h("h1", { "id": "plan-titre", "style": "position: relative; margin: 16px 0 0; display: flex; flex-direction: column; align-items: center;" },
                    $h("span", { "class": "visually-hidden" },
                      $t($v.resSr)
                    ),
                    $h("span", { "aria-hidden": "true", "class": "kpm-in", "style": "--i: 1; display: block;" },
                      $h("span", { "class": "kpm-roll", "style": `${$t($v.resNumStyle)} font-family: var(--font-display); font-weight: 800; letter-spacing: -0.06em; color: #0E0F12;` },
                        ($l($v.resRollMin)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ]),
                        ($v.resRange) ? [
                          $h("span", { "style": `${$t($v.resAStyle)} display: block; line-height: 1; font-weight: 700; letter-spacing: -0.03em;` },
                            $h("span", { "class": "kpm-gt" },
                              "à"
                            )
                          ),
                          ($l($v.resRollMax)).map((r) => [
                            $h("span", { "class": r?.cls },
                              (r?.isD) ? [
                                $h("span", { "class": "kpm-stack", "style": r?.st },
                                  "0",
                                  $h("br", null),
                                  "1",
                                  $h("br", null),
                                  "2",
                                  $h("br", null),
                                  "3",
                                  $h("br", null),
                                  "4",
                                  $h("br", null),
                                  "5",
                                  $h("br", null),
                                  "6",
                                  $h("br", null),
                                  "7",
                                  $h("br", null),
                                  "8",
                                  $h("br", null),
                                  "9",
                                  $h("br", null),
                                  "0",
                                  $h("br", null),
                                  "1",
                                  $h("br", null),
                                  "2",
                                  $h("br", null),
                                  "3",
                                  $h("br", null),
                                  "4",
                                  $h("br", null),
                                  "5",
                                  $h("br", null),
                                  "6",
                                  $h("br", null),
                                  "7",
                                  $h("br", null),
                                  "8",
                                  $h("br", null),
                                  "9"
                                )
                              ] : null,
                              (r?.isS) ? [
                                $t(r?.ch)
                              ] : null
                            )
                          ])
                        ] : null
                      )
                    ),
                    $h("span", { "class": "kpm-in", "style": "--i: 2; display: block; margin-top: 8px; font-family: var(--font-display); font-size: 22px; line-height: 1.2; font-weight: 600; letter-spacing: -0.02em; color: var(--ink-soft);" },
                      $t($v.resUnit)
                    )
                  ),
                  $h("ul", { "style": "position: relative; list-style: none; margin: 24px 0 0; padding: 0; display: flex; gap: 8px;" },
                    $h("li", { "class": "kpm-slL", "style": "display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px 0 14px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(16,24,40,0.06); font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
                      $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "8", "r": "4", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("path", { "d": "M4.5 20.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                      ),
                      $t($v.comptesTxt)
                    ),
                    $h("li", { "class": "kpm-slR", "style": "display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px 0 14px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(16,24,40,0.06); font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
                      ($v.pill2Time) ? [
                        $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "12", "r": "9", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("path", { "d": "M12 7v5l3.2 2", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null,
                      ($v.pill2Crea) ? [
                        $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "9", "cy": "8", "r": "3.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("path", { "d": "M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                          $h("path", { "d": "M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 13.9c1.8 0.9 3 2.8 3 5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      ] : null,
                      ($v.pill2Cost) ? [
                        $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M17.5 6.2a7 7 0 1 0 0 11.6", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                          $h("path", { "d": "M4.5 10.2h9M4.5 13.8h9", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      ] : null,
                      $t($v.pill2Txt)
                    )
                  ),
                  $h("p", { "class": "kpm-in kpm-badge", "style": "--i: 5; position: relative; margin: 16px 0 0; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px 0 10px; border-radius: 999px; background: #EEF5FF; box-shadow: inset 0 0 0 1px rgba(11,111,224,0.22); font-size: 15px; font-weight: 600; color: #0A63C9; white-space: nowrap;" },
                    $h("span", { "aria-hidden": "true", "style": "width: 22px; height: 22px; border-radius: 50%; background: #0B6FE0; display: grid; place-items: center;" },
                      ($v.vOk) ? [
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null,
                      ($v.vWarn) ? [
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "12", "r": "8", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.6" }),
                          $h("path", { "d": "M12 8v4.5l2.6 1.6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $t($v.verdict)
                  ),
                  $h("div", { "class": "kpm-in", "style": "--i: 6; position: relative; margin-top: 8px; width: 100%; display: flex; flex-direction: column; align-items: center;" },
                    $h("button", { "type": "button", "class": "kpm-calcbtn", "aria-expanded": $v.calcAria, "aria-controls": "kpm-calc", "onClick": $v.toggleCalc, "style": "display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 12px; font-size: 15px; font-weight: 600; color: var(--ink-muted);" },
                      "Voir le calcul",
                      $h("svg", { "class": "kpm-chev", "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("div", { "id": "kpm-calc", "class": $v.calcCls, "style": "width: 100%;" },
                      $h("div", null,
                        $h("div", { "class": "kpm-accin", "style": "margin-top: 8px; margin-bottom: 4px; padding: 20px; border-radius: 20px; background: #FFFFFF; box-shadow: var(--shadow-card); text-align: left; font-family: var(--font-mono); font-size: 15px; line-height: 1.6; color: var(--ink-faint);" },
                          $h("span", { "style": "display: block;" },
                            $t($v.calc1)
                          ),
                          $h("span", { "style": "display: block; font-size: 13px;" },
                            "(hypothèse, pas une promesse de gain)"
                          ),
                          $h("span", { "style": "display: block; margin-top: 8px;" },
                            $t($v.calc2)
                          ),
                          $h("span", { "style": "display: block;" },
                            $t($v.calc3)
                          ),
                          $h("span", { "style": "display: block; margin-top: 8px; color: var(--ink); font-weight: 500;" },
                            $t($v.calc4)
                          ),
                          ($v.calcCrea) ? [
                            $h("span", { "style": "display: block; margin-top: 8px;" },
                              $t($v.calc5)
                            )
                          ] : null
                        )
                      )
                    )
                  )
                ),
                $h("section", { "aria-labelledby": "apps-titre", "style": "position: relative; margin-top: 48px;" },
                  $h("h2", { "id": "apps-titre", "class": "kpm-in", "style": "--i: 7; margin: 0; font-family: var(--font-display); font-size: 28px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                    "Tes ", $t($v.nApps), " apps à copier"
                  ),
                  $h("div", { "class": "kpm-in3", "style": "--i: 8; margin-top: 24px;" },
                    $h("div", { "class": "kpm-float" },
                      $h("div", { "class": "kpm-ring" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-conic" }),
                        $h("article", { "aria-labelledby": "f-nom", "style": "position: relative; padding: 24px; border-radius: 23px; background: #FFFFFF;" },
                          $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
                            $h("span", { "aria-hidden": "true", "class": "kpm-img", "style": `${$t($v.f?.bg)} display: block; width: 72px; height: 72px; border-radius: 18px; flex-shrink: 0; box-shadow: 0 0 0 1px #ECEEF2, 0 8px 20px rgba(16,24,40,0.10);` }),
                            $h("div", { "style": "min-width: 0; text-align: left;" },
                              $h("h3", { "id": "f-nom", "style": "margin: 0; font-family: var(--font-display); font-size: 28px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                                $t($v.f?.nom)
                              ),
                              $h("p", { "style": "margin: 6px 0 0; font-size: 15px; line-height: 1.4; color: var(--ink-muted);" },
                                $t($v.f?.quoi)
                              )
                            )
                          ),
                          ($v.f?.bestTxt) ? [
                            $h("p", { "style": "margin: 32px 0 0; text-align: left;" },
                              $h("span", { "class": "visually-hidden" },
                                $t($v.f?.bestSr)
                              ),
                              $h("span", { "aria-hidden": "true", "style": "display: block; margin-left: -4px;" },
                                $h("span", { "class": "kpm-roll", "style": "font-family: var(--font-display); font-size: 72px; font-weight: 800; letter-spacing: -0.06em; color: var(--ink);" },
                                  ($l($v.f?.best)).map((r) => [
                                    $h("span", { "class": r?.cls },
                                      (r?.isD) ? [
                                        $h("span", { "class": "kpm-stack", "style": r?.st },
                                          "0",
                                          $h("br", null),
                                          "1",
                                          $h("br", null),
                                          "2",
                                          $h("br", null),
                                          "3",
                                          $h("br", null),
                                          "4",
                                          $h("br", null),
                                          "5",
                                          $h("br", null),
                                          "6",
                                          $h("br", null),
                                          "7",
                                          $h("br", null),
                                          "8",
                                          $h("br", null),
                                          "9",
                                          $h("br", null),
                                          "0",
                                          $h("br", null),
                                          "1",
                                          $h("br", null),
                                          "2",
                                          $h("br", null),
                                          "3",
                                          $h("br", null),
                                          "4",
                                          $h("br", null),
                                          "5",
                                          $h("br", null),
                                          "6",
                                          $h("br", null),
                                          "7",
                                          $h("br", null),
                                          "8",
                                          $h("br", null),
                                          "9"
                                        )
                                      ] : null,
                                      (r?.isS) ? [
                                        $t(r?.ch)
                                      ] : null
                                    )
                                  ])
                                )
                              ),
                              $h("span", { "style": "display: block; margin-top: 10px; font-size: 15px; line-height: 1.4; color: var(--ink-soft);" },
                                "de vues sur sa meilleure vidéo"
                              )
                            )
                          ] : null,
                          ($v.f?.bestVid) ? [
                            $h("button", { "type": "button", "class": "kpm-best", "aria-haspopup": "dialog", "onClick": $v.f?.play },
                              $h("span", { "class": "visually-hidden" },
                                $t($v.f?.bestSr), " de vues sur sa meilleure vidéo : la regarder"
                              ),
                              $h("span", { "aria-hidden": "true", "style": "display: flex; align-items: center; gap: 16px;" },
                                $h("span", { "style": "display: block; margin-left: -4px;" },
                                  $h("span", { "class": "kpm-roll", "style": "font-family: var(--font-display); font-size: 72px; font-weight: 800; letter-spacing: -0.06em; color: var(--ink);" },
                                    ($l($v.f?.best)).map((r) => [
                                      $h("span", { "class": r?.cls },
                                        (r?.isD) ? [
                                          $h("span", { "class": "kpm-stack", "style": r?.st },
                                            "0",
                                            $h("br", null),
                                            "1",
                                            $h("br", null),
                                            "2",
                                            $h("br", null),
                                            "3",
                                            $h("br", null),
                                            "4",
                                            $h("br", null),
                                            "5",
                                            $h("br", null),
                                            "6",
                                            $h("br", null),
                                            "7",
                                            $h("br", null),
                                            "8",
                                            $h("br", null),
                                            "9",
                                            $h("br", null),
                                            "0",
                                            $h("br", null),
                                            "1",
                                            $h("br", null),
                                            "2",
                                            $h("br", null),
                                            "3",
                                            $h("br", null),
                                            "4",
                                            $h("br", null),
                                            "5",
                                            $h("br", null),
                                            "6",
                                            $h("br", null),
                                            "7",
                                            $h("br", null),
                                            "8",
                                            $h("br", null),
                                            "9"
                                          )
                                        ] : null,
                                        (r?.isS) ? [
                                          $t(r?.ch)
                                        ] : null
                                      )
                                    ])
                                  )
                                ),
                                $h("span", { "class": "kpm-playb" },
                                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "margin-left: 3px;" },
                                    $h("path", { "d": "M7 4.5v15l12.5-7.5z", "fill": "#FFFFFF" })
                                  )
                                )
                              ),
                              $h("span", { "aria-hidden": "true", "style": "display: block; margin-top: 10px; font-size: 15px; line-height: 1.4; color: var(--ink-soft);" },
                                "de vues sur sa meilleure vidéo"
                              )
                            )
                          ] : null,
                          $h("p", { "style": "margin: 24px 0 0; display: flex; align-items: center; gap: 8px; padding-top: 20px; border-top: 1px solid #EEF0F3; font-size: 15px; color: var(--ink-soft); text-align: left;" },
                            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("circle", { "cx": "9", "cy": "8", "r": "3.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                              $h("path", { "d": "M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                              $h("path", { "d": "M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 13.9c1.8 0.9 3 2.8 3 5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                            ),
                            $h("span", null,
                              $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                                $t($v.f?.comptesTxt)
                              ),
                              " la poussent"
                            )
                          ),
                          $h("div", { "style": "margin-top: 24px; display: flex; justify-content: center;" },
                            $h("span", { "class": "kpm-cta" },
                              $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.f?.open },
                                "Voir sa stratégie",
                                $h("span", { "class": "sw-btn-tile" },
                                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  ),
                  ($v.paywall) ? [
                    $h("div", { "class": $v.rvLocked, "data-rv": "s8-locked", "ref": $v.rvRef, "style": `${$t($v.lockedGrid)} margin-top: 20px; display: grid; gap: 16px;` },
                      ($l($v.others)).map((o) => [
                        $h("button", { "type": "button", "class": "kpm-locked", "onClick": $v.openPaywall, "aria-label": "App verrouillée : tout débloquer", "style": "position: relative; display: block; width: 100%; height: 148px; padding: 20px; border-radius: 24px; background: #FFFFFF; box-shadow: var(--shadow-card); overflow: hidden;" },
                          $h("span", { "aria-hidden": "true", "class": "kpm-blur kpm-img", "style": `${$t(o?.bg)} display: block; width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 0 0 1px #ECEEF2;` }),
                          $h("span", { "aria-hidden": "true", "class": "kpm-blur", "style": "display: block; margin-top: 14px; font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                            $t(o?.nom)
                          ),
                          $h("span", { "aria-hidden": "true", "class": "kpm-blur", "style": "display: block; margin-top: 2px; font-size: 15px; color: var(--ink-muted); white-space: nowrap; overflow: hidden;" },
                            $t(o?.quoi)
                          ),
                          $h("span", { "aria-hidden": "true", "class": "kpm-lockb", "style": "position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin: -24px 0 0 -24px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.08), 0 12px 28px rgba(16,24,40,0.14); display: grid; place-items: center;" },
                            $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8" }),
                              $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                            )
                          )
                        )
                      ])
                    ),
                    $h("div", { "class": $v.rvBand, "data-rv": "s8-band", "ref": $v.rvRef, "style": "margin-top: 16px; padding: 24px 20px; border-radius: 24px; background: #FFFFFF; box-shadow: var(--shadow-card); display: flex; flex-direction: column; align-items: center; text-align: center;" },
                      $h("span", { "aria-hidden": "true", "style": "display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #EEF5FF;" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      ),
                      $h("p", { "style": "margin: 12px 0 0; font-size: 17px; font-weight: 700; color: var(--ink);" },
                        $t($v.moreTxt)
                      ),
                      $h("p", { "style": "margin: 4px 0 0; font-size: 15px; color: var(--ink-muted);" },
                        "29,99 € par mois, sans engagement"
                      ),
                      $h("span", { "class": "kpm-cta", "style": "margin-top: 20px;" },
                        $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "href": "/inscription" },
                          "Tout débloquer",
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      )
                    )
                  ] : null,
                  ($v.film) ? [
                    $h("div", { "style": "margin-top: 20px; display: flex; flex-direction: column; gap: 12px;" },
                      ($l($v.others)).map((o) => [
                        $h("button", { "type": "button", "class": o?.rowCls, "data-rv": o?.rvKey, "ref": $v.rvRef, "onClick": o?.open, "aria-label": o?.aria, "style": `${$t(o?.rowStyle)} position: relative; display: flex; align-items: center; gap: 16px; width: 100%; padding: 18px 18px 18px 18px; border-radius: 24px; background: #FFFFFF; box-shadow: var(--shadow-card);` },
                          $h("span", { "aria-hidden": "true", "class": "kpm-img", "style": `${$t(o?.bg)} display: block; width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0; box-shadow: 0 0 0 1px #ECEEF2, 0 6px 16px rgba(16,24,40,0.08);` }),
                          $h("span", { "style": "flex: 1 1 auto; min-width: 0;" },
                            $h("span", { "style": "display: block; font-family: var(--font-display); font-size: 22px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                              $t(o?.nom)
                            ),
                            $h("span", { "style": "display: block; margin-top: 4px; font-size: 15px; line-height: 1.35; color: var(--ink-muted);" },
                              $t(o?.line)
                            ),
                            $h("span", { "style": "display: block; margin-top: 8px; font-size: 15px; font-weight: 600; color: #0A63C9;" },
                              "Voir sa stratégie"
                            )
                          ),
                          $h("span", { "aria-hidden": "true", "style": "flex-shrink: 0; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #EEF5FF; color: #0B6FE0;" },
                            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      ])
                    ),
                    $h("div", { "class": $v.rvBand, "data-rv": "s8-band", "ref": $v.rvRef, "style": "margin-top: 16px; padding: 20px; border-radius: 24px; background: rgba(255,255,255,0.7); box-shadow: inset 0 0 0 1px #E6E7EC; display: flex; align-items: center; gap: 14px;" },
                      $h("span", { "aria-hidden": "true", "style": "flex-shrink: 0; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #EEF5FF;" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "12", "r": "8.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("circle", { "cx": "12", "cy": "12", "r": "4.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("circle", { "cx": "12", "cy": "12", "r": "1.4", "fill": "#0B6FE0" })
                        )
                      ),
                      $h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.35; font-weight: 600; color: var(--ink);" },
                        $t($v.moreFilm)
                      )
                    )
                  ] : null
                )
              )
            ] : null,
            ($v.isStep9) ? [
              $h("main", { "style": "position: relative; overflow-x: clip; flex: 1 0 auto; padding: 0 20px 64px; box-sizing: border-box;" },
                $h("section", { "aria-labelledby": "strat-titre", "style": "position: relative; padding-top: 40px; display: flex; flex-direction: column; align-items: center; text-align: center;" },
                  $h("div", { "aria-hidden": "true", "class": "kpm-halo", "style": "position: absolute; left: 50%; top: -40px; width: 480px; height: 380px; margin-left: -240px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.05) 60%, rgba(11,111,224,0) 100%); pointer-events: none;" }),
                  $h("span", { "class": "kpm-in", "style": "--i: 0; position: relative; display: block;" },
                    $h("span", { "role": "img", "aria-label": $v.s9?.alt, "class": "kpm-img", "style": `${$t($v.s9?.bg)} display: block; width: 88px; height: 88px; border-radius: 22px; box-shadow: 0 0 0 1px #ECEEF2, 0 16px 36px rgba(16,24,40,0.12);` })
                  ),
                  $h("h1", { "id": "strat-titre", "style": "position: relative; margin: 24px 0 0; max-width: 340px; font-family: var(--font-display); font-size: 34px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink); text-wrap: balance;" },
                    $h("span", { "class": "kpm-w" },
                      $h("span", { "style": "--w: 2;" },
                        "Copie"
                      )
                    ),
                    " ",
                    $h("span", { "class": "kpm-w" },
                      $h("span", { "style": "--w: 3;" },
                        $t($v.s9?.nom)
                      )
                    )
                  ),
                  $h("p", { "class": "kpm-in", "style": "--i: 3; position: relative; margin: 8px 0 0; max-width: 320px; font-size: 15px; line-height: 1.4; color: var(--ink-muted); text-wrap: balance;" },
                    $t($v.s9?.sub)
                  )
                ),
                ($v.s9?.hasHooks) ? [
                  $h("section", { "class": $v.rvHooks, "data-rv": "s9-hooks", "ref": $v.rvRef, "aria-labelledby": "accroches-titre", "style": "margin-top: 56px;" },
                    $h("h2", { "id": "accroches-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                      $t($v.s9?.hooksTitle)
                    ),
                    $h("ul", { "class": "kpm-rail", "aria-label": "Accroches", "style": "list-style: none; margin: 0 -20px; padding: 30px 20px 12px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-left: 20px;" },
                      ($l($v.s9?.hooks)).map((h) => [
                        $h("li", { "class": "kpm-deal", "style": `${$t(h?.st)} flex-shrink: 0; scroll-snap-align: start;` },
                          (h?.isVid) ? [
                            (h?.hasCap) ? [
                              $h("p", { "dir": "auto", "class": "kpm-hcap" },
                                $t(h?.texte)
                              )
                            ] : null,
                            $h("div", { "class": "kpm-vid" },
                              $h("span", { "aria-hidden": "true", "class": "kpm-vidph" },
                                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "margin-left: 2px;" },
                                  $h("path", { "d": "M7 4.5v15l12.5-7.5z", "fill": "currentColor" })
                                )
                              ),
                              $h("iframe", { "src": $u(h?.embed), "title": h?.title, "loading": "lazy", "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write", "allowfullscreen": "true", "style": "position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" })
                            )
                          ] : null,
                          (h?.isCard) ? [
                            $h("button", { "type": "button", "class": h?.cls, "onClick": h?.tap, "style": "display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 150px; height: 267px; box-sizing: border-box; padding: 14px; border-radius: 18px; background: #0E0F12; box-shadow: 0 1px 2px rgba(16,24,40,0.10), 0 16px 32px rgba(16,24,40,0.18); text-align: center; color: #FFFFFF;" },
                              (h?.isHook) ? [
                                $h("span", { "dir": "auto", "style": `${$t(h?.textSt)} display: block; line-height: 1.25; font-weight: 700; color: #FFFFFF; overflow-wrap: anywhere;` },
                                  $t(h?.texte)
                                )
                              ] : null,
                              (h?.isBest) ? [
                                $h("span", { "style": "display: block; font-family: var(--font-display); font-size: 44px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; color: #FFFFFF; white-space: nowrap;" },
                                  $t(h?.big)
                                ),
                                $h("span", { "style": "display: block; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.72);" },
                                  "vues"
                                )
                              ] : null
                            )
                          ] : null,
                          $h("span", { "style": "display: block; margin-top: 12px; font-family: var(--font-display); font-size: 19px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                            $t(h?.vues)
                          ),
                          (h?.hasProfil) ? [
                            $h("a", { "class": "kpm-acct", "href": $u(h?.profil), "target": "_blank", "rel": "noopener", "aria-label": h?.profilAria },
                              $h("span", null,
                                $t(h?.compte)
                              )
                            )
                          ] : null,
                          (h?.noProfil) ? [
                            $h("span", { "style": "display: block; margin-top: 2px; font-size: 15px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(h?.compte)
                            )
                          ] : null
                        )
                      ])
                    )
                  )
                ] : null,
                ($v.s9?.hasRes) ? [
                  $h("section", { "class": $v.rvAcc, "data-rv": "s9-acc", "ref": $v.rvRef, "aria-labelledby": "comptes-titre", "style": "margin-top: 48px;" },
                    $h("h2", { "id": "comptes-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                      "Les comptes qui la poussent"
                    ),
                    $h("ul", { "style": "list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px;" },
                      ($l($v.s9?.reseau)).map((r) => [
                        $h("li", null,
                          $h("a", { "class": "kpm-arow", "href": $u(r?.href), "target": "_blank", "rel": "noopener", "aria-label": r?.aria },
                            $h("span", { "aria-hidden": "true", "class": "kpm-av", "style": `${$t(r?.st)} display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%; background: #EAF2FF; box-shadow: inset 0 0 0 1px rgba(11,111,224,0.14); font-family: var(--font-display); font-size: 17px; font-weight: 700; color: #0B6FE0;` },
                              $t(r?.ini)
                            ),
                            $h("span", { "aria-hidden": "true", "style": "flex: 1 1 auto; min-width: 0;" },
                              $h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                                $h("span", { "style": "flex: 0 1 auto; min-width: 0; font-size: 16px; line-height: 1.3; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                  $t(r?.handle)
                                ),
                                $h("span", { "style": "flex-shrink: 0; margin-left: auto; font-size: 13px; color: var(--ink-faint); white-space: nowrap;" },
                                  $t(r?.pays)
                                )
                              ),
                              $h("span", { "style": "display: block; margin-top: 2px; font-size: 14px; line-height: 1.35; color: var(--ink-muted);" },
                                $t(r?.stats)
                              )
                            ),
                            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: #9AA1AB;" },
                              $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      ])
                    ),
                    $h("p", { "style": "margin: 16px 0 0; font-size: 17px; line-height: 1.35; font-weight: 600; color: var(--ink);" },
                      $h("span", { "style": "white-space: nowrap;" },
                        $t($v.s9?.planA)
                      ),
                      " · ",
                      $h("span", { "style": "white-space: nowrap;" },
                        $t($v.s9?.planB)
                      )
                    ),
                    $h("p", { "style": "margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #E3E5EA; font-size: 15px; color: var(--ink-faint);" },
                      $t($v.s9?.nom), " en fait tourner ",
                      $h("strong", { "style": "font-weight: 700; color: var(--ink-soft);" },
                        $t($v.s9?.appComptes)
                      )
                    )
                  )
                ] : null,
                $h("section", { "class": $v.rvWeeks, "data-rv": "s9-weeks", "ref": $v.rvRef, "aria-labelledby": "semaines-titre", "style": "margin-top: 56px;" },
                  $h("h2", { "id": "semaines-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                    "Tes 4 semaines"
                  ),
                  $h("div", { "style": "position: relative; margin-top: 24px;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-line", "style": "position: absolute; left: 15px; top: 16px; bottom: 40px; width: 2px; border-radius: 1px; background: linear-gradient(180deg, #0B6FE0, #4C9AFF 55%, #CFE2FF);" }),
                    $h("ol", { "style": "position: relative; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 28px;" },
                      ($l($v.s9?.weeks)).map((w) => [
                        $h("li", { "style": `${$t(w?.st)} display: flex; align-items: flex-start; gap: 16px;` },
                          $h("span", { "aria-hidden": "true", "class": "kpm-wdot", "style": "display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: 0 0 0 4px #F6F7F9, 0 6px 14px rgba(11,111,224,0.30); font-size: 15px; font-weight: 700; color: #FFFFFF;" },
                            $t(w?.n)
                          ),
                          $h("span", { "class": "kpm-wtxt", "style": "display: block; padding-top: 3px;" },
                            $h("span", { "style": "display: block; font-family: var(--font-display); font-size: 20px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                              $t(w?.k)
                            ),
                            $h("span", { "style": "display: block; margin-top: 4px; font-size: 15px; line-height: 1.45; color: var(--ink-muted);" },
                              $t(w?.t)
                            )
                          )
                        )
                      ])
                    )
                  )
                ),
                ($v.s9?.hasPrice) ? [
                  $h("section", { "class": $v.rvPrice, "data-rv": "s9-price", "ref": $v.rvRef, "aria-labelledby": "prix-titre", "style": "margin-top: 56px;" },
                    $h("h2", { "id": "prix-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                      "Ce qu’elle facture"
                    ),
                    $h("div", { "style": "margin-top: 20px; padding: 24px; border-radius: 24px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 20px 48px rgba(16,24,40,0.08);" },
                      $h("span", { "class": "visually-hidden" },
                        $t($v.s9?.priceSr)
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kpm-roll", "style": `${$t($v.s9?.priceStyle)} font-family: var(--font-display); font-weight: 800; letter-spacing: -0.06em; color: var(--ink);` },
                        ($l($v.s9?.pMin)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ]),
                        $h("span", { "style": `${$t($v.s9?.priceAStyle)} display: block; line-height: 1; font-weight: 700; letter-spacing: -0.02em;` },
                          $h("span", { "class": "kpm-gt" },
                            "à"
                          )
                        ),
                        ($l($v.s9?.pMax)).map((r) => [
                          $h("span", { "class": r?.cls },
                            (r?.isD) ? [
                              $h("span", { "class": "kpm-stack", "style": r?.st },
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9",
                                $h("br", null),
                                "0",
                                $h("br", null),
                                "1",
                                $h("br", null),
                                "2",
                                $h("br", null),
                                "3",
                                $h("br", null),
                                "4",
                                $h("br", null),
                                "5",
                                $h("br", null),
                                "6",
                                $h("br", null),
                                "7",
                                $h("br", null),
                                "8",
                                $h("br", null),
                                "9"
                              )
                            ] : null,
                            (r?.isS) ? [
                              $t(r?.ch)
                            ] : null
                          )
                        ]),
                        $h("span", { "class": "kpm-sl kpm-gap" }),
                        $h("span", { "class": "kpm-sl kpm-sep" },
                          "€"
                        )
                      ),
                      $h("span", { "style": "display: block; margin-top: 10px; font-size: 17px; font-weight: 600; color: var(--ink-soft);" },
                        "achats intégrés sur l’App Store"
                      )
                    )
                  )
                ] : null,
                ($v.paywall) ? [
                  $h("section", { "class": $v.rvEnd, "data-rv": "s9-end", "ref": $v.rvRef, "aria-labelledby": "pro-titre", "style": "position: relative; margin-top: 64px; height: 380px; border-radius: 28px; overflow: hidden; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 20px 48px rgba(16,24,40,0.08);" },
                    $h("div", { "aria-hidden": "true", "class": "kpm-blur", "style": "position: absolute; inset: 28px 24px; filter: blur(9px);" },
                      $h("div", { "style": "display: flex; align-items: center; gap: 12px;" },
                        $h("span", { "style": "display: flex;" },
                          ($l($v.s9?.lockLogos)).map((l) => [
                            $h("span", { "class": "kpm-img", "style": `${$t(l?.st)} display: block; width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 0 0 2px #FFFFFF;` })
                          ])
                        ),
                        $h("span", { "style": "font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                          $t($v.s9?.lockTitle)
                        )
                      ),
                      $h("div", { "style": "margin-top: 20px; display: flex; gap: 12px;" },
                        $h("span", { "style": "width: 96px; height: 170px; flex-shrink: 0; border-radius: 14px; background: #0E0F12; display: grid; place-items: center;" },
                          $h("span", { "style": "width: 56px; height: 8px; border-radius: 4px; background: #FFFFFF;" })
                        ),
                        $h("span", { "style": "width: 96px; height: 170px; flex-shrink: 0; border-radius: 14px; background: #0E0F12; display: grid; place-items: center;" },
                          $h("span", { "style": "width: 64px; height: 8px; border-radius: 4px; background: #FFFFFF;" })
                        ),
                        $h("span", { "style": "width: 96px; height: 170px; flex-shrink: 0; border-radius: 14px; background: #0E0F12; display: grid; place-items: center;" },
                          $h("span", { "style": "width: 48px; height: 8px; border-radius: 4px; background: #FFFFFF;" })
                        )
                      )
                    ),
                    $h("div", { "style": "position: absolute; inset: 0; padding: 0 24px; background: radial-gradient(70% 58% at 50% 52%, rgba(255,255,255,0.95), rgba(255,255,255,0.72) 60%, rgba(255,255,255,0.2)); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;" },
                      $h("span", { "aria-hidden": "true", "class": "kpm-lockb", "style": "display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.08), 0 12px 28px rgba(16,24,40,0.14);" },
                        $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8" }),
                          $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      ),
                      $h("h2", { "id": "pro-titre", "style": "margin: 20px 0 0; font-family: var(--font-display); font-size: 28px; line-height: 1.12; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                        "La stratégie de",
                        $h("br", null),
                        $t($v.s9?.lockN)
                      ),
                      $h("span", { "class": "kpm-cta", "style": "margin-top: 24px;" },
                        $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "href": "/inscription" },
                          "Tout débloquer",
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      ),
                      $h("p", { "style": "margin: 14px 0 0; font-size: 15px; color: var(--ink-muted);" },
                        "29,99 € par mois, sans engagement"
                      )
                    )
                  )
                ] : null,
                ($v.film) ? [
                  $h("div", { "class": $v.rvEnd, "data-rv": "s9-end", "ref": $v.rvRef, "style": "margin-top: 64px; display: flex; flex-direction: column; align-items: center; gap: 8px;" },
                    $h("span", { "class": "kpm-cta" },
                      $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "onClick": $v.nextApp },
                        "App suivante",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ),
                    $h("button", { "type": "button", "class": "kpm-quiet", "onClick": $v.toPlan, "style": "min-height: 48px; padding: 0 18px; font-size: 16px; font-weight: 600; color: var(--ink-muted);" },
                      "Retour au plan"
                    )
                  )
                ] : null
              )
            ] : null
          )
        ),
        $h("div", { "class": $v.headCls },
          $h("span", { "aria-hidden": "true", "class": "kpm-headbg" }),
          $h("header", { "style": "position: relative; height: 56px; padding: 0 20px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;" },
            $h("a", { "class": "sw-logo kpm-logo-btn", "href": "/", "aria-label": "kopycat, accueil" },
              $h("svg", { "class": "sw-logo-mark", "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#0E0F12" })
              ),
              $h("span", { "class": "sw-wordmark" },
                "kopycat"
              )
            ),
            ($v.hasBack) ? [
              $h("button", { "type": "button", "class": "kpm-back", "aria-label": $v.backLabel, "onClick": $v.back, "style": "width: 44px; height: 44px; padding: 0; box-sizing: border-box; border-radius: 50%; border: 1px solid #E6E6EA; background: #FFFFFF; color: #0E0F12; display: grid; place-items: center;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M19 12H5M11 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ] : null
          ),
          $h("div", { "role": "progressbar", "aria-label": "Progression", "aria-valuemin": "0", "aria-valuemax": "6", "aria-valuenow": $v.progNow, "style": "position: relative; display: flex; justify-content: center; gap: 6px; padding: 8px 0;" },
            ($l($v.segs)).map((g) => [
              $h("span", { "class": g?.cls },
                $h("span", { "class": "kpm-fill" })
              )
            ])
          )
        ),
        ($v.showSheet) ? [
          $h("div", { "class": $v.sheetCls, "role": "dialog", "aria-modal": "true", "aria-labelledby": "sh-titre", "onKeyDown": $v.onSheetKey, "style": "position: absolute; inset: 0; z-index: 30; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;" },
            $h("div", { "class": "kpm-sh-bg", "onClick": $v.closeSheet, "style": "position: absolute; inset: 0; background: rgba(14,15,18,0.45); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);" }),
            $h("div", { "class": "kpm-sh-card", "style": "position: relative; width: 100%; max-width: 560px; box-sizing: border-box; padding: 10px 20px calc(16px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; box-shadow: 0 -20px 60px rgba(14,15,18,0.22); display: flex; flex-direction: column; align-items: center;" },
              $h("span", { "aria-hidden": "true", "style": "display: block; width: 40px; height: 5px; border-radius: 3px; background: #D5DAE1;" }),
              $h("div", { "style": "align-self: stretch; margin-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                $h("h2", { "id": "sh-titre", "style": "margin: 0; min-width: 0; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.sh?.titre)
                ),
                $h("button", { "type": "button", "class": "kpm-x", "ref": $v.sheetX, "aria-label": "Fermer", "onClick": $v.closeSheet, "style": "flex-shrink: 0; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: #F1F3F6; color: #0E0F12; display: grid; place-items: center;" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                  )
                )
              ),
              $h("div", { "class": "kpm-shv" },
                $h("span", { "aria-hidden": "true", "class": "kpm-vidph" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "margin-left: 2px;" },
                    $h("path", { "d": "M7 4.5v15l12.5-7.5z", "fill": "currentColor" })
                  )
                ),
                $h("iframe", { "src": $u($v.sh?.embed), "title": $v.sh?.title, "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write", "allowfullscreen": "true", "style": "position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" })
              ),
              $h("p", { "style": "margin: 6px 0 0; max-width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; color: var(--ink-muted);" },
                $h("strong", { "style": "flex-shrink: 0; font-weight: 700; color: #0E0F12; white-space: nowrap;" },
                  $t($v.sh?.vues)
                ),
                ($v.sh?.hasProfil) ? [
                  $h("span", { "aria-hidden": "true" },
                    "·"
                  ),
                  $h("a", { "class": "kpm-acct", "href": $u($v.sh?.profil), "target": "_blank", "rel": "noopener", "aria-label": $v.sh?.profilAria, "style": "min-width: 0;" },
                    $h("span", null,
                      $t($v.sh?.compte)
                    )
                  )
                ] : null
              )
            )
          )
        ] : null,
        ($v.showPaywall) ? [
          $h("div", { "class": $v.pwCls, "role": "dialog", "aria-modal": "true", "aria-labelledby": "pw-titre", "style": "position: absolute; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;" },
            $h("div", { "class": "kpm-pw-bg", "onClick": $v.closePaywall, "style": "position: absolute; inset: 0; background: rgba(14,15,18,0.4); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);" }),
            $h("div", { "class": "kpm-pw-card", "style": "position: relative; width: 100%; max-width: 350px; box-sizing: border-box; padding: 40px 24px 36px; border-radius: 28px; background: #FFFFFF; box-shadow: 0 30px 80px rgba(14,15,18,0.30); display: flex; flex-direction: column; align-items: center; text-align: center;" },
              $h("button", { "type": "button", "class": "kpm-x", "aria-label": "Fermer", "onClick": $v.closePaywall, "style": "position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: #F1F3F6; color: #0E0F12; display: grid; place-items: center;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              ),
              $h("span", { "aria-hidden": "true", "class": "kpm-pw-logo", "style": "display: grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: 0 14px 30px rgba(11,111,224,0.35), inset 0 1px 0 rgba(255,255,255,0.45);" },
                $h("svg", { "width": "30", "height": "30", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                  $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                  $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                  $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                  $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                  $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                  $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
                )
              ),
              $h("h2", { "id": "pw-titre", "style": "margin: 20px 0 0; font-family: var(--font-display); font-size: 28px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12;" },
                "Kopycat Pro"
              ),
              $h("p", { "style": "margin: 16px 0 0; display: flex; align-items: baseline; gap: 8px; justify-content: center;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 56px; line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: #0E0F12; white-space: nowrap;" },
                  "29,99 ",
                  $h("span", { "class": "kpm-gt" },
                    "€"
                  )
                ),
                $h("span", { "style": "font-size: 17px; font-weight: 600; color: #3A3F47;" },
                  "par mois"
                )
              ),
              $h("p", { "style": "margin: 8px 0 0; font-size: 15px; color: #4A4F57;" },
                "sans engagement"
              ),
              $h("span", { "class": "kpm-cta", "style": "margin-top: 28px;" },
                $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kpm-btn", "href": "/inscription" },
                  "Tout débloquer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null
      )
    ];
  }
}
