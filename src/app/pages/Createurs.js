// Généré par scripts/dc2preact.py depuis design/app/CreateursA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Createurs extends DCLogic {
  componentDidMount() {
    // Un clic hors du menu ouvert le ferme (sauf sur une pastille : elle bascule d'elle-même).
    this.out = (e) => {
      const st = this.state || {};
      const el = st.open === 'sort' ? this.sortEl : this.menuEl;
      if (!st.open || !el || el.contains(e.target)) return;
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
    if (st.pv && st.pv !== ps.pv && this.pvClose) this.pvClose.focus();
  }

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: (Array.from(String(u.initiale || u.prenom || u.email || '?'))[0] || '?').toUpperCase() }
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
    const kinds = st.kinds || [];
    const gender = st.gender || 'ALL';
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
    // Type de contenu (lu par l'IA sur ses miniatures, carrousel dit par TikTok) et genre de la personne qui se filme.
    const KL = [['ambassadeur', 'Ambassadeur'], ['carrousel', 'Carrousel'], ['extrait_repris', 'Extrait repris'], ['histoire_messages', 'Histoire en messages'],
      ['demo_ecran', 'Démo d’écran'], ['motion', 'Motion'], ['ambiance_texte', 'Ambiance + texte']];
    const GL = [['ALL', 'Tous', ''], ['femme', 'Femmes', 'Femmes'], ['homme', 'Hommes', 'Hommes'], ['sans_visage', 'Sans visage', 'Sans visage']];
    const kl = (k) => (KL.filter((x) => x[0] === k)[0] || [k, k])[1];
    const gl = GL.filter((x) => x[0] === gender)[0] || GL[0];
    const okK = (c) => kinds.length === 0 || kinds.indexOf(c.kind) >= 0;
    const okG = (c, g) => g === 'ALL' || c.gender === g;
    const all = b.all || [];
    const list = all.filter((c) => okN(c) && okA(c) && okF(c, fb) && okT(c) && okK(c) && okG(c, gender));
    // Le tri choisi dans la barre de résultats (15/11) ; vues médianes par défaut.
    const SORTKEY = { med: (c) => c.nMed, fans: (c) => c.nFans, pace: (c) => c.n7 || 0, recent: (c) => c.lastAt || 0 };
    if (st.sort && st.sort !== 'med' && SORTKEY[st.sort]) list.sort((x, y) => SORTKEY[st.sort](y) - SORTKEY[st.sort](x));
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // Safari écrit « 1059 » en fr-FR
    const comptes = (n) => grp(n) + (n > 1 ? ' comptes' : ' compte');
    // Un menu par pastille (comme sur Apps), posé sous la pastille cliquée.
    const many = (xs, w) => (xs.length === 0 ? 'Toutes' : xs.length === 1 ? xs[0] : xs.length + ' ' + w);
    const BIC = { kind: 'M4 5h16v14H4zM10 9l5 3-5 3z', gender: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01', app: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', fans: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3' };
    const mkBar = (key, k, v) => ({ k, v, d: BIC[key], open: open === key ? 'true' : 'false', bg: open === key ? 'var(--tab-on)' : 'var(--track)', edge: open === key ? 'var(--accent-edge)' : 'var(--line)',
      toggle: (e) => set({ open: open === key ? '' : key, mq: '', left: e && e.currentTarget ? e.currentTarget.offsetLeft : 0 }) });
    const filters = [mkBar('niche', 'Niche', many(niches, 'niches')), mkBar('app', 'App', many(apps, 'apps')), mkBar('fans', 'Abonnés', fb[1]),
      mkBar('kind', 'Contenu', kinds.length === 0 ? 'Tous' : kinds.length === 1 ? kl(kinds[0]) : kinds.length + ' types'), mkBar('gender', 'Genre', gl[1])];
    // Le marché : un bouton, et la liste complète des pays (les plus suivis d'abord, avec leur nombre de comptes).
    const mkAll = b.mkt || [];
    const mkMax = Math.max(1, ...mkAll.map((m) => m.n || 0));
    const mkq = String(st.mq || '').trim().toLowerCase();
    const mkFit = (m) => !mkq || String(m.l).toLowerCase().indexOf(mkq) >= 0;
    const mkRow = (m) => { const on = m.c === b.market; return { c: m.c, l: m.l, n: grp(m.n || 0), href: '/app/createurs?m=' + m.c, sel: on ? 'true' : 'false',
      bg: on ? 'var(--accent-soft)' : 'transparent', fw: on ? 600 : 500, w: Math.max(3, Math.round(90 * (m.n || 0) / mkMax)) + 'px', bar: on ? 'var(--accent)' : 'rgba(255,255,255,0.28)', tick: on ? '1' : '0' }; };
    const mkSorted = mkAll.slice().sort((p, q) => (q.n || 0) - (p.n || 0));
    const mkTop = mkSorted.slice(0, 6).filter(mkFit).map(mkRow), mkRest = mkSorted.slice(6).filter(mkFit).map(mkRow);
    const allOn = b.market === 'ALL';
    const mkShowAll = !mkq || 'tous les marchés'.indexOf(mkq) >= 0;
    const mkb = { c: allOn ? '' : b.market, flag: !allOn, all: allOn, l: allOn ? 'Tous les marchés' : ((mkAll.filter((m) => m.c === b.market)[0] || {}).l || b.market),
      open: open === 'market' ? 'true' : 'false', toggle: () => set({ open: open === 'market' ? '' : 'market', mq: '' }) };
    const mkm = { on: open === 'market', q: st.mq || '', top: mkTop, rest: mkRest, hasTop: mkTop.length > 0, hasRest: mkRest.length > 0, nRest: Math.max(0, mkSorted.length - 6), showAll: mkShowAll,
      all: { href: '/app/createurs?m=ALL', sel: allOn ? 'true' : 'false', bg: allOn ? 'var(--accent-soft)' : 'transparent', fw: allOn ? 600 : 500, n: grp(mkAll.reduce((s, m) => s + (m.n || 0), 0)), tick: allOn ? '1' : '0' },
      none: !mkTop.length && !mkRest.length && !mkShowAll };
    const chips = [];
    niches.forEach((n) => chips.push({ label: n, clear: () => set({ niches: niches.filter((x) => x !== n) }) }));
    apps.forEach((n) => chips.push({ label: n, clear: () => set({ apps: apps.filter((x) => x !== n) }) }));
    if (fans !== 'ALL') chips.push({ label: fb[2], clear: () => set({ fans: 'ALL' }) });
    kinds.forEach((k) => chips.push({ label: kl(k), clear: () => set({ kinds: kinds.filter((x) => x !== k) }) }));
    if (gender !== 'ALL') chips.push({ label: gl[2], clear: () => set({ gender: 'ALL' }) });
    const radio = (on) => ({ radius: '50%', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const SORTS = [['med', 'Vues médianes', 'vues médianes'], ['fans', 'Abonnés', 'abonnés'], ['pace', 'Rythme', 'rythme (vidéos en 7 j)'], ['recent', 'Dernière vidéo', 'dernière vidéo']];
    const sortK = SORTS.some((x) => x[0] === st.sort) ? st.sort : 'med';
    const sortDef = SORTS.filter((x) => x[0] === sortK)[0];
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
        items: tally('niche').filter(keep).map((nm) => item(nm, all.filter((c) => c.niche === nm && okA(c) && okF(c, fb) && okT(c) && okK(c) && okG(c, gender)).length, niches.indexOf(nm) >= 0, flip('niches', niches, nm), check)) };
    } else if (open === 'app') {
      menu = { on: true, title: 'App', search: 'Chercher une app', foot: 'Plusieurs apps possibles. ' + foot,
        items: tally('appName').filter(keep).map((nm) => item(nm, all.filter((c) => c.appName === nm && okN(c) && okF(c, fb) && okT(c) && okK(c) && okG(c, gender)).length, apps.indexOf(nm) >= 0, flip('apps', apps, nm), check)) };
    } else if (open === 'fans') {
      menu = { on: true, title: 'Abonnés', search: 'Chercher une tranche', foot,
        items: FB.filter((x) => keep(x[1])).map((x) => item(x[1], all.filter((c) => okN(c) && okA(c) && okF(c, x) && okT(c) && okK(c) && okG(c, gender)).length, fans === x[0], () => set({ fans: x[0] }), radio)) };
    }
    else if (open === 'kind') {
      menu = { on: true, title: 'Type de contenu', search: 'Chercher un type', foot: 'Lu sur ses vidéos ; le carrousel vient de TikTok. Plusieurs types possibles. ' + foot,
        items: KL.filter((x) => keep(x[1])).map((x) => item(x[1], all.filter((c) => c.kind === x[0] && okN(c) && okA(c) && okF(c, fb) && okT(c) && okG(c, gender)).length, kinds.indexOf(x[0]) >= 0, flip('kinds', kinds, x[0]), check)) };
    } else if (open === 'gender') {
      menu = { on: true, title: 'Genre', search: 'Chercher', foot: 'Genre apparent de la personne qui se filme ; « sans visage » : personne ne se filme. ' + foot,
        items: GL.filter((x) => keep(x[1])).map((x) => item(x[1], all.filter((c) => okN(c) && okA(c) && okF(c, fb) && okT(c) && okK(c) && okG(c, x[0])).length, gender === x[0], () => set({ gender: x[0] }), radio)) };
    }
    if (menu.on) Object.assign(menu, { left: (st.left || 0) + 'px', cta: 'Voir ' + comptes(list.length), q: st.mq || '' });
    const IN0 = {};
    // Les autres pays : « en <pays> » à partir du nom du marché (Italie, Indonésie…).
    const PREP = (n) => { n = String(n || ''); if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return ['aux', 'les ']; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return ['en', 'l’']; return /e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? ['en', 'la '] : ['au', 'le ']; }; // « en France », « au Mexique », « aux États-Unis »
    const IN = new Proxy(IN0, { get: (t, c) => t[c] || ((b.mkt || []).filter((m) => m.c === c).map((m) => PREP(m.l)[0] + ' ' + m.l)[0] || '') });
    const mkt = (b.mkt || []).map((m) => Object.assign({}, m, { on: m.c === b.market ? 'true' : 'false', bg: m.c === b.market ? 'rgba(255,255,255,0.10)' : 'transparent', ink: m.c === b.market ? 'var(--ink)' : 'var(--ink-muted)', fw: m.c === b.market ? '600' : '500', ic: m.c === b.market ? 'var(--accent)' : 'var(--ink-faint)', flag: m.c !== 'XX', href: '/app/createurs?m=' + m.c }));
    // 50 lignes d'abord, puis 50 de plus à la demande ; filtres et classement portent sur toute la liste.
    const LIM = 50;
    const lim = st.lim || LIM;
    const pvH = st.pv || null;
    const rows = list.slice(0, lim).map((c, i) => { const h = String(c.h || '').replace(/^@/, ''); const on = h === pvH;
      return Object.assign({}, c, { rank: String(i + 1).padStart(2, '0'), mk: c.market || (b.market !== 'ALL' ? b.market : 'XX'), bg: on ? 'var(--accent-soft)' : 'transparent', sel: on ? 'true' : 'false',
        open: () => this.setState({ pv: h, open: '' }) }); });
    const pv = this.profileVals(pvH, list, b);
    // « Les abonnés ne comptent pas » : parmi les comptes affichés, celui qui fait le plus de vues médianes
    // face à ses abonnés (au moins 10 k vues médianes, et 10 fois ses abonnés) ; personne : le bandeau se cache.
    const star = list.filter((c) => c.nFans > 0 && c.nMed >= 1e4 && c.nMed >= 10 * c.nFans).sort((x, y) => y.nMed / y.nFans - x.nMed / x.nFans)[0];
    const tip = star ? { on: true, text: star.h + ' a ' + star.fans + (star.nFans > 1 ? ' abonnés' : ' abonné') + ' et ' + star.med + ' vues médianes par vidéo.' } : { on: false, text: '' };
    const view = { rows, tip, activeOn: active ? 'true' : 'false', toggleActive: () => set({ active: !active, open: '' }) };
    return Object.assign(view, { mkt, filters, chips, menu, mkb, mkm,
      none: b.none, noneLabel: 'Aucun compte suivi pour ce marché.', empty: !b.none && !b.wait && list.length === 0,
      // Le document garde les 200 comptes aux plus fortes vues médianes : au-delà, on le dit.
      countLabel: b.none || b.wait ? '' : b.total > all.length && all.length > 0
        ? 'Les ' + all.length + ' premiers en vues médianes, sur ' + comptes(b.total) + ' suivis ' + (IN[b.shown] || '')
        : (b.total > 1 ? grp(b.total) + ' comptes suivis ' : b.total + ' compte suivi ') + (IN[b.shown] || ''),
      hasMore: list.length > lim || (!!this._partial && lim < b.total), moreLabel: 'Voir ' + comptes(Math.min(LIM, (this._partial ? Math.max(list.length, b.total) : list.length) - lim)) + ' de plus', showMore: () => set({ lim: lim + LIM }),
      // Barre de résultats (15/11) : ce qu'on regarde (marché, nombre, tri) au-dessus de la liste.
      resTitle: b.market === 'ALL' ? 'Tous les créateurs' : 'Créateurs ' + (IN[b.shown] || ''),
      resSub: b.none || b.wait ? '' : comptes((niches.length || apps.length || fans !== 'ALL' || kinds.length || gender !== 'ALL' || active) ? list.length : Math.max(b.total || 0, list.length)) + ' · classés par ' + sortDef[2],
      sortLabel: sortDef[1], sortOn: open === 'sort', sortOpen: open === 'sort' ? 'true' : 'false',
      toggleSort: () => set({ open: open === 'sort' ? '' : 'sort' }), setSortEl: (el) => { this.sortEl = el; },
      sorts: SORTS.map(([k, l]) => Object.assign({ label: l, sel: sortK === k ? 'true' : 'false', bg: sortK === k ? 'var(--accent-soft)' : 'transparent', w: sortK === k ? 600 : 500, pick: () => set({ sort: k, open: '' }) }, radio(sortK === k))),
      tableHref: '/app/createurs?m=' + b.market, cardsHref: '/app/createurs/cartes?m=' + b.market,
      closeMenu: () => set({ open: '' }), onMq: (e) => set({ mq: e.target.value }),
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); set({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; },
      clearAll: () => set({ niches: [], apps: [], fans: 'ALL', kinds: [], gender: 'ALL', active: false, open: '' }),
      pv, closePv: () => this.setState({ pv: null }), setPvClose: (el) => { this.pvClose = el; },
      pvKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ pv: null }); } } });
  }

  // Profil à côté de la liste : la fiche du créateur (document « creator:<pseudo> », lue au clic),
  // complétée par sa ligne tant qu'elle charge. Sur le canevas : la ligne seule.
  profileVals(h, list, b) {
    if (!h) return { on: false };
    const P = this.props || {};
    const row = list.filter((c) => String(c.h || '').replace(/^@/, '') === h)[0] || {};
    const F = typeof P.get === 'function' ? P.get('creator:' + h) : null;
    const D = F || {};
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fk' : String(Math.round(n)));
    const xf = (x) => (x >= 10 ? String(Math.round(x)) : (Math.round(x * 10) / 10).toString().replace('.', ',')) + '×';
    const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
      return hr < 24 ? 'il y a ' + hr + '\u202fh' : d < 60 ? 'il y a ' + d + '\u202fj' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + ' an' + (d >= 730 ? 's' : ''); };
    const fans = typeof D.fans === 'number' ? D.fans : row.nFans || 0;
    const med = typeof D.median === 'number' ? D.median : row.nMed || 0;
    const p7 = typeof D.posts7d === 'number' ? D.posts7d : null;
    const vids = (D.videos || []).filter((v) => typeof v.views === 'number' && v.publishedAt);
    const last = vids.slice().sort((p, q) => p.publishedAt - q.publishedAt).slice(-8);
    const top = Math.max(1, ...last.map((v) => v.views), med) * 1.08;
    const hatch = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 6px), rgba(255,255,255,0.04)';
    const above = vids.filter((v) => typeof v.x === 'number' && v.x >= 1).sort((p, q) => q.views - p.views).slice(0, 3);
    const pool = above.length ? above : (D.best || []).slice(0, 3);
    const tops = pool.map((v) => ({ src: v.cover || '', v: nf(v.views || 0), x: typeof v.x === 'number' && v.x > 0 ? xf(v.x) : '', href: '/app/videos/' + v.id,
      xBg: (v.x || 0) >= 2 ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : 'rgba(5,7,12,0.6)' })).filter((v) => v.src);
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const fw = live ? P.saved('follows') : null;
    const followed = live ? !!(fw && (fw.creators || []).indexOf(h) >= 0) : !!((this.state || {}).followC || {})[h];
    const follow = () => {
      if (!live) return this.setState({ followC: Object.assign({}, (this.state || {}).followC || {}, { [h]: !followed }) });
      const cur = P.saved('follows');
      if (cur === undefined) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      next.creators = followed ? (next.creators || []).filter((x) => x !== h) : [h].concat(next.creators || []);
      P.save('follows', next);
    };
    const app = D.app || null;
    const lastAt = D.lastPostAt || null;
    const active = p7 !== null && p7 > 0;
    return { on: true, h: '@' + h, bio: D.bio || row.bio || '', av: D.avatar || row.av || '', noav: !(D.avatar || row.av), ini: h.charAt(0).toUpperCase(), mk: D.market || row.mk || b.shown || '',
      tt: 'https://www.tiktok.com/@' + h, href: '/app/createurs/' + h,
      hasApp: !!(app || row.appName), appName: app ? app.name : row.appName || '', appIcon: app ? app.icon || '' : (row.app && row.app.logo) || '', appBlank: (app ? app.icon : row.app && row.app.logo) ? '' : 'sw-app-blank',
      appHref: app && app.slug ? (app.page === false ? null : '/app/apps/' + app.slug) : (row.appHref || '/app/apps'), niche: app ? app.niche || '' : row.niche || '',
      act: lastAt ? (active ? 'Actif' : 'Calme') + ' · dernière ' + ago(lastAt) : '', actBg: active ? 'var(--accent-soft)' : 'var(--track)', actInk: active ? 'var(--accent)' : 'var(--ink-muted)',
      tiles: [['Abonnés', fans ? grp(fans) : '—', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3'],
        ['Vues médianes', med ? nf(med) : '—', 'M3 3v18h18M7 15l4-4 3 3 5-6'], ['Vidéos en 7 j', p7 !== null ? String(p7) : '—', 'M3 12h4l3-8 4 16 3-8h4']].map(([l, v, d]) => ({ l, v, d })),
      wait: F === undefined, hasBars: last.length > 1, barsTitle: 'Ses ' + last.length + ' dernières vidéos', medLabel: med ? nf(med).toUpperCase() : '—', medPct: med ? Math.min(100, (med / top) * 100).toFixed(1) : '0',
      bars: last.map((v) => ({ d: day(v.publishedAt), t: day(v.publishedAt) + ' : ' + nf(v.views) + ' vues', h: ((v.views / top) * 100).toFixed(1), href: '/app/videos/' + v.id,
        bg: med && v.views >= med ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : hatch })),
      hasTops: tops.length > 0, topsTitle: above.length ? 'Au-dessus de sa normale' : 'Ses meilleures vidéos', tops,
      follow, followOn: followed ? 'true' : 'false', followYes: followed, followNo: !followed, followLabel: followed ? 'Suivi' : 'Suivre' };
  }

  // Les créateurs d'un marché arrivent par pages de 500 (« creators:<marché> », puis « :2 », « :3 »…) : la suite se
  // lit quand la liste affichée s'en approche, et toute la liste dès qu'un filtre porte sur elle. Plus de plafond.
  creatorsOf(doc, market, P) {
    const st = this.state || {};
    const pages = doc && doc.pages > 1 ? doc.pages : 1;
    // Toute la liste dès qu'un filtre ou un autre tri est posé (sinon on ne filtrerait / trierait que les 500 premiers).
    const whole = !!((st.niches && st.niches.length) || (st.apps && st.apps.length) || (st.fans && st.fans !== 'ALL') || st.active
      || (st.kinds && st.kinds.length) || (st.gender && st.gender !== 'ALL') || (st.sort && st.sort !== 'med'));
    const want = whole ? pages : Math.min(pages, Math.ceil(((st.lim || 50) + 100) / 500));
    let out = (doc && doc.creators) || [];
    let partial = want < pages;
    for (let i = 2; i <= want; i++) {
      const pg = typeof P.get === 'function' ? P.get('creators:' + ((doc && doc.market) || market) + ':' + i) : null;
      if (pg && pg.creators) out = out.concat(pg.creators); else partial = true;
    }
    this._partial = partial;
    return out;
  }

  baseVals() {
    const st = this.state || {};
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "page"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const mkt = [{"c": "FR", "l": "France"}, {"c": "US", "l": "États-Unis"}, {"c": "MX", "l": "Mexique"}, {"c": "ES", "l": "Espagne"}, {"c": "BR", "l": "Brésil"}];
    const rows = (globalThis.__dcSample?.["Createurs"]?.["rows"] ?? []);
    const num = (s) => Number(String(s).replace(/\D/g, '')) || 0;
    // L'exemple (France seulement) mis au format des lignes.
    const norm = (c) => Object.assign({}, c, { href: '/app/createurs/' + c.h.slice(1), hasApp: true, appHref: '/app/apps', nFans: num(c.fans), nMed: num(c.medN),
      cov: c.cov.map((v) => Object.assign({ href: '/app/videos' }, v)) });
    let all = rows.map(norm);
    // Sur le site : les vraies données du Radar (document « creators:<marché> », convex/radarModels.ts) ;
    // un autre marché se lit avec get(), et la liste d'avant reste affichée tant qu'il charge.
    // Sur le canevas : l'exemple ci-dessus.
    const P = this.props || {};
    const D = P.data;
    const site = D !== undefined || typeof P.get === 'function';
    // Le marché vient de l'adresse (?m=US) : il suit le passage Tableau ↔ Cartes et reste au retour sur la page.
    // Sur le site, this.props.query ; sur le canevas, location.search.
    // Les marchés : ceux du document (du plus fourni au moins fourni), sinon ceux de l'exemple.
    const MKD = D && Array.isArray(D.markets) ? D.markets : null;
    const MK = MKD ? MKD.map((m) => m[0]) : mkt.map((m) => m.c);
    let qm = P.query ? P.query.m : null;
    if (!P.query && typeof location !== 'undefined') { try { qm = new URLSearchParams(location.search).get('m'); } catch (e) { qm = null; } }
    qm = String(qm || '').toUpperCase();
    const market = MK.indexOf(qm) >= 0 || qm === 'ALL' ? qm : (D && D.market && D.market !== 'ALL' ? D.market : MK[0] || 'FR');
    let shown = market, total = all.length, none = market !== 'FR', wait = false;
    if (none) all = [];
    if (site) {
      // L'adresse porte creators:FR ; un autre marché se lit avec get() (undefined tant qu'il charge : ni liste ni « aucun compte »).
      const doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      wait = doc === undefined;
      none = !wait && !(doc && doc.creators && doc.creators.length);
      shown = doc && doc.market ? doc.market : market;
      total = wait || none ? 0 : (doc.total || doc.creators.length);
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
      const isN = (n) => typeof n === 'number' && isFinite(n);
      const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
        return hr < 24 ? 'il y a ' + hr + '\u202fh' : d < 60 ? 'il y a ' + d + '\u202fj' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + (d < 548 ? ' an' : ' ans'); };
      // La bio en une ligne : sa première ligne qui contient du texte (pas seulement des émojis).
      const line = (s) => { const ls = String(s || '').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); return ls.filter((x) => /\p{L}/u.test(x))[0] || ls[0] || ''; };
      all = wait || none ? [] : this.creatorsOf(doc, market, P).map((c) => {
        const a = c.app || null;
        const ic = (a && a.icon) || '';
        const on = c.posts7d > 0;
        return {
          h: '@' + c.handle, market: c.market || '', kind: c.kind || '', gender: c.gender || '', href: '/app/createurs/' + c.handle, bio: line(c.bio), av: c.avatar || '', noav: true,
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, hasApp: !!a,
          appName: a ? a.name : '', niche: (a && a.niche) || '', appHref: a ? (a.page === false ? null : '/app/apps/' + a.slug) : '/app/apps',
          fans: isN(c.fans) ? Math.round(c.fans).toLocaleString('fr-FR') : '', fansK: isN(c.fans) ? nf(c.fans) : '', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '', nMed: isN(c.median) ? c.median : 0,
          rythme: isN(c.posts7d) ? (on ? c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j') : '',
          last: c.lastPostAt ? 'Dernière ' + ago(c.lastPostAt) : '', n7: isN(c.posts7d) ? c.posts7d : 0, lastAt: c.lastPostAt || 0,
          dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on,
          cov: (c.best || []).map((v) => ({ src: v.cover || '', v: nf(v.views), href: '/app/videos/' + v.id }))
        };
      });
    }
    return { nav, mkt: MKD ? MKD.map((x) => ({ c: x[0], l: x[1], n: x[2] })) : mkt, all, market, shown, total, none, wait };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1480px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "/app", "aria-label": "Kopycat, accueil" },
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
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
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
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 440px; height: 48px; padding: 0 18px; border: 0; border-radius: 14px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); backdrop-filter: none; -webkit-backdrop-filter: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qc", "type": "search", "aria-label": "Chercher un compte", "placeholder": "Chercher un compte…", "style": "font-size: 15px;" })
            )
          ),
          $h("div", { "style": "position: relative; z-index: 5; margin: 24px 32px 0; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
              $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": $v.mkb?.toggle, "aria-expanded": $v.mkb?.open, "aria-haspopup": "listbox", "aria-label": `Marché : ${$t($v.mkb?.l)}`, "style": "display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px 0 9px; border: 0; border-radius: 12px; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-edge); color: var(--ink); font: inherit; cursor: pointer;" },
                ($v.mkb?.flag) ? [
                  $h("span", { "class": "sw-flag sw-flag-24", "data-c": $v.mkb?.c, "aria-hidden": "true" })
                ] : null,
                ($v.mkb?.all) ? [
                  $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                    $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null,
                $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15;" },
                  $h("span", { "style": "font-size: 11px; color: var(--ink-muted);" },
                    "Marché"
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 700; white-space: nowrap;" },
                    $t($v.mkb?.l)
                  )
                ),
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink);" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 28px; margin: 0 4px; background: var(--line);" }),
              ($v.mkm?.on) ? [
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": "Marché", "style": "position: absolute; top: 54px; left: 0; z-index: 30; width: 480px; box-sizing: border-box; padding: 10px; border-radius: 22px; background: rgba(13,17,26,0.97); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; margin-bottom: 6px; border-radius: 14px; background: var(--track);" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("input", { "ref": $v.setMenuInput, "type": "search", "value": $v.mkm?.q, "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": "Chercher un pays", "placeholder": "Chercher un pays", "style": "flex: 1; min-width: 0; border: 0; background: transparent; outline: none; color: var(--ink); font: inherit; font-size: 14px;" })
                  ),
                  $h("div", { "style": "max-height: min(520px, 62vh); overflow-y: auto; display: flex; flex-direction: column; gap: 2px;" },
                    ($v.mkm?.showAll) ? [
                      $h("a", { "role": "option", "aria-selected": $v.mkm?.all?.sel, "href": $v.mkm?.all?.href, "onClick": $v.closeMenu, "style": `display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px; background: ${$t($v.mkm?.all?.bg)}; color: var(--ink); text-decoration: none; font-size: 14px; font-weight: ${$t($v.mkm?.all?.fw)};` },
                        $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                          $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $h("span", { "style": "flex: 1 1 auto;" },
                          "Tous les marchés"
                        ),
                        $h("span", { "style": "flex-shrink: 0; width: 54px; text-align: right; font-size: 13px; font-weight: 500; color: var(--ink-muted); font-variant-numeric: tabular-nums; white-space: nowrap;" },
                          $t($v.mkm?.all?.n)
                        ),
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: var(--accent); opacity: ${$t($v.mkm?.all?.tick)};` },
                          $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ] : null,
                    ($v.mkm?.hasTop) ? [
                      $h("span", { "style": "margin: 8px 12px 4px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--ink-faint);" },
                        "LES PLUS SUIVIS"
                      ),
                      ($l($v.mkm?.top)).map((m) => [
                        $h("a", { "role": "option", "aria-selected": m?.sel, "href": m?.href, "onClick": $v.closeMenu, "style": `display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px; background: ${$t(m?.bg)}; color: var(--ink); text-decoration: none; font-size: 14px; font-weight: ${$t(m?.fw)};` },
                          $h("span", { "class": "sw-flag sw-flag-22", "data-c": m?.c, "aria-hidden": "true" }),
                          $h("span", { "style": "flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(m?.l)
                          ),
                          $h("span", { "aria-hidden": "true", "style": "flex-shrink: 0; width: 90px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08);" },
                            $h("span", { "style": `display: block; width: ${$t(m?.w)}; height: 4px; border-radius: 2px; background: ${$t(m?.bar)};` })
                          ),
                          $h("span", { "style": "flex-shrink: 0; width: 54px; text-align: right; font-size: 13px; font-weight: 500; color: var(--ink-muted); font-variant-numeric: tabular-nums; white-space: nowrap;" },
                            $t(m?.n)
                          ),
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: var(--accent); opacity: ${$t(m?.tick)};` },
                            $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      ])
                    ] : null,
                    ($v.mkm?.hasRest) ? [
                      $h("span", { "style": "margin: 8px 12px 4px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--ink-faint);" },
                        "AUTRES PAYS · ", $t($v.mkm?.nRest)
                      ),
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 8px;" },
                        ($l($v.mkm?.rest)).map((m) => [
                          $h("a", { "role": "option", "aria-selected": m?.sel, "href": m?.href, "onClick": $v.closeMenu, "style": `display: flex; align-items: center; gap: 9px; height: 36px; padding: 0 10px; border-radius: 10px; background: ${$t(m?.bg)}; color: var(--ink-soft); text-decoration: none; font-size: 13px; font-weight: ${$t(m?.fw)}; min-width: 0;` },
                            $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" }),
                            $h("span", { "style": "flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(m?.l)
                            ),
                            $h("span", { "style": "flex-shrink: 0; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                              $t(m?.n)
                            )
                          )
                        ])
                      )
                    ] : null,
                    ($v.mkm?.none) ? [
                      $h("p", { "style": "margin: 10px 12px; font-size: 14px; color: var(--ink-muted);" },
                        "Aucun pays ne correspond."
                      )
                    ] : null
                  )
                )
              ] : null,
              ($l($v.filters)).map((f) => [
                $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": f?.toggle, "aria-expanded": f?.open, "aria-haspopup": "listbox", "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; background: ${$t(f?.bg)}; box-shadow: inset 0 0 0 1px ${$t(f?.edge)}; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;` },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": f?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "color: var(--ink-muted);" },
                    $t(f?.k)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(f?.v)
                  ),
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ]),
              $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.activeOn, "onClick": $v.toggleActive, "style": "height: 36px; padding: 0 12px; border-radius: 10px; gap: 8px; font-size: 13px;" },
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
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": $v.menu?.title, "style": `position: absolute; top: 46px; left: ${$t($v.menu?.left)}; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: rgba(13,17,26,0.96); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;` },
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
            )
          ),
          $h("div", { "style": "margin: 16px 32px 48px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
              $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; min-width: 0; flex-wrap: wrap;" },
                $h("h2", { "style": "margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap;" },
                  $t($v.resTitle)
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap;" },
                  $t($v.resSub)
                )
              ),
              $h("div", { "style": "position: relative; display: flex; align-items: center; gap: 8px;" },
                $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": $v.toggleSort, "aria-expanded": $v.sortOpen, "aria-haspopup": "listbox", "style": "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); color: var(--ink); font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "color: var(--ink-muted);" },
                    "Trier"
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t($v.sortLabel)
                  ),
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                ($v.sortOn) ? [
                  $h("div", { "ref": $v.setSortEl, "role": "listbox", "aria-label": "Trier par", "style": "position: absolute; top: 44px; right: 0; z-index: 30; width: 280px; box-sizing: border-box; padding: 8px; border-radius: 18px; background: rgba(13,17,26,0.97); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                    ($l($v.sorts)).map((o) => [
                      $h("button", { "type": "button", "role": "option", "aria-selected": o?.sel, "onClick": o?.pick, "style": `width: 100%; height: 44px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(o?.bg)}; color: var(--ink); font: inherit; font-size: 14px; font-weight: ${$t(o?.w)}; text-align: left; cursor: pointer;` },
                        $h("span", { "aria-hidden": "true", "style": `width: 18px; height: 18px; border-radius: ${$t(o?.radius)}; border: 1.5px solid ${$t(o?.box)}; background: ${$t(o?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                          $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": o?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $t(o?.label)
                      )
                    ])
                  )
                ] : null,
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
            $h("div", { "style": "overflow-x: auto; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1150px;" },
                $h("thead", null,
                  $h("tr", null,
                    $h("th", { "style": "width: 44px; padding-left: 20px;" },
                      "#"
                    ),
                    $h("th", { "style": "width: 290px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Créateur"
                      )
                    ),
                    $h("th", { "style": "width: 150px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Pousse"
                      )
                    ),
                    $h("th", { "class": "sw-num", "style": "width: 90px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Abonnés"
                      )
                    ),
                    $h("th", { "class": "sw-num", "style": "width: 110px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M3 3v18h18M7 15l4-4 3 3 5-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Vues médianes"
                      )
                    ),
                    $h("th", { "style": "width: 150px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M3 12h4l3-8 4 16 3-8h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Rythme"
                      )
                    ),
                    $h("th", { "style": "width: 236px; padding-right: 20px;" },
                      $h("span", { "class": "sw-th" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Ses meilleures"
                      )
                    )
                  )
                ),
                $h("tbody", null,
                  ($l($v.rows)).map((c) => [
                    $h("tr", { "style": `background: ${$t(c?.bg)};` },
                      $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.rank)
                      ),
                      $h("td", null,
                        $h("button", { "type": "button", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}`, "aria-expanded": c?.sel, "style": "display: flex; width: 100%; align-items: center; gap: 12px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; min-width: 0;" },
                          $h("span", { "style": "position: relative; flex-shrink: 0; display: inline-flex;" },
                            $h("span", { "style": "position: relative; width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
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
                            $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true", "style": "position: absolute; right: -3px; bottom: -3px; z-index: 2; box-shadow: 0 0 0 2px #121722;" })
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
                            $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px;" },
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
                        $h("span", { "style": "display: flex; gap: 8px;" },
                          ($l(c?.cov)).map((v) => [
                            $h("a", { "href": v?.href, "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues`, "style": "display: block; width: 64px; border-radius: 10px; flex-shrink: 0;" },
                              (v?.src) ? [
                                $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              $h("span", { "class": "sw-video-shade" }),
                              $h("span", { "style": "position: absolute; left: 6px; bottom: 5px; font-size: 11px; font-weight: 700;" },
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
        ($v.pv?.on) ? [
          $h("button", { "type": "button", "aria-label": "Fermer le profil", "onClick": $v.closePv, "tabindex": "-1", "style": "position: fixed; inset: 0; z-index: 40; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.45);" }),
          $h("aside", { "role": "dialog", "aria-modal": "true", "aria-label": `Profil de ${$t($v.pv?.h)}`, "onKeyDown": $v.pvKeys, "style": "position: fixed; top: 0; right: 0; bottom: 0; z-index: 41; width: 470px; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column; background: #0E131C; border-left: 1px solid var(--line); box-shadow: -40px 0 80px rgba(0,0,0,0.5); animation: sw-rise .35s cubic-bezier(.2,.8,.2,1) both;" },
            $h("header", { "style": "flex-shrink: 0; padding: clamp(14px, 2.2vh, 20px) 20px clamp(10px, 1.6vh, 14px); display: flex; flex-direction: column; gap: clamp(8px, 1.4vh, 12px); border-bottom: 1px solid var(--line);" },
              $h("div", { "style": "display: flex; align-items: flex-start; gap: 14px;" },
                $h("span", { "style": "position: relative; flex-shrink: 0; width: 58px; height: 58px;" },
                  $h("span", { "style": "display: flex; width: 58px; height: 58px; border-radius: 50%; overflow: hidden; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724);" },
                    ($v.pv?.av) ? [
                      $h("img", { "src": $v.pv?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    ($v.pv?.noav) ? [
                      $h("span", { "style": "font-size: 20px; font-weight: 700; color: var(--ink-faint);" },
                        $t($v.pv?.ini)
                      )
                    ] : null
                  ),
                  $h("span", { "class": "sw-flag", "data-c": $v.pv?.mk, "aria-hidden": "true", "style": "position: absolute; right: -2px; bottom: -2px; box-shadow: 0 0 0 2px #0E131C;" })
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.pv?.h)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                    $t($v.pv?.bio)
                  )
                ),
                $h("span", { "style": "display: flex; gap: 6px; flex-shrink: 0;" },
                  $h("a", { "href": $v.pv?.tt, "target": "_blank", "rel": "noopener", "aria-label": "Ouvrir sur TikTok", "title": "Ouvrir sur TikTok", "style": "width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: var(--track); color: var(--ink-muted);" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                      $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("button", { "ref": $v.setPvClose, "type": "button", "onClick": $v.closePv, "aria-label": "Fermer le profil", "style": "width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 10px; background: var(--track); color: var(--ink-muted); cursor: pointer;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("div", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
                ($v.pv?.hasApp) ? [
                  $h("a", { "href": $v.pv?.appHref, "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 10px 0 4px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 12px; color: var(--ink); text-decoration: none;" },
                    $h("span", { "class": `sw-app-icon ${$t($v.pv?.appBlank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                      ($v.pv?.appIcon) ? [
                        $h("img", { "class": "sw-logo-img", "src": $v.pv?.appIcon, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null
                    ),
                    "Pousse ",
                    $h("b", { "style": "font-weight: 600;" },
                      $t($v.pv?.appName)
                    )
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 12px;" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                      $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.pv?.niche)
                  )
                ] : null,
                ($v.pv?.act) ? [
                  $h("span", { "style": `display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; background: ${$t($v.pv?.actBg)}; font-size: 12px; font-weight: 600; color: ${$t($v.pv?.actInk)};` },
                    $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t($v.pv?.actInk)};` }),
                    $t($v.pv?.act)
                  )
                ] : null
              )
            ),
            $h("div", { "style": "flex: 1 1 auto; min-height: 0; overflow: hidden; padding: clamp(10px, 1.6vh, 14px) 20px; display: flex; flex-direction: column; gap: clamp(8px, 1.4vh, 14px);" },
              $h("div", { "style": "flex-shrink: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                ($l($v.pv?.tiles)).map((k) => [
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; padding: clamp(8px, 1.3vh, 11px) 12px; border-radius: 14px; background: var(--track);" },
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-faint);" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": k?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(k?.l)
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: clamp(15px, 2.2vh, 18px); font-weight: 700; letter-spacing: -0.02em; white-space: nowrap;" },
                      $t(k?.v)
                    )
                  )
                ])
              ),
              ($v.pv?.wait) ? [
                $h("p", { "style": "margin: 8px 2px; font-size: 13px; color: var(--ink-faint);" },
                  "Chargement de ses vidéos…"
                )
              ] : null,
              ($v.pv?.hasBars) ? [
                $h("div", { "style": "flex: 1 1 0; min-height: 110px; display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 16px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                  $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 10px;" },
                    $h("span", { "style": "font-size: 13px; font-weight: 600;" },
                      $t($v.pv?.barsTitle)
                    ),
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--ink-faint); white-space: nowrap;" },
                      $h("span", { "style": "width: 12px; border-top: 1.5px dashed rgba(255,255,255,0.35);" }),
                      "SA NORMALE ", $t($v.pv?.medLabel)
                    )
                  ),
                  $h("div", { "style": "position: relative; flex: 1; min-height: 40px; display: flex; align-items: flex-end; gap: 8px;" },
                    $h("span", { "aria-hidden": "true", "style": `position: absolute; left: 0; right: 0; bottom: ${$t($v.pv?.medPct)}%; border-top: 1.5px dashed rgba(255,255,255,0.28);` }),
                    ($l($v.pv?.bars)).map((b) => [
                      $h("a", { "href": b?.href, "title": b?.t, "style": `flex: 1; height: ${$t(b?.h)}%; min-height: 3px; border-radius: 6px 6px 2px 2px; background: ${$t(b?.bg)};` })
                    ])
                  ),
                  $h("div", { "style": "display: flex; gap: 8px;" },
                    ($l($v.pv?.bars)).map((b) => [
                      $h("span", { "style": "flex: 1; text-align: center; font-size: 10px; color: var(--ink-faint);" },
                        $t(b?.d)
                      )
                    ])
                  )
                )
              ] : null,
              ($v.pv?.hasTops) ? [
                $h("div", { "style": "flex: 1 1 0; min-height: 130px; display: flex; flex-direction: column; gap: 8px;" },
                  $h("span", { "style": "font-size: 13px; font-weight: 600;" },
                    $t($v.pv?.topsTitle)
                  ),
                  $h("div", { "style": "flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                    ($l($v.pv?.tops)).map((v) => [
                      $h("a", { "href": v?.href, "class": "sw-video", "style": "position: relative; display: block; height: 100%; aspect-ratio: auto; border-radius: 12px; overflow: hidden; background: #0A0C12;" },
                        $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy" }),
                        $h("span", { "class": "sw-video-shade" }),
                        (v?.x) ? [
                          $h("span", { "style": `position: absolute; top: 7px; left: 7px; z-index: 2; display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 999px; background: ${$t(v?.xBg)}; font-size: 11px; font-weight: 700; color: #FFFFFF;` },
                            $t(v?.x)
                          )
                        ] : null,
                        $h("span", { "style": "position: absolute; left: 8px; bottom: 6px; z-index: 2; font-size: 13px; font-weight: 700; color: #FFFFFF;" },
                          $t(v?.v)
                        )
                      )
                    ])
                  )
                )
              ] : null
            ),
            $h("footer", { "style": "flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: clamp(10px, 1.6vh, 14px) 20px clamp(12px, 2.2vh, 20px); border-top: 1px solid var(--line);" },
              $h("button", { "class": "sw-pill sw-follow", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn, "style": "height: 46px; gap: 8px; min-width: 150px; justify-content: center;" },
                ($v.pv?.followYes) ? [
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null,
                ($v.pv?.followNo) ? [
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                  )
                ] : null,
                $h("span", { "class": "sw-follow-now" },
                  $t($v.pv?.followLabel)
                ),
                ($v.pv?.followYes) ? [
                  $h("span", { "class": "sw-follow-stop" },
                    "Ne plus suivre"
                  )
                ] : null
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $v.pv?.href, "style": "flex: 1; justify-content: space-between;" },
                "Voir la fiche complète",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        ] : null,
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
