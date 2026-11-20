// Généré par scripts/dc2preact.py depuis design/app/CreateursA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Createurs extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // Abonnés : abmin/abmax (fourchette, D2) ; « abonnes » (l'ancienne tranche) est encore lu. « actifs » (téléphone) n'est
  // plus un filtre ici : la liste montre les actifs d'abord (E1) et laisse le paramètre dans l'adresse.
  filters() { return { niches: ['niche', 'l'], apps: ['app', 'l'], fans: ['abonnes', 's', 'ALL'], fmin: ['abmin', 's'], fmax: ['abmax', 's'], kinds: ['type', 'l'], gender: ['genre', 's', 'ALL'], sort: ['tri', 's', 'med'], market: ['m', 's'] }; }
  fv(k) {
    const st = this.state || {};
    if (st[k] !== undefined) return st[k];
    const d = this.filters()[k];
    if (!d) return undefined;
    let q = (this.props || {}).query;
    if (!q) { try { q = Object.fromEntries(new URLSearchParams(location.search)); } catch (e) { q = {}; } }
    const l = [].concat(q[d[0]] === undefined || q[d[0]] === null ? [] : q[d[0]]).map(String).filter(Boolean);
    if (d[1] === 'l') return l.length ? l : undefined;
    if (!l.length) return undefined;
    return d[1] === 'b' ? l[l.length - 1] === '1' : l[l.length - 1];
  }
  setF(patch) {
    this.setState(patch);
    const F = this.filters();
    if (!(this.props || {}).query || typeof history === 'undefined' || typeof location === 'undefined') return;
    const sp = new URLSearchParams(location.search);
    Object.keys(patch).forEach((k) => {
      if (!F[k]) return;
      const v = patch[k];
      sp.delete(F[k][0]);
      [].concat(v === true ? '1' : v === false || v === null || v === undefined ? [] : v).map(String).filter((s) => s && s !== F[k][2]).forEach((s) => sp.append(F[k][0], s));
    });
    const qs = sp.toString();
    try { history.replaceState(history.state, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) { /* adresse refusée : l'état suffit */ }
  }
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
  // ── Abonnés : une fourchette (maquette D2, 20/11) ──
  // Les crans du curseur : 0, 1 000, 10 000, 100 000, sans limite. Les champs acceptent n'importe quel nombre ; le
  // curseur se place alors entre deux crans (échelle par puissances de 10).
  fansStops() { return [0, 1e3, 1e4, 1e5, Infinity]; }
  fansRange() {
    const digits = (s) => String(s === undefined || s === null ? '' : s).replace(/[^\d]/g, '');
    const num = (s) => (digits(s) === '' ? null : Number(digits(s)));
    const LEG = { s: [0, 1e3], m: [1e3, 1e4], l: [1e4, 1e5], xl: [1e5, Infinity] }; // l'ancien paramètre « abonnes »
    let lo = num(this.fv('fmin')), hi = num(this.fv('fmax'));
    const leg = LEG[this.fv('fans')];
    if (lo === null && hi === null && leg) { lo = leg[0]; hi = leg[1]; }
    lo = lo || 0;
    hi = hi === null || hi === undefined || hi <= 0 ? Infinity : hi;
    if (hi <= lo) hi = Infinity;
    return { lo, hi, on: lo > 0 || hi < Infinity };
  }
  fansPos(v) {
    if (v <= 0) return 0;
    if (v === Infinity) return 1;
    if (v < 1e3) return 0.25 * v / 1e3;
    if (v < 1e5) return 0.25 + 0.25 * Math.log10(v / 1e3);
    return Math.min(1, 0.75 + 0.125 * Math.log10(v / 1e5));
  }
  setFans(lo, hi) {
    this.setF({ fans: 'ALL', fmin: lo > 0 ? String(Math.round(lo)) : null, fmax: hi < Infinity ? String(Math.round(hi)) : null });
  }
  // Glisser une poignée : la plus proche du doigt suit, cran par cran ; elle ne passe jamais l'autre.
  rangeDown(e) {
    const track = this.trackEl;
    if (!track || !e) return;
    const S = this.fansStops();
    const r = track.getBoundingClientRect();
    const idx = (x) => Math.max(0, Math.min(4, Math.round(((x - r.left) / Math.max(1, r.width)) * 4)));
    const cur = this.fansRange();
    const pLo = this.fansPos(cur.lo) * 4, pHi = this.fansPos(cur.hi) * 4;
    const i0 = ((e.clientX - r.left) / Math.max(1, r.width)) * 4;
    const which = Math.abs(i0 - pLo) <= Math.abs(i0 - pHi) && !(i0 > pHi) ? 'lo' : 'hi';
    const apply = (x) => {
      const now = this.fansRange();
      const iLo = Math.round(this.fansPos(now.lo) * 4), iHi = Math.round(this.fansPos(now.hi) * 4);
      let i = idx(x);
      if (which === 'lo') { i = Math.min(i, iHi - 1); if (S[i] !== now.lo) this.setFans(S[i], now.hi); }
      else { i = Math.max(i, iLo + 1); if (S[i] !== now.hi) this.setFans(now.lo, S[i]); }
    };
    apply(e.clientX);
    const move = (ev) => apply(ev.clientX);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    if (e.preventDefault) e.preventDefault();
  }
  // La requête de l'adresse qui porte les filtres de la liste (sans le tri ni la fenêtre ouverte) : la clé d'une vue.
  viewQuery(market) {
    const F = this.filters();
    const sp = [];
    ['market', 'niches', 'apps', 'fmin', 'fmax', 'kinds', 'gender'].forEach((k) => {
      const v = k === 'market' ? market : this.fv(k);
      [].concat(v === undefined || v === null ? [] : v).map(String).filter((s) => s && s !== F[k][2]).sort().forEach((s) => sp.push([F[k][0], s]));
    });
    const r = this.fansRange();
    if (r.on && !this.fv('fmin') && !this.fv('fmax')) { if (r.lo > 0) sp.push(['abmin', String(r.lo)]); if (r.hi < Infinity) sp.push(['abmax', String(r.hi)]); }
    return new URLSearchParams(sp.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]))).toString();
  }

  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    if (!this.setTrack) { this.setTrack = (el) => { this.trackEl = el; }; this.onRangeDown = (e) => this.rangeDown(e); }
    const open = st.open || '';
    // Les filtres : l'état, sinon l'adresse (F25, plus haut). Un type, un genre ou un tri inconnus sont ignorés.
    const niches = this.fv('niches') || [];
    const apps = this.fv('apps') || [];
    const kinds0 = this.fv('kinds') || [], gender0 = this.fv('gender'), sort0 = this.fv('sort');
    const mq = String(st.mq || '').trim();
    const set = (patch) => this.setF(patch);
    const FR = this.fansRange();
    const lo = FR.lo, hi = FR.hi;
    const okF = (c, a, z) => { a = a === undefined ? lo : a; z = z === undefined ? hi : z; return (a <= 0 && z === Infinity) || (c.nFans >= a && c.nFans < z); };
    const okN = (c) => niches.length === 0 || niches.indexOf(c.niche) >= 0;
    const okA = (c) => apps.length === 0 || apps.indexOf(c.appName) >= 0;
    // Type de contenu (lu par l'IA sur ses miniatures, carrousel dit par TikTok) et genre de la personne qui se filme.
    const KL = [['ambassadeur', 'Ambassadeur'], ['carrousel', 'Carrousel'], ['extrait_repris', 'Extrait repris'], ['histoire_messages', 'Histoire en messages'],
      ['demo_ecran', 'Démo d’écran'], ['motion', 'Motion'], ['ambiance_texte', 'Ambiance + texte']];
    const GL = [['ALL', 'Tous', ''], ['femme', 'Femmes', 'Femmes'], ['homme', 'Hommes', 'Hommes'], ['sans_visage', 'Sans visage', 'Sans visage']];
    const kinds = kinds0.filter((k) => KL.some((x) => x[0] === k));
    const gender = GL.some((x) => x[0] === gender0) ? gender0 : 'ALL';
    const kl = (k) => (KL.filter((x) => x[0] === k)[0] || [k, k])[1];
    const gl = GL.filter((x) => x[0] === gender)[0] || GL[0];
    const okK = (c) => kinds.length === 0 || kinds.indexOf(c.kind) >= 0;
    const okG = (c, g) => g === 'ALL' || c.gender === g;
    const all = b.all || [];
    // Un compte passe tous les filtres posés, sauf `skip` (« un filtre de moins » de l'écran vide) : les règles de la liste.
    const pass = (c, skip) => (skip === 'niche' || okN(c)) && (skip === 'app' || okA(c)) && (skip === 'fans' || okF(c)) && (skip === 'kind' || okK(c)) && (skip === 'gender' || okG(c, gender));
    const list = all.filter((c) => pass(c));
    // Le tri choisi dans la barre de résultats (15/11) ; vues médianes par défaut.
    const SORTKEY = { med: (c) => c.nMed, fans: (c) => c.nFans, pace: (c) => c.n7 || 0, recent: (c) => c.lastAt || 0 };
    if (sort0 && sort0 !== 'med' && Object.prototype.hasOwnProperty.call(SORTKEY, sort0)) list.sort((x, y) => SORTKEY[sort0](y) - SORTKEY[sort0](x));
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Safari écrit « 1059 » en fr-FR
    const comptes = (n) => grp(n) + (n > 1 ? ' comptes' : ' compte');
    const fk = (n) => (n >= 1e6 ? String(Math.round(n / 1e5) / 10).replace('.', ',') + ' M' : n >= 1e3 ? String(Math.round(n / 100) / 10).replace('.', ',').replace(/,0$/, '') + ' k' : String(n));
    const fansLabel = !FR.on ? 'Tous' : lo > 0 && hi < Infinity ? fk(lo) + ' à ' + fk(hi) : lo > 0 ? fk(lo) + ' et plus' : 'Moins de ' + fk(hi);

    // ── La barre de filtres (maquettes D1 et D2) : les boutons et fenêtres de choix d'Apps (choice.js) ──
    const BIC = { kind: 'M4 5h16v14H4zM10 9l5 3-5 3z', gender: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01', app: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', fans: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3' };
    const at = (e) => { const el = e && e.currentTarget; return el && typeof el.offsetLeft === 'number' ? el.offsetLeft : 0; };
    const mkBar = (key, k, v, extra) => Object.assign({ key, k, v, d: BIC[key], open: open === key ? 'true' : 'false', more: false, active: 'false' }, extra || {}, {
      toggle: (e) => set({ open: open === key ? '' : key, mq: '', left: at(e) }) });
    const more = (xs) => (xs.length > 1 ? '+' + (xs.length - 1) : false);
    const filters = [mkBar('niche', 'Niche', niches.length ? niches[0] : 'Toutes', { more: more(niches), active: niches.length ? 'true' : 'false' }),
      mkBar('app', 'App', apps.length ? apps[0] : 'Toutes', { more: more(apps), active: apps.length ? 'true' : 'false' }),
      mkBar('fans', 'Abonnés', fansLabel, { active: FR.on ? 'true' : 'false' }),
      mkBar('kind', 'Contenu', kinds.length ? kl(kinds[0]) : 'Tous', { more: more(kinds), active: kinds.length ? 'true' : 'false' }),
      mkBar('gender', 'Genre', gl[1], { active: gender !== 'ALL' ? 'true' : 'false' })];
    const mkAll = b.mkt || [];
    const allOn = b.market === 'ALL';
    const mkName = (c) => (c === 'ALL' ? 'Tous' : ((mkAll.filter((m) => m.c === c)[0] || {}).l || c));
    const mkb = { v: mkName(b.market), flag: allOn ? false : b.market, active: allOn ? 'false' : 'true', open: open === 'market' ? 'true' : 'false',
      toggle: (e) => set({ open: open === 'market' ? '' : 'market', mq: '', left: at(e) }) };
    const chips = [];
    niches.forEach((n) => chips.push({ label: n, clear: () => set({ niches: niches.filter((x) => x !== n) }) }));
    apps.forEach((n) => chips.push({ label: n, clear: () => set({ apps: apps.filter((x) => x !== n) }) }));
    if (FR.on) chips.push({ label: fansLabel + ' abonnés', clear: () => this.setFans(0, Infinity) });
    kinds.forEach((k) => chips.push({ label: kl(k), clear: () => set({ kinds: kinds.filter((x) => x !== k) }) }));
    if (gender !== 'ALL') chips.push({ label: gl[2], clear: () => set({ gender: 'ALL' }) });
    // Filtres sans résultat (maquette V3) : chaque filtre posé, ce qu'il dit, ce qu'on aurait sans lui, et son retrait.
    const fkn = (n) => fk(n).replace(' ', '\u00a0'); // « 100 k » ne se coupe pas en fin de ligne
    const fansLong = lo > 0 && hi < Infinity ? fkn(lo) + ' à ' + fkn(hi) + ' abonnés' : lo > 0 ? fkn(lo) + ' abonnés et plus' : 'moins de ' + fkn(hi) + ' abonnés';
    const posed = [];
    const chipsOf = (xs, ic) => xs.map((label) => ({ label, ic, flag: false }));
    if (niches.length) posed.push({ key: 'niche', name: niches.join(', '), frag: niches.join(' ou '), all: 'toutes niches', chips: chipsOf(niches, BIC.niche), drop: () => set({ niches: [] }) });
    if (apps.length) posed.push({ key: 'app', name: apps.join(', '), frag: apps.join(' ou '), all: 'toutes apps', chips: chipsOf(apps, BIC.app), drop: () => set({ apps: [] }) });
    if (FR.on) posed.push({ key: 'fans', name: fansLabel, frag: fansLong, all: 'tous abonnés', chips: chipsOf([fansLabel], BIC.fans), drop: () => this.setFans(0, Infinity) });
    if (kinds.length) posed.push({ key: 'kind', name: kinds.map(kl).join(', '), frag: kinds.map(kl).join(' ou '), all: 'tous contenus', chips: chipsOf(kinds.map(kl), BIC.kind), drop: () => set({ kinds: [] }) });
    if (gender !== 'ALL') posed.push({ key: 'gender', name: gl[2], frag: gl[2], all: 'tous genres', chips: chipsOf([gl[2]], BIC.gender), drop: () => set({ gender: 'ALL' }) });

    // Les fenêtres : recherche sans accents, ce qui est trouvé surligné, les nombres tiennent compte des autres filtres.
    const fold = (t) => Array.from(String(t)).map((c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || c).join('');
    const fq = fold(mq);
    const keepL = (label) => !fq || fold(label).indexOf(fq) >= 0;
    const hit = (label) => { const i = fq ? fold(label).indexOf(fq) : -1; return i < 0 ? { pre: label, hit: false, post: '' } : { pre: label.slice(0, i), hit: label.slice(i, i + fq.length), post: label.slice(i + fq.length) }; };
    const tally = (key) => { const m = {}; all.forEach((c) => { if (c[key]) m[c[key]] = (m[c[key]] || 0) + 1; }); return Object.keys(m).sort((x, y) => m[y] - m[x] || x.localeCompare(y, 'fr')); };
    const flip = (k, xs, v) => () => set({ [k]: xs.indexOf(v) >= 0 ? xs.filter((x) => x !== v) : xs.concat([v]) });
    const opt = (key, label, n, on, pick, shape, extra) => Object.assign({ key, shape, flag: false, globe: false, logo: false, ic: false, n: comptes(n), sel: on ? 'true' : 'false', dis: 'false', o: n === 0 ? 0.45 : 1, pick }, extra || {}, hit(label));
    const foot = 'Les nombres tiennent compte des autres filtres.';
    const left = (st.left || 0) + 'px';
    const base = { on: true, multi: 'false', left, hasSearch: true, hasList: true, range: false, head: false, tray: false, clearable: false, note: false, hasQ: !!fq, q: mq, count: grp(list.length), unit: list.length > 1 ? 'comptes' : 'compte' };
    const multi = (kind, title, search, trayPh, ic, xs, key, items, note) => Object.assign({}, base, { kind, multi: 'true', w: '400px', title, search, tray: true, noPick: xs.length === 0, trayPh,
      picked: xs.map((x) => ({ key: x, label: key === 'kinds' ? kl(x) : x, ic, clear: () => set({ [key]: xs.filter((y) => y !== x) }) })),
      clearable: true, canClear: xs.length ? 'true' : 'false', clearAll: () => set({ [key]: [] }), note, empty: items.length === 0, items });
    let menu = { on: false, items: [], left: '0px', title: '', search: '', w: '360px', kind: '', multi: 'false' };
    let rg = { bars: [], presets: [] };
    const logoOf = {};
    all.forEach((c) => { if (c.appName && c.app && c.app.logo && !logoOf[c.appName]) logoOf[c.appName] = c.app.logo; });
    if (open === 'market') {
      const sorted = mkAll.slice().sort((p, q) => (q.n || 0) - (p.n || 0));
      const items = [{ c: 'ALL', l: 'Tous les marchés', n: mkAll.reduce((s, m) => s + (m.n || 0), 0) }].concat(sorted).filter((m) => keepL(m.l))
        .map((m) => opt(m.c, m.l, m.n || 0, b.market === m.c, () => set({ market: m.c, open: '', lim: null, qOpen: false, pv: null }), 'radio',
          { flag: m.c !== 'ALL' && m.c !== 'XX' ? m.c : false, globe: m.c === 'ALL' }));
      menu = Object.assign({}, base, { kind: 'marche', w: '400px', title: 'Marché', search: 'Chercher un pays', head: fq ? false : 'Les plus suivis d’abord', note: 'Le pays de chaque compte.', empty: items.length === 0, items });
    } else if (open === 'niche') {
      const items = tally('niche').filter(keepL).map((nm) => opt(nm, nm, all.filter((c) => c.niche === nm && okA(c) && okF(c) && okK(c) && okG(c, gender)).length, niches.indexOf(nm) >= 0, flip('niches', niches, nm), 'check', { ic: BIC.niche }));
      menu = multi('niche', 'Niche', 'Chercher une niche', 'Aucune niche choisie : toutes comptent.', BIC.niche, niches, 'niches', items, foot);
    } else if (open === 'app') {
      const items = tally('appName').filter(keepL).map((nm) => opt(nm, nm, all.filter((c) => c.appName === nm && okN(c) && okF(c) && okK(c) && okG(c, gender)).length, apps.indexOf(nm) >= 0, flip('apps', apps, nm), 'check', logoOf[nm] ? { logo: logoOf[nm] } : { ic: BIC.app }));
      menu = multi('app', 'App', 'Chercher une app', 'Aucune app choisie : toutes comptent.', BIC.app, apps, 'apps', items, foot);
    } else if (open === 'kind') {
      const items = KL.filter((x) => keepL(x[1])).map((x) => opt(x[0], x[1], all.filter((c) => c.kind === x[0] && okN(c) && okA(c) && okF(c) && okG(c, gender)).length, kinds.indexOf(x[0]) >= 0, flip('kinds', kinds, x[0]), 'check', { ic: BIC.kind }));
      menu = multi('contenu', 'Type de contenu', 'Chercher un type', 'Aucun type choisi : tous comptent.', BIC.kind, kinds, 'kinds', items, 'Lu sur ses vidéos ; le carrousel vient de TikTok.');
    } else if (open === 'gender') {
      const items = GL.filter((x) => keepL(x[1])).map((x) => opt(x[0], x[1], all.filter((c) => okN(c) && okA(c) && okF(c) && okK(c) && okG(c, x[0])).length, gender === x[0], () => set({ gender: x[0] }), 'radio', { ic: BIC.gender }));
      menu = Object.assign({}, base, { kind: 'genre', w: '372px', title: 'Genre', search: 'Chercher', note: 'Genre apparent de la personne qui se filme ; « sans visage » : personne ne se filme.', empty: items.length === 0, items });
    } else if (open === 'fans') {
      // D2 : les comptes par tranche d'abonnés (les autres filtres comptent), un curseur à deux poignées, deux champs, trois raccourcis.
      const S = this.fansStops();
      const pool = all.filter((c) => okN(c) && okA(c) && okK(c) && okG(c, gender) && c.nFans >= 0);
      const B = [['Moins de 1 000', 'Moins de 1 k', 0, 1e3], ['1 000 à 10 000', '1 k à 10 k', 1e3, 1e4], ['10 000 à 100 000', '10 k à 100 k', 1e4, 1e5], ['100 000 et plus', '100 k et plus', 1e5, Infinity]];
      const ns = B.map((x) => pool.filter((c) => c.nFans >= x[2] && c.nFans < x[3]).length);
      const mx = Math.max(1, ...ns);
      const inR = (x) => x[2] >= lo && x[3] <= hi;
      const pLo = this.fansPos(lo), pHi = this.fansPos(hi);
      const PRE = [['Petits comptes', 0, 1e4], ['1 k à 100 k', 1e3, 1e5], ['Gros comptes', 1e5, Infinity]];
      const step = (which, d) => (e) => {
        if (!e || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) < 0) return;
        e.preventDefault();
        const iLo = Math.round(pLo * 4), iHi = Math.round(pHi * 4);
        const dir = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : e.key === 'Home' ? -4 : e.key === 'End' ? 4 : 1;
        if (which === 'lo') this.setFans(S[Math.max(0, Math.min(iHi - 1, iLo + dir))], hi);
        else this.setFans(lo, S[Math.min(4, Math.max(iLo + 1, iHi + dir))]);
      };
      rg = { count: comptes(list.length), setTrack: this.setTrack, down: this.onRangeDown,
        bars: B.map((x, i) => ({ label: x[0], l: x[1], n: grp(ns[i]), s: Math.max(0.05, ns[i] / mx).toFixed(3), on: FR.on && inR(x) ? 'true' : 'false',
          bg: inR(x) ? '#3A86F0' : 'rgba(255,255,255,0.12)', nInk: inR(x) ? 'var(--ink)' : 'var(--ink-faint)', pick: () => this.setFans(x[2], x[3]) })),
        fx: (pLo * 100).toFixed(2) + '%', fw: Math.max(0, pHi - pLo).toFixed(4), loP: (pLo * 100).toFixed(2) + '%', hiP: (pHi * 100).toFixed(2) + '%',
        loI: String(Math.round(pLo * 4)), hiI: String(Math.round(pHi * 4)), loTxt: lo > 0 ? grp(lo) : '', hiTxt: hi < Infinity ? grp(hi) : '',
        keyLo: step('lo'), keyHi: step('hi'),
        onLo: (e) => { const d = String(e.target.value || '').replace(/[^\d]/g, ''); this.setFans(d ? Number(d) : 0, hi); },
        onHi: (e) => { const d = String(e.target.value || '').replace(/[^\d]/g, ''); this.setFans(lo, d ? Number(d) : Infinity); },
        presets: PRE.map((p) => { const on = lo === p[1] && hi === p[2]; return { label: p[0], on: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'var(--line)', pick: () => this.setFans(p[1], p[2]) }; }) };
      menu = Object.assign({}, base, { kind: 'abonnes', w: '420px', title: 'Abonnés', search: '', hasSearch: false, hasList: false, range: true, note: foot, items: [] });
    }

    // ── Mes vues (maquette D2) : les filtres posés, gardés sous un nom tiré d'eux ; un clic les remet ──
    const liveS = typeof P.saved === 'function' && typeof P.save === 'function';
    const vRaw = liveS ? P.saved('views') : st.views;
    const vAll = Array.isArray(vRaw) ? vRaw.filter((w) => w && typeof w === 'object') : [];
    const mine = vAll.filter((w) => w.screen === 'createurs' && typeof w.q === 'string');
    const keepViews = (xs) => (liveS ? P.save('views', xs) : this.setState({ views: xs }));
    const curQ = this.viewQuery(b.market);
    const parts = [].concat(niches.length ? [niches[0] + (niches.length > 1 ? ' +' + (niches.length - 1) : '')] : [], apps.length ? [apps[0] + (apps.length > 1 ? ' +' + (apps.length - 1) : '')] : [],
      FR.on ? [fansLabel + ' abonnés'] : [], kinds.length ? [kl(kinds[0]) + (kinds.length > 1 ? ' +' + (kinds.length - 1) : '')] : [], gender !== 'ALL' ? [gl[2]] : []);
    const filtered = parts.length > 0;
    const vName = parts.concat(allOn ? [] : [mkName(b.market)]).join(' · ');
    const applyView = (q) => {
      const sp = new URLSearchParams(q);
      const all1 = (p) => sp.getAll(p);
      const one = (p, d) => (sp.get(p) === null ? d : sp.get(p));
      set({ market: one('m', b.market), niches: all1('niche'), apps: all1('app'), fans: 'ALL', fmin: one('abmin', null), fmax: one('abmax', null), kinds: all1('type'), gender: one('genre', 'ALL'), open: '', lim: null, qOpen: false });
    };
    const views = { on: !(liveS && vRaw === undefined) && (mine.length > 0 || filtered), canSave: filtered && !mine.some((w) => w.q === curQ) && mine.length < 50,
      save: () => keepViews([{ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), screen: 'createurs', name: vName.slice(0, 200), q: curQ, at: Date.now() }].concat(vAll).slice(0, 50)),
      items: mine.map((w) => { const on = w.q === curQ; return { key: w.id, label: String(w.name || 'Ma vue'), on: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'var(--track)',
        edge: on ? 'var(--accent-edge)' : 'var(--line)', ic: on ? 'var(--accent)' : 'var(--ink-faint)', apply: () => applyView(w.q), remove: () => keepViews(vAll.filter((x) => x.id !== w.id)) }; }) };

    // ── Actifs d'abord (maquette E1) : ceux qui ont publié cette semaine, puis les autres, repliés ──
    const SORTS = [['med', 'Vues médianes', 'vues médianes'], ['fans', 'Abonnés', 'abonnés'], ['pace', 'Rythme', 'rythme (vidéos en 7 j)'], ['recent', 'Dernière vidéo', 'dernière vidéo']];
    const sortK = SORTS.some((x) => x[0] === sort0) ? sort0 : 'med';
    const sortDef = SORTS.filter((x) => x[0] === sortK)[0];
    const radio = (on) => ({ radius: '50%', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const LIM = 50;
    const lim = st.lim || LIM, qlim = st.qlim || LIM, qOpen = !!st.qOpen;
    const pvH = st.pv || null;
    const act = list.filter((c) => c.active), calm = list.filter((c) => !c.active);
    const partial = !!this._partial;
    const nAct = !filtered && !partial ? act.length : !filtered && typeof b.active7 === 'number' ? b.active7 : act.length;
    const nCalm = !filtered && typeof b.active7 === 'number' && b.total ? Math.max(0, b.total - b.active7) : calm.length;
    const mkRow = (c, i) => { const h = String(c.h || '').replace(/^@/, ''); const on = h === pvH;
      return Object.assign({}, c, { key: h, rank: String(i + 1).padStart(2, '0'), mk: c.market || (b.market !== 'ALL' ? b.market : 'XX'), bg: on ? 'var(--accent-soft)' : 'transparent', sel: on ? 'true' : 'false',
        hasCov: !!(c.cov && c.cov.length), noApp: !c.hasApp, badge: c.n7 > 0 ? (c.n7 >= 30 ? 'au moins 30 vidéos' : c.n7 + (c.n7 > 1 ? ' vidéos' : ' vidéo')) + ' / 7 j' : 'Rien en 7 j',
        open: () => this.setState({ pv: h, open: '' }) }); };
    const rows = act.slice(0, lim).map(mkRow);
    const actDone = lim >= act.length && !(partial && !filtered && act.length < nAct);
    const qrows = qOpen && actDone ? calm.slice(0, qlim).map((c, i) => mkRow(c, act.length + i)) : [];
    const quiet = { on: actDone && !b.wait && !b.none && nCalm > 0,
      title: comptes(nCalm) + ' sans vidéo cette semaine', cta: qOpen ? 'Masquer' : 'Afficher', open: qOpen ? 'true' : 'false',
      sub: qOpen ? 'Classés par ' + sortDef[2] + '.' : calm.slice(0, 4).map((c) => c.h).join(', ') + (nCalm > 4 ? '…' : ''),
      toggle: () => this.setState({ qOpen: !qOpen, qlim: null }) };
    const restAct = Math.max(0, nAct - lim), restCalm = Math.max(0, nCalm - qlim);
    const pv = this.profileVals(pvH, list, b, all);
    let ajItem = null;
    if (pv.on) ajItem = { kind: 'creator', id: pvH, label: '@' + pvH, cover: pv.av || null };
    const view = { rows, qrows, quiet, mkb, filters, chips, menu, rg, views };
    return Object.assign(view, {
      none: b.none, noneLabel: 'Aucun compte suivi pour ce marché.', empty: !b.none && !b.wait && list.length === 0,
      vz: !b.none && !b.wait && list.length === 0 ? this.voidVals('Aucun compte', posed.map((g) => Object.assign(g, { n: all.filter((x) => pass(x, g.key)).length })), ['compte', 'comptes']) : this.voidVals('', [], []),
      hasMore: !actDone ? restAct > 0 : qOpen && restCalm > 0,
      moreLabel: 'Voir ' + comptes(Math.min(LIM, !actDone ? restAct : restCalm)) + ' de plus',
      showMore: () => (!actDone ? set({ lim: lim + LIM }) : this.setState({ qlim: qlim + LIM })),
      // Barre de résultats : ce qu'on regarde (marché, nombre d'actifs, tri) au-dessus de la liste.
      resTitle: (b.market === 'ALL' ? 'Actifs cette semaine, tous marchés' : 'Actifs cette semaine ' + (this.inMarket(b) || '')),
      resSub: b.none || b.wait ? '' : comptes(nAct) + ' · classés par ' + sortDef[2],
      sortLabel: sortDef[1], sortOn: open === 'sort', sortOpen: open === 'sort' ? 'true' : 'false',
      toggleSort: () => set({ open: open === 'sort' ? '' : 'sort' }), setSortEl: (el) => { this.sortEl = el; },
      sorts: SORTS.map(([k, l]) => Object.assign({ label: l, sel: sortK === k ? 'true' : 'false', bg: sortK === k ? 'var(--accent-soft)' : 'transparent', w: sortK === k ? 600 : 500, pick: () => set({ sort: k, open: '' }) }, radio(sortK === k))),
      tableHref: '/app/createurs?m=' + b.market, cardsHref: '/app/createurs/cartes?m=' + b.market,
      closeMenu: () => set({ open: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      clearMq: () => { if (this.menuInput) { this.menuInput.value = ''; this.menuInput.focus(); } this.setState({ mq: '' }); },
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); set({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; },
      clearAll: () => set({ niches: [], apps: [], fans: 'ALL', fmin: null, fmax: null, kinds: [], gender: 'ALL', open: '' }),
      pv, ajItem, closePv: () => this.setState({ pv: null, aj: false }), setPvClose: (el) => { this.pvClose = el; },
      pvKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ pv: null, aj: false }); } } });
  }

  // Filtres sans résultat (maquette V3 « le même geste partout », 20/11) : la phrase, les filtres posés en pastilles, puis
  // un filtre de moins par ligne, avec ce que la liste donnerait sans lui (ses règles, sur la liste déjà chargée) ; les
  // plus fructueux d'abord, 3 au plus, un retrait qui donne encore 0 omis. Le même dessin sur Apps et Formats.
  // groups : [{ key, name (son libellé), frag (dans la phrase), where (à la fin de la phrase), desc (dans le détail d'un
  // autre retrait, sinon frag ou name), all (le détail sans lui), chips, n (ce qu'on aurait sans lui), drop }].
  voidVals(noun, groups, unit) {
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const and = (xs) => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' et ' + xs[xs.length - 1] : xs[0] || '');
    const frags = groups.filter((g) => g.frag).map((g) => g.frag), wheres = groups.filter((g) => g.where).map((g) => g.where);
    const rows = groups.filter((g) => g.n > 0).sort((p, q) => q.n - p.n).slice(0, 3).map((g) => ({ key: g.key, label: 'Retirer « ' + g.name + ' »',
      sub: groups.filter((x) => x !== g).map((x) => x.desc || x.frag || x.name).concat([g.all]).join(', '), n: grp(g.n), unit: g.n > 1 ? unit[1] : unit[0], drop: g.drop }));
    return { title: noun + (frags.length ? ' pour ' + and(frags) : '') + (wheres.length ? ' ' + wheres.join(' ') : ''),
      chips: groups.reduce((a, g) => a.concat(g.chips), []), rows, hasRows: rows.length > 0 };
  }

  // « en France », « au Mexique », « aux États-Unis » : le marché affiché, d'après son nom.
  inMarket(b) {
    const n = String(((b.mkt || []).filter((m) => m.c === b.shown)[0] || {}).l || '');
    if (!n) return '';
    if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'aux ' + n;
    if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'en ' + n;
    return (/e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? 'en ' : 'au ') + n;
  }

  // Le profil (maquette D1, 20/11) : la ligne cliquée devient le panneau (src/app/morph.js, comme sur Apps). La fiche du
  // créateur (document « creator:<pseudo> », lue au clic) complète sa ligne ; sur le canevas : la ligne seule.
  profileVals(h, list, b, all) {
    if (!h) return { on: false };
    const P = this.props || {};
    const row = list.filter((c) => String(c.h || '').replace(/^@/, '') === h)[0] || (all || []).filter((c) => String(c.h || '').replace(/^@/, '') === h)[0] || {};
    const F = typeof P.get === 'function' ? P.get('creator:' + h) : null;
    const D = F || {};
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' k' : String(Math.round(n)));
    const xf = (x) => (x >= 10 ? String(Math.round(x)) : (Math.round(x * 10) / 10).toString().replace('.', ',')) + '×';
    const fans = typeof D.fans === 'number' ? D.fans : row.nFans > 0 ? row.nFans : 0;
    const med = typeof D.median === 'number' ? D.median : row.nMed || 0;
    const p7 = typeof D.posts7d === 'number' ? D.posts7d : typeof row.n7 === 'number' ? row.n7 : null;
    const vids = (D.videos || []).filter((v) => typeof v.views === 'number' && v.publishedAt);
    // Le rythme : days7 de la synchro ; sinon compté sur ses dernières vidéos (fiche), jour de Paris.
    const pday = (ms) => { try { const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms)); return Math.round(Date.parse(p + 'T00:00:00Z') / 864e5); } catch (e) { return Math.floor(ms / 864e5); } };
    let d7 = Array.isArray(D.days7) && D.days7.length === 7 ? D.days7 : Array.isArray(row.days7) && row.days7.length === 7 ? row.days7 : null;
    if (!d7 && vids.length) { const t = pday(Date.now()); d7 = [0, 0, 0, 0, 0, 0, 0]; vids.forEach((v) => { const k = t - pday(v.publishedAt); if (k >= 0 && k < 7) d7[6 - k]++; }); }
    const DN = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const days = (d7 || []).map((n, i) => { const k = 6 - i; const wd = new Date(Date.now() - k * 864e5).getDay();
      return { t: (k === 0 ? 'Aujourd’hui' : k === 1 ? 'Hier' : DN[wd].charAt(0).toUpperCase() + DN[wd].slice(1)) + ' : ' + (n ? n + (n > 1 ? ' vidéos' : ' vidéo') : 'rien'),
        bg: n >= 2 ? '#4C9AFF' : n === 1 ? 'rgba(76,154,255,0.55)' : 'rgba(255,255,255,0.08)' }; });
    const above = vids.filter((v) => typeof v.x === 'number' && v.x >= 1).sort((p, q) => q.views - p.views).slice(0, 3);
    const pool = (D.best && D.best.length ? D.best : above).slice(0, 3);
    const tops = pool.map((v) => ({ src: v.cover || '', v: nf(v.views || 0), x: typeof v.x === 'number' && v.x > 0 ? xf(v.x) : '', href: '/app/videos/' + v.id,
      xBg: (v.x || 0) >= 2 ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : 'rgba(5,7,12,0.6)' })).filter((v) => v.src);
    const rowTops = !tops.length && row.cov ? row.cov.filter((v) => v.src).map((v) => ({ src: v.src, v: v.v, x: '', href: v.href, xBg: '' })) : [];
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
    const appName = app ? app.name : row.appName || '';
    // D'autres comptes sur la même app, parmi ceux du marché : les plus vus d'abord.
    const peers = appName ? (all || []).filter((c) => c.appName === appName && String(c.h || '').replace(/^@/, '') !== h).sort((p, q) => (q.nMed || 0) - (p.nMed || 0)).slice(0, 2)
      .map((c) => { const k = String(c.h || '').replace(/^@/, ''); return { h: c.h, av: c.av || '', noav: !c.av, ini: k.charAt(0).toUpperCase(), med: c.med || '—',
        sub: [c.fans ? c.fans + ' abonnés' : '', c.rythme || ''].filter(Boolean).join(' · '), open: () => this.setState({ pv: k, aj: false }) }; }) : [];
    const n7 = p7 !== null ? p7 : d7 ? d7.reduce((s, n) => s + n, 0) : null; // le nombre du Radar, comme la ligne
    return { on: true, h: '@' + h, bio: D.bio || row.bio || '', av: D.avatar || row.av || '', noav: !(D.avatar || row.av), ini: h.charAt(0).toUpperCase(), mk: D.market || row.mk || b.shown || '',
      tt: 'https://www.tiktok.com/@' + h, href: '/app/createurs/' + h,
      stats: [{ l: 'Abonnés', v: fans ? grp(fans) : '—' }, { l: 'Vues médianes', v: med ? nf(med) : '—' }],
      rythme: n7 === null || n7 === undefined ? '' : n7 > 0 ? (n7 >= 30 ? 'au moins 30 vidéos' : n7 + (n7 > 1 ? ' vidéos' : ' vidéo')) + ' en 7 j' : 'Rien en 7 j', cap: typeof n7 === 'number' && n7 >= 30,
      hasDays: days.length === 7 && d7.some((n) => n > 0), days, wait: F === undefined && !d7,
      hasTops: (tops.length || rowTops.length) > 0, topsTitle: 'Ses meilleures vidéos', tops: tops.length ? tops : rowTops,
      hasApp: !!appName, appName, appIcon: app ? app.icon || '' : (row.app && row.app.logo) || '', appBlank: (app ? app.icon : row.app && row.app.logo) ? '' : 'sw-app-blank',
      appHref: app && app.slug ? (app.page === false ? '' : '/app/apps/' + app.slug) : (row.appHref || ''), niche: app ? app.niche || '' : row.niche || '',
      hasPeers: peers.length > 0, peersTitle: 'D’autres comptes sur ' + appName, peers,
      follow, followOn: followed ? 'true' : 'false', followYes: followed, followNo: !followed, followLabel: followed ? 'Suivi' : 'Suivre' };
  }

  // Les créateurs d'un marché arrivent par pages de 500 (« creators:<marché> », puis « :2 », « :3 »…) : la suite se
  // lit quand la liste affichée s'en approche, et toute la liste dès qu'un filtre porte sur elle. Plus de plafond.
  creatorsOf(doc, market, P) {
    const st = this.state || {};
    const pages = doc && doc.pages > 1 ? doc.pages : 1;
    // Toute la liste dès qu'un filtre ou un autre tri est posé (sinon on ne filtrerait / trierait que les 500 premiers).
    const f = (k) => this.fv(k); // filtres de l'état ou de l'adresse (F25)
    // Une fenêtre de filtre ouverte compte aussi sur toute la liste (avant : les 500 premiers seulement).
    const whole = !!((f('niches') && f('niches').length) || (f('apps') && f('apps').length) || (f('fans') && f('fans') !== 'ALL') || f('fmin') || f('fmax') || st.qOpen || (st.open && st.open !== 'sort')
      || (f('kinds') && f('kinds').length) || (f('gender') && f('gender') !== 'ALL') || (f('sort') && f('sort') !== 'med'));
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
    let qm = this.fv('market') || null; // l'état (choix dans la fenêtre Marché), sinon l'adresse (?m=US)
    qm = String(qm || '').toUpperCase();
    const market = MK.indexOf(qm) >= 0 || qm === 'ALL' ? qm : (D && D.market && D.market !== 'ALL' ? D.market : MK[0] || 'FR');
    let shown = market, total = all.length, none = market !== 'FR', wait = false, active7 = null;
    if (none) all = [];
    if (site) {
      // L'adresse porte creators:FR ; un autre marché se lit avec get() (undefined tant qu'il charge : ni liste ni « aucun compte »).
      const doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      wait = doc === undefined;
      none = !wait && !(doc && doc.creators && doc.creators.length);
      shown = doc && doc.market ? doc.market : market;
      total = wait || none ? 0 : (doc.total || doc.creators.length);
      active7 = !wait && !none && typeof doc.active7 === 'number' ? doc.active7 : null;
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
        // Le Radar lit les 30 dernières vidéos d'un compte : 30 en 7 jours veut dire « au moins 30 » (règle de l'Accueil).
        const cap = isN(c.posts7d) && c.posts7d >= 30;
        const pace = isN(c.posts7d) ? (on ? (cap ? 'au moins 30 vidéos' : c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo')) + ' en 7 j' : 'Rien en 7 j') : '';
        return {
          h: '@' + c.handle, market: c.market || '', kind: c.kind || '', gender: c.gender || '', href: '/app/createurs/' + c.handle, bio: line(c.bio), av: c.avatar || '', noav: true,
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, hasApp: !!a,
          appName: a ? a.name : '', niche: (a && a.niche) || '', appHref: a ? (a.page === false ? null : '/app/apps/' + a.slug) : '/app/apps',
          fans: isN(c.fans) ? Math.round(c.fans).toLocaleString('fr-FR') : '', fansK: isN(c.fans) ? nf(c.fans) : '', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '', nMed: isN(c.median) ? c.median : 0,
          rythme: pace, cap,
          last: c.lastPostAt ? 'Dernière ' + ago(c.lastPostAt) : '', n7: isN(c.posts7d) ? c.posts7d : 0, lastAt: c.lastPostAt || 0,
          dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on, days7: Array.isArray(c.days7) && c.days7.length === 7 ? c.days7 : null,
          hasDays: Array.isArray(c.days7) && c.days7.some((n) => n > 0), noDays: !(Array.isArray(c.days7) && c.days7.some((n) => n > 0)),
          days: (Array.isArray(c.days7) ? c.days7 : []).map((n) => ({ bg: n >= 2 ? '#4C9AFF' : n === 1 ? 'rgba(76,154,255,0.55)' : 'rgba(255,255,255,0.08)' })),
          daysAria: Array.isArray(c.days7) ? 'Vidéos par jour sur 7 jours : ' + c.days7.join(', ') : '',
          l2a: pace || (c.lastPostAt ? ago(c.lastPostAt) : ''), l2b: pace && c.lastPostAt ? ago(c.lastPostAt) : '',
          cov: (c.best || []).map((v) => ({ src: v.cover || '', v: nf(v.views), href: '/app/videos/' + v.id }))
        };
      });
    }
    return { nav, mkt: MKD ? MKD.map((x) => ({ c: x[0], l: x[1], n: x[2] })) : mkt, all, market, shown, total, none, wait, active7 };
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
            $h("a", { "class": "sw-side-item", "href": $u(n?.href), "aria-current": n?.cur },
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
          $h("div", { "style": "position: relative; z-index: 5; margin: 24px 32px 0; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px;" },
              $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
                $h("button", { "type": "button", "class": "fl-trig", "data-menu-trigger": "true", "data-fl-trig": "marche", "data-on": $v.mkb?.active, "onClick": $v.mkb?.toggle, "aria-expanded": $v.mkb?.open, "aria-haspopup": "listbox", "aria-label": `Marché : ${$t($v.mkb?.v)}`, "style": "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "color: var(--ink-muted);" },
                    "Marché"
                  ),
                  $h("span", { "class": "fl-val", "data-roll": "" },
                    ($v.mkb?.flag) ? [
                      $h("span", { "class": "sw-flag", "data-c": $v.mkb?.flag, "aria-hidden": "true" })
                    ] : null,
                    $t($v.mkb?.v)
                  ),
                  $h("svg", { "class": "fl-chev", "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                ($l($v.filters)).map((b) => [
                  $h("button", { "type": "button", "class": "fl-trig", "data-menu-trigger": "true", "data-fl-trig": b?.key, "data-on": b?.active, "onClick": b?.toggle, "aria-expanded": b?.open, "aria-haspopup": "listbox", "style": "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": b?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "color: var(--ink-muted);" },
                      $t(b?.k)
                    ),
                    $h("span", { "class": "fl-val", "data-roll": "" },
                      $t(b?.v)
                    ),
                    (b?.more) ? [
                      $h("span", { "class": "fl-more" },
                        $t(b?.more)
                      )
                    ] : null,
                    $h("svg", { "class": "fl-chev", "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ]),
                ($l($v.chips)).map((ch) => [
                  $h("button", { "class": "sw-badge sw-badge-accent", "type": "button", "onClick": ch?.clear, "aria-label": `Retirer le filtre ${$t(ch?.label)}`, "style": "height: 32px; padding: 0 8px 0 12px; border: 0; cursor: pointer; font-family: inherit; gap: 6px;" },
                    $t(ch?.label),
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ]),
                ($v.menu?.on) ? [
                  $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": $v.menu?.title, "aria-multiselectable": $v.menu?.multi, "data-fl": $v.menu?.kind, "class": "fl-pan", "style": `left: ${$t($v.menu?.left)}; width: ${$t($v.menu?.w)};` },
                    $h("div", { "class": "fl-side" },
                      ($v.menu?.hasSearch) ? [
                        $h("label", { "class": "fl-search", "data-fl-in": "" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                            $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          ),
                          $h("input", { "ref": $v.setMenuInput, "type": "search", "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": $v.menu?.search, "placeholder": $v.menu?.search }),
                          ($v.menu?.hasQ) ? [
                            $h("button", { "type": "button", "class": "fl-qx", "onClick": $v.clearMq, "aria-label": "Effacer la recherche" },
                              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          ] : null
                        )
                      ] : null,
                      ($v.menu?.tray) ? [
                        $h("div", { "class": "fl-tray", "data-fl-in": "" },
                          ($v.menu?.noPick) ? [
                            $h("span", { "class": "fl-tray-ph" },
                              $t($v.menu?.trayPh)
                            )
                          ] : null,
                          ($l($v.menu?.picked)).map((c) => [
                            $h("button", { "type": "button", "class": "fl-chip", "data-fl-chip": c?.key, "onClick": c?.clear, "aria-label": `Retirer ${$t(c?.label)}` },
                              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": c?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              ),
                              $t(c?.label),
                              $h("i", null,
                                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              )
                            )
                          ])
                        )
                      ] : null,
                      ($v.menu?.range) ? [
                        $h("div", { "data-fl-in": "", "style": "padding: 10px 10px 4px;", "onKeyDown": $v.menuKeys },
                          $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 12px;" },
                            $h("span", { "style": "font-size: 15px; font-weight: 700; color: var(--ink);" },
                              "Abonnés"
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $h("span", { "data-roll": "" },
                                $t($v.rg?.count)
                              )
                            )
                          ),
                          $h("div", { "style": "margin-top: 14px; display: flex; align-items: flex-end; gap: 10px; height: 112px;" },
                            ($l($v.rg?.bars)).map((h) => [
                              $h("button", { "type": "button", "onClick": h?.pick, "aria-pressed": h?.on, "aria-label": `${$t(h?.label)} : ${$t(h?.n)} comptes`, "style": "flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch; gap: 6px; padding: 0; border: 0; background: transparent; cursor: pointer; font: inherit;" },
                                $h("span", { "style": `text-align: center; font-size: 11px; font-variant-numeric: tabular-nums; color: ${$t(h?.nInk)}; transition: color .3s ease;` },
                                  $h("span", { "data-roll": "" },
                                    $t(h?.n)
                                  )
                                ),
                                $h("i", { "style": `display: block; height: 84px; border-radius: 7px 7px 2px 2px; background: ${$t(h?.bg)}; transform: scaleY(${$t(h?.s)}); transform-origin: bottom; transition: transform .5s cubic-bezier(0.25, 0.1, 0.1, 1), background-color .3s ease;` })
                              )
                            ])
                          ),
                          $h("div", { "style": "display: flex; gap: 10px; margin-top: 7px;" },
                            ($l($v.rg?.bars)).map((h) => [
                              $h("span", { "style": "flex: 1; text-align: center; font-size: 11px; color: var(--ink-faint); white-space: nowrap;" },
                                $t(h?.l)
                              )
                            ])
                          ),
                          $h("div", { "ref": $v.rg?.setTrack, "onPointerDown": $v.rg?.down, "style": "position: relative; height: 28px; margin: 10px 10px 0; touch-action: none; cursor: pointer;" },
                            $h("i", { "aria-hidden": "true", "style": "position: absolute; left: 0; right: 0; top: 13px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.10);" }),
                            $h("i", { "aria-hidden": "true", "style": `position: absolute; left: 0; width: 100%; top: 13px; height: 3px; border-radius: 2px; background: var(--accent); transform-origin: left; transform: translateX(${$t($v.rg?.fx)}) scaleX(${$t($v.rg?.fw)}); transition: transform .4s cubic-bezier(0.25, 0.1, 0.1, 1);` }),
                            $h("span", { "style": `position: absolute; inset: 0; pointer-events: none; transform: translateX(${$t($v.rg?.loP)}); transition: transform .4s cubic-bezier(0.34, 1.3, 0.64, 1);` },
                              $h("button", { "type": "button", "role": "slider", "aria-label": "Abonnés, au moins", "aria-valuemin": "0", "aria-valuemax": "4", "aria-valuenow": $v.rg?.loI, "aria-valuetext": $v.rg?.loTxt, "onKeyDown": $v.rg?.keyLo, "style": "pointer-events: auto; position: absolute; left: -10px; top: 4px; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: grab;" })
                            ),
                            $h("span", { "style": `position: absolute; inset: 0; pointer-events: none; transform: translateX(${$t($v.rg?.hiP)}); transition: transform .4s cubic-bezier(0.34, 1.3, 0.64, 1);` },
                              $h("button", { "type": "button", "role": "slider", "aria-label": "Abonnés, au plus", "aria-valuemin": "0", "aria-valuemax": "4", "aria-valuenow": $v.rg?.hiI, "aria-valuetext": $v.rg?.hiTxt, "onKeyDown": $v.rg?.keyHi, "style": "pointer-events: auto; position: absolute; left: -10px; top: 4px; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: grab;" })
                            )
                          ),
                          $h("div", { "style": "display: flex; align-items: center; gap: 10px; margin-top: 12px;" },
                            $h("label", { "style": "flex: 1; display: flex; align-items: center; height: 40px; padding: 0 12px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                              $h("input", { "type": "text", "inputmode": "numeric", "aria-label": "Au moins, en abonnés", "value": $v.rg?.loTxt, "onInput": $v.rg?.onLo, "placeholder": "0", "style": "width: 100%; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 14px; outline: none;" })
                            ),
                            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                              "à"
                            ),
                            $h("label", { "style": "flex: 1; display: flex; align-items: center; height: 40px; padding: 0 12px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                              $h("input", { "type": "text", "inputmode": "numeric", "aria-label": "Au plus, en abonnés", "value": $v.rg?.hiTxt, "onInput": $v.rg?.onHi, "placeholder": "et plus", "style": "width: 100%; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 14px; outline: none;" })
                            )
                          ),
                          $h("div", { "style": "display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;" },
                            ($l($v.rg?.presets)).map((p) => [
                              $h("button", { "type": "button", "onClick": p?.pick, "aria-pressed": p?.on, "style": `height: 32px; padding: 0 12px; border: 0; border-radius: 999px; background: ${$t(p?.bg)}; box-shadow: inset 0 0 0 1px ${$t(p?.edge)}; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer; transition: background-color .25s ease, box-shadow .25s ease;` },
                                $t(p?.label)
                              )
                            ])
                          )
                        )
                      ] : null,
                      ($v.menu?.head) ? [
                        $h("span", { "class": "fl-head", "data-fl-in": "" },
                          $t($v.menu?.head)
                        )
                      ] : null,
                      ($v.menu?.hasList) ? [
                        $h("div", { "class": "fl-list", "data-fl-list": "" },
                          ($l($v.menu?.items)).map((it) => [
                            $h("button", { "type": "button", "role": "option", "class": "fl-opt", "data-fl-opt": it?.key, "aria-selected": it?.sel, "aria-disabled": it?.dis, "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `opacity: ${$t(it?.o)};` },
                              $h("span", { "class": "fl-mark", "data-shape": it?.shape, "aria-hidden": "true" },
                                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "pathLength": "1", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ),
                              (it?.flag) ? [
                                $h("span", { "class": "sw-flag", "data-c": it?.flag, "aria-hidden": "true" })
                              ] : null,
                              (it?.globe) ? [
                                $h("span", { "class": "fl-glob" },
                                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                    $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                  )
                                )
                              ] : null,
                              (it?.logo) ? [
                                $h("img", { "src": $u(it?.logo), "alt": "", "style": "width: 22px; height: 22px; border-radius: 6px; object-fit: cover; flex-shrink: 0;", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              (it?.ic) ? [
                                $h("span", { "class": "fl-ic" },
                                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                    $h("path", { "d": it?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                  )
                                )
                              ] : null,
                              $h("span", { "class": "fl-lab" },
                                $t(it?.pre),
                                (it?.hit) ? [
                                  $h("mark", null,
                                    $t(it?.hit)
                                  )
                                ] : null,
                                $t(it?.post)
                              ),
                              $h("span", { "class": "fl-n" },
                                $t(it?.n)
                              )
                            )
                          ]),
                          ($v.menu?.empty) ? [
                            $h("span", { "class": "fl-empty" },
                              "Rien ne correspond à « ", $t($v.menu?.q), " »."
                            )
                          ] : null
                        )
                      ] : null,
                      $h("div", { "class": "fl-foot", "data-fl-in": "" },
                        ($v.menu?.clearable) ? [
                          $h("button", { "type": "button", "class": "fl-clear", "data-on": $v.menu?.canClear, "onClick": $v.menu?.clearAll },
                            "Tout effacer"
                          )
                        ] : null,
                        ($v.menu?.note) ? [
                          $h("span", { "class": "fl-note" },
                            $t($v.menu?.note)
                          )
                        ] : null,
                        $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm fl-cta", "type": "button", "onClick": $v.closeMenu },
                          $h("span", null,
                            "Voir ",
                            $h("span", { "class": "fl-count", "data-roll": "" },
                              $t($v.menu?.count)
                            ),
                            " ", $t($v.menu?.unit)
                          ),
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      )
                    )
                  )
                ] : null
              )
            )
          ),
          ($v.views?.on) ? [
            $h("div", { "style": "margin: 12px 32px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint); margin-right: 2px;" },
                "Mes vues"
              ),
              ($l($v.views?.items)).map((w) => [
                $h("span", { "data-view": w?.key, "style": `display: inline-flex; align-items: center; height: 34px; border-radius: 10px; background: ${$t(w?.bg)}; box-shadow: inset 0 0 0 1px ${$t(w?.edge)}; transition: background-color .25s ease, box-shadow .25s ease;` },
                  $h("button", { "type": "button", "onClick": w?.apply, "aria-pressed": w?.on, "style": "display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 4px 0 12px; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(w?.ic)};` },
                      $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t(w?.label)
                  ),
                  $h("button", { "type": "button", "onClick": w?.remove, "aria-label": `Retirer la vue ${$t(w?.label)}`, "title": "Retirer cette vue", "style": "width: 30px; height: 34px; padding: 0; border: 0; background: transparent; color: var(--ink-faint); cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" },
                    $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                    )
                  )
                )
              ]),
              ($v.views?.canSave) ? [
                $h("button", { "type": "button", "onClick": $v.views?.save, "style": "display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 12px; border: 1.5px dashed rgba(255,255,255,0.28); border-radius: 10px; background: transparent; color: var(--ink-soft); font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round" })
                  ),
                  "Enregistrer cette vue"
                )
              ] : null
            )
          ] : null,
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
                  $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "href": $u($v.tableHref), "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 5h16v14H4zM4 10h16M4 15h16M10 10v9", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Tableau"
                  ),
                  $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": $u($v.cardsHref), "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
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
                    $h("th", { "style": "width: 180px;" },
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
                    $h("tr", { "key": c?.key, "data-pv-row": "", "data-key": c?.key, "data-dg": "creator", "data-dg-id": c?.key, "data-dg-label": c?.h, "data-dg-cover": c?.av, "style": `background: ${$t(c?.bg)};` },
                      $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.rank)
                      ),
                      $h("td", null,
                        $h("button", { "type": "button", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}`, "aria-expanded": c?.sel, "style": "display: flex; width: 100%; align-items: center; gap: 12px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; min-width: 0;" },
                          $h("span", { "data-mo-ico": "", "style": "position: relative; flex-shrink: 0; display: inline-flex;" },
                            $h("span", { "style": "position: relative; width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                              (c?.av) ? [
                                $h("img", { "src": $u(c?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
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
                            $h("span", { "data-mo-name": "", "style": "font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
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
                          $h("a", { "href": $u(c?.appHref), "style": "display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;" },
                            $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px;" },
                              (c?.app?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
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
                        (c?.hasDays) ? [
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                            $h("span", { "role": "img", "aria-label": c?.daysAria, "style": "display: flex; gap: 3px;" },
                              ($l(c?.days)).map((d) => [
                                $h("i", { "style": `display: block; width: 10px; height: 18px; border-radius: 3px; background: ${$t(d?.bg)};` })
                              ])
                            ),
                            $h("span", { "style": "display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                              $h("span", { "style": "flex-shrink: 0;" },
                                $t(c?.l2a)
                              ),
                              (c?.cap) ? [
                                $h("span", { "class": "sw-hint", "tabindex": "0", "role": "img", "aria-label": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus.", "data-tip": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus." },
                                  "i"
                                )
                              ] : null,
                              (c?.l2b) ? [
                                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                                  "· ", $t(c?.l2b)
                                )
                              ] : null
                            )
                          )
                        ] : null,
                        (c?.noDays) ? [
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
                            $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
                              $h("span", { "style": `flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                              $t(c?.rythme),
                              (c?.cap) ? [
                                $h("span", { "class": "sw-hint", "tabindex": "0", "role": "img", "aria-label": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus.", "data-tip": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus." },
                                  "i"
                                )
                              ] : null
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(c?.last)
                            )
                          )
                        ] : null
                      ),
                      $h("td", { "style": "padding-right: 20px;" },
                        $h("span", { "style": "display: flex; gap: 6px; justify-content: flex-end;" },
                          ($l(c?.cov)).map((v) => [
                            $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues`, "style": "display: block; width: 44px; height: 58px; aspect-ratio: auto; border-radius: 8px; flex-shrink: 0;" },
                              (v?.src) ? [
                                $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" })
                              ] : null,
                              $h("span", { "class": "sw-video-shade" }),
                              $h("span", { "style": "position: absolute; left: 4px; bottom: 3px; font-size: 10px; font-weight: 700;" },
                                $t(v?.v)
                              )
                            )
                          ])
                        )
                      )
                    )
                  ]),
                  ($v.quiet?.on) ? [
                    $h("tr", { "data-quiet": "" },
                      $h("td", { "colspan": "9", "style": "padding: 0;" },
                        $h("div", { "style": "display: flex; align-items: center; gap: 14px; min-height: 64px; padding: 10px 20px; background: rgba(255,255,255,0.018);" },
                          $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                            $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          ),
                          $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                            $h("span", { "style": "font-size: 14px; font-weight: 600; color: var(--ink);" },
                              $t($v.quiet?.title)
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t($v.quiet?.sub)
                            )
                          ),
                          $h("button", { "class": "sw-btn sw-btn-ghost sw-btn-sm", "type": "button", "onClick": $v.quiet?.toggle, "aria-expanded": $v.quiet?.open, "style": "flex-shrink: 0;" },
                            $t($v.quiet?.cta)
                          )
                        )
                      )
                    )
                  ] : null,
                  ($l($v.qrows)).map((c) => [
                    $h("tr", { "key": c?.key, "data-pv-row": "", "data-key": c?.key, "data-dg": "creator", "data-dg-id": c?.key, "data-dg-label": c?.h, "data-dg-cover": c?.av, "style": `background: ${$t(c?.bg)};` },
                      $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.rank)
                      ),
                      $h("td", null,
                        $h("button", { "type": "button", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}`, "aria-expanded": c?.sel, "style": "display: flex; width: 100%; align-items: center; gap: 12px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; min-width: 0;" },
                          $h("span", { "data-mo-ico": "", "style": "position: relative; flex-shrink: 0; display: inline-flex;" },
                            $h("span", { "style": "position: relative; width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                              (c?.av) ? [
                                $h("img", { "src": $u(c?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
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
                            $h("span", { "data-mo-name": "", "style": "font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
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
                          $h("a", { "href": $u(c?.appHref), "style": "display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;" },
                            $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px;" },
                              (c?.app?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
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
                        (c?.hasDays) ? [
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                            $h("span", { "role": "img", "aria-label": c?.daysAria, "style": "display: flex; gap: 3px;" },
                              ($l(c?.days)).map((d) => [
                                $h("i", { "style": `display: block; width: 10px; height: 18px; border-radius: 3px; background: ${$t(d?.bg)};` })
                              ])
                            ),
                            $h("span", { "style": "display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                              $h("span", { "style": "flex-shrink: 0;" },
                                $t(c?.l2a)
                              ),
                              (c?.cap) ? [
                                $h("span", { "class": "sw-hint", "tabindex": "0", "role": "img", "aria-label": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus.", "data-tip": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus." },
                                  "i"
                                )
                              ] : null,
                              (c?.l2b) ? [
                                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                                  "· ", $t(c?.l2b)
                                )
                              ] : null
                            )
                          )
                        ] : null,
                        (c?.noDays) ? [
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
                            $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap;" },
                              $h("span", { "style": `flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                              $t(c?.rythme),
                              (c?.cap) ? [
                                $h("span", { "class": "sw-hint", "tabindex": "0", "role": "img", "aria-label": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus.", "data-tip": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus." },
                                  "i"
                                )
                              ] : null
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(c?.last)
                            )
                          )
                        ] : null
                      ),
                      $h("td", { "style": "padding-right: 20px;" },
                        $h("span", { "style": "display: flex; gap: 6px; justify-content: flex-end;" },
                          ($l(c?.cov)).map((v) => [
                            $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues`, "style": "display: block; width: 44px; height: 58px; aspect-ratio: auto; border-radius: 8px; flex-shrink: 0;" },
                              (v?.src) ? [
                                $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" })
                              ] : null,
                              $h("span", { "class": "sw-video-shade" }),
                              $h("span", { "style": "position: absolute; left: 4px; bottom: 3px; font-size: 10px; font-weight: 700;" },
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
                    $h("tr", { "style": "background: transparent;" },
                      $h("td", { "colspan": "9", "style": "padding: 36px 20px 40px;" },
                        $h("div", { "style": "position: sticky; left: 20px; width: min(100%, calc(100vw - 192px));" },
                          $h("section", { "class": "sw-void", "aria-labelledby": "crv-t" },
                            $h("span", { "class": "sw-void-kick", "data-tone": "amber" },
                              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M4 6h16M7 12h10M10 18h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              ),
                              "Filtres sans résultat"
                            ),
                            $h("h2", { "id": "crv-t", "class": "sw-void-title" },
                              $t($v.vz?.title)
                            ),
                            $h("div", { "class": "sw-void-chips" },
                              ($l($v.vz?.chips)).map((c) => [
                                $h("span", { "class": "sw-void-chip" },
                                  (c?.flag) ? [
                                    $h("span", { "class": "sw-flag", "data-c": c?.flag, "aria-hidden": "true" })
                                  ] : null,
                                  (c?.ic) ? [
                                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                      $h("path", { "d": c?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                    )
                                  ] : null,
                                  $t(c?.label)
                                )
                              ])
                            ),
                            ($v.vz?.hasRows) ? [
                              $h("span", { "class": "sw-void-label" },
                                "Un filtre de moins :"
                              ),
                              $h("div", { "class": "sw-void-rows" },
                                ($l($v.vz?.rows)).map((r) => [
                                  $h("button", { "type": "button", "class": "sw-void-row", "key": r?.key, "onClick": r?.drop },
                                    $h("span", { "class": "sw-void-txt" },
                                      $h("span", { "class": "sw-void-name" },
                                        $t(r?.label)
                                      ),
                                      $h("span", { "class": "sw-void-sub" },
                                        $t(r?.sub)
                                      )
                                    ),
                                    $h("span", { "class": "sw-void-n" },
                                      $t(r?.n)
                                    ),
                                    $h("span", { "class": "sw-void-unit" },
                                      $t(r?.unit)
                                    )
                                  )
                                ])
                              )
                            ] : null,
                            $h("button", { "class": "sw-void-clear", "type": "button", "onClick": $v.clearAll },
                              "Effacer les filtres"
                            )
                          )
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
          $h("button", { "data-morph-veil": "", "type": "button", "aria-label": "Fermer le profil", "onClick": $v.closePv, "tabindex": "-1", "style": "position: fixed; inset: 0; z-index: 40; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.52); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);" }),
          $h("aside", { "data-morph": "", "role": "dialog", "aria-modal": "true", "aria-label": `Profil de ${$t($v.pv?.h)}`, "onKeyDown": $v.pvKeys, "style": "position: fixed; top: 12px; right: 12px; bottom: 12px; z-index: 41; width: 470px; max-width: calc(100% - 24px); box-sizing: border-box; display: flex; flex-direction: column; border-radius: 24px; background: var(--surface-raised); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09), 0 40px 120px rgba(0,0,0,0.6);" },
            $h("header", { "style": "flex-shrink: 0; padding: clamp(16px, 2.6vh, 24px) 24px clamp(10px, 1.8vh, 16px); display: flex; align-items: flex-start; gap: 14px;" },
              $h("span", { "data-mo-ico": "", "style": "position: relative; flex-shrink: 0; width: 56px; height: 56px; display: inline-flex;" },
                $h("span", { "style": "display: flex; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                  ($v.pv?.av) ? [
                    $h("img", { "src": $u($v.pv?.av), "alt": "", "style": "width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.pv?.noav) ? [
                    $h("span", { "style": "font-size: 20px; font-weight: 700; color: var(--ink-faint);" },
                      $t($v.pv?.ini)
                    )
                  ] : null
                ),
                $h("span", { "class": "sw-flag", "data-c": $v.pv?.mk, "aria-hidden": "true", "style": "position: absolute; right: -2px; bottom: -2px; box-shadow: 0 0 0 2px var(--surface-raised);" })
              ),
              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding-top: 3px;" },
                $h("h2", { "data-mo-name": "", "style": "margin: 0; font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.pv?.h)
                ),
                $h("span", { "data-mo-in": "", "style": "font-size: 13px; line-height: 1.4; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                  $t($v.pv?.bio)
                )
              ),
              $h("span", { "data-mo-in": "", "style": "display: flex; gap: 6px; flex-shrink: 0;" },
                $h("span", { "style": "position: relative; display: inline-flex;" },
                  $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Garder dans un dossier", "style": "width: 40px; height: 40px; background: var(--track);" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($v.aj) ? [
                    $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                      $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                    )
                  ] : null
                ),
                $h("button", { "ref": $v.setPvClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closePv, "aria-label": "Fermer le profil", "style": "width: 40px; height: 40px; background: var(--track);" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("div", { "style": "flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 24px clamp(10px, 1.8vh, 16px); display: flex; flex-direction: column; gap: clamp(8px, 1.3vh, 12px);" },
              $h("div", { "data-mo-in": "", "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
                ($l($v.pv?.stats)).map((k) => [
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px; padding: clamp(10px, 1.6vh, 14px) 16px; border-radius: 16px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(k?.l)
                    ),
                    $h("span", { "data-mo-count": "", "style": "font-family: var(--font-display); font-size: clamp(20px, 3vh, 26px); line-height: 1; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap;" },
                      $t(k?.v)
                    )
                  )
                ])
              ),
              $h("section", { "data-mo-in": "", "aria-label": "Rythme sur 7 jours", "style": "padding: clamp(10px, 1.6vh, 14px) 16px; border-radius: 16px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 10px;" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "Rythme · 7 derniers jours"
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; white-space: nowrap;" },
                    $t($v.pv?.rythme),
                    ($v.pv?.cap) ? [
                      $h("span", { "class": "sw-hint", "tabindex": "0", "role": "img", "aria-label": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus.", "data-tip": "Le Radar lit les 30 dernières vidéos d’un compte : au-delà, on sait seulement qu’il en a publié 30 ou plus." },
                        "i"
                      )
                    ] : null
                  )
                ),
                ($v.pv?.hasDays) ? [
                  $h("div", { "data-mo-grow": "", "style": "margin-top: 10px; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px;" },
                    ($l($v.pv?.days)).map((d) => [
                      $h("span", { "title": d?.t, "style": `display: block; height: clamp(30px, 4.6vh, 44px); border-radius: 8px; background: ${$t(d?.bg)};` })
                    ])
                  )
                ] : null,
                ($v.pv?.wait) ? [
                  $h("p", { "style": "margin: 10px 0 0; font-size: 13px; color: var(--ink-faint);" },
                    "Chargement de ses vidéos…"
                  )
                ] : null
              ),
              ($v.pv?.hasTops) ? [
                $h("section", { "data-mo-in": "", "aria-label": $v.pv?.topsTitle, "style": "display: flex; flex-direction: column; gap: 8px;" },
                  $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink-soft);" },
                    $t($v.pv?.topsTitle)
                  ),
                  $h("div", { "data-mo-pop": "", "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                    ($l($v.pv?.tops)).map((v) => [
                      $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues`, "style": "position: relative; display: block; aspect-ratio: 3 / 4; height: auto; max-height: 22vh; border-radius: 12px; overflow: hidden; background: #0A0C12;" },
                        $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" }),
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
              ] : null,
              ($v.pv?.hasApp) ? [
                $h("section", { "data-mo-in": "", "aria-label": "L’app qu’il pousse", "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink-soft);" },
                    "L’app qu’il pousse"
                  ),
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; min-height: 50px;" },
                    $h("span", { "class": `sw-app-icon ${$t($v.pv?.appBlank)}`, "style": "width: 34px; height: 34px; border-radius: 9px;" },
                      ($v.pv?.appIcon) ? [
                        $h("img", { "class": "sw-logo-img", "src": $u($v.pv?.appIcon), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t($v.pv?.appName)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t($v.pv?.niche)
                      )
                    ),
                    ($v.pv?.appHref) ? [
                      $h("a", { "href": $u($v.pv?.appHref), "style": "font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; white-space: nowrap;" },
                        "Voir l’app"
                      )
                    ] : null
                  )
                )
              ] : null,
              ($v.pv?.hasPeers) ? [
                $h("section", { "data-mo-in": "", "aria-label": $v.pv?.peersTitle, "style": "display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-bottom: 4px;" },
                    $t($v.pv?.peersTitle)
                  ),
                  ($l($v.pv?.peers)).map((o) => [
                    $h("button", { "type": "button", "onClick": o?.open, "aria-label": `Profil de ${$t(o?.h)}`, "style": "display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 0; border: 0; border-top: 1px solid var(--line); background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;" },
                      $h("span", { "style": "width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); font-size: 12px; font-weight: 700; color: var(--ink-faint);" },
                        (o?.av) ? [
                          $h("img", { "src": $u(o?.av), "alt": "", "style": "width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        (o?.noav) ? [
                          $t(o?.ini)
                        ] : null
                      ),
                      $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                          $t(o?.h)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                          $t(o?.sub)
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -0.02em;" },
                        $t(o?.med)
                      )
                    )
                  ])
                )
              ] : null
            ),
            $h("footer", { "data-mo-in": "", "style": "flex-shrink: 0; padding: clamp(10px, 1.7vh, 16px) 24px clamp(12px, 2.6vh, 24px); border-top: 1px solid var(--line); display: flex; align-items: center; gap: 10px;" },
              $h("button", { "class": "sw-pill sw-follow", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn, "style": "height: 48px; gap: 8px; min-width: 140px; justify-content: center;" },
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
              $h("a", { "href": $u($v.pv?.tt), "target": "_blank", "rel": "noopener", "aria-label": "Ouvrir sur TikTok", "title": "Ouvrir sur TikTok", "class": "sw-btn sw-btn-icon", "style": "width: 48px; height: 48px; flex-shrink: 0; background: var(--track); color: var(--ink-muted);" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $u($v.pv?.href), "style": "flex: 1; justify-content: space-between;" },
                "Voir la fiche",
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
