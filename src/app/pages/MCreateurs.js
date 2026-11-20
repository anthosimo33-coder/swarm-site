// Généré par scripts/dc2preact.py depuis design/app/MCreateurs.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MCreateurs extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // Maquette T1 (20/11) : les filtres de CreateursA (niche, app, abonnés en fourchette abmin/abmax, contenu, genre, tri,
  // marché) ; « actifs » n'est plus un filtre (les actifs d'abord, les autres repliés, comme sur ordinateur). « vue »
  // (téléphone seulement) : la liste ou les cartes, basculées sans navigation (T3) ; le défaut est celui de l'adresse
  // de l'écran (/app/createurs : la liste ; /app/createurs/cartes : les cartes).
  filters() { return { market: ['m', 's'], niches: ['niche', 'l'], apps: ['app', 'l'], fans: ['abonnes', 's', 'ALL'], fmin: ['abmin', 's'], fmax: ['abmax', 's'], kinds: ['type', 'l'], gender: ['genre', 's', 'ALL'], sort: ['tri', 's', 'med'], view: ['vue', 's', this.defView()] }; }
  defView() { return 'liste'; }
  view() { const v = this.fv('view'); return v === 'liste' || v === 'cartes' ? v : this.defView(); }
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

  // Clavier ouvert (audit Q72) : sur iPhone, il recouvre le bas de la page sans la réduire ; la feuille à champ de recherche
  // remonte de ce qu'il cache (visualViewport). Chrome Android réduit la page lui-même (interactive-widget) : 0 ici.
  componentDidMount() {
    this._warmT = setTimeout(() => this.setState({ warm: true }), 900);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    this.onVv = () => { const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); if (kb !== ((this.state || {}).kb || 0)) this.setState({ kb }); };
    vv.addEventListener('resize', this.onVv);
    vv.addEventListener('scroll', this.onVv);
  }
  componentWillUnmount() { clearTimeout(this._cutT); clearTimeout(this._warmT); clearTimeout(this._pvT); const vv = typeof window !== 'undefined' ? window.visualViewport : null; if (vv && this.onVv) { vv.removeEventListener('resize', this.onVv); vv.removeEventListener('scroll', this.onVv); } }
  // Une feuille ouverte : le focus va sur elle (Échap la ferme), sans faire défiler la page ni ouvrir le clavier.
  componentDidUpdate(pp, ps) {
    const st = this.state || {}; ps = ps || {};
    if (st.open && st.open !== ps.open && this.sheetEl) this.sheetEl.focus({ preventScroll: true });
    if (st.pv && !ps.pv && this.pvClose) this.pvClose.focus({ preventScroll: true });
    // L'aperçu s'ouvre avec la ligne seule ; sa fiche (« creator:<pseudo> ») n'est demandée qu'une fois la feuille montée
    // (sheet.js : 540 ms) : s'abonner à un document puis redessiner l'aperçu coûtait 30 à 40 ms à ×4 (mesuré), en plein
    // milieu de la montée. Un autre compte ouvert depuis l'aperçu (« D'autres comptes ») est demandé tout de suite.
    if (st.pv && st.pv !== st.pvGo && st.pv !== ps.pv) {
      const h = st.pv;
      const go = () => { if ((this.state || {}).pv === h) this.setState({ pvGo: h }); };
      clearTimeout(this._pvT);
      if (typeof setTimeout === 'function') this._pvT = setTimeout(go, ps.pv ? 0 : 560); else go();
    }
    if (st.cut && st.cut !== ps.cut) this.cutStep();
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
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false })
    };
  }

  // ── Abonnés : une fourchette (maquette D2 sur ordinateur, T2 ici) ──
  // Les crans du curseur : 0, 1 000, 10 000, 100 000, sans limite ; « abonnes » (l'ancienne tranche) est encore lu.
  fansStops() { return [0, 1e3, 1e4, 1e5, Infinity]; }
  fansRange() {
    const digits = (s) => String(s === undefined || s === null ? '' : s).replace(/[^\d]/g, '');
    const num = (s) => (digits(s) === '' ? null : Number(digits(s)));
    const LEG = { s: [0, 1e3], m: [1e3, 1e4], l: [1e4, 1e5], xl: [1e5, Infinity] };
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
  // Glisser une poignée au pouce : la plus proche du doigt suit, cran par cran ; elle ne passe jamais l'autre.
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
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    if (e.preventDefault) e.preventDefault();
  }

  // Liste ↔ cartes (maquette T3) : la bascule flottante change la vue sur place (pas de navigation, la pastille coule,
  // swipe.js fait glisser la liste) ; si la liste est déjà défilée, on revient en haut de la liste.
  pickView(k) {
    if (k === this.view()) return;
    const el = this.listEl;
    if (el && typeof window !== 'undefined') {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
    }
    // Rendu en deux temps (mesuré à ×4 : 30 cartes d'un coup = une image de 300 ms au milieu du balayage) : les premières
    // lignes ou cartes, celles qui se voient, tout de suite ; la suite par paquets une fois la liste entrée (cutStep).
    this.setState({ cut: k === 'cartes' ? 3 : 9 });
    this.setF({ view: k, lim: null, qlim: null });
  }
  cutStep() {
    clearTimeout(this._cutT);
    const st = this.state || {};
    if (!st.cut) return;
    this._cutT = setTimeout(() => {
      const s2 = this.state || {};
      if (!s2.cut) return;
      const next = s2.cut + (this.view() === 'cartes' ? 4 : 10);
      this.setState({ cut: next >= (s2.lim || 30) ? 0 : next });
    }, st.cut === (this.view() === 'cartes' ? 3 : 9) ? 420 : 70); // le premier paquet attend que la liste soit entrée
  }

  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    if (!this.setTrack) {
      this.setTrack = (el) => { this.trackEl = el; }; this.onRangeDown = (e) => this.rangeDown(e);
      this.setSheetEl = (el) => { this.sheetEl = el; }; this.setListEl = (el) => { this.listEl = el; }; this.setPvCloseEl = (el) => { this.pvClose = el; };
      this.setMenuInputEl = (el) => { this.menuInput = el; };
    }
    const open = st.open || '';
    const view = this.view();
    // Les filtres : l'état, sinon l'adresse (F25, plus haut). Un type, un genre ou un tri inconnus sont ignorés.
    const niches = this.fv('niches') || [];
    const apps = this.fv('apps') || [];
    const kinds0 = this.fv('kinds') || [], gender0 = this.fv('gender'), sort0 = this.fv('sort');
    const mq = String(st.mq || '').trim();
    const set = (patch) => this.setF(patch);
    const FR = this.fansRange();
    const lo = FR.lo, hi = FR.hi;
    const okF = (c) => !FR.on || (c.nFans >= lo && c.nFans < hi);
    const okN = (c) => niches.length === 0 || niches.indexOf(c.niche) >= 0;
    const okA = (c) => apps.length === 0 || apps.indexOf(c.appName) >= 0;
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
    const list = all.filter((c) => okN(c) && okA(c) && okF(c) && okK(c) && okG(c, gender));
    const SORTKEY = { med: (c) => c.nMed, fans: (c) => c.nFans, pace: (c) => c.n7 || 0, recent: (c) => c.lastAt || 0 };
    if (sort0 && sort0 !== 'med' && Object.prototype.hasOwnProperty.call(SORTKEY, sort0)) list.sort((x, y) => SORTKEY[sort0](y) - SORTKEY[sort0](x));
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const comptes = (n) => grp(n) + (n > 1 ? ' comptes' : ' compte');
    const fk = (n) => (n >= 1e6 ? String(Math.round(n / 1e5) / 10).replace('.', ',') + ' M' : n >= 1e3 ? String(Math.round(n / 100) / 10).replace('.', ',').replace(/,0$/, '') + ' k' : String(n));
    const fansLabel = !FR.on ? 'Tous' : lo > 0 && hi < Infinity ? fk(lo) + ' à ' + fk(hi) : lo > 0 ? fk(lo) + ' et plus' : 'Moins de ' + fk(hi);
    const fansPhrase = lo > 0 && hi < Infinity ? fk(lo) + ' à ' + fk(hi) + ' abonnés' : lo > 0 ? fk(lo) + ' abonnés et plus' : 'moins de ' + fk(hi) + ' abonnés';
    const partial = !!this._partial;

    // ── La rangée de filtres (maquette T1) : chaque bouton ouvre sa feuille (T2) ──
    const BIC = { kind: 'M4 5h16v14H4zM10 9l5 3-5 3z', gender: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01', app: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', fans: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' };
    const more = (xs) => (xs.length > 1 ? '+' + (xs.length - 1) : false);
    const mkBar = (key, k, v, on, extra) => Object.assign({ key, k, v, t: on ? v : k, d: BIC[key], open: open === key ? 'true' : 'false', more: false, active: on ? 'true' : 'false',
      toggle: () => set({ open: open === key ? '' : key, mq: '' }) }, extra || {});
    const filters = [mkBar('niche', 'Niche', niches.length ? niches[0] : 'Toutes', niches.length > 0, { more: more(niches) }),
      mkBar('app', 'App', apps.length ? apps[0] : 'Toutes', apps.length > 0, { more: more(apps) }),
      mkBar('fans', 'Abonnés', FR.on ? fansLabel : 'Tous', FR.on),
      mkBar('kind', 'Contenu', kinds.length ? kl(kinds[0]) : 'Tous', kinds.length > 0, { more: more(kinds) }),
      mkBar('gender', 'Genre', gl[1], gender !== 'ALL')];
    const mkAll = b.mkt || [];
    const allOn = b.market === 'ALL';
    const mkName = (c) => (c === 'ALL' ? 'Tous' : ((mkAll.filter((m) => m.c === c)[0] || {}).l || c));
    const mkb = { v: mkName(b.market), flag: allOn ? false : b.market, globe: allOn, open: open === 'market' ? 'true' : 'false', toggle: () => set({ open: open === 'market' ? '' : 'market', mq: '' }) };
    const filtered = niches.length > 0 || apps.length > 0 || FR.on || kinds.length > 0 || gender !== 'ALL';

    // ── Les feuilles de choix : recherche sans accents, pastilles en haut, nombres qui tiennent compte des autres filtres ──
    const fold = (t) => Array.from(String(t)).map((c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || c).join('');
    const fq = fold(mq);
    const keepL = (label) => !fq || fold(label).indexOf(fq) >= 0;
    const hit = (label) => { const i = fq ? fold(label).indexOf(fq) : -1; return i < 0 ? { pre: label, hit: false, post: '' } : { pre: label.slice(0, i), hit: label.slice(i, i + fq.length), post: label.slice(i + fq.length) }; };
    const tally = (key) => { const m = {}; all.forEach((c) => { if (c[key]) m[c[key]] = (m[c[key]] || 0) + 1; }); return Object.keys(m).sort((x, y) => m[y] - m[x] || x.localeCompare(y, 'fr')); };
    const flip = (k, xs, v) => () => set({ [k]: xs.indexOf(v) >= 0 ? xs.filter((x) => x !== v) : xs.concat([v]), lim: null, qlim: null });
    const opt = (key, label, n, on, pick, shape, extra) => Object.assign({ key, shape, flag: false, globe: false, logo: false, n: grp(n), sel: on ? 'true' : 'false', o: n === 0 && !on ? 0.45 : 1, pick }, extra || {}, hit(label));
    const see = (list.length === 0 ? 'Aucun compte' : 'Voir ' + comptes(list.length)) + (partial ? '…' : '');
    const kb = Math.max(0, st.kb || 0);
    const base = { on: true, multi: 'false', hasSearch: true, hasList: true, range: false, tray: false, note: false, cta: true, hasQ: !!fq, q: mq, see, hint: '', h: 'auto', picked: [], items: [], empty: false };
    const tall = 'min(620px, calc(78dvh - ' + kb + 'px))';
    const multi = (title, search, ic, xs, key, items, note) => Object.assign({}, base, { multi: 'true', title, search, tray: xs.length > 0, hint: 'Plusieurs choix', h: tall, note,
      picked: xs.map((x) => ({ key: x, label: key === 'kinds' ? kl(x) : x, ic, clear: () => set({ [key]: xs.filter((y) => y !== x), lim: null, qlim: null }) })), empty: items.length === 0, items });
    let menu = { on: false, items: [], picked: [], title: '', search: '', h: 'auto' };
    let rg = { bars: [], presets: [] };
    const logoOf = {};
    all.forEach((c) => { if (c.appName && c.app && c.app.logo && !logoOf[c.appName]) logoOf[c.appName] = c.app.logo; });
    const SORTS = [['med', 'Vues médianes', 'vues médianes'], ['fans', 'Abonnés', 'abonnés'], ['pace', 'Rythme (vidéos en 7 j)', 'rythme'], ['recent', 'Dernière vidéo', 'dernière vidéo']];
    const sortK = SORTS.some((x) => x[0] === sort0) ? sort0 : 'med';
    const sortDef = SORTS.filter((x) => x[0] === sortK)[0];
    if (open === 'market') {
      const sorted = mkAll.slice().sort((p, q) => (q.n || 0) - (p.n || 0));
      const items = [{ c: 'ALL', l: 'Tous les marchés', n: mkAll.reduce((s, m) => s + (m.n || 0), 0) }].concat(sorted).filter((m) => keepL(m.l))
        .map((m) => opt(m.c, m.l, m.n || 0, b.market === m.c, () => set({ market: m.c, open: '', mq: '', lim: null, qlim: null, qOpen: false, pv: null }), 'radio',
          { flag: m.c !== 'ALL' && m.c !== 'XX' ? m.c : false, globe: m.c === 'ALL' }));
      menu = Object.assign({}, base, { title: 'Marché', search: 'Chercher un pays', hint: 'Les plus suivis d’abord', h: tall, cta: false, empty: items.length === 0, items });
    } else if (open === 'niche') {
      const items = tally('niche').filter(keepL).map((nm) => opt(nm, nm, all.filter((c) => c.niche === nm && okA(c) && okF(c) && okK(c) && okG(c, gender)).length, niches.indexOf(nm) >= 0, flip('niches', niches, nm), 'check'));
      menu = multi('Niche', 'Chercher une niche', BIC.niche, niches, 'niches', items, false);
    } else if (open === 'app') {
      const items = tally('appName').filter(keepL).map((nm) => opt(nm, nm, all.filter((c) => c.appName === nm && okN(c) && okF(c) && okK(c) && okG(c, gender)).length, apps.indexOf(nm) >= 0, flip('apps', apps, nm), 'check', logoOf[nm] ? { logo: logoOf[nm] } : {}));
      menu = multi('App', 'Chercher une app', BIC.app, apps, 'apps', items, false);
    } else if (open === 'kind') {
      const items = KL.filter((x) => keepL(x[1])).map((x) => opt(x[0], x[1], all.filter((c) => c.kind === x[0] && okN(c) && okA(c) && okF(c) && okG(c, gender)).length, kinds.indexOf(x[0]) >= 0, flip('kinds', kinds, x[0]), 'check'));
      menu = Object.assign(multi('Type de contenu', 'Chercher un type', BIC.kind, kinds, 'kinds', items, 'Lu sur ses vidéos ; le carrousel vient de TikTok.'), { h: 'auto' });
    } else if (open === 'gender') {
      const items = GL.map((x) => opt(x[0], x[1], all.filter((c) => okN(c) && okA(c) && okF(c) && okK(c) && okG(c, x[0])).length, gender === x[0], () => set({ gender: x[0], lim: null, qlim: null }), 'radio'));
      menu = Object.assign({}, base, { title: 'Genre', hasSearch: false, note: 'Genre apparent de la personne qui se filme ; « sans visage » : personne ne se filme.', items });
    } else if (open === 'sort') {
      const items = SORTS.map((x) => opt(x[0], x[1], 0, sortK === x[0], () => set({ sort: x[0], open: '', lim: null, qlim: null }), 'radio', { o: 1, n: '' }));
      menu = Object.assign({}, base, { title: 'Trier par', hasSearch: false, cta: false, items });
    } else if (open === 'fans') {
      // T2 : les comptes par tranche d'abonnés (les autres filtres comptent), un curseur à deux grosses poignées, trois raccourcis.
      const S = this.fansStops();
      const pool = all.filter((c) => okN(c) && okA(c) && okK(c) && okG(c, gender) && c.nFans >= 0);
      const B = [['Moins de 1 000', 'Moins de 1 k', 0, 1e3], ['1 000 à 10 000', '1 k à 10 k', 1e3, 1e4], ['10 000 à 100 000', '10 k à 100 k', 1e4, 1e5], ['100 000 et plus', '100 k et plus', 1e5, Infinity]];
      const ns = B.map((x) => pool.filter((c) => c.nFans >= x[2] && c.nFans < x[3]).length);
      const mx = Math.max(1, ...ns);
      const inR = (x) => x[2] >= lo && x[3] <= hi;
      const pLo = this.fansPos(lo), pHi = this.fansPos(hi);
      const PRE = [['Petits comptes', 0, 1e4], ['1 k à 100 k', 1e3, 1e5], ['Gros comptes', 1e5, Infinity]];
      const step = (which) => (e) => {
        if (!e || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) < 0) return;
        e.preventDefault();
        const iLo = Math.round(pLo * 4), iHi = Math.round(pHi * 4);
        const dir = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : e.key === 'Home' ? -4 : e.key === 'End' ? 4 : 1;
        if (which === 'lo') this.setFans(S[Math.max(0, Math.min(iHi - 1, iLo + dir))], hi);
        else this.setFans(lo, S[Math.min(4, Math.max(iLo + 1, iHi + dir))]);
      };
      rg = { setTrack: this.setTrack, down: this.onRangeDown,
        bars: B.map((x, i) => ({ label: x[0], l: x[1], n: grp(ns[i]), s: Math.max(0.05, ns[i] / mx).toFixed(3), on: FR.on && inR(x) ? 'true' : 'false',
          bg: inR(x) ? '#3A86F0' : 'rgba(255,255,255,0.12)', nInk: inR(x) ? 'var(--ink)' : 'var(--ink-faint)', pick: () => this.setFans(x[2], x[3]) })),
        fx: (pLo * 100).toFixed(2) + '%', fw: Math.max(0, pHi - pLo).toFixed(4), loP: (pLo * 100).toFixed(2) + '%', hiP: (pHi * 100).toFixed(2) + '%',
        loI: String(Math.round(pLo * 4)), hiI: String(Math.round(pHi * 4)), loTxt: lo > 0 ? grp(lo) + ' abonnés' : 'aucun minimum', hiTxt: hi < Infinity ? grp(hi) + ' abonnés' : 'sans limite',
        keyLo: step('lo'), keyHi: step('hi'),
        presets: PRE.map((p) => { const on = lo === p[1] && hi === p[2]; return { label: p[0], on: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'var(--line)', pick: () => this.setFans(p[1], p[2]) }; }) };
      menu = Object.assign({}, base, { title: 'Abonnés', hasSearch: false, hasList: false, range: true, hint: comptes(list.length) });
    }

    // ── Actifs d'abord (maquette E1) : ceux qui ont publié cette semaine, puis les autres, repliés ──
    const LIM = 30;
    const lim = st.lim || LIM, qlim = st.qlim || LIM, qOpen = !!st.qOpen;
    const pvH = st.pv || null;
    const act = list.filter((c) => c.active), calm = list.filter((c) => !c.active);
    const nAct = !filtered && !partial ? act.length : !filtered && typeof b.active7 === 'number' ? b.active7 : act.length;
    const nCalm = !filtered && typeof b.active7 === 'number' && b.total ? Math.max(0, b.total - b.active7) : calm.length;
    const mkRow = (c) => { const h = String(c.h || '').replace(/^@/, '');
      return Object.assign({}, c, { key: h, ini: h.charAt(0).toUpperCase(), mkOn: allOn && !!c.market, mk: c.market || 'XX', hasCov: !!(c.cov && c.cov.length),
        badge: c.n7 > 0 ? c.n7 + (c.n7 > 1 ? ' vidéos' : ' vidéo') + ' / 7 j' : 'Rien en 7 j',
        open: () => this.setState({ pv: h, open: '', aj: false }) }); };
    const actDone = lim >= act.length && !(partial && !filtered && act.length < nAct);
    const shown = act.slice(0, lim).map(mkRow);
    const qshown = qOpen && actDone ? calm.slice(0, qlim).map(mkRow) : [];
    const quiet = { on: actDone && !b.wait && !b.none && nCalm > 0,
      title: comptes(nCalm) + ' sans vidéo cette semaine', cta: qOpen ? 'Masquer' : 'Afficher', open: qOpen ? 'true' : 'false',
      toggle: () => this.setState({ qOpen: !qOpen, qlim: null }) };
    const restAct = Math.max(0, nAct - lim), restCalm = Math.max(0, nCalm - qlim);

    // ── Écran vide (maquette V3) : ce qui manque en une phrase, puis un filtre de moins, le plus fructueux d'abord ──
    const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
    const DIM = [
      niches.length ? { k: 'niche', l: niches.join(', '), ph: niches.join(' ou '), all: 'toutes niches', ic: BIC.niche, ok: (c) => okA(c) && okF(c) && okK(c) && okG(c, gender), clear: { niches: [] } } : null,
      apps.length ? { k: 'app', l: apps.join(', '), ph: apps.join(' ou '), all: 'toutes apps', ic: BIC.app, ok: (c) => okN(c) && okF(c) && okK(c) && okG(c, gender), clear: { apps: [] } } : null,
      FR.on ? { k: 'fans', l: fansLabel, ph: fansPhrase, all: 'tous abonnés', ic: BIC.fans, ok: (c) => okN(c) && okA(c) && okK(c) && okG(c, gender), clear: { fans: 'ALL', fmin: null, fmax: null } } : null,
      kinds.length ? { k: 'kind', l: kinds.map(kl).join(', '), ph: kinds.map((k) => lc(kl(k))).join(' ou '), all: 'tous contenus', ic: BIC.kind, ok: (c) => okN(c) && okA(c) && okF(c) && okG(c, gender), clear: { kinds: [] } } : null,
      gender !== 'ALL' ? { k: 'gender', l: gl[2], ph: lc(gl[2]), all: 'tous genres', ic: BIC.gender, ok: (c) => okN(c) && okA(c) && okF(c) && okK(c), clear: { gender: 'ALL' } } : null,
    ].filter(Boolean);
    const andJoin = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' et ' + xs[xs.length - 1]);
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const isEmpty = !b.none && !b.wait && list.length === 0 && !partial && DIM.length > 0;
    const outs = isEmpty ? DIM.map((d) => ({ d, n: all.filter(d.ok).length })).filter((x) => x.n > 0).sort((p, q) => q.n - p.n).slice(0, 3)
      .map(({ d, n }) => ({ key: d.k, l: d.l, sub: cap(DIM.filter((x) => x !== d).map((x) => x.ph).concat([d.all]).join(', ')), n: grp(n), unit: n > 1 ? 'comptes' : 'compte',
        pick: () => set(Object.assign({}, d.clear, { lim: null, qlim: null, qOpen: false })) })) : [];
    const empty = { on: isEmpty, title: 'Aucun compte pour ' + andJoin(DIM.map((d) => d.ph)), tags: DIM.map((d) => ({ key: d.k, l: d.l, ic: d.ic })), hasOut: outs.length > 0, outs };

    const pv = this.profileVals(pvH, list, b, all);
    const ajItem = pv.on ? { kind: 'creator', id: pvH, label: '@' + pvH, cover: pv.av || null } : null;
    const VIEWS = [['liste', 'Liste', 'M4 6h16M4 12h16M4 18h16'], ['cartes', 'Cartes', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z']];
    const listeOn = view === 'liste';
    const cut = st.cut || 0;
    const cutOf = (xs) => (cut ? xs.slice(0, cut) : xs);
    // La liste sous une feuille ouverte (voilée) garde le dessin d'avant : cocher une niche ou tirer la poignée ne redessine
    // que la feuille (mesuré à ×4 : 45 ms par choix avec la liste, la pastille et la coche partaient en retard). La liste
    // suit à la fermeture, pendant que la feuille redescend. rows et cards (les valeurs, lues par le banc) restent à jour.
    const L = {
      head: { on: !b.none && !b.wait && !isEmpty, title: 'Actifs cette semaine', sub: b.none || b.wait ? '' : comptes(nAct) + (partial && filtered ? '…' : ''), sortOn: sortK !== 'med' ? 'true' : 'false', sortOpen: open === 'sort' ? 'true' : 'false', sortLabel: sortDef[1] },
      rowsV: listeOn ? cutOf(shown) : st.warm ? shown.slice(0, 9) : [], qrowsV: listeOn && !cut ? qshown : [], cardsV: listeOn ? (st.warm ? shown.slice(0, 3) : []) : cutOf(shown), qcardsV: listeOn || cut ? [] : qshown,
      vL: { on: listeOn ? 'true' : 'false', hid: listeOn ? 'false' : 'true', inert: !listeOn }, vC: { on: listeOn ? 'false' : 'true', hid: listeOn ? 'true' : 'false', inert: listeOn },
      quiet: cut ? Object.assign({}, quiet, { on: false }) : quiet,
      listO: b.stale ? '0.45' : '1', wait: !!b.wait, none: !!b.none, empty,
      hasMore: !cut && !b.none && !b.wait && (!actDone ? restAct > 0 : qOpen && restCalm > 0),
      moreLabel: 'Voir ' + comptes(Math.min(LIM, !actDone ? restAct : restCalm)) + ' de plus'
    };
    const keep = open && open !== 'market' && this._L ? this._L : L;
    if (!open || open === 'market') this._L = L;
    return Object.assign({
      mkb, filters, filtered, menu, rg, kbPx: kb + 'px', setSheetEl: this.setSheetEl, setListEl: this.setListEl, setPvClose: this.setPvCloseEl, setMenuInput: this.setMenuInputEl,
      toggleSort: () => set({ open: open === 'sort' ? '' : 'sort', mq: '' }),
      isListe: listeOn, isCartes: !listeOn, rows: listeOn ? shown : [], qrows: listeOn ? qshown : [], cards: listeOn ? [] : shown, qcards: listeOn ? [] : qshown,
      vtabs: VIEWS.map(([k, l, d]) => ({ k, l, d, on: view === k ? 'true' : 'false', pick: () => this.pickView(k) })),
      noneLabel: 'Aucun compte suivi ' + (this.inMarket(b) || 'pour ce marché') + ' pour l’instant.',
      showMore: () => (!actDone ? this.setState({ lim: lim + LIM }) : this.setState({ qlim: qlim + LIM })),
      closeMenu: () => this.setState({ open: '', mq: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      clearMq: () => { if (this.menuInput) { this.menuInput.value = ''; } this.setState({ mq: '' }); },
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ open: '', mq: '' }); } },
      clearAll: () => set({ niches: [], apps: [], fans: 'ALL', fmin: null, fmax: null, kinds: [], gender: 'ALL', open: '', lim: null, qlim: null, qOpen: false }),
      pv, ajItem, closePv: () => this.setState({ pv: null, aj: false }),
      pvKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ pv: null, aj: false }); } }
    }, keep, { head: Object.assign({}, keep.head, { sortOpen: open === 'sort' ? 'true' : 'false' }) });
  }

  // « en France », « au Mexique », « aux États-Unis » : le marché affiché, d'après son nom.
  inMarket(b) {
    const n = String(((b.mkt || []).filter((m) => m.c === b.shown)[0] || {}).l || '');
    if (!n || b.shown === 'ALL') return '';
    if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'aux ' + n;
    if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'en ' + n;
    return (/e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? 'en ' : 'au ') + n;
  }

  // L'aperçu d'un compte (maquette T2, contenu du panneau D1) : la ligne touchée devient la feuille (sheet.js). La fiche du
  // créateur (document « creator:<pseudo> », lue au toucher) complète sa ligne ; sur le canevas : la ligne seule.
  profileVals(h, list, b, all) {
    if (!h) return { on: false };
    const P = this.props || {};
    const at = '@' + h;
    let row = null;
    for (const c of all || []) if (c.h === at) { row = c; break; }
    row = row || {};
    const asked = ((this.state || {}).pvGo === h);
    const F = typeof P.get === 'function' && asked ? P.get('creator:' + h) : null;
    const D = F || {};
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' k' : String(Math.round(n)));
    const xf = (x) => (x >= 10 ? String(Math.round(x)) : (Math.round(x * 10) / 10).toString().replace('.', ',')) + '×';
    const fans = typeof D.fans === 'number' ? D.fans : row.nFans > 0 ? row.nFans : 0;
    const med = typeof D.median === 'number' ? D.median : row.nMed || 0;
    const p7 = typeof D.posts7d === 'number' ? D.posts7d : typeof row.n7 === 'number' && row.rythme ? row.n7 : null;
    const vids = (D.videos || []).filter((v) => typeof v.views === 'number' && v.publishedAt);
    // Le rythme : days7 de la synchro ; sinon compté sur ses dernières vidéos (fiche), jour de Paris.
    // Le formateur de date (jour de Paris) n'est créé qu'au besoin, une fois : sa création coûtait 13 ms à ×4 à chaque aperçu.
    const pday = (ms) => {
      if (this._dayFmt === undefined) { try { this._dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }); } catch (e) { this._dayFmt = null; } }
      try { return Math.round(Date.parse(this._dayFmt.format(new Date(ms)) + 'T00:00:00Z') / 864e5); } catch (e) { return Math.floor(ms / 864e5); }
    };
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
    const peers = appName ? (all || []).filter((c) => c.appName === appName && c.h !== at).sort((p, q) => (q.nMed || 0) - (p.nMed || 0)).slice(0, 2)
      .map((c) => { const k = String(c.h || '').replace(/^@/, ''); return { h: c.h, av: c.av || '', ini: k.charAt(0).toUpperCase(), med: c.med || '—',
        sub: [c.fansK && c.fansK !== '—' ? c.fansK + ' abonnés' : '', c.rythme || ''].filter(Boolean).join(' · '), open: () => this.setState({ pv: k, aj: false }) }; }) : [];
    const n7 = p7 !== null ? p7 : d7 ? d7.reduce((s, n) => s + n, 0) : null; // le nombre du Radar, comme la ligne
    return { on: true, h: '@' + h, bio: D.bio || row.bio || '', av: D.avatar || row.av || '', ini: h.charAt(0).toUpperCase(), mk: D.market || row.market || '',
      href: '/app/createurs/' + h,
      stats: [{ l: 'Abonnés', v: fans ? grp(fans) : '—' }, { l: 'Vues médianes', v: med ? (med >= 999500 ? nf(med) : med >= 999.5 ? Math.round(med / 1e3) + '\u202fk' : String(Math.round(med))) : '—' }], // comme sa ligne (« 520 k »)
      rythme: n7 === null || n7 === undefined ? '' : n7 > 0 ? n7 + (n7 > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j',
      hasDays: days.length === 7 && d7.some((n) => n > 0), days, wait: (F === undefined || (!asked && typeof P.get === 'function')) && !d7,
      hasTops: (tops.length || rowTops.length) > 0, tops: tops.length ? tops : rowTops,
      hasApp: !!appName, appName, appIcon: app ? app.icon || '' : (row.app && row.app.logo) || '', appBlank: (app ? app.icon : row.app && row.app.logo) ? '' : 'sw-app-blank', appNoIcon: !(app ? app.icon : row.app && row.app.logo),
      appHref: app && app.slug ? (app.page === false ? '' : '/app/apps/' + app.slug) : (row.appHref || ''), niche: app ? app.niche || '' : row.niche || '',
      hasPeers: peers.length > 0, peersTitle: 'D’autres comptes sur ' + appName, peers,
      follow, followOn: followed ? 'true' : 'false', followYes: followed, followNo: !followed, followLabel: followed ? 'Suivi' : 'Suivre' };
  }

  // Les créateurs d'un marché arrivent par pages de 500 (« creators:<marché> », puis « :2 », « :3 »…) : la suite se
  // lit quand la liste affichée s'en approche, et toute la liste dès qu'un filtre porte sur elle, qu'une feuille de
  // filtre est ouverte (ses nombres) ou que les comptes repliés sont dépliés.
  creatorsOf(doc, market, P) {
    const st = this.state || {};
    const pages = doc && doc.pages > 1 ? doc.pages : 1;
    const f = (k) => this.fv(k); // filtres de l'état ou de l'adresse (F25)
    const whole = !!((f('niches') && f('niches').length) || (f('apps') && f('apps').length) || (f('fans') && f('fans') !== 'ALL') || f('fmin') || f('fmax') || st.qOpen || (st.open && st.open !== 'sort' && st.open !== 'market')
      || (f('kinds') && f('kinds').length) || (f('gender') && f('gender') !== 'ALL') || (f('sort') && f('sort') !== 'med'));
    const want = whole ? pages : Math.min(pages, Math.ceil(((st.lim || 30) + 100) / 500));
    const out = [(doc && doc.creators) || []];
    let partial = want < pages;
    for (let i = 2; i <= want; i++) {
      const pg = typeof P.get === 'function' ? P.get('creators:' + ((doc && doc.market) || market) + ':' + i) : null;
      if (pg && pg.creators) out.push(pg.creators); else partial = true;
    }
    this._partial = partial;
    return out; // les pages lues, chacune telle que le document la donne (baseVals garde ses lignes tant qu'elles ne changent pas)
  }

  baseVals() {
    const rows = (globalThis.__dcSample?.["MCreateurs"]?.["rows"] ?? []);
    const mkt = [{"c": "FR", "l": "France"}, {"c": "US", "l": "États-Unis"}, {"c": "MX", "l": "Mexique"}, {"c": "ES", "l": "Espagne"}, {"c": "BR", "l": "Brésil"}];
    const num = (s) => Number(String(s).replace(/\D/g, '')) || 0;
    // L'exemple (France seulement) mis au format des lignes.
    const norm = (c) => { const n7 = Number((String(c.rythme || '').match(/^(\d+)/) || [0, 0])[1]);
      return Object.assign({}, c, { href: '/app/createurs/' + c.h.slice(1), hasApp: true, appLink: true, appPlain: false, appHref: '/app/apps', appLine: c.appName + ' · ' + c.niche, nFans: num(c.fans), nMed: num(c.medN), n7, lastAt: 0,
        hasDays: false, noDays: true, days: [], daysAria: '', rh: c.rythme + (c.last ? ' · ' + c.last.replace(/^Dernière /, '') : ''), market: 'FR',
        cov: (c.cov || []).map((v) => Object.assign({ href: '/app/videos' }, v)) }); };
    let all = rows.map(norm);
    // Sur le site : les vraies données du Radar (document « creators:<marché> », convex/radarModels.ts) ; un autre marché
    // se lit avec get(), et la liste d'avant reste affichée (pâlie) tant qu'il charge. Sur le canevas : l'exemple.
    const P = this.props || {};
    const D = P.data;
    const site = D !== undefined || typeof P.get === 'function';
    const MKD = D && Array.isArray(D.markets) ? D.markets : null;
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const MK = MKD ? MKD.map((m) => m[0]) : mkt.map((m) => m.c);
    let qm = String(this.fv('market') || '').toUpperCase(); // l'état (feuille Marché), sinon l'adresse (?m=US)
    const market = MK.indexOf(qm) >= 0 || qm === 'ALL' ? qm : (D && D.market && D.market !== 'ALL' ? D.market : MK[0] || 'FR');
    let shown = market, total = all.length, none = market !== 'FR', wait = false, active7 = null, stale = false;
    if (none) all = [];
    if (site) {
      let doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      if (doc === undefined && this.lastDoc) { doc = this.lastDoc; stale = true; } else if (doc !== undefined) this.lastDoc = doc;
      wait = doc === undefined;
      none = !wait && !(doc && doc.creators && doc.creators.length);
      shown = doc && doc.market ? doc.market : market;
      total = wait || none ? 0 : (doc.total || doc.creators.length);
      active7 = !wait && !none && typeof doc.active7 === 'number' ? doc.active7 : null;
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
      const isN = (n) => typeof n === 'number' && isFinite(n);
      const grpF = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
      const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
        return hr < 24 ? 'il y a ' + hr + ' h' : d < 60 ? 'il y a ' + d + ' j' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + (d < 548 ? ' an' : ' ans'); };
      // La bio en une ligne : sa première ligne qui contient du texte (pas seulement des émojis).
      const line = (s) => { const ls = String(s || '').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); return ls.filter((x) => /\p{L}/u.test(x))[0] || ls[0] || ''; };
      const DAY = (n) => (n >= 2 ? '#4C9AFF' : n === 1 ? 'rgba(76,154,255,0.55)' : 'rgba(255,255,255,0.08)');
      // Les lignes ne se recalculent que si les pages changent (un document arrive) : ouvrir une feuille, cocher un
      // filtre ou toucher un compte redessine l'écran sans refaire 750 lignes (mesuré : un tiers du rendu à ×4).
      const parts = wait || none ? [] : this.creatorsOf(doc, market, P);
      const M = this._rows;
      const PM = this._pm || (this._pm = new WeakMap()); // page lue -> ses lignes (une page qui arrive ne refait pas les autres)
      const rowOf = (c) => {
        const a = c.app || null;
        const ic = (a && a.icon) || '';
        const on = c.posts7d > 0;
        const d7 = Array.isArray(c.days7) && c.days7.length === 7 ? c.days7 : null;
        const hasDays = !!(d7 && d7.some((n) => n > 0));
        const ry = isN(c.posts7d) ? (on ? c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j') : '';
        const appHref = a && a.slug && a.page !== false ? '/app/apps/' + a.slug : '';
        return {
          h: '@' + c.handle, market: c.market || '', kind: c.kind || '', gender: c.gender || '', href: '/app/createurs/' + c.handle, bio: line(c.bio), av: c.avatar || '',
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, hasApp: !!a, appLink: !!appHref, appPlain: !appHref,
          appName: a ? a.name : '', niche: (a && a.niche) || '', appHref, appLine: a ? a.name + (a.niche ? ' · ' + a.niche : '') : 'Sans app repérée',
          fans: isN(c.fans) ? grpF(c.fans) : '', fansK: isN(c.fans) ? nf(c.fans) : '', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '—', nMed: isN(c.median) ? c.median : 0,
          rythme: ry, n7: isN(c.posts7d) ? c.posts7d : 0, lastAt: c.lastPostAt || 0,
          dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on, days7: d7, hasDays, noDays: !hasDays,
          days: hasDays ? d7.map((n) => ({ bg: DAY(n) })) : [], daysAria: hasDays ? 'Vidéos par jour sur 7 jours : ' + d7.join(', ') : '',
          // Avec le rythme en 7 cases : son nombre de vidéos ; sans (données d'avant days7) : le nombre et la dernière vidéo.
          rh: hasDays ? ry : [ry, c.lastPostAt ? ago(c.lastPostAt) : ''].filter(Boolean).join(' · '),
          cov: (c.best || []).map((v) => ({ src: v.cover || '', v: nf(v.views), href: '/app/videos/' + v.id }))
        };
      };
      if (M && M.parts.length === parts.length && parts.every((x, i) => x === M.parts[i])) all = M.all;
      else {
        all = [].concat(...parts.map((pg) => { let r = PM.get(pg); if (!r) { r = pg.map(rowOf); PM.set(pg, r); } return r; }));
        this._rows = { parts, all };
      }
    }
    return { mkt: MKD ? MKD.map((x) => ({ c: x[0], l: x[1] || MKN(x[0]) || x[0], n: x[2] })) : mkt, all, market, shown, total, none, wait, active7, stale };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "data-pull": "", "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(150px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Créateurs"
            )
          ),
          $h("button", { "data-pull-search": "", "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openPal, "aria-label": "Chercher", "style": "flex-shrink: 0; width: 44px; height: 44px;" },
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
        $h("div", { "class": "mc-bar", "role": "group", "aria-label": "Marché et filtres" },
          $h("button", { "type": "button", "class": "mc-fb", "data-on": "true", "aria-haspopup": "dialog", "aria-expanded": $v.mkb?.open, "onClick": $v.mkb?.toggle, "aria-label": `Marché : ${$t($v.mkb?.v)}` },
            ($v.mkb?.flag) ? [
              $h("span", { "class": "sw-flag", "data-c": $v.mkb?.flag, "aria-hidden": "true" })
            ] : null,
            ($v.mkb?.globe) ? [
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ] : null,
            $t($v.mkb?.v)
          ),
          ($l($v.filters)).map((f) => [
            $h("button", { "type": "button", "class": "mc-fb", "data-on": f?.active, "aria-haspopup": "dialog", "aria-expanded": f?.open, "onClick": f?.toggle, "aria-label": `${$t(f?.k)} : ${$t(f?.v)}` },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": f?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t(f?.t),
              (f?.more) ? [
                $h("span", { "class": "mc-more" },
                  $t(f?.more)
                )
              ] : null
            )
          ]),
          ($v.filtered) ? [
            $h("button", { "type": "button", "class": "mc-fb", "onClick": $v.clearAll },
              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Tout effacer"
            )
          ] : null
        ),
        ($v.head?.on) ? [
          $h("div", { "class": "mc-head" },
            $h("h2", null,
              $t($v.head?.title)
            ),
            $h("span", { "class": "mc-sub" },
              $t($v.head?.sub)
            ),
            $h("button", { "type": "button", "class": "mc-sort", "data-on": $v.head?.sortOn, "aria-haspopup": "dialog", "aria-expanded": $v.head?.sortOpen, "onClick": $v.toggleSort, "aria-label": `Trier : ${$t($v.head?.sortLabel)}` },
              $h("svg", { "width": "19", "height": "19", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ] : null,
        $h("div", { "ref": $v.setListEl, "data-swipe": "", "class": "mc-list" },
          $h("div", { "class": "mc-in", "style": `opacity: ${$t($v.listO)};` },
            $h("div", { "class": "mc-view", "data-on": $v.vL?.on, "aria-hidden": $v.vL?.hid, "inert": $v.vL?.inert },
              ($l($v.rowsV)).map((c) => [
                $h("button", { "key": c?.key, "data-sheet-src": "", "type": "button", "class": "mc-row", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}` },
                  $h("span", { "data-sheet-ico": "", "class": "mc-av" },
                    $h("span", null,
                      (c?.av) ? [
                        $h("img", { "src": $u(c?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      $t(c?.ini)
                    ),
                    (c?.mkOn) ? [
                      $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                    ] : null
                  ),
                  $h("span", { "class": "mc-mid" },
                    $h("span", { "data-sheet-name": "", "class": "mc-h" },
                      $t(c?.h)
                    ),
                    $h("span", { "class": "mc-s" },
                      $t(c?.appLine)
                    ),
                    $h("span", { "class": "mc-rh" },
                      (c?.hasDays) ? [
                        $h("span", { "class": "mc-strip", "role": "img", "aria-label": c?.daysAria },
                          ($l(c?.days)).map((d) => [
                            $h("i", { "style": `background: ${$t(d?.bg)};` })
                          ])
                        )
                      ] : null,
                      (c?.noDays) ? [
                        $h("span", { "class": "mc-dot", "style": `background: ${$t(c?.dot)};` })
                      ] : null,
                      $h("span", null,
                        $t(c?.rh)
                      )
                    )
                  ),
                  $h("span", { "class": "mc-num" },
                    $h("b", null,
                      $t(c?.med)
                    ),
                    $h("span", null,
                      "vues méd."
                    )
                  )
                )
              ]),
              ($v.quiet?.on) ? [
                $h("div", { "class": "mc-quiet" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", null,
                    $t($v.quiet?.title)
                  ),
                  $h("button", { "type": "button", "class": "mc-chipbtn", "onClick": $v.quiet?.toggle, "aria-expanded": $v.quiet?.open },
                    $t($v.quiet?.cta)
                  )
                )
              ] : null,
              ($l($v.qrowsV)).map((c) => [
                $h("button", { "key": c?.key, "data-sheet-src": "", "type": "button", "class": "mc-row", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}` },
                  $h("span", { "data-sheet-ico": "", "class": "mc-av" },
                    $h("span", null,
                      (c?.av) ? [
                        $h("img", { "src": $u(c?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      $t(c?.ini)
                    ),
                    (c?.mkOn) ? [
                      $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                    ] : null
                  ),
                  $h("span", { "class": "mc-mid" },
                    $h("span", { "data-sheet-name": "", "class": "mc-h" },
                      $t(c?.h)
                    ),
                    $h("span", { "class": "mc-s" },
                      $t(c?.appLine)
                    ),
                    $h("span", { "class": "mc-rh" },
                      (c?.hasDays) ? [
                        $h("span", { "class": "mc-strip", "role": "img", "aria-label": c?.daysAria },
                          ($l(c?.days)).map((d) => [
                            $h("i", { "style": `background: ${$t(d?.bg)};` })
                          ])
                        )
                      ] : null,
                      (c?.noDays) ? [
                        $h("span", { "class": "mc-dot", "style": `background: ${$t(c?.dot)};` })
                      ] : null,
                      $h("span", null,
                        $t(c?.rh)
                      )
                    )
                  ),
                  $h("span", { "class": "mc-num" },
                    $h("b", null,
                      $t(c?.med)
                    ),
                    $h("span", null,
                      "vues méd."
                    )
                  )
                )
              ])
            ),
            $h("div", { "class": "mc-view", "data-on": $v.vC?.on, "aria-hidden": $v.vC?.hid, "inert": $v.vC?.inert, "style": "padding-top: 6px;" },
              ($l($v.cardsV)).map((c) => [
                $h("article", { "key": c?.key, "class": "sw-card mc-card" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 10px; min-width: 0;" },
                    $h("button", { "data-sheet-src": "", "type": "button", "class": "mc-who", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}` },
                      $h("span", { "data-sheet-ico": "", "class": "mc-av" },
                        $h("span", null,
                          (c?.av) ? [
                            $h("img", { "src": $u(c?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          $t(c?.ini)
                        ),
                        (c?.mkOn) ? [
                          $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                        ] : null
                      ),
                      $h("span", { "class": "mc-mid", "style": "gap: 3px;" },
                        $h("span", { "data-sheet-name": "", "class": "mc-h" },
                          $t(c?.h)
                        ),
                        $h("span", { "class": "mc-s", "style": "font-size: 12.5px;" },
                          $t(c?.bio)
                        )
                      )
                    ),
                    $h("span", { "class": "mc-pill" },
                      $h("span", { "class": "mc-dot", "style": `background: ${$t(c?.dot)};` }),
                      $t(c?.badge)
                    )
                  ),
                  (c?.hasCov) ? [
                    $h("div", { "class": "mc-covs" },
                      ($l(c?.cov)).map((v) => [
                        $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues` },
                          (v?.src) ? [
                            $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" })
                          ] : null,
                          $h("span", { "class": "sw-video-shade" }),
                          $h("b", null,
                            $t(v?.v)
                          )
                        )
                      ])
                    )
                  ] : null,
                  $h("div", { "class": "mc-foot" },
                    (c?.appLink) ? [
                      $h("a", { "class": "mc-app", "href": $u(c?.appHref) },
                        $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 26px; height: 26px; border-radius: 7px;" },
                          (c?.app?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.app?.nologo) ? [
                            $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", null,
                          $t(c?.appLine)
                        )
                      )
                    ] : null,
                    (c?.appPlain) ? [
                      $h("span", { "class": "mc-app" },
                        $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 26px; height: 26px; border-radius: 7px;" },
                          (c?.app?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.app?.nologo) ? [
                            $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", null,
                          $t(c?.appLine)
                        )
                      )
                    ] : null,
                    $h("span", { "class": "mc-num" },
                      $h("b", null,
                        $t(c?.med)
                      ),
                      $h("span", null,
                        "vues médianes"
                      )
                    )
                  )
                )
              ]),
              ($v.quiet?.on) ? [
                $h("div", { "class": "mc-quiet", "style": "margin: 12px 0;" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", null,
                    $t($v.quiet?.title)
                  ),
                  $h("button", { "type": "button", "class": "mc-chipbtn", "onClick": $v.quiet?.toggle, "aria-expanded": $v.quiet?.open },
                    $t($v.quiet?.cta)
                  )
                )
              ] : null,
              ($l($v.qcardsV)).map((c) => [
                $h("article", { "key": c?.key, "class": "sw-card mc-card" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 10px; min-width: 0;" },
                    $h("button", { "data-sheet-src": "", "type": "button", "class": "mc-who", "onClick": c?.open, "aria-label": `Aperçu de ${$t(c?.h)}` },
                      $h("span", { "data-sheet-ico": "", "class": "mc-av" },
                        $h("span", null,
                          (c?.av) ? [
                            $h("img", { "src": $u(c?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          $t(c?.ini)
                        ),
                        (c?.mkOn) ? [
                          $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                        ] : null
                      ),
                      $h("span", { "class": "mc-mid", "style": "gap: 3px;" },
                        $h("span", { "data-sheet-name": "", "class": "mc-h" },
                          $t(c?.h)
                        ),
                        $h("span", { "class": "mc-s", "style": "font-size: 12.5px;" },
                          $t(c?.bio)
                        )
                      )
                    ),
                    $h("span", { "class": "mc-pill" },
                      $h("span", { "class": "mc-dot", "style": `background: ${$t(c?.dot)};` }),
                      $t(c?.badge)
                    )
                  ),
                  (c?.hasCov) ? [
                    $h("div", { "class": "mc-covs" },
                      ($l(c?.cov)).map((v) => [
                        $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues` },
                          (v?.src) ? [
                            $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" })
                          ] : null,
                          $h("span", { "class": "sw-video-shade" }),
                          $h("b", null,
                            $t(v?.v)
                          )
                        )
                      ])
                    )
                  ] : null,
                  $h("div", { "class": "mc-foot" },
                    (c?.appLink) ? [
                      $h("a", { "class": "mc-app", "href": $u(c?.appHref) },
                        $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 26px; height: 26px; border-radius: 7px;" },
                          (c?.app?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.app?.nologo) ? [
                            $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", null,
                          $t(c?.appLine)
                        )
                      )
                    ] : null,
                    (c?.appPlain) ? [
                      $h("span", { "class": "mc-app" },
                        $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 26px; height: 26px; border-radius: 7px;" },
                          (c?.app?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(c?.app?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.app?.nologo) ? [
                            $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", null,
                          $t(c?.appLine)
                        )
                      )
                    ] : null,
                    $h("span", { "class": "mc-num" },
                      $h("b", null,
                        $t(c?.med)
                      ),
                      $h("span", null,
                        "vues médianes"
                      )
                    )
                  )
                )
              ])
            ),
            ($v.wait) ? [
              $h("p", { "class": "mc-wait" },
                "Chargement des comptes…"
              )
            ] : null,
            ($v.none) ? [
              $h("div", { "class": "mc-v3" },
                $h("span", { "class": "mc-kick", "style": "color: var(--ink-faint);" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Marché"
                ),
                $h("p", { "class": "mc-v3-t" },
                  $t($v.noneLabel)
                ),
                $h("div", null,
                  $h("button", { "type": "button", "class": "sw-pill", "onClick": $v.mkb?.toggle, "style": "height: 44px;" },
                    "Changer de marché"
                  )
                )
              )
            ] : null,
            ($v.empty?.on) ? [
              $h("div", { "class": "mc-v3" },
                $h("span", { "class": "mc-kick" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 6h16M7 12h10M10 18h4", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Filtres sans résultat"
                ),
                $h("p", { "class": "mc-v3-t" },
                  $t($v.empty?.title)
                ),
                $h("div", { "class": "mc-tags" },
                  ($l($v.empty?.tags)).map((t) => [
                    $h("span", { "class": "mc-tag" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                        $h("path", { "d": t?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(t?.l)
                    )
                  ])
                ),
                ($v.empty?.hasOut) ? [
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    "Un filtre de moins :"
                  ),
                  ($l($v.empty?.outs)).map((o) => [
                    $h("button", { "type": "button", "class": "mc-out", "onClick": o?.pick },
                      $h("span", null,
                        $h("b", null,
                          "Retirer « ", $t(o?.l), " »"
                        ),
                        $h("span", null,
                          $t(o?.sub)
                        )
                      ),
                      $h("b", null,
                        $t(o?.n)
                      ),
                      $h("span", null,
                        $t(o?.unit)
                      )
                    )
                  ])
                ] : null,
                $h("div", null,
                  $h("button", { "type": "button", "class": "sw-pill", "onClick": $v.clearAll, "style": "height: 44px;" },
                    "Effacer les filtres"
                  )
                )
              )
            ] : null,
            ($v.hasMore) ? [
              $h("div", { "style": "display: flex; justify-content: center; padding-top: 6px;" },
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
        $h("div", { "class": "mc-float" },
          $h("div", { "data-swipe-skip": "" },
            $h("div", { "class": "m-tc is-flat", "role": "tablist", "aria-label": "Affichage", "data-swipe-tabs": "" },
              ($l($v.vtabs)).map((t) => [
                $h("button", { "class": "sw-tab", "role": "tab", "type": "button", "aria-selected": t?.on, "onClick": t?.pick },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.l)
                )
              ])
            )
          )
        ),
        $h("nav", { "data-tabbar": "", "aria-label": "Navigation principale", "style": "position: fixed; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); z-index: 30; height: 64px; padding: 0 6px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: center; border-radius: 32px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.55);" },
          $h("a", { "href": "/app", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Créateurs"
          ),
          $h("a", { "href": "/app/dossiers", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Dossiers"
          )
        ),
        ($v.menu?.on) ? [
          $h("button", { "data-sheet-veil": "", "class": "mc-veil", "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeMenu }),
          $h("section", { "data-sheet": "", "ref": $v.setSheetEl, "tabindex": "-1", "class": "mc-sheet", "role": "dialog", "aria-modal": "true", "aria-label": $v.menu?.title, "onKeyDown": $v.menuKeys, "style": `bottom: ${$t($v.kbPx)}; height: ${$t($v.menu?.h)}; max-height: 88vh; max-height: calc(88dvh - ${$t($v.kbPx)});` },
            $h("div", { "data-sheet-handle": "", "class": "mc-handle" },
              $h("span", { "aria-hidden": "true" })
            ),
            $h("div", { "class": "mc-sh-head" },
              $h("span", null,
                $t($v.menu?.title)
              ),
              $h("span", null,
                $h("span", { "data-roll": "" },
                  $t($v.menu?.hint)
                )
              )
            ),
            ($v.menu?.hasSearch) ? [
              $h("label", { "class": "fl-search" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("input", { "ref": $v.setMenuInput, "type": "search", "enterkeyhint": "search", "onInput": $v.onMq, "aria-label": $v.menu?.search, "placeholder": $v.menu?.search }),
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
              $h("div", { "class": "mc-tray" },
                ($l($v.menu?.picked)).map((c) => [
                  $h("button", { "type": "button", "class": "fl-chip", "onClick": c?.clear, "aria-label": `Retirer ${$t(c?.label)}` },
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
              $h("div", { "data-sheet-nodrag": "", "style": "flex-shrink: 0; padding-top: 6px;" },
                $h("div", { "class": "mc-rg-bars" },
                  ($l($v.rg?.bars)).map((h) => [
                    $h("button", { "type": "button", "onClick": h?.pick, "aria-pressed": h?.on, "aria-label": `${$t(h?.label)} : ${$t(h?.n)} comptes` },
                      $h("span", { "style": `color: ${$t(h?.nInk)};` },
                        $h("span", { "data-roll": "" },
                          $t(h?.n)
                        )
                      ),
                      $h("i", { "style": `background: ${$t(h?.bg)}; transform: scaleY(${$t(h?.s)});` })
                    )
                  ])
                ),
                $h("div", { "class": "mc-rg-lab" },
                  ($l($v.rg?.bars)).map((h) => [
                    $h("span", null,
                      $t(h?.l)
                    )
                  ])
                ),
                $h("div", { "ref": $v.rg?.setTrack, "class": "mc-rg-track", "onPointerDown": $v.rg?.down },
                  $h("i", { "aria-hidden": "true", "style": "background: rgba(255,255,255,0.10);" }),
                  $h("i", { "aria-hidden": "true", "style": `width: 100%; background: var(--accent); transform-origin: left; transform: translateX(${$t($v.rg?.fx)}) scaleX(${$t($v.rg?.fw)}); transition: transform .4s cubic-bezier(0.25, 0.1, 0.1, 1);` }),
                  $h("span", { "style": `transform: translateX(${$t($v.rg?.loP)});` },
                    $h("button", { "type": "button", "role": "slider", "aria-label": "Abonnés, au moins", "aria-valuemin": "0", "aria-valuemax": "4", "aria-valuenow": $v.rg?.loI, "aria-valuetext": $v.rg?.loTxt, "onKeyDown": $v.rg?.keyLo })
                  ),
                  $h("span", { "style": `transform: translateX(${$t($v.rg?.hiP)});` },
                    $h("button", { "type": "button", "role": "slider", "aria-label": "Abonnés, au plus", "aria-valuemin": "0", "aria-valuemax": "4", "aria-valuenow": $v.rg?.hiI, "aria-valuetext": $v.rg?.hiTxt, "onKeyDown": $v.rg?.keyHi })
                  )
                ),
                $h("div", { "class": "mc-presets" },
                  ($l($v.rg?.presets)).map((p) => [
                    $h("button", { "type": "button", "onClick": p?.pick, "aria-pressed": p?.on, "style": `background: ${$t(p?.bg)}; box-shadow: inset 0 0 0 1px ${$t(p?.edge)};` },
                      $t(p?.label)
                    )
                  ])
                )
              )
            ] : null,
            ($v.menu?.hasList) ? [
              $h("div", { "class": "mc-opts", "data-sheet-opts": "", "role": "listbox", "aria-label": $v.menu?.title, "aria-multiselectable": $v.menu?.multi },
                ($l($v.menu?.items)).map((it) => [
                  $h("button", { "key": it?.key, "data-sheet-opt": "", "type": "button", "role": "option", "class": "mc-opt", "aria-selected": it?.sel, "onClick": it?.pick, "style": `opacity: ${$t(it?.o)};` },
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
                      $h("img", { "src": $u(it?.logo), "alt": "", "style": "width: 24px; height: 24px; border-radius: 7px; object-fit: cover; flex-shrink: 0;", "loading": "lazy", "decoding": "async" })
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
            $h("div", { "class": "mc-sh-foot" },
              ($v.menu?.note) ? [
                $h("p", { "class": "mc-note" },
                  $t($v.menu?.note)
                )
              ] : null,
              ($v.menu?.cta) ? [
                $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg mc-cta", "type": "button", "onClick": $v.closeMenu },
                  $h("span", null,
                    $t($v.menu?.see)
                  ),
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ] : null
            )
          )
        ] : null,
        ($v.pv?.on) ? [
          $h("button", { "data-sheet-veil": "", "class": "mc-veil", "type": "button", "aria-label": "Fermer le profil", "tabindex": "-1", "onClick": $v.closePv }),
          $h("section", { "data-sheet": "", "class": "mc-sheet", "role": "dialog", "aria-modal": "true", "aria-label": `Profil de ${$t($v.pv?.h)}`, "onKeyDown": $v.pvKeys, "style": "bottom: 0; max-height: 96vh; max-height: 96dvh;" },
            $h("div", { "data-sheet-handle": "", "class": "mc-handle" },
              $h("span", { "aria-hidden": "true" })
            ),
            $h("div", { "class": "mc-pv-top" },
              $h("span", { "data-sheet-ico": "", "class": "mc-av" },
                $h("span", null,
                  ($v.pv?.av) ? [
                    $h("img", { "src": $u($v.pv?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  $t($v.pv?.ini)
                ),
                ($v.pv?.mk) ? [
                  $h("span", { "class": "sw-flag", "data-c": $v.pv?.mk, "aria-hidden": "true", "style": "box-shadow: 0 0 0 2px var(--surface-raised);" })
                ] : null
              ),
              $h("span", { "style": "flex: 1; min-width: 0;" },
                $h("h2", { "data-sheet-name": "" },
                  $t($v.pv?.h)
                ),
                ($v.pv?.bio) ? [
                  $h("p", null,
                    $t($v.pv?.bio)
                  )
                ] : null
              ),
              $h("button", { "type": "button", "class": "mc-ibtn", "onClick": $v.openAj, "aria-haspopup": "dialog", "aria-label": "Garder dans un dossier" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "ref": $v.setPvClose, "type": "button", "class": "mc-ibtn", "onClick": $v.closePv, "aria-label": "Fermer le profil", "style": "margin-right: -4px; background: transparent; box-shadow: none;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "class": "mc-pv-body" },
              $h("div", { "data-sheet-in": "", "class": "mc-stats" },
                ($l($v.pv?.stats)).map((k) => [
                  $h("span", { "class": "mc-box" },
                    $h("span", { "class": "mc-k" },
                      $t(k?.l)
                    ),
                    $h("span", { "class": "mc-v" },
                      $t(k?.v)
                    )
                  )
                ])
              ),
              $h("section", { "data-sheet-in": "", "class": "mc-box", "aria-label": "Rythme sur 7 jours" },
                $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 10px;" },
                  $h("span", { "class": "mc-k" },
                    "Rythme · 7 jours"
                  ),
                  $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap;" },
                    $t($v.pv?.rythme)
                  )
                ),
                ($v.pv?.hasDays) ? [
                  $h("div", { "class": "mc-days" },
                    ($l($v.pv?.days)).map((d) => [
                      $h("span", { "title": d?.t, "style": `background: ${$t(d?.bg)};` })
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
                $h("section", { "data-sheet-in": "", "aria-label": "Ses meilleures vidéos", "style": "display: flex; flex-direction: column; gap: 8px;" },
                  $h("span", { "class": "mc-t" },
                    "Ses meilleures vidéos"
                  ),
                  $h("div", { "class": "mc-tops" },
                    ($l($v.pv?.tops)).map((v) => [
                      $h("a", { "href": $u(v?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(v?.v)} vues` },
                        $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy" }),
                        $h("span", { "class": "sw-video-shade" }),
                        (v?.x) ? [
                          $h("em", { "style": `background: ${$t(v?.xBg)};` },
                            $t(v?.x)
                          )
                        ] : null,
                        $h("b", null,
                          $t(v?.v)
                        )
                      )
                    ])
                  )
                )
              ] : null,
              ($v.pv?.hasApp) ? [
                $h("section", { "data-sheet-in": "", "aria-label": "L’app qu’il pousse", "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "class": "mc-t" },
                    "L’app qu’il pousse"
                  ),
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; min-height: 50px;" },
                    $h("span", { "class": `sw-app-icon ${$t($v.pv?.appBlank)}`, "style": "width: 36px; height: 36px; border-radius: 10px;" },
                      ($v.pv?.appIcon) ? [
                        $h("img", { "class": "sw-logo-img", "src": $u($v.pv?.appIcon), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      ($v.pv?.appNoIcon) ? [
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t($v.pv?.appName)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t($v.pv?.niche)
                      )
                    ),
                    ($v.pv?.appHref) ? [
                      $h("a", { "href": $u($v.pv?.appHref), "style": "min-height: 44px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; white-space: nowrap;" },
                        "Voir l’app"
                      )
                    ] : null
                  )
                )
              ] : null,
              ($v.pv?.hasPeers) ? [
                $h("section", { "data-sheet-in": "", "aria-label": $v.pv?.peersTitle, "style": "display: flex; flex-direction: column;" },
                  $h("span", { "class": "mc-t", "style": "margin-bottom: 4px;" },
                    $t($v.pv?.peersTitle)
                  ),
                  ($l($v.pv?.peers)).map((o) => [
                    $h("button", { "type": "button", "class": "mc-peer", "onClick": o?.open, "aria-label": `Profil de ${$t(o?.h)}` },
                      $h("span", { "class": "mc-av" },
                        $h("span", null,
                          (o?.av) ? [
                            $h("img", { "src": $u(o?.av), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          $t(o?.ini)
                        )
                      ),
                      $h("span", { "class": "mc-mid", "style": "gap: 2px;" },
                        $h("span", { "class": "mc-h", "style": "font-size: 14px;" },
                          $t(o?.h)
                        ),
                        $h("span", { "class": "mc-s", "style": "font-size: 12px;" },
                          $t(o?.sub)
                        )
                      ),
                      $h("span", { "class": "mc-num" },
                        $h("b", { "style": "font-size: 16px;" },
                          $t(o?.med)
                        )
                      )
                    )
                  ])
                )
              ] : null
            ),
            $h("div", { "data-sheet-in": "", "class": "mc-pv-foot" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn },
                ($v.pv?.followYes) ? [
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null,
                ($v.pv?.followNo) ? [
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                  )
                ] : null,
                $t($v.pv?.followLabel)
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $u($v.pv?.href) },
                "Voir la fiche",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        ] : null,
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
