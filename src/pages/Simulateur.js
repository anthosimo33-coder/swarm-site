// Généré par scripts/dc2preact.py depuis design/Simulateur.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../runtime.js';

export default class Simulateur extends DCLogic {
  // Données du simulateur (relevé du 26/11/2026), constantes et petites fonctions. Rangées dans la classe : la conversion
  // du site (scripts/dc2preact.py) n'accepte aucun code hors de la classe. Chaque méthode reprend ce qu'elle lit.
  static K = (() => {
    const DATA = {"releve":"26/11/2026","niches":[{"nom":"Social et loisirs","apps":111,"vuesParVideo":10460,"top":[{"nom":"MoboReels","store":"MoboReels: Short Drama Series","logo":"/media/simulateur/moboreels.jpg","comptes":98,"comptesFR":0,"videosSemaine":1252,"meilleure":{"vues":"12,7 k","compte":"austinobest1","video":"7710617508012756231"},"note":{"note":"4,5","avis":"7,2 k"},"prix":{"min":"6,99","max":"59,99"},"accroches":[{"texte":"My Unborn Baby's Voice Made Me a Winner Mommy,look down,it's me!","vuesTxt":"1,3 k","compte":"austinobest1","comptes":1,"video":"7710617880169172231"},{"texte":"I'm just a janitor's daughter","vuesTxt":"857","compte":"netflixtime_8","comptes":1,"video":"7710556274538204438"},{"texte":"Puth and Rian","vuesTxt":"835","compte":"cat888818","comptes":1,"video":"7708799388117716238"}],"quoi":"Short Drama Series","reseau":[{"pseudo":"austinobest1","abonnes":"10,8 k","vuesMed":"572","pays":"NG"},{"pseudo":"vehdgsv","abonnes":"9,9 k","vuesMed":"188","pays":"US"},{"pseudo":"nephejxloz6","abonnes":"3,8 k","vuesMed":"184","pays":"US"},{"pseudo":"qn657hpbr5","abonnes":"57","vuesMed":"146","pays":"US"},{"pseudo":"blanche.webb85","abonnes":"9","vuesMed":"139","pays":"CA"},{"pseudo":"catsen180","abonnes":"23","vuesMed":"89","pays":"US"}]},{"nom":"SlowRead","store":"SlowRead : Bibliothèque & PAL","logo":"/media/simulateur/slowread.jpg","comptes":70,"comptesFR":0,"videosSemaine":792,"meilleure":{"vues":"35,8 k","compte":"andrea.booktoker","video":"7706174306748845334"},"note":{"note":"3,8","avis":"36"},"prix":{"min":"7,79","max":"129,99"},"accroches":[{"texte":"Okay I need to lock in no distractions","vuesTxt":"10,5 k","compte":"chelskait_other","comptes":1,"video":"7710039825193241886"},{"texte":"i overheard a girl at the airport saying she used girl math to get her nails done with rewards from playing games… and after seeing her nail","vuesTxt":"6,8 k","compte":"living.better0","comptes":4,"video":"7710856114467785998"},{"texte":"Keep Lucia. I have 57 fictional men who'd burn the world down for me.","vuesTxt":"4,3 k","compte":"totallybooked18","comptes":5,"video":"7711841689144397070"}],"quoi":"Bibliothèque & PAL","reseau":[{"pseudo":"stirreel","abonnes":"42","vuesMed":"1,7 k","pays":"CA"},{"pseudo":"tabs_reads","abonnes":"28","vuesMed":"1,1 k","pays":"US"},{"pseudo":"relatable.bri","abonnes":"53","vuesMed":"1 k","pays":"US"},{"pseudo":"bookish.linds","abonnes":"706","vuesMed":"798","pays":"US"},{"pseudo":"summerkore7","abonnes":"74","vuesMed":"752","pays":"US"},{"pseudo":"emma.readss1","abonnes":"8","vuesMed":"752","pays":"US"}]},{"nom":"DramaBox","store":"DramaBox - Film et Drame Court","logo":"/media/simulateur/dramabox.jpg","comptes":88,"comptesFR":0,"videosSemaine":618,"meilleure":{"vues":"260 k","compte":"j3w3lz.rose","video":"7709357476939877646"},"note":{"note":"4,6","avis":"57,2 k"},"prix":{"min":"0,99","max":"14,99"},"accroches":[{"texte":"¡HUMILLARON A MI ABUELA POR VENDER TACOS! A MI ABUELA POR VENDER TACOS!","vuesTxt":"260 k","compte":"j3w3lz.rose","comptes":1,"video":"7709357476939877646"},{"texte":"DramaBox EP7-8 كل ما فعلته هوجني المال من الثري الذي يُنفق علي وفي النهاية حققت الحرية المالية حصريا DramaBox","vuesTxt":"199 k","compte":"dramabox_ar","comptes":1,"video":"7707578346397240584"},{"texte":"DramaBox EP3-4 الندم المتأخر DramaBox حصريا","vuesTxt":"151 k","compte":"dramabox_ar","comptes":1,"video":"7709069812281953544"}],"quoi":"Film et Drame Court","reseau":[{"pseudo":"dramabox_br_1","abonnes":"6,2 M","vuesMed":"580 k","pays":"BR"},{"pseudo":"bu_chintya","abonnes":"52,3 k","vuesMed":"395 k","pays":"ID"},{"pseudo":"populardrama","abonnes":"180 k","vuesMed":"104 k","pays":"SG"},{"pseudo":"user8577202100918","abonnes":"25,3 k","vuesMed":"77,1 k","pays":"JP"},{"pseudo":"guobrose","abonnes":"97,6 k","vuesMed":"66,4 k","pays":"US"},{"pseudo":"dramabox818","abonnes":"17,9 k","vuesMed":"53,5 k","pays":"PK"}]}]},{"nom":"Santé et physique","apps":70,"vuesParVideo":4598,"top":[{"nom":"Mise","store":"mise - meal planner","logo":"/media/simulateur/mise.jpg","comptes":130,"comptesFR":7,"videosSemaine":1353,"meilleure":{"vues":"1,3 M","compte":"paula.eatss","video":"7710492306742283528"},"note":{"note":"4,5","avis":"98"},"prix":{"min":"9,99","max":"59,99"},"accroches":[{"texte":"Il avait rendez-vous avec Emma pour me tromper... il ignorait qui elle était Ouais Emma c'est","vuesTxt":"1,5 M","compte":"la.folleduvillage","comptes":1,"video":"7709498093850381600"},{"texte":"My baby daddy gave me $150 to feed these kids","vuesTxt":"1,4 M","compte":"meme.atethat","comptes":32,"video":"7709218149148757261"},{"texte":"J’ai empêché mon mari de me tromper ce soir en quittant la maison avant lui maquilles?","vuesTxt":"935 k","compte":"la.folleduvillage","comptes":1,"video":"7710582935258287392"}],"quoi":"Meal planner","reseau":[{"pseudo":"nacho_porcal","abonnes":"15,8 k","vuesMed":"117 k","pays":"UY"},{"pseudo":"mise.cxvii","abonnes":"3,4 k","vuesMed":"52,9 k","pays":"AR"},{"pseudo":"lnamise","abonnes":"34 k","vuesMed":"34,2 k","pays":"VN"},{"pseudo":"7mise","abonnes":"8,5 k","vuesMed":"21,4 k","pays":"MX"},{"pseudo":"mise23hum","abonnes":"2,4 k","vuesMed":"16,4 k","pays":"AR"},{"pseudo":"objectifepargne","abonnes":"129 k","vuesMed":"8,9 k","pays":"FR"}]},{"nom":"Musa","store":"Musa: Period & Pregnancy","logo":"/media/simulateur/musa.jpg","comptes":32,"comptesFR":2,"videosSemaine":526,"meilleure":{"vues":"289 k","compte":"marina.pragnancy","video":"7710412757409041694"},"note":{"note":"4,7","avis":"181"},"prix":{"min":"6,99","max":"34,99"},"accroches":[{"texte":"I think November has delayed every girls period… · We must all be stressed","vuesTxt":"43,2 k","compte":"mariana.hormones","comptes":13,"video":"7710291978721725710"},{"texte":"I searched \"my Disney baby\"","vuesTxt":"31,1 k","compte":"brooke.pregnancy","comptes":1,"video":"7709197987737505038"},{"texte":"Girl to girl.. what’s the most obvious sign that your period is about to start?","vuesTxt":"16,3 k","compte":"fal.cycletips","comptes":6,"video":"7710808728353639710"}],"quoi":"Period & Pregnancy","reseau":[{"pseudo":"ccinloveeee","abonnes":"154","vuesMed":"5,9 k","pays":"US"},{"pseudo":"bree.pregnancy","abonnes":"94","vuesMed":"2,9 k","pays":"US"},{"pseudo":"elena.burgueno","abonnes":"28","vuesMed":"2 k","pays":"FR"},{"pseudo":"mur.cyclesync","abonnes":"118","vuesMed":"1,3 k","pays":"US"},{"pseudo":"aylin.hormones","abonnes":"1,5 k","vuesMed":"1,3 k","pays":"US"},{"pseudo":"ari.hormones","abonnes":"1,8 k","vuesMed":"1,1 k","pays":"PT"}]},{"nom":"Solaia","store":"Solaia: Équilibre hormonal","logo":"/media/simulateur/solaia.jpg","comptes":64,"comptesFR":52,"videosSemaine":453,"meilleure":{"vues":"1,7 M","compte":"byelizen","video":"7709915874399964448"},"note":{"note":"4,6","avis":"2,5 k"},"prix":{"min":"8,99","max":"79,99"},"accroches":[{"texte":"18:00-22:00 Post workout routine low|","vuesTxt":"1,5 M","compte":"byelizen","comptes":1,"video":"7709915874399964448"},{"texte":"100% moi les premières semaines où j’ai pris ma pilule","vuesTxt":"96,6 k","compte":"justinendo","comptes":1,"video":"7708363079444155681"},{"texte":"mon rêve niche c’est de guérir des tca","vuesTxt":"55,7 k","compte":"indoinsa","comptes":1,"video":"7708153950515563809"}],"quoi":"Équilibre hormonal","reseau":[{"pseudo":"lou56632","abonnes":"279","vuesMed":"14,4 k","pays":"AE"},{"pseudo":"indoinsa","abonnes":"37,8 k","vuesMed":"10,1 k","pays":"FR"},{"pseudo":"man.amedor","abonnes":"8,9 k","vuesMed":"6,7 k","pays":"FR"},{"pseudo":"lya_au_feminin","abonnes":"76","vuesMed":"4,1 k","pays":"FR"},{"pseudo":"emaaadbs","abonnes":"765","vuesMed":"3,6 k","pays":"FR"},{"pseudo":"health_elisa","abonnes":"925","vuesMed":"1,7 k","pays":"FR"}]}]},{"nom":"Side hustle","apps":50,"vuesParVideo":1405,"top":[{"nom":"SideShift","store":"SideShift - Earn Money","logo":"/media/simulateur/sideshift.jpg","comptes":158,"comptesFR":19,"videosSemaine":1339,"meilleure":{"vues":"4,3 M","compte":"prankswithgenn_","video":"7710695480325311765"},"note":{"note":"4,8","avis":"411"},"prix":{"min":"0,99","max":"89,99"},"accroches":[{"texte":"Mon objectif est de devenir financièrement indépendante avant mes 25 ans. Je suis ouverte à toutes les idées pour faire de l'argent.","vuesTxt":"1 M","compte":"kelly.advice","comptes":1,"video":"7707745824872156448"},{"texte":"Hoy contacté a 100 marcas. 70 nunca respondieron. 20 dijeron que NO. 10 dijeron que Sl. Y 5 de esas me pagaron 200 dl cada una. Eso es un to","vuesTxt":"280 k","compte":"fernandaj_ugc","comptes":19,"video":"7712028053731429665"},{"texte":"TRES TRABAJOS DE NOCHE QUE PUEDES HACER DESDE TU CASA","vuesTxt":"191 k","compte":"mafe.guzman29","comptes":4,"video":"7709728438550056213"}],"quoi":"Earn Money","reseau":[{"pseudo":"creatorera.edivany11","abonnes":"2,1 k","vuesMed":"26,2 k","pays":"BR"},{"pseudo":"ilianaconugc","abonnes":"9,1 k","vuesMed":"11,4 k","pays":"HN"},{"pseudo":"martiapproves","abonnes":"3,6 k","vuesMed":"10,3 k","pays":"AR"},{"pseudo":"be_like_olaa","abonnes":"688","vuesMed":"5,4 k","pays":"PL"},{"pseudo":"kingspranks","abonnes":"8,8 k","vuesMed":"5,3 k","pays":"GB"},{"pseudo":"eve.hustles","abonnes":"2 k","vuesMed":"4,2 k","pays":"GB"}]},{"nom":"Hub Capture","store":"Hub Capture","logo":"/media/simulateur/hub-capture.jpg","comptes":54,"comptesFR":0,"videosSemaine":180,"meilleure":{"vues":"79,2 k","compte":"tamiresrrosati","video":"7711010891512171784"},"note":null,"prix":null,"accroches":[{"texte":"Gente, eu sem óculos não exergo nada perdão na leitura a informação foi nada kk","vuesTxt":"9,3 k","compte":"rennynooff","comptes":1,"video":"7709532252459404565"},{"texte":"oração pra hub capture voltar hoje às 23h99","vuesTxt":"8,9 k","compte":"isatmai","comptes":3,"video":"7711836519509658900"},{"texte":"“MÃO DE ZUMBI”","vuesTxt":"8,5 k","compte":"yasmin.robo","comptes":1,"video":"7709571679147625749"}],"quoi":"Plateforme de revenus en ligne par parrainage, avec dropshipping et création de contenu UGC pour TikTok Shop","reseau":[{"pseudo":"leonardoorozco","abonnes":"553","vuesMed":"6,2 k","pays":"VE"},{"pseudo":"treinador_de_robo","abonnes":"398","vuesMed":"4,5 k","pays":"BR"},{"pseudo":"isatmai","abonnes":"6 k","vuesMed":"3,9 k","pays":"BR"},{"pseudo":"rennynooff","abonnes":"66,8 k","vuesMed":"3,5 k","pays":"BR"},{"pseudo":"oovilanovaa","abonnes":"189","vuesMed":"3,2 k","pays":"BR"},{"pseudo":"sindygital.us","abonnes":"12,7 k","vuesMed":"3,2 k","pays":"US"}]},{"nom":"TikAlyzer","store":"TikAlyzer: Deviens Viral","logo":"/media/simulateur/tikalyzer.jpg","comptes":51,"comptesFR":0,"videosSemaine":87,"meilleure":{"vues":"1,1 k","compte":"viviana.tikalyzr","video":"7711334652664974622"},"note":{"note":"4,2","avis":"5"},"prix":{"min":"6,99","max":"69,99"},"accroches":[],"quoi":"Deviens Viral","reseau":[{"pseudo":"blair.clipss","abonnes":"10","vuesMed":"527","pays":"BD"},{"pseudo":"allie.growth","abonnes":"37","vuesMed":"493","pays":"US"},{"pseudo":"ronnygrowth","abonnes":"32","vuesMed":"472","pays":"AO"},{"pseudo":"duke.clips4","abonnes":"8","vuesMed":"408","pays":"US"},{"pseudo":"bluetoria2","abonnes":"35","vuesMed":"368","pays":"US"},{"pseudo":"tikatori22","abonnes":"51","vuesMed":"356","pays":"US"}]}]},{"nom":"Création de contenu","apps":41,"vuesParVideo":19873,"top":[{"nom":"Djay","store":"djay - DJ App & AI Mixer","logo":"/media/simulateur/djay.jpg","comptes":163,"comptesFR":3,"videosSemaine":355,"meilleure":{"vues":"61,7 k","compte":"djayoverlaps","video":"7710786478829358366"},"note":{"note":"4,6","avis":"6,7 k"},"prix":{"min":"0,00","max":"49,99"},"accroches":[{"texte":"گیانەکەم ، ئەتۆ نەبووی فێری گیانت کردم ؟ ئێستاش بێ گیانت کردم","vuesTxt":"135 k","compte":".avii1i","comptes":1,"video":"7709586609292823828"},{"texte":"I LOVE MUSIC LIKE THIS, WHO DOESN'T LIKE BOUNCE MUSIC?","vuesTxt":"16,6 k","compte":"howyallfindingme2","comptes":1,"video":"7711484463041039648"},{"texte":"can yall catch this beatt??","vuesTxt":"12,2 k","compte":"howyallfindingme2","comptes":1,"video":"7711520404019399968"}],"quoi":"DJ App & AI Mixer","reseau":[{"pseudo":"etherealalofa","abonnes":"8,4 k","vuesMed":"186 k","pays":"US"},{"pseudo":"user8875467886","abonnes":"2,5 k","vuesMed":"133 k","pays":"US"},{"pseudo":"thy._.kdmh","abonnes":"45,3 k","vuesMed":"104 k","pays":"KH"},{"pseudo":"kaya.aj","abonnes":"1,8 k","vuesMed":"91,1 k","pays":"US"},{"pseudo":"userr2087764","abonnes":"1,3 k","vuesMed":"85,5 k","pays":"US"},{"pseudo":"msladydjay","abonnes":"1,8 k","vuesMed":"82,3 k","pays":"US"}]},{"nom":"Crsel","store":"Crsel: Carrousel & Story Maker","logo":"/media/simulateur/crsel.jpg","comptes":14,"comptesFR":0,"videosSemaine":104,"meilleure":{"vues":"6,8 k","compte":"emilycreatescontent","video":"7710974418348035359"},"note":{"note":"4,7","avis":"1,2 k"},"prix":{"min":"5,99","max":"29,99"},"accroches":[],"quoi":"Carrousel & Story Maker","reseau":[{"pseudo":"withgeorgy","abonnes":"199 k","vuesMed":"37,8 k","pays":"PL"},{"pseudo":"val_edits162","abonnes":"15,6 k","vuesMed":"4,9 k","pays":"PL"},{"pseudo":"creatlvblin","abonnes":"1,3 k","vuesMed":"3,4 k","pays":"PL"},{"pseudo":"sarahs_collages","abonnes":"3,5 k","vuesMed":"1,9 k","pays":"DE"},{"pseudo":"crselautenticooficial","abonnes":"11,6 k","vuesMed":"1,5 k","pays":"CO"},{"pseudo":"myaplikasiku","abonnes":"163","vuesMed":"1,4 k","pays":"ID"}]},{"nom":"VanDraw","store":"VanDraw","logo":"/media/simulateur/vandraw.jpg","comptes":19,"comptesFR":0,"videosSemaine":73,"meilleure":{"vues":"73,1 k","compte":"inspovikk","video":"7711450203571719444"},"note":{"note":"4,6","avis":"173"},"prix":{"min":"6,00","max":"60,00"},"accroches":[{"texte":"grand theft auto","vuesTxt":"57,1 k","compte":"inspovikk","comptes":1,"video":"7711450203571719444"}],"quoi":"App de dessin qui permet de dessiner des avatars et des personnages à partir des commentaires ou de photos","reseau":[{"pseudo":"simpleartjournal","abonnes":"12,5 k","vuesMed":"40 k","pays":"BR"},{"pseudo":"shezuun","abonnes":"840","vuesMed":"11,1 k","pays":"ID"},{"pseudo":"inspovikk","abonnes":"495","vuesMed":"9,4 k","pays":"UA"},{"pseudo":"john.arts.drawing","abonnes":"7,4 k","vuesMed":"6,5 k","pays":"PH"},{"pseudo":"lia.squisy_art","abonnes":"631","vuesMed":"3,8 k","pays":"ID"},{"pseudo":"draw4chilll","abonnes":"1,2 k","vuesMed":"3,8 k","pays":"US"}]}]},{"nom":"Langues","apps":36,"vuesParVideo":6669,"top":[{"nom":"Vocabulary","store":"Vocabulary - Apprenez mots","logo":"/media/simulateur/vocabulary.jpg","comptes":71,"comptesFR":0,"videosSemaine":637,"meilleure":{"vues":"4,2 k","compte":"edforyou6","video":"7710309824344460566"},"note":{"note":"4,7","avis":"4 k"},"prix":{"min":"5,99","max":"59,99"},"accroches":[{"texte":"My roommate told me about this sound which blocks your brain from overthinking. I’ve been listening for 4 hours straight","vuesTxt":"6,5 k","compte":"itskatiegirl8","comptes":11,"video":"7710312659320638751"},{"texte":"when people are using klarna to make payments to play the new GTA but I'm only $19 away from getting it using this app called vybs","vuesTxt":"3 k","compte":"lobotomized_fish101","comptes":9,"video":"7710387036712111373"},{"texte":"Sous vide burger","vuesTxt":"977","compte":"hazaeyrw6ue","comptes":1,"video":"7710757769732738334"}],"quoi":"Apprenez mots","reseau":[{"pseudo":"app.lingopic","abonnes":"82 k","vuesMed":"32,2 k","pays":"US"},{"pseudo":"yocable.app","abonnes":"17","vuesMed":"2,1 k","pays":"PH"},{"pseudo":"linds.learning","abonnes":"92","vuesMed":"2 k","pays":"US"},{"pseudo":"daisy.another.inc","abonnes":"24","vuesMed":"1,4 k","pays":"GB"},{"pseudo":"littlespanishdail","abonnes":"449","vuesMed":"1,1 k","pays":"US"},{"pseudo":"amanda.eats45","abonnes":"36","vuesMed":"900","pays":"US"}]},{"nom":"Pingo AI","store":"Apprendre des langues Pingo AI","logo":"/media/simulateur/pingo-ai.jpg","comptes":147,"comptesFR":7,"videosSemaine":480,"meilleure":{"vues":"78,3 k","compte":"nadiaspeaksgerman","video":"7711006014425795861"},"note":{"note":"4,6","avis":"1,8 k"},"prix":{"min":"14,99","max":"119,99"},"accroches":[{"texte":"· · WHO ARE YOU? · I ASKED BETTER! · I’M A BRITISH AI!!! · WHAT?? · YOUR VOICE SOUNDS UGLY! · WHAAAAT?? · WHAAAAT????!?? · WHAAAA-","vuesTxt":"246 k","compte":"englishgurukat","comptes":2,"video":"7708769313393511687"},{"texte":"¿Quién dijo la frase? official Spanish nationality exam","vuesTxt":"198 k","compte":"camilopolyglot","comptes":3,"video":"7710652660596133142"},{"texte":"How do you say \"green flag\" in Chinese","vuesTxt":"173 k","compte":"howtosaynihao","comptes":4,"video":"7710191199314824469"}],"quoi":"Application d'apprentissage des langues par IA qui corrige les phrases et répond aux questions de vocabulaire","reseau":[{"pseudo":"britttttspanishlearning","abonnes":"202 k","vuesMed":"674 k","pays":"US"},{"pseudo":"maksim_po_russki","abonnes":"39 k","vuesMed":"554 k","pays":"BR"},{"pseudo":"yuli_portuguese","abonnes":"88,7 k","vuesMed":"237 k","pays":"BR"},{"pseudo":"maris.german","abonnes":"11 k","vuesMed":"195 k","pays":"EE"},{"pseudo":"violla.languages","abonnes":"7,7 k","vuesMed":"193 k","pays":"IT"},{"pseudo":"sabinelearnsfrench","abonnes":"53,1 k","vuesMed":"178 k","pays":"US"}]},{"nom":"Bunpo","store":"Bunpo: Apprendre les langues","logo":"/media/simulateur/bunpo.jpg","comptes":86,"comptesFR":0,"videosSemaine":206,"meilleure":{"vues":"18,9 k","compte":"frenchwithlars","video":"7709922289172647201"},"note":{"note":"4,8","avis":"1,1 k"},"prix":{"min":"9,99","max":"99,99"},"accroches":[{"texte":"I don’t have money お金が ありません","vuesTxt":"344 k","compte":"bunpo_learnjapanese","comptes":1,"video":"7709163578669960481"},{"texte":"you’re a villain but you’re still learning Japanese 日本語勉強中のラスボス この漢字が読めないんだけど I actually can't read that kanji","vuesTxt":"44,3 k","compte":"studytomodachi","comptes":1,"video":"7710927397977197844"},{"texte":"Anzeige Learning Spanish while eating fruit","vuesTxt":"20,2 k","compte":"vittoria.aprende","comptes":1,"video":"7709806475069230358"}],"quoi":"Apprendre les langues","reseau":[{"pseudo":"germanwithgitte","abonnes":"1,1 k","vuesMed":"41,8 k","pays":"BE"},{"pseudo":"studytomodachi","abonnes":"23,9 k","vuesMed":"23,6 k","pays":"JP"},{"pseudo":"moco.minute","abonnes":"4,7 k","vuesMed":"15,1 k","pays":"VN"},{"pseudo":"japanesewithgia","abonnes":"16,6 k","vuesMed":"8,4 k","pays":"JP"},{"pseudo":"snowstudy.kr","abonnes":"15,9 k","vuesMed":"5,3 k","pays":"US"},{"pseudo":"koreanseonghy","abonnes":"3,7 k","vuesMed":"4,5 k","pays":"KR"}]}]},{"nom":"Études","apps":35,"vuesParVideo":4542,"top":[{"nom":"Aistote","store":"Aistote : QUIZ IA","logo":"/media/simulateur/aistote.jpg","comptes":46,"comptesFR":6,"videosSemaine":532,"meilleure":{"vues":"206 k","compte":"wow_its_clifford","video":"7711615369651277087"},"note":{"note":"4,5","avis":"2,4 k"},"prix":{"min":"8,99","max":"49,99"},"accroches":[{"texte":"POV: you use a big word in your English essay and pray it means what you think it means","vuesTxt":"206 k","compte":"wow_its_clifford","comptes":1,"video":"7711615369651277087"},{"texte":"POV: you finally find a question you actually know and it's only worth 1 point","vuesTxt":"174 k","compte":"wow_its_clifford","comptes":1,"video":"7709376662114225439"},{"texte":"Le marché de Noël a ouvert à Nantes","vuesTxt":"89,9 k","compte":"arkenyxe","comptes":1,"video":"7709988833684770081"}],"quoi":"QUIZ IA","reseau":[{"pseudo":"elissastudyy","abonnes":"3 k","vuesMed":"2,3 k","pays":"US"},{"pseudo":"studywithme_vena","abonnes":"1,1 k","vuesMed":"2,3 k","pays":"US"},{"pseudo":"felix_studytips","abonnes":"54","vuesMed":"1,3 k","pays":"US"},{"pseudo":"aceofstudies","abonnes":"1,3 k","vuesMed":"1,3 k","pays":"US"},{"pseudo":"mat.astuces","abonnes":"512","vuesMed":"1,2 k","pays":"FR"},{"pseudo":"studytok_nessa","abonnes":"1,7 k","vuesMed":"1,1 k","pays":"US"}]},{"nom":"NurseMind","store":"NurseMind: AI Nursing Guide","logo":"/media/simulateur/nursemind.jpg","comptes":112,"comptesFR":0,"videosSemaine":435,"meilleure":{"vues":"2 k","compte":"learninghacks4u","video":"7711442404619881742"},"note":null,"prix":{"min":"9,99","max":"34,99"},"accroches":[{"texte":"these are the BEST outside the box ways to bring in some extra money","vuesTxt":"1,7 k","compte":"anicaa275","comptes":7,"video":"7710488999206341909"},{"texte":"3 things I bought this week just by playing cute mobile games on my phone","vuesTxt":"1,6 k","compte":"anicaa275","comptes":15,"video":"7710708717120916757"},{"texte":"if i could redo my first shift as a nurse what i'd do differently, from the first five minutes to clocking out.","vuesTxt":"1,5 k","compte":"doweknowhurrr","comptes":6,"video":"7709400617407614238"}],"quoi":"AI Nursing Guide","reseau":[{"pseudo":"cloud.drift02","abonnes":"1","vuesMed":"755","pays":"US"},{"pseudo":"growwithsade","abonnes":"1,9 k","vuesMed":"744","pays":"US"},{"pseudo":"everythingbella_3","abonnes":"58","vuesMed":"722","pays":"GB"},{"pseudo":"ugcbyciara","abonnes":"24","vuesMed":"697","pays":"CA"},{"pseudo":"nursemindhn","abonnes":"22","vuesMed":"683","pays":"HN"},{"pseudo":"glossyangelx7","abonnes":"7","vuesMed":"678","pays":"GB"}]},{"nom":"Diane AI","store":"Diane AI - Flashcards","logo":"/media/simulateur/diane-ai.jpg","comptes":53,"comptesFR":49,"videosSemaine":403,"meilleure":{"vues":"51,8 k","compte":"el1ott_lapt","video":"7710371564923014432"},"note":{"note":"4,6","avis":"385"},"prix":{"min":"19,99","max":"89,99"},"accroches":[{"texte":"« Votre motivation pour réviser les partiels » · « Parce que faut être motivé en plus ? »","vuesTxt":"109 k","compte":"jade_dianeai","comptes":1,"video":"7710994709463715105"},{"texte":"On se retrouve à 8h pour aller à la bu mais on est ni du matin ni des partiels","vuesTxt":"87,3 k","compte":"jade_dianeai","comptes":2,"video":"7712069998566559015"},{"texte":"Juillet 2025, j'obtiens mon bac, j'ai officiellement terminé le lycée ...","vuesTxt":"71,8 k","compte":"el1ott_lapt","comptes":1,"video":"7708731515743604001"}],"quoi":"Flashcards","reseau":[{"pseudo":"oldberouitsa","abonnes":"4,1 k","vuesMed":"26,1 k","pays":"DZ"},{"pseudo":"jade_dianeai","abonnes":"1,3 k","vuesMed":"11,4 k","pays":"FR"},{"pseudo":"julye_aoot","abonnes":"1,8 k","vuesMed":"6,6 k","pays":"FR"},{"pseudo":"fantine.diane","abonnes":"452","vuesMed":"6,5 k","pays":"FR"},{"pseudo":"shana_diane","abonnes":"2,3 k","vuesMed":"5,1 k","pays":"FR"},{"pseudo":"studyemilie.dianeai","abonnes":"2,4 k","vuesMed":"4,9 k","pays":"FR"}]}]},{"nom":"Productivité","apps":27,"vuesParVideo":4020,"top":[{"nom":"TapCook","store":"TapCook: Budget Meal Plans","logo":"/media/simulateur/tapcook.jpg","comptes":184,"comptesFR":0,"videosSemaine":3342,"meilleure":{"vues":"31,7 k","compte":"mealprepsteve","video":"7711485707772054792"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"9,99","max":"34,99"},"accroches":[{"texte":"¿EN COSTCO CON UN PRESUPUESTO AL AZAR?","vuesTxt":"6,2 k","compte":"laurapresupuesto","comptes":2,"video":"7711195276014374157"},{"texte":"No Frills Canada $45 to Feed 8 people Dinners for two days this weekend","vuesTxt":"4,6 k","compte":"grocevypwoq","comptes":31,"video":"7710684040143146260"},{"texte":"$80 this week for a family of 4!","vuesTxt":"3,9 k","compte":"familytips44","comptes":49,"video":"7711872874465840402"}],"quoi":"Budget Meal Plans","reseau":[{"pseudo":"kimbudgets","abonnes":"74","vuesMed":"3,7 k","pays":"CA"},{"pseudo":"symoneakira.cooks","abonnes":"4","vuesMed":"1,2 k","pays":"US"},{"pseudo":"nickistrunk.cooks","abonnes":"982","vuesMed":"1,1 k","pays":"US"},{"pseudo":"lulu.budget","abonnes":"126","vuesMed":"601","pays":"CA"},{"pseudo":"janelyncook","abonnes":"57","vuesMed":"564","pays":"CA"},{"pseudo":"taylor.budget","abonnes":"10","vuesMed":"357","pays":"US"}]},{"nom":"FocusTown","store":"FocusTown : Minuteur Pomodoro","logo":"/media/simulateur/focustown.jpg","comptes":50,"comptesFR":0,"videosSemaine":432,"meilleure":{"vues":"165 k","compte":"yellen_forellen","video":"7707246180899573025"},"note":{"note":"4,7","avis":"2,1 k"},"prix":{"min":"0,99","max":"34,99"},"accroches":[{"texte":"why does this study room kinda looks like a horror movie","vuesTxt":"5,7 k","compte":"amiesstudycorner","comptes":1,"video":"7709462763969514785"},{"texte":"macbeth is so much more interesting when you realise it’s basically a fan fic","vuesTxt":"4,6 k","compte":"downtownacademic","comptes":1,"video":"7710709185335315715"},{"texte":"WAIT THERE‘S A WINTER CAFE TO READ WITH FRIENDS ONLINE?!","vuesTxt":"3,9 k","compte":"amiesstudycorner","comptes":1,"video":"7711991636317801761"}],"quoi":"Minuteur Pomodoro","reseau":[{"pseudo":"jiwoostudy","abonnes":"7,2 k","vuesMed":"29,7 k","pays":"KR"},{"pseudo":"jsparkstudy","abonnes":"2,9 k","vuesMed":"8,1 k","pays":"GB"},{"pseudo":"amiesstudycorner","abonnes":"937","vuesMed":"4,2 k","pays":"DE"},{"pseudo":"lisa.studycorner","abonnes":"4,9 k","vuesMed":"3 k","pays":"AL"},{"pseudo":"alessio.studies","abonnes":"5 k","vuesMed":"2,5 k","pays":"CA"},{"pseudo":"allie.studycorner","abonnes":"3,5 k","vuesMed":"2,5 k","pays":"US"}]},{"nom":"EcoGPT","store":"EcoGPT","logo":"/media/simulateur/ecogpt.jpg","comptes":130,"comptesFR":0,"videosSemaine":426,"meilleure":{"vues":"98,4 k","compte":"ecowithlourdes","video":"7709927167127325973"},"note":{"note":"4,7","avis":"1,3 k"},"prix":{"min":"6,99","max":"79,99"},"accroches":[{"texte":"Coincidences that could happen only once in a lifetime","vuesTxt":"1,7 M","compte":"plainachos","comptes":1,"video":"7707806717182004511"},{"texte":"Photos of times people forgot something and faced the consequences Pt.13","vuesTxt":"1,5 M","compte":"plainachos","comptes":2,"video":"7708832040137035038"},{"texte":"La vaquita marina está extinta","vuesTxt":"901 k","compte":"ecologiacongaby","comptes":8,"video":"7710416614897880340"}],"quoi":"Application d'IA conversationnelle présentée par les créatrices comme un moyen d'agir pour la planète à travers ses usages quotidiens","reseau":[{"pseudo":"blueforgood","abonnes":"528 k","vuesMed":"549 k","pays":"GB"},{"pseudo":"devix516","abonnes":"95,8 k","vuesMed":"126 k","pays":"DE"},{"pseudo":"plainachos","abonnes":"47 k","vuesMed":"77,3 k","pays":"US"},{"pseudo":"savetheplanettoday1","abonnes":"133 k","vuesMed":"63 k","pays":"GB"},{"pseudo":"earthsimpact","abonnes":"63,7 k","vuesMed":"34,9 k","pays":"GB"},{"pseudo":"ecogpt.vale","abonnes":"71,2 k","vuesMed":"33,8 k","pays":"MX"}]}]},{"nom":"Foi","apps":23,"vuesParVideo":4871,"top":[{"nom":"Sacred Shorts","store":"Sacred Shorts: Bible Videos","logo":"/media/simulateur/sacred-shorts.jpg","comptes":54,"comptesFR":0,"videosSemaine":715,"meilleure":{"vues":"392","compte":"guadalupedolores33","video":"7710685921921731861"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"14,99","max":"69,99"},"accroches":[{"texte":"le regalé esto a mi mamá en su cumpleaños y lloró","vuesTxt":"190","compte":"julianagarcia4007","comptes":2,"video":"7709334200461151508"},{"texte":"pidió su herencia antes de tiempo y la perdió toda","vuesTxt":"183","compte":"alexandraquizano","comptes":3,"video":"7708835521094798612"},{"texte":"mi hermano en el ejército me pidió que se la recomendara","vuesTxt":"181","compte":"melisagomez747","comptes":4,"video":"7708834799347174708"}],"quoi":"Bible Videos","reseau":[{"pseudo":"lucia.pilar98","abonnes":"22","vuesMed":"146","pays":"MX"},{"pseudo":"estheravv0","abonnes":"73","vuesMed":"146","pays":"MX"},{"pseudo":"vic_predica","abonnes":"33","vuesMed":"142","pays":"MX"},{"pseudo":"gabby_guille","abonnes":"30","vuesMed":"139","pays":"MX"},{"pseudo":"peyton.walker96","abonnes":"3","vuesMed":"74","pays":"US"}]},{"nom":"Tarteel","store":"Tarteel: Coran et Mémorisation","logo":"/media/simulateur/tarteel.jpg","comptes":50,"comptesFR":4,"videosSemaine":217,"meilleure":{"vues":"10,4 k","compte":"tarteel.travel","video":"7711109620495928589"},"note":{"note":"4,8","avis":"2,9 k"},"prix":{"min":"14,99","max":"249,99"},"accroches":[{"texte":"“Find peace in Quran after a long day”","vuesTxt":"34,8 k","compte":"muhammadibrahim007458","comptes":1,"video":"7710354141012380935"},{"texte":"MK : Muroja'ah dengan irama \"jiharka\"","vuesTxt":"34,5 k","compte":"iqbalrajasaa","comptes":1,"video":"7709421671882427654"},{"texte":"POV: Your friend gets put in charge of the Hifz class","vuesTxt":"16,7 k","compte":"zafrul18","comptes":1,"video":"7711058774496169238"}],"quoi":"Coran et Mémorisation","reseau":[{"pseudo":"islamic.clips113","abonnes":"4,7 k","vuesMed":"104 k","pays":"EG"},{"pseudo":"nassim_2510","abonnes":"76,9 k","vuesMed":"60,8 k","pays":"FR"},{"pseudo":"iqbalrajasaa","abonnes":"389 k","vuesMed":"58,2 k","pays":"ID"},{"pseudo":"muhammadibrahim007458","abonnes":"99,7 k","vuesMed":"46,2 k","pays":"GH"},{"pseudo":"sanasidiabasse","abonnes":"967 k","vuesMed":"28,2 k","pays":"EG"},{"pseudo":"mazeyy","abonnes":"91,9 k","vuesMed":"22,1 k","pays":"GB"}]},{"nom":"Scroll The Bible","store":"Scroll The Bible","logo":"/media/simulateur/scroll-the-bible.jpg","comptes":29,"comptesFR":0,"videosSemaine":159,"meilleure":{"vues":"665 k","compte":"juless4jesus","video":"7711219585697058062"},"note":{"note":"4,9","avis":"30"},"prix":{"min":"5,99","max":"44,99"},"accroches":[{"texte":"God wants you To pray against Anxiety & worry!","vuesTxt":"14,2 k","compte":"cirley.ruballo","comptes":2,"video":"7711527992677174559"},{"texte":"God wants you to hear his voice this week","vuesTxt":"12,3 k","compte":"jodavscroll","comptes":1,"video":"7711583732796378382"},{"texte":"A message from God for YOU","vuesTxt":"6,3 k","compte":"jodavscroll","comptes":1,"video":"7711615722098527502"}],"quoi":"App qui propose des sujets de prière quotidiens et des passages bibliques à partir de la Parole de Dieu","reseau":[{"pseudo":"gabereadsbible","abonnes":"13,7 k","vuesMed":"20 k","pays":"US"},{"pseudo":"leila.lovesjesus","abonnes":"3,9 k","vuesMed":"14,8 k","pays":"US"},{"pseudo":"johnsbiblescrolls","abonnes":"1,4 k","vuesMed":"11,5 k","pays":"US"},{"pseudo":"cirley.ruballo","abonnes":"4,4 k","vuesMed":"8,2 k","pays":"US"},{"pseudo":"audrey.scrollthebible","abonnes":"20,9 k","vuesMed":"7,5 k","pays":"US"},{"pseudo":"izackforchrist","abonnes":"10,2 k","vuesMed":"5,3 k","pays":"US"}]}]},{"nom":"Beauté IA","apps":23,"vuesParVideo":11777,"top":[{"nom":"Fits","store":"Fits – Closet & Outfit Maker","logo":"/media/simulateur/fits.jpg","comptes":11,"comptesFR":1,"videosSemaine":67,"meilleure":{"vues":"699","compte":".username._.com","video":"7710009869608307971"},"note":{"note":"4,5","avis":"1,3 k"},"prix":{"min":"1,99","max":"79,99"},"accroches":[],"quoi":"Closet & Outfit Maker","reseau":[]},{"nom":"Tatship","store":"Tatship: Simulateur Tatouage","logo":"/media/simulateur/tatship.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"1,5 k","compte":"tatshiphq","video":"7711336534154218765"},"note":{"note":"4,4","avis":"118"},"prix":{"min":"14,99","max":"39,99"},"accroches":[{"texte":"Tattoo request forms are HARD for clients","vuesTxt":"106","compte":"tatshiphq","comptes":1,"video":"7712079092878757133"},{"texte":"my tattoo artist just sent me this app to use before my appointment","vuesTxt":"38","compte":"tatshiphq","comptes":1,"video":"7711801152064572703"}],"quoi":"Simulateur Tatouage","reseau":[{"pseudo":"theinkdiary6","abonnes":"245","vuesMed":"1,7 k","pays":"US"},{"pseudo":"tattooswithjas","abonnes":"62","vuesMed":"564","pays":"US"},{"pseudo":"tatshiphq","abonnes":"663","vuesMed":"103","pays":"US"}]},{"nom":"Closfi","store":"Closfi: Tu Clóset Virtual IA","logo":"/media/simulateur/closfi.jpg","comptes":21,"comptesFR":0,"videosSemaine":19,"meilleure":{"vues":"4,5 k","compte":"carolina_outfits","video":"7709294200990321926"},"note":null,"prix":{"min":"3,99","max":"59,99"},"accroches":[],"quoi":"Tu Clóset Virtual IA","reseau":[{"pseudo":"rosa.anaya.rivera","abonnes":"36","vuesMed":"1,8 k","pays":"CO"},{"pseudo":"mcami.style","abonnes":"15","vuesMed":"1,2 k","pays":"CO"},{"pseudo":"lisyeoutfits_","abonnes":"30","vuesMed":"843","pays":"CO"},{"pseudo":"mariangelic_7","abonnes":"6","vuesMed":"800","pays":"CO"},{"pseudo":"closfi.app","abonnes":"1,3 k","vuesMed":"796","pays":"CO"},{"pseudo":"nazafashion24","abonnes":"24","vuesMed":"782","pays":"CO"}]}]},{"nom":"Jalousie et ex","apps":22,"vuesParVideo":4219,"top":[{"nom":"The Cringe","store":"The Cringe: Chat Wrapped","logo":"/media/simulateur/the-cringe.jpg","comptes":14,"comptesFR":2,"videosSemaine":95,"meilleure":{"vues":"144 k","compte":"ele_peivateaccoun","video":"7710709720662674721"},"note":{"note":"4,0","avis":"849"},"prix":{"min":"9,99","max":"44,99"},"accroches":[],"quoi":"Chat Wrapped","reseau":[{"pseudo":"paul.crown4","abonnes":"104","vuesMed":"33,4 k","pays":"FR"},{"pseudo":"andra_privateacc","abonnes":"2,8 k","vuesMed":"8,4 k","pays":"RO"},{"pseudo":"anastasia_private3","abonnes":"412","vuesMed":"4,8 k","pays":"DE"},{"pseudo":"laure_privateacco","abonnes":"163","vuesMed":"3,8 k","pays":"FR"},{"pseudo":"dorcsyy_privateacc2","abonnes":"401","vuesMed":"2 k","pays":"HU"},{"pseudo":"privateacc_lucy","abonnes":"1,2 k","vuesMed":"1,3 k","pays":"ES"}]},{"nom":"Red Flag","store":"Red Flag: Track Recent Follows","logo":"/media/simulateur/red-flag.jpg","comptes":21,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":{"note":"5,0","avis":"1"},"prix":{"min":"3,99","max":"89,99"},"accroches":[],"quoi":"Track Recent Follows","reseau":[{"pseudo":"loveradaron","abonnes":"45","vuesMed":"1,6 k","pays":"US"},{"pseudo":"lovesignalcheck","abonnes":"9","vuesMed":"1,5 k","pays":"US"},{"pseudo":"theglowupfiles0","abonnes":"2","vuesMed":"1,5 k","pays":"US"},{"pseudo":"theredflagfiles","abonnes":"4","vuesMed":"1,4 k","pays":"US"},{"pseudo":"emotionalredflags","abonnes":"321","vuesMed":"1,4 k","pays":"US"},{"pseudo":"decodeyourdesign","abonnes":"2","vuesMed":"1,2 k","pays":"US"}]},{"nom":"Lucen","store":"Lucen: AI Text Dating Advice","logo":"/media/simulateur/lucen.jpg","comptes":1,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":null,"prix":null,"accroches":[],"quoi":"AI Text Dating Advice","reseau":[{"pseudo":"kerijagal","abonnes":"109","vuesMed":"716","pays":"US"}]}]},{"nom":"Bien-être mental","apps":18,"vuesParVideo":1580,"top":[{"nom":"Daimon","store":"Daimon: Honest Advice","logo":"/media/simulateur/daimon.jpg","comptes":5,"comptesFR":0,"videosSemaine":26,"meilleure":{"vues":"304 k","compte":"evelyn.0935","video":"7710878609850010910"},"note":{"note":"4,9","avis":"904"},"prix":{"min":"0,99","max":"9,99"},"accroches":[],"quoi":"Honest Advice","reseau":[{"pseudo":"siennaa260","abonnes":"511","vuesMed":"1,1 k","pays":"US"}]},{"nom":"Gratitude Plus","store":"Gratitude Plus – Journal","logo":"/media/simulateur/gratitude-plus.jpg","comptes":5,"comptesFR":0,"videosSemaine":24,"meilleure":{"vues":"10,2 k","compte":"chaos_butmakeitcute_ish","video":"7711057129750203662"},"note":{"note":"4,9","avis":"41"},"prix":{"min":"6,99","max":"399,99"},"accroches":[{"texte":"I was tired of checking by bank account before every purchase So I started making videos of myself doing simple tasks around the house And p","vuesTxt":"275","compte":"pis.taschio","comptes":1,"video":"7711600228968762637"}],"quoi":"Journal","reseau":[{"pseudo":"gratitudebrooklyn","abonnes":"48","vuesMed":"24,8 k","pays":"US"},{"pseudo":"chaos_butmakeitcute_ish","abonnes":"16","vuesMed":"326","pays":"US"},{"pseudo":"gratitude.caroline","abonnes":"575","vuesMed":"293","pays":"US"},{"pseudo":"jane.gratitude","abonnes":"407","vuesMed":"267","pays":"US"},{"pseudo":"pis.taschio","abonnes":"4","vuesMed":"128","pays":"US"}]},{"nom":"Cora","store":"Cora - Become Her","logo":"/media/simulateur/cora.jpg","comptes":3,"comptesFR":0,"videosSemaine":4,"meilleure":{"vues":"737","compte":"becomingherpru","video":"7711053380331883798"},"note":{"note":"4,4","avis":"34"},"prix":{"min":"6,99","max":"49,99"},"accroches":[],"quoi":"Become Her","reseau":[{"pseudo":"chloefitco","abonnes":"48","vuesMed":"1,6 k","pays":"US"},{"pseudo":"becomingherpru","abonnes":"777","vuesMed":"737","pays":"GB"},{"pseudo":"fitnesswithcorrin","abonnes":"34","vuesMed":"448","pays":"US"}]}]},{"nom":"Séduction IA","apps":17,"vuesParVideo":18550,"top":[{"nom":"Liggo","store":"Liggo: Phrases de Drague IA","logo":"/media/simulateur/liggo.jpg","comptes":17,"comptesFR":0,"videosSemaine":111,"meilleure":{"vues":"492 k","compte":"inspectordelrizz","video":"7710020762337365268"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"3,99","max":"39,99"},"accroches":[{"texte":"quien me acompaña a un casamiento quien es la afortunada?","vuesTxt":"492 k","compte":"inspectordelrizz","comptes":2,"video":"7710020762337365268"},{"texte":"mi Sabés bien que nunca de cosas por vos, siempre fu JAJAJAJ QUE MANERA DE REÍRME que romántico que sos amigo!! mi wacha está durmiendo al l","vuesTxt":"58,1 k","compte":"santidigraziaa","comptes":1,"video":"7710072887532604693"},{"texte":"DIOSITO DESÉAME SUERTE","vuesTxt":"33,4 k","compte":"mrrizz49","comptes":1,"video":"7710027247943568662"}],"quoi":"Phrases de Drague IA","reseau":[{"pseudo":"elbegsito_","abonnes":"891 k","vuesMed":"190 k","pays":"PE"},{"pseudo":"santidigraziaa","abonnes":"85,9 k","vuesMed":"42,4 k","pays":"AR"},{"pseudo":"profesorliggo","abonnes":"29,8 k","vuesMed":"21 k","pays":"AR"},{"pseudo":"leony2x","abonnes":"103 k","vuesMed":"17,1 k","pays":"AR"},{"pseudo":"la_mvnc","abonnes":"36,3 k","vuesMed":"10,4 k","pays":"CO"},{"pseudo":"storiedichatfakee","abonnes":"28,2 k","vuesMed":"7,9 k","pays":"IT"}]},{"nom":"Trick AI","store":"Trick AI","logo":"/media/simulateur/trick-ai.jpg","comptes":2,"comptesFR":0,"videosSemaine":36,"meilleure":{"vues":"70,8 k","compte":"ustamanipulator","video":"7709913632540200199"},"note":{"note":"5,0","avis":"1"},"prix":{"min":"1,99","max":"69,99"},"accroches":[{"texte":"Beni arkadaş bölgesine attı. Sonra arkadaşlığımdan şikâyet etti.","vuesTxt":"1,2 k","compte":"manipulasyonustasi","comptes":1,"video":"7711809213969763591"},{"texte":"Partide başka biriyle öpüştü. Ertesi gün \"sarhoştum, sayılmaz\" dedi.","vuesTxt":"385","compte":"manipulasyonustasi","comptes":1,"video":"7711747195254410504"},{"texte":"Beni telefonuna \"Ayşe Hoca\" diye kaydetmiş. Meğer başka biriyle sevgiliymiş.","vuesTxt":"304","compte":"ustamanipulator","comptes":1,"video":"7711360663272099079"}],"quoi":"Application qui aide à décoder et écrire les messages dans une conversation amoureuse, avec des conseils de réponse","reseau":[{"pseudo":"manipulasyonustasi","abonnes":"2,5 k","vuesMed":"1,2 k","pays":"TR"},{"pseudo":"ustamanipulator","abonnes":"2,3 k","vuesMed":"870","pays":"TR"}]},{"nom":"Yazcam","store":"Yazcam : Assistant Chat IA","logo":"/media/simulateur/yazcam.jpg","comptes":2,"comptesFR":0,"videosSemaine":10,"meilleure":{"vues":"7,8 k","compte":"alfaflort","video":"7710996900811525383"},"note":null,"prix":{"min":"5,99","max":"79,99"},"accroches":[{"texte":"1 Haftadır konuştuğum Flört \"sevgilim var\" dedi","vuesTxt":"4,2 k","compte":"tavlarizz","comptes":1,"video":"7711472131514617106"},{"texte":"POV: Kız 'ben çok kıskancım, baştan söyleyeyim' dedi ve sen kıskançlık yarışması açtın","vuesTxt":"553","compte":"alfaflort","comptes":1,"video":"7711831768579493138"}],"quoi":"Assistant Chat IA","reseau":[{"pseudo":"tavlarizz","abonnes":"3 k","vuesMed":"5,2 k","pays":"TR"},{"pseudo":"alfaflort","abonnes":"238","vuesMed":"3,5 k","pays":"TR"}]}]},{"nom":"Rencontres","apps":17,"vuesParVideo":9647,"top":[{"nom":"Bump","store":"Bump - va voir tes amis IRL","logo":"/media/simulateur/bump.jpg","comptes":74,"comptesFR":7,"videosSemaine":302,"meilleure":{"vues":"621 k","compte":"brendon.bump","video":"7710034092078763286"},"note":{"note":"4,9","avis":"12 k"},"prix":{"min":"2,49","max":"34,99"},"accroches":[{"texte":"Azt mondja ne talizzunk ma, sokat dolgozott, inkább alszik... Most tényleg ennyire madárnak tűnök?","vuesTxt":"779 k","compte":"szaffi.bump","comptes":4,"video":"7708325383120178454"},{"texte":"Bumpon a kacsás játékba is lehetne ilyen funkció","vuesTxt":"621 k","compte":"brendon.bump","comptes":2,"video":"7710034092078763286"},{"texte":"Avisando al resto del grupo que encontramos EL sitio","vuesTxt":"345 k","compte":"gabyb2609","comptes":1,"video":"7709923930659704096"}],"quoi":"Va voir tes amis IRL","reseau":[{"pseudo":"sofi.bump","abonnes":"959","vuesMed":"233 k","pays":"BE"},{"pseudo":"riribump8","abonnes":"886","vuesMed":"138 k","pays":"FR"},{"pseudo":"radatedi.bump","abonnes":"1,6 k","vuesMed":"115 k","pays":"BG"},{"pseudo":"dany.bump","abonnes":"3,4 k","vuesMed":"110 k","pays":"CZ"},{"pseudo":"julioo.no","abonnes":"4,1 k","vuesMed":"74,9 k","pays":"FR"},{"pseudo":"eden.x.bump","abonnes":"1,7 k","vuesMed":"67,1 k","pays":"IL"}]},{"nom":"Milionegle","store":"Milionegle","logo":"/media/simulateur/milionegle.jpg","comptes":6,"comptesFR":0,"videosSemaine":65,"meilleure":{"vues":"5,1 k","compte":"rebecca.emprende","video":"7710313631069654294"},"note":null,"prix":{"min":"0,99","max":"49,99"},"accroches":[{"texte":"Hackearon la web de mi cliente y me llamó diciendo que fue mi culpa.","vuesTxt":"10,3 k","compte":"gonzles1258","comptes":1,"video":"7711506773764623636"},{"texte":"con una aplicación","vuesTxt":"1,3 k","compte":"hurtaldo","comptes":1,"video":"7711059996775173398"},{"texte":"Entregué la web, el cliente dijo «perfecto» y nunca pagó los últimos $700.","vuesTxt":"1,2 k","compte":"gonzles1258","comptes":1,"video":"7711433814211366165"}],"quoi":"App pour rencontrer d'autres entrepreneurs et développer une mentalité entrepreneuriale","reseau":[{"pseudo":"hurtaldo","abonnes":"4,2 k","vuesMed":"1,2 k","pays":"ES"},{"pseudo":"gonzles1258","abonnes":"55","vuesMed":"1,1 k","pays":"GT"},{"pseudo":"arnauinsights","abonnes":"63","vuesMed":"870","pays":"ES"},{"pseudo":"enzo.lascano10","abonnes":"17","vuesMed":"699","pays":"ES"},{"pseudo":"alvaro.mangrac","abonnes":"4","vuesMed":"493","pays":"GT"},{"pseudo":"milionegle.com","abonnes":"294","vuesMed":null,"pays":"ES"}]},{"nom":"Dion","store":"Dion","logo":"/media/simulateur/dion.jpg","comptes":17,"comptesFR":0,"videosSemaine":41,"meilleure":{"vues":"8,3 k","compte":"gabyandsips","video":"7711092471748398354"},"note":{"note":"4,9","avis":"53"},"prix":{"min":"24,99","max":"359,99"},"accroches":[],"quoi":"Application de mise en relation sur invitation pour rencontrer de nouvelles personnes et développer son réseau","reseau":[{"pseudo":"dxbytheglass","abonnes":"222","vuesMed":"7,5 k","pays":"AE"},{"pseudo":"revekkapal","abonnes":"475","vuesMed":"2,6 k","pays":"US"},{"pseudo":"dxbgirlsclub","abonnes":"204","vuesMed":"1,8 k","pays":"AE"},{"pseudo":"_littlelondonlife","abonnes":"70","vuesMed":"1,6 k","pays":"GB"},{"pseudo":"psmiamivibes","abonnes":"48","vuesMed":"744","pays":"ES"},{"pseudo":"genevainmiami","abonnes":"257","vuesMed":"708","pays":"US"}]}]},{"nom":"Finance","apps":17,"vuesParVideo":4049,"top":[{"nom":"Zoya","store":"Zoya: Halal Investing App","logo":"/media/simulateur/zoya.jpg","comptes":4,"comptesFR":0,"videosSemaine":31,"meilleure":{"vues":"96 k","compte":"malak.finance","video":"7710788908916788494"},"note":{"note":"4,8","avis":"83"},"prix":{"min":"4,99","max":"129,99"},"accroches":[{"texte":"realizing that islam gives you instructions on everything including your finances, wealth, and halal investing","vuesTxt":"3,2 k","compte":"keishaonwealth","comptes":1,"video":"7711143938639400223"},{"texte":"girls who invest >","vuesTxt":"868","compte":"keishaonwealth","comptes":1,"video":"7711144567369731342"}],"quoi":"Halal Investing App","reseau":[]},{"nom":"WeStash","store":"WeStash: Budget & Épargne","logo":"/media/simulateur/westash.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"4,3 k","compte":"eliestash","video":"7712115282680089878"},"note":{"note":"4,4","avis":"28"},"prix":{"min":"3,99","max":"24,99"},"accroches":[],"quoi":"Budget & Épargne","reseau":[{"pseudo":"lilistash56","abonnes":"99","vuesMed":"2 k","pays":"EE"},{"pseudo":"eliestash","abonnes":"343","vuesMed":"716","pays":"EE"},{"pseudo":"aliciastash","abonnes":"20","vuesMed":"510","pays":"EE"}]},{"nom":"Finzee","store":"Finzee - Budget planner","logo":"/media/simulateur/finzee.jpg","comptes":13,"comptesFR":11,"videosSemaine":20,"meilleure":{"vues":"270 k","compte":"budget.forgirls","video":"7711038070874819872"},"note":{"note":"4,8","avis":"791"},"prix":{"min":"4,99","max":"99,99"},"accroches":[],"quoi":"Budget planner","reseau":[{"pseudo":"budget.forgirls","abonnes":"2,8 k","vuesMed":"9,9 k","pays":"FR"},{"pseudo":"hello.budget","abonnes":"269","vuesMed":"4,9 k","pays":"FR"},{"pseudo":"lartdubudget","abonnes":"10,7 k","vuesMed":"3 k","pays":"NL"},{"pseudo":"economiesmalines1","abonnes":"12 k","vuesMed":"2,8 k","pays":"FR"},{"pseudo":"budget.julian","abonnes":"260","vuesMed":"1,2 k","pays":"FR"},{"pseudo":"finzee.app.budget","abonnes":"403","vuesMed":"971","pays":"FR"}]}]},{"nom":"Couple","apps":9,"vuesParVideo":5149,"top":[{"nom":"Amorly","store":"Amorly: Jeux de Couple & Quiz","logo":"/media/simulateur/amorly.jpg","comptes":2,"comptesFR":0,"videosSemaine":50,"meilleure":{"vues":"258 k","compte":"mayanowak076","video":"7710313265775054112"},"note":{"note":"2,0","avis":"2"},"prix":{"min":"5,99","max":"79,99"},"accroches":[{"texte":"4 oznaki, że twoja dziewczyna naprawdę cię kocha >>>","vuesTxt":"182 k","compte":"majanowak074","comptes":2,"video":"7711359646866345248"},{"texte":"Oznaki, że bombarduje cię miłością","vuesTxt":"15,8 k","compte":"mayanowak076","comptes":1,"video":"7711374442089286945"},{"texte":"13 czerwonych flag w związku ; Przeczytaj to >","vuesTxt":"556","compte":"mayanowak076","comptes":1,"video":"7711993201426582823"}],"quoi":"Jeux de Couple & Quiz","reseau":[{"pseudo":"majanowak074","abonnes":"7 k","vuesMed":"18 k","pays":"PL"},{"pseudo":"mayanowak076","abonnes":"871","vuesMed":"3,8 k","pays":"PL"}]},{"nom":"Pukutan","store":"Pukutan: Journal & Élevage","logo":"/media/simulateur/pukutan.jpg","comptes":30,"comptesFR":0,"videosSemaine":37,"meilleure":{"vues":"4,5 k","compte":"kydropout","video":"7709343468132322580"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"0,99","max":"69,99"},"accroches":[],"quoi":"Journal & Élevage","reseau":[{"pseudo":"pukutan_eileen","abonnes":"11","vuesMed":"1,7 k","pays":"JP"},{"pseudo":"zhangaxing99","abonnes":"96","vuesMed":"1,6 k","pays":"CN"},{"pseudo":"kawaiipukutan","abonnes":"47","vuesMed":"1,3 k","pays":"JP"},{"pseudo":"vivi._.desu","abonnes":"84","vuesMed":"1,1 k","pays":"CN"},{"pseudo":"pukutan_jp","abonnes":"175","vuesMed":"1 k","pays":"JP"},{"pseudo":"yukarin_coco","abonnes":"1,5 k","vuesMed":"1 k","pays":"JP"}]}]}]};

    const RADAR = 653;
    const NSP = "\u00A0";
    const NB = " ";
    const STEPS = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000];
    const QUICK = [1000, 3000, 5000, 10000];
    const TIMES = [
      { v: 30, l: "30 min", n: 1 },
      { v: 60, l: "1 h", n: 3 },
      { v: 120, l: "2 h", n: 6 },
      { v: 180, l: "3 h +", n: 9 }
    ];
    const OTHER_ORDER = ["Social et loisirs", "Bien-être mental", "Finance", "Création de contenu", "Foi", "Rencontres", "Études", "Langues", "Productivité", "Side hustle", "Beauté IA", "Séduction IA", "Jalousie et ex", "Couple", "Santé et physique"];
    const MAIN_POS = [[66.5, 26.3], [66.3, 78.3], [25.8, 56.5]];
    const MAIN_DELAY = [0.9, 1.75, 2.55];
    const OTHER_POS = [[16.7, 30.8], [43.1, 31], [85.8, 29.3], [90.8, 42.9], [35.9, 88.8], [16.9, 77.9]];
    const OTHER_DELAY = [0.25, 0.5, 0.8, 1.2, 1.5, 2.1];
    const EMO = /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;
    const PARTS = (function () {
      const out = [];
      const n = 22;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (i % 2 ? 0.13 : -0.07);
        const d = 230 + (i % 4) * 40;
        const sz = 6 + (i % 3) * 3;
        const c = ["#0B6FE0", "#4C9AFF", "#7CC4FF"][i % 3];
        out.push({ st: "--dx:" + Math.round(Math.cos(a) * d) + "px;--dy:" + Math.round(Math.sin(a) * d) + "px;width:" + sz + "px;height:" + sz + "px;margin:" + (-sz / 2) + "px 0 0 " + (-sz / 2) + "px;background:" + c + ";animation-delay:" + ((i % 5) * 20) + "ms" });
      }
      return out;
    })();

    function fmtInt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NSP); }
    function plural(n, one, many) { return n > 1 ? many : one; }
    function parseVues(s) {
      if (!s) return 0;
      const m = String(s).replace(/\s/g, "").replace(",", ".").match(/^([\d.]+)([kM]?)$/);
      if (!m) return 0;
      return parseFloat(m[1]) * (m[2] === "M" ? 1e6 : m[2] === "k" ? 1e3 : 1);
    }
    function fmtDur(m) {
      if (m < 60) return m + NB + "min";
      const h = Math.floor(m / 60);
      const r = m % 60;
      return h + NB + "h" + (r ? NB + r : "");
    }
    function fmtVues(lo, hi) {
      const big = hi >= 1e6;
      const div = big ? 1e6 : 1e3;
      const f = (v) => {
        const x = v / div;
        const r = x >= 100 ? Math.round(x) : x >= 10 ? Math.round(x * 10) / 10 : Math.round(x * 100) / 100;
        return String(r).replace(".", ",");
      };
      return { txt: f(lo) + " à " + f(hi) + NB + (big ? "M" : "k"), de: big ? " de vues" : " vues" };
    }
    function bg(src) { return "background-image: url(" + src + ")"; }
    // Le lecteur TikTok du site (le même que l’écran Vidéo de l’app) ; un id qui n'est pas un nombre ne donne aucun lecteur.
    function embed(id, auto) {
      if (!/^\d{8,25}$/.test(String(id || ""))) return "";
      return "https://www.tiktok.com/player/v1/" + id + "?" + (auto ? "autoplay=1&" : "") + "rel=0&description=0&music_info=0&native_context_menu=0";
    }
    function profile(p) { return "https://www.tiktok.com/@" + encodeURIComponent(String(p || "")); }
    function initial(p) { const m = String(p || "").match(/[A-Za-z0-9]/); return m ? m[0].toUpperCase() : "@"; }
    let REGIONS = null;
    try { REGIONS = new Intl.DisplayNames(["fr"], { type: "region" }); } catch (e) {}
    function pays(code) {
      if (!code) return "";
      try { return (REGIONS && REGIONS.of(String(code).toUpperCase())) || code; } catch (e) { return code; }
    }
    function vuesLabel(v) { return v + (/M$/.test(v) ? " de vues" : " vues"); }
    function clean(t) {
      const raw = String(t || "");
      let s = raw.replace(EMO, "");
      s = s.split(/\s*·\s*/).map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
      if (raw.length >= 110) s = s.replace(/[\s,.;:]+$/, "") + "…";
      return s;
    }
    return { DATA, RADAR, NSP, NB, STEPS, QUICK, TIMES, OTHER_ORDER, MAIN_POS, MAIN_DELAY, OTHER_POS, OTHER_DELAY, EMO, PARTS, fmtInt, plural, parseVues, fmtDur, fmtVues, bg, vuesLabel, clean, embed, profile, initial, pays };
  })();

  constructor(props) {
    super(props);
    let rm = false;
    try { rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
    this.rm = rm;
    this.timers = new Set();
    this.stepTimers = new Set();
    this.rid = 0;
    this.state = {
      step: 1, amount: 3000, niche: "Santé et physique", time: 120, budget: "lt100", code: "non", market: "FR",
      app: 0, showCalc: false, paywallOpen: false, pwClosing: false, vidOpen: false, vidClosing: false, leaving: false,
      armed: rm, cp: 0, picked: null, ripple: null, seen: {}, originY: 450
    };
    this.rootRef = (el) => { this.rootEl = el; };
    this.pwRef = (el) => {
      if (el && !this.pwFocused) { this.pwFocused = true; try { el.focus({ preventScroll: true }); } catch (e) {} }
    };
    this.vidRef = (el) => {
      if (el && !this.vidFocused) { this.vidFocused = true; try { el.focus({ preventScroll: true }); } catch (e) {} }
    };
    this.onKey = (e) => { if (e.key === "Escape" && this.state.vidOpen) this.closeVid(); };
  }

  componentDidMount() {
    if (!this.rm) this.later(() => this.setState({ armed: true }), 90, true);
    try { window.addEventListener("keydown", this.onKey); } catch (e) {}
  }

  componentWillUnmount() {
    try { window.removeEventListener("keydown", this.onKey); } catch (e) {}
    this.clearAll();
    if (this.io) { this.io.disconnect(); this.io = null; }
  }

  later(fn, ms, scoped) {
    const set = scoped ? this.stepTimers : this.timers;
    const id = setTimeout(() => { set.delete(id); fn(); }, ms);
    set.add(id);
    return id;
  }
  clearStep() { this.stepTimers.forEach((id) => clearTimeout(id)); this.stepTimers.clear(); }
  clearAll() { this.clearStep(); this.timers.forEach((id) => clearTimeout(id)); this.timers.clear(); }

  go(target, extra) {
    if (this.state.leaving) return;
    this.clearStep();
    let oy = 450;
    try { oy = (window.scrollY || 0) + window.innerHeight * 0.4; } catch (e) {}
    this.setState({ leaving: true, originY: Math.round(oy) });
    this.later(() => this.swap(target, extra), this.rm ? 0 : 300, true);
  }

  swap(target, extra) {
    if (this.io) { this.io.disconnect(); this.io = null; }
    this.pwFocused = false;
    this.setState(Object.assign({
      step: target, leaving: false, armed: this.rm, showCalc: false, paywallOpen: false, pwClosing: false, vidOpen: false, vidClosing: false,
      cp: 0, picked: null, ripple: null, seen: {}
    }, extra || {}));
    try { window.scrollTo(0, 0); } catch (e) {}
    if (!this.rm) this.later(() => this.setState({ armed: true }), 90, true);
    if (target === 7) this.runCalc();
    if (target === 8 || target === 9) this.later(() => this.observe(), 40, true);
  }

  runCalc() {
    if (this.rm) {
      this.setState({ cp: 4 });
      this.later(() => this.go(8), 1600, true);
      return;
    }
    this.later(() => this.setState({ cp: 1 }), 750, true);
    this.later(() => this.setState({ cp: 3 }), 3000, true);
    this.later(() => this.setState({ cp: 4 }), 3090, true);
    this.later(() => this.go(8), 4400, true);
  }

  observe() {
    const root = this.rootEl;
    if (!root) return;
    const els = root.querySelectorAll("[data-reveal]");
    if (typeof IntersectionObserver === "undefined") {
      const all = {};
      els.forEach((el) => { all[el.getAttribute("data-reveal")] = true; });
      this.setState({ seen: all });
      return;
    }
    if (this.io) this.io.disconnect();
    this.io = new IntersectionObserver((entries) => {
      const add = {};
      let any = false;
      entries.forEach((en) => {
        if (en.isIntersecting) {
          add[en.target.getAttribute("data-reveal")] = true;
          any = true;
          if (this.io) this.io.unobserve(en.target);
        }
      });
      if (any) this.setState({ seen: Object.assign({}, this.state.seen, add) });
    }, { threshold: 0.16 });
    els.forEach((el) => this.io.observe(el));
  }

  ripple(e, k) {
    let x = 0, y = 0, w = 0, h = 0;
    try {
      const r = e.currentTarget.getBoundingClientRect();
      w = r.width; h = r.height;
      if (e.clientX || e.clientY) { x = e.clientX - r.left; y = e.clientY - r.top; } else { x = w / 2; y = h / 2; }
    } catch (err) {}
    const s = Math.ceil(2 * Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8);
    this.rid += 1;
    return { k: k, id: this.rid, st: "left:" + Math.round(x - s / 2) + "px;top:" + Math.round(y - s / 2) + "px;width:" + s + "px;height:" + s + "px" };
  }

  choose(field, value, e) {
    if (this.state.leaving) return;
    const rip = this.ripple(e, field + ":" + value);
    const step = this.state.step;
    const patch = { picked: field, ripple: rip };
    patch[field] = value;
    this.setState(patch);
    if (this.autoT) { clearTimeout(this.autoT); this.stepTimers.delete(this.autoT); }
    this.autoT = this.later(() => {
      if (this.state.step === step && !this.state.leaving) this.next();
    }, this.rm ? 150 : 650, true);
  }

  pickAmount(v, e) {
    const rip = this.ripple(e, "amount:" + v);
    this.setState({ amount: v, ripple: rip, armed: true });
  }

  onAmount(e) {
    const { STEPS } = this.constructor.K;
    const i = Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0));
    this.setState({ amount: STEPS[i], armed: true });
  }

  next() { const s = this.state.step; if (s < 7) this.go(s + 1); }
  back() { const s = this.state.step; if (s === 9) this.go(8); else if (s > 1 && s <= 6) this.go(s - 1); }

  openPaywall() { this.pwFocused = false; this.setState({ paywallOpen: true, pwClosing: false }); }
  closePaywall() {
    if (!this.state.paywallOpen || this.state.pwClosing) return;
    this.setState({ pwClosing: true });
    this.later(() => this.setState({ paywallOpen: false, pwClosing: false }), this.rm ? 0 : 240, false);
  }

  // La meilleure vidéo de l'app en clair (écran Résultat), dans une fenêtre : croix, fond ou Échap la ferment.
  openVid() {
    try { this.lastFocus = document.activeElement; } catch (e) {}
    this.vidFocused = false;
    this.setState({ vidOpen: true, vidClosing: false });
  }
  closeVid() {
    if (!this.state.vidOpen || this.state.vidClosing) return;
    this.setState({ vidClosing: true });
    this.later(() => {
      this.setState({ vidOpen: false, vidClosing: false });
      try { if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }, this.rm ? 0 : 240, false);
  }

  info() {
    const { DATA, RADAR, OTHER_ORDER, parseVues } = this.constructor.K;
    const key = this.state.niche + "|" + this.state.market;
    if (this._ik === key) return this._iv;
    let apps, vpv, total, label, nicheNames;
    if (this.state.niche === "*") {
      const all = [];
      DATA.niches.forEach((n) => n.top.forEach((a) => all.push(Object.assign({ niche: n.nom }, a))));
      all.sort((a, b) => parseVues(b.meilleure && b.meilleure.vues) - parseVues(a.meilleure && a.meilleure.vues));
      apps = all.slice(0, 3);
      vpv = 7400;
      total = RADAR;
      label = null;
      nicheNames = apps.map((a) => a.niche);
    } else {
      const n = DATA.niches.find((x) => x.nom === this.state.niche) || DATA.niches[1];
      apps = n.top.map((a) => Object.assign({ niche: n.nom }, a));
      vpv = n.vuesParVideo;
      total = n.apps;
      label = n.nom;
      nicheNames = [n.nom];
    }
    const k = this.state.market === "FR" ? "comptesFR" : "videosSemaine";
    apps.sort((a, b) => (b[k] - a[k]) || (b.videosSemaine - a.videosSemaine));
    const others = [];
    OTHER_ORDER.forEach((nom) => {
      if (others.length >= 6 || nicheNames.indexOf(nom) >= 0) return;
      const n = DATA.niches.find((x) => x.nom === nom);
      if (n && n.top[0]) others.push(n.top[0].logo);
    });
    this._ik = key;
    this._iv = { apps: apps, vpv: vpv, total: total, label: label, others: others };
    return this._iv;
  }

  plan(info) {
    const { fmtInt, plural, fmtDur } = this.constructor.K;
    const s = this.state;
    const lo = s.amount / 3.5 * 1000;
    const hi = s.amount / 2.5 * 1000;
    const vmin = Math.max(1, Math.round(lo / info.vpv / 30));
    const vmax = Math.max(vmin, Math.ceil(hi / info.vpv / 30));
    const comptes = Math.max(1, Math.ceil(vmax / 3));
    const advise = Math.max(30, Math.round(((vmin + vmax) / 2 * 20) / 30) * 30);
    const cap = Math.floor(s.time / 20);
    const manque = Math.max(0, vmin - cap);
    const creas = Math.ceil(manque / 2);
    const cout = manque * 5 * 30;
    const creasTxt = creas + " " + plural(creas, "créatrice", "créatrices");
    const adviseOk = advise <= 600;
    let cas, verdict, pill2;
    if (manque === 0) {
      cas = "A"; verdict = "Faisable avec ton temps"; pill2 = fmtDur(advise) + " par jour";
    } else if (s.budget === "gt500" || (s.budget === "100-500" && cout <= 500)) {
      cas = "B"; verdict = creas === 1 ? "Faisable avec une créatrice" : "Faisable avec " + creasTxt; pill2 = fmtInt(cout) + "\u202F€ par mois";
    } else {
      cas = "C"; verdict = "Trop juste avec " + fmtDur(s.time); pill2 = adviseOk ? fmtDur(advise) + " par jour" : creasTxt;
    }
    const perAcc = Math.ceil(vmax / comptes);
    return { lo: lo, hi: hi, vmin: vmin, vmax: vmax, comptes: comptes, advise: advise, adviseOk: adviseOk, cap: cap, manque: manque, creas: creas, cout: cout, cas: cas, verdict: verdict, pill2: pill2, ok: cas !== "C", perAcc: perAcc };
  }

  digit(d, gone, i) {
    return { dig: true, chr: false, ch: "", cls: gone ? "is-gone" : "", st: "transform: translateY(-" + d + "em); transition-delay: " + (i * 40) + "ms" };
  }
  sep(ch, gone, wide) { return { dig: false, chr: true, ch: ch, cls: (wide ? "is-sep " : "") + (gone ? "is-gone" : ""), st: "" }; }

  rollNum(n, minDigits) {
    const { NB } = this.constructor.K;
    const s = String(Math.max(0, Math.round(n)));
    const L = Math.max(s.length, minDigits || 1);
    const out = [];
    for (let p = 0; p < L; p++) {
      if (p > 0 && p % 3 === 0) out.push(this.sep(NB, p >= s.length, true));
      const d = p < s.length ? +s[s.length - 1 - p] : 0;
      out.push(this.digit(d, p > 0 && p >= s.length, p));
    }
    return out;
  }

  rollStr(str, zero) {
    const { NB } = this.constructor.K;
    const chars = String(str || "").split("");
    const out = [];
    let di = 0;
    for (let i = chars.length - 1; i >= 0; i--) {
      const c = chars[i];
      if (/[0-9]/.test(c)) { out.push(this.digit(zero ? 0 : +c, false, di)); di += 1; }
      else out.push(this.sep(c === " " ? NB : c, false));
    }
    return out;
  }

  opt(field, value) {
    const s = this.state;
    const on = s[field] === value;
    const rp = s.ripple && s.ripple.k === field + ":" + value;
    return {
      on: on,
      checked: on ? "true" : "false",
      cls: on ? "is-on" : (s.picked === field ? "is-off" : ""),
      pick: (e) => this.choose(field, value, e),
      rOn: !!rp,
      rKey: rp ? "r" + s.ripple.id : "r0",
      rSt: rp ? s.ripple.st : ""
    };
  }

  renderVals() {
    const { DATA, RADAR, NSP, NB, STEPS, QUICK, TIMES, MAIN_POS, MAIN_DELAY, OTHER_POS, OTHER_DELAY, PARTS, fmtInt, plural, fmtDur, fmtVues, bg, vuesLabel, clean, embed, profile, initial, pays } = this.constructor.K;
    const s = this.state;
    const pw = this.props.paywall ?? true;
    const film = !pw;
    const info = this.info();
    const P = this.plan(info);
    const step = s.step;
    const seen = this.rm ? { apps: true, hooks: true, accts: true, weeks: true, prix: true, end: true } : (s.seen || {});
    const armed = s.armed;
    const apps = info.apps;
    const nApps = apps.length;

    const segs = [1, 2, 3, 4, 5, 6].map((i) => ({ cls: (i < step || step >= 7) ? "is-on" : (i === step ? "is-on is-cur" : "") }));
    const backOn = (step >= 2 && step <= 6) || step === 9;

    const idx = Math.max(0, STEPS.indexOf(s.amount));
    const perDay = Math.round(s.amount / 30);
    const quick = QUICK.map((v, i) => {
      const o = this.opt("amount", v);
      o.cls = s.amount === v ? "is-on" : "";
      o.pick = (e) => this.pickAmount(v, e);
      o.label = fmtInt(v) + NB + "€";
      o.d = "animation-delay: " + (280 + i * 55) + "ms";
      return o;
    });

    const mk = s.market === "FR" ? "comptesFR" : "videosSemaine";
    const niches = DATA.niches.map((n, i) => Object.assign(this.opt("niche", n.nom), {
      nom: n.nom,
      d: "animation-delay: " + (120 + i * 35) + "ms",
      logos: n.top.slice().sort((a, b) => (b[mk] - a[mk]) || (b.videosSemaine - a.videosSemaine)).map((a, j) => ({ st: "z-index: " + (3 - j) + "; " + bg(a.logo) }))
    }));
    const nsp = this.opt("niche", "*");

    const times = TIMES.map((t, i) => Object.assign(this.opt("time", t.v), {
      l: t.l,
      txt: t.n + " " + plural(t.n, "vidéo", "vidéos") + " par jour",
      d: "animation-delay: " + (80 + i * 55) + "ms",
      vigs: Array.from({ length: t.n }, (_, j) => ({ st: "animation-delay: " + (160 + j * 70) + "ms" }))
    }));

    const radarMain = apps.map((a, i) => ({
      bg: bg(a.logo),
      st: "left: " + MAIN_POS[i][0] + "%; top: " + MAIN_POS[i][1] + "%; animation-delay: " + MAIN_DELAY[i] + "s;",
      pst: "animation-delay: " + (MAIN_DELAY[i] + 0.35) + "s"
    }));
    const radarOthers = info.others.map((src, i) => ({
      bg: bg(src),
      st: "left: " + OTHER_POS[i][0] + "%; top: " + OTHER_POS[i][1] + "%; animation-delay: " + OTHER_DELAY[i] + "s;"
    }));

    const two = P.vmin !== P.vmax;
    const rangeTxt = two ? P.vmin + " à " + P.vmax : String(P.vmin);
    const unitTxt = plural(P.vmax, "vidéo par jour", "vidéos par jour");
    const comptesTxt = P.comptes + " " + plural(P.comptes, "compte", "comptes");
    const V = fmtVues(P.lo, P.hi);
    const lines = [
      { t: fmtInt(s.amount) + NB + "€ ÷ 2,50 à 3,50" + NB + "€ pour 1" + NSP + "000 vues", c: "" },
      { t: "= " + V.txt + V.de + " par mois", c: "" },
      { t: "÷ " + fmtInt(info.vpv) + " vues par vidéo ÷ 30 jours", c: "" },
      { t: "= " + rangeTxt + " " + unitTxt, c: "is-key" },
      { t: P.vmax + " ÷ 3 vidéos par compte = " + comptesTxt, c: "" }
    ];
    if (P.adviseOk) lines.push({ t: "(" + P.vmin + " + " + P.vmax + ") ÷ 2 × 20" + NB + "min ≈ " + fmtDur(P.advise) + " par jour", c: "" });
    lines.push({ t: "Ton temps : " + fmtDur(s.time) + " ÷ 20" + NB + "min = " + P.cap + " " + plural(P.cap, "vidéo", "vidéos") + " par jour", c: "" });
    if (P.cas !== "A") lines.push({ t: "Créatrices : " + P.manque + " × 5" + NB + "€ × 30 = " + fmtInt(P.cout) + NB + "€ par mois", c: "" });
    lines.push({ t: "hypothèse : 2,50 à 3,50" + NB + "€ pour 1" + NSP + "000 vues, pas une promesse de gain", c: "is-note" });
    const calcLines = lines.map((l, i) => ({ t: l.t, c: l.c, st: "transition-delay: " + (s.showCalc ? 120 + i * 55 : 0) + "ms" }));

    const appView = (a) => {
      const best = a.meilleure ? a.meilleure.vues : "";
      const vid = best ? embed(a.meilleure.video) : "";
      return {
        bg: bg(a.logo), nom: a.nom, quoi: a.quoi,
        hasBest: !!best, best: best, bestVid: !!vid, bestTxt: !!best && !vid,
        bestUnit: best ? (/M$/.test(best) ? "de vues sur sa meilleure vidéo" : "vues sur sa meilleure vidéo") : "",
        comptesTxt: fmtInt(a.comptes) + " " + plural(a.comptes, "compte", "comptes"),
        pushTxt: a.comptes > 1 ? "la poussent" : "la pousse"
      };
    };
    const feat = appView(apps[0]);
    // Seule l'app en clair ouvre sa vidéo : en mode paywall, rien des apps verrouillées n'est chargé.
    const M0 = apps[0].meilleure;
    const best = feat.bestVid ? {
      embed: embed(M0.video, true), label: "Meilleure vidéo de " + apps[0].nom,
      title: "Meilleure vidéo de " + apps[0].nom + ", par @" + M0.compte,
      views: vuesLabel(M0.vues), compte: M0.compte, url: profile(M0.compte)
    } : { embed: "", label: "", title: "", views: "", compte: "", url: "" };
    const others = apps.slice(1).map((a, i) => Object.assign(appView(a), {
      open: () => this.go(9, { app: i + 1 }),
      lockLabel: "App " + (i + 2) + " verrouillée, tout débloquer",
      d: "animation-delay: " + (180 + i * 90) + "ms"
    }));
    const restApps = Math.max(0, info.total - nApps);

    const ai = pw ? 0 : Math.min(s.app, nApps - 1);
    const A = apps[ai];
    const accro = (A.accroches || []).filter((h) => h && h.texte);
    let hooks = [];
    // Les cartes sont distribuées depuis le paquet ; une vidéo se pose droite (un lecteur penché se regarde mal).
    const pile = (i, n, flat) => {
      const w = 240;
      const center = (n - 1) / 2;
      const px = Math.round((center - i) * w);
      const fanDeg = flat ? 0 : n > 1 ? (i - center) * (n > 2 ? 3 : 2) : 0;
      const fanY = !flat && Math.abs(i - center) > 0.1 ? 6 : 0;
      const pr = [-7, 5, -2][i % 3];
      return "--px:" + px + "px;--pr:" + pr + "deg;--fan:translateY(" + fanY + "px) rotate(" + fanDeg + "deg);";
    };
    // Chaque accroche : sa vidéo la plus vue, jouable (lecteur TikTok), l'accroche en légende ; sans vidéo, la carte texte.
    if (accro.length) {
      hooks = accro.map((h, i, arr) => {
        const txt = clean(h.texte);
        const nl = txt.split("\n").length;
        const len = txt.length;
        const fs = (len > 95 || nl > 4) ? "font-size: 16px; line-height: 1.3;" : (len > 60 || nl > 2) ? "font-size: 18px; line-height: 1.28;" : "font-size: 20px; line-height: 1.25;";
        const emb = embed(h.video);
        const cap = txt.replace(/\s*\n\s*/g, " ");
        return {
          isVid: !!emb, isTxt: !emb, embed: emb, cap: cap,
          title: "Vidéo de @" + h.compte + " : " + cap,
          txt: txt, fs: fs,
          views: vuesLabel(h.vuesTxt),
          compte: h.compte, url: profile(h.compte),
          more: h.comptes > 1 ? " · " + h.comptes + " comptes" : "",
          st: pile(i, arr.length, !!emb) + "animation-delay:" + (160 + i * 150) + "ms",
          d0: "animation-delay: " + (560 + i * 150) + "ms",
          d1: "animation-delay: " + (620 + i * 150) + "ms",
          d2: "animation-delay: " + (680 + i * 150) + "ms"
        };
      });
    } else if (A.meilleure) {
      const emb = embed(A.meilleure.video);
      hooks = [{
        isVid: !!emb, isTxt: !emb, embed: emb, cap: "Sa meilleure vidéo",
        title: "Meilleure vidéo de " + A.nom + ", par @" + A.meilleure.compte,
        txt: "Sa meilleure vidéo", fs: "font-size: 22px; line-height: 1.2;",
        views: vuesLabel(A.meilleure.vues),
        compte: A.meilleure.compte, url: profile(A.meilleure.compte), more: "",
        st: pile(0, 1, !!emb) + "animation-delay:160ms",
        d0: "animation-delay: 560ms", d1: "animation-delay: 620ms", d2: "animation-delay: 680ms"
      }];
    }
    // Ses vrais comptes TikTok (6 au plus) ; une initiale, jamais d'avatar inventé.
    const reseau = (A.reseau || []).filter((r) => r && r.pseudo).slice(0, 6).map((r, i) => ({
      pseudo: r.pseudo, url: profile(r.pseudo), ini: initial(r.pseudo),
      abonnes: r.abonnes || "", vues: r.vuesMed || "", pays: pays(r.pays),
      d: "animation-delay: " + (120 + i * 70) + "ms"
    }));
    const codeTxt = s.code === "oui" ? "en code" : s.code === "outils" ? "avec des outils sans code" : "sans coder";
    const p3 = Math.min(2, P.perAcc);
    const wk = [
      { k: "Construire", t: "Ta version de l’app, " + codeTxt },
      { k: "Chauffer", t: comptesTxt + " : regarde et like la niche" },
      { k: "Publier", t: p3 + " " + plural(p3, "vidéo", "vidéos") + " par jour et par compte" },
      { k: "Doubler", t: "Ce qui marche, à " + P.perAcc + " " + plural(P.perAcc, "vidéo", "vidéos") + " par jour" }
    ];
    const weeks = wk.map((w, i) => ({
      n: String(i + 1), k: w.k, t: w.t,
      d0: "animation-delay: " + (200 + i * 330) + "ms",
      d1: "animation-delay: " + (300 + i * 330) + "ms",
      d2: "animation-delay: " + (360 + i * 330) + "ms"
    }));
    const prixOn = !!(A.prix && A.prix.min && A.prix.max);
    const nextA = apps[(ai + 1) % nApps];
    const preview = apps.filter((_, i) => i !== ai).slice(0, 2).map((a) => ({ bg: bg(a.logo), nom: a.nom }));

    return {
      paywall: pw,
      film: film,
      rootRef: this.rootRef,
      pwRef: this.pwRef,
      restart: () => this.go(1),
      back: () => this.back(),
      next: () => this.next(),
      segs: segs,
      progNow: String(Math.min(step, 6)),
      backCls: backOn ? "" : "is-hidden",
      backHidden: backOn ? "false" : "true",
      backTab: backOn ? 0 : -1,
      backLabel: step === 9 ? "Retour au plan" : "Question précédente",
      dotsStyle: "transform: translate3d(" + (-step * 18) + "px, " + (-step * 11) + "px, 0)",
      stageCls: s.leaving ? "is-leaving" : "",
      stageStyle: "transform-origin: 50% " + s.originY + "px",
      isStep1: step === 1, isStep2: step === 2, isStep3: step === 3, isStep4: step === 4, isStep5: step === 5,
      isStep6: step === 6, isStep7: step === 7, isStep8: step === 8, isStep9: step === 9,

      amountTxt: fmtInt(s.amount) + NB + "€",
      perDayTxt: fmtInt(perDay) + NB + "€",
      rollAmount: this.rollNum(armed ? s.amount : 0, 5),
      rollDay: this.rollNum(armed ? perDay : 0, 4),
      amountIdx: idx,
      rangeStyle: "--p: " + (idx / 10),
      onAmount: (e) => this.onAmount(e),
      quick: quick,

      niches: niches,
      nsp: nsp,
      times: times,
      b0: this.opt("budget", "0"), b1: this.opt("budget", "lt100"), b2: this.opt("budget", "100-500"), b3: this.opt("budget", "gt500"),
      c0: this.opt("code", "non"), c1: this.opt("code", "outils"), c2: this.opt("code", "oui"),
      m0: this.opt("market", "FR"), m1: this.opt("market", "US"), m2: this.opt("market", "GB"),
      m3: this.opt("market", "ES"), m4: this.opt("market", "BR"), m5: this.opt("market", "ALL"),

      radarMain: radarMain,
      radarOthers: radarOthers,
      rollA: this.rollNum(s.cp >= 1 ? info.total : RADAR, 3),
      lineACls: s.cp >= 3 ? "is-out" : "",
      lineAHidden: s.cp >= 3 ? "true" : "false",
      showB: s.cp >= 3,
      rollB: this.rollNum(s.cp >= 4 ? nApps : info.total, String(info.total).length),
      foundWord: plural(nApps, "app trouvée", "apps trouvées"),
      foundTxt: nApps + " " + plural(nApps, "app trouvée", "apps trouvées"),
      burst: s.cp >= 3,
      coreCls: s.cp >= 3 ? "is-burst" : "",
      parts: PARTS,
      barNow: String(s.cp >= 3 ? 100 : s.cp >= 1 ? 50 : 10),

      bigTxt: rangeTxt + " " + unitTxt,
      twoNums: two,
      rollMin: this.rollNum(armed ? P.vmin : 0, String(P.vmin).length),
      rollMax: this.rollNum(armed ? P.vmax : 0, String(P.vmax).length),
      unitTxt: unitTxt,
      pillAccounts: comptesTxt,
      pillTime: P.pill2,
      pillClock: P.cas === "A" || (P.cas === "C" && P.adviseOk),
      pillCrea: P.cas === "C" && !P.adviseOk,
      pillEuro: P.cas === "B",
      verdict: P.verdict,
      verdictOk: P.ok,
      verdictAim: !P.ok,
      calcCls: s.showCalc ? "is-open" : "",
      calcExp: s.showCalc ? "true" : "false",
      toggleCalc: () => this.setState({ showCalc: !this.state.showCalc }),
      calcLines: calcLines,
      rvApps: seen.apps ? "is-in" : "",
      appsTitle: "Tes " + nApps + " apps à copier",
      feat: feat,
      featStyle: "grid-row: 1 / span " + Math.max(1, nApps - 1) + "; animation-delay: 80ms, 1.6s",
      rollBest: this.rollStr(feat.best, !seen.apps),
      openFeat: () => this.go(9, { app: 0 }),
      openVid: () => this.openVid(),
      best: best,
      others: others,
      openPaywall: () => this.openPaywall(),
      bandD: "animation-delay: " + (260 + nApps * 90) + "ms",
      moreTxt: "+ " + fmtInt(restApps) + " " + plural(restApps, "autre app", "autres apps"),
      moreIn: "dans " + (info.label || "le Radar"),

      s9Key: "s9-" + ai,
      app: {
        bg: bg(A.logo), nom: A.nom, logoAlt: "Logo de " + A.nom,
        sub: A.quoi + (A.note && A.note.note ? "  ·  " + A.note.note + " sur l’App Store" : "")
      },
      hooksOn: hooks.length > 0,
      hooks: hooks,
      rvHooks: seen.hooks ? "is-in" : "",
      acctsOn: reseau.length > 0,
      reseau: reseau,
      planTxt: "Ouvre " + comptesTxt + " comme eux · " + P.perAcc + " " + plural(P.perAcc, "vidéo", "vidéos") + " par jour" + (P.comptes > 1 ? " chacun" : ""),
      planD: "animation-delay: " + (200 + reseau.length * 70) + "ms",
      runA: A.nom + " en fait",
      runN: fmtInt(A.comptes),
      rvAccts: seen.accts ? "is-in" : "",
      weeks: weeks,
      rvWeeks: seen.weeks ? "is-in" : "",
      prixOn: prixOn,
      prixTxt: prixOn ? A.prix.min + " à " + A.prix.max + " €, achats intégrés sur l’App Store" : "",
      rollPmin: this.rollStr(prixOn ? A.prix.min : "", !seen.prix),
      rollPmax: this.rollStr(prixOn ? A.prix.max : "", !seen.prix),
      rvPrix: seen.prix ? "is-in" : "",
      rvEnd: seen.end ? "is-in" : "",
      lockTxt: "La stratégie de " + fmtInt(Math.max(0, info.total - 1)) + " autres apps",
      preview: preview,
      nextBg: bg(nextA.logo),
      nextApp: () => this.go(9, { app: (ai + 1) % nApps }),
      toPlan: () => this.go(8),

      pwOpen: s.paywallOpen,
      pwCls: s.pwClosing ? "is-closing" : "",
      closePaywall: () => this.closePaywall(),

      vidOpen: s.vidOpen && feat.bestVid,
      vidCls: s.vidClosing ? "is-closing" : "",
      vidRef: this.vidRef,
      closeVid: () => this.closeVid()
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw kp-root", "data-theme": "light", "ref": $v.rootRef, "style": "position: relative; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; background: #F6F7F9; color: #0E0F12; font-family: var(--font-body);" },
        $h("div", { "class": "kp-bg", "aria-hidden": "true" },
          $h("span", { "class": "kp-blob kp-b1" }),
          $h("span", { "class": "kp-blob kp-b2" }),
          $h("span", { "class": "kp-blob kp-b3" }),
          $h("span", { "class": "kp-dots", "style": $v.dotsStyle })
        ),
        $h("header", { "style": "position: relative; z-index: 3; flex-shrink: 0; height: clamp(56px, 8vh, 72px); padding: 0 48px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;" },
          $h("a", { "class": "sw-logo kp-home", "href": "/", "aria-label": "kopycat, accueil" },
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
          $h("button", { "type": "button", "class": `kp-back ${$t($v.backCls)}`, "aria-label": $v.backLabel, "aria-hidden": $v.backHidden, "tabindex": $v.backTab, "onClick": $v.back },
            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M19 12H5M11 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          )
        ),
        $h("div", { "role": "progressbar", "aria-label": "Progression", "aria-valuemin": "1", "aria-valuemax": "6", "aria-valuenow": $v.progNow, "style": "position: relative; z-index: 3; flex-shrink: 0; display: flex; justify-content: center; gap: 6px; padding-top: 8px;" },
          ($l($v.segs)).map((g) => [
            $h("span", { "class": `kp-seg ${$t(g?.cls)}` },
              $h("i", null)
            )
          ])
        ),
        $h("div", { "class": `kp-stage ${$t($v.stageCls)}`, "style": $v.stageStyle },
          ($v.isStep1) ? [
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q1", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Combien"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "tu"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "veux"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 165ms;" },
                    "gagner"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 220ms;" },
                    "par"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 275ms;" },
                    "mois ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 46%; width: 720px; height: 720px;" }),
                  $h("p", { "class": "kp-in", "aria-live": "polite", "style": "--trk: 0em; margin: 0; display: flex; align-items: flex-start; height: 1em; font-family: var(--font-display); font-size: min(220px, 19vw, 24vh); line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: #0E0F12; white-space: nowrap; animation-delay: 110ms;" },
                    $h("span", { "class": "visually-hidden" },
                      $t($v.amountTxt), " par mois"
                    ),
                    $h("span", { "class": "kp-roll", "aria-hidden": "true" },
                      ($l($v.rollAmount)).map((c) => [
                        (c?.dig) ? [
                          $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                            $h("span", { "class": "kp-strip", "style": c?.st },
                              $h("span", null,
                                "0"
                              ),
                              $h("span", null,
                                "1"
                              ),
                              $h("span", null,
                                "2"
                              ),
                              $h("span", null,
                                "3"
                              ),
                              $h("span", null,
                                "4"
                              ),
                              $h("span", null,
                                "5"
                              ),
                              $h("span", null,
                                "6"
                              ),
                              $h("span", null,
                                "7"
                              ),
                              $h("span", null,
                                "8"
                              ),
                              $h("span", null,
                                "9"
                              )
                            )
                          )
                        ] : null,
                        (c?.chr) ? [
                          $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                            $t(c?.ch)
                          )
                        ] : null
                      ])
                    ),
                    $h("span", { "aria-hidden": "true", "class": "kp-gtext", "style": "display: block; height: 1em; line-height: 1; margin: 0 -0.12em 0 0.07em; letter-spacing: 0;" },
                      "€"
                    )
                  ),
                  $h("p", { "class": "kp-in", "style": "margin: clamp(8px, 1.8vh, 16px) 0 0; display: inline-flex; align-items: center; height: 40px; padding: 0 18px; border-radius: 999px; background: #FFFFFF; box-shadow: var(--kp-rest); font-size: 16px; line-height: 1; color: #4A4F57; white-space: nowrap; animation-delay: 165ms;" },
                    $h("b", { "style": "margin-right: 6px; font-weight: 600; color: #0E0F12;" },
                      $h("span", { "class": "visually-hidden" },
                        $t($v.perDayTxt)
                      ),
                      $h("span", { "class": "kp-roll kp-inl", "aria-hidden": "true" },
                        ($l($v.rollDay)).map((c) => [
                          (c?.dig) ? [
                            $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                              $h("span", { "class": "kp-strip", "style": c?.st },
                                $h("span", null,
                                  "0"
                                ),
                                $h("span", null,
                                  "1"
                                ),
                                $h("span", null,
                                  "2"
                                ),
                                $h("span", null,
                                  "3"
                                ),
                                $h("span", null,
                                  "4"
                                ),
                                $h("span", null,
                                  "5"
                                ),
                                $h("span", null,
                                  "6"
                                ),
                                $h("span", null,
                                  "7"
                                ),
                                $h("span", null,
                                  "8"
                                ),
                                $h("span", null,
                                  "9"
                                )
                              )
                            )
                          ] : null,
                          (c?.chr) ? [
                            $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                              $t(c?.ch)
                            )
                          ] : null
                        ])
                      ),
                      " €"
                    ),
                    "par jour"
                  )
                ),
                $h("div", { "class": "kp-in", "style": "margin-top: clamp(14px, 4.4vh, 48px); width: 100%; max-width: 640px; animation-delay: 220ms;" },
                  $h("label", { "for": "kp-montant", "class": "visually-hidden" },
                    "Ton objectif par mois, de 500 € à 30 000 €"
                  ),
                  $h("input", { "id": "kp-montant", "class": "kp-range", "type": "range", "min": "0", "max": "10", "step": "1", "value": $v.amountIdx, "aria-valuetext": `${$t($v.amountTxt)} par mois`, "onInput": $v.onAmount, "onChange": $v.onAmount, "style": $v.rangeStyle })
                ),
                $h("div", { "role": "radiogroup", "aria-label": "Montants rapides", "style": "margin-top: clamp(10px, 3vh, 32px); display: flex; justify-content: center; gap: 12px;" },
                  ($l($v.quick)).map((q) => [
                    $h("button", { "type": "button", "role": "radio", "aria-checked": q?.checked, "class": `kp-opt kp-pill kp-in-lite ${$t(q?.cls)}`, "onClick": q?.pick, "style": q?.d },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        (q?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": q?.rKey, "style": q?.rSt })
                        ] : null
                      ),
                      $h("span", { "class": "kp-ptick", "aria-hidden": "true" },
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $t(q?.label)
                    )
                  ])
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 440ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q2", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Quelle"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "niche"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "te"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 165ms;" },
                    "parle ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; width: 100%;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 50%; width: 760px; height: 760px;" }),
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q2", "style": "display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: clamp(10px, 1.8vh, 16px);" },
                    ($l($v.niches)).map((n) => [
                      $h("button", { "type": "button", "role": "radio", "aria-checked": n?.checked, "class": `kp-opt kp-in-lite ${$t(n?.cls)}`, "onClick": n?.pick, "style": `height: clamp(92px, 15.2vh, 128px); padding: clamp(10px, 2vh, 20px) 12px clamp(10px, 2vh, 20px) clamp(14px, 2vh, 20px); box-sizing: border-box; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; ${$t(n?.d)}` },
                        $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                          (n?.rOn) ? [
                            $h("span", { "class": "kp-ripple", "key": n?.rKey, "style": n?.rSt })
                          ] : null
                        ),
                        $h("span", { "aria-hidden": "true", "style": "display: flex;" },
                          ($l(n?.logos)).map((lg) => [
                            $h("span", { "class": "kp-logo kp-img", "style": lg?.st })
                          ])
                        ),
                        $h("span", { "style": "font-size: clamp(14px, 2.3vh, 16px); line-height: 1.2; font-weight: 700; letter-spacing: -0.01em; color: #0E0F12;" },
                          $t(n?.nom)
                        ),
                        $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 16px; right: 16px; width: 22px; height: 22px;" },
                          $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ])
                  )
                ),
                $h("button", { "type": "button", "role": "radio", "aria-checked": $v.nsp?.checked, "class": `kp-link kp-in ${$t($v.nsp?.cls)}`, "onClick": $v.nsp?.pick, "style": "margin-top: clamp(4px, 1.2vh, 16px); min-height: clamp(40px, 6.6vh, 56px); animation-delay: 700ms;" },
                  ($v.nsp?.on) ? [
                    $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "width: 22px; height: 22px;" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ] : null,
                  "Je ne sais pas encore"
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 760ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q3", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Combien"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "de"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "temps"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 165ms;" },
                    "par"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 220ms;" },
                    "jour ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; width: 100%;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 50%; width: 720px; height: 720px;" }),
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q3", "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(10px, 1.8vh, 16px);" },
                    ($l($v.times)).map((t) => [
                      $h("button", { "type": "button", "role": "radio", "aria-checked": t?.checked, "class": `kp-opt kp-in-lite ${$t(t?.cls)}`, "onClick": t?.pick, "style": `height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 24px clamp(16px, 2.8vh, 22px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; ${$t(t?.d)}` },
                        $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                          (t?.rOn) ? [
                            $h("span", { "class": "kp-ripple", "key": t?.rKey, "style": t?.rSt })
                          ] : null
                        ),
                        $h("span", { "style": "font-family: var(--font-display); font-size: clamp(34px, 6vh, 44px); line-height: 1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap;" },
                          $t(t?.l)
                        ),
                        $h("span", { "aria-hidden": "true", "style": "margin-top: auto; display: flex; gap: 4px;" },
                          ($l(t?.vigs)).map((v) => [
                            $h("span", { "class": "kp-v" },
                              $h("i", { "style": v?.st })
                            )
                          ])
                        ),
                        $h("span", { "class": "kp-tlab", "style": "margin-top: clamp(8px, 2vh, 16px); height: 20px; font-size: 16px; line-height: 20px; font-weight: 600; color: #0A63C9; white-space: nowrap;" },
                          $t(t?.txt)
                        ),
                        $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                          $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ])
                  )
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 330ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q4", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Ton"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "budget"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "par"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 165ms;" },
                    "mois ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; width: 100%;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 50%; width: 720px; height: 720px;" }),
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q4", "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(10px, 1.8vh, 16px);" },
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.b0?.checked, "class": `kp-opt kp-in-lite ${$t($v.b0?.cls)}`, "onClick": $v.b0?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 24px clamp(16px, 3.2vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; text-align: left; animation-delay: 80ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.b0?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.b0?.rKey, "style": $v.b0?.rSt })
                        ] : null
                      ),
                      $h("svg", { "class": "kp-coinsvg", "width": "128", "height": "128", "viewBox": "0 0 56 56", "aria-hidden": "true", "style": "display: block; overflow: visible;" },
                        $h("g", { "class": "kp-coins", "fill": "#FFFFFF", "stroke-width": "0.8", "stroke-linecap": "round", "stroke-linejoin": "round" },
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 40ms;" },
                            $h("path", { "d": "M10 41V48A18 5.5 0 0 0 46 48V41" }),
                            $h("ellipse", { "cx": "28", "cy": "41", "rx": "18", "ry": "5.5" }),
                            $h("ellipse", { "cx": "28", "cy": "41", "rx": "11", "ry": "3.2", "stroke-opacity": "0.45" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
                        "0 €"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.b1?.checked, "class": `kp-opt kp-in-lite ${$t($v.b1?.cls)}`, "onClick": $v.b1?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 24px clamp(16px, 3.2vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; text-align: left; animation-delay: 135ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.b1?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.b1?.rKey, "style": $v.b1?.rSt })
                        ] : null
                      ),
                      $h("svg", { "class": "kp-coinsvg", "width": "128", "height": "128", "viewBox": "0 0 56 56", "aria-hidden": "true", "style": "display: block; overflow: visible;" },
                        $h("g", { "class": "kp-coins", "fill": "#FFFFFF", "stroke-width": "0.8", "stroke-linecap": "round", "stroke-linejoin": "round" },
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 40ms;" },
                            $h("path", { "d": "M10 41V48A18 5.5 0 0 0 46 48V41" }),
                            $h("ellipse", { "cx": "28", "cy": "41", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 130ms;" },
                            $h("path", { "d": "M10 34V41A18 5.5 0 0 0 46 41V34" }),
                            $h("ellipse", { "cx": "28", "cy": "34", "rx": "18", "ry": "5.5" }),
                            $h("ellipse", { "cx": "28", "cy": "34", "rx": "11", "ry": "3.2", "stroke-opacity": "0.45" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
                        "Moins de 100 €"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.b2?.checked, "class": `kp-opt kp-in-lite ${$t($v.b2?.cls)}`, "onClick": $v.b2?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 24px clamp(16px, 3.2vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; text-align: left; animation-delay: 190ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.b2?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.b2?.rKey, "style": $v.b2?.rSt })
                        ] : null
                      ),
                      $h("svg", { "class": "kp-coinsvg", "width": "128", "height": "128", "viewBox": "0 0 56 56", "aria-hidden": "true", "style": "display: block; overflow: visible;" },
                        $h("g", { "class": "kp-coins", "fill": "#FFFFFF", "stroke-width": "0.8", "stroke-linecap": "round", "stroke-linejoin": "round" },
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 40ms;" },
                            $h("path", { "d": "M10 41V48A18 5.5 0 0 0 46 48V41" }),
                            $h("ellipse", { "cx": "28", "cy": "41", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 130ms;" },
                            $h("path", { "d": "M10 34V41A18 5.5 0 0 0 46 41V34" }),
                            $h("ellipse", { "cx": "28", "cy": "34", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 220ms;" },
                            $h("path", { "d": "M10 27V34A18 5.5 0 0 0 46 34V27" }),
                            $h("ellipse", { "cx": "28", "cy": "27", "rx": "18", "ry": "5.5" }),
                            $h("ellipse", { "cx": "28", "cy": "27", "rx": "11", "ry": "3.2", "stroke-opacity": "0.45" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
                        "100 à 500 €"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.b3?.checked, "class": `kp-opt kp-in-lite ${$t($v.b3?.cls)}`, "onClick": $v.b3?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 24px clamp(16px, 3.2vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; text-align: left; animation-delay: 245ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.b3?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.b3?.rKey, "style": $v.b3?.rSt })
                        ] : null
                      ),
                      $h("svg", { "class": "kp-coinsvg", "width": "128", "height": "128", "viewBox": "0 0 56 56", "aria-hidden": "true", "style": "display: block; overflow: visible;" },
                        $h("g", { "class": "kp-coins", "fill": "#FFFFFF", "stroke-width": "0.8", "stroke-linecap": "round", "stroke-linejoin": "round" },
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 40ms;" },
                            $h("path", { "d": "M10 41V48A18 5.5 0 0 0 46 48V41" }),
                            $h("ellipse", { "cx": "28", "cy": "41", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 130ms;" },
                            $h("path", { "d": "M10 34V41A18 5.5 0 0 0 46 41V34" }),
                            $h("ellipse", { "cx": "28", "cy": "34", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 220ms;" },
                            $h("path", { "d": "M10 27V34A18 5.5 0 0 0 46 34V27" }),
                            $h("ellipse", { "cx": "28", "cy": "27", "rx": "18", "ry": "5.5" })
                          ),
                          $h("g", { "class": "kp-coin", "style": "animation-delay: 310ms;" },
                            $h("path", { "d": "M10 20V27A18 5.5 0 0 0 46 27V20" }),
                            $h("ellipse", { "cx": "28", "cy": "20", "rx": "18", "ry": "5.5" }),
                            $h("ellipse", { "cx": "28", "cy": "20", "rx": "11", "ry": "3.2", "stroke-opacity": "0.45" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
                        "Plus de 500 €"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 330ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q5", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Tu"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "sais"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "coder ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; width: 100%;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 50%; width: 720px; height: 720px;" }),
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q5", "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(10px, 1.8vh, 16px);" },
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.c0?.checked, "class": `kp-opt kp-in-lite ${$t($v.c0?.cls)}`, "onClick": $v.c0?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 28px clamp(16px, 3.4vh, 28px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 80ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.c0?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.c0?.rKey, "style": $v.c0?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-plate", "style": "width: clamp(64px, 12vh, 88px); height: clamp(64px, 12vh, 88px); border-radius: 24px; display: grid; place-items: center;" },
                        $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("g", { "class": "kp-draw", "fill": "none", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round", "style": "--dd: 250ms;" },
                            $h("path", { "pathLength": "1", "d": "M5.4 3.6a4.2 4.2 0 0 1 6 0" }),
                            $h("g", { "transform": "translate(1.2 2.6) scale(0.9)", "stroke-width": "1.33" },
                              $h("path", { "pathLength": "1", "d": "M22 14a8 8 0 0 1-8 8" }),
                              $h("path", { "pathLength": "1", "d": "M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }),
                              $h("path", { "pathLength": "1", "d": "M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" }),
                              $h("path", { "pathLength": "1", "d": "M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" }),
                              $h("path", { "pathLength": "1", "d": "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" })
                            )
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: clamp(22px, 3.8vh, 26px); line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
                        "Pas du tout"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.c1?.checked, "class": `kp-opt kp-in-lite ${$t($v.c1?.cls)}`, "onClick": $v.c1?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 28px clamp(16px, 3.4vh, 28px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 135ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.c1?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.c1?.rKey, "style": $v.c1?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-plate", "style": "width: clamp(64px, 12vh, 88px); height: clamp(64px, 12vh, 88px); border-radius: 24px; display: grid; place-items: center;" },
                        $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("g", { "class": "kp-draw", "fill": "none", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round", "style": "--dd: 330ms;" },
                            $h("rect", { "pathLength": "1", "x": "14", "y": "3", "width": "7", "height": "7", "rx": "1" }),
                            $h("path", { "pathLength": "1", "d": "M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: clamp(22px, 3.8vh, 26px); line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
                        "Avec des outils sans code"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.c2?.checked, "class": `kp-opt kp-in-lite ${$t($v.c2?.cls)}`, "onClick": $v.c2?.pick, "style": "height: clamp(176px, 32vh, 240px); padding: clamp(16px, 3vh, 24px) 28px clamp(16px, 3.4vh, 28px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 190ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.c2?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.c2?.rKey, "style": $v.c2?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-plate", "style": "width: clamp(64px, 12vh, 88px); height: clamp(64px, 12vh, 88px); border-radius: 24px; display: grid; place-items: center;" },
                        $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("g", { "class": "kp-draw", "fill": "none", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round", "style": "--dd: 410ms;" },
                            $h("path", { "pathLength": "1", "d": "M18 16l4-4-4-4" }),
                            $h("path", { "pathLength": "1", "d": "M6 8l-4 4 4 4" }),
                            $h("path", { "pathLength": "1", "d": "M14.5 4l-5 16" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: clamp(22px, 3.8vh, 26px); line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
                        "Oui, je code"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 300ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: clamp(12px, 3.6vh, 56px) 48px clamp(18px, 5.2vh, 72px); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
              $h("h1", { "id": "q6", "style": "margin: 0; max-width: 1040px; text-align: center; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.04; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
                $h("span", { "class": "kp-w" },
                  $h("span", null,
                    "Où"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 55ms;" },
                    "tu"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 110ms;" },
                    "veux"
                  )
                ),
                " ",
                $h("span", { "class": "kp-w" },
                  $h("span", { "style": "animation-delay: 165ms;" },
                    "lancer ?"
                  )
                )
              ),
              $h("div", { "style": "flex: 1 0 auto; width: 100%; max-width: 1040px; padding: clamp(10px, 3.2vh, 32px) 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "style": "position: relative; isolation: isolate; width: 100%;" },
                  $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 50%; width: 720px; height: 720px;" }),
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q6", "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(10px, 1.8vh, 16px);" },
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m0?.checked, "class": `kp-opt kp-in-lite ${$t($v.m0?.cls)}`, "onClick": $v.m0?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 80ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m0?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m0?.rKey, "style": $v.m0?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "animation-delay: 260ms;" },
                        $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                          $h("rect", { "width": "40", "height": "40", "fill": "#FFFFFF" }),
                          $h("rect", { "width": "13.4", "height": "40", "fill": "#0055A4" }),
                          $h("rect", { "x": "26.6", "width": "13.4", "height": "40", "fill": "#EF4135" })
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "France"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m1?.checked, "class": `kp-opt kp-in-lite ${$t($v.m1?.cls)}`, "onClick": $v.m1?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 135ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m1?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m1?.rKey, "style": $v.m1?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "animation-delay: 340ms;" },
                        $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                          $h("rect", { "width": "40", "height": "40", "fill": "#FFFFFF" }),
                          $h("rect", { "y": "0", "width": "40", "height": "5.72", "fill": "#B22234" }),
                          $h("rect", { "y": "11.43", "width": "40", "height": "5.72", "fill": "#B22234" }),
                          $h("rect", { "y": "22.86", "width": "40", "height": "5.72", "fill": "#B22234" }),
                          $h("rect", { "y": "34.29", "width": "40", "height": "5.72", "fill": "#B22234" }),
                          $h("rect", { "width": "21", "height": "22.86", "fill": "#3C3B6E" })
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "États-Unis"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m2?.checked, "class": `kp-opt kp-in-lite ${$t($v.m2?.cls)}`, "onClick": $v.m2?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 190ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m2?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m2?.rKey, "style": $v.m2?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "animation-delay: 420ms;" },
                        $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                          $h("rect", { "width": "40", "height": "40", "fill": "#012169" }),
                          $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#FFFFFF", "stroke-width": "8" }),
                          $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#C8102E", "stroke-width": "2.6" }),
                          $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#FFFFFF", "stroke-width": "11" }),
                          $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#C8102E", "stroke-width": "6" })
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "Royaume-Uni"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m3?.checked, "class": `kp-opt kp-in-lite ${$t($v.m3?.cls)}`, "onClick": $v.m3?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 245ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m3?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m3?.rKey, "style": $v.m3?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "animation-delay: 500ms;" },
                        $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                          $h("rect", { "width": "40", "height": "40", "fill": "#F1BF00" }),
                          $h("rect", { "width": "40", "height": "10", "fill": "#AA151B" }),
                          $h("rect", { "y": "30", "width": "40", "height": "10", "fill": "#AA151B" })
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "Espagne"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m4?.checked, "class": `kp-opt kp-in-lite ${$t($v.m4?.cls)}`, "onClick": $v.m4?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 300ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m4?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m4?.rKey, "style": $v.m4?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "animation-delay: 580ms;" },
                        $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                          $h("rect", { "width": "40", "height": "40", "fill": "#009C3B" }),
                          $h("path", { "d": "M20 6L36 20L20 34L4 20Z", "fill": "#FFDF00" }),
                          $h("circle", { "cx": "20", "cy": "20", "r": "7.5", "fill": "#002776" })
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "Brésil"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("button", { "type": "button", "role": "radio", "aria-checked": $v.m5?.checked, "class": `kp-opt kp-in-lite ${$t($v.m5?.cls)}`, "onClick": $v.m5?.pick, "style": "height: clamp(104px, 19vh, 144px); padding: clamp(14px, 2.8vh, 24px) 28px clamp(14px, 3vh, 26px); box-sizing: border-box; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; animation-delay: 355ms;" },
                      $h("span", { "class": "kp-fx", "aria-hidden": "true" },
                        ($v.m5?.rOn) ? [
                          $h("span", { "class": "kp-ripple", "key": $v.m5?.rKey, "style": $v.m5?.rSt })
                        ] : null
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-flag", "style": "background: #EAF2FF; display: grid; place-items: center; animation-delay: 660ms;" },
                        $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 26px; height: 26px;" },
                          $h("g", { "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            $h("circle", { "cx": "12", "cy": "12", "r": "9.5" }),
                            $h("path", { "d": "M12 2.5a13.5 13.5 0 0 0 0 19a13.5 13.5 0 0 0 0-19" }),
                            $h("path", { "d": "M2.5 12h19" })
                          )
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12;" },
                        "Partout"
                      ),
                      $h("span", { "aria-hidden": "true", "class": "kp-tick", "style": "top: 20px; right: 20px; width: 24px; height: 24px;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ),
              $h("div", { "class": "kp-in", "style": "flex-shrink: 0; animation-delay: 420ms;" },
                $h("span", { "class": "kp-ctaw" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.next },
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
            $h("main", { "style": "position: relative; flex: 1 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: clamp(12px, 3vh, 40px) 48px clamp(16px, 4vh, 56px); box-sizing: border-box;" },
              $h("div", { "aria-hidden": "true", "class": "kp-in", "style": "position: relative; width: clamp(240px, 50vh, 520px); height: clamp(240px, 50vh, 520px); flex-shrink: 0;" },
                $h("span", { "class": "kp-halo", "style": "top: 50%; width: 780px; height: 780px;" }),
                $h("div", { "style": "position: absolute; inset: 0; border-radius: 50%; overflow: hidden; background: radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FBFCFE 62%, #F2F6FD 100%); box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 30px 80px rgba(16,24,40,0.10), inset 0 0 0 1px #E6E6EA;" },
                  $h("span", { "class": "kp-radar-sweep", "style": "position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, rgba(11,111,224,0) 0deg, rgba(11,111,224,0) 250deg, rgba(11,111,224,0.07) 310deg, rgba(11,111,224,0.22) 356deg, rgba(11,111,224,0.85) 359.4deg, rgba(11,111,224,0) 360deg);" }),
                  $h("span", { "style": "position: absolute; left: 12.5%; top: 12.5%; width: 75%; height: 75%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                  $h("span", { "style": "position: absolute; left: 25%; top: 25%; width: 50%; height: 50%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                  $h("span", { "style": "position: absolute; left: 37.5%; top: 37.5%; width: 25%; height: 25%; box-sizing: border-box; border-radius: 50%; border: 1px solid #E3E7EE;" }),
                  $h("span", { "style": "position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #EEF0F4;" }),
                  $h("span", { "style": "position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #EEF0F4;" }),
                  $h("span", { "style": "position: absolute; left: 20%; top: 45%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 55%; top: 12%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 78%; top: 66%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 48%; top: 72%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 30%; top: 18%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 84%; top: 80%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 60%; top: 92%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 10%; top: 62%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 72%; top: 42%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" }),
                  $h("span", { "style": "position: absolute; left: 38%; top: 60%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: #C9CFD8;" })
                ),
                ($v.burst) ? [
                  $h("span", { "class": "kp-flash" })
                ] : null,
                ($l($v.radarOthers)).map((o) => [
                  $h("span", { "class": "kp-blip", "style": `width: 32px; height: 32px; margin: -16px 0 0 -16px; ${$t(o?.st)}` },
                    $h("span", { "class": "kp-img", "style": `width: 32px; height: 32px; border-radius: 9px; opacity: 0.42; ${$t(o?.bg)}` })
                  )
                ]),
                ($l($v.radarMain)).map((o) => [
                  $h("span", { "class": "kp-blip", "style": `width: 56px; height: 56px; margin: -28px 0 0 -28px; ${$t(o?.st)}` },
                    $h("span", { "class": "kp-ping", "style": o?.pst }),
                    $h("span", { "class": "kp-img", "style": `position: relative; width: 56px; height: 56px; border-radius: 15px; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #0B6FE0, 0 12px 28px rgba(11,111,224,0.28); ${$t(o?.bg)}` })
                  )
                ]),
                $h("span", { "class": `kp-core ${$t($v.coreCls)}`, "style": "position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; border-radius: 50%; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: 0 0 0 10px rgba(11,111,224,0.08), 0 16px 40px rgba(11,111,224,0.35), inset 0 1px 0 rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  $h("svg", { "width": "32", "height": "32", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
                  $h("span", { "style": "position: absolute; left: 50%; top: 50%; width: 0; height: 0; z-index: 4;" },
                    ($l($v.parts)).map((p) => [
                      $h("span", { "class": "kp-p", "style": p?.st })
                    ])
                  )
                ] : null
              ),
              $h("div", { "style": "position: relative; margin-top: clamp(14px, 3.6vh, 44px); display: grid; justify-items: center; text-align: center;" },
                $h("p", { "class": `kp-in kp-lineA ${$t($v.lineACls)}`, "aria-hidden": $v.lineAHidden, "style": "grid-area: 1 / 1; margin: 0; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap; animation-delay: 120ms;" },
                  "On fouille ",
                  $h("span", { "class": "kp-roll kp-inl", "style": "font-weight: 800; letter-spacing: -0.05em;" },
                    ($l($v.rollA)).map((c) => [
                      (c?.dig) ? [
                        $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                          $h("span", { "class": "kp-strip", "style": c?.st },
                            $h("span", null,
                              "0"
                            ),
                            $h("span", null,
                              "1"
                            ),
                            $h("span", null,
                              "2"
                            ),
                            $h("span", null,
                              "3"
                            ),
                            $h("span", null,
                              "4"
                            ),
                            $h("span", null,
                              "5"
                            ),
                            $h("span", null,
                              "6"
                            ),
                            $h("span", null,
                              "7"
                            ),
                            $h("span", null,
                              "8"
                            ),
                            $h("span", null,
                              "9"
                            )
                          )
                        )
                      ] : null,
                      (c?.chr) ? [
                        $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                          $t(c?.ch)
                        )
                      ] : null
                    ])
                  ),
                  " apps pour toi"
                ),
                ($v.showB) ? [
                  $h("h1", { "class": "kp-found", "aria-live": "polite", "style": "grid-area: 1 / 1; margin: 0; font-family: var(--font-display); font-size: clamp(30px, 5.8vh, 56px); line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap;" },
                    $h("span", { "class": "visually-hidden" },
                      $t($v.foundTxt)
                    ),
                    $h("span", { "aria-hidden": "true" },
                      $h("span", { "class": "kp-roll kp-inl kp-grad", "style": "font-weight: 800; letter-spacing: -0.06em;" },
                        ($l($v.rollB)).map((c) => [
                          (c?.dig) ? [
                            $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                              $h("span", { "class": "kp-strip", "style": c?.st },
                                $h("span", null,
                                  "0"
                                ),
                                $h("span", null,
                                  "1"
                                ),
                                $h("span", null,
                                  "2"
                                ),
                                $h("span", null,
                                  "3"
                                ),
                                $h("span", null,
                                  "4"
                                ),
                                $h("span", null,
                                  "5"
                                ),
                                $h("span", null,
                                  "6"
                                ),
                                $h("span", null,
                                  "7"
                                ),
                                $h("span", null,
                                  "8"
                                ),
                                $h("span", null,
                                  "9"
                                )
                              )
                            )
                          ] : null,
                          (c?.chr) ? [
                            $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                              $t(c?.ch)
                            )
                          ] : null
                        ])
                      ),
                      " ", $t($v.foundWord)
                    )
                  )
                ] : null
              ),
              $h("ul", { "class": "kp-in", "style": "position: relative; list-style: none; margin: clamp(10px, 2.8vh, 32px) 0 0; padding: 0; display: flex; align-items: center; gap: 32px; animation-delay: 200ms;" },
                $h("li", { "style": "display: flex; align-items: center; gap: 10px;" },
                  $h("span", { "aria-hidden": "true", "style": "position: relative; width: 22px; height: 22px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D5DAE1;" },
                    $h("span", { "class": "kp-step-c", "style": "animation-delay: 1.05s;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "class": "kp-step-t", "style": "font-size: 17px; font-weight: 500; color: #0E0F12; animation-delay: 1.05s;" },
                    "Ta niche"
                  )
                ),
                $h("li", { "style": "display: flex; align-items: center; gap: 10px;" },
                  $h("span", { "aria-hidden": "true", "style": "position: relative; width: 22px; height: 22px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D5DAE1;" },
                    $h("span", { "class": "kp-step-c", "style": "animation-delay: 1.95s;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "class": "kp-step-t", "style": "font-size: 17px; font-weight: 500; color: #0E0F12; animation-delay: 1.95s;" },
                    "Ton marché"
                  )
                ),
                $h("li", { "style": "display: flex; align-items: center; gap: 10px;" },
                  $h("span", { "aria-hidden": "true", "style": "position: relative; width: 22px; height: 22px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D5DAE1;" },
                    $h("span", { "class": "kp-step-c", "style": "animation-delay: 2.8s;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "class": "kp-chk", "pathLength": "1", "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "class": "kp-step-t", "style": "font-size: 17px; font-weight: 500; color: #0E0F12; animation-delay: 2.8s;" },
                    "Ton temps"
                  )
                )
              ),
              $h("div", { "role": "progressbar", "aria-label": "Recherche", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": $v.barNow, "class": "kp-in", "style": "position: relative; margin-top: clamp(10px, 2.4vh, 24px); width: 320px; height: 4px; border-radius: 2px; overflow: hidden; background: #E3E5EA; animation-delay: 240ms;" },
                $h("span", { "class": "kp-bar", "style": "display: block; width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #4C9AFF, #0B6FE0);" })
              )
            )
          ] : null,
          ($v.isStep8) ? [
            $h("main", { "style": "position: relative; flex: 1 0 auto; padding: 0 48px 96px; box-sizing: border-box;" },
              $h("section", { "aria-labelledby": "plan-titre", "style": "position: relative; isolation: isolate; padding-top: 64px; display: flex; flex-direction: column; align-items: center; text-align: center;" },
                $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 240px; width: 760px; height: 560px;" }),
                $h("span", { "class": "kp-in", "style": "position: relative; display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 16px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 6px 16px rgba(16,24,40,0.05); font-size: 15px; font-weight: 600; color: var(--ink-soft);" },
                  $h("span", { "aria-hidden": "true", "style": "width: 7px; height: 7px; border-radius: 50%; background: #0B6FE0;" }),
                  "Ton plan"
                ),
                $h("h1", { "id": "plan-titre", "style": "position: relative; margin: 24px 0 0; display: flex; flex-direction: column; align-items: center;" },
                  $h("span", { "class": "visually-hidden" },
                    $t($v.bigTxt)
                  ),
                  $h("span", { "class": "kp-in", "aria-hidden": "true", "style": "display: flex; align-items: flex-start; height: 1em; font-family: var(--font-display); font-size: 160px; line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: #0E0F12; white-space: nowrap; animation-delay: 80ms;" },
                    $h("span", { "class": "kp-roll" },
                      ($l($v.rollMin)).map((c) => [
                        (c?.dig) ? [
                          $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                            $h("span", { "class": "kp-strip", "style": c?.st },
                              $h("span", null,
                                "0"
                              ),
                              $h("span", null,
                                "1"
                              ),
                              $h("span", null,
                                "2"
                              ),
                              $h("span", null,
                                "3"
                              ),
                              $h("span", null,
                                "4"
                              ),
                              $h("span", null,
                                "5"
                              ),
                              $h("span", null,
                                "6"
                              ),
                              $h("span", null,
                                "7"
                              ),
                              $h("span", null,
                                "8"
                              ),
                              $h("span", null,
                                "9"
                              )
                            )
                          )
                        ] : null,
                        (c?.chr) ? [
                          $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                            $t(c?.ch)
                          )
                        ] : null
                      ])
                    ),
                    ($v.twoNums) ? [
                      $h("span", { "class": "kp-gtext", "style": "display: block; margin: 46px 13px 0 5px; font-size: 72px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                        "à"
                      ),
                      $h("span", { "class": "kp-roll" },
                        ($l($v.rollMax)).map((c) => [
                          (c?.dig) ? [
                            $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                              $h("span", { "class": "kp-strip", "style": c?.st },
                                $h("span", null,
                                  "0"
                                ),
                                $h("span", null,
                                  "1"
                                ),
                                $h("span", null,
                                  "2"
                                ),
                                $h("span", null,
                                  "3"
                                ),
                                $h("span", null,
                                  "4"
                                ),
                                $h("span", null,
                                  "5"
                                ),
                                $h("span", null,
                                  "6"
                                ),
                                $h("span", null,
                                  "7"
                                ),
                                $h("span", null,
                                  "8"
                                ),
                                $h("span", null,
                                  "9"
                                )
                              )
                            )
                          ] : null,
                          (c?.chr) ? [
                            $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                              $t(c?.ch)
                            )
                          ] : null
                        ])
                      )
                    ] : null
                  ),
                  $h("span", { "class": "kp-in", "aria-hidden": "true", "style": "display: block; margin-top: 16px; font-family: var(--font-display); font-size: 28px; line-height: 1.2; font-weight: 600; letter-spacing: -0.02em; color: var(--ink-soft); animation-delay: 160ms;" },
                    $t($v.unitTxt)
                  )
                ),
                $h("ul", { "style": "position: relative; list-style: none; margin: 32px 0 0; padding: 0; display: flex; gap: 12px;" },
                  $h("li", { "class": "kp-slide-l", "style": "display: inline-flex; align-items: center; gap: 10px; height: 48px; padding: 0 20px 0 16px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(16,24,40,0.06); font-size: 17px; font-weight: 600; color: var(--ink); animation-delay: 300ms;" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "8", "r": "4", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                      $h("path", { "d": "M4.5 20.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                    ),
                    $t($v.pillAccounts)
                  ),
                  $h("li", { "class": "kp-slide-r", "style": "display: inline-flex; align-items: center; gap: 10px; height: 48px; padding: 0 20px 0 16px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(16,24,40,0.06); font-size: 17px; font-weight: 600; color: var(--ink); animation-delay: 360ms;" },
                    ($v.pillClock) ? [
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "12", "r": "9", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("path", { "d": "M12 7v5l3.2 2", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null,
                    ($v.pillCrea) ? [
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "9", "cy": "8", "r": "3.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("path", { "d": "M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                        $h("path", { "d": "M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 13.9c1.8 0.9 3 2.8 3 5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                      )
                    ] : null,
                    ($v.pillEuro) ? [
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M17.8 7.2A6.6 6.6 0 1 0 17.8 16.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                        $h("path", { "d": "M4.5 10.3h8.5M4.5 13.7h8.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                      )
                    ] : null,
                    $t($v.pillTime)
                  )
                ),
                $h("p", { "class": "kp-badge", "style": "position: relative; margin: 24px 0 0; display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 20px 0 12px; border-radius: 999px; background: #EEF5FF; box-shadow: inset 0 0 0 1px rgba(11,111,224,0.22); font-size: 17px; font-weight: 600; color: #0B6FE0; animation-delay: 470ms;" },
                  $h("span", { "aria-hidden": "true", "style": "width: 24px; height: 24px; border-radius: 50%; background: #0B6FE0; display: grid; place-items: center;" },
                    ($v.verdictOk) ? [
                      $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null,
                    ($v.verdictAim) ? [
                      $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "12", "r": "8.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4" }),
                        $h("path", { "d": "M12 7.5v4.8l3 1.8", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $t($v.verdict)
                ),
                $h("button", { "type": "button", "class": `kp-calcbtn kp-in ${$t($v.calcCls)}`, "aria-expanded": $v.calcExp, "aria-controls": "kp-calc", "onClick": $v.toggleCalc, "style": "margin-top: 16px; animation-delay: 540ms;" },
                  "Voir le calcul",
                  $h("svg", { "class": "kp-chev", "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("div", { "id": "kp-calc", "class": `kp-calc ${$t($v.calcCls)}`, "style": "width: 100%;" },
                  $h("div", { "style": "min-height: 0; overflow: hidden;" },
                    $h("div", { "style": "padding: 8px 32px 40px;" },
                      $h("div", { "style": "margin: 0 auto; max-width: 640px; padding: 24px 28px; box-sizing: border-box; border-radius: 20px; background: #FFFFFF; box-shadow: var(--shadow-card); text-align: left; font-family: var(--font-mono); font-size: 15px; line-height: 1.7; color: var(--ink-faint);" },
                        ($l($v.calcLines)).map((l) => [
                          $h("p", { "class": `kp-cl ${$t(l?.c)}`, "style": l?.st },
                            $t(l?.t)
                          )
                        ])
                      )
                    )
                  )
                )
              ),
              $h("section", { "data-reveal": "apps", "class": `kp-rvs ${$t($v.rvApps)}`, "aria-labelledby": "apps-titre", "style": "position: relative; max-width: 1040px; margin: 40px auto 0;" },
                $h("h2", { "id": "apps-titre", "class": "kp-rv", "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                  $t($v.appsTitle)
                ),
                $h("div", { "style": "margin-top: 32px; display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 24px;" },
                  $h("article", { "class": "kp-rv kp-feat", "aria-labelledby": "feat-nom", "style": $v.featStyle },
                    $h("span", { "class": "kp-spin", "aria-hidden": "true" }),
                    $h("div", { "style": "position: relative; height: 100%; box-sizing: border-box; padding: 40px; border-radius: 28px; background: #FFFFFF; display: flex; flex-direction: column;" },
                      $h("div", { "style": "display: flex; align-items: center; gap: 24px;" },
                        $h("span", { "class": "kp-img", "style": `width: 88px; height: 88px; border-radius: 22px; flex-shrink: 0; box-shadow: 0 0 0 1px #ECEEF2, 0 10px 24px rgba(16,24,40,0.10); ${$t($v.feat?.bg)}` }),
                        $h("div", { "style": "min-width: 0;" },
                          $h("h3", { "id": "feat-nom", "style": "margin: 0; font-family: var(--font-display); font-size: 36px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                            $t($v.feat?.nom)
                          ),
                          $h("p", { "style": "margin: 8px 0 0; font-size: 17px; line-height: 1.4; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                            $t($v.feat?.quoi)
                          )
                        )
                      ),
                      ($v.feat?.bestVid) ? [
                        $h("p", { "style": "margin: 48px 0 0;" },
                          $h("button", { "type": "button", "class": "kp-bestbtn", "onClick": $v.openVid, "aria-haspopup": "dialog" },
                            $h("span", { "class": "visually-hidden" },
                              $t($v.feat?.best), " ", $t($v.feat?.bestUnit), ", voir la vidéo"
                            ),
                            $h("span", { "aria-hidden": "true", "style": "display: flex; align-items: flex-start; height: 1em; margin-left: -6px; font-family: var(--font-display); font-size: 96px; line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: var(--ink); white-space: nowrap;" },
                              $h("span", { "class": "kp-roll" },
                                ($l($v.rollBest)).map((c) => [
                                  (c?.dig) ? [
                                    $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                                      $h("span", { "class": "kp-strip", "style": c?.st },
                                        $h("span", null,
                                          "0"
                                        ),
                                        $h("span", null,
                                          "1"
                                        ),
                                        $h("span", null,
                                          "2"
                                        ),
                                        $h("span", null,
                                          "3"
                                        ),
                                        $h("span", null,
                                          "4"
                                        ),
                                        $h("span", null,
                                          "5"
                                        ),
                                        $h("span", null,
                                          "6"
                                        ),
                                        $h("span", null,
                                          "7"
                                        ),
                                        $h("span", null,
                                          "8"
                                        ),
                                        $h("span", null,
                                          "9"
                                        )
                                      )
                                    )
                                  ] : null,
                                  (c?.chr) ? [
                                    $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                                      $t(c?.ch)
                                    )
                                  ] : null
                                ])
                              )
                            ),
                            $h("span", { "aria-hidden": "true", "style": "display: block; margin-top: 12px; font-size: 17px; line-height: 1.4; color: var(--ink-soft);" },
                              $t($v.feat?.bestUnit),
                              $h("span", { "class": "kp-play" },
                                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                                  $h("path", { "d": "M3.5 2.2v7.6l6-3.8z", "fill": "currentColor" })
                                ),
                                "Voir la vidéo"
                              )
                            )
                          )
                        )
                      ] : null,
                      ($v.feat?.bestTxt) ? [
                        $h("p", { "style": "margin: 48px 0 0;" },
                          $h("span", { "class": "visually-hidden" },
                            $t($v.feat?.best), " ", $t($v.feat?.bestUnit)
                          ),
                          $h("span", { "aria-hidden": "true", "style": "display: flex; align-items: flex-start; height: 1em; margin-left: -6px; font-family: var(--font-display); font-size: 96px; line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: var(--ink); white-space: nowrap;" },
                            $h("span", { "class": "kp-roll" },
                              ($l($v.rollBest)).map((c) => [
                                (c?.dig) ? [
                                  $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                                    $h("span", { "class": "kp-strip", "style": c?.st },
                                      $h("span", null,
                                        "0"
                                      ),
                                      $h("span", null,
                                        "1"
                                      ),
                                      $h("span", null,
                                        "2"
                                      ),
                                      $h("span", null,
                                        "3"
                                      ),
                                      $h("span", null,
                                        "4"
                                      ),
                                      $h("span", null,
                                        "5"
                                      ),
                                      $h("span", null,
                                        "6"
                                      ),
                                      $h("span", null,
                                        "7"
                                      ),
                                      $h("span", null,
                                        "8"
                                      ),
                                      $h("span", null,
                                        "9"
                                      )
                                    )
                                  )
                                ] : null,
                                (c?.chr) ? [
                                  $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                                    $t(c?.ch)
                                  )
                                ] : null
                              ])
                            )
                          ),
                          $h("span", { "aria-hidden": "true", "style": "display: block; margin-top: 12px; font-size: 17px; line-height: 1.4; color: var(--ink-soft);" },
                            $t($v.feat?.bestUnit)
                          )
                        )
                      ] : null,
                      $h("div", { "style": "margin-top: auto; padding-top: 40px; display: flex; align-items: center; justify-content: space-between; gap: 24px;" },
                        $h("p", { "style": "margin: 0; display: inline-flex; align-items: center; gap: 10px; font-size: 17px; color: var(--ink-soft);" },
                          $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("circle", { "cx": "9", "cy": "8", "r": "3.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                            $h("path", { "d": "M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" }),
                            $h("path", { "d": "M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 13.9c1.8 0.9 3 2.8 3 5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                          ),
                          $h("span", null,
                            $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                              $t($v.feat?.comptesTxt)
                            ),
                            " ", $t($v.feat?.pushTxt)
                          )
                        ),
                        $h("span", { "class": "kp-ctaw", "style": "flex-shrink: 0;" },
                          $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.openFeat },
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
                  ),
                  ($l($v.others)).map((o) => [
                    ($v.paywall) ? [
                      $h("button", { "type": "button", "class": "kp-rv kp-card3d kp-mini", "aria-label": o?.lockLabel, "onClick": $v.openPaywall, "style": o?.d },
                        $h("span", { "aria-hidden": "true", "class": "kp-blur", "style": "display: flex; align-items: center; gap: 20px;" },
                          $h("span", { "class": "kp-img", "style": `width: 64px; height: 64px; border-radius: 16px; flex-shrink: 0; box-shadow: 0 0 0 1px #ECEEF2; ${$t(o?.bg)}` }),
                          $h("span", { "style": "display: block; min-width: 0;" },
                            $h("span", { "style": "display: block; font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                              $t(o?.nom)
                            ),
                            $h("span", { "style": "display: block; margin-top: 4px; font-size: 16px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(o?.quoi)
                            )
                          )
                        ),
                        (o?.hasBest) ? [
                          $h("span", { "aria-hidden": "true", "class": "kp-blur", "style": "display: block; margin-top: 24px; font-family: var(--font-display); font-size: 44px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; color: var(--ink);" },
                            $t(o?.best)
                          )
                        ] : null,
                        $h("span", { "aria-hidden": "true", "class": "kp-lock" },
                          $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8" }),
                            $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                          )
                        )
                      )
                    ] : null,
                    ($v.film) ? [
                      $h("button", { "type": "button", "class": "kp-rv kp-card3d kp-mini", "onClick": o?.open, "style": o?.d },
                        $h("span", { "style": "display: flex; align-items: center; gap: 20px;" },
                          $h("span", { "class": "kp-img", "style": `width: 64px; height: 64px; border-radius: 16px; flex-shrink: 0; box-shadow: 0 0 0 1px #ECEEF2; ${$t(o?.bg)}` }),
                          $h("span", { "style": "display: block; min-width: 0;" },
                            $h("span", { "style": "display: block; font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                              $t(o?.nom)
                            ),
                            $h("span", { "style": "display: block; margin-top: 4px; font-size: 16px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(o?.quoi)
                            )
                          )
                        ),
                        (o?.hasBest) ? [
                          $h("span", { "style": "display: block; margin-top: 24px; font-family: var(--font-display); font-size: 44px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; color: var(--ink);" },
                            $t(o?.best)
                          )
                        ] : null,
                        $h("span", { "class": "kp-go" },
                          "Voir sa stratégie",
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ] : null
                  ])
                ),
                ($v.paywall) ? [
                  $h("div", { "class": "kp-rv", "style": `margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 12px; border-radius: 999px; background: #FFFFFF; box-shadow: var(--shadow-card); ${$t($v.bandD)}` },
                    $h("div", { "style": "display: flex; align-items: center; gap: 20px; min-width: 0;" },
                      $h("span", { "aria-hidden": "true", "style": "display: grid; place-items: center; width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: #EEF5FF;" },
                        $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      ),
                      $h("p", { "style": "margin: 0; font-size: 17px; line-height: 1.4; color: var(--ink-muted);" },
                        $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                          $t($v.moreTxt)
                        ),
                        "  ·  29,99 € par mois, sans engagement"
                      )
                    ),
                    $h("span", { "class": "kp-ctaw", "style": "flex-shrink: 0;" },
                      $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "href": "/inscription" },
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
                  $h("div", { "class": "kp-rv", "style": `margin-top: 24px; display: flex; align-items: center; gap: 20px; padding: 12px 28px 12px 12px; border-radius: 999px; background: #FFFFFF; box-shadow: var(--shadow-card); ${$t($v.bandD)}` },
                    $h("span", { "aria-hidden": "true", "style": "display: grid; place-items: center; width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: #EEF5FF;" },
                      $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("rect", { "x": "4", "y": "4", "width": "6.5", "height": "6.5", "rx": "1.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("rect", { "x": "13.5", "y": "4", "width": "6.5", "height": "6.5", "rx": "1.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("rect", { "x": "4", "y": "13.5", "width": "6.5", "height": "6.5", "rx": "1.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                        $h("rect", { "x": "13.5", "y": "13.5", "width": "6.5", "height": "6.5", "rx": "1.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" })
                      )
                    ),
                    $h("p", { "style": "margin: 0; font-size: 17px; line-height: 1.4; color: var(--ink-muted);" },
                      $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                        $t($v.moreTxt)
                      ),
                      " ", $t($v.moreIn)
                    )
                  )
                ] : null
              )
            )
          ] : null,
          ($v.isStep9) ? [
            $h("main", { "key": $v.s9Key, "style": "position: relative; flex: 1 0 auto; padding: 0 48px 120px; box-sizing: border-box;" },
              $h("section", { "aria-labelledby": "strat-titre", "style": "position: relative; isolation: isolate; padding-top: 64px; display: flex; flex-direction: column; align-items: center; text-align: center;" },
                $h("span", { "aria-hidden": "true", "class": "kp-halo", "style": "top: 180px; width: 720px; height: 480px;" }),
                $h("span", { "class": "kp-in kp-img", "role": "img", "aria-label": $v.app?.logoAlt, "style": `position: relative; width: 96px; height: 96px; border-radius: 24px; box-shadow: 0 0 0 1px #ECEEF2, 0 18px 40px rgba(16,24,40,0.12); animation-name: sim-kp-popin; animation-duration: .8s; ${$t($v.app?.bg)}` }),
                $h("h1", { "id": "strat-titre", "style": "position: relative; margin: 32px 0 0; font-family: var(--font-display); font-size: 56px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                  $h("span", { "class": "kp-w" },
                    $h("span", { "style": "animation-delay: 120ms;" },
                      "Copie"
                    )
                  ),
                  " ",
                  $h("span", { "class": "kp-w" },
                    $h("span", { "style": "animation-delay: 190ms;" },
                      $t($v.app?.nom)
                    )
                  )
                ),
                $h("p", { "class": "kp-in", "style": "position: relative; margin: 12px 0 0; max-width: 760px; font-size: 19px; line-height: 1.4; color: var(--ink-muted); text-wrap: balance; animation-delay: 300ms;" },
                  $t($v.app?.sub)
                )
              ),
              $h("div", { "style": "max-width: 1040px; margin: 0 auto;" },
                ($v.hooksOn) ? [
                  $h("section", { "data-reveal": "hooks", "class": `kp-rvs kp-split ${$t($v.rvHooks)}`, "aria-labelledby": "accroches-titre", "style": "margin-top: 112px; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 64px; align-items: start;" },
                    $h("h2", { "id": "accroches-titre", "class": "kp-rv", "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                      "Les accroches qui marchent"
                    ),
                    $h("ul", { "style": "list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 216px)); gap: 24px;" },
                      ($l($v.hooks)).map((h) => [
                        $h("li", { "style": "min-width: 0;" },
                          (h?.isVid) ? [
                            $h("div", { "class": "kp-rv kp-deal kp-vcard", "style": h?.st },
                              $h("iframe", { "src": $u(h?.embed), "title": h?.title, "loading": "lazy", "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" })
                            ),
                            $h("p", { "class": "kp-rv kp-cap", "style": h?.d0 },
                              $t(h?.cap)
                            )
                          ] : null,
                          (h?.isTxt) ? [
                            $h("div", { "class": "kp-rv kp-deal kp-hook", "style": h?.st },
                              $h("p", { "style": `margin: 0; white-space: pre-line; font-weight: 700; letter-spacing: -0.01em; color: #FFFFFF; overflow-wrap: anywhere; ${$t(h?.fs)}` },
                                $t(h?.txt)
                              )
                            )
                          ] : null,
                          $h("p", { "class": "kp-rv", "style": `margin: 12px 0 0; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: var(--ink); ${$t(h?.d1)}` },
                            $t(h?.views)
                          ),
                          $h("p", { "class": "kp-rv", "style": `margin: 4px 0 0; font-size: 15px; color: var(--ink-muted); overflow-wrap: anywhere; ${$t(h?.d2)}` },
                            $h("a", { "class": "kp-handle", "href": $u(h?.url), "target": "_blank", "rel": "noopener" },
                              "@", $t(h?.compte)
                            ),
                            $h("span", { "style": "white-space: nowrap;" },
                              $t(h?.more)
                            )
                          )
                        )
                      ])
                    )
                  )
                ] : null,
                ($v.acctsOn) ? [
                  $h("section", { "data-reveal": "accts", "class": `kp-rvs kp-split ${$t($v.rvAccts)}`, "aria-labelledby": "comptes-titre", "style": "margin-top: 112px; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 64px; align-items: start;" },
                    $h("div", null,
                      $h("h2", { "id": "comptes-titre", "class": "kp-rv", "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                        "Les comptes qui la poussent"
                      ),
                      $h("p", { "class": "kp-rv", "style": "margin: 14px 0 0; font-size: 17px; line-height: 1.45; color: var(--ink-faint); animation-delay: 120ms;" },
                        $t($v.runA), " tourner ",
                        $h("strong", { "style": "font-weight: 700; color: var(--ink-soft);" },
                          $t($v.runN)
                        )
                      )
                    ),
                    $h("div", null,
                      $h("ul", { "style": "list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;" },
                        ($l($v.reseau)).map((r) => [
                          $h("li", { "class": "kp-rv kp-acct", "style": r?.d },
                            $h("span", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;" },
                              $h("span", { "class": "kp-av", "aria-hidden": "true", "style": "width: 44px; height: 44px; font-size: 18px;" },
                                $t(r?.ini)
                              ),
                              $h("span", { "style": "min-width: 0; margin-top: 2px; font-size: 12px; line-height: 1.3; font-weight: 500; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                $t(r?.pays)
                              )
                            ),
                            $h("a", { "class": "kp-handle", "href": $u(r?.url), "target": "_blank", "rel": "noopener" },
                              $h("span", { "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                "@", $t(r?.pseudo)
                              ),
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M7 17L17 7M9 7h8v8", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            ),
                            $h("span", { "style": "display: block; margin-top: 8px; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                              $h("span", { "style": "display: block;" },
                                $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                                  $t(r?.abonnes)
                                ),
                                " abonnés"
                              ),
                              $h("span", { "style": "display: block;" },
                                $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                                  $t(r?.vues)
                                ),
                                " vues médianes"
                              )
                            )
                          )
                        ])
                      ),
                      $h("p", { "class": "kp-rv", "style": `margin: 24px 0 0; font-size: 17px; line-height: 1.45; font-weight: 600; color: var(--ink); ${$t($v.planD)}` },
                        $t($v.planTxt)
                      )
                    )
                  )
                ] : null,
                $h("section", { "data-reveal": "weeks", "class": `kp-rvs kp-split ${$t($v.rvWeeks)}`, "aria-labelledby": "semaines-titre", "style": "margin-top: 112px; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 64px; align-items: start;" },
                  $h("h2", { "id": "semaines-titre", "class": "kp-rv", "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                    "Tes 4 semaines"
                  ),
                  $h("div", { "style": "position: relative;" },
                    $h("span", { "aria-hidden": "true", "class": "kp-rv kp-line", "style": "position: absolute; left: 16px; right: calc(25% - 2px); top: 15px; height: 2px; border-radius: 1px; background: linear-gradient(90deg, #0B6FE0, #4C9AFF 55%, #CFE2FF); transform-origin: left center; animation-delay: 120ms;" }),
                    $h("ol", { "style": "position: relative; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px;" },
                      ($l($v.weeks)).map((w) => [
                        $h("li", { "style": "position: relative;" },
                          $h("span", { "aria-hidden": "true", "class": "kp-rv kp-pop kp-dot", "style": w?.d0 },
                            $t(w?.n)
                          ),
                          $h("p", { "class": "kp-rv", "style": `margin: 20px 0 0; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: var(--ink); ${$t(w?.d1)}` },
                            $t(w?.k)
                          ),
                          $h("p", { "class": "kp-rv", "style": `margin: 6px 0 0; font-size: 15px; line-height: 1.45; color: var(--ink-muted); ${$t(w?.d2)}` },
                            $t(w?.t)
                          )
                        )
                      ])
                    )
                  )
                ),
                ($v.prixOn) ? [
                  $h("section", { "data-reveal": "prix", "class": `kp-rvs kp-split ${$t($v.rvPrix)}`, "aria-labelledby": "prix-titre", "style": "margin-top: 112px; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 64px; align-items: center;" },
                    $h("h2", { "id": "prix-titre", "class": "kp-rv", "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                      "Ce qu’elle facture"
                    ),
                    $h("div", null,
                      $h("p", { "class": "kp-rv kp-card3d", "style": "position: relative; display: inline-flex; align-items: center; margin: 0; padding: 28px 40px; border-radius: 28px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 24px 56px rgba(16,24,40,0.08); animation-delay: 80ms;" },
                        $h("span", { "class": "visually-hidden" },
                          $t($v.prixTxt)
                        ),
                        $h("span", { "aria-hidden": "true", "style": "display: flex; align-items: flex-start; height: 1em; font-family: var(--font-display); font-size: 72px; line-height: 1; font-weight: 800; letter-spacing: -0.06em; color: var(--ink); white-space: nowrap;" },
                          $h("span", { "class": "kp-roll" },
                            ($l($v.rollPmin)).map((c) => [
                              (c?.dig) ? [
                                $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                                  $h("span", { "class": "kp-strip", "style": c?.st },
                                    $h("span", null,
                                      "0"
                                    ),
                                    $h("span", null,
                                      "1"
                                    ),
                                    $h("span", null,
                                      "2"
                                    ),
                                    $h("span", null,
                                      "3"
                                    ),
                                    $h("span", null,
                                      "4"
                                    ),
                                    $h("span", null,
                                      "5"
                                    ),
                                    $h("span", null,
                                      "6"
                                    ),
                                    $h("span", null,
                                      "7"
                                    ),
                                    $h("span", null,
                                      "8"
                                    ),
                                    $h("span", null,
                                      "9"
                                    )
                                  )
                                )
                              ] : null,
                              (c?.chr) ? [
                                $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                                  $t(c?.ch)
                                )
                              ] : null
                            ])
                          ),
                          $h("span", { "class": "kp-gtext", "style": "display: block; margin: 23px 10px 0 8px; font-size: 32px; line-height: 1; font-weight: 700; letter-spacing: -0.02em;" },
                            "à"
                          ),
                          $h("span", { "class": "kp-roll" },
                            ($l($v.rollPmax)).map((c) => [
                              (c?.dig) ? [
                                $h("span", { "class": `kp-col ${$t(c?.cls)}` },
                                  $h("span", { "class": "kp-strip", "style": c?.st },
                                    $h("span", null,
                                      "0"
                                    ),
                                    $h("span", null,
                                      "1"
                                    ),
                                    $h("span", null,
                                      "2"
                                    ),
                                    $h("span", null,
                                      "3"
                                    ),
                                    $h("span", null,
                                      "4"
                                    ),
                                    $h("span", null,
                                      "5"
                                    ),
                                    $h("span", null,
                                      "6"
                                    ),
                                    $h("span", null,
                                      "7"
                                    ),
                                    $h("span", null,
                                      "8"
                                    ),
                                    $h("span", null,
                                      "9"
                                    )
                                  )
                                )
                              ] : null,
                              (c?.chr) ? [
                                $h("span", { "class": `kp-ch ${$t(c?.cls)}` },
                                  $t(c?.ch)
                                )
                              ] : null
                            ])
                          ),
                          $h("span", { "style": "display: block; margin-left: 0.24em; letter-spacing: 0;" },
                            "€"
                          )
                        )
                      ),
                      $h("p", { "class": "kp-rv", "style": "margin: 20px 0 0; font-size: 17px; line-height: 1.5; color: var(--ink-muted); animation-delay: 200ms;" },
                        "achats intégrés sur l’App Store"
                      )
                    )
                  )
                ] : null,
                ($v.paywall) ? [
                  $h("section", { "data-reveal": "end", "class": `kp-rvs ${$t($v.rvEnd)}`, "aria-labelledby": "pro-titre", "style": "margin-top: 128px;" },
                    $h("div", { "class": "kp-rv kp-card3d", "style": "position: relative; height: 400px; border-radius: 32px; overflow: hidden; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 24px 60px rgba(16,24,40,0.08);" },
                      $h("div", { "aria-hidden": "true", "class": "kp-blur", "style": "position: absolute; inset: 40px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px;" },
                        ($l($v.preview)).map((pv) => [
                          $h("div", null,
                            $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
                              $h("span", { "class": "kp-img", "style": `width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 0 0 1px #ECEEF2; ${$t(pv?.bg)}` }),
                              $h("span", { "style": "font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                                "Copie ", $t(pv?.nom)
                              )
                            ),
                            $h("div", { "style": "margin-top: 32px; display: flex; gap: 16px;" },
                              $h("span", { "style": "width: 120px; height: 213px; border-radius: 16px; background: #0E0F12; display: grid; place-items: center;" },
                                $h("span", { "style": "width: 72px; height: 10px; border-radius: 5px; background: #FFFFFF;" })
                              ),
                              $h("span", { "style": "width: 120px; height: 213px; border-radius: 16px; background: #0E0F12; display: grid; place-items: center;" },
                                $h("span", { "style": "width: 84px; height: 10px; border-radius: 5px; background: #FFFFFF;" })
                              ),
                              $h("span", { "style": "width: 120px; height: 213px; border-radius: 16px; background: #0E0F12; display: grid; place-items: center;" },
                                $h("span", { "style": "width: 64px; height: 10px; border-radius: 5px; background: #FFFFFF;" })
                              )
                            )
                          )
                        ])
                      ),
                      $h("div", { "style": "position: absolute; inset: 0; background: radial-gradient(52% 62% at 50% 54%, rgba(255,255,255,0.95), rgba(255,255,255,0.72) 60%, rgba(255,255,255,0.15)); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;" },
                        $h("span", { "aria-hidden": "true", "class": "kp-rv kp-pop", "style": "display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.08), 0 12px 28px rgba(16,24,40,0.14); animation-delay: 300ms;" },
                          $h("svg", { "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8" }),
                            $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                          )
                        ),
                        $h("h2", { "id": "pro-titre", "style": "margin: 24px 0 0; font-family: var(--font-display); font-size: 40px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                          $t($v.lockTxt)
                        ),
                        $h("span", { "class": "kp-ctaw", "style": "margin-top: 32px;" },
                          $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "href": "/inscription" },
                            "Tout débloquer",
                            $h("span", { "class": "sw-btn-tile" },
                              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          )
                        ),
                        $h("p", { "style": "margin: 16px 0 0; font-size: 15px; color: var(--ink-muted);" },
                          "29,99 € par mois, sans engagement"
                        )
                      )
                    )
                  )
                ] : null,
                ($v.film) ? [
                  $h("section", { "data-reveal": "end", "class": `kp-rvs ${$t($v.rvEnd)}`, "aria-label": "App suivante", "style": "margin-top: 128px; display: flex; flex-direction: column; align-items: center; text-align: center;" },
                    $h("span", { "class": "kp-rv kp-floaty kp-img", "style": `width: 80px; height: 80px; border-radius: 22px; box-shadow: 0 0 0 1px #ECEEF2, 0 18px 40px rgba(16,24,40,0.14); animation-delay: 0ms, 900ms; ${$t($v.nextBg)}` }),
                    $h("span", { "class": "kp-rv kp-ctaw", "style": "margin-top: 32px; animation-delay: 150ms;" },
                      $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "onClick": $v.nextApp },
                        "App suivante",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ),
                    $h("button", { "type": "button", "class": "kp-rv kp-quiet", "onClick": $v.toPlan, "style": "animation-delay: 260ms;" },
                      "Retour au plan"
                    )
                  )
                ] : null
              )
            )
          ] : null
        ),
        ($v.pwOpen) ? [
          $h("div", { "class": `kp-modal ${$t($v.pwCls)}`, "role": "dialog", "aria-modal": "true", "aria-labelledby": "pw-titre" },
            $h("div", { "class": "kp-scrim", "onClick": $v.closePaywall }),
            $h("div", { "class": "kp-sheet" },
              $h("button", { "type": "button", "class": "kp-x", "aria-label": "Fermer", "onClick": $v.closePaywall, "ref": $v.pwRef },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              ),
              $h("span", { "aria-hidden": "true", "class": "kp-locktile", "style": "display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 14px 30px rgba(11,111,224,0.35);" },
                $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("rect", { "x": "5", "y": "11", "width": "14", "height": "10", "rx": "2.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "1.8" }),
                  $h("path", { "d": "M8 11V8a4 4 0 0 1 8 0v3", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round" })
                )
              ),
              $h("h2", { "id": "pw-titre", "style": "margin: 24px 0 0; font-family: var(--font-display); font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12;" },
                "Kopycat Pro"
              ),
              $h("p", { "style": "margin: 20px 0 0; display: flex; align-items: baseline; justify-content: center; gap: 10px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 64px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; color: #0E0F12; font-variant-numeric: tabular-nums;" },
                  "29,99 €"
                ),
                $h("span", { "style": "font-size: 17px; font-weight: 600; color: var(--ink-soft);" },
                  "par mois"
                )
              ),
              $h("p", { "style": "margin: 12px 0 0; font-size: 16px; color: var(--ink-muted);" },
                "sans engagement"
              ),
              $h("span", { "class": "kp-ctaw", "style": "margin-top: 32px;" },
                $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg kp-cta", "href": "/inscription" },
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
        ] : null,
        ($v.vidOpen) ? [
          $h("div", { "class": `kp-modal ${$t($v.vidCls)}`, "role": "dialog", "aria-modal": "true", "aria-label": $v.best?.label },
            $h("div", { "class": "kp-scrim", "onClick": $v.closeVid }),
            $h("div", { "class": "kp-vsheet" },
              $h("div", { "class": "kp-vframe" },
                $h("iframe", { "src": $u($v.best?.embed), "title": $v.best?.title, "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write" })
              ),
              $h("p", { "style": "position: relative; margin: 14px 0 0; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 10px 24px rgba(16,24,40,0.10); font-size: 15px; color: var(--ink-muted); white-space: nowrap;" },
                $h("strong", { "style": "font-weight: 700; color: var(--ink);" },
                  $t($v.best?.views)
                ),
                $h("span", { "aria-hidden": "true" },
                  "·"
                ),
                $h("a", { "class": "kp-handle", "href": $u($v.best?.url), "target": "_blank", "rel": "noopener" },
                  "@", $t($v.best?.compte)
                )
              ),
              $h("button", { "type": "button", "class": "kp-x kp-vx", "aria-label": "Fermer la vidéo", "onClick": $v.closeVid, "ref": $v.vidRef },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              )
            )
          )
        ] : null
      )
    ];
  }
}
