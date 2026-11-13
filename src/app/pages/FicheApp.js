// Généré par scripts/dc2preact.py depuis design/app/FicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class FicheApp extends DCLogic {

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
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const D = P.data;
    const slug = (D && D.slug) || (P.params && P.params.slug) || (live ? '' : 'astraai');
    // Suivre : sur le site, follows.apps (saved) ; sur le canevas, l'état local.
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.apps || []).indexOf(slug) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !slug) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      next.apps = l.indexOf(slug) >= 0 ? l.filter((x) => x !== slug) : [slug].concat(l);
      P.save('follows', next);
    };
    // Les dossiers qui la gardent (saved('folders')).
    const fs = live ? P.saved('folders') : null;
    const kept = (Array.isArray(fs) ? fs : []).filter((x) => (x.items || []).some((i) => i.kind === 'app' && i.id === slug)).map((x) => ({ name: x.name, href: '/app/dossiers/' + x.id }));
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow }, { followLabel: f ? 'Suivi' : 'Suivre ' + b.app.name,
      kept, keptNone: kept.length === 0,
      ajItem: { kind: 'app', id: slug, label: b.app.name, cover: b.app.icon || null },
      copyAria: st.copied ? 'Lien copié' : 'Copier le lien de la fiche', copyBg: st.copied ? 'var(--accent-soft)' : 'var(--track)',
      copyLink: () => { try { navigator.clipboard.writeText(window.location.href); } catch (e) {} this.setState({ copied: true }); clearTimeout(this.tmc); this.tmc = setTimeout(() => this.setState({ copied: false }), 2000); },
      sections: (b.sections || []).map((s, i) => Object.assign({}, s, { href: ['#fa-vr', '#fa-vid', '#fa-fmt', '#fa-cr', '#fa-res'][i] || '#fa-vr' })) });
  }

  baseVals() {
    const ic = {
      accueil: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      formats: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
      dossiers: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      pub: 'M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6',
      son: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      texte: 'M5 6h14M12 6v12M8 18h8'
    };
    const nav = [['accueil', 'Accueil'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs'], ['alertes', 'Alertes'], ['dossiers', 'Dossiers']]
      .map((x, i) => ({ d: ic[x[0]], label: x[1], cur: i === 1 ? 'page' : 'false' }));
    let sections = [['radar', 'Vue d’ensemble', ''], ['formats', 'Vidéos', '2 542'], ['texte', 'Formats', '5'], ['createurs', 'Créateurs', '269']]
      .map((s, i) => ({ d: ic[s[0]], label: s[1], n: s[2], cur: i === 0 ? 'page' : 'false', bg: i === 0 ? 'var(--tab-on)' : 'transparent', ink: i === 0 ? 'var(--ink)' : 'var(--ink-muted)', w: i === 0 ? 600 : 500 }));
    let W = [10.6, 9.8, 8.9, 8.5, 17.3, 18.4];
    let L = ['1 oct.', '8 oct.', '15 oct.', '22 oct.', '29 oct.', '5 nov.'];
    let vids = [
      ['t-navy', 'Who made this?', '2,6 M', '@ivylearns8', 'US', 'il y a 19 j'],
      ['t-plum', 'KISI KISI SOAL TKA UNTUK SMA', '2,6 M', '@ira.belajaryuk', 'ID', 'il y a 26 j'],
      ['t-pine', 'TKA SMP mapel apa saja', '2,3 M', '@studywithruney', 'ID', 'il y a 12 j'],
      ['t-violet', 'TKA SD kelas 6 persiapannya bisa dimulai disini', '2,0 M', '@belajarbersamaespi', 'ID', 'il y a 5 j'],
      ['t-amber', 'Rahasia para guru akhirnya bocor!', '1,9 M', '@belajarbarengjames', 'ID', 'il y a 30 j'],
      ['t-umber', 'POV: tienes EXAMEN ORAL y no has estudiado NADA', '1,9 M', '@learnwithjoel1', 'ES', 'il y a 4 j']
    ].map((v, i) => ({ t: v[0], hook: v[1], v: v[2], h: v[3], mk: v[4], age: v[5], src: ["/media/app/v-7700392351268752661.jpg", "/media/app/v-7697654738124442896.jpg", "/media/app/v-7702743575934684437.jpg", "/media/app/v-7705368869250075925.jpg", "/media/app/v-7696248791560703252.jpg", "/media/app/v-7705929733220994337.jpg"][i] }));
    let formats = [
      [ic.texte, '« Je supprime cette vidéo dans 24 h »', 'La même idée en vietnamien chez Astra AI et en allemand chez Retain Cards', '1 226×', '809 k vues'],
      [ic.texte, '« TRATA ESTE VÍDEO COMO QUERES QUE SEJAM AS TUAS NOTAS »', 'Portugais · 4 comptes', '11× en médiane', '2 reprises sur 4'],
      [ic.texte, '« GUARDA E PARTILHA »', 'Portugais · 3 comptes', '17× en médiane', '3 reprises sur 4'],
      [ic.son, 'Son « exam vibes »', '5 comptes · le son de la révision qui stresse', '7× en médiane', '4 reprises sur 6']
    ].map((f) => ({ icon: f[0], t: f[1], meta: f[2], x: f[3], ok: f[4] }));
    let mk = [['ID', 'Indonésie et Vietnam', 37.47], ['US', 'États-Unis', 10.73], ['ES', 'Espagne', 4.83], ['BR', 'Brésil et Portugal', 2.91], ['FR', 'France', 1.32], ['MX', 'Amérique latine', 0.39]]
      .map((m, i) => ({ c: m[0], l: m[1], v: m[2].toFixed(1).replace('.', ',') + ' M', p: Math.round(m[2] / 57.65 * 100) + ' %', w: (m[2] / 57.65 * 100).toFixed(1) + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' }));
    let creators = [
      ['I', '@ivylearns8', 'Student life + study tips', 'US', '3,1 k', '4,9 M', '17,9 k', 'var(--thumb-navy)'],
      ['I', '@ira.belajaryuk', 'belajar bareng yuk', 'ID', '4,2 k', '3,3 M', '550', 'var(--thumb-plum)'],
      ['L', '@learnwithjoel1', 'IG: joel.c.b', 'ES', '12,2 k', '3,2 M', '28,5 k', 'var(--thumb-umber)'],
      ['S', '@studywithruney', 'Study tips buat dapetin nilai tinggi', 'ID', '2,4 k', '2,7 M', '418', 'var(--thumb-pine)'],
      ['S', '@studyclubbyinda', 'Studytok Yapping Club', 'ID', '26,4 k', '2,3 M', '4,6 k', 'var(--thumb-violet)'],
      ['B', '@belajarbersamaespi', 'student tips, productivity, & tech', 'ID', '6,5 k', '2,0 M', '855', 'var(--thumb-amber)']
    ].map((c) => { const av = {"@belajarbersamaespi": "/media/app/av-belajarbersamaespi.jpg", "@ira.belajaryuk": "/media/app/av-ira.belajaryuk.jpg", "@learnwithjoel1": "/media/app/av-learnwithjoel1.jpg", "@studyclubbyinda": "/media/app/av-studyclubbyinda.jpg", "@studywithruney": "/media/app/av-studywithruney.jpg"}[c[1]] || false; return { ini: c[0], h: c[1], bio: c[2], mk: c[3], fans: c[4], v: c[5], med: c[6], bg: c[7], av, noav: !av }; });
    // L'en-tête et les chiffres de l'exemple (le canevas n'a pas de données).
    let app = { icon: "/media/app/app-astra-ai.jpg", name: 'Astra AI', niche: 'Études', delta: '+6 % cette semaine', since: '06/11',
      store: 'https://apps.apple.com/fr/app/astra-ai-r%C3%A9vision-examens/id6751030141', play: 'https://play.google.com/store/search?q=Astra%20AI&c=apps',
      v30: '57,7 M', ig: 'dont 2,8 M sur Instagram', week: '18,4 M', wd: "+6 % face à la semaine d'avant",
      acc: '269', ppw: '1 360', best: '2 333×', top10: '43 % des vues', vidsHref: '/app/videos/7705929733220994337', crLabel: 'Tous les créateurs' };
    let top = 20;
    // Le tableau de bord du haut de la fiche : mêmes entrées pour l'exemple et pour le Radar.
    let src = { views30: 57.7e6, ig: 2.8e6, weekDelta: 0.06, accounts: 269, ppw: 1360, bestX: 2333, top10: 0.43, videoCount: 2552,
      rank: 1, rankOf: 5, share: 0.41, scope: 'Études', top: null };

    // Sur le site : la fiche de l'app depuis le Radar (document « app:<slug> », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.name) {
      const M = { FR: 'France', US: 'États-Unis et anglophones', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', XX: 'Autres langues' };
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %';
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? "aujourd'hui" : 'il y a ' + d + ' j'; };
      app = {
        icon: D.icon || '', noIcon: !D.icon, name: D.name, niche: D.niche, delta: D.weekDelta === null ? '' : pct(D.weekDelta) + ' cette semaine', since: day(D.trackedSince),
        store: D.store || '', play: 'https://play.google.com/store/search?q=' + encodeURIComponent(D.name) + '&c=apps',
        v30: nf(D.views30), ig: D.views30Ig > 0 ? 'dont ' + nf(D.views30Ig) + ' sur Instagram' : 'vidéos publiées ces 30 jours',
        week: nf(D.weeks[5]),
        wd: D.weekDelta === null ? 'première semaine relevée' : pct(D.weekDelta) + " face à la semaine d'avant",
        acc: D.accounts.toLocaleString('fr-FR'), ppw: D.videosPerWeek.toLocaleString('fr-FR'), best: D.bestX ? xf(D.bestX) : '—',
        top10: D.top10Share === null ? '—' : Math.round(D.top10Share * 100) + ' % des vues',
        vidsHref: D.videos.length ? '/app/videos/' + D.videos[0].id : '/app/videos/7705929733220994337',
        crLabel: 'Tous les créateurs'
      };
      const scale = Math.max.apply(null, D.weeks) || 1;
      top = Math.max(1, Math.ceil(scale / 1e6 / 2) * 2);
      W = D.weeks.map((w) => w / 1e6);
      L = D.weeks.map((_, j) => day(D.updatedAt - (6 - j) * 7 * 86400000));
      const T = ['t-navy', 't-plum', 't-pine', 't-violet', 't-amber', 't-umber'];
      vids = D.videos.slice(0, 6).map((v, i) => ({ t: T[i % T.length], hook: v.hook || '', v: nf(v.views), h: '@' + v.handle, mk: '', age: ago(v.publishedAt), src: v.cover || '', href: '/app/videos/' + v.id }));
      formats = D.formats.map((f) => ({ icon: f.kind === 'sound' ? ic.son : ic.texte, t: f.kind === 'sound' ? 'Son « ' + f.label + ' »' : '« ' + f.label + ' »',
        meta: f.accounts + ' comptes', x: f.medX ? xf(f.medX) + ' en médiane' : '', ok: nf(f.maxViews) + ' vues au mieux', href: '/app/formats/' + f.id }));
      mk = D.markets.map(([c, p], i) => ({ c: c === 'XX' ? '…' : c, l: M[c] || c, v: nf(D.views30 * p / 100), p: p + ' %', w: p + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' }));
      creators = D.creators.slice(0, 6).map((c) => ({ ini: c.handle.charAt(0).toUpperCase(), h: '@' + c.handle, bio: '', mk: c.market === 'XX' ? '…' : c.market, fans: nf(c.fans), v: String(c.posts7d),
        med: c.median ? nf(c.median) : '—', bg: 'var(--thumb-navy)', av: c.avatar || '', noav: true, page: !!c.page, href: '/app/createurs/' + c.handle }));
      sections = sections.map((x, i) => Object.assign({}, x, { n: ['', String(D.videoCount || D.videos.length), String(D.formats.length), D.accounts.toLocaleString('fr-FR')][i] }));
      // Rang : dans sa niche (document « apps », toujours chargé), sinon parmi toutes les apps du Radar.
      const all = (this.props.get && this.props.get('apps')) || null;
      const list = all && all.apps ? all.apps : [];
      let pool = list.filter((a) => a.niche === D.niche);
      const inNiche = D.niche && D.niche !== 'Autres' && pool.length >= 2;
      if (!inNiche) pool = list;
      pool = [...pool].sort((a, b) => b.views30 - a.views30);
      const sum = pool.reduce((s, a) => s + (a.views30 || 0), 0);
      const t0 = D.videos[0];
      src = { views30: D.views30, ig: D.views30Ig || 0, weekDelta: D.weekDelta, accounts: D.accounts, ppw: D.videosPerWeek, bestX: D.bestX,
        top10: D.top10Share, videoCount: D.videoCount || D.videos.length,
        rank: pool.length ? pool.findIndex((a) => a.slug === D.slug) + 1 : 0, rankOf: pool.length, share: sum ? D.views30 / sum : 0,
        scope: inNiche ? D.niche : '', top: t0 ? { cover: t0.cover || '', views: t0.views, handle: t0.handle, x: t0.x, at: t0.publishedAt, href: '/app/videos/' + t0.id } : null };
    }
    // ── Tableau de bord ──
    const nfD = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const xfD = (x) => (x >= 100 ? grp(x) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const wk = W.map((v) => v * 1e6);
    const wTop = Math.max(1, ...wk) * 1.22;
    const hatch = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 7px), rgba(255,255,255,0.03)';
    const mean = wk.reduce((s, v) => s + v, 0) / (wk.length || 1);
    const dash = {
      v30: nfD(src.views30),
      v30Sub: 'vues sur 30 jours' + (src.ig > 0 ? ', dont ' + nfD(src.ig) + ' sur Instagram' : ''),
      delta: src.weekDelta === null ? '' : (src.weekDelta >= 0 ? '+' : '−') + Math.round(Math.abs(src.weekDelta) * 100) + ' % cette semaine',
      deltaBg: src.weekDelta >= 0 ? 'rgba(76,154,255,0.16)' : 'rgba(255,255,255,0.09)', deltaInk: src.weekDelta >= 0 ? '#4C9AFF' : '#E6E9EF',
      weeks: wk.map((v, i) => {
        const now = i === wk.length - 1;
        const prev = i ? wk[i - 1] : 0;
        const noise = Math.max(v, prev) < Math.max(...wk) * 0.08; // deux semaines quasi vides : la variation ne dit rien
        const r = prev > 0 && !noise ? v / prev : null;
        const chip = r === null ? '' : r >= 2 ? '×' + (Math.round(r * 10) / 10).toString().replace('.', ',') : (r >= 1 ? '+' : '−') + Math.round(Math.abs(r - 1) * 100) + ' %';
        const up = r !== null && r >= 1;
        return { isNow: now, val: nfD(v), title: (now ? 'Cette semaine' : 'Semaine du ' + L[i]) + ' : ' + nfD(v) + ' vues',
          label: now ? 'Cette sem.' : L[i], pct: ((v / wTop) * 100).toFixed(1),
          bg: now ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : hatch,
          shadow: now ? '0 14px 34px rgba(11,111,224,0.45), inset 0 1px 0 rgba(255,255,255,0.35)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          chip, chipBg: up ? 'rgba(76,154,255,0.16)' : 'rgba(255,255,255,0.09)', chipInk: up ? '#4C9AFF' : '#E6E9EF',
          fw: now ? '600' : '400', labelInk: now ? '#FFFFFF' : '#8A93A3' };
      }),
      avgPct: ((mean / wTop) * 100).toFixed(1), avgLabel: nfD(mean),
      shareLabel: src.scope ? 'Part de sa niche' : 'Part du Radar', share: src.share > 0 && src.share < 0.005 ? '< 1 %' : Math.round(src.share * 100) + ' %', shareW: Math.min(100, Math.round(src.share * 100)) + '%',
      rank: src.rank ? 'N°' + src.rank : '—', rankOf: src.rank ? 'sur ' + src.rankOf + ' apps ' + (src.scope ? 'de ' + src.scope : 'du Radar') : '',
      rankBadge: src.scope && src.rank && src.rank <= 3 ? 'N°' + src.rank + ' de sa niche' : '',
      acc: grp(src.accounts), accLabel: src.accounts > 1 ? 'comptes' : 'compte', ppw: grp(src.ppw) + ' vidéos / sem.',
      hasTop10: src.top10 !== null && src.accounts > 10, top10: Math.round((src.top10 || 0) * 100) + ' %', top10W: Math.round((src.top10 || 0) * 100) + '%',
      othersLine: 'Les ' + (src.accounts - 10) + ' autres : ' + (100 - Math.round((src.top10 || 0) * 100)) + ' %',
      hasTop: !!src.top || !(this.props && this.props.data),
      top: src.top ? { cover: src.top.cover, href: src.top.href, views: nfD(src.top.views) + ' vues', x: src.top.x ? xfD(src.top.x) + ' sa normale' : '',
        who: '@' + src.top.handle + ' · ' + new Date(src.top.at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), aria: 'Lire la vidéo de @' + src.top.handle }
        : { cover: vids[0] ? vids[0].src : '', href: '/app/videos/7705929733220994337', views: vids[0] ? vids[0].v + ' vues' : '', x: '', who: vids[0] ? vids[0].h : '', aria: 'Lire la vidéo' },
      vid30: grp(src.videoCount), best: src.bestX ? xfD(src.bestX) : '—',
    };

    vids = vids.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v));
    formats = formats.map((f) => Object.assign({ href: '/app/formats' }, f));
    creators = creators.map((c) => Object.assign({ page: true, href: '/app/createurs/zinedine.gsbb' }, c));

    const P = W.map((v, j) => [70 + j * 110, 200 - v / top * 180]);
    const line = 'M' + P.map((p) => p[0] + ' ' + p[1].toFixed(1)).join(' L');
    const chart = {
      line, area: line + ' L620 200 L70 200 Z', top: top + ' M', mid: (top / 2).toString().replace('.', ',') + ' M',
      aria: 'Vues par semaine de publication sur 6 semaines : ' + W.map((w) => w.toFixed(1).replace('.', ',')).join(' ; ') + ' millions',
      pts: P.map((p, j) => ({ x: p[0], y: p[1].toFixed(1), ty: (p[1] - 14).toFixed(1), v: W[j].toFixed(1).replace('.', ',') + ' M', label: L[j], lx: j === 5 ? 636 : p[0], anchor: j === 5 ? 'end' : 'middle', r: j === 5 ? 6 : 4, fill: j === 5 ? '#4C9AFF' : '#0D111A', ink: j === 5 ? '#FFFFFF' : '#9AA3B2', fw: j === 5 ? 700 : 500 }))
    };
    return { nav, sections, chart, vids, formats, mk, creators, app, dash };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1960px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
        $h("aside", { "aria-label": "Sections de la fiche", "style": "flex: 0 0 248px; box-sizing: border-box; padding: 24px 16px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px;" },
          $h("a", { "class": "sw-more", "href": "/app/apps", "style": "padding: 6px 10px 18px; font-size: 14px;" },
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M19 12H5M11 18l-6-6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          ($l($v.sections)).map((s) => [
            $h("a", { "href": s?.href, "aria-current": s?.cur, "style": `display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 12px; background: ${$t(s?.bg)}; color: ${$t(s?.ink)}; text-decoration: none; font-size: 14px; font-weight: ${$t(s?.w)};` },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": s?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "style": "flex: 1;" },
                $t(s?.label)
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                $t(s?.n)
              )
            )
          ]),
          $h("div", { "style": "margin-top: 22px; padding: 16px 12px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 10px;" },
            $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);" },
              "Dans tes dossiers"
            ),
            ($v.keptNone) ? [
              $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-muted);" },
                "Pas encore gardée."
              )
            ] : null,
            ($l($v.kept)).map((k) => [
              $h("a", { "class": "sw-link-quiet", "href": k?.href, "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; text-decoration: none;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                  $t(k?.name)
                )
              )
            ])
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; padding: 28px 32px 48px; display: flex; flex-direction: column; gap: 24px;" },
          $h("header", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;" },
            $h("div", { "style": "display: flex; gap: 18px; align-items: center;" },
              $h("span", { "class": "sw-app-icon", "style": "width: 72px; height: 72px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; background: var(--track); box-shadow: 0 14px 30px rgba(0,0,0,0.45);" },
                ($v.app?.icon) ? [
                  $h("img", { "class": "sw-logo-img", "src": $v.app?.icon, "alt": "", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.app?.noIcon) ? [
                  $h("svg", { "width": "30", "height": "30", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                  )
                ] : null
              ),
              $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                $h("div", { "style": "display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" },
                  $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                    $t($v.app?.name)
                  ),
                  $h("span", { "class": "sw-badge" },
                    $t($v.app?.niche)
                  ),
                  ($v.dash?.rankBadge) ? [
                    $h("span", { "class": "sw-badge sw-badge-accent" },
                      $t($v.dash?.rankBadge)
                    )
                  ] : null
                ),
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--ink-muted);" },
                  "Dans le Radar depuis le ", $t($v.app?.since),
                  ($v.app?.store) ? [
                    $h("span", { "aria-hidden": "true" },
                      "·"
                    ),
                    $h("a", { "class": "sw-link-quiet", "href": $v.app?.store, "target": "_blank", "rel": "noopener" },
                      "App Store"
                    )
                  ] : null
                )
              )
            ),
            $h("div", { "style": "display: flex; gap: 8px; align-items: center;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.copyLink, "aria-label": $v.copyAria, "title": $v.copyAria, "style": `background: ${$t($v.copyBg)};` },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" })
                )
              ),
              $h("span", { "style": "position: relative; display: inline-flex;" },
                $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Garder dans un dossier", "title": "Garder", "style": "background: var(--track);" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                  )
                ),
                ($v.aj) ? [
                  $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                    $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                  )
                ] : null
              ),
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": $v.followOn },
                $t($v.followLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: 268px 268px; gap: 16px;" },
            $h("section", { "aria-labelledby": "fa-vr", "style": "grid-column: 1; grid-row: 1 / span 2; min-height: 0; display: flex; flex-direction: column; padding: 22px 24px 18px; border-radius: 24px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
                $h("h2", { "id": "fa-vr", "style": "margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -0.01em;" },
                  "Vues par semaine"
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--ink-faint); white-space: nowrap;" },
                  $h("span", { "aria-hidden": "true", "style": "width: 18px; border-top: 1.5px dashed rgba(255,255,255,0.4);" }),
                  "MOYENNE ", $t($v.dash?.avgLabel)
                )
              ),
              $h("div", { "style": "display: flex; align-items: flex-end; gap: 14px; margin-top: 14px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 54px; line-height: 0.95; font-weight: 700; letter-spacing: -0.05em; white-space: nowrap;" },
                  $t($v.dash?.v30)
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; padding-bottom: 4px;" },
                  ($v.dash?.delta) ? [
                    $h("span", { "style": `align-self: flex-start; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: ${$t($v.dash?.deltaBg)}; font-size: 12px; font-weight: 600; color: ${$t($v.dash?.deltaInk)};` },
                      $t($v.dash?.delta)
                    )
                  ] : null,
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t($v.dash?.v30Sub)
                  )
                )
              ),
              $h("div", { "style": "position: relative; flex: 1; min-height: 0; margin-top: 18px; display: flex; align-items: stretch; gap: 14px;" },
                $h("span", { "aria-hidden": "true", "style": `position: absolute; left: 0; right: 0; bottom: ${$t($v.dash?.avgPct)}%; border-top: 1.5px dashed rgba(255,255,255,0.28);` }),
                ($l($v.dash?.weeks)).map((w) => [
                  $h("div", { "style": "flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 8px;" },
                    (w?.isNow) ? [
                      $h("span", { "style": "padding: 5px 10px; border-radius: 10px; background: #161B26; box-shadow: 0 8px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.10); font-family: var(--font-display); font-size: 15px; font-weight: 700; white-space: nowrap;" },
                        $t(w?.val)
                      )
                    ] : null,
                    (w?.chip) ? [
                      $h("span", { "style": `display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; background: ${$t(w?.chipBg)}; font-size: 12px; font-weight: 600; color: ${$t(w?.chipInk)};` },
                        $t(w?.chip)
                      )
                    ] : null,
                    $h("span", { "title": w?.title, "style": `display: block; width: 100%; height: ${$t(w?.pct)}%; min-height: 6px; border-radius: 14px; background: ${$t(w?.bg)}; box-shadow: ${$t(w?.shadow)};` })
                  )
                ])
              ),
              $h("div", { "style": "display: flex; gap: 14px; margin-top: 10px;" },
                ($l($v.dash?.weeks)).map((w) => [
                  $h("span", { "style": `flex: 1; text-align: center; white-space: nowrap; font-size: 12px; font-weight: ${$t(w?.fw)}; color: ${$t(w?.labelInk)};` },
                    $t(w?.label)
                  )
                ])
              )
            ),
            $h("section", { "aria-labelledby": "fa-place", "style": "grid-column: 2; grid-row: 1; min-height: 0; display: flex; flex-direction: column; padding: 22px 22px 20px; border-radius: 24px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("h2", { "id": "fa-place", "style": "margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -0.01em;" },
                "Sa place"
              ),
              $h("span", { "style": "margin-top: 12px; display: flex; align-items: baseline; gap: 8px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 40px; line-height: 1; font-weight: 700; letter-spacing: -0.045em;" },
                  $t($v.dash?.rank)
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  $t($v.dash?.rankOf)
                )
              ),
              $h("div", { "style": "margin-top: auto; display: flex; flex-direction: column; gap: 8px;" },
                $h("div", { "style": "display: flex; justify-content: space-between; gap: 10px; font-size: 13px; white-space: nowrap;" },
                  $h("span", { "style": "color: var(--ink-muted);" },
                    $t($v.dash?.shareLabel)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t($v.dash?.share)
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": "display: flex; height: 26px; border-radius: 9px; overflow: hidden; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 7px), rgba(255,255,255,0.025);" },
                  $h("span", { "style": `width: ${$t($v.dash?.shareW)}; border-radius: 9px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0);` })
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  "en vues sur 30 jours"
                )
              )
            ),
            $h("section", { "aria-labelledby": "fa-res", "style": "grid-column: 2; grid-row: 2; min-height: 0; display: flex; flex-direction: column; padding: 22px 22px 20px; border-radius: 24px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("h2", { "id": "fa-res", "style": "margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -0.01em;" },
                "Son réseau"
              ),
              $h("span", { "style": "margin-top: 12px; display: flex; align-items: baseline; gap: 8px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 40px; line-height: 1; font-weight: 700; letter-spacing: -0.045em;" },
                  $t($v.dash?.acc)
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  $t($v.dash?.accLabel)
                )
              ),
              $h("span", { "style": "margin-top: 8px; align-self: flex-start; display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; background: var(--accent-soft); font-size: 12px; font-weight: 600; color: var(--accent); white-space: nowrap;" },
                $t($v.dash?.ppw)
              ),
              ($v.dash?.hasTop10) ? [
                $h("div", { "style": "margin-top: auto; display: flex; flex-direction: column; gap: 8px;" },
                  $h("div", { "style": "display: flex; justify-content: space-between; gap: 10px; font-size: 13px; white-space: nowrap;" },
                    $h("span", { "style": "color: var(--ink-muted);" },
                      "Part des 10 premiers"
                    ),
                    $h("span", { "style": "font-weight: 600;" },
                      $t($v.dash?.top10)
                    )
                  ),
                  $h("span", { "aria-hidden": "true", "style": "display: flex; height: 26px; border-radius: 9px; overflow: hidden; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 7px), rgba(255,255,255,0.025);" },
                    $h("span", { "style": `width: ${$t($v.dash?.top10W)}; border-radius: 9px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0);` })
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t($v.dash?.othersLine)
                  )
                )
              ] : null
            ),
            $h("section", { "aria-labelledby": "fa-top", "style": "grid-column: 3; grid-row: 1 / span 2; min-height: 0; display: flex; flex-direction: column; gap: 14px; padding: 22px 22px 20px; border-radius: 24px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
                $h("h2", { "id": "fa-top", "style": "margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -0.01em;" },
                  "Sa vidéo n°1"
                ),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--ink-faint);" },
                  "30 JOURS"
                )
              ),
              ($v.dash?.hasTop) ? [
                $h("a", { "href": $v.dash?.top?.href, "aria-label": $v.dash?.top?.aria, "style": "position: relative; flex: 1; min-height: 0; display: block; border-radius: 18px; overflow: hidden; background: #0A0C12; text-decoration: none; color: #FFFFFF;" },
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
              $h("div", { "style": "margin-top: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--track);" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "Vidéos · 30 j"
                  ),
                  $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.dash?.vid30)
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--track);" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "Meilleure · 7 j"
                  ),
                  $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: var(--accent);" },
                    $t($v.dash?.best)
                  )
                )
              )
            )
          ),
          $h("section", { "aria-labelledby": "fa-vid", "style": "display: flex; flex-direction: column; gap: 14px;" },
            $h("div", { "class": "sw-card-head" },
              $h("h2", { "id": "fa-vid", "class": "sw-card-title" },
                "Leurs vidéos qui cartonnent"
              ),
              $h("a", { "class": "sw-more", "href": $v.app?.vidsHref },
                "Les regarder une par une",
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "style": "display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px;" },
              ($l($v.vids)).map((v) => [
                $h("a", { "href": v?.href, "style": "display: flex; flex-direction: column; gap: 8px; text-decoration: none;" },
                  $h("span", { "class": `sw-video ${$t(v?.t)}`, "style": "display: block;" },
                    $h("img", { "class": "sw-cover", "src": v?.src, "alt": v?.hook, "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-badge", "style": "position: absolute; top: 10px; left: 10px; height: 22px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                      $t(v?.age)
                    ),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views" },
                        $t(v?.v)
                      )
                    )
                  ),
                  $h("span", { "style": "display: flex; justify-content: space-between; gap: 6px; font-size: 12px;" },
                    $h("span", { "style": "color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                      $t(v?.h)
                    )
                  )
                )
              ])
            )
          ),
          $h("div", { "style": "display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px;" },
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-fmt", "style": "padding: 24px; display: flex; flex-direction: column;" },
              $h("div", { "class": "sw-card-head", "style": "margin-bottom: 8px;" },
                $h("h2", { "id": "fa-fmt", "class": "sw-card-title" },
                  "Les formats qui cartonnent chez eux"
                ),
                $h("a", { "class": "sw-more", "href": "/app/formats" },
                  "Tous les formats",
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($l($v.formats)).map((f) => [
                $h("a", { "href": f?.href, "style": "text-decoration: none; color: inherit; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 0; border-top: 1px solid var(--line);" },
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
                  $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                    $h("span", { "style": "font-family: var(--font-mono); font-size: 13px; color: var(--accent);" },
                      $t(f?.x)
                    ),
                    $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                      $t(f?.ok)
                    )
                  )
                )
              ])
            ),
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-mk", "style": "padding: 24px; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "class": "sw-card-head" },
                $h("h2", { "id": "fa-mk", "class": "sw-card-title" },
                  "Où leurs vues se font"
                ),
                $h("span", { "class": "sw-card-sub" },
                  "Vues 30 j"
                )
              ),
              ($l($v.mk)).map((m) => [
                $h("div", { "style": "display: grid; grid-template-columns: 28px minmax(0, 1fr) 60px; gap: 12px; align-items: center;" },
                  $h("span", { "class": "sw-flag", "style": "width: 28px;" },
                    $t(m?.c)
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "display: flex; justify-content: space-between; font-size: 13px;" },
                      $h("span", { "style": "color: var(--ink-soft);" },
                        $t(m?.l)
                      ),
                      $h("span", { "style": "color: var(--ink-faint);" },
                        $t(m?.v)
                      )
                    ),
                    $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                      $h("span", { "style": `display: block; height: 6px; width: ${$t(m?.w)}; background: ${$t(m?.bg)}; border-radius: 3px;` })
                    )
                  ),
                  $h("span", { "style": "text-align: right; font-family: var(--font-display); font-size: 17px; font-weight: 700;" },
                    $t(m?.p)
                  )
                )
              ])
            )
          ),
          $h("section", { "class": "sw-card", "aria-labelledby": "fa-cr", "style": "padding: 8px 24px 12px;" },
            $h("div", { "class": "sw-card-head", "style": "padding: 16px 0 6px;" },
              $h("h2", { "id": "fa-cr", "class": "sw-card-title" },
                "Les créateurs qui le poussent"
              ),
              $h("a", { "class": "sw-more", "href": "/app/createurs" },
                $t($v.app?.crLabel),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("table", { "class": "sw-table" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "style": "padding-left: 0;" },
                    "Compte"
                  ),
                  $h("th", null,
                    "Marché"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Abonnés"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Vidéos 7 j"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Vues d'habitude"
                  ),
                  $h("th", { "class": "sw-num", "style": "padding-right: 0;" })
                )
              ),
              $h("tbody", null,
                ($l($v.creators)).map((c) => [
                  $h("tr", null,
                    $h("td", { "style": "padding-left: 0;" },
                      $h("span", { "class": "sw-app" },
                        $h("span", { "style": "position: relative; width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #1B2333; border: 1px solid var(--line); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                          (c?.av) ? [
                            $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.noav) ? [
                            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                              $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(c?.h)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(c?.bio)
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "class": "sw-flag" },
                        $t(c?.mk)
                      )
                    ),
                    $h("td", { "class": "sw-num", "style": "color: var(--ink-soft); font-weight: 500;" },
                      $t(c?.fans)
                    ),
                    $h("td", { "class": "sw-num" },
                      $t(c?.v)
                    ),
                    $h("td", { "class": "sw-num", "style": "color: var(--ink-soft); font-weight: 500;" },
                      $t(c?.med)
                    ),
                    $h("td", { "class": "sw-num", "style": "padding-right: 0;" },
                      (c?.page) ? [
                        $h("a", { "class": "sw-more", "href": c?.href, "style": "justify-content: flex-end; color: var(--accent);" },
                          "Voir la fiche",
                          $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      ] : null
                    )
                  )
                ])
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
