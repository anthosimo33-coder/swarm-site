// Généré par scripts/dc2preact.py depuis design/app/MApps.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MApps extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // colonne et ordre : le tri par colonne de l'ordinateur, que le choix d'un tri efface ici comme là-bas.
  filters() { return { market: ['m', 's', 'ALL'], niches: ['niche', 'l'], sort: ['tri', 's', 'vues'], period: ['periode', 's', '30'], sortBy: ['colonne', 's'], dir: ['ordre', 's'] }; }
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
  extraVals(b) {
    const st = this.state || {};
return {};
  }

  componentDidUpdate(pp, ps) {
    const st = this.state || {}; ps = ps || {};
    if (st.fs && !ps.fs && this.fsClose) this.fsClose.focus({ preventScroll: true });
    if (st.pv && st.pv !== ps.pv && this.pvClose) this.pvClose.focus({ preventScroll: true });
  }
  baseVals() {
    const st = this.state || {};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let A = (globalThis.__dcSample?.["MApps"]?.["A"] ?? []);
    let MKD = {"Astra AI": [["ID", "Indonésie", 65], ["US", "États-Unis", 19], ["ES", "Espagne", 8], ["BR", "Brésil", 5]], "Love8": [["US", "États-Unis", 66], ["ID", "Indonésie", 23], ["FR", "France", 8], ["MX", "Mexique", 4]]};
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['ID', 'Indonésie', 'ID'], ['MX', 'Mexique', 'MX'], ['FR', 'France', 'FR'], ['BR', 'Brésil', 'BR'], ['ES', 'Espagne', 'ES']];
    let NIS = ['Séduction IA', 'Jalousie et ex', 'Études', 'Santé et physique', 'Couple', 'Langues', 'Side hustle', 'Foi', 'Social et loisirs', 'Beauté IA'];
    // Sur le site : le classement du Radar (document « apps »), lu comme AppsA. A[i] = [nom, niche, marchés, comptes,
    // vidéos/sem., vues 30 j (M), 6 semaines (M), meilleure, miniatures, vues des miniatures, icône, slug, id des vidéos, nouvelle ?]
    const D = this.props && this.props.data;
    const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const nfm = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
    const xfm = (x) => (x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    // Un pays choisi : sa propre liste (« apps:FR »), où vues, courbe et vidéos ne comptent que ce pays.
    // Le marché : l'état, sinon l'adresse (F25, plus haut) ; un marché inconnu vaut « tous ».
    const mk0 = this.fv('market');
    const market = mk0 === 'ALL' || (mk0 && (D && D.markets ? D.markets : MKS).some((m) => m[0] === mk0)) ? mk0 : 'ALL';
    let SRC = D;
    if (D && D.apps && market !== 'ALL' && this.props && typeof this.props.get === 'function') {
      const g = this.props.get('apps:' + market);
      // Liste absente (pas encore produite par la synchro) : la liste de tous les pays, filtrée comme avant.
      if (g === undefined) SRC = this.lastSrc || D; else if (g === null) SRC = D; else { SRC = g && g.apps ? g : { apps: [] }; this.lastSrc = SRC; }
    }
    const scoped = SRC !== D && SRC && SRC.market && SRC.market !== 'ALL';
    let MAPPS = null;
    if (D && D.apps) {
      const LBL = Object.fromEntries(D.markets);
      MAPPS = Object.fromEntries(D.marketApps || []);
      A = SRC.apps.map((a) => [a.name, a.niche, a.markets.map((m) => m[0]), a.accounts, a.videosPerWeek, a.views30 / 1e6, (a.weeks || []).map((w) => w / 1e6),
        a.bestX ? xfm(a.bestX) : '—', (a.top || []).map((t) => t.cover || ''), (a.top || []).map((t) => nfm(t.views)), a.icon || '', a.slug, (a.top || []).map((t) => t.id), !!a.isNew, a.weekDelta === undefined ? null : a.weekDelta, typeof a.top10Share === 'number' ? a.top10Share : null, a.top && a.top[0] ? { x: a.top[0].x, handle: a.top[0].handle } : null,
        (a.top || []).map((t) => !!t.paid), a.placements || 0, a.kind || null, (a.top || []).map((t) => t.carousel || 0)]);
      MKD = Object.fromEntries(SRC.apps.map((a) => [a.name, a.markets.map(([c, p]) => [c, LBL[c] || MKN(c) || c, p])]));
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l || MKN(c) || c, c]));
      NIS = D.niches;
    } else if (D === null) {
      A = [];
    }
    const flagsOf = (a) => a[2].filter((c) => c).slice(0, 3).map((c) => ({ c }));
    const ficheOf = (a) => (a[11] ? '/app/apps/' + a[11] : '/app/apps');
    const videoOf = (a, j) => '/app/videos/' + ((a[12] && a[12][j]) || vkey(a[8][j]));
    const isNew = (a) => (a[13] !== undefined ? a[13] : !!a[6] && a[6][0] + a[6][1] < 0.2);
    // Les niches de l'adresse (/app/apps?niche=…, pastilles de l'accueil ou filtres choisis sur l'autre version), le tri et
    // la période : l'état, sinon l'adresse. Une valeur inconnue (la période personnalisée de l'ordinateur) est ignorée.
    const niches = (this.fv('niches') || []).filter((n) => NIS.indexOf(n) >= 0), sort0 = this.fv('sort'), period0 = this.fv('period');
    const sort = ['vues', 'accel', 'nouvelles'].indexOf(sort0) >= 0 ? sort0 : 'vues', period = period0 === '7' ? '7' : '30';
    const fr = (x, d) => x.toFixed(d).replace('.', ',');
    const okM = (a, m) => m === 'ALL' || scoped || a[2].indexOf(m) >= 0;
    const okN = (a, ns) => ns.length === 0 || ns.indexOf(a[1]) >= 0;
    const views = (a) => (period === '7' ? a[6][5] : a[5]);
    // Variation de la semaine : celle du document (null quand la semaine d'avant est vide), sinon calculée sur l'exemple.
    const dlt = (a) => (a[14] !== undefined ? a[14] : a[6] && a[6][4] > 0 ? (a[6][5] - a[6][4]) / a[6][4] : null);
    const dfmt = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
    const dv = (a) => { const d = dlt(a); return d === null ? -1e9 : d; };
    const avail = (a) => !!a[6] || (period !== '7' && sort === 'vues');
    let list = A.filter((a) => okM(a, market) && okN(a, niches) && avail(a));
    if (sort === 'nouvelles') list = list.filter(isNew);
    list = list.slice().sort((x, y) => (sort === 'accel' ? dv(y) - dv(x) : views(y) - views(x)));
    const limit = st.limit || 30, total = list.length;
    // Marchés en texte (« US 88 % · MX 12 % ») : les parts du document quand on les a, sinon les codes.
    const mkText = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2]]) : a[2].map((c) => [c, null]);
      return l.filter((m) => m[0]).slice(0, 2).map(([c, p]) => c + (p !== null && p !== undefined ? ' ' + p + '\u202f%' : '')).join(' · '); };
    // Les mêmes marchés en drapeaux (data-c = code du marché, n'importe quel code pays ISO).
    const mkList = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2], m[1]]) : a[2].map((c) => [c, null, c]);
      // La ligne garde ses 2 premiers pays, sans repère pour le reste (demande du 14/11) : les parts
      // complètes sont dans l'aperçu et sur la fiche.
      const k = l.filter((m) => m[0]);
      return k.slice(0, 2).map(([c, p, t]) => ({ c, p: p !== null && p !== undefined ? p + '\u202f%' : '', t })); };
    const rows = list.slice(0, limit).map((a, i) => { const w = a[6] || [1, 1, 1, 1, 1, 1], mx = Math.max.apply(null, w) || 1, d = a[6] ? dlt(a) : null, up = d === null || d >= 0;
      const pts = w.map((v, j) => [j * 20, 36 - (v / mx) * 32]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      return { rank: String(i + 1).padStart(2, '0'), n: a[0], niche: a[1], mkText: mkText(a), mks: mkList(a), v30: nfm(views(a) * 1e6),
        hasDelta: d !== null, delta: d === null ? '' : dfmt(d), dInk: up ? 'var(--accent)' : 'var(--ink-faint)', stroke: up ? '#4C9AFF' : '#8A93A3',
        line, area: line + ' L100 40 L0 40 Z', gid: 'mapl' + i, ex: '100', ey: (pts[5][1] / 40 * 100).toFixed(1), hasW: !!a[6],
        covs: a[8].map((src, j) => ({ src, v: a[9][j] || '', href: videoOf(a, j), paid: !!(a[17] && a[17][j]), car: a[20] && a[20][j] ? String(a[20][j]) : '' })).filter((c) => c.src),
        kindL: ({ app: 'App', saas: 'SaaS', jeu_mobile: 'Jeu mobile' })[a[19]] || '', plc: a[18] > 0 ? a[18] + (a[18] > 1 ? ' placements payés' : ' placement payé') : '', logo: a[10] || false, nologo: !a[10], blank: a[10] ? '' : 'sw-app-blank', open: () => this.setState({ pv: a[0] }) }; });
    const mLabel = market === 'ALL' ? 'Tous' : MKS.filter((m) => m[0] === market)[0][1];
    const chips = [];
    if (market !== 'ALL') chips.push({ label: mLabel, clear: () => this.setF({ market: 'ALL' }) });
    niches.forEach((n) => chips.push({ label: n, clear: () => this.setF({ niches: niches.filter((x) => x !== n) }) }));
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const mItems = MKS.map((m) => { const n = m[0] === 'ALL' ? (D && D.apps ? D.apps.length : A.length) : (MAPPS && MAPPS[m[0]] !== undefined ? MAPPS[m[0]] : A.filter((r) => r[2].indexOf(m[0]) >= 0).length); const on = market === m[0];
      return Object.assign({ label: m[1], flag: m[2] || false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => this.setF({ market: m[0] }) }, radio(on)); });
    const nItems = NIS.map((nm) => { const n = A.filter((r) => okM(r, market) && r[1] === nm && avail(r)).length; const on = niches.indexOf(nm) >= 0;
      return { label: nm, n, sel: on ? 'true' : 'false', o: n === 0 ? 0.45 : 1, pick: () => this.setF({ niches: on ? niches.filter((x) => x !== nm) : niches.concat([nm]) }) }; });
    const sheetKeys = (k) => (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ [k]: k === 'pv' ? null : false }); } };
    const pa = A.filter((a) => a[0] === st.pv)[0];
    // Suivre une app : sur le site, follows.apps (saved) par slug, comme sur ordinateur — 18/11 : ici, seul l'écran
    // changeait, rien n'était gardé (l'app n'arrivait jamais dans « Apps suivies ») ; sur le canevas, l'état local.
    const PF = this.props || {};
    const liveF = typeof PF.saved === 'function' && typeof PF.save === 'function';
    const fwM = liveF ? PF.saved('follows') : null;
    const followedM = (a) => (liveF ? !!(fwM && a[11] && (fwM.apps || []).indexOf(a[11]) >= 0) : !!(st.follow || {})[a[0]]);
    const toggleM = (a) => {
      if (!liveF) return this.setState({ follow: Object.assign({}, st.follow || {}, { [a[0]]: !followedM(a) }) });
      const cur = PF.saved('follows');
      if (cur === undefined || !a[11]) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      next.apps = l.indexOf(a[11]) >= 0 ? l.filter((x) => x !== a[11]) : [a[11]].concat(l);
      PF.save('follows', next);
    };
    let pv = { on: false };
    if (pa) { const w = pa[6] || [1, 1, 1, 1, 1, 1], mx = Math.max.apply(null, w) || 1, d = pa[6] ? dlt(pa) : null, md = MKD[pa[0]];
      const pts = w.map((v, j) => [4 + j * (292 / 5), 56 - (v / mx) * 50]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const at = D && D.updatedAt ? D.updatedAt : null;
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      // Sa place : dans sa niche (au moins 2 apps, pas « Autres »), sinon parmi toutes les apps du Radar.
      let pool = A.filter((x) => x[1] === pa[1]);
      const inNiche = pa[1] && pa[1] !== 'Autres' && pool.length >= 2;
      if (!inNiche) pool = A;
      pool = pool.slice().sort((x, y) => y[5] - x[5]);
      const at1 = pool.indexOf(pa);
      const hatchB = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 6px), rgba(255,255,255,0.04)';
      const shown = at1 < 6 ? pool.slice(0, 6) : pool.slice(0, 5).concat([pa]);
      const t10 = typeof pa[15] === 'number' && pa[3] > 10 ? pa[15] : null;
      const t0 = pa[16] || null;
      const grp = (n) => Number(n || 0).toLocaleString('en-US').replace(/,/g, '\u202f');
      pv = { on: true, full: !!pa[6], lite: !pa[6], n: pa[0], niche: pa[1], mkText: mkText(pa), mks: mkList(pa), href: ficheOf(pa), logo: pa[10] || false, nologo: !pa[10], blank: pa[10] ? '' : 'sw-app-blank',
        v30: nfm(pa[5] * 1e6), week: nfm(w[5] * 1e6), delta: d === null ? '' : dfmt(d),
        dBg: d !== null && d >= 0 ? 'var(--accent-soft)' : 'rgba(255,255,255,0.09)', dInk: d !== null && d >= 0 ? 'var(--accent)' : 'var(--ink-soft)',
        line, area: line + ' L296 60 L4 60 Z',
        labels: w.map((_, j) => ({ t: j === 5 ? 'Cette sem.' : at ? day(at - (6 - j) * 7 * 86400000) : 'S−' + (5 - j), ink: j === 5 ? '#FFFFFF' : '#8A93A3', fw: j === 5 ? '600' : '400' })),
        rank: at1 >= 0 ? 'N°' + (at1 + 1) : '—', rankOf: 'sur ' + pool.length + ' apps ' + (inNiche ? 'de ' + pa[1] : 'du Radar'),
        bars: shown.map((x) => ({ h: Math.max(4, Math.round(x[5] / (pool[0][5] || 1) * 100)) + '%', bg: x === pa ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : hatchB })),
        acc: grp(pa[3]), accLabel: pa[3] > 1 ? 'comptes' : 'compte', hasTop10: t10 !== null, top10: Math.round((t10 || 0) * 100) + '\u202f%',
        waffle: Array.from({ length: 20 }, (_, c) => ({ bg: c < Math.round((t10 || 0) * 20) ? '#4C9AFF' : 'rgba(255,255,255,0.08)' })),
        hasTop: !!pa[8][0], top: pa[8][0] ? { cover: pa[8][0], views: (pa[9][0] || '') + ' vues', href: videoOf(pa, 0), x: t0 && t0.x ? xfm(t0.x) + ' sa normale' : '', who: t0 && t0.handle ? '@' + t0.handle : '', paid: !!(pa[17] && pa[17][0]) } : {},
        ppw: grp(pa[4]), best: pa[7] && pa[7] !== '—' ? pa[7] : '',
        hasMk: !!md, noMk: !md, mkd: (() => {
          const l = md || [], top = l.length === 3 ? l : l.slice(0, 2), rest = l.slice(top.length);
          const out = top.map((m, n) => ({ c: m[0], l: m[1], full: m[1], p: m[2] + '\u202f%', w: m[2] + '%', flex: m[2] + ' 1 0%', bg: n === 0 ? '#4C9AFF' : 'rgba(76,154,255,0.55)', stack: false, fl: [] }));
          if (rest.length) { const rp = rest.reduce((n, m) => n + m[2], 0);
            out.push({ c: '', l: '+' + rest.length + '\u00a0pays', full: rest.map((m) => m[1] + ' ' + m[2] + '\u202f%').join(', '), p: rp + '\u202f%', w: rp + '%', flex: rp + ' 1 0%', bg: 'rgba(255,255,255,0.28)', stack: true, fl: rest.slice(0, 2).map((m, j) => ({ c: m[0], ml: j ? '-6px' : '0' })) }); }
          return out; })(),
        followLabel: followedM(pa) ? 'Suivie' : 'Suivre', followOn: followedM(pa) ? 'true' : 'false', followYes: followedM(pa), followNo: !followedM(pa), follow: () => toggleM(pa) }; }
    const swipe = (k) => ({ s: (e) => { this.y0 = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, e: (e) => { const t = e.changedTouches && e.changedTouches[0]; if (this.y0 != null && t && t.clientY - this.y0 > 60) this.setState({ fs: false, pv: null }); this.y0 = null; } });
    return {
      rows, empty: total === 0, emptyText: A.length === 0 ? 'Aucune app à montrer pour l’instant.' : 'Aucune app pour ces filtres.', canClear: A.length > 0, chips, hasChips: chips.length > 0, nf: chips.length || false, mLabel, nLabel: niches.length === 0 ? 'Toutes' : (niches.length === 1 ? niches[0] : niches.length + ' niches'),
      pLabel: period === '7' ? '7 j' : '30 j', togglePeriod: () => this.setF({ period: period === '7' ? '30' : '7' }),
      sorts: [['vues', 'Les plus vues'], ['accel', 'Qui accélèrent'], ['nouvelles', 'Nouvelles']].map((s) => ({ l: s[1], on: s[0] === sort ? 'true' : 'false', pick: () => this.setF({ sort: s[0], sortBy: null, dir: null }) })),
      fs: !!st.fs, fsOpen: st.fs ? 'true' : 'false', openFs: () => this.setState({ fs: true }), closeFs: () => this.setState({ fs: false }), fsKeys: sheetKeys('fs'), setFsClose: (el) => { this.fsClose = el; },
      hasMore: total > limit, moreLabel: 'Voir ' + Math.min(30, total - limit) + ' apps de plus', showMore: () => this.setState({ limit: limit + 30 }),
      mItems, nItems, seeLabel: total === 0 ? 'Aucune app, élargis les filtres' : (total === 1 ? 'Voir l’app' : 'Voir les ' + total + ' apps'), clearAll: () => this.setF({ market: 'ALL', niches: [], sort: 'vues' }),
      pv, closePv: () => this.setState({ pv: null }), pvKeys: sheetKeys('pv'), setPvClose: (el) => { this.pvClose = el; },
      tStart: swipe().s, tEnd: swipe().e
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "data-pull": "", "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(150px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Apps"
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
        $h("section", { "aria-label": "Classement et filtres", "class": "m-fc" },
          $h("div", { "class": "m-fc-row" },
            $h("button", { "class": "m-fb is-on", "type": "button", "aria-pressed": $v.fsOpen, "onClick": $v.openFs },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 6h16M7 12h10M10 18h4", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Filtres",
              ($v.nf) ? [
                $h("span", { "class": "sw-count", "style": "box-shadow: none;" },
                  $t($v.nf)
                )
              ] : null
            ),
            $h("button", { "class": "m-fb", "type": "button", "onClick": $v.openFs },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "class": "m-fb-k" },
                "Marché"
              ),
              $h("span", { "class": "m-fb-v" },
                $t($v.mLabel)
              ),
              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("button", { "class": "m-fb", "type": "button", "onClick": $v.openFs },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "class": "m-fb-k" },
                "Niche"
              ),
              $h("span", { "class": "m-fb-v" },
                $t($v.nLabel)
              ),
              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("button", { "class": "m-fb", "type": "button", "onClick": $v.togglePeriod },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "class": "m-fb-k" },
                "Période"
              ),
              $h("span", { "class": "m-fb-v" },
                $t($v.pLabel)
              )
            )
          )
        ),
        ($v.hasChips) ? [
          $h("div", { "style": "padding-top: 10px; display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
            ($l($v.chips)).map((c) => [
              $h("button", { "class": "sw-badge sw-badge-accent", "type": "button", "onClick": c?.clear, "aria-label": `Retirer le filtre ${$t(c?.label)}`, "style": "height: 44px; flex-shrink: 0; padding: 0 10px 0 14px; gap: 8px; border: 0; cursor: pointer; font-family: inherit; font-size: 13px;" },
                $t(c?.label),
                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          )
        ] : null,
        $h("div", { "data-swipe": "", "style": "padding: 16px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
          ($v.empty) ? [
            $h("div", { "style": "padding: 32px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;" },
              $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                $t($v.emptyText)
              ),
              ($v.canClear) ? [
                $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.clearAll, "style": "height: 44px;" },
                  "Effacer les filtres"
                )
              ] : null
            )
          ] : null,
          ($l($v.rows)).map((r) => [
            $h("div", { "style": "content-visibility: auto; contain-intrinsic-size: auto 214px; border-radius: 20px; overflow: hidden; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("button", { "data-sheet-src": "", "type": "button", "onClick": r?.open, "aria-label": `Aperçu de ${$t(r?.n)}`, "style": "width: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 14px 14px 10px; border: 0; background: transparent; text-align: left; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                $h("span", { "style": "width: 18px; flex-shrink: 0; padding-top: 3px; font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                  $t(r?.rank)
                ),
                $h("span", { "data-sheet-ico": "", "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;" },
                  (r?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": $u(r?.logo), "alt": "", "decoding": "async", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (r?.nologo) ? [
                    $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 6px;" },
                  $h("span", { "style": "max-width: 100%; min-width: 0; display: inline-flex; align-items: center; gap: 8px;" },
                    $h("span", { "data-sheet-name": "", "style": "min-width: 0; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                      $t(r?.n)
                    ),
                    (r?.kindL) ? [
                      $h("span", { "style": "flex-shrink: 0; display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 6px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 11px; font-weight: 600; color: var(--ink-soft);" },
                        $t(r?.kindL)
                      )
                    ] : null
                  ),
                  $h("span", { "class": "m-tagn" },
                    $h("span", { "class": "m-ic", "data-i": r?.niche, "aria-hidden": "true" }),
                    $t(r?.niche)
                  ),
                  $h("span", { "style": "display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                    ($l(r?.mks)).map((k) => [
                      $h("span", { "title": k?.t, "style": "display: inline-flex; align-items: center; gap: 5px;" },
                        $h("span", { "class": "sw-flag", "data-c": k?.c, "aria-hidden": "true" }),
                        $t(k?.p)
                      )
                    ])
                  ),
                  (r?.plc) ? [
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                      $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                        "€"
                      ),
                      $t(r?.plc)
                    )
                  ] : null
                ),
                $h("span", { "style": "flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: 22px; letter-spacing: -0.03em; white-space: nowrap;" },
                    $t(r?.v30)
                  ),
                  (r?.hasDelta) ? [
                    $h("span", { "style": `font-size: 12px; font-weight: 600; color: ${$t(r?.dInk)}; white-space: nowrap;` },
                      $t(r?.delta)
                    )
                  ] : null
                )
              ),
              (r?.hasW) ? [
                $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 0 14px 14px;" },
                  $h("span", { "aria-hidden": "true", "style": "position: relative; flex: 1; min-width: 0; height: 56px;" },
                    $h("svg", { "viewBox": "0 0 100 40", "preserveAspectRatio": "none", "style": "position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;" },
                      $h("defs", null,
                        $h("linearGradient", { "id": r?.gid, "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                          $h("stop", { "offset": "0", "stop-color": r?.stroke, "stop-opacity": "0.30" }),
                          $h("stop", { "offset": "1", "stop-color": r?.stroke, "stop-opacity": "0" })
                        )
                      ),
                      $h("path", { "d": r?.area, "fill": `url(#${$t(r?.gid)})` }),
                      $h("path", { "d": r?.line, "fill": "none", "stroke": r?.stroke, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "vector-effect": "non-scaling-stroke" })
                    ),
                    $h("span", { "style": `position: absolute; left: ${$t(r?.ex)}%; top: ${$t(r?.ey)}%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: ${$t(r?.stroke)}; box-shadow: 0 0 0 3px rgba(5,7,12,0.55);` })
                  ),
                  $h("span", { "style": "display: flex; gap: 6px; flex-shrink: 0;" },
                    ($l(r?.covs)).map((c) => [
                      $h("a", { "href": $u(c?.href), "class": "sw-video", "aria-label": `Vidéo à ${$t(c?.v)} vues`, "style": "display: block; width: 56px; border-radius: 10px;" },
                        $h("img", { "class": "sw-cover", "src": $u(c?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                        $h("span", { "class": "sw-video-shade" }),
                        (c?.car) ? [
                          $h("span", { "title": `Carrousel de ${$t(c?.car)} photos`, "aria-label": "Carrousel", "style": "position: absolute; top: 4px; right: 4px; z-index: 2; height: 18px; padding: 0 5px; border-radius: 999px; background: rgba(5,7,12,0.66); color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;" },
                            $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                              $h("path", { "d": "M8 8h12v12H8zM4 16V4h12", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linejoin": "round" })
                            ),
                            $t(c?.car)
                          )
                        ] : null,
                        (c?.paid) ? [
                          $h("span", { "title": "Placement payé : compte payé pour cette vidéo", "aria-label": "Placement payé", "style": "position: absolute; top: 4px; left: 4px; z-index: 2; width: 18px; height: 18px; border-radius: 50%; background: #F5B941; color: #1A1206; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px rgba(5,7,12,0.6);" },
                            "€"
                          )
                        ] : null,
                        $h("span", { "style": "position: absolute; left: 6px; bottom: 5px; font-size: 11px; font-weight: 700; color: #FFFFFF;" },
                          $t(c?.v)
                        )
                      )
                    ])
                  )
                )
              ] : null
            )
          ]),
          ($v.hasMore) ? [
            $h("div", { "style": "display: flex; justify-content: center; padding-top: 4px;" },
              $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showMore, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit; font-size: 14px;" },
                $t($v.moreLabel),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null
        ),
        $h("p", { "class": "sw-calc", "style": "margin: 16px 20px 0;" },
          "Vues des vidéos publiées par les comptes de chaque app."
        ),
        ($v.fs) ? [
          $h("button", { "data-sheet-veil": "", "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeFs, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "data-sheet": "", "role": "dialog", "aria-modal": "true", "aria-label": "Filtrer les apps", "onKeyDown": $v.fsKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px;" },
            $h("div", { "data-sheet-handle": "", "style": "display: flex; justify-content: center; padding: 10px 0 6px; " },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; padding: 2px 0 10px;" },
              $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                "Filtrer"
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 4px;" },
                $h("button", { "type": "button", "onClick": $v.clearAll, "style": "min-height: 44px; padding: 0 8px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Tout effacer"
                )
              )
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Marché"
            ),
            $h("div", { "data-sheet-opts": "", "role": "radiogroup", "aria-label": "Marché", "style": "display: flex; flex-direction: column; padding: 6px 0 14px;" },
              ($l($v.mItems)).map((it) => [
                $h("button", { "data-sheet-opt": "", "type": "button", "role": "radio", "aria-checked": it?.sel, "onClick": it?.pick, "style": `display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; border: 0; border-radius: 14px; background: ${$t(it?.bg)}; color: var(--ink); font-family: inherit; font-size: 16px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)}; -webkit-tap-highlight-color: transparent;` },
                  $h("span", { "aria-hidden": "true", "style": `width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                    $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  (it?.flag) ? [
                    $h("span", { "class": "sw-flag", "data-c": it?.flag, "aria-hidden": "true" })
                  ] : null,
                  $h("span", { "style": `flex: 1; font-weight: ${$t(it?.w)};` },
                    $t(it?.label)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    $t(it?.n)
                  )
                )
              ])
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Niche, plusieurs possibles"
            ),
            $h("div", { "style": "display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 0 6px;" },
              ($l($v.nItems)).map((it) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": it?.sel, "onClick": it?.pick, "style": `height: 44px; opacity: ${$t(it?.o)};` },
                  $t(it?.label),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(it?.n)
                  )
                )
              ])
            ),
            $h("div", { "style": "position: sticky; bottom: 0; z-index: 2; margin: 0 -20px; padding: 14px 20px max(16px, env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 8px; background: linear-gradient(180deg, rgba(13,17,26,0) 0%, rgba(13,17,26,0.96) 34%, #0D111A 100%);" },
              $h("button", { "class": "sw-btn sw-btn-ghost", "type": "button", "ref": $v.setFsClose, "onClick": $v.closeFs, "style": "flex: 0 0 auto; height: 50px; padding: 0 22px; background: #191D25; font-size: 15px;" },
                "Fermer"
              ),
              $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.closeFs, "style": "flex: 1 1 0; min-width: 0; height: 50px; justify-content: space-between; padding: 0 5px 0 20px; font-size: 15px; text-decoration: none;" },
                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                  $t($v.seeLabel)
                ),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        ] : null,
        ($v.pv?.on) ? [
          $h("button", { "data-sheet-veil": "", "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closePv, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "data-sheet": "", "role": "dialog", "aria-modal": "true", "aria-label": `Aperçu de ${$t($v.pv?.n)}`, "onKeyDown": $v.pvKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 96vh; max-height: 96dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px;" },
            $h("div", { "data-sheet-handle": "", "style": "display: flex; justify-content: center; padding: clamp(6px, 1.2vh, 10px) 0 clamp(4px, 0.8vh, 6px); " },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 2px 0 clamp(8px, 1.4vh, 12px);" },
              $h("span", { "data-sheet-ico": "", "class": `sw-app-icon ${$t($v.pv?.blank)}`, "style": "width: clamp(44px, 7.5vh, 56px); height: clamp(44px, 7.5vh, 56px); border-radius: 16px;" },
                ($v.pv?.logo) ? [
                  $h("img", { "class": "sw-logo-img", "src": $u($v.pv?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.pv?.nologo) ? [
                  $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null
              ),
              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                $h("span", { "data-sheet-name": "", "style": "font-family: var(--font-display); font-size: clamp(20px, 3.4vh, 24px); font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.pv?.n)
                ),
                $h("span", { "style": "display: flex;" },
                  $h("span", { "class": "m-tagn" },
                    $h("span", { "class": "m-ic", "data-i": $v.pv?.niche, "aria-hidden": "true" }),
                    $t($v.pv?.niche)
                  )
                )
              ),
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn, "style": "flex-shrink: 0; height: 40px; gap: 7px; margin-right: -4px;" },
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
              )
            ),
            $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(6px, 1vh, 8px);" },
              $h("section", { "aria-label": "Vues sur 30 jours", "style": "grid-column: 1 / span 2; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: clamp(10px, 1.8vh, 14px) 16px clamp(8px, 1.2vh, 10px); display: flex; flex-direction: column;" },
                $h("div", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;" },
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Vues sur 30 jours"
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: clamp(26px, 4.2vh, 34px);" },
                      $t($v.pv?.v30)
                    )
                  ),
                  $h("div", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      "Cette semaine"
                    ),
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                      $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: 17px; letter-spacing: -0.02em;" },
                        $t($v.pv?.week)
                      ),
                      ($v.pv?.delta) ? [
                        $h("span", { "style": `display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: ${$t($v.pv?.dBg)}; font-size: 12px; font-weight: 600; color: ${$t($v.pv?.dInk)}; white-space: nowrap;` },
                          $t($v.pv?.delta)
                        )
                      ] : null
                    )
                  )
                ),
                ($v.pv?.full) ? [
                  $h("svg", { "viewBox": "0 0 300 60", "preserveAspectRatio": "none", "role": "img", "aria-label": "Vues par semaine sur 6 semaines", "class": "m-pv-ch", "style": "width: 100%; height: clamp(34px, 7vh, 62px); margin-top: clamp(6px, 1vh, 10px); overflow: visible;" },
                    $h("defs", null,
                      $h("linearGradient", { "id": "mpvAr", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                        $h("stop", { "offset": "0", "stop-color": "#4C9AFF", "stop-opacity": "0.32" }),
                        $h("stop", { "offset": "1", "stop-color": "#4C9AFF", "stop-opacity": "0" })
                      )
                    ),
                    $h("path", { "d": $v.pv?.area, "fill": "url(#mpvAr)" }),
                    $h("path", { "d": $v.pv?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" })
                  ),
                  $h("div", { "class": "m-pv-lb", "style": "display: flex; justify-content: space-between; margin-top: 5px;" },
                    ($l($v.pv?.labels)).map((l) => [
                      $h("span", { "style": `font-size: 10px; color: ${$t(l?.ink)}; font-weight: ${$t(l?.fw)};` },
                        $t(l?.t)
                      )
                    ])
                  )
                ] : null,
                ($v.pv?.lite) ? [
                  $h("span", { "style": "margin-top: 8px; font-size: 13px; color: var(--ink-muted);" },
                    "Pas encore de détail par semaine pour cette app."
                  )
                ] : null
              ),
              $h("section", { "aria-label": "Sa place", "style": "min-width: 0; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: clamp(10px, 1.6vh, 14px) 14px; display: flex; flex-direction: column;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Sa place"
                ),
                $h("span", { "style": "margin-top: 6px; font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: clamp(22px, 3.4vh, 28px);" },
                  $t($v.pv?.rank)
                ),
                $h("span", { "style": "margin-top: 3px; font-size: 11px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.pv?.rankOf)
                ),
                $h("div", { "aria-hidden": "true", "style": "height: clamp(18px, 4vh, 44px); margin-top: auto; padding-top: 8px; display: flex; align-items: flex-end; gap: 4px;" },
                  ($l($v.pv?.bars)).map((b) => [
                    $h("span", { "style": `flex: 1; height: ${$t(b?.h)}; min-height: 3px; border-radius: 5px 5px 2px 2px; background: ${$t(b?.bg)};` })
                  ])
                )
              ),
              $h("section", { "aria-label": "Son réseau", "style": "min-width: 0; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: clamp(10px, 1.6vh, 14px) 14px; display: flex; flex-direction: column;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Son réseau"
                ),
                $h("span", { "style": "margin-top: 6px; display: flex; align-items: baseline; gap: 5px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: clamp(22px, 3.4vh, 28px);" },
                    $t($v.pv?.acc)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    $t($v.pv?.accLabel)
                  )
                ),
                ($v.pv?.hasTop10) ? [
                  $h("div", { "aria-hidden": "true", "style": "margin-top: auto; padding-top: 8px; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px;" },
                    ($l($v.pv?.waffle)).map((c) => [
                      $h("span", { "style": `height: clamp(6px, 1.2vh, 10px); border-radius: 2px; background: ${$t(c?.bg)};` })
                    ])
                  ),
                  $h("span", { "style": "margin-top: 5px; font-size: 11px; color: var(--ink-faint);" },
                    $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                      "10 comptes"
                    ),
                    " font ", $t($v.pv?.top10), " des vues"
                  )
                ] : null
              ),
              ($v.pv?.hasTop) ? [
                $h("a", { "href": $u($v.pv?.top?.href), "aria-label": "Lire sa vidéo la plus vue", "style": "grid-column: 1 / span 2; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 8px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink);" },
                  $h("span", { "class": "sw-video", "style": "flex: 0 0 auto; width: clamp(42px, 7vh, 72px); aspect-ratio: 3 / 4; border-radius: 12px;" },
                    $h("img", { "class": "sw-cover", "src": $u($v.pv?.top?.cover), "alt": "", "loading": "lazy", "decoding": "async" })
                  ),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px;" },
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Sa vidéo la plus vue"
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: clamp(20px, 3vh, 24px);" },
                      $t($v.pv?.top?.views)
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 12px; color: var(--ink-faint);" },
                      ($v.pv?.top?.x) ? [
                        $h("span", { "style": "flex-shrink: 0; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: var(--accent-soft); font-weight: 600; color: var(--accent);" },
                          $t($v.pv?.top?.x)
                        )
                      ] : null,
                      ($v.pv?.top?.paid) ? [
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                          $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                            "€"
                          ),
                          "Placement payé"
                        )
                      ] : null,
                      $h("span", { "style": "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t($v.pv?.top?.who)
                      )
                    )
                  )
                )
              ] : null,
              $h("section", { "aria-label": "Vidéos par semaine", "style": "min-width: 0; border-radius: 20px; background: var(--track); padding: clamp(10px, 1.6vh, 14px) 14px; display: flex; flex-direction: column; gap: 5px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Vidéos par semaine"
                ),
                $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; letter-spacing: -0.04em; font-size: clamp(20px, 3vh, 24px);" },
                  $t($v.pv?.ppw)
                ),
                ($v.pv?.best) ? [
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    "meilleure à ",
                    $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                      $t($v.pv?.best)
                    ),
                    " sa normale"
                  )
                ] : null
              ),
              $h("section", { "aria-label": "D’où publient ses comptes", "style": "min-width: 0; border-radius: 20px; background: var(--track); padding: clamp(10px, 1.6vh, 14px) 14px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "style": "display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.3; color: var(--ink-muted);" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "D’où publient ses comptes"
                ),
                ($v.pv?.hasMk) ? [
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 8px; margin-top: 2px;" },
                    $h("span", { "aria-hidden": "true", "style": "display: flex; gap: 2px; height: 6px; border-radius: 3px; overflow: hidden; flex-shrink: 0;" },
                      ($l($v.pv?.mkd)).map((m) => [
                        $h("span", { "style": `flex: ${$t(m?.flex)}; min-width: 3px; background: ${$t(m?.bg)};` })
                      ])
                    ),
                    $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                      ($l($v.pv?.mkd)).map((m) => [
                        $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 5px; font-size: 11px; line-height: 18px;" },
                          $h("span", { "style": "display: inline-flex; align-items: center; gap: 5px; min-width: 0; color: var(--ink-soft);" },
                            $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true", "style": "flex-shrink: 0;" }),
                            (m?.stack) ? [
                              $h("span", { "aria-hidden": "true", "style": "display: inline-flex; flex-shrink: 0;" },
                                ($l(m?.fl)).map((f) => [
                                  $h("span", { "class": "sw-flag", "data-c": f?.c, "style": `margin-left: ${$t(f?.ml)}; box-shadow: 0 0 0 2px rgba(12,15,22,0.95);` })
                                ])
                              )
                            ] : null,
                            $h("span", { "title": m?.full, "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                              $t(m?.l)
                            )
                          ),
                          $h("span", { "style": "flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; white-space: nowrap;" },
                            $h("span", { "aria-hidden": "true", "style": `width: 7px; height: 7px; border-radius: 2px; background: ${$t(m?.bg)};` }),
                            $h("span", { "style": "min-width: 2.7em; text-align: right; font-variant-numeric: tabular-nums;" },
                              $t(m?.p)
                            )
                          )
                        )
                      ])
                    )
                  )
                ] : null,
                ($v.pv?.noMk) ? [
                  $h("span", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
                    ($l($v.pv?.mks)).map((k) => [
                      $h("span", { "class": "sw-flag", "data-c": k?.c, "title": k?.t, "aria-hidden": "true" })
                    ])
                  )
                ] : null
              )
            ),
            $h("div", { "style": "position: sticky; bottom: 0; z-index: 2; margin: 0 -20px; padding: 14px 20px max(16px, env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 8px; background: linear-gradient(180deg, rgba(13,17,26,0) 0%, rgba(13,17,26,0.96) 34%, #0D111A 100%);" },
              $h("button", { "class": "sw-btn sw-btn-ghost", "type": "button", "ref": $v.setPvClose, "onClick": $v.closePv, "style": "flex: 0 0 auto; height: 50px; padding: 0 22px; background: #191D25; font-size: 15px;" },
                "Fermer"
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $u($v.pv?.href), "style": "flex: 1 1 0; min-width: 0; height: 50px; justify-content: space-between; padding: 0 5px 0 20px; font-size: 15px; text-decoration: none;" },
                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                  "Ouvrir la fiche"
                ),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        ] : null,
        $h("div", { "data-swipe-skip": "", "style": "position: fixed; left: 12px; right: 12px; bottom: calc(max(12px, env(safe-area-inset-bottom)) + 72px); z-index: 29; padding: 4px; border-radius: 16px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 14px 36px rgba(0,0,0,0.45);" },
          $h("div", { "class": "m-tc is-flat", "role": "tablist", "aria-label": "Classement", "data-swipe-tabs": "" },
            ($l($v.sorts)).map((s) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": "min-height: 40px; font-size: 13px; font-weight: 600;" },
                $t(s?.l)
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
          $h("a", { "href": "/app/apps", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
