// Généré par scripts/dc2preact.py depuis design/app/FormatsB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Formats extends DCLogic {
  componentDidMount() {
    // Menu du marché : un clic ailleurs le ferme.
    this.out = (e) => {
      const st = this.state || {};
      if (!st.open || !this.menuEl || this.menuEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-menu-trigger]')) return;
      this.setState({ open: '' });
    };
    document.addEventListener('mousedown', this.out);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this.out); }
  componentDidUpdate(pp, ps) {
    const st = this.state || {};
    ps = ps || {};
    // Menu ouvert : le focus y reste (Safari ne le donne pas au bouton cliqué), pour qu'Échap le ferme.
    if (st.open && this.menuInput && (st.open !== ps.open || !(this.menuEl && this.menuEl.contains(document.activeElement)))) this.menuInput.focus();
  }

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'formats' ? 'page' : 'false' }));
    return {
      sb, me,
      getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const niche = st.niche || 'Toutes';
    const type = st.type || 'Tout';
    const market = st.market || 'ALL';
    const open = st.open || '';
    const mq = (st.mq || '').toLowerCase();
    const all = b.all || [];
    const okN = (c, nm) => nm === 'Toutes' || c.niche === nm;
    const okT = (c) => type === 'Tout' || (type === 'Accroches' ? c.kind === 'Accroche' : c.kind === 'Son');
    const okM = (c, m) => m === 'ALL' || c.codes.indexOf(m) >= 0;
    const count = (n) => n + (n > 1 ? ' formats' : ' format');
    // À la une : le premier de la liste filtrée ; les cartes : les suivants.
    const list = all.filter((c) => okN(c, niche) && okT(c) && okM(c, market));
    const hero = list[0] || { cov4: [] };
    // Les cartes : 30 d'abord, puis 30 de plus à chaque clic. Les filtres portent sur toute la liste.
    const PAGE = 30;
    const shown = st.shown || PAGE;
    const rest = list.slice(1);
    const cards = rest.slice(0, shown);
    const more = Math.min(PAGE, rest.length - cards.length);
    const P = b.fan || [];
    const fan = (hero.cov4 || []).slice(0, 4).map((v, i) => Object.assign({}, v, { l: P[i].l, t: P[i].t, r: P[i].r, z: P[i].z }));
    // Niches : les nombres tiennent compte du type et du marché (sur le canevas : ceux de l'exemple).
    const niches = b.live
      ? ['Toutes'].concat(b.nicheNames).map((l) => ({ l, n: all.filter((c) => okN(c, l) && okT(c) && okM(c, market)).length })).filter((c) => c.l === 'Toutes' || c.n > 0 || c.l === niche)
      : (b.niches || []);
    const MKS = b.MKS;
    const mSel = MKS.filter((m) => m[0] === market)[0] || MKS[0];
    const mkBar = { v: market === 'ALL' ? 'Tous' : mSel[1], open: open === 'marche' ? 'true' : 'false', bg: open === 'marche' ? 'var(--tab-on)' : 'var(--track)', edge: open === 'marche' ? 'var(--accent-edge)' : 'var(--line)',
      toggle: () => this.setState({ open: open === 'marche' ? '' : 'marche', mq: '' }) };
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const keep = (label) => !mq || label.toLowerCase().indexOf(mq) >= 0;
    let menu = { on: false, items: [], total: count(list.length) };
    if (open === 'marche') {
      menu = { on: true, total: count(list.length),
        items: MKS.filter((m) => keep(m[1])).map((m) => { const n = all.filter((c) => okN(c, niche) && okT(c) && okM(c, m[0])).length; const on = market === m[0];
          return Object.assign({ label: m[1], flag: m[2] || false, n: count(n), sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => this.setState({ market: m[0], shown: PAGE }) }, radio(on)); }) };
    }
    return {
      hero, fan, cards, hasHero: list.length > 0, noCards: cards.length === 0,
      moreOn: more > 0, moreLabel: 'Voir ' + more + (more > 1 ? ' formats de plus' : ' format de plus'), gridPad: more > 0 ? '0 32px 24px' : '0 32px 48px',
      showMore: () => this.setState({ shown: shown + PAGE }),
      noCardsText: list.length === 0 ? 'Aucun format pour ces filtres.' : (b.live ? 'Aucun autre format pour ces filtres.' : 'Aucun autre format pour ce filtre cette semaine.'),
      heroEyebrow: b.live ? 'Le plus repris en ce moment' : 'Le plus fort cette semaine',
      listTitle: b.live ? 'Les autres formats du moment' : 'Les autres formats de la semaine',
      listSort: b.live ? 'Triés par nombre de comptes' : 'Triés par × la normale',
      niches: niches.map((c) => Object.assign({}, c, { on: c.l === niche ? 'true' : 'false', pick: () => this.setState({ niche: c.l, shown: PAGE }) })),
      types: ['Tout', 'Accroches', 'Sons'].map((l) => ({ l, on: l === type ? 'true' : 'false', pick: () => this.setState({ type: l, shown: PAGE }) })),
      mkBar, menu,
      closeMenu: () => this.setState({ open: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; }
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "page"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const niches = [{"l": "Toutes", "n": 10, "on": "true"}, {"l": "Études", "n": 5, "on": "false"}, {"l": "Couple", "n": 3, "on": "false"}, {"l": "Jalousie et ex", "n": 2, "on": "false"}];
    const hero = {"rank": "01", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ich lösche das in 2h‼️ »", "raw": "Ich lösche das in 2h‼️", "gloss": "Vidéo supprimée dans 24 heures", "niche": "Études", "mk": [{"c": "DE"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "39×", "medInk": "var(--accent)", "hot": true, "max": "106 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 10/11", "cov": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards"}], "views": 201780};
    const fan = [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "l": 20, "t": 26, "r": -7, "z": 1}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "l": 132, "t": 6, "r": -2.5, "z": 2}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "l": 244, "t": 0, "r": 2.5, "z": 3}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "l": 356, "t": 30, "r": 7, "z": 4}];
    const cards = [{"rank": "02", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "raw": "‼️🚨GUARDA E PARTILHA🚨‼️", "gloss": "Appel à sauvegarder et partager la vidéo", "niche": "Études", "mk": [{"c": "BR"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "17×", "medInk": "var(--accent)", "hot": true, "max": "38 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}, {"src": "/media/app/v-7706231148648647969.jpg", "v": "1 k", "h": "@studywithninaa_", "raw": 1233, "date": "09/11", "app": "Astra AI"}], "views": 101659}, {"rank": "03", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "exam vibes", "raw": "exam vibes", "gloss": "5 comptes l'ont posé sur leurs vidéos", "niche": "Études", "mk": [{"c": "US"}, {"c": "DE"}], "n": 5, "ok": "4/6", "okText": "4 sur 6", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "7×", "medInk": "var(--ink)", "hot": false, "max": "23 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7704417260647025953.jpg", "v": "23 k", "h": "@studyhackswithsara", "raw": 23006, "date": "04/11", "app": "Astra AI"}, {"src": "/media/app/v-7706993521584098593.jpg", "v": "20 k", "h": "@learnwithpaola", "raw": 20368, "date": "11/11", "app": "Astra AI"}, {"src": "/media/app/v-7705514449699966241.jpg", "v": "7 k", "h": "@_studywithlisa", "raw": 7041, "date": "07/11", "app": "Astra AI"}, {"src": "/media/app/v-7706244970096643361.jpg", "v": "7 k", "h": "@lernenmitdiana", "raw": 6897, "date": "09/11", "app": "Astra AI"}], "views": 57312}, {"rank": "04", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "original sound - dicsovn", "raw": "original sound - dicsovn", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "ID"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "5,7×", "medInk": "var(--ink)", "hot": false, "max": "1,67 M", "apps": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}], "appLine": "Love8", "app0": {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "cov4": [{"src": "/media/app/v-7703975267911421191.jpg", "v": "1,7 M", "h": "@tpp_love8", "raw": 1669121, "date": "03/11", "app": "Love8"}, {"src": "/media/app/v-7706084833260277013.jpg", "v": "16 k", "h": "@cun_love8", "raw": 16058, "date": "09/11", "app": "Love8"}, {"src": "/media/app/v-7705053664817286406.jpg", "v": "152", "h": "@emmeolove8__", "raw": 152, "date": "06/11", "app": "Love8"}], "views": 1685331}, {"rank": "05", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️ »", "raw": "HOW i schedule my day to get a 4.0 GPA with 5 extracurriculars⚽️✏️", "gloss": "Emploi du temps productif détaillé", "niche": "Études", "mk": [{"c": "US"}], "n": 4, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "4,9×", "medInk": "var(--ink)", "hot": false, "max": "24 k", "apps": [{"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}], "appLine": "Knowunity", "app0": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "last": "vu le 04/11", "cov": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}], "cov4": [{"src": "/media/app/v-7702578352309210382.jpg", "v": "24 k", "h": "@addystudys", "raw": 23921, "date": "30/10", "app": "Knowunity"}, {"src": "/media/app/v-7704358170268978464.jpg", "v": "5 k", "h": "@studywithevee", "raw": 5108, "date": "04/11", "app": "Knowunity"}, {"src": "/media/app/v-7702892194859945230.jpg", "v": "5 k", "h": "@studywmila0", "raw": 5076, "date": "31/10", "app": "Knowunity"}, {"src": "/media/app/v-7704058365806136598.jpg", "v": "820", "h": "@studywmilliegee", "raw": 820, "date": "03/11", "app": "Knowunity"}], "views": 34925}, {"rank": "06", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« “POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar  »", "raw": "“POV: terminaste de estudiar 4 horas antes porque seguiste el consejo de esa chica con una media de 10 que te recomendó estudiar con el método RETAIN CARDS y memorizaste 10 páginas en 30 min en lugar ", "gloss": "Conseil de révision ciblée pour réussir", "niche": "Études", "mk": [{"c": "MX"}], "n": 4, "ok": "7/11", "okText": "7 sur 11", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}, {"bg": "var(--line-strong)"}], "med": "4,7×", "medInk": "var(--ink)", "hot": false, "max": "9 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7702846481736174868.jpg", "v": "8 k", "h": "@marietipsstudy", "raw": 7755, "date": "31/10", "app": "Retain Cards"}, {"src": "/media/app/v-7704563725029674262.jpg", "v": "8 k", "h": "@estudia.conclara", "raw": 7718, "date": "05/11", "app": "Retain Cards"}, {"src": "/media/app/v-7706045051574488342.jpg", "v": "6 k", "h": "@estudia.conclara", "raw": 5853, "date": "09/11", "app": "Retain Cards"}], "views": 21326}, {"rank": "07", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "purple", "raw": "purple", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "US"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,5×", "medInk": "var(--ink)", "hot": false, "max": "4 k", "apps": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, {"name": "Airbuds", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "Love8 et Airbuds", "app0": {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7706958665764408597.jpg", "v": "4 k", "h": "@seviiqq_", "raw": 4169, "date": "11/11", "app": "Love8"}, {"src": "/media/app/v-7703620473116036382.jpg", "v": "3 k", "h": "@tehhemia", "raw": 2920, "date": "02/11", "app": "Airbuds"}, {"src": "/media/app/v-7701384137596226838.jpg", "v": "3 k", "h": "@kayleighvlogging", "raw": 2523, "date": "27/10", "app": "Airbuds"}], "cov4": [{"src": "/media/app/v-7706958665764408597.jpg", "v": "4 k", "h": "@seviiqq_", "raw": 4169, "date": "11/11", "app": "Love8"}, {"src": "/media/app/v-7703620473116036382.jpg", "v": "3 k", "h": "@tehhemia", "raw": 2920, "date": "02/11", "app": "Airbuds"}, {"src": "/media/app/v-7701384137596226838.jpg", "v": "3 k", "h": "@kayleighvlogging", "raw": 2523, "date": "27/10", "app": "Airbuds"}], "views": 9612}, {"rank": "08", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada »", "raw": "Ojalá entendieras que no siempre te reclamo porque quiero discutir contigo. A veces sólo estoy intentando explicarte que algo me dolió, aunque para ti no ha sido nada", "gloss": "Ce n'est pas pour discuter, c'est pour être entendue", "niche": "Jalousie et ex", "mk": [{"c": "MX"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,3×", "medInk": "var(--ink)", "hot": false, "max": "71 k", "apps": [{"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "RecentFollow", "app0": {"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "last": "vu le 11/11", "cov": [{"src": "/media/app/v-7705537368907959573.jpg", "v": "71 k", "h": "@marti14320", "raw": 71204, "date": "07/11", "app": "RecentFollow"}, {"src": "/media/app/v-7706784554777939208.jpg", "v": "4 k", "h": "@fio.chisme", "raw": 3510, "date": "11/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704179787698359604.jpg", "v": "717", "h": "@soysarahi303", "raw": 717, "date": "04/11", "app": "RecentFollow"}], "cov4": [{"src": "/media/app/v-7705537368907959573.jpg", "v": "71 k", "h": "@marti14320", "raw": 71204, "date": "07/11", "app": "RecentFollow"}, {"src": "/media/app/v-7706784554777939208.jpg", "v": "4 k", "h": "@fio.chisme", "raw": 3510, "date": "11/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704179787698359604.jpg", "v": "717", "h": "@soysarahi303", "raw": 717, "date": "04/11", "app": "RecentFollow"}], "views": 75431}, {"rank": "09", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "original sound - ex7stence", "raw": "original sound - ex7stence", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Jalousie et ex", "mk": [{"c": "US"}, {"c": "MX"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,2×", "medInk": "var(--ink)", "hot": false, "max": "28 k", "apps": [{"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "RecentFollow", "app0": {"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "last": "vu le 12/11", "cov": [{"src": "/media/app/v-7704011591062261023.jpg", "v": "28 k", "h": "@alexandria.girlhacks", "raw": 28106, "date": "03/11", "app": "RecentFollow"}, {"src": "/media/app/v-7707075093578419476.jpg", "v": "7 k", "h": "@juli.chisme", "raw": 7140, "date": "12/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704407707469630741.jpg", "v": "6 k", "h": "@marti14320", "raw": 5606, "date": "04/11", "app": "RecentFollow"}], "cov4": [{"src": "/media/app/v-7704011591062261023.jpg", "v": "28 k", "h": "@alexandria.girlhacks", "raw": 28106, "date": "03/11", "app": "RecentFollow"}, {"src": "/media/app/v-7707075093578419476.jpg", "v": "7 k", "h": "@juli.chisme", "raw": 7140, "date": "12/11", "app": "RecentFollow"}, {"src": "/media/app/v-7704407707469630741.jpg", "v": "6 k", "h": "@marti14320", "raw": 5606, "date": "04/11", "app": "RecentFollow"}], "views": 40852}, {"rank": "10", "kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "isHook": false, "isSon": true, "quote": "Hey There Delilah", "raw": "Hey There Delilah", "gloss": "3 comptes l'ont posé sur leurs vidéos", "niche": "Couple", "mk": [{"c": "US"}], "n": 3, "ok": "2/3", "okText": "2 sur 3", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "3,2×", "medInk": "var(--ink)", "hot": false, "max": "5 k", "apps": [{"name": "Loverzz", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": ""}, {"name": "Palima", "logo": "", "nologo": true, "blank": "sw-app-blank"}], "appLine": "Loverzz et Palima", "app0": {"name": "Loverzz", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705565722017090848.jpg", "v": "5 k", "h": "@julie.vorin", "raw": 5368, "date": "07/11", "app": "Loverzz"}, {"src": "/media/app/v-7706135581293628705.jpg", "v": "3 k", "h": "@erin8521", "raw": 2733, "date": "09/11", "app": "Palima"}, {"src": "/media/app/v-7705866119814417684.jpg", "v": "456", "h": "@lovenotesdaisy", "raw": 456, "date": "08/11", "app": "Loverzz"}], "cov4": [{"src": "/media/app/v-7705565722017090848.jpg", "v": "5 k", "h": "@julie.vorin", "raw": 5368, "date": "07/11", "app": "Loverzz"}, {"src": "/media/app/v-7706135581293628705.jpg", "v": "3 k", "h": "@erin8521", "raw": 2733, "date": "09/11", "app": "Palima"}, {"src": "/media/app/v-7705866119814417684.jpg", "v": "456", "h": "@lovenotesdaisy", "raw": 456, "date": "08/11", "app": "Loverzz"}], "views": 8557}];
    // Sur le canevas : l'exemple ci-dessus (la une puis les cartes), filtrable comme sur le site.
    let all = [hero].concat(cards).map((c) => Object.assign({}, c, {
      codes: c.mk.map((m) => m.c), href: '/app/formats', fr: c.rank === '01',
      apps: c.apps.map((a) => Object.assign({ tile: true }, a)),
      cov: c.cov.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v)), cov4: c.cov4.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v))
    }));
    let nicheNames = niches.slice(1).map((c) => c.l);
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['MX', 'Amérique latine', 'MX'], ['BR', 'Brésil', 'BR'], ['DE', 'Allemagne', 'DE'], ['ID', 'Indonésie', 'ID']];
    let live = false;

    // Sur le site : les vraies données du Radar (document « formats », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.formats) {
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(x).replace('.', ',')) + '×';
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
      const appOf = (a) => ({ name: a.name, tile: true, logo: a.icon || false, nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank' });
      const others = (n) => 'et ' + n + (n > 1 ? ' autres' : ' autre');
      const names = (as) => (as.length > 3 ? as.slice(0, 2).map((a) => a.name).join(', ') + ' ' + others(as.length - 2)
        : as.length > 1 ? as.slice(0, -1).map((a) => a.name).join(', ') + ' et ' + as[as.length - 1].name : as.map((a) => a.name).join(''));
      const cover = (m) => ({ src: m.cover || '', v: nf(m.views), h: '@' + m.handle, href: '/app/videos/' + m.videoId });
      all = D.formats.map((f) => {
        const hook = f.kind === 'hook';
        const more = f.apps.length - 2;
        // Les cartes montrent 3 reprises sur 4 : on écarte de préférence une sans miniature, l'ordre reste celui des vues.
        const drop = f.members.length > 3 ? f.members.map((m) => !!m.cover).lastIndexOf(false) : -1;
        const three = f.members.filter((m, i) => i !== (drop >= 0 ? drop : 3)).slice(0, 3);
        return {
          kind: hook ? 'Accroche' : 'Son', ico: ICO[f.kind] || ICO.hook, quote: hook ? '« ' + f.label + ' »' : f.label,
          niche: f.niche, codes: [f.market], mk: f.market === 'XX' ? [] : [{ c: f.market }],
          n: f.accounts, ok: f.wins + '/' + f.n, okText: f.wins + ' sur ' + f.n,
          med: f.medX ? xf(f.medX) : '—', medInk: f.medX >= 10 ? 'var(--accent)' : 'var(--ink)', max: nf(f.maxViews),
          apps: f.apps.slice(0, 2).map(appOf).concat(more > 0 ? [{ name: others(more), tile: false, logo: false, nologo: false, blank: '' }] : []),
          app0: f.apps[0] ? appOf(f.apps[0]) : { name: '', logo: false, nologo: true, blank: 'sw-app-blank' }, appLine: names(f.apps),
          last: 'repris le ' + day(f.lastPostAt), cov: three.map(cover), cov4: f.members.slice(0, 4).map(cover),
          href: '/app/formats/' + f.id, fr: false
        };
      });
      const cnt = {};
      D.formats.forEach((f) => { cnt[f.niche] = (cnt[f.niche] || 0) + 1; });
      nicheNames = Object.keys(cnt).sort((p, q) => (p === 'Autres') - (q === 'Autres') || cnt[q] - cnt[p]);
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l, c === 'XX' ? '' : c]));
      live = true;
    }
    return { nav, niches, hero, fan, cards, all, nicheNames, MKS, live };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 2320px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "/app", "aria-label": "Swarm, accueil" },
            $h("span", { "class": "sw-app-tile" },
              $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
              )
            )
          ),
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
            $h("span", { "class": "sw-side-ico" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            "Chercher"
          ),
          ($l($v.sb)).map((n) => [
            $h("a", { "class": "sw-side-item", "href": n?.href, "aria-current": n?.cur },
              $h("span", { "class": "sw-side-ico" },
                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": n?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $t(n?.label)
            )
          ]),
          $h("div", { "class": "sw-side-foot" },
            $h("a", { "class": "sw-avatar", "href": "/app/compte", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 32px 32px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                "Formats"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que plusieurs comptes reprennent en même temps. Un format qui marche chez trois inconnus marchera chez toi."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qfb", "type": "search", "aria-label": "Chercher une accroche ou un son", "placeholder": "Chercher une accroche ou un son…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "padding: 24px 32px 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
              ($l($v.niches)).map((c) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": c?.on, "onClick": c?.pick, "style": "height: 40px;" },
                  $t(c?.l),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(c?.n)
                  )
                )
              ])
            ),
            $h("div", { "style": "position: relative; display: flex; gap: 8px; align-items: center;" },
              $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Type" },
                ($l($v.types)).map((t) => [
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": "height: 32px;" },
                    $t(t?.l)
                  )
                ])
              ),
              $h("button", { "class": "sw-pill", "type": "button", "data-menu-trigger": "true", "onClick": $v.mkBar?.toggle, "aria-expanded": $v.mkBar?.open, "aria-haspopup": "listbox", "style": `height: 40px; padding: 0 12px 0 14px; gap: 6px; background: ${$t($v.mkBar?.bg)}; border-color: ${$t($v.mkBar?.edge)};` },
                $h("span", { "style": "color: var(--ink-faint);" },
                  "Marché"
                ),
                $h("span", { "style": "font-weight: 600;" },
                  $t($v.mkBar?.v)
                ),
                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              ($v.menu?.on) ? [
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": "Marché", "style": "position: absolute; top: 52px; right: 0; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: rgba(13,17,26,0.96); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; margin-bottom: 6px; border-radius: 14px; background: var(--track);" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("input", { "ref": $v.setMenuInput, "type": "search", "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": "Chercher un marché", "placeholder": "Chercher un marché", "style": "flex: 1; min-width: 0; border: 0; background: transparent; outline: none; color: var(--ink); font: inherit; font-size: 14px;" })
                  ),
                  ($l($v.menu?.items)).map((it) => [
                    $h("button", { "type": "button", "role": "option", "aria-selected": it?.sel, "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `width: 100%; height: 46px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(it?.bg)}; color: var(--ink); font: inherit; font-size: 14px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)};` },
                      $h("span", { "aria-hidden": "true", "style": `width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      (it?.flag) ? [
                        $h("span", { "class": "sw-flag" },
                          $t(it?.flag)
                        )
                      ] : null,
                      $h("span", { "style": `flex: 1 1 auto; min-width: 0; font-weight: ${$t(it?.w)};` },
                        $t(it?.label)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                        $t(it?.n)
                      )
                    )
                  ]),
                  $h("div", { "style": "margin-top: 6px; padding: 12px 12px 6px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                    $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-faint); max-width: 190px;" },
                      "Le marché d’un compte, c’est la langue de ses vidéos."
                    ),
                    $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.closeMenu },
                      "Voir ", $t($v.menu?.total),
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ] : null
            )
          ),
          ($v.hasHero) ? [
            $h("section", { "class": "sw-card is-featured", "style": "margin: 16px 32px 0; padding: 44px 44px 44px 48px; border-radius: 28px; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) 520px; gap: 40px; align-items: center;" },
              $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -140px; top: -200px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
              $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 22px;" },
                $h("span", { "class": "sw-eyebrow" },
                  $h("b", null,
                    "["
                  ),
                  " ", $t($v.heroEyebrow), " ",
                  $h("b", null,
                    "]"
                  )
                ),
                $h("h2", { "style": "margin: 0; font-family: var(--font-display); font-size: 54px; line-height: 1.02; font-weight: 700; letter-spacing: -0.045em;" },
                  $t($v.hero?.quote)
                ),
                ($v.hero?.fr) ? [
                  $h("p", { "style": "margin: 0; max-width: 520px; font-size: 16px; line-height: 1.6; color: var(--ink-muted);" },
                    "En français : « Je supprime ça dans 2 h ». Le principe : la vidéo va disparaître, il faut la regarder maintenant."
                  )
                ] : null,
                $h("div", { "style": "display: flex; gap: 32px; flex-wrap: wrap; padding: 4px 0;" },
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat", "style": "color: var(--accent);" },
                      $t($v.hero?.med)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "la normale des comptes"
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat" },
                      $t($v.hero?.okText)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "reprises réussies"
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat" },
                      $t($v.hero?.max)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "vues, la meilleure"
                    )
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 18px; flex-wrap: wrap;" },
                  $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": $v.hero?.href },
                    "Voir le format",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                    $h("span", { "class": `sw-app-icon ${$t($v.hero?.app0?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                      ($v.hero?.app0?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $v.hero?.app0?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      ($v.hero?.app0?.nologo) ? [
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $t($v.hero?.appLine), " · ", $t($v.hero?.n), " comptes · ", $t($v.hero?.niche)
                  )
                )
              ),
              $h("div", { "style": "position: relative; height: 400px;", "aria-label": "Les quatre reprises" },
                ($l($v.fan)).map((c) => [
                  $h("a", { "class": "sw-video", "href": c?.href, "style": `position: absolute; left: ${$t(c?.l)}px; top: ${$t(c?.t)}px; width: 176px; z-index: ${$t(c?.z)}; transform: rotate(${$t(c?.r)}deg); border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08); text-decoration: none;` },
                    $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 0;" },
                        $h("span", { "class": "sw-video-views" },
                          $t(c?.v)
                        ),
                        $h("span", { "class": "sw-video-handle" },
                          $t(c?.h)
                        )
                      )
                    )
                  )
                ])
              )
            )
          ] : null,
          $h("div", { "style": "padding: 36px 32px 12px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "class": "sw-card-title", "style": "font-size: 20px;" },
              $t($v.listTitle)
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              $t($v.listSort)
            )
          ),
          $h("div", { "style": `padding: ${$t($v.gridPad)}; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;` },
            ($v.noCards) ? [
              $h("p", { "style": "grid-column: 1 / -1; margin: 24px 0; font-size: 15px; color: var(--ink-muted);" },
                $t($v.noCardsText)
              )
            ] : null,
            ($l($v.cards)).map((f) => [
              $h("div", { "class": "sw-card", "style": "display: flex; flex-direction: column; overflow: hidden; text-decoration: none; color: inherit; border-radius: 24px;" },
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; height: 230px; overflow: hidden; background: var(--ground);" },
                  ($l(f?.cov)).map((v) => [
                    $h("a", { "href": v?.href, "style": "position: relative; overflow: hidden; display: block; text-decoration: none;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 10px; bottom: 10px; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                ),
                $h("a", { "href": f?.href, "style": "padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 14px; flex: 1; text-decoration: none; color: inherit;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 8px;" },
                    $h("span", { "class": "sw-badge", "style": "height: 24px; gap: 6px; padding: 0 9px 0 7px;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(f?.kind)
                    ),
                    ($l(f?.mk)).map((m) => [
                      $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                        $t(m?.c)
                      )
                    ]),
                    $h("span", { "style": "margin-left: auto; font-size: 12px; color: var(--ink-faint);" },
                      $t(f?.niche)
                    )
                  ),
                  $h("span", { "style": "font-size: 18px; font-weight: 600; line-height: 1.38; letter-spacing: -0.01em; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 50px;" },
                    $t(f?.quote)
                  ),
                  $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "× la normale"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": `font-size: 19px; color: ${$t(f?.medInk)};` },
                        $t(f?.med)
                      )
                    ),
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "Réussite"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": "font-size: 19px;" },
                        $t(f?.ok)
                      )
                    ),
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "Meilleure"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": "font-size: 19px;" },
                        $t(f?.max)
                      )
                    )
                  ),
                  $h("span", { "style": "margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 4px;" },
                    $h("span", { "style": "display: flex; flex-wrap: wrap; gap: 4px 10px;" },
                      ($l(f?.apps)).map((a) => [
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                          (a?.tile) ? [
                            $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 18px; height: 18px; border-radius: 6px;" },
                              (a?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              (a?.nologo) ? [
                                $h("svg", { "width": "9", "height": "9", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ] : null
                            )
                          ] : null,
                          $h("span", { "style": "font-size: 12px; color: var(--ink-soft);" },
                            $t(a?.name)
                          )
                        )
                      ])
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                      $t(f?.n), " comptes · ", $t(f?.last)
                    )
                  )
                )
              )
            ])
          ),
          ($v.moreOn) ? [
            $h("div", { "style": "padding: 0 32px 48px; display: flex; justify-content: center;" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.showMore, "style": "height: 44px; padding: 0 20px; font-weight: 600;" },
                $t($v.moreLabel),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
