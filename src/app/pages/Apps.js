// Généré par scripts/dc2preact.py depuis design/app/AppsA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Apps extends DCLogic {
  componentDidMount() {
    this.out = (e) => {
      const st = this.state || {};
      if (!st.open || !this.menuEl || this.menuEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-menu-trigger]')) return;
      this.setState({ open: '' });
    };
    document.addEventListener('mousedown', this.out);
    // Échap ferme le menu de tri et le calendrier (les menus de filtre ont leur propre champ).
    this.esc = (e) => { const st = this.state || {}; if (e.key === 'Escape' && (st.open === 'tri' || st.open === 'periode')) this.setState({ open: '' }); };
    document.addEventListener('keydown', this.esc);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this.out); document.removeEventListener('keydown', this.esc); }
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
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'apps' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
return {};
  }

  baseVals() {
    const st = this.state || {};
    let A = [["Rizz App", "Séduction IA", ["US", "ID", "MX"], 82, 332, 59.67, [0.6, 10.8, 0.5, 16.1, 23.7, 14.1], "120×", ["/media/app/v-7702250997850098958.jpg", "/media/app/v-7700724672438045965.jpg", "/media/app/v-7702290769213672718.jpg"], ["2,6 M", "2,5 M", "1,9 M"], ""], ["Astra AI", "Études", ["ID", "US", "ES", "FR", "MX", "BR"], 269, 1360, 57.66, [10.6, 9.8, 8.9, 8.5, 17.3, 18.4], "2 333×", ["/media/app/v-7700392351268752661.jpg", "/media/app/v-7697654738124442896.jpg", "/media/app/v-7702743575934684437.jpg"], ["2,6 M", "2,6 M", "2,3 M"], "/media/app/app-astra-ai.jpg"], ["Knowunity", "Études", ["US", "ID", "ES", "FR", "MX"], 55, 205, 44.43, [4.2, 0.6, 14.6, 16.8, 7.0, 6.1], "101×", ["/media/app/v-7699151144400244000.jpg", "/media/app/v-7702625361716170002.jpg", "/media/app/v-7698010148391947552.jpg"], ["5,7 M", "3,5 M", "2,5 M"], "/media/app/app-knowunity.jpg"], ["Love8", "Couple", ["ID", "US", "FR", "MX"], 83, 282, 35.06, [1.7, 3.4, 7.1, 4.0, 10.6, 12.6], "1 737×", ["/media/app/v-7705441234847862037.jpg", "/media/app/v-7705024255746002182.jpg", "/media/app/v-7701914062296337685.jpg"], ["2 M", "1,9 M", "1,8 M"], "/media/app/app-love8.jpg"], ["WRizz", "Séduction IA", ["US", "ID"], 81, 410, 31.94, [0.4, 2.5, 0.6, 8.0, 10.1, 12.4], "110×", ["/media/app/v-7706018218397273362.jpg", "/media/app/v-7700803310495829266.jpg", "/media/app/v-7701533350825037063.jpg"], ["5 M", "3 M", "1,9 M"], "/media/app/app-wrizz.jpg"], ["Wing AI", "Séduction IA", ["US", "MX"], 124, 251, 19.62, [0.7, 1.9, 1.6, 2.4, 7.0, 6.9], "109×", ["/media/app/v-7703242451120688405.jpg", "/media/app/v-7701632447951211798.jpg", "/media/app/v-7705479809580715284.jpg"], ["1,4 M", "876 k", "869 k"], "/media/app/app-wing-ai.jpg"], ["Cal AI", "Santé et physique", ["US"], 6, 42, 17.13, [0.01, 0.01, 0.3, 7.8, 5.4, 3.7], "9,5×", ["/media/app/v-7701127438704577823.jpg", "/media/app/v-7702142316479384853.jpg", "/media/app/v-7706561664451136788.jpg"], ["1,3 M", "878 k", "757 k"], "/media/app/app-cal-ai.jpg"], ["Praktika", "Langues", ["ID", "US", "FR", "BR", "MX"], 92, 577, 16.58, [5.9, 0.4, 0.4, 0.5, 7.7, 8.0], "70×", ["/media/app/v-7704867469072141588.jpg", "/media/app/v-7704226978622082324.jpg", "/media/app/v-7703758186087566612.jpg"], ["2,1 M", "1,9 M", "1,5 M"], "/media/app/app-praktika.jpg"], ["RecentFollow", "Jalousie et ex", ["US", "MX"], 39, 294, 13.06, [0.01, 0.01, 0.7, 1.1, 4.2, 7.0], "750×", ["/media/app/v-7705376808862076182.jpg", "/media/app/v-7706834426096815382.jpg", "/media/app/v-7700279402319367425.jpg"], ["1,2 M", "874 k", "854 k"], ""], ["The Cringe", "Jalousie et ex", ["US", "FR", "ID"], 18, 49, 12.18, [0.1, 0.01, 0.8, 2.9, 5.0, 3.4], "53×", ["/media/app/v-7703301496879861014.jpg", "/media/app/v-7705159889147923734.jpg", "/media/app/v-7701454363897629974.jpg"], ["2,5 M", "1,1 M", "1,1 M"], "/media/app/app-the-cringe.jpg"]];
    let MKD = {"Astra AI": [["ID", "Indonésie", 65], ["US", "États-Unis", 19], ["ES", "Espagne", 8], ["BR", "Brésil", 5], ["FR", "France", 2], ["MX", "Mexique", 1]], "Love8": [["US", "États-Unis", 66], ["ID", "Indonésie", 23], ["FR", "France", 8], ["MX", "Mexique", 4]]};
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['ID', 'Indonésie', 'ID'], ['MX', 'Mexique', 'MX'], ['FR', 'France', 'FR'], ['BR', 'Brésil', 'BR'], ['ES', 'Espagne', 'ES']];
    let NIS = ['Séduction IA', 'Jalousie et ex', 'Études', 'Santé et physique', 'Couple', 'Langues', 'Side hustle', 'Foi', 'Social et loisirs', 'Beauté IA'];
    const T = ['t-plum', 't-navy', 't-pine', 't-violet', 't-umber', 't-amber'];
    // Sur le site : les vraies données du Radar (document « apps », convex/radarModels.ts).
    // Sur le canevas : l'exemple ci-dessus. A[i] = [nom, niche, marchés, comptes, vidéos/sem.,
    // vues 30 j (M), 6 semaines (M), meilleure, miniatures, vues des miniatures, icône,
    // slug, id des vidéos, nouvelle ?, vues 30 j TikTok (M), Instagram (M), 7 j TikTok (M), 7 j Instagram (M),
    // part des 10 premiers comptes, vidéo n°1 { x, handle }, vidéos sur 30 j, meilleure (×), arrivée (ms),
    // vues par jour de publication sur 42 jours (total, Instagram)]
    const D = this.props && this.props.data;
    let DAYEND = null; // dernier jour de l'historique (jours depuis 1970, heure de Paris)
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    if (D && D.apps) {
      const LBL = Object.fromEntries(D.markets);
      A = D.apps.map((a) => [a.name, a.niche, a.markets.map((m) => m[0]), a.accounts, a.videosPerWeek, a.views30 / 1e6, a.weeks.map((w) => w / 1e6),
        a.bestX ? xf(a.bestX) : '—', a.top.map((t) => t.cover || ''), a.top.map((t) => nf(t.views)), a.icon || '', a.slug, a.top.map((t) => t.id), a.isNew,
        (a.views30 - a.views30Ig) / 1e6, a.views30Ig / 1e6, (a.views7 - (a.views7Ig || 0)) / 1e6, (a.views7Ig || 0) / 1e6,
        a.top10Share, a.top[0] ? { x: a.top[0].x, handle: a.top[0].handle } : null, a.videoCount, a.bestX || 0, a.trackedSince || 0, a.days || null, a.daysIg || null]);
      DAYEND = D.apps.length && typeof D.apps[0].dayEnd === 'number' ? D.apps[0].dayEnd : null;
      MKD = Object.fromEntries(D.apps.map((a) => [a.name, a.markets.map(([c, p]) => [c, LBL[c] || c, p])]));
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l, c]));
      NIS = D.niches;
    }
    const ficheOf = (a) => (a[11] ? '/app/apps/' + a[11] : '/app/apps/astraai');
    const videoOf = (a, j) => '/app/videos/' + ((a[12] && a[12][j]) || vkey(a[8][j]));
    const open = st.open || '';
    const market = st.market || 'ALL';
    // /app/apps?niche=<nom> (pastilles de l'accueil) : cette niche est cochée d'entrée, puis se modifie comme un filtre normal.
    // Sur le canevas, la même valeur se lit dans location.search. Un nom inconnu est ignoré.
    const qn = this.props && this.props.query ? this.props.query.niche : (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('niche') : null);
    const niches = st.niches || (qn && NIS.indexOf(qn) >= 0 ? [qn] : []);
    const sort = st.sort || 'vues';
    let period = st.period || '30';
    // Historique jour par jour : 42 jours, le dernier = aujourd'hui (heure de Paris). Sur le canevas : déduit des semaines.
    const NDAYS = 42;
    const dayEnd = DAYEND !== null ? DAYEND : Math.floor((Date.now() + 3600e3) / 864e5);
    const dayDate = (i) => new Date((dayEnd - NDAYS + 1 + i) * 864e5);
    const dd = (i) => { const x = dayDate(i); return String(x.getUTCDate()).padStart(2, '0') + '/' + String(x.getUTCMonth() + 1).padStart(2, '0'); };
    const range = st.range && typeof st.range.a === 'number' ? st.range : null;
    if (period === 'custom' && !range) period = '30';
    const rangeLabel = range ? (range.a === range.b ? 'le ' + dd(range.a) : dd(range.a) + ' → ' + dd(range.b)) : '';
    const dayArr = (a, ig) => (ig ? a[24] : a[23]) || Array.from({ length: NDAYS }, (_, i) => (ig ? 0 : a[6][Math.floor(i / 7)] * 1e6 / 7));
    const sumR = (arr) => { let n = 0; for (let i = range.a; i <= range.b; i++) n += arr[i] || 0; return n / 1e6; };
    const mq = (st.mq || '').toLowerCase();
    const fr = (x, d) => x.toFixed(d).replace('.', ',');
    const okM = (a, m) => m === 'ALL' || a[2].indexOf(m) >= 0;
    const okN = (a, ns) => ns.length === 0 || ns.indexOf(a[1]) >= 0;
    const platform = st.platform || 'ALL';
    const isNew = (a) => (a[13] !== undefined ? a[13] : a[6][0] + a[6][1] < 0.2);
    // Vues de la période et de la plateforme choisies (sans découpage par plateforme dans l'exemple : le total).
    const views = (a) => {
      if (period === 'custom') { const all = sumR(dayArr(a, false)), ig = sumR(dayArr(a, true)); return platform === 'tiktok' ? all - ig : platform === 'instagram' ? ig : all; }
      if (platform === 'tiktok' && a[14] !== undefined) return period === '7' ? a[16] : a[14];
      if (platform === 'instagram' && a[15] !== undefined) return period === '7' ? a[17] : a[15];
      return period === '7' ? a[6][5] : a[5];
    };
    const dlt = (a) => (a[6][4] > 0 ? (a[6][5] - a[6][4]) / a[6][4] : 0);
    const set = (patch) => this.setState(Object.assign({ open, market, niches, sort, period, platform, menuX: st.menuX }, patch));
    const pickSort = (k) => set({ sortBy: k, dir: k === sortBy ? (dir === 'asc' ? 'desc' : 'asc') : (k === 'name' ? 'asc' : 'desc'), open: '' });
    let list = A.filter((a) => okM(a, market) && okN(a, niches) && (platform === 'ALL' || views(a) > 0));
    if (sort === 'nouvelles') list = list.filter(isNew);
    // Tri : celui choisi (menu ou en-tête), sinon celui de l'onglet ; l'ordre, sinon décroissant (A → Z pour le nom).
    const sortBy = st.sortBy || (sort === 'accel' ? 'progress' : 'views');
    const dir = st.dir || (sortBy === 'name' ? 'asc' : 'desc');
    const KEY = { views: (a) => views(a), progress: dlt, accounts: (a) => Number(a[3]) || 0, ppw: (a) => Number(a[4]) || 0, best: (a) => a[21] || parseFloat(String(a[7]).replace(/\s/g, '').replace(',', '.')) || 0,
      arrival: (a) => a[22] || 0, name: (a) => String(a[0]).toLowerCase() };
    list = list.slice().sort((x, y) => { const p = KEY[sortBy](x), q = KEY[sortBy](y); const c = typeof p === 'string' ? p.localeCompare(q, 'fr') : p - q; return dir === 'asc' ? c : -c; });
    // Icônes : une par niche, par onglet et par filtre (style des en-têtes : trait 1,8).
    const NIC = { 'Rencontres': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Bien-être mental': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01', 'Finance': 'M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6', 'Productivité': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Création de contenu': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 'Séduction IA': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Couple': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
      'Études': 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7', 'Jalousie et ex': 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'Side hustle': 'M3 17l6-6 4 4 8-8M15 7h6v6', 'Langues': 'M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5', 'Foi': 'M12 3v18M7 8h10',
      'Social et loisirs': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Santé et physique': 'M3 12h4l3-8 4 16 3-8h4', 'Beauté IA': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' };
    const NIC0 = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';
    const mkList = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2], m[1]]) : a[2].map((c) => [c, null, c]);
      return l.filter((m) => m[1] !== null || m[0] !== 'XX').slice(0, 2).map(([c, p, t]) => ({ c, p: p !== null && p !== undefined ? p + '\u202f%' : '', t })); };
    const mkText = (a) => { const md = MKD[a[0]]; const l = md ? md.map((m) => [m[0], m[2]]) : a[2].map((c) => [c, null]);
      return l.filter((m) => m[1] !== null || m[0] !== 'XX').slice(0, 2).map(([c, p]) => (c === 'XX' ? 'Autres' : c) + (p !== null && p !== undefined ? ' ' + p + '\u202f%' : '')).join(' · '); };
    const rows = list.map((a, i) => {
      const w = a[6];
      const max = Math.max.apply(null, w) || 1;
      const pts = w.map((v, j) => [3 + j * (124 / 5), 36 - (v / max) * 30]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const d = dlt(a);
      const up = d >= 0;
      return {
        rank: String(i + 1).padStart(2, '0'), n: a[0], niche: a[1], nicheIc: NIC[a[1]] || NIC0, mkText: mkText(a), mks: mkList(a),
        net: Number(a[3]).toLocaleString('fr-FR') + ' comptes · ' + Number(a[4]).toLocaleString('fr-FR') + ' vidéos / sem.',
        count: typeof a[20] === 'number' && a[20] > 0 ? a[20].toLocaleString('fr-FR') : '', v30: fr(views(a), 1) + '\u202fM',
        delta: (up ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f% cette semaine', dInk: up ? 'var(--accent)' : 'var(--ink-faint)',
        line, area: line + ' L127 40 L3 40 Z', ex: pts[5][0].toFixed(1), ey: pts[5][1].toFixed(1), gid: 'apl' + i,
        stroke: up ? '#4C9AFF' : '#8A93A3',
        best: a[7],
        thumbs: a[8].map((src, j) => ({ src, v: a[9][j], t: T[(i + j) % T.length], href: videoOf(a, j) })).filter((t) => t.src),
        logo: a[10] || false, nologo: !a[10], blank: a[10] ? '' : 'sw-app-blank',
        bg: st.pv === a[0] ? 'var(--accent-soft)' : 'transparent',
        open: () => this.setState({ pv: a[0], open: '' })
      };
    });
    const mLabel = MKS.filter((m) => m[0] === market)[0][1];
    const nLabel = niches.length === 0 ? 'Toutes' : (niches.length === 1 ? niches[0] : niches.length + ' niches');
    const BIC = { marche: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z', niche: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01', plateforme: 'M4 5h16v14H4zM10 9l5 3-5 3z' };
    // Le menu s'ouvre sous le filtre cliqué (sa position dans la rangée).
    const mkBar = (key, k, v) => ({ k, v, d: BIC[key], open: open === key ? 'true' : 'false', bg: open === key ? 'var(--tab-on)' : 'var(--track)', edge: open === key ? 'var(--accent-edge)' : 'var(--line)',
      toggle: (e) => { const el = e && e.currentTarget; set({ open: open === key ? '' : key, mq: '', menuX: el && typeof el.offsetLeft === 'number' ? el.offsetLeft : null }); } });
    const PL = { ALL: 'Toutes', tiktok: 'TikTok', instagram: 'Instagram' };
    const bar = [mkBar('marche', 'Marché', market === 'ALL' ? 'Tous' : mLabel), mkBar('niche', 'Niche', nLabel), mkBar('plateforme', 'Plateforme', PL[platform])];
    const chips = [];
    if (market !== 'ALL') chips.push({ label: mLabel, clear: () => set({ market: 'ALL' }) });
    niches.forEach((n) => chips.push({ label: n, clear: () => set({ niches: niches.filter((x) => x !== n) }) }));
    if (platform !== 'ALL') chips.push({ label: PL[platform], clear: () => set({ platform: 'ALL' }) });
    const radio = (on) => ({ radius: '50%', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const check = (on) => ({ radius: '5px', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const keep = (label) => !mq || label.toLowerCase().indexOf(mq) >= 0;
    const menuLeft = (dflt) => (typeof st.menuX === 'number' ? st.menuX + 'px' : dflt);
    let menu = { on: false, items: [], left: '0px', title: '', search: '', foot: '' };
    if (open === 'marche') {
      menu = { on: true, left: menuLeft('0px'), title: 'Marché', search: 'Chercher un marché', foot: 'Le marché choisi vaut pour tout le classement.',
        items: MKS.filter((m) => keep(m[1])).map((m) => { const n = A.filter((r) => okM(r, m[0]) && okN(r, niches)).length; const on = market === m[0];
          return Object.assign({ label: m[1], flag: m[2] || false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => set({ market: m[0] }) }, radio(on)); }) };
    } else if (open === 'niche') {
      menu = { on: true, left: menuLeft('190px'), title: 'Niche', search: 'Chercher une niche', foot: 'Plusieurs niches possibles. Les nombres tiennent compte du marché.',
        items: NIS.filter(keep).map((nm) => { const n = A.filter((r) => okM(r, market) && r[1] === nm).length; const on = niches.indexOf(nm) >= 0;
          return Object.assign({ label: nm, flag: false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1,
            pick: () => set({ niches: on ? niches.filter((x) => x !== nm) : niches.concat([nm]) }) }, check(on)); }) };
    } else if (open === 'plateforme') {
      menu = { on: true, left: menuLeft('380px'), title: 'Plateforme', search: 'Chercher une plateforme', foot: 'YouTube Shorts arrive bientôt.',
        items: [['ALL', 'Toutes'], ['tiktok', 'TikTok'], ['instagram', 'Instagram']].filter((p) => keep(p[1])).map((p) => { const on = platform === p[0];
          return Object.assign({ label: p[1], flag: false, n: '', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: 1, pick: () => set({ platform: p[0] }) }, radio(on)); }) };
    }
    const SIC = { vues: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', accel: 'M3 17l6-6 4 4 8-8M15 7h6v6', nouvelles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' };
    const sorts = [['vues', 'Les plus vues'], ['accel', 'Qui accélèrent'], ['nouvelles', 'Nouvelles']].map((s) => { const on = s[0] === sort;
      return { l: s[1], d: SIC[s[0]], on: on ? 'true' : 'false', bg: on ? 'rgba(255,255,255,0.10)' : 'transparent', ink: on ? 'var(--ink)' : 'var(--ink-muted)', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)', pick: () => set({ sort: s[0], sortBy: null, dir: null }) }; });
    const periods = [['7', '7 j'], ['30', '30 j']].map((p) => { const on = p[0] === period;
      return { l: p[1], on: on ? 'true' : 'false', bg: on ? 'rgba(255,255,255,0.10)' : 'transparent', ink: on ? 'var(--ink)' : 'var(--ink-muted)', fw: on ? '600' : '400', pick: () => set({ period: p[0], open: '' }) }; });
    const pa = A.filter((a) => a[0] === st.pv)[0];
    let pv = { on: false };
    let ajItem = null;
    // Suivre une app : sur le site, follows.apps (saved) par slug ; sur le canevas, l'état local par nom.
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const fw = live ? P.saved('follows') : null;
    const followed = (a) => (live ? !!(fw && a[11] && (fw.apps || []).indexOf(a[11]) >= 0) : !!(st.follow || {})[a[0]]);
    const toggleFollow = (a) => {
      if (!live) return this.setState({ follow: Object.assign({}, (this.state || {}).follow || {}, { [a[0]]: !followed(a) }) });
      const cur = P.saved('follows');
      if (cur === undefined || !a[11]) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      next.apps = l.indexOf(a[11]) >= 0 ? l.filter((x) => x !== a[11]) : [a[11]].concat(l);
      P.save('follows', next);
    };
    if (pa) {
      const w = pa[6]; const mx = Math.max.apply(null, w) || 1;
      const pts = w.map((v, j) => [6 + j * (424 / 5), 66 - (v / mx) * 58]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const d = pa[6][4] > 0 ? (pa[6][5] - pa[6][4]) / pa[6][4] : null;
      const md = MKD[pa[0]];
      const at = D && D.updatedAt ? D.updatedAt : null;
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const labels = w.map((_, j) => ({ t: j === 5 ? 'Cette sem.' : at ? day(at - (6 - j) * 7 * 86400000) : 'S−' + (5 - j), ink: j === 5 ? '#FFFFFF' : '#8A93A3', fw: j === 5 ? '600' : '400' }));
      // Sa place : dans sa niche (au moins 2 apps, pas « Autres »), sinon parmi toutes les apps du Radar.
      let pool = A.filter((a) => a[1] === pa[1]);
      const inNiche = pa[1] && pa[1] !== 'Autres' && pool.length >= 2;
      if (!inNiche) pool = A;
      pool = pool.slice().sort((x, y) => y[5] - x[5]);
      const at1 = pool.indexOf(pa);
      const hatchB = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 6px), rgba(255,255,255,0.04)';
      const shown = at1 < 6 ? pool.slice(0, 6) : pool.slice(0, 5).concat([pa]);
      const bars = shown.map((a) => ({ title: a[0] + ' : ' + fr(a[5], 1) + ' M vues', h: Math.max(3, Math.round((a[5] / (pool[0][5] || 1)) * 100)) + '%',
        bg: a === pa ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : hatchB }));
      const t10 = typeof pa[18] === 'number' && pa[3] > 10 ? pa[18] : null;
      const t0 = pa[19] || null;
      const v1 = pa[8][0] ? { cover: pa[8][0], views: pa[9][0] + ' vues', href: videoOf(pa, 0), x: t0 && t0.x ? xf(t0.x) + ' sa normale' : '',
        who: t0 && t0.handle ? '@' + t0.handle : '', aria: 'Lire la vidéo' + (t0 && t0.handle ? ' de @' + t0.handle : '') } : null;
      pv = { on: true, n: pa[0], niche: pa[1], logo: pa[10] || false, nologo: !pa[10], blank: pa[10] ? '' : 'sw-app-blank',
        vLabel: 'Vues sur 30 jours', v30: fr(pa[5], 1) + '\u202fM', week: fr(w[5], 1) + '\u202fM',
        delta: d === null ? '' : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%',
        dBg: d !== null && d >= 0 ? 'var(--accent-soft)' : 'rgba(255,255,255,0.09)', dInk: d !== null && d >= 0 ? 'var(--accent)' : 'var(--ink-soft)',
        line, area: line + ' L430 72 L6 72 Z', labels,
        rank: at1 >= 0 ? 'N°' + (at1 + 1) : '—', rankOf: 'sur ' + pool.length + ' apps ' + (inNiche ? 'de ' + pa[1] : 'du Radar'), bars,
        acc: Number(pa[3]).toLocaleString('fr-FR'), accLabel: pa[3] > 1 ? 'comptes' : 'compte',
        hasTop10: t10 !== null, top10: Math.round((t10 || 0) * 100) + '\u202f%',
        waffle: Array.from({ length: 20 }, (_, c) => ({ bg: c < Math.round((t10 || 0) * 20) ? '#4C9AFF' : 'rgba(255,255,255,0.08)' })),
        hasTop: !!v1, top: v1 || {},
        rows: v1 ? 'minmax(0, 1.2fr) minmax(0, 1.06fr) minmax(0, 0.86fr) minmax(0, 0.88fr)' : 'minmax(0, 1.3fr) minmax(0, 1.06fr) minmax(0, 0.88fr)',
        ppw: Number(pa[4]).toLocaleString('fr-FR'), best: pa[7] && pa[7] !== '—' ? pa[7] : '',
        mkd: (md || pa[2].map((c) => [c, c, null])).filter((m) => m[2] !== null).slice(0, 2).map((m, n) => ({ c: m[0], l: m[1], full: m[1], p: m[2] + '\u202f%', w: m[2] + '%', bg: n === 0 ? '#4C9AFF' : 'rgba(76,154,255,0.55)' })),
        href: ficheOf(pa),
        followLabel: followed(pa) ? 'Suivi' : 'Suivre', followOn: followed(pa) ? 'true' : 'false', follow: () => toggleFollow(pa) };
      ajItem = { kind: 'app', id: pa[11] || pa[0], label: pa[0], cover: pa[10] || null };
    }
    // ── Tri : menu, ordre, en-têtes ──
    const SLAB = { views: period === 'custom' ? 'Vues · ' + rangeLabel : (period === '7' ? 'Vues · 7 j' : 'Vues · 30 j'), progress: 'Progression', accounts: 'Comptes', ppw: 'Vidéos / sem.', best: 'Meilleure', arrival: 'Arrivée', name: 'Nom' };
    const SOPT = [['views', 'Vues sur la période', 'M3 3v18h18M7 15l4-4 3 3 5-6'], ['progress', 'Progression de la semaine', 'M3 17l6-6 4 4 8-8M15 7h6v6'],
      ['accounts', 'Comptes qui la poussent', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3'],
      ['ppw', 'Vidéos par semaine', 'M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4'], ['best', 'Meilleure vidéo (× sa normale)', 'M13 2L4 14h7l-1 8 9-12h-7z'],
      ['arrival', 'Arrivée dans le Radar', 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4'], ['name', 'Nom de l’app', 'M4 18l4-12 4 12M5.5 14h5M14 6h6l-6 12h6']];
    const DOWN = 'M12 5v14M6 13l6 6 6-6', UPA = 'M12 19V5M6 11l6-6 6 6';
    const sortMenu = { on: open === 'tri',
      items: SOPT.map(([k, l, d]) => { const on = k === sortBy; return { l, d, on, sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)', pick: () => set({ sortBy: k, dir: k === 'name' ? 'asc' : 'desc', open: '' }) }; }),
      dirs: [['desc', 'Décroissant', DOWN], ['asc', 'Croissant', UPA]].map(([k, l, d]) => { const on = k === dir; return { l, d, sel: on ? 'true' : 'false', bg: on ? 'rgba(255,255,255,0.10)' : 'transparent', ink: on ? 'var(--ink)' : 'var(--ink-muted)', fw: on ? '600' : '400', pick: () => set({ dir: k }) }; }) };
    const sortBtn = { open: open === 'tri' ? 'true' : 'false', bg: open === 'tri' ? 'var(--tab-on)' : 'var(--track)', edge: open === 'tri' ? 'var(--accent-edge)' : 'var(--line)', ic: open === 'tri' ? 'var(--accent)' : 'var(--ink-faint)',
      dirD: dir === 'asc' ? UPA : DOWN, toggle: () => set({ open: open === 'tri' ? '' : 'tri' }) };
    const hcol = (k) => { const on = sortBy === k; return { aria: on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none', pick: () => pickSort(k), ink: on ? 'var(--ink)' : 'var(--ink-muted)', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)',
      sBg: on ? 'var(--accent-soft)' : 'transparent', sInk: on ? 'var(--accent)' : 'var(--ink-faint)', sD: on ? (dir === 'asc' ? UPA : DOWN) : 'M8 9l4-4 4 4M8 15l4 4 4-4' }; };
    const hd = { name: hcol('name'), views: hcol('views'), best: hcol('best') };
    // ── Période personnalisée : calendrier sur l'historique (42 jours) ──
    const draft = st.draft && typeof st.draft.a === 'number' ? st.draft : (range || { a: NDAYS - 30, b: NDAYS - 1 });
    const endDow = (dayDate(NDAYS - 1).getUTCDay() + 6) % 7;
    const PRE = [['7 derniers jours', NDAYS - 7, NDAYS - 1], ['14 derniers jours', NDAYS - 14, NDAYS - 1], ['30 derniers jours', NDAYS - 30, NDAYS - 1],
      ['Cette semaine', NDAYS - 1 - endDow, NDAYS - 1], ['La semaine dernière', NDAYS - 8 - endDow, NDAYS - 2 - endDow], ['Tout l’historique', 0, NDAYS - 1]];
    const isPre = (p) => draft.b !== null && draft.a === p[1] && draft.b === p[2];
    const anyPre = PRE.some(isPre);
    const LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const last = dayDate(NDAYS - 1), first = dayDate(0);
    const monthsSpan = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth(); // 1 ou 2
    const shift = Math.max(-(monthsSpan - 1), Math.min(0, st.calShift || 0));
    const pickDay = (i) => { const d = draft; const next = d.b === null ? (i < d.a ? { a: i, b: d.a } : { a: d.a, b: i }) : { a: i, b: null }; this.setState({ draft: next }); };
    const mkMonth = (y, m, isFirst) => {
      const lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, nd = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const cells = [];
      for (let k = 0; k < lead; k++) cells.push({ n: '', on: false, off: true, band: 'transparent', bandR: '0', ink: 'transparent' });
      for (let d = 1; d <= nd; d++) {
        const i = Math.round(Date.UTC(y, m, d) / 864e5) - (dayEnd - NDAYS + 1), dow = (lead + d - 1) % 7;
        const ok = i >= 0 && i < NDAYS, b = draft.b === null ? draft.a : draft.b;
        const edge = i === draft.a || i === b, inR = i >= draft.a && i <= b;
        const l = i === draft.a || dow === 0 || d === 1, r = i === b || dow === 6 || d === nd;
        cells.push({ n: String(d), on: ok, off: !ok, sel: edge ? 'true' : 'false', aria: LONG.format(new Date(Date.UTC(y, m, d))), pick: () => pickDay(i),
          band: ok && inR && draft.b !== null ? 'rgba(76,154,255,0.14)' : 'transparent', bandR: (l ? '18px ' : '0 ') + (r ? '18px 18px ' : '0 0 ') + (l ? '18px' : '0'),
          dot: ok && edge ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : 'transparent', fw: edge ? '700' : '500',
          ink: !ok ? 'rgba(138,147,163,0.35)' : edge ? '#FFFFFF' : inR ? 'var(--ink)' : 'var(--ink-soft)', ring: i === NDAYS - 1 && !edge ? 'inset 0 0 0 1px var(--line-strong)' : 'none' });
      }
      const canPrev = isFirst && shift > -(monthsSpan - 1), canNext = !isFirst && shift < 0;
      return { t: MONTHS[m] + ' ' + y, cells, prev: canPrev, noPrev: !canPrev, next: canNext, noNext: !canNext };
    };
    const m2 = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + shift, 1)), m1 = new Date(Date.UTC(m2.getUTCFullYear(), m2.getUTCMonth() - 1, 1));
    const nDays = draft.b === null ? 1 : draft.b - draft.a + 1;
    const cal = { on: open === 'periode',
      presets: PRE.map((p) => { const on = isPre(p); return { l: p[0], on, sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', fw: on ? '600' : '500', ink: on ? 'var(--ink)' : 'var(--ink-soft)', pick: () => this.setState({ draft: { a: p[1], b: p[2] } }) }; })
        .concat([{ l: 'Personnalisée', on: !anyPre, sel: !anyPre ? 'true' : 'false', bg: !anyPre ? 'var(--accent-soft)' : 'transparent', fw: !anyPre ? '600' : '500', ink: !anyPre ? 'var(--ink)' : 'var(--ink-soft)', pick: () => {} }]),
      aTxt: LONG.format(dayDate(draft.a)), bTxt: draft.b === null ? 'Choisis le dernier jour' : LONG.format(dayDate(draft.b)),
      aEdge: draft.b === null ? 'var(--line)' : 'var(--accent-edge)', bEdge: draft.b === null ? 'var(--accent-edge)' : 'var(--line)',
      months: [mkMonth(m1.getUTCFullYear(), m1.getUTCMonth(), true), mkMonth(m2.getUTCFullYear(), m2.getUTCMonth(), false)],
      dow: ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l) => ({ l })),
      prevM: () => this.setState({ calShift: shift - 1 }), nextM: () => this.setState({ calShift: shift + 1 }),
      count: nDays + (nDays > 1 ? ' jours' : ' jour'), since: LONG.format(first).replace(/^\S+ /, ''),
      apply: () => set({ period: 'custom', range: { a: draft.a, b: draft.b === null ? draft.a : draft.b }, open: '', draft: null }) };
    const cust = { on: period === 'custom' ? 'true' : 'false', open: open === 'periode' ? 'true' : 'false', l: period === 'custom' ? rangeLabel : 'Du … au …',
      bg: period === 'custom' ? 'var(--accent-soft)' : 'transparent', ink: period === 'custom' ? 'var(--ink)' : 'var(--ink-muted)', fw: period === 'custom' ? '600' : '400', ic: period === 'custom' ? 'var(--accent)' : 'currentColor',
      toggle: () => set({ open: open === 'periode' ? '' : 'periode', draft: range || { a: NDAYS - 30, b: NDAYS - 1 }, calShift: 0 }) };
    const perEdge = open === 'periode' ? 'var(--accent-edge)' : 'transparent';
    return {
      releve: (() => { const S = this.props && typeof this.props.get === 'function' ? this.props.get('stats') : null; if (!S || !S.at) return ''; const d = new Date(S.at); return 'Relevé le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', ' h ') + '.'; })(), sortMenu, sortBtn, hd, cal, cust, perEdge,
      rows, empty: rows.length === 0, total: rows.length, bar, chips, menu, sorts, periods, pv, ajItem,
      vlab: period === 'custom' ? 'Vues · ' + rangeLabel : (period === '7' ? 'Vues 7 j' : 'Vues 30 j'), sortLabel: SLAB[sortBy],
      closeMenu: () => set({ open: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); set({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; },
      closePv: () => this.setState({ pv: null, aj: false }), setPvClose: (el) => { this.pvClose = el; },
      pvKeys: (e) => { if (e.key === 'Escape' && !(this.state || {}).aj) { e.preventDefault(); this.setState({ pv: null }); } },
      clearAll: () => set({ market: 'ALL', niches: [], sort: 'vues' })
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1280px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Apps"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Les apps que les réseaux de créateurs poussent, classées par vues.",
                ($v.releve) ? [
                  " ", $t($v.releve)
                ] : null
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 440px; height: 48px; padding: 0 18px; border: 0; border-radius: 14px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); backdrop-filter: none; -webkit-backdrop-filter: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qa", "type": "search", "aria-label": "Chercher une app", "placeholder": "Chercher une app…", "style": "font-size: 15px;" })
            )
          ),
          $h("section", { "aria-label": "Classement et filtres", "style": "margin: 24px 32px 0; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px;" },
              $h("div", { "role": "tablist", "aria-label": "Classement", "style": "display: flex; gap: 4px; flex-wrap: wrap;" },
                ($l($v.sorts)).map((s) => [
                  $h("button", { "type": "button", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: ${$t(s?.bg)}; color: ${$t(s?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(s?.fw)}; cursor: pointer;` },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(s?.ic)};` },
                      $h("path", { "d": s?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t(s?.l)
                  )
                ])
              ),
              $h("div", { "style": "position: relative;" },
                $h("div", { "role": "tablist", "aria-label": "Période", "style": `display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: var(--track); box-shadow: inset 0 0 0 1px ${$t($v.perEdge)};` },
                  ($l($v.periods)).map((p) => [
                    $h("button", { "type": "button", "role": "tab", "aria-selected": p?.on, "onClick": p?.pick, "style": `height: 30px; padding: 0 12px; border: 0; border-radius: 8px; background: ${$t(p?.bg)}; color: ${$t(p?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t(p?.fw)}; cursor: pointer;` },
                      $t(p?.l)
                    )
                  ]),
                  $h("button", { "type": "button", "role": "tab", "data-menu-trigger": "true", "aria-selected": $v.cust?.on, "aria-expanded": $v.cust?.open, "aria-haspopup": "dialog", "onClick": $v.cust?.toggle, "style": `display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 12px; border: 0; border-radius: 8px; background: ${$t($v.cust?.bg)}; color: ${$t($v.cust?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t($v.cust?.fw)}; cursor: pointer;` },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t($v.cust?.ic)};` },
                      $h("path", { "d": "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.cust?.l)
                  )
                ),
                ($v.cal?.on) ? [
                  $h("div", { "ref": $v.setMenu, "role": "dialog", "aria-label": "Choisir une période", "style": "position: absolute; top: 44px; right: 0; z-index: 30; width: 820px; max-width: calc(100vw - 140px); display: grid; grid-template-columns: 210px minmax(0, 1fr); box-sizing: border-box; padding: 8px; border-radius: 22px; background: #0D111A; border: 1px solid var(--glass-edge); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both; padding: 0; overflow: hidden;" },
                    $h("div", { "style": "display: flex; flex-direction: column; gap: 2px; padding: 12px; border-right: 1px solid var(--line);" },
                      $h("span", { "style": "padding: 8px 10px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                        "Raccourcis"
                      ),
                      ($l($v.cal?.presets)).map((q) => [
                        $h("button", { "type": "button", "onClick": q?.pick, "aria-pressed": q?.sel, "style": `display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 40px; padding: 0 10px; border: 0; border-radius: 10px; background: ${$t(q?.bg)}; color: ${$t(q?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(q?.fw)}; text-align: left; cursor: pointer;` },
                          $t(q?.l),
                          (q?.on) ? [
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--accent);" },
                              $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        )
                      ])
                    ),
                    $h("div", { "style": "display: flex; flex-direction: column; min-width: 0;" },
                      $h("div", { "style": "display: flex; align-items: center; gap: 10px; padding: 16px 20px 12px;" },
                        $h("span", { "style": `flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px ${$t($v.cal?.aEdge)};` },
                          $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                            "Du"
                          ),
                          $h("span", { "style": "font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t($v.cal?.aTxt)
                          )
                        ),
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $h("span", { "style": `flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px ${$t($v.cal?.bEdge)};` },
                          $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                            "Au"
                          ),
                          $h("span", { "style": "font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t($v.cal?.bTxt)
                          )
                        )
                      ),
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 4px 20px 16px;" },
                        ($l($v.cal?.months)).map((m) => [
                          $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; height: 32px;" },
                              (m?.prev) ? [
                                $h("button", { "type": "button", "onClick": $v.cal?.prevM, "aria-label": "Mois précédent", "style": "width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 8px; background: var(--track); color: var(--ink); cursor: pointer;" },
                                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                                    $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                  )
                                )
                              ] : null,
                              (m?.noPrev) ? [
                                $h("span", { "style": "width: 28px;" })
                              ] : null,
                              $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                                $t(m?.t)
                              ),
                              (m?.next) ? [
                                $h("button", { "type": "button", "onClick": $v.cal?.nextM, "aria-label": "Mois suivant", "style": "width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 8px; background: var(--track); color: var(--ink); cursor: pointer;" },
                                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                                    $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                  )
                                )
                              ] : null,
                              (m?.noNext) ? [
                                $h("span", { "style": "width: 28px;" })
                              ] : null
                            ),
                            $h("div", { "style": "display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); row-gap: 2px;" },
                              ($l($v.cal?.dow)).map((w) => [
                                $h("span", { "style": "height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--ink-faint);" },
                                  $t(w?.l)
                                )
                              ]),
                              ($l(m?.cells)).map((c) => [
                                $h("span", { "style": `height: 36px; display: flex; align-items: center; justify-content: center; background: ${$t(c?.band)}; border-radius: ${$t(c?.bandR)};` },
                                  (c?.on) ? [
                                    $h("button", { "type": "button", "onClick": c?.pick, "aria-label": c?.aria, "aria-pressed": c?.sel, "style": `width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 50%; background: ${$t(c?.dot)}; color: ${$t(c?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t(c?.fw)}; font-variant-numeric: tabular-nums; box-shadow: ${$t(c?.ring)}; cursor: pointer;` },
                                      $t(c?.n)
                                    )
                                  ] : null,
                                  (c?.off) ? [
                                    $h("span", { "style": `width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: ${$t(c?.ink)}; font-variant-numeric: tabular-nums;` },
                                      $t(c?.n)
                                    )
                                  ] : null
                                )
                              ])
                            )
                          )
                        ])
                      ),
                      $h("div", { "style": "margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border-top: 1px solid var(--line);" },
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 2px; min-width: 0;" },
                          $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                            $t($v.cal?.count)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            "Les vues des vidéos publiées sur la période. Le Radar remonte au ", $t($v.cal?.since), "."
                          )
                        ),
                        $h("span", { "style": "display: flex; align-items: center; gap: 8px; flex-shrink: 0;" },
                          $h("button", { "type": "button", "onClick": $v.closeMenu, "style": "height: 40px; padding: 0 16px; border: 0; border-radius: 12px; background: transparent; color: var(--ink-muted); font: inherit; font-size: 14px; cursor: pointer;" },
                            "Annuler"
                          ),
                          $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.cal?.apply },
                            "Appliquer",
                            $h("span", { "class": "sw-btn-tile" },
                              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                                $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                ] : null
              )
            ),
            $h("span", { "aria-hidden": "true", "style": "display: block; height: 1px; background: var(--line);" }),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px;" },
              $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
                ($l($v.bar)).map((b) => [
                  $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": b?.toggle, "aria-expanded": b?.open, "aria-haspopup": "listbox", "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; background: ${$t(b?.bg)}; box-shadow: inset 0 0 0 1px ${$t(b?.edge)}; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;` },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": b?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "color: var(--ink-muted);" },
                      $t(b?.k)
                    ),
                    $h("span", { "style": "font-weight: 600;" },
                      $t(b?.v)
                    ),
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ]),
                ($l($v.chips)).map((c) => [
                  $h("button", { "class": "sw-badge sw-badge-accent", "type": "button", "onClick": c?.clear, "aria-label": `Retirer le filtre ${$t(c?.label)}`, "style": "height: 32px; padding: 0 8px 0 12px; border: 0; cursor: pointer; font-family: inherit; gap: 6px;" },
                    $t(c?.label),
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
                      $h("input", { "ref": $v.setMenuInput, "type": "search", "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": $v.menu?.search, "placeholder": $v.menu?.search, "style": "flex: 1; min-width: 0; border: 0; background: transparent; outline: none; color: var(--ink); font: inherit; font-size: 14px;" })
                    ),
                    ($l($v.menu?.items)).map((it) => [
                      $h("button", { "type": "button", "role": "option", "aria-selected": it?.sel, "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `width: 100%; height: 46px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(it?.bg)}; color: var(--ink); font: inherit; font-size: 14px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)};` },
                        $h("span", { "aria-hidden": "true", "style": `width: 18px; height: 18px; border-radius: ${$t(it?.radius)}; border: 1.5px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                          $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        (it?.flag) ? [
                          $h("span", { "class": "sw-flag", "data-c": it?.flag, "aria-hidden": "true" })
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
                        $t($v.menu?.foot)
                      ),
                      $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.closeMenu },
                        "Voir ", $t($v.total), " apps",
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
              $h("div", { "style": "display: flex; align-items: center; gap: 18px;" },
                $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; line-height: 1.25;" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "Affichées"
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    $t($v.total), " apps"
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 28px; background: var(--line);" }),
                $h("div", { "style": "position: relative;" },
                  $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": $v.sortBtn?.toggle, "aria-expanded": $v.sortBtn?.open, "aria-haspopup": "listbox", "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; background: ${$t($v.sortBtn?.bg)}; box-shadow: inset 0 0 0 1px ${$t($v.sortBtn?.edge)}; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;` },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t($v.sortBtn?.ic)};` },
                      $h("path", { "d": "M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "color: var(--ink-muted);" },
                      "Trier par"
                    ),
                    $h("span", { "style": "font-weight: 600;" },
                      $t($v.sortLabel)
                    ),
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": $v.sortBtn?.dirD, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($v.sortMenu?.on) ? [
                    $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": "Trier par", "style": "position: absolute; top: 46px; right: 0; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: #0D111A; border: 1px solid var(--glass-edge); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                      $h("span", { "style": "display: block; padding: 10px 12px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                        "Trier par"
                      ),
                      ($l($v.sortMenu?.items)).map((o) => [
                        $h("button", { "type": "button", "role": "option", "aria-selected": o?.sel, "onClick": o?.pick, "style": `width: 100%; display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(o?.bg)}; color: var(--ink); font: inherit; font-size: 14px; font-weight: ${$t(o?.fw)}; text-align: left; cursor: pointer;` },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(o?.ic)};` },
                            $h("path", { "d": o?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          ),
                          $h("span", { "style": "flex: 1;" },
                            $t(o?.l)
                          ),
                          (o?.on) ? [
                            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--accent);" },
                              $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        )
                      ]),
                      $h("span", { "aria-hidden": "true", "style": "display: block; height: 1px; margin: 6px 4px; background: var(--line);" }),
                      $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 4px 4px 12px;" },
                        $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                          "Ordre"
                        ),
                        $h("span", { "role": "radiogroup", "aria-label": "Ordre", "style": "display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: var(--track);" },
                          ($l($v.sortMenu?.dirs)).map((r) => [
                            $h("button", { "type": "button", "role": "radio", "aria-checked": r?.sel, "onClick": r?.pick, "style": `display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border: 0; border-radius: 8px; background: ${$t(r?.bg)}; color: ${$t(r?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t(r?.fw)}; cursor: pointer;` },
                              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": r?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              ),
                              $t(r?.l)
                            )
                          ])
                        )
                      )
                    )
                  ] : null
                )
              )
            )
          ),
          $h("div", { "style": "margin: 16px 32px 0; overflow-x: auto; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1120px;" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "aria-sort": $v.hd?.name?.aria, "style": "width: 270px; padding-top: 9px; padding-bottom: 9px; padding-left: 20px;" },
                    $h("button", { "type": "button", "onClick": $v.hd?.name?.pick, "style": `display: inline-flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 0; border: 0; background: transparent; color: ${$t($v.hd?.name?.ink)}; font: inherit; font-size: 12px; font-weight: ${$t($v.hd?.name?.fw)}; cursor: pointer;` },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t($v.hd?.name?.ic)};` },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "App",
                      $h("span", { "style": `display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: ${$t($v.hd?.name?.sBg)}; color: ${$t($v.hd?.name?.sInk)};` },
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": $v.hd?.name?.sD, "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  ),
                  $h("th", { "style": "width: 165px; padding-top: 9px; padding-bottom: 9px;" },
                    $h("span", { "class": "sw-th" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                        $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Niche"
                    )
                  ),
                  $h("th", { "style": "width: 265px; padding-top: 9px; padding-bottom: 9px;" },
                    $h("span", { "class": "sw-th" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                        $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Leurs vidéos qui cartonnent"
                    )
                  ),
                  $h("th", { "aria-sort": $v.hd?.views?.aria, "style": "width: 270px; padding-top: 9px; padding-bottom: 9px;" },
                    $h("button", { "type": "button", "onClick": $v.hd?.views?.pick, "style": `display: inline-flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 0; border: 0; background: transparent; color: ${$t($v.hd?.views?.ink)}; font: inherit; font-size: 12px; font-weight: ${$t($v.hd?.views?.fw)}; cursor: pointer;` },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t($v.hd?.views?.ic)};` },
                        $h("path", { "d": "M3 3v18h18M7 15l4-4 3 3 5-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t($v.vlab),
                      $h("span", { "style": `display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: ${$t($v.hd?.views?.sBg)}; color: ${$t($v.hd?.views?.sInk)};` },
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": $v.hd?.views?.sD, "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  ),
                  $h("th", { "class": "sw-num", "aria-sort": $v.hd?.best?.aria, "style": "width: 150px; padding-top: 9px; padding-bottom: 9px; padding-right: 20px;" },
                    $h("button", { "type": "button", "onClick": $v.hd?.best?.pick, "style": `display: inline-flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 0; border: 0; background: transparent; color: ${$t($v.hd?.best?.ink)}; font: inherit; font-size: 12px; font-weight: ${$t($v.hd?.best?.fw)}; cursor: pointer;` },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t($v.hd?.best?.ic)};` },
                        $h("path", { "d": "M13 2L4 14h7l-1 8 9-12h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Meilleure",
                      $h("span", { "style": `display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: ${$t($v.hd?.best?.sBg)}; color: ${$t($v.hd?.best?.sInk)};` },
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": $v.hd?.best?.sD, "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ),
              $h("tbody", null,
                ($l($v.rows)).map((r) => [
                  $h("tr", { "style": `background: ${$t(r?.bg)};` },
                    $h("td", { "style": "padding: 10px 12px 10px 20px;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 14px; min-width: 0;" },
                        $h("span", { "style": "width: 20px; flex-shrink: 0; font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                          $t(r?.rank)
                        ),
                        $h("button", { "type": "button", "class": "sw-app", "onClick": r?.open, "aria-label": `Aperçu de ${$t(r?.n)}`, "style": "min-width: 0; gap: 14px; border: 0; background: transparent; padding: 0; font: inherit; color: inherit; text-align: left; cursor: pointer;" },
                          $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 11px;" },
                            (r?.logo) ? [
                              $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                            ] : null,
                            (r?.nologo) ? [
                              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                              )
                            ] : null
                          ),
                          $h("span", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                            $h("span", { "class": "sw-app-name", "style": "font-size: 15px; font-weight: 600; letter-spacing: -0.01em;" },
                              $t(r?.n)
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                              $t(r?.net)
                            )
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-start; gap: 6px;" },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 12px; font-weight: 500; color: var(--ink); white-space: nowrap;" },
                          $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                            $h("path", { "d": r?.nicheIc, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          ),
                          $t(r?.niche)
                        ),
                        $h("span", { "style": "display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--ink-faint); white-space: nowrap;" },
                          ($l(r?.mks)).map((k) => [
                            $h("span", { "title": k?.t, "style": "display: inline-flex; align-items: center; gap: 6px;" },
                              $h("span", { "class": "sw-flag", "data-c": k?.c, "aria-hidden": "true" }),
                              $t(k?.p)
                            )
                          ])
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                        $h("span", { "style": "display: flex; gap: 8px;" },
                          ($l(r?.thumbs)).map((t) => [
                            $h("a", { "href": t?.href, "class": `sw-video ${$t(t?.t)}`, "style": "display: block; width: 58px; height: 78px; aspect-ratio: auto; border-radius: 10px;" },
                              $h("img", { "class": "sw-cover", "src": t?.src, "alt": "", "loading": "lazy" }),
                              $h("span", { "class": "sw-video-shade" }),
                              $h("span", { "style": "position: absolute; left: 6px; bottom: 5px; font-size: 11px; font-weight: 700; color: #FFFFFF;" },
                                $t(t?.v)
                              )
                            )
                          ])
                        ),
                        (r?.count) ? [
                          $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                            $h("span", { "style": "color: var(--ink-soft); font-weight: 600;" },
                              $t(r?.count)
                            ),
                            " vidéos en 30 jours"
                          )
                        ] : null
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; align-items: center; gap: 14px;" },
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 92px;" },
                          $h("span", { "style": "font-family: var(--font-display); font-size: 20px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; color: var(--ink);" },
                            $t(r?.v30)
                          ),
                          $h("span", { "style": `font-size: 11px; font-weight: 600; white-space: nowrap; color: ${$t(r?.dInk)};` },
                            $t(r?.delta)
                          )
                        ),
                        $h("svg", { "width": "130", "height": "40", "viewBox": "0 0 130 40", "aria-hidden": "true", "style": "display: block; flex-shrink: 0; overflow: visible;" },
                          $h("defs", null,
                            $h("linearGradient", { "id": r?.gid, "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                              $h("stop", { "offset": "0", "stop-color": r?.stroke, "stop-opacity": "0.28" }),
                              $h("stop", { "offset": "1", "stop-color": r?.stroke, "stop-opacity": "0" })
                            )
                          ),
                          $h("path", { "d": r?.area, "fill": `url(#${$t(r?.gid)})` }),
                          $h("path", { "d": r?.line, "fill": "none", "stroke": r?.stroke, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                          $h("circle", { "cx": r?.ex, "cy": r?.ey, "r": "3.5", "fill": r?.stroke, "stroke": "#121722", "stroke-width": "2" })
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num", "style": "padding-right: 20px;" },
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 20px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; color: var(--accent);" },
                          $t(r?.best)
                        ),
                        $h("span", { "style": "font-size: 11px; font-weight: 400; color: var(--ink-faint);" },
                          "sa normale"
                        )
                      )
                    )
                  )
                ]),
                ($v.empty) ? [
                  $h("tr", null,
                    $h("td", { "colspan": "5", "style": "padding: 48px 20px; text-align: center; color: var(--ink-muted);" },
                      "Aucune app pour ces filtres. ",
                      $h("button", { "class": "sw-link", "type": "button", "onClick": $v.clearAll, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-weight: 600;" },
                        "Effacer les filtres"
                      )
                    )
                  )
                ] : null
              )
            )
          ),
          $h("footer", { "style": "margin-top: auto; padding: 28px 32px 32px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;" },
            $h("p", { "class": "sw-calc", "style": "margin: 0;" },
              "Vues des vidéos publiées par les comptes de l'app."
            ),
            $h("p", { "class": "sw-calc", "style": "margin: 0;" },
              "Meilleure = sa meilleure vidéo de la semaine face à la normale de son compte."
            )
          )
        ),
        ($v.pv?.on) ? [
          $h("button", { "type": "button", "aria-label": "Fermer l’aperçu", "onClick": $v.closePv, "style": "position: fixed; inset: 0; z-index: 40; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.45);" }),
          $h("aside", { "role": "dialog", "aria-modal": "true", "aria-label": `Aperçu de ${$t($v.pv?.n)}`, "onKeyDown": $v.pvKeys, "style": "position: fixed; top: 0; right: 0; bottom: 0; z-index: 41; width: 520px; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column; background: var(--surface-raised); border-left: 1px solid var(--line); box-shadow: -40px 0 80px rgba(0,0,0,0.5); animation: sw-rise .4s cubic-bezier(.2,.8,.2,1) both;" },
            $h("header", { "style": "flex-shrink: 0; padding: clamp(14px, 2.6vh, 24px) 24px clamp(10px, 1.8vh, 18px); display: flex; flex-direction: column;" },
              $h("div", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;" },
                $h("div", { "class": "sw-app", "style": "gap: 14px;" },
                  $h("span", { "class": `sw-app-icon ${$t($v.pv?.blank)}`, "style": "width: 52px; height: 52px; border-radius: 15px;" },
                    ($v.pv?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.pv?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    ($v.pv?.nologo) ? [
                      $h("svg", { "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                    $h("h2", { "style": "margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;" },
                      $t($v.pv?.n)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      $t($v.pv?.niche)
                    )
                  )
                ),
                $h("span", { "style": "display: flex; gap: 6px;" },
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
                  $h("button", { "ref": $v.setPvClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closePv, "aria-label": "Fermer l’aperçu", "style": "width: 40px; height: 40px; background: var(--track);" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            ),
            $h("div", { "style": `flex: 1 1 auto; min-height: 0; overflow: hidden; padding: 0 24px clamp(10px, 1.8vh, 18px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: ${$t($v.pv?.rows)}; gap: clamp(8px, 1.3vh, 12px);` },
              $h("section", { "aria-label": "Vues sur 30 jours", "style": "grid-column: 1 / span 2; min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; padding: clamp(12px, 1.9vh, 16px) 18px clamp(8px, 1.3vh, 12px); border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("div", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;" },
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                      $t($v.pv?.vLabel)
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: clamp(30px, 4.6vh, 44px); line-height: 1; font-weight: 700; letter-spacing: -0.045em;" },
                      $t($v.pv?.v30)
                    )
                  ),
                  $h("div", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      "Cette semaine"
                    ),
                    $h("span", { "style": "display: inline-flex; align-items: baseline; gap: 8px;" },
                      $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                        $t($v.pv?.week)
                      ),
                      ($v.pv?.delta) ? [
                        $h("span", { "style": `display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: ${$t($v.pv?.dBg)}; font-size: 12px; font-weight: 600; color: ${$t($v.pv?.dInk)};` },
                          $t($v.pv?.delta)
                        )
                      ] : null
                    )
                  )
                ),
                $h("svg", { "viewBox": "0 0 436 72", "preserveAspectRatio": "none", "role": "img", "aria-label": "Vues par semaine sur 6 semaines", "style": "flex: 1; min-height: 24px; width: 100%; margin-top: clamp(4px, 1vh, 10px); overflow: visible;" },
                  $h("defs", null,
                    $h("linearGradient", { "id": "apAr", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                      $h("stop", { "offset": "0", "stop-color": "#4C9AFF", "stop-opacity": "0.32" }),
                      $h("stop", { "offset": "1", "stop-color": "#4C9AFF", "stop-opacity": "0" })
                    )
                  ),
                  $h("path", { "d": $v.pv?.area, "fill": "url(#apAr)" }),
                  $h("path", { "d": $v.pv?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" })
                ),
                $h("div", { "style": "display: flex; justify-content: space-between; margin-top: 6px;" },
                  ($l($v.pv?.labels)).map((l) => [
                    $h("span", { "style": `font-size: 11px; color: ${$t(l?.ink)}; font-weight: ${$t(l?.fw)};` },
                      $t(l?.t)
                    )
                  ])
                )
              ),
              $h("section", { "aria-label": "Sa place", "style": "min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; padding: clamp(12px, 1.9vh, 16px) 16px; border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                  "Sa place"
                ),
                $h("span", { "style": "margin-top: 4px; font-family: var(--font-display); font-size: clamp(24px, 3.6vh, 34px); line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                  $t($v.pv?.rank)
                ),
                $h("span", { "style": "margin-top: 4px; font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.pv?.rankOf)
                ),
                $h("div", { "aria-hidden": "true", "style": "flex: 1; min-height: 0; margin-top: clamp(6px, 1.2vh, 12px); display: flex; align-items: flex-end; gap: 6px;" },
                  ($l($v.pv?.bars)).map((b) => [
                    $h("span", { "title": b?.title, "style": `flex: 1; height: ${$t(b?.h)}; min-height: 3px; border-radius: 6px 6px 2px 2px; background: ${$t(b?.bg)};` })
                  ])
                )
              ),
              $h("section", { "aria-label": "Son réseau", "style": "min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; padding: clamp(12px, 1.9vh, 16px) 16px; border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                  "Son réseau"
                ),
                $h("span", { "style": "margin-top: 4px; display: flex; align-items: baseline; gap: 6px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: clamp(24px, 3.6vh, 34px); line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                    $t($v.pv?.acc)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t($v.pv?.accLabel)
                  )
                ),
                ($v.pv?.hasTop10) ? [
                  $h("div", { "aria-hidden": "true", "style": "margin-top: auto; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px;" },
                    ($l($v.pv?.waffle)).map((c) => [
                      $h("span", { "style": `height: clamp(7px, 1.5vh, 15px); border-radius: 3px; background: ${$t(c?.bg)};` })
                    ])
                  ),
                  $h("span", { "style": "margin-top: clamp(4px, 0.8vh, 8px); font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                    $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                      "10 comptes"
                    ),
                    " font ", $t($v.pv?.top10), " des vues"
                  )
                ] : null
              ),
              ($v.pv?.hasTop) ? [
                $h("a", { "href": $v.pv?.top?.href, "aria-label": $v.pv?.top?.aria, "style": "grid-column: 1 / span 2; min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; gap: 14px; padding: clamp(8px, 1.3vh, 12px); border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); text-decoration: none; color: var(--ink);" },
                  $h("span", { "class": "sw-video", "style": "position: relative; flex: 0 0 auto; height: 100%; aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden; background: #0A0C12;" },
                    $h("img", { "class": "sw-cover", "src": $v.pv?.top?.cover, "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "aria-hidden": "true", "style": "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 34px; height: 34px; border-radius: 50%; background: rgba(5,7,12,0.55); display: flex; align-items: center; justify-content: center;" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                        $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "#FFFFFF" })
                      )
                    )
                  ),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 6px;" },
                    $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                      "Sa vidéo la plus vue"
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: clamp(22px, 3.3vh, 30px); line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                      $t($v.pv?.top?.views)
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 13px; color: var(--ink-faint);" },
                      ($v.pv?.top?.x) ? [
                        $h("span", { "style": "flex-shrink: 0; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: var(--accent-soft); font-size: 12px; font-weight: 600; color: var(--accent);" },
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
              $h("section", { "aria-label": "Rythme", "style": "min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(12px, 1.9vh, 16px) 16px; border-radius: 22px; background: var(--track);" },
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                  "Vidéos par semaine"
                ),
                $h("span", { "style": "font-family: var(--font-display); font-size: clamp(22px, 3.3vh, 30px); line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                  $t($v.pv?.ppw)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  ($v.pv?.best) ? [
                    "meilleure à ",
                    $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                      $t($v.pv?.best)
                    ),
                    " sa normale"
                  ] : null
                )
              ),
              $h("section", { "aria-label": "Où ses vues se font", "style": "min-height: 0; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(12px, 1.9vh, 16px) 16px; border-radius: 22px; background: var(--track);" },
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                  "Où ses vues se font"
                ),
                ($l($v.pv?.mkd)).map((m) => [
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                    $h("span", { "style": "display: flex; justify-content: space-between; gap: 8px; font-size: 12px;" },
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; min-width: 0; color: var(--ink-soft);" },
                        $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true", "style": "flex-shrink: 0;" }),
                        $h("span", { "title": m?.full, "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                          $t(m?.l)
                        )
                      ),
                      $h("span", { "style": "flex-shrink: 0; font-weight: 600; white-space: nowrap;" },
                        $t(m?.p)
                      )
                    ),
                    $h("span", { "aria-hidden": "true", "style": "height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08);" },
                      $h("span", { "style": `display: block; width: ${$t(m?.w)}; height: 6px; border-radius: 3px; background: ${$t(m?.bg)};` })
                    )
                  )
                ])
              )
            ),
            $h("footer", { "style": "flex-shrink: 0; padding: clamp(10px, 1.7vh, 16px) 24px clamp(12px, 2.6vh, 24px); border-top: 1px solid var(--line); display: flex; align-items: center; gap: 10px;" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn, "style": "height: 48px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $t($v.pv?.followLabel)
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $v.pv?.href, "style": "flex: 1; justify-content: space-between;" },
                "Voir la fiche",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
