// Généré par scripts/dc2preact.py depuis design/app/FormatsB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import Palette from './Palette.js';

export default class Formats extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // Le tri (« tri ») est propre à l'ordinateur : le téléphone le laisse dans l'adresse.
  filters() { return { niche: ['niche', 's', 'Toutes'], type: ['type', 's', 'Tout'], market: ['m', 's', 'ALL'], sort: ['tri', 's', 'comptes'] }; }
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
    // Un clic ailleurs ferme la fenêtre ou le menu ouverts ; Échap ferme le menu de tri (les fenêtres ont leur champ).
    this.out = (e) => {
      const st = this.state || {};
      if (!st.open || !this.menuEl || this.menuEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-menu-trigger]')) return;
      this.setState({ open: '' });
    };
    document.addEventListener('mousedown', this.out);
    this.esc = (e) => { if (e.key === 'Escape' && (this.state || {}).open === 'tri') this.setState({ open: '' }); };
    document.addEventListener('keydown', this.esc);
    // Rendu progressif (comme les lignes d'Apps) : 30 cartes d'abord, 30 de plus quand le bas de la grille approche.
    this.moreIo = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) this.setState({ limit: ((this.state || {}).limit || 30) + 30 });
    }, { rootMargin: '900px 0px' }) : null;
    if (this.moreEl && this.moreIo) this.moreIo.observe(this.moreEl);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this.out); document.removeEventListener('keydown', this.esc); if (this.moreIo) this.moreIo.disconnect(); }
  componentDidUpdate(pp, ps) {
    const st = this.state || {};
    ps = ps || {};
    // Fenêtre ouverte : le focus y reste (Safari ne le donne pas au bouton cliqué), pour qu'Échap la ferme.
    if (st.open && this.menuInput && (st.open !== ps.open || !(this.menuEl && this.menuEl.contains(document.activeElement)))) this.menuInput.focus();
    // Encore dans l'écran après un ajout de cartes : on la réobserve pour en demander d'autres.
    if (st.limit !== ps.limit && this.moreEl && this.moreIo) { this.moreIo.unobserve(this.moreEl); this.moreIo.observe(this.moreEl); }
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
    const all = b.all, MKS = b.MKS, NIS = b.NIS, NIC = b.NIC;
    // Les filtres : l'état, sinon l'adresse (F25, plus haut). Une niche, un type, un marché ou un tri inconnus sont ignorés.
    const niche0 = this.fv('niche'), type0 = this.fv('type'), market0 = this.fv('market'), sort0 = this.fv('sort');
    const niche = NIS.indexOf(niche0) >= 0 ? niche0 : 'Toutes';
    const type = ['Accroches', 'Sons'].indexOf(type0) >= 0 ? type0 : 'Tout';
    const market = MKS.some((m) => m[0] === market0) ? market0 : 'ALL';
    const sort = sort0 === 'normale' ? 'normale' : 'comptes';
    const open = st.open || '';
    const count = (n) => n.toLocaleString('fr-FR') + (n > 1 ? ' formats' : ' format');
    const okN = (c, nm) => nm === 'Toutes' || c.niche === nm;
    const okT = (c, t) => t === 'Tout' || (t === 'Accroches' ? c.kind === 'hook' : c.kind === 'sound');
    const okM = (c, m) => m === 'ALL' || c.market === m;
    // Un choix ferme sa fenêtre et repart des 30 premières cartes.
    const set = (patch) => this.setF(Object.assign({ open: '', limit: null }, patch));
    // Le tri : par comptes qui le reprennent puis × la normale (l'ordre du document), ou l'inverse.
    const by = sort === 'normale' ? (p, q) => q.medX - p.medX || q.accounts - p.accounts : (p, q) => q.accounts - p.accounts || q.medX - p.medX;
    // Un format passe les filtres f (niche, type, marché) : la règle de la liste, reprise par l'écran vide.
    const keepF = (c, f) => okN(c, f.niche) && okT(c, f.type) && okM(c, f.market);
    const cur = { niche, type, market };
    const list = all.filter((c) => keepF(c, cur)).sort(by);
    // À la une : le premier de la liste filtrée ; la grille : tous les suivants, dessinés par paquets de 30.
    const hero = list[0] || null;
    const rest = list.slice(1);
    const limit = st.limit || 30;
    const cards = rest.slice(0, limit);
    if (!this.setMore) this.setMore = (el) => { if (this.moreEl && this.moreIo) this.moreIo.unobserve(this.moreEl); this.moreEl = el; if (el && this.moreIo) this.moreIo.observe(el); };
    // ── Fenêtres de choix (choice.js), comme sur Apps : un clic choisit et ferme ──
    const mLabel = (MKS.filter((m) => m[0] === market)[0] || ['ALL', 'Tous'])[1];
    const BIC = { marche: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01' };
    const mkBar = (key, k, v, extra) => Object.assign({ key, k, v, d: BIC[key], open: open === key ? 'true' : 'false', flag: false, active: 'false' }, extra, {
      toggle: (e) => { const el = e && e.currentTarget; this.setState({ open: open === key ? '' : key, mq: '', menuX: el && typeof el.offsetLeft === 'number' ? el.offsetLeft : null }); } });
    const bar = [mkBar('marche', 'Marché', market === 'ALL' ? 'Tous' : mLabel, { flag: market === 'ALL' ? false : market, active: market === 'ALL' ? 'false' : 'true' }),
      mkBar('niche', 'Niche', niche, { active: niche === 'Toutes' ? 'false' : 'true' })];
    const fold = (t) => Array.from(String(t)).map((c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || c).join('');
    const mq = String(st.mq || '').trim();
    const fq = fold(mq);
    const keep = (label) => !fq || fold(label).indexOf(fq) >= 0;
    const hit = (label) => { const i = fq ? fold(label).indexOf(fq) : -1; return i < 0 ? { pre: label, hit: false, post: '' } : { pre: label.slice(0, i), hit: label.slice(i, i + fq.length), post: label.slice(i + fq.length) }; };
    const menuLeft = (dflt) => (typeof st.menuX === 'number' ? st.menuX + 'px' : dflt);
    const opt = (key, label, n, on, extra, pick) => Object.assign({ key, flag: false, globe: false, ic: false, n: count(n), sel: on ? 'true' : 'false', o: n === 0 && !on ? 0.45 : 1, pick }, extra, hit(label));
    let menu = { on: false, items: [], kind: '', title: '', search: '', w: '380px', left: '0px', hasQ: false, q: '', empty: false };
    if (open === 'marche') {
      // Les nombres tiennent compte du type et de la niche choisis.
      const items = MKS.filter((m) => keep(m[1])).map((m) => opt(m[0], m[1], all.filter((c) => okN(c, niche) && okT(c, type) && okM(c, m[0])).length, market === m[0],
        { flag: m[0] === 'ALL' ? false : m[0], globe: m[0] === 'ALL' }, () => set({ market: m[0] })));
      menu = { on: true, kind: 'marche', title: 'Marché', search: 'Chercher un pays', w: '380px', left: menuLeft('0px'), hasQ: !!fq, q: mq, empty: items.length === 0, items };
    } else if (open === 'niche') {
      // Les niches et leurs nombres (avant : une rangée de pastilles) ; les nombres tiennent compte du type et du marché.
      const items = ['Toutes'].concat(NIS).filter(keep).map((nm) => opt(nm, nm, all.filter((c) => okN(c, nm) && okT(c, type) && okM(c, market)).length, niche === nm,
        { ic: NIC[nm] || NIC.Autres }, () => set({ niche: nm })));
      menu = { on: true, kind: 'niche', title: 'Niche', search: 'Chercher une niche', w: '380px', left: menuLeft('0px'), hasQ: !!fq, q: mq, empty: items.length === 0, items };
    }
    // ── Tri ──
    const SORTS = [['comptes', 'Les plus repris', 'Par nombre de comptes qui le reprennent', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3'],
      ['normale', 'Au-dessus de la normale', 'Par × la normale des comptes qui le reprennent', 'M13 2L4 14h7l-1 8 9-12h-7z']];
    const sortMenu = { on: open === 'tri', items: SORTS.map(([k, l, sub, d]) => { const on = k === sort;
      return { l, sub, d, on, sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)', pick: () => set({ sort: k }) }; }) };
    const sortBtn = { open: open === 'tri' ? 'true' : 'false', toggle: () => this.setState({ open: open === 'tri' ? '' : 'tri' }) };
    const TIC = { Tout: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', Accroches: 'M5 6h14M12 6v13M9 19h6', Sons: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
    const types = ['Tout', 'Accroches', 'Sons'].map((l) => { const on = l === type;
      return { l, d: TIC[l], on: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'var(--line)', ink: on ? 'var(--ink)' : 'var(--ink-muted)', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)', pick: () => set({ type: l }) }; });
    // Filtres sans résultat (maquette V3 du 20/11) : un filtre de moins, compté sur la liste du document (les mêmes règles).
    let vz = this.voidVals('', [], []);
    if (!list.length) {
      const PREP = (n) => (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n) ? 'aux' : /^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n) ? 'en' : /e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? 'en' : 'au');
      const posed = [];
      if (market !== 'ALL') posed.push({ key: 'm', name: mLabel, where: PREP(mLabel) + ' ' + mLabel, all: 'tous marchés', chips: [{ label: mLabel, flag: market, ic: false }], patch: { market: 'ALL' } });
      if (niche !== 'Toutes') posed.push({ key: 'niche', name: niche, frag: niche, all: 'toutes niches', chips: [{ label: niche, flag: false, ic: NIC[niche] || NIC.Autres }], patch: { niche: 'Toutes' } });
      if (type !== 'Tout') posed.push({ key: 'type', name: type, desc: type.toLowerCase() + ' seulement', all: 'accroches et sons', chips: [{ label: type, flag: false, ic: TIC[type] }], patch: { type: 'Tout' } });
      posed.forEach((g) => { const f = Object.assign({}, cur, g.patch); g.n = all.filter((c) => keepF(c, f)).length; g.drop = () => set(g.patch); });
      vz = this.voidVals(type === 'Accroches' ? 'Aucune accroche' : type === 'Sons' ? 'Aucun son' : 'Aucun format', posed, ['format', 'formats']);
    }
    return {
      types, bar, menu, sortMenu, sortBtn, sortLabel: sort === 'normale' ? 'Au-dessus de la normale' : 'Les plus repris',
      totalTxt: count(list.length),
      eyebrow: sort === 'normale' ? 'Le plus au-dessus de la normale' : 'Le plus repris en ce moment',
      hasHero: !!hero, hero: hero || b.blank, cards, hasList: list.length > 0, noOther: list.length === 1, empty: list.length === 0, vz,
      more: rest.length > limit, setMore: this.setMore,
      closeMenu: () => this.setState({ open: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      clearMq: () => { if (this.menuInput) { this.menuInput.value = ''; this.menuInput.focus(); } this.setState({ mq: '' }); },
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; },
      clearAll: () => set({ market: 'ALL', niche: 'Toutes', type: 'Tout' })
    };
  }

  baseVals() {
    // Sur le canevas : un extrait du document « formats » (10 formats du Radar, 10/11), avec le nom par ce qu'on y voit
    // (title) relevé sur les mêmes vidéos. Sur le site : les vraies données (convex/radarModels.ts).
    let F = (globalThis.__dcSample?.["Formats"]?.["F"] ?? []);
    let MK = [['US', 'États-Unis'], ['MX', 'Mexique'], ['BR', 'Brésil'], ['DE', 'Allemagne'], ['ID', 'Indonésie']];
    const D = this.props && this.props.data;
    if (D && D.formats) { F = D.formats; MK = (D.markets || []).map((m) => [m[0], m[1]]); }
    // Les cartes ne dépendent que du document : calculées une fois par document, pas à chaque ouverture de fenêtre.
    if (this.memo && this.memo.F === F && this.memo.MK === MK.length) return this.memo.v; // this.memo : Preact range dans this.base l’élément de l’écran
    const NIC = { 'Rencontres': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Bien-être mental': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01', 'Finance': 'M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6', 'Productivité': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Création de contenu': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 'Séduction IA': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Couple': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
      'Études': 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7', 'Jalousie et ex': 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'Side hustle': 'M3 17l6-6 4 4 8-8M15 7h6v6', 'Langues': 'M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5', 'Foi': 'M12 3v18M7 8h10',
      'Social et loisirs': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Santé et physique': 'M3 12h4l3-8 4 16 3-8h4',
      'Beauté IA': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'Toutes': 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', 'Autres': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' };
    const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
    const ML = {};
    MK.forEach((m) => { ML[m[0]] = m[1]; });
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    // Le texte d'un format « hook » : espaces resserrés, sans les guillemets qui l'entourent (l'écran pose les siens).
    const clean = (t) => { let s = String(t || '').replace(/\s+/g, ' ').trim(); if (/^["“”«»„]/.test(s)) s = s.replace(/^["“”«»„]+\s*/, '').replace(/\s*["“”«»„]+$/, ''); return s; };
    const quote = (t) => '« ' + t + ' »';
    // Le son : « son de @x » pour un son original (« original sound - x », et ses traductions), sinon son titre.
    const OS = /^(?:original sound|son original|sonido original|som original|suono originale|originalton|оригинальный звук)\s*[-–—]\s*/i;
    const sound = (l) => { const who = OS.test(l) ? l.replace(OS, '').trim() : ''; return who ? 'son de @' + who : quote(clean(l)); };
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const others = (n) => n + (n > 1 ? ' autres apps' : ' autre app');
    const appsLine = (as) => { const ns = as.map((a) => a.name); return ns.length > 3 ? ns.slice(0, 3).join(', ') + ' et ' + others(ns.length - 3) : ns.length > 1 ? ns.slice(0, -1).join(', ') + ' et ' + ns[ns.length - 1] : ns.join(''); };
    const card = (f, i) => {
      const hook = f.kind === 'hook';
      // Nommé par ce qu'on y voit (maquette C1) : le texte à l'écran (title) ; sinon le libellé : l'accroche, ou le son.
      const name = f.title ? quote(f.title) : hook ? quote(clean(f.label)) : cap(sound(f.label));
      const len = Array.from(name).length;
      const ms = f.members || [];
      const top = ms[0] || null;
      const key = f.id || 'f' + i;
      const wins = f.wins || 0, n = f.n || 0;
      return {
        key, hkey: 'h:' + key, href: f.id ? '/app/formats/' + f.id : '/app/formats',
        kind: hook ? 'hook' : 'sound', niche: f.niche || 'Autres', market: f.market, accounts: f.accounts || 0, medX: typeof f.medX === 'number' ? f.medX : 0,
        name, fs: len <= 44 ? 36 : len <= 70 ? 30 : 26,
        // La ligne sous le nom : le son quand le nom vient du texte à l'écran ; sinon le genre du format.
        line: hook ? 'Accroche' : f.title ? sound(f.label) : 'Son', lineIc: ICO[f.kind] || ICO.hook,
        mk: f.market && f.market !== 'XX' ? f.market : false, mkName: ML[f.market] || f.market || '',
        nNum: String(f.accounts || 0), nTxt: (f.accounts || 0) + ' comptes', nLab: 'comptes le reprennent', ok: wins + '/' + n, okW: (n ? Math.round((wins / n) * 100) : 0) + '%',
        okTitle: wins + ' reprises sur ' + n + ' au-dessus de la normale de leur compte',
        med: typeof f.medX === 'number' ? xf(f.medX) : '—',
        best: top ? nf(top.views) : '', cover: top && top.cover ? top.cover : false,
        apps: (f.apps || []).slice(0, 3).map((a, j) => ({ logo: a.icon || false, nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', ml: j ? '-8px' : '0' })),
        appsLine: appsLine(f.apps || []),
        thumbs: ms.slice(0, 4).map((m, k) => ({ src: m.cover || '', v: nf(m.views), href: m.videoId ? '/app/videos/' + m.videoId : '/app/videos',
          aria: 'Lire la reprise de @' + m.handle + ', ' + nf(m.views) + ' vues', w: k ? 92 : 112, h: k ? 164 : 200, fs: k ? 11 : 12 }))
      };
    };
    const all = F.map(card);
    // Les niches : de la plus fournie à la moins fournie, « Autres » en dernier.
    const cnt = {};
    all.forEach((c) => { cnt[c.niche] = (cnt[c.niche] || 0) + 1; });
    const NIS = Object.keys(cnt).sort((p, q) => (p === 'Autres') - (q === 'Autres') || cnt[q] - cnt[p]);
    const MKS = [['ALL', 'Tous les marchés']].concat(MK);
    const blank = Object.assign(card({ kind: 'sound', label: '', members: [], apps: [] }, 0), { name: '', line: '', niche: '', nTxt: '', ok: '', med: '', appsLine: '' });
    const v = { all, MKS, NIS, NIC, blank };
    this.memo = { F, MK: MK.length, v };
    return v;
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 900px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; padding-bottom: 48px; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 30px 40px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 34px; line-height: 1.05; font-weight: 700; letter-spacing: -0.035em;" },
                "Formats"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que plusieurs comptes reprennent en même temps. Un format qui marche chez trois inconnus marchera chez toi."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 360px; height: 44px; padding: 0 16px; border: 0; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); backdrop-filter: none; -webkit-backdrop-filter: none;" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qfb", "type": "search", "aria-label": "Chercher une accroche ou un son", "placeholder": "Chercher une accroche ou un son…", "style": "font-size: 14px;" })
            )
          ),
          $h("section", { "aria-label": "Filtres", "style": "margin: 20px 40px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
            $h("div", { "role": "tablist", "aria-label": "Type", "style": "display: flex; gap: 8px;" },
              ($l($v.types)).map((t) => [
                $h("button", { "type": "button", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: ${$t(t?.bg)}; box-shadow: inset 0 0 0 1px ${$t(t?.edge)}; color: ${$t(t?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(t?.fw)}; cursor: pointer;` },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(t?.ic)};` },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.l)
                )
              ])
            ),
            $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 26px; margin: 0 6px; background: var(--line);" }),
            $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
              ($l($v.bar)).map((b) => [
                $h("button", { "type": "button", "class": "fl-trig", "data-menu-trigger": "true", "data-fl-trig": b?.key, "data-on": b?.active, "onClick": b?.toggle, "aria-expanded": b?.open, "aria-haspopup": "listbox", "style": "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": b?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "color: var(--ink-muted);" },
                    $t(b?.k)
                  ),
                  $h("span", { "class": "fl-val", "data-roll": "" },
                    (b?.flag) ? [
                      $h("span", { "class": "sw-flag", "data-c": b?.flag, "aria-hidden": "true" })
                    ] : null,
                    $t(b?.v)
                  ),
                  $h("svg", { "class": "fl-chev", "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ]),
              ($v.menu?.on) ? [
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": $v.menu?.title, "aria-multiselectable": "false", "data-fl": $v.menu?.kind, "class": "fl-pan", "style": `left: ${$t($v.menu?.left)}; width: ${$t($v.menu?.w)};` },
                  $h("div", { "class": "fl-side" },
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
                    ),
                    $h("div", { "class": "fl-list", "data-fl-list": "" },
                      ($l($v.menu?.items)).map((it) => [
                        $h("button", { "type": "button", "role": "option", "class": "fl-opt", "data-fl-opt": it?.key, "aria-selected": it?.sel, "aria-disabled": "false", "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `opacity: ${$t(it?.o)};` },
                          $h("span", { "class": "fl-mark", "data-shape": "radio", "aria-hidden": "true" },
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
                  )
                )
              ] : null
            ),
            $h("div", { "style": "margin-left: auto; display: flex; align-items: center; gap: 12px;" },
              $h("span", { "class": "fl-count", "data-roll": "", "style": "font-size: 13px; color: var(--ink-faint);" },
                $t($v.totalTxt)
              ),
              $h("div", { "style": "position: relative;" },
                $h("button", { "type": "button", "class": "fl-trig", "data-menu-trigger": "true", "onClick": $v.sortBtn?.toggle, "aria-expanded": $v.sortBtn?.open, "aria-haspopup": "listbox", "aria-label": `Trier : ${$t($v.sortLabel)}`, "style": "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; color: var(--ink); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "class": "fl-val", "data-roll": "" },
                    $t($v.sortLabel)
                  ),
                  $h("svg", { "class": "fl-chev", "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                ($v.sortMenu?.on) ? [
                  $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": "Trier les formats", "style": "position: absolute; top: 46px; right: 0; z-index: 30; width: 340px; box-sizing: border-box; padding: 8px; border-radius: 20px; background: #0E121B; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                    $h("span", { "style": "display: block; padding: 10px 12px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                      "Trier par"
                    ),
                    ($l($v.sortMenu?.items)).map((o) => [
                      $h("button", { "type": "button", "role": "option", "aria-selected": o?.sel, "onClick": o?.pick, "style": `width: 100%; display: flex; align-items: center; gap: 12px; height: 46px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(o?.bg)}; color: var(--ink); font: inherit; font-size: 14px; font-weight: ${$t(o?.fw)}; text-align: left; cursor: pointer;` },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(o?.ic)};` },
                          $h("path", { "d": o?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 2px;" },
                          $t(o?.l),
                          $h("span", { "style": "font-size: 12px; font-weight: 400; color: var(--ink-faint);" },
                            $t(o?.sub)
                          )
                        ),
                        (o?.on) ? [
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--accent);" },
                            $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ] : null
                      )
                    ])
                  )
                ] : null
              )
            )
          ),
          ($v.empty) ? [
            $h("div", { "style": "margin: 28px 40px 0;" },
              $h("section", { "class": "sw-void", "aria-labelledby": "fmv-t" },
                $h("span", { "class": "sw-void-kick", "data-tone": "amber" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 6h16M7 12h10M10 18h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Filtres sans résultat"
                ),
                $h("h2", { "id": "fmv-t", "class": "sw-void-title" },
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
          ] : null,
          ($v.hasHero) ? [
            $h("section", { "data-lq-card": $v.hero?.hkey, "aria-label": $v.eyebrow, "style": "position: relative; margin: 20px 40px 0; min-height: 300px; box-sizing: border-box; display: flex; gap: 26px; padding: 26px 28px; border-radius: 20px; overflow: hidden; background: radial-gradient(520px 300px at 100% 0%, rgba(76,154,255,0.16), transparent 70%), linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("div", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6FB0FF;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M12 2.5c.6 3.4 5 5.6 5 10.8a5 5 0 0 1-10 0c0-2.4 1.1-3.9 2.4-5 .3 1.8 1.2 2.9 2.4 3-.4-3.2-.6-6 .2-8.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.eyebrow)
                ),
                $h("h2", { "style": `margin: 14px 0 0; font-family: var(--font-display); font-size: ${$t($v.hero?.fs)}px; line-height: 1.08; font-weight: 700; letter-spacing: -0.03em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere;` },
                  $t($v.hero?.name)
                ),
                $h("div", { "style": "margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;" },
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; max-width: 100%; box-sizing: border-box; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": $v.hero?.lineIc, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                      $t($v.hero?.line)
                    )
                  ),
                  ($v.hero?.mk) ? [
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 6px; border-radius: 999px; font-size: 13px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap;" },
                      $h("span", { "class": "sw-flag sw-flag-16", "data-c": $v.hero?.mk, "aria-hidden": "true" }),
                      $t($v.hero?.mkName)
                    )
                  ] : null,
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 500; color: var(--ink-soft); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); white-space: nowrap;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.hero?.niche)
                  )
                ),
                $h("div", { "style": "margin-top: 20px; display: flex; flex-wrap: wrap; gap: 14px 30px;" },
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "font-family: var(--font-display); font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                      $t($v.hero?.nNum)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t($v.hero?.nLab)
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "font-family: var(--font-display); font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                      $t($v.hero?.ok)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      "reprises réussies"
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "font-family: var(--font-display); font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -0.03em;" },
                      $t($v.hero?.med)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      "la normale des comptes"
                    )
                  )
                ),
                $h("div", { "style": "margin-top: auto; padding-top: 22px; display: flex; align-items: center; gap: 12px;" },
                  $h("span", { "style": "display: flex; flex-shrink: 0;" },
                    ($l($v.hero?.apps)).map((a) => [
                      $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": `width: 26px; height: 26px; border-radius: 8px; margin-left: ${$t(a?.ml)}; box-shadow: 0 0 0 2px #10141D; background-color: #1B2230;` },
                        (a?.logo) ? [
                          $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        (a?.nologo) ? [
                          $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ] : null
                      )
                    ])
                  ),
                  $h("span", { "style": "flex: 1 1 auto; min-width: 0; font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.hero?.appsLine)
                  ),
                  $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": $u($v.hero?.href), "style": "flex-shrink: 0; text-decoration: none;" },
                    "Voir le format",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              ),
              $h("div", { "aria-label": "Ses reprises les plus vues", "style": "flex-shrink: 0; display: flex; align-items: flex-end; gap: 10px;" },
                ($l($v.hero?.thumbs)).map((v) => [
                  $h("a", { "class": "sw-video fm-hero-th", "href": $u(v?.href), "aria-label": v?.aria, "style": `display: block; flex-shrink: 0; width: ${$t(v?.w)}px; height: ${$t(v?.h)}px; aspect-ratio: auto; border-radius: 14px; text-decoration: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);` },
                    $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": `position: absolute; left: 8px; bottom: 7px; font-size: ${$t(v?.fs)}px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.85);` },
                      $t(v?.v)
                    )
                  )
                ])
              )
            )
          ] : null,
          ($v.hasList) ? [
            $h("div", { "style": "margin: 30px 40px 14px; display: flex; align-items: baseline; justify-content: space-between; gap: 16px;" },
              $h("h2", { "style": "margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: var(--ink);" },
                "Les autres formats du moment"
              )
            ),
            ($v.noOther) ? [
              $h("p", { "style": "margin: 0 40px; font-size: 15px; color: var(--ink-muted);" },
                "Aucun autre format pour ces filtres."
              )
            ] : null,
            $h("div", { "style": "margin: 0 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(max(340px, calc((100% - 24px) / 3)), 1fr)); gap: 12px;" },
              ($l($v.cards)).map((f) => [
                $h("a", { "key": f?.key, "data-lq-card": f?.key, "class": "fm-card", "href": $u(f?.href) },
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
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
