// Généré par scripts/dc2preact.py depuis design/app/Main.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Accueil extends DCLogic {
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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'accueil' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const u = P.user;
    const p = u ? (u.prenom || null) : 'Anto';
    // Garder la vidéo du jour : dans au moins un dossier (saved('folders')) ; sur le canevas, l'état local d'AjoutDossier.
    const live = typeof P.saved === 'function';
    const fs = live ? P.saved('folders') : null;
    const kept = !!b.hero.item && Array.isArray(fs) && fs.some((f) => f && (f.items || []).some((i) => i.kind === 'video' && i.id === b.hero.item.id));
    // Le fil : Tout, ou une seule sorte d'événement ; seules les sortes présentes ont leur onglet (et il en faut deux).
    const kinds = ['apps', 'formats', 'creators'].filter((k) => b.events.some((e) => e.kind === k));
    const cur = st.fil && kinds.indexOf(st.fil) >= 0 ? st.fil : 'all';
    const tabs = [['all', 'Tout']].concat([['apps', 'Apps'], ['formats', 'Formats'], ['creators', 'Créateurs']].filter((t) => kinds.indexOf(t[0]) >= 0)).map(([k, l]) => {
      const on = k === cur;
      return { l, on: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'var(--glass-edge)', ink: on ? 'var(--ink)' : 'var(--ink-soft)', fw: on ? '600' : '500',
        pick: () => { if ((this.state || {}).fil !== k) this.setState({ fil: k }); } };
    });
    const rows = cur === 'all' ? b.events : b.events.filter((e) => e.kind === cur);
    return {
      greet: p ? 'Bon retour, ' + p + '.' : 'Bon retour.',
      lede: b.hasHero ? 'Une chose à voir, puis ce qui a bougé cette semaine.' : 'Ce qui a bougé cette semaine.',
      keep: { on: kept ? 'true' : 'false', label: kept ? 'Gardée' : 'Garder', bg: kept ? 'var(--accent-soft)' : 'var(--track)', ink: kept ? 'var(--accent)' : 'var(--ink)', fill: kept ? 'currentColor' : 'none' },
      fil: { on: b.events.length > 0, tabsOn: kinds.length > 1, tabs, rows },
      nothing: !b.hasHero && !b.events.length,
      fol: this.followVals(), dos: this.folderVals()
    };
  }

  // « Tes suivis » : les apps que la personne suit (saved('follows').apps), avec leurs vues sur 7 jours et leur variation
  // (document « apps ») ; chacune mène à sa fiche. Sur le canevas : deux apps d'exemple.
  followVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
    const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100).toLocaleString('fr-FR') + '\u202f%';
    const row = (a, i, xs) => { const has = typeof a.weekDelta === 'number', up = has && a.weekDelta >= 0;
      return { logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', name: a.name, sub: nf(a.views7 || 0) + ' vues · 7\u202fj', href: '/app/apps/' + a.slug,
        v: has ? pct(a.weekDelta) : '', ink: up ? '#5CD394' : '#FF9A9A', bg: up ? 'rgba(92,211,148,0.12)' : 'rgba(255,122,122,0.10)', sep: i === 0 ? 'transparent' : 'var(--line)' }; };
    if (!site) {
      const ex = (globalThis.__dcSample?.["Accueil"]?.["ex"] ?? []);
      return { rows: ex.map(row), list: true, empty: false, wait: false };
    }
    const fv = P.saved('follows');
    const slugs = fv && Array.isArray(fv.apps) ? fv.apps : [];
    const A = slugs.length && P.get ? P.get('apps') : null;
    const wait = fv === undefined || (slugs.length > 0 && A === undefined);
    const by = A && A.apps ? Object.fromEntries(A.apps.map((a) => [a.slug, a])) : {};
    const apps = wait ? [] : slugs.map((s) => by[s]).filter(Boolean).sort((p, q) => (q.views7 || 0) - (p.views7 || 0));
    return { rows: apps.slice(0, 4).map(row), list: apps.length > 0, empty: !wait && apps.length === 0, wait };
  }
  // « Tes dossiers » : ceux de la personne (saved('folders')), les plus récents d'abord ; chacun mène à son dossier.
  folderVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const fv = site ? P.saved('folders') : null;
    const wait = site && fv === undefined;
    const fs = Array.isArray(fv) ? fv.filter((f) => f && typeof f === 'object').slice().sort((p, q) => (q.createdAt || 0) - (p.createdAt || 0)) : [];
    const rows = fs.slice(0, 4).map((f, i) => { const k = Array.isArray(f.items) ? f.items.length : 0;
      return { name: f.name || 'Sans nom', sub: k === 0 ? 'Vide' : k + (k > 1 ? ' éléments' : ' élément'), href: '/app/dossiers/' + f.id, sep: i === 0 ? 'transparent' : 'var(--line)' }; });
    return { rows, list: fs.length > 0, empty: !wait && fs.length === 0, wait };
  }

  baseVals() {
    const now = Date.now();
    // Sur le site : le document « home » (convex/radarModels.ts, docs/donnees-app.md). Sur le canevas : un exemple de même forme.
    const D = (this.props && this.props.data) || {
      updatedAt: now - 2 * 3600e3,
      niches: ['Création de contenu', 'Social et loisirs', 'Séduction IA', 'Jalousie et ex', 'Santé et physique', 'Études'],
      apps: [{ slug: 'calai', name: 'Cal AI', icon: (globalThis.__dcSample?.["Accueil"]?.["$s1"] ?? ""), views7: 29.1e6, weekDelta: 1.03, bestX: 315.6, accounts: 210, videoCount: 1912, weeks: [8, 5, 4, 5, 12, 17] },
        { slug: 'astraai', name: 'Astra AI', icon: (globalThis.__dcSample?.["Accueil"]?.["$s2"] ?? ""), views7: 6.3e6, weekDelta: -0.65, bestX: 2333, accounts: 267, videoCount: 2104, weeks: [9, 9, 8, 7, 6, 5] }],
      videos: [{ id: (globalThis.__dcSample?.["Accueil"]?.["$s3"] ?? ""), platform: 'tiktok', handle: 'studywith_elsie', app: { slug: 'astraai', name: 'Astra AI', icon: (globalThis.__dcSample?.["Accueil"]?.["$s4"] ?? ""), niche: 'Études' },
        views: 2.0e6, x: 2333, publishedAt: now - 30 * 3600e3, cover: (globalThis.__dcSample?.["Accueil"]?.["$s5"] ?? ""), hook: 'POV : tu révises avec une IA', market: 'US' }],
      formats: [{ id: 'ex-fmt', kind: 'sound', label: 'my moon my man', accounts: 33, market: 'FR', wins: 20, n: 40, lastPostAt: now - 26 * 3600e3,
        members: [{ handle: 'exemple', videoId: '1', views: 1, x: 1, publishedAt: now, cover: (globalThis.__dcSample?.["Accueil"]?.["$s6"] ?? "") }] }],
      creators: [{ handle: 'delire2fruits', fans: 277600, median: 507000, posts7d: 8, lastPostAt: now - 27 * 3600e3, app: { slug: 'trendstory', name: 'TrendStory', icon: '' },
        best: [(globalThis.__dcSample?.["Accueil"]?.["$s7"] ?? ""), (globalThis.__dcSample?.["Accueil"]?.["$s8"] ?? ""), (globalThis.__dcSample?.["Accueil"]?.["$s9"] ?? "")].map((src, i) => ({ id: 'ex' + i, cover: src })) }]
    };
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
    const nb = (n) => Math.round(n).toLocaleString('fr-FR');
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100).toLocaleString('fr-FR') + '\u202f%';
    // Dans un grand titre, l'espace fine des milliers ne se voit plus (« 1947× ») : une espace insécable ordinaire.
    const xfT = (x) => xf(x).replace(/\u202f/g, '\u00a0');
    const pl = (n, one, many) => nb(n) + ' ' + (n > 1 ? many : one);
    const country = (c) => (!c || c === 'XX' ? '' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne' })[c] || (/^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || '') : ''));
    // Le moment d'un événement : « il y a 2 h », « hier », « il y a 3 j ».
    const day0 = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const ago = (t) => {
      if (typeof t !== 'number') return '';
      const m = Math.max(0, Math.round((now - t) / 60000));
      if (m < 60) return 'il y a ' + Math.max(1, m) + '\u202fmin';
      if (m < 24 * 60) return 'il y a ' + Math.round(m / 60) + '\u202fh';
      const d = Math.round((day0(now) - day0(t)) / 864e5);
      return d <= 1 ? 'hier' : 'il y a ' + d + '\u202fj';
    };
    const kick = (what, t) => what + (ago(t) ? ' · ' + ago(t) : '');

    // ── À voir aujourd'hui : la vidéo de la semaine qui fait le plus de fois la normale de son compte ──
    const vids = (D.videos || []).filter((v) => v && v.id);
    const v0 = vids.reduce((m, v) => (!m || (v.x || 0) > (m.x || 0) ? v : m), null);
    let hero = { href: '', aria: '', cover: '', views: '', paid: false, title: '', text: '', hook: '', meta: '', logo: '', nologo: true, blank: 'sw-app-blank', item: null };
    if (v0) {
      const app = v0.app || null;
      const who = '@' + v0.handle;
      const x = typeof v0.x === 'number' && v0.x > 0 ? v0.x : null;
      hero = {
        href: '/app/videos/' + v0.id, aria: 'Voir la vidéo de ' + who, cover: v0.cover || '', views: nf(v0.views || 0), paid: !!v0.paid,
        title: (app ? 'Une vidéo ' + app.name : 'Une vidéo de ' + who) + (x ? ' fait ' + xfT(x) + ' la normale de son compte' : ' en est à ' + nf(v0.views || 0) + ' vues'),
        // Seulement ce que les chiffres disent : la normale du compte (vues ÷ multiplicateur) et les vues de la vidéo.
        text: x ? 'Le compte ' + who + ' tourne d’habitude autour de ' + nf((v0.views || 0) / x) + ' vues. Cette vidéo en est à ' + nf(v0.views || 0) + ' vues.' : 'Publiée par ' + who + '.',
        hook: v0.hook ? '« ' + v0.hook + ' »' : '',
        meta: [app ? app.name : who, app && app.niche && app.niche !== 'Autres' ? app.niche : '', country(v0.market)].filter(Boolean).join(' · '),
        logo: (app && app.icon) || '', nologo: !(app && app.icon), blank: app && app.icon ? '' : 'sw-app-blank',
        item: { kind: 'video', id: v0.id, label: who, cover: v0.cover || null }
      };
    }

    // ── Le fil de la semaine : trois sortes d'événements, chacun daté par la donnée elle-même ──
    const events = [];
    // Une app accélère : parmi les apps de l'accueil, celles dont les vues de la semaine montent ; le moment, l'heure du relevé.
    (D.apps || []).filter((a) => a && typeof a.weekDelta === 'number' && a.weekDelta > 0).forEach((a, i) => {
      const w = Array.isArray(a.weeks) && a.weeks.length > 1 ? a.weeks : null;
      const max = w ? Math.max.apply(null, w) || 1 : 1;
      const pts = w ? w.map((v, j) => [3 + j * (124 / (w.length - 1)), 36 - (v / max) * 30]) : [];
      const line = w ? 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') : '';
      events.push({ kind: 'apps', key: 'a:' + a.slug, t: D.updatedAt, order: 0, href: '/app/apps/' + a.slug,
        kicker: kick('Une app accélère', D.updatedAt), tint: '#5CD394', title: a.name + ' : ' + pct(a.weekDelta) + ' de vues cette semaine',
        sub: typeof a.accounts === 'number' && typeof a.videoCount === 'number' ? pl(a.accounts, 'compte', 'comptes') + ' · ' + pl(a.videoCount, 'vidéo', 'vidéos') + ' en 30 jours' : nf(a.views7 || 0) + ' vues en 7 jours',
        isApp: true, isFmt: false, isCrea: false, logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank',
        spark: !!w, gid: 'acc-sk' + i, line, area: line + ' L127 40 L3 40 Z', ex: w ? pts[pts.length - 1][0].toFixed(1) : '0', ey: w ? pts[pts.length - 1][1].toFixed(1) : '0',
        big: '', hasThumbs: false, thumbs: [] });
    });
    // Un format se répand : les formats repris cette semaine par le plus de comptes.
    (D.formats || []).filter((f) => f && f.id).forEach((f) => {
      const m = (f.members || [])[0];
      const w = f.wins || 0, n = f.n || 0;
      const better = w === 0 ? 'aucune de ses ' + pl(n, 'reprise', 'reprises') + ' au-dessus de sa normale' : pl(w, 'reprise', 'reprises') + ' sur ' + nb(n) + ' au-dessus de ' + (w > 1 ? 'leur' : 'sa') + ' normale';
      events.push({ kind: 'formats', key: 'f:' + f.id, t: f.lastPostAt, order: 1, href: '/app/formats/' + f.id,
        kicker: kick('Un format se répand', f.lastPostAt), tint: '#6FB0FF', title: pl(f.accounts || 0, 'compte reprend', 'comptes reprennent') + ' « ' + f.label + ' »',
        sub: [better.charAt(0).toUpperCase() + better.slice(1), country(f.market)].filter(Boolean).join(' · '),
        isApp: false, isFmt: true, isCrea: false, cover: (m && m.cover) || '', spark: false, big: nb(f.accounts || 0), hasThumbs: false, thumbs: [] });
    });
    // Un créateur publie beaucoup. posts7d compte toutes ses vidéos de la semaine (le Radar lit ses 30 dernières : 30 = au moins 30).
    (D.creators || []).filter((c) => c && c.handle).forEach((c) => {
      const k = c.posts7d || 0;
      const thumbs = (c.best || []).filter((v) => v && v.cover).slice(0, 3).map((v) => ({ src: v.cover }));
      const tint = ['#3A86F0', '#22A06B', '#D95926', '#9085E9', '#C98500', '#D55181', '#199E70'][Array.from(c.handle).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7];
      events.push({ kind: 'creators', key: 'c:' + c.handle, t: c.lastPostAt, order: 2, href: '/app/createurs/' + c.handle,
        kicker: kick('Un créateur publie beaucoup', c.lastPostAt), tint: '#FF8FB8',
        title: '@' + c.handle + ' : ' + (k >= 30 ? 'au moins 30 vidéos' : pl(k, 'vidéo', 'vidéos')) + ' en 7 jours',
        sub: [c.app ? c.app.name : '', typeof c.median === 'number' ? nf(c.median) + ' vues médianes' : '', typeof c.fans === 'number' ? nf(c.fans) + ' abonnés' : ''].filter(Boolean).join(' · '),
        isApp: false, isFmt: false, isCrea: true, avatar: c.avatar || '', ini: (Array.from(c.handle)[0] || '@').toUpperCase(), avBg: 'linear-gradient(160deg, ' + tint + ', #0B1220)',
        spark: false, big: '', hasThumbs: thumbs.length > 0, thumbs });
    });
    // Le plus récent d'abord ; à moment égal, apps, formats puis créateurs.
    events.sort((p, q) => (q.t || 0) - (p.t || 0) || p.order - q.order);

    // Une niche mène au classement des apps filtré sur elle (/app/apps?niche=…).
    const NIC = { 'Rencontres': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Bien-être mental': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01', 'Finance': 'M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6', 'Productivité': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Création de contenu': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 'Séduction IA': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Couple': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Études': 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7', 'Jalousie et ex': 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'Side hustle': 'M3 17l6-6 4 4 8-8M15 7h6v6', 'Langues': 'M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5', 'Foi': 'M12 3v18M7 8h10', 'Social et loisirs': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Santé et physique': 'M3 12h4l3-8 4 16 3-8h4', 'Beauté IA': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' };
    const niches = (D.niches || []).map((n) => ({ label: n, d: NIC[n] || 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', href: '/app/apps?niche=' + encodeURIComponent(n) }));
    return { hero, hasHero: !!v0, events, niches, hasNiches: niches.length > 0 };
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; box-sizing: border-box; padding: 30px 40px 40px; display: flex; flex-direction: column; gap: 20px; background: var(--surface);" },
          $h("header", { "style": "display: flex; flex-direction: column; gap: 6px;" },
            $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.05; font-weight: 700; letter-spacing: -0.035em; color: var(--ink);" },
              $t($v.greet)
            ),
            $h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
              $t($v.lede)
            )
          ),
          $h("div", { "style": "display: flex; align-items: flex-start; gap: 18px;" },
            $h("div", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 14px;" },
              ($v.hasHero) ? [
                $h("article", { "aria-labelledby": "acc-hero-t", "style": "position: relative; z-index: 2; display: flex; height: 330px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                  $h("a", { "class": "acc-vig", "href": $u($v.hero?.href), "aria-label": $v.hero?.aria, "style": "position: relative; display: block; width: 250px; flex-shrink: 0; border-radius: 20px 0 0 20px; overflow: hidden; background: var(--track); color: #FFFFFF; text-decoration: none;" },
                    ($v.hero?.cover) ? [
                      $h("img", { "class": "sw-cover", "src": $u($v.hero?.cover), "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    $h("span", { "class": "acc-play", "aria-hidden": "true", "style": "position: absolute; left: calc(50% - 22px); top: calc(50% - 22px); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);" },
                      $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M9 7l9 5-9 5z", "fill": "#FFFFFF" })
                      )
                    ),
                    ($v.hero?.paid) ? [
                      $h("span", { "style": "position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap;" },
                        $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                          "€"
                        ),
                        "Placement payé"
                      )
                    ] : null,
                    $h("span", { "style": "position: absolute; left: 12px; bottom: 12px; height: 26px; padding: 0 10px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; background: rgba(0,0,0,0.55); color: #FFFFFF;" },
                      $t($v.hero?.views), " vues"
                    )
                  ),
                  $h("div", { "style": "flex: 1 1 auto; min-width: 0; padding: 26px 28px; display: flex; flex-direction: column;" },
                    $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #F5B941;" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M12 4l2.4 5 5.6.8-4 3.9.9 5.5L12 16.6 7.1 19.2l.9-5.5-4-3.9 5.6-.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "À voir aujourd’hui"
                      ),
                      $h("a", { "class": "sw-more", "href": "/app/alertes" },
                        "Toutes les alertes",
                        $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    ),
                    $h("h2", { "id": "acc-hero-t", "class": "acc-clamp2", "style": "margin: 14px 0 0; font-family: var(--font-display); font-size: 30px; line-height: 1.12; font-weight: 700; letter-spacing: -0.025em; color: var(--ink);" },
                      $t($v.hero?.title)
                    ),
                    $h("p", { "style": "margin: 12px 0 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
                      $t($v.hero?.text)
                    ),
                    ($v.hero?.hook) ? [
                      $h("p", { "class": "acc-clamp2", "style": "margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: var(--ink-soft);" },
                        $t($v.hero?.hook)
                      )
                    ] : null,
                    $h("span", { "style": "flex: 1 1 auto;" }),
                    $h("div", { "style": "display: flex; align-items: center; gap: 16px; padding-top: 14px;" },
                      $h("span", { "class": `sw-app-icon ${$t($v.hero?.blank)}`, "style": "width: 30px; height: 30px; border-radius: 8px;" },
                        ($v.hero?.logo) ? [
                          $h("img", { "class": "sw-logo-img", "src": $u($v.hero?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        ($v.hero?.nologo) ? [
                          $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ] : null
                      ),
                      $h("span", { "class": "acc-ell", "style": "flex: 1 1 auto; min-width: 0; font-size: 12px; color: var(--ink-faint);" },
                        $t($v.hero?.meta)
                      ),
                      $h("span", { "style": "position: relative; display: inline-flex; flex-shrink: 0;" },
                        $h("button", { "class": "sw-btn sw-btn-sm", "data-aj-trigger": "true", "type": "button", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "aria-pressed": $v.keep?.on, "style": `height: 42px; gap: 9px; padding: 0 16px; background: ${$t($v.keep?.bg)}; color: ${$t($v.keep?.ink)}; box-shadow: inset 0 0 0 1px var(--line);` },
                          $t($v.keep?.label),
                          $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.keep?.fill, "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                          )
                        ),
                        ($v.aj) ? [
                          $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                            $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.hero?.item, "saved": $v.savedFn, "save": $v.saveFn })
                          )
                        ] : null
                      ),
                      $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": $u($v.hero?.href), "style": "flex-shrink: 0;" },
                        "Voir la vidéo",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  )
                )
              ] : null,
              ($v.fil?.on) ? [
                $h("section", { "aria-labelledby": "acc-fil-t", "style": "display: flex; flex-direction: column; gap: 14px;" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; min-height: 32px;" },
                    $h("h2", { "id": "acc-fil-t", "style": "margin: 0; font-size: 15px; font-weight: 600; color: var(--ink);" },
                      "Le fil de la semaine"
                    ),
                    $h("span", { "style": "flex: 1 1 auto;" }),
                    ($v.fil?.tabsOn) ? [
                      $h("div", { "role": "tablist", "aria-label": "Montrer dans le fil", "style": "display: flex; gap: 8px;" },
                        ($l($v.fil?.tabs)).map((t) => [
                          $h("button", { "type": "button", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": `height: 32px; padding: 0 12px; border: 0; border-radius: 999px; background: ${$t(t?.bg)}; box-shadow: inset 0 0 0 1px ${$t(t?.edge)}; color: ${$t(t?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t(t?.fw)}; white-space: nowrap; cursor: pointer;` },
                            $t(t?.l)
                          )
                        ])
                      )
                    ] : null
                  ),
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                    ($l($v.fil?.rows)).map((e) => [
                      $h("a", { "class": "acc-row", "key": e?.key, "data-pv-row": "", "data-key": e?.key, "href": $u(e?.href), "style": "display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 20px; background: var(--row-hover); box-shadow: inset 0 0 0 1px var(--card-edge); color: var(--ink); text-decoration: none;" },
                        (e?.isApp) ? [
                          $h("span", { "class": `sw-app-icon ${$t(e?.blank)}`, "style": "width: 42px; height: 42px; border-radius: 11px;" },
                            (e?.logo) ? [
                              $h("img", { "class": "sw-logo-img", "src": $u(e?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                            ] : null,
                            (e?.nologo) ? [
                              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            ] : null
                          )
                        ] : null,
                        (e?.isFmt) ? [
                          $h("span", { "style": "position: relative; display: inline-block; width: 42px; height: 56px; flex-shrink: 0; border-radius: 9px; overflow: hidden; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                            (e?.cover) ? [
                              $h("img", { "class": "sw-cover", "src": $u(e?.cover), "alt": "", "loading": "lazy", "decoding": "async" })
                            ] : null
                          )
                        ] : null,
                        (e?.isCrea) ? [
                          $h("span", { "aria-hidden": "true", "style": `position: relative; width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; background: ${$t(e?.avBg)}; color: #FFFFFF; font-size: 17px; font-weight: 700; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14);` },
                            $t(e?.ini),
                            (e?.avatar) ? [
                              $h("img", { "class": "sw-cover", "src": $u(e?.avatar), "alt": "", "loading": "lazy", "decoding": "async" })
                            ] : null
                          )
                        ] : null,
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; line-height: 1.25;" },
                          $h("span", { "class": "acc-ell", "style": `font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${$t(e?.tint)};` },
                            $t(e?.kicker)
                          ),
                          $h("span", { "class": "acc-ell", "style": "margin-top: 3px; font-size: 15px; font-weight: 600; color: var(--ink);" },
                            $t(e?.title)
                          ),
                          $h("span", { "class": "acc-ell", "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(e?.sub)
                          )
                        ),
                        (e?.spark) ? [
                          $h("svg", { "width": "130", "height": "40", "viewBox": "0 0 130 40", "aria-hidden": "true", "style": "display: block; flex-shrink: 0; overflow: visible;" },
                            $h("defs", null,
                              $h("linearGradient", { "id": e?.gid, "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                                $h("stop", { "offset": "0", "stop-color": "#5CD394", "stop-opacity": "0.28" }),
                                $h("stop", { "offset": "1", "stop-color": "#5CD394", "stop-opacity": "0" })
                              )
                            ),
                            $h("path", { "d": e?.area, "fill": `url(#${$t(e?.gid)})` }),
                            $h("path", { "d": e?.line, "fill": "none", "stroke": "#5CD394", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                            $h("circle", { "cx": e?.ex, "cy": e?.ey, "r": "3.5", "fill": "#5CD394", "stroke": "#0E121B", "stroke-width": "2" })
                          )
                        ] : null,
                        (e?.big) ? [
                          $h("span", { "style": "flex-shrink: 0; font-family: var(--font-display); font-size: 22px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: var(--ink);" },
                            $t(e?.big)
                          )
                        ] : null,
                        (e?.hasThumbs) ? [
                          $h("span", { "style": "display: flex; gap: 10px; flex-shrink: 0;" },
                            ($l(e?.thumbs)).map((th) => [
                              $h("span", { "style": "position: relative; display: inline-block; width: 34px; height: 46px; border-radius: 7px; overflow: hidden; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                                $h("img", { "class": "sw-cover", "src": $u(th?.src), "alt": "", "loading": "lazy", "decoding": "async" })
                              )
                            ])
                          )
                        ] : null
                      )
                    ])
                  )
                )
              ] : null,
              ($v.nothing) ? [
                $h("div", { "style": "padding: 48px 24px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); text-align: center; font-size: 15px; color: var(--ink-muted);" },
                  "Rien de neuf dans le Radar cette semaine."
                )
              ] : null
            ),
            $h("aside", { "aria-label": "Raccourcis", "style": "width: 360px; flex-shrink: 0; position: sticky; top: 30px; min-height: calc(100vh - 140px); box-sizing: border-box; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "role": "search", "class": "sw-search", "style": "height: 46px; padding: 0 16px; gap: 12px; border: 0; border-radius: 14px; background: var(--track); box-shadow: inset 0 0 0 1px var(--glass-edge); backdrop-filter: none; -webkit-backdrop-filter: none;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "q", "type": "search", "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Chercher…", "style": "font-size: 15px;" })
              ),
              ($v.hasNiches) ? [
                $h("section", { "aria-labelledby": "acc-nic-t", "style": "padding: 20px 22px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                  $h("h2", { "id": "acc-nic-t", "style": "margin: 0; font-size: 15px; font-weight: 600; color: var(--ink);" },
                    "Ça explose par niche"
                  ),
                  $h("div", { "style": "margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;" },
                    ($l($v.niches)).map((t) => [
                      $h("a", { "class": "sw-pill", "href": $u(t?.href), "style": "height: 32px; padding: 0 12px; gap: 7px; font-size: 13px;" },
                        $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                          $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $t(t?.label)
                      )
                    ])
                  )
                )
              ] : null,
              $h("section", { "aria-labelledby": "acc-sui-t", "style": "padding: 20px 22px 14px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("h2", { "id": "acc-sui-t", "style": "margin: 0; font-size: 15px; font-weight: 600; color: var(--ink);" },
                  "Tes suivis"
                ),
                ($v.fol?.list) ? [
                  $h("div", { "style": "margin-top: 6px; display: flex; flex-direction: column;" },
                    ($l($v.fol?.rows)).map((r) => [
                      $h("a", { "class": "acc-li", "href": $u(r?.href), "style": `min-height: 52px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-top: 1px solid ${$t(r?.sep)};` },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 32px; height: 32px; border-radius: 9px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(r?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(r?.name)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(r?.sub)
                          )
                        ),
                        (r?.v) ? [
                          $h("span", { "style": `flex-shrink: 0; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; color: ${$t(r?.ink)}; background: ${$t(r?.bg)};` },
                            $t(r?.v)
                          )
                        ] : null
                      )
                    ])
                  )
                ] : null,
                ($v.fol?.empty) ? [
                  $h("p", { "style": "margin: 10px 0 6px; font-size: 13px; line-height: 1.5; color: var(--ink-muted);" },
                    "Suis une app depuis sa fiche pour voir ici ses vues de la semaine. ",
                    $h("a", { "class": "sw-more", "href": "/app/apps", "style": "display: inline-flex;" },
                      "Parcourir les apps",
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ] : null,
                ($v.fol?.wait) ? [
                  $h("div", { "style": "height: 104px;" })
                ] : null
              ),
              $h("section", { "aria-labelledby": "acc-dos-t", "style": "flex: 1 1 auto; padding: 20px 22px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                  $h("h2", { "id": "acc-dos-t", "style": "margin: 0; font-size: 15px; font-weight: 600; color: var(--ink);" },
                    "Tes dossiers"
                  ),
                  ($v.dos?.list) ? [
                    $h("a", { "class": "sw-more", "href": "/app/dossiers" },
                      "Tout voir",
                      $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ] : null
                ),
                ($v.dos?.list) ? [
                  $h("div", { "style": "margin-top: 6px; display: flex; flex-direction: column;" },
                    ($l($v.dos?.rows)).map((f) => [
                      $h("a", { "class": "acc-li", "href": $u(f?.href), "style": `min-height: 52px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-top: 1px solid ${$t(f?.sep)};` },
                        $h("span", { "class": "sw-app-icon sw-app-blank", "style": "width: 32px; height: 32px; border-radius: 9px;" },
                          $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(f?.name)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(f?.sub)
                          )
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.dos?.empty) ? [
                  $h("p", { "style": "margin: 10px 0 14px; font-size: 12px; line-height: 1.5; color: var(--ink-faint);" },
                    "Garde ce qui t’inspire en un clic depuis le fil : il se range ici."
                  ),
                  $h("a", { "class": "sw-btn sw-btn-sm", "href": "/app/dossiers?nouveau=1", "style": "height: 40px; gap: 10px; padding: 0 14px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--glass-edge); color: var(--ink);" },
                    "Créer un dossier",
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ] : null,
                ($v.dos?.wait) ? [
                  $h("div", { "style": "height: 104px;" })
                ] : null
              )
            )
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
