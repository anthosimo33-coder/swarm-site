// Généré par scripts/dc2preact.py depuis design/app/CreateurFicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class FicheCreateur extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'createurs' ? 'page' : 'false' }));
    return {
      sb, me,
      getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj, ajV: null }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const D = P.data;
    const handle = (D && D.handle) || (P.params && P.params.handle) || (live ? '' : 'zinedine.gsbb');
    // Suivre : sur le site, follows.creators (saved) ; sur le canevas, l'état local.
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.creators || []).indexOf(handle) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !handle) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.creators || [];
      next.creators = l.indexOf(handle) >= 0 ? l.filter((x) => x !== handle) : [handle].concat(l);
      P.save('follows', next);
    };
    // Ce que « Ajouter à un dossier » range : le compte, avec une de ses miniatures.
    const cover = D ? (((D.best || []).concat(D.videos || []).filter((v) => v.cover)[0] || {}).cover || null) : (b.z.av || null);
    // Onglets : Vidéos et Formats repris toujours (avec leur nombre), Apps poussées s'il y a une app.
    const hasApp = !!(b.z.app && b.z.app.name);
    const tab = st.tab === 'fmts' || (st.tab === 'apps' && hasApp) ? st.tab : 'vids';
    const tabs = [['vids', 'Vidéos · ' + b.vids.length], ['fmts', 'Formats repris · ' + b.fmts.length]].concat(hasApp ? [['apps', 'Apps poussées · 1']] : [])
      .map((t) => ({ l: t[1], d: ({ 'vids': 'M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4', 'fmts': 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', 'apps': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' })[t[0]], on: tab === t[0] ? 'true' : 'false', bg: tab === t[0] ? 'rgba(255,255,255,0.10)' : 'transparent', ink: tab === t[0] ? 'var(--ink)' : 'var(--ink-muted)', fw: tab === t[0] ? '600' : '500', ic: tab === t[0] ? 'var(--accent)' : 'var(--ink-faint)', pick: () => this.setState({ tab: t[0] }) }));
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow, ajItem: { kind: 'creator', id: handle, label: '@' + handle, cover } }, { followAria: f ? 'Ne plus suivre ce compte' : 'Suivre ce compte', followInk: f ? 'var(--accent)' : 'var(--ink-muted)',
      vids: (st.sort === 'vues') ? (b.vids || []).slice().sort((x, y) => y.raw - x.raw) : b.vids,
      sorts: [['recent', 'Récentes'], ['vues', 'Les plus vues']].map((s) => ({ l: s[1], on: (st.sort || 'recent') === s[0] ? 'true' : 'false', pick: () => this.setState({ sort: s[0] }) })),
      cards: ((st.sort === 'vues') ? (b.vids || []).slice().sort((x, y) => y.raw - x.raw) : (b.vids || [])).map((v, i) => {
        const id = v.id || 'v' + i;
        const z = b.z;
        const app = z.app || {};
        const up = typeof v.xr === 'number' && v.xr >= 1;
        const aj = st.ajV === id;
        const copied = st.copied === id;
        return { href: v.href || '/app/videos/7705929733220994337', src: v.src, v: v.v, x: v.x, xBg: typeof v.xr === 'number' && v.xr >= 2 ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : 'rgba(5,7,12,0.6)',
          plat: v.ig ? 'Instagram' : v.car ? 'Carrousel · ' + v.car + ' photos' : 'TikTok', url: v.url || z.tt, urlLabel: v.ig ? 'VOIR SUR INSTAGRAM' : 'VOIR SUR TIKTOK',
          av: z.av || '', noav: !z.av, ini: String(z.h || '').replace(/^@/, '').charAt(0).toUpperCase(), h: z.h, flag: z.flag || '', mk: z.mk || '',
          appName: app.name || '', appIcon: app.logo || '', appBlank: app.logo ? '' : 'sw-app-blank', appLine: app.name ? app.name + (app.niche ? ' · ' + app.niche : '') : '',
          ago: v.ago || v.date || '', st: typeof v.xr === 'number' ? (up ? 'AU-DESSUS DE SA NORMALE' : 'SOUS SA NORMALE') : '', stInk: up ? '#4C9AFF' : '#8A93A3',
          t: v.t || '', tShown: v.t || 'Pas d’accroche lue sur cette vidéo.', tInk: v.t ? 'var(--ink-soft)' : 'var(--ink-faint)',
          copyLabel: copied ? 'Accroche copiée' : 'Copier l’accroche', copyInk: copied ? 'var(--accent)' : 'var(--ink-muted)', copyIc: copied ? 'M5 12.5l4.5 4.5L19 7.5' : 'M9 9h10v11H9zM5 15V4h10',
          copy: () => { const done = () => { this.setState({ copied: id }); clearTimeout(this.copyT); this.copyT = setTimeout(() => { if ((this.state || {}).copied === id) this.setState({ copied: null }); }, 1800); };
            const legacy = () => { const ta = document.createElement('textarea'); ta.value = v.t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
              document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); if (ok) done(); };
            try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v.t).then(done, legacy); else legacy(); } catch (e) { legacy(); } },
          aj, ajOpen: aj ? 'true' : 'false', ajBg: aj ? 'var(--accent-soft)' : 'transparent', ajInk: aj ? 'var(--accent)' : 'var(--ink-faint)',
          toggleAj: () => this.setState({ ajV: (this.state || {}).ajV === id ? null : id, aj: false }),
          item: { kind: 'video', id: v.id || '', label: z.h, cover: v.src || null } };
      }),
      closeAjV: () => this.setState({ ajV: null }),
      tabs, tabV: tab === 'vids', tabF: tab === 'fmts', tabA: tab === 'apps',
      showSort: tab === 'vids' && b.vids.length > 1, ins: tab === 'vids' ? b.ins : null,
      noVids: !b.vids.length, noFmts: !b.fmts.length,
      fmts: b.fmts.map((x, i) => Object.assign({}, x, { bt: i ? '1px solid var(--line)' : '0' })),
      tileN: Math.max(1, b.tiles.length) });
  }

  baseVals() {

    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "page"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    let z = {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "fans": "16 200", "med": "7 792", "p7": "3 vidéos en 7 j", "views": "4,7 M", "best": "2,85 M", "app": {"name": "Shortfy", "niche": "Side hustle", "logo": "", "nologo": true, "blank": "sw-app-blank", "href": '/app/apps/' + 'shortfy'}, "hits": 4,
      "mk": "France", "flag": "FR", "mkHref": "/app/createurs?m=FR", "tt": "https://www.tiktok.com/@zinedine.gsbb"};
    let ins = { b: '4 vidéos sur 10 à plus de 10× sa normale,', r: ' toutes publiées entre le 24/10 et le 31/10. Depuis, aucune n’a dépassé 2×.' };
    let fmts = [];
    let tiles = [{"l": "Abonnés", "v": "16 200", "s": " ", "ink": "var(--ink)"}, {"l": "Vues médianes", "v": "7 792", "s": "sa normale", "ink": "var(--ink)"}, {"l": "Rythme", "v": "3 vidéos en 7 j", "s": "dernière il y a 2 j", "ink": "var(--ink)"}, {"l": "Meilleure vidéo", "v": "2,85 M", "s": "366× sa normale", "ink": "var(--accent)"}];
    let vids = [{"src": "/media/app/v-7706797723294420256.jpg", "v": "2 k", "raw": 2042.0, "x": "0,3×", "xr": 0.2620636550308008, "hit": false, "date": "11/11", "ago": "il y a 2 j", "t": "Job Alimentaire ❌ Vidéo YTB pour enfants ✅", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7706656919259319585.jpg", "v": "5 k", "raw": 4676.0, "x": "0,6×", "xr": 0.6001026694045175, "hit": false, "date": "10/11", "ago": "il y a 2 j", "t": "Il vit en 2098 😳", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7704799316795477280.jpg", "v": "2 k", "raw": 1635.0, "x": "0,2×", "xr": 0.2098305954825462, "hit": false, "date": "05/11", "ago": "il y a 7 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7703924847239269664.jpg", "v": "8 k", "raw": 8017.0, "x": "1×", "xr": 1.028875770020534, "hit": false, "date": "03/11", "ago": "il y a 9 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k", "raw": 791173.0, "x": "102×", "xr": 101.53657597535934, "hit": true, "date": "31/10", "ago": "il y a 12 j", "t": "Shortfy.io", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7702109191736986913.jpg", "v": "191 k", "raw": 190605.0, "x": "24×", "xr": 24.4616273100616, "hit": true, "date": "29/10", "ago": "il y a 14 j", "t": "Vous avez plus d’excuses, il vient d’expliquer comment faire en même p", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k", "raw": 841262.0, "x": "108×", "xr": 107.96483572895278, "hit": true, "date": "27/10", "ago": "il y a 16 j", "t": "J’ai enregistré pour vous, me remerciez pas 🤝 #Argent #shortfy #TikTok", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M", "raw": 2848785.0, "x": "366×", "xr": 365.6038244353183, "hit": true, "date": "24/10", "ago": "il y a 19 j", "t": "Pourquoi personne nous apprend ça à l’école? 😭 #Argent #shortfy #TikTo", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7699871031615360288.jpg", "v": "8 k", "raw": 7567.0, "x": "1×", "xr": 0.9711242299794661, "hit": false, "date": "23/10", "ago": "il y a 20 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7699388137767734561.jpg", "v": "7 k", "raw": 6941.0, "x": "0,9×", "xr": 0.8907854209445585, "hit": false, "date": "22/10", "ago": "il y a 22 j", "t": "c’est une dinguerie ce qu’il fait 🤯", "badge": "rgba(5,7,12,0.55)"}];

    // Sur le site : la fiche du créateur depuis le Radar (document « creator:<handle> », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.handle) {
      const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      // « depuis la France », « depuis les États-Unis », « depuis l’Allemagne », « depuis Singapour » ; rien pour un pays inconnu.
      const DEPUIS = (n) => { n = String(n || ''); if (!n || n === 'Pays inconnu' || /^[A-Z]{2}$/.test(n)) return ''; if (/^(Singapour|Chypre|Cuba|Madagascar|Taïwan|Porto Rico|Malte|Haïti|Bahreïn|Israël|Monaco|Oman|Hong Kong|Maurice|La Réunion|Djibouti)$/.test(n)) return 'depuis ' + n;
        if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'depuis les ' + n; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'depuis l’' + n;
        return 'depuis ' + (/e$/.test(n.split(/[\s-]/)[0]) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize|Royaume-Uni|Suriname)$/.test(n) ? 'la ' : 'le ') + n; };
      // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
      const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
      const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays, pas de « autres langues »
      const M = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
      const DAY = 86400000;
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 10 ? Math.round(x).toLocaleString('fr-FR') : x.toFixed(1).replace(/\.0$/, '').replace('.', ',')) + '×';
      const big = (n) => (n >= 1e6 ? nf(n) : Math.round(n).toLocaleString('fr-FR'));
      // jj/mm, avec l'année quand ce n'est pas celle d'aujourd'hui.
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', new Date(ms).getFullYear() === new Date().getFullYear() ? { day: '2-digit', month: '2-digit' } : { day: '2-digit', month: '2-digit', year: 'numeric' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / DAY)); return d === 0 ? "aujourd'hui" : 'il y a ' + d + '\u202fj'; };
      const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
      const V = (D.videos || []).slice().sort((p, q) => q.publishedAt - p.publishedAt);
      const ref = D.updatedAt || Date.now();
      const ink = 'var(--ink)';
      const a = D.app;
      z = {
        av: D.avatar || '', noav: true, h: '@' + D.handle, bio: D.bio ? D.bio.replace(/\s+/g, ' ').trim() : '',
        kindL: ((KINDL) => KINDL(D.kind, D.gender))((k, g) => ({ ambassadeur: g === 'femme' ? 'Ambassadrice' : 'Ambassadeur', carrousel: 'Carrousel', extrait_repris: 'Extrait repris', histoire_messages: 'Histoire en messages', demo_ecran: 'Démo d’écran', motion: 'Motion', ambiance_texte: 'Ambiance + texte' })[k] || ''), mk: M[D.market] || '', mkHero: D.market && DEPUIS(M[D.market]) ? ['Publie ' + DEPUIS(M[D.market]), LANGN(D.otherLang)].filter(Boolean).join(' · ') : (M[D.market] || ''), flag: D.market || '', mkHref: '/app/createurs' + (D.market ? '?m=' + D.market : ''), tt: 'https://www.tiktok.com/@' + D.handle,
        app: a ? { name: a.name, niche: a.niche || '', logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', href: '/app/apps/' + a.slug }
               : { name: '', niche: '', logo: '', nologo: true, blank: 'sw-app-blank', href: '' }
      };
      // Rythme : le compte, complété par ses vidéos de la liste (une vidéo Instagram n'est pas dans posts7d).
      const last = Math.max(D.lastPostAt || 0, ...V.map((v) => v.publishedAt));
      const n7 = Math.max(D.posts7d || 0, V.filter((v) => v.publishedAt >= ref - 7 * DAY).length);
      // Meilleure vidéo : la plus vue de ses vidéos connues (la liste, et ses meilleures des 30 j).
      const top = V.concat(D.best || []).reduce((m, v) => (!m || v.views > m.views ? v : m), null);
      tiles = [
        typeof D.fans === 'number' ? { l: 'Abonnés', v: big(D.fans), s: ' ', ink } : null,
        D.median ? { l: 'Vues médianes', v: big(D.median), s: 'sa normale', ink } : null,
        typeof D.posts7d === 'number' || V.length ? { l: 'Rythme', v: plural(n7, 'vidéo') + ' en 7 j', s: last ? 'dernière ' + ago(last) : ' ', ink } : null,
        top ? { l: 'Meilleure vidéo', v: nf(top.views), s: typeof top.x === 'number' ? xf(top.x) + ' sa normale' : ' ', ink: 'var(--accent)' } : null
      ].filter(Boolean);
      const isX = (v) => typeof v.x === 'number';
      vids = V.map((v) => ({ src: v.cover || '', v: nf(v.views), raw: v.views, x: isX(v) ? xf(v.x) : '', xr: isX(v) ? v.x : null, hit: isX(v) && v.x >= 10,
        date: day(v.publishedAt), ago: ago(v.publishedAt), t: v.hook || '', badge: isX(v) && v.x >= 10 ? 'var(--blue-600)' : 'rgba(5,7,12,0.55)', href: '/app/videos/' + v.id,
        id: v.id, ig: v.platform === 'instagram', car: v.carousel || 0,
        url: v.platform === 'instagram' ? 'https://www.instagram.com/reel/' + String(v.id).replace(/^ig:/, '') + '/' : 'https://www.tiktok.com/@' + D.handle + '/video/' + v.id }));
      // Le bandeau : ses vidéos à 10× sa normale ou plus, et ce qui a suivi la dernière. Rien à dire, pas de bandeau.
      const hits = V.filter((v) => isX(v) && v.x >= 10);
      ins = null;
      if (hits.length) {
        const first = hits[hits.length - 1].publishedAt, lastHit = hits[0].publishedAt;
        const when = hits.length === 1 ? ' publiée le ' + day(lastHit) + '.'
          : day(first) === day(lastHit) ? ' toutes publiées le ' + day(lastHit) + '.'
          : ' toutes publiées entre le ' + day(first) + ' et le ' + day(lastHit) + '.';
        const after = V.filter((v) => v.publishedAt > lastHit && isX(v));
        const peak = after.length ? Math.ceil(Math.max(...after.map((v) => v.x)) * 10 - 1e-9) / 10 : 0;
        const since = !after.length ? ''
          : after.length === 1 ? ' Depuis, une seule vidéo, à ' + (after[0].x < 0.05 ? 'moins de 0,1×' : xf(after[0].x)) + '.'
          : peak < 0.05 ? ' Depuis, aucune n’a atteint 0,1×.' : ' Depuis, aucune n’a dépassé ' + xf(peak) + '.';
        ins = { b: plural(hits.length, 'vidéo') + ' sur ' + V.length + ' à 10× sa normale ou plus,', r: when + since };
      }
      const ic = { texte: 'M5 6h14M12 6v12M8 18h8', son: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
      fmts = (D.formats || []).map((f) => ({ icon: f.kind === 'sound' ? ic.son : ic.texte, t: f.kind === 'sound' ? 'Son « ' + f.label + ' »' : '« ' + f.label + ' »',
        meta: 'Repris par ' + f.accounts + ' comptes', href: '/app/formats/' + f.id }));
    }
    vids = vids.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v));
    const TIL = { 'Abonnés': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Vues médianes': 'M3 3v18h18M7 15l4-4 3 3 5-6', 'Rythme': 'M3 12h4l3-8 4 16 3-8h4', 'Meilleure vidéo': 'M13 2L4 14h7l-1 8 9-12h-7z' };
    return { nav, z, tiles: tiles.map((t) => Object.assign({}, t, { ic: TIL[t.l] || '' })), vids, ins, fmts };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1600px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("nav", { "aria-label": "Fil d’Ariane", "style": "padding: 28px 32px 0; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-faint);" },
            $h("a", { "class": "sw-link-quiet", "href": "/app/createurs" },
              "Créateurs"
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("a", { "class": "sw-link-quiet", "href": $v.z?.mkHref, "style": "display: inline-flex; align-items: center; gap: 6px;" },
              ($v.z?.flag) ? [
                $h("span", { "class": "sw-flag", "data-c": $v.z?.flag, "aria-hidden": "true" })
              ] : null,
              $t($v.z?.mk)
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", { "style": "color: var(--ink-soft);" },
              $t($v.z?.h)
            )
          ),
          $h("section", { "class": "sw-card", "style": "margin: 18px 32px 0; padding: 32px 36px; border-radius: 28px; overflow: hidden; display: flex; align-items: center; gap: 28px; flex-wrap: wrap;" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(50% 100% at 0% 50%, #000, transparent); mask-image: radial-gradient(50% 100% at 0% 50%, #000, transparent);" }),
            $h("span", { "style": "position: relative; padding: 4px; border-radius: 50%; background: conic-gradient(from 200deg, var(--blue-400), var(--blue-700), var(--blue-400));" },
              $h("span", { "style": "position: relative; width: 112px; height: 112px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); box-shadow: 0 0 0 4px var(--surface-raised);" },
                ($v.z?.av) ? [
                  $h("img", { "src": $v.z?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.z?.noav) ? [
                  $h("svg", { "width": "56", "height": "56", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                    $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                  )
                ] : null
              )
            ),
            $h("div", { "style": "position: relative; flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 10px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 42px; line-height: 1.05; font-weight: 700; letter-spacing: -0.045em;" },
                $t($v.z?.h)
              ),
              ($v.z?.bio) ? [
                $h("span", { "style": "font-size: 16px; color: var(--ink-muted);" },
                  $t($v.z?.bio)
                )
              ] : null,
              $h("span", { "style": "display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px;" },
                ($v.z?.app?.name) ? [
                  $h("a", { "href": $v.z?.app?.href, "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-soft); text-decoration: none;" },
                    $h("span", { "class": `sw-app-icon ${$t($v.z?.app?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                      ($v.z?.app?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $v.z?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      ($v.z?.app?.nologo) ? [
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    "Pousse ", $t($v.z?.app?.name)
                  )
                ] : null,
                ($v.z?.app?.niche) ? [
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 13px; font-weight: 500; color: var(--ink);" },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                      $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.z?.app?.niche)
                  )
                ] : null,
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft);" },
                  ($v.z?.flag) ? [
                    $h("span", { "class": "sw-flag", "data-c": $v.z?.flag },
                      $t($v.z?.flag)
                    )
                  ] : null,
                  $t($v.z?.mkHero)
                ),
                ($v.z?.kindL) ? [
                  $h("span", { "title": "Type de contenu, lu sur ses vidéos", "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft);" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                      $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                    ),
                    $t($v.z?.kindL)
                  )
                ] : null
              )
            ),
            $h("div", { "style": "position: relative; display: flex; align-items: center; gap: 12px;" },
              $h("span", { "style": "display: flex; gap: 4px;" },
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": $v.followOn, "aria-label": $v.followAria, "style": `color: ${$t($v.followInk)};` },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "position: relative; display: inline-flex;" },
                  $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Ajouter à un dossier" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($v.aj) ? [
                    $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                      $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                    )
                  ] : null
                ),
                $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.z?.tt, "target": "_blank", "rel": "noopener", "aria-label": "Ouvrir le profil" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": `margin: 16px 32px 0; display: grid; grid-template-columns: repeat(${$t($v.tileN)}, minmax(0, 1fr)); gap: 12px;` },
            ($l($v.tiles)).map((t) => [
              $h("div", { "class": "sw-card", "style": "padding: 18px 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "class": "sw-tile-label", "style": "display: inline-flex; align-items: center; gap: 7px;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": t?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.l)
                ),
                $h("span", { "class": "sw-tile-value", "style": `color: ${$t(t?.ink)};` },
                  $t(t?.v)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  $t(t?.s)
                )
              )
            ])
          ),
          $h("div", { "style": "margin: 28px 32px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;" },
            $h("div", { "role": "tablist", "aria-label": "Contenu", "style": "display: flex; gap: 4px; padding: 4px; border-radius: 14px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              ($l($v.tabs)).map((tb) => [
                $h("button", { "type": "button", "role": "tab", "aria-selected": tb?.on, "onClick": tb?.pick, "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: ${$t(tb?.bg)}; color: ${$t(tb?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(tb?.fw)}; cursor: pointer;` },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(tb?.ic)};` },
                    $h("path", { "d": tb?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(tb?.l)
                )
              ])
            ),
            ($v.showSort) ? [
              $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Tri" },
                ($l($v.sorts)).map((s) => [
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 30px;" },
                    $t(s?.l)
                  )
                ])
              )
            ] : null
          ),
          ($v.ins) ? [
            $h("div", { "style": "margin: 16px 32px 0; padding: 14px 18px; border-radius: 16px; display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, var(--accent-soft), transparent 70%); border: 1px solid var(--accent-edge);" },
              $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--blue-600); color: #FFFFFF;" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", { "style": "font-size: 14px; color: var(--ink-soft);" },
                $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                  $t($v.ins?.b)
                ),
                $t($v.ins?.r)
              )
            )
          ] : null,
          ($v.tabV) ? [
            $h("div", { "style": "padding: 16px 32px 48px; display: grid; grid-template-columns: repeat(auto-fill, minmax(256px, 1fr)); gap: 16px;" },
              ($l($v.cards)).map((v) => [
                $h("article", { "style": "position: relative; display: flex; flex-direction: column; min-width: 0; border-radius: 18px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                  $h("header", { "style": "display: flex; align-items: center; gap: 10px; padding: 12px 12px 10px;" },
                    $h("span", { "style": "position: relative; flex-shrink: 0; width: 34px; height: 34px;" },
                      $h("span", { "style": "display: flex; width: 34px; height: 34px; border-radius: 50%; overflow: hidden; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724);" },
                        (v?.av) ? [
                          $h("img", { "src": v?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        (v?.noav) ? [
                          $h("span", { "style": "font-size: 13px; font-weight: 700; color: var(--ink-faint);" },
                            $t(v?.ini)
                          )
                        ] : null
                      ),
                      (v?.flag) ? [
                        $h("span", { "class": "sw-flag", "data-c": v?.flag, "aria-hidden": "true", "style": "position: absolute; right: -3px; bottom: -3px; width: 14px; height: 14px; box-shadow: 0 0 0 2px #121722;" })
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(v?.h)
                      ),
                      (v?.appName) ? [
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 5px; min-width: 0; font-size: 11px; color: var(--ink-faint); white-space: nowrap; overflow: hidden;" },
                          $h("span", { "class": `sw-app-icon ${$t(v?.appBlank)}`, "style": "width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0;" },
                            (v?.appIcon) ? [
                              $h("img", { "class": "sw-logo-img", "src": v?.appIcon, "alt": "", "loading": "lazy", "decoding": "async" })
                            ] : null
                          ),
                          $h("span", { "style": "overflow: hidden; text-overflow: ellipsis;" },
                            $t(v?.appLine)
                          )
                        )
                      ] : null
                    ),
                    $h("span", { "style": "position: relative; display: inline-flex; flex-shrink: 0;" },
                      $h("button", { "data-aj-trigger": "true", "type": "button", "onClick": v?.toggleAj, "aria-expanded": v?.ajOpen, "aria-haspopup": "dialog", "aria-label": "Ranger dans un dossier", "title": "Ranger dans un dossier", "style": `width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: 9px; background: ${$t(v?.ajBg)}; color: ${$t(v?.ajInk)}; cursor: pointer;` },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                        )
                      ),
                      (v?.aj) ? [
                        $h("span", { "style": "position: absolute; top: calc(100% + 8px); right: 0; z-index: 45;" },
                          $h(AjoutDossier, { "onClose": $v.closeAjV, "item": v?.item, "saved": $v.savedFn, "save": $v.saveFn })
                        )
                      ] : null
                    )
                  ),
                  $h("a", { "href": v?.href, "class": "sw-video", "aria-label": `Voir la vidéo, ${$t(v?.v)} vues`, "style": "display: block; margin: 0 12px; aspect-ratio: 4 / 5; border-radius: 14px;" },
                    (v?.src) ? [
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy" })
                    ] : null,
                    $h("span", { "class": "sw-video-shade" }),
                    (v?.x) ? [
                      $h("span", { "style": `position: absolute; top: 10px; left: 10px; z-index: 2; display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: ${$t(v?.xBg)}; font-size: 12px; font-weight: 700; color: #FFFFFF;` },
                        $t(v?.x), " sa normale"
                      )
                    ] : null,
                    $h("span", { "style": "position: absolute; top: 10px; right: 10px; z-index: 2; display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: rgba(5,7,12,0.6); font-size: 11px; font-weight: 600; color: #FFFFFF;" },
                      $t(v?.plat)
                    ),
                    $h("span", { "style": "position: absolute; left: 12px; bottom: 10px; z-index: 2; font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #FFFFFF;" },
                      $t(v?.v)
                    )
                  ),
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 12px 12px 0; font-size: 12px; color: var(--ink-muted); min-width: 0;" },
                    (v?.mk) ? [
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $h("span", { "class": "sw-flag", "data-c": v?.flag, "aria-hidden": "true", "style": "width: 14px; height: 14px; flex-shrink: 0;" }),
                        $t(v?.mk)
                      )
                    ] : null,
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0; white-space: nowrap;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(v?.ago)
                    )
                  ),
                  (v?.st) ? [
                    $h("span", { "style": `display: inline-flex; align-items: center; gap: 7px; padding: 10px 12px 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: ${$t(v?.stInk)};` },
                      $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t(v?.stInk)};` }),
                      $t(v?.st)
                    )
                  ] : null,
                  $h("p", { "style": `margin: 8px 12px 0; min-height: 40px; font-size: 13px; line-height: 1.5; color: ${$t(v?.tInk)}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;` },
                    $t(v?.tShown)
                  ),
                  $h("footer", { "style": "margin-top: auto; padding-top: 12px;" },
                    $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px 6px 12px; border-top: 1px solid var(--line);" },
                      $h("a", { "href": v?.url, "target": "_blank", "rel": "noopener", "style": "display: inline-flex; align-items: center; gap: 6px; height: 32px; flex-shrink: 0; font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.05em; color: var(--ink-faint); text-decoration: none; white-space: nowrap;" },
                        $t(v?.urlLabel),
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M7 17L17 7M9 7h8v8", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      (v?.t) ? [
                        $h("button", { "type": "button", "onClick": v?.copy, "aria-live": "polite", "style": `display: inline-flex; align-items: center; gap: 6px; height: 32px; min-width: 0; padding: 0 6px; border: 0; border-radius: 9px; background: transparent; color: ${$t(v?.copyInk)}; font: inherit; font-size: 12px; cursor: pointer; white-space: nowrap; overflow: hidden;` },
                          $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                            $h("path", { "d": v?.copyIc, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          ),
                          $t(v?.copyLabel)
                        )
                      ] : null
                    )
                  )
                )
              ]),
              ($v.noVids) ? [
                $h("p", { "style": "grid-column: 1 / -1; margin: 8px 0; font-size: 15px; color: var(--ink-muted);" },
                  "Aucune vidéo de ce compte pour l’instant."
                )
              ] : null
            )
          ] : null,
          ($v.tabF) ? [
            $h("div", { "style": "padding: 16px 32px 48px;" },
              $h("section", { "class": "sw-card", "style": "padding: 8px 24px; display: flex; flex-direction: column;" },
                ($l($v.fmts)).map((f) => [
                  $h("a", { "href": f?.href, "style": `text-decoration: none; color: inherit; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 0; border-top: ${$t(f?.bt)};` },
                    $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; background: var(--track); color: var(--ink-muted); display: inline-flex; align-items: center; justify-content: center;" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": f?.icon, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "style": "display: flex; flex-direction: column; gap: 3px; min-width: 0;" },
                      $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.4;" },
                        $t(f?.t)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(f?.meta)
                      )
                    ),
                    $h("span", { "class": "sw-more", "style": "color: var(--accent);" },
                      "Voir le format",
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ]),
                ($v.noFmts) ? [
                  $h("p", { "style": "margin: 14px 0; font-size: 15px; color: var(--ink-muted);" },
                    "Aucun format repris pour l’instant."
                  )
                ] : null
              )
            )
          ] : null,
          ($v.tabA) ? [
            $h("div", { "style": "padding: 16px 32px 48px;" },
              $h("section", { "class": "sw-card", "style": "padding: 8px 24px; display: flex; flex-direction: column;" },
                $h("a", { "href": $v.z?.app?.href, "style": "text-decoration: none; color: inherit; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 0;" },
                  $h("span", { "class": `sw-app-icon ${$t($v.z?.app?.blank)}`, "style": "width: 32px; height: 32px; border-radius: 10px;" },
                    ($v.z?.app?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.z?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    ($v.z?.app?.nologo) ? [
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 3px; min-width: 0;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.4;" },
                      $t($v.z?.app?.name)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t($v.z?.app?.niche)
                    )
                  ),
                  $h("span", { "class": "sw-more", "style": "color: var(--accent);" },
                    "Voir l’app",
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
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
