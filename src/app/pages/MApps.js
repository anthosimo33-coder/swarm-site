// Généré par scripts/dc2preact.py depuis design/app/MApps.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MApps extends DCLogic {

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
return {};
  }

  componentDidMount() {
    try { const P = this.props || {}; const q = (P.query && P.query.niche) || new URLSearchParams(window.location.search).get('niche'); if (q) this.setState({ niches: [q] }); } catch (e) {}
  }
  componentDidUpdate(pp, ps) {
    const st = this.state || {}; ps = ps || {};
    if (st.fs && !ps.fs && this.fsClose) this.fsClose.focus();
    if (st.pv && st.pv !== ps.pv && this.pvClose) this.pvClose.focus();
  }
  baseVals() {
    const st = this.state || {};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let A = [["Rizz App", "Séduction IA", ["US", "ID", "MX"], 82, 332, 59.67, [0.6, 10.8, 0.5, 16.1, 23.7, 14.1], "120×", ["/media/app/v-7702250997850098958.jpg", "/media/app/v-7700724672438045965.jpg", "/media/app/v-7702290769213672718.jpg"], ["2,6 M", "2,5 M", "1,9 M"], ""], ["Astra AI", "Études", ["ID", "US", "ES", "FR", "MX", "BR"], 269, 1360, 57.66, [10.6, 9.8, 8.9, 8.5, 17.3, 18.4], "2 333×", ["/media/app/v-7700392351268752661.jpg", "/media/app/v-7697654738124442896.jpg", "/media/app/v-7702743575934684437.jpg"], ["2,6 M", "2,6 M", "2,3 M"], "/media/app/app-astra-ai.jpg"], ["Knowunity", "Études", ["US", "ID", "ES", "FR", "MX"], 55, 205, 44.43, [4.2, 0.6, 14.6, 16.8, 7.0, 6.1], "101×", ["/media/app/v-7699151144400244000.jpg", "/media/app/v-7702625361716170002.jpg", "/media/app/v-7698010148391947552.jpg"], ["5,7 M", "3,5 M", "2,5 M"], "/media/app/app-knowunity.jpg"], ["Love8", "Couple", ["ID", "US", "FR", "MX"], 83, 282, 35.06, [1.7, 3.4, 7.1, 4.0, 10.6, 12.6], "1 737×", ["/media/app/v-7705441234847862037.jpg", "/media/app/v-7705024255746002182.jpg", "/media/app/v-7701914062296337685.jpg"], ["2 M", "1,9 M", "1,8 M"], "/media/app/app-love8.jpg"], ["WRizz", "Séduction IA", ["US", "ID"], 81, 410, 31.94, [0.4, 2.5, 0.6, 8.0, 10.1, 12.4], "110×", ["/media/app/v-7706018218397273362.jpg", "/media/app/v-7700803310495829266.jpg", "/media/app/v-7701533350825037063.jpg"], ["5 M", "3 M", "1,9 M"], "/media/app/app-wrizz.jpg"], ["Wing AI", "Séduction IA", ["US", "MX"], 124, 251, 19.62, [0.7, 1.9, 1.6, 2.4, 7.0, 6.9], "109×", ["/media/app/v-7703242451120688405.jpg", "/media/app/v-7701632447951211798.jpg", "/media/app/v-7705479809580715284.jpg"], ["1,4 M", "876 k", "869 k"], "/media/app/app-wing-ai.jpg"], ["Cal AI", "Santé et physique", ["US"], 6, 42, 17.13, [0.01, 0.01, 0.3, 7.8, 5.4, 3.7], "9,5×", ["/media/app/v-7701127438704577823.jpg", "/media/app/v-7702142316479384853.jpg", "/media/app/v-7706561664451136788.jpg"], ["1,3 M", "878 k", "757 k"], "/media/app/app-cal-ai.jpg"], ["Praktika", "Langues", ["ID", "US", "FR", "BR", "MX"], 92, 577, 16.58, [5.9, 0.4, 0.4, 0.5, 7.7, 8.0], "70×", ["/media/app/v-7704867469072141588.jpg", "/media/app/v-7704226978622082324.jpg", "/media/app/v-7703758186087566612.jpg"], ["2,1 M", "1,9 M", "1,5 M"], "/media/app/app-praktika.jpg"], ["RecentFollow", "Jalousie et ex", ["US", "MX"], 39, 294, 13.06, [0.01, 0.01, 0.7, 1.1, 4.2, 7.0], "750×", ["/media/app/v-7705376808862076182.jpg", "/media/app/v-7706834426096815382.jpg", "/media/app/v-7700279402319367425.jpg"], ["1,2 M", "874 k", "854 k"], ""], ["The Cringe", "Jalousie et ex", ["US", "FR", "ID"], 18, 49, 12.18, [0.1, 0.01, 0.8, 2.9, 5.0, 3.4], "53×", ["/media/app/v-7703301496879861014.jpg", "/media/app/v-7705159889147923734.jpg", "/media/app/v-7701454363897629974.jpg"], ["2,5 M", "1,1 M", "1,1 M"], "/media/app/app-the-cringe.jpg"], ["Plug AI", "Séduction IA", ["US", "ID"], null, null, 11.0, null, null, [], [], ""], ["Umax", "Santé et physique", ["US"], null, null, 10.16, null, null, [], [], ""], ["The Ick", "Jalousie et ex", ["ID", "FR", "US", "MX", "ES"], null, null, 9.82, null, null, [], [], ""], ["FollowOtter", "Jalousie et ex", ["US"], null, null, 8.74, null, null, [], [], ""], ["Shortfy", "Side hustle", ["FR"], null, null, 7.3, null, null, [], [], ""], ["Airbuds", "Social et loisirs", ["US", "MX", "ID"], null, null, 7.06, null, null, [], [], ""], ["Sweatcoin", "Side hustle", ["MX", "US", "ID", "ES"], null, null, 5.19, null, null, [], [], ""], ["Voca AI", "Langues", ["US", "BR", "ID", "FR"], null, null, 4.97, null, null, [], [], ""], ["Snitchy", "Jalousie et ex", ["US", "FR", "ID"], null, null, 4.93, null, null, [], [], ""], ["Fluencify", "Side hustle", ["BR", "US", "MX", "ID"], null, null, 4.69, null, null, [], [], ""], ["What Brandon Thinks", "Jalousie et ex", ["US", "MX", "BR", "ID", "FR"], null, null, 4.53, null, null, [], [], ""], ["Flo", "Santé et physique", ["US", "BR", "ID"], null, null, 4.4, null, null, [], [], ""], ["Bible Chat", "Foi", ["US", "ID", "MX"], null, null, 4.37, null, null, [], [], ""], ["Quittr", "Santé et physique", ["US"], null, null, 3.74, null, null, [], [], ""], ["Creed", "Foi", ["US", "ID"], null, null, 3.34, null, null, [], [], ""], ["Airlearn", "Langues", ["US", "MX"], null, null, 3.25, null, null, [], [], ""], ["FollowSpy", "Jalousie et ex", ["MX", "US"], null, null, 3.18, null, null, [], [], ""], ["Retain Cards", "Études", ["FR", "ID", "US", "MX", "BR"], null, null, 3.03, null, null, [], [], "/media/app/retain-cards.jpg"], ["Glam AI", "Beauté IA", ["US", "ID", "MX"], null, null, 2.61, null, null, [], [], ""], ["Shady", "Jalousie et ex", ["US", "MX", "FR", "ID"], null, null, 1.73, null, null, [], [], ""], ["Fit AI", "Santé et physique", ["US"], null, null, 1.59, null, null, [], [], ""], ["Finch", "Santé et physique", ["US"], null, null, 1.46, null, null, [], [], ""], ["Serializd", "Social et loisirs", ["US"], null, null, 1.3, null, null, [], [], ""], ["Rizz Master", "Séduction IA", ["US"], null, null, 1.15, null, null, [], [], ""], ["CheatLove", "Jalousie et ex", ["FR"], null, null, 0.78, null, null, [], [], ""], ["Loverzz", "Couple", ["US", "ID", "BR"], null, null, 0.64, null, null, [], [], "/media/app/loverzz.jpg"], ["Flert Now", "Séduction IA", [], null, null, 0.43, null, null, [], [], ""], ["Sunsay", "Autres", [], null, null, 0.38, null, null, [], [], ""], ["Stalkie", "Jalousie et ex", ["US", "BR", "MX", "FR", "ID"], null, null, 0.34, null, null, [], [], "/media/app/stalkie.jpg"], ["SafeNow", "Autres", [], null, null, 0.22, null, null, [], [], ""], ["Katch", "Jalousie et ex", ["US", "FR"], null, null, 0.11, null, null, [], [], ""], ["Palima", "Autres", ["FR"], null, null, 0.09, null, null, [], [], ""], ["Lurk", "Jalousie et ex", ["MX", "US"], null, null, 0.09, null, null, [], [], ""], ["TrendSaaS", "Side hustle", ["FR", "ID"], null, null, 0.06, null, null, [], [], ""], ["Susly", "Jalousie et ex", ["US", "MX", "ID"], null, null, 0.06, null, null, [], [], ""], ["Kairo Alarme", "Autres", ["BR"], null, null, 0.02, null, null, [], [], ""], ["Leaked DMs", "Jalousie et ex", [], null, null, 0.01, null, null, [], [], ""]];
    let MKD = {"Astra AI": [["ID", "Indonésie et Vietnam", 65], ["US", "États-Unis", 19], ["ES", "Espagne", 8], ["BR", "Brésil et Portugal", 5]], "Love8": [["US", "États-Unis", 66], ["ID", "Indonésie et Vietnam", 23], ["FR", "France", 8], ["MX", "Amérique latine", 4]]};
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['ID', 'Indonésie et Vietnam', 'ID'], ['MX', 'Mexique et Amérique latine', 'MX'], ['FR', 'France', 'FR'], ['BR', 'Brésil', 'BR'], ['ES', 'Espagne', 'ES']];
    let NIS = ['Séduction IA', 'Jalousie et ex', 'Études', 'Santé et physique', 'Couple', 'Langues', 'Side hustle', 'Foi', 'Social et loisirs', 'Beauté IA'];
    // Sur le site : le classement du Radar (document « apps »), lu comme AppsA. A[i] = [nom, niche, marchés, comptes,
    // vidéos/sem., vues 30 j (M), 6 semaines (M), meilleure, miniatures, vues des miniatures, icône, slug, id des vidéos, nouvelle ?]
    const D = this.props && this.props.data;
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis et anglophones', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', DE: 'Allemagne et germanophones', SA: 'Monde arabe', RU: 'Russie et russophones' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const nfm = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const xfm = (x) => (x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    if (D && D.apps) {
      const LBL = Object.fromEntries(D.markets);
      A = D.apps.map((a) => [a.name, a.niche, a.markets.map((m) => m[0]), a.accounts, a.videosPerWeek, a.views30 / 1e6, (a.weeks || []).map((w) => w / 1e6),
        a.bestX ? xfm(a.bestX) : '—', (a.top || []).map((t) => t.cover || ''), (a.top || []).map((t) => nfm(t.views)), a.icon || '', a.slug, (a.top || []).map((t) => t.id), !!a.isNew, a.weekDelta === undefined ? null : a.weekDelta, typeof a.top10Share === 'number' ? a.top10Share : null, a.top && a.top[0] ? { x: a.top[0].x, handle: a.top[0].handle } : null]);
      MKD = Object.fromEntries(D.apps.map((a) => [a.name, a.markets.map(([c, p]) => [c, LBL[c] || MKN(c) || c, p])]));
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l || MKN(c) || c, c]));
      NIS = D.niches;
    } else if (D === null) {
      A = [];
    }
    const flagsOf = (a) => a[2].filter((c) => c).slice(0, 3).map((c) => ({ c }));
    const ficheOf = (a) => (a[11] ? '/app/apps/' + a[11] : '/app/apps/astraai');
    const videoOf = (a, j) => '/app/videos/' + ((a[12] && a[12][j]) || vkey(a[8][j]));
    const isNew = (a) => (a[13] !== undefined ? a[13] : !!a[6] && a[6][0] + a[6][1] < 0.2);
    // La niche de l'adresse (/app/apps?niche=…) : this.props.query sur le site, dès le premier rendu.
    const qn = this.props && this.props.query && this.props.query.niche;
    const market = st.market || 'ALL', niches = st.niches || (qn ? [qn] : []), sort = st.sort || 'vues', period = st.period || '30';
    const fr = (x, d) => x.toFixed(d).replace('.', ',');
    const okM = (a, m) => m === 'ALL' || a[2].indexOf(m) >= 0;
    const okN = (a, ns) => ns.length === 0 || ns.indexOf(a[1]) >= 0;
    const views = (a) => (period === '7' ? a[6][5] : a[5]);
    // Variation de la semaine : celle du document (null quand la semaine d'avant est vide), sinon calculée sur l'exemple.
    const dlt = (a) => (a[14] !== undefined ? a[14] : a[6] && a[6][4] > 0 ? (a[6][5] - a[6][4]) / a[6][4] : null);
    const dfmt = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %');
    const dv = (a) => { const d = dlt(a); return d === null ? -1e9 : d; };
    const avail = (a) => !!a[6] || (period !== '7' && sort === 'vues');
    let list = A.filter((a) => okM(a, market) && okN(a, niches) && avail(a));
    if (sort === 'nouvelles') list = list.filter(isNew);
    list = list.slice().sort((x, y) => (sort === 'accel' ? dv(y) - dv(x) : views(y) - views(x)));
    const limit = st.limit || 30, total = list.length;
    // Marchés en texte (« US 88 % · MX 12 % ») : les parts du document quand on les a, sinon les codes.
    const mkText = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2]]) : a[2].map((c) => [c, null]);
      return l.filter((m) => m[0]).slice(0, 2).map(([c, p]) => c + (p !== null && p !== undefined ? ' ' + p + ' %' : '')).join(' · '); };
    // Les mêmes marchés en drapeaux (data-c = code du marché, n'importe quel code pays ISO).
    const mkList = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2], m[1]]) : a[2].map((c) => [c, null, c]);
      return l.filter((m) => m[0]).slice(0, 2).map(([c, p, t]) => ({ c, p: p !== null && p !== undefined ? p + ' %' : '', t })); };
    const rows = list.slice(0, limit).map((a, i) => { const w = a[6] || [1, 1, 1, 1, 1, 1], mx = Math.max.apply(null, w) || 1, d = a[6] ? dlt(a) : null, up = d === null || d >= 0;
      const pts = w.map((v, j) => [j * 20, 36 - (v / mx) * 32]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      return { rank: String(i + 1).padStart(2, '0'), n: a[0], niche: a[1], mkText: mkText(a), mks: mkList(a), v30: nfm(views(a) * 1e6),
        hasDelta: d !== null, delta: d === null ? '' : dfmt(d), dInk: up ? 'var(--accent)' : 'var(--ink-faint)', stroke: up ? '#4C9AFF' : '#8A93A3',
        line, area: line + ' L100 40 L0 40 Z', gid: 'mapl' + i, ex: '100', ey: (pts[5][1] / 40 * 100).toFixed(1), hasW: !!a[6],
        covs: a[8].map((src, j) => ({ src, v: a[9][j] || '', href: videoOf(a, j) })).filter((c) => c.src), logo: a[10] || false, nologo: !a[10], blank: a[10] ? '' : 'sw-app-blank', open: () => this.setState({ pv: a[0] }) }; });
    const mLabel = market === 'ALL' ? 'Tous' : MKS.filter((m) => m[0] === market)[0][1];
    const chips = [];
    if (market !== 'ALL') chips.push({ label: mLabel, clear: () => this.setState({ market: 'ALL' }) });
    niches.forEach((n) => chips.push({ label: n, clear: () => this.setState({ niches: niches.filter((x) => x !== n) }) }));
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const mItems = MKS.map((m) => { const n = A.filter((r) => okM(r, m[0]) && okN(r, niches) && avail(r)).length; const on = market === m[0];
      return Object.assign({ label: m[1], flag: m[2] || false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => this.setState({ market: m[0] }) }, radio(on)); });
    const nItems = NIS.map((nm) => { const n = A.filter((r) => okM(r, market) && r[1] === nm && avail(r)).length; const on = niches.indexOf(nm) >= 0;
      return { label: nm, n, sel: on ? 'true' : 'false', o: n === 0 ? 0.45 : 1, pick: () => this.setState({ niches: on ? niches.filter((x) => x !== nm) : niches.concat([nm]) }) }; });
    const sheetKeys = (k) => (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ [k]: k === 'pv' ? null : false }); } };
    const pa = A.filter((a) => a[0] === st.pv)[0];
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
        acc: grp(pa[3]), accLabel: pa[3] > 1 ? 'comptes' : 'compte', hasTop10: t10 !== null, top10: Math.round((t10 || 0) * 100) + ' %',
        waffle: Array.from({ length: 20 }, (_, c) => ({ bg: c < Math.round((t10 || 0) * 20) ? '#4C9AFF' : 'rgba(255,255,255,0.08)' })),
        hasTop: !!pa[8][0], top: pa[8][0] ? { cover: pa[8][0], views: (pa[9][0] || '') + ' vues', href: videoOf(pa, 0), x: t0 && t0.x ? xfm(t0.x) + ' sa normale' : '', who: t0 && t0.handle ? '@' + t0.handle : '' } : {},
        ppw: grp(pa[4]), best: pa[7] && pa[7] !== '—' ? pa[7] : '',
        hasMk: !!md, noMk: !md, mkd: (md || []).slice(0, 2).map((m, n) => ({ c: m[0], l: m[1], p: m[2] + ' %', w: m[2] + '%', bg: n === 0 ? '#4C9AFF' : 'rgba(76,154,255,0.55)' })),
        followLabel: (st.follow || {})[pa[0]] ? 'Suivi' : 'Suivre', follow: () => this.setState({ follow: Object.assign({}, st.follow || {}, { [pa[0]]: !(st.follow || {})[pa[0]] }) }) }; }
    const swipe = (k) => ({ s: (e) => { this.y0 = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, e: (e) => { const t = e.changedTouches && e.changedTouches[0]; if (this.y0 != null && t && t.clientY - this.y0 > 60) this.setState({ fs: false, pv: null }); this.y0 = null; } });
    return {
      rows, empty: total === 0, emptyText: A.length === 0 ? 'Aucune app à montrer pour l’instant.' : 'Aucune app pour ces filtres.', canClear: A.length > 0, chips, hasChips: chips.length > 0, nf: chips.length || false, mLabel, nLabel: niches.length === 0 ? 'Toutes' : (niches.length === 1 ? niches[0] : niches.length + ' niches'),
      pLabel: period === '7' ? '7 j' : '30 j', togglePeriod: () => this.setState({ period: period === '7' ? '30' : '7' }),
      sorts: [['vues', 'Les plus vues'], ['accel', 'Qui accélèrent'], ['nouvelles', 'Nouvelles']].map((s) => ({ l: s[1], on: s[0] === sort ? 'true' : 'false', pick: () => this.setState({ sort: s[0] }) })),
      fs: !!st.fs, fsOpen: st.fs ? 'true' : 'false', openFs: () => this.setState({ fs: true }), closeFs: () => this.setState({ fs: false }), fsKeys: sheetKeys('fs'), setFsClose: (el) => { this.fsClose = el; },
      hasMore: total > limit, moreLabel: 'Voir ' + Math.min(30, total - limit) + ' apps de plus', showMore: () => this.setState({ limit: limit + 30 }),
      mItems, nItems, seeLabel: total === 0 ? 'Aucune app, élargis les filtres' : (total === 1 ? 'Voir l’app' : 'Voir les ' + total + ' apps'), clearAll: () => this.setState({ market: 'ALL', niches: [], sort: 'vues' }),
      pv, closePv: () => this.setState({ pv: null }), pvKeys: sheetKeys('pv'), setPvClose: (el) => { this.pvClose = el; },
      tStart: swipe().s, tEnd: swipe().e
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Apps"
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
        $h("section", { "aria-label": "Classement et filtres", "class": "m-fc" },
          $h("div", { "class": "m-tc is-flat is-stack", "role": "tablist", "aria-label": "Classement" },
            ($l($v.sorts)).map((s) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick },
                $h("span", { "class": "m-ic", "data-i": s?.l, "aria-hidden": "true", "style": "width: 16px; height: 16px;" }),
                $t(s?.l)
              )
            ])
          ),
          $h("span", { "aria-hidden": "true", "class": "m-fc-line" }),
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
        $h("div", { "style": "padding: 16px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
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
            $h("div", { "style": "border-radius: 20px; overflow: hidden; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("button", { "type": "button", "onClick": r?.open, "aria-label": `Aperçu de ${$t(r?.n)}`, "style": "width: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 14px 14px 10px; border: 0; background: transparent; text-align: left; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                $h("span", { "style": "width: 18px; flex-shrink: 0; padding-top: 3px; font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                  $t(r?.rank)
                ),
                $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;" },
                  (r?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (r?.nologo) ? [
                    $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 6px;" },
                  $h("span", { "style": "max-width: 100%; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.n)
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
                  )
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
                      $h("a", { "href": c?.href, "class": "sw-video", "aria-label": `Vidéo à ${$t(c?.v)} vues`, "style": "display: block; width: 56px; border-radius: 10px;" },
                        $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy" }),
                        $h("span", { "class": "sw-video-shade" }),
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
          $h("button", { "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeFs, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Filtrer les apps", "onKeyDown": $v.fsKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px max(20px, env(safe-area-inset-bottom)); animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "ontouchstart": $v.tStart, "ontouchend": $v.tEnd, "style": "display: flex; justify-content: center; padding: 10px 0 6px; touch-action: none;" },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; padding: 2px 0 10px;" },
              $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                "Filtrer"
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 4px;" },
                $h("button", { "type": "button", "onClick": $v.clearAll, "style": "min-height: 44px; padding: 0 8px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Tout effacer"
                ),
                $h("button", { "ref": $v.setFsClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closeFs, "aria-label": "Fermer", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Marché"
            ),
            $h("div", { "role": "radiogroup", "aria-label": "Marché", "style": "display: flex; flex-direction: column; padding: 6px 0 14px;" },
              ($l($v.mItems)).map((it) => [
                $h("button", { "type": "button", "role": "radio", "aria-checked": it?.sel, "onClick": it?.pick, "style": `display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; border: 0; border-radius: 14px; background: ${$t(it?.bg)}; color: var(--ink); font-family: inherit; font-size: 16px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)}; -webkit-tap-highlight-color: transparent;` },
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
            $h("div", { "style": "display: flex; justify-content: center; padding-top: 14px;" },
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.closeFs },
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
        ($v.pv?.on) ? [
          $h("button", { "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closePv, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": `Aperçu de ${$t($v.pv?.n)}`, "onKeyDown": $v.pvKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 96vh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px max(20px, env(safe-area-inset-bottom)); animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "ontouchstart": $v.tStart, "ontouchend": $v.tEnd, "style": "display: flex; justify-content: center; padding: clamp(6px, 1.2vh, 10px) 0 clamp(4px, 0.8vh, 6px); touch-action: none;" },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 2px 0 clamp(8px, 1.4vh, 12px);" },
              $h("span", { "class": `sw-app-icon ${$t($v.pv?.blank)}`, "style": "width: clamp(44px, 7.5vh, 56px); height: clamp(44px, 7.5vh, 56px); border-radius: 16px;" },
                ($v.pv?.logo) ? [
                  $h("img", { "class": "sw-logo-img", "src": $v.pv?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.pv?.nologo) ? [
                  $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null
              ),
              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: clamp(20px, 3.4vh, 24px); font-weight: 700; letter-spacing: -0.03em;" },
                  $t($v.pv?.n)
                ),
                $h("span", { "style": "display: flex;" },
                  $h("span", { "class": "m-tagn" },
                    $h("span", { "class": "m-ic", "data-i": $v.pv?.niche, "aria-hidden": "true" }),
                    $t($v.pv?.niche)
                  )
                )
              ),
              $h("button", { "ref": $v.setPvClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closePv, "aria-label": "Fermer l’aperçu", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
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
                $h("a", { "href": $v.pv?.top?.href, "aria-label": "Lire sa vidéo la plus vue", "style": "grid-column: 1 / span 2; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 8px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink);" },
                  $h("span", { "class": "sw-video", "style": "flex: 0 0 auto; width: clamp(42px, 7vh, 72px); aspect-ratio: 3 / 4; border-radius: 12px;" },
                    $h("img", { "class": "sw-cover", "src": $v.pv?.top?.cover, "alt": "", "loading": "lazy", "decoding": "async" })
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
              $h("section", { "aria-label": "Où ses vues se font", "style": "min-width: 0; border-radius: 20px; background: var(--track); padding: clamp(10px, 1.6vh, 14px) 14px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); white-space: nowrap;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Où ses vues se font"
                ),
                ($v.pv?.hasMk) ? [
                  ($l($v.pv?.mkd)).map((m) => [
                    $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                      $h("span", { "style": "display: flex; justify-content: space-between; gap: 6px; font-size: 11px;" },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; min-width: 0; color: var(--ink-soft);" },
                          $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" }),
                          $h("span", { "style": "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(m?.l)
                          )
                        ),
                        $h("span", { "style": "flex-shrink: 0; font-weight: 600; white-space: nowrap;" },
                          $t(m?.p)
                        )
                      ),
                      $h("span", { "aria-hidden": "true", "style": "display: block; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08);" },
                        $h("span", { "style": `display: block; width: ${$t(m?.w)}; height: 5px; border-radius: 3px; background: ${$t(m?.bg)};` })
                      )
                    )
                  ])
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
            $h("div", { "style": "display: flex; align-items: center; justify-content: center; gap: 10px; padding-top: clamp(8px, 1.4vh, 12px);" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.pv?.follow, "style": "height: 48px; gap: 8px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $t($v.pv?.followLabel)
              ),
              $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": $v.pv?.href },
                "Ouvrir la fiche",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        ] : null,
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
