// Généré par scripts/dc2preact.py depuis design/app/MCreateursCartes.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MCreateursCartes extends DCLogic {

  // Les créateurs d'un marché arrivent par pages de 500 (« creators:<marché> », puis « :2 », « :3 »…) : la suite se
  // lit quand la liste affichée s'en approche, et toute la liste dès qu'un filtre porte sur elle. Plus de plafond.
  creatorsOf(doc, market, P) {
    const st = this.state || {};
    const pages = doc && doc.pages > 1 ? doc.pages : 1;
    // Toute la liste dès qu'un filtre ou un autre tri est posé (sinon on ne filtrerait / trierait que les 500 premiers).
    const whole = !!((st.niches && st.niches.length) || (st.apps && st.apps.length) || (st.fans && st.fans !== 'ALL') || st.active
      || (st.kinds && st.kinds.length) || (st.gender && st.gender !== 'ALL') || (st.sort && st.sort !== 'med'));
    const want = whole ? pages : Math.min(pages, Math.ceil(((st.lim || 50) + 100) / 500));
    let out = (doc && doc.creators) || [];
    let partial = want < pages;
    for (let i = 2; i <= want; i++) {
      const pg = typeof P.get === 'function' ? P.get('creators:' + ((doc && doc.market) || market) + ':' + i) : null;
      if (pg && pg.creators) out = out.concat(pg.creators); else partial = true;
    }
    this._partial = partial;
    return out;
  }

  // La feuille « Trier et filtrer » ouverte : le focus va sur son bouton Fermer.
  componentDidUpdate(pp, ps) {
    const st = this.state || {}; ps = ps || {};
    if (st.fs && !ps.fs && this.fsClose) this.fsClose.focus();
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
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const LIM = 30;
    const P = this.props || {};
    const D = P.data;
    const site = D !== undefined || typeof P.get === 'function';
    // Les marchés : ceux du document (du plus fourni au moins fourni), sinon les cinq de l'exemple ; ?m= n'est retenu que s'il en fait partie.
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const MKD = D && Array.isArray(D.markets) && D.markets.length ? D.markets : null;
    const MKC = MKD ? MKD.map((m) => m[0]) : ['FR', 'US', 'MX', 'ES', 'BR'];
    const qm = String((P.query && P.query.m) || '').toUpperCase();
    const market = st.market || (MKC.indexOf(qm) >= 0 ? qm : '') || (D && D.market) || MKC[0] || 'FR';
    const active = !!st.active, lim = st.lim || LIM;
    const PH0 = {};
    // Les autres pays : « en <pays> » à partir du nom du marché (Italie, Indonésie…).
    const PREP = (n) => { n = String(n || ''); if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return ['aux', 'les ']; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return ['en', 'l’']; return /e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? ['en', 'la '] : ['au', 'le ']; }; // « en France », « au Mexique », « aux États-Unis »
    const PH = new Proxy(PH0, { get: (t, c) => { const n = t[c] || ((MKD || []).filter((m) => m[0] === c).map((m) => m[1] || MKN(c))[0]) || MKN(String(c)); return n ? PREP(n)[0] + ' ' + n : ''; } });
    let src = { rows: b.rows, cards: b.cards, live: b.live }, none = market !== 'FR', total = null, tip = { on: true, text: '@paul.crown4 : 104 abonnés, 33 k vues médianes.' };
    let MK = b.mkt || [];
    if (!site && none) src = { rows: [], cards: [], live: [] };
    if (site) {
      // Sur le site : les créateurs d'un marché (document « creators:<marché> ») ; un autre marché se lit avec get(),
      // et la liste d'avant reste affichée pendant qu'il charge. Lu comme CreateursA.
      MK = (MKD || [['FR', 'France'], ['US', 'Anglophones'], ['MX', 'Mexique'], ['ES', 'Espagne'], ['BR', 'Brésil']]).map((x) => ({ c: x[0], l: x[1] || MKN(x[0]) || x[0], n: x[2] }));
      let doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      if (doc === undefined) doc = this.lastDoc === undefined ? null : this.lastDoc;
      else this.lastDoc = doc;
      const list = doc && doc.creators ? this.creatorsOf(doc, market, P) : [];
      none = list.length === 0;
      total = doc && doc.total ? doc.total : list.length;
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const isN = (n) => typeof n === 'number' && isFinite(n);
      const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
        return hr < 24 ? 'il y a ' + hr + '\u202fh' : d < 60 ? 'il y a ' + d + '\u202fj' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + (d < 548 ? ' an' : ' ans'); };
      const line = (s) => { const ls = String(s || '').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); return ls.filter((x) => /\p{L}/u.test(x))[0] || ls[0] || ''; };
      const all = list.map((c) => {
        const a = c.app || null, ic = (a && a.icon) || '', on = c.posts7d > 0, bst = (c.best || [])[0];
        return { av: c.avatar || '', noav: true, h: '@' + c.handle, kind: c.kind || '', gender: c.gender || '', n7: isN(c.posts7d) ? c.posts7d : 0, href: '/app/createurs/' + c.handle, bio: line(c.bio),
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, appName: a ? a.name : 'Sans app repérée', niche: (a && a.niche) || '',
          fans: isN(c.fans) ? Math.round(c.fans).toLocaleString('en-US').replace(/,/g, '\u202f') : '', fansK: isN(c.fans) ? nf(c.fans) : '—', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '—', nMed: isN(c.median) ? c.median : 0,
          rythme: isN(c.posts7d) ? (on ? c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j') : '',
          last: c.lastPostAt ? 'Dernière ' + ago(c.lastPostAt) : '', lastAt: c.lastPostAt || 0, dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on,
          cov1: [{ src: bst ? bst.cover || '' : '', v: bst ? nf(bst.views) : '' }] };
      });
      src = { rows: all, cards: all, live: all.filter((c) => c.active).slice().sort((p, q) => q.lastAt - p.lastAt).slice(0, 8) };
      const star = all.filter((c) => c.nFans > 0 && c.nMed >= 1e4 && c.nMed >= 10 * c.nFans).sort((x, y) => y.nMed / y.nFans - x.nMed / x.nFans)[0];
      tip = star ? { on: true, text: star.h + ' : ' + star.fans + (star.nFans > 1 ? ' abonnés' : ' abonné') + ', ' + star.med + ' vues médianes.' } : { on: false, text: '' };
    }
    // Trier et filtrer (comme sur ordinateur) : type de contenu (plusieurs), genre (un), classement (vues médianes par défaut).
    const kinds = st.kinds || [], gender = st.gender || 'ALL';
    const KL = [['ambassadeur', 'Ambassadeur'], ['carrousel', 'Carrousel'], ['extrait_repris', 'Extrait repris'], ['histoire_messages', 'Histoire en messages'],
      ['demo_ecran', 'Démo d’écran'], ['motion', 'Motion'], ['ambiance_texte', 'Ambiance + texte']];
    const GL = [['ALL', 'Tous'], ['femme', 'Femmes'], ['homme', 'Hommes'], ['sans_visage', 'Sans visage']];
    const SORTS = [['med', 'Vues médianes'], ['fans', 'Abonnés'], ['pace', 'Rythme (vidéos en 7 j)'], ['recent', 'Dernière vidéo']];
    const sortK = SORTS.some((x) => x[0] === st.sort) ? st.sort : 'med';
    const SORTKEY = { fans: (c) => c.nFans, pace: (c) => c.n7 || 0, recent: (c) => c.lastAt || 0 };
    const okT = (c) => !active || c.active, okK = (c) => kinds.length === 0 || kinds.indexOf(c.kind) >= 0, okG = (c, g) => g === 'ALL' || c.gender === g;
    const pool = (xs) => { const out = (xs || []).filter((c) => okT(c) && okK(c) && okG(c, gender)); if (SORTKEY[sortK]) out.sort((x, y) => SORTKEY[sortK](y) - SORTKEY[sortK](x)); return out; };
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    const comptes = (n) => grp(n) + (n > 1 ? ' comptes' : ' compte');
    const base = src.rows || src.cards || [];
    const pick = (on) => ({ sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500 });
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const reset = { lim: LIM };
    const sItems = SORTS.map((x) => Object.assign({ label: x[1], pick: () => this.setState(Object.assign({ sort: x[0] }, reset)) }, pick(x[0] === sortK), radio(x[0] === sortK)));
    const kItems = KL.map((x) => { const n = base.filter((c) => c.kind === x[0] && okT(c) && okG(c, gender)).length, on = kinds.indexOf(x[0]) >= 0;
      return Object.assign({ label: x[1], n: grp(n), o: n === 0 && !on ? 0.45 : 1, pick: () => this.setState(Object.assign({ kinds: on ? kinds.filter((k) => k !== x[0]) : kinds.concat([x[0]]) }, reset)) }, pick(on)); });
    const gItems = GL.map((x) => { const n = base.filter((c) => okT(c) && okK(c) && okG(c, x[0])).length, on = gender === x[0];
      return Object.assign({ label: x[1], n: grp(n), o: n === 0 && !on ? 0.45 : 1, pick: () => this.setState(Object.assign({ gender: x[0] }, reset)) }, pick(on)); });
    const chips = [];
    kinds.forEach((k) => chips.push({ label: (KL.filter((x) => x[0] === k)[0] || [k, k])[1], clear: () => this.setState(Object.assign({ kinds: kinds.filter((x) => x !== k) }, reset)) }));
    if (gender !== 'ALL') chips.push({ label: (GL.filter((x) => x[0] === gender)[0] || [gender, gender])[1], clear: () => this.setState(Object.assign({ gender: 'ALL' }, reset)) });
    const nFs = kinds.length + (gender !== 'ALL' ? 1 : 0) + (sortK !== 'med' ? 1 : 0);
    const filtered = active || kinds.length > 0 || gender !== 'ALL';
    const swipe = { s: (e) => { this.y0 = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, e: (e) => { const t = e.changedTouches && e.changedTouches[0]; if (this.y0 != null && t && t.clientY - this.y0 > 60) this.setState({ fs: false }); this.y0 = null; } };
    const rowsAll = pool(src.rows).map((c, i) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c, { rank: String(i + 1).padStart(2, '0') }));
    const cardsAll = pool(src.cards).map((c) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c));
    const shownAll = b.rows ? rowsAll : cardsAll;
    const more = shownAll.length - lim;
    return { mkt: MK.map((m) => Object.assign({}, m, { flag: m.c, on: m.c === market ? 'true' : 'false', pick: () => this.setState({ market: m.c, lim: LIM }) })),
      rows: rowsAll.slice(0, lim), cards: cardsAll.slice(0, lim), live: pool(src.live).map((c) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c)), none, tip,
      hasMore: more > 0 || !!this._partial, moreLabel: 'Voir ' + Math.min(LIM, Math.max(more, (total || 0) - lim)) + ' comptes de plus', showMore: () => this.setState({ lim: lim + LIM }),
      activeOn: active ? 'true' : 'false', toggleActive: () => this.setState({ active: !active, lim: LIM }),
      fs: !!st.fs, fsOn: nFs > 0 ? 'true' : 'false', fsLabel: nFs > 0 ? 'Trier et filtrer · ' + nFs : 'Trier et filtrer', openFs: () => this.setState({ fs: true }), closeFs: () => this.setState({ fs: false }),
      fsKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ fs: false }); } }, setFsClose: (el) => { this.fsClose = el; }, tStart: swipe.s, tEnd: swipe.e,
      sItems, kItems, gItems, chips, seeLabel: 'Voir ' + comptes(shownAll.length) + (this._partial ? ' (chargement…)' : ''),
      clearAll: () => this.setState({ kinds: [], gender: 'ALL', sort: 'med', active: false, lim: LIM }),
      countLabel: filtered && total !== null && !none ? comptes(shownAll.length) + ' sur ' + grp(total) : total !== null ? (none ? 'Aucun compte suivi ' + (PH[market] || '') : total.toLocaleString('en-US').replace(/,/g, '\u202f') + ' comptes ' + (PH[market] || ''))
        : (market === 'FR' ? shownAll.length + ' comptes en France' : 'Aucun compte suivi ici') };
  }

  baseVals() {
    const mkt = [{"c": "FR", "l": "France", "on": "true"}, {"c": "US", "l": "États-Unis", "on": "false"}, {"c": "MX", "l": "Mexique", "on": "false"}, {"c": "BR", "l": "Brésil", "on": "false"}, {"c": "ES", "l": "Espagne", "on": "false"}, {"c": "ID", "l": "Indonésie", "on": "false"}];
    const live = (globalThis.__dcSample?.["MCreateursCartes"]?.["live"] ?? []);
    const cards = (globalThis.__dcSample?.["MCreateursCartes"]?.["cards"] ?? []);
    return { mkt, live, cards };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Créateurs"
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
        $h("div", { "style": "padding: 14px 20px 0; display: flex; align-items: center; justify-content: space-between; gap: 10px;" },
          $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
            $t($v.countLabel)
          ),
          $h("div", { "class": "m-tc is-scroll", "role": "tablist", "aria-label": "Affichage" },
            $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": "/app/createurs", "aria-label": "Vue liste", "style": "height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 6h16M4 12h16M4 18h16", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Liste"
            ),
            $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "href": "/app/createurs/cartes", "aria-label": "Vue cartes", "style": "height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Cartes"
            )
          )
        ),
        $h("section", { "aria-label": "Marché et filtres", "class": "m-fc" },
          $h("div", { "class": "m-fc-row" },
            ($l($v.mkt)).map((m) => [
              $h("button", { "class": "m-chip", "type": "button", "aria-pressed": m?.on, "onClick": m?.pick },
                $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" }),
                $t(m?.l)
              )
            ])
          ),
          $h("span", { "aria-hidden": "true", "class": "m-fc-line" }),
          $h("div", { "class": "m-fc-row" },
            $h("button", { "class": "m-chip", "type": "button", "aria-pressed": $v.fsOn, "aria-haspopup": "dialog", "onClick": $v.openFs },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M4 6h16M7 12h10M10 18h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.fsLabel)
            ),
            ($l($v.chips)).map((c) => [
              $h("button", { "class": "m-chip", "type": "button", "aria-pressed": "true", "onClick": c?.clear, "aria-label": `Retirer le filtre ${$t(c?.label)}` },
                $t(c?.label),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ]),
            $h("button", { "class": "m-chip", "type": "button", "aria-pressed": $v.activeOn, "onClick": $v.toggleActive },
              $h("span", { "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
              "Actifs cette semaine"
            )
          )
        ),
        $h("div", { "style": "margin-top: 14px; display: flex; flex-direction: column; gap: 10px;" },
          $h("span", { "class": "sw-live", "style": "padding: 0 20px;" },
            $h("span", { "aria-hidden": "true", "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
            "Les plus actifs"
          ),
          $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
            ($l($v.live)).map((c) => [
              $h("a", { "href": c?.href, "style": "flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 7px; border-radius: 999px; background: var(--track); border: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  (c?.av) ? [
                    $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (c?.noav) ? [
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "display: flex; flex-direction: column;" },
                  $h("span", { "style": "font-size: 12px; font-weight: 600;" },
                    $t(c?.h)
                  ),
                  $h("span", { "style": "font-size: 10px; color: var(--ink-faint);" },
                    $t(c?.last)
                  )
                )
              )
            ])
          )
        ),
        $h("div", { "style": "padding: 16px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("div", { "style": "grid-column: 1 / -1;" },
            ($v.none) ? [
              $h("p", { "style": "margin: 0; padding: 28px 16px; text-align: center; font-size: 15px; color: var(--ink-muted);" },
                "Aucun compte suivi pour ce marché pour l’instant."
              )
            ] : null
          ),
          ($l($v.cards)).map((c) => [
            $h("a", { "href": c?.href, "class": "sw-card", "style": "border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit;" },
              $h("span", { "class": "m-ph", "style": "position: relative; height: 150px; overflow: hidden; display: block; background: linear-gradient(150deg, #28405E, #0A0C12 58%, #28405E 130%);" },
                ($l(c?.cov1)).map((v) => [
                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "style": "position: absolute; right: 8px; bottom: 8px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                    $t(v?.v)
                  )
                ])
              ),
              $h("span", { "style": "padding: 0 12px 14px; display: flex; flex-direction: column; gap: 8px;" },
                $h("span", { "style": "margin-top: -22px;" },
                  $h("span", { "style": "width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); box-shadow: 0 0 0 3px var(--surface-raised); position: relative;" },
                    (c?.av) ? [
                      $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (c?.noav) ? [
                      $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                        $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                      )
                    ] : null
                  )
                ),
                $h("span", { "style": "font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t(c?.h)
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-faint);" },
                  $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 16px; height: 16px; border-radius: 5px;" },
                    (c?.app?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": c?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (c?.app?.nologo) ? [
                      $h("svg", { "width": "8", "height": "8", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $t(c?.appName)
                ),
                $h("span", { "style": "display: flex; align-items: baseline; gap: 6px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 19px; font-weight: 700;" },
                    $t(c?.med)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    "médiane"
                  )
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-soft);" },
                  $h("span", { "style": `width: 6px; height: 6px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                  $t(c?.rythme)
                )
              )
            )
          ])
        ),
        ($v.hasMore) ? [
          $h("div", { "style": "display: flex; justify-content: center; padding: 8px 20px 0;" },
            $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showMore, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit; font-size: 14px;" },
              $t($v.moreLabel),
              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
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
          $h("a", { "href": "/app/createurs", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        ($v.fs) ? [
          $h("button", { "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.closeFs, "style": "position: fixed; inset: 0; z-index: 40; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Trier et filtrer les créateurs", "onKeyDown": $v.fsKeys, "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px max(20px, env(safe-area-inset-bottom)); animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "ontouchstart": $v.tStart, "ontouchend": $v.tEnd, "style": "display: flex; justify-content: center; padding: 10px 0 6px; touch-action: none;" },
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; padding: 2px 0 10px;" },
              $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                "Trier et filtrer"
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 4px;" },
                $h("button", { "type": "button", "onClick": $v.clearAll, "style": "min-height: 44px; padding: 0 8px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Tout effacer"
                ),
                $h("button", { "ref": $v.setFsClose, "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.closeFs, "aria-label": "Fermer", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Classer par"
            ),
            $h("div", { "role": "radiogroup", "aria-label": "Classer par", "style": "display: flex; flex-direction: column; padding: 6px 0 14px;" },
              ($l($v.sItems)).map((it) => [
                $h("button", { "type": "button", "role": "radio", "aria-checked": it?.sel, "onClick": it?.pick, "style": `display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; border: 0; border-radius: 14px; background: ${$t(it?.bg)}; color: var(--ink); font-family: inherit; font-size: 16px; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent;` },
                  $h("span", { "aria-hidden": "true", "style": `width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                    $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": `flex: 1; font-weight: ${$t(it?.w)};` },
                    $t(it?.label)
                  )
                )
              ])
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Contenu, plusieurs possibles"
            ),
            $h("div", { "role": "group", "aria-label": "Contenu", "style": "display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 0 14px;" },
              ($l($v.kItems)).map((it) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": it?.sel, "onClick": it?.pick, "style": `height: 44px; opacity: ${$t(it?.o)};` },
                  $t(it?.label),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(it?.n)
                  )
                )
              ])
            ),
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Genre"
            ),
            $h("div", { "role": "group", "aria-label": "Genre", "style": "display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 0 14px;" },
              ($l($v.gItems)).map((it) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": it?.sel, "onClick": it?.pick, "style": `height: 44px; opacity: ${$t(it?.o)};` },
                  $t(it?.label),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(it?.n)
                  )
                )
              ])
            ),
            $h("p", { "class": "sw-calc", "style": "margin: 0 0 4px;" },
              "Contenu et genre lus sur ses vidéos ; le carrousel vient de TikTok. « Sans visage » : personne ne se filme. Les nombres tiennent compte des autres filtres."
            ),
            $h("div", { "style": "display: flex; justify-content: center; padding-top: 14px;" },
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.closeFs },
                $t($v.seeLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        ] : null
      )
    ];
  }
}
