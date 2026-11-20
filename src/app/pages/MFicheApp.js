// Généré par scripts/dc2preact.py depuis design/app/MFiche.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFicheApp extends DCLogic {

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
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    // Suivre : sur le site, follows.apps (saved) ; sur le canevas, l'état local.
    const fid = (P.data && P.data.slug) || (P.params && P.params.slug) || (live ? '' : 'astraai');
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.apps || []).indexOf(fid) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !fid) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      next.apps = l.indexOf(fid) >= 0 ? l.filter((x) => x !== fid) : [fid].concat(l);
      P.save('follows', next);
    };
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow, ajItem: fid ? { kind: 'app', id: fid, label: b.app.name, cover: (b.a && b.a.logo) || null } : null }, { followYes: f, followNo: !f, followAria: 'Ne plus suivre ' + b.app.name, followLabel: 'Suivre ' + b.app.name,
      secs: (b.secs || []).map((s, i) => Object.assign({}, s, { href: ['#m-vues', '#m-vid', '#m-fmt', '#m-cr'][i] || '#m-vues', on: (st.sec || 0) === i ? 'true' : 'false', pick: () => this.setState({ sec: i }) })) });
  }

  baseVals() {
    let a = (globalThis.__dcSample?.["MFicheApp"]?.["a"] ?? {"name":"","logo":"","nologo":false,"blank":"","mk":[]});
    let secs = [{"l": "Vue d’ensemble", "n": "", "on": "true"}, {"l": "Vidéos", "n": "2 542", "on": "false"}, {"l": "Formats", "n": "5", "on": "false"}, {"l": "Créateurs", "n": "269", "on": "false"}];
    let wk = [{"h": 69, "v": "10,6 M", "l": "1 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 64, "v": "9,8 M", "l": "8 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 58, "v": "8,9 M", "l": "15 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 55, "v": "8,5 M", "l": "22 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 113, "v": "17,3 M", "l": "29 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 120, "v": "18,4 M", "l": "5 nov.", "bg": "var(--accent)", "ink": "var(--ink)"}];
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let fv = (globalThis.__dcSample?.["MFicheApp"]?.["fv"] ?? []);
    fv = fv.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    let ff = [{"ico": "M5 6h14M12 6v13M9 19h6", "t": "« Je supprime cette vidéo dans 24 h »", "m": "La même idée en vietnamien chez Astra AI et en allemand chez Retain Cards", "x": "1 226×", "o": "809 k vues"}, {"ico": "M5 6h14M12 6v13M9 19h6", "t": "« TRATA ESTE VÍDEO COMO QUERES QUE SEJAM AS TUAS NOTAS »", "m": "Portugais · 4 comptes", "x": "11× en médiane", "o": "2 reprises sur 4"}, {"ico": "M5 6h14M12 6v13M9 19h6", "t": "« GUARDA E PARTILHA »", "m": "Portugais · 3 comptes", "x": "17× en médiane", "o": "3 reprises sur 4"}, {"ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "t": "Son « exam vibes »", "m": "5 comptes · le son de la révision qui stresse", "x": "7× en médiane", "o": "4 reprises sur 6"}];
    let fm = [{"c": "ID", "l": "Indonésie", "v": "37,5 M", "p": "65 %", "w": "65.0%", "bg": "var(--accent)"}, {"c": "US", "l": "États-Unis", "v": "10,7 M", "p": "19 %", "w": "18.6%", "bg": "var(--line-strong)"}, {"c": "ES", "l": "Espagne", "v": "4,8 M", "p": "8 %", "w": "8.4%", "bg": "var(--line-strong)"}, {"c": "BR", "l": "Brésil", "v": "2,9 M", "p": "5 %", "w": "5.0%", "bg": "var(--line-strong)"}, {"c": "FR", "l": "France", "v": "1,3 M", "p": "2 %", "w": "2.3%", "bg": "var(--line-strong)"}, {"c": "MX", "l": "Mexique", "v": "0,4 M", "p": "1 %", "w": "0.7%", "bg": "var(--line-strong)"}];
    let fc = (globalThis.__dcSample?.["MFicheApp"]?.["fc"] ?? []);
    let app = { name: 'Astra AI', niche: 'Études', hasDelta: true, delta: '+6 % cette semaine', hasDesc: true, desc: 'Aide aux révisions par IA',
      hasStore: true, store: 'https://apps.apple.com/fr/app/astra-ai-r%C3%A9vision-examens/id6751030141', play: 'https://play.google.com/store/search?q=Astra%20AI&c=apps',
      hasSite: true, site: 'https://astra-ai.fr', v30: '57,7 M', ig: 'dont 2,8 M sur Instagram', week: '18,4 M', wd: '+6 % face à la semaine d’avant',
      acc: '269', ppw: '1 360 vidéos par semaine' };
    ff = ff.map((f) => Object.assign({ href: '/app/formats' }, f));
    fc = fc.map((c) => Object.assign({ page: true, nopage: false, href: '/app/createurs/zinedine.gsbb' }, c));
    // Le tableau de bord du haut de la fiche (FicheA, b424501) : mêmes entrées pour l'exemple et pour le Radar.
    let WK = [10.6e6, 9.8e6, 8.9e6, 8.5e6, 17.3e6, 18.4e6];
    let LB = ['01/10', '08/10', '15/10', '22/10', '29/10', '05/11'];
    let src = { views30: 57.7e6, ig: 2.8e6, weekDelta: 0.06, accounts: 269, ppw: 1360, bestX: 2333, top10: 0.43, videoCount: 2552,
      rank: 1, rankOf: 5, share: 0.41, scope: 'Études', top: null };
    let vfOn = false, vfTabs = [];
    // Sur le site : la fiche de l'app (document « app:<slug> »), lue comme FicheA.
    const D = this.props && this.props.data;
    if (D && D.name) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + '\u202fj'; };
      const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const hasD = D.weekDelta !== null && D.weekDelta !== undefined;
      const W = D.weeks || [];
      a = Object.assign({ name: D.name, mk: flags((D.markets || []).map((x) => x[0])) }, ico(D));
      app = { name: D.name, niche: D.niche || '', kind: ({ app: 'App', saas: 'SaaS', jeu_mobile: 'Jeu mobile' })[D.kind] || '', hasDelta: hasD, delta: hasD ? pct(D.weekDelta) + ' cette semaine' : '', hasDesc: false, desc: '',
        hasStore: !!D.store, store: D.store || '', play: 'https://play.google.com/store/search?q=' + encodeURIComponent(D.name) + '&c=apps', hasSite: false, site: '',
        v30: nf(D.views30 || 0), ig: D.views30Ig > 0 ? 'dont ' + nf(D.views30Ig) + ' sur Instagram' : 'vidéos publiées ces 30 jours',
        week: nf(W[W.length - 1] || 0), wd: hasD ? pct(D.weekDelta) + ' face à la semaine d’avant' : 'première semaine suivie',
        acc: (D.accounts || 0).toLocaleString('en-US').replace(/,/g, '\u202f'), ppw: (D.videosPerWeek || 0).toLocaleString('en-US').replace(/,/g, '\u202f') + ' vidéos par semaine' };
      const mx = Math.max.apply(null, W.concat([1]));
      wk = W.map((w, j) => ({ h: Math.max(4, Math.round(w / mx * 120)), v: nf(w), bg: j === W.length - 1 ? 'var(--accent)' : 'var(--line-strong)', ink: j === W.length - 1 ? 'var(--ink)' : 'var(--ink-faint)',
        l: new Date((D.updatedAt || Date.now()) - (W.length - 1 - j) * 7 * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }));
      // Placements payés : toutes / sans / seulement, avec leur nombre — seulement si l'app en a (comme FicheA).
      const DV = D.videos || [];
      const nPaid = DV.filter((v) => v.paid).length;
      const vf = (this.state || {}).vf || 'all';
      vfOn = nPaid > 0;
      vfTabs = [['all', 'Toutes', DV.length], ['sans', 'Sans les placements', DV.length - nPaid], ['seuls', 'Placements payés', nPaid]].map(([k, l, n]) => ({ l, n: String(n), coin: k === 'seuls',
        on: vf === k ? 'true' : 'false', pick: () => this.setState({ vf: k }) }));
      fv = DV.filter((v) => (vf === 'sans' ? !v.paid : vf === 'seuls' ? !!v.paid : true)).slice(0, 6)
        .map((v) => ({ src: v.cover || '', v: nf(v.views), h: '@' + v.handle, age: ago(v.publishedAt), href: '/app/videos/' + v.id, paid: !!v.paid, car: v.carousel ? String(v.carousel) : '', bTop: v.carousel ? '17px' : '8px', segs: Array.from({ length: Math.min(+(v.carousel || 0), 12) }, (_, j) => ({ bg: j === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.34)' })) }));
      ff = (D.formats || []).slice(0, 4).map((f) => ({ ico: f.kind === 'sound' ? SON : TXT, t: f.kind === 'sound' ? 'Son « ' + f.label + ' »' : '« ' + f.label + ' »',
        m: f.accounts + ' comptes', x: f.medX ? xf(f.medX) + ' en médiane' : '', o: nf(f.maxViews || 0) + ' vues au mieux', href: f.page === false ? null : '/app/formats/' + f.id }));
      fm = (D.markets || []).map(([c, p], i) => ({ c, l: ML[c] || c, v: nf((D.views30 || 0) * p / 100), p: p + '\u202f%', w: p + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' }));
      fc = (D.creators || []).slice(0, 6).map((c) => ({ av: c.avatar || '', noav: true, h: '@' + c.handle, mk: c.market || '',
        s: nf(c.fans || 0) + ' abonnés' + (c.median ? ' · ' + nf(c.median) + ' vues médianes' : ''), page: !!c.page, nopage: !c.page, href: '/app/createurs/' + c.handle }));
      secs = secs.map((x, i) => Object.assign({}, x, { n: ['', String(D.videoCount || (D.videos || []).length), String((D.formats || []).length), (D.accounts || 0).toLocaleString('en-US').replace(/,/g, '\u202f')][i] || '' }));
      // Rang : dans sa niche (document « apps », toujours chargé), sinon parmi toutes les apps du Radar.
      WK = W.slice();
      LB = WK.map((_, j) => day((D.updatedAt || Date.now()) - (WK.length - j) * 7 * 86400000));
      const all = (this.props.get && this.props.get('apps')) || null;
      const list = all && all.apps ? all.apps : [];
      // Aperçu sans abonnement : « apps » ne porte que le top 3 ; son rang réel vient du serveur (standing, audit Q15).
      const own = list.find((x) => x.slug === D.slug);
      const st = own && own.standing ? own.standing : null;
      let pool = list.filter((x) => x.niche === D.niche);
      const inNiche = D.niche && D.niche !== 'Autres' && pool.length >= 2;
      if (!inNiche) pool = list;
      pool = pool.slice().sort((x, y) => (y.views30 || 0) - (x.views30 || 0));
      const sum = pool.reduce((s, x) => s + (x.views30 || 0), 0);
      const t0 = (D.videos || [])[0];
      const rk = st ? st.rank : pool.findIndex((x) => x.slug === D.slug) + 1;
      src = { views30: D.views30 || 0, ig: D.views30Ig || 0, weekDelta: hasD ? D.weekDelta : null, accounts: D.accounts || 0, ppw: D.videosPerWeek || 0, bestX: D.bestX || 0,
        top10: D.top10Share === undefined ? null : D.top10Share, videoCount: D.videoCount || (D.videos || []).length,
        rank: rk, rankOf: rk ? (st ? st.of : pool.length) : 0, share: st ? st.share : sum ? (D.views30 || 0) / sum : 0, scope: st ? st.niche : inNiche ? D.niche : '',
        top: t0 ? { cover: t0.cover || '', views: t0.views, handle: t0.handle, x: t0.x, at: t0.publishedAt, href: '/app/videos/' + t0.id } : null };
    }
    // ── Tableau de bord (FicheA) ──
    const nfD = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
    const grp = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const xfD = (x) => (x >= 100 ? grp(x) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const wTop = Math.max(1, ...WK) * 1.22;
    const wMax = Math.max(0, ...WK);
    const hatch = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 7px), rgba(255,255,255,0.03)';
    const mean = WK.reduce((s, v) => s + v, 0) / (WK.length || 1);
    const t1 = src.top;
    const f0 = fv[0];
    const dash = {
      v30: nfD(src.views30),
      v30Sub: 'vues sur 30 jours' + (src.ig > 0 ? ', dont ' + nfD(src.ig) + ' sur Instagram' : ''),
      delta: src.weekDelta === null ? '' : (src.weekDelta >= 9 ? '×' + grp(1 + src.weekDelta) : (src.weekDelta >= 0 ? '+' : '−') + Math.round(Math.abs(src.weekDelta) * 100) + '\u202f%') + ' cette semaine',
      deltaBg: src.weekDelta >= 0 ? 'rgba(76,154,255,0.16)' : 'rgba(255,255,255,0.09)', deltaInk: src.weekDelta >= 0 ? '#4C9AFF' : '#E6E9EF',
      weeks: WK.map((v, i) => {
        const now = i === WK.length - 1;
        const prev = i ? WK[i - 1] : 0;
        const noise = Math.max(v, prev) < wMax * 0.08; // deux semaines quasi vides : la variation ne dit rien
        const r = prev > 0 && !noise ? v / prev : null;
        const chip = r === null ? '' : r >= 2 ? '×' + (Math.round(r * 10) / 10).toString().replace('.', ',') : (r >= 1 ? '+' : '−') + Math.round(Math.abs(r - 1) * 100) + '\u202f%';
        const up = r !== null && r >= 1;
        return { isNow: now, val: nfD(v), title: (now ? 'Cette semaine' : 'Semaine du ' + LB[i]) + ' : ' + nfD(v) + ' vues',
          label: now ? 'Cette sem.' : LB[i], pct: ((v / wTop) * 100).toFixed(1),
          bg: now ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : hatch,
          shadow: now ? '0 10px 26px rgba(11,111,224,0.45), inset 0 1px 0 rgba(255,255,255,0.35)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          chip, chipBg: up ? 'rgba(76,154,255,0.16)' : 'rgba(255,255,255,0.09)', chipInk: up ? '#4C9AFF' : '#E6E9EF',
          fw: now ? '600' : '400', labelInk: now ? '#FFFFFF' : '#8A93A3' };
      }),
      avgPct: ((mean / wTop) * 100).toFixed(1), avgLabel: nfD(mean),
      shareLabel: src.scope ? 'Part de sa niche' : 'Part du Radar', share: src.share > 0 && src.share < 0.005 ? '< 1\u202f%' : Math.round(src.share * 100) + '\u202f%', shareW: Math.min(100, Math.round(src.share * 100)) + '%',
      rank: src.rank ? 'N°' + src.rank : '—', rankOf: src.rank ? 'sur ' + src.rankOf + ' apps ' + (src.scope ? 'de ' + src.scope : 'du Radar') : '',
      rankBadge: src.scope && src.rank && src.rank <= 3 ? 'N°' + src.rank + ' de sa niche' : '',
      acc: grp(src.accounts), accLabel: src.accounts > 1 ? 'comptes' : 'compte', ppw: grp(src.ppw) + ' vidéos / sem.',
      hasTop10: src.top10 !== null && src.accounts > 10, top10: Math.round((src.top10 || 0) * 100) + '\u202f%', top10W: Math.round((src.top10 || 0) * 100) + '%',
      othersLine: 'Les ' + (src.accounts - 10) + ' autres : ' + (100 - Math.round((src.top10 || 0) * 100)) + '\u202f%',
      hasTop: !!t1 || !(this.props && this.props.data),
      top: t1 ? { cover: t1.cover, href: t1.href, views: nfD(t1.views) + ' vues', x: t1.x ? xfD(t1.x) + ' sa normale' : '',
        who: '@' + t1.handle + ' · ' + new Date(t1.at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), aria: 'Lire la vidéo de @' + t1.handle }
        : { cover: f0 ? f0.src : '', href: f0 ? f0.href : '/app/videos', views: f0 ? f0.v + ' vues' : '', x: '', who: f0 ? f0.h : '', aria: 'Lire la vidéo' },
      vid30: grp(src.videoCount), best: src.bestX ? xfD(src.bestX) : '—',
    };
    app.hasLinks = !!(app.hasStore || app.hasSite);
    return { a, secs, wk, fv, ff, fm, fc, app, dash, vfOn, vfTabs, fvNone: vfOn && fv.length === 0, hasFv: fv.length > 0 || vfOn, hasFf: ff.length > 0, hasFc: fc.length > 0 };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/apps", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.app?.name)
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
        $h("div", { "style": "padding: 20px 20px 0; display: flex; flex-direction: column; gap: 14px;" },
          $h("div", { "style": "display: flex; align-items: center; gap: 14px;" },
            $h("span", { "class": `sw-app-icon ${$t($v.a?.blank)}`, "style": "width: 68px; height: 68px; border-radius: 18px;" },
              ($v.a?.logo) ? [
                $h("img", { "class": "sw-logo-img", "src": $v.a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
              ] : null,
              ($v.a?.nologo) ? [
                $h("svg", { "width": "34", "height": "34", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ] : null
            ),
            $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
              $h("span", { "style": "font-family: var(--font-display); font-size: 30px; font-weight: 700; letter-spacing: -0.04em;" },
                $t($v.app?.name)
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 6px; flex-wrap: wrap;" },
                $h("span", { "class": "m-tagn" },
                  $h("span", { "class": "m-ic", "data-i": $v.app?.niche, "aria-hidden": "true" }),
                  $t($v.app?.niche)
                ),
                ($v.app?.kind) ? [
                  $h("span", { "class": "m-tagn" },
                    $t($v.app?.kind)
                  )
                ] : null,
                ($v.dash?.rankBadge) ? [
                  $h("span", { "class": "sw-badge sw-badge-accent", "style": "height: 24px;" },
                    $t($v.dash?.rankBadge)
                  )
                ] : null
              )
            )
          ),
          ($v.app?.hasDesc) ? [
            $h("p", { "style": "margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
              $t($v.app?.desc)
            )
          ] : null,
          ($v.app?.hasLinks) ? [
            $h("div", { "style": "display: flex; gap: 8px;" },
              ($v.app?.hasStore) ? [
                $h("a", { "class": "sw-pill", "href": $v.app?.store, "target": "_blank", "rel": "noopener", "style": "height: 44px;" },
                  "App Store"
                )
              ] : null,
              ($v.app?.hasSite) ? [
                $h("a", { "class": "sw-pill", "href": $v.app?.site, "target": "_blank", "rel": "noopener", "style": "height: 44px;" },
                  "Site"
                )
              ] : null
            )
          ] : null,
          $h("div", { "style": "display: flex; justify-content: center; align-items: center; gap: 10px;" },
            ($v.followNo) ? [
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": "false" },
                $t($v.followLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                  )
                )
              )
            ] : null,
            ($v.followYes) ? [
              $h("button", { "class": "sw-btn sw-btn-ghost", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": "true", "aria-label": $v.followAria, "style": "height: 56px; padding: 0 24px; font-size: 17px; gap: 10px;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--accent);" },
                  $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Suivie"
              )
            ] : null,
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openAj, "aria-label": "Ajouter à un dossier", "style": "flex-shrink: 0; width: 52px; height: 52px; box-shadow: inset 0 0 0 1px var(--line);" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ),
        $h("div", { "style": "margin: 18px 20px 0;" },
          $h("div", { "class": "m-tc is-scroll", "role": "tablist" },
            ($l($v.secs)).map((s) => [
              $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "href": s?.href, "onClick": s?.pick, "style": "flex-shrink: 0; display: inline-flex; gap: 6px; align-items: center; text-decoration: none;" },
                $h("span", { "class": "m-ic", "data-i": s?.l, "aria-hidden": "true" }),
                $t(s?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                  $t(s?.n)
                )
              )
            ])
          )
        ),
        $h("div", { "id": "m-vues", "style": "scroll-margin-top: 72px; padding: 18px 20px 0; display: flex; flex-direction: column; gap: 12px;" },
          $h("section", { "aria-labelledby": "mf-vr", "style": "border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 18px 18px 14px; display: flex; flex-direction: column;" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px;" },
              $h("h2", { "id": "mf-vr", "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em; white-space: nowrap;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M3 3v18h18M7 15l4-4 3 3 5-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Vues par semaine"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; color: var(--ink-faint); white-space: nowrap;" },
                $h("span", { "aria-hidden": "true", "style": "width: 14px; border-top: 1.5px dashed rgba(255,255,255,0.4);" }),
                "MOYENNE ", $t($v.dash?.avgLabel)
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 10px; margin-top: 12px;" },
              $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; font-size: 44px; letter-spacing: -0.05em; white-space: nowrap;" },
                $t($v.dash?.v30)
              ),
              ($v.dash?.delta) ? [
                $h("span", { "style": `display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: ${$t($v.dash?.deltaBg)}; font-size: 12px; font-weight: 600; color: ${$t($v.dash?.deltaInk)}; white-space: nowrap;` },
                  $t($v.dash?.delta)
                )
              ] : null
            ),
            $h("span", { "style": "margin-top: 6px; font-size: 12px; color: var(--ink-faint);" },
              $t($v.dash?.v30Sub)
            ),
            $h("div", { "style": "position: relative; height: 150px; margin-top: 46px; display: flex; gap: 6px;" },
              $h("span", { "aria-hidden": "true", "style": `position: absolute; left: 0; right: 0; bottom: ${$t($v.dash?.avgPct)}%; border-top: 1.5px dashed rgba(255,255,255,0.28);` }),
              ($l($v.dash?.weeks)).map((w) => [
                $h("span", { "style": "position: relative; flex: 1; min-width: 0; display: flex; align-items: flex-end;" },
                  $h("span", { "style": `position: absolute; left: 50%; bottom: calc(${$t(w?.pct)}% + 6px); transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 4px;` },
                    (w?.isNow) ? [
                      $h("span", { "style": "padding: 4px 8px; border-radius: 9px; background: #161B26; box-shadow: 0 8px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.10); font-family: var(--font-display); font-size: 13px; font-weight: 700; white-space: nowrap;" },
                        $t(w?.val)
                      )
                    ] : null,
                    (w?.chip) ? [
                      $h("span", { "style": `display: inline-flex; align-items: center; height: 18px; padding: 0 5px; border-radius: 999px; background: ${$t(w?.chipBg)}; font-size: 10px; font-weight: 600; color: ${$t(w?.chipInk)}; white-space: nowrap;` },
                        $t(w?.chip)
                      )
                    ] : null
                  ),
                  $h("span", { "title": w?.title, "style": `display: block; width: 100%; height: ${$t(w?.pct)}%; min-height: 6px; border-radius: 10px; background: ${$t(w?.bg)}; box-shadow: ${$t(w?.shadow)};` })
                )
              ])
            ),
            $h("div", { "style": "display: flex; gap: 6px; margin-top: 8px;" },
              ($l($v.dash?.weeks)).map((w) => [
                $h("span", { "style": `flex: 1; min-width: 0; text-align: center; font-size: 10px; line-height: 1.25; font-weight: ${$t(w?.fw)}; color: ${$t(w?.labelInk)};` },
                  $t(w?.label)
                )
              ])
            )
          ),
          $h("section", { "aria-labelledby": "mf-place", "style": "border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 18px; display: flex; flex-direction: column;" },
            $h("h2", { "id": "mf-place", "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Sa place"
            ),
            $h("span", { "style": "margin-top: 12px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px;" },
              $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; font-size: 36px; letter-spacing: -0.045em;" },
                $t($v.dash?.rank)
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                $t($v.dash?.rankOf)
              )
            ),
            $h("div", { "style": "margin-top: 16px; display: flex; flex-direction: column; gap: 8px;" },
              $h("div", { "style": "display: flex; justify-content: space-between; gap: 10px; font-size: 13px; white-space: nowrap;" },
                $h("span", { "style": "color: var(--ink-muted);" },
                  $t($v.dash?.shareLabel)
                ),
                $h("span", { "style": "font-weight: 600;" },
                  $t($v.dash?.share)
                )
              ),
              $h("span", { "aria-hidden": "true", "style": "display: flex; height: 22px; border-radius: 8px; overflow: hidden; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 7px), rgba(255,255,255,0.025);" },
                $h("span", { "style": `width: ${$t($v.dash?.shareW)}; border-radius: 8px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0);` })
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                "en vues sur 30 jours"
              )
            )
          ),
          $h("section", { "aria-labelledby": "mf-res", "style": "border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 18px; display: flex; flex-direction: column;" },
            $h("h2", { "id": "mf-res", "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Son réseau"
            ),
            $h("span", { "style": "margin-top: 12px; display: flex; align-items: baseline; gap: 8px;" },
              $h("span", { "style": "font-family: var(--font-display); font-weight: 700; line-height: 1; font-size: 36px; letter-spacing: -0.045em;" },
                $t($v.dash?.acc)
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                $t($v.dash?.accLabel)
              )
            ),
            $h("span", { "style": "margin-top: 10px; align-self: flex-start; display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; background: var(--accent-soft); font-size: 12px; font-weight: 600; color: var(--accent); white-space: nowrap;" },
              $t($v.dash?.ppw)
            ),
            ($v.dash?.hasTop10) ? [
              $h("div", { "style": "margin-top: 16px; display: flex; flex-direction: column; gap: 8px;" },
                $h("div", { "style": "display: flex; justify-content: space-between; gap: 10px; font-size: 13px; white-space: nowrap;" },
                  $h("span", { "style": "color: var(--ink-muted);" },
                    "Part des 10 premiers"
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t($v.dash?.top10)
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": "display: flex; height: 22px; border-radius: 8px; overflow: hidden; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 7px), rgba(255,255,255,0.025);" },
                  $h("span", { "style": `width: ${$t($v.dash?.top10W)}; border-radius: 8px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0);` })
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  $t($v.dash?.othersLine)
                )
              )
            ] : null
          ),
          $h("section", { "aria-labelledby": "mf-top", "style": "border-radius: 22px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); padding: 18px; display: flex; flex-direction: column; gap: 14px;" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
              $h("h2", { "id": "mf-top", "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Sa vidéo n°1"
              ),
              $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--ink-faint);" },
                "30 JOURS"
              )
            ),
            ($v.dash?.hasTop) ? [
              $h("a", { "href": $v.dash?.top?.href, "aria-label": $v.dash?.top?.aria, "style": "position: relative; display: block; aspect-ratio: 4 / 5; border-radius: 18px; overflow: hidden; background: #0A0C12; text-decoration: none; color: #FFFFFF;" },
                $h("img", { "src": $v.dash?.top?.cover, "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" }),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.25), transparent 30%, transparent 55%, rgba(0,0,0,0.75));" }),
                ($v.dash?.top?.x) ? [
                  $h("span", { "style": "position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); font-size: 12px; font-weight: 700;" },
                    $t($v.dash?.top?.x)
                  )
                ] : null,
                $h("span", { "aria-hidden": "true", "style": "position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.22); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center;" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                    $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "#FFFFFF" })
                  )
                ),
                $h("span", { "style": "position: absolute; left: 14px; right: 14px; bottom: 12px; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.dash?.top?.views)
                  ),
                  $h("span", { "style": "font-size: 13px; color: #E4E7EC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.dash?.top?.who)
                  )
                )
              )
            ] : null,
            $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
              $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--track);" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-faint);" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Vidéos · 30 j"
                ),
                $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em;" },
                  $t($v.dash?.vid30)
                )
              ),
              $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--track);" },
                $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-faint);" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M13 2L4 14h7l-1 8 9-12h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Meilleure · 7 j"
                ),
                $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: var(--accent);" },
                  $t($v.dash?.best)
                )
              )
            )
          )
        ),
        ($v.hasFv) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-vid", "style": "display: flex; align-items: center; gap: 8px; scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Leurs vidéos qui cartonnent"
              )
            ),
            ($v.vfOn) ? [
              $h("div", { "style": "padding: 0 20px;" },
                $h("div", { "class": "m-tc is-scroll", "role": "tablist", "aria-label": "Placements payés" },
                  ($l($v.vfTabs)).map((f) => [
                    $h("button", { "class": "sw-tab", "type": "button", "role": "tab", "aria-selected": f?.on, "onClick": f?.pick },
                      (f?.coin) ? [
                        $h("span", { "aria-hidden": "true", "style": "width: 15px; height: 15px; border-radius: 50%; background: #F5B941; color: #1A1206; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                          "€"
                        )
                      ] : null,
                      $t(f?.l),
                      $h("span", { "style": "color: var(--ink-faint); font-weight: 500;" },
                        $t(f?.n)
                      )
                    )
                  ])
                )
              )
            ] : null,
            ($v.fvNone) ? [
              $h("p", { "style": "margin: 0; padding: 0 20px; font-size: 14px; color: var(--ink-muted);" },
                "Aucune vidéo pour ce choix."
              )
            ] : null,
            $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
              ($l($v.fv)).map((v) => [
                $h("a", { "href": v?.href, "style": "flex-shrink: 0; width: 132px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
                  $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                    $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    (v?.car) ? [
                      $h("span", { "aria-hidden": "true", "style": "position: absolute; top: 6px; left: 8px; right: 8px; z-index: 3; display: flex; gap: 3px;" },
                        ($l(v?.segs)).map((g) => [
                          $h("span", { "style": `flex: 1; height: 3px; border-radius: 2px; background: ${$t(g?.bg)}; box-shadow: 0 1px 3px rgba(0,0,0,0.25);` })
                        ])
                      )
                    ] : null,
                    (v?.car) ? [
                      $h("span", { "title": `Carrousel de ${$t(v?.car)} photos`, "aria-label": "Carrousel", "style": `position: absolute; top: ${$t(v?.bTop)}; right: 8px; z-index: 2; height: 20px; padding: 0 7px; border-radius: 999px; background: rgba(5,7,12,0.62); color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;` },
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                          $h("path", { "d": "M8 8h12v12H8zM4 16V4h12", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linejoin": "round" })
                        ),
                        $t(v?.car)
                      )
                    ] : null,
                    (v?.paid) ? [
                      $h("span", { "style": `position: absolute; top: ${$t(v?.bTop)}; left: 8px; z-index: 2; display: flex;` },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                          $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                            "€"
                          ),
                          "Placement payé"
                        )
                      )
                    ] : null,
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views", "style": "font-size: 18px;" },
                        $t(v?.v)
                      )
                    )
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(v?.h)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    $t(v?.age)
                  )
                )
              ])
            )
          )
        ] : null,
        ($v.hasFf) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-fmt", "style": "display: flex; align-items: center; gap: 8px; scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Les formats qui cartonnent chez eux"
              )
            ),
            $h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 8px;" },
              ($l($v.ff)).map((f) => [
                $h("a", { "href": f?.href, "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; text-decoration: none; color: inherit;" },
                  $h("span", { "style": "width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.35;" },
                      $t(f?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(f?.m)
                    ),
                    $h("span", { "style": "font-size: 12px;" },
                      $h("span", { "style": "font-weight: 700; color: var(--accent);" },
                        $t(f?.x)
                      ),
                      " ",
                      $h("span", { "style": "color: var(--ink-faint);" },
                        "· ", $t(f?.o)
                      )
                    )
                  )
                )
              ])
            )
          )
        ] : null,
        $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
          $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "D’où publient ses comptes"
            )
          ),
          $h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 10px;" },
            ($l($v.fm)).map((m) => [
              $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px;" },
                  $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" }),
                  $h("span", { "style": "flex: 1; color: var(--ink-soft);" },
                    $t(m?.l)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(m?.v)
                  ),
                  $h("span", { "style": "width: 36px; text-align: right; color: var(--ink-faint);" },
                    $t(m?.p)
                  )
                ),
                $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                  $h("span", { "style": `display: block; height: 100%; width: ${$t(m?.w)}; background: ${$t(m?.bg)};` })
                )
              )
            ])
          )
        ),
        ($v.hasFc) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-cr", "style": "display: flex; align-items: center; gap: 8px; scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Les créateurs qui le poussent"
              )
            ),
            $h("div", { "class": "sw-card", "style": "margin: 0 20px; border-radius: 20px; padding: 4px 0;" },
              ($l($v.fc)).map((c) => [
                (c?.page) ? [
                  $h("a", { "href": c?.href, "style": "display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                      (c?.av) ? [
                        $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (c?.noav) ? [
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                          $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                          $t(c?.h)
                        ),
                        (c?.mk) ? [
                          $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                        ] : null
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.s)
                      )
                    ),
                    $h("span", { "style": "color: var(--ink-faint); display: inline-flex;" },
                      $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ] : null,
                (c?.nopage) ? [
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                      (c?.av) ? [
                        $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (c?.noav) ? [
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                          $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                          $t(c?.h)
                        ),
                        (c?.mk) ? [
                          $h("span", { "class": "sw-flag", "data-c": c?.mk, "aria-hidden": "true" })
                        ] : null
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.s)
                      )
                    )
                  )
                ] : null
              ])
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
