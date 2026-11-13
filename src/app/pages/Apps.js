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
    let MKD = {"Astra AI": [["ID", "Indonésie et Vietnam", 65], ["US", "États-Unis", 19], ["ES", "Espagne", 8], ["BR", "Brésil et Portugal", 5], ["FR", "France", 2], ["MX", "Amérique latine", 1]], "Love8": [["US", "États-Unis", 66], ["ID", "Indonésie et Vietnam", 23], ["FR", "France", 8], ["MX", "Amérique latine", 4]]};
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['ID', 'Indonésie et Vietnam', 'ID'], ['MX', 'Mexique et Amérique latine', 'MX'], ['FR', 'France', 'FR'], ['BR', 'Brésil', 'BR'], ['ES', 'Espagne', 'ES']];
    let NIS = ['Séduction IA', 'Jalousie et ex', 'Études', 'Santé et physique', 'Couple', 'Langues', 'Side hustle', 'Foi', 'Social et loisirs', 'Beauté IA'];
    const T = ['t-plum', 't-navy', 't-pine', 't-violet', 't-umber', 't-amber'];
    // Sur le site : les vraies données du Radar (document « apps », convex/radarModels.ts).
    // Sur le canevas : l'exemple ci-dessus. A[i] = [nom, niche, marchés, comptes, vidéos/sem.,
    // vues 30 j (M), 6 semaines (M), meilleure, miniatures, vues des miniatures, icône,
    // slug, id des vidéos, nouvelle ?, vues 30 j TikTok (M), Instagram (M), 7 j TikTok (M), 7 j Instagram (M)]
    const D = this.props && this.props.data;
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(x).replace('.', ',')) + '×';
    if (D && D.apps) {
      const LBL = Object.fromEntries(D.markets);
      A = D.apps.map((a) => [a.name, a.niche, a.markets.map((m) => m[0]), a.accounts, a.videosPerWeek, a.views30 / 1e6, a.weeks.map((w) => w / 1e6),
        a.bestX ? xf(a.bestX) : '—', a.top.map((t) => t.cover || ''), a.top.map((t) => nf(t.views)), a.icon || '', a.slug, a.top.map((t) => t.id), a.isNew,
        (a.views30 - a.views30Ig) / 1e6, a.views30Ig / 1e6, (a.views7 - (a.views7Ig || 0)) / 1e6, (a.views7Ig || 0) / 1e6]);
      MKD = Object.fromEntries(D.apps.map((a) => [a.name, a.markets.map(([c, p]) => [c, LBL[c] || c, p])]));
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l, c === 'XX' ? '' : c]));
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
    const period = st.period || '30';
    const mq = (st.mq || '').toLowerCase();
    const fr = (x, d) => x.toFixed(d).replace('.', ',');
    const okM = (a, m) => m === 'ALL' || a[2].indexOf(m) >= 0;
    const okN = (a, ns) => ns.length === 0 || ns.indexOf(a[1]) >= 0;
    const platform = st.platform || 'ALL';
    const isNew = (a) => (a[13] !== undefined ? a[13] : a[6][0] + a[6][1] < 0.2);
    // Vues de la période et de la plateforme choisies (sans découpage par plateforme dans l'exemple : le total).
    const views = (a) => {
      if (platform === 'tiktok' && a[14] !== undefined) return period === '7' ? a[16] : a[14];
      if (platform === 'instagram' && a[15] !== undefined) return period === '7' ? a[17] : a[15];
      return period === '7' ? a[6][5] : a[5];
    };
    const dlt = (a) => (a[6][4] > 0 ? (a[6][5] - a[6][4]) / a[6][4] : 0);
    const set = (patch) => this.setState(Object.assign({ open, market, niches, sort, period, platform }, patch));
    let list = A.filter((a) => okM(a, market) && okN(a, niches) && (platform === 'ALL' || views(a) > 0));
    if (sort === 'nouvelles') list = list.filter(isNew);
    list = list.slice().sort((x, y) => (sort === 'accel' ? dlt(y) - dlt(x) : views(y) - views(x)));
    const rows = list.map((a, i) => {
      const w = a[6];
      const max = Math.max.apply(null, w) || 1;
      const pts = w.map((v, j) => [2 + j * 25.2, 36 - (v / max) * 30]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const d = dlt(a);
      const up = d >= 0;
      return {
        rank: String(i + 1).padStart(2, '0'), n: a[0], niche: a[1], mk: a[2].filter((c) => c !== 'XX').slice(0, 3).map((c) => ({ c })),
        acc: a[3], ppw: a[4].toLocaleString('fr-FR'), v30: fr(views(a), 1) + ' M',
        delta: (up ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' % cette semaine', dInk: up ? 'var(--accent)' : 'var(--ink-faint)',
        line, area: line + ' L127.9 40 L2 40 Z', endY: pts[5][1].toFixed(1),
        stroke: up ? '#4C9AFF' : '#8A93A3', fill: up ? 'rgba(76,154,255,0.16)' : 'rgba(138,147,163,0.12)',
        revLo: Math.round(views(a) * 2.5), revHi: Math.round(views(a) * 3.5), best: a[7],
        thumbs: a[8].map((src, j) => ({ src, v: a[9][j], t: T[(i + j) % T.length], href: videoOf(a, j) })).filter((t) => t.src),
        logo: a[10] || false, nologo: !a[10], blank: a[10] ? '' : 'sw-app-blank',
        bg: st.pv === a[0] ? 'var(--accent-soft)' : 'transparent',
        open: () => this.setState({ pv: a[0], open: '' })
      };
    });
    const mLabel = MKS.filter((m) => m[0] === market)[0][1];
    const nLabel = niches.length === 0 ? 'Toutes' : (niches.length === 1 ? niches[0] : niches.length + ' niches');
    const mkBar = (key, k, v) => ({ k, v, open: open === key ? 'true' : 'false', bg: open === key ? 'var(--tab-on)' : 'var(--track)', edge: open === key ? 'var(--accent-edge)' : 'var(--line)',
      toggle: () => set({ open: open === key ? '' : key, mq: '' }) });
    const PL = { ALL: 'Toutes', tiktok: 'TikTok', instagram: 'Instagram' };
    const bar = [mkBar('marche', 'Marché', market === 'ALL' ? 'Tous' : mLabel), mkBar('niche', 'Niche', nLabel), mkBar('plateforme', 'Plateforme', PL[platform])];
    const chips = [];
    if (market !== 'ALL') chips.push({ label: mLabel, clear: () => set({ market: 'ALL' }) });
    niches.forEach((n) => chips.push({ label: n, clear: () => set({ niches: niches.filter((x) => x !== n) }) }));
    if (platform !== 'ALL') chips.push({ label: PL[platform], clear: () => set({ platform: 'ALL' }) });
    const radio = (on) => ({ radius: '50%', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const check = (on) => ({ radius: '5px', box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const keep = (label) => !mq || label.toLowerCase().indexOf(mq) >= 0;
    let menu = { on: false, items: [], left: '0px', title: '', search: '', foot: '' };
    if (open === 'marche') {
      menu = { on: true, left: '0px', title: 'Marché', search: 'Chercher un marché', foot: 'Le marché choisi vaut pour tout le classement.',
        items: MKS.filter((m) => keep(m[1])).map((m) => { const n = A.filter((r) => okM(r, m[0]) && okN(r, niches)).length; const on = market === m[0];
          return Object.assign({ label: m[1], flag: m[2] || false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => set({ market: m[0] }) }, radio(on)); }) };
    } else if (open === 'niche') {
      menu = { on: true, left: '164px', title: 'Niche', search: 'Chercher une niche', foot: 'Plusieurs niches possibles. Les nombres tiennent compte du marché.',
        items: NIS.filter(keep).map((nm) => { const n = A.filter((r) => okM(r, market) && r[1] === nm).length; const on = niches.indexOf(nm) >= 0;
          return Object.assign({ label: nm, flag: false, n: n + ' apps', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1,
            pick: () => set({ niches: on ? niches.filter((x) => x !== nm) : niches.concat([nm]) }) }, check(on)); }) };
    } else if (open === 'plateforme') {
      menu = { on: true, left: '328px', title: 'Plateforme', search: 'Chercher une plateforme', foot: 'YouTube Shorts arrive bientôt.',
        items: [['ALL', 'Toutes'], ['tiktok', 'TikTok'], ['instagram', 'Instagram']].filter((p) => keep(p[1])).map((p) => { const on = platform === p[0];
          return Object.assign({ label: p[1], flag: false, n: '', sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: 1, pick: () => set({ platform: p[0] }) }, radio(on)); }) };
    }
    const sorts = [['vues', 'Les plus vues'], ['accel', 'Qui accélèrent'], ['nouvelles', 'Nouvelles']].map((s) => ({ l: s[1], on: s[0] === sort ? 'true' : 'false', pick: () => set({ sort: s[0] }) }));
    const periods = [['7', '7 jours'], ['30', '30 jours']].map((p) => ({ l: p[1], on: p[0] === period ? 'true' : 'false', pick: () => set({ period: p[0] }) }));
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
      const pts = w.map((v, j) => [6 + j * 90.4, 90 - v / mx * 74]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const d = dlt(pa);
      const md = MKD[pa[0]];
      pv = { on: true, n: pa[0], niche: pa[1], mk: pa[2].filter((c) => c !== 'XX').slice(0, 3).map((c) => ({ c })), logo: pa[10] || false, nologo: !pa[10], blank: pa[10] ? '' : 'sw-app-blank',
        lo: Math.round(pa[5] * 2.5), hi: Math.round(pa[5] * 3.5), delta: (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' % cette semaine',
        line, area: line + ' L458 94 L6 94 Z', ex: pts[5][0].toFixed(1), ey: pts[5][1].toFixed(1), week: fr(w[5], 1) + ' M',
        v30: fr(pa[5], 1) + ' M', acc: pa[3], ppw: pa[4].toLocaleString('fr-FR'),
        vids: pa[8].map((src, j) => ({ src, v: pa[9][j], href: videoOf(pa, j) })).filter((x) => x.src), href: ficheOf(pa),
        hasMk: !!md, noMk: !md, mkd: (md || []).map((m, i) => ({ c: m[0], l: m[1], p: m[2] + ' %', w: m[2] + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' })),
        followLabel: followed(pa) ? 'Suivie' : 'Suivre ' + pa[0], followOn: followed(pa) ? 'true' : 'false', follow: () => toggleFollow(pa) };
      ajItem = { kind: 'app', id: pa[11] || pa[0], label: pa[0], cover: pa[10] || null };
    }
    return {
      rows, empty: rows.length === 0, total: rows.length, bar, chips, menu, sorts, periods, pv, ajItem,
      vlab: period === '7' ? 'Vues 7 j' : 'Vues 30 j', rlab: period === '7' ? 'sur 7 jours' : 'sur 30 jours', sortLabel: sort === 'accel' ? 'progression de la semaine' : (period === '7' ? 'vues 7 j' : 'vues 30 j'),
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
                "Apps"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Les apps que les réseaux de créateurs poussent, classées par vues."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qa", "type": "search", "aria-label": "Chercher une app", "placeholder": "Chercher une app…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "margin: 24px 32px 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid var(--line);" },
            $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "aria-label": "Classement", "style": "border-bottom: 0;" },
              ($l($v.sorts)).map((s) => [
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick },
                  $t(s?.l)
                )
              ])
            ),
            $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Période", "style": "margin-bottom: 10px;" },
              ($l($v.periods)).map((p) => [
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": p?.on, "onClick": p?.pick, "style": "height: 30px;" },
                  $t(p?.l)
                )
              ])
            )
          ),
          $h("div", { "style": "padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "style": "position: relative; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" },
              ($l($v.bar)).map((b) => [
                $h("button", { "class": "sw-pill", "type": "button", "data-menu-trigger": "true", "onClick": b?.toggle, "aria-expanded": b?.open, "aria-haspopup": "listbox", "style": `height: 40px; padding: 0 12px 0 14px; gap: 6px; background: ${$t(b?.bg)}; border-color: ${$t(b?.edge)};` },
                  $h("span", { "style": "color: var(--ink-faint);" },
                    $t(b?.k)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(b?.v)
                  ),
                  $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
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
                $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": $v.menu?.title, "style": `position: absolute; top: 52px; left: ${$t($v.menu?.left)}; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: rgba(13,17,26,0.96); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;` },
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
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              "Trier par ",
              $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                $t($v.sortLabel)
              )
            )
          ),
          $h("div", { "style": "margin: 0 32px; overflow-x: auto; border: 1px solid var(--line); border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom));" },
            $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1180px;" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "style": "width: 44px; padding-left: 20px;" },
                    "#"
                  ),
                  $h("th", { "style": "width: 250px;" },
                    "App"
                  ),
                  $h("th", { "style": "width: 120px;" },
                    "Réseau"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 120px;" },
                    $t($v.vlab)
                  ),
                  $h("th", { "style": "width: 140px;" },
                    "6 semaines"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 172px;" },
                    "Revenus estimés"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 100px;" },
                    "Meilleure"
                  ),
                  $h("th", { "style": "width: 156px; padding-right: 20px;" },
                    "Ses vidéos"
                  )
                )
              ),
              $h("tbody", null,
                ($l($v.rows)).map((r) => [
                  $h("tr", { "style": `background: ${$t(r?.bg)};` },
                    $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t(r?.rank)
                    ),
                    $h("td", null,
                      $h("button", { "type": "button", "class": "sw-app", "onClick": r?.open, "aria-label": `Aperçu de ${$t(r?.n)}`, "style": "border: 0; background: transparent; padding: 0; font: inherit; color: inherit; text-align: left; cursor: pointer;" },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 12px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 0;" },
                          $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                            $t(r?.n)
                          ),
                          $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(r?.niche)
                            ),
                            ($l(r?.mk)).map((m) => [
                              $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                                $t(m?.c)
                              )
                            ])
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-size: 14px; font-weight: 600; color: var(--ink);" },
                          $t(r?.acc), " comptes"
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t(r?.ppw), " vidéos / sem."
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                          $t(r?.v30)
                        ),
                        $h("span", { "style": `font-size: 11px; font-weight: 600; white-space: nowrap; color: ${$t(r?.dInk)};` },
                          $t(r?.delta)
                        )
                      )
                    ),
                    $h("td", null,
                      $h("svg", { "width": "130", "height": "40", "viewBox": "0 0 130 40", "aria-hidden": "true", "style": "display: block;" },
                        $h("path", { "d": r?.area, "fill": r?.fill }),
                        $h("path", { "d": r?.line, "fill": "none", "stroke": r?.stroke, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                        $h("circle", { "cx": "128", "cy": r?.endY, "r": "3", "fill": r?.stroke })
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 2px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap;" },
                          $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                            "Entre "
                          ),
                          $t(r?.revLo),
                          $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                            " et "
                          ),
                          $t(r?.revHi), " k€"
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          $t($v.rlab)
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "class": "sw-badge sw-badge-accent" },
                        $t(r?.best)
                      )
                    ),
                    $h("td", { "style": "padding-right: 20px;" },
                      $h("span", { "style": "display: flex; gap: 6px;" },
                        ($l(r?.thumbs)).map((t) => [
                          $h("a", { "href": t?.href, "class": `sw-video ${$t(t?.t)}`, "style": "display: block; width: 44px; border-radius: 8px;" },
                            $h("img", { "class": "sw-cover", "src": t?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "style": "position: absolute; left: 4px; bottom: 4px; font-size: 9px; font-weight: 700; color: #FFFFFF;" },
                              $t(t?.v)
                            )
                          )
                        ])
                      )
                    )
                  )
                ]),
                ($v.empty) ? [
                  $h("tr", null,
                    $h("td", { "colspan": "8", "style": "padding: 48px 20px; text-align: center; color: var(--ink-muted);" },
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
            $h("header", { "style": "padding: 24px 28px 0; display: flex; flex-direction: column; gap: 18px;" },
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
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-faint);" },
                      $t($v.pv?.niche),
                      ($l($v.pv?.mk)).map((m) => [
                        $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                          $t(m?.c)
                        )
                      ])
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
              ),
              $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "style": "gap: 20px;" },
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true" },
                  "Aperçu"
                ),
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": `${$t($v.pv?.href)}#fa-vid`, "style": "display: inline-flex; align-items: center; text-decoration: none;" },
                  "Vidéos"
                ),
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": `${$t($v.pv?.href)}#fa-fmt`, "style": "display: inline-flex; align-items: center; text-decoration: none;" },
                  "Formats"
                ),
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": `${$t($v.pv?.href)}#fa-cr`, "style": "display: inline-flex; align-items: center; text-decoration: none;" },
                  "Créateurs"
                )
              )
            ),
            $h("div", { "style": "flex: 1 1 auto; overflow-y: auto; padding: 22px 28px; display: flex; flex-direction: column; gap: 22px;" },
              $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                  "Revenus estimés sur 30 jours"
                ),
                $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 40px; font-weight: 700; letter-spacing: -0.04em; line-height: 1;" },
                    $h("span", { "style": "font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: var(--ink-muted);" },
                      "Entre "
                    ),
                    $t($v.pv?.lo),
                    $h("span", { "style": "font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: var(--ink-muted);" },
                      " et "
                    ),
                    $t($v.pv?.hi), " k€"
                  ),
                  $h("span", { "class": "sw-badge sw-badge-accent" },
                    $t($v.pv?.delta)
                  )
                )
              ),
              $h("svg", { "viewBox": "0 0 464 110", "width": "100%", "height": "110", "role": "img", "aria-label": "Vues par semaine sur 6 semaines" },
                $h("path", { "d": $v.pv?.area, "fill": "rgba(76,154,255,0.14)" }),
                $h("path", { "d": $v.pv?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                $h("circle", { "cx": $v.pv?.ex, "cy": $v.pv?.ey, "r": "5", "fill": "#4C9AFF" }),
                $h("text", { "x": "6", "y": "108", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                  "il y a 6 sem."
                ),
                $h("text", { "x": "458", "y": "108", "text-anchor": "end", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                  "cette semaine · ", $t($v.pv?.week)
                )
              ),
              $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Vues 30 j"
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    $t($v.pv?.v30)
                  )
                ),
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Comptes qui le poussent"
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    $t($v.pv?.acc)
                  )
                ),
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Vidéos / sem."
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    $t($v.pv?.ppw)
                  )
                )
              ),
              $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
                $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline;" },
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    "Leurs vidéos qui explosent"
                  ),
                  $h("a", { "class": "sw-more", "href": `${$t($v.pv?.href)}#fa-vid` },
                    "Toutes",
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  ($l($v.pv?.vids)).map((v) => [
                    $h("a", { "href": v?.href, "class": "sw-video", "style": "display: block; border-radius: 12px; text-decoration: none;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "class": "sw-video-foot" },
                        $h("span", { "class": "sw-video-views", "style": "font-size: 16px;" },
                          $t(v?.v)
                        )
                      )
                    )
                  ])
                )
              ),
              ($v.pv?.hasMk) ? [
                $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    "Où ses vues se font"
                  ),
                  ($l($v.pv?.mkd)).map((m) => [
                    $h("div", { "style": "display: grid; grid-template-columns: 28px 150px minmax(0, 1fr) 44px; align-items: center; gap: 10px; font-size: 13px;" },
                      $h("span", { "class": "sw-flag", "style": "width: 26px;" },
                        $t(m?.c)
                      ),
                      $h("span", { "style": "color: var(--ink-muted);" },
                        $t(m?.l)
                      ),
                      $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                        $h("span", { "style": `display: block; height: 6px; width: ${$t(m?.w)}; background: ${$t(m?.bg)}; border-radius: 3px;` })
                      ),
                      $h("span", { "style": "text-align: right; font-weight: 600; font-variant-numeric: tabular-nums;" },
                        $t(m?.p)
                      )
                    )
                  ])
                )
              ] : null,
              ($v.pv?.noMk) ? [
                $h("div", { "style": "display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink-muted);" },
                  $h("span", { "style": "font-weight: 600; color: var(--ink);" },
                    "Marchés"
                  ),
                  ($l($v.pv?.mk)).map((m) => [
                    $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                      $t(m?.c)
                    )
                  ])
                )
              ] : null
            ),
            $h("footer", { "style": "padding: 18px 28px 24px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: flex-end; gap: 12px;" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.pv?.follow, "aria-pressed": $v.pv?.followOn, "style": "height: 44px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $t($v.pv?.followLabel)
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": $v.pv?.href },
                "Ouvrir la fiche",
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
