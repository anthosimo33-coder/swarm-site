// Généré par scripts/dc2preact.py depuis design/app/MAlertes.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MNouvelleAlerte from './MNouvelleAlerte.js';
import MPalette from './MPalette.js';

export default class MAlertes extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  filters() { return { tab: ['onglet', 's', 'Toutes'], mine: ['miennes', 'b'] }; }
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
    const MH = {"/app/apps": "/app/apps", "/app/formats": "/app/formats", "/app/createurs": "/app/createurs", "/app/videos": "/app/videos"};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    const P = this.props || {};
    // Ce que la personne garde : ses alertes (alertRules) et « Tout marquer comme lu » (seen). Sur le canevas : état local, alertes d'exemple.
    const site = typeof P.saved === 'function' && typeof P.save === 'function';
    const SAMPLE = [{ id: 's1', quoi: 'format', niche: null, seuil: 3, marche: null }, { id: 's2', quoi: 'video', niche: 'Études', seuil: 1e6, marche: null }, { id: 's3', quoi: 'compte', niche: 'Études', seuil: 100, marche: null }];
    const rulesV = site ? P.saved('alertRules') : st.rules;
    const rulesWait = site && rulesV === undefined;
    const mine = Array.isArray(rulesV) ? rulesV.filter((r) => r && typeof r === 'object') : site ? [] : SAMPLE;
    const seenV = site ? P.saved('seen') : st.seen;
    const seenAt = seenV && typeof seenV.alerts === 'number' ? seenV.alerts : null;
    const keepRules = (xs) => (site ? P.save('alertRules', xs) : this.setState({ rules: xs }));
    const SL = { compte: [[10, '10×'], [100, '100×'], [1000, '1 000×']], video: [[5e5, '500 k'], [1e6, '1 M'], [5e6, '5 M']], format: [[3, '3'], [5, '5'], [10, '10']] };
    const sl = (r) => { const m = (SL[r.quoi] || []).filter((x) => x[0] === r.seuil)[0]; return m ? m[1] : String(r.seuil); };
    const MKNL = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const MKL = new Proxy({ US: 'États-Unis' }, { get: (o, c) => o[c] || MKNL(String(c)) });
    const ICO = { compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', video: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', format: 'M5 6h14M12 6v13M9 19h6' };
    const known = (r) => !!SL[r.quoi] && typeof r.seuil === 'number';
    const titleOf = (r) => (!known(r) ? String(r.t || 'Alerte') : r.quoi === 'compte' ? 'Un compte fait ' + sl(r) + ' sa normale'
      : r.quoi === 'video' ? 'Une vidéo d’app passe ' + sl(r) + ' de vues' : 'Un format repris par ' + sl(r) + ' comptes ou plus');
    const subOf = (r) => (!known(r) ? String(r.s || '') : (r.niche || 'Toutes niches') + ' · ' + (MKL[r.marche] || 'tous les marchés'));
    const AD = site && typeof P.get === 'function' ? P.get('apps') : undefined;
    const NOA = {}; ((AD && AD.apps) || []).forEach((a) => { NOA[a.slug] = a.niche; });
    const nicheOf = (a) => (a.kind === 'format' ? a.niche || null : a.slug && AD ? NOA[a.slug] || '' : null);
    // Une alerte de la semaine répond-elle à une règle ? null : pas encore sûr (niche d'une vidéo tant que « apps » charge).
    const match = (r, a) => {
      if (!known(r)) return false;
      if (a.kind === undefined) return a.rule === titleOf(r);
      if (r.marche && a.market !== r.marche) return false;
      if (r.quoi === 'format' ? !(a.kind === 'format' && a.accounts >= r.seuil) : r.quoi === 'video' ? !(a.kind === 'video' && !!a.slug && a.views >= r.seuil) : !(a.kind === 'video' && a.x >= r.seuil)) return false;
      if (!r.niche) return true;
      const n = nicheOf(a);
      return n === null ? null : n === r.niche;
    };
    const all = [].concat(...(b.groups || []).map((g) => g.items));
    const hits = (r) => all.filter((a) => match(r, a) === true);
    const unsure = (r) => all.some((a) => match(r, a) === null);
    const unread = (a) => (seenAt !== null ? !!a.at && a.at > seenAt : !!a.unread);
    const mineOn = !!this.fv('mine') && mine.length > 0; // l'état, sinon l'adresse (F25, plus haut)
    const isMine = (a) => mine.some((r) => match(r, a) === true);
    const pool = mineOn ? all.filter(isMine) : all;
    const tab0 = this.fv('tab'), tab = ['Formats', 'Vidéos', 'Comptes'].indexOf(tab0) >= 0 ? tab0 : 'Toutes';
    const TABS = [['Toutes', () => true], ['Formats', (a) => a.typ === 'Format' || a.typ === 'Son'], ['Vidéos', (a) => a.typ === 'Vidéo'], ['Comptes', (a) => a.typ === 'Compte']];
    const keep = (TABS.filter((t) => t[0] === tab)[0] || TABS[0])[1];
    const groups = (b.groups || []).map((g) => ({ g: g.g, items: g.items.filter((a) => keep(a) && (!mineOn || isMine(a))).map((a) => { const u = unread(a);
      return Object.assign({}, a, { href: a.href === '/app/videos' ? '/app/videos/' + vkey(a.cov0) : (MH[a.href] || a.href),
        dot: u ? 'var(--accent)' : 'transparent', bg: u ? 'var(--accent-soft)' : 'transparent', w: u ? '700' : '600' }); }) })).filter((g) => g.items.length > 0);
    const nU = all.filter(unread).length;
    // Le nombre d'une alerte compte les alertes listées ici (document « alerts »), pas toute la semaine : comme le desktop.
    const count = (r) => { if (!known(r) || unsure(r)) return ''; const c = hits(r).length; return c === 0 ? 'Aucune parmi les alertes' : c + ' parmi les alertes'; };
    const editId = st.na ? st.editId || null : null;
    const same = (p, q) => p.quoi === q.quoi && (p.niche || null) === (q.niche || null) && p.seuil === q.seuil && (p.marche || null) === (q.marche || null);
    const kindN = (r, n) => n + (r.quoi === 'format' ? (n > 1 ? ' formats' : ' format') : (n > 1 ? ' vidéos' : ' vidéo'));
    return { groups, noAlert: groups.length === 0, hasRules: mine.length > 0, mineOn: mineOn ? 'true' : 'false', toggleMine: () => this.setF({ mine: !mineOn }),
      noAlertText: mineOn ? 'Rien cette semaine pour tes alertes' + (tab === 'Toutes' ? '.' : ' dans ce type.') : 'Aucune alerte de ce type cette semaine.',
      hasUnread: nU > 0, unreadLabel: nU ? nU + (nU > 1 ? ' non lues' : ' non lue') : 'Tout est lu',
      rules: mine.map((r) => ({ t: titleOf(r), sub: [subOf(r), count(r)].filter(Boolean).join(' · '), ico: ICO[r.quoi] || ICO.format,
        edit: () => this.setState({ na: true, editId: r.id }), remove: () => keepRules(mine.filter((x) => x !== r)), rmLabel: 'Supprimer l’alerte « ' + titleOf(r) + ' »' })),
      noRules: !rulesWait && mine.length === 0,
      tabs: TABS.map((t) => ({ l: t[0], n: pool.filter(t[1]).length, on: t[0] === tab ? 'true' : 'false', pick: () => this.setF({ tab: t[0] }) })),
      markRead: () => { const v = Object.assign({}, seenV || {}, { alerts: Date.now() }); if (site) P.save('seen', v); else this.setState({ seen: v }); },
      na: !!st.na, openNa: () => this.setState({ na: true, editId: null }), closeNa: () => this.setState({ na: false, editId: null }),
      naRule: editId ? mine.filter((r) => r.id === editId)[0] || null : null,
      naNiches: (AD && AD.niches) || null,
      naPreview: site ? (r) => { if (unsure(r)) return null; const xs = hits(r);
        return { text: xs.length ? kindN(r, xs.length) : 'Aucune pour ces critères', hits: xs.filter((a) => a.cov0).slice(0, 3).map((a) => ({ src: a.cov0, x: a.big, href: a.href })) }; } : null,
      addRule: (f) => { const r = { quoi: f.quoi, niche: f.niche || null, seuil: f.seuil, marche: f.marche || null }; const now = Date.now();
        if (editId) keepRules(mine.map((x) => (x.id === editId ? Object.assign({}, x, r) : x)));
        else if (!mine.some((x) => same(x, r))) keepRules([Object.assign({ id: now.toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now }, r)].concat(mine)); } };
  }

  baseVals() {
    let tabs = [{"l": "Toutes", "n": 8, "on": "true"}, {"l": "Formats", "n": 4, "on": "false"}, {"l": "Vidéos", "n": 2, "on": "false"}, {"l": "Comptes", "n": 2, "on": "false"}];
    let groups = (globalThis.__dcSample?.["MAlertes"]?.["groups"] ?? []);
    let rules = [{"t": "Un format repris par 3 comptes ou plus", "s": "Toutes niches · tous les marchés", "n": "4 cette semaine", "ico": "M5 6h14M12 6v13M9 19h6"}, {"t": "Une vidéo d’app passe 1 M de vues", "s": "Études · tous les marchés", "n": "2 cette semaine", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6"}, {"t": "Un compte fait 100× sa normale", "s": "Études et Couple · tous les marchés", "n": "2 cette semaine", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"}];
    let nUnread = 3;
    // Sur le site : les alertes du Radar (document « alerts »), lues comme AlertesA : les vidéos de la semaine qui font le plus
    // de fois leur normale et les formats apparus cette semaine, rangés par jour ; non lues = aujourd'hui et hier.
    const D = this.props && this.props.data;
    if (D === null) { groups = []; nUnread = 0; tabs = tabs.map((t) => Object.assign({}, t, { n: 0 }));
      rules = rules.map((r) => Object.assign({}, r, { s: 'Toutes niches · tous les marchés', n: 'rien cette semaine' })); }
    if (D && D.videos) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + '\u202fj'; };
      const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      // « depuis la France », « depuis les États-Unis », « depuis l’Allemagne », « depuis Singapour » ; rien pour un pays inconnu.
      const DEPUIS = (n) => { n = String(n || ''); if (!n || n === 'Pays inconnu' || /^[A-Z]{2}$/.test(n)) return ''; if (/^(Singapour|Chypre|Cuba|Madagascar|Taïwan|Porto Rico|Malte|Haïti|Bahreïn|Israël|Monaco|Oman|Hong Kong|Maurice|La Réunion|Djibouti)$/.test(n)) return 'depuis ' + n;
        if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'depuis les ' + n; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'depuis l’' + n;
        return 'depuis ' + (/e$/.test(n.split(/[\s-]/)[0]) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize|Royaume-Uni|Suriname)$/.test(n) ? 'la ' : 'le ') + n; };
      // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
      const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const de = (n) => (/^[aeiouyhàâäéèêëîïôöùûü]/i.test(n) ? 'd’' : 'de ') + n;
      const ICO = { video: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' };
      const day0 = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
      const today = day0(Date.now());
      const age = (t) => Math.max(0, Math.round((today - day0(t)) / 86400000));
      const label = (t) => { const k = age(t); if (k === 0) return 'Aujourd’hui'; if (k === 1) return 'Hier';
        const s = new Date(t).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }); return s.charAt(0).toUpperCase() + s.slice(1); };
      const when = (t) => day(t) + ' · ' + String(new Date(t).getHours()).padStart(2, '0') + '\u202fh';
      const items = [];
      D.videos.forEach((v) => {
        const appN = v.app ? v.app.name : '', mk = v.market ? [DEPUIS(ML[v.market]), LANGN(v.otherLang)].filter(Boolean).join(' · ') : '';
        const million = v.views >= 1e6, acc = !million && v.x >= 100, une = 'Une vidéo ' + (appN ? de(appN) + ' ' : '');
        items.push({ paid: !!v.paid, at: v.publishedAt, typ: acc ? 'Compte' : 'Vidéo', ico: acc ? ICO.compte : ICO.video,
          title: million ? une + 'passe ' + Math.floor(v.views / 1e6) + ' M de vues' : acc ? '@' + v.handle + ' fait ' + xf(v.x) + ' sa normale' : une + (v.x ? 'à ' + xf(v.x) + ' sa normale' : 'à ' + nf(v.views) + ' vues'),
          sub: (acc ? [appN, mk, nf(v.views) + ' vues'] : ['@' + v.handle, mk, million && v.x ? xf(v.x) + ' sa normale' : nf(v.views) + ' vues']).filter(Boolean).join(' · '),
          big: million || !v.x ? nf(v.views) : xf(v.x), cov0: v.cover || '', href: '/app/videos/' + v.id, cta: 'Voir la vidéo',
          kind: 'video', views: v.views, x: v.x || 0, slug: v.app ? v.app.slug : '', market: v.market || '' });
      });
      (D.formats || []).forEach((f) => {
        items.push({ at: f.lastPostAt, typ: f.kind === 'sound' ? 'Son' : 'Format', ico: f.kind === 'sound' ? SON : TXT,
          title: (f.kind === 'sound' ? 'Un son se répète : « ' : 'Une accroche se répète : « ') + f.label + ' »',
          sub: [names(f.apps), f.market ? ML[f.market] : ''].filter(Boolean).join(' · '),
          big: f.accounts + ' comptes', cov0: ((f.members || []).filter((x) => x.cover)[0] || {}).cover || '', href: '/app/formats/' + f.id, cta: 'Voir le format',
          kind: 'format', accounts: f.accounts, market: f.market || '', niche: f.niche || null });
      });
      items.sort((p, q) => q.at - p.at);
      nUnread = 0;
      const byDay = [];
      items.forEach((it) => {
        const unread = age(it.at) <= 1;
        if (unread) nUnread++;
        const g = label(it.at);
        const x = Object.assign(it, { group: g, when: when(it.at), unread, dot: unread ? 'var(--accent)' : 'transparent', bg: unread ? 'var(--accent-soft)' : 'transparent', w: unread ? '700' : '600' });
        const last = byDay[byDay.length - 1];
        if (last && last.g === g) last.items.push(x); else byDay.push({ g, items: [x] });
      });
      groups = byDay;
      const c = (fn) => items.filter(fn).length;
      tabs = [['Toutes', () => true], ['Formats', (x) => x.typ === 'Format' || x.typ === 'Son'], ['Vidéos', (x) => x.typ === 'Vidéo'], ['Comptes', (x) => x.typ === 'Compte']]
        .map((t, i) => ({ l: t[0], n: c(t[1]), on: i === 0 ? 'true' : 'false' }));
      // « Tes alertes » : les mêmes règles, comptées sur les données de la semaine.
      const nR = [(D.formats || []).length, D.videos.filter((v) => v.views >= 1e6).length, D.videos.filter((v) => v.views < 1e6 && v.x >= 100).length];
      rules = rules.map((r, i) => Object.assign({}, r, { s: 'Toutes niches · tous les marchés', n: nR[i] + ' cette semaine' }));
    }
    return { tabs, groups, rules, nUnread };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Alertes"
            )
          ),
          $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openPal, "aria-label": "Chercher", "style": "flex-shrink: 0; width: 44px; height: 44px;" },
            $h("svg", { "width": "21", "height": "21", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/alertes", "aria-label": "Alertes", "aria-current": "page", "style": "flex-shrink: 0; position: relative; width: 44px; height: 44px; color: var(--accent);" },
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
        $h("div", { "style": "padding: 10px 20px 0; display: flex; justify-content: space-between; align-items: center;" },
          $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
            $t($v.unreadLabel)
          ),
          ($v.hasUnread) ? [
            $h("button", { "class": "sw-more", "type": "button", "onClick": $v.markRead, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit;" },
              "Tout marquer comme lu"
            )
          ] : null
        ),
        $h("div", { "style": "margin-top: 6px;  padding: 0 20px;" },
          $h("div", { "class": "m-tc is-scroll", "role": "tablist" },
            ($l($v.tabs)).map((t) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": "flex-shrink: 0; display: inline-flex; gap: 6px; align-items: center;" },
                $h("span", { "class": "m-ic", "data-i": `a:${$t(t?.l)}`, "aria-hidden": "true" }),
                $t(t?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                  $t(t?.n)
                )
              )
            ])
          )
        ),
        ($v.hasRules) ? [
          $h("div", { "style": "padding: 12px 20px 0; display: flex;" },
            $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.mineOn, "onClick": $v.toggleMine, "style": "height: 44px; gap: 8px;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Selon tes alertes"
            )
          )
        ] : null,
        ($v.noAlert) ? [
          $h("p", { "style": "margin: 16px 20px; font-size: 15px; color: var(--ink-muted);" },
            $t($v.noAlertText)
          )
        ] : null,
        ($l($v.groups)).map((g) => [
          $h("section", null,
            $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; padding: 16px 20px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t(g?.g)
            ),
            ($l(g?.items)).map((a) => [
              $h("a", { "href": $u(a?.href), "style": `display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; background: ${$t(a?.bg)}; text-decoration: none; color: inherit; border-bottom: 1px solid var(--line);` },
                $h("span", { "style": "position: relative; flex-shrink: 0;" },
                  $h("span", { "class": "sw-video", "style": "display: block; width: 46px; border-radius: 10px;" },
                    $h("img", { "class": "sw-cover", "src": $u(a?.cov0), "alt": "", "loading": "lazy", "decoding": "async" })
                  ),
                  $h("span", { "style": `position: absolute; left: -6px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: ${$t(a?.dot)}; box-shadow: 0 0 0 2px var(--surface);` })
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-faint);" },
                    $h("span", { "style": "color: var(--accent); display: inline-flex;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": a?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $t(a?.typ), " · ", $t(a?.when),
                    (a?.paid) ? [
                      $h("span", { "style": "margin-left: 6px; display: inline-flex;" },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                          $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                            "€"
                          ),
                          "Placement payé"
                        )
                      )
                    ] : null
                  ),
                  $h("span", { "style": `font-size: 15px; font-weight: ${$t(a?.w)}; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;` },
                    $t(a?.title)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint); line-height: 1.4;" },
                    $t(a?.sub)
                  )
                ),
                $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--accent); white-space: nowrap;" },
                  $t(a?.big)
                )
              )
            ])
          )
        ]),
        $h("div", { "style": "padding: 28px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
          $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline;" },
            $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Tes alertes"
            )
          ),
          ($v.noRules) ? [
            $h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
              "Aucune alerte pour l’instant. Une alerte trie ce que le Radar repère ici, selon ta niche, ton marché et ton seuil."
            )
          ] : null,
          ($l($v.rules)).map((r) => [
            $h("div", { "style": "display: flex; gap: 12px; align-items: center; padding: 14px; border-radius: 18px; background: var(--surface-raised); border: 1px solid var(--line);" },
              $h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "type": "button", "onClick": r?.edit, "aria-label": `Modifier l’alerte ${$t(r?.t)}`, "style": "flex: 1; min-width: 0; min-height: 44px; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;" },
                $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.35;" },
                  $t(r?.t)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  $t(r?.sub)
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": r?.remove, "aria-label": r?.rmLabel, "style": "width: 44px; height: 44px; flex-shrink: 0;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ]),
          $h("div", { "style": "display: flex; justify-content: center;" },
            $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.openNa },
              "Créer une alerte",
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          )
        ),
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        ] : null,
        ($v.na) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 70;" },
            $h(MNouvelleAlerte, { "onClose": $v.closeNa, "onCreate": $v.addRule, "rule": $v.naRule, "niches": $v.naNiches, "preview": $v.naPreview, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
