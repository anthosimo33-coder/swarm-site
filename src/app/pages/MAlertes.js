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
  // « alerte » : l'alerte ouverte en plein écran (maquette T1, 20/11), la même que celle de la boîte de réception de
  // l'ordinateur ; écrite quand on en ouvre une, effacée quand on revient à la liste.
  filters() { return { tab: ['onglet', 's', 'Toutes'], mine: ['miennes', 'b'], sel: ['alerte', 's'] }; }
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

  // ── L'alerte ouverte en plein écran : lue, son voisinage préparé ──
  componentDidMount() { this.settle(); }
  componentWillUnmount() { clearTimeout(this.flushT); clearTimeout(this.focusT); clearTimeout(this.focusR); this.flush(); }
  componentDidUpdate(pp, ps) {
    const st = this.state || {};
    ps = ps || {};
    if (st.rw && !ps.rw) { clearTimeout(this.focusR); this.focusR = setTimeout(() => { if (this.rwClose && (this.state || {}).rw) this.rwClose.focus({ preventScroll: true }); }, 560); }
    this.settle();
  }
  // Après chaque rendu : une nouvelle alerte ouverte repart du haut (la première prend le focus, sans défiler), elle
  // est marquée lue, et les fiches et miniatures de ses voisines se chargent d'avance (le balayage les montre aussitôt).
  settle() {
    const k = this._sel;
    if (k !== this._shownKey) {
      const was = this._shownKey;
      this._shownKey = k;
      // Seulement si on l'a fait défiler (__y, tenu par swipe.js) : écrire scrollTop force une mise en page.
      if (k && this.detailEl && this.detailEl.__y > 0) { this.detailEl.scrollTop = 0; this.detailEl.__y = 0; }
      // Le focus va au retour une fois la page arrivée (focus() force le calcul de la page : pas pendant l'entrée).
      clearTimeout(this.focusT);
      if (k && !was) this.focusT = setTimeout(() => { if (this.backEl && this._sel) { try { this.backEl.focus({ preventScroll: true }); } catch (e) { /* ancien navigateur */ } } }, 480);
    }
    if (k && this._readReady && this._marked !== k) { this._marked = k; this.markOne(k); }
    (this._near || []).forEach((a) => this.warm(a));
  }
  // La fiche d'un format (format:<id>, ses 30 reprises les plus vues) et ses premières miniatures ; la miniature d'une vidéo.
  warm(a) {
    if (!a) return;
    const P = this.props || {};
    let covers = [];
    if (a.kind === 'format') {
      if (typeof P.get !== 'function') return;
      const d = P.get('format:' + a.f.id);
      if (!d || !d.members) return;
      covers = d.members.filter((m) => m.cover && typeof m.x === 'number' && m.x > 1).slice(0, 5).map((m) => m.cover);
    } else if (a.v && a.v.cover) covers = [a.v.cover];
    if (typeof Image === 'undefined') return;
    this._pre = this._pre || new Set();
    covers.forEach((src) => {
      if (this._pre.has(src)) return;
      this._pre.add(src);
      const im = new Image();
      im.decoding = 'async';
      im.src = src;
    });
  }
  // « Lu » d'une alerte ouverte, comme sur ordinateur (AlertesA) : une empreinte courte de sa clé dans seen.alertsRead
  // (texte, séparées par des espaces ; la forme de « seen » n'accepte que des champs simples, convex/saved.ts). Seules y
  // restent les alertes encore non lues par la date (aujourd'hui et hier, ou après « Tout marquer comme lu »). Écrit
  // 400 ms après la dernière ouverture : balayer plusieurs alertes n'écrit qu'une fois.
  fp(k) { let h = 2166136261; for (let i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  markOne(k) {
    this.pend = this.pend || new Set();
    this.pend.add(this.fp(k));
    clearTimeout(this.flushT);
    this.flushT = setTimeout(() => this.flush(), 400);
  }
  flush() {
    if (!this.pend || !this.pend.size) return;
    const P = this.props || {};
    const site = typeof P.saved === 'function' && typeof P.save === 'function';
    const cur = site ? P.saved('seen') : (this.state || {}).seen;
    if (site && cur === undefined) return;
    const was = String((cur && cur.alertsRead) || '');
    const have = new Set(was.split(' ').filter(Boolean));
    this.pend.forEach((x) => have.add(x));
    this.pend.clear();
    const keep = this._timeUnread || new Set();
    const list = [...have].filter((x) => keep.has(x));
    let s = list.join(' ');
    while (s.length > 500) { list.shift(); s = list.join(' '); }
    if (s === was) return;
    const v = Object.assign({}, cur || {}, { alertsRead: s });
    if (site) P.save('seen', v); else this.setState({ seen: v });
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
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false }),
      setDetail: (el) => { this.detailEl = el; }, setBack: (el) => { this.backEl = el; }, setRwClose: (el) => { this.rwClose = el; }
    };
  }
  // Noms de pays et de langues (comme AlertesA) : partagés par baseVals (lignes) et extraVals (règles).
  nomsPays() {
    const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
    const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
    const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays
    return { MKN, LANGN, MKW };
  }

  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const { nf, xf, kickWhen, M } = b.fmt;
    // Ce que la personne garde (saved) : ses alertes (alertRules), le moment de « Tout marquer comme lu » et les alertes
    // ouvertes (seen), ses dossiers (folders, pour « Garder »). Sur le canevas, ces props n'existent pas : état local.
    const site = typeof P.saved === 'function' && typeof P.save === 'function';
    const rulesV = site ? P.saved('alertRules') : st.rules;
    const rulesWait = site && rulesV === undefined;
    const mine = Array.isArray(rulesV) ? rulesV.filter((r) => r && typeof r === 'object') : site ? [] : b.sampleRules;
    const seenV = site ? P.saved('seen') : st.seen;
    const seenAt = seenV && typeof seenV.alerts === 'number' ? seenV.alerts : null;
    this._readReady = !site || seenV !== undefined;
    const keepRules = (xs) => (site ? P.save('alertRules', xs) : this.setState({ rules: xs }));
    // Une alerte = { id, createdAt, quoi: 'compte'|'video'|'format', niche: nom|null, seuil: nombre, marche: code|null }.
    const SL = { compte: [[10, '10×'], [100, '100×'], [1000, '1 000×']], video: [[5e5, '500 k'], [1e6, '1 M'], [5e6, '5 M']], format: [[3, '3'], [5, '5'], [10, '10']] };
    const sl = (r) => { const m = (SL[r.quoi] || []).filter((x) => x[0] === r.seuil)[0]; return m ? m[1] : String(r.seuil); };
    const MKL = b.fmt.MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
    const ICO = { compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', video: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', format: 'M5 6h14M12 6v13M9 19h6' };
    const known = (r) => !!SL[r.quoi] && typeof r.seuil === 'number';
    const titleOf = (r) => (!known(r) ? String(r.t || 'Alerte') : r.quoi === 'compte' ? 'Un compte fait ' + sl(r) + ' sa normale'
      : r.quoi === 'video' ? 'Une vidéo d’app passe ' + sl(r) + ' de vues' : 'Un format repris par ' + sl(r) + ' comptes ou plus');
    const subOf = (r) => (!known(r) ? String(r.s || '') : (r.niche || 'Toutes niches') + ' · ' + (MKL[r.marche] || 'tous les marchés'));
    // Une alerte de la semaine répond-elle à une alerte de la personne ? null : on ne sait pas encore (niche d'une vidéo
    // tant que le document « apps » charge).
    const match = (r, a) => {
      if (!known(r)) return false;
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
    const mineOn = !!this.fv('mine') && mine.length > 0; // l'état, sinon l'adresse (F25, plus haut)
    const isMine = (a) => mine.some((r) => match(r, a) === true);
    const tab0 = this.fv('tab'), tab = ['Formats', 'Vidéos', 'Comptes'].indexOf(tab0) >= 0 ? tab0 : 'Toutes';
    const TABS = [['Toutes', () => true], ['Formats', (a) => a.typ === 'Format' || a.typ === 'Son'], ['Vidéos', (a) => a.typ === 'Vidéo'], ['Comptes', (a) => a.typ === 'Compte']];
    const pool = mineOn ? items.filter(isMine) : items;
    const keepOf = (t) => (TABS.filter((x) => x[0] === t)[0] || TABS[0])[1];
    const vis = pool.filter(keepOf(tab));

    // Non lu : publié après « Tout marquer comme lu » (sans rien d'enregistré : aujourd'hui ou hier), et jamais ouvert,
    // ici ou sur ordinateur (la même empreinte).
    const timeUnread = (a) => (seenAt !== null ? !!a.at && a.at > seenAt : !!a.fresh);
    this._timeUnread = new Set(items.filter(timeUnread).map((a) => this.fp(a.key)));
    const opened = new Set(String((seenV && seenV.alertsRead) || '').split(' ').filter(Boolean));
    (this.pend || new Set()).forEach((x) => opened.add(x));
    const stored = (a) => timeUnread(a) && !opened.has(this.fp(a.key));

    // L'alerte ouverte : celle de l'état ou de l'adresse, si elle est dans la liste montrée ; sinon la liste.
    const sel0 = this.fv('sel');
    const at = sel0 ? vis.map((a) => a.key).indexOf(sel0) : -1;
    const sel = at >= 0 ? sel0 : null;
    this._sel = sel;
    const unread = (a) => a.key !== sel && stored(a);
    this._near = at >= 0 ? [vis[at + 1], vis[at - 1], vis[at + 2]].filter(Boolean) : [];
    const choose = (k) => this.setF({ sel: k });

    const groups = [];
    vis.forEach((a) => {
      const it = Object.assign({}, a, { dot: unread(a) ? 'true' : 'false', pick: () => choose(a.key), warm: () => this.warm(a) });
      if (!groups.length || groups[groups.length - 1].g !== a.g) groups.push({ g: a.g, items: [], first: !groups.length, pad: groups.length ? '18px 12px 6px' : '8px 12px 6px' });
      groups[groups.length - 1].items.push(it);
    });

    // Le nombre d'une alerte compte les alertes listées ici (document « alerts » : 40 vidéos et 20 formats au plus), pas toute la semaine.
    const count = (r) => { if (!known(r) || unsure(r)) return ''; const c = hits(r).length;
      return c === 0 ? 'aucune parmi les alertes' : c + ' parmi les alertes'; };
    const editId = st.na ? st.editId || null : null;
    const rules = mine.map((r) => ({ id: String(r.id || ''), t: titleOf(r), s: subOf(r), n: count(r), ico: ICO[r.quoi] || ICO.format,
      edit: () => this.setState({ na: true, editId: r.id, rw: false }),
      remove: () => keepRules(mine.filter((x) => x !== r)), rmLabel: 'Supprimer l’alerte « ' + titleOf(r) + ' »' }));
    const same = (p, q) => p.quoi === q.quoi && (p.niche || null) === (q.niche || null) && p.seuil === q.seuil && (p.marche || null) === (q.marche || null);
    const kindN = (r, n) => n + (r.quoi === 'format' ? (n > 1 ? ' formats' : ' format') : (n > 1 ? ' vidéos' : ' vidéo'));

    // En-tête : les nouvelles (non lues) de toute la liste, quel que soit l'onglet.
    const nU = pool.filter(unread).length;
    const since = seenAt === null ? 'depuis hier' : b.fmt.ago(seenAt) === 0 ? 'depuis ' + b.fmt.hh(seenAt) : b.fmt.ago(seenAt) === 1 ? 'depuis hier' : 'depuis le ' + b.fmt.dm(seenAt);
    const subtitle = nU ? nU + (nU > 1 ? ' nouvelles ' : ' nouvelle ') + since : 'Rien de nouveau ' + since;

    // Ce que « Garder » range, et s'il y est déjà.
    const fs = site ? P.saved('folders') : null;
    const keptOf = (kind, id) => (Array.isArray(fs) ? fs : []).some((f) => (f.items || []).some((x) => x.kind === kind && x.id === id));

    // ── L'alerte ouverte, en plein écran (le contenu du détail d'AlertesA) ──
    const AV = ['#3A86F0', '#22A06B', '#D95926', '#9085E9', '#C98500', '#D55181', '#199E70'];
    const avBg = (h) => { let s = 0; for (const c of String(h)) s += c.codePointAt(0); return 'linear-gradient(160deg, ' + AV[s % AV.length] + ', #0B1220)'; };
    const ini = (h) => (Array.from(String(h).replace(/^@/, ''))[0] || '?').toUpperCase();
    const others = (n) => 'et ' + n + (n > 1 ? ' autres' : ' autre');
    const a = at >= 0 ? vis[at] : null;
    const close = () => this.setF({ sel: null });
    const go = (i) => { if (vis[i]) choose(vis[i].key); };
    let d = { on: false, key: '', at: 0, isFormat: false, isVideo: false, stats: [], bars: [], vids: [], accs: [], apps: [] };
    if (a) {
      const nav = { on: true, key: a.key, at, pos: (at + 1) + ' sur ' + vis.length, prev: () => go(at - 1), next: () => go(at + 1),
        noPrev: at <= 0, noNext: at >= vis.length - 1, nextO: at >= vis.length - 1 ? '0.35' : '1', ico: a.ico, mk: a.mk, mkName: a.mk ? M[a.mk] : '', title: a.title };
      if (a.kind === 'format') {
        const f = a.f;
        const D = b.docOf(f.id); // undefined tant qu'elle charge, null sans fiche
        const ms = (D && D.members) || f.members || [];
        const hook = f.kind === 'hook';
        const dn = (dt) => Math.round(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() / 86400000);
        const L = new Date(f.lastPostAt);
        const days = [6, 5, 4, 3, 2, 1, 0].map((k) => new Date(L.getFullYear(), L.getMonth(), L.getDate() - k));
        const loading = D === undefined;
        const counts = days.map((dt) => ms.filter((m) => dn(new Date(m.publishedAt)) === dn(dt)).length);
        const mx = Math.max(1, Math.max.apply(null, counts));
        const lab = (dt) => b.fmt.dm(dt.getTime());
        const nRep = (c) => c + (c > 1 ? ' reprises' : ' reprise');
        const bars = days.map((dt, i) => {
          const c = counts[i];
          return { d: lab(dt), t: loading ? lab(dt) : lab(dt) + ' : ' + nRep(c),
            h: loading ? 4 : c ? Math.max(8, Math.round(c / mx * 66)) : 3,
            bg: loading ? 'rgba(255,255,255,0.06)' : i === 6 && c ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : c ? 'rgba(76,154,255,0.32)' : 'rgba(255,255,255,0.08)' };
        });
        // Les vidéos qui marchent : les reprises au-dessus de la normale de leur compte, les plus vues d'abord.
        const good = ms.filter((m) => m.cover && typeof m.x === 'number' && m.x > 1).slice(0, 5);
        const shown = good.length ? good : ms.filter((m) => m.cover).slice(0, 5);
        const seenH = new Set();
        const accs = [];
        ms.forEach((m) => { if (accs.length < 4 && !seenH.has(m.handle)) { seenH.add(m.handle); accs.push({ h: '@' + m.handle, v: nf(m.views) + ' vues', i: ini(m.handle), bg: avBg(m.handle) }); } });
        const apps = (f.apps || []).filter(Boolean);
        const cover = ((ms.filter((m) => m.cover)[0]) || {}).cover || null;
        const kept = keptOf('format', f.id);
        d = Object.assign(nav, { isFormat: true, isVideo: false, aria: 'Alerte : ' + a.title, kick: hook ? 'Une accroche se répand' : 'Un son se répand',
          when: kickWhen(f.lastPostAt), paid: false,
          href: D === null ? '' : '/app/formats/' + f.id, cta: 'Voir le format',
          kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardé' : 'Garder', keepFill: kept ? 'currentColor' : 'none',
          ajItem: { kind: 'format', id: f.id, label: hook ? '« ' + f.label + ' »' : f.label, cover },
          // Les trois chiffres de l'ordinateur, aux libellés courts de la maquette T1.
          stats: [{ v: f.wins + '/' + f.n, l: 'au-dessus de leur normale' }, f.maxViews ? { v: nf(f.maxViews), l: 'la meilleure' } : null,
            typeof f.medX === 'number' ? { v: xf(f.medX), l: 'la normale' } : null].filter(Boolean),
          bars, chartNote: loading ? '' : ms.length < f.n ? 'les ' + ms.length + ' plus vues, sur ' + f.n : '',
          chartAria: 'Reprises par jour : ' + (loading ? 'chargement' : bars.map((x) => x.t).join(', ')),
          hasVids: shown.length > 0, vTitle: good.length ? 'Les vidéos au-dessus de leur normale' : 'Les reprises les plus vues',
          vids: shown.map((m) => ({ src: m.cover, v: nf(m.views), href: '/app/videos/' + m.videoId, aria: '@' + m.handle + ', ' + nf(m.views) + ' vues' })),
          hasAccs: accs.length > 0, accs, accMore: f.accounts > accs.length ? others(f.accounts - accs.length) : '',
          hasApps: apps.length > 0, apps: apps.slice(0, 3).map((x) => ({ name: x.name, link: x.page !== false, nolink: x.page === false, href: x.page === false ? '' : '/app/apps/' + x.slug })),
          appsMore: apps.length > 3 ? others(apps.length - 3) : '' });
      } else {
        const v = a.v;
        const kept = keptOf('video', v.id);
        const app = v.app ? { name: v.app.name, icon: v.app.icon || '', noicon: !v.app.icon, ini: ini(v.app.name), blank: v.app.icon ? '' : 'sw-app-blank',
          link: v.app.page !== false, nolink: v.app.page === false, href: v.app.page === false ? '' : '/app/apps/' + v.app.slug } : null;
        d = Object.assign(nav, { isFormat: false, isVideo: true, aria: 'Alerte : ' + a.title,
          kick: a.typ === 'Compte' ? 'Un compte hors norme' : v.views >= 1e6 ? 'Une vidéo passe le million' : v.x > 1 ? 'Une vidéo au-dessus de sa normale' : 'Une vidéo de la semaine',
          when: kickWhen(v.publishedAt), paid: !!v.paid,
          href: '/app/videos/' + v.id, cta: 'Voir la vidéo',
          kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardée' : 'Garder', keepFill: kept ? 'currentColor' : 'none',
          ajItem: { kind: 'video', id: v.id, label: v.handle, cover: v.cover || null },
          stats: [{ v: nf(v.views), l: 'vues' }, v.x ? { v: xf(v.x), l: 'sa normale' } : null, v.x ? { v: nf(v.views / v.x), l: 'vues d’habitude' } : null].filter(Boolean),
          cover: v.cover || '', views: nf(v.views), hook: v.hook ? String(v.hook).trim() : '', handle: '@' + v.handle, accI: ini(v.handle), accBg: avBg(v.handle), app,
          bars: [], vids: [], accs: [], apps: [] });
      }
    }
    const dKeys = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' && at >= 0) { e.preventDefault(); go(at + 1); }
      else if (e.key === 'ArrowLeft' && at >= 0) { e.preventDefault(); go(at - 1); }
    };
    const TABIC = { Toutes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0', Formats: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4', 'Vidéos': 'M4 6h11v12H4zM15 10l5-3v10l-5-3z', Comptes: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' };

    return {
      groups, d, dKeys, closeD: () => { if (st.aj) this.setState({ aj: false }); close(); }, ajItem: d.on ? d.ajItem : null,
      rules, hasRules: mine.length > 0, noRules: !rulesWait && mine.length === 0, nRules: String(mine.length),
      rwCount: mine.length + (mine.length > 1 ? ' alertes' : ' alerte'),
      subtitle, weekCount: vis.length + ' cette semaine',
      noAlert: groups.length === 0, noAlertText: mineOn ? 'Rien cette semaine pour tes alertes' + (tab === 'Toutes' ? '.' : ' dans ce type.') : 'Aucune alerte de ce type cette semaine.',
      tabs: TABS.map((t) => ({ l: t[0], d: TABIC[t[0]] || TABIC.Toutes, n: pool.filter(t[1]).length, on: t[0] === tab ? 'true' : 'false', pick: () => this.setF({ tab: t[0] }) })),
      mineOn: mineOn ? 'true' : 'false', mineCls: mineOn ? 'is-on' : '', toggleMine: () => this.setF({ mine: !mineOn }),
      hasUnread: nU > 0,
      markRead: () => { const v = Object.assign({}, seenV || {}, { alerts: Date.now() }); delete v.alertsRead; if (this.pend) this.pend.clear();
        if (site) P.save('seen', v); else this.setState({ seen: v }); },
      rw: !!st.rw, rwOpen: st.rw ? 'true' : 'false', openRw: () => this.setState({ rw: true }), closeRw: () => this.setState({ rw: false }),
      rwKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ rw: false }); } },
      na: !!st.na, openNa: () => this.setState({ na: true, editId: null, rw: false }), closeNa: () => this.setState({ na: false, editId: null }),
      naRule: editId ? mine.filter((r) => r.id === editId)[0] || null : null,
      naNiches: b.niches || null,
      // Ce que l'alerte en cours de réglage trouve dans les alertes de la semaine (aperçu de « Nouvelle alerte »).
      naPreview: (r) => { if (unsure(r)) return null; const xs = hits(r);
        return { text: xs.length ? kindN(r, xs.length) : 'Aucune pour ces critères', hits: xs.filter((x) => x.covs && x.covs[0] && x.covs[0].src).slice(0, 3).map((x) => ({ src: x.covs[0].src, x: x.big, href: x.href })) }; },
      addRule: (f) => {
        const r = { quoi: f.quoi, niche: f.niche || null, seuil: f.seuil, marche: f.marche || null };
        const now = Date.now();
        if (editId) keepRules(mine.map((x) => (x.id === editId ? Object.assign({}, x, r) : x)));
        else if (!mine.some((x) => same(x, r))) keepRules([Object.assign({ id: now.toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now }, r)].concat(mine));
      }
    };
  }

  baseVals() {
    const { LANGN, MKW } = this.nomsPays();
    // Alertes d'exemple (canevas) : même forme que celles enregistrées (saved('alertRules')).
    const sampleRules = [{ id: 'ex1', createdAt: 0, quoi: 'format', niche: null, seuil: 3, marche: null },
      { id: 'ex2', createdAt: 0, quoi: 'video', niche: 'Études', seuil: 1e6, marche: null },
      { id: 'ex3', createdAt: 0, quoi: 'compte', niche: null, seuil: 100, marche: null }];
    // Sur le canevas : un extrait du document « alerts » du 20/11 (mêmes champs), miniatures du canevas ; « _members »
    // tient lieu de la fiche format:<id> du premier format. Ses dates sont décalées pour que « Hier » reste hier.
    const sample = (globalThis.__dcSample?.["MAlertes"]?.["sample"] ?? {"updatedAt":1795181548082,"videos":[],"formats":[]});
    const P = this.props || {};
    const real = !!(P.data && P.data.videos);
    let D = real ? P.data : sample;
    if (P.data === null) D = { videos: [], formats: [] };
    else if (!real) {
      const k = Date.now() - (sample.updatedAt || Date.now());
      const sh = (m) => Object.assign({}, m, { publishedAt: m.publishedAt + k });
      D = { updatedAt: Date.now(), videos: (sample.videos || []).map(sh),
        formats: (sample.formats || []).map((f) => Object.assign({}, f, { lastPostAt: f.lastPostAt + k, members: (f.members || []).map(sh), _members: f._members ? f._members.map(sh) : null })) };
    }
    // Les éléments ne dépendent que du document (et de l'heure) : calculés une fois par document, pas à chaque rendu
    // (ouvrir une alerte, balayer à la suivante).
    const day0 = (ms) => { const dt = new Date(ms); dt.setHours(0, 0, 0, 0); return dt.getTime(); };
    const today = day0(Date.now());
    const A = real && typeof P.get === 'function' ? P.get('apps') : null;
    // (this.memo et non this.base : Preact range dans this.base l'élément de l'écran.)
    if (this.memo && this.memo.D === D && this.memo.today === today && this.memo.A === A) return this.memo.v;
    // La fiche d'un format (format:<id>, 30 reprises) : undefined tant qu'elle charge, null si le format n'en a pas.
    const docOf = (id) => {
      const G = (this.props || {}).get; // le get du rendu en cours (le résultat de baseVals est gardé d'un rendu à l'autre)
      if (real) return typeof G === 'function' ? G('format:' + id) : undefined;
      const f = (D.formats || []).filter((x) => x.id === id)[0];
      return f && f._members ? Object.assign({}, f, { members: f._members }) : null;
    };
    const M = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
    // Nombres : « 289 k », « 6,3 M », « 9,4 k » ; multiplicateur « 1 947× », « 1,1× ».
    const trim = (s) => s.replace(/[.,]0$/, '').replace('.', ',');
    const nf = (n) => (n >= 1e6 ? trim((n / 1e6).toFixed(1)) + ' M' : n >= 1e4 ? Math.round(n / 1e3) + ' k' : n >= 1e3 ? trim((n / 1e3).toFixed(1)) + ' k' : String(Math.round(n)));
    // Sans toLocaleString ni toLocaleDateString : chaque appel construit un formateur Intl (le plus lent du rendu, mesuré).
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // « 1 947 », comme fr-FR
    const xf = (x) => (x >= 100 ? grp(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const de = (n) => (/^[aeiouyhàâäéèêëîïôöùûü]/i.test(n) ? 'd’' : 'de ') + n;
    const ago = (ms) => Math.max(0, Math.round((today - day0(ms)) / 86400000));
    const hh = (ms) => new Date(ms).getHours() + ' h';
    const p2 = (n) => (n < 10 ? '0' : '') + n;
    const dm = (ms) => { const dt = new Date(ms); return p2(dt.getDate()) + '/' + p2(dt.getMonth() + 1); };
    const WD = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const wd = (ms) => WD[new Date(ms).getDay()] + ' ' + dm(ms);
    const dayLabel = (ms) => { const k = ago(ms); if (k === 0) return 'Aujourd’hui'; if (k === 1) return 'Hier'; const s = wd(ms); return s.charAt(0).toUpperCase() + s.slice(1); };
    const kickWhen = (ms) => { const k = ago(ms); return (k === 0 ? 'aujourd’hui ' : k === 1 ? 'hier ' : 'le ' + dm(ms) + ', ') + hh(ms); };
    // « original sound - poseract » : « son de @poseract » (le son d'un compte, comme sur ordinateur).
    const son = (s) => { const m = String(s || '').match(/^(?:original sound|son original|sonido original|som original|suono originale|originalton|оригинальный звук)\s*[-–—]\s*(.+)$/i); return m ? 'son de @' + m[1].trim() : String(s || ''); };
    const I = { video: 'M4 6h11v12H4zM15 10l5-3v10l-5-3z', compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4' };
    // Les alertes du Radar (document « alerts », convex/radarModels.ts), lues comme AlertesA : les vidéos de la semaine
    // qui font le plus de fois leur normale, et les formats apparus cette semaine, rangés par jour de publication
    // (dernière reprise pour un format). Une vidéo d'un million de vues ou plus : « Vidéo » ; sinon à 100× sa normale ou
    // plus : « Compte ».
    const items = [];
    (D.videos || []).forEach((v) => {
      const app = v.app ? v.app.name : '';
      const mk = v.market && v.market !== 'XX' ? v.market : '';
      const million = v.views >= 1e6;
      const acc = !million && v.x >= 100;
      const une = 'Une vidéo ' + (app ? de(app) + ' ' : '');
      items.push({ key: 'v-' + v.id, kind: 'video', v, at: v.publishedAt, typ: acc ? 'Compte' : 'Vidéo', ico: acc ? I.compte : I.video,
        title: million ? une + 'passe ' + Math.floor(v.views / 1e6) + ' M de vues' : acc ? '@' + v.handle + ' fait ' + xf(v.x) + ' sa normale' : une + (v.x ? 'à ' + xf(v.x) + ' sa normale' : 'à ' + nf(v.views) + ' vues'),
        short: '@' + v.handle + ' · ' + (million || !v.x ? nf(v.views) + ' vues' : xf(v.x) + ' sa normale'),
        sub: [mk ? M[mk] : '', app, LANGN(v.otherLang)].filter(Boolean).join(' · '),
        mk, big: million || !v.x ? nf(v.views) : xf(v.x), covs: v.cover ? [{ src: v.cover }] : [], href: '/app/videos/' + v.id,
        views: v.views, x: v.x || 0, slug: v.app ? v.app.slug : '', market: v.market || '', paid: !!v.paid });
    });
    (D.formats || []).forEach((f) => {
      const names = (f.apps || []).filter(Boolean).map((x) => x.name);
      const mk = f.market && f.market !== 'XX' ? f.market : '';
      items.push({ key: 'f-' + f.id, kind: 'format', f, at: f.lastPostAt, typ: f.kind === 'sound' ? 'Son' : 'Format', ico: I.repeat,
        title: f.accounts + ' comptes reprennent « ' + son(f.label) + ' »',
        short: f.accounts + ' comptes · « ' + son(f.label) + ' »',
        sub: [mk ? M[mk] : '', names.slice(0, 2).join(', ') + (names.length > 2 ? ' +' + (names.length - 2) : '')].filter(Boolean).join(' · '),
        mk, big: f.accounts + ' comptes', covs: (f.members || []).filter((m) => m.cover).slice(0, 3).map((m) => ({ src: m.cover })), href: '/app/formats/' + f.id,
        accounts: f.accounts, niche: f.niche || '', market: f.market || '', paid: false });
    });
    items.sort((p, q) => q.at - p.at);
    items.forEach((a) => Object.assign(a, { g: dayLabel(a.at), when: hh(a.at), fresh: ago(a.at) <= 1 }));
    // La niche d'une vidéo vient de son app (document « apps ») : tant qu'il charge, elle est inconnue (null).
    let niches = null;
    let nicheOf = (a) => (a.kind === 'format' ? a.niche : null);
    if (real) {
      const NI = A && A.apps ? Object.fromEntries(A.apps.map((x) => [x.slug, x.niche || ''])) : null;
      nicheOf = (a) => (a.kind === 'format' ? a.niche : NI ? NI[a.slug] || '' : null);
      if (A && A.niches) niches = A.niches.slice().sort((p, q) => p.localeCompare(q, 'fr'));
    } else nicheOf = (a) => (a.kind === 'format' ? a.niche : ''); // canevas : la niche des apps d'exemple n'est pas connue
    const v = { items, sampleRules, niches, nicheOf, docOf, fmt: { nf, xf, kickWhen, M, MKW, ago, hh, dm } };
    this.memo = { D, today, A, v };
    return v;
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "data-pull": "", "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(150px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Alertes"
            )
          ),
          $h("button", { "data-pull-search": "", "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openPal, "aria-label": "Chercher", "style": "flex-shrink: 0; width: 44px; height: 44px;" },
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
        $h("div", { "style": "padding: 10px 20px 0; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
          $h("span", { "style": "min-width: 0; font-size: 14px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
            $t($v.subtitle)
          ),
          ($v.hasUnread) ? [
            $h("button", { "class": "m-hit", "type": "button", "onClick": $v.markRead, "style": "flex-shrink: 0; padding: 0; border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 14px; font-weight: 600; white-space: nowrap; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
              "Tout marquer comme lu"
            )
          ] : null
        ),
        $h("div", { "style": "padding: 6px 20px 0; display: flex; flex-wrap: wrap; gap: 8px;" },
          ($v.hasRules) ? [
            $h("button", { "class": `m-fb ${$t($v.mineCls)}`, "type": "button", "aria-pressed": $v.mineOn, "onClick": $v.toggleMine },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Selon tes alertes"
            ),
            $h("button", { "class": "m-fb", "type": "button", "onClick": $v.openRw, "aria-haspopup": "dialog", "aria-expanded": $v.rwOpen },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "class": "m-fb-k" },
                "Tes alertes"
              ),
              $h("span", { "class": "m-fb-v" },
                $t($v.nRules)
              ),
              $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ] : null,
          ($v.noRules) ? [
            $h("button", { "class": "m-fb", "type": "button", "onClick": $v.openNa },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
              ),
              "Créer une alerte"
            )
          ] : null
        ),
        $h("div", { "data-swipe": "", "style": "padding: 6px 10px 0; display: flex; flex-direction: column;" },
          ($v.noAlert) ? [
            $h("p", { "style": "margin: 16px 10px; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
              $t($v.noAlertText)
            )
          ] : null,
          ($l($v.groups)).map((g) => [
            $h("div", { "role": "group", "aria-label": g?.g, "style": "display: flex; flex-direction: column; gap: 2px;" },
              $h("div", { "style": `display: flex; align-items: baseline; gap: 8px; padding: ${$t(g?.pad)};` },
                $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                  $t(g?.g)
                ),
                $h("span", { "style": "flex: 1;" }),
                (g?.first) ? [
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                    $t($v.weekCount)
                  )
                ] : null
              ),
              ($l(g?.items)).map((a) => [
                $h("button", { "type": "button", "class": "ib-row", "onClick": a?.pick, "onPointerDown": a?.warm, "style": "padding: 13px 12px; -webkit-tap-highlight-color: transparent;" },
                  $h("span", { "class": "ib-dot", "data-on": a?.dot, "aria-hidden": "true", "style": "margin-top: 7px;" }),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px;" },
                    $h("span", { "style": "display: flex; align-items: baseline; gap: 8px; min-width: 0;" },
                      $h("span", { "style": "flex: 1; min-width: 0; font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(a?.short)
                      ),
                      (a?.paid) ? [
                        $h("span", { "style": "align-self: center; height: 18px; padding: 0 7px; border-radius: 999px; display: inline-flex; align-items: center; background: #F5B941; color: #1A1206; font-size: 10px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                          "Placement payé"
                        )
                      ] : null,
                      $h("span", { "style": "flex-shrink: 0; font-size: 12px; color: var(--ink-faint);" },
                        $t(a?.when)
                      )
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 13px; color: var(--ink-faint);" },
                      (a?.mk) ? [
                        $h("span", { "class": "sw-flag sw-flag-14", "data-c": a?.mk, "aria-hidden": "true" })
                      ] : null,
                      $h("span", { "style": "min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(a?.sub)
                      )
                    )
                  )
                )
              ])
            )
          ])
        ),
        $h("div", { "data-swipe-skip": "", "style": "position: fixed; left: 12px; right: 12px; bottom: calc(max(12px, env(safe-area-inset-bottom)) + 72px); z-index: 29; padding: 4px; border-radius: 16px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 14px 36px rgba(0,0,0,0.45);" },
          $h("div", { "class": "m-tc is-flat", "role": "tablist", "aria-label": "Type d’alerte", "data-swipe-tabs": "" },
            ($l($v.tabs)).map((t) => [
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": "min-height: 40px; padding: 0 4px; gap: 5px; font-size: 13px; font-weight: 600;" },
                $t(t?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--ink-faint);" },
                  $t(t?.n)
                )
              )
            ])
          )
        ),
        $h("nav", { "data-tabbar": "", "aria-label": "Navigation principale", "style": "position: fixed; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); z-index: 30; height: 64px; padding: 0 6px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: center; border-radius: 32px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.55);" },
          $h("a", { "href": "/app", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        ($v.d?.on) ? [
          $h("section", { "ref": $v.setDetail, "data-swipe-pager": "", "data-swipe-at": $v.d?.at, "role": "dialog", "aria-modal": "true", "aria-label": $v.d?.aria, "onKeyDown": $v.dKeys, "style": "position: fixed; inset: 0; z-index: 45; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; background: var(--surface); color: var(--ink); font-family: var(--font-body); box-shadow: -24px 0 60px rgba(0,0,0,0.5);" },
            $h("div", { "style": "position: sticky; top: 0; z-index: 2; height: 56px; padding: 0 8px 0 20px; display: flex; align-items: center; gap: 2px; background: rgba(8,11,18,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
              $h("span", { "style": "flex: 1; min-width: 0; font-size: 13px; color: var(--ink-faint); font-variant-numeric: tabular-nums; white-space: nowrap;" },
                $t($v.d?.pos)
              ),
              $h("button", { "data-swipe-prev": "", "type": "button", "onClick": $v.d?.prev, "disabled": $v.d?.noPrev, "aria-label": "Alerte précédente", "style": "position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); border: 0; white-space: nowrap;" },
                "Alerte précédente"
              ),
              $h("button", { "data-swipe-next": "", "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.d?.next, "disabled": $v.d?.noNext, "aria-label": "Alerte suivante", "style": `flex-shrink: 0; width: 44px; height: 44px; opacity: ${$t($v.d?.nextO)};` },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "data-swipe": "", "style": "padding: 16px 20px calc(96px + env(safe-area-inset-bottom)); display: flex; flex-direction: column;" },
              $h("span", { "style": "display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.5; color: #6FB0FF;" },
                $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": $v.d?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $t($v.d?.kick),
                ($v.d?.mk) ? [
                  $h("span", { "aria-hidden": "true" },
                    "·"
                  ),
                  $h("span", { "class": "sw-flag sw-flag-14", "data-c": $v.d?.mk, "aria-hidden": "true" }),
                  $t($v.d?.mkName)
                ] : null,
                $h("span", { "aria-hidden": "true" },
                  "·"
                ),
                $t($v.d?.when),
                ($v.d?.paid) ? [
                  $h("span", { "style": "height: 18px; padding: 0 7px; border-radius: 999px; display: inline-flex; align-items: center; background: #F5B941; color: #1A1206; font-size: 10px; letter-spacing: 0; text-transform: none; font-weight: 700;" },
                    "Placement payé"
                  )
                ] : null
              ),
              $h("h1", { "style": "margin: 10px 0 0; font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.16; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;" },
                $t($v.d?.title)
              ),
              $h("div", { "style": "margin-top: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;" },
                ($l($v.d?.stats)).map((s) => [
                  $h("span", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "font-family: var(--font-display); font-size: 23px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; white-space: nowrap;" },
                      $t(s?.v)
                    ),
                    $h("span", { "style": "font-size: 11px; line-height: 1.3; color: var(--ink-faint);" },
                      $t(s?.l)
                    )
                  )
                ])
              ),
              ($v.d?.isFormat) ? [
                $h("div", { "style": "margin-top: 18px; padding: 14px 14px 10px; border-radius: 18px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
                  $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 10px;" },
                    $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                      "Reprises par jour"
                    ),
                    $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                      $t($v.d?.chartNote)
                    )
                  ),
                  $h("div", { "role": "img", "aria-label": $v.d?.chartAria, "style": "margin-top: 10px; height: 92px; display: flex; align-items: flex-end; gap: 6px;" },
                    ($l($v.d?.bars)).map((b) => [
                      $h("span", { "style": "flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 5px;" },
                        $h("i", { "style": `display: block; width: 100%; height: ${$t(b?.h)}px; border-radius: 6px 6px 2px 2px; background: ${$t(b?.bg)};` }),
                        $h("span", { "style": "font-size: 10px; color: var(--ink-faint); white-space: nowrap;" },
                          $t(b?.d)
                        )
                      )
                    ])
                  )
                ),
                ($v.d?.hasVids) ? [
                  $h("span", { "style": "margin-top: 20px; font-size: 13px; font-weight: 600; color: var(--ink-soft);" },
                    $t($v.d?.vTitle)
                  ),
                  $h("div", { "style": "margin-top: 10px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px;" },
                    ($l($v.d?.vids)).map((v) => [
                      $h("a", { "class": "sw-video", "href": $u(v?.href), "aria-label": v?.aria, "style": "display: block; aspect-ratio: 3 / 4; border-radius: 10px;" },
                        $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "eager" }),
                        $h("span", { "class": "sw-video-shade" }),
                        $h("span", { "style": "position: absolute; left: 5px; bottom: 4px; font-size: 11px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.85);" },
                          $t(v?.v)
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.d?.hasAccs) ? [
                  $h("span", { "style": "margin-top: 20px; font-size: 13px; font-weight: 600; color: var(--ink-soft);" },
                    "Les comptes qui le reprennent"
                  ),
                  $h("div", { "style": "margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 10px;" },
                    ($l($v.d?.accs)).map((c) => [
                      $h("span", { "style": "display: flex; align-items: center; gap: 10px; min-width: 0;" },
                        $h("span", { "aria-hidden": "true", "style": `width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(c?.bg)}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); font-size: 13px; font-weight: 700; color: #FFFFFF;` },
                          $t(c?.i)
                        ),
                        $h("span", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                          $h("span", { "style": "font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(c?.h)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(c?.v)
                          )
                        )
                      )
                    ])
                  ),
                  ($v.d?.accMore) ? [
                    $h("span", { "style": "margin-top: 10px; font-size: 12px; color: var(--ink-faint);" },
                      $t($v.d?.accMore)
                    )
                  ] : null
                ] : null,
                ($v.d?.hasApps) ? [
                  $h("div", { "style": "margin-top: 20px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      "Les apps qui l’utilisent :"
                    ),
                    ($l($v.d?.apps)).map((p) => [
                      (p?.link) ? [
                        $h("a", { "class": "ib-pill", "href": $u(p?.href), "style": "height: 36px;" },
                          $t(p?.name)
                        )
                      ] : null,
                      (p?.nolink) ? [
                        $h("span", { "class": "ib-pill", "style": "height: 36px;" },
                          $t(p?.name)
                        )
                      ] : null
                    ]),
                    ($v.d?.appsMore) ? [
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t($v.d?.appsMore)
                      )
                    ] : null
                  )
                ] : null
              ] : null,
              ($v.d?.isVideo) ? [
                $h("div", { "style": "margin-top: 20px; display: flex; gap: 16px; align-items: flex-start;" },
                  $h("a", { "class": "sw-video", "href": $u($v.d?.href), "aria-label": $v.d?.cta, "style": "display: block; flex: 0 0 46%; aspect-ratio: 9 / 16; border-radius: 16px;" },
                    $h("img", { "class": "sw-cover", "src": $u($v.d?.cover), "alt": "", "loading": "eager" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views" },
                        $t($v.d?.views)
                      )
                    )
                  ),
                  $h("div", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; padding-top: 2px;" },
                    ($v.d?.hook) ? [
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                        $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                          "L’accroche"
                        ),
                        $h("p", { "style": "margin: 0; font-size: 16px; font-weight: 600; line-height: 1.4; color: var(--ink); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden;" },
                          "« ", $t($v.d?.hook), " »"
                        )
                      )
                    ] : null,
                    $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                      $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                        "Le compte"
                      ),
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 9px; min-width: 0;" },
                        $h("span", { "aria-hidden": "true", "style": `width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t($v.d?.accBg)}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); font-size: 13px; font-weight: 700; color: #FFFFFF;` },
                          $t($v.d?.accI)
                        ),
                        $h("span", { "style": "min-width: 0; font-size: 14px; font-weight: 600; overflow-wrap: anywhere;" },
                          $t($v.d?.handle)
                        )
                      )
                    ),
                    ($v.d?.app) ? [
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 8px; align-items: flex-start;" },
                        $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                          "L’app"
                        ),
                        ($v.d?.app?.link) ? [
                          $h("a", { "class": "ib-pill", "href": $u($v.d?.app?.href), "style": "max-width: 100%; height: 40px; padding: 0 14px 0 6px; gap: 9px;" },
                            $h("span", { "class": `sw-app-icon ${$t($v.d?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px; font-size: 12px; flex-shrink: 0;" },
                              ($v.d?.app?.icon) ? [
                                $h("img", { "class": "sw-logo-img", "src": $u($v.d?.app?.icon), "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              ($v.d?.app?.noicon) ? [
                                $t($v.d?.app?.ini)
                              ] : null
                            ),
                            $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                              $t($v.d?.app?.name)
                            )
                          )
                        ] : null,
                        ($v.d?.app?.nolink) ? [
                          $h("span", { "class": "ib-pill", "style": "max-width: 100%; height: 40px; padding: 0 14px 0 6px; gap: 9px;" },
                            $h("span", { "class": `sw-app-icon ${$t($v.d?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px; font-size: 12px; flex-shrink: 0;" },
                              ($v.d?.app?.icon) ? [
                                $h("img", { "class": "sw-logo-img", "src": $u($v.d?.app?.icon), "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              ($v.d?.app?.noicon) ? [
                                $t($v.d?.app?.ini)
                              ] : null
                            ),
                            $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                              $t($v.d?.app?.name)
                            )
                          )
                        ] : null
                      )
                    ] : null
                  )
                )
              ] : null
            ),
            $h("div", { "data-thumb": "", "style": "position: fixed; left: 14px; right: 14px; bottom: max(14px, env(safe-area-inset-bottom)); z-index: 30; display: flex; align-items: center; gap: 8px; pointer-events: none;" },
              $h("button", { "data-thumb-back": "", "type": "button", "ref": $v.setBack, "onClick": $v.closeD, "aria-label": "Revenir à Alertes", "style": "pointer-events: auto; flex: 0 3 auto; min-width: 50px; height: 50px; box-sizing: border-box; padding: 0 18px 0 12px; display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 25px; background: rgba(22,27,38,0.9); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 36px rgba(0,0,0,0.5); color: #FFFFFF; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                  "Alertes"
                )
              ),
              $h("span", { "aria-hidden": "true", "style": "flex: 1 1 0;" }),
              $h("span", { "data-thumb-act": "", "style": "pointer-events: auto; flex: 0 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;" },
                $h("button", { "type": "button", "onClick": $v.openAj, "aria-pressed": $v.d?.kept, "aria-label": $v.d?.keepLabel, "style": "flex-shrink: 0; width: 50px; height: 50px; padding: 0; border: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(22,27,38,0.9); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 36px rgba(0,0,0,0.5); color: #FFFFFF; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.d?.keepFill, "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                ($v.d?.href) ? [
                  $h("a", { "class": "sw-btn sw-btn-primary", "href": $u($v.d?.href), "style": "flex: 0 1 auto; min-width: 0; height: 50px; padding: 0 5px 0 18px; gap: 10px; font-size: 15px; text-decoration: none;" },
                    $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                      $t($v.d?.cta)
                    ),
                    $h("span", { "class": "sw-btn-tile", "style": "width: 36px; height: 36px;" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ] : null
              )
            )
          )
        ] : null,
        ($v.rw) ? [
          $h("button", { "data-sheet-veil": "", "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeRw, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "data-sheet": "", "role": "dialog", "aria-modal": "true", "aria-label": "Tes alertes", "onKeyDown": $v.rwKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px;" },
            $h("div", { "data-sheet-handle": "", "style": "display: flex; justify-content: center; padding: 10px 0 6px;" },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 2px 0 6px;" },
              $h("span", { "style": "display: flex; align-items: baseline; gap: 10px;" },
                $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                  "Tes alertes"
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  $t($v.rwCount)
                )
              )
            ),
            $h("p", { "style": "margin: 0 0 6px; font-size: 13px; line-height: 1.45; color: var(--ink-faint);" },
              "Elles trient cette liste avec « Selon tes alertes »."
            ),
            $h("div", { "data-sheet-opts": "", "role": "list", "style": "display: flex; flex-direction: column; padding: 4px 0 12px;" },
              ($l($v.rules)).map((r) => [
                $h("div", { "data-sheet-opt": "", "data-sheet-in": "", "role": "listitem", "style": "display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 0 0 0 10px; border-radius: 14px;" },
                  $h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("button", { "type": "button", "onClick": r?.edit, "aria-label": `Modifier l’alerte ${$t(r?.t)}`, "style": "flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                    $h("span", { "style": "font-size: 15px; font-weight: 600; line-height: 1.3;" },
                      $t(r?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(r?.s),
                      (r?.n) ? [
                        " · ",
                        $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                          $t(r?.n)
                        )
                      ] : null
                    )
                  ),
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": r?.remove, "aria-label": r?.rmLabel, "style": "width: 44px; height: 44px; flex-shrink: 0;" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ])
            ),
            $h("div", { "style": "position: sticky; bottom: 0; z-index: 2; margin: 0 -20px; padding: 14px 20px max(16px, env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 8px; background: linear-gradient(180deg, rgba(13,17,26,0) 0%, rgba(13,17,26,0.96) 34%, #0D111A 100%);" },
              $h("button", { "class": "sw-btn sw-btn-ghost", "type": "button", "ref": $v.setRwClose, "onClick": $v.closeRw, "style": "flex: 0 0 auto; height: 50px; padding: 0 22px; background: #191D25; font-size: 15px;" },
                "Fermer"
              ),
              $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.openNa, "style": "flex: 1 1 0; min-width: 0; height: 50px; justify-content: space-between; padding: 0 5px 0 20px; font-size: 15px; text-decoration: none;" },
                $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                  "Créer une alerte"
                ),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                  )
                )
              )
            )
          )
        ] : null,
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
