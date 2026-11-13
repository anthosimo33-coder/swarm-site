// Généré par scripts/dc2preact.py depuis design/app/CreateursA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Createurs extends DCLogic {
  componentDidMount() {
    // Un clic hors du menu ouvert le ferme (sauf sur une pastille : elle bascule d'elle-même).
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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'createurs' ? 'page' : 'false' }));
    return {
      sb, me,
      getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const open = st.open || '';
    const niches = st.niches || [];
    const apps = st.apps || [];
    const fans = st.fans || 'ALL';
    const active = !!st.active;
    const mq = (st.mq || '').toLowerCase();
    const set = (patch) => this.setState(patch);
    // Tranches d'abonnés : [clé, libellé, libellé du filtre posé, de, jusqu'à (exclu)].
    const FB = [['ALL', 'Tous', '', 0, 0], ['s', 'Moins de 1 000', 'Moins de 1 000 abonnés', 0, 1e3], ['m', '1 000 à 10 000', '1 000 à 10 000 abonnés', 1e3, 1e4],
      ['l', '10 000 à 100 000', '10 000 à 100 000 abonnés', 1e4, 1e5], ['xl', '100 000 et plus', '100 000 abonnés et plus', 1e5, Infinity]];
    const fb = FB.filter((x) => x[0] === fans)[0] || FB[0];
    const okN = (c) => niches.length === 0 || niches.indexOf(c.niche) >= 0;
    const okA = (c) => apps.length === 0 || apps.indexOf(c.appName) >= 0;
    const okF = (c, x) => x[0] === 'ALL' || (c.nFans >= x[3] && c.nFans < x[4]);
    const okT = (c) => !active || c.active;
    const all = b.all || [];
    const list = all.filter((c) => okN(c) && okA(c) && okF(c, fb) && okT(c));
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // Safari écrit « 1059 » en fr-FR
    const comptes = (n) => grp(n) + (n > 1 ? ' comptes' : ' compte');
    // Un menu par pastille (comme sur Apps), posé sous la pastille cliquée.
    const many = (xs, w) => (xs.length === 0 ? 'Toutes' : xs.length === 1 ? xs[0] : xs.length + ' ' + w);
    const mkBar = (key, k, v) => ({ k, v, open: open === key ? 'true' : 'false', bg: open === key ? 'var(--tab-on)' : 'var(--track)', edge: open === key ? 'var(--accent-edge)' : 'var(--line)',
      toggle: (e) => set({ open: open === key ? '' : key, mq: '', left: e && e.currentTarget ? e.currentTarget.offsetLeft : 0 }) });
    const filters = [mkBar('niche', 'Niche', many(niches, 'niches')), mkBar('app', 'App', many(apps, 'apps')), mkBar('fans', 'Abonnés', fb[1])];
    const chips = [];
    niches.forEach((n) => chips.push({ label: n, clear: () => set({ niches: niches.filter((x) => x !== n) }) }));
    apps.forEach((n) => chips.push({ label: n, clear: () => set({ apps: apps.filter((x) => x !== n) }) }));
    if (fans !== 'ALL') chips.push({ label: fb[2], clear: () => set({ fans: 'ALL' }) });
    const radio = (on) => ({ radius: '50%', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const check = (on) => ({ radius: '5px', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const keep = (label) => !mq || label.toLowerCase().indexOf(mq) >= 0;
    const item = (label, n, on, pick, box) => Object.assign({ label, n: comptes(n), sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick }, box(on));
    // Niches et apps du marché affiché, les plus fréquentes d'abord ; les nombres tiennent compte des autres filtres.
    const tally = (key) => { const m = {}; all.forEach((c) => { if (c[key]) m[c[key]] = (m[c[key]] || 0) + 1; }); return Object.keys(m).sort((x, y) => m[y] - m[x] || x.localeCompare(y, 'fr')); };
    const flip = (k, xs, v) => () => set({ [k]: xs.indexOf(v) >= 0 ? xs.filter((x) => x !== v) : xs.concat([v]) });
    const foot = 'Les nombres tiennent compte des autres filtres.';
    let menu = { on: false, items: [], left: '0px', title: '', search: '', foot: '', cta: '', q: '' };
    if (open === 'niche') {
      menu = { on: true, title: 'Niche', search: 'Chercher une niche', foot: 'Plusieurs niches possibles. ' + foot,
        items: tally('niche').filter(keep).map((nm) => item(nm, all.filter((c) => c.niche === nm && okA(c) && okF(c, fb) && okT(c)).length, niches.indexOf(nm) >= 0, flip('niches', niches, nm), check)) };
    } else if (open === 'app') {
      menu = { on: true, title: 'App', search: 'Chercher une app', foot: 'Plusieurs apps possibles. ' + foot,
        items: tally('appName').filter(keep).map((nm) => item(nm, all.filter((c) => c.appName === nm && okN(c) && okF(c, fb) && okT(c)).length, apps.indexOf(nm) >= 0, flip('apps', apps, nm), check)) };
    } else if (open === 'fans') {
      menu = { on: true, title: 'Abonnés', search: 'Chercher une tranche', foot,
        items: FB.filter((x) => keep(x[1])).map((x) => item(x[1], all.filter((c) => okN(c) && okA(c) && okF(c, x) && okT(c)).length, fans === x[0], () => set({ fans: x[0] }), radio)) };
    }
    if (menu.on) Object.assign(menu, { left: (st.left || 0) + 'px', cta: 'Voir ' + comptes(list.length), q: st.mq || '' });
    const IN = { FR: 'en France', US: 'chez les anglophones', MX: 'en Amérique latine', ES: 'en Espagne', BR: 'au Brésil et au Portugal', XX: 'dans les autres langues' };
    const mkt = (b.mkt || []).map((m) => Object.assign({}, m, { on: m.c === b.market ? 'true' : 'false', flag: m.c !== 'XX', href: '/app/createurs?m=' + m.c }));
    // 50 lignes d'abord, puis 50 de plus à la demande ; filtres et classement portent sur toute la liste.
    const LIM = 50;
    const lim = st.lim || LIM;
    const rows = list.slice(0, lim).map((c, i) => Object.assign({}, c, { rank: String(i + 1).padStart(2, '0') }));
    // « Les abonnés ne comptent pas » : parmi les comptes affichés, celui qui fait le plus de vues médianes
    // face à ses abonnés (au moins 10 k vues médianes, et 10 fois ses abonnés) ; personne : le bandeau se cache.
    const star = list.filter((c) => c.nFans > 0 && c.nMed >= 1e4 && c.nMed >= 10 * c.nFans).sort((x, y) => y.nMed / y.nFans - x.nMed / x.nFans)[0];
    const tip = star ? { on: true, text: star.h + ' a ' + star.fans + (star.nFans > 1 ? ' abonnés' : ' abonné') + ' et ' + star.med + ' vues médianes par vidéo.' } : { on: false, text: '' };
    const view = { rows, tip, activeOn: active ? 'true' : 'false', toggleActive: () => set({ active: !active, open: '' }) };
    return Object.assign(view, { mkt, filters, chips, menu,
      none: b.none, noneLabel: 'Aucun compte suivi pour ce marché.', empty: !b.none && !b.wait && list.length === 0,
      // Le document garde les 200 comptes aux plus fortes vues médianes : au-delà, on le dit.
      countLabel: b.none || b.wait ? '' : b.total > all.length && all.length > 0
        ? 'Les ' + all.length + ' premiers en vues médianes, sur ' + comptes(b.total) + ' suivis ' + (IN[b.shown] || '')
        : (b.total > 1 ? grp(b.total) + ' comptes suivis ' : b.total + ' compte suivi ') + (IN[b.shown] || ''),
      hasMore: list.length > lim, moreLabel: 'Voir ' + comptes(Math.min(LIM, list.length - lim)) + ' de plus', showMore: () => set({ lim: lim + LIM }),
      tableHref: '/app/createurs?m=' + b.market, cardsHref: '/app/createurs/cartes?m=' + b.market,
      closeMenu: () => set({ open: '' }), onMq: (e) => set({ mq: e.target.value }),
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); set({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; },
      clearAll: () => set({ niches: [], apps: [], fans: 'ALL', active: false, open: '' }) });
  }

  baseVals() {
    const st = this.state || {};
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "page"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const mkt = [{"c": "FR", "l": "France"}, {"c": "US", "l": "Anglophones"}, {"c": "MX", "l": "Amérique latine"}, {"c": "ES", "l": "Espagne"}, {"c": "BR", "l": "Brésil et Portugal"}, {"c": "XX", "l": "Autres langues"}];
    const rows = [{"av": "", "noav": true, "rank": "01", "h": "@bobbybinks21", "bio": "Que du concret. Je teste des business", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "13 588", "fansK": "14 k", "med": "197 k", "medN": "197 157", "rev": "Entre 490 et 690 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 13 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}, {"src": "/media/app/v-7675164782881705249.jpg", "v": "396 k"}, {"src": "/media/app/v-7677716930513390881.jpg", "v": "375 k"}], "cov1": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}]}, {"av": "/media/app/av-meli83.fit.jpg", "noav": false, "rank": "02", "h": "@meli83.fit", "bio": "Réponse jeux Stalkie 🫶🏼🩷", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "667", "fansK": "667", "med": "78 k", "medN": "78 037", "rev": "Entre 200 et 270 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 26 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}, {"src": "/media/app/v-7620350138447482115.jpg", "v": "157 k"}, {"src": "/media/app/v-7621474381801245974.jpg", "v": "109 k"}], "cov1": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}]}, {"av": "", "noav": true, "rank": "03", "h": "@paul.crown4", "bio": "Dégât dégât · The Cringe app", "app": {"name": "The Cringe", "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": ""}, "appName": "The Cringe", "niche": "Jalousie et ex", "fans": "104", "fansK": "104", "med": "33 k", "medN": "33 347", "rev": "Entre 80 et 120 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 5 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}, {"src": "/media/app/v-7641285202513251616.jpg", "v": "72 k"}], "cov1": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}]}, {"av": "/media/app/av-laure_acc2.jpg", "noav": false, "rank": "04", "h": "@laure_acc2", "bio": "E-mail pro dans la bio", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "300", "fansK": "300", "med": "32 k", "medN": "31 520", "rev": "Entre 80 et 110 €", "rythme": "7 vidéos en 7 j", "last": "Dernière il y a 8 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}, {"src": "/media/app/v-7705018413185355040.jpg", "v": "92 k"}, {"src": "/media/app/v-7703942570576989472.jpg", "v": "58 k"}], "cov1": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}]}, {"av": "/media/app/av-enjoy.gossip.jpg", "noav": false, "rank": "05", "h": "@enjoy.gossip", "bio": "Les trompeurs me détestent 👀", "app": {"name": "Katch", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Katch", "niche": "Jalousie et ex", "fans": "449", "fansK": "449", "med": "24 k", "medN": "23 664", "rev": "Entre 60 et 85 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 6 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7633896569149934870.jpg", "v": "606 k"}], "cov1": [{"src": "/media/app/v-7633896569149934870.jpg", "v": "606 k"}]}, {"av": "/media/app/av-noah_031108.jpg", "noav": false, "rank": "06", "h": "@noah_031108", "bio": "Books, work… and others ⭐️", "app": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "appName": "Knowunity", "niche": "Études", "fans": "13 409", "fansK": "13 k", "med": "13 k", "medN": "12 796", "rev": "Entre 30 et 45 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 40 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}, {"src": "/media/app/v-7631504730258214166.jpg", "v": "114 k"}, {"src": "/media/app/v-7647175218573692192.jpg", "v": "21 k"}], "cov1": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}]}, {"av": "/media/app/av-stalkie_fr.jpg", "noav": false, "rank": "07", "h": "@stalkie_fr", "bio": "Deviens ambassadrice Stalkie 👇", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "3 673", "fansK": "4 k", "med": "9 k", "medN": "9 295", "rev": "Entre 25 et 35 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 7 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}, {"src": "/media/app/v-7628297994512747798.jpg", "v": "11 k"}, {"src": "/media/app/v-7627904478116613398.jpg", "v": "10 k"}], "cov1": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}]}, {"av": "/media/app/av-emma.studytips.jpg", "noav": false, "rank": "08", "h": "@emma.studytips", "bio": "Dernière année de master 🙌🏼", "app": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "appName": "Retain Cards", "niche": "Études", "fans": "4 385", "fansK": "4 k", "med": "8 k", "medN": "7 814", "rev": "Entre 20 et 25 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 6 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7641320209013345569.jpg", "v": "24 k"}], "cov1": [{"src": "/media/app/v-7641320209013345569.jpg", "v": "24 k"}]}, {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "rank": "09", "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "16 200", "fansK": "16 k", "med": "8 k", "medN": "7 792", "rev": "Entre 20 et 25 €", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 2 j", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k"}], "cov1": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}]}, {"av": "/media/app/av-toma.ia.jpg", "noav": false, "rank": "10", "h": "@toma.ia", "bio": "J'automatise mes vidéos avec l'IA", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "2 596", "fansK": "3 k", "med": "8 k", "medN": "7 583", "rev": "Entre 20 et 25 €", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 23 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}, {"src": "/media/app/v-7703174889695497505.jpg", "v": "12 k"}, {"src": "/media/app/v-7703522210333429024.jpg", "v": "11 k"}], "cov1": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}]}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "rank": "11", "h": "@remistudy", "bio": "eco-droit 📚", "app": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "appName": "Astra AI", "niche": "Études", "fans": "1 111", "fansK": "1 k", "med": "7 k", "medN": "7 146", "rev": "Entre 20 et 25 €", "rythme": "6 vidéos en 7 j", "last": "Dernière il y a 22 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}, {"src": "/media/app/v-7688445041966157088.jpg", "v": "134 k"}, {"src": "/media/app/v-7692158250019573024.jpg", "v": "130 k"}], "cov1": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}]}];
    const num = (s) => Number(String(s).replace(/\D/g, '')) || 0;
    // L'exemple (France seulement) mis au format des lignes.
    const norm = (c) => Object.assign({}, c, { href: '/app/createurs/' + c.h.slice(1), hasApp: true, appHref: '/app/apps/astraai', nFans: num(c.fans), nMed: num(c.medN),
      cov: c.cov.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v)) });
    let all = rows.map(norm);
    // Sur le site : les vraies données du Radar (document « creators:<marché> », convex/radarModels.ts) ;
    // un autre marché se lit avec get(), et la liste d'avant reste affichée tant qu'il charge.
    // Sur le canevas : l'exemple ci-dessus.
    const P = this.props || {};
    const D = P.data;
    const site = D !== undefined || typeof P.get === 'function';
    // Le marché vient de l'adresse (?m=US) : il suit le passage Tableau ↔ Cartes et reste au retour sur la page.
    // Sur le site, this.props.query ; sur le canevas, location.search.
    const MK = ['FR', 'US', 'MX', 'ES', 'BR', 'XX'];
    let qm = P.query ? P.query.m : null;
    if (!P.query && typeof location !== 'undefined') { try { qm = new URLSearchParams(location.search).get('m'); } catch (e) { qm = null; } }
    qm = String(qm || '').toUpperCase();
    const market = MK.indexOf(qm) >= 0 ? qm : (D && D.market) || 'FR';
    let shown = market, total = all.length, none = market !== 'FR', wait = false;
    if (none) all = [];
    if (site) {
      // L'adresse porte creators:FR ; un autre marché se lit avec get() (undefined tant qu'il charge : ni liste ni « aucun compte »).
      const doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      wait = doc === undefined;
      none = !wait && !(doc && doc.creators && doc.creators.length);
      shown = doc && doc.market ? doc.market : market;
      total = wait || none ? 0 : (doc.total || doc.creators.length);
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
      const isN = (n) => typeof n === 'number' && isFinite(n);
      const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
        return hr < 24 ? 'il y a ' + hr + ' h' : d < 60 ? 'il y a ' + d + ' j' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + (d < 548 ? ' an' : ' ans'); };
      // La bio en une ligne : sa première ligne qui contient du texte (pas seulement des émojis).
      const line = (s) => { const ls = String(s || '').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); return ls.filter((x) => /\p{L}/u.test(x))[0] || ls[0] || ''; };
      all = wait || none ? [] : doc.creators.map((c) => {
        const a = c.app || null;
        const ic = (a && a.icon) || '';
        const on = c.posts7d > 0;
        return {
          h: '@' + c.handle, href: '/app/createurs/' + c.handle, bio: line(c.bio), av: c.avatar || '', noav: true,
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, hasApp: !!a,
          appName: a ? a.name : '', niche: (a && a.niche) || '', appHref: a ? '/app/apps/' + a.slug : '/app/apps',
          fans: isN(c.fans) ? Math.round(c.fans).toLocaleString('fr-FR') : '', fansK: isN(c.fans) ? nf(c.fans) : '', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '', nMed: isN(c.median) ? c.median : 0,
          rythme: isN(c.posts7d) ? (on ? c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j') : '',
          last: c.lastPostAt ? 'Dernière ' + ago(c.lastPostAt) : '', lastAt: c.lastPostAt || 0,
          dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on,
          cov: (c.best || []).map((v) => ({ src: v.cover || '', v: nf(v.views), href: '/app/videos/' + v.id }))
        };
      });
    }
    return { nav, mkt, all, market, shown, total, none, wait };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1480px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Créateurs"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Les comptes qui font des vues pour des apps. Regarde ce qu’ils publient, et copie ce qui marche."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qc", "type": "search", "aria-label": "Chercher un compte", "placeholder": "Chercher un compte…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "padding: 24px 32px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Marché" },
              ($l($v.mkt)).map((m) => [
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": m?.on, "href": m?.href, "style": "height: 36px; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;" },
                  (m?.flag) ? [
                    $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                      $t(m?.c)
                    )
                  ] : null,
                  $t(m?.l)
                )
              ])
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              $t($v.countLabel)
            )
          ),
          $h("div", { "style": "padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
              ($l($v.filters)).map((f) => [
                $h("button", { "class": "sw-pill", "type": "button", "data-menu-trigger": "true", "onClick": f?.toggle, "aria-expanded": f?.open, "aria-haspopup": "listbox", "style": `height: 40px; padding: 0 12px 0 14px; gap: 6px; background: ${$t(f?.bg)}; border-color: ${$t(f?.edge)};` },
                  $h("span", { "style": "color: var(--ink-faint);" },
                    $t(f?.k)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(f?.v)
                  ),
                  $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ]),
              $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.activeOn, "onClick": $v.toggleActive, "style": "height: 40px; gap: 8px;" },
                $h("span", { "aria-hidden": "true", "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
                "Actifs cette semaine"
              ),
              ($l($v.chips)).map((ch) => [
                $h("button", { "class": "sw-badge sw-badge-accent", "type": "button", "onClick": ch?.clear, "aria-label": `Retirer le filtre ${$t(ch?.label)}`, "style": "height: 32px; padding: 0 8px 0 12px; border: 0; cursor: pointer; font-family: inherit; gap: 6px;" },
                  $t(ch?.label),
                  $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ]),
              ($v.menu?.on) ? [
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": $v.menu?.title, "style": `position: absolute; top: 52px; left: ${$t($v.menu?.left)}; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: rgba(13,17,26,0.96); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;` },
                  $h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; margin-bottom: 6px; border-radius: 14px; background: var(--track);" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("input", { "ref": $v.setMenuInput, "type": "search", "value": $v.menu?.q, "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": $v.menu?.search, "placeholder": $v.menu?.search, "style": "flex: 1; min-width: 0; border: 0; background: transparent; outline: none; color: var(--ink); font: inherit; font-size: 14px;" })
                  ),
                  $h("div", { "style": "max-height: 368px; overflow-y: auto;" },
                    ($l($v.menu?.items)).map((it) => [
                      $h("button", { "type": "button", "role": "option", "aria-selected": it?.sel, "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `width: 100%; height: 46px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(it?.bg)}; color: var(--ink); font: inherit; font-size: 14px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)};` },
                        $h("span", { "aria-hidden": "true", "style": `width: 18px; height: 18px; border-radius: ${$t(it?.radius)}; border: 1.5px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                          $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $h("span", { "style": `flex: 1 1 auto; min-width: 0; font-weight: ${$t(it?.w)};` },
                          $t(it?.label)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                          $t(it?.n)
                        )
                      )
                    ])
                  ),
                  $h("div", { "style": "margin-top: 6px; padding: 12px 12px 6px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                    $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-faint); max-width: 190px;" },
                      $t($v.menu?.foot)
                    ),
                    $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.closeMenu },
                      $t($v.menu?.cta),
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ] : null
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                "Trier par ",
                $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                  "vues médianes"
                )
              ),
              $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Affichage" },
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "href": $v.tableHref, "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 5h16v14H4zM4 10h16M4 15h16M10 10v9", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Tableau"
                ),
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": $v.cardsHref, "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Cartes"
                )
              )
            )
          ),
          $h("div", { "style": "margin: 0 32px 48px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "overflow-x: auto; border: 1px solid var(--line); border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom));" },
              $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1050px;" },
                $h("thead", null,
                  $h("tr", null,
                    $h("th", { "style": "width: 44px; padding-left: 20px;" },
                      "#"
                    ),
                    $h("th", { "style": "width: 306px;" },
                      "Créateur"
                    ),
                    $h("th", { "style": "width: 150px;" },
                      "Pousse"
                    ),
                    $h("th", { "class": "sw-num", "style": "width: 90px;" },
                      "Abonnés"
                    ),
                    $h("th", { "class": "sw-num", "style": "width: 110px;" },
                      "Vues médianes"
                    ),
                    $h("th", { "style": "width: 150px;" },
                      "Rythme"
                    ),
                    $h("th", { "style": "width: 140px; padding-right: 20px;" },
                      "Ses meilleures"
                    )
                  )
                ),
                $h("tbody", null,
                  ($l($v.rows)).map((c) => [
                    $h("tr", null,
                      $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.rank)
                      ),
                      $h("td", null,
                        $h("a", { "href": c?.href, "style": "display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; min-width: 0;" },
                          $h("span", { "style": "position: relative; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                            (c?.av) ? [
                              $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                            ] : null,
                            (c?.noav) ? [
                              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                                $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                              )
                            ] : null
                          ),
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 3px; min-width: 0;" },
                            $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                              $t(c?.h)
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(c?.bio)
                            )
                          )
                        )
                      ),
                      $h("td", null,
                        (c?.hasApp) ? [
                          $h("a", { "href": c?.appHref, "style": "display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;" },
                            $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                              (c?.app?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": c?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              (c?.app?.nologo) ? [
                                $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ] : null
                            ),
                            $h("span", { "style": "display: flex; flex-direction: column; gap: 1px;" },
                              $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink);" },
                                $t(c?.appName)
                              ),
                              $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                                $t(c?.niche)
                              )
                            )
                          )
                        ] : null
                      ),
                      $h("td", { "class": "sw-num" },
                        $h("span", { "style": "font-size: 14px; color: var(--ink-soft); font-weight: 500;" },
                          $t(c?.fans)
                        )
                      ),
                      $h("td", { "class": "sw-num" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                          $t(c?.med)
                        )
                      ),
                      $h("td", null,
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
                          $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ink);" },
                            $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                            $t(c?.rythme)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(c?.last)
                          )
                        )
                      ),
                      $h("td", { "style": "padding-right: 20px;" },
                        $h("span", { "style": "display: flex; gap: 5px;" },
                          ($l(c?.cov)).map((v) => [
                            $h("a", { "href": v?.href, "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues`, "style": "display: block; width: 40px; border-radius: 8px; flex-shrink: 0;" },
                              (v?.src) ? [
                                $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              $h("span", { "class": "sw-video-shade" }),
                              $h("span", { "style": "position: absolute; left: 4px; bottom: 3px; font-size: 9px; font-weight: 700;" },
                                $t(v?.v)
                              )
                            )
                          ])
                        )
                      )
                    )
                  ]),
                  ($v.none) ? [
                    $h("tr", null,
                      $h("td", { "colspan": "9", "style": "padding: 48px 20px; text-align: center; color: var(--ink-muted);" },
                        $t($v.noneLabel)
                      )
                    )
                  ] : null,
                  ($v.empty) ? [
                    $h("tr", null,
                      $h("td", { "colspan": "9", "style": "padding: 48px 20px; text-align: center; color: var(--ink-muted);" },
                        "Aucun compte pour ces filtres. ",
                        $h("button", { "class": "sw-link", "type": "button", "onClick": $v.clearAll, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-weight: 600;" },
                          "Effacer les filtres"
                        )
                      )
                    )
                  ] : null
                )
              )
            ),
            ($v.hasMore) ? [
              $h("div", { "style": "display: flex; justify-content: center;" },
                $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showMore, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit; font-size: 14px;" },
                  $t($v.moreLabel),
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ] : null
          )
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
