// Généré par scripts/dc2preact.py depuis design/app/AlertesA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import NouvelleAlerte from './NouvelleAlerte.js';
import Palette from './Palette.js';

export default class Alertes extends DCLogic {
  // ── Filtres dans l'adresse (audit F25, 19/11) ──
  // Les filtres de la liste vivent dans la requête de l'adresse, avec les mêmes noms sur ordinateur et sur téléphone :
  // quand la mise en page bascule (rotation d'un iPad, fenêtre redimensionnée), l'autre version de l'écran se monte et
  // les relit dans this.props.query. Un choix va dans l'état et dans l'adresse (history.replaceState : pas d'entrée
  // d'historique, pas de remontage, la position reste). Sur le canevas (pas de props.query) : l'état local, et
  // location.search en lecture seule. filters() : clé de l'état -> [paramètre, 'l' liste (clé répétée) | 'b' oui/non |
  // 's' valeur, valeur par défaut (jamais écrite)]. L'écran écarte une valeur qu'il ne connaît pas (son défaut).
  // « alerte » : l'alerte ouverte (boîte de réception B2, 20/11), écrite seulement quand on la choisit ; le téléphone
  // l'ouvre en plein écran (MAlertes, maquette T1).
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

  // ── La boîte de réception : l'alerte ouverte, lue, gardée visible ──
  componentDidMount() {
    // « Tes alertes » : un clic ailleurs ou Échap ferme la fenêtre.
    this.out = (e) => {
      if (!(this.state || {}).rw || !this.menuEl || this.menuEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-menu-trigger]')) return;
      this.setState({ rw: false });
    };
    document.addEventListener('mousedown', this.out);
    this.esc = (e) => { if (e.key === 'Escape' && (this.state || {}).rw) this.setState({ rw: false }); };
    document.addEventListener('keydown', this.esc);
    this.settle(true);
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.out);
    document.removeEventListener('keydown', this.esc);
    clearTimeout(this.flushT);
    this.flush();
  }
  componentDidUpdate() { this.settle(false); }
  // Après chaque rendu : l'alerte ouverte est marquée lue, sa ligne reste visible dans la liste (et prend le focus au
  // clavier), le détail repart du haut, et les fiches des formats voisins se chargent d'avance.
  settle(first) {
    const k = this._sel;
    if (k && k !== this._shownKey) {
      this._shownKey = k;
      if (!first && this.detailEl) this.detailEl.scrollTop = 0;
      this.reveal(k, first);
    } else if (this._focusSel && k) this.reveal(k, false);
    this._focusSel = false;
    if (k && this._readReady && this._marked !== k) { this._marked = k; this.markOne(k); }
    (this._near || []).forEach((id) => this.warmFmt(id));
  }
  reveal(k, center) {
    const L = this.listEl;
    if (!L) return;
    const row = [].slice.call(L.querySelectorAll('[data-ib-opt]')).filter((r) => r.getAttribute('data-ib-opt') === k)[0];
    if (!row) return;
    if (this._focusSel) { try { row.focus({ preventScroll: true }); } catch (e) { row.focus(); } }
    const top = row.offsetTop, bot = top + row.offsetHeight;
    if (center && bot > L.clientHeight) L.scrollTop = Math.max(0, top - L.clientHeight / 3);
    else if (top < L.scrollTop + 8) L.scrollTop = Math.max(0, top - 44);
    else if (bot > L.scrollTop + L.clientHeight - 8) L.scrollTop = bot - L.clientHeight + 8;
  }
  // La fiche d'un format (format:<id>, ses 30 reprises les plus vues) et ses premières miniatures, avant qu'on l'ouvre.
  warmFmt(id) {
    const P = this.props || {};
    if (typeof P.get !== 'function' || !id) return;
    const d = P.get('format:' + id);
    if (!d || !d.members || typeof Image === 'undefined') return;
    this._pre = this._pre || new Set();
    d.members.filter((m) => m.cover).slice(0, 8).forEach((m) => {
      if (this._pre.has(m.cover)) return;
      this._pre.add(m.cover);
      const im = new Image();
      im.decoding = 'async';
      im.src = m.cover;
    });
  }
  // « Lu » d'une alerte ouverte : une empreinte courte de sa clé dans seen.alertsRead (texte, séparées par des espaces).
  // La forme de « seen » n'accepte que des champs simples (convex/saved.ts) ; les 60 alertes y tiennent (7 caractères
  // chacune, 500 au plus). Seules y restent les alertes encore non lues par la date (aujourd'hui et hier, ou après
  // « Tout marquer comme lu »). Écrit 400 ms après le dernier choix : parcourir la liste au clavier n'écrit qu'une fois.
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
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'alertes' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false }),
      setList: (el) => { this.listEl = el; }, setDetail: (el) => { this.detailEl = el; }, setMenu: (el) => { this.menuEl = el; }
    };
  }
  // Noms de pays et de langues, partagés par baseVals (lignes des alertes) et extraVals (règles) : déclarés dans une
  // seule méthode pour que les deux les voient (audit Q3 : ils vivaient dans extraVals et baseVals plantait).
  nomsPays() {
    const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    // « depuis la France », « depuis les États-Unis », « depuis l’Allemagne », « depuis Singapour » ; rien pour un pays inconnu.
    const DEPUIS = (n) => { n = String(n || ''); if (!n || n === 'Pays inconnu' || /^[A-Z]{2}$/.test(n)) return ''; if (/^(Singapour|Chypre|Cuba|Madagascar|Taïwan|Porto Rico|Malte|Haïti|Bahreïn|Israël|Monaco|Oman|Hong Kong|Maurice|La Réunion|Djibouti)$/.test(n)) return 'depuis ' + n;
      if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'depuis les ' + n; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'depuis l’' + n;
      return 'depuis ' + (/e$/.test(n.split(/[\s-]/)[0]) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize|Royaume-Uni|Suriname)$/.test(n) ? 'la ' : 'le ') + n; };
    // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
    const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
    const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays, pas de « autres langues »
    return { MKN, DEPUIS, LANGN, MKW };
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

    // Non lu : publié après « Tout marquer comme lu » (sans rien d'enregistré : aujourd'hui ou hier), et jamais ouvert.
    const timeUnread = (a) => (seenAt !== null ? !!a.at && a.at > seenAt : !!a.fresh);
    this._timeUnread = new Set(items.filter(timeUnread).map((a) => this.fp(a.key)));
    const opened = new Set(String((seenV && seenV.alertsRead) || '').split(' ').filter(Boolean));
    (this.pend || new Set()).forEach((x) => opened.add(x));
    const stored = (a) => timeUnread(a) && !opened.has(this.fp(a.key));

    // L'alerte ouverte : celle de l'adresse si elle est dans la liste, sinon la première non lue (gardée tant qu'elle y
    // est, pour qu'elle ne change pas quand elle devient lue), sinon la première.
    let sel = this.fv('sel');
    const inVis = (k) => !!k && vis.some((a) => a.key === k);
    if (!inVis(sel)) {
      if (!inVis(this._auto)) {
        const pickA = ((vis.filter(stored)[0]) || vis[0] || {}).key || null;
        if (this._readReady) this._auto = pickA;
        sel = pickA;
      } else sel = this._auto;
    }
    this._sel = sel;
    const unread = (a) => a.key !== sel && stored(a);
    const at = vis.map((a) => a.key).indexOf(sel);
    // Les formats voisins de l'alerte ouverte : leur fiche se charge d'avance (settle).
    this._near = [vis[at], vis[at + 1], vis[at - 1], vis[at + 2], vis[at - 2]].filter((a) => a && a.kind === 'format').map((a) => a.f.id);
    const choose = (k) => { if (k && k !== this._sel) this.setF({ sel: k }); if ((this.state || {}).aj) this.setState({ aj: false }); };

    const groups = [];
    vis.forEach((a) => {
      const on = a.key === sel;
      const it = Object.assign({}, a, { on: on ? 'true' : 'false', ti: on ? '0' : '-1', dot: unread(a) ? 'true' : 'false',
        pick: () => choose(a.key), warm: () => { if (a.kind === 'format') this.warmFmt(a.f.id); } });
      if (!groups.length || groups[groups.length - 1].g !== a.g) groups.push({ g: a.g, items: [], first: !groups.length, pad: groups.length ? '18px 12px 8px' : '6px 12px 8px' });
      groups[groups.length - 1].items.push(it);
    });
    const listKeys = (e) => {
      const n = vis.length;
      if (!n) return;
      const i = Math.max(0, at);
      const to = e.key === 'ArrowDown' ? Math.min(n - 1, i + 1) : e.key === 'ArrowUp' ? Math.max(0, i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      this._focusSel = true;
      if (vis[to].key !== sel) choose(vis[to].key); else this.forceUpdate();
    };

    // Le nombre d'une alerte compte les alertes listées ici (document « alerts » : 40 vidéos et 20 formats au plus), pas toute la semaine.
    const count = (r) => { if (!known(r) || unsure(r)) return ''; const c = hits(r).length;
      return c === 0 ? 'aucune parmi les alertes' : c + ' parmi les alertes'; };
    const editId = st.na ? st.editId || null : null;
    const rules = mine.map((r) => ({ id: String(r.id || ''), t: titleOf(r), s: subOf(r), n: count(r), ico: ICO[r.quoi] || ICO.format,
      edit: () => this.setState({ na: true, editId: r.id, rw: false }),
      remove: () => keepRules(mine.filter((x) => x !== r)) }));
    const same = (p, q) => p.quoi === q.quoi && (p.niche || null) === (q.niche || null) && p.seuil === q.seuil && (p.marche || null) === (q.marche || null);
    const kindN = (r, n) => n + (r.quoi === 'format' ? (n > 1 ? ' formats' : ' format') : (n > 1 ? ' vidéos' : ' vidéo'));
    const TABIC = { Toutes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0', Formats: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4', 'Vidéos': 'M4 6h11v12H4zM15 10l5-3v10l-5-3z', Comptes: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' };

    // En-tête : les nouvelles (non lues) de toute la liste, quel que soit l'onglet.
    const nU = pool.filter(unread).length;
    const since = seenAt === null ? 'depuis hier' : b.fmt.ago(seenAt) === 0 ? 'depuis ' + b.fmt.hh(seenAt) : b.fmt.ago(seenAt) === 1 ? 'depuis hier' : 'depuis le ' + b.fmt.dm(seenAt);
    const subtitle = nU ? nU + (nU > 1 ? ' nouvelles ' : ' nouvelle ') + since : 'Rien de nouveau ' + since;

    // Ce que « Garder » range, et s'il y est déjà.
    const fs = site ? P.saved('folders') : null;
    const keptOf = (kind, id) => (Array.isArray(fs) ? fs : []).some((f) => (f.items || []).some((x) => x.kind === kind && x.id === id));

    // ── Le détail de l'alerte ouverte ──
    const AV = ['#3A86F0', '#22A06B', '#D95926', '#9085E9', '#C98500', '#D55181', '#199E70'];
    const avBg = (h) => { let s = 0; for (const c of String(h)) s += c.codePointAt(0); return 'linear-gradient(160deg, ' + AV[s % AV.length] + ', #0B1220)'; };
    const ini = (h) => (Array.from(String(h).replace(/^@/, ''))[0] || '?').toUpperCase();
    const others = (n) => 'et ' + n + (n > 1 ? ' autres' : ' autre');
    const a = vis[at] || null;
    let d;
    if (!a) d = { on: false, none: true, key: '', noneText: groups.length ? '' : 'Aucune alerte à ouvrir.' };
    else if (a.kind === 'format') {
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
      const lab = (dt) => dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const nRep = (c) => c + (c > 1 ? ' reprises' : ' reprise');
      const bars = days.map((dt, i) => {
        const c = counts[i];
        return { d: lab(dt), t: loading ? lab(dt) : lab(dt) + ' : ' + nRep(c),
          h: loading ? 4 : c ? Math.max(8, Math.round(c / mx * 84)) : 3,
          bg: loading ? 'rgba(255,255,255,0.06)' : i === 6 && c ? 'linear-gradient(180deg, #4C9AFF, #0B6FE0)' : c ? 'rgba(76,154,255,0.28)' : 'rgba(255,255,255,0.08)' };
      });
      // Les vidéos qui marchent : les reprises au-dessus de la normale de leur compte, les plus vues d'abord.
      const good = ms.filter((m) => m.cover && typeof m.x === 'number' && m.x > 1).slice(0, 5);
      const shown = good.length ? good : ms.filter((m) => m.cover).slice(0, 5);
      const seenH = new Set();
      const accs = [];
      ms.forEach((m) => { if (accs.length < 4 && !seenH.has(m.handle)) { seenH.add(m.handle); accs.push({ h: '@' + m.handle, v: nf(m.views), i: ini(m.handle), bg: avBg(m.handle) }); } });
      const apps = (f.apps || []).filter(Boolean);
      const cover = ((ms.filter((m) => m.cover)[0]) || {}).cover || null;
      const kept = keptOf('format', f.id);
      d = { on: true, none: false, key: a.key, isFormat: true, isVideo: false, ico: a.ico, kick: hook ? 'Une accroche se répand' : 'Un son se répand',
        mk: a.mk, mkName: a.mk ? M[a.mk] : '', when: kickWhen(f.lastPostAt), paid: false, title: a.title,
        href: D === null ? '' : '/app/formats/' + f.id, cta: 'Voir le format',
        kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardé' : 'Garder', keepFill: kept ? 'currentColor' : 'none',
        ajItem: { kind: 'format', id: f.id, label: hook ? '« ' + f.label + ' »' : f.label, cover },
        stats: [{ v: f.wins + ' sur ' + f.n, l: 'reprises au-dessus de leur normale' }, f.maxViews ? { v: nf(f.maxViews), l: 'vues, la meilleure' } : null,
          typeof f.medX === 'number' ? { v: xf(f.medX), l: 'la normale des comptes, en médiane' } : null].filter(Boolean),
        bars, chartNote: loading ? '' : ms.length < f.n ? 'les ' + ms.length + ' plus vues, sur ' + f.n : '',
        chartAria: 'Reprises par jour : ' + (loading ? 'chargement' : bars.map((x) => x.t).join(', ')),
        vTitle: good.length ? 'Les vidéos qui marchent' : 'Les reprises les plus vues',
        vids: shown.map((m) => ({ src: m.cover, v: nf(m.views), href: '/app/videos/' + m.videoId, aria: '@' + m.handle + ', ' + nf(m.views) + ' vues' })),
        accs, accMore: f.accounts > accs.length ? others(f.accounts - accs.length) : '',
        hasApps: apps.length > 0, apps: apps.slice(0, 3).map((x) => ({ name: x.name, link: x.page !== false, nolink: x.page === false, href: x.page === false ? '' : '/app/apps/' + x.slug })),
        appsMore: apps.length > 3 ? others(apps.length - 3) : '' };
    } else {
      const v = a.v;
      const kept = keptOf('video', v.id);
      const app = v.app ? { name: v.app.name, icon: v.app.icon || '', noicon: !v.app.icon, ini: ini(v.app.name), blank: v.app.icon ? '' : 'sw-app-blank',
        link: v.app.page !== false, nolink: v.app.page === false, href: v.app.page === false ? '' : '/app/apps/' + v.app.slug } : null;
      d = { on: true, none: false, key: a.key, isFormat: false, isVideo: true, ico: a.ico,
        kick: a.typ === 'Compte' ? 'Un compte hors norme' : v.views >= 1e6 ? 'Une vidéo passe le million' : v.x > 1 ? 'Une vidéo au-dessus de sa normale' : 'Une vidéo de la semaine',
        mk: a.mk, mkName: a.mk ? M[a.mk] : '', when: kickWhen(v.publishedAt), paid: !!v.paid, title: a.title,
        href: '/app/videos/' + v.id, cta: 'Voir la vidéo',
        kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardée' : 'Garder', keepFill: kept ? 'currentColor' : 'none',
        ajItem: { kind: 'video', id: v.id, label: v.handle, cover: v.cover || null },
        stats: [{ v: nf(v.views), l: 'vues' }, v.x ? { v: xf(v.x), l: 'la normale du compte' } : null, v.x ? { v: nf(v.views / v.x), l: 'vues d’habitude' } : null].filter(Boolean),
        cover: v.cover || '', views: nf(v.views), hook: v.hook ? String(v.hook).trim() : '', handle: '@' + v.handle, accI: ini(v.handle), accBg: avBg(v.handle), app };
    }

    return {
      groups, d, rules, hasRules: mine.length > 0, noRules: !rulesWait && mine.length === 0, listKeys,
      subtitle, weekCount: vis.length + ' cette semaine',
      noAlert: groups.length === 0, noAlertText: mineOn ? 'Rien cette semaine pour tes alertes' + (tab === 'Toutes' ? '.' : ' dans ce type.') : 'Aucune alerte de ce type cette semaine.',
      tabs: TABS.map((t) => ({ l: t[0], d: TABIC[t[0]] || TABIC.Toutes, n: pool.filter(t[1]).length, on: t[0] === tab ? 'true' : 'false',
        // Un autre onglet : l'alerte ouverte reste si elle y est, sinon la première non lue de l'onglet s'ouvre.
        pick: () => this.setF(pool.filter(keepOf(t[0])).some((x) => x.key === sel) ? { tab: t[0] } : { tab: t[0], sel: null }) })),
      mineOn: mineOn ? 'true' : 'false', toggleMine: () => this.setF({ mine: !mineOn }),
      hasUnread: nU > 0,
      markRead: () => { const v = Object.assign({}, seenV || {}, { alerts: Date.now() }); delete v.alertsRead; if (this.pend) this.pend.clear();
        if (site) P.save('seen', v); else this.setState({ seen: v }); },
      rw: !!st.rw, rwOpen: st.rw ? 'true' : 'false', rwLabel: mine.length ? 'Tes alertes · ' + mine.length : 'Tes alertes',
      toggleRw: () => this.setState({ rw: !(this.state || {}).rw }),
      na: !!st.na, openNa: () => this.setState({ na: true, editId: null, rw: false }), closeNa: () => this.setState({ na: false, editId: null }),
      naRule: editId ? mine.filter((r) => r.id === editId)[0] || null : null,
      naNiches: b.niches || null,
      // Ce que l'alerte en cours de réglage trouve dans les alertes de la semaine (aperçu de « Nouvelle alerte »).
      naPreview: (r) => { if (unsure(r)) return null; const xs = hits(r);
        return { text: xs.length ? kindN(r, xs.length) : 'Aucune pour ces critères', hits: xs.filter((x) => x.covs && x.covs[0] && x.covs[0].src).slice(0, 3).map((x) => ({ src: x.covs[0].src, x: x.big })) }; },
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
    const sample = (globalThis.__dcSample?.["Alertes"]?.["sample"] ?? {"updatedAt":1795181548082,"videos":[],"formats":[]});
    const P = this.props || {};
    const real = !!(P.data && P.data.videos);
    let D = real ? P.data : sample;
    if (!real) {
      const k = Date.now() - (sample.updatedAt || Date.now());
      const sh = (m) => Object.assign({}, m, { publishedAt: m.publishedAt + k });
      D = { updatedAt: Date.now(), videos: (sample.videos || []).map(sh),
        formats: (sample.formats || []).map((f) => Object.assign({}, f, { lastPostAt: f.lastPostAt + k, members: (f.members || []).map(sh), _members: f._members ? f._members.map(sh) : null })) };
    }
    // La fiche d'un format (format:<id>, 30 reprises) : undefined tant qu'elle charge, null si le format n'en a pas.
    const docOf = (id) => {
      if (real) return typeof P.get === 'function' ? P.get('format:' + id) : undefined;
      const f = (D.formats || []).filter((x) => x.id === id)[0];
      return f && f._members ? Object.assign({}, f, { members: f._members }) : null;
    };
    const M = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
    // Nombres : « 289 k », « 6,3 M », « 9,4 k » ; multiplicateur « 1 947× », « 1,1× ».
    const trim = (s) => s.replace(/[.,]0$/, '').replace('.', ',');
    const nf = (n) => (n >= 1e6 ? trim((n / 1e6).toFixed(1)) + ' M' : n >= 1e4 ? Math.round(n / 1e3) + ' k' : n >= 1e3 ? trim((n / 1e3).toFixed(1)) + ' k' : String(Math.round(n)));
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const de = (n) => (/^[aeiouyhàâäéèêëîïôöùûü]/i.test(n) ? 'd’' : 'de ') + n;
    const day0 = (ms) => { const dt = new Date(ms); dt.setHours(0, 0, 0, 0); return dt.getTime(); };
    const today = day0(Date.now());
    const ago = (ms) => Math.max(0, Math.round((today - day0(ms)) / 86400000));
    const hh = (ms) => new Date(ms).getHours() + ' h';
    const dm = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const wd = (ms) => new Date(ms).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    const dayLabel = (ms) => { const k = ago(ms); if (k === 0) return 'Aujourd’hui'; if (k === 1) return 'Hier'; const s = wd(ms); return s.charAt(0).toUpperCase() + s.slice(1); };
    const kickWhen = (ms) => { const k = ago(ms); return (k === 0 ? 'aujourd’hui ' : k === 1 ? 'hier ' : 'le ' + dm(ms) + ', ') + hh(ms); };
    // « original sound - poseract » : « son de @poseract » (le son d'un compte, comme sur la maquette).
    const son = (s) => { const m = String(s || '').match(/^(?:original sound|son original|sonido original|som original|suono originale|originalton|оригинальный звук)\s*[-–—]\s*(.+)$/i); return m ? 'son de @' + m[1].trim() : String(s || ''); };
    const I = { video: 'M4 6h11v12H4zM15 10l5-3v10l-5-3z', compte: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4' };
    // Les alertes du Radar (document « alerts », convex/radarModels.ts) : les vidéos de la semaine qui font le plus de
    // fois leur normale, et les formats apparus cette semaine. Rangées par jour de publication (dernière reprise pour un
    // format). Une vidéo d'un million de vues ou plus : « Vidéo » ; sinon à 100× sa normale ou plus : « Compte ».
    const items = [];
    (D.videos || []).forEach((v) => {
      const app = v.app ? v.app.name : '';
      const mk = v.market && v.market !== 'XX' ? v.market : '';
      const million = v.views >= 1e6;
      const acc = !million && v.x >= 100;
      const une = 'Une vidéo ' + (app ? de(app) + ' ' : '');
      items.push({ key: 'v-' + v.id, kind: 'video', v, at: v.publishedAt, typ: acc ? 'Compte' : 'Vidéo', ico: acc ? I.compte : I.video,
        title: million ? une + 'passe ' + Math.floor(v.views / 1e6) + ' M de vues' : acc ? '@' + v.handle + ' fait ' + xf(v.x) + ' sa normale' : une + (v.x ? 'à ' + xf(v.x) + ' sa normale' : 'à ' + nf(v.views) + ' vues'),
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
      const A = P.get ? P.get('apps') : null;
      const NI = A && A.apps ? Object.fromEntries(A.apps.map((x) => [x.slug, x.niche || ''])) : null;
      nicheOf = (a) => (a.kind === 'format' ? a.niche : NI ? NI[a.slug] || '' : null);
      if (A && A.niches) niches = A.niches.slice().sort((p, q) => p.localeCompare(q, 'fr'));
    } else nicheOf = (a) => (a.kind === 'format' ? a.niche : ''); // canevas : la niche des apps d'exemple n'est pas connue
    return { items, sampleRules, niches, nicheOf, docOf, fmt: { nf, xf, kickWhen, M, MKW, ago, hh, dm } };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 100vh; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; height: 100vh; height: 100dvh; min-height: 640px; box-sizing: border-box; padding: 30px clamp(24px, 2.8vw, 40px); display: flex; flex-direction: column; gap: 20px; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 14px 24px;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 34px; line-height: 1.05; font-weight: 700; letter-spacing: -0.035em;" },
                "Alertes"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                $t($v.subtitle)
              )
            ),
            $h("div", { "style": "margin-left: auto; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px;" },
              $h("div", { "role": "tablist", "aria-label": "Type d’alerte", "style": "display: flex; gap: 6px;" },
                ($l($v.tabs)).map((t) => [
                  $h("button", { "type": "button", "role": "tab", "class": "ib-chip", "aria-selected": t?.on, "onClick": t?.pick },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t(t?.l), " · ", $t(t?.n)
                  )
                ])
              ),
              $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 22px; margin: 0 4px; background: var(--line);" }),
              ($v.hasRules) ? [
                $h("button", { "type": "button", "class": "ib-chip", "aria-pressed": $v.mineOn, "onClick": $v.toggleMine },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Selon tes alertes"
                )
              ] : null,
              $h("div", { "style": "position: relative;" },
                $h("button", { "type": "button", "class": "fl-trig", "data-menu-trigger": "true", "data-fl-trig": "regles", "data-on": "false", "onClick": $v.toggleRw, "aria-expanded": $v.rwOpen, "aria-haspopup": "dialog", "style": "display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 11px 0 13px; border: 0; border-radius: 999px; color: var(--ink); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.rwLabel),
                  $h("svg", { "class": "fl-chev", "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                ($v.rw) ? [
                  $h("div", { "ref": $v.setMenu, "role": "dialog", "aria-label": "Tes alertes", "data-fl": "regles", "class": "fl-pan", "style": "right: 0; width: 500px;" },
                    $h("div", { "class": "fl-side" },
                      $h("span", { "class": "fl-head", "data-fl-in": "", "style": "margin-top: 6px;" },
                        "Tes alertes"
                      ),
                      ($v.hasRules) ? [
                        $h("div", { "class": "fl-list", "data-fl-list": "", "role": "list" },
                          ($l($v.rules)).map((r) => [
                            $h("div", { "class": "fl-opt", "role": "listitem", "data-fl-opt": r?.id, "style": "height: 60px; padding: 0 8px 0 12px; cursor: default;" },
                              $h("span", { "class": "fl-ic" },
                                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ),
                              $h("button", { "type": "button", "onClick": r?.edit, "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;" },
                                $h("span", { "style": "font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                  $t(r?.t)
                                ),
                                $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                  $t(r?.s),
                                  (r?.n) ? [
                                    " · ",
                                    $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                                      $t(r?.n)
                                    )
                                  ] : null
                                )
                              ),
                              $h("button", { "type": "button", "class": "fl-qx", "onClick": r?.edit, "aria-label": "Modifier cette alerte", "title": "Modifier", "style": "width: 30px; height: 30px; border-radius: 9px;" },
                                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ),
                              $h("button", { "type": "button", "class": "fl-qx", "onClick": r?.remove, "aria-label": "Supprimer cette alerte", "title": "Supprimer", "style": "width: 30px; height: 30px; border-radius: 9px;" },
                                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                                )
                              )
                            )
                          ])
                        )
                      ] : null,
                      ($v.noRules) ? [
                        $h("span", { "class": "fl-empty" },
                          "Aucune alerte pour l’instant."
                        )
                      ] : null
                    )
                  )
                ] : null
              ),
              $h("button", { "class": "ib-chip", "type": "button", "onClick": $v.openNa },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                ),
                "Créer une alerte"
              )
            )
          ),
          $h("div", { "style": "flex: 1; min-height: 0; display: flex; gap: 16px;" },
            $h("section", { "aria-label": "Les alertes de la semaine", "style": "width: clamp(330px, 32vw, 440px); flex-shrink: 0; min-height: 0; display: flex; flex-direction: column; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge); overflow: hidden;" },
              $h("div", { "ref": $v.setList, "data-ib-list": "", "role": "listbox", "aria-label": "Alertes", "onKeyDown": $v.listKeys, "style": "position: relative; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; padding: 10px;" },
                ($v.noAlert) ? [
                  $h("p", { "style": "margin: 12px; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
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
                        ),
                        ($v.hasUnread) ? [
                          $h("span", { "aria-hidden": "true", "style": "font-size: 12px; color: var(--ink-faint);" },
                            "·"
                          ),
                          $h("button", { "type": "button", "onClick": $v.markRead, "style": "padding: 0; border: 0; background: transparent; font: inherit; font-size: 12px; font-weight: 600; color: var(--accent); white-space: nowrap; cursor: pointer;" },
                            "Tout marquer comme lu"
                          )
                        ] : null
                      ] : null
                    ),
                    ($l(g?.items)).map((a) => [
                      $h("button", { "type": "button", "role": "option", "class": "ib-row", "data-ib-opt": a?.key, "aria-selected": a?.on, "tabindex": a?.ti, "onClick": a?.pick, "onMouseEnter": a?.warm },
                        $h("span", { "class": "ib-dot", "data-on": a?.dot, "aria-hidden": "true" }),
                        $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                          $h("span", { "style": "display: flex; align-items: baseline; gap: 8px; min-width: 0;" },
                            $h("span", { "style": "flex: 1; min-width: 0; font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
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
                          $h("span", { "style": "display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12px; color: var(--ink-faint);" },
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
              )
            ),
            $h("section", { "ref": $v.setDetail, "data-ib-detail": "", "data-ib-key": $v.d?.key, "aria-label": "L’alerte ouverte", "style": "position: relative; flex: 1; min-width: 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 24px 26px; display: flex; flex-direction: column; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              ($v.d?.none) ? [
                $h("p", { "style": "margin: auto; font-size: 15px; color: var(--ink-muted);" },
                  $t($v.d?.noneText)
                )
              ] : null,
              ($v.d?.on) ? [
                $h("div", { "data-ib-in": "", "style": "display: flex; align-items: center; gap: 12px; min-height: 40px;" },
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6FB0FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
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
                      $h("span", { "style": "margin-left: 4px; height: 18px; padding: 0 7px; border-radius: 999px; display: inline-flex; align-items: center; background: #F5B941; color: #1A1206; font-size: 10px; letter-spacing: 0; text-transform: none; font-weight: 700;" },
                        "Placement payé"
                      )
                    ] : null
                  ),
                  $h("span", { "style": "position: relative; display: inline-flex; flex-shrink: 0;" },
                    $h("button", { "data-aj-trigger": "true", "type": "button", "class": "sw-btn sw-btn-ghost sw-btn-sm", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "aria-pressed": $v.d?.kept, "style": "gap: 10px; padding: 0 14px 0 16px; border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.05);" },
                      $t($v.d?.keepLabel),
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.d?.keepFill, "stroke": "currentColor", "stroke-width": "2", "stroke-linejoin": "round" })
                      )
                    ),
                    ($v.aj) ? [
                      $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                        $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.d?.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                      )
                    ] : null
                  ),
                  ($v.d?.href) ? [
                    $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": $u($v.d?.href), "style": "flex-shrink: 0; text-decoration: none;" },
                      $t($v.d?.cta),
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  ] : null
                ),
                $h("h2", { "data-ib-in": "", "style": "margin: 12px 0 0; font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.18; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                  $t($v.d?.title)
                ),
                $h("div", { "data-ib-in": "", "style": "margin-top: 14px; display: flex; gap: 34px; flex-wrap: wrap;" },
                  ($l($v.d?.stats)).map((s) => [
                    $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                      $h("span", { "style": "font-family: var(--font-display); font-size: 30px; font-weight: 700; letter-spacing: -0.03em; line-height: 1;" },
                        $t(s?.v)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(s?.l)
                      )
                    )
                  ])
                ),
                ($v.d?.isFormat) ? [
                  $h("div", { "data-ib-in": "", "style": "margin-top: 20px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px;" },
                    $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                      "Reprises par jour"
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t($v.d?.chartNote)
                    )
                  ),
                  $h("div", { "role": "img", "aria-label": $v.d?.chartAria, "style": "margin-top: 12px; height: 104px; flex-shrink: 0; display: flex; align-items: flex-end; gap: 10px;" },
                    ($l($v.d?.bars)).map((b) => [
                      $h("span", { "title": b?.t, "style": "flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px;" },
                        $h("i", { "data-ib-bar": "", "style": `display: block; width: 100%; height: ${$t(b?.h)}px; border-radius: 6px 6px 3px 3px; background: ${$t(b?.bg)};` }),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          $t(b?.d)
                        )
                      )
                    ])
                  ),
                  $h("div", { "data-ib-in": "", "style": "margin-top: 18px;" },
                    $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                      $t($v.d?.vTitle)
                    ),
                    $h("div", { "style": "margin-top: 10px; height: 128px; display: flex; gap: 10px;" },
                      ($l($v.d?.vids)).map((v) => [
                        $h("a", { "class": "sw-video", "href": $u(v?.href), "aria-label": v?.aria, "style": "display: block; width: 96px; height: 128px; aspect-ratio: auto; flex-shrink: 0; border-radius: 12px;" },
                          $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "eager" }),
                          $h("span", { "class": "sw-video-shade" }),
                          $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-size: 11px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.85);" },
                            $t(v?.v)
                          )
                        )
                      ])
                    )
                  ),
                  $h("div", { "data-ib-in": "", "style": "margin-top: 18px;" },
                    $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                      "Les comptes qui le reprennent"
                    ),
                    $h("div", { "style": "margin-top: 10px; min-height: 38px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;" },
                      ($l($v.d?.accs)).map((c) => [
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; min-width: 0;" },
                          $h("span", { "aria-hidden": "true", "style": `width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(c?.bg)}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); font-size: 12px; font-weight: 700; color: #FFFFFF;` },
                            $t(c?.i)
                          ),
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 2px; min-width: 0;" },
                            $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap;" },
                              $t(c?.h)
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(c?.v)
                            )
                          )
                        )
                      ]),
                      ($v.d?.accMore) ? [
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t($v.d?.accMore)
                        )
                      ] : null
                    )
                  ),
                  ($v.d?.hasApps) ? [
                    $h("div", { "data-ib-in": "", "style": "margin-top: auto; padding-top: 18px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        "Les apps qui l’utilisent :"
                      ),
                      ($l($v.d?.apps)).map((p) => [
                        (p?.link) ? [
                          $h("a", { "class": "ib-pill", "href": $u(p?.href) },
                            $t(p?.name)
                          )
                        ] : null,
                        (p?.nolink) ? [
                          $h("span", { "class": "ib-pill" },
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
                  $h("div", { "data-ib-in": "", "style": "margin-top: 24px; flex: 1 1 auto; min-height: 300px; max-height: 540px; display: flex; gap: 28px; align-items: stretch;" },
                    $h("a", { "class": "sw-video", "href": $u($v.d?.href), "aria-label": $v.d?.cta, "style": "display: block; height: 100%; width: auto; aspect-ratio: 9 / 16; flex-shrink: 0; border-radius: 18px;" },
                      $h("img", { "class": "sw-cover", "src": $u($v.d?.cover), "alt": "", "loading": "eager" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "class": "sw-video-foot" },
                        $h("span", { "class": "sw-video-views" },
                          $t($v.d?.views)
                        )
                      )
                    ),
                    $h("div", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 22px; padding-top: 4px;" },
                      ($v.d?.hook) ? [
                        $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                          $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                            "L’accroche"
                          ),
                          $h("p", { "style": "margin: 0; font-size: 20px; font-weight: 600; line-height: 1.4; letter-spacing: -0.01em; color: var(--ink); overflow-wrap: anywhere;" },
                            "« ", $t($v.d?.hook), " »"
                          )
                        )
                      ] : null,
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
                        $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                          "Le compte"
                        ),
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 10px; min-width: 0;" },
                          $h("span", { "aria-hidden": "true", "style": `width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t($v.d?.accBg)}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); font-size: 13px; font-weight: 700; color: #FFFFFF;` },
                            $t($v.d?.accI)
                          ),
                          $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                            $t($v.d?.handle)
                          )
                        )
                      ),
                      ($v.d?.app) ? [
                        $h("div", { "style": "display: flex; flex-direction: column; gap: 10px; align-items: flex-start;" },
                          $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--ink-soft);" },
                            "L’app"
                          ),
                          ($v.d?.app?.link) ? [
                            $h("a", { "class": "ib-pill", "href": $u($v.d?.app?.href), "style": "height: 40px; padding: 0 14px 0 6px; gap: 9px;" },
                              $h("span", { "class": `sw-app-icon ${$t($v.d?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px; font-size: 12px;" },
                                ($v.d?.app?.icon) ? [
                                  $h("img", { "class": "sw-logo-img", "src": $u($v.d?.app?.icon), "alt": "", "loading": "lazy", "decoding": "async" })
                                ] : null,
                                ($v.d?.app?.noicon) ? [
                                  $t($v.d?.app?.ini)
                                ] : null
                              ),
                              $t($v.d?.app?.name)
                            )
                          ] : null,
                          ($v.d?.app?.nolink) ? [
                            $h("span", { "class": "ib-pill", "style": "height: 40px; padding: 0 14px 0 6px; gap: 9px;" },
                              $h("span", { "class": `sw-app-icon ${$t($v.d?.app?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 8px; font-size: 12px;" },
                                ($v.d?.app?.icon) ? [
                                  $h("img", { "class": "sw-logo-img", "src": $u($v.d?.app?.icon), "alt": "", "loading": "lazy", "decoding": "async" })
                                ] : null,
                                ($v.d?.app?.noicon) ? [
                                  $t($v.d?.app?.ini)
                                ] : null
                              ),
                              $t($v.d?.app?.name)
                            )
                          ] : null
                        )
                      ] : null
                    )
                  )
                ] : null
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
