// Généré par scripts/dc2preact.py depuis design/app/MFormats.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFormats extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // Mêmes noms que FormatsB ; le tri (« tri ») est propre à l'ordinateur : le téléphone le laisse dans l'adresse.
  filters() { return { niche: ['niche', 's', 'Toutes'], type: ['type', 's', 'Tout'], market: ['m', 's', 'ALL'] }; }
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
    // Rendu progressif (comme FormatsB et les lignes d'Apps), par petits paquets : au téléphone, ralenti ×4, 30 cartes
    // d'un coup faisaient une image de 100 à 200 ms (mesuré) à chaque changement de type ou de filtre. 4 cartes d'abord
    // (avec la une, plus que l'écran), puis 4 de plus à chaque image tant que le bas est à moins de 1 200 px (une carte hors de l'écran
    // n'est mise en page qu'en approchant : content-visibility, plus haut).
    this.moreIo = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) this.setState({ limit: ((this.state || {}).limit || 4) + 4 });
    }, { rootMargin: '1200px 0px' }) : null;
    if (this.moreEl && this.moreIo) this.moreIo.observe(this.moreEl);
  }
  componentWillUnmount() { if (this.moreIo) this.moreIo.disconnect(); clearTimeout(this.focusT); }
  componentDidUpdate(pp, ps) {
    const st = this.state || {};
    ps = ps || {};
    // Une feuille ouverte : le focus sur son bouton Fermer (Échap la ferme), sans faire défiler, une fois la feuille
    // montée (focus() force le calcul de la page : pas pendant qu'elle monte).
    if (st.sh && st.sh !== ps.sh) { clearTimeout(this.focusT); this.focusT = setTimeout(() => { if (this.shClose && (this.state || {}).sh) this.shClose.focus({ preventScroll: true }); }, 560); }
    // Encore dans l'écran après un ajout de cartes : on la réobserve pour en demander d'autres.
    if (st.limit !== ps.limit && this.moreEl && this.moreIo) { this.moreIo.unobserve(this.moreEl); this.moreIo.observe(this.moreEl); }
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
    if (!this.setMore) this.setMore = (el) => { if (this.moreEl && this.moreIo) this.moreIo.unobserve(this.moreEl); this.moreEl = el; if (el && this.moreIo) this.moreIo.observe(el); };
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false }),
      setMore: this.setMore, setShClose: (el) => { this.shClose = el; }
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const all = b.all, MKS = b.MKS, NIS = b.NIS, NIC = b.NIC;
    // Les filtres : l'état, sinon l'adresse (F25, plus haut). Une niche, un type ou un marché inconnus sont ignorés.
    const niche0 = this.fv('niche'), type0 = this.fv('type'), market0 = this.fv('market');
    const niche = NIS.indexOf(niche0) >= 0 ? niche0 : 'Toutes';
    const type = ['Accroches', 'Sons'].indexOf(type0) >= 0 ? type0 : 'Tout';
    const market = MKS.some((m) => m[0] === market0) ? market0 : 'ALL';
    // Sans toLocaleString : chaque appel construit un formateur Intl (45 options à chaque rendu, mesuré).
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // « 1 500 », comme fr-FR
    const count = (n) => grp(n) + (n > 1 ? ' formats' : ' format');
    const okN = (c, nm) => nm === 'Toutes' || c.niche === nm;
    const okT = (c, t) => t === 'Tout' || (t === 'Accroches' ? c.kind === 'hook' : c.kind === 'sound');
    const okM = (c, m) => m === 'ALL' || c.market === m;
    const n3 = (t, nm, m) => all.filter((c) => okN(c, nm) && okT(c, t) && okM(c, m)).length;
    // Un choix repart des premières cartes ; la feuille reste ouverte (son bouton montre ce qu'on verra).
    const set = (patch) => this.setF(Object.assign({ limit: null }, patch));
    // L'ordre de l'ordinateur par défaut : par comptes qui le reprennent, puis × la normale (l'ordre du document).
    const list = all.filter((c) => okN(c, niche) && okT(c, type) && okM(c, market)).sort((p, q) => q.accounts - p.accounts || q.medX - p.medX);
    // À la une : le premier de la liste filtrée ; dessous, tous les suivants, dessinés par paquets (componentDidMount).
    const hero = list[0] || null;
    const rest = list.slice(1);
    const limit = st.limit || 4;
    const cards = rest.slice(0, limit);
    const mName = (c) => (MKS.filter((m) => m[0] === c)[0] || ['ALL', 'Tous les marchés'])[1];

    // ── Niche et Marché en feuilles du bas (maquette T2), une option suivie au doigt ──
    const sh = st.sh || '';
    const fold = (t) => Array.from(String(t)).map((c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || c).join('');
    const q = sh ? String(st.q || '').trim() : '';
    const fq = fold(q);
    const keep = (label) => !fq || fold(label).indexOf(fq) >= 0;
    const hit = (label) => { const i = fq ? fold(label).indexOf(fq) : -1; return i < 0 ? { pre: label, hit: false, post: '' } : { pre: label.slice(0, i), hit: label.slice(i, i + fq.length), post: label.slice(i + fq.length) }; };
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500 });
    const opt = (label, n, on, extra, pick) => Object.assign({ label, flag: false, ic: false, n: count(n), sel: on ? 'true' : 'false', o: n === 0 && !on ? 0.45 : 1, pick }, radio(on), extra, hit(label));
    // Les nombres tiennent compte des autres filtres (comme les fenêtres de l'ordinateur), comptés en un passage. Les
    // marchés : ceux où le Radar a des formats (le document en liste plus de 130, presque tous vides), et le choisi.
    const mN = { ALL: 0 }, nN = { Toutes: 0 };
    all.forEach((c) => {
      if (okN(c, niche) && okT(c, type)) { mN[c.market] = (mN[c.market] || 0) + 1; mN.ALL++; }
      if (okT(c, type) && okM(c, market)) { nN[c.niche] = (nN[c.niche] || 0) + 1; nN.Toutes++; }
    });
    const mItems = MKS.filter((m) => (m[0] === 'ALL' || b.MHAS[m[0]] || m[0] === market) && (sh !== 'marche' || keep(m[1]))).map((m) => opt(m[1], mN[m[0]] || 0, market === m[0],
      { flag: m[0] === 'ALL' ? false : m[0], ic: m[0] === 'ALL' ? b.GLOBE : false }, () => set({ market: m[0] })));
    const nItems = ['Toutes'].concat(NIS).filter((nm) => sh !== 'niche' || keep(nm)).map((nm) => opt(nm, nN[nm] || 0, niche === nm,
      { ic: NIC[nm] || NIC.Autres }, () => set({ niche: nm })));
    const SH = {
      marche: { title: 'Marché', search: 'Chercher un pays', items: mItems, canReset: market !== 'ALL', resetLabel: 'Tous', reset: () => set({ market: 'ALL' }) },
      niche: { title: 'Niche', search: 'Chercher une niche', items: nItems, canReset: niche !== 'Toutes', resetLabel: 'Toutes', reset: () => set({ niche: 'Toutes' }) } };
    const cur = SH[sh] || null;
    const BIC = { marche: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01' };
    const openSh = (k) => () => this.setState({ sh: k, q: '' });
    const bar = [
      { k: 'Marché', v: market === 'ALL' ? 'Tous' : mName(market), flag: market === 'ALL' ? false : market, d: BIC.marche, cls: market === 'ALL' ? '' : 'is-on', exp: sh === 'marche' ? 'true' : 'false', open: openSh('marche') },
      { k: 'Niche', v: niche, flag: false, d: BIC.niche, cls: niche === 'Toutes' ? '' : 'is-on', exp: sh === 'niche' ? 'true' : 'false', open: openSh('niche') }];

    // ── Écran vide (maquette V3, « Filtres sans résultat ») : ce qui manque, puis un filtre de moins, avec son nombre ──
    const TIC = { Tout: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', Accroches: 'M5 6h14M12 6v13M9 19h6', Sons: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
    const on = [];
    if (type !== 'Tout') on.push({ k: 'type', t: type, d: TIC[type], flag: false, off: { type: 'Tout' } });
    if (niche !== 'Toutes') on.push({ k: 'niche', t: niche, d: BIC.niche, flag: false, off: { niche: 'Toutes' } });
    if (market !== 'ALL') on.push({ k: 'market', t: mName(market), d: false, flag: market, off: { market: 'ALL' } });
    const empty = list.length === 0 && all.length > 0;
    const noun = type === 'Accroches' ? 'Aucune accroche' : type === 'Sons' ? 'Aucun son' : 'Aucun format';
    const forWhat = [niche !== 'Toutes' ? niche : '', market !== 'ALL' ? mName(market) : ''].filter(Boolean);
    const emptyTitle = noun + (forWhat.length ? ' pour ' + forWhat.join(' et ') : ' pour l’instant');
    const descr = (t, nm, m) => { const s = [nm === 'Toutes' ? 'toutes niches' : nm, m === 'ALL' ? 'tous les marchés' : mName(m), t === 'Tout' ? '' : t.toLowerCase()].filter(Boolean).join(', ');
      return s.charAt(0).toUpperCase() + s.slice(1); };
    const fewer = empty ? on.map((f) => { const s = Object.assign({ type, niche, market }, f.off); const n = n3(s.type, s.niche, s.market);
      return { what: f.t, sub: descr(s.type, s.niche, s.market), n: grp(n), k: n, unit: n > 1 ? 'formats' : 'format', go: () => set(f.off) }; })
      .filter((x) => x.k > 0).sort((p, q2) => q2.k - p.k) : [];

    const total = list.length;
    return {
      bar, sh: cur ? Object.assign({ on: true, q, empty: cur.items.length === 0 }, cur) : { on: false, items: [] },
      closeSh: () => this.setState({ sh: '' }), onQ: (e) => this.setState({ q: e.target.value }),
      shKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ sh: '' }); } },
      // Gardées dans les valeurs même feuille fermée (banc des filtres : un choix se fait par son libellé).
      mItems, nItems,
      seeLabel: total === 0 ? 'Aucun format, élargis les filtres' : total === 1 ? 'Voir le format' : 'Voir les ' + grp(total) + ' formats',
      types: ['Tout', 'Accroches', 'Sons'].map((l) => ({ l, on: l === type ? 'true' : 'false', pick: () => set({ type: l }) })),
      totalTxt: count(total), eyebrow: 'Le plus repris en ce moment',
      hasHero: !!hero, hero: hero || b.blank, cards, hasList: list.length > 0, noOther: list.length === 1,
      more: rest.length > limit, none: all.length === 0,
      empty, emptyTitle, chips: on, fewer, hasFewer: fewer.length > 0,
      clearAll: () => set({ market: 'ALL', niche: 'Toutes', type: 'Tout' })
    };
  }

  baseVals() {
    // Sur le canevas : un extrait du document « formats » (10 formats du Radar, 10/11), avec le nom par ce qu'on y voit
    // (title) relevé sur les mêmes vidéos. Sur le site : les vraies données (convex/radarModels.ts).
    let F = (globalThis.__dcSample?.["MFormats"]?.["F"] ?? []);
    let MK = [['US', 'États-Unis'], ['MX', 'Mexique'], ['BR', 'Brésil'], ['DE', 'Allemagne'], ['ID', 'Indonésie']];
    const D = this.props && this.props.data;
    if (D && D.formats) { F = D.formats; MK = (D.markets || []).map((m) => [m[0], m[1]]); }
    // Les cartes ne dépendent que du document : calculées une fois par document, pas à chaque choix ou ouverture de feuille.
    // (this.memo et non this.base : Preact range dans this.base l'élément de l'écran.)
    if (this.memo && this.memo.F === F && this.memo.MK === MK.length) return this.memo.v;
    const NIC = { 'Rencontres': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Bien-être mental': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01', 'Finance': 'M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6', 'Productivité': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Création de contenu': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 'Séduction IA': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Couple': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
      'Études': 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7', 'Jalousie et ex': 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'Side hustle': 'M3 17l6-6 4 4 8-8M15 7h6v6', 'Langues': 'M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5', 'Foi': 'M12 3v18M7 8h10',
      'Social et loisirs': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Santé et physique': 'M3 12h4l3-8 4 16 3-8h4',
      'Beauté IA': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'Toutes': 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', 'Autres': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' };
    const GLOBE = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18';
    const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
    const ML = {};
    MK.forEach((m) => { ML[m[0]] = m[1]; });
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const xf = (x) => (x >= 100 ? String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    // Le texte d'un format « hook » : espaces resserrés, sans les guillemets qui l'entourent (l'écran pose les siens).
    const clean = (t) => { let s = String(t || '').replace(/\s+/g, ' ').trim(); if (/^["“”«»„]/.test(s)) s = s.replace(/^["“”«»„]+\s*/, '').replace(/\s*["“”«»„]+$/, ''); return s; };
    const quote = (t) => '« ' + t + ' »';
    // Le son : « son de @x » pour un son original (« original sound - x », et ses traductions), sinon son titre.
    const OS = /^(?:original sound|son original|sonido original|som original|suono originale|originalton|оригинальный звук)\s*[-–—]\s*/i;
    const sound = (l) => { const who = OS.test(l) ? l.replace(OS, '').trim() : ''; return who ? 'son de @' + who : quote(clean(l)); };
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const others = (n) => n + (n > 1 ? ' autres apps' : ' autre app');
    const appsLine = (as) => { const ns = as.map((a) => a.name); return ns.length > 3 ? ns.slice(0, 3).join(', ') + ' et ' + others(ns.length - 3) : ns.length > 1 ? ns.slice(0, -1).join(', ') + ' et ' + ns[ns.length - 1] : ns.join(''); };
    const card = (f, i) => {
      const hook = f.kind === 'hook';
      // Nommé par ce qu'on y voit (maquette C1, comme FormatsB) : le texte à l'écran (title) ; sinon le libellé :
      // l'accroche, ou le son.
      const name = f.title ? quote(f.title) : hook ? quote(clean(f.label)) : cap(sound(f.label));
      const len = Array.from(name).length;
      const ms = f.members || [];
      const top = ms[0] || null;
      const key = f.id || 'f' + i;
      const wins = f.wins || 0, n = f.n || 0;
      return {
        key, href: f.id ? '/app/formats/' + f.id : '/app/formats',
        kind: hook ? 'hook' : 'sound', niche: f.niche || 'Autres', market: f.market, accounts: f.accounts || 0, medX: typeof f.medX === 'number' ? f.medX : 0,
        name, fsm: len <= 44 ? 28 : len <= 70 ? 24 : 21,
        // La ligne sous le nom : le son quand le nom vient du texte à l'écran ; sinon le genre du format.
        line: hook ? 'Accroche' : f.title ? sound(f.label) : 'Son', lineIc: ICO[f.kind] || ICO.hook,
        mk: f.market && f.market !== 'XX' ? f.market : false, mkName: ML[f.market] || f.market || '',
        nNum: String(f.accounts || 0), nTxt: (f.accounts || 0) + ' comptes', nLab: 'comptes le reprennent', ok: wins + '/' + n, okW: (n ? Math.round((wins / n) * 100) : 0) + '%',
        okTitle: wins + ' reprises sur ' + n + ' au-dessus de la normale de leur compte',
        med: typeof f.medX === 'number' ? xf(f.medX) : '—',
        best: top ? nf(top.views) : '', cover: top && top.cover ? top.cover : false,
        apps: (f.apps || []).slice(0, 3).map((a, j) => ({ logo: a.icon || false, nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', ml: j ? '-7px' : '0' })),
        appsLine: appsLine(f.apps || []),
        thumbsM: ms.slice(0, 3).map((m, k) => ({ src: m.cover || '', v: nf(m.views), href: m.videoId ? '/app/videos/' + m.videoId : '/app/videos',
          aria: 'Lire la reprise de @' + m.handle + ', ' + nf(m.views) + ' vues', fs: k ? 11 : 13 }))
      };
    };
    const all = F.map(card);
    // Les niches : de la plus fournie à la moins fournie, « Autres » en dernier.
    const cnt = {};
    all.forEach((c) => { cnt[c.niche] = (cnt[c.niche] || 0) + 1; });
    const NIS = Object.keys(cnt).sort((p, q) => (p === 'Autres') - (q === 'Autres') || cnt[q] - cnt[p]);
    const MKS = [['ALL', 'Tous les marchés']].concat(MK);
    const MHAS = {};
    F.forEach((f) => { if (f.market) MHAS[f.market] = true; });
    const blank = Object.assign(card({ kind: 'sound', label: '', members: [], apps: [] }, 0), { name: '', line: '', niche: '', nTxt: '', ok: '', med: '', appsLine: '' });
    const v = { all, MKS, MHAS, NIS, NIC, GLOBE, blank };
    this.memo = { F, MK: MK.length, v };
    return v;
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "data-pull": "", "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(150px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Formats"
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
        $h("section", { "aria-label": "Filtres", "style": "padding: 14px 20px 0; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
          ($l($v.bar)).map((f) => [
            $h("button", { "class": `m-fb ${$t(f?.cls)}`, "type": "button", "onClick": f?.open, "aria-haspopup": "dialog", "aria-expanded": f?.exp },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": f?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "class": "m-fb-k" },
                $t(f?.k)
              ),
              (f?.flag) ? [
                $h("span", { "class": "sw-flag sw-flag-16", "data-c": f?.flag, "aria-hidden": "true" })
              ] : null,
              $h("span", { "class": "m-fb-v" },
                $t(f?.v)
              ),
              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ])
        ),
        $h("div", { "data-swipe": "", "style": "padding: 14px 20px 0; display: flex; flex-direction: column;" },
          ($v.none) ? [
            $h("p", { "style": "margin: 16px 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
              "Aucun format à montrer pour l’instant."
            )
          ] : null,
          ($v.empty) ? [
            $h("section", { "aria-label": "Aucun résultat", "style": "padding: 20px 18px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); display: flex; flex-direction: column; gap: 12px;" },
              $h("span", { "style": "font-size: 19px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em;" },
                $t($v.emptyTitle)
              ),
              $h("span", { "style": "display: flex; flex-wrap: wrap; gap: 6px;" },
                ($l($v.chips)).map((c) => [
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px; border-radius: 999px; background: rgba(76,154,255,0.14); box-shadow: inset 0 0 0 1px rgba(76,154,255,0.45); color: #FFFFFF; font-size: 13px; font-weight: 500; white-space: nowrap;" },
                    (c?.flag) ? [
                      $h("span", { "class": "sw-flag sw-flag-14", "data-c": c?.flag, "aria-hidden": "true" })
                    ] : null,
                    (c?.d) ? [
                      $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                        $h("path", { "d": c?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null,
                    $t(c?.t)
                  )
                ])
              ),
              ($v.hasFewer) ? [
                $h("span", { "style": "margin-top: 4px; font-size: 13px; color: var(--ink-faint);" },
                  "Un filtre de moins :"
                ),
                ($l($v.fewer)).map((x) => [
                  $h("button", { "type": "button", "onClick": x?.go, "style": "display: flex; align-items: center; gap: 10px; min-height: 64px; padding: 12px 14px; border: 0; border-radius: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); color: var(--ink); font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                      $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                        "Retirer « ", $t(x?.what), " »"
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(x?.sub)
                      )
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em; line-height: 1;" },
                      $t(x?.n)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(x?.unit)
                    )
                  )
                ])
              ] : null,
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.clearAll, "style": "align-self: flex-start; height: 44px; margin-top: 2px;" },
                "Effacer les filtres"
              )
            )
          ] : null,
          ($v.hasHero) ? [
            $h("section", { "aria-label": $v.eyebrow, "style": "position: relative; padding: 20px 18px 18px; border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; background: radial-gradient(360px 260px at 100% 0%, rgba(76,154,255,0.16), transparent 70%), linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6FB0FF;" },
                $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M12 2.5c.6 3.4 5 5.6 5 10.8a5 5 0 0 1-10 0c0-2.4 1.1-3.9 2.4-5 .3 1.8 1.2 2.9 2.4 3-.4-3.2-.6-6 .2-8.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $t($v.eyebrow)
              ),
              $h("h2", { "style": `margin: 12px 0 0; font-family: var(--font-display); font-size: ${$t($v.hero?.fsm)}px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;` },
                $t($v.hero?.name)
              ),
              $h("div", { "style": "margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;" },
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; max-width: 100%; box-sizing: border-box; padding: 0 11px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": $v.hero?.lineIc, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.hero?.line)
                  )
                ),
                ($v.hero?.mk) ? [
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 11px 0 6px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap;" },
                    $h("span", { "class": "sw-flag sw-flag-16", "data-c": $v.hero?.mk, "aria-hidden": "true" }),
                    $t($v.hero?.mkName)
                  )
                ] : null,
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 11px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.hero?.niche)
                )
              ),
              $h("div", { "aria-label": "Ses reprises les plus vues", "style": "margin-top: 16px; display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 8px; align-items: end;" },
                ($l($v.hero?.thumbsM)).map((v) => [
                  $h("a", { "class": "sw-video", "href": $u(v?.href), "aria-label": v?.aria, "style": "display: block; aspect-ratio: 3 / 4; border-radius: 14px; text-decoration: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);" },
                    $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": `position: absolute; left: 8px; bottom: 7px; font-size: ${$t(v?.fs)}px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.85);` },
                      $t(v?.v)
                    )
                  )
                ])
              ),
              $h("div", { "style": "margin-top: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;" },
                $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 26px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.hero?.nNum)
                  ),
                  $h("span", { "style": "font-size: 11px; line-height: 1.3; color: var(--ink-faint);" },
                    $t($v.hero?.nLab)
                  )
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 26px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.hero?.ok)
                  ),
                  $h("span", { "style": "font-size: 11px; line-height: 1.3; color: var(--ink-faint);" },
                    "reprises réussies"
                  )
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 26px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.hero?.med)
                  ),
                  $h("span", { "style": "font-size: 11px; line-height: 1.3; color: var(--ink-faint);" },
                    "la normale des comptes"
                  )
                )
              ),
              $h("div", { "style": "margin-top: 16px; display: flex; align-items: center; gap: 10px; min-width: 0;" },
                $h("span", { "style": "display: flex; flex-shrink: 0;" },
                  ($l($v.hero?.apps)).map((a) => [
                    $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": `width: 24px; height: 24px; border-radius: 7px; margin-left: ${$t(a?.ml)}; box-shadow: 0 0 0 2px #10141D; background-color: #1B2230;` },
                      (a?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (a?.nologo) ? [
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    )
                  ])
                ),
                $h("span", { "style": "flex: 1 1 auto; min-width: 0; font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.hero?.appsLine)
                )
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $u($v.hero?.href), "style": "margin-top: 16px; height: 48px; justify-content: space-between; padding: 0 6px 0 18px; font-size: 15px; text-decoration: none;" },
                "Voir le format",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ] : null,
          ($v.hasList) ? [
            $h("div", { "style": "padding: 24px 0 12px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px;" },
              $h("h2", { "style": "margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em;" },
                "Les autres formats du moment"
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                $t($v.totalTxt)
              )
            ),
            ($v.noOther) ? [
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Aucun autre format pour ces filtres."
              )
            ] : null,
            $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
              ($l($v.cards)).map((f) => [
                $h("a", { "key": f?.key, "class": "fm-card", "href": $u(f?.href), "style": "-webkit-tap-highlight-color: transparent;" },
                  $h("span", { "class": "fm-th" },
                    (f?.cover) ? [
                      $h("img", { "class": "sw-cover", "src": $u(f?.cover), "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-size: 11px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.85);" },
                      $t(f?.best)
                    )
                  ),
                  $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "font-size: 15px; font-weight: 600; line-height: 1.3; letter-spacing: -0.005em; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere;" },
                      $t(f?.name)
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12px; color: var(--ink-faint);" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                        $h("path", { "d": f?.lineIc, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $h("span", { "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(f?.line)
                      )
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 7px; min-width: 0; font-size: 12px; color: var(--ink-faint);" },
                      (f?.mk) ? [
                        $h("span", { "class": "sw-flag sw-flag-16", "data-c": f?.mk, "title": f?.mkName, "aria-hidden": "true" })
                      ] : null,
                      $h("span", { "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(f?.niche)
                      )
                    ),
                    $h("span", { "style": "margin-top: auto; padding-top: 4px; display: flex; align-items: center; gap: 10px;" },
                      $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap; color: var(--ink);" },
                        $t(f?.nTxt)
                      ),
                      $h("span", { "class": "fm-bar", "aria-hidden": "true" },
                        $h("i", { "style": `width: ${$t(f?.okW)};` })
                      ),
                      $h("span", { "title": f?.okTitle, "style": "font-size: 12px; white-space: nowrap; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                        $t(f?.ok)
                      )
                    )
                  )
                )
              ])
            ),
            ($v.more) ? [
              $h("div", { "ref": $v.setMore, "aria-hidden": "true", "style": "height: 1px;" })
            ] : null
          ] : null
        ),
        $h("div", { "data-swipe-skip": "", "style": "position: fixed; left: 12px; right: 12px; bottom: calc(max(12px, env(safe-area-inset-bottom)) + 72px); z-index: 29; padding: 4px; border-radius: 16px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 14px 36px rgba(0,0,0,0.45);" },
          $h("div", { "class": "m-tc is-flat", "role": "tablist", "aria-label": "Type", "data-swipe-tabs": "" },
            ($l($v.types)).map((t) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": "min-height: 40px; font-size: 13px; font-weight: 600;" },
                $t(t?.l)
              )
            ])
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
          $h("a", { "href": "/app/formats", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        ($v.sh?.on) ? [
          $h("button", { "data-sheet-veil": "", "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeSh, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "data-sheet": "", "role": "dialog", "aria-modal": "true", "aria-label": $v.sh?.title, "onKeyDown": $v.shKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px;" },
            $h("div", { "data-sheet-handle": "", "style": "display: flex; justify-content: center; padding: 10px 0 6px;" },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 2px 0 10px;" },
              $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                $t($v.sh?.title)
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 4px;" },
                ($v.sh?.canReset) ? [
                  $h("button", { "type": "button", "onClick": $v.sh?.reset, "style": "min-height: 44px; padding: 0 8px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                    $t($v.sh?.resetLabel)
                  )
                ] : null,
                $h("button", { "ref": $v.setShClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closeSh, "aria-label": "Fermer", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("label", { "style": "display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 14px; border-radius: 14px; background: rgba(255,255,255,0.04); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); color: var(--ink-faint);" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "type": "search", "onInput": $v.onQ, "aria-label": $v.sh?.search, "placeholder": $v.sh?.search, "enterkeyhint": "search", "style": "flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 16px;" })
            ),
            $h("div", { "data-sheet-opts": "", "role": "radiogroup", "aria-label": $v.sh?.title, "style": "display: flex; flex-direction: column; padding: 8px 0 14px;" },
              ($l($v.sh?.items)).map((it) => [
                $h("button", { "data-sheet-opt": "", "type": "button", "role": "radio", "aria-checked": it?.sel, "onClick": it?.pick, "style": `display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; border: 0; border-radius: 14px; background: ${$t(it?.bg)}; color: var(--ink); font-family: inherit; font-size: 16px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)}; -webkit-tap-highlight-color: transparent;` },
                  $h("span", { "aria-hidden": "true", "style": `width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box;` },
                    $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  (it?.flag) ? [
                    $h("span", { "class": "sw-flag", "data-c": it?.flag, "aria-hidden": "true" })
                  ] : null,
                  (it?.ic) ? [
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": it?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null,
                  $h("span", { "style": `flex: 1; min-width: 0; font-weight: ${$t(it?.w)}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` },
                    $t(it?.pre),
                    (it?.hit) ? [
                      $h("mark", { "style": "background: rgba(76,154,255,0.3); color: #FFFFFF; border-radius: 3px;" },
                        $t(it?.hit)
                      )
                    ] : null,
                    $t(it?.post)
                  ),
                  $h("span", { "style": "flex-shrink: 0; font-size: 13px; color: var(--ink-faint);" },
                    $t(it?.n)
                  )
                )
              ]),
              ($v.sh?.empty) ? [
                $h("p", { "style": "margin: 12px; font-size: 14px; color: var(--ink-muted);" },
                  "Rien ne correspond à « ", $t($v.sh?.q), " »."
                )
              ] : null
            ),
            $h("div", { "style": "position: sticky; bottom: 0; z-index: 2; margin: 0 -20px; padding: 14px 20px max(16px, env(safe-area-inset-bottom)); display: flex; justify-content: center; background: linear-gradient(180deg, rgba(13,17,26,0) 0%, rgba(13,17,26,0.96) 34%, #0D111A 100%);" },
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.closeSh },
                $t($v.seeLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
