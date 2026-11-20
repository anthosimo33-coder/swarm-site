// Généré par scripts/dc2preact.py depuis design/app/MAccueil.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MAccueil extends DCLogic {
  // L'accueil du téléphone (maquette T1 « Le même écran, en poche », 20/11) : l'accueil de l'ordinateur (Main, A3) en une
  // colonne. Une vidéo à voir, puis le fil de la semaine (Tout / Apps / Formats / Créateurs, qu'on balaie d'une sorte à
  // l'autre, T3), puis les suivis, les dossiers et les niches. Mêmes données et mêmes règles que Main (document « home »).

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
    const P = this.props || {};
    const u = P.user;
    const p = u ? (u.prenom || null) : 'Anto';
    // Garder la vidéo du jour : dans au moins un dossier (saved('folders')) ; MAjout range ou retire.
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
      lede: b.hasHero ? 'Une chose à voir, puis ce qui a bougé.' : 'Ce qui a bougé cette semaine.',
      ajItem: b.hero.item,
      keep: { on: kept ? 'true' : 'false', aria: kept ? 'Vidéo gardée, changer ses dossiers' : 'Garder la vidéo dans un dossier', bg: kept ? 'var(--accent-soft)' : 'var(--track)', ink: kept ? 'var(--accent)' : 'var(--ink)',
        edge: kept ? 'var(--accent-edge)' : 'var(--glass-edge)', fill: kept ? 'currentColor' : 'none' },
      fil: { on: b.events.length > 0, tabsOn: kinds.length > 1, tabs, rows },
      nothing: !b.hasHero && !b.events.length,
      fol: this.followVals(), dos: this.folderVals()
    };
  }

  // « Tes suivis » : les apps que la personne suit (saved('follows').apps), avec leurs vues sur 7 jours et leur variation
  // (document « apps »), chacune vers sa fiche. Rien de suivi (maquette V3 du 20/11) : les trois apps les plus vues sur
  // 30 jours, chacune avec « Suivre » (la même écriture que la fiche) ; sans liste d'apps lisible, la phrase d'avant.
  // Une ligne garde sa clé (data-lq-card) d'un état à l'autre : l'app suivie glisse de la suggestion à la liste.
  followVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100).toLocaleString('fr-FR') + ' %';
    const ico = (a) => ({ logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank' });
    const row = (a, i) => { const has = typeof a.weekDelta === 'number', up = has && a.weekDelta >= 0;
      return Object.assign({ ck: 's:' + a.slug, name: a.name, sub: nf(a.views7 || 0) + ' vues · 7 j', href: '/app/apps/' + a.slug,
        v: has ? pct(a.weekDelta) : '', ink: up ? '#5CD394' : '#FF9A9A', bg: up ? 'rgba(92,211,148,0.12)' : 'rgba(255,122,122,0.10)', sep: i === 0 ? 'transparent' : 'var(--line)' }, ico(a)); };
    if (!site) {
      const ex = (globalThis.__dcSample?.["MAccueil"]?.["ex"] ?? []);
      return { rows: ex.map(row), list: true, pick: false, picks: [], empty: false, wait: false };
    }
    const fv = P.saved('follows');
    const slugs = fv && Array.isArray(fv.apps) ? fv.apps : [];
    const A = fv !== undefined && typeof P.get === 'function' ? P.get('apps') : null;
    const wait = fv === undefined || A === undefined;
    const by = A && Array.isArray(A.apps) ? Object.fromEntries(A.apps.filter((a) => a && a.slug).map((a) => [a.slug, a])) : {};
    const apps = wait ? [] : slugs.map((s) => by[s]).filter(Boolean).sort((p, q) => (q.views7 || 0) - (p.views7 || 0));
    const none = !wait && apps.length === 0;
    const top = none && A && Array.isArray(A.apps) ? A.apps.filter((a) => a && a.slug && a.name).slice().sort((p, q) => (q.views30 || 0) - (p.views30 || 0)).slice(0, 3) : [];
    const follow = (slug) => () => {
      const cur = P.saved('follows');
      if (cur === undefined || typeof P.save !== 'function') return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      if (l.indexOf(slug) < 0) { next.apps = [slug].concat(l); P.save('follows', next); }
    };
    const picks = top.map((a, i) => Object.assign({ ck: 's:' + a.slug, name: a.name, sub: nf(a.views30 || 0) + ' vues · 30 j', href: '/app/apps/' + a.slug,
      sep: i === 0 ? 'transparent' : 'var(--line)', follow: follow(a.slug) }, ico(a)));
    return { rows: apps.slice(0, 4).map(row), list: apps.length > 0, pick: picks.length > 0, picks, empty: none && picks.length === 0, wait };
  }
  // « Tes dossiers » : ceux de la personne (saved('folders')), les plus récents d'abord ; chacun mène à son dossier.
  folderVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const fv = site ? P.saved('folders') : null;
    const wait = site && fv === undefined;
    const ex = site ? [] : [{ id: 'ex1', name: 'Études, ce qui marche', createdAt: 2, items: [{}, {}, {}] }, { id: 'ex2', name: 'Side hustle', createdAt: 1, items: [{}] }];
    const fs = (Array.isArray(fv) ? fv : ex).filter((f) => f && typeof f === 'object').slice().sort((p, q) => (q.createdAt || 0) - (p.createdAt || 0));
    const rows = fs.slice(0, 4).map((f, i) => { const k = Array.isArray(f.items) ? f.items.length : 0;
      return { ck: 'd:' + f.id, name: f.name || 'Sans nom', sub: k === 0 ? 'Vide' : k + (k > 1 ? ' éléments' : ' élément'), href: '/app/dossiers/' + f.id, sep: i === 0 ? 'transparent' : 'var(--line)' }; });
    return { rows, list: fs.length > 0, empty: !wait && fs.length === 0, wait };
  }

  baseVals() {
    const now = Date.now();
    // Sur le site : le document « home » (convex/radarModels.ts, docs/donnees-app.md). Sur le canevas : un exemple de même forme.
    const D = (this.props && this.props.data) || {
      updatedAt: now - 2 * 3600e3,
      niches: ['Création de contenu', 'Social et loisirs', 'Séduction IA', 'Jalousie et ex', 'Santé et physique', 'Études'],
      apps: [{ slug: 'calai', name: 'Cal AI', icon: (globalThis.__dcSample?.["MAccueil"]?.["$s1"] ?? ""), views7: 29.1e6, weekDelta: 1.03, bestX: 315.6, accounts: 210, videoCount: 1912, weeks: [8, 5, 4, 5, 12, 17] },
        { slug: 'astraai', name: 'Astra AI', icon: (globalThis.__dcSample?.["MAccueil"]?.["$s2"] ?? ""), views7: 6.3e6, weekDelta: -0.65, bestX: 2333, accounts: 267, videoCount: 2104, weeks: [9, 9, 8, 7, 6, 5] }],
      videos: [{ id: (globalThis.__dcSample?.["MAccueil"]?.["$s3"] ?? ""), platform: 'tiktok', handle: 'studywith_elsie', app: { slug: 'astraai', name: 'Astra AI', icon: (globalThis.__dcSample?.["MAccueil"]?.["$s4"] ?? ""), niche: 'Études' },
        views: 2.0e6, x: 2333, publishedAt: now - 30 * 3600e3, cover: (globalThis.__dcSample?.["MAccueil"]?.["$s5"] ?? ""), hook: 'POV : tu révises avec une IA', market: 'US' }],
      formats: [{ id: 'ex-fmt', kind: 'sound', label: 'my moon my man', accounts: 33, market: 'FR', wins: 20, n: 40, lastPostAt: now - 26 * 3600e3,
        members: [{ handle: 'exemple', videoId: '1', views: 1, x: 1, publishedAt: now, cover: (globalThis.__dcSample?.["MAccueil"]?.["$s6"] ?? "") }] }],
      creators: [{ handle: 'delire2fruits', fans: 277600, median: 507000, posts7d: 8, lastPostAt: now - 27 * 3600e3, app: { slug: 'trendstory', name: 'TrendStory', icon: '' },
        best: [] }]
    };
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const nb = (n) => Math.round(n).toLocaleString('fr-FR');
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100).toLocaleString('fr-FR') + ' %';
    // Dans un titre, l'espace fine des milliers ne se voit plus (« 1947× ») : une espace insécable ordinaire.
    const xfT = (x) => xf(x).replace(/ /g, ' ');
    const pl = (n, one, many) => nb(n) + ' ' + (n > 1 ? many : one);
    const country = (c) => (!c || c === 'XX' ? '' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne' })[c] || (/^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || '') : ''));
    // Le moment d'un événement : « il y a 2 h », « hier », « il y a 3 j ».
    const day0 = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const ago = (t) => {
      if (typeof t !== 'number') return '';
      const m = Math.max(0, Math.round((now - t) / 60000));
      if (m < 60) return 'il y a ' + Math.max(1, m) + ' min';
      if (m < 24 * 60) return 'il y a ' + Math.round(m / 60) + ' h';
      const d = Math.round((day0(now) - day0(t)) / 864e5);
      return d <= 1 ? 'hier' : 'il y a ' + d + ' j';
    };
    const kick = (what, t) => what + (ago(t) ? ' · ' + ago(t) : '');

    // ── À voir aujourd'hui : la vidéo de la semaine qui fait le plus de fois la normale de son compte (comme Main) ──
    const vids = (D.videos || []).filter((v) => v && v.id);
    const v0 = vids.reduce((m, v) => (!m || (v.x || 0) > (m.x || 0) ? v : m), null);
    let hero = { href: '', aria: '', cover: '', views: '', paid: false, title: '', usual: '', item: null };
    if (v0) {
      const app = v0.app || null;
      const who = '@' + v0.handle;
      const x = typeof v0.x === 'number' && v0.x > 0 ? v0.x : null;
      hero = {
        href: '/app/videos/' + v0.id, aria: 'Voir la vidéo de ' + who + ', ' + nf(v0.views || 0) + ' vues', cover: v0.cover || '', views: nf(v0.views || 0), paid: !!v0.paid,
        title: (app ? 'Une vidéo ' + app.name : 'Une vidéo de ' + who) + (x ? ' fait ' + xfT(x) + ' la normale de son compte' : ' en est à ' + nf(v0.views || 0) + ' vues'),
        // Seulement ce que les chiffres disent : la normale du compte (vues ÷ multiplicateur).
        usual: x ? 'D’habitude ' + nf((v0.views || 0) / x) + ' vues' : 'Publiée par ' + who,
        item: { kind: 'video', id: v0.id, label: who, cover: v0.cover || null }
      };
    }

    // ── Le fil de la semaine : trois sortes d'événements, chacun daté par la donnée elle-même (règles de Main) ──
    const events = [];
    // Une app accélère : parmi les apps de l'accueil, celles dont les vues de la semaine montent ; le moment, l'heure du relevé.
    (D.apps || []).filter((a) => a && a.slug && typeof a.weekDelta === 'number' && a.weekDelta > 0).forEach((a, i) => {
      const w = Array.isArray(a.weeks) && a.weeks.length > 1 ? a.weeks : null;
      const max = w ? Math.max.apply(null, w) || 1 : 1;
      const pts = w ? w.map((v, j) => [3 + j * (54 / (w.length - 1)), 27 - (v / max) * 22]) : [];
      const line = w ? 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') : '';
      events.push({ kind: 'apps', key: 'a:' + a.slug, t: D.updatedAt, order: 0, href: '/app/apps/' + a.slug,
        kicker: kick('Une app accélère', D.updatedAt), tint: '#5CD394', title: a.name + ' : ' + pct(a.weekDelta) + ' de vues',
        sub: typeof a.accounts === 'number' && typeof a.videoCount === 'number' ? pl(a.accounts, 'compte', 'comptes') + ' · ' + pl(a.videoCount, 'vidéo', 'vidéos') + ' en 30 j' : nf(a.views7 || 0) + ' vues en 7 jours',
        isApp: true, isFmt: false, isCrea: false, logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank',
        spark: !!w, gid: 'ma-sk' + i, line, area: line + ' L57 30 L3 30 Z', ex: w ? pts[pts.length - 1][0].toFixed(1) : '0', ey: w ? pts[pts.length - 1][1].toFixed(1) : '0' });
    });
    // Un format se répand : les formats repris cette semaine par le plus de comptes.
    (D.formats || []).filter((f) => f && f.id).forEach((f) => {
      const m = (f.members || [])[0];
      const w = f.wins || 0, n = f.n || 0;
      const better = w === 0 ? 'aucune de ses ' + pl(n, 'reprise', 'reprises') + ' au-dessus de sa normale' : pl(w, 'reprise', 'reprises') + ' sur ' + nb(n) + ' au-dessus de ' + (w > 1 ? 'leur' : 'sa') + ' normale';
      events.push({ kind: 'formats', key: 'f:' + f.id, t: f.lastPostAt, order: 1, href: '/app/formats/' + f.id,
        kicker: kick('Un format se répand', f.lastPostAt), tint: '#6FB0FF', title: pl(f.accounts || 0, 'compte reprend', 'comptes reprennent') + ' « ' + f.label + ' »',
        sub: [better.charAt(0).toUpperCase() + better.slice(1), country(f.market)].filter(Boolean).join(' · '),
        isApp: false, isFmt: true, isCrea: false, cover: (m && m.cover) || '', spark: false });
    });
    // Un créateur publie beaucoup. posts7d compte toutes ses vidéos de la semaine (le Radar lit ses 30 dernières : 30 = au moins 30).
    (D.creators || []).filter((c) => c && c.handle).forEach((c) => {
      const k = c.posts7d || 0;
      const tint = ['#3A86F0', '#22A06B', '#D95926', '#9085E9', '#C98500', '#D55181', '#199E70'][Array.from(c.handle).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7];
      events.push({ kind: 'creators', key: 'c:' + c.handle, t: c.lastPostAt, order: 2, href: '/app/createurs/' + c.handle,
        kicker: kick('Un créateur publie beaucoup', c.lastPostAt), tint: '#FF8FB8',
        title: '@' + c.handle + ' : ' + (k >= 30 ? 'au moins 30 vidéos' : pl(k, 'vidéo', 'vidéos')) + ' en 7 j',
        sub: [c.app ? c.app.name : '', typeof c.median === 'number' ? nf(c.median) + ' vues médianes' : ''].filter(Boolean).join(' · '),
        isApp: false, isFmt: false, isCrea: true, avatar: c.avatar || '', ini: (Array.from(c.handle)[0] || '@').toUpperCase(), avBg: 'linear-gradient(160deg, ' + tint + ', #0B1220)', spark: false });
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
      $h("div", { "data-pull": "", "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(100px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-logo", "href": "/app", "aria-label": "Kopycat, accueil" },
              $h("svg", { "class": "sw-logo-mark on-dark", "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 24px; height: 24px;" },
                $h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
                $h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
                $h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
              ),
              $h("span", { "class": "sw-wordmark", "style": "font-size: 20px;" },
                "kopycat"
              )
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
        $h("div", { "style": "padding: 20px 20px 0; display: flex; flex-direction: column; gap: 6px;" },
          $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 28px; line-height: 1.08; font-weight: 700; letter-spacing: -0.04em;" },
            $t($v.greet)
          ),
          $h("p", { "style": "margin: 0; font-size: 14px; line-height: 1.45; color: var(--ink-muted);" },
            $t($v.lede)
          )
        ),
        ($v.hasHero) ? [
          $h("article", { "aria-labelledby": "ma-hero-t", "style": "margin: 16px 20px 0; padding: 12px; display: flex; gap: 14px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("a", { "class": "ma-press", "href": $u($v.hero?.href), "aria-label": $v.hero?.aria, "style": "position: relative; display: block; width: 108px; height: 144px; flex-shrink: 0; border-radius: 14px; overflow: hidden; background: var(--track); color: #FFFFFF; text-decoration: none; -webkit-tap-highlight-color: transparent;" },
              ($v.hero?.cover) ? [
                $h("img", { "class": "sw-cover", "src": $u($v.hero?.cover), "alt": "", "loading": "lazy", "decoding": "async" })
              ] : null,
              $h("span", { "class": "sw-video-shade" }),
              $h("span", { "aria-hidden": "true", "style": "position: absolute; left: calc(50% - 17px); top: calc(50% - 17px); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45);" },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 7l9 5-9 5z", "fill": "#FFFFFF" })
                )
              ),
              ($v.hero?.paid) ? [
                $h("span", { "title": "Placement payé : compte payé pour cette vidéo", "aria-label": "Placement payé", "style": "position: absolute; top: 7px; left: 7px; width: 18px; height: 18px; border-radius: 50%; background: #F5B941; color: #1A1206; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px rgba(5,7,12,0.6);" },
                  "€"
                )
              ] : null,
              $h("span", { "style": "position: absolute; left: 7px; bottom: 7px; height: 22px; padding: 0 8px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums; background: rgba(0,0,0,0.55); color: #FFFFFF;" },
                $t($v.hero?.views)
              )
            ),
            $h("div", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #F5B941;" },
                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M12 4l2.4 5 5.6.8-4 3.9.9 5.5L12 16.6 7.1 19.2l.9-5.5-4-3.9 5.6-.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "À voir aujourd’hui"
              ),
              $h("h2", { "id": "ma-hero-t", "class": "ma-clamp4", "style": "margin: 8px 0 0; font-size: 16px; line-height: 1.28; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);" },
                $t($v.hero?.title)
              ),
              $h("p", { "class": "ma-ell", "style": "margin: 6px 0 0; font-size: 13px; color: var(--ink-faint);" },
                $t($v.hero?.usual)
              ),
              $h("span", { "style": "flex: 1 1 auto;" }),
              $h("div", { "style": "display: flex; align-items: center; gap: 8px; padding-top: 12px;" },
                $h("button", { "class": "sw-btn ma-press", "type": "button", "onClick": $v.openAj, "aria-haspopup": "dialog", "aria-pressed": $v.keep?.on, "aria-label": $v.keep?.aria, "style": `flex-shrink: 0; width: 42px; height: 42px; padding: 0; border-radius: 12px; background: ${$t($v.keep?.bg)}; color: ${$t($v.keep?.ink)}; box-shadow: inset 0 0 0 1px ${$t($v.keep?.edge)}; -webkit-tap-highlight-color: transparent;` },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.keep?.fill, "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                  )
                ),
                $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": $u($v.hero?.href), "style": "flex-shrink: 0; -webkit-tap-highlight-color: transparent;" },
                  "Voir",
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
          $h("section", { "aria-labelledby": "ma-fil-t", "style": "padding-top: 28px;" },
            $h("h2", { "id": "ma-fil-t", "style": "margin: 0; padding: 0 20px; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);" },
              "Le fil de la semaine"
            ),
            ($v.fil?.tabsOn) ? [
              $h("div", { "data-swipe-skip": "", "style": "margin-top: 12px; padding: 0 20px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
                $h("div", { "role": "tablist", "aria-label": "Montrer dans le fil", "data-swipe-tabs": "", "style": "display: flex; gap: 8px; width: max-content;" },
                  ($l($v.fil?.tabs)).map((t) => [
                    $h("button", { "type": "button", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": `height: 40px; padding: 0 16px; border: 0; border-radius: 999px; background: ${$t(t?.bg)}; box-shadow: inset 0 0 0 1px ${$t(t?.edge)}; color: ${$t(t?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(t?.fw)}; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent;` },
                      $t(t?.l)
                    )
                  ])
                )
              )
            ] : null,
            $h("div", { "data-swipe": "", "style": "padding: 12px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
              ($l($v.fil?.rows)).map((e) => [
                $h("a", { "class": "ma-press", "key": e?.key, "data-pv-row": "", "data-key": e?.key, "href": $u(e?.href), "style": "display: block; padding: 12px 14px 14px; border-radius: 18px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); color: var(--ink); text-decoration: none; -webkit-tap-highlight-color: transparent;" },
                  $h("span", { "class": "ma-ell", "style": `display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${$t(e?.tint)};` },
                    $t(e?.kicker)
                  ),
                  $h("span", { "style": "display: flex; align-items: center; gap: 12px; margin-top: 9px;" },
                    (e?.isApp) ? [
                      $h("span", { "class": `sw-app-icon ${$t(e?.blank)}`, "style": "width: 38px; height: 38px; border-radius: 11px;" },
                        (e?.logo) ? [
                          $h("img", { "class": "sw-logo-img", "src": $u(e?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        (e?.nologo) ? [
                          $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ] : null
                      )
                    ] : null,
                    (e?.isFmt) ? [
                      $h("span", { "style": "position: relative; display: inline-block; width: 38px; height: 50px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                        (e?.cover) ? [
                          $h("img", { "class": "sw-cover", "src": $u(e?.cover), "alt": "", "loading": "lazy" })
                        ] : null
                      )
                    ] : null,
                    (e?.isCrea) ? [
                      $h("span", { "aria-hidden": "true", "style": `position: relative; width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; background: ${$t(e?.avBg)}; color: #FFFFFF; font-size: 15px; font-weight: 700; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14);` },
                        $t(e?.ini),
                        (e?.avatar) ? [
                          $h("img", { "class": "sw-cover", "src": $u(e?.avatar), "alt": "", "loading": "lazy" })
                        ] : null
                      )
                    ] : null,
                    $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; line-height: 1.3;" },
                      $h("span", { "class": "ma-clamp2", "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                        $t(e?.title)
                      ),
                      $h("span", { "class": "ma-clamp2", "style": "font-size: 12.5px; color: var(--ink-faint);" },
                        $t(e?.sub)
                      )
                    ),
                    (e?.spark) ? [
                      $h("svg", { "width": "60", "height": "30", "viewBox": "0 0 60 30", "aria-hidden": "true", "style": "display: block; flex-shrink: 0; overflow: visible;" },
                        $h("defs", null,
                          $h("linearGradient", { "id": e?.gid, "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                            $h("stop", { "offset": "0", "stop-color": "#5CD394", "stop-opacity": "0.28" }),
                            $h("stop", { "offset": "1", "stop-color": "#5CD394", "stop-opacity": "0" })
                          )
                        ),
                        $h("path", { "d": e?.area, "fill": `url(#${$t(e?.gid)})` }),
                        $h("path", { "d": e?.line, "fill": "none", "stroke": "#5CD394", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                        $h("circle", { "cx": e?.ex, "cy": e?.ey, "r": "3", "fill": "#5CD394", "stroke": "#0E121B", "stroke-width": "2" })
                      )
                    ] : null
                  )
                )
              ])
            )
          )
        ] : null,
        ($v.nothing) ? [
          $h("div", { "style": "margin: 18px 20px 0; padding: 40px 20px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); text-align: center; font-size: 15px; color: var(--ink-muted);" },
            "Rien de neuf dans le Radar cette semaine."
          )
        ] : null,
        $h("section", { "aria-labelledby": "ma-sui-t", "style": "margin: 28px 20px 0; padding: 16px 16px 6px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
          $h("h2", { "id": "ma-sui-t", "style": "margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);" },
            "Tes suivis"
          ),
          ($v.fol?.list) ? [
            $h("div", { "style": "margin-top: 6px; display: flex; flex-direction: column;" },
              ($l($v.fol?.rows)).map((r) => [
                $h("a", { "class": "ma-press", "data-lq-card": r?.ck, "href": $u(r?.href), "style": `min-height: 60px; display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; border-top: 1px solid ${$t(r?.sep)}; -webkit-tap-highlight-color: transparent;` },
                  $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 36px; height: 36px; border-radius: 10px;" },
                    (r?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $u(r?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (r?.nologo) ? [
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                    $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                      $t(r?.name)
                    ),
                    $h("span", { "class": "sw-app-sub" },
                      $t(r?.sub)
                    )
                  ),
                  (r?.v) ? [
                    $h("span", { "style": `flex-shrink: 0; display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; color: ${$t(r?.ink)}; background: ${$t(r?.bg)};` },
                      $t(r?.v)
                    )
                  ] : null
                )
              ])
            )
          ] : null,
          ($v.fol?.pick) ? [
            $h("div", { "style": "padding-top: 8px;" },
              $h("p", { "style": "margin: 0 0 6px; font-size: 16px; line-height: 1.35; font-weight: 600; color: var(--ink);" },
                "Suis une app : ses vues de la semaine s’affichent ici"
              ),
              ($l($v.fol?.picks)).map((a) => [
                $h("div", { "data-lq-card": a?.ck, "style": `min-height: 60px; display: flex; align-items: center; gap: 12px; border-top: 1px solid ${$t(a?.sep)};` },
                  $h("a", { "class": "ma-press", "href": $u(a?.href), "style": "flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent;" },
                    $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 36px; height: 36px; border-radius: 10px;" },
                      (a?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (a?.nologo) ? [
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                      $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                        $t(a?.name)
                      ),
                      $h("span", { "class": "sw-app-sub" },
                        $t(a?.sub)
                      )
                    )
                  ),
                  $h("button", { "class": "ma-hit ma-press", "type": "button", "onClick": a?.follow, "aria-label": `Suivre ${$t(a?.name)}`, "style": "flex-shrink: 0; height: 36px; padding: 0 14px 0 12px; border: 0; border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; background: var(--track); box-shadow: inset 0 0 0 1px var(--glass-edge); color: var(--ink); font: inherit; font-size: 13.5px; font-weight: 600; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Suivre"
                  )
                )
              ]),
              $h("p", { "style": "margin: 2px 0 10px; font-size: 12px; color: var(--ink-faint);" },
                "Les trois plus vues sur 30 jours."
              )
            )
          ] : null,
          ($v.fol?.empty) ? [
            $h("p", { "style": "margin: 10px 0 12px; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
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
            $h("div", { "style": "height: 120px;" })
          ] : null
        ),
        $h("section", { "aria-labelledby": "ma-dos-t", "style": "margin: 14px 20px 0; padding: 16px 16px 6px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
          $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
            $h("h2", { "id": "ma-dos-t", "style": "margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);" },
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
                $h("a", { "class": "ma-press", "data-lq-card": f?.ck, "href": $u(f?.href), "style": `min-height: 60px; display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; border-top: 1px solid ${$t(f?.sep)}; -webkit-tap-highlight-color: transparent;` },
                  $h("span", { "class": "sw-app-icon sw-app-blank", "style": "width: 36px; height: 36px; border-radius: 10px;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                    $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                      $t(f?.name)
                    ),
                    $h("span", { "class": "sw-app-sub" },
                      $t(f?.sub)
                    )
                  ),
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ])
            )
          ] : null,
          ($v.dos?.empty) ? [
            $h("p", { "style": "margin: 10px 0 14px; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
              "Garde ce qui t’inspire en un clic depuis le fil : il se range ici."
            ),
            $h("div", { "style": "padding-bottom: 12px;" },
              $h("a", { "class": "sw-btn sw-btn-sm", "href": "/app/dossiers?nouveau=1", "style": "height: 42px; gap: 10px; padding: 0 16px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--glass-edge); color: var(--ink);" },
                "Créer un dossier",
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.dos?.wait) ? [
            $h("div", { "style": "height: 120px;" })
          ] : null
        ),
        ($v.hasNiches) ? [
          $h("section", { "aria-labelledby": "ma-nic-t", "style": "margin: 14px 20px 0; padding: 16px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("h2", { "id": "ma-nic-t", "style": "margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);" },
              "Ça explose par niche"
            ),
            $h("div", { "style": "margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;" },
              ($l($v.niches)).map((t) => [
                $h("a", { "class": "sw-pill", "href": $u(t?.href), "style": "height: 40px; padding: 0 14px; gap: 8px; font-size: 14px;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.label)
                )
              ])
            )
          )
        ] : null,
        $h("nav", { "data-tabbar": "", "aria-label": "Navigation principale", "style": "position: fixed; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); z-index: 30; height: 64px; padding: 0 6px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: center; border-radius: 32px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.55);" },
          $h("a", { "href": "/app", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
