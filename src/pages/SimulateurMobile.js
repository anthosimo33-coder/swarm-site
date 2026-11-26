// Généré par scripts/dc2preact.py depuis design/SimulateurMobile.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class SimulateurMobile extends DCLogic {
  // Données du simulateur (relevé du 26/11/2026), constantes et petites fonctions. Rangées dans la classe : la conversion
  // du site (scripts/dc2preact.py) n'accepte aucun code hors de la classe. Chaque méthode reprend ce qu'elle lit.
  static K = (() => {
    const DATA = {"releve":"26/11/2026","niches":[{"nom":"Social et loisirs","apps":111,"vuesParVideo":10460,"top":[{"nom":"MoboReels","store":"MoboReels: Short Drama Series","logo":"/media/simulateur/moboreels.jpg","comptes":98,"comptesFR":0,"videosSemaine":1252,"meilleure":{"vues":"12,7 k","compte":"austinobest1"},"note":{"note":"4,5","avis":"7,2 k"},"prix":{"min":"6,99","max":"59,99"},"accroches":[{"label":"Voix du bébé à naître porte chance","texte":"My Unborn Baby's Voice Made Me a Winner Mommy,look down,it's me!","vues":1322,"compte":"austinobest1","comptes":1,"vuesTxt":"1,3 k"},{"label":"Fille de concierge sans statut","texte":"I'm just a janitor's daughter","vues":857,"compte":"netflixtime_8","comptes":1,"vuesTxt":"857"},{"label":"Duo Puth et Rian","texte":"Puth and Rian","vues":835,"compte":"cat888818","comptes":1,"vuesTxt":"835"}],"quoi":"Short Drama Series"},{"nom":"SlowRead","store":"SlowRead : Bibliothèque & PAL","logo":"/media/simulateur/slowread.jpg","comptes":70,"comptesFR":0,"videosSemaine":792,"meilleure":{"vues":"35,8 k","compte":"andrea.booktoker"},"note":{"note":"3,8","avis":"36"},"prix":{"min":"7,79","max":"129,99"},"accroches":[{"label":"Concentration sans distractions","texte":"Okay I need to lock in no distractions","vues":10500,"compte":"chelskait_other","comptes":1,"vuesTxt":"10,5 k"},{"label":"Gagner des récompenses en jouant à des jeux mobiles","texte":"i overheard a girl at the airport saying she used girl math to get her nails done with rewards from playing ga","vues":6801,"compte":"living.better0","comptes":4,"vuesTxt":"6,8 k"},{"label":"Lucia, mes personnages fictifs valent mieux","texte":"Keep Lucia. I have 57 fictional men who'd burn the world down for me.","vues":4321,"compte":"totallybooked18","comptes":5,"vuesTxt":"4,3 k"}],"quoi":"Bibliothèque & PAL"},{"nom":"DramaBox","store":"DramaBox - Film et Drame Court","logo":"/media/simulateur/dramabox.jpg","comptes":88,"comptesFR":0,"videosSemaine":618,"meilleure":{"vues":"260 k","compte":"j3w3lz.rose"},"note":{"note":"4,6","avis":"57,2 k"},"prix":{"min":"0,99","max":"14,99"},"accroches":[{"label":"Grand-mère humiliée pour vente de tacos","texte":"¡HUMILLARON A MI ABUELA POR VENDER TACOS! A MI ABUELA POR VENDER TACOS!","vues":259900,"compte":"j3w3lz.rose","comptes":1,"vuesTxt":"260 k"},{"label":"Gagner de l'argent grâce à un riche, en arabe","texte":"DramaBox EP7-8 كل ما فعلته هوجني المال من الثري الذي يُنفق علي وفي النهاية حققت الحرية المالية حصريا DramaBox","vues":199300,"compte":"dramabox_ar","comptes":1,"vuesTxt":"199 k"},{"label":"Le regret tardif, en arabe","texte":"DramaBox EP3-4 الندم المتأخر DramaBox حصريا","vues":151200,"compte":"dramabox_ar","comptes":1,"vuesTxt":"151 k"}],"quoi":"Film et Drame Court"}]},{"nom":"Santé et physique","apps":70,"vuesParVideo":4598,"top":[{"nom":"Mise","store":"mise - meal planner","logo":"/media/simulateur/mise.jpg","comptes":130,"comptesFR":7,"videosSemaine":1353,"meilleure":{"vues":"1,3 M","compte":"paula.eatss"},"note":{"note":"4,5","avis":"98"},"prix":{"min":"9,99","max":"59,99"},"accroches":[{"label":"Trahison conjugale annoncée","texte":"Il avait rendez-vous avec Emma pour me tromper... il ignorait qui elle était Ouais Emma c'est","vues":1500000,"compte":"la.folleduvillage","comptes":1,"vuesTxt":"1,5 M"},{"label":"Ex ou conjoint donne peu d'argent pour nourrir les enfants","texte":"My baby daddy gave me $150 to feed these kids","vues":1400000,"compte":"meme.atethat","comptes":32,"vuesTxt":"1,4 M"},{"label":"Piège conjugal : partir avant son mari","texte":"J’ai empêché mon mari de me tromper ce soir en quittant la maison avant lui 🙅🏽‍♀️🙅🏽‍♀️ maquilles?","vues":935100,"compte":"la.folleduvillage","comptes":1,"vuesTxt":"935 k"}],"quoi":"Meal planner"},{"nom":"Musa","store":"Musa: Period & Pregnancy","logo":"/media/simulateur/musa.jpg","comptes":32,"comptesFR":2,"videosSemaine":526,"meilleure":{"vues":"289 k","compte":"marina.pragnancy"},"note":{"note":"4,7","avis":"181"},"prix":{"min":"6,99","max":"34,99"},"accroches":[{"label":"Des centaines de filles attendent leurs règles","texte":"I think November has delayed every girls period…🩸🩸🩸 · We must all be stressed😩","vues":43200,"compte":"mariana.hormones","comptes":13,"vuesTxt":"43,2 k"},{"label":"Recherche de bébé Disney","texte":"I searched \"my Disney baby\"","vues":31100,"compte":"brooke.pregnancy","comptes":1,"vuesTxt":"31,1 k"},{"label":"Crampes annonçant les règles, surprise","texte":"Girl to girl.. what’s the most obvious sign that your period is about to start?","vues":16300,"compte":"fal.cycletips","comptes":6,"vuesTxt":"16,3 k"}],"quoi":"Period & Pregnancy"},{"nom":"Solaia","store":"Solaia: Équilibre hormonal","logo":"/media/simulateur/solaia.jpg","comptes":64,"comptesFR":52,"videosSemaine":453,"meilleure":{"vues":"1,7 M","compte":"byelizen"},"note":{"note":"4,6","avis":"2,5 k"},"prix":{"min":"8,99","max":"79,99"},"accroches":[{"label":"Horaire de routine post-entraînement","texte":"18:00-22:00 Post workout routine","vues":1500000,"compte":"byelizen","comptes":1,"vuesTxt":"1,5 M"},{"label":"Effets de la pilule les premières semaines","texte":"100% moi les premières semaines où j’ai pris ma pilule","vues":96600,"compte":"justinendo","comptes":1,"vuesTxt":"96,6 k"},{"label":"Rêve de guérir des TCA","texte":"mon rêve niche c’est de guérir des tca","vues":55700,"compte":"indoinsa","comptes":1,"vuesTxt":"55,7 k"}],"quoi":"Équilibre hormonal"}]},{"nom":"Side hustle","apps":50,"vuesParVideo":1405,"top":[{"nom":"SideShift","store":"SideShift - Earn Money","logo":"/media/simulateur/sideshift.jpg","comptes":158,"comptesFR":19,"videosSemaine":1339,"meilleure":{"vues":"4,3 M","compte":"prankswithgenn_"},"note":{"note":"4,8","avis":"411"},"prix":{"min":"0,99","max":"89,99"},"accroches":[{"label":"Indépendance financière avant 25 ans","texte":"Mon objectif est de devenir financièrement indépendante avant mes 25 ans. Je suis ouverte à toutes les idées p","vues":1000000,"compte":"kelly.advice","comptes":1,"vuesTxt":"1 M"},{"label":"Propositions de marques, plusieurs acceptations","texte":"Hoy contacté a 100 marcas. 70 nunca respondieron. 20 dijeron que NO. 10 dijeron que Sl. Y 5 de esas me pagaron","vues":280400,"compte":"fernandaj_ugc","comptes":19,"vuesTxt":"280 k"},{"label":"Cinq jobs remote à lancer","texte":"TRES TRABAJOS DE NOCHE QUE PUEDES HACER DESDE TU CASA","vues":190800,"compte":"mafe.guzman29","comptes":4,"vuesTxt":"191 k"}],"quoi":"Earn Money"},{"nom":"Hub Capture","store":"Hub Capture","logo":"/media/simulateur/hub-capture.jpg","comptes":54,"comptesFR":0,"videosSemaine":180,"meilleure":{"vues":"79,2 k","compte":"tamiresrrosati"},"note":null,"prix":null,"accroches":[{"label":"Dificuldade para enxergar sem óculos","texte":"Gente, eu sem óculos não exergo nada 😂😂 perdão na leitura 🥹 a informação foi nada kk","vues":9343,"compte":"rennynooff","comptes":1,"vuesTxt":"9,3 k"},{"label":"Mão de zumbi","texte":"“MÃO DE ZUMBI”","vues":8453,"compte":"yasmin.robo","comptes":1,"vuesTxt":"8,5 k"},{"label":"Testando uma nova plataforma","texte":"Vou testar lataforma a novaaa","vues":6323,"compte":"sthecareli","comptes":1,"vuesTxt":"6,3 k"}],"quoi":"Plateforme de revenus en ligne par parrainage, avec dropshipping et création de contenu UGC pour TikTok Shop"},{"nom":"TikAlyzer","store":"TikAlyzer: Deviens Viral","logo":"/media/simulateur/tikalyzer.jpg","comptes":51,"comptesFR":0,"videosSemaine":87,"meilleure":{"vues":"1,1 k","compte":"viviana.tikalyzr"},"note":{"note":"4,2","avis":"5"},"prix":{"min":"6,99","max":"69,99"},"accroches":[],"quoi":"Deviens Viral"}]},{"nom":"Création de contenu","apps":41,"vuesParVideo":19873,"top":[{"nom":"Djay","store":"djay - DJ App & AI Mixer","logo":"/media/simulateur/djay.jpg","comptes":163,"comptesFR":3,"videosSemaine":355,"meilleure":{"vues":"61,7 k","compte":"djayoverlaps"},"note":{"note":"4,6","avis":"6,7 k"},"prix":{"min":"0,00","max":"49,99"},"accroches":[{"label":"Phrase kurde d'amour","texte":"گیانەکەم ، ئەتۆ نەبووی فێری گیانت کردم ؟ ئێستاش بێ گیانت کردم","vues":134800,"compte":".avii1i","comptes":1,"vuesTxt":"135 k"},{"label":"Envie de sortir un mix","texte":"im tryna dumpppp","vues":2929,"compte":"idontlikeyoufrbye","comptes":1,"vuesTxt":"2,9 k"},{"label":"Blague sur le repas de fête","texte":"Don’t bring no stank ah chitterlings for thanksgiving that smell like cousin feet","vues":2366,"compte":"dxmien_vt","comptes":1,"vuesTxt":"2,4 k"}],"quoi":"DJ App & AI Mixer"},{"nom":"Crsel","store":"Crsel: Carrousel & Story Maker","logo":"/media/simulateur/crsel.jpg","comptes":14,"comptesFR":0,"videosSemaine":104,"meilleure":{"vues":"6,8 k","compte":"emilycreatescontent"},"note":{"note":"4,7","avis":"1,2 k"},"prix":{"min":"5,99","max":"29,99"},"accroches":[],"quoi":"Carrousel & Story Maker"},{"nom":"VanDraw","store":"VanDraw","logo":"/media/simulateur/vandraw.jpg","comptes":19,"comptesFR":0,"videosSemaine":73,"meilleure":{"vues":"73,1 k","compte":"inspovikk"},"note":{"note":"4,6","avis":"173"},"prix":{"min":"6,00","max":"60,00"},"accroches":[{"label":"Titre de jeu vidéo en texte","texte":"grand theft auto","vues":57100,"compte":"inspovikk","comptes":1,"vuesTxt":"57,1 k"}],"quoi":"App de dessin qui permet de dessiner des avatars et des personnages à partir des commentaires ou de photos"}]},{"nom":"Langues","apps":36,"vuesParVideo":6669,"top":[{"nom":"Vocabulary","store":"Vocabulary - Apprenez mots","logo":"/media/simulateur/vocabulary.jpg","comptes":71,"comptesFR":0,"videosSemaine":637,"meilleure":{"vues":"4,2 k","compte":"edforyou6"},"note":{"note":"4,7","avis":"4 k"},"prix":{"min":"5,99","max":"59,99"},"accroches":[{"label":"Son qui empêche de trop penser","texte":"My roommate told me about this sound which blocks your brain from overthinking. I’ve been listening for 4 hour","vues":6517,"compte":"itskatiegirl8","comptes":11,"vuesTxt":"6,5 k"},{"label":"Gagner de l'argent avec des jeux mobiles","texte":"when people are using klarna to make payments to play the new GTA but I'm only $19 away from getting it using ","vues":2961,"compte":"lobotomized_fish101","comptes":9,"vuesTxt":"3 k"},{"label":"Burger sous vide","texte":"Sous vide burger","vues":977,"compte":"hazaeyrw6ue","comptes":1,"vuesTxt":"977"}],"quoi":"Apprenez mots"},{"nom":"Pingo AI","store":"Apprendre des langues Pingo AI","logo":"/media/simulateur/pingo-ai.jpg","comptes":147,"comptesFR":7,"videosSemaine":480,"meilleure":{"vues":"78,3 k","compte":"nadiaspeaksgerman"},"note":{"note":"4,6","avis":"1,8 k"},"prix":{"min":"14,99","max":"119,99"},"accroches":[{"label":"IA britannique contre IA américaine","texte":"🇬🇧 · 🇺🇸 · WHO ARE YOU? · I ASKED BETTER! · I’M A BRITISH AI!!! · WHAT?? · YOUR VOICE SOUNDS UGLY! · WHAAAA","vues":245600,"compte":"englishgurukat","comptes":2,"vuesTxt":"246 k"},{"label":"Examen de nationalité française","texte":"¿Quién dijo la frase? official Spanish nationality exam","vues":198400,"compte":"camilopolyglot","comptes":3,"vuesTxt":"198 k"},{"label":"Demander comment dire un mot tendre","texte":"How do you say \"green flag\" in Chinese 🇨🇳","vues":173100,"compte":"howtosaynihao","comptes":4,"vuesTxt":"173 k"}],"quoi":"Application d'apprentissage des langues par IA qui corrige les phrases et répond aux questions de vocabulaire"},{"nom":"Bunpo","store":"Bunpo: Apprendre les langues","logo":"/media/simulateur/bunpo.jpg","comptes":86,"comptesFR":0,"videosSemaine":206,"meilleure":{"vues":"18,9 k","compte":"frenchwithlars"},"note":{"note":"4,8","avis":"1,1 k"},"prix":{"min":"9,99","max":"99,99"},"accroches":[{"label":"Pas d'argent en japonais, humour","texte":"🇬🇧 🇯🇵 🇯🇵😩 I don’t have money お金が ありません","vues":344400,"compte":"bunpo_learnjapanese","comptes":1,"vuesTxt":"344 k"},{"label":"Méchant qui apprend le japonais","texte":"you’re a villain but you’re still learning Japanese 日本語勉強中のラスボス この漢字が読めないんだけど I actually can't read that kanji","vues":44300,"compte":"studytomodachi","comptes":1,"vuesTxt":"44,3 k"},{"label":"Apprendre l'espagnol, publicité","texte":"Anzeige Learning Spanish while eating fruit 🍊🇪🇸","vues":20200,"compte":"vittoria.aprende","comptes":1,"vuesTxt":"20,2 k"}],"quoi":"Apprendre les langues"}]},{"nom":"Études","apps":35,"vuesParVideo":4542,"top":[{"nom":"Aistote","store":"Aistote : QUIZ IA","logo":"/media/simulateur/aistote.jpg","comptes":46,"comptesFR":6,"videosSemaine":532,"meilleure":{"vues":"206 k","compte":"wow_its_clifford"},"note":{"note":"4,5","avis":"2,4 k"},"prix":{"min":"8,99","max":"49,99"},"accroches":[{"label":"Question d'examen prise au pied de la lettre","texte":"POV: you use a big word in your English essay and pray it means what you think it means","vues":205700,"compte":"wow_its_clifford","comptes":1,"vuesTxt":"206 k"},{"label":"Surprise de dernière page à l'examen","texte":"POV: you finally find a question you actually know and it's only worth 1 point","vues":174100,"compte":"wow_its_clifford","comptes":1,"vuesTxt":"174 k"},{"label":"Marché de Noël à Nantes","texte":"Le marché de Noël a ouvert à Nantes🎅🏻🎄","vues":89900,"compte":"arkenyxe","comptes":1,"vuesTxt":"89,9 k"}],"quoi":"QUIZ IA"},{"nom":"NurseMind","store":"NurseMind: AI Nursing Guide","logo":"/media/simulateur/nursemind.jpg","comptes":112,"comptesFR":0,"videosSemaine":435,"meilleure":{"vues":"2 k","compte":"learninghacks4u"},"note":null,"prix":{"min":"9,99","max":"34,99"},"accroches":[{"label":"Meilleurs moyens de gagner de l'argent en plus","texte":"these are the BEST outside the box ways to bring in some extra money 🤑","vues":1661,"compte":"anicaa275","comptes":7,"vuesTxt":"1,7 k"},{"label":"Gagner des récompenses en jouant à des jeux mobiles","texte":"3 things I bought this week just by playing cute mobile games on my phone","vues":1634,"compte":"anicaa275","comptes":15,"vuesTxt":"1,6 k"},{"label":"Ce qu'on ferait différemment au premier jour","texte":"if i could redo my first shift as a nurse what i'd do differently, from the first five minutes to clocking out","vues":1531,"compte":"doweknowhurrr","comptes":6,"vuesTxt":"1,5 k"}],"quoi":"AI Nursing Guide"},{"nom":"Diane AI","store":"Diane AI - Flashcards","logo":"/media/simulateur/diane-ai.jpg","comptes":53,"comptesFR":49,"videosSemaine":403,"meilleure":{"vues":"51,8 k","compte":"el1ott_lapt"},"note":{"note":"4,6","avis":"385"},"prix":{"min":"19,99","max":"89,99"},"accroches":[{"label":"Question sur la motivation pour les partiels","texte":"« Votre motivation pour réviser les partiels » · « Parce que faut être motivé en plus ? »","vues":109000,"compte":"jade_dianeai","comptes":1,"vuesTxt":"109 k"},{"label":"Rendez-vous à la BU à 8h non tenu","texte":"On se retrouve à 8h pour aller à la bu mais on est ni du matin ni des partiels","vues":87300,"compte":"jade_dianeai","comptes":2,"vuesTxt":"87,3 k"},{"label":"Fin du lycée après le bac","texte":"Juillet 2025, j'obtiens mon bac, j'ai officiellement terminé le lycée 🏫...","vues":71800,"compte":"el1ott_lapt","comptes":1,"vuesTxt":"71,8 k"}],"quoi":"Flashcards"}]},{"nom":"Productivité","apps":27,"vuesParVideo":4020,"top":[{"nom":"TapCook","store":"TapCook: Budget Meal Plans","logo":"/media/simulateur/tapcook.jpg","comptes":184,"comptesFR":0,"videosSemaine":3342,"meilleure":{"vues":"31,7 k","compte":"mealprepsteve"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"9,99","max":"34,99"},"accroches":[{"label":"Budget courses choisi au hasard","texte":"¿EN COSTCO CON UN PRESUPUESTO AL AZAR?","vues":6156,"compte":"laurapresupuesto","comptes":2,"vuesTxt":"6,2 k"},{"label":"Nourrir une grande tablée à petit prix","texte":"No Frills Canada $45 to Feed 8 people Dinners for two days this weekend","vues":4646,"compte":"grocevypwoq","comptes":31,"vuesTxt":"4,6 k"},{"label":"Doute sur un petit budget courses","texte":"$80 this week for a family of 4!","vues":3862,"compte":"familytips44","comptes":49,"vuesTxt":"3,9 k"}],"quoi":"Budget Meal Plans"},{"nom":"FocusTown","store":"FocusTown : Minuteur Pomodoro","logo":"/media/simulateur/focustown.jpg","comptes":50,"comptesFR":0,"videosSemaine":432,"meilleure":{"vues":"165 k","compte":"yellen_forellen"},"note":{"note":"4,7","avis":"2,1 k"},"prix":{"min":"0,99","max":"34,99"},"accroches":[{"label":"Salle d'étude qui fait peur","texte":"why does this study room kinda looks like a horror movie 💀","vues":5720,"compte":"amiesstudycorner","comptes":1,"vuesTxt":"5,7 k"},{"label":"Macbeth comme fan fiction","texte":"macbeth is so much more interesting when you realise it’s basically a fan fic","vues":4564,"compte":"downtownacademic","comptes":1,"vuesTxt":"4,6 k"},{"label":"Café d'hiver pour lire ensemble","texte":"WAIT THERE‘S A WINTER CAFE TO READ WITH FRIENDS ONLINE?!","vues":3865,"compte":"amiesstudycorner","comptes":1,"vuesTxt":"3,9 k"}],"quoi":"Minuteur Pomodoro"},{"nom":"EcoGPT","store":"EcoGPT","logo":"/media/simulateur/ecogpt.jpg","comptes":130,"comptesFR":0,"videosSemaine":426,"meilleure":{"vues":"98,4 k","compte":"ecowithlourdes"},"note":{"note":"4,7","avis":"1,3 k"},"prix":{"min":"6,99","max":"79,99"},"accroches":[{"label":"Coïncidences qui n'arrivent qu'une fois","texte":"Coincidences that could happen only once in a lifetime 🎯","vues":1700000,"compte":"plainachos","comptes":1,"vuesTxt":"1,7 M"},{"label":"Photos d'oublis aux conséquences","texte":"Photos of times people forgot something and faced the consequences Pt.13 😂","vues":1500000,"compte":"plainachos","comptes":2,"vuesTxt":"1,5 M"},{"label":"La vaquita marina","texte":"La vaquita marina está extinta🥺💔","vues":901100,"compte":"ecologiacongaby","comptes":8,"vuesTxt":"901 k"}],"quoi":"Application d'IA conversationnelle présentée par les créatrices comme un moyen d'agir pour la planète à travers ses usages quotidiens"}]},{"nom":"Foi","apps":23,"vuesParVideo":4871,"top":[{"nom":"Sacred Shorts","store":"Sacred Shorts: Bible Videos","logo":"/media/simulateur/sacred-shorts.jpg","comptes":54,"comptesFR":0,"videosSemaine":715,"meilleure":{"vues":"392","compte":"guadalupedolores33"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"14,99","max":"69,99"},"accroches":[{"label":"Regalo para mamá con vista cansada","texte":"le regalé esto a mi mamá en su cumpleaños y lloró","vues":190,"compte":"julianagarcia4007","comptes":2,"vuesTxt":"190"},{"label":"Hijo pide herencia y la pierde","texte":"pidió su herencia antes de tiempo y la perdió toda","vues":183,"compte":"alexandraquizano","comptes":3,"vuesTxt":"183"},{"label":"Militar pide recomendar la app","texte":"mi hermano en el ejército me pidió que se la recomendara","vues":181,"compte":"melisagomez747","comptes":4,"vuesTxt":"181"}],"quoi":"Bible Videos"},{"nom":"Tarteel","store":"Tarteel: Coran et Mémorisation","logo":"/media/simulateur/tarteel.jpg","comptes":50,"comptesFR":4,"videosSemaine":217,"meilleure":{"vues":"10,4 k","compte":"tarteel.travel"},"note":{"note":"4,8","avis":"2,9 k"},"prix":{"min":"14,99","max":"249,99"},"accroches":[{"label":"Trouver la paix dans le Coran","texte":"“Find peace in Quran after a long day”","vues":34800,"compte":"muhammadibrahim007458","comptes":1,"vuesTxt":"34,8 k"},{"label":"Muraja'ah sur un air mélodieux","texte":"MK : Muroja'ah dengan irama \"jiharka\"","vues":34500,"compte":"iqbalrajasaa","comptes":1,"vuesTxt":"34,5 k"},{"label":"Ami responsable de la classe de hifz","texte":"POV: Your friend gets put in charge of the Hifz class","vues":16700,"compte":"zafrul18","comptes":1,"vuesTxt":"16,7 k"}],"quoi":"Coran et Mémorisation"},{"nom":"Scroll The Bible","store":"Scroll The Bible","logo":"/media/simulateur/scroll-the-bible.jpg","comptes":29,"comptesFR":0,"videosSemaine":159,"meilleure":{"vues":"665 k","compte":"juless4jesus"},"note":{"note":"4,9","avis":"30"},"prix":{"min":"5,99","max":"44,99"},"accroches":[{"label":"Prière contre l'anxiété","texte":"God wants you To pray against Anxiety & worry!","vues":14200,"compte":"cirley.ruballo","comptes":2,"vuesTxt":"14,2 k"},{"label":"Dieu veut que tu entendes sa voix","texte":"God wants you to hear his voice this week","vues":12300,"compte":"jodavscroll","comptes":1,"vuesTxt":"12,3 k"},{"label":"Message de Dieu pour toi","texte":"A message from God for YOU❤️‍🔥","vues":6311,"compte":"jodavscroll","comptes":1,"vuesTxt":"6,3 k"}],"quoi":"App qui propose des sujets de prière quotidiens et des passages bibliques à partir de la Parole de Dieu"}]},{"nom":"Beauté IA","apps":23,"vuesParVideo":11777,"top":[{"nom":"Fits","store":"Fits – Closet & Outfit Maker","logo":"/media/simulateur/fits.jpg","comptes":11,"comptesFR":1,"videosSemaine":67,"meilleure":{"vues":"699","compte":".username._.com"},"note":{"note":"4,5","avis":"1,3 k"},"prix":{"min":"1,99","max":"79,99"},"accroches":[],"quoi":"Closet & Outfit Maker"},{"nom":"Tatship","store":"Tatship: Simulateur Tatouage","logo":"/media/simulateur/tatship.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"1,5 k","compte":"tatshiphq"},"note":{"note":"4,4","avis":"118"},"prix":{"min":"14,99","max":"39,99"},"accroches":[{"label":"Formulaires de demande de tatouage difficiles à remplir","texte":"Tattoo request forms are HARD for clients","vues":106,"compte":"tatshiphq","comptes":1,"vuesTxt":"106"},{"label":"Tatoueur recommande l'app avant le rendez-vous","texte":"my tattoo artist just sent me this app to use before my appointment","vues":38,"compte":"tatshiphq","comptes":1,"vuesTxt":"38"}],"quoi":"Simulateur Tatouage"},{"nom":"Closfi","store":"Closfi: Tu Clóset Virtual IA","logo":"/media/simulateur/closfi.jpg","comptes":21,"comptesFR":0,"videosSemaine":19,"meilleure":{"vues":"4,5 k","compte":"carolina_outfits"},"note":null,"prix":{"min":"3,99","max":"59,99"},"accroches":[],"quoi":"Tu Clóset Virtual IA"}]},{"nom":"Jalousie et ex","apps":22,"vuesParVideo":4219,"top":[{"nom":"The Cringe","store":"The Cringe: Chat Wrapped","logo":"/media/simulateur/the-cringe.jpg","comptes":14,"comptesFR":2,"videosSemaine":95,"meilleure":{"vues":"144 k","compte":"ele_peivateaccoun"},"note":{"note":"4,0","avis":"849"},"prix":{"min":"9,99","max":"44,99"},"accroches":[],"quoi":"Chat Wrapped"},{"nom":"Red Flag","store":"Red Flag: Track Recent Follows","logo":"/media/simulateur/red-flag.jpg","comptes":21,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":{"note":"5,0","avis":"1"},"prix":{"min":"3,99","max":"89,99"},"accroches":[],"quoi":"Track Recent Follows"},{"nom":"Lucen","store":"Lucen: AI Text Dating Advice","logo":"/media/simulateur/lucen.jpg","comptes":1,"comptesFR":0,"videosSemaine":0,"meilleure":null,"note":null,"prix":null,"accroches":[],"quoi":"AI Text Dating Advice"}]},{"nom":"Bien-être mental","apps":18,"vuesParVideo":1580,"top":[{"nom":"Daimon","store":"Daimon: Honest Advice","logo":"/media/simulateur/daimon.jpg","comptes":5,"comptesFR":0,"videosSemaine":26,"meilleure":{"vues":"304 k","compte":"evelyn.0935"},"note":{"note":"4,9","avis":"904"},"prix":{"min":"0,99","max":"9,99"},"accroches":[],"quoi":"Honest Advice"},{"nom":"Gratitude Plus","store":"Gratitude Plus – Journal","logo":"/media/simulateur/gratitude-plus.jpg","comptes":5,"comptesFR":0,"videosSemaine":24,"meilleure":{"vues":"10,2 k","compte":"chaos_butmakeitcute_ish"},"note":{"note":"4,9","avis":"41"},"prix":{"min":"6,99","max":"399,99"},"accroches":[{"label":"Gagner de l'argent en postant des vidéos simples","texte":"I was tired of checking by bank account before every purchase So I started making videos of myself doing simpl","vues":275,"compte":"pis.taschio","comptes":1,"vuesTxt":"275"}],"quoi":"Journal"},{"nom":"Cora","store":"Cora - Become Her","logo":"/media/simulateur/cora.jpg","comptes":3,"comptesFR":0,"videosSemaine":4,"meilleure":{"vues":"737","compte":"becomingherpru"},"note":{"note":"4,4","avis":"34"},"prix":{"min":"6,99","max":"49,99"},"accroches":[],"quoi":"Become Her"}]},{"nom":"Séduction IA","apps":17,"vuesParVideo":18550,"top":[{"nom":"Liggo","store":"Liggo: Phrases de Drague IA","logo":"/media/simulateur/liggo.jpg","comptes":17,"comptesFR":0,"videosSemaine":111,"meilleure":{"vues":"492 k","compte":"inspectordelrizz"},"note":{"note":"5,0","avis":"2"},"prix":{"min":"3,99","max":"39,99"},"accroches":[{"label":"Qui m'accompagne à un mariage ou sortie","texte":"quien me acompaña a un casamiento quien es la afortunada?","vues":491700,"compte":"inspectordelrizz","comptes":2,"vuesTxt":"492 k"},{"label":"Amour caché, partenaire qui dort à côté","texte":"mi Sabés bien que nunca de cosas por vos, siempre fu JAJAJAJ QUE MANERA DE REÍRME que romántico que sos amigo!","vues":58087,"compte":"santidigraziaa","comptes":1,"vuesTxt":"58,1 k"},{"label":"Demander de la chance à Dieu","texte":"DIOSITO DESÉAME SUERTE","vues":33400,"compte":"mrrizz49","comptes":1,"vuesTxt":"33,4 k"}],"quoi":"Phrases de Drague IA"},{"nom":"Trick AI","store":"Trick AI","logo":"/media/simulateur/trick-ai.jpg","comptes":2,"comptesFR":0,"videosSemaine":36,"meilleure":{"vues":"70,8 k","compte":"ustamanipulator"},"note":{"note":"5,0","avis":"1"},"prix":{"min":"1,99","max":"69,99"},"accroches":[{"label":"Relégué en ami, puis plainte sur l'amitié","texte":"Beni arkadaş bölgesine attı. Sonra arkadaşlığımdan şikâyet etti.","vues":1164,"compte":"manipulasyonustasi","comptes":1,"vuesTxt":"1,2 k"},{"label":"Baiser en soirée, excusé par l'ivresse","texte":"Partide başka biriyle öpüştü. Ertesi gün \"sarhoştum, sayılmaz\" dedi.","vues":385,"compte":"manipulasyonustasi","comptes":1,"vuesTxt":"385"},{"label":"Faux nom de contact cachant une autre relation","texte":"Beni telefonuna \"Ayşe Hoca\" diye kaydetmiş. Meğer başka biriyle sevgiliymiş.","vues":304,"compte":"ustamanipulator","comptes":1,"vuesTxt":"304"}],"quoi":"Application qui aide à décoder et écrire les messages dans une conversation amoureuse, avec des conseils de réponse"},{"nom":"Yazcam","store":"Yazcam : Assistant Chat IA","logo":"/media/simulateur/yazcam.jpg","comptes":2,"comptesFR":0,"videosSemaine":10,"meilleure":{"vues":"7,8 k","compte":"alfaflort"},"note":null,"prix":{"min":"5,99","max":"79,99"},"accroches":[{"label":"Flörtün sevgilisi olduğunu öğrenmek","texte":"1 Haftadır konuştuğum Flört \"sevgilim var\" dedi","vues":4154,"compte":"tavlarizz","comptes":1,"vuesTxt":"4,2 k"},{"label":"Kıskançlık baştan itiraf, kıskançlık yarışması","texte":"POV: Kız 'ben çok kıskancım, baştan söyleyeyim' dedi ve sen kıskançlık yarışması açtın 👉","vues":522,"compte":"alfaflort","comptes":1,"vuesTxt":"522"}],"quoi":"Assistant Chat IA"}]},{"nom":"Rencontres","apps":17,"vuesParVideo":9647,"top":[{"nom":"Bump","store":"Bump - va voir tes amis IRL","logo":"/media/simulateur/bump.jpg","comptes":74,"comptesFR":7,"videosSemaine":302,"meilleure":{"vues":"621 k","compte":"brendon.bump"},"note":{"note":"4,9","avis":"12 k"},"prix":{"min":"2,49","max":"34,99"},"accroches":[{"label":"Ami en retard qu'on attend en discutant","texte":"Siempre un: Voy llegando","vues":965400,"compte":"jacqui.bump","comptes":3,"vuesTxt":"965 k"},{"label":"Ami qui préfère dormir au lieu de sortir","texte":"Azt mondja ne talizzunk ma, sokat dolgozott, inkább alszik... Most tényleg ennyire madárnak tűnök? 😂","vues":779100,"compte":"szaffi.bump","comptes":4,"vuesTxt":"779 k"},{"label":"Amour au premier regard avec Alex","texte":"- mergee Dragoste la prima vedere Alex - ok","vues":690500,"compte":"daduuu.bump","comptes":1,"vuesTxt":"691 k"}],"quoi":"Va voir tes amis IRL"},{"nom":"Milionegle","store":"Milionegle","logo":"/media/simulateur/milionegle.jpg","comptes":6,"comptesFR":0,"videosSemaine":65,"meilleure":{"vues":"5,1 k","compte":"rebecca.emprende"},"note":null,"prix":{"min":"0,99","max":"49,99"},"accroches":[{"label":"Client qui accuse le freelance d'un piratage","texte":"Hackearon la web de mi cliente y me llamó diciendo que fue mi culpa.","vues":10300,"compte":"gonzles1258","comptes":1,"vuesTxt":"10,3 k"},{"label":"Mention vague d'une application sans contexte","texte":"con una aplicación","vues":1301,"compte":"hurtaldo","comptes":1,"vuesTxt":"1,3 k"},{"label":"Client qui ne paie pas après livraison","texte":"Entregué la web, el cliente dijo «perfecto» y nunca pagó los últimos $700.","vues":1193,"compte":"gonzles1258","comptes":1,"vuesTxt":"1,2 k"}],"quoi":"App pour rencontrer d'autres entrepreneurs et développer une mentalité entrepreneuriale"},{"nom":"Dion","store":"Dion","logo":"/media/simulateur/dion.jpg","comptes":17,"comptesFR":0,"videosSemaine":41,"meilleure":{"vues":"8,3 k","compte":"gabyandsips"},"note":{"note":"4,9","avis":"53"},"prix":{"min":"24,99","max":"359,99"},"accroches":[{"label":"Sélection exclusive pour rejoindre Dion","texte":"Not everyone gets into Dion. Here’s why:","vues":3081,"compte":"revekkapal","comptes":1,"vuesTxt":"3,1 k"},{"label":"Fondateur de Dion qui tente une pause","texte":"POV: you try to take a break as the founder of Dion","vues":2540,"compte":"revekkapal","comptes":1,"vuesTxt":"2,5 k"},{"label":"Patron d'entreprise qui pense au travail la nuit","texte":"Business owners thinking they’ll get a good night sleep · my business brain all night","vues":1198,"compte":"revekkapal","comptes":1,"vuesTxt":"1,2 k"}],"quoi":"Application de mise en relation sur invitation pour rencontrer de nouvelles personnes et développer son réseau"}]},{"nom":"Finance","apps":17,"vuesParVideo":4049,"top":[{"nom":"Zoya","store":"Zoya: Halal Investing App","logo":"/media/simulateur/zoya.jpg","comptes":4,"comptesFR":0,"videosSemaine":31,"meilleure":{"vues":"96 k","compte":"malak.finance"},"note":{"note":"4,8","avis":"83"},"prix":{"min":"4,99","max":"129,99"},"accroches":[{"label":"L'islam guide aussi les finances et l'investissement","texte":"realizing that islam gives you instructions on everything including your finances, wealth, and halal investing","vues":3246,"compte":"keishaonwealth","comptes":1,"vuesTxt":"3,2 k"},{"label":"Filles qui investissent, accroche « girls who invest »","texte":"girls who invest >","vues":868,"compte":"keishaonwealth","comptes":1,"vuesTxt":"868"}],"quoi":"Halal Investing App"},{"nom":"WeStash","store":"WeStash: Budget & Épargne","logo":"/media/simulateur/westash.jpg","comptes":3,"comptesFR":0,"videosSemaine":30,"meilleure":{"vues":"4,3 k","compte":"eliestash"},"note":{"note":"4,4","avis":"28"},"prix":{"min":"3,99","max":"24,99"},"accroches":[],"quoi":"Budget & Épargne"},{"nom":"Finzee","store":"Finzee - Budget planner","logo":"/media/simulateur/finzee.jpg","comptes":13,"comptesFR":11,"videosSemaine":20,"meilleure":{"vues":"270 k","compte":"budget.forgirls"},"note":{"note":"4,8","avis":"791"},"prix":{"min":"4,99","max":"99,99"},"accroches":[],"quoi":"Budget planner"}]},{"nom":"Couple","apps":9,"vuesParVideo":5149,"top":[{"nom":"Amorly","store":"Amorly: Jeux de Couple & Quiz","logo":"/media/simulateur/amorly.jpg","comptes":2,"comptesFR":0,"videosSemaine":50,"meilleure":{"vues":"258 k","compte":"mayanowak076"},"note":{"note":"2,0","avis":"2"},"prix":{"min":"5,99","max":"79,99"},"accroches":[{"label":"Signes qu'il ou elle t'aime vraiment","texte":"4 oznaki, że twoja dziewczyna naprawdę cię kocha >>>","vues":182100,"compte":"majanowak074","comptes":2,"vuesTxt":"182 k"},{"label":"Signes de love bombing","texte":"Oznaki, że bombarduje cię miłością","vues":15800,"compte":"mayanowak076","comptes":1,"vuesTxt":"15,8 k"},{"label":"Red flags dans une relation","texte":"13 czerwonych flag 🚩 w związku ; Przeczytaj to >","vues":556,"compte":"mayanowak076","comptes":1,"vuesTxt":"556"}],"quoi":"Jeux de Couple & Quiz"},{"nom":"Pukutan","store":"Pukutan: Journal & Élevage","logo":"/media/simulateur/pukutan.jpg","comptes":30,"comptesFR":0,"videosSemaine":37,"meilleure":{"vues":"4,5 k","compte":"kydropout"},"note":{"note":"4,5","avis":"2"},"prix":{"min":"0,99","max":"69,99"},"accroches":[],"quoi":"Journal & Élevage"}]}]};
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
    function range(n) { return Array.from({ length: n }, (_, i) => i); }
    function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

    const ALL_TOP = NICHES.reduce((acc, n) => acc.concat(n.top), []).filter((a) => a.meilleure)
      .sort((a, b) => parseV(b.meilleure.vues) - parseV(a.meilleure.vues)).slice(0, 3);
    const ALL = { nom: "toutes les niches", apps: 653, vuesParVideo: 7400, top: ALL_TOP, all: true };
    return { DATA, NICHES, NNBSP, NBSP, AMOUNTS, QUICK, TIMES, BUDGETS, CODES, MARKETS, RADAR_BIG, RADAR_SMALL, PARTICLES, grp, fr, fmtDur, parseV, vuesTxt, clean, bgOf, range, plural, ALL_TOP, ALL };
  })();

  constructor(p) {
    super(p);
    const { AMOUNTS } = this.constructor.K;
    this.state = {
      step: 1, prevStep: 1, amount: 3000, niche: "Santé et physique", time: 120, budget: "lt100", code: "non", market: "FR",
      app: 0, showCalc: false, paywallOpen: false, pwOut: false, leaving: false, leaveY: 380,
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
    this.setState({ leaving: true, leaveY: y, paywallOpen: false, pwOut: false });
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
    const { NICHES, NNBSP, NBSP, AMOUNTS, QUICK, TIMES, BUDGETS, CODES, MARKETS, RADAR_BIG, RADAR_SMALL, PARTICLES, grp, fmtDur, vuesTxt, clean, bgOf, range, plural } = this.constructor.K;
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
      const o = this.opt("niche", n.nom, i, 2);
      o.nom = n.nom;
      o.logos = n.top.slice(0, 3).map((a, j) => ({ bg: bgOf(a.logo), st: "--j: " + j + "; --r: " + [-10, 0, 10][j] + "deg; z-index: " + (3 - j) + ";" }));
      if (i === NICHES.length - 1 && NICHES.length % 2 === 1) o.wrapStyle += " grid-column: 1 / -1;";
      return o;
    });
    v.nsp = this.opt("niche", "all", NICHES.length, 2, "kpm-nsp");

    // 3 — Temps
    v.timeItems = TIMES.map((t, i) => {
      const o = this.opt("time", t.v, i, 2);
      o.label = t.label;
      o.sub = plural(t.vids, "vidéo", "vidéos") + " par jour";
      o.sr = t.label + ", " + o.sub;
      o.subStyle = "--n: " + t.vids + ";";
      o.thumbs = range(t.vids).map((j) => ({ st: "--j: " + j + ";" }));
      return o;
    });

    // 4 — Budget
    v.budgetItems = BUDGETS.map((b, i) => {
      const o = this.opt("budget", b.v, i, 2);
      o.label = b.label;
      o.coins = range(b.coins).map((j) => ({ cls: "kpm-coin" + (j === b.coins - 1 ? " is-top" : ""), st: "--j: " + j + "; z-index: " + (j + 1) + ";" }));
      return o;
    });

    // 5 — Code / 6 — Marché
    CODES.forEach((c, i) => { v["cd" + i] = this.opt("code", c, i, 2); });
    MARKETS.forEach((m, i) => { v["mk" + i] = this.opt("market", m, i, 2); });

    // 7 — Calcul
    const ph = s.phase || 0;
    const cnt = ph >= 4 ? nTop : ph >= 1 ? nd.apps : 653;
    v.calcRollA = this.roller(String(cnt), "###", true, 0);
    v.calcRollB = this.roller(String(ph >= 4 ? nTop : nd.apps), "###", true, 0);
    v.lineACls = "kpm-lineA" + (ph >= 3 ? " is-out" : "");
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
    v.f = {
      bg: bgOf(a0.logo), nom: a0.nom, quoi: a0.quoi || "",
      hasBest: !!a0.meilleure,
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

    // 9 — Stratégie
    const ix = Math.min(Math.max(0, s.app || 0), nTop - 1);
    const a = apps[ix];
    const hooksRaw = (a.accroches || []).map((h) => Object.assign({}, h, { texte: clean(h.texte) })).filter((h) => h.texte);
    const hasHooks = hooksRaw.length > 0;
    const rots = [-2, 1, 2.5];
    let hooks = hooksRaw.slice(0, 3).map((h, i) => {
      const L = h.texte.length;
      const fs = L <= 30 ? 19 : L <= 55 ? 17 : L <= 80 ? 15 : 14;
      return {
        isHook: true, isBest: false, texte: h.texte, big: "",
        textSt: "font-size: " + fs + "px;",
        vues: vuesTxt(h.vuesTxt), compte: "@" + h.compte,
        st: "--k: " + i + "; --rot: " + rots[i] + "deg; z-index: " + (3 - i) + ";",
        cls: "kpm-hook" + (s.hookHit === i ? (s.hookN % 2 ? " kpm-hA" : " kpm-hB") : ""),
        tap: () => this.tapHook(i),
      };
    });
    if (!hasHooks && a.meilleure) {
      hooks = [{
        isHook: false, isBest: true, texte: "", big: String(a.meilleure.vues).replace(/\s/g, NBSP), textSt: "",
        vues: "", compte: "@" + a.meilleure.compte,
        st: "--k: 0; --rot: -2deg; z-index: 1;",
        cls: "kpm-hook" + (s.hookHit === 0 ? (s.hookN % 2 ? " kpm-hA" : " kpm-hB") : ""),
        tap: () => this.tapHook(0),
      }];
    }
    const avN = Math.min(6, P.comptes);
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
      avatars: range(avN).map((j) => ({ st: "--j: " + j + "; margin-left: " + (j ? -12 : 0) + "px; z-index: " + (10 - j) + ";" })),
      avMore: P.comptes > 6, avMoreTxt: "+" + (P.comptes - 6), avMoreSt: "--j: 6; margin-left: -12px; z-index: 1;",
      perAccTxt: plural(P.perAcc, "vidéo", "vidéos") + " par jour" + (P.comptes > 1 ? " chacun" : ""),
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
      $h("div", { "class": "sw kpm-root", "data-theme": "light", "style": "--kpm-rest: inset 0 0 0 1px #E6E7EC, 0 1px 2px rgba(16,24,40,0.04), 0 10px 28px rgba(16,24,40,0.06); --kpm-sel: inset 0 0 0 2px #0B6FE0, 0 1px 2px rgba(16,24,40,0.04), 0 16px 38px rgba(11,111,224,0.22); position: relative; width: 100%; height: 100vh; height: 100dvh; box-sizing: border-box; overflow: hidden; background: #F6F7F9; color: #0E0F12; font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; overflow: hidden; pointer-events: none;" },
          $h("span", { "class": "kpm-blob kpm-b1" }),
          $h("span", { "class": "kpm-blob kpm-b2" }),
          $h("span", { "class": "kpm-blob kpm-b3" }),
          $h("span", { "class": "kpm-dots", "style": $v.dotsStyle })
        ),
        $h("div", { "class": "kpm-scroll", "ref": $v.scrollRef, "onscroll": $v.onScroll, "style": "position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto;" },
          $h("div", { "class": $v.stageCls, "style": $v.stageStyle },
            ($v.isStep1) ? [
              $h("main", { "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "style": "position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center;" },
                    $h("span", { "aria-hidden": "true", "class": "kpm-halo", "style": "position: absolute; z-index: -1; left: 50%; top: 44%; width: 440px; height: 440px; margin: -220px 0 0 -220px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.07) 52%, rgba(11,111,224,0) 100%); pointer-events: none;" }),
                    $h("output", { "for": "montant", "class": "kpm-in", "style": "--i: 2; display: block; padding-left: 0.06em; font-family: var(--font-display); font-size: 92px; font-weight: 800; letter-spacing: -0.06em; color: #0E0F12;" },
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
                    $h("span", { "class": "kpm-in", "style": "--i: 3; margin-top: 16px; display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: 999px; background: #FFFFFF; box-shadow: var(--kpm-rest); font-size: 15px; color: #4A4F57; white-space: nowrap;" },
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
                  $h("div", { "class": "kpm-in", "style": "--i: 4; margin-top: 40px; width: 100%; padding: 0 4px; box-sizing: border-box;" },
                    $h("label", { "for": "montant", "class": "visually-hidden" },
                      "Ton objectif par mois, de 500 € à 30 000 €"
                    ),
                    $h("input", { "id": "montant", "class": $v.rangeCls, "type": "range", "min": "0", "max": "10", "step": "1", "value": $v.amtIdx, "aria-valuetext": $v.amtText, "onInput": $v.onAmount, "onChange": $v.onAmount, "style": $v.rangeStyle })
                  ),
                  $h("div", { "role": "radiogroup", "aria-label": "Montants rapides", "style": "margin-top: 24px; width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
                    ($l($v.quick)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick, "style": "display: flex; align-items: center; justify-content: center; gap: 10px; height: 56px; padding: 0 16px; border-radius: 999px; font-size: 17px; font-weight: 600; color: #0E0F12; font-variant-numeric: tabular-nums; white-space: nowrap;" },
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
                $h("div", { "class": "kpm-in", "style": "--i: 9; flex-shrink: 0;" },
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
              $h("main", { "class": $v.groupCls, "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "id": "q-niche", "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 32px 0 24px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-niche", "style": "width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
                    ($l($v.nicheItems)).map((o) => [
                      $h("div", { "class": "kpm-in nb", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick, "style": "height: 120px; padding: 16px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                          $h("span", { "aria-hidden": "true", "style": "position: relative; display: flex;" },
                            ($l(o?.logos)).map((l) => [
                              $h("span", { "class": "kpm-lg", "style": l?.st },
                                $h("span", { "class": "kpm-logo kpm-img", "style": l?.bg })
                              )
                            ])
                          ),
                          $h("span", { "style": "position: relative; font-size: 16px; line-height: 1.25; font-weight: 700; letter-spacing: -0.01em; color: #0E0F12;" },
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
                  $h("div", { "class": "kpm-in", "style": `${$t($v.nsp?.wrapStyle)} margin-top: 16px;` },
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
                $h("div", { "class": "kpm-in", "style": "--i: 19; flex-shrink: 0;" },
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
              $h("main", { "class": $v.groupCls, "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "id": "q-temps", "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-temps", "style": "width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
                    ($l($v.timeItems)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "aria-label": o?.sr, "class": o?.cls, "onClick": o?.pick, "style": "height: 168px; padding: 18px 18px 16px; border-radius: 22px; display: flex; flex-direction: column; align-items: flex-start; text-align: left;" },
                          $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 44px; line-height: 1; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap;" },
                            $t(o?.label)
                          ),
                          $h("span", { "aria-hidden": "true", "style": "position: relative; margin-top: auto; display: flex; gap: 3px;" },
                            ($l(o?.thumbs)).map((t) => [
                              $h("span", { "class": "kpm-v" },
                                $h("span", { "class": "kpm-vf", "style": t?.st })
                              )
                            ])
                          ),
                          $h("span", { "aria-hidden": "true", "style": "position: relative; display: block; margin-top: 10px; height: 18px;" },
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
                $h("div", { "class": "kpm-in", "style": "--i: 7; flex-shrink: 0;" },
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
              $h("main", { "class": $v.groupCls, "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "id": "q-budget", "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-budget", "style": "width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
                    ($l($v.budgetItems)).map((o) => [
                      $h("div", { "class": "kpm-in", "style": o?.wrapStyle },
                        $h("button", { "type": "button", "role": "radio", "aria-checked": o?.aria, "class": o?.cls, "onClick": o?.pick, "style": "height: 176px; padding: 18px 16px; border-radius: 22px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; text-align: left;" },
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
                          $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 20px; line-height: 1.12; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                $h("div", { "class": "kpm-in", "style": "--i: 7; flex-shrink: 0;" },
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
              $h("main", { "class": $v.groupCls, "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "id": "q-code", "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-code", "style": "width: 100%; display: flex; flex-direction: column; gap: 14px;" },
                    $h("div", { "class": "kpm-in", "style": $v.cd0?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd0?.aria, "class": $v.cd0?.cls, "onClick": $v.cd0?.pick, "style": "min-height: 112px; padding: 16px 52px 16px 16px; border-radius: 24px; display: flex; align-items: center; gap: 18px; text-align: left;" },
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
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd1?.aria, "class": $v.cd1?.cls, "onClick": $v.cd1?.pick, "style": "min-height: 112px; padding: 16px 52px 16px 16px; border-radius: 24px; display: flex; align-items: center; gap: 18px; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-plate" },
                          $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("g", { "class": "kpm-draw", "fill": "none", "stroke": "currentColor", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("rect", { "x": "14", "y": "3", "width": "7", "height": "7", "rx": "1" }),
                              $h("path", { "d": "M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" })
                            )
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.cd2?.aria, "class": $v.cd2?.cls, "onClick": $v.cd2?.pick, "style": "min-height: 112px; padding: 16px 52px 16px 16px; border-radius: 24px; display: flex; align-items: center; gap: 18px; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-plate" },
                          $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("g", { "class": "kpm-draw", "fill": "none", "stroke": "currentColor", "stroke-width": "1.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("path", { "d": "M18 16l4-4-4-4" }),
                              $h("path", { "d": "M6 8l-4 4 4 4" }),
                              $h("path", { "d": "M14.5 4l-5 16" })
                            )
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "class": "kpm-in", "style": "--i: 6; flex-shrink: 0;" },
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
              $h("main", { "class": $v.groupCls, "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 40px 20px 48px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;" },
                $h("h1", { "id": "q-marche", "style": "margin: 0; max-width: 330px; text-align: center; font-family: var(--font-display); font-size: 34px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; text-wrap: balance;" },
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
                $h("div", { "style": "flex: 1 0 auto; width: 100%; padding: 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                  $h("div", { "role": "radiogroup", "aria-labelledby": "q-marche", "style": "width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
                    $h("div", { "class": "kpm-in", "style": $v.mk0?.wrapStyle },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk0?.aria, "class": $v.mk0?.cls, "onClick": $v.mk0?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#FFFFFF" }),
                            $h("rect", { "width": "13.4", "height": "40", "fill": "#0055A4" }),
                            $h("rect", { "x": "26.6", "width": "13.4", "height": "40", "fill": "#EF4135" })
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk1?.aria, "class": $v.mk1?.cls, "onClick": $v.mk1?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
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
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk2?.aria, "class": $v.mk2?.cls, "onClick": $v.mk2?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#012169" }),
                            $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#FFFFFF", "stroke-width": "8" }),
                            $h("path", { "d": "M0 0L40 40M40 0L0 40", "stroke": "#C8102E", "stroke-width": "2.6" }),
                            $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#FFFFFF", "stroke-width": "11" }),
                            $h("path", { "d": "M20 0V40M0 20H40", "stroke": "#C8102E", "stroke-width": "6" })
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk3?.aria, "class": $v.mk3?.cls, "onClick": $v.mk3?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#F1BF00" }),
                            $h("rect", { "width": "40", "height": "10", "fill": "#AA151B" }),
                            $h("rect", { "y": "30", "width": "40", "height": "10", "fill": "#AA151B" })
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk4?.aria, "class": $v.mk4?.cls, "onClick": $v.mk4?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag" },
                          $h("svg", { "viewBox": "0 0 40 40", "aria-hidden": "true" },
                            $h("rect", { "width": "40", "height": "40", "fill": "#009C3B" }),
                            $h("path", { "d": "M20 6L36 20L20 34L4 20Z", "fill": "#FFDF00" }),
                            $h("circle", { "cx": "20", "cy": "20", "r": "7.5", "fill": "#002776" })
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.mk5?.aria, "class": $v.mk5?.cls, "onClick": $v.mk5?.pick, "style": "height: 124px; padding: 18px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left;" },
                        $h("span", { "aria-hidden": "true", "class": "kpm-flag", "style": "background: #EAF2FF; display: grid; place-items: center;" },
                          $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 26px; height: 26px;" },
                            $h("g", { "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" },
                              $h("circle", { "cx": "12", "cy": "12", "r": "9.5" }),
                              $h("path", { "d": "M12 2.5a13.5 13.5 0 0 0 0 19a13.5 13.5 0 0 0 0-19" }),
                              $h("path", { "d": "M2.5 12h19" })
                            )
                          )
                        ),
                        $h("span", { "style": "position: relative; font-family: var(--font-display); font-size: 21px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: #0E0F12; white-space: nowrap;" },
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
                $h("div", { "class": "kpm-in", "style": "--i: 9; flex-shrink: 0;" },
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
              $h("main", { "style": "position: relative; overflow-x: clip; flex: 1 0 auto; min-height: 776px; padding: 24px 20px 72px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;" },
                $h("div", { "aria-hidden": "true", "class": "kpm-in", "style": "--i: 0; position: relative; width: 300px; height: 300px; flex-shrink: 0;" },
                  $h("div", { "class": "kpm-halo", "style": "position: absolute; left: -110px; top: -110px; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.16), rgba(11,111,224,0.06) 55%, rgba(11,111,224,0) 100%);" }),
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
                $h("div", { "class": "kpm-in", "style": "--i: 2; position: relative; margin-top: 40px; width: 100%; min-height: 80px; display: grid; justify-items: center; align-items: center; text-align: center;" },
                  $h("p", { "class": $v.lineACls, "aria-hidden": "true", "style": "grid-area: 1 / 1; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; font-family: var(--font-display); font-size: 34px; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12;" },
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
                    $h("h1", { "class": "kpm-found", "style": "grid-area: 1 / 1; margin: 0; display: flex; align-items: flex-start; line-height: 1; font-family: var(--font-display); font-size: 34px; font-weight: 700; letter-spacing: -0.04em; color: #0E0F12; white-space: nowrap;" },
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
                $h("ul", { "class": "kpm-in", "style": "--i: 3; position: relative; list-style: none; margin: 20px 0 0; padding: 0; display: flex; align-items: center; gap: 16px;" },
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
                $h("div", { "role": "progressbar", "aria-label": "Recherche", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": $v.calcPct, "class": "kpm-in", "style": "--i: 4; position: relative; margin-top: 24px; width: 220px; height: 4px; border-radius: 2px; overflow: hidden; background: #E3E5EA;" },
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
                          ($v.f?.hasBest) ? [
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
                        $h("li", { "class": "kpm-deal", "style": `${$t(h?.st)} width: 150px; flex-shrink: 0; scroll-snap-align: start;` },
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
                          ),
                          $h("span", { "style": "display: block; margin-top: 12px; font-family: var(--font-display); font-size: 19px; line-height: 1.15; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                            $t(h?.vues)
                          ),
                          $h("span", { "style": "display: block; margin-top: 2px; font-size: 15px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(h?.compte)
                          )
                        )
                      ])
                    )
                  )
                ] : null,
                $h("section", { "class": $v.rvAcc, "data-rv": "s9-acc", "ref": $v.rvRef, "aria-labelledby": "comptes-titre", "style": "margin-top: 48px;" },
                  $h("h2", { "id": "comptes-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; font-weight: 700; letter-spacing: -0.04em; color: var(--ink);" },
                    "Tes comptes"
                  ),
                  $h("div", { "aria-hidden": "true", "style": "margin-top: 20px; display: flex; align-items: center;" },
                    ($l($v.s9?.avatars)).map((a) => [
                      $h("span", { "class": "kpm-av", "style": `${$t(a?.st)} position: relative; display: grid; place-items: center; width: 56px; height: 56px; flex-shrink: 0; border-radius: 50%; background: #EAF2FF; box-shadow: 0 0 0 3px #F6F7F9, inset 0 0 0 1px rgba(11,111,224,0.14);` },
                        $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "8.5", "r": "3.8", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8" }),
                          $h("path", { "d": "M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round" })
                        )
                      )
                    ]),
                    ($v.s9?.avMore) ? [
                      $h("span", { "class": "kpm-av", "style": `${$t($v.s9?.avMoreSt)} position: relative; display: grid; place-items: center; height: 56px; min-width: 56px; padding: 0 12px; box-sizing: border-box; border-radius: 999px; background: #0B6FE0; box-shadow: 0 0 0 3px #F6F7F9; font-size: 16px; font-weight: 700; color: #FFFFFF;` },
                        $t($v.s9?.avMoreTxt)
                      )
                    ] : null
                  ),
                  $h("p", { "style": "margin: 16px 0 0; font-size: 17px; line-height: 1.35; font-weight: 600; color: var(--ink);" },
                    $t($v.s9?.perAccTxt)
                  ),
                  $h("p", { "style": "margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #E3E5EA; font-size: 15px; color: var(--ink-faint);" },
                    $t($v.s9?.nom), " en fait tourner ",
                    $h("strong", { "style": "font-weight: 700; color: var(--ink-soft);" },
                      $t($v.s9?.appComptes)
                    )
                  )
                ),
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
