// Généré par scripts/dc2preact.py depuis design/app/MFormats.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFormats extends DCLogic {

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    let ALL = [{"rank": "02", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "raw": "‼️🚨GUARDA E PARTILHA🚨‼️", "gloss": "Appel à sauvegarder et partager la vidéo", "niche": "Études", "mk": [{"c": "BR"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "17×", "medInk": "var(--accent)", "hot": true, "max": "38 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}, {"src": "/media/app/v-7706231148648647969.jpg", "v": "1 k", "h": "@studywithninaa_", "raw": 1233, "date": "09/11", "app": "Astra AI"}], "views": 101659}, {"rank": "03", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "exam vibes", "raw": "exam vibes", "gloss": "5 comptes l'ont posé sur leurs vidéos", "niche": "Études", "mk": [{"c": "US"}, {"c": "DE"}], "n": 5, "ok": "4/6", "okText": "4 sur 6", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "7×", "medInk": "var(--ink)", "hot": false, "max": "23 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}, {"src": "/media/app/v-7706244970096643361.jpg", "v": "7 k", "h": "@lernenmitdiana", "raw": 6897, "date": "09/11", "app": "Astra AI"}], "views": 57312}, {"rank": "04", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "original sound - dicsovn", "raw": "original sound - dicsovn", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "ID"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "5,7×", "medInk": "var(--ink)", "hot": false, "max": "1,67 M", "apps": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}], "appLine": "Love8", "app0": {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "cov4": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "views": 1685331}, {"rank": "05", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️ »", "raw": "HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️", "gloss": "Emploi du temps productif détaillé", "niche": "Études", "mk": [{"c": "US"}], "n": 4, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "4,9×", "medInk": "var(--ink)", "hot": false, "max": "24 k", "apps": [{"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}], "appLine": "Knowunity", "app0": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "last": "vu le 04/11", "cov": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}], "cov4": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}, {"src": "/media/app/v-7704058365806136598.jpg", "v": "820", "h": "@studywmilliegee", "raw": 820, "date": "03/11", "app": "Knowunity"}], "views": 34925}, {"rank": "06", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« “POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar  »", "raw": "“POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar ", "gloss": "Conseil de révision ciblée pour réussir", "niche": "Études", "mk": [{"c": "MX"}], "n": 4, "ok": "7/11", "okText": "7 sur 11", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "4,7×", "medInk": "var(--ink)", "hot": false, "max": "9 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "views": 21326}, {"rank": "07", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "purple", "raw": "purple", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "US"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,5×", "medInk": "var(--ink)", "hot": false, "max": "4 k", "apps": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, {"name": "Airbuds", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "Love8 et Airbuds", "app0": {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7706958665764408597.jpg", "v": "4 k", "h": "@seviiqq_", "raw": 4169, "date": "11/11", "app": "Love8"}, {"src": "/media/app/v-7703620473116036382.jpg", "v": "3 k", "h": "@tehhemia", "raw": 2920, "date": "02/11", "app": "Airbuds"}, {"src": "/media/app/v-7701384137596226838.jpg", "v": "3 k", "h": "@kayleighvlogging", "raw": 2523, "date": "27/10", "app": "Airbuds"}], "cov4": [{"src": "/media/app/v-7706958665764408597.jpg", "v": "4 k", "h": "@seviiqq_", "raw": 4169, "date": "11/11", "app": "Love8"}, {"src": "/media/app/v-7703620473116036382.jpg", "v": "3 k", "h": "@tehhemia", "raw": 2920, "date": "02/11", "app": "Airbuds"}, {"src": "/media/app/v-7701384137596226838.jpg", "v": "3 k", "h": "@kayleighvlogging", "raw": 2523, "date": "27/10", "app": "Airbuds"}], "views": 9612}, {"rank": "08", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada »", "raw": "Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada", "gloss": "Ce n'est pas pour discuter, c'est pour être entendue", "niche": "Jalousie et ex", "mk": [{"c": "MX"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,3×", "medInk": "var(--ink)", "hot": false, "max": "71 k", "apps": [{"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "RecentFollow", "app0": {"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7705537368907959573.jpg", "v": "71 k", "h": "@marti14320", "raw": 71204, "date": "07/11", "app": "RecentFollow"}, {"src": "/media/app/v-7706784554777939208.jpg", "v": "4 k", "h": "@fio.chisme", "raw": 3510, "date": "11/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704179787698359604.jpg", "v": "717", "h": "@soysarahi303", "raw": 717, "date": "04/11", "app": "RecentFollow"}], "cov4": [{"src": "/media/app/v-7705537368907959573.jpg", "v": "71 k", "h": "@marti14320", "raw": 71204, "date": "07/11", "app": "RecentFollow"}, {"src": "/media/app/v-7706784554777939208.jpg", "v": "4 k", "h": "@fio.chisme", "raw": 3510, "date": "11/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704179787698359604.jpg", "v": "717", "h": "@soysarahi303", "raw": 717, "date": "04/11", "app": "RecentFollow"}], "views": 75431}, {"rank": "09", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "original sound - ex7stence", "raw": "original sound - ex7stence", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,2×", "medInk": "var(--ink)", "hot": false, "max": "28 k", "apps": [{"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "RecentFollow", "app0": {"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "last": "vu le 12/11", "cov": [{"src": "/media/app/v-7704011591062261023.jpg", "v": "28 k", "h": "@alexandria.girlhacks", "raw": 28106, "date": "03/11", "app": "RecentFollow"}, {"src": "/media/app/v-7707075093578419476.jpg", "v": "7 k", "h": "@juli.chisme", "raw": 7140, "date": "12/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704407707469630741.jpg", "v": "6 k", "h": "@marti14320", "raw": 5606, "date": "04/11", "app": "RecentFollow"}], "cov4": [{"src": "/media/app/v-7704011591062261023.jpg", "v": "28 k", "h": "@alexandria.girlhacks", "raw": 28106, "date": "03/11", "app": "RecentFollow"}, {"src": "/media/app/v-7707075093578419476.jpg", "v": "7 k", "h": "@juli.chisme", "raw": 7140, "date": "12/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704407707469630741.jpg", "v": "6 k", "h": "@marti14320", "raw": 5606, "date": "04/11", "app": "RecentFollow"}], "views": 40852}, {"rank": "10", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "Hey There Delilah", "raw": "Hey There Delilah", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "US"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,2×", "medInk": "var(--ink)", "hot": false, "max": "5 k", "apps": [{"name": "Loverzz", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": ""}, {"name": "Palima", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "Loverzz et Palima", "app0": {"name": "Loverzz", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705565722017090848.jpg", "v": "5 k", "h": "@julie.vorin", "raw": 5368, "date": "07/11", "app": "Loverzz"}, {"src": "/media/app/v-7706135581293628705.jpg", "v": "3 k", "h": "@erin8521", "raw": 2733, "date": "09/11", "app": "Palima"}, {"src": "/media/app/v-7705866119814417684.jpg", "v": "456", "h": "@lovenotesdaisy", "raw": 456, "date": "08/11", "app": "Loverzz"}], "cov4": [{"src": "/media/app/v-7705565722017090848.jpg", "v": "5 k", "h": "@julie.vorin", "raw": 5368, "date": "07/11", "app": "Loverzz"}, {"src": "/media/app/v-7706135581293628705.jpg", "v": "3 k", "h": "@erin8521", "raw": 2733, "date": "09/11", "app": "Palima"}, {"src": "/media/app/v-7705866119814417684.jpg", "v": "456", "h": "@lovenotesdaisy", "raw": 456, "date": "08/11", "app": "Loverzz"}], "views": 8557}];
    ALL = ALL.map((c) => Object.assign({ href: '/app/formats' }, c));
    // Sur le site : les formats du Radar (document « formats »), lus comme FormatsB ; le premier est le plus fort de la semaine.
    let H = null, FAN = null, NI = null;
    const D = this.props && this.props.data;
    if (D === null) { ALL = []; H = false; NI = []; }
    if (D && D.formats) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + ' j'; };
      const ML = { FR: 'France', US: 'États-Unis et anglophones', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', XX: 'Autres langues' };
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c && c !== 'XX').slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const appOf = (a) => Object.assign({ name: a.name }, ico(a));
      const card = (f, i) => { const hook = f.kind === 'hook'; const ms = f.members || [];
        return { rank: String(i + 1).padStart(2, '0'), kind: hook ? 'Accroche' : 'Son', ico: hook ? TXT : SON, isHook: hook, isSon: !hook, quote: hook ? '« ' + f.label + ' »' : f.label, raw: f.label,
          niche: f.niche || '', mk: f.market && f.market !== 'XX' ? [{ c: f.market }] : [], n: f.accounts, ok: f.wins + '/' + f.n, okText: f.wins + ' sur ' + f.n,
          med: f.medX ? xf(f.medX) : '—', max: nf(f.maxViews || 0), apps: (f.apps || []).slice(0, 2).map(appOf),
          app0: f.apps && f.apps[0] ? appOf(f.apps[0]) : { name: '', logo: '', nologo: true, blank: 'sw-app-blank' },
          line: [names(f.apps), f.accounts + ' comptes', f.niche].filter(Boolean).join(' · '), last: f.lastPostAt ? 'repris le ' + day(f.lastPostAt) : '',
          cov: ms.slice(0, 3).map((m) => ({ src: m.cover || '', v: nf(m.views) })), members: ms, hasGloss: false, glossText: '', href: '/app/formats/' + f.id }; };
      const cs = D.formats.map(card);
      H = cs[0] || false;
      ALL = cs.slice(1);
      FAN = H ? H.members.slice(0, 4).map((m, i) => ({ src: m.cover || '', v: nf(m.views), r: ((b.fan || [])[i] || {}).r || 0, t: ((b.fan || [])[i] || {}).t || 0, href: '/app/videos/' + m.videoId })) : [];
      const cnt = {};
      D.formats.slice(1).forEach((f) => { cnt[f.niche] = (cnt[f.niche] || 0) + 1; });
      NI = [{ l: 'Toutes', n: D.formats.length - 1 }].concat(Object.keys(cnt).sort((p, q) => (p === 'Autres') - (q === 'Autres') || cnt[q] - cnt[p]).map((k) => ({ l: k, n: cnt[k] })));
    }
    const niche = st.niche || 'Toutes', type = st.type || 'Tout';
    let cards = ALL.filter((c) => (niche === 'Toutes' || c.niche === niche) && (type === 'Tout' || (type === 'Accroches' ? c.kind === 'Accroche' : c.kind === 'Son')));
    const lim = st.lim || 30;
    const hidden = Math.max(0, cards.length - lim);
    cards = cards.slice(0, lim);
    return {
      cards, noCards: cards.length === 0, moreOn: hidden > 0, moreLabel: 'Voir ' + Math.min(30, hidden) + ' formats de plus', showMore: () => this.setState({ lim: lim + 30 }),
      h: H || b.h, fan: FAN || b.fan, hasHero: H !== false, noCardsText: ALL.length ? 'Aucun autre format pour ce filtre cette semaine.' : 'Aucun format à montrer pour l’instant.',
      niches: (NI || b.niches || []).map((c) => Object.assign({}, c, { on: c.l === niche ? 'true' : 'false', pick: () => this.setState({ niche: c.l }) })),
      types: ['Tout', 'Accroches', 'Sons'].map((l) => ({ l, on: l === type ? 'true' : 'false', pick: () => this.setState({ type: l }) }))
    };
  }

  baseVals() {
    const niches = [{"l": "Toutes", "n": 10, "on": "true"}, {"l": "Études", "n": 5, "on": "false"}, {"l": "Couple", "n": 3, "on": "false"}, {"l": "Jalousie et ex", "n": 2, "on": "false"}];
    let h = {"rank": "01", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ich lösche das in 2h‼️ »", "raw": "Ich lösche das in 2h‼️", "gloss": "Vidéo supprimée dans 24 heures", "niche": "Études", "mk": [{"c": "DE"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "39×", "medInk": "var(--accent)", "hot": true, "max": "106 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 10/11", "cov": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards"}], "views": 201780};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let fan = [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "r": -6, "t": 10}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "r": -2, "t": 0}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "r": 2, "t": 0}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "r": 6, "t": 10}];
    fan = fan.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    const cards = [{"rank": "02", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "raw": "‼️🚨GUARDA E PARTILHA🚨‼️", "gloss": "Appel à sauvegarder et partager la vidéo", "niche": "Études", "mk": [{"c": "BR"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "17×", "medInk": "var(--accent)", "hot": true, "max": "38 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}, {"src": "/media/app/v-7706231148648647969.jpg", "v": "1 k", "h": "@studywithninaa_", "raw": 1233, "date": "09/11", "app": "Astra AI"}], "views": 101659}, {"rank": "03", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "exam vibes", "raw": "exam vibes", "gloss": "5 comptes l'ont posé sur leurs vidéos", "niche": "Études", "mk": [{"c": "US"}, {"c": "DE"}], "n": 5, "ok": "4/6", "okText": "4 sur 6", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "7×", "medInk": "var(--ink)", "hot": false, "max": "23 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}, {"src": "/media/app/v-7706244970096643361.jpg", "v": "7 k", "h": "@lernenmitdiana", "raw": 6897, "date": "09/11", "app": "Astra AI"}], "views": 57312}, {"rank": "04", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "original sound - dicsovn", "raw": "original sound - dicsovn", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "ID"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "5,7×", "medInk": "var(--ink)", "hot": false, "max": "1,67 M", "apps": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}], "appLine": "Love8", "app0": {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "cov4": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "views": 1685331}, {"rank": "05", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️ »", "raw": "HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️", "gloss": "Emploi du temps productif détaillé", "niche": "Études", "mk": [{"c": "US"}], "n": 4, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "4,9×", "medInk": "var(--ink)", "hot": false, "max": "24 k", "apps": [{"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}], "appLine": "Knowunity", "app0": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "last": "vu le 04/11", "cov": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}], "cov4": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}, {"src": "/media/app/v-7704058365806136598.jpg", "v": "820", "h": "@studywmilliegee", "raw": 820, "date": "03/11", "app": "Knowunity"}], "views": 34925}, {"rank": "06", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« “POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar  »", "raw": "“POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar ", "gloss": "Conseil de révision ciblée pour réussir", "niche": "Études", "mk": [{"c": "MX"}], "n": 4, "ok": "7/11", "okText": "7 sur 11", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "4,7×", "medInk": "var(--ink)", "hot": false, "max": "9 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "views": 21326}];
    h = Object.assign({ line: 'Retain Cards · 3 comptes · Études', href: '/app/formats', hasGloss: true,
      glossText: 'En français : « Je supprime ça dans 2 h ». La vidéo va disparaître, il faut la regarder maintenant.' }, h);

    return { niches, h, fan, cards, hasHero: true };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Formats"
            )
          ),
          $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openPal, "aria-label": "Chercher", "style": "flex-shrink: 0; width: 44px; height: 44px;" },
            $h("svg", { "width": "21", "height": "21", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/alertes", "aria-label": "Alertes", "style": "flex-shrink: 0; position: relative; width: 44px; height: 44px;" },
            $h("svg", { "width": "21", "height": "21", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "href": "/app/compte", "aria-label": "Mon compte", "style": "width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-right: -4px;" },
            $h("span", { "class": "sw-avatar", "style": "width: 36px; height: 36px; font-size: 14px;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("section", { "aria-label": "Type et niche", "class": "m-fc" },
          $h("div", { "class": "m-tc is-flat", "role": "tablist", "aria-label": "Type" },
            ($l($v.types)).map((t) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick },
                $h("span", { "class": "m-ic", "data-i": t?.l, "aria-hidden": "true" }),
                $t(t?.l)
              )
            ])
          ),
          $h("span", { "aria-hidden": "true", "class": "m-fc-line" }),
          $h("div", { "class": "m-fc-row" },
            ($l($v.niches)).map((c) => [
              $h("button", { "class": "m-chip", "type": "button", "aria-pressed": c?.on, "onClick": c?.pick },
                $h("span", { "class": "m-ic", "data-i": c?.l, "aria-hidden": "true", "style": "width: 14px; height: 14px;" }),
                $t(c?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                  $t(c?.n)
                )
              )
            ])
          )
        ),
        ($v.hasHero) ? [
          $h("section", { "class": "sw-card is-featured", "style": "margin: 16px 20px 0; border-radius: 26px; padding: 22px 20px 24px; overflow: hidden; display: flex; flex-direction: column; gap: 16px;" },
            $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -120px; top: -140px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.32), transparent);" }),
            $h("span", { "class": "sw-eyebrow", "style": "position: relative; font-size: 12px;" },
              $h("b", null,
                "["
              ),
              " Le plus fort cette semaine ",
              $h("b", null,
                "]"
              )
            ),
            $h("h2", { "style": "position: relative; margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
              $t($v.h?.quote)
            ),
            ($v.h?.hasGloss) ? [
              $h("p", { "style": "position: relative; margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
                $t($v.h?.glossText)
              )
            ] : null,
            $h("div", { "style": "position: relative; height: 196px;" },
              ($l($v.fan)).map((c) => [
                $h("a", { "href": c?.href, "aria-label": "Ouvrir la vidéo", "class": "sw-video", "style": `display: inline-block; vertical-align: top; width: 84px; margin-right: -6px; transform: translateY(${$t(c?.t)}px) rotate(${$t(c?.r)}deg); border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);` },
                  $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                    $t(c?.v)
                  )
                )
              ])
            ),
            $h("div", { "style": "position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
              $h("span", { "style": "display: flex; flex-direction: column;" },
                $h("span", { "class": "sw-stat", "style": "font-size: 26px; color: var(--accent);" },
                  $t($v.h?.med)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  "la normale"
                )
              ),
              $h("span", { "style": "display: flex; flex-direction: column;" },
                $h("span", { "class": "sw-stat", "style": "font-size: 26px;" },
                  $t($v.h?.okText)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  "réussies"
                )
              ),
              $h("span", { "style": "display: flex; flex-direction: column;" },
                $h("span", { "class": "sw-stat", "style": "font-size: 26px;" },
                  $t($v.h?.max)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  "la meilleure"
                )
              )
            ),
            $h("span", { "style": "position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
              $h("span", { "class": `sw-app-icon ${$t($v.h?.app0?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                ($v.h?.app0?.logo) ? [
                  $h("img", { "class": "sw-logo-img", "src": $v.h?.app0?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.h?.app0?.nologo) ? [
                  $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null
              ),
              $t($v.h?.line)
            ),
            $h("div", { "style": "position: relative;" },
              $h("div", { "style": "display: flex; justify-content: center;" },
                $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": $v.h?.href },
                  "Voir le format",
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
        $h("div", { "style": "padding: 26px 20px 12px;" },
          $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Les autres formats de la semaine"
          )
        ),
        $h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 12px;" },
          ($v.noCards) ? [
            $h("p", { "style": "margin: 8px 0; font-size: 15px; color: var(--ink-muted);" },
              $t($v.noCardsText)
            )
          ] : null,
          ($l($v.cards)).map((f) => [
            $h("a", { "href": f?.href, "class": "sw-card", "style": "display: flex; flex-direction: column; overflow: hidden; border-radius: 22px; text-decoration: none; color: inherit;" },
              $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; height: 128px; overflow: hidden; background: var(--ground);" },
                ($l(f?.cov)).map((v) => [
                  $h("span", { "style": "position: relative; overflow: hidden; display: block;" },
                    $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": "position: absolute; left: 8px; bottom: 7px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                      $t(v?.v)
                    )
                  )
                ])
              ),
              $h("span", { "style": "padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                  $h("span", { "class": "sw-badge", "style": "height: 22px; gap: 5px; padding: 0 8px 0 6px; font-size: 11px;" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t(f?.kind)
                  ),
                  ($l(f?.mk)).map((m) => [
                    $h("span", { "class": "sw-flag", "style": "width: 22px; height: 16px; font-size: 8px;" },
                      $t(m?.c)
                    )
                  ]),
                  $h("span", { "style": "margin-left: auto; font-size: 12px; color: var(--ink-faint);" },
                    $t(f?.niche)
                  )
                ),
                $h("span", { "style": "font-size: 16px; font-weight: 600; line-height: 1.38; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                  $t(f?.quote)
                ),
                $h("span", { "style": "display: flex; align-items: center; gap: 14px; font-size: 13px; color: var(--ink-faint);" },
                  $h("span", null,
                    $h("span", { "style": `font-family: var(--font-display); font-size: 17px; font-weight: 700; color: ${$t(f?.medInk)};` },
                      $t(f?.med)
                    ),
                    " la normale"
                  ),
                  $h("span", null,
                    $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                      $t(f?.ok)
                    ),
                    " réussies"
                  ),
                  $h("span", null,
                    $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                      $t(f?.max)
                    ),
                    " max"
                  )
                ),
                $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 8px;" },
                  $h("span", { "style": "display: flex; flex-wrap: wrap; gap: 4px 10px;" },
                    ($l(f?.apps)).map((a) => [
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                        $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 18px; height: 18px; border-radius: 6px;" },
                          (a?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (a?.nologo) ? [
                            $h("svg", { "width": "9", "height": "9", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-soft);" },
                          $t(a?.name)
                        )
                      )
                    ])
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                    $t(f?.last)
                  )
                )
              )
            )
          ])
        ),
        $h("div", { "style": "padding: 18px 20px 0;" },
          $h("div", { "style": "display: flex; justify-content: center;" },
            ($v.moreOn) ? [
              $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showMore, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit;" },
                $t($v.moreLabel), " ",
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ] : null
          )
        ),
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Créateurs"
          ),
          $h("a", { "href": "/app/dossiers", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Dossiers"
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(MPalette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null,
        ($v.aj) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 70;" },
            $h(MAjout, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
          )
        ] : null
      )
    ];
  }
}
