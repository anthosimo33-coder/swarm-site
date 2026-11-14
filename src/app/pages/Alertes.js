// Généré par scripts/dc2preact.py depuis design/app/AlertesA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import NouvelleAlerte from './NouvelleAlerte.js';
import Palette from './Palette.js';

export default class Alertes extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'alertes' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    // Ce que la personne garde (saved) : ses alertes (alertRules) et le moment de « Tout marquer comme lu » (seen).
    // Sur le canevas, ces props n'existent pas : état local, avec les alertes d'exemple.
    const site = typeof P.saved === 'function' && typeof P.save === 'function';
    const rulesV = site ? P.saved('alertRules') : st.rules;
    const rulesWait = site && rulesV === undefined;
    const mine = Array.isArray(rulesV) ? rulesV.filter((r) => r && typeof r === 'object') : site ? [] : b.sampleRules;
    const seenV = site ? P.saved('seen') : st.seen;
    const seenAt = seenV && typeof seenV.alerts === 'number' ? seenV.alerts : null;
    const keepRules = (xs) => (site ? P.save('alertRules', xs) : this.setState({ rules: xs }));
    // Une alerte = { id, createdAt, quoi: 'compte'|'video'|'format', niche: nom|null, seuil: nombre, marche: code|null }.
    const SL = { compte: [[10, '10×'], [100, '100×'], [1000, '1 000×']], video: [[5e5, '500 k'], [1e6, '1 M'], [5e6, '5 M']], format: [[3, '3'], [5, '5'], [10, '10']] };
    const sl = (r) => { const m = (SL[r.quoi] || []).filter((x) => x[0] === r.seuil)[0]; return m ? m[1] : String(r.seuil); };
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays, pas de « autres langues »
    const MKL = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
    const ICO = { compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', video: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', format: 'M5 6h14M12 6v13M9 19h6' };
    const known = (r) => !!SL[r.quoi] && typeof r.seuil === 'number';
    const titleOf = (r) => (!known(r) ? String(r.t || 'Alerte') : r.quoi === 'compte' ? 'Un compte fait ' + sl(r) + ' sa normale'
      : r.quoi === 'video' ? 'Une vidéo d’app passe ' + sl(r) + ' de vues' : 'Un format repris par ' + sl(r) + ' comptes ou plus');
    const subOf = (r) => (!known(r) ? String(r.s || '') : (r.niche || 'Toutes niches') + ' · ' + (MKL[r.marche] || 'tous les marchés'));
    // Une alerte de la semaine répond-elle à une alerte de la personne ? Sur le canevas, l'exemple dit à quelle alerte il répond.
    // null : on ne sait pas encore (niche d'une vidéo tant que le document « apps » charge).
    const match = (r, a) => {
      if (!known(r)) return false;
      if (a.kind === undefined) return a.rule === titleOf(r);
      if (r.marche && a.market !== r.marche) return false;
      if (r.quoi === 'format' ? !(a.kind === 'format' && a.accounts >= r.seuil)
        : r.quoi === 'video' ? !(a.kind === 'video' && !!a.slug && a.views >= r.seuil)
        : !(a.kind === 'video' && a.x >= r.seuil)) return false;
      if (!r.niche) return true;
      const n = b.nicheOf ? b.nicheOf(a) : null;
      return n === null ? null : n === r.niche;
    };
    const items = b.items || [];
    const hits = (r) => items.filter((a) => match(r, a) === true);
    const unsure = (r) => items.some((a) => match(r, a) === null);
    const mineOn = !!st.mine && mine.length > 0;
    const isMine = (a) => mine.some((r) => match(r, a) === true);
    const tab = st.tab || 'Toutes';
    const TABS = [['Toutes', () => true], ['Formats', (a) => a.typ === 'Format' || a.typ === 'Son'], ['Vidéos', (a) => a.typ === 'Vidéo'], ['Comptes', (a) => a.typ === 'Compte']];
    const pool = mineOn ? items.filter(isMine) : items;
    const keep = (TABS.filter((t) => t[0] === tab)[0] || TABS[0])[1];
    // Non lu : publié après « Tout marquer comme lu » ; sans rien d'enregistré, ce qui date d'aujourd'hui ou d'hier.
    const unread = (a) => (seenAt !== null ? !!a.at && a.at > seenAt : !!a.unread);
    const groups = [];
    pool.filter(keep).forEach((a) => {
      const u = unread(a);
      const it = Object.assign({}, a, { dot: u ? 'var(--accent)' : 'transparent', bg: u ? 'var(--accent-soft)' : 'transparent', w: u ? '700' : '600' });
      if (!groups.length || groups[groups.length - 1].g !== a.g) groups.push({ g: a.g, items: [] });
      groups[groups.length - 1].items.push(it);
    });
    // Le nombre d'une alerte compte les alertes listées ici (document « alerts » : 40 vidéos et 20 formats au plus), pas toute la semaine.
    const count = (r) => { if (!known(r) || unsure(r)) return ''; const c = hits(r).length;
      return c === 0 ? 'Aucune parmi les alertes' : c + ' parmi les alertes'; };
    const editId = st.na ? st.editId || null : null;
    const rules = mine.map((r) => ({ t: titleOf(r), s: subOf(r), n: count(r), ico: ICO[r.quoi] || ICO.format,
      edit: () => this.setState({ na: true, editId: r.id }),
      remove: () => keepRules(mine.filter((x) => x !== r)) }));
    const same = (p, q) => p.quoi === q.quoi && (p.niche || null) === (q.niche || null) && p.seuil === q.seuil && (p.marche || null) === (q.marche || null);
    const kindN = (r, n) => n + (r.quoi === 'format' ? (n > 1 ? ' formats' : ' format') : (n > 1 ? ' vidéos' : ' vidéo'));
    const TABIC = { Toutes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0', Formats: 'M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4', 'Vidéos': 'M4 5h16v14H4zM10 9l5 3-5 3z', Comptes: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' };
    return {
      groups, rules, hasRules: mine.length > 0, noRules: !rulesWait && mine.length === 0,
      subtitle: mineOn ? 'Ce que le Radar a repéré cette semaine, selon tes alertes.' : 'Ce que le Radar a repéré cette semaine.',
      noAlert: groups.length === 0, noAlertText: mineOn ? 'Rien cette semaine pour tes alertes' + (tab === 'Toutes' ? '.' : ' dans ce type.') : 'Aucune alerte de ce type cette semaine.',
      tabs: TABS.map((t) => ({ l: t[0], d: TABIC[t[0]] || TABIC.Toutes, n: pool.filter(t[1]).length, on: t[0] === tab ? 'true' : 'false', bg: t[0] === tab ? 'rgba(255,255,255,0.10)' : 'transparent', ink: t[0] === tab ? 'var(--ink)' : 'var(--ink-muted)', fw: t[0] === tab ? '600' : '500', ic: t[0] === tab ? 'var(--accent)' : 'var(--ink-faint)', pick: () => this.setState({ tab: t[0] }) })),
      mineOn: mineOn ? 'true' : 'false', toggleMine: () => this.setState({ mine: !mineOn }),
      hasUnread: items.some(unread),
      markRead: () => { const v = Object.assign({}, seenV || {}, { alerts: Date.now() }); if (site) P.save('seen', v); else this.setState({ seen: v }); },
      na: !!st.na, openNa: () => this.setState({ na: true, editId: null }), closeNa: () => this.setState({ na: false, editId: null }),
      naRule: editId ? mine.filter((r) => r.id === editId)[0] || null : null,
      naNiches: b.niches || null,
      // Ce que l'alerte en cours de réglage trouve dans les alertes de la semaine (aperçu de « Nouvelle alerte »).
      naPreview: (r) => { if (unsure(r)) return null; const xs = hits(r);
        return { text: xs.length ? kindN(r, xs.length) : 'Aucune pour ces critères', hits: xs.filter((a) => a.covs && a.covs[0] && a.covs[0].src).slice(0, 3).map((a) => ({ src: a.covs[0].src, x: a.big })) }; },
      addRule: (f) => {
        const r = { quoi: f.quoi, niche: f.niche || null, seuil: f.seuil, marche: f.marche || null };
        const now = Date.now();
        if (editId) keepRules(mine.map((x) => (x.id === editId ? Object.assign({}, x, r) : x)));
        else if (!mine.some((x) => same(x, r))) keepRules([Object.assign({ id: now.toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now }, r)].concat(mine));
      }
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "page"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    let groups = [{"g": "Aujourd’hui", "items": [{"group": "Aujourd’hui", "when": "12/11", "typ": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "title": "Un son se répète : « original sound - ex7stence »", "sub": "RecentFollow · 3 comptes · États-Unis et Mexique", "big": "3,2×", "covs": [{"src": "/media/app/v-7704011591062261023.jpg"}, {"src": "/media/app/v-7707075093578419476.jpg"}, {"src": "/media/app/v-7704407707469630741.jpg"}], "cov0": "/media/app/v-7704011591062261023.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats", "cta": "Voir le format"}]}, {"g": "Hier", "items": [{"group": "Hier", "when": "11/11", "typ": "Format", "ico": "M5 6h14M12 6v13M9 19h6", "title": "Une accroche se répète : « POV: terminaste de estudiar 4 horas antes… »", "sub": "Retain Cards · Mexique · 7 reprises sur 11 au-dessus de leur normale", "big": "4,7×", "covs": [{"src": "/media/app/v-7702846481736174868.jpg"}, {"src": "/media/app/v-7704563725029674262.jpg"}, {"src": "/media/app/v-7706045051574488342.jpg"}], "cov0": "/media/app/v-7702846481736174868.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats", "cta": "Voir le format"}, {"group": "Hier", "when": "11/11", "typ": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "title": "Un son se répète : « exam vibes »", "sub": "Astra AI · 4 reprises sur 6 au-dessus de leur normale", "big": "7×", "covs": [{"src": "/media/app/v-7704417260647025953.jpg"}, {"src": "/media/app/v-7706993521584098593.jpg"}, {"src": "/media/app/v-7705514449699966241.jpg"}], "cov0": "/media/app/v-7704417260647025953.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats", "cta": "Voir le format"}]}, {"g": "Lundi 10/11", "items": [{"group": "Lundi 10/11", "when": "10/11 · 17 h", "typ": "Format", "ico": "M5 6h14M12 6v13M9 19h6", "title": "« Ich lösche das in 2h‼️ » : 4e reprise, et la meilleure", "sub": "@studywithdenise · 106 k vues · Retain Cards · Allemagne", "big": "39×", "covs": [{"src": "/media/app/v-7706579888727231777.jpg"}, {"src": "/media/app/v-7705712961511263521.jpg"}, {"src": "/media/app/v-7705122381735513376.jpg"}], "cov0": "/media/app/v-7706579888727231777.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/formats", "cta": "Voir le format"}]}, {"g": "Dimanche 09/11", "items": [{"group": "Dimanche 09/11", "when": "09/11 · 10 h", "typ": "Compte", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "title": "@hocba.tapsu fait 455× sa normale", "sub": "Astra AI · Indonésie · 1,2 M vues", "big": "455×", "covs": [{"src": "/media/app/v-7706101547570171143.jpg"}], "cov0": "/media/app/v-7706101547570171143.jpg", "rule": "Un compte fait 100× sa normale", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/createurs/zinedine.gsbb", "cta": "Voir le compte"}, {"group": "Dimanche 09/11", "when": "09/11 · 04 h", "typ": "Compte", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "title": "@studywith_elsie fait 1 226× sa normale", "sub": "Astra AI · 572 abonnés · 809 k vues", "big": "1 226×", "covs": [{"src": "/media/app/v-7706010190566542612.jpg"}], "cov0": "/media/app/v-7706010190566542612.jpg", "rule": "Un compte fait 100× sa normale", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/createurs/zinedine.gsbb", "cta": "Voir le compte"}]}, {"g": "Samedi 08/11", "items": [{"group": "Samedi 08/11", "when": "08/11 · 23 h", "typ": "Vidéo", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "title": "Une vidéo d’Astra AI passe 1 M de vues", "sub": "@learnwithjoel1 · Espagne · 65× sa normale", "big": "1,87 M", "covs": [{"src": "/media/app/v-7705929733220994337.jpg"}], "cov0": "/media/app/v-7705929733220994337.jpg", "rule": "Une vidéo d’app passe 1 M de vues", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/videos/7705929733220994337", "cta": "Voir la vidéo"}]}, {"g": "Vendredi 07/11", "items": [{"group": "Vendredi 07/11", "when": "07/11 · 11 h", "typ": "Vidéo", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "title": "Une vidéo d’Astra AI passe 1 M de vues", "sub": "@belajarbersamaespi · Indonésie · 2 333× sa normale", "big": "1,99 M", "covs": [{"src": "/media/app/v-7705368869250075925.jpg"}], "cov0": "/media/app/v-7705368869250075925.jpg", "rule": "Une vidéo d’app passe 1 M de vues", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/videos/7705929733220994337", "cta": "Voir la vidéo"}]}];
    // Alertes d'exemple (canevas) : même forme que celles enregistrées (saved('alertRules')).
    const sampleRules = [{ id: 'ex1', createdAt: 0, quoi: 'format', niche: null, seuil: 3, marche: null },
      { id: 'ex2', createdAt: 0, quoi: 'video', niche: 'Études', seuil: 1e6, marche: null },
      { id: 'ex3', createdAt: 0, quoi: 'compte', niche: null, seuil: 100, marche: null }];
    let niches = null;
    let nicheOf = null;
    // Sur le site : les alertes du Radar (document « alerts », convex/radarModels.ts) : les vidéos de la semaine
    // qui font le plus de fois leur normale, et les formats apparus cette semaine. Rangées par jour de publication
    // (dernière reprise pour un format) ; non lues par défaut = celles d'aujourd'hui et d'hier (voir extraVals).
    const D = this.props && this.props.data;
    if (D && D.videos) {
      const M = { FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' };
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '').replace('.', ',') + '\u202fM' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fk' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const de = (n) => (/^[aeiouyhàâäéèêëîïôöùûü]/i.test(n) ? 'd’' : 'de ') + n;
      const ICO = { video: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
        hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
      const day0 = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
      const today = day0(Date.now());
      const ago = (ms) => Math.max(0, Math.round((today - day0(ms)) / 86400000));
      const dayLabel = (ms) => { const k = ago(ms); if (k === 0) return 'Aujourd’hui'; if (k === 1) return 'Hier';
        const s = new Date(ms).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }); return s.charAt(0).toUpperCase() + s.slice(1); };
      const when = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' · ' + String(new Date(ms).getHours()).padStart(2, '0') + '\u202fh';
      const items = [];
      D.videos.forEach((v) => {
        const app = v.app ? v.app.name : '';
        const mk = M[v.market] || '';
        const million = v.views >= 1e6;
        const acc = !million && v.x >= 100;
        const une = 'Une vidéo ' + (app ? de(app) + ' ' : '');
        items.push({ at: v.publishedAt, typ: acc ? 'Compte' : 'Vidéo', ico: acc ? ICO.compte : ICO.video,
          title: million ? une + 'passe ' + Math.floor(v.views / 1e6) + ' M de vues' : acc ? '@' + v.handle + ' fait ' + xf(v.x) + ' sa normale' : une + (v.x ? 'à ' + xf(v.x) + ' sa normale' : 'à ' + nf(v.views) + ' vues'),
          sub: (acc ? [app, mk, nf(v.views) + ' vues'] : ['@' + v.handle, mk, million && v.x ? xf(v.x) + ' sa normale' : nf(v.views) + ' vues']).filter(Boolean).join(' · '),
          big: million || !v.x ? nf(v.views) : xf(v.x), covs: v.cover ? [{ src: v.cover }] : [], href: '/app/videos/' + v.id,
          kind: 'video', views: v.views, x: v.x || 0, slug: v.app ? v.app.slug : '', market: v.market || '', paid: !!v.paid });
      });
      (D.formats || []).forEach((f) => {
        const names = (f.apps || []).filter(Boolean).map((a) => a.name);
        const appsL = names.length <= 3 ? names.slice(0, -1).join(', ') + (names.length > 1 ? ' et ' : '') + names.slice(-1) : names.slice(0, 2).join(', ') + ' et ' + (names.length - 2) + ' autres apps';
        items.push({ at: f.lastPostAt, typ: f.kind === 'sound' ? 'Son' : 'Format', ico: f.kind === 'sound' ? ICO.sound : ICO.hook,
          title: (f.kind === 'sound' ? 'Un son se répète : « ' : 'Une accroche se répète : « ') + f.label + ' »',
          sub: [appsL, M[f.market] || '', f.n ? f.wins + ' reprises sur ' + f.n + ' au-dessus de leur normale' : ''].filter(Boolean).join(' · '),
          // un format se mesure au nombre de comptes qui le reprennent (sa médiane × est souvent sous 1)
          big: f.accounts + ' comptes', covs: (f.members || []).filter((m) => m.cover).slice(0, 3).map((m) => ({ src: m.cover })), href: '/app/formats/' + f.id,
          kind: 'format', accounts: f.accounts, niche: f.niche || '', market: f.market || '' });
      });
      items.sort((p, q) => q.at - p.at);
      groups = [{ g: '', items: items.map((a) => Object.assign(a, { g: dayLabel(a.at), when: when(a.at), unread: ago(a.at) <= 1 })) }];
      // La niche d'une vidéo vient de son app (document « apps ») : tant qu'il charge, elle est inconnue (null).
      const A = this.props.get ? this.props.get('apps') : null;
      const NI = A && A.apps ? Object.fromEntries(A.apps.map((a) => [a.slug, a.niche || ''])) : null;
      nicheOf = (a) => (a.kind === 'format' ? a.niche : NI ? NI[a.slug] || '' : null);
      if (A && A.niches) niches = A.niches.slice().sort((p, q) => p.localeCompare(q, 'fr'));
    }
    const items = [].concat.apply([], groups.map((g) => g.items.map((a) => Object.assign({ g: g.g }, a))));
    return { nav, items, sampleRules, niches, nicheOf };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1100px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Alertes"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                $t($v.subtitle)
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
              ($v.hasUnread) ? [
                $h("button", { "class": "sw-more", "type": "button", "onClick": $v.markRead, "style": "border: 0; background: transparent; cursor: pointer; font-family: inherit;" },
                  "Tout marquer comme lu"
                )
              ] : null,
              $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.openNa },
                "Créer une alerte",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "margin: 24px 32px 0; padding: 12px 14px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "role": "tablist", "aria-label": "Type", "style": "display: flex; gap: 4px; flex-wrap: wrap;" },
              ($l($v.tabs)).map((t) => [
                $h("button", { "type": "button", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: ${$t(t?.bg)}; color: ${$t(t?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(t?.fw)}; cursor: pointer;` },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(t?.ic)};` },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.l),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(t?.n)
                  )
                )
              ])
            ),
            ($v.hasRules) ? [
              $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.mineOn, "onClick": $v.toggleMine, "style": "height: 36px; padding: 0 12px; border-radius: 10px; gap: 8px; font-size: 13px;" },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Selon tes alertes"
              )
            ] : null
          ),
          $h("div", { "style": "padding: 20px 32px 48px; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 18px;" },
              ($v.noAlert) ? [
                $h("p", { "style": "margin: 8px 14px; font-size: 15px; color: var(--ink-muted);" },
                  $t($v.noAlertText)
                )
              ] : null,
              ($l($v.groups)).map((g) => [
                $h("section", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "style": "margin: 0 0 6px 6px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--ink-muted);" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t(g?.g)
                  ),
                  ($l(g?.items)).map((a) => [
                    $h("a", { "href": a?.href, "style": `display: flex; align-items: center; gap: 16px; padding: 14px 18px 14px 14px; border-radius: 18px; background: ${$t(a?.bg)}; text-decoration: none; color: inherit;` },
                      $h("span", { "style": `width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: ${$t(a?.dot)};` }),
                      $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": a?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                        $h("span", { "style": "display: flex; align-items: center; gap: 8px; min-width: 0;" },
                          $h("span", { "style": `min-width: 0; font-size: 15px; font-weight: ${$t(a?.w)}; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` },
                            $t(a?.title)
                          ),
                          (a?.paid) ? [
                            $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                              $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                                "€"
                              ),
                              "Placement payé"
                            )
                          ] : null
                        ),
                        $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                          $t(a?.sub)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 76px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--accent);" },
                          $t(a?.big)
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          $t(a?.when)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-shrink: 0; gap: 6px; justify-content: flex-end; width: 154px;" },
                        ($l(a?.covs)).map((c) => [
                          $h("span", { "class": "sw-video", "style": "display: block; width: 46px; border-radius: 10px;" },
                            $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy" })
                          )
                        ])
                      )
                    )
                  ])
                )
              ])
            ),
            $h("aside", { "class": "sw-card", "style": "border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline;" },
                $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                  "Tes alertes"
                )
              ),
              ($l($v.rules)).map((r) => [
                $h("div", { "style": "display: flex; gap: 12px; align-items: flex-start; padding: 14px; border-radius: 16px; background: var(--track);" },
                  $h("span", { "style": "width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("button", { "type": "button", "onClick": r?.edit, "title": "Modifier cette alerte", "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.35;" },
                      $t(r?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(r?.s)
                    ),
                    (r?.n) ? [
                      $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--accent);" },
                        $t(r?.n)
                      )
                    ] : null
                  ),
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": r?.remove, "aria-label": "Supprimer cette alerte", "style": "width: 32px; height: 32px; flex-shrink: 0;" },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                    )
                  )
                )
              ]),
              ($v.noRules) ? [
                $h("p", { "style": "margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                  "Aucune alerte pour l’instant."
                )
              ] : null
            )
          )
        ),
        ($v.na) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 55;" },
            $h(NouvelleAlerte, { "onClose": $v.closeNa, "onCreate": $v.addRule, "rule": $v.naRule, "niches": $v.naNiches, "preview": $v.naPreview, "get": $v.getFn })
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
